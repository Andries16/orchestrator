import { Box, Typography, Paper } from '@mui/material';
import { ExecutionLog } from '@cross_brand/shared';
import { StatusBadge } from '../atoms/StatusBadge';
import { ArrowRight, CornerDownRight } from 'lucide-react';

interface LogItemProps {
  log: ExecutionLog;
}

/**
 * Molecule: LogItem
 * Afișează schimbul de date (Input -> Output) dintr-o execuție a unui agent.
 */
export const LogItem = ({ log }: LogItemProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <StatusBadge status={log.status === 'success' ? 'success' : 'error'} />
        <Typography sx={{ 
          fontFamily: '"JetBrains Mono", monospace', 
          fontSize: '11px', 
          color: '#64748b' 
        }}>
          Execuție Agent: {log.agentId.slice(-6)}...
        </Typography>
      </Box>

      {/* Input section */}
      <Paper elevation={0} sx={{ 
        p: 2, 
        bgcolor: '#0f172a', 
        border: '1px solid #1e293b', 
        borderLeft: '3px solid #64748b',
        borderRadius: '0 8px 8px 0' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CornerDownRight size={14} color="#64748b" />
          <Typography sx={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Input</Typography>
        </Box>
        <Typography sx={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'pre-wrap' }}>
          {log.input}
        </Typography>
      </Paper>

      {/* Output section */}
      <Paper elevation={0} sx={{ 
        p: 2, 
        bgcolor: 'rgba(34, 211, 238, 0.03)', 
        border: '1px solid rgba(34, 211, 238, 0.1)', 
        borderLeft: '3px solid #22d3ee',
        borderRadius: '0 8px 8px 0' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ArrowRight size={14} color="#22d3ee" />
          <Typography sx={{ fontSize: '10px', color: '#22d3ee', fontWeight: 600, textTransform: 'uppercase' }}>Output</Typography>
        </Box>
        <Typography sx={{ fontSize: '12px', color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
          {log.output}
        </Typography>
      </Paper>
    </Box>
  );
};
