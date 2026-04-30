import { GlobalStyles } from "@mui/material";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { AgentsPage } from "./components/pages/AgentsPage";
import { WorkflowEditorPage } from "./components/pages/WorkflowEditorPage";
import { AgentEditorPage } from "./components/pages/AgentEditorPage";
import { WorkflowExecutionPage } from "./components/pages/WorkflowExecutionPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { HistoryPage } from "./components/pages/HistoryPage";
import { RunDetailsPage } from "./components/pages/RunDetailsPage";
import { AnalyticsPage } from "./components/pages/AnalyticsPage";
import { TemplatesPage } from "./components/pages/TemplatesPage";
const ExecutionWrapper = () => {
  const { id } = useParams();
  return <WorkflowExecutionPage workflowId={id!} />;
};
export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            padding: 0,
            scrollbarWidth: "thin",
            scrollbarColor: "#2d2d2d #0a0a0a",
            backgroundColor: "#0a0a0a",
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            color: "#e0e0e0",
          },
          "::-webkit-scrollbar": { width: "8px" },
          "::-webkit-scrollbar-track": { background: "#0a0a0a" },
          "::-webkit-scrollbar-thumb": {
            background: "#2d2d2d",
            borderRadius: "4px",
          },
          "::-webkit-scrollbar-thumb:hover": { background: "#404040" },
        }}
      />
      <Routes>
        <Route path="/" element={<AgentsPage />} />
        <Route path="/editor" element={<WorkflowEditorPage />} />
        <Route path="/agent-editor" element={<AgentEditorPage />} />
        <Route path="/execute/:id" element={<ExecutionWrapper />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<RunDetailsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
