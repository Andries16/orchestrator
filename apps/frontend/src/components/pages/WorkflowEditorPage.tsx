import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  ArrowLeft,
  Bot,
  GripVertical,
  Save,
  Settings,
  UserCheck,
  Workflow
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  Panel,
  ReactFlowInstance,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { trpc } from "../../utils/trpc";
import { AgentNode } from "../flow/AgentNode";
import { ApprovalNode } from "../flow/ApprovalNode";
import "../flow/FlowStyles.css";
import { InputNode } from "../flow/InputNode";
import { OutputNode } from "../flow/OutputNode";
const nodeTypes = {
  agentNode: AgentNode,
  inputNode: InputNode,
  outputNode: OutputNode,
  approvalNode: ApprovalNode,
};
const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: "#334155" },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#334155" },
  animated: false,
};
let nodeIdCounter = 10;
const newNodeId = () => `node_${++nodeIdCounter}`;
function WorkflowEditorCanvas() {
  const navigate = useNavigate();
  const [workflowName, setWorkflowName] = useState("Nou Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [maxIterations, setMaxIterations] = useState(10);
  const [showSuccess, setShowSuccess] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const { data: agents } = trpc.agent.getAll.useQuery();
  const createMutation = trpc.workflow.create.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    },
  });
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "input-1",
      type: "inputNode",
      position: { x: 60, y: 200 },
      data: { label: "START" },
    },
    {
      id: "output-1",
      type: "outputNode",
      position: { x: 700, y: 200 },
      data: { label: "OUTPUT" },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            ...defaultEdgeOptions,
            id: `e-${connection.source}-${connection.target}`,
          },
          eds,
        ),
      ),
    [setEdges],
  );
  const toggleTool = useCallback(
    (nodeId: string, tool: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;
          const currentTools = (node.data as any).tools || [];
          const newTools = currentTools.includes(tool)
            ? currentTools.filter((t: string) => t !== tool)
            : [...currentTools, tool];
          return {
            ...node,
            data: { ...node.data, tools: newTools },
          };
        }),
      );
    },
    [setNodes],
  );
  const toggleJoin = useCallback(
    (nodeId: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;
          return {
            ...node,
            data: { ...node.data, waitForAll: !(node.data as any).waitForAll },
          };
        }),
      );
    },
    [setNodes],
  );
  const toggleMerge = useCallback(
    (nodeId: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;
          return {
            ...node,
            data: {
              ...node.data,
              mergeContext:
                (node.data as any).mergeContext === false ? true : false,
            },
          };
        }),
      );
    },
    [setNodes],
  );
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const label = prompt(
        "Introdu condiția pentru această legătură (ex: DA, NU, EROARE):",
        (edge.label as string) || "",
      );
      if (label !== null) {
        setEdges((eds) =>
          eds.map((e) =>
            e.id === edge.id ? { ...e, label, animated: !!label } : e,
          ),
        );
      }
    },
    [setEdges],
  );
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!rfInstance || !reactFlowWrapper.current) return;
      const agentJson = event.dataTransfer.getData("application/reactflow");
      if (!agentJson) return;
      const data = JSON.parse(agentJson);
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      let newNode: Node;
      if (data.type === "approvalNode") {
        newNode = {
          id: newNodeId(),
          type: "approvalNode",
          position,
          data: { label: "User Approval" },
        };
      } else {
        newNode = {
          id: newNodeId(),
          type: "agentNode",
          position,
          data: {
            label: data.name,
            agentName: data.name,
            agentRole: data.role,
            model: data.model,
            agentId: String(data._id),
            tools: data.tools || [],
            waitForAll: false,
            mergeContext: true,
            toggleTool: (tool: string) => toggleTool(newNode.id, tool),
            toggleJoin: () => toggleJoin(newNode.id),
            toggleMerge: () => toggleMerge(newNode.id),
          },
        };
      }
      setNodes((nds) => [...nds, newNode]);
    },
    [rfInstance, setNodes],
  );
  const onSave = () => {
    if (!workflowName.trim()) return;
    const serialisedNodes = nodes.map((n) => ({
      id: n.id,
      type: (n.type === "agentNode"
        ? "agent"
        : n.type === "inputNode"
          ? "input"
          : n.type === "outputNode"
            ? "output"
            : n.type === "approvalNode"
              ? "wait"
              : "agent") as "input" | "agent" | "output" | "wait" | "router",
      agentId: (n.data as any)?.agentId as string | undefined,
      tools: (n.data as any)?.tools as string[] | undefined,
      waitForAll: (n.data as any)?.waitForAll as boolean | undefined,
      mergeContext: (n.data as any)?.mergeContext as boolean | undefined,
      position: n.position,
      data: {
        label: (n.data as any)?.label || (n.data?.label as string) || "",
      },
    }));
    const serialisedEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: (e as any).label,
    }));
    createMutation.mutate({
      name: workflowName,
      description: workflowDescription,
      steps: [],
      nodes: serialisedNodes,
      edges: serialisedEdges,
      maxIterations,
      status: "active",
    });
  };
  const onNodeDragStart = (agent: any) => (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(agent));
    event.dataTransfer.effectAllowed = "move";
  };
  const agentCount = nodes.filter((n) => n.type === "agentNode").length;
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0a0a0a",
        overflow: "hidden",
      }}
    >
      { }
      <Box
        sx={{
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          bgcolor: "rgba(10,10,10,0.9)",
          borderBottom: "1px solid #242424",
          backdropFilter: "blur(12px)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          size="small"
          sx={{
            color: "#888",
            "&:hover": { color: "#e0e0e0", bgcolor: "rgba(255,255,255,0.05)" },
          }}
        >
          <ArrowLeft size={18} />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
          <Workflow size={16} color="#6366f1" />
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "14px",
              color: "#e0e0e0",
              letterSpacing: "-0.01em",
            }}
          >
            Flow Editor
          </Typography>
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ borderColor: "#242424", mx: 0.5 }}
        />
        <TextField
          size="small"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="Workflow name..."
          variant="outlined"
          sx={{
            width: 240,
            "& .MuiOutlinedInput-root": {
              color: "#f1f5f9",
              fontSize: "14px",
              fontWeight: 600,
              bgcolor: "rgba(255,255,255,0.03)",
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#555" },
              "&.Mui-focused fieldset": { borderColor: "#6366f1" },
            },
          }}
        />
        <TextField
          size="small"
          value={workflowDescription}
          onChange={(e) => setWorkflowDescription(e.target.value)}
          placeholder="Short description (optional)..."
          variant="outlined"
          sx={{
            width: 280,
            "& .MuiOutlinedInput-root": {
              color: "#94a3b8",
              fontSize: "13px",
              bgcolor: "rgba(255,255,255,0.02)",
              "& fieldset": { borderColor: "#2a2a2a" },
              "&:hover fieldset": { borderColor: "#444" },
              "&.Mui-focused fieldset": { borderColor: "#4f46e5" },
            },
          }}
        />
        <Box
          sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Chip
            label={`${agentCount} agent${agentCount !== 1 ? "s" : ""}`}
            size="small"
            sx={{
              bgcolor: "rgba(99,102,241,0.1)",
              color: "#818cf8",
              border: "1px solid rgba(99,102,241,0.2)",
              fontSize: "11px",
            }}
          />
          <Button
            variant="contained"
            startIcon={
              createMutation.isPending ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Save size={15} />
              )
            }
            onClick={onSave}
            disabled={createMutation.isPending || !workflowName.trim()}
            sx={{
              bgcolor: "#6366f1",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "13px",
              px: 2.5,
              "&:hover": { bgcolor: "#4f46e5" },
              "&.Mui-disabled": { bgcolor: "#242424", color: "#555" },
            }}
          >
            Salvează
          </Button>
          <Tooltip title="Workflow Settings">
            <IconButton
              onClick={() => {
                const val = prompt(
                  "Max Iterations (Loop limit):",
                  String(maxIterations),
                );
                if (val) setMaxIterations(parseInt(val) || 10);
              }}
              size="small"
              sx={{
                color: "#64748b",
                border: "1px solid #242424",
                borderRadius: 2,
              }}
            >
              <Settings size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      { }
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        { }
        <Box
          sx={{
            width: 220,
            flexShrink: 0,
            bgcolor: "#0d0d0d",
            borderRight: "1px solid #242424",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #1a1a1a" }}>
            <Typography
              sx={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Control Flow
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              borderBottom: "1px solid #1a1a1a",
            }}
          >
            <Box
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "application/reactflow",
                  JSON.stringify({ type: "approvalNode" }),
                );
                e.dataTransfer.effectAllowed = "move";
              }}
              sx={{
                p: 1.5,
                bgcolor: "#161616",
                border: "1px solid #242424",
                borderRadius: 2,
                cursor: "grab",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: "#f59e0b",
                  bgcolor: "rgba(245,158,11,0.05)",
                  transform: "translateX(2px)",
                },
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <GripVertical size={12} color="#374151" />
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserCheck size={12} color="#f59e0b" />
              </Box>
              <Typography
                sx={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0" }}
              >
                User Approval
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 2, borderBottom: "1px solid #1a1a1a" }}>
            <Typography
              sx={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Agenți disponibili
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#334155", mt: 0.5 }}>
              Trage pe canvas
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {!agents?.length && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#334155",
                  textAlign: "center",
                  mt: 4,
                  px: 1,
                }}
              >
                Niciun agent creat încă. Creează unul mai întâi.
              </Typography>
            )}
            {agents?.map((agent: any) => (
              <Box
                key={String(agent._id)}
                draggable
                onDragStart={onNodeDragStart(agent)}
                sx={{
                  p: 1.5,
                  bgcolor: "#161616",
                  border: "1px solid #242424",
                  borderRadius: 2,
                  cursor: "grab",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "#6366f1",
                    bgcolor: "#1a1a2e",
                    transform: "translateX(2px)",
                  },
                  "&:active": { cursor: "grabbing" },
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <GripVertical
                  size={12}
                  color="#374151"
                  style={{ flexShrink: 0 }}
                />
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bot size={12} color="#818cf8" />
                </Box>
                <Box sx={{ overflow: "hidden", flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#e2e8f0",
                      lineHeight: 1.2,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {agent.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "10px",
                      color: "#475569",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {agent.role}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          { }
          <Box sx={{ p: 1.5, borderTop: "1px solid #1a1a1a" }}>
            <Typography
              sx={{ fontSize: "10px", color: "#1e293b", textAlign: "center" }}
            >
              Del/Backspace → șterge selectat
            </Typography>
          </Box>
        </Box>
        { }
        <Box ref={reactFlowWrapper} sx={{ flex: 1, position: "relative" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            deleteKeyCode={["Backspace", "Delete"]}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="#1a1a1a"
            />
            <Controls />
            <MiniMap
              style={{ background: "#0d0d0d", border: "1px solid #242424" }}
              nodeColor="#334155"
              maskColor="rgba(0,0,0,0.5)"
            />
            <Panel position="bottom-center">
              <Typography
                sx={{
                  fontSize: "10px",
                  color: "#1e293b",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                Conectează noduri trăgând de la portul dreapta → portul stânga
              </Typography>
            </Panel>
          </ReactFlow>
        </Box>
      </Box>
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="✓ Workflow salvat cu succes!"
      />
    </Box>
  );
}
export const WorkflowEditorPage = () => (
  <ReactFlowProvider>
    <WorkflowEditorCanvas />
  </ReactFlowProvider>
);
