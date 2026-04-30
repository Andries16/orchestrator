import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Chip,
} from "@mui/material";
import { trpc } from "../../utils/trpc";
import { LogItem } from "../molecules/LogItem";
import {
  Play,
  Send,
  ChevronRight,
  History,
  Terminal,
  FileText,
  X,
  UserCheck,
  Cpu,
  Key,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
export const WorkflowExecutionPage = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const [initialInput, setInitialInput] = useState("");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [streamLogs, setStreamLogs] = useState<any[]>([]);
  const [currentChunk, setCurrentChunk] = useState("");
  const [finalResult, setFinalResult] = useState("");
  const [activeSteps, setActiveSteps] = useState<
    Record<
      string,
      { step: number; agentName: string; agentId: string; iteration?: number }
    >
  >({});
  const [workflowMemory, setWorkflowMemory] = useState<Record<string, any>>({});
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingRunId, setWaitingRunId] = useState<string | null>(null);
  const [waitingNodeId, setWaitingNodeId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [userApiKeys, setUserApiKeys] = useState({
    googleKey:
      typeof window !== "undefined"
        ? localStorage.getItem("googleKey") || ""
        : "",
    openaiKey:
      typeof window !== "undefined"
        ? localStorage.getItem("openaiKey") || ""
        : "",
    anthropicKey:
      typeof window !== "undefined"
        ? localStorage.getItem("anthropicKey") || ""
        : "",
  });
  const [showKeys, setShowKeys] = useState(false);
  const { data: workflow } = trpc.workflow.getById.useQuery(workflowId);
  const { data: templates } = trpc.template.getAll.useQuery();
  const handleKeyChange = (key: string, value: string) => {
    setUserApiKeys((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(key, value);
  };
  const processStream = async (response: Response, startStepInput: string) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let buffer = "";
    let stepInput = startStepInput;
    while (reader && !done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          if (part.startsWith("data: ")) {
            const dataStr = part.slice(6);
            try {
              const event = JSON.parse(dataStr);
              if (
                event.type === "run_started" ||
                event.type === "run_resumed"
              ) {
                if (event.runId) setWaitingRunId(event.runId);
                setIsWaiting(false);
              } else if (event.type === "step_start") {
                setActiveSteps((prev) => ({
                  ...prev,
                  [event.nodeId]: {
                    step: event.step,
                    agentName: event.agentName,
                    agentId: event.agentId,
                    iteration: event.iteration,
                  },
                }));
                setCurrentChunk("");
              } else if (event.type === "chunk") {
                setCurrentChunk((prev) => prev + event.text);
              } else if (event.type === "step_complete") {
                const completingStep = activeSteps[event.nodeId];
                setStreamLogs((prev) => [
                  ...prev,
                  {
                    agentId: completingStep?.agentId || "unknown",
                    input: stepInput,
                    output: event.output,
                    status: "success",
                    iteration: completingStep?.iteration,
                  },
                ]);
                stepInput = event.output;
                setActiveSteps((prev) => {
                  const next = { ...prev };
                  delete next[event.nodeId];
                  return next;
                });
                setCurrentChunk("");
              } else if (event.type === "waiting_for_input") {
                setIsWaiting(true);
                setWaitingNodeId(event.nodeId);
                setWaitingRunId(event.runId);
                return;
              } else if (event.type === "state_updated") {
                setWorkflowMemory(event.state);
              } else if (event.type === "retry") {
                setStreamLogs((prev) => [
                  ...prev,
                  {
                    agentId: "system",
                    input: "",
                    output: `⚠️ Retrying ${event.agentName} (attempt ${event.attempt}/${event.maxRetries})... waiting ${event.delayMs}ms`,
                    status: "retry",
                  },
                ]);
              } else if (event.type === "fallback") {
                setStreamLogs((prev) => [
                  ...prev,
                  {
                    agentId: "system",
                    input: "",
                    output: `🔄 Switching ${event.agentName} to fallback model: ${event.fallbackModel}`,
                    status: "retry",
                  },
                ]);
              } else if (event.type === "workflow_complete") {
                setFinalResult(event.output);
              } else if (event.type === "error") {
                setErrorMsg(event.message);
                setActiveSteps({});
                setCurrentChunk("");
              }
            } catch (e) {
              console.error("Parse error for event:", part);
            }
          }
        }
      }
    }
  };
  const handleRunWorkflow = async () => {
    if (!initialInput.trim() || isStreaming) return;
    setIsStreaming(true);
    setErrorMsg("");
    setStreamLogs([]);
    setCurrentChunk("");
    setFinalResult("");
    setActiveSteps({});
    setIsWaiting(false);
    try {
      const response = await fetch("/api/execute-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          initialInput,
          apiKeys: userApiKeys,
        }),
      });
      if (!response.ok) throw new Error("Eroare la pornirea execuției");
      await processStream(response, initialInput);
    } catch (err: any) {
      setErrorMsg(err.message || "Eroare necunoscută");
    } finally {
      setIsStreaming(false);
    }
  };
  const handleResume = async () => {
    if (!waitingRunId || isStreaming) return;
    setIsStreaming(true);
    setErrorMsg("");
    setIsWaiting(false);
    try {
      const response = await fetch("/api/execute-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: waitingRunId,
          userInput,
          apiKeys: userApiKeys,
        }),
      });
      if (!response.ok) throw new Error("Eroare la reluarea execuției");
      const currentStepInput =
        userInput || streamLogs[streamLogs.length - 1]?.output || initialInput;
      await processStream(response, currentStepInput);
      setUserInput("");
    } catch (err: any) {
      setErrorMsg(err.message || "Eroare necunoscută");
    } finally {
      setIsStreaming(false);
    }
  };
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a", py: 4 }}>
      <Container maxWidth="lg">
        <Breadcrumbs
          separator={<ChevronRight size={14} color="#888" />}
          sx={{ mb: 3 }}
        >
          <Link
            underline="none"
            color="#888"
            href="#"
            sx={{ fontSize: "12px" }}
          >
            Dashboard
          </Link>
          <Link
            underline="none"
            color="#888"
            href="#"
            sx={{ fontSize: "12px" }}
          >
            Workflows
          </Link>
          <Typography
            sx={{ fontSize: "12px", color: "#f5f5f5", fontWeight: 600 }}
          >
            {workflow?.name || "Execuție Workflow"}
          </Typography>
        </Breadcrumbs>
        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#121212",
                border: "1px solid #242424",
                borderRadius: 3,
                position: "sticky",
                top: 24,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                <Box
                  sx={{
                    p: 1,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 1.5,
                  }}
                >
                  <Play size={20} color="#e0e0e0" />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#f5f5f5", lineHeight: 1 }}
                  >
                    Configurare Lansare
                  </Typography>
                  <Typography sx={{ color: "#888", fontSize: "12px", mt: 0.5 }}>
                    Definește input-ul inițial pentru lanțul de agenți.
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                startIcon={<FileText size={13} />}
                onClick={() => setTemplatePickerOpen(true)}
                sx={{
                  alignSelf: "flex-start",
                  color: "#6366f1",
                  textTransform: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  mb: 0.5,
                  px: 1.5,
                  "&:hover": { bgcolor: "rgba(99,102,241,0.08)" },
                }}
              >
                Use Template
              </Button>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Introdu instrucțiunile aici..."
                value={initialInput}
                onChange={(e) => setInitialInput(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#e0e0e0",
                    bgcolor: "#0a0a0a",
                    fontSize: "14px",
                    fontFamily: '"Inter", sans-serif',
                    "& fieldset": { borderColor: "#242424" },
                    "&:hover fieldset": { borderColor: "#404040" },
                    "&.Mui-focused fieldset": { borderColor: "#e0e0e0" },
                  },
                }}
              />
              {}
              <Box sx={{ mt: 3 }}>
                <Button
                  size="small"
                  onClick={() => setShowKeys(!showKeys)}
                  sx={{
                    color: "#888",
                    textTransform: "none",
                    fontSize: "12px",
                    gap: 1,
                  }}
                >
                  <Key size={14} />{" "}
                  {showKeys
                    ? "Ascunde Chei API"
                    : "Configurează Chei API pentru această sesiune"}
                </Button>
                {showKeys && (
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      p: 2,
                      bgcolor: "#0a0a0a",
                      borderRadius: 2,
                      border: "1px solid #242424",
                    }}
                  >
                    <TextField
                      size="small"
                      type="password"
                      label="Google Gemini Key"
                      value={userApiKeys.googleKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUserApiKeys((prev) => ({ ...prev, googleKey: val }));
                        localStorage.setItem("googleKey", val);
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#e0e0e0",
                          "& fieldset": { borderColor: "#242424" },
                        },
                        "& .MuiInputLabel-root": { color: "#888" },
                      }}
                    />
                    <TextField
                      size="small"
                      type="password"
                      label="OpenAI Key"
                      value={userApiKeys.openaiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUserApiKeys((prev) => ({ ...prev, openaiKey: val }));
                        localStorage.setItem("openaiKey", val);
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#e0e0e0",
                          "& fieldset": { borderColor: "#242424" },
                        },
                        "& .MuiInputLabel-root": { color: "#888" },
                      }}
                    />
                    <TextField
                      size="small"
                      type="password"
                      label="Anthropic Key"
                      value={userApiKeys.anthropicKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUserApiKeys((prev) => ({
                          ...prev,
                          anthropicKey: val,
                        }));
                        localStorage.setItem("anthropicKey", val);
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#e0e0e0",
                          "& fieldset": { borderColor: "#242424" },
                        },
                        "& .MuiInputLabel-root": { color: "#888" },
                      }}
                    />
                  </Box>
                )}
              </Box>
              {}
              {isWaiting && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 3,
                    p: 2.5,
                    bgcolor: "rgba(245, 158, 11, 0.05)",
                    border: "1px solid #f59e0b",
                    borderRadius: 3,
                    animation: "fadeIn 0.4s ease-out",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        bgcolor: "#f59e0b",
                        borderRadius: 1.5,
                        display: "flex",
                      }}
                    >
                      <UserCheck size={18} color="#000" />
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          color: "#f59e0b",
                          fontWeight: 700,
                          fontSize: "14px",
                        }}
                      >
                        Așteptare Aprobare
                      </Typography>
                      <Typography sx={{ color: "#888", fontSize: "12px" }}>
                        Execuția este întreruptă. Introdu feedback sau confirmă
                        pentru a continua.
                      </Typography>
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Introdu instrucțiuni suplimentare sau lasă gol pentru a aproba output-ul curent..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#e0e0e0",
                        bgcolor: "#0d0d0d",
                        fontSize: "13px",
                        "& fieldset": {
                          borderColor: "rgba(245, 158, 11, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(245, 158, 11, 0.4)",
                        },
                        "&.Mui-focused fieldset": { borderColor: "#f59e0b" },
                      },
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleResume}
                    disabled={isStreaming}
                    sx={{
                      mt: 2,
                      bgcolor: "#f59e0b",
                      color: "#000",
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#fbbf24" },
                    }}
                  >
                    Confirmă și Continuă
                  </Button>
                </Paper>
              )}
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={handleRunWorkflow}
                disabled={isStreaming || !initialInput.trim() || isWaiting}
                startIcon={
                  isStreaming ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Send size={18} />
                  )
                }
                sx={{
                  mt: 3,
                  py: 1.5,
                  bgcolor: "#e0e0e0",
                  color: "#0a0a0a",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "14px",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#f5f5f5" },
                  "&.Mui-disabled": { bgcolor: "#242424", color: "#888" },
                }}
              >
                {isWaiting ? "Așteptare Aprobare..." : "Lansează Workflow"}
              </Button>
              <Divider sx={{ my: 3, borderColor: "#242424" }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <History size={14} color="#888" />
                <Typography
                  sx={{
                    color: "#888",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  Workflow Context
                </Typography>
              </Box>
              <Box
                sx={{
                  mt: 1.5,
                  p: 2,
                  bgcolor: "rgba(0,0,0,0.3)",
                  borderRadius: 2,
                  border: "1px solid #242424",
                }}
              >
                <Typography sx={{ color: "#a0a0a0", fontSize: "12px" }}>
                  Acest workflow conține{" "}
                  <strong>{workflow?.steps?.length || 0} pași</strong>. Fiecare
                  agent va prelucra output-ul celui anterior.
                </Typography>
              </Box>
            </Paper>
            {}
            {Object.keys(workflowMemory).length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mt: 3,
                  bgcolor: "#121212",
                  border: "1px solid #242424",
                  borderRadius: 3,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Cpu size={16} color="#fbbf24" />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "13px",
                      color: "#e0e0e0",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Workflow Memory
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    maxHeight: 400,
                    overflowY: "auto",
                    pr: 1,
                    "&::-webkit-scrollbar": { width: "4px" },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "#333",
                      borderRadius: "10px",
                    },
                  }}
                >
                  {Object.entries(workflowMemory).map(([key, value]) => (
                    <Box
                      key={key}
                      sx={{
                        p: 1.5,
                        bgcolor: "rgba(255,255,255,0.02)",
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "10px",
                          color: "#888",
                          fontWeight: 700,
                          mb: 0.5,
                        }}
                      >
                        {key.toUpperCase()}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#f1f5f9",
                          fontFamily: '"JetBrains Mono", monospace',
                          wordBreak: "break-all",
                        }}
                      >
                        {typeof value === "string"
                          ? value
                          : JSON.stringify(value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Terminal size={20} color="#888" />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#f5f5f5" }}
                >
                  Consolă Execuție
                </Typography>
              </Box>
              {isStreaming && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={12} sx={{ color: "#e0e0e0" }} />
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#e0e0e0",
                      fontWeight: 600,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    LIVE_STREAM
                  </Typography>
                </Box>
              )}
            </Box>
            {errorMsg && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  color: "#e57373",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                Eroare sistem: {errorMsg}
              </Alert>
            )}
            {!isStreaming &&
              streamLogs.length === 0 &&
              !finalResult &&
              !errorMsg && (
                <Box
                  sx={{
                    p: 8,
                    textAlign: "center",
                    border: "1px dashed #242424",
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.02)",
                  }}
                >
                  <Typography sx={{ color: "#888", fontSize: "14px" }}>
                    Așteptare comandă... Lansează workflow-ul pentru a vedea
                    log-urile.
                  </Typography>
                </Box>
              )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {streamLogs.map((log: any, index: number) => (
                <LogItem key={index} log={log} />
              ))}
            </Box>
            {}
            {Object.values(activeSteps).map((step, idx) => (
              <Box
                key={idx}
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "#0a0a0a",
                  border: "1px solid #1e293b",
                  borderLeft: "3px solid #3b82f6",
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <CircularProgress size={12} />
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#3b82f6",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    Agent: {step.agentName} (procesare...){" "}
                    {step.iteration && `[Iter #${step.iteration}]`}
                  </Typography>
                </Box>
                {currentChunk && Object.values(activeSteps).length === 1 ? (
                  <Box
                    sx={{
                      fontSize: "13px",
                      color: "#f1f5f9",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {currentChunk}
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontStyle: "italic",
                    }}
                  >
                    Gândește...
                  </Typography>
                )}
              </Box>
            ))}
            {}
            {finalResult && (
              <Box sx={{ animation: "fadeIn 0.5s ease-out", mt: 4 }}>
                <Box
                  sx={{
                    mb: 4,
                    p: 2,
                    bgcolor: "rgba(16, 185, 129, 0.05)",
                    border: "1px solid rgba(16, 185, 129, 0.1)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{ color: "#10b981", fontSize: "12px", fontWeight: 700 }}
                  >
                    EXECUȚIE FINALIZATĂ
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "#050505",
                    border: "1px solid #242424",
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "#e0e0e0",
                      fontFamily: '"JetBrains Mono", monospace',
                      mb: 2,
                    }}
                  >
                    {">"} REZULTAT FINAL:
                  </Typography>
                  <Box
                    sx={{
                      fontSize: "14px",
                      color: "#f5f5f5",
                      lineHeight: 1.6,
                      "& p": { mt: 0, mb: 2 },
                      "& pre": { m: 0, mb: 2, borderRadius: 2 },
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
                        code({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }: any) {
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
                      {finalResult}
                    </ReactMarkdown>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
        }}
      />
      {}
      <Dialog
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#121212",
            border: "1px solid #242424",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#f1f5f9",
            fontWeight: 700,
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Choose a Prompt Template
          <IconButton
            size="small"
            onClick={() => setTemplatePickerOpen(false)}
            sx={{ color: "#555" }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {!templates?.length ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "#555", fontSize: "13px" }}>
                No templates yet. Create one in the Templates page.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {(templates as any[]).map((t: any) => (
                <ListItemButton
                  key={t._id}
                  onClick={() => {
                    setInitialInput(t.content);
                    setTemplatePickerOpen(false);
                  }}
                  sx={{
                    borderBottom: "1px solid #1a1a1a",
                    "&:hover": { bgcolor: "rgba(99,102,241,0.06)" },
                    px: 3,
                    py: 1.5,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#e2e8f0",
                          fontSize: "13px",
                        }}
                      >
                        {t.title}
                      </Typography>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          mt: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        {t.tags?.map((tag: string) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: "9px",
                              bgcolor: "rgba(99,102,241,0.1)",
                              color: "#818cf8",
                            }}
                          />
                        ))}
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "11px",
                            color: "#475569",
                            display: "block",
                            mt: 0.5,
                          }}
                        >
                          {t.content.slice(0, 80)}
                          {t.content.length > 80 ? "…" : ""}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
