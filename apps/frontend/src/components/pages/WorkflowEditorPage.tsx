import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  TextField, 
  Button, 
  Paper, 
  IconButton, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Grid,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { trpc } from '../../utils/trpc';
import { Plus, Trash2, MoveUp, MoveDown, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkflowStep {
  order: number;
  agentId: string;
}

/**
 * Page: WorkflowEditorPage
 * Permite utilizatorilor să creeze și să configureze secvențe de agenți AI (Workflows).
 */
export const WorkflowEditorPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Preluăm agenții disponibili pentru a-i putea selecta în pași
  const { data: agents } = trpc.agent.getAll.useQuery();
  
  // Mutația pentru crearea workflow-ului
  const createMutation = trpc.workflow.create.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    }
  });

  const addStep = () => {
    setSteps([...steps, { order: steps.length + 1, agentId: '' }]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      order: i + 1
    }));
    setSteps(newSteps);
  };

  const updateStepAgent = (index: number, agentId: string) => {
    const newSteps = [...steps];
    newSteps[index].agentId = agentId;
    setSteps(newSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const newSteps = [...steps];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]];
    
    // Recalculăm ordinea
    const reorderedSteps = newSteps.map((step, i) => ({ ...step, order: i + 1 }));
    setSteps(reorderedSteps);
  };

  const handleSave = () => {
    if (!name || steps.length === 0 || steps.some(s => !s.agentId)) return;
    
    createMutation.mutate({
      name,
      description,
      steps,
      status: 'active'
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', py: 6 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: '#64748b', bgcolor: 'rgba(255,255,255,0.02)' }}>
              <ArrowLeft size={20} />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                Editor Workflow
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
                Definește secvența de procesare logica folosind agenți specializați.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Save size={18} />}
            onClick={handleSave}
            disabled={!name || steps.length === 0 || steps.some(s => !s.agentId) || createMutation.isLoading}
            sx={{ 
              bgcolor: '#0891b2', 
              '&:hover': { bgcolor: '#06b6d4' },
              fontWeight: 700,
              px: 3
            }}
          >
            Salvează Workflow
          </Button>
        </Box>

        {/* Formular Detalii */}
        <Paper elevation={0} sx={{ p: 4, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nume Workflow"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Traducere și Analiză Sentiment"
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: '#f1f5f9', '& fieldset': { borderColor: '#334155' } },
                  '& .MuiInputLabel-root': { color: '#64748b' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descriere"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: '#f1f5f9', '& fieldset': { borderColor: '#334155' } },
                  '& .MuiInputLabel-root': { color: '#64748b' }
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Listă Pași */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
            Secvență Execuție
          </Typography>
          <Button 
            startIcon={<Plus size={16} />}
            onClick={addStep}
            sx={{ color: '#22d3ee', textTransform: 'none', fontWeight: 600 }}
          >
            Adaugă Pas
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {steps.map((step, index) => (
            <Paper 
              key={index}
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: '#0f172a', 
                border: '1px solid #334155', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': { borderColor: '#475569' }
              }}
            >
              <Box sx={{ 
                width: 32, height: 32, bgcolor: '#334155', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8', fontWeight: 800, fontSize: '14px'
              }}>
                {step.order}
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#64748b' }}>Selectează Agent</InputLabel>
                <Select
                  value={step.agentId}
                  label="Selectează Agent"
                  onChange={(e) => updateStepAgent(index, e.target.value)}
                  sx={{ 
                    color: '#f1f5f9', 
                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' }
                  }}
                >
                  {agents?.map(agent => (
                    <MenuItem key={agent._id} value={agent._id}>
                      {agent.name} ({agent.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton 
                  size="small" 
                  disabled={index === 0} 
                  onClick={() => moveStep(index, 'up')}
                  sx={{ color: '#64748b' }}
                >
                  <MoveUp size={16} />
                </IconButton>
                <IconButton 
                  size="small" 
                  disabled={index === steps.length - 1} 
                  onClick={() => moveStep(index, 'down')}
                  sx={{ color: '#64748b' }}
                >
                  <MoveDown size={16} />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => removeStep(index)}
                  sx={{ color: '#f87171', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            </Paper>
          ))}

          {steps.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #334155', borderRadius: 2 }}>
              <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
                Niciun pas definit. Adaugă un agent pentru a începe fluxul.
              </Typography>
            </Box>
          )}
        </Box>

        {createMutation.isError && (
          <Alert severity="error" sx={{ mt: 4, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
            Eroare: {createMutation.error.message}
          </Alert>
        )}

        <Snackbar 
          open={showSuccess} 
          autoHideDuration={3000} 
          onClose={() => setShowSuccess(false)}
          message="Workflow salvat cu succes!"
        />
      </Container>
    </Box>
  );
};
