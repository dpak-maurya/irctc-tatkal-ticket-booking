import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { useAppContext } from '../contexts/AppContext';
import {
  RUNS_KEY,
  OUTCOMES,
  STAGE_LABELS,
  buildShareLog,
  formatDateTime,
  formatTime,
  getCounts,
  getIssueUrl,
  getPrivateStrings,
  getTimings,
} from '../bookingHistory';

const LEVEL_COLORS = { error: 'error.main', warn: 'warning.dark', info: 'text.primary' };
const LEVEL_EDGES = { error: 'error.main', warn: 'warning.main' };

function RunDetails({ run, privateStrings }) {
  const [copied, setCopied] = useState(false);
  const timings = getTimings(run);
  const counts = getCounts(run);
  const outcome = OUTCOMES[run.outcome] || { color: 'default' };
  const tiles = [
    ...timings,
    { label: 'Seat checks', value: counts.seatChecks },
    ...(counts.retries > 0 ? [{ label: 'Re-checks after no reply', value: counts.retries, warn: true }] : []),
    ...(counts.irctcMessages > 0 ? [{ label: 'IRCTC messages', value: counts.irctcMessages, warn: true }] : []),
  ];

  const copyShareLog = async () => {
    await navigator.clipboard.writeText(buildShareLog(run, privateStrings));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Opens a new issue with the log filled in; the user reviews it and submits.
  const reportOnGitHub = async () => {
    await copyShareLog();
    window.open(getIssueUrl(run, privateStrings), '_blank', 'noopener,noreferrer');
  };

  return (
    <Box>
      {run.reason && (
        <Alert severity={outcome.color === 'error' ? 'error' : 'warning'} sx={{ mb: 2 }}>
          {run.reason}
        </Alert>
      )}
      {run.statuses && run.statuses.length > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Ticket status: {run.statuses.join(', ')}{run.pnr ? ` · PNR ${run.pnr}` : ''}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 1,
          mb: 2,
        }}
      >
        {tiles.map((tile) => (
          <Box
            key={tile.label}
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 1.5,
              backgroundColor: '#fff',
              border: '1px solid',
              borderColor: tile.warn ? 'warning.light' : 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.3 }}>
              {tile.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: tile.warn ? 'warning.dark' : 'text.primary' }}>
              {tile.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>Steps</Typography>
      <Box
        component="ol"
        sx={{
          listStyle: 'none',
          m: 0,
          mb: 2,
          p: 0,
          maxHeight: 360,
          overflowY: 'auto',
          backgroundColor: '#fff',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {(run.steps || []).map((step, index) => (
          <Box
            component="li"
            key={`${step.t}-${index}`}
            sx={{
              px: 1.5,
              py: 1,
              borderLeft: '3px solid',
              borderLeftColor: LEVEL_EDGES[step.level] || 'transparent',
              '&:not(:last-of-type)': { borderBottom: '1px solid', borderBottomColor: 'divider' },
            }}
          >
            <Typography variant="caption" color="text.secondary" component="div">
              <Box component="span" sx={{ fontFamily: 'monospace' }}>{formatTime(step.t)}</Box>
              {' · '}
              {STAGE_LABELS[step.stage] || step.stage}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: LEVEL_COLORS[step.level], fontWeight: step.level === 'info' ? 400 : 600, overflowWrap: 'anywhere' }}
            >
              {step.message}
            </Typography>
          </Box>
        ))}
      </Box>

      <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
        <Button size="small" variant="contained" onClick={copyShareLog}>
          {copied ? 'Copied' : 'Copy log to share'}
        </Button>
        <Button size="small" variant="outlined" onClick={reportOnGitHub}>
          Report on GitHub
        </Button>
        <Typography variant="caption" color="text.secondary">
          The shared log leaves out your login, passengers, mobile, PNR and IP address.
        </Typography>
      </Stack>
    </Box>
  );
}

// Saved runs, kept in sync while the options page is open.
export function useBookingRuns() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage) return undefined;

    chrome.storage.local.get(RUNS_KEY, (result) => setRuns(result[RUNS_KEY] || []));
    const onChange = (changes, area) => {
      if (area === 'local' && changes[RUNS_KEY]) setRuns(changes[RUNS_KEY].newValue || []);
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, []);

  return runs;
}

// Booking history in a panel that slides in from the right; full width on phones.
function BookingHistoryDrawer({ open, onClose, runs }) {
  const { formData } = useAppContext();
  const privateStrings = getPrivateStrings(formData);

  const clearHistory = () => {
    if (window.confirm('Delete all saved booking attempts?')) chrome.storage.local.set({ [RUNS_KEY]: [] });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 560 }, backgroundColor: 'rgb(244, 247, 255)' } }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Booking History</Typography>
        <Stack direction="row" alignItems="center" gap={1}>
          {runs.length > 0 && <Button size="small" color="inherit" onClick={clearHistory}>Clear</Button>}
          <IconButton aria-label="Close booking history" onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
      </Stack>

      <Box sx={{ p: 2, overflowY: 'auto' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Every booking attempt is saved here (last 10): how far it got, how long each step took and why it stopped.
        </Typography>

        {runs.length === 0 && <Typography variant="body2">No booking attempts yet.</Typography>}

        {runs.map((run, index) => {
          const outcome = OUTCOMES[run.outcome] || { label: run.outcome, color: 'default' };
          const plan = run.plan || {};
          return (
            <Accordion key={run.id} defaultExpanded={index === 0} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ width: '100%', pr: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {[plan.trainNumber, plan.accommodationClass, plan.quota].filter(Boolean).join(' · ') || '-'}
                    </Typography>
                    <Chip size="small" color={outcome.color} label={outcome.label} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(run.startedAt)} · got to {STAGE_LABELS[run.stage] || run.stage}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <RunDetails run={run} privateStrings={privateStrings} />
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Drawer>
  );
}

BookingHistoryDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  runs: PropTypes.array.isRequired,
};

RunDetails.propTypes = {
  run: PropTypes.object.isRequired,
  privateStrings: PropTypes.array.isRequired,
};

export default BookingHistoryDrawer;
