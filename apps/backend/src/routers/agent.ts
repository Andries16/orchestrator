import { AgentSchema } from "@cross_brand/shared";
import { z } from "zod";
import { AgentModel } from "../models/Agent.js";
import { protectedProcedure, router } from "../trpc.js";

export const agentRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await AgentModel.find({ userId: ctx.user.id }).sort({ createdAt: -1 });
  }),
  getById: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const agent = await AgentModel.findOne({ _id: input, userId: ctx.user.id });
    if (!agent) throw new Error("Agentul nu a fost găsit");
    return agent;
  }),
  create: protectedProcedure.input(AgentSchema).mutation(async ({ input, ctx }) => {
    const newAgent = new AgentModel({ ...input, userId: ctx.user.id });
    return await newAgent.save();
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: AgentSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updatedAgent = await AgentModel.findOneAndUpdate(
        { _id: input.id, userId: ctx.user.id },
        { $set: input.data },
        { new: true },
      );
      if (!updatedAgent)
        throw new Error("Agentul nu a fost găsit pentru actualizare");
      return updatedAgent;
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const deletedAgent = await AgentModel.findOneAndDelete({ _id: input, userId: ctx.user.id });
    if (!deletedAgent)
      throw new Error("Agentul nu a fost găsit pentru ștergere");
    return { success: true, id: input };
  }),
});
