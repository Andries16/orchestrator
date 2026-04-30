import { ExecutionLogModel } from "../models/ExecutionLog.js";
import { WorkflowRunModel } from "../models/WorkflowRun.js";
import { publicProcedure, router } from "../trpc.js";
export const analyticsRouter = router({
  getSummary: publicProcedure.query(async () => {
    const [runs, logs] = await Promise.all([
      WorkflowRunModel.find({}),
      ExecutionLogModel.countDocuments({}),
    ]);
    const totalRuns = runs.length;
    const successRuns = runs.filter((r) => r.status === "completed").length;
    const failedRuns = runs.filter((r) => r.status === "failed").length;
    const successRate =
      totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;
    const durationsMs = runs
      .filter((r) => r.status === "completed" && r.endTime && r.startTime)
      .map((r) => r.endTime!.getTime() - r.startTime!.getTime());
    const avgDurationMs =
      durationsMs.length > 0
        ? Math.round(
            durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length,
          )
        : 0;
    return {
      totalRuns,
      successRuns,
      failedRuns,
      successRate,
      avgDurationMs,
      totalAgentSteps: logs,
    };
  }),
  getRunsOverTime: publicProcedure.query(async () => {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const result = await WorkflowRunModel.aggregate([
      { $match: { startTime: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$startTime" },
          },
          count: { $sum: 1 },
          success: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return result.map((r) => ({
      date: r._id,
      count: r.count,
      success: r.success,
      failed: r.failed,
    }));
  }),
  getPerWorkflow: publicProcedure.query(async () => {
    const result = await WorkflowRunModel.aggregate([
      {
        $group: {
          _id: "$workflowId",
          totalRuns: { $sum: 1 },
          successRuns: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "workflows",
          localField: "_id",
          foreignField: "_id",
          as: "workflow",
        },
      },
      { $unwind: { path: "$workflow", preserveNullAndEmptyArrays: true } },
      { $sort: { totalRuns: -1 } },
      { $limit: 10 },
    ]);
    return result.map((r) => ({
      workflowId: String(r._id),
      name: r.workflow?.name ?? "Unknown",
      totalRuns: r.totalRuns,
      successRuns: r.successRuns,
      successRate:
        r.totalRuns > 0 ? Math.round((r.successRuns / r.totalRuns) * 100) : 0,
    }));
  }),
  getPerAgent: publicProcedure.query(async () => {
    const result = await ExecutionLogModel.aggregate([
      {
        $group: {
          _id: "$agentId",
          invocations: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "agents",
          localField: "_id",
          foreignField: "_id",
          as: "agent",
        },
      },
      { $unwind: { path: "$agent", preserveNullAndEmptyArrays: true } },
      { $sort: { invocations: -1 } },
      { $limit: 10 },
    ]);
    return result.map((r) => ({
      agentId: String(r._id),
      name: r.agent?.name ?? "Unknown",
      role: r.agent?.role ?? "",
      invocations: r.invocations,
      successCount: r.successCount,
    }));
  }),
  getToolUsage: publicProcedure.query(async () => {
    const result = await ExecutionLogModel.aggregate([
      { $unwind: "$toolsUsed" },
      {
        $group: {
          _id: "$toolsUsed",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    return result.map((r) => ({
      name: r._id,
      count: r.count,
    }));
  }),
});
