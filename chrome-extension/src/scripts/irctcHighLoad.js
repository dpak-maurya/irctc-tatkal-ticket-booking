/* global module */

/**
 * irctcHighLoad.js — high-load recovery, request serialisation and the
 * passenger-page minimum hold for the booking flow (issue #86).
 *
 * Why this module exists (from PR #102 review, owner dpak-maurya):
 *   During the Tatkal window IRCTC answers many clicks with an error toast —
 *   "We are experiencing high load, please retry" — instead of navigating to
 *   the next page. Every booking transition waited on an unbounded
 *   waitForElementToAppear(), so a single high-load reply stalled the whole run
 *   forever with no retry. Retrying naively is just as bad: IRCTC processes one
 *   request per session at a time, so a fast re-click (or a stale toast read as
 *   a brand-new failure) is seen as a double click and logs the user out.
 *
 * What a live run needs, and what this module provides:
 *   1. classifyIrctcError() — transient (high load / busy / timeout) vs
 *      terminal (IP block, date outside Tatkal ARP, session expired) vs
 *      unknown (left alone — most likely form validation). Rolling reference
 *      ids in the toast are normalised so one rejection is not counted many
 *      times.
 *   2. findIrctcError() / dismissIrctcError() / clickErrorToastLink() — read
 *      the visible PrimeNG toasts, close them (IRCTC stacks toasts under load),
 *      and prefer IRCTC's own retry link when the toast offers one.
 *   3. isLoaderVisible() / waitForIrctcIdle() — never send a request while the
 *      "Please Wait..." overlay is up; that is how two requests end up in
 *      flight at once.
 *   4. createRequestGate() — serialises booking steps so exactly one step runs
 *      at a time per content-script session. This is the structural fix for the
 *      double-submit logout.
 *   5. backoffDelay() — capped exponential backoff with jitter. Fast retries
 *      measurably do not work at Tatkal peak; each click opens a new server
 *      transaction.
 *   6. holdForPassengerPageMinWait() — after Book Now, IRCTC holds the
 *      passenger page's Continue for a minimum time (~45 s by default). The
 *      hold is measured on the device clock, keeps the session warm, and never
 *      fires a booking request into the window.
 *
 * All selectors are overridable through the repo's Selector Editor
 * (selectorDefaults.js ERROR category) so the automation keeps working when
 * IRCTC changes its markup — the selectors here are IRCTC's real toast /
 * loader elements, not generic guesses.
 */

import Logger from './logger';

const WHITESPACE = /\s+/g;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------------ */
/* 1. Error classification                                                   */
/* ------------------------------------------------------------------------ */

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

// Close icons only — a.fa-remove is the passenger remove-row button on the
// passenger page, so a general "any close button" list could delete a passenger.
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
// div.my-loading is IRCTC's own train-list overlay (live-tested, PR #112); the
// rest cover the other pages' spinners.
export const LOADER_DEFAULT = [
  'div.my-loading',
  '#loaderP',
  '.loader',
  '.loadding',
  '.spinner',
  '.spinner-border',
  'ngx-spinner',
  '.ngx-spinner-overlay',
  '.loader-container',
].join(', ');

// Where IRCTC surfaces a failed availability enquiry on the train-list page:
// the p-toast detail, or an empty col-xs-12 cell inside the train row (the
// "We are experiencing High Load - Please retry." text lands in both).
export const AVAILABILITY_ERROR_DEFAULT = [
  'p-toast .ui-toast-detail',
  'app-train-avl-enq div.col-xs-12:not(:has(*))',
].join(
);
// Server-side hiccups: waiting a moment and trying again usually works.
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

// Failures a re-click can never fix. Checked before the transient list because
// "session expired, please try again" also matches /please try again/.
// NOTE: a bare "client ip" must NOT be terminal — IRCTC stamps the client IP
// into EVERY rejection, including the high-load toast, so matching it there
// would misclassify high load as an IP block. Only the Akamai/WAF block
// phrasing is terminal.
const TERMINAL_PATTERNS = [
  /akama|access denied|you are not authorized|request blocked|bot detected|automated access|blocked by.*(firewall|waf)|ip.*(blocked|banned)/i,
  /outside.*(tatkal|arp|advance reservation)|beyond.*(tatkal|arp|advance reservation)|date.*not.*bookable/i,
  /user\s*id|password|user name|username|invalid credentials/i,
  /session (has )?expired|logged out|please login again/i,
  /maximum|limit exceeded/i,
];

