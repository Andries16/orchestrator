import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  ArrowLeft,
  Check,
  Copy,
  Edit2,
  FileText,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../../utils/trpc";
const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;
const extractVariables = (content: string): string[] => {
  const found: string[] = [];
  let match;
  while ((match = VARIABLE_REGEX.exec(content)) !== null) {
    if (!found.includes(match[1])) found.push(match[1]);
  }
  return found;
};
export const TemplatesPage = () => {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [snackMsg, setSnackMsg] = useState("");
  const { data: templates, isLoading } = trpc.template.getAll.useQuery();
  const createMutation = trpc.template.create.useMutation({
    onSuccess: () => {
      utils.template.getAll.invalidate();
      closeDialog();
      setSnackMsg("Template saved!");
    },
  });
  const updateMutation = trpc.template.update.useMutation({
    onSuccess: () => {
      utils.template.getAll.invalidate();
      closeDialog();
      setSnackMsg("Template updated!");
    },
  });
  const deleteMutation = trpc.template.delete.useMutation({
    onSuccess: () => {
      utils.template.getAll.invalidate();
      setSnackMsg("Template deleted.");
    },
  });
  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
    setEditOpen(true);
  };
  const openEdit = (t: any) => {
    setEditingId(t._id);
    setTitle(t.title);
    setContent(t.content);
    setTags(t.tags || []);
    setTagInput("");
    setEditOpen(true);
  };
  const closeDialog = () => setEditOpen(false);
  const onSave = () => {
    if (!title.trim() || !content.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { title, content, tags } });
    } else {
      createMutation.mutate({ title, content, tags });
    }
  };
  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags((prev) => [...new Set([...prev, tagInput.trim()])]);
      setTagInput("");
    }
  };
  const copyContent = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const isSaving = createMutation.isPending || updateMutation.isPending;
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a", py: 6 }}>
      <Container maxWidth="lg">
        { }
        <Box
          sx={{
            mb: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => navigate("/")}
              sx={{
                color: "#555",
                "&:hover": {
                  color: "#e0e0e0",
                  bgcolor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              <ArrowLeft size={20} />
            </IconButton>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#f5f5f5",
                  letterSpacing: "-0.03em",
                }}
              >
                Prompt Templates
              </Typography>
              <Typography sx={{ color: "#555", fontSize: "13px", mt: 0.5 }}>
                Reusable prompt snippets with {"{{variable}}"} substitution.
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<Plus size={16} />}
            variant="contained"
            onClick={openCreate}
            sx={{
              bgcolor: "#6366f1",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            New Template
          </Button>
        </Box>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 20 }}>
            <CircularProgress sx={{ color: "#6366f1" }} />
          </Box>
        ) : templates?.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 10,
              textAlign: "center",
              bgcolor: "#121212",
              border: "1px dashed #242424",
              borderRadius: 3,
            }}
          >
            <FileText size={40} color="#1e293b" style={{ marginBottom: 12 }} />
            <Typography sx={{ color: "#555" }}>
              No templates yet. Create one to get started.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {templates?.map((t: any) => {
              const vars = extractVariables(t.content);
              return (
                <Paper
                  key={t._id}
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "#121212",
                    border: "1px solid #242424",
                    borderRadius: 3,
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "#334155" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      mb: 1.5,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#f1f5f9",
                          fontSize: "15px",
                        }}
                      >
                        {t.title}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          flexWrap: "wrap",
                          mt: 0.5,
                        }}
                      >
                        {t.tags?.map((tag: string) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            icon={<Tag size={10} />}
                            sx={{
                              fontSize: "10px",
                              height: 20,
                              bgcolor: "rgba(99,102,241,0.08)",
                              color: "#6366f1",
                              border: "1px solid rgba(99,102,241,0.2)",
                            }}
                          />
                        ))}
                        {vars.map((v) => (
                          <Chip
                            key={v}
                            label={`{{${v}}}`}
                            size="small"
                            sx={{
                              fontSize: "10px",
                              height: 20,
                              bgcolor: "rgba(245,158,11,0.08)",
                              color: "#f59e0b",
                              border: "1px solid rgba(245,158,11,0.2)",
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => copyContent(t._id, t.content)}
                        sx={{ color: "#555", "&:hover": { color: "#e0e0e0" } }}
                      >
                        {copiedId === t._id ? (
                          <Check size={15} color="#10b981" />
                        ) : (
                          <Copy size={15} />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openEdit(t)}
                        sx={{ color: "#555", "&:hover": { color: "#e0e0e0" } }}
                      >
                        <Edit2 size={15} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteMutation.mutate(t._id)}
                        sx={{
                          color: "#555",
                          "&:hover": {
                            color: "#ef4444",
                            bgcolor: "rgba(239,68,68,0.08)",
                          },
                        }}
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      color: "#475569",
                      fontSize: "12px",
                      fontFamily: '"JetBrains Mono", monospace',
                      whiteSpace: "pre-wrap",
                      bgcolor: "#0a0a0a",
                      p: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid #1e293b",
                      maxHeight: 100,
                      overflow: "auto",
                    }}
                  >
                    {t.content}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        )}
      </Container>
      { }
      <Dialog
        open={editOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#121212",
            border: "1px solid #242424",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#f1f5f9",
            fontWeight: 700,
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {editingId ? "Edit Template" : "New Prompt Template"}
          <IconButton size="small" onClick={closeDialog} sx={{ color: "#555" }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            pt: "20px !important",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#e0e0e0",
                "& fieldset": { borderColor: "#333" },
              },
              "& .MuiInputLabel-root": { color: "#888" },
            }}
          />
          <TextField
            label="Prompt Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={8}
            fullWidth
            placeholder="Use {{variable}} for dynamic values..."
            helperText={
              extractVariables(content).length > 0
                ? `Variables: ${extractVariables(content)
                  .map((v) => `{{${v}}}`)
                  .join(", ")}`
                : "Add {{variable}} placeholders for dynamic injection"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#e0e0e0",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "13px",
                "& fieldset": { borderColor: "#333" },
              },
              "& .MuiInputLabel-root": { color: "#888" },
              "& .MuiFormHelperText-root": { color: "#f59e0b" },
            }}
          />
          <TextField
            label="Add Tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            fullWidth
            helperText="Press Enter to add a tag"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#e0e0e0",
                "& fieldset": { borderColor: "#333" },
              },
              "& .MuiInputLabel-root": { color: "#888" },
            }}
          />
          {tags.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => setTags(tags.filter((t) => t !== tag))}
                  sx={{
                    bgcolor: "rgba(99,102,241,0.1)",
                    color: "#818cf8",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{ px: 3, pb: 3, borderTop: "1px solid #1e293b", pt: 2 }}
        >
          <Button
            onClick={closeDialog}
            sx={{ color: "#666", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={isSaving || !title.trim() || !content.trim()}
            startIcon={
              isSaving ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Save size={15} />
              )
            }
            sx={{
              bgcolor: "#6366f1",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!snackMsg}
        autoHideDuration={3000}
        onClose={() => setSnackMsg("")}
        message={snackMsg}
      />
    </Box>
  );
};
