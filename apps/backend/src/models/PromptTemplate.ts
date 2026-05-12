import mongoose, { Document, Schema } from "mongoose";
export interface IPromptTemplate extends Document {
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
}
const PromptTemplateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
