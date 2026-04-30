import mongoose, { Schema, Document } from "mongoose";
export interface IPromptTemplate extends Document {
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
}
const PromptTemplateSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);
export const PromptTemplateModel = mongoose.model<IPromptTemplate>(
  "PromptTemplate",
  PromptTemplateSchema,
);
