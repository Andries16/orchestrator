import { z } from 'zod';

/**
 * --- AGENT ---
 * Reprezintă un agent AI configurat cu un anumit rol și model.
 */
export const AgentSchema = z.object({
  name: z.string().min(2, 'Numele trebuie să aibă cel puțin 2 caractere'),
  role: z.string().min(2, 'Rolul este obligatoriu'),
  model: z.enum(['gemini-3-flash-preview', 'gemini-3.1-pro-preview', 'gpt-4o', 'claude-3.5-sonnet']),
  systemPrompt: z.string().min(1, 'Prompt-ul de sistem este obligatoriu'),
  temperature: z.number().min(0).max(1).default(0.7),
});

export type Agent = z.infer<typeof AgentSchema>;

/**
 * --- PROMPT TEMPLATE ---
 * Un șablon de prompt ce conține variabile dinamice de tipul {{variabila}}.
 */
export const PromptTemplateSchema = z.object({
  title: z.string().min(2, 'Titlul este obligatoriu'),
  content: z.string().min(1, 'Conținutul promptului este obligatoriu'),
});

export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

/**
 * --- WORKFLOW ---
 * O secvență de pași executabili de către agenți diferiți.
 */
export const WorkflowStepSchema = z.object({
  order: z.number(),
  agentId: z.string(),
});

export const WorkflowSchema = z.object({
  name: z.string().min(2, 'Numele workflow-ului este obligatoriu'),
  description: z.string().optional(),
  steps: z.array(WorkflowStepSchema).default([]),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

/**
 * --- EXECUTION LOG ---
 * Jurnalizarea execuției unui pas dintr-un workflow.
 */
export const ExecutionLogSchema = z.object({
  workflowId: z.string(),
  agentId: z.string(),
  input: z.string(),
  output: z.string(),
  status: z.enum(['success', 'error']),
  timestamp: z.date().optional(), // Va fi generat automat de DB dacă lipsește
});

export type ExecutionLog = z.infer<typeof ExecutionLogSchema>;
