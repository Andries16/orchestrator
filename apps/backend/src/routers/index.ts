import { router } from "../trpc.js";
import { agentRouter } from "./agent.js";
import { analyticsRouter } from "./analytics.js";
import { settingsRouter } from "./settings.js";
import { templateRouter } from "./template.js";
import { workflowRouter } from "./workflow.js";
export const appRouter = router({
  agent: agentRouter,
  workflow: workflowRouter,
  settings: settingsRouter,
  analytics: analyticsRouter,
  template: templateRouter,
});
export type AppRouter = typeof appRouter;
