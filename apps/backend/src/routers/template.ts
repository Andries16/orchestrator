import { z } from "zod";
import { PromptTemplateModel } from "../models/PromptTemplate.js";
import { publicProcedure, router } from "../trpc.js";
const TemplateInput = z.object({
  title: z.string().min(2),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
});
export const templateRouter = router({
  getAll: publicProcedure.query(async () => {
    return await PromptTemplateModel.find().sort({ createdAt: -1 });
  }),
  create: publicProcedure.input(TemplateInput).mutation(async ({ input }) => {
    return await PromptTemplateModel.create(input);
  }),
  update: publicProcedure
    .input(z.object({ id: z.string(), data: TemplateInput.partial() }))
    .mutation(async ({ input }) => {
      const updated = await PromptTemplateModel.findByIdAndUpdate(
        input.id,
        { $set: input.data },
        { new: true },
      );
      if (!updated) throw new Error("Template not found");
      return updated;
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    await PromptTemplateModel.findByIdAndDelete(input);
    return { success: true };
  }),
  render: publicProcedure
    .input(
      z.object({
        templateId: z.string(),
        variables: z.record(z.string()),
      }),
    )
    .query(async ({ input }) => {
      const template = await PromptTemplateModel.findById(input.templateId);
      if (!template) throw new Error("Template not found");
      let rendered = template.content;
      for (const [key, value] of Object.entries(input.variables)) {
        rendered = rendered.replaceAll(`{{${key}}}`, value);
      }
      return { rendered };
    }),
});
