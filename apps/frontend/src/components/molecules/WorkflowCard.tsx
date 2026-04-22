import { useState } from 'react';
import { Box, Typography, Paper, IconButton, Button, Menu, MenuItem } from '@mui/material';
import { Workflow } from '@cross_brand/shared';
import { Play, Layers, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';

interface WorkflowCardProps {
  workflow: Workflow & { _id: string };
}

/**
 * Molecule: WorkflowCard
 * Afișează un workflow salvat și permite lansarea acestuia.
 */
export const WorkflowCard = ({ workflow }: WorkflowCardProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const ctx = trpc.useContext();
  
  const deleteMutation = trpc.workflow.delete.useMutation({
    onSuccess: () => {
      ctx.workflow.getAll.invalidate();
    }
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

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        bgcolor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 3,
        transition: 'all 0.2s ease-in-out',
        opacity: deleteMutation.isLoading ? 0.5 : 1,
        pointerEvents: deleteMutation.isLoading ? 'none' : 'auto',
        '&:hover': {
          borderColor: '#06b6d4',
          boxShadow: '0 10px 25px -10px rgba(6, 182, 212, 0.2)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            width: 36, height: 36, bgcolor: 'rgba(6, 182, 212, 0.1)', 
            borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Layers size={20} color="#06b6d4" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#f1f5f9', fontSize: '15px' }}>
              {workflow.name}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {workflow.steps?.length || 0} PAȘI CONFIGURAȚI
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
            <Trash2 size={14} /> Şterge Workflow
          </MenuItem>
        </Menu>
      </Box>

      {workflow.description && (
        <Typography sx={{ 
          fontSize: '12px', 
          color: '#94a3b8', 
          mb: 3, 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden',
          minHeight: '3em'
        }}>
          {workflow.description}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<Play size={14} />}
          onClick={() => navigate(`/execute/${workflow._id}`)}
          sx={{ 
            bgcolor: '#0891b2', 
            '&:hover': { bgcolor: '#06b6d4' },
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          Lansează
        </Button>
      </Box>
    </Paper>
  );
};
