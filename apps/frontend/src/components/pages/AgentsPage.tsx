import { Box, Typography, Container, AppBar, Toolbar, Button, IconButton, Divider } from '@mui/material';
import { AgentsList } from '../organisms/AgentsList';
import { WorkflowsList } from '../organisms/WorkflowsList';
import { Terminal, Plus, Settings, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Page: AgentsPage
 * Pagina principală de administrare a agenților AI și Workflow-urilor.
 */
export const AgentsPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a' }}>
      {/* AppBar High Density */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(2, 6, 23, 0.8)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 64, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 32, height: 32, bgcolor: '#06b6d4', borderRadius: '6px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
              }}>
                <Terminal size={18} color="#fff" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  orchestrator
                </Typography>
                <Typography sx={{ 
                  fontFamily: '"JetBrains Mono", monospace', 
                  fontSize: '9px', 
                  color: '#64748b',
                  textTransform: 'uppercase',
                  mt: 0.5
                }}>
                  Core Interface v0.1.0
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                startIcon={<Plus size={16} />}
                variant="outlined" 
                onClick={() => navigate('/agent-editor')}
                sx={{ 
                  color: '#94a3b8', 
                  borderColor: '#334155',
                  fontSize: '12px', 
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  '&:hover': { borderColor: '#475569', bgcolor: 'rgba(255,255,255,0.02)' }
                }}
              >
                Nou Agent
              </Button>
              <Button 
                startIcon={<Plus size={16} />}
                variant="contained" 
                onClick={() => navigate('/editor')}
                sx={{ 
                  bgcolor: '#0891b2', 
                  fontSize: '12px', 
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  '&:hover': { bgcolor: '#06b6d4' }
                }}
              >
                Nou Workflow
              </Button>
              <IconButton sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' } }}>
                <Activity size={18} />
              </IconButton>
              <IconButton sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' } }}>
                <Settings size={18} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section / Page Header */}
      <Box sx={{ 
        py: 6, 
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.03) 0%, transparent 100%)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
              Management Orchestrazie
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '14px', maxWidth: '600px' }}>
              Gestionează unitățile AI și definește fluxuri de execuție complexe. 
              Fiecare workflow reprezintă un lanț logic de procesare.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <WorkflowsList />
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)' }} />
          <AgentsList />
        </Box>
      </Container>

      {/* Footer System Status */}
      <Box sx={{ 
        mt: 'auto',
        py: 1.5,
        bgcolor: '#020617',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        px: 4,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: '#475569' }}>
          SYSTEM_NODE: active | LATENCY: 24ms
        </Typography>
        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: '#10b981' }}>
          DB_STATUS: SYNCHRONIZED
        </Typography>
      </Box>
    </Box>
  );
};