// Not this module's business, and must never abort a healthy run: the captcha
// stage re-solves itself, the availability loop handles a sold-out train, and
// the booking-time gate covers quota windows.
const NOT_OUR_ERROR_PATTERNS = [
  /captcha/i,
  /no (seats|berth)|not available|waitlist|regret/i,
  /booking (is )?not allowed|quota/i,
];

// IRCTC stamps a reference id and the client IP into each rejection, and the
// id changes on every attempt. Strip anything volatile so repeats of one
// failure share an identity: the IP, dotted hex/uuid ids, bare "Ref:"/"Reference"
// tokens (hex or numeric), and long digit runs.
const VOLATILE_TOKENS = [
  /client\s*ip\s*:?\s*\S+/gi,
  /\b(?:ref(?:erence)?(?:\s*(?:id|no|number|#))?\s*[:#]?\s*)[0-9a-z]{6,}\b/gi,
  /\b[0-9a-f]{8,}(?:-[0-9a-f]{4,}){2,}\b/gi,
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
 * message is more likely form validation than a server failure, and acting on
 * it would replay a step IRCTC already accepted.
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

/** Convenience: true when the context looks transient/retryable. */
export function isTransientError(text) {
  const cls = classifyIrctcError(text);
  return !!cls && cls.kind === 'transient';
}

/** Convenience: true when the context looks terminal/unfixable. */
export function isTerminalError(text) {
  const cls = classifyIrctcError(text);
  return !!cls && cls.kind === 'terminal';
}

/* ------------------------------------------------------------------------ */
/* 1b. Train-list availability helpers (live-tested selectors, PR #112)      */
/* ------------------------------------------------------------------------ */

// Only painted elements count — IRCTC keeps faded toasts and empty cells in
// the DOM, and reading them would read a stale error as a brand-new one.
export function isElementVisible(element) {
  if (!element) return false;
  return element.offsetParent !== null || element.getClientRects().length > 0;
}

// The text IRCTC showed where the availability should be, or '' when the last
// enquiry actually succeeded (nothing to read).
export function findAvailabilityError(rootElement, availabilityErrorSelector = AVAILABILITY_ERROR_DEFAULT) {
  let nodes;
  try {
    nodes = document.querySelectorAll(availabilityErrorSelector);
  } catch (error) {
    Logger.error('Invalid availability error selector:', availabilityErrorSelector, error);
    return '';
  }

  const shown = Array.from(nodes).find((element) =>
    isElementVisible(element) && element.textContent.trim() &&
    (rootElement.contains(element) || element.closest('p-toast'))
  );
  return shown ? shown.textContent.trim().replace(/\s+/g, ' ') : '';
}

// Asking again helps with a busy server. It cannot help with a wrong date or
// quota, and it makes things worse while the IP is blocked ("Client IP").
export function isWorthRetrying(errorText) {
  if (!errorText) return false;
  if (/client ip/i.test(errorText)) return false;
  return /high load|retry|try again|unable to|temporar|busy|timed? ?out|unavailable|technical/i.test(errorText);
}

/* ------------------------------------------------------------------------ */
/* 2. Reading the toasts                                                     */
/* ------------------------------------------------------------------------ */

function isPainted(node) {
  return node.offsetParent !== null || node.getClientRects().length > 0;
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
    if (!isPainted(node)) continue;

    const found = classifyIrctcError(node.innerText || node.textContent);
    if (found) return { ...found, node };
  }
  return null;
}

// Click the retry link inside the toast — the recovery IRCTC itself offers on
// the train list page. Returns true when a link was clicked.
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
  if (!link || !isPainted(link)) return false;

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
    if (!isPainted(button)) continue;
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

/* ------------------------------------------------------------------------ */
/* 3. Loading-settle wait — never retry into a busy UI                       */
/* ------------------------------------------------------------------------ */

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
    if (isPainted(node)) return true;
  }

  // Some pages show the overlay as plain "Please Wait..." text with none of
  // the classes above.
  for (const node of document.querySelectorAll('div, span, p, h4')) {
    if (node.children.length) continue;
    if (!/^please\s*wait\.{0,3}$/i.test((node.textContent || '').trim())) continue;
    if (isPainted(node)) return true;
  }
  return false;
}

// Never click while a request is in flight. Returns false if the overlay
// outlives the wait, so the caller can decide to go ahead anyway.
export async function waitForLoaderToClear({
  selector = LOADER_DEFAULT,
  timeoutMs = 20000,
  pollMs = 250,
} = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (!isLoaderVisible(selector)) return true;
    await sleep(pollMs);
  }
  Logger.warn('Loader overlay still visible after waiting', timeoutMs, 'ms.');
  return false;
}

