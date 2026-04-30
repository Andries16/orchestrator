import { AgentModel } from "../models/Agent.js";
import { ExecutionLogModel } from "../models/ExecutionLog.js";
import { WorkflowModel } from "../models/Workflow.js";
import { WorkflowRunModel } from "../models/WorkflowRun.js";
import { llmService } from "./LLMService.js";
export function topologicalSort(
  nodeIds: string[],
  edges: { source: string; target: string }[],
): string[] {
  const inDegree = new Map<string, number>(nodeIds.map((id) => [id, 0]));
  const adjList = new Map<string, string[]>(nodeIds.map((id) => [id, []]));
  for (const edge of edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    adjList.get(edge.source)?.push(edge.target);
  }
  const queue: string[] = [...inDegree.entries()]
    .filter(([, deg]) => deg === 0)
    .map(([id]) => id);
  const result: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);
    for (const neighbor of adjList.get(nodeId) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }
  if (result.length !== nodeIds.length) {
    throw new Error("Cycle detected in workflow DAG — cannot execute.");
  }
  return result;
}
export class OrchestratorService {
  constructor() {}
  async runWorkflow(workflowId: string, initialInput: string) {
    console.log(`[ORCHESTRATOR] Pornire workflow: ${workflowId}`);
    const workflow =
      await WorkflowModel.findById(workflowId).populate("steps.agentId");
    if (!workflow) {
      throw new Error(`Workflow-ul cu ID ${workflowId} nu a fost găsit.`);
    }
    const workflowRun = await WorkflowRunModel.create({
      workflowId: workflow._id,
      status: "running",
      initialInput: initialInput,
    });
    let currentInput = initialInput;
    const executionResults = [];
    let hasError = false;
    let finalErrorMsg = "";
    const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order);
    for (const step of sortedSteps) {
      const agent = await AgentModel.findById(step.agentId);
      if (!agent) {
        console.error(
          `[ORCHESTRATOR] Agent negăsit pentru pasul cu ordinea ${step.order}`,
        );
        continue;
      }
      console.log(
        `[ORCHESTRATOR] Execuție Pas ${step.order}: Agent ${agent.name}`,
      );
      try {
        const prompt = `System Instructions: ${agent.systemPrompt}\n\nUser Input: ${currentInput}`;
        const llmResult = await llmService.generateContent({
          model: agent.model,
          prompt: prompt,
          temperature: agent.temperature,
        });
        const output = llmResult.text;
        const log = new ExecutionLogModel({
          workflowId: workflow._id,
          workflowRunId: workflowRun._id,
          agentId: agent._id,
          input: currentInput,
          output: output,
          status: "success",
        });
        await log.save();
        console.log(`[ORCHESTRATOR] Succes Pas ${step.order}`);
        currentInput = output;
        executionResults.push(log);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Eroare necunoscută la execuție";
        const log = new ExecutionLogModel({
          workflowId: workflow._id,
          workflowRunId: workflowRun._id,
          agentId: agent._id,
          input: currentInput,
          output: errorMessage,
          status: "error",
        });
        await log.save();
        console.error(
          `[ORCHESTRATOR] Eroare la pasul ${step.order}: ${errorMessage}`,
        );
        executionResults.push(log);
        hasError = true;
        finalErrorMsg = errorMessage;
        break;
      }
    }
    workflowRun.status = hasError ? "failed" : "completed";
    workflowRun.endTime = new Date();
    workflowRun.finalOutput = currentInput;
    if (hasError) workflowRun.error = finalErrorMsg;
    await workflowRun.save();
    return {
      workflowId,
      workflowRunId: workflowRun._id,
      finalOutput: currentInput,
      stepsSummary: executionResults,
    };
  }
  async *runWorkflowStream(
    workflowId: string,
    initialInput: string,
    apiKeys?: any,
  ): AsyncGenerator<any, void, unknown> {
    console.log(`[ORCHESTRATOR STREAM] Pornire workflow: ${workflowId}`);
    const workflow =
      await WorkflowModel.findById(workflowId).populate("steps.agentId");
    if (!workflow) {
      yield {
        type: "error",
        message: `Workflow-ul cu ID ${workflowId} nu a fost găsit.`,
      };
      return;
    }
    const workflowRun = await WorkflowRunModel.create({
      workflowId: workflow._id,
      status: "running",
      initialInput: initialInput,
    });
    yield { type: "run_started", runId: workflowRun._id };
    let currentInput = initialInput;
    const executionResults = [];
    let hasError = false;
    let finalErrorMsg = "";
    const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order);
    for (const step of sortedSteps) {
      const agent = await AgentModel.findById(step.agentId);
      if (!agent) continue;
      yield {
        type: "step_start",
        step: step.order,
        agentName: agent.name,
        agentId: agent._id,
      };
      try {
        const prompt = `System Instructions: ${agent.systemPrompt}\n\nUser Input: ${currentInput}`;
        const stream = llmService.generateContentStream({
          model: agent.model,
          prompt: prompt,
          temperature: agent.temperature,
          tools: agent.tools,
          apiKeys,
        });
        let fullOutput = "";
        for await (const chunk of stream) {
          fullOutput += chunk;
          yield { type: "chunk", text: chunk };
        }
        const log = new ExecutionLogModel({
          workflowId: workflow._id,
          workflowRunId: workflowRun._id,
          agentId: agent._id,
          input: currentInput,
          output: fullOutput,
          status: "success",
        });
        await log.save();
        currentInput = fullOutput;
        executionResults.push(log);
        yield { type: "step_complete", step: step.order, output: fullOutput };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Eroare necunoscută la execuție";
        const log = new ExecutionLogModel({
          workflowId: workflow._id,
          workflowRunId: workflowRun._id,
          agentId: agent._id,
          input: currentInput,
          output: errorMessage,
          status: "error",
        });
        await log.save();
        executionResults.push(log);
        hasError = true;
        finalErrorMsg = errorMessage;
        yield { type: "error", message: errorMessage };
        break;
      }
    }
    workflowRun.status = hasError ? "failed" : "completed";
    workflowRun.endTime = new Date();
    workflowRun.finalOutput = currentInput;
    if (hasError) workflowRun.error = finalErrorMsg;
    await workflowRun.save();
    if (!hasError) {
      yield {
        type: "workflow_complete",
        output: currentInput,
        runId: workflowRun._id,
      };
    }
  }
  async *runWorkflowDAGStream(
    workflowId: string,
    initialInput: string,
    apiKeys?: any,
  ): AsyncGenerator<any, void, unknown> {
    console.log(`[ORCHESTRATOR DAG] Starting workflow: ${workflowId}`);
    const workflow = await WorkflowModel.findById(workflowId);
    if (!workflow) {
      yield { type: "error", message: `Workflow ${workflowId} not found.` };
      return;
    }
    const workflowRun = await WorkflowRunModel.create({
      workflowId: workflow._id,
      status: "running",
      initialInput,
    });
    yield { type: "run_started", runId: workflowRun._id };
    const rawNodes = (workflow.nodes as any[]) ?? [];
    const rawEdges = (workflow.edges as any[]) ?? [];
    const agentNodes = rawNodes.filter(
      (n: any) => n.type === "agent" && n.agentId,
    );
    if (agentNodes.length === 0) {
      yield { type: "error", message: "No agent nodes found in workflow DAG." };
      workflowRun.status = "failed";
      workflowRun.error = "No agent nodes";
      await workflowRun.save();
      return;
    }
    const nodeMap = new Map(rawNodes.map((n: any) => [n.id as string, n]));
    const nodeOutputs = new Map<string, string>();
    const nodeIterations = new Map<string, number>();
    const targetToEdges = new Map<string, any[]>();
    for (const e of rawEdges) {
      if (!targetToEdges.has(e.target)) targetToEdges.set(e.target, []);
      targetToEdges.get(e.target)!.push(e);
    }
    const sourceToEdges = new Map<string, any[]>();
    for (const e of rawEdges) {
      if (!sourceToEdges.has(e.source)) sourceToEdges.set(e.source, []);
      sourceToEdges.get(e.source)!.push(e);
    }
    const inputNode = rawNodes.find((n: any) => n.type === "input");
    const queue: string[] = inputNode
      ? [inputNode.id]
      : rawNodes
          .filter((n: any) => (targetToEdges.get(n.id)?.length ?? 0) === 0)
          .map((n: any) => n.id);
    let hasError = false;
    let finalOutput = initialInput;
    let finalErrorMsg = "";
    let stepIndex = 0;
    const maxIterations = workflow.maxIterations || 10;
    let currentNodes = inputNode
      ? [inputNode.id]
      : rawNodes
          .filter((n: any) => (targetToEdges.get(n.id)?.length ?? 0) === 0)
          .map((n: any) => n.id);
    while (currentNodes.length > 0 && !hasError) {
      const nextLevelSet = new Set<string>();
      const results = await Promise.all(
        currentNodes.map(async (nodeId) => {
          const node = nodeMap.get(nodeId) as any;
          if (!node) return { status: "skip" };
          const currentIter = (nodeIterations.get(nodeId) ?? 0) + 1;
          nodeIterations.set(nodeId, currentIter);
          if (!workflowRun.nodeIterations)
            workflowRun.nodeIterations = {} as any;
          (workflowRun.nodeIterations as any)[nodeId] = currentIter;
          await workflowRun.save();
          if (currentIter > maxIterations) {
            return {
              status: "error",
              error: `Node ${nodeId} exceeded max iterations (${maxIterations})`,
            };
          }
          if (node.type === "input") {
            nodeOutputs.set(nodeId, initialInput);
            const outEdges = sourceToEdges.get(nodeId) ?? [];
            for (const edge of outEdges) nextLevelSet.add(edge.target);
            return { status: "success" };
          }
          if (node.type === "wait") {
            return { status: "wait", nodeId };
          }
          if (node.type !== "agent" || !node.agentId) return { status: "skip" };
          const agent = await AgentModel.findById(node.agentId);
          if (!agent) return { status: "skip" };
          const incomingEdges = targetToEdges.get(nodeId) ?? [];
          let combinedInput = "";
          let isNodeActive = false;
          const predOutputs: string[] = [];
          const satisfiedPreds = new Set<string>();
          if (incomingEdges.length === 0) {
            combinedInput = initialInput;
            isNodeActive = true;
          } else {
            for (const edge of incomingEdges) {
              const predOutput = nodeOutputs.get(edge.source);
              if (predOutput === undefined) continue;
              if (edge.label) {
                if (
                  predOutput.toLowerCase().includes(edge.label.toLowerCase())
                ) {
                  predOutputs.push(`From [${edge.source}]: ${predOutput}`);
                  satisfiedPreds.add(edge.source);
                }
              } else {
                predOutputs.push(`From [${edge.source}]: ${predOutput}`);
                satisfiedPreds.add(edge.source);
              }
            }
            if (node.waitForAll) {
              const allPredsReady = incomingEdges.every((e) =>
                nodeOutputs.has(e.source),
              );
              if (allPredsReady) {
                isNodeActive = true;
              }
            } else {
              if (satisfiedPreds.size > 0) {
                isNodeActive = true;
              }
            }
            if (node.mergeContext && predOutputs.length > 1) {
              combinedInput = predOutputs.join("\n\n---\n\n");
            } else if (predOutputs.length > 0) {
              combinedInput = predOutputs[0].replace(/^From \[.*\]: /, "");
            }
          }
          if (!isNodeActive) return { status: "skip" };
          return {
            status: "execute",
            nodeId,
            agent,
            currentInput: combinedInput,
            currentIter,
          };
        }),
      );
      const executeTasks = [];
      for (const res of results) {
        if (res.status === "error") {
          hasError = true;
          finalErrorMsg = res.error!;
          yield { type: "error", message: finalErrorMsg };
          break;
        }
        if (res.status === "wait") {
          workflowRun.status = "waiting";
          workflowRun.pendingNodeId = res.nodeId;
          await workflowRun.save();
          yield {
            type: "waiting_for_input",
            nodeId: res.nodeId,
            runId: workflowRun._id,
          };
          return;
        }
        if (res.status === "execute") {
          executeTasks.push(res);
        }
      }
      if (hasError) break;
      const taskPromises = executeTasks.map(async (task) => {
        const { nodeId, agent, currentInput, currentIter } = task;
        const events: any[] = [];
        events.push({
          type: "step_start",
          step: stepIndex,
          nodeId,
          agentName: agent.name,
          agentId: String(agent._id),
          iteration: currentIter,
        });
        try {
          let memoryContext = "";
          if (workflowRun.state && Object.keys(workflowRun.state).length > 0) {
            memoryContext = `Current Workflow Memory:\n${JSON.stringify(workflowRun.state, null, 2)}\n\n`;
          }
          const prompt = `${memoryContext}System Instructions: ${agent.systemPrompt}\n\nUser Input: ${currentInput}`;
          const maxRetries = agent.maxRetries ?? 2;
          let llmResult: { text: string; toolsUsed: string[] } | null = null;
          let lastError: any = null;
          for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
              const startTime = Date.now();
              llmResult = await llmService.generateContent({
                model: agent.model,
                prompt,
                temperature: agent.temperature,
                tools: agent.tools,
                state: workflowRun.state,
                apiKeys,
              });
              break;
            } catch (err: any) {
              lastError = err;
              if (attempt <= maxRetries) {
                const delayMs = Math.pow(2, attempt) * 500;
                events.push({
                  type: "retry",
                  nodeId,
                  agentName: agent.name,
                  attempt,
                  maxRetries,
                  delayMs,
                });
                await new Promise((resolve) => setTimeout(resolve, delayMs));
              }
            }
          }
          if (!llmResult && agent.fallbackModel) {
            events.push({
              type: "fallback",
              nodeId,
              agentName: agent.name,
              fallbackModel: agent.fallbackModel,
            });
            try {
              llmResult = await llmService.generateContent({
                model: agent.fallbackModel,
                prompt,
                temperature: agent.temperature,
                tools: agent.tools,
                state: workflowRun.state,
                apiKeys,
              });
            } catch (fallbackErr: any) {
              lastError = fallbackErr;
            }
          }
          if (!llmResult) {
            throw (
              lastError ||
              new Error(
                `Agent ${agent.name} failed after ${maxRetries} retries`,
              )
            );
          }
          const output = llmResult.text;
          if (agent.tools && agent.tools.length > 0) {
            workflowRun.markModified("state");
            await workflowRun.save();
            events.push({ type: "state_updated", state: workflowRun.state });
          }
          const log = new ExecutionLogModel({
            workflowId: workflow._id,
            workflowRunId: workflowRun._id,
            agentId: agent._id,
            nodeId: nodeId,
            iteration: currentIter,
            input: currentInput,
            output: output,
            status: "success",
            toolsUsed: llmResult.toolsUsed,
          });
          await log.save();
          nodeOutputs.set(nodeId, output);
          const outEdges = sourceToEdges.get(nodeId) ?? [];
          for (const edge of outEdges) {
            if (edge.label) {
              if (output.toLowerCase().includes(edge.label.toLowerCase())) {
                nextLevelSet.add(edge.target);
              }
            } else {
              nextLevelSet.add(edge.target);
            }
          }
          events.push({
            type: "step_complete",
            nodeId,
            agentName: agent.name,
            output,
          });
          return { type: "success", events, output };
        } catch (err: any) {
          return { type: "error", nodeId, message: err.message, events };
        }
      });
      const finishedTasks = await Promise.all(taskPromises);
      for (const ft of finishedTasks) {
        if (ft.type === "error") {
          hasError = true;
          finalErrorMsg = ft.message;
          if (ft.events) {
            for (const event of ft.events) {
              yield event;
            }
          }
          yield { type: "error", message: ft.message };
        } else {
          for (const event of ft.events) {
            yield event;
          }
          finalOutput = ft.output;
        }
      }
      currentNodes = Array.from(nextLevelSet);
    }
    workflowRun.status = hasError ? "failed" : "completed";
    workflowRun.endTime = new Date();
    workflowRun.finalOutput = finalOutput;
    if (hasError) workflowRun.error = finalErrorMsg;
    await workflowRun.save();
    if (!hasError) {
      yield {
        type: "workflow_complete",
        output: finalOutput,
        runId: workflowRun._id,
      };
    }
  }
  async *resumeWorkflowDAGStream(
    runId: string,
    userInput: string,
    apiKeys?: any,
  ): AsyncGenerator<any, void, unknown> {
    const workflowRun = await WorkflowRunModel.findById(runId);
    if (!workflowRun || workflowRun.status !== "waiting") {
      yield {
        type: "error",
        message: "Workflow run not found or not in waiting state.",
      };
      return;
    }
    const workflow = await WorkflowModel.findById(workflowRun.workflowId);
    if (!workflow) {
      yield { type: "error", message: "Workflow not found." };
      return;
    }
    console.log(
      `[ORCHESTRATOR DAG] Resuming workflow: ${workflow._id} from node ${workflowRun.pendingNodeId}`,
    );
    workflowRun.status = "running";
    const pausedNodeId = workflowRun.pendingNodeId;
    workflowRun.pendingNodeId = undefined;
    await workflowRun.save();
    yield { type: "run_resumed", runId: workflowRun._id };
    const rawNodes = (workflow.nodes as any[]) ?? [];
    const rawEdges = (workflow.edges as any[]) ?? [];
    const nodeMap = new Map(rawNodes.map((n: any) => [n.id as string, n]));
    const nodeOutputs = new Map<string, string>();
    const nodeIterations = new Map<string, number>();
    const targetToEdges = new Map<string, any[]>();
    for (const e of rawEdges) {
      if (!targetToEdges.has(e.target)) targetToEdges.set(e.target, []);
      targetToEdges.get(e.target)!.push(e);
    }
    const sourceToEdges = new Map<string, any[]>();
    for (const e of rawEdges) {
      if (!sourceToEdges.has(e.source)) sourceToEdges.set(e.source, []);
      sourceToEdges.get(e.source)!.push(e);
    }
    const logs = await ExecutionLogModel.find({ workflowRunId: runId }).sort({
      timestamp: 1,
    });
    for (const log of logs) {
      if (log.nodeId) {
        nodeOutputs.set(log.nodeId, log.output);
        const currentCount = nodeIterations.get(log.nodeId) ?? 0;
        nodeIterations.set(log.nodeId, currentCount + 1);
      }
    }
    if (pausedNodeId) {
      let finalWaitOutput = userInput;
      if (!finalWaitOutput) {
        const incomingEdges = targetToEdges.get(pausedNodeId) ?? [];
        for (const edge of incomingEdges) {
          const predOutput = nodeOutputs.get(edge.source);
          if (predOutput) {
            finalWaitOutput = predOutput;
            break;
          }
        }
      }
      nodeOutputs.set(pausedNodeId, finalWaitOutput);
      const currentCount = nodeIterations.get(pausedNodeId) ?? 0;
      nodeIterations.set(pausedNodeId, currentCount + 1);
    }
    const queue: string[] = [];
    if (pausedNodeId) {
      const outEdges = sourceToEdges.get(pausedNodeId) ?? [];
      for (const e of outEdges) {
        if (e.label) {
          const normalizedOutput = userInput.toLowerCase();
          const normalizedLabel = e.label.toLowerCase();
          if (normalizedOutput.includes(normalizedLabel)) {
            queue.push(e.target);
          }
        } else {
          queue.push(e.target);
        }
      }
    }
    let hasError = false;
    let finalOutput = userInput;
    let finalErrorMsg = "";
    let stepIndex = logs.length;
    const maxIterations = workflow.maxIterations || 10;
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodeMap.get(nodeId) as any;
      if (!node) continue;
      const currentIter = (nodeIterations.get(nodeId) ?? 0) + 1;
      nodeIterations.set(nodeId, currentIter);
      if (!workflowRun.nodeIterations) workflowRun.nodeIterations = {} as any;
      (workflowRun.nodeIterations as any)[nodeId] = currentIter;
      await workflowRun.save();
      if (currentIter > maxIterations) {
        const error = `Node ${nodeId} exceeded max iterations (${maxIterations}). Loop detected?`;
        yield { type: "error", message: error };
        hasError = true;
        finalErrorMsg = error;
        break;
      }
      if (node.type === "wait") {
        workflowRun.status = "waiting";
        workflowRun.pendingNodeId = nodeId;
        await workflowRun.save();
        yield { type: "waiting_for_input", nodeId, runId: workflowRun._id };
        return;
      }
      if (node.type !== "agent" || !node.agentId) continue;
      const agent = await AgentModel.findById(node.agentId);
      if (!agent) continue;
      const incomingEdges = targetToEdges.get(nodeId) ?? [];
      let currentInput = "";
      let isNodeActive = false;
      for (const edge of incomingEdges) {
        const predOutput = nodeOutputs.get(edge.source);
        if (predOutput === undefined) continue;
        if (edge.label) {
          const normalizedOutput = predOutput.toLowerCase();
          const normalizedLabel = edge.label.toLowerCase();
          if (normalizedOutput.includes(normalizedLabel)) {
            currentInput = predOutput;
            isNodeActive = true;
            break;
          }
        } else {
          currentInput = predOutput;
          isNodeActive = true;
          break;
        }
      }
      if (!isNodeActive) {
        console.log(
          `[ORCHESTRATOR DAG] Skipping node ${nodeId} during resume (no active predecessor)`,
        );
        continue;
      }
      stepIndex++;
      yield {
        type: "step_start",
        step: stepIndex,
        nodeId,
        agentName: agent.name,
        agentId: String(agent._id),
        iteration: currentIter,
      };
      try {
        const prompt = `System Instructions: ${agent.systemPrompt}\n\nUser Input: ${currentInput}`;
        const stream = llmService.generateContentStream({
          model: agent.model,
          prompt,
          temperature: agent.temperature,
          tools: agent.tools,
          apiKeys,
        });
        let fullOutput = "";
        for await (const chunk of stream) {
          fullOutput += chunk;
          yield { type: "chunk", text: chunk };
        }
        const log = new ExecutionLogModel({
          workflowId: workflow._id,
          workflowRunId: workflowRun._id,
          agentId: agent._id,
          nodeId: nodeId,
          iteration: currentIter,
          input: currentInput,
          output: fullOutput,
          status: "success",
        });
        await log.save();
        nodeOutputs.set(nodeId, fullOutput);
        finalOutput = fullOutput;
        yield {
          type: "step_complete",
          step: stepIndex,
          nodeId,
          output: fullOutput,
        };
        const outEdges = sourceToEdges.get(nodeId) ?? [];
        for (const edge of outEdges) {
          if (edge.label) {
            const normalizedOutput = fullOutput.toLowerCase();
            const normalizedLabel = edge.label.toLowerCase();
            if (normalizedOutput.includes(normalizedLabel)) {
              if (!queue.includes(edge.target)) queue.push(edge.target);
            }
          } else {
            if (!queue.includes(edge.target)) queue.push(edge.target);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const log = new ExecutionLogModel({
          workflowId: workflow._id,
          workflowRunId: workflowRun._id,
          agentId: agent._id,
          nodeId: nodeId,
          iteration: currentIter,
          input: currentInput,
          output: errorMessage,
          status: "error",
        });
        await log.save();
        hasError = true;
        finalErrorMsg = errorMessage;
        yield { type: "error", message: errorMessage };
        break;
      }
    }
    workflowRun.status = hasError ? "failed" : "completed";
    workflowRun.endTime = new Date();
    workflowRun.finalOutput = finalOutput;
    if (hasError) workflowRun.error = finalErrorMsg;
    await workflowRun.save();
    if (!hasError) {
      yield {
        type: "workflow_complete",
        output: finalOutput,
        runId: workflowRun._id,
      };
    }
  }
}
export const orchestratorService = new OrchestratorService();
