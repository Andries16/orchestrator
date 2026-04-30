import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Grid,
} from "@mui/material";
import { IconButton } from "@mui/material";
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
  Clock,
  Bot,
  Workflow,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
const KpiCard = ({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      bgcolor: "#121212",
      border: "1px solid #242424",
      borderRadius: 3,
      flex: 1,
      minWidth: 160,
      transition: "border-color 0.2s",
      "&:hover": { borderColor: color + "66" },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          p: 1,
          bgcolor: color + "18",
          borderRadius: 2,
          display: "flex",
          border: `1px solid ${color}30`,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: "11px",
          color: "#666",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </Typography>
    </Box>
    <Typography
      sx={{
        fontSize: "32px",
        fontWeight: 800,
        color: "#f1f5f9",
        lineHeight: 1,
        letterSpacing: "-0.03em",
      }}
    >
      {value}
    </Typography>
    {sub && (
      <Typography sx={{ fontSize: "12px", color: "#555", mt: 0.5 }}>
        {sub}
      </Typography>
    )}
  </Paper>
);
const chartTooltipStyle = {
  contentStyle: {
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#94a3b8", fontWeight: 600 },
};
const msToHuman = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};
export const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading: loadingSummary } =
    trpc.analytics.getSummary.useQuery();
  const { data: runsOverTime, isLoading: loadingTime } =
    trpc.analytics.getRunsOverTime.useQuery();
  const { data: perWorkflow, isLoading: loadingWf } =
    trpc.analytics.getPerWorkflow.useQuery();
  const { data: perAgent, isLoading: loadingAgent } =
    trpc.analytics.getPerAgent.useQuery();
  const { data: toolUsage, isLoading: loadingTools } =
    trpc.analytics.getToolUsage.useQuery();
  const isLoading =
    loadingSummary || loadingTime || loadingWf || loadingAgent || loadingTools;
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a", py: 6 }}>
      <Container maxWidth="xl">
        {}
        <Box sx={{ mb: 6, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              color: "#555",
              "&:hover": {
                color: "#e0e0e0",
                bgcolor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#f5f5f5",
                letterSpacing: "-0.03em",
              }}
            >
              Analytics
            </Typography>
            <Typography sx={{ color: "#555", fontSize: "13px", mt: 0.5 }}>
              Real-time metrics aggregated across all workflow runs.
            </Typography>
          </Box>
        </Box>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 20,
            }}
          >
            <CircularProgress sx={{ color: "#6366f1" }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <KpiCard
                icon={<TrendingUp size={16} color="#6366f1" />}
                label="Total Runs"
                value={summary?.totalRuns ?? 0}
                color="#6366f1"
              />
              <KpiCard
                icon={<CheckCircle size={16} color="#10b981" />}
                label="Success Rate"
                value={`${summary?.successRate ?? 0}%`}
                sub={`${summary?.successRuns ?? 0} successful`}
                color="#10b981"
              />
              <KpiCard
                icon={<AlertCircle size={16} color="#ef4444" />}
                label="Failed Runs"
                value={summary?.failedRuns ?? 0}
                color="#ef4444"
              />
              <KpiCard
                icon={<Clock size={16} color="#f59e0b" />}
                label="Avg Duration"
                value={msToHuman(summary?.avgDurationMs ?? 0)}
                sub="completed runs only"
                color="#f59e0b"
              />
              <KpiCard
                icon={<Zap size={16} color="#22d3ee" />}
                label="Total Agent Steps"
                value={summary?.totalAgentSteps ?? 0}
                color="#22d3ee"
              />
            </Box>
            {}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                bgcolor: "#121212",
                border: "1px solid #242424",
                borderRadius: 3,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                <TrendingUp size={18} color="#6366f1" />
                <Typography
                  sx={{ fontWeight: 700, color: "#f1f5f9", fontSize: "15px" }}
                >
                  Runs Over Time (Last 30 Days)
                </Typography>
              </Box>
              {!runsOverTime?.length ? (
                <Typography
                  sx={{ color: "#334155", textAlign: "center", py: 8 }}
                >
                  No data yet — run some workflows!
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={runsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#475569", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#475569", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip {...chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={false}
                      name="Total"
                    />
                    <Line
                      type="monotone"
                      dataKey="success"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Success"
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="Failed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Paper>
            <Grid container spacing={3}>
              {}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    bgcolor: "#121212",
                    border: "1px solid #242424",
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3,
                    }}
                  >
                    <Workflow size={18} color="#f59e0b" />
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#f1f5f9",
                        fontSize: "15px",
                      }}
                    >
                      Runs per Workflow
                    </Typography>
                  </Box>
                  {!perWorkflow?.length ? (
                    <Typography
                      sx={{ color: "#334155", textAlign: "center", py: 8 }}
                    >
                      No data yet.
                    </Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={perWorkflow}
                        layout="vertical"
                        barCategoryGap={10}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: "#475569", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          width={110}
                        />
                        <Tooltip {...chartTooltipStyle} />
                        <Bar
                          dataKey="totalRuns"
                          fill="#6366f1"
                          radius={[0, 4, 4, 0]}
                          name="Total Runs"
                        />
                        <Bar
                          dataKey="successRuns"
                          fill="#10b981"
                          radius={[0, 4, 4, 0]}
                          name="Success"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Paper>
              </Grid>
              {}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    bgcolor: "#121212",
                    border: "1px solid #242424",
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3,
                    }}
                  >
                    <Bot size={18} color="#22d3ee" />
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#f1f5f9",
                        fontSize: "15px",
                      }}
                    >
                      Invocations per Agent
                    </Typography>
                  </Box>
                  {!perAgent?.length ? (
                    <Typography
                      sx={{ color: "#334155", textAlign: "center", py: 8 }}
                    >
                      No data yet.
                    </Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={perAgent}
                        layout="vertical"
                        barCategoryGap={10}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: "#475569", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          width={110}
                        />
                        <Tooltip {...chartTooltipStyle} />
                        <Bar
                          dataKey="invocations"
                          fill="#22d3ee"
                          radius={[0, 4, 4, 0]}
                          name="Invocations"
                        />
                        <Bar
                          dataKey="successCount"
                          fill="#10b981"
                          radius={[0, 4, 4, 0]}
                          name="Success"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Paper>
              </Grid>
            </Grid>
            {}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                bgcolor: "#121212",
                border: "1px solid #242424",
                borderRadius: 3,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                <Zap size={18} color="#818cf8" />
                <Typography
                  sx={{ fontWeight: 700, color: "#f1f5f9", fontSize: "15px" }}
                >
                  Tool Usage Distribution
                </Typography>
              </Box>
              {!toolUsage?.length ? (
                <Typography
                  sx={{ color: "#334155", textAlign: "center", py: 8 }}
                >
                  No tools used yet.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={toolUsage}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#475569", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip {...chartTooltipStyle} />
                    <Bar
                      dataKey="count"
                      fill="#818cf8"
                      radius={[4, 4, 0, 0]}
                      name="Invocations"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};