// Wait until the page is genuinely quiet: no loader, no error toast, both true
// continuously for `settleMs`. Returns false if it never goes quiet — a stuck
// loader is surfaced by the caller's budget, not here.
export async function waitForQuiet({
  errorSelector = ERROR_MESSAGE_DEFAULT,
  loaderSelector = LOADER_DEFAULT,
  settleMs = 1500,
  timeoutMs = 15000,
  pollMs = 250,
} = {}) {
  const startTime = Date.now();
  let quietSince = 0;

  while (Date.now() - startTime < timeoutMs) {
    const busy = isLoaderVisible(loaderSelector) || !!findIrctcError(errorSelector);
    if (!busy) {
      if (!quietSince) quietSince = Date.now();
      if (Date.now() - quietSince >= settleMs) return true;
    } else {
      quietSince = 0;
    }
    await sleep(pollMs);
  }
  return false;
}

/* ------------------------------------------------------------------------ */
/* 4. Session request gate — one booking step at a time                      */
/* ------------------------------------------------------------------------ */

/**
 * Create a serialising gate. Only one "unit of work" runs at a time;
 * everything else queues. Used to guarantee we never run two booking steps
 * (two clicks, two availability checks) at the same moment — IRCTC treats a
 * concurrent pair as a double click and logs the session out.
 */
export function createRequestGate() {
  let tail = Promise.resolve();
  let inFlight = false;
  let queuedCount = 0;

  return {
    /**
     * Run `fn` exclusively. While another task is running, this call waits
     * (it does NOT run concurrently). Returns fn's result / propagates its
     * rejection.
     */
    async run(fn) {
      queuedCount++;
      // Chain onto the tail so tasks run strictly one-after-another.
      const previous = tail;
      const runTask = previous.then(
        () => {
          inFlight = true;
          return fn();
        },
        () => {
          // Previous task rejected — still let this one run.
          inFlight = true;
          return fn();
        },
      );
      tail = runTask.catch(() => {
        /* keep the chain alive; errors are surfaced to the caller */
      });
      try {
        return await runTask;
      } finally {
        inFlight = false;
        queuedCount--;
      }
    },
    /** True while a task is running. */
    isBusy() {
      return inFlight;
    },
    /** How many tasks are waiting or running (diagnostics/tests). */
    queueSize() {
      return queuedCount;
    },
  };
}

/* ------------------------------------------------------------------------ */
/* 5. Backoff with jitter — retry pacing                                     */
/* ------------------------------------------------------------------------ */

export const BACKOFF_FLOOR_MS = 1000;
export const BACKOFF_CAP_MS = 10000;

/** Alias of retryBackoffMs, kept for readability at call sites. */
export const backoffDelay = retryBackoffMs;

/**
 * Compute a retry delay with capped exponential backoff + jitter.
 * First retry is quick (IRCTC high-load clears fast at Tatkal open);
 * later retries back off so we don't hammer a struggling server.
 *
 * @param {number} attempt      1-based attempt number
 * @param {object} [options]
 * @param {number} [options.firstMs=1000]      first retry delay
 * @param {number} [options.maxMs=10000]       cap
 * @param {number} [options.jitterMs=1500]     ±jitter window
 */
export function retryBackoffMs(attempt, options) {
  const { firstMs = BACKOFF_FLOOR_MS, maxMs = BACKOFF_CAP_MS, jitterMs = 1500 } = options || {};
  const base = Math.min(maxMs, firstMs * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * (2 * jitterMs + 1)) - jitterMs;
  return Math.max(200, base + jitter);
}

/**
 * How long one step may spend recovering.
 *
 * The bound is the clock, not a number of attempts: what expires is the seat,
 * and with exponential backoff a fixed count is worth anywhere between 30 s
 * and several minutes. This also keeps high-load recovery out of the options
 * page — there is nothing to switch off or set to 0.
 */
export const RETRY_BUDGET_MS = 150000;

// Derived stop so the loop is finite even if the clock misbehaves: no step can
// retry more often than its budget could pay for at the shortest delay.
export const RETRY_CEILING = Math.ceil(RETRY_BUDGET_MS / 200) + 1;

