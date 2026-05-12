import { Workflow } from "@cross_brand/shared";
import mongoose, { Document, Schema } from "mongoose";
export interface IWorkflow extends Workflow, Document {}
const WorkflowSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    steps: [
      {
        order: { type: Number, required: true },
        agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
      },
    ],
    nodes: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ["input", "agent", "output", "wait", "router"],
          required: true,
        },
        agentId: { type: Schema.Types.ObjectId, ref: "Agent" },
        tools: [{ type: String }],
        waitForAll: { type: Boolean, default: false },
        mergeContext: { type: Boolean, default: true },
        position: {
          x: { type: Number, default: 0 },
          y: { type: Number, default: 0 },
        },
        data: { label: { type: String } },
      },
    ],
    edges: [
      {
        id: { type: String, required: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
        label: { type: String },
      },
    ],
    maxIterations: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
  },
  { timestamps: true },
);
export const WorkflowModel = mongoose.model<IWorkflow>(
  "Workflow",
  WorkflowSchema,
);
