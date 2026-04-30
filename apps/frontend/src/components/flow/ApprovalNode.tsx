import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Box, Typography, Paper } from "@mui/material";
import { UserCheck } from "lucide-react";
export const ApprovalNode = memo(({ data }: any) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        minWidth: 160,
        bgcolor: "#121212",
        border: "2px solid #f59e0b",
        borderRadius: 3,
        boxShadow: "0 0 15px rgba(245, 158, 11, 0.1)",
        position: "relative",
        "&:hover": {
          borderColor: "#fbbf24",
          boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#f59e0b", width: 8, height: 8 }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Box
          sx={{
            p: 0.8,
            bgcolor: "rgba(245, 158, 11, 0.1)",
            borderRadius: 1.5,
            display: "flex",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <UserCheck size={14} color="#f59e0b" />
        </Box>
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#f5f5f5",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          User Approval
        </Typography>
      </Box>
      <Typography
        sx={{ fontSize: "11px", color: "#64748b", fontStyle: "italic" }}
      >
        Pauses execution until you approve or provide input.
      </Typography>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#f59e0b", width: 8, height: 8 }}
      />
    </Paper>
  );
});
