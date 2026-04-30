import { PlayCircle } from "lucide-react";
import { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";
export const InputNode = memo(({ selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: "10px 18px",
        background: "linear-gradient(135deg, #052e16 0%, #064e3b 100%)",
        border: `1.5px solid ${selected ? "#34d399" : "#065f46"}`,
        borderRadius: 24,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 4px 20px rgba(16,185,129,0.15)",
        minWidth: 120,
      }}
    >
      <PlayCircle size={16} color="#34d399" />
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#34d399",
          letterSpacing: "0.05em",
        }}
      >
        START
      </span>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#34d399",
          width: 10,
          height: 10,
          border: "2px solid #052e16",
        }}
      />
    </div>
  );
});
InputNode.displayName = "InputNode";
