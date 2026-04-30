import { AgentSchema } from "@cross_brand/shared";
import { z } from "zod";
import { AgentModel } from "../models/Agent.js";
import { publicProcedure, router } from "../trpc.js";
export const agentRouter = router({
  getAll: publicProcedure.query(async () => {
    return await AgentModel.find().sort({ createdAt: -1 });
  }),
  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const agent = await AgentModel.findById(input);
    if (!agent) throw new Error("Agentul nu a fost găsit");
    return agent;
  }),
  create: publicProcedure.input(AgentSchema).mutation(async ({ input }) => {
    const newAgent = new AgentModel(input);
    return await newAgent.save();
  }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: AgentSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const updatedAgent = await AgentModel.findByIdAndUpdate(
        input.id,
        { $set: input.data },
        { new: true },
      );
      if (!updatedAgent)
        throw new Error("Agentul nu a fost găsit pentru actualizare");
      return updatedAgent;
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    const deletedAgent = await AgentModel.findByIdAndDelete(input);
    if (!deletedAgent)
      throw new Error("Agentul nu a fost găsit pentru ștergere");
    return { success: true, id: input };
  }),
});
