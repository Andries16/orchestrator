import { Settings, SettingsSchema } from "@cross_brand/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ArrowLeft, Key, Save, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { trpc } from "../../utils/trpc";
export const SettingsPage = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: settings } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => setShowSuccess(true),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Settings>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      openaiKey: "",
      anthropicKey: "",
      googleKey: "",
    },
  });
  useEffect(() => {
    if (settings) {
      reset({
        openaiKey: settings.openaiKey || "",
        anthropicKey: settings.anthropicKey || "",
        googleKey: settings.googleKey || "",
      });
    }
  }, [settings, reset]);
  const onSubmit = (data: Settings) => {
    updateMutation.mutate(data);
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
              Setări Aplicație
            </Typography>
            <Typography sx={{ color: "#888", fontSize: "14px" }}>
              Configurează cheile API pentru furnizorii de modele LLM.
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Shield size={20} color="#e0e0e0" />
            <Typography variant="h6" sx={{ color: "#e0e0e0", fontWeight: 600 }}>
              Chei API (API Keys)
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "#242424", mb: 4 }} />
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Key
                    size={20}
                    color="#10a37f"
                    style={{ marginTop: "20px" }}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="OpenAI API Key"
                    {...register("openaiKey")}
                    error={!!errors.openaiKey}
                    helperText={errors.openaiKey?.message}
                    placeholder="sk-..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#e0e0e0",
                        "& fieldset": { borderColor: "#242424" },
                      },
                      "& .MuiInputLabel-root": { color: "#888" },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Key
                    size={20}
                    color="#d97757"
                    style={{ marginTop: "20px" }}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Anthropic API Key"
                    {...register("anthropicKey")}
                    error={!!errors.anthropicKey}
                    helperText={errors.anthropicKey?.message}
                    placeholder="sk-ant-..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#e0e0e0",
                        "& fieldset": { borderColor: "#242424" },
                      },
                      "& .MuiInputLabel-root": { color: "#888" },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Key
                    size={20}
                    color="#4285f4"
                    style={{ marginTop: "20px" }}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Google Gemini API Key"
                    {...register("googleKey")}
                    error={!!errors.googleKey}
                    helperText={errors.googleKey?.message}
                    placeholder="AIza..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#e0e0e0",
                        "& fieldset": { borderColor: "#242424" },
                      },
                      "& .MuiInputLabel-root": { color: "#888" },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save size={18} />}
                  disabled={updateMutation.isPending}
                  sx={{
                    bgcolor: "#3a3a3a",
                    color: "#e0e0e0",
                    "&:hover": { bgcolor: "#4a4a4a" },
                    py: 1.5,
                    px: 4,
                    fontWeight: 600,
                  }}
                >
                  Salvează Setările
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          message="Setări salvate cu succes!"
        />
      </Container>
    </Box>
  );
};
