/**
 * Booking history: one record per booking attempt, kept in chrome.storage.local
 * so the options page can show how far a run got, how long each step took and
 * why it stopped.
 *
 * Only steps, timings and IRCTC's own on-screen messages are recorded. Login
 * details, passenger names, contact details and payment details never go in.
 */

export const RUNS_KEY = 'bookingRuns';

const MAX_RUNS = 10;
const MAX_STEPS = 300;
// Writes are batched so a burst of steps costs one storage write.
const SAVE_DELAY_MS = 500;

// Furthest stage reached decides where a run "got to".
export const STAGES = ['start', 'login', 'search', 'trainList', 'bookNow', 'passenger', 'review', 'payment', 'confirmation'];

let run = null;
let saveTimer = null;
let saving = Promise.resolve();

function save() {
  if (!run) return saving;

  const snapshot = JSON.parse(JSON.stringify(run));
  saving = saving.then(() => new Promise((resolve) => {
    chrome.storage.local.get(RUNS_KEY, (result) => {
      const runs = (result && result[RUNS_KEY]) || [];
      const others = runs.filter((saved) => saved.id !== snapshot.id);
      chrome.storage.local.set({ [RUNS_KEY]: [snapshot, ...others].slice(0, MAX_RUNS) }, () => resolve());
    });
  })).catch(() => {});
  return saving;
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, SAVE_DELAY_MS);
}

// Write now, e.g. before the page navigates away to the payment gateway.
export function flushRun() {
  clearTimeout(saveTimer);
  return save();
}

export function startRun(plan) {
  run = {
    id: `run-${Date.now()}`,
    startedAt: Date.now(),
    // Test builds stamp version_name with the branch and commit.
    version: chrome.runtime?.getManifest?.().version_name || chrome.runtime?.getManifest?.().version || '',
    plan,
    stage: 'start',
    outcome: 'running',
    reason: '',
    marks: {},
    steps: [],
  };
  return flushRun();
}

// Continue the newest run, e.g. when IRCTC reloads the site after payment.
export function resumeLatestRun(maxAgeMs) {
  return new Promise((resolve) => {
    chrome.storage.local.get(RUNS_KEY, (result) => {
      const latest = ((result && result[RUNS_KEY]) || [])[0];
      const recent = latest && Date.now() - latest.startedAt < maxAgeMs;
      const open = latest && ['running', 'reached-payment'].includes(latest.outcome);
      run = recent && open ? latest : null;
      resolve(!!run);
    });
  });
}

export function currentStage() {
  return run ? run.stage : 'start';
}

export function logStep(stage, level, message) {
  if (!run) return;

  if (run.steps.length >= MAX_STEPS) {
    // Drop the oldest routine line, never a warning or an error.
    const oldestInfo = run.steps.findIndex((step) => step.level === 'info');
    run.steps.splice(oldestInfo >= 0 ? oldestInfo : 0, 1);
  }
  run.steps.push({ t: Date.now(), stage, level, message: String(message).slice(0, 300) });

  if (STAGES.indexOf(stage) > STAGES.indexOf(run.stage)) run.stage = stage;
  scheduleSave();
}

// Named moments behind the timings shown in the options page. First one wins.
export function markTime(name) {
  if (!run || run.marks[name]) return;
  run.marks[name] = Date.now();
  scheduleSave();
}

export function setResult(fields) {
  if (!run) return;
  Object.assign(run, fields);
  scheduleSave();
}

// running -> reached-payment -> confirmed / rac / waitlisted / booked /
// failed-after-payment / payment-failed / unknown; or stopped / failed earlier.
export function endRun(outcome, reason = '') {
  if (!run || !['running', 'reached-payment'].includes(run.outcome)) return saving;
  run.outcome = outcome;
  run.reason = String(reason).slice(0, 300);
  run.endedAt = Date.now();
  return flushRun();
}
