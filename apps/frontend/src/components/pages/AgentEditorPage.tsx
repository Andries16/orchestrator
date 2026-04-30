import { useState, useEffect } from "react";
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
  Snackbar,
  FormHelperText,
} from "@mui/material";
import { trpc } from "../../utils/trpc";
import { Save, ArrowLeft, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgentSchema, Agent } from "@cross_brand/shared";
export const AgentEditorPage = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const createMutation = trpc.agent.create.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    },
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Agent>({
    resolver: zodResolver(AgentSchema),
    defaultValues: {
      name: "",
      role: "",
      model: "gemini-3-flash-preview",
      systemPrompt: "",
      temperature: 0.7,
      tools: [],
      maxRetries: 2,
      fallbackModel: undefined,
    },
  });
  const onSubmit = (data: Agent) => {
    createMutation.mutate(data as any);
  };
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a", py: 6 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: "#888",
              "&:hover": {
                color: "#e0e0e0",
                bgcolor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5f5f5" }}>
              Nou Agent AI
            </Typography>
            <Typography sx={{ color: "#888", fontSize: "14px" }}>
              Configurează identitatea și comportamentul unității tale AI.
            </Typography>
          </Box>
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: "#121212",
            border: "1px solid #242424",
            borderRadius: 3,
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nume Agent"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#e0e0e0",
                      "& fieldset": { borderColor: "#242424" },
                    },
                    "& .MuiInputLabel-root": { color: "#888" },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rol / Specializare"
                  {...register("role")}
                  error={!!errors.role}
                  helperText={errors.role?.message}
                  placeholder="ex: Traducător Engleză-Română"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#e0e0e0",
                      "& fieldset": { borderColor: "#242424" },
                    },
                    "& .MuiInputLabel-root": { color: "#888" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.model}>
                  <InputLabel sx={{ color: "#888" }}>Model LLM</InputLabel>
                  <Controller
                    name="model"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Model LLM"
                        sx={{
                          color: "#e0e0e0",
                          ".MuiOutlinedInput-notchedOutline": {
                            borderColor: "#242424",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#404040",
                          },
                        }}
                      >
                        <MenuItem value="gemini-3-flash-preview">
                          Gemini 3 Flash
                        </MenuItem>
                        <MenuItem value="gemini-3.1-pro-preview">
                          Gemini 3.1 Pro
                        </MenuItem>
                        <MenuItem value="gpt-4o">GPT-4o (OpenAI)</MenuItem>
                        <MenuItem value="gpt-3.5-turbo">
                          GPT-3.5 Turbo (OpenAI)
                        </MenuItem>
                        <MenuItem value="claude-3-5-sonnet-20241022">
                          Claude 3.5 Sonnet (Anthropic)
                        </MenuItem>
                        <MenuItem value="claude-3-opus-20240229">
                          Claude 3 Opus (Anthropic)
                        </MenuItem>
                      </Select>
                    )}
                  />
                  {errors.model && (
                    <FormHelperText>{errors.model.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Instrucțiuni de Sistem (System Prompt)"
                  {...register("systemPrompt")}
                  error={!!errors.systemPrompt}
                  helperText={errors.systemPrompt?.message}
                  placeholder="Ex: Ești un expert în traduceri tehnice. Păstrează tonul profesional..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#e0e0e0",
                      "& fieldset": { borderColor: "#242424" },
                    },
                    "& .MuiInputLabel-root": { color: "#888" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="temperature"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Typography
                        gutterBottom
                        sx={{ color: "#888", fontSize: "14px" }}
                      >
                        Temperatură (Creativitate): {value}
                      </Typography>
                      <Slider
                        value={value}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={(_, val) => onChange(val)}
                        sx={{ color: "#e0e0e0" }}
                      />
                    </>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#888" }}>
                    Unelte / Scule Disponibile (Opțional)
                  </InputLabel>
                  <Controller
                    name="tools"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        multiple
                        label="Unelte / Scule Disponibile (Opțional)"
                        sx={{
                          color: "#e0e0e0",
                          ".MuiOutlinedInput-notchedOutline": {
                            borderColor: "#242424",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#404040",
                          },
                        }}
                      >
                        <MenuItem value="calculator">
                          Calculator (Evaluare Expresii Matematice)
                        </MenuItem>
                        <MenuItem value="get_current_time">
                          Ceas (Obține ora exactă)
                        </MenuItem>
                        <MenuItem value="web_search">
                          Web Search (Căutare Informații Online)
                        </MenuItem>
                      </Select>
                    )}
                  />
                  <FormHelperText sx={{ color: "#888" }}>
                    Agentul va putea apela aceste funcții pe parcursul execuției
                    dacă modelul suportă Function Calling.
                  </FormHelperText>
                </FormControl>
              </Grid>
              {}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="maxRetries"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Typography
                        gutterBottom
                        sx={{ color: "#888", fontSize: "14px" }}
                      >
                        Reîncercări la Eroare: {value}
                      </Typography>
                      <Slider
                        value={value}
                        min={0}
                        max={5}
                        step={1}
                        marks
                        onChange={(_, val) => onChange(val)}
                        sx={{ color: "#f59e0b" }}
                      />
                    </>
                  )}
                />
              </Grid>
              {}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#888" }}>
                    Model Fallback (Opțional)
                  </InputLabel>
                  <Controller
                    name="fallbackModel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value || ""}
                        label="Model Fallback (Opțional)"
                        sx={{
                          color: "#e0e0e0",
                          ".MuiOutlinedInput-notchedOutline": {
                            borderColor: "#242424",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#404040",
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>Niciunul</em>
                        </MenuItem>
                        <MenuItem value="gemini-3-flash-preview">
                          Gemini 3 Flash
                        </MenuItem>
                        <MenuItem value="gemini-3.1-pro-preview">
                          Gemini 3.1 Pro
                        </MenuItem>
                        <MenuItem value="gpt-4o">GPT-4o (OpenAI)</MenuItem>
                        <MenuItem value="gpt-3.5-turbo">
                          GPT-3.5 Turbo (OpenAI)
                        </MenuItem>
                        <MenuItem value="claude-3-5-sonnet-20241022">
                          Claude 3.5 Sonnet
                        </MenuItem>
                        <MenuItem value="claude-3-opus-20240229">
                          Claude 3 Opus
                        </MenuItem>
                      </Select>
                    )}
                  />
                  <FormHelperText sx={{ color: "#888" }}>
                    Dacă modelul principal eșuează toate reîncercările, se va
                    folosi acest model.
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  startIcon={<Bot size={18} />}
                  disabled={createMutation.isPending}
                  sx={{
                    bgcolor: "#e0e0e0",
                    color: "#0a0a0a",
                    "&:hover": { bgcolor: "#f5f5f5" },
                    py: 1.5,
                    fontWeight: 700,
                  }}
                >
                  Creează Agent
                </Button>
              </Grid>
            </Grid>
          </form>
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
