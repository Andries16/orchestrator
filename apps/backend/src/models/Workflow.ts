import mongoose, { Schema, Document } from 'mongoose';
import { Workflow } from '@cross_brand/shared';

/**
 * Interfața pentru documentul Workflow în MongoDB.
 */
export interface IWorkflow extends Workflow, Document {}

/**
 * Schema Mongoose pentru Workflow de Agenți.
 */
const WorkflowSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  steps: [{
    order: { type: Number, required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true }
  }],
  status: { 
    type: String, 
    enum: ['draft', 'active', 'archived'], 
    default: 'draft' 
  }
}, { timestamps: true });

export const WorkflowModel = mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
