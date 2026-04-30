import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { format } from "date-fns";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { trpc } from "../../utils/trpc";
import { LogItem } from "../molecules/LogItem";
export const RunDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = trpc.workflow.getRunDetails.useQuery(id!);
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#e0e0e0" }} />
      </Box>
    );
  }
  if (error || !data) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0a0a0a",
          py: 6,
          textAlign: "center",
        }}
      >
        <Typography color="error">
          A apărut o eroare la încărcarea detaliilor.
        </Typography>
      </Box>
    );
  }
  const { run, logs } = data;
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
        return <CheckCircle size={18} color="#10b981" />;
      case "failed":
        return <AlertCircle size={18} color="#ef4444" />;
      default:
        return <Activity size={18} color="#3b82f6" />;
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
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              Detalii Execuție
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
            </Typography>
            <Typography sx={{ color: "#888", fontSize: "14px", mt: 0.5 }}>
              Workflow: {(run.workflowId as any)?.name || "Necunoscut"} | ID
              Rulare: {run._id}
            </Typography>
          </Box>
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: "#121212",
            border: "1px solid #242424",
            borderRadius: 3,
            mb: 4,
          }}
        >
          <Typography
            sx={{
              color: "#888",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            Context & Detalii
          </Typography>
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Clock size={16} color="#888" />
              <Box>
                <Typography
                  sx={{ color: "#666", fontSize: "11px", fontWeight: 600 }}
                >
                  START TIME
                </Typography>
                <Typography sx={{ color: "#e0e0e0", fontSize: "13px" }}>
                  {run.startTime
                    ? format(new Date(run.startTime), "dd MMM yyyy, HH:mm:ss")
                    : "-"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Clock size={16} color="#888" />
              <Box>
                <Typography
                  sx={{ color: "#666", fontSize: "11px", fontWeight: 600 }}
                >
                  END TIME
                </Typography>
                <Typography sx={{ color: "#e0e0e0", fontSize: "13px" }}>
                  {run.endTime
                    ? format(new Date(run.endTime), "dd MMM yyyy, HH:mm:ss")
                    : "-"}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider sx={{ my: 3, borderColor: "#242424" }} />
          <Typography
            sx={{
              color: "#888",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Input Inițial
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "#0a0a0a",
              border: "1px solid #242424",
              borderRadius: 2,
            }}
          >
            <Typography
              sx={{
                color: "#a0a0a0",
                fontSize: "13px",
                whiteSpace: "pre-wrap",
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {run.initialInput}
            </Typography>
          </Paper>
        </Paper>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#f5f5f5",
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Activity size={20} color="#888" /> Flux de Execuție (
          {logs?.length || 0} pași)
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {logs?.map((log: any, index: number) => (
            <LogItem key={log._id} log={log} />
          ))}
        </Box>
        {run.finalOutput && (
          <Box sx={{ mt: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                bgcolor: "#050505",
                border: "1px solid #242424",
                borderRadius: 3,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                {getStatusIcon(run.status)}
                <Typography
                  sx={{ fontSize: "16px", color: "#e0e0e0", fontWeight: 700 }}
                >
                  REZULTAT FINAL
                </Typography>
              </Box>
              <Box
                sx={{
                  fontSize: "14px",
                  color: "#f5f5f5",
                  lineHeight: 1.6,
                  "& p": { mt: 0, mb: 2, "&:last-child": { mb: 0 } },
                  "& pre": {
                    m: 0,
                    mb: 2,
                    borderRadius: 2,
                    "&:last-child": { mb: 0 },
                  },
                  "& a": { color: "#22d3ee" },
                  "& ul, & ol": { mt: 0, mb: 2, pl: 3 },
                  "& code": {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "13px",
                  },
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          children={String(children).replace(/\n$/, "")}
                          style={vscDarkPlus as any}
                          language={match[1]}
                          PreTag="div"
                        />
                      ) : (
                        <code
                          {...props}
                          className={className}
                          style={{
                            backgroundColor: "rgba(255,255,255,0.1)",
                            padding: "2px 4px",
                            borderRadius: "4px",
                          }}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {run.finalOutput}
                </ReactMarkdown>
              </Box>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};
