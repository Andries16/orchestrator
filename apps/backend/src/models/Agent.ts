import { Agent } from "@cross_brand/shared";
import mongoose, { Document, Schema } from "mongoose";
export interface IAgent extends Agent, Omit<Document, "model"> {}
const AgentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    model: {
      type: String,
      required: true,
      enum: [
        "gemini-3-flash-preview",
        "gemini-3.1-pro-preview",
        "gpt-4o",
        "gpt-3.5-turbo",
        "claude-3-5-sonnet-20241022",
        "claude-3-opus-20240229",
      ],
    },
    systemPrompt: { type: String, required: true },
    temperature: { type: Number, default: 0.7 },
    tools: { type: [String], default: [] },
    maxRetries: { type: Number, default: 2, min: 0, max: 5 },
    fallbackModel: { type: String },
  },
  { timestamps: true },
);
export const AgentModel = mongoose.model<IAgent>("Agent", AgentSchema);
