import mongoose, { Schema, Document } from 'mongoose';
import { PromptTemplate } from '@cross_brand/shared';

/**
 * Interfața pentru documentul PromptTemplate în MongoDB.
 */
export interface IPromptTemplate extends PromptTemplate, Document {}

/**
 * Schema Mongoose pentru Șablon de Prompt.
 */
const PromptTemplateSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true });

export const PromptTemplateModel = mongoose.model<IPromptTemplate>('PromptTemplate', PromptTemplateSchema);
