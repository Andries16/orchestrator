import { describe, it, expect, vi, beforeEach } from "vitest";
import { topologicalSort, OrchestratorService } from "./OrchestratorService.js";
import { WorkflowModel } from "../models/Workflow.js";
import { WorkflowRunModel } from "../models/WorkflowRun.js";
import { AgentModel } from "../models/Agent.js";
import { llmService } from "./LLMService.js";

// Mocking models
vi.mock("../models/Workflow.js", () => ({
  WorkflowModel: {
    findById: vi.fn(),
  },
}));

vi.mock("../models/WorkflowRun.js", () => ({
  WorkflowRunModel: {
    create: vi.fn().mockResolvedValue({
      _id: "run-123",
      save: vi.fn().mockResolvedValue({}),
    }),
    findById: vi.fn(),
  },
}));

vi.mock("../models/Agent.js", () => ({
  AgentModel: {
    findById: vi.fn(),
  },
}));

vi.mock("../models/ExecutionLog.js", () => {
  const ExecutionLogMock = vi.fn();
  ExecutionLogMock.prototype.save = vi.fn().mockResolvedValue({});
  return {
    ExecutionLogModel: ExecutionLogMock,
  };
});

vi.mock("./LLMService.js", () => ({
  llmService: {
    generateContent: vi.fn().mockResolvedValue({ text: "Agent output", toolsUsed: [] }),
    generateContentStream: vi.fn(),
  },
}));

describe("OrchestratorService", () => {
  describe("topologicalSort", () => {
    it("should sort a simple linear graph", () => {
      const nodeIds = ["A", "B", "C"];
      const edges = [
        { source: "A", target: "B" },
        { source: "B", target: "C" },
      ];
      const result = topologicalSort(nodeIds, edges);
      expect(result).toEqual(["A", "B", "C"]);
    });

    it("should sort a branching graph", () => {
      const nodeIds = ["A", "B", "C", "D"];
      const edges = [
        { source: "A", target: "B" },
        { source: "A", target: "C" },
        { source: "B", target: "D" },
        { source: "C", target: "D" },
      ];
      const result = topologicalSort(nodeIds, edges);
      expect(result[0]).toBe("A");
      expect(result[result.length - 1]).toBe("D");
      expect(new Set(result.slice(1, 3))).toEqual(new Set(["B", "C"]));
    });

    it("should throw error if cycle detected", () => {
      const nodeIds = ["A", "B"];
      const edges = [
        { source: "A", target: "B" },
        { source: "B", target: "A" },
      ];
      expect(() => topologicalSort(nodeIds, edges)).toThrow("Cycle detected");
    });
  });

  describe("runWorkflowDAGStream", () => {
    let orchestrator: OrchestratorService;

    beforeEach(() => {
      orchestrator = new OrchestratorService();
      vi.clearAllMocks();
    });

    it("should yield error if workflow not found", async () => {
      (WorkflowModel.findById as any).mockResolvedValue(null);
      const generator = orchestrator.runWorkflowDAGStream("non-existent", "input");
      const result = await generator.next();
      expect(result.value).toEqual({ type: "error", message: "Workflow non-existent not found." });
    });

    it("should execute a simple 1-agent DAG workflow", async () => {
      const workflow = {
        _id: "wf-123",
        nodes: [
          { id: "node-in", type: "input" },
          { id: "node-ag", type: "agent", agentId: "agent-123" },
        ],
        edges: [
          { source: "node-in", target: "node-ag" },
        ],
      };
      const agent = {
        _id: "agent-123",
        name: "Test Agent",
        model: "gpt-4",
        systemPrompt: "Be helpful",
        temperature: 0.7,
      };

      (WorkflowModel.findById as any).mockResolvedValue(workflow);
      (AgentModel.findById as any).mockResolvedValue(agent);

      const generator = orchestrator.runWorkflowDAGStream("wf-123", "Hello");
      const events = [];
      for await (const event of generator) {
        events.push(event);
      }

      expect(events).toContainEqual(expect.objectContaining({ type: "run_started" }));
      expect(events).toContainEqual(expect.objectContaining({ type: "step_start", agentName: "Test Agent" }));
      expect(events).toContainEqual(expect.objectContaining({ type: "step_complete", output: "Agent output" }));
      expect(events).toContainEqual(expect.objectContaining({ type: "workflow_complete", output: "Agent output" }));
    });
  });
});
