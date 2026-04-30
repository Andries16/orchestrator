import { CheckCircle2 } from "lucide-react";
import { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";
export const OutputNode = memo(({ selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: "10px 18px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        border: `1.5px solid ${selected ? "#818cf8" : "#312e81"}`,
        borderRadius: 24,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 4px 20px rgba(99,102,241,0.15)",
        minWidth: 120,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#818cf8",
          width: 10,
          height: 10,
          border: "2px solid #0f172a",
        }}
      />
      <CheckCircle2 size={16} color="#818cf8" />
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#818cf8",
          letterSpacing: "0.05em",
        }}
      >
        OUTPUT
      </span>
    </div>
  );
});
OutputNode.displayName = "OutputNode";
