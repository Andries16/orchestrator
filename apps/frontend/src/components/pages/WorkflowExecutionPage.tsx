import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  TextField, 
  Button, 
  Paper, 
  Divider, 
  CircularProgress, 
  Alert,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import { trpc } from '../../utils/trpc';
import { LogItem } from '../molecules/LogItem';
import { Play, Send, ChevronRight, History, Terminal } from 'lucide-react';

/**
 * Page: WorkflowExecutionPage
 * Interfața principală pentru rularea și monitorizarea workflow-urilor AI.
 */
export const WorkflowExecutionPage = ({ workflowId }: { workflowId: string }) => {
  const [initialInput, setInitialInput] = useState('');
  
  // Hook-ul pentru mutația de execuție tRPC
  const executeMutation = trpc.workflow.execute.useMutation();
  
  // Preluăm detaliile workflow-ului pentru context
  const { data: workflow } = trpc.workflow.getById.useQuery(workflowId);

  const handleRunWorkflow = () => {
    if (!initialInput.trim()) return;
    
    executeMutation.mutate({
      workflowId,
      initialInput
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs / Navigation */}
        <Breadcrumbs 
          separator={<ChevronRight size={14} color="#64748b" />} 
          sx={{ mb: 3 }}
        >
          <Link underline="none" color="#64748b" href="#" sx={{ fontSize: '12px', '&:hover': { color: '#22d3ee' } }}>
            Dashboard
          </Link>
          <Link underline="none" color="#64748b" href="#" sx={{ fontSize: '12px', '&:hover': { color: '#22d3ee' } }}>
            Workflows
          </Link>
          <Typography sx={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 600 }}>
            {workflow?.name || 'Execuție Workflow'}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          
          {/* Left Side: Input Panel */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={0} sx={{ 
              p: 3, 
              bgcolor: '#1e293b', 
              border: '1px solid #334155', 
              borderRadius: 3,
              position: 'sticky',
              top: 24
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ p: 1, bgcolor: 'rgba(34, 211, 238, 0.1)', borderRadius: 1.5 }}>
                  <Play size={20} color="#22d3ee" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
                    Configurare Lansare
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '12px', mt: 0.5 }}>
                    Definește input-ul inițial pentru lanțul de agenți.
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Introdu instrucțiunile aici... (ex: Scrie un articol despre viitorul AI în medicină)"
                value={initialInput}
                onChange={(e) => setInitialInput(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    bgcolor: '#0f172a',
                    fontSize: '14px',
                    fontFamily: '"Inter", sans-serif',
                    '& fieldset': { borderColor: '#334155' },
                    '&:hover fieldset': { borderColor: '#475569' },
                    '&.Mui-focused fieldset': { borderColor: '#22d3ee' },
                  },
                }}
              />

              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={handleRunWorkflow}
                disabled={executeMutation.isLoading || !initialInput.trim()}
                startIcon={executeMutation.isLoading ? <CircularProgress size={16} color="inherit" /> : <Send size={18} />}
                sx={{
                  mt: 3,
                  py: 1.5,
                  bgcolor: '#0891b2',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: 2,
                  boxShadow: '0 10px 15px -3px rgba(8, 145, 178, 0.3)',
                  '&:hover': { bgcolor: '#06b6d4' },
                  '&.Mui-disabled': { bgcolor: '#334155', color: '#64748b' }
                }}
              >
                {executeMutation.isLoading ? 'Se procesează...' : 'Rulează Workflow'}
              </Button>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History size={14} color="#64748b" />
                <Typography sx={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Workflow Context
                </Typography>
              </Box>
              <Box sx={{ mt: 1.5, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.03)' }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
                  Acest workflow conține <strong>{workflow?.steps?.length || 0} pași</strong>. 
                  Fiecare agent va prelucra output-ul celui anterior.
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Right Side: Execution Logs */}
          <Box sx={{ flex: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Terminal size={20} color="#64748b" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                  Consolă Execuție
                </Typography>
              </Box>
              {executeMutation.isLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={12} sx={{ color: '#22d3ee' }} />
                  <Typography sx={{ fontSize: '11px', color: '#22d3ee', fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>
                    LIVE_FEED
                  </Typography>
                </Box>
              )}
            </Box>

            {executeMutation.isError && (
              <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                Eroare sistem: {executeMutation.error.message}
              </Alert>
            )}

            {!executeMutation.data && !executeMutation.isLoading && (
              <Box sx={{ 
                p: 8, 
                textAlign: 'center', 
                border: '1px dashed #334155', 
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.01)'
              }}>
                <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
                  Așteptare comandă... Lansează workflow-ul pentru a vedea log-urile.
                </Typography>
              </Box>
            )}

            {/* Results Display */}
            {executeMutation.data && (
              <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
                <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                  <Typography sx={{ color: '#10b981', fontSize: '12px', fontWeight: 700 }}>
                    EXECUȚIE FINALIZATĂ
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {executeMutation.data.stepsSummary.map((log: any, index: number) => (
                    <LogItem key={index} log={log} />
                  ))}
                </Box>
                
                <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.05)' }} />

                <Paper elevation={0} sx={{ p: 3, bgcolor: '#020617', border: '1px solid #1e293b', borderRadius: 3 }}>
                  <Typography sx={{ fontSize: '14px', color: '#22d3ee', fontFamily: '"JetBrains Mono", monospace', mb: 2 }}>
                    {'>'} REZULTAT FINAL:
                  </Typography>
                  <Typography sx={{ color: '#f1f5f9', lineHeight: 1.6 }}>
                    {executeMutation.data.finalOutput}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </Box>
  );
};
