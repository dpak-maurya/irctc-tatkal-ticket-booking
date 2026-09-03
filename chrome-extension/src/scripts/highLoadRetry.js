/**
 * Detection and retry helpers for IRCTC server-side errors (issue #86).
 *
 * During Tatkal peak IRCTC answers a click with an error toast instead of
 * navigating, so the DOM the automation waits for never appears and an unbounded
 * waitForElementToAppear() hangs the run.
 *
 * Three things a live Tatkal run showed, all handled below:
 *  1. Every rejection carries a fresh reference id, so raw text comparison reads
 *     each poll as a brand new error.
 *  2. The toast can appear while IRCTC's request is still in flight, so retrying
 *     on the toast alone double-submits the step.
 *  3. Each click opens a new server transaction - fast retries only add load.
 */

import Logger from './logger';

const WHITESPACE = /\s+/g;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The nodes that carry IRCTC's error text: PrimeNG toast internals plus the
// [role="alert"] it stamps on them.
export const ERROR_MESSAGE_DEFAULT = [
  '.ui-toast-message-text-content',
  '.ui-toast-detail',
  '.ui-toast-summary',
  '.ui-growl-item-container',
  '.toast-message',
  '[role="alert"]',
].join(', ');

// Close icons only - a.fa-remove is the passenger remove-row button here, so a
// general "any close button" list would delete a passenger.
export const ERROR_DISMISS_DEFAULT = [
  '.ui-toast-close-icon',
  '.toast-close-button',
  '.ui-growl-icon-close',
].join(', ');

// The high-load toast carries its own retry link, and clicking it is what makes
// IRCTC re-run the enquiry. One toast sits in the train list, one in the header.
export const ERROR_TOAST_LINK_DEFAULT = [
  '#divMain > div > app-train-list > p-toast > div > p-toastitem > div > div > a',
  'body > app-root > app-home > div.header-fix > app-header > p-toast > div > p-toastitem > div > div > a',
].join(', ');

// IRCTC blocks the page with a "Please Wait..." overlay while a request runs.
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

// Server-side hiccups: clicking again shortly after usually works.
const TRANSIENT_PATTERNS = [
  /we are experiencing high load/i,
  /high load/i,
  /unable to process (your |the )?request/i,
  /service (is )?(temporarily )?unavailable/i,
  /server (is )?busy/i,
  /internal server error/i,
  /request time[d]? ?out/i,
  /please retry/i,
  /please try again/i,
];

// Failures a re-click cannot fix. Checked before the transient list, because
// "session expired, please try again" also matches /please try again/.
const TERMINAL_PATTERNS = [
  /user\s*id|password|user name|username/i,
  /session (has )?expired|logged out/i,
  /maximum|limit exceeded/i,
];

// Not retryable and not this module's business: the captcha stage re-solves, the
// availability loop handles a sold-out train, and the booking-time gate covers
// quota windows. Matched first so none of them abort a healthy run.
const NOT_OUR_ERROR_PATTERNS = [
  /captcha/i,
  /no (seats|berth)|not available|waitlist|regret/i,
  /booking (is )?not allowed|quota/i,
];

// IRCTC stamps a reference id and the client IP into each rejection, and the id
// changes on every attempt. Strip anything volatile so repeats of one failure
// share an identity.
const VOLATILE_TOKENS = [
  /client\s*ip\s*:?\s*\S+/gi,
  /\b[0-9a-f]+(?:\.[0-9a-f]+){2,}\b/gi,
  /\b\d{5,}\b/g,
];

