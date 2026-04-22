import mongoose, { Schema, Document } from 'mongoose';
import { ExecutionLog } from '@cross_brand/shared';

/**
 * Interfața pentru documentul ExecutionLog în MongoDB.
 */
export interface IExecutionLog extends Omit<ExecutionLog, 'timestamp'>, Document {
  timestamp: Date;
}

/**
 * Schema Mongoose pentru Jurnalizarea Execuției.
 * Stochează istoricul interacțiunilor dintre workflow și agenți.
 */
const ExecutionLogSchema: Schema = new Schema({
  workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
  input: { type: String, required: true },
  output: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['success', 'error'], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now }
});

export const ExecutionLogModel = mongoose.model<IExecutionLog>('ExecutionLog', ExecutionLogSchema);
