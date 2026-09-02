/**
 * Detection and retry helpers for IRCTC server-side errors.
 *
 * During Tatkal peak, IRCTC frequently answers a click with an error toast
 * ("We are experiencing High Load - Please retry") instead of navigating to the
 * next page. The DOM the automation is waiting for never appears, so an
 * unbounded waitForElementToAppear() sits there forever and the booking run
 * dies quietly with no retry - reported in issue #86.
 *
 * Every selector, pattern list and delay below is taken from a build that has
 * been run through live Tatkal windows, so nothing here is inferred from
 * PrimeNG documentation: the toast text nodes, the close icons, the "click
 * here" retry link inside the toast and the loader list are the elements IRCTC
 * actually renders.
 */

import Logger from './logger';

const WHITESPACE = /\s+/g;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The nodes that actually carry IRCTC's error text. PrimeNG toast internals
// plus the generic [role="alert"] it stamps on them. Comma-joined so it stays
// overridable from the Selector Editor when IRCTC changes its markup.
export const ERROR_MESSAGE_DEFAULT = [
  '.ui-toast-message-text-content',
  '.ui-toast-detail',
  '.ui-toast-summary',
  '.ui-growl-item-container',
  '.toast-message',
  '[role="alert"]',
].join(', ');

// Close icons only. Deliberately NOT a general "any close button" list: a
// dialog accept button or a .fa-remove would match unrelated controls - in this
// extension a.fa-remove is the passenger remove-row button.
export const ERROR_DISMISS_DEFAULT = [
  '.ui-toast-close-icon',
  '.toast-close-button',
  '.ui-growl-icon-close',
].join(', ');

// Under load the high-load toast carries its own retry link, and clicking that
// link is what makes IRCTC re-run the enquiry - closing the toast alone leaves
// the train row without its class tabs. Both paths are the ones IRCTC renders:
// one toast inside the train list, one in the page header.
export const ERROR_TOAST_LINK_DEFAULT = [
  '#divMain > div > app-train-list > p-toast > div > p-toastitem > div > div > a',
  'body > app-root > app-home > div.header-fix > app-header > p-toast > div > p-toastitem > div > div > a',
].join(', ');

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

// Server-side hiccups. The page did not move on, but clicking again shortly
// after usually works - this is the whole point of the retry loop.
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
// The user has to step in, so the run stops instead of burning Tatkal seconds.
const TERMINAL_PATTERNS = [
  /user\s*id|password|user name|username/i,
  /session (has )?expired|logged out/i,
  /maximum|limit exceeded/i,
];

// Also not retryable, but not this module's business either: the captcha stage
// re-solves on its own, the availability loop already handles a train with no
// seats, and the quota/booking-window messages are covered by the booking-time
// gate. Reporting any of them here would abort a run that is working fine, so
// they are matched first and treated as "nothing to see".
const NOT_OUR_ERROR_PATTERNS = [
  /captcha/i,
  /no (seats|berth)|not available|waitlist|regret/i,
  /booking (is )?not allowed|quota/i,
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

  if (NOT_OUR_ERROR_PATTERNS.some((pattern) => pattern.test(message))) return null;
  if (TERMINAL_PATTERNS.some((pattern) => pattern.test(message))) {
    return { message, kind: 'terminal' };
  }
  if (TRANSIENT_PATTERNS.some((pattern) => pattern.test(message))) {
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
    if (node.offsetParent === null && node.getClientRects().length === 0) continue;

    const found = classifyIrctcError(node.innerText || node.textContent);
    if (found) return { ...found, node };
  }
  return null;
}

/**
 * Click the retry link inside the high-load toast, if IRCTC rendered one.
 *
 * This is the recovery IRCTC itself offers on the train list page: the toast
 * says the enquiry could not be processed and provides the link that re-runs
 * it. Returns true when a link was clicked.
 */
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

/**
 * Close every visible toast/growl so the next attempt is not blocked by one.
 *
 * Clicking all of them rather than only the one that matched is intentional:
 * under load IRCTC stacks several toasts and a leftover one keeps satisfying
 * findIrctcError() on the following poll. Safe because the selector list holds
 * nothing but toast close icons.
 */
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

  // Some IRCTC pages show the overlay as plain "Please Wait..." text with none
  // of the classes above, so match that leaf node too.
  for (const node of document.querySelectorAll('div, span, p, h4')) {
    if (node.children.length) continue;
    if (!/^please\s*wait\.{0,3}$/i.test((node.textContent || '').trim())) continue;
    if (node.offsetParent !== null || node.getClientRects().length) return true;
  }
  return false;
}

// Never click while a request is still in flight. Returns false if the overlay
// outlives the wait, so the caller can decide to go ahead anyway.
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
 * Retry delay: first retry fast because the server usually clears instantly,
 * then 4-6s of jitter so we do not hammer IRCTC in lockstep with everyone else.
 */
export function backoffDelay(attempt) {
  if (attempt <= 1) return 1000;
  return Math.floor(Math.random() * 2001) + 4000;
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
  timeoutMs = 10000,
  pollMs = 300,
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
  linkSelector = ERROR_TOAST_LINK_DEFAULT,
  loaderSelector = LOADER_DEFAULT,
  attempts = 12,
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

    // Prefer IRCTC's own retry link when the toast offers one.
    const usedLink = await clickErrorToastLink({ linkSelector, click });
    if (!usedLink) await dismissIrctcError({ dismissSelector, click });

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