export function errorIdentity(rawText) {
  let identity = String(rawText || '');
  for (const token of VOLATILE_TOKENS) identity = identity.replace(token, ' ');
  return identity
    .replace(/[^a-z0-9 ]+/gi, ' ')
    .replace(WHITESPACE, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Classify on-screen text. Returns null for anything unrecognised: an unknown
 * message is more likely form validation than a server failure, and acting on it
 * would replay a step IRCTC already accepted.
 */
export function classifyIrctcError(rawText) {
  if (!rawText) return null;

  const message = String(rawText).replace(WHITESPACE, ' ').trim();
  if (!message) return null;

  if (NOT_OUR_ERROR_PATTERNS.some((pattern) => pattern.test(message))) return null;
  if (TERMINAL_PATTERNS.some((pattern) => pattern.test(message))) {
    return { message, identity: errorIdentity(message), kind: 'terminal' };
  }
  if (TRANSIENT_PATTERNS.some((pattern) => pattern.test(message))) {
    return { message, identity: errorIdentity(message), kind: 'transient' };
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
    if (node.offsetParent === null && node.getClientRects().length === 0) continue;

    const found = classifyIrctcError(node.innerText || node.textContent);
    if (found) return { ...found, node };
  }
  return null;
}

// Click the retry link inside the toast - the recovery IRCTC itself offers on the
// train list page. Returns true when a link was clicked.
export async function clickErrorToastLink({
  linkSelector = ERROR_TOAST_LINK_DEFAULT,
  click,
} = {}) {
  let link;
  try {
    link = document.querySelector(linkSelector);
  } catch (err) {
    Logger.error('Invalid error toast link selector:', linkSelector, err);
    return false;
  }
  if (!link || (link.offsetParent === null && link.getClientRects().length === 0)) return false;

  if (click) {
    await click(link);
  } else {
    link.click();
  }
  Logger.info('Clicked the retry link inside the IRCTC error toast.');
  return true;
}

// Close every visible toast, not only the one that matched: under load IRCTC
// stacks them and a leftover keeps satisfying findIrctcError() on the next poll.
export async function dismissIrctcError({
  dismissSelector = ERROR_DISMISS_DEFAULT,
  click,
} = {}) {
  let buttons;
  try {
    buttons = document.querySelectorAll(dismissSelector);
  } catch (err) {
    Logger.error('Invalid error dismiss selector:', dismissSelector, err);
    return false;
  }

  let dismissed = false;
  for (const button of buttons) {
    if (button.offsetParent === null && button.getClientRects().length === 0) continue;
    try {
      if (click) {
        await click(button);
      } else {
        button.click();
      }
      dismissed = true;
    } catch (err) {
      Logger.warn('Could not dismiss an IRCTC error toast:', err);
    }
  }
  return dismissed;
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
    if (node.offsetParent !== null || node.getClientRects().length) return true;
  }

  // Some pages show the overlay as plain "Please Wait..." text with none of the
  // classes above.
  for (const node of document.querySelectorAll('div, span, p, h4')) {
    if (node.children.length) continue;
    if (!/^please\s*wait\.{0,3}$/i.test((node.textContent || '').trim())) continue;
    if (node.offsetParent !== null || node.getClientRects().length) return true;
  }
  return false;
}

// Never click while a request is in flight. Returns false if the overlay outlives
// the wait, so the caller can decide to go ahead anyway.
export async function waitForLoaderToClear({
  selector = LOADER_DEFAULT,
  timeoutMs = 20000,
  pollMs = 250,
} = {}) {
  const startTime = Date.now();

  while (isLoaderVisible(selector)) {
    if (Date.now() - startTime >= timeoutMs) return false;
    await sleep(pollMs);
  }
  return true;
}

/**
 * Retry delay: 2.0-3.5s, 4.0-5.5s, 8.0-9.5s, then 10.0-11.5s.
 *
 * Exponential with a floor, because fast retries measurably do not work - each
 * click opens a new server transaction rather than re-driving the failed one.
 * The jitter keeps us off the same schedule as every other script in the window.
 */
export const BACKOFF_FLOOR_MS = 2000;
export const BACKOFF_CAP_MS = 10000;

export function backoffDelay(attempt) {
  const step = Math.min(BACKOFF_CAP_MS, BACKOFF_FLOOR_MS * 2 ** Math.max(0, attempt - 1));
  return step + Math.floor(Math.random() * 1500);
}

function hasAdvanced({ appear, disappear }) {
  if (appear) return !!document.querySelector(appear);
  if (disappear) return !document.querySelector(disappear);
  return false;
}

/**
 * Poll until the flow reaches the next page, IRCTC reports an error, or the
 * attempt window runs out. `target` is { appear: selector } or { disappear: selector }.
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
 * Wait until the page is genuinely idle: no loader, no error toast, both true
 * continuously for `settleMs`. Returns false if it never goes quiet - a stuck
 * toast must not deadlock the run.
 */
export async function waitForQuiet({
  errorSelector = ERROR_MESSAGE_DEFAULT,
  loaderSelector = LOADER_DEFAULT,
  settleMs = 1500,
  timeoutMs = 15000,
  pollMs = 250,
} = {}) {
  const startTime = Date.now();
  let quietSince = null;

  for (;;) {
    if (isLoaderVisible(loaderSelector) || findIrctcError(errorSelector)) {
      quietSince = null;
    } else {
      if (quietSince === null) quietSince = Date.now();
      if (Date.now() - quietSince >= settleMs) return true;
    }

    if (Date.now() - startTime >= timeoutMs) return false;
    await sleep(pollMs);
  }
}

/**
 * Wait for a booking step to land, retrying whenever IRCTC answers with a
 * transient error.
 *
 * A plain timeout is NOT retried: with no page change and no error message IRCTC
 * is merely slow, and replaying the step could double-submit something it already
 * accepted. Resolves to { ok: true } or
 * { ok: false, reason: 'terminal' | 'exhausted', error }.
 */
export async function advanceOrRetry({
  name,
  target,
  retryAction,
  errorSelector = ERROR_MESSAGE_DEFAULT,
  dismissSelector = ERROR_DISMISS_DEFAULT,
  linkSelector = ERROR_TOAST_LINK_DEFAULT,
  loaderSelector = LOADER_DEFAULT,
  attempts = 12,
  attemptTimeoutMs = 20000,
  settleMs = 1500,
  budgetMs = 150000,
  click,
}) {
  const runStart = Date.now();
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

    // A toast painted while the overlay is still up does not mean the step
    // finished - its request has not come back yet. Let it land before counting a
    // failure, otherwise the retry fires on top of an in-flight submit.
    if (isLoaderVisible(loaderSelector)) {
      Logger.info(`[${name}] error shown while a request is still in flight - letting it finish first.`);
      await waitForLoaderToClear({ selector: loaderSelector });
      if (hasAdvanced(target)) {
        Logger.info(`[${name}] page moved on once the request landed - no retry needed.`);
        return { ok: true };
      }
      // The message may have been superseded; re-read instead of trusting it.
      if (!findIrctcError(errorSelector)) continue;
    }

    attempt += 1;
    const elapsedMs = Date.now() - runStart;

    if (attempt > attempts) {
      Logger.error(`[${name}] giving up after ${attempts} retry(s). Last error:`, error.message);
      return { ok: false, reason: 'exhausted', error };
    }

    // A wall-clock stop as well as a count: with exponential backoff the last
    // attempts are slow, and a seat held through minutes of rejections is gone.
    if (elapsedMs >= budgetMs) {
      Logger.error(`[${name}] giving up after ${Math.round(elapsedMs / 1000)}s of retrying. Last error:`, error.message);
      return { ok: false, reason: 'exhausted', error };
    }

    const wait = backoffDelay(attempt);
    Logger.warn(
      `[${name}] IRCTC is under load (retry ${attempt}/${attempts}, ${Math.round(elapsedMs / 1000)}s in, next in ${Math.round(wait / 1000)}s):`,
      error.message,
    );

    // Prefer IRCTC's own retry link when the toast offers one.
    const usedLink = await clickErrorToastLink({ linkSelector, click });
    if (!usedLink) await dismissIrctcError({ dismissSelector, click });

    await sleep(wait);

    // Do not re-fire into a page that is still working or still showing the
    // rejection - that is what turned one bad click into a burst of them.
    if (!(await waitForQuiet({ errorSelector, loaderSelector, settleMs }))) {
      Logger.warn(`[${name}] page never settled; retrying anyway.`);
    }

    // The page may have moved on while we were backing off.
    if (hasAdvanced(target)) {
      Logger.info(`[${name}] page moved on during backoff - no retry needed.`);
      return { ok: true };
    }

    if (retryAction) await retryAction();
  }
}
