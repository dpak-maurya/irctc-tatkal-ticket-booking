/**
 * Helpers for the Booking History panel. Runs are written by the content
 * script (chrome-extension/src/scripts/bookingLog.js) under the same key.
 */

export const RUNS_KEY = 'bookingRuns';

export const OUTCOMES = {
  running: { label: 'In progress', color: 'info' },
  'reached-payment': { label: 'Reached payment', color: 'info' },
  confirmed: { label: 'Booked: confirmed', color: 'success' },
  rac: { label: 'Booked: RAC', color: 'success' },
  waitlisted: { label: 'Booked: waitlisted', color: 'warning' },
  booked: { label: 'Booked', color: 'success' },
  'failed-after-payment': { label: 'Paid, booking failed', color: 'error' },
  'payment-failed': { label: 'Payment failed', color: 'error' },
  unknown: { label: 'Result not seen', color: 'default' },
  stopped: { label: 'Stopped', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
};

export const STAGE_LABELS = {
  start: 'Start',
  login: 'Login',
  search: 'Search',
  trainList: 'Train list',
  bookNow: 'Book Now',
  passenger: 'Passenger details',
  review: 'Review journey',
  payment: 'Payment',
  confirmation: 'Booking result',
};

const IST = { timeZone: 'Asia/Kolkata' };

export function formatTime(ms) {
  const time = new Date(ms).toLocaleTimeString('en-GB', { ...IST, hour12: false });
  return `${time}.${String(ms % 1000).padStart(3, '0')}`;
}

export function formatDateTime(ms) {
  const date = new Date(ms).toLocaleDateString('en-GB', { ...IST, day: '2-digit', month: 'short', year: 'numeric' });
  return `${date}, ${new Date(ms).toLocaleTimeString('en-GB', { ...IST, hour12: false })} IST`;
}

const seconds = (ms) => `${(ms / 1000).toFixed(1)} s`;

// Timings behind "how fast was it": relative to the opening when there is one.
export function getTimings(run) {
  const { marks = {}, plan = {} } = run;
  const opening = plan.openingAt;
  const timings = [];
  const after = (mark) => (opening ? `${mark >= opening ? '+' : '-'}${seconds(Math.abs(mark - opening))} vs opening` : formatTime(mark));

  if (marks.searchClicked && opening) timings.push({ label: 'Search clicked', value: `${seconds(opening - marks.searchClicked)} before opening` });
  if (marks.firstCheck && opening) timings.push({ label: 'First seat check', value: `${marks.firstCheck - opening} ms after opening` });
  if (marks.bookNow) timings.push({ label: 'Book Now', value: after(marks.bookNow) });
  if (marks.bookNow && marks.reviewPage) timings.push({ label: 'Book Now → review', value: seconds(marks.reviewPage - marks.bookNow) });
  if (marks.paymentPage) timings.push({ label: 'Payment page', value: after(marks.paymentPage) });
  if (marks.loggedIn && (marks.paymentPage || run.endedAt)) {
    timings.push({ label: 'Login → end', value: seconds((marks.paymentPage || run.endedAt) - marks.loggedIn) });
  }
  return timings;
}

export function getCounts(run) {
  const steps = run.steps || [];
  return {
    seatChecks: steps.filter((step) => step.message.startsWith('Seat check')).length,
    retries: steps.filter((step) => step.message.startsWith('No availability in the reply')).length,
    irctcMessages: steps.filter((step) => step.message.startsWith('IRCTC:')).length,
  };
}

// --- Sharing -----------------------------------------------------------------
// The shared log keeps what helps fix the extension (steps, timings, IRCTC's
// messages) and drops anything personal.

function redact(text, secrets) {
  let clean = String(text)
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '<email>')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '<ip>')
    .replace(/\b(?:[0-9a-f]{1,4}:){2,7}[0-9a-f]{0,4}\b/gi, '<ip>')
    .replace(/\b\d{10,}\b/g, '<number>');
  for (const secret of secrets) {
    if (secret && secret.length >= 3) {
      clean = clean.replace(new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '<name>');
    }
  }
  return clean;
}

