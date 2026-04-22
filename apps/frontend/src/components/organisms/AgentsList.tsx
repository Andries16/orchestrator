import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { trpc } from '../../utils/trpc';
import { AgentCard } from '../molecules/AgentCard';

/**
 * Organism: AgentsList
 * Gestionează preluarea datelor despre agenți și afișarea lor într-o grilă responsivă.
 * Implementează stări de încărcare, eroare și lipsă date.
 */
export const AgentsList = () => {
  // Preluare date prin tRPC
  const { data: agents, isLoading, error } = trpc.agent.getAll.useQuery();

  // Stare de încărcare (Loading)
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 10,
        gap: 2
      }}>
        <CircularProgress size={40} sx={{ color: '#22d3ee' }} thickness={4} />
        <Typography sx={{ 
          fontFamily: '"JetBrains Mono", monospace', 
          fontSize: '12px', 
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          Sincronizare Unități AI...
        </Typography>
      </Box>
    );
  }

  // Stare de eroare
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          bgcolor: 'rgba(239, 68, 68, 0.05)', 
          color: '#f87171', 
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 2
        }}
      >
        Eroare de comunicare cu nucleul: {error.message}
      </Alert>
    );
  }

  // Stare listă goală
  if (!agents || agents.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        p: 8, 
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px dashed #334155', 
        borderRadius: 3 
      }}>
        <Typography sx={{ color: '#64748b', fontSize: '14px', mb: 1 }}>
          Nicio unitate AI detectată în orchestrator.
        </Typography>
        <Typography sx={{ color: '#475569', fontSize: '12px' }}>
          Inițializează un nou agent pentru a începe construcția workflow-ului.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
          Unități Active
        </Typography>
        <Typography sx={{ 
          fontFamily: '"JetBrains Mono", monospace', 
          fontSize: '11px', 
          color: '#22d3ee',
          bgcolor: 'rgba(34, 211, 238, 0.1)',
          px: 1, py: 0.2,
          borderRadius: 1
        }}>
          COUNT: {agents.length}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {agents.map((agent) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={agent._id}>
            <AgentCard agent={agent as any} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
