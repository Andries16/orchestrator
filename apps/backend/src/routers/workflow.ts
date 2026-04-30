import { z } from "zod";
import { router, publicProcedure } from "../trpc.js";
import { WorkflowModel } from "../models/Workflow.js";
import { WorkflowSchema } from "@cross_brand/shared";
import { orchestratorService } from "../services/OrchestratorService.js";
import { WorkflowRunModel } from "../models/WorkflowRun.js";
import { ExecutionLogModel } from "../models/ExecutionLog.js";
export const workflowRouter = router({
  getAll: publicProcedure.query(async () => {
    return await WorkflowModel.find()
      .populate("steps.agentId")
      .sort({ createdAt: -1 });
  }),
  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const workflow =
      await WorkflowModel.findById(input).populate("steps.agentId");
    if (!workflow) throw new Error("Workflow negăsit");
    return workflow;
  }),
  create: publicProcedure.input(WorkflowSchema).mutation(async ({ input }) => {
    const newWorkflow = new WorkflowModel(input);
    return await newWorkflow.save();
  }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: WorkflowSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const updated = await WorkflowModel.findByIdAndUpdate(
        input.id,
        { $set: input.data },
        { new: true },
      );
      if (!updated) throw new Error("Workflow negăsit pentru actualizare");
      return updated;
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    await WorkflowModel.findByIdAndDelete(input);
    return { success: true };
  }),
  execute: publicProcedure
    .input(
      z.object({
        workflowId: z.string(),
        initialInput: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log(
        `[tRPC] Declanșare execuție pentru workflow ${input.workflowId}`,
      );
      return await orchestratorService.runWorkflow(
        input.workflowId,
        input.initialInput,
      );
    }),
  getRuns: publicProcedure
    .input(
      z
        .object({
          workflowId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const query = input?.workflowId ? { workflowId: input.workflowId } : {};
      return await WorkflowRunModel.find(query)
        .populate("workflowId", "name")
        .sort({ startTime: -1 })
        .limit(50);
    }),
  getRunDetails: publicProcedure.input(z.string()).query(async ({ input }) => {
    const run = await WorkflowRunModel.findById(input).populate(
      "workflowId",
      "name",
    );
    if (!run) throw new Error("Workflow Run negăsit");
    const logs = await ExecutionLogModel.find({ workflowRunId: input })
      .sort({ timestamp: 1 })
      .populate("agentId", "name role");
    return {
      run,
      logs,
    };
  }),
  clone: publicProcedure
    .input(z.object({ workflowId: z.string(), newName: z.string().optional() }))
    .mutation(async ({ input }) => {
      const original = await WorkflowModel.findById(input.workflowId);
      if (!original) throw new Error("Workflow not found");
      const cloneData = original.toObject();
      delete cloneData._id;
      delete (cloneData as any).__v;
      delete (cloneData as any).createdAt;
      delete (cloneData as any).updatedAt;
      cloneData.name = input.newName || `${original.name} (Copy)`;
      const cloned = new WorkflowModel(cloneData);
      return await cloned.save();
    }),
  exportJson: publicProcedure.input(z.string()).query(async ({ input }) => {
    const workflow = await WorkflowModel.findById(input);
    if (!workflow) throw new Error("Workflow not found");
    const obj = workflow.toObject();
    delete obj._id;
    delete (obj as any).__v;
    delete (obj as any).createdAt;
    delete (obj as any).updatedAt;
    return obj;
  }),
  importJson: publicProcedure
    .input(
      z.object({
        name: z.string(),
        nodes: z.array(z.any()).optional(),
        edges: z.array(z.any()).optional(),
        steps: z.array(z.any()).optional(),
        maxIterations: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const newWorkflow = new WorkflowModel(input);
      return await newWorkflow.save();
    }),
});