/* ------------------------------------------------------------------------ */
/* 6. The proper 45-second hold (passenger-page minimum wait)                */
/* ------------------------------------------------------------------------ */

/**
 * After Book Now, IRCTC's passenger page intentionally holds Continue until a
 * minimum time has passed (~45 s on the trains we checked, General and Tatkal
 * alike). Retrying into that window only adds requests and can look like a
 * double click.
 *
 * This helper waits EXACTLY until `targetEpochMs` (device clock), keeping the
 * session warm during the wait (optional `keepAlive` hook, e.g. a lightweight
 * re-sync of the page state), and NEVER fires a booking request into the
 * window. It resolves as soon as the hold is satisfied.
 *
 * @param {object}   deps
 * @param {number}   targetEpochMs  device-clock epoch (ms) when the hold ends
 * @param {() => Promise<void>} [deps.keepAlive] periodic session-warmth hook
 * @param {number} [deps.tickMs=250] progress tick
 * @param {(remainingMs:number)=>void} [deps.onTick] progress callback
 */
export async function holdForPassengerPageMinWait(deps, targetEpochMs) {
  const { keepAlive, tickMs = 250, onTick } = deps || {};
  const startedAt = Date.now();
  let lastKeepAlive = 0;

  const tick = () => {
    const remaining = Math.max(0, targetEpochMs - Date.now());
    if (typeof onTick === 'function') {
      try {
        onTick(remaining);
      } catch {
        /* progress reporting must never break the hold */
      }
    }
    return remaining;
  };

  // Initial tick so the UI shows the full hold time immediately.
  let remaining = tick();

  while (remaining > 0) {
    await sleep(Math.min(tickMs, remaining));

    // Keep the session warm during the hold, at most ~1/s.
    if (typeof keepAlive === 'function' && Date.now() - lastKeepAlive > 1000) {
      lastKeepAlive = Date.now();
      try {
        await keepAlive();
      } catch {
        /* warmth is best-effort */
      }
    }

    remaining = tick();
  }

  // Defensive: if the device clock drifted backwards, still wait the delta.
  const elapsed = Date.now() - startedAt;
  if (elapsed < 0) {
    await sleep(-elapsed);
  }
}

/* ------------------------------------------------------------------------ */
/* 7. One transition, with recovery — advanceOrRetry()                        */
/* ------------------------------------------------------------------------ */

/**
 * Wait for a page transition to land, retrying the step while IRCTC keeps
 * answering with a transient error.
 *
 * `target` is `{ appear: selector }` (wait for the next page's component) or
 * `{ disappear: selector }` (wait for the current page's component to go
 * away, e.g. the login form after submitting credentials).
 *
 * `retryAction` re-fires the step (click Search, click Book Now, submit the
 * passenger form, ...). It runs only on a recognised transient error — a plain
 * timeout is NOT retried: with no page change and no error message IRCTC is
 * merely slow, and replaying the step could double-submit something it already
 * accepted.
 *
 * Two clocks bound the wait so a transition can never hang the run again:
 *   - `waitMs` (default 60 s) bounds the whole transition, errors or not —
 *     a slow page is surfaced instead of spinning forever like the old
 *     unbounded waitForElementToAppear().
 *   - `budgetMs` (default 150 s) bounds only the recovery: it is measured from
 *     the FIRST rejection, so a page that is merely slow never spends a retry
 *     budget it has not started using.
 *
 * Resolves to `{ ok: true }` or
 * `{ ok: false, reason: 'terminal' | 'exhausted' | 'timeout', error?, attempts, elapsedMs }`.
 */
