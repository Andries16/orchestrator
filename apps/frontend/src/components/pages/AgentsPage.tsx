import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {
  Activity,
  BarChart2,
  FileText,
  Plus,
  Settings,
  Terminal,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../utils/authStore";
import { AgentsList } from "../organisms/AgentsList";
import { WorkflowsList } from "../organisms/WorkflowsList";
export const AgentsPage = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a" }}>
      { }
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(10, 10, 10, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #242424",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ height: 64, justifyContent: "space-between" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#e0e0e0",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 15px rgba(224, 224, 224, 0.1)",
                }}
              >
                <Terminal size={18} color="#0a0a0a" />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "16px",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    color: "#e0e0e0",
                  }}
                >
                  orchestrator
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "9px",
                    color: "#888",
                    textTransform: "uppercase",
                    mt: 0.5,
                  }}
                >
                  Core Interface v0.1.0
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                startIcon={<Plus size={16} />}
                variant="outlined"
                onClick={() => navigate("/agent-editor")}
                sx={{
                  color: "#e0e0e0",
                  borderColor: "#242424",
                  fontSize: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  "&:hover": {
                    borderColor: "#404040",
                    bgcolor: "rgba(255,255,255,0.05)",
                  },
                }}
              >
                Nou Agent
              </Button>
              <Button
                startIcon={<Plus size={16} />}
                variant="contained"
                onClick={() => navigate("/editor")}
                sx={{
                  bgcolor: "#e0e0e0",
                  color: "#0a0a0a",
                  fontSize: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                Nou Workflow
              </Button>
              <IconButton
                onClick={() => navigate("/history")}
                title="History"
                sx={{ color: "#888", "&:hover": { color: "#e0e0e0" } }}
              >
                <Activity size={18} />
              </IconButton>
              <IconButton
                onClick={() => navigate("/analytics")}
                title="Analytics"
                sx={{ color: "#888", "&:hover": { color: "#e0e0e0" } }}
              >
                <BarChart2 size={18} />
              </IconButton>
              <IconButton
                onClick={() => navigate("/templates")}
                title="Prompt Templates"
                sx={{ color: "#888", "&:hover": { color: "#e0e0e0" } }}
              >
                <FileText size={18} />
              </IconButton>
              <IconButton
                onClick={() => navigate("/settings")}
                sx={{ color: "#888", "&:hover": { color: "#e0e0e0" } }}
              >
                <Settings size={18} />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "center", ml: 2, borderLeft: "1px solid #242424", pl: 2 }}>
                <Typography sx={{ color: "#888", fontSize: "12px", mr: 2 }}>
                  {user?.email}
                </Typography>
                <IconButton
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  title="Logout"
                  sx={{ color: "#888", "&:hover": { color: "#ef4444" } }}
                >
                  <LogOut size={18} />
                </IconButton>
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      { }
      <Box
        sx={{
          py: 6,
          borderBottom: "1px solid #242424",
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.02) 0%, transparent 100%)",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#f5f5f5",
                letterSpacing: "-0.03em",
              }}
            >
              Management Orchestrazie
            </Typography>
            <Typography
              sx={{ color: "#888", fontSize: "14px", maxWidth: "600px" }}
            >
              Gestionează unitățile AI și definește fluxuri de execuție
              complexe. Fiecare workflow reprezintă un lanț logic de procesare.
            </Typography>
          </Box>
        </Container>
      </Box>
      { }
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <WorkflowsList />
          <Divider sx={{ borderColor: "#242424" }} />
          <AgentsList />
        </Box>
      </Container>
      { }
      <Box
        sx={{
          mt: "auto",
          py: 1.5,
          bgcolor: "#050505",
          borderTop: "1px solid #242424",
          px: 4,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "10px",
            color: "#666",
          }}
        >
          SYSTEM_NODE: active | LATENCY: 24ms
        </Typography>
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "10px",
            color: "#888",
          }}
        >
          DB_STATUS: SYNCHRONIZED
        </Typography>
      </Box>
    </Box>
  );
};
