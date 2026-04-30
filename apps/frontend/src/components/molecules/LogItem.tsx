import { ExecutionLog } from "@cross_brand/shared";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { ArrowRight, CornerDownRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { StatusBadge } from "../atoms/StatusBadge";
interface LogItemProps {
  log: ExecutionLog;
}
export const LogItem = ({ log }: LogItemProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
        <StatusBadge status={log.status === "success" ? "success" : "error"} />
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "11px",
            color: "#64748b",
          }}
        >
          Execuție Agent: {log.agentId.slice(-6)}...{" "}
          {(log as any).iteration && `(Iter #${(log as any).iteration})`}
        </Typography>
      </Box>
      { }
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: "#0f172a",
          border: "1px solid #1e293b",
          borderLeft: "3px solid #64748b",
          borderRadius: "0 8px 8px 0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <CornerDownRight size={14} color="#64748b" />
          <Typography
            sx={{
              fontSize: "10px",
              color: "#64748b",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Input
          </Typography>
        </Box>
        <Typography
          sx={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "pre-wrap" }}
        >
          {log.input}
        </Typography>
      </Paper>
      { }
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: "rgba(34, 211, 238, 0.03)",
          border: "1px solid rgba(34, 211, 238, 0.1)",
          borderLeft: "3px solid #22d3ee",
          borderRadius: "0 8px 8px 0",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <ArrowRight size={14} color="#22d3ee" />
          <Typography
            sx={{
              fontSize: "10px",
              color: "#22d3ee",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Output
          </Typography>
        </Box>
        <Box
          sx={{
            fontSize: "13px",
            color: "#f1f5f9",
            lineHeight: 1.6,
            "& p": { mt: 0, mb: 1.5, "&:last-child": { mb: 0 } },
            "& pre": {
              m: 0,
              mb: 1.5,
              borderRadius: 1,
              "&:last-child": { mb: 0 },
            },
            "& a": { color: "#22d3ee" },
            "& ul, & ol": { mt: 0, mb: 1.5, pl: 3 },
            "& code": {
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "12px",
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
            {log.output}
          </ReactMarkdown>
        </Box>
      </Paper>
    </Box>
  );
};
