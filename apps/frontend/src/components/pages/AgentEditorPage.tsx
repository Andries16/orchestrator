import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  TextField, 
  Button, 
  Paper, 
  IconButton, 
  Grid,
  Slider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar
} from '@mui/material';
import { trpc } from '../../utils/trpc';
import { Save, ArrowLeft, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Page: AgentEditorPage
 * Permite crearea unui nou Agent AI.
 */
export const AgentEditorPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [model, setModel] = useState('gemini-3-flash-preview');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [showSuccess, setShowSuccess] = useState(false);

  const createMutation = trpc.agent.create.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    }
  });

  const handleSave = () => {
    if (!name || !role || !systemPrompt) return;
    
    createMutation.mutate({
      name,
      role,
      model: model as any,
      systemPrompt,
      temperature
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', py: 6 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#64748b' }}>
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>
              Nou Agent AI
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
              Configurează identitatea și comportamentul unității tale AI.
            </Typography>
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: 4, bgcolor: '#1e293b', border: '1px solid #334155', borderRadius: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nume Agent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { color: '#f1f5f9', '& fieldset': { borderColor: '#334155' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rol / Specializare"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="ex: Traducător Engleză-Română"
                sx={{ '& .MuiOutlinedInput-root': { color: '#f1f5f9', '& fieldset': { borderColor: '#334155' } } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#64748b' }}>Model LLM</InputLabel>
                <Select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  sx={{ color: '#f1f5f9', '.MuiOutlinedInput-notchedOutline': { borderColor: '#334155' } }}
                >
                  <MenuItem value="gemini-3-flash-preview">Gemini 3 Flash</MenuItem>
                  <MenuItem value="gemini-3.1-pro-preview">Gemini 3.1 Pro</MenuItem>
                  <MenuItem value="gpt-4o">GPT-4o</MenuItem>
                  <MenuItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Instrucțiuni de Sistem (System Prompt)"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Ex: Ești un expert în traduceri tehnice. Păstrează tonul profesional..."
                sx={{ '& .MuiOutlinedInput-root': { color: '#f1f5f9', '& fieldset': { borderColor: '#334155' } } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom sx={{ color: '#94a3b8', fontSize: '14px' }}>
                Temperatură (Creativitate): {temperature}
              </Typography>
              <Slider
                value={temperature}
                min={0}
                max={1}
                step={0.1}
                onChange={(_, val) => setTemperature(val as number)}
                sx={{ color: '#22d3ee' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Bot size={18} />}
                onClick={handleSave}
                disabled={!name || !role || !systemPrompt || createMutation.isLoading}
                sx={{ bgcolor: '#0891b2', '&:hover': { bgcolor: '#06b6d4' }, py: 1.5, fontWeight: 700 }}
              >
                Creează Agent
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Snackbar 
          open={showSuccess} 
          autoHideDuration={3000} 
          onClose={() => setShowSuccess(false)}
          message="Agent creat cu succes!"
        />
      </Container>
    </Box>
  );
};
