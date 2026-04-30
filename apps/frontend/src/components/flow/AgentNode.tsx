import { Bot, Calculator, Clock, Cpu, Search, Wrench } from "lucide-react";
import { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";
export interface AgentNodeData {
  label: string;
  agentName?: string;
  agentRole?: string;
  model?: string;
  isActive?: boolean;
  isComplete?: boolean;
  hasError?: boolean;
  waitForAll?: boolean;
  mergeContext?: boolean;
  tools?: string[];
  toggleTool?: (tool: string) => void;
  toggleJoin?: () => void;
  toggleMerge?: () => void;
}
export const AgentNode = memo(
  ({ data, selected }: NodeProps<AgentNodeData>) => {
    const borderColor = data.hasError
      ? "#ef4444"
      : data.isComplete
        ? "#10b981"
        : data.isActive
          ? "#3b82f6"
          : selected
            ? "#6366f1"
            : "#333";
    const glowColor = data.hasError
      ? "rgba(239,68,68,0.25)"
      : data.isComplete
        ? "rgba(16,185,129,0.25)"
        : data.isActive
          ? "rgba(59,130,246,0.25)"
          : "transparent";
    return (
      <div
        style={{
          minWidth: 200,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          border: `1.5px solid ${borderColor}`,
          borderRadius: 12,
          boxShadow: `0 0 0 ${data.isActive ? "3px" : "0px"} ${glowColor}, 0 8px 32px rgba(0,0,0,0.5)`,
          overflow: "hidden",
          transition: "box-shadow 0.3s ease, border-color 0.3s ease",
        }}
      >
        { }
        <div
          style={{
            padding: "10px 14px 8px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={14} color="#818cf8" />
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#f1f5f9",
                lineHeight: 1.2,
              }}
            >
              {data.agentName || data.label}
            </div>
            {data.agentRole && (
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                {data.agentRole}
              </div>
            )}
          </div>
        </div>
        { }
        <div
          style={{
            padding: "8px 14px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Cpu size={11} color="#475569" />
          <span
            style={{
              fontSize: 10,
              color: "#475569",
              fontFamily: '"JetBrains Mono", monospace',
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {data.model || "no model"}
          </span>
          {data.isActive && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 9,
                fontWeight: 700,
                color: "#3b82f6",
                background: "rgba(59,130,246,0.12)",
                padding: "2px 6px",
                borderRadius: 20,
                border: "1px solid rgba(59,130,246,0.25)",
              }}
            >
              LIVE
            </span>
          )}
          {data.isComplete && !data.isActive && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 9,
                fontWeight: 700,
                color: "#10b981",
                background: "rgba(16,185,129,0.12)",
                padding: "2px 6px",
                borderRadius: 20,
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              DONE
            </span>
          )}
        </div>
        { }
        {(data.tools?.length || selected) && (
          <div
            style={{
              padding: "8px 14px",
              background: "rgba(0,0,0,0.2)",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 9,
                color: "#818cf8",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              <Wrench size={10} />
              <span>Tools / Skills</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["calculator", "get_current_time", "web_search"].map((tool) => {
                const isActive = data.tools?.includes(tool);
                const Icon =
                  tool === "calculator"
                    ? Calculator
                    : tool === "web_search"
                      ? Search
                      : Clock;
                return (
                  <div
                    key={tool}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (data.toggleTool) data.toggleTool(tool);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: isActive
                        ? "rgba(129,140,248,0.2)"
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? "rgba(129,140,248,0.4)" : "rgba(255,255,255,0.05)"}`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <Icon size={10} color={isActive ? "#818cf8" : "#475569"} />
                    <span
                      style={{
                        fontSize: 9,
                        color: isActive ? "#e2e8f0" : "#475569",
                      }}
                    >
                      {tool.split("_").pop()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (data.toggleJoin) data.toggleJoin();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  fontSize: 9,
                  color: data.waitForAll ? "#fbbf24" : "#64748b",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    border: `1px solid ${data.waitForAll ? "#fbbf24" : "#475569"}`,
                    background: data.waitForAll ? "#fbbf24" : "transparent",
                  }}
                />
                <span>WAIT FOR ALL (JOIN)</span>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (data.toggleMerge) data.toggleMerge();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  fontSize: 9,
                  color: data.mergeContext !== false ? "#10b981" : "#64748b",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    border: `1px solid ${data.mergeContext !== false ? "#10b981" : "#475569"}`,
                    background:
                      data.mergeContext !== false ? "#10b981" : "transparent",
                  }}
                />
                <span>MERGE CONTEXT</span>
              </div>
            </div>
          </div>
        )}
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: "#6366f1",
            width: 10,
            height: 10,
            border: "2px solid #1e1b4b",
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: "#6366f1",
            width: 10,
            height: 10,
            border: "2px solid #1e1b4b",
          }}
        />
      </div>
    );
  },
);
AgentNode.displayName = "AgentNode";
