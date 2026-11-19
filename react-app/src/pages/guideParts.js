// Building blocks for the How to Use guide: inline "markdown" bits,
// callouts, the booking timeline and the seat-check diagram.
import React from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

// --- Inline text -------------------------------------------------------------

// A button or field name in the extension or on IRCTC.
export const Ui = ({ children }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-block',
      px: 0.9,
      py: 0.05,
      mx: 0.15,
      borderRadius: 999,
      border: '1px solid',
      borderColor: 'primary.main',
      color: 'primary.main',
      fontSize: '0.85em',
      fontWeight: 600,
      lineHeight: 1.5,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </Box>
);

export const Code = ({ children }) => (
  <Box
    component="code"
    sx={{
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '0.86em',
      fontWeight: 600,
      px: 0.7,
      py: 0.15,
      borderRadius: '4px',
      backgroundColor: '#EEF1F7',
      color: '#3B4A6B',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </Box>
);

export const Kbd = ({ children }) => (
  <Box
    component="kbd"
    sx={{
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: '0.8em',
      fontWeight: 600,
      px: 0.8,
      py: 0.1,
      border: '1px solid',
      borderColor: 'divider',
      borderBottomWidth: 3,
      borderRadius: '4px',
      backgroundColor: '#fff',
    }}
  >
    {children}
  </Box>
);

// Highlighter-pen emphasis.
export const Mark = ({ children }) => (
  <Box
    component="mark"
    sx={{ background: 'linear-gradient(transparent 55%, rgba(249, 168, 37, 0.38) 0)', color: 'inherit', px: 0.2 }}
  >
    {children}
  </Box>
);

// A message IRCTC shows on screen.
export const IrctcMsg = ({ children }) => (
  <Box component="span" sx={{ fontWeight: 700, color: 'error.main' }}>{children}</Box>
);

Ui.propTypes = { children: PropTypes.node };
Code.propTypes = { children: PropTypes.node };
Kbd.propTypes = { children: PropTypes.node };
Mark.propTypes = { children: PropTypes.node };
IrctcMsg.propTypes = { children: PropTypes.node };

// --- Blocks ------------------------------------------------------------------

export const Callout = ({ type = 'info', title, children }) => (
  <Alert
    severity={type}
    sx={{
      my: 2,
      borderLeft: '4px solid',
      borderLeftColor: `${type}.main`,
      '& .MuiAlert-message': { width: '100%' },
    }}
  >
    {title && <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>}
    {children}
  </Alert>
);

Callout.propTypes = {
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
  title: PropTypes.node,
  children: PropTypes.node,
};

export const Section = ({ id, icon, title, subtitle, children }) => (
  <Box component="section" id={id} sx={{ pt: 6, scrollMarginTop: { xs: 72, md: 32 } }}>
    <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 0.5 }}>
      <Avatar variant="rounded" sx={{ bgcolor: 'surface.main', color: 'primary.main', width: 40, height: 40 }}>
        {icon}
      </Avatar>
      <Typography component="h2" sx={{ fontSize: { xs: '1.4rem', sm: '1.65rem' }, fontWeight: 700, letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
    </Stack>
    {subtitle && <Typography color="text.secondary" sx={{ mb: 2 }}>{subtitle}</Typography>}
    {children}
  </Box>
);

Section.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  children: PropTypes.node,
};

export const SubHeading = ({ children }) => (
  <Typography component="h3" sx={{ fontSize: '1.12rem', fontWeight: 700, mt: 3.5, mb: 1 }}>{children}</Typography>
);

SubHeading.propTypes = { children: PropTypes.node };

// --- Booking timeline --------------------------------------------------------

export const ACTORS = {
  ext: { label: 'The extension does it', color: '#415F91', bg: '#E3EBFB' },
  you: { label: 'You do it', color: '#B06000', bg: '#FFF4E0' },
  irctc: { label: 'IRCTC does it', color: '#5F6368', bg: '#ECEFF3' },
};

export const ActorLegend = () => (
  <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
    {Object.entries(ACTORS).map(([key, actor]) => (
      <Stack key={key} direction="row" alignItems="center" gap={0.75}>
        <Box sx={{ width: 12, height: 12, borderRadius: 0.75, backgroundColor: actor.color }} />
        <Typography variant="body2" color="text.secondary">{actor.label}</Typography>
      </Stack>
    ))}
  </Stack>
);

// steps: [{ when, actor, title, body, highlight }]
export const Timeline = ({ steps }) => {
  const theme = useTheme();
  const accent = theme.palette.secondary.main;

  return (
    <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0 }}>
      {steps.map((step, index) => {
        const actor = ACTORS[step.actor];
        const dotColor = step.highlight ? accent : actor.color;
        return (
          <Box
            component="li"
            key={step.title}
            sx={{ display: 'grid', gridTemplateColumns: { xs: '66px 20px 1fr', sm: '96px 24px 1fr' }, columnGap: { xs: 1, sm: 1.5 } }}
          >
            <Typography
              sx={{
                textAlign: 'right',
                pt: 1.7,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: { xs: '0.72rem', sm: '0.82rem' },
                fontWeight: 700,
                color: step.highlight ? accent : 'text.secondary',
              }}
            >
              {step.when}
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 2,
                  top: index === 0 ? 22 : 0,
                  bottom: index === steps.length - 1 ? 'calc(100% - 22px)' : 0,
                  backgroundColor: 'divider',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 15,
                  transform: 'translateX(-50%)',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: step.highlight ? accent : '#fff',
                  border: `3px solid ${dotColor}`,
                  boxShadow: step.highlight ? `0 0 0 5px ${alpha(accent, 0.2)}` : 'none',
                }}
              />
            </Box>
            <Box
              sx={{
                my: 0.6,
                px: 1.75,
                py: 1.1,
                borderRadius: '8px',
                backgroundColor: actor.bg,
                border: `1px solid ${alpha(actor.color, 0.25)}`,
              }}
            >
              <Typography sx={{ fontWeight: 700, color: actor.color, fontSize: '0.95rem' }}>{step.title}</Typography>
              <Typography variant="body2">{step.body}</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

Timeline.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    when: PropTypes.string.isRequired,
    actor: PropTypes.oneOf(Object.keys(ACTORS)).isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.node.isRequired,
    highlight: PropTypes.bool,
  })).isRequired,
};

