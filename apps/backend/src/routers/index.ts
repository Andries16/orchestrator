import { router } from "../trpc.js";
import { agentRouter } from "./agent.js";
import { workflowRouter } from "./workflow.js";
import { settingsRouter } from "./settings.js";
import { analyticsRouter } from "./analytics.js";
import { templateRouter } from "./template.js";
export const appRouter = router({
  agent: agentRouter,
  workflow: workflowRouter,
  settings: settingsRouter,
  analytics: analyticsRouter,
  template: templateRouter,
});
export type AppRouter = typeof appRouter;
