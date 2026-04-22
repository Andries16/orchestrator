import { useState } from 'react';
import { Box, Typography, Paper, IconButton, Menu, MenuItem } from '@mui/material';
import { Agent } from '@cross_brand/shared';
import { Cpu, Terminal, MoreVertical, Trash2 } from 'lucide-react';
import { trpc } from '../../utils/trpc';

interface AgentCardProps {
  agent: Agent & { _id: string };
}

/**
 * Molecule: AgentCard
 * Afișează unitatea AI într-un format compact tip "hardware node".
 */
export const AgentCard = ({ agent }: AgentCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const ctx = trpc.useContext();
  
  const deleteMutation = trpc.agent.delete.useMutation({
    onSuccess: () => {
      ctx.agent.getAll.invalidate();
    }
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
        bgcolor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 2,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)',
        transition: 'all 0.2s',
        opacity: deleteMutation.isLoading ? 0.5 : 1,
        pointerEvents: deleteMutation.isLoading ? 'none' : 'auto',
        '&:hover': {
          borderColor: '#22d3ee',
          boxShadow: '0 8px 24px -12px rgba(34, 211, 238, 0.3)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            p: 1, bgcolor: 'rgba(34, 211, 238, 0.1)', borderRadius: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Terminal size={18} color="#22d3ee" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
              {agent.name}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {agent.role}
            </Typography>
          </Box>
        </Box>
        
        <IconButton size="small" sx={{ color: '#64748b' }} onClick={handleClick}>
          <MoreVertical size={16} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              bgcolor: '#0f172a',
              border: '1px solid #334155',
              mt: 1,
              '& .MuiMenuItem-root': {
                fontSize: '13px',
                color: '#f1f5f9',
                gap: 1.5,
                px: 2,
                py: 1
              }
            }
          }}
        >
          <MenuItem onClick={handleDelete} sx={{ color: '#f87171 !important' }}>
            <Trash2 size={14} /> Şterge Agent
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        p: 1.5, 
        bgcolor: 'rgba(0,0,0,0.2)', 
        borderRadius: 1.5 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Cpu size={14} color="#64748b" />
          <Typography sx={{ 
            fontFamily: '"JetBrains Mono", monospace', 
            fontSize: '11px', 
            color: '#94a3b8' 
          }}>
            {agent.model}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
