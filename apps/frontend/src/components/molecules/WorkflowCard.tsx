import { Workflow } from "@cross_brand/shared";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  Copy,
  Download,
  Layers,
  MoreVertical,
  Play,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../../utils/trpc";
interface WorkflowCardProps {
  workflow: Workflow & { _id: string };
}
export const WorkflowCard = ({ workflow }: WorkflowCardProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const ctx = trpc.useContext();
  const deleteMutation = trpc.workflow.delete.useMutation({
    onSuccess: () => {
      ctx.workflow.getAll.invalidate();
    },
  });
  const cloneMutation = trpc.workflow.clone.useMutation({
    onSuccess: () => {
      ctx.workflow.getAll.invalidate();
    },
  });
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    deleteMutation.mutate(workflow._id);
    handleClose();
  };
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    handleClose();
  };
  const handleClone = () => {
    cloneMutation.mutate({ workflowId: workflow._id });
    handleClose();
  };
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        bgcolor: "#121212",
        border: "1px solid #242424",
        borderRadius: 3,
        transition: "all 0.2s ease-in-out",
        opacity: deleteMutation.isPending ? 0.5 : 1,
        pointerEvents: deleteMutation.isPending ? "none" : "auto",
        "&:hover": {
          borderColor: "#404040",
          boxShadow: "0 10px 25px -10px rgba(0, 0, 0, 0.5)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Layers size={20} color="#e0e0e0" />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 700, color: "#f5f5f5", fontSize: "15px" }}
            >
              {workflow.name}
            </Typography>
            <Typography
              sx={{
                fontSize: "11px",
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {(workflow as any).nodes?.length > 0
                ? `${(workflow as any).nodes.filter((n: any) => n.type === "agent").length} NODURI AGENT`
                : `${workflow.steps?.length || 0} PAȘI CONFIGURAȚI`}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" sx={{ color: "#888" }} onClick={handleClick}>
          <MoreVertical size={16} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              bgcolor: "#121212",
              border: "1px solid #242424",
              mt: 1,
              "& .MuiMenuItem-root": {
                fontSize: "13px",
                color: "#e0e0e0",
                gap: 1.5,
                px: 2,
                py: 1,
                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
              },
            },
          }}
        >
          <MenuItem onClick={handleClone}>
            <Copy size={14} /> Clonează
          </MenuItem>
          <MenuItem onClick={handleExport}>
            <Download size={14} /> Exportă JSON
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "#e57373 !important" }}>
            <Trash2 size={14} /> Şterge Workflow
          </MenuItem>
        </Menu>
      </Box>
      {workflow.description && (
        <Typography
          sx={{
            fontSize: "12px",
            color: "#888",
            mb: 3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "3em",
          }}
        >
          {workflow.description}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<Play size={14} />}
          onClick={() => navigate(`/execute/${workflow._id}`)}
          sx={{
            bgcolor: "#e0e0e0",
            color: "#0a0a0a",
            "&:hover": { bgcolor: "#f5f5f5" },
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Lansează
        </Button>
      </Box>
    </Paper>
  );
};
