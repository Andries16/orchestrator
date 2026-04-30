import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { format } from "date-fns";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../../utils/trpc";
export const HistoryPage = () => {
  const navigate = useNavigate();
  const { data: runs, isLoading } = trpc.workflow.getRuns.useQuery();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "failed":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} color="#10b981" />;
      case "failed":
        return <AlertCircle size={16} color="#ef4444" />;
      default:
        return <Activity size={16} color="#3b82f6" />;
    }
  };
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a", py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: "#888",
              "&:hover": {
                color: "#e0e0e0",
                bgcolor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5f5f5" }}>
              Istoric Execuții
            </Typography>
            <Typography sx={{ color: "#888", fontSize: "14px", mt: 0.5 }}>
              Monitorizează și analizează rulările trecute ale workflow-urilor.
            </Typography>
          </Box>
        </Box>
        {isLoading ? (
          <Typography sx={{ color: "#888" }}>
            Se încarcă istoricul...
          </Typography>
        ) : runs?.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: "center",
              bgcolor: "#121212",
              border: "1px dashed #242424",
              borderRadius: 3,
            }}
          >
            <Typography sx={{ color: "#888" }}>
              Nu există execuții înregistrate încă.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {runs?.map((run: any) => (
              <Grid item xs={12} key={run._id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "#121212",
                    border: "1px solid #242424",
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#404040",
                      transform: "translateY(-2px)",
                    },
                  }}
                  onClick={() => navigate(`/history/${run._id}`)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: "rgba(255,255,255,0.03)",
                          borderRadius: 2,
                          border: "1px solid #242424",
                        }}
                      >
                        {getStatusIcon(run.status)}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            color: "#f5f5f5",
                            fontWeight: 600,
                            fontSize: "16px",
                          }}
                        >
                          {run.workflowId?.name || "Workflow Necunoscut"}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mt: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Clock size={12} color="#888" />
                            <Typography
                              sx={{ color: "#888", fontSize: "12px" }}
                            >
                              {run.startTime
                                ? format(
                                  new Date(run.startTime),
                                  "dd MMM yyyy, HH:mm:ss",
                                )
                                : "N/A"}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              color: "#888",
                              fontSize: "12px",
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            ID: {run._id.slice(-8)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Chip
                        label={run.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(run.status)}15`,
                          color: getStatusColor(run.status),
                          fontWeight: 700,
                          fontSize: "11px",
                          border: `1px solid ${getStatusColor(run.status)}30`,
                        }}
                      />
                      <ChevronRight size={20} color="#404040" />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};
