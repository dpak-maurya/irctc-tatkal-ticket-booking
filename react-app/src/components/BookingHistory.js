import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { sharedStyles } from '../styles';
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

function RunDetails({ run, privateStrings }) {
  const [copied, setCopied] = useState(false);
  const timings = getTimings(run);
  const counts = getCounts(run);
  const outcome = OUTCOMES[run.outcome] || { color: 'default' };

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

      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        {timings.map((timing) => (
          <Chip key={timing.label} size="small" variant="outlined" label={`${timing.label}: ${timing.value}`} />
        ))}
        <Chip size="small" variant="outlined" label={`Seat checks: ${counts.seatChecks}`} />
        {counts.retries > 0 && <Chip size="small" variant="outlined" color="warning" label={`Re-checks after no reply: ${counts.retries}`} />}
        {counts.irctcMessages > 0 && <Chip size="small" variant="outlined" color="warning" label={`IRCTC messages: ${counts.irctcMessages}`} />}
      </Stack>

      <Box sx={{ maxHeight: 360, overflow: 'auto', backgroundColor: 'white', borderRadius: 1, mb: 2 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Time (IST)</TableCell>
              <TableCell>Step</TableCell>
              <TableCell>What happened</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(run.steps || []).map((step, index) => (
              <TableRow key={`${step.t}-${index}`}>
                <TableCell sx={{ whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{formatTime(step.t)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{STAGE_LABELS[step.stage] || step.stage}</TableCell>
                <TableCell sx={{ color: LEVEL_COLORS[step.level], fontWeight: step.level === 'info' ? 400 : 600 }}>
                  {step.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

function BookingHistory() {
  const { formData } = useAppContext();
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

  const clearHistory = () => {
    if (window.confirm('Delete all saved booking attempts?')) chrome.storage.local.set({ [RUNS_KEY]: [] });
  };

  const privateStrings = getPrivateStrings(formData);

  return (
    <Box sx={sharedStyles.container}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
          Booking History
        </Typography>
        {runs.length > 0 && (
          <Button size="small" color="inherit" onClick={clearHistory}>Clear</Button>
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Every booking attempt is saved here (last 10): how far it got, how long each step took and why it stopped.
      </Typography>

      {runs.length === 0 && (
        <Typography variant="body2">No booking attempts yet.</Typography>
      )}

      {runs.map((run, index) => {
        const outcome = OUTCOMES[run.outcome] || { label: run.outcome, color: 'default' };
        const plan = run.plan || {};
        return (
          <Accordion key={run.id} defaultExpanded={index === 0} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={{ xs: 0.5, sm: 2 }} alignItems={{ sm: 'center' }} sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ minWidth: 190 }}>{formatDateTime(run.startedAt)}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 170 }}>
                  {[plan.trainNumber, plan.accommodationClass, plan.quota].filter(Boolean).join(' · ') || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  Got to: {STAGE_LABELS[run.stage] || run.stage}
                </Typography>
                <Chip size="small" color={outcome.color} label={outcome.label} />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <RunDetails run={run} privateStrings={privateStrings} />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}

export default BookingHistory;