export async function advanceOrRetry({
  name,
  target,
  retryAction,
  errorSelector = ERROR_MESSAGE_DEFAULT,
  dismissSelector = ERROR_DISMISS_DEFAULT,
  linkSelector = ERROR_TOAST_LINK_DEFAULT,
  loaderSelector = LOADER_DEFAULT,
  click,
  waitMs = 60000,
  budgetMs = RETRY_BUDGET_MS,
  ceiling = RETRY_CEILING,
  settleMs = 1500,
  quietTimeoutMs = 8000,
  backoffOptions,
} = {}) {
  const hasAdvanced = () => {
    if (target && target.appear) {
      return !!document.querySelector(target.appear);
    }
    if (target && target.disappear) {
      return !document.querySelector(target.disappear);
    }
    return false;
  };

  const startedAt = Date.now();
  let attempt = 0;
  let firstFailureAt = 0;
  let lastIdentity = '';

  for (;;) {
    // Checked before the error so a stale toast cannot mask real progress.
    if (hasAdvanced()) return { ok: true };

    const error = findIrctcError(errorSelector);
    if (error) {
      if (!firstFailureAt) firstFailureAt = Date.now();

      // One rejection may be re-read for a while (the toast lingers in the
      // DOM after it fades). Count each distinct failure once.
      if (error.identity !== lastIdentity) {
        lastIdentity = error.identity;
        Logger.warn(`[${name}] IRCTC reported an error:`, error.message);
      }
    }

    if (error && error.kind === 'terminal') {
      Logger.error(`[${name}] IRCTC returned a blocking error:`, error.message);
      return { ok: false, reason: 'terminal', error, attempts: attempt };
    }

    // An error shown while a request is still in flight means the page has not
    // finished the step we asked for — its request has not come back yet. Let
    // it land before counting a failure, otherwise the retry fires on top of an
    // in-flight submit.
    if (error && isLoaderVisible(loaderSelector)) {
      Logger.info(`[${name}] error shown while a request is still in flight — letting it finish first.`);
      await waitForLoaderToClear({ selector: loaderSelector });
      continue;
    }

    const elapsedMs = firstFailureAt ? Date.now() - firstFailureAt : 0;
    const waitingMs = Date.now() - startedAt;

    if (error && (elapsedMs >= budgetMs || attempt >= ceiling)) {
      Logger.error(
        `[${name}] giving up after ${attempt} retry(ies) over ${Math.round(elapsedMs / 1000)}s. Last error:`,
        error.message,
      );
      return { ok: false, reason: 'exhausted', error, attempts: attempt, elapsedMs };
    }

    // The whole transition is bounded too: a page that is merely slow (no error,
    // no progress) must not spin forever like the old unbounded wait.
    if (waitingMs >= waitMs) {
      Logger.error(`[${name}] transition did not complete within ${Math.round(waitingMs / 1000)}s.`);
      return { ok: false, reason: 'timeout', attempts: attempt, elapsedMs: waitingMs };
    }

    if (!error) {
      // No error and no progress: the page is simply slow. Keep waiting exactly
      // as the old code did — replaying a step here is what double-submits.
      await sleep(250);
      continue;
    }

    attempt += 1;
    const wait = retryBackoffMs(attempt, backoffOptions);
    Logger.warn(
      `[${name}] IRCTC is under load (retry ${attempt}, ${Math.round(elapsedMs / 1000)}s of ${Math.round(budgetMs / 1000)}s used, next in ${Math.round(wait / 1000)}s):`,
      error.message,
    );

    // Prefer IRCTC's own retry link when the toast offers one.
    const usedLink = await clickErrorToastLink({ linkSelector, click });
    if (!usedLink) await dismissIrctcError({ dismissSelector, click });

    await sleep(wait);

    // Do not re-fire into a page that is still working or still showing the
    // rejection — that is what turned one bad click into a burst of them.
    const quiet = await waitForQuiet({ errorSelector, loaderSelector, settleMs, timeoutMs: quietTimeoutMs });
    if (!quiet) Logger.warn(`[${name}] page never settled; retrying anyway.`);

    // The page may have moved on while we were backing off.
    if (hasAdvanced()) {
      Logger.info(`[${name}] page moved on during backoff — no retry needed.`);
      return { ok: true };
    }

    if (retryAction) await retryAction();
  }
}

/* ------------------------------------------------------------------------ */
/* Export                                                                    */
/* ------------------------------------------------------------------------ */

export const api = {
  classifyIrctcError,
  isTransientError,
  isTerminalError,
  isElementVisible,
  findAvailabilityError,
  isWorthRetrying,
  AVAILABILITY_ERROR_DEFAULT,
  errorIdentity,
  findIrctcError,
  clickErrorToastLink,
  dismissIrctcError,
  isLoaderVisible,
  waitForLoaderToClear,
  waitForQuiet,
  createRequestGate,
  backoffDelay: retryBackoffMs,
  retryBackoffMs,
  holdForPassengerPageMinWait,
  advanceOrRetry,
  delay: sleep,
  _patterns: { TERMINAL_PATTERNS, TRANSIENT_PATTERNS, NOT_OUR_ERROR_PATTERNS },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