// --- Seat-check rhythm -------------------------------------------------------

export const CheckRhythm = ({ fastMs, fastWindowMs, refreshMs }) => {
  const theme = useTheme();
  const fast = theme.palette.secondary.main;
  const slow = theme.palette.primary.main;
  const scale = 20; // px per second
  const start = 60;
  const fastDots = [];
  for (let t = 0; t <= fastWindowMs; t += fastMs) fastDots.push(t);
  const lastFast = fastDots[fastDots.length - 1];
  const slowDots = [lastFast + refreshMs, lastFast + 2 * refreshMs];
  const endX = start + (slowDots[1] / 1000) * scale + 40;
  const x = (ms) => start + 10 + (ms / 1000) * scale;

  const legend = [
    { color: fast, text: `every ${fastMs / 1000} s for the first ${fastWindowMs / 1000} s after opening` },
    { color: slow, text: `then every Refresh Time (${refreshMs / 1000} s)` },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '10px' }}>
      <Box
        component="svg"
        viewBox={`0 0 ${endX + 20} 90`}
        role="img"
        aria-label={`Seat checks ${legend[0].text}, ${legend[1].text}`}
        sx={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <rect x={start} y="30" width={x(lastFast) - start + 14} height="48" rx="8" fill={alpha(fast, 0.1)} />
        <line x1="40" y1="54" x2={endX} y2="54" stroke={theme.palette.divider} strokeWidth="2" />
        <line x1={start} y1="24" x2={start} y2="84" stroke={fast} strokeWidth="2" strokeDasharray="4 4" />
        <text x={start} y="16" textAnchor="middle" fill={theme.palette.text.primary} fontSize="15" fontWeight="700">Opening</text>
        {fastDots.map((t) => <circle key={`f${t}`} cx={x(t)} cy="54" r="7" fill={fast} />)}
        {slowDots.map((t) => <circle key={`s${t}`} cx={x(t)} cy="54" r="7" fill={slow} />)}
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={{ xs: 0.5, sm: 3 }} sx={{ mt: 1.5 }}>
        {legend.map((item) => (
          <Stack key={item.text} direction="row" alignItems="center" gap={1}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary">{item.text}</Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

CheckRhythm.propTypes = {
  fastMs: PropTypes.number.isRequired,
  fastWindowMs: PropTypes.number.isRequired,
  refreshMs: PropTypes.number.isRequired,
};
