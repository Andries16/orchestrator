import mongoose, { Schema, Document } from "mongoose";
import { ExecutionLog } from "@cross_brand/shared";
export interface IExecutionLog
  extends Omit<ExecutionLog, "timestamp">, Document {
  nodeId?: string;
  iteration?: number;
  timestamp: Date;
}
const ExecutionLogSchema: Schema = new Schema({
  workflowId: { type: Schema.Types.ObjectId, ref: "Workflow", required: true },
  workflowRunId: {
    type: Schema.Types.ObjectId,
    ref: "WorkflowRun",
    required: true,
  },
  agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
  nodeId: { type: String },
  iteration: { type: Number },
  input: { type: String, required: true },
  output: { type: String, required: true },
  status: {
    type: String,
    enum: ["success", "error"],
    required: true,
  },
  toolsUsed: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
});
export const ExecutionLogModel = mongoose.model<IExecutionLog>(
  "ExecutionLog",
  ExecutionLogSchema,
);