export function getPrivateStrings(formData = {}) {
  const names = [...(formData.passengerList || []), ...(formData.passengerNames || []), ...(formData.infantList || [])]
    .flatMap((passenger) => String(passenger?.name || '').split(/\s+/).concat(passenger?.name || ''));
  return [formData.username, formData.mobileNumber, ...names].filter(Boolean);
}

export function buildShareLog(run, privateStrings = []) {
  const plan = run.plan || {};
  const outcome = OUTCOMES[run.outcome]?.label || run.outcome;
  const journey = plan.journeyDate && /^\d{2}\/\d{2}\/\d{4}$/.test(plan.journeyDate)
    ? (() => {
      const [day, month, year] = plan.journeyDate.split('/').map(Number);
      const start = new Date(run.startedAt);
      return `${Math.round((Date.UTC(year, month - 1, day) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000)} day(s) ahead`;
    })()
    : '-';
  const steps = run.steps || [];
  const lastStep = steps.length - 1;
  // Warnings and errors, plus the last few steps for context.
  const shared = steps.filter((step, index) => step.level !== 'info' || index > lastStep - 6);

  const lines = [
    `Tatkal Ticket Booking extension log (v${run.version || '?'})`,
    `Run: ${formatDateTime(run.startedAt)} | outcome: ${outcome} | got to: ${STAGE_LABELS[run.stage] || run.stage}`,
    run.reason ? `Reason: ${redact(run.reason, privateStrings)}` : '',
    `Plan: train ${plan.trainNumber || '-'}, ${plan.from || '-'} -> ${plan.to || '-'}, ${plan.accommodationClass || '-'}, ${plan.quota || '-'}, journey ${journey}`
      + `${plan.openingAt ? `, opens ${formatTime(plan.openingAt).slice(0, 8)}` : ''}, search ${plan.searchSecondsBefore ?? '-'} s before, refresh ${plan.refreshTime ?? '-'} ms`
      + `, ${plan.passengers ?? '-'} passenger(s), ${plan.infants || 0} infant(s), master data ${plan.masterData ? 'yes' : 'no'}`
      + `, payment ${plan.paymentMethod || '-'} / ${plan.paymentProvider || '-'}, auto pay ${plan.autoPay ? 'yes' : 'no'}`,
    `Timings: ${getTimings(run).map((timing) => `${timing.label} ${timing.value}`).join(' | ') || '-'}`,
    `Counts: ${Object.entries(getCounts(run)).map(([key, value]) => `${key} ${value}`).join(', ')}`,
    '',
    'Warnings, errors and the last steps:',
    ...shared.map((step) => `${formatTime(step.t)} [${STAGE_LABELS[step.stage] || step.stage}] ${step.level.toUpperCase()} ${redact(step.message, privateStrings)}`),
  ];
  return lines.filter((line, index) => line !== '' || index === 6).join('\n');
}

// GitHub rejects very long links, so a long log is cut here; the Report button
// also copies the whole log for the user to paste in.
const ISSUE_LOG_LIMIT = 3500;

export function getIssueUrl(run, privateStrings) {
  const title = `Booking ${OUTCOMES[run.outcome]?.label || run.outcome} at ${STAGE_LABELS[run.stage] || run.stage}`;
  const log = buildShareLog(run, privateStrings);
  const shown = log.length > ISSUE_LOG_LIMIT
    ? `${log.slice(0, ISSUE_LOG_LIMIT)}\n... (cut short: the full log is in your clipboard, paste it below)`
    : log;
  const body = `Describe what you saw (optional):\n\n\n\`\`\`\n${shown}\n\`\`\``;
  return `https://github.com/dpak-maurya/irctc-tatkal-ticket-booking/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
