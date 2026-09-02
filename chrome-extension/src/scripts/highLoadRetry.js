/**
 * Detection and retry helpers for IRCTC server-side errors.
 *
 * During Tatkal peak, IRCTC frequently answers a click with an error toast
 * ("We are experiencing high load...") instead of navigating to the next page.
 * The DOM the automation is waiting for never appears, so an unbounded
 * waitForElementToAppear() sits there forever and the booking run dies quietly
 * with no retry - reported in issue #86.
 *
 * These helpers find that message, decide whether replaying the step can help,
 * and let the caller retry with backoff.
 */

import Logger from './logger';

const WHITESPACE = /\s+/g;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// IRCTC renders errors in PrimeNG toasts/growls/dialogs plus a few bespoke
// classes. Kept as one comma-joined selector so it stays overridable from the
// Selector Editor when IRCTC changes its markup.
export const ERROR_MESSAGE_DEFAULT = [
  'p-toast .ui-toast-summary',
  'p-toast .ui-toast-detail',
  '.ui-growl-message',
  '.ui-messages-error',
  'p-dialog .ui-dialog-content',
  'p-confirmdialog .ui-confirmdialog-message',
  '.error_txt',
  '.errorMsg',
  '.error-msg',
  '.text-danger',
  '[role="alert"]',
].join(', ');

export const ERROR_DISMISS_DEFAULT = [
  '.ui-toast-close-icon',
  '.ui-toast-icon-close',
  '.ui-growl-icon-close',
  // The inline high-load message rendered into the train row is a PrimeNG
  // <p-messages>, whose close control is .ui-messages-close - not a toast icon.
  '.ui-messages-close',
  '.ui-messages-icon-close',
  '.ui-confirmdialog-acceptbutton',
  '.ui-dialog-titlebar-close',
  '.fa-close',
  '.fa-remove',
].join(', ');

// The dismiss button is only looked for inside the widget that holds the error,
// so a close/accept button belonging to some other open dialog (the login modal,
// the from/to confirmation) can never be clicked by mistake.
const ERROR_CONTAINERS = [
  '.ui-toast-message',
  'p-toast',
  '.ui-growl-item',
  '.ui-messages',
  '.ui-messages-error',
  'p-messages',
  'p-confirmdialog',
  'p-dialog',
].join(', ');

// How far up from the error text to look for a close control when the message
// has no PrimeNG wrapper at all. Bounded so the search cannot wander out of the
// element that owns the error and start clicking unrelated page controls.
const INLINE_CONTAINER_DEPTH = 4;

// IRCTC blocks the page with a "Please Wait..." overlay while a request is in
// flight. Re-clicking a stage button then is either swallowed or double-fires.
export const LOADER_DEFAULT = [
  '#loaderP',
  '.loader',
  '.loadding',
  '.spinner',
  '.spinner-border',
  'ngx-spinner',
  '.ngx-spinner-overlay',
  '.loader-container',
].join(', ');

// Replaying a step against one of these only burns Tatkal seconds - the user
// has to step in. Matched first, because "session expired, please try again"
// is terminal even though it also matches a transient pattern.
const TERMINAL_PATTERNS = [
  /session (has )?(expired|timed out)/,
  /invalid session/,
  /(you (have been|are) )?logged out/,
  /login again/,
  /(invalid|incorrect|wrong) (user ?id|user name|username|password|login|credentials?)/,
  /user ?id .*(does not exist|not found)/,
  /account .*(locked|blocked|disabled|suspended|deactivated)/,
  /(un)?authori[sz]ed/,
  /(maximum|max) .*(limit|booking).*(reached|exceeded)/,
  /exceeded .*(maximum|limit)/,
];

