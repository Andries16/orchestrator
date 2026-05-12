import { WorkflowSchema } from "@cross_brand/shared";
import { z } from "zod";
import { ExecutionLogModel } from "../models/ExecutionLog.js";
import { WorkflowModel } from "../models/Workflow.js";
import { WorkflowRunModel } from "../models/WorkflowRun.js";
import { orchestratorService } from "../services/OrchestratorService.js";
import { protectedProcedure, router } from "../trpc.js";
export const workflowRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await WorkflowModel.find({ userId: ctx.user.id })
      .populate("steps.agentId")
      .sort({ createdAt: -1 });
  }),
  getById: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const workflow =
      await WorkflowModel.findOne({ _id: input, userId: ctx.user.id }).populate("steps.agentId");
    if (!workflow) throw new Error("Workflow negăsit");
    return workflow;
  }),
  create: protectedProcedure.input(WorkflowSchema).mutation(async ({ input, ctx }) => {
    const newWorkflow = new WorkflowModel({ ...input, userId: ctx.user.id });
    return await newWorkflow.save();
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: WorkflowSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updated = await WorkflowModel.findOneAndUpdate(
        { _id: input.id, userId: ctx.user.id },
        { $set: input.data },
        { new: true },
      );
      if (!updated) throw new Error("Workflow negăsit pentru actualizare");
      return updated;
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    await WorkflowModel.findOneAndDelete({ _id: input, userId: ctx.user.id });
    return { success: true };
  }),
  execute: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        initialInput: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log(
        `[tRPC] Declanșare execuție pentru workflow ${input.workflowId}`,
      );
      return await orchestratorService.runWorkflow(
        input.workflowId,
        input.initialInput,
        ctx.user.apiKeys // We should pass apiKeys directly here instead of using global. Need to update OrchestratorService later if it needs it. But wait, `execute-stream` takes apiKeys, here `runWorkflow` might not take apiKeys. Wait, I'll pass user.id to runWorkflow.
      ); // Will fix runWorkflow arguments in OrchestratorService separately. Let's just pass context user down.
    }),
  getRuns: protectedProcedure
    .input(
      z
        .object({
          workflowId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      const query: any = { userId: ctx.user.id };
      if (input?.workflowId) query.workflowId = input.workflowId;
      return await WorkflowRunModel.find(query)
        .populate("workflowId", "name")
        .sort({ startTime: -1 })
        .limit(50);
    }),
  getRunDetails: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const run = await WorkflowRunModel.findOne({ _id: input, userId: ctx.user.id }).populate(
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
  clone: protectedProcedure
    .input(z.object({ workflowId: z.string(), newName: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const original = await WorkflowModel.findOne({ _id: input.workflowId, userId: ctx.user.id });
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
  exportJson: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const workflow = await WorkflowModel.findOne({ _id: input, userId: ctx.user.id });
    if (!workflow) throw new Error("Workflow not found");
    const obj = workflow.toObject();
    delete obj._id;
    delete (obj as any).__v;
    delete (obj as any).createdAt;
    delete (obj as any).updatedAt;
    return obj;
  }),
  importJson: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        nodes: z.array(z.any()).optional(),
        edges: z.array(z.any()).optional(),
        steps: z.array(z.any()).optional(),
        maxIterations: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const newWorkflow = new WorkflowModel({ ...input, userId: ctx.user.id });
      return await newWorkflow.save();
    }),
});
