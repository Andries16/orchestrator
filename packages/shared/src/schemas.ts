import { z } from "zod";
export const AgentSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  role: z.string().min(2, "Rolul este obligatoriu"),
  model: z.enum([
    "gemini-3-flash-preview",
    "gemini-3.1-pro-preview",
    "gpt-4o",
    "gpt-3.5-turbo",
    "claude-3-5-sonnet-20241022",
    "claude-3-opus-20240229",
  ]),
  systemPrompt: z.string().min(1, "Prompt-ul de sistem este obligatoriu"),
  temperature: z.number().min(0).max(1).default(0.7),
  tools: z.array(z.string()).default([]),
  maxRetries: z.number().min(0).max(5).default(2),
  fallbackModel: z.string().optional(),
});
export type Agent = z.infer<typeof AgentSchema>;
export const PromptTemplateSchema = z.object({
  title: z.string().min(2, "Titlul este obligatoriu"),
  content: z.string().min(1, "Conținutul promptului este obligatoriu"),
});
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;
export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["input", "agent", "output", "wait", "router"]),
  agentId: z.string().optional(),
  tools: z.array(z.string()).optional(),
  waitForAll: z.boolean().optional().default(false),
  mergeContext: z.boolean().optional().default(true),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({ label: z.string() }).optional(),
});
export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;
export const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});
export type WorkflowEdge = z.infer<typeof WorkflowEdgeSchema>;
export const WorkflowStepSchema = z.object({
  order: z.number(),
  agentId: z.string(),
});
export const WorkflowSchema = z.object({
  name: z.string().min(2, "Numele workflow-ului este obligatoriu"),
  description: z.string().optional(),
  steps: z.array(WorkflowStepSchema).default([]),
  nodes: z.array(WorkflowNodeSchema).default([]),
  edges: z.array(WorkflowEdgeSchema).default([]),
  maxIterations: z.number().min(1).default(10),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});
export type Workflow = z.infer<typeof WorkflowSchema>;
export const WorkflowRunSchema = z.object({
  workflowId: z.string(),
  status: z.enum(["running", "completed", "failed", "waiting"]),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  initialInput: z.string(),
  finalOutput: z.string().optional(),
  error: z.string().optional(),
  pendingNodeId: z.string().optional(),
  nodeIterations: z.record(z.string(), z.number()).optional(),
  state: z.record(z.string(), z.any()).optional().default({}),
});
export type WorkflowRun = z.infer<typeof WorkflowRunSchema>;
export const ExecutionLogSchema = z.object({
  workflowId: z.string(),
  workflowRunId: z.string(),
  agentId: z.string(),
  nodeId: z.string().optional(),
  iteration: z.number().optional(),
  input: z.string(),
  output: z.string(),
  status: z.enum(["success", "error"]),
  toolsUsed: z.array(z.string()).optional(),
  timestamp: z.date().optional(),
});
export type ExecutionLog = z.infer<typeof ExecutionLogSchema>;
export const SettingsSchema = z.object({
  openaiKey: z.string().optional(),
  anthropicKey: z.string().optional(),
  googleKey: z.string().optional(),
});
export type Settings = z.infer<typeof SettingsSchema>;