// Server-side hiccups. The page did not move on, but clicking again shortly
// after usually works - this is the whole point of the retry loop.
const TRANSIENT_PATTERNS = [
  /high (load|demand|traffic|volume)/,
  /heavy (load|traffic|rush|demand)/,
  /(server|site|service|system|network) (is )?(too )?(busy|down)/,
  /(temporarily|currently) (unavailable|down|not available)/,
  /service unavailable/,
  /unable to (process|perform|complete|proceed)/,
  /(could not|couldn'?t|cannot) (be )?(process|processed|complete|completed)/,
  /try again/,
  /something went wrong/,
  /technical (error|issue|difficult)/,
  /timed? ?out/,
  /too many (requests|users|attempts|hits)/,
  /connection (failed|error|refused|reset|lost)/,
  /internal server error/,
  /(invalid|incorrect|wrong) captcha/,
  /captcha .*(invalid|incorrect|wrong|mismatch|does not match)/,
  /booking .*not .*(open|started)/,
  /refresh (the )?page/,
  /request (has )?(timed out|failed)/,
];

/**
 * Classify a piece of on-screen text.
 * Returns null for anything unrecognised - an unknown message is far more
 * likely to be ordinary form validation than a server failure, and acting on
 * it would replay steps that IRCTC already accepted.
 */
export function classifyIrctcError(rawText) {
  if (!rawText) return null;

  const message = String(rawText).replace(WHITESPACE, ' ').trim();
  if (!message) return null;

  const text = message.toLowerCase();

  if (TERMINAL_PATTERNS.some((pattern) => pattern.test(text))) {
    return { message, kind: 'terminal' };
  }
  if (TRANSIENT_PATTERNS.some((pattern) => pattern.test(text))) {
    return { message, kind: 'transient' };
  }
  return null;
}

// Look through every visible error container for a message we understand.
export function findIrctcError(errorSelector = ERROR_MESSAGE_DEFAULT) {
  let nodes;
  try {
    nodes = document.querySelectorAll(errorSelector);
  } catch (error) {
    Logger.error('Invalid error message selector:', errorSelector, error);
    return null;
  }

  for (const node of nodes) {
    // Toasts stay in the DOM after they fade out, so skip anything not painted.
    if (node.getClientRects().length === 0) continue;

    const found = classifyIrctcError(node.textContent);
    if (found) return { ...found, node };
  }
  return null;
}

// Visible close control inside `container`, or null.
function visibleDismissButton(container, dismissSelector) {
  let button;
  try {
    button = container.querySelector(dismissSelector);
  } catch (err) {
    Logger.error('Invalid error dismiss selector:', dismissSelector, err);
    return null;
  }
  if (!button || button.getClientRects().length === 0) return null;
  return button;
}

// Locate the close control that belongs to THIS error.
// Under load IRCTC does not always use a toast: it renders the high-load message
// straight into the train row, replacing the class tabs and the Book Now button.
// That message has its own close icon, and until it is clicked the tabs stay
// gone - so refreshTrain() finds no tab and the availability loop spins without
// ever re-clicking anything.
function findDismissButton(node, dismissSelector) {
  const known = node.closest ? node.closest(ERROR_CONTAINERS) : null;
  if (known) {
    const button = visibleDismissButton(known, dismissSelector);
    if (button) return button;
  }

  // No PrimeNG wrapper: walk a bounded number of ancestors instead of giving up.
  let current = node.parentElement;
  for (let depth = 0; current && depth < INLINE_CONTAINER_DEPTH; depth += 1) {
    const button = visibleDismissButton(current, dismissSelector);
    if (button) return button;
    current = current.parentElement;
  }
  return null;
}

// Close the toast/dialog/inline message so the next attempt is not blocked by it.
export async function dismissIrctcError({
  error,
  dismissSelector = ERROR_DISMISS_DEFAULT,
  click,
} = {}) {
  const node = error && error.node;
  if (!node) return false;

  const button = findDismissButton(node, dismissSelector);
  if (!button) return false;

  if (click) {
    await click(button);
  } else {
    button.click();
  }
  return true;
}

// True while IRCTC is blocking the page with its loading overlay.
export function isLoaderVisible(selector = LOADER_DEFAULT) {
  let nodes;
  try {
    nodes = document.querySelectorAll(selector);
  } catch (err) {
    Logger.error('Invalid loader selector:', selector, err);
    return false;
  }

  for (const node of nodes) {
    if (node.getClientRects().length > 0) return true;
  }
  return false;
}

// Never click while a request is still in flight. Returns false if the overlay
// outlives the wait, so the caller can decide to go ahead anyway.
export async function waitForLoaderToClear({
  selector = LOADER_DEFAULT,
  timeoutMs = 15000,
  pollMs = 200,
} = {}) {
  const startTime = Date.now();

  while (isLoaderVisible(selector)) {
    if (Date.now() - startTime >= timeoutMs) return false;
    await sleep(pollMs);
  }
  return true;
}

// Exponential backoff with jitter, capped so Tatkal retries stay quick.
export function backoffDelay(attempt, baseMs = 700, maxMs = 6000) {
  const growth = Math.min(baseMs * Math.pow(2, attempt - 1), maxMs);
  return Math.round(growth + Math.random() * 300);
}

function hasAdvanced({ appear, disappear }) {
  if (appear) return !!document.querySelector(appear);
  if (disappear) return !document.querySelector(disappear);
  return false;
}

/**
 * Poll until the flow reaches the next page, IRCTC reports an error, or the
 * attempt window runs out.
 *
 * `target` is either { appear: selector } or { disappear: selector }.
 */
export async function waitForOutcome({
  target,
  errorSelector = ERROR_MESSAGE_DEFAULT,
  timeoutMs = 20000,
  pollMs = 250,
}) {
  const startTime = Date.now();

  for (;;) {
    // Checked before the error so a stale toast cannot mask real progress.
    if (hasAdvanced(target)) return { status: 'advanced' };

    const error = findIrctcError(errorSelector);
    if (error) return { status: 'error', error };

    if (Date.now() - startTime >= timeoutMs) return { status: 'timeout' };

    await sleep(pollMs);
  }
}

/**
 * Wait until the error that was just retried is off the screen.
 *
 * Without this the retry loop re-reads the same still-painted message on the
 * next poll and counts it as a fresh failure, so the entire attempt budget can
 * be spent in a couple of seconds against one error.
 * Returns false if the message outlives the wait; the caller carries on either
 * way, because a stuck message must not deadlock the run.
 */
export async function waitForErrorToClear({
  errorSelector = ERROR_MESSAGE_DEFAULT,
  previous,
  timeoutMs = 8000,
  pollMs = 250,
} = {}) {
  const startTime = Date.now();

  for (;;) {
    const current = findIrctcError(errorSelector);
    if (!current || (previous && current.message !== previous)) return true;
    if (Date.now() - startTime >= timeoutMs) return false;
    await sleep(pollMs);
  }
}

/**
 * Wait for a booking step to land, retrying it whenever IRCTC answers with a
 * transient error.
 *
 * A plain timeout is NOT retried: with no page change and no error message
 * IRCTC is merely slow, and replaying the step could double-submit something it
 * has already accepted (re-running the passenger page would duplicate rows).
 * In that case this keeps waiting, exactly as the old unbounded wait did.
 *
 * Resolves to { ok: true } or { ok: false, reason: 'terminal' | 'exhausted', error }.
 */
export async function advanceOrRetry({
  name,
  target,
  retryAction,
  errorSelector = ERROR_MESSAGE_DEFAULT,
  dismissSelector = ERROR_DISMISS_DEFAULT,
  loaderSelector = LOADER_DEFAULT,
  attempts = 5,
  attemptTimeoutMs = 20000,
  click,
}) {
  let attempt = 0;

  for (;;) {
    const outcome = await waitForOutcome({ target, errorSelector, timeoutMs: attemptTimeoutMs });

    if (outcome.status === 'advanced') {
      if (attempt > 0) Logger.info(`[${name}] recovered after ${attempt} retry(s).`);
      return { ok: true };
    }

    if (outcome.status === 'timeout') {
      Logger.warn(`[${name}] still waiting - page has not changed and IRCTC reported nothing yet.`);
      continue;
    }

    const { error } = outcome;

    if (error.kind === 'terminal') {
      Logger.error(`[${name}] IRCTC returned a blocking error:`, error.message);
      return { ok: false, reason: 'terminal', error };
    }

    attempt += 1;
    if (attempt > attempts) {
      Logger.error(`[${name}] giving up after ${attempts} retry(s). Last error:`, error.message);
      return { ok: false, reason: 'exhausted', error };
    }

    Logger.warn(`[${name}] IRCTC is under load (retry ${attempt}/${attempts}):`, error.message);

    const dismissed = await dismissIrctcError({ error, dismissSelector, click });
    if (!dismissed) {
      Logger.warn(`[${name}] no close control on the error - retrying without dismissing it.`);
    }

    await sleep(backoffDelay(attempt));

    // Clicking while IRCTC's overlay is up is either swallowed or double-fires.
    await waitForLoaderToClear({ selector: loaderSelector });

    // The page may have moved on while we were backing off.
    if (hasAdvanced(target)) {
      Logger.info(`[${name}] page moved on during backoff - no retry needed.`);
      return { ok: true };
    }

    if (retryAction) await retryAction();

    // Hold here until the message clears, otherwise the next waitForOutcome()
    // sees the SAME error still painted and burns another attempt instantly -
    // the whole retry budget can be spent in a couple of seconds that way.
    await waitForErrorToClear({ errorSelector, previous: error.message });
  }
}
