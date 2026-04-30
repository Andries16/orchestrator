import { Agent } from "@cross_brand/shared";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Cpu, MoreVertical, Terminal, Trash2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
interface AgentCardProps {
  agent: Agent & { _id: string };
}
export const AgentCard = ({ agent }: AgentCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const ctx = trpc.useContext();
  const deleteMutation = trpc.agent.delete.useMutation({
    onSuccess: () => {
      ctx.agent.getAll.invalidate();
    },
  });
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    deleteMutation.mutate(agent._id);
    handleClose();
  };
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: "#121212",
        border: "1px solid #242424",
        borderRadius: 2,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)",
        transition: "all 0.2s",
        opacity: deleteMutation.isPending ? 0.5 : 1,
        pointerEvents: deleteMutation.isPending ? "none" : "auto",
        "&:hover": {
          borderColor: "#404040",
          boxShadow: "0 8px 24px -12px rgba(0, 0, 0, 0.5)",
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
              p: 1,
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Terminal size={18} color="#e0e0e0" />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#f5f5f5", lineHeight: 1.2 }}
            >
              {agent.name}
            </Typography>
            <Typography
              sx={{
                fontSize: "11px",
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {agent.role}
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
          <MenuItem onClick={handleDelete} sx={{ color: "#e57373 !important" }}>
            <Trash2 size={14} /> Şterge Agent
          </MenuItem>
        </Menu>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 1.5,
          bgcolor: "rgba(0,0,0,0.3)",
          borderRadius: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Cpu size={14} color="#888" />
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "11px",
              color: "#a0a0a0",
            }}
          >
            {agent.model}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
