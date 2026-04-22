import { Box, Typography, Grid, CircularProgress, Alert, Button } from '@mui/material';
import { trpc } from '../../utils/trpc';
import { WorkflowCard } from '../molecules/WorkflowCard';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

/**
 * Organism: WorkflowsList
 * Gestionează preluarea listei de workflow-uri și afișarea acestora.
 */
export const WorkflowsList = () => {
  const navigate = useNavigate();
  const { data: workflows, isLoading, error } = trpc.workflow.getAll.useQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress size={32} sx={{ color: '#06b6d4' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
        Eroare la încărcarea workflow-urilor: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
            Workflows Salvate
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
            Automate processing sequences
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<Plus size={16} />}
          onClick={() => navigate('/editor')}
          sx={{ 
            color: '#06b6d4', 
            borderColor: '#334155',
            '&:hover': { borderColor: '#06b6d4', bgcolor: 'rgba(6, 182, 212, 0.05)' }
          }}
        >
          Creează Workflow
        </Button>
      </Box>

      {workflows && workflows.length > 0 ? (
        <Grid container spacing={3}>
          {workflows.map((workflow) => (
            <Grid item xs={12} sm={6} md={4} key={workflow._id}>
              <WorkflowCard workflow={workflow as any} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ p: 6, textAlign: 'center', border: '1px dashed #334155', borderRadius: 3 }}>
          <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
            Nu ai creat încă niciun workflow. Folosește agenții pentru a automatiza fluxuri complexe.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
