import mongoose, { Schema, Document } from 'mongoose';
import { Agent } from '@cross_brand/shared';

/**
 * Interfața pentru documentul Agent în MongoDB.
 */
export interface IAgent extends Agent, Document {}

/**
 * Schema Mongoose pentru Agent AI.
 */
const AgentSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  model: { 
    type: String, 
    required: true,
    enum: ['gemini-3-flash-preview', 'gemini-3.1-pro-preview', 'gpt-4o', 'claude-3.5-sonnet']
  },
  systemPrompt: { type: String, required: true },
  temperature: { type: Number, default: 0.7 }
}, { timestamps: true });

export const AgentModel = mongoose.model<IAgent>('Agent', AgentSchema);
