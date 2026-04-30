import mongoose, { Schema, Document } from "mongoose";
import { WorkflowRun } from "@cross_brand/shared";
export interface IWorkflowRun extends Omit<WorkflowRun, "startTime">, Document {
  startTime: Date;
  state: Record<string, any>;
}
const WorkflowRunSchema = new Schema({
  workflowId: { type: Schema.Types.ObjectId, ref: "Workflow", required: true },
  status: {
    type: String,
    enum: ["running", "completed", "failed", "waiting"],
    default: "running",
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  initialInput: { type: String, required: true },
  finalOutput: { type: String },
  error: { type: String },
  pendingNodeId: { type: String },
  nodeIterations: { type: Map, of: Number, default: {} },
  state: { type: Schema.Types.Mixed, default: {} },
});
export const WorkflowRunModel = mongoose.model<IWorkflowRun>(
  "WorkflowRun",
  WorkflowRunSchema,
);
