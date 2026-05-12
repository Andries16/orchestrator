import { router } from "../trpc.js";
import { agentRouter } from "./agent.js";
import { analyticsRouter } from "./analytics.js";
import { settingsRouter } from "./settings.js";
import { templateRouter } from "./template.js";
import { workflowRouter } from "./workflow.js";
import { authRouter } from "./auth.js";

export const appRouter = router({
  agent: agentRouter,
  workflow: workflowRouter,
  settings: settingsRouter,
  analytics: analyticsRouter,
  template: templateRouter,
  auth: authRouter,
});
export type AppRouter = typeof appRouter;
