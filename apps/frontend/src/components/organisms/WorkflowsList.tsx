import { useState, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { trpc } from "../../utils/trpc";
import { WorkflowCard } from "../molecules/WorkflowCard";
import { useNavigate } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
export const WorkflowsList = () => {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState("");
  const { data: workflows, isLoading, error } = trpc.workflow.getAll.useQuery();
  const createMutation = trpc.workflow.create.useMutation({
    onSuccess: () => {
      utils.workflow.getAll.invalidate();
      setImportMsg("Workflow imported successfully!");
    },
    onError: (e) => setImportMsg(`Import failed: ${e.message}`),
  });
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const { _id, __v, createdAt, updatedAt, ...data } = json;
        createMutation.mutate({
          ...data,
          name: data.name ? `${data.name} (imported)` : "Imported Workflow",
        });
      } catch {
        setImportMsg("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress size={32} sx={{ color: "#e0e0e0" }} />
      </Box>
    );
  if (error)
    return (
      <Alert
        severity="error"
        sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", color: "#e57373" }}
      >
        Eroare: {error.message}
      </Alert>
    );
  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#f5f5f5" }}>
            Workflows Salvate
          </Typography>
          <Typography
            sx={{ color: "#888", fontSize: "11px", textTransform: "uppercase" }}
          >
            Automate processing sequences
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <Tooltip title="Import workflow from JSON">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Upload size={14} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={createMutation.isPending}
              sx={{
                color: "#888",
                borderColor: "#2a2a2a",
                textTransform: "none",
                fontSize: "12px",
                "&:hover": {
                  borderColor: "#6366f1",
                  color: "#818cf8",
                  bgcolor: "rgba(99,102,241,0.06)",
                },
              }}
            >
              Import
            </Button>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => navigate("/editor")}
            sx={{
              color: "#e0e0e0",
              borderColor: "#242424",
              "&:hover": {
                borderColor: "#e0e0e0",
                bgcolor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            Creează Workflow
          </Button>
        </Box>
      </Box>
      {workflows && workflows.length > 0 ? (
        <Grid container spacing={3}>
          {workflows.map((workflow) => (
            <Grid item xs={12} sm={6} md={4} key={String(workflow._id)}>
              <WorkflowCard workflow={workflow as any} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px dashed #242424",
            borderRadius: 3,
          }}
        >
          <Typography sx={{ color: "#888", fontSize: "14px" }}>
            Nu ai creat încă niciun workflow. Folosește agenții pentru a
            automatiza fluxuri complexe.
          </Typography>
        </Box>
      )}
      <Snackbar
        open={!!importMsg}
        autoHideDuration={4000}
        onClose={() => setImportMsg("")}
        message={importMsg}
      />
    </Box>
  );
};
