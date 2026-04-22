import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { WorkflowModel } from '../models/Workflow.js';
import { WorkflowSchema } from '@cross_brand/shared';
import { orchestratorService } from '../services/OrchestratorService.js';

/**
 * Workflow Router - Gestionează ciclul de viață al workflow-urilor și execuția acestora.
 */
export const workflowRouter = router({
  // Listează toate workflow-urile
  getAll: publicProcedure.query(async () => {
    return await WorkflowModel.find().populate('steps.agentId').sort({ createdAt: -1 });
  }),

  // Obține un workflow detaliat
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const workflow = await WorkflowModel.findById(input).populate('steps.agentId');
      if (!workflow) throw new Error('Workflow negăsit');
      return workflow;
    }),

  // Creează un workflow nou
  create: publicProcedure
    .input(WorkflowSchema)
    .mutation(async ({ input }) => {
      const newWorkflow = new WorkflowModel(input);
      return await newWorkflow.save();
    }),

  // Actualizează un workflow
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      data: WorkflowSchema.partial()
    }))
    .mutation(async ({ input }) => {
      const updated = await WorkflowModel.findByIdAndUpdate(
        input.id,
        { $set: input.data },
        { new: true }
      );
      if (!updated) throw new Error('Workflow negăsit pentru actualizare');
      return updated;
    }),

  // Șterge un workflow
  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await WorkflowModel.findByIdAndDelete(input);
      return { success: true };
    }),

  /**
   * EXECUTE - Mutația principală care declanșează orchestrarea AI.
   */
  execute: publicProcedure
    .input(z.object({
      workflowId: z.string(),
      initialInput: z.string()
    }))
    .mutation(async ({ input }) => {
      console.log(`[tRPC] Declanșare execuție pentru workflow ${input.workflowId}`);
      return await orchestratorService.runWorkflow(input.workflowId, input.initialInput);
    }),
});
