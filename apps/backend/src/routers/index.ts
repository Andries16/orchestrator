import { router } from '../trpc.js';
import { agentRouter } from './agent.js';
import { workflowRouter } from './workflow.js';

/**
 * Router-ul principal (AppRouter) - agregatorul tuturor funcționalităților tRPC.
 */
export const appRouter = router({
  agent: agentRouter,
  workflow: workflowRouter,
});

// Exportăm tipul router-ului pentru a fi consumat de clientul tRPC de pe frontend.
export type AppRouter = typeof appRouter;
