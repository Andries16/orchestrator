import express from "express";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import path from "path";
import * as trpcExpress from "@trpc/server/adapters/express";
import { connectDB } from "./db.js";
import { appRouter } from "./routers/index.js";
async function startServer() {
  await connectDB();
  const app = express();
  const PORT = +process.env.PORT || 3000;
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message:
      "Prea multe cereri de la acest IP. Te rugăm să încerci mai târziu.",
  });
  app.use("/api/trpc", limiter);
  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
    }),
  );
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", project: "cross_brand" });
  });
  app.use(express.json());
  app.post("/api/execute-stream", limiter, async (req, res) => {
    const { workflowId, initialInput, apiKeys } = req.body;
    if (!workflowId || !initialInput) {
      return res
        .status(400)
        .json({ error: "workflowId and initialInput are required" });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    try {
      const { orchestratorService } =
        await import("./services/OrchestratorService.js");
      const { WorkflowModel } = await import("./models/Workflow.js");
      const workflow = await WorkflowModel.findById(workflowId);
      const isDag = workflow && (workflow.nodes as any[])?.length > 0;
      const stream = isDag
        ? orchestratorService.runWorkflowDAGStream(
            workflowId,
            initialInput,
            apiKeys,
          )
        : orchestratorService.runWorkflowStream(
            workflowId,
            initialInput,
            apiKeys,
          );
      for await (const event of stream) {
        sendEvent(event);
      }
      res.end();
    } catch (error) {
      sendEvent({
        type: "error",
        message: error instanceof Error ? error.message : "Eroare internă.",
      });
      res.end();
    }
  });
  app.post("/api/execute-resume", limiter, async (req, res) => {
    const { runId, userInput, apiKeys } = req.body;
    if (!runId) return res.status(400).json({ error: "runId is required" });
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const sendEvent = (data: any) =>
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    try {
      const { orchestratorService } =
        await import("./services/OrchestratorService.js");
      const stream = orchestratorService.resumeWorkflowDAGStream(
        runId,
        userInput || "",
        apiKeys,
      );
      for await (const event of stream) {
        sendEvent(event);
      }
      res.end();
    } catch (error) {
      sendEvent({
        type: "error",
        message: error instanceof Error ? error.message : "Eroare internă.",
      });
      res.end();
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(process.cwd(), "apps/frontend"),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "apps/frontend/dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[BACKEND] Serverul cross_brand rulează pe http://localhost:${PORT}`,
    );
  });
}
startServer().catch(console.error);
