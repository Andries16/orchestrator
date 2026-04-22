import { GlobalStyles } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AgentsPage } from './components/pages/AgentsPage.tsx';
import { WorkflowEditorPage } from './components/pages/WorkflowEditorPage.tsx';
import { AgentEditorPage } from './components/pages/AgentEditorPage.tsx';
import { WorkflowExecutionPage } from './components/pages/WorkflowExecutionPage.tsx';
import { useParams } from 'react-router-dom';

const ExecutionWrapper = () => {
  const { id } = useParams();
  return <WorkflowExecutionPage workflowId={id!} />;
};

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyles styles={{
        body: { 
          margin: 0, 
          padding: 0, 
          scrollbarWidth: 'thin', 
          scrollbarColor: '#334155 #0f172a',
          backgroundColor: '#0f172a'
        },
        '::-webkit-scrollbar': { width: '8px' },
        '::-webkit-scrollbar-track': { background: '#0f172a' },
        '::-webkit-scrollbar-thumb': { background: '#334155', borderRadius: '4px' },
        '::-webkit-scrollbar-thumb:hover': { background: '#475569' }
      }} />
      <Routes>
        <Route path="/" element={<AgentsPage />} />
        <Route path="/editor" element={<WorkflowEditorPage />} />
        <Route path="/agent-editor" element={<AgentEditorPage />} />
        <Route path="/execute/:id" element={<ExecutionWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}
