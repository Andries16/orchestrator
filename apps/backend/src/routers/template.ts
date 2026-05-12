import { z } from "zod";
import { PromptTemplateModel } from "../models/PromptTemplate.js";
import { protectedProcedure, router } from "../trpc.js";

const TemplateInput = z.object({
  title: z.string().min(2),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export const templateRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await PromptTemplateModel.find({ userId: ctx.user.id }).sort({ createdAt: -1 });
  }),
  create: protectedProcedure.input(TemplateInput).mutation(async ({ input, ctx }) => {
    return await PromptTemplateModel.create({ ...input, userId: ctx.user.id });
  }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: TemplateInput.partial() }))
    .mutation(async ({ input, ctx }) => {
      const updated = await PromptTemplateModel.findOneAndUpdate(
        { _id: input.id, userId: ctx.user.id },
        { $set: input.data },
        { new: true },
      );
      if (!updated) throw new Error("Template not found");
      return updated;
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    await PromptTemplateModel.findOneAndDelete({ _id: input, userId: ctx.user.id });
    return { success: true };
  }),
  render: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        variables: z.record(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const template = await PromptTemplateModel.findOne({ _id: input.templateId, userId: ctx.user.id });
      if (!template) throw new Error("Template not found");
      let rendered = template.content;
      for (const [key, value] of Object.entries(input.variables)) {
        rendered = rendered.replaceAll(`{{${key}}}`, value);
      }
      return { rendered };
    }),
});
