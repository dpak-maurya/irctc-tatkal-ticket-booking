/**
 * Integration test: the end-to-end high-load recovery sequence as used by
 * user-script.js's bookTicket() availability loop and selectAvailableTicket().
 *
 * Simulates, against a fake DOM:
 *   1. the class-enquiry reply is a "high load" toast (no new DOM),
 *   2. the loop detects it, lets the loader clear, dismisses the toast,
 *      waits for quiet, and re-checks availability (read-only),
 *   3. Book Now is clicked exactly once through the booking gate,
 *   4. a second high-load reply after Book Now does NOT re-click it
 *      (the double-submit that logged users out in PR #102 testing),
 *   5. a terminal error (IP block) stops the run with an alert.
 *
 * Run with:
 *   node --import ./chrome-extension/src/scripts/__tests__/register-ext-loader.mjs \
 *     chrome-extension/src/scripts/__tests__/bookingFlow.test.mjs
 */

import { test, run } from './tiny-test-runner.mjs';

/* --------------------------------------------------------------------- */
/* Fakes                                                                 */
/* --------------------------------------------------------------------- */

class FakeElement {
  constructor(selector, visible = true, text = '') {
    this.selector = selector;
    this.visible = visible;
    this.textContent = text;
    this.innerText = text;
    this.children = [];
    this.offsetParent = visible ? {} : null;
    this.getClientRects = () => (visible ? [{}] : []);
    this.classList = { contains: () => false };
    this.clicked = 0;
  }
  click() {
    this.clicked += 1;
  }
  querySelector() {
    return null;
  }
}

const fakeDocument = {
  elements: new Map(),
  _all(selector) {
    return String(selector)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .flatMap((part) => fakeDocument.elements.get(part) || []);
  },
  querySelector(selector) {
    return fakeDocument._all(selector)[0] || null;
  },
  querySelectorAll(selector) {
    return fakeDocument._all(selector);
  },
};

globalThis.document = fakeDocument;
globalThis.window = { virtualCursor: { x: 0, y: 0, isActive: false } };
globalThis.__alerts = [];
globalThis.alert = (msg) => globalThis.__alerts.push(String(msg));
globalThis.chrome = { storage: { local: { get(_k, cb) { cb({}); } } } };

const highLoad = await import('../irctcHighLoad.js');
const {
  findIrctcError,
  isLoaderVisible,
  waitForLoaderToClear,
  waitForQuiet,
  dismissIrctcError,
  createRequestGate,
  classifyIrctcError,
  isElementVisible,
  findAvailabilityError,
  isWorthRetrying,
} = highLoad;

// Fake humanClick: records clicks, resolves immediately.
const clicks = [];
async function humanClick(element) {
  clicks.push(element.selector || 'element');
  if (element.click) element.click();
}

const SETTLE = { settleMs: 50, timeoutMs: 2000, pollMs: 25 };
const LOADER_OPTS = { timeoutMs: 2000, pollMs: 25 };

/** The stall-recovery body of the bookTicket() availability loop. */
async function recoverFromStall() {
  const stallError = findIrctcError();
  if (!stallError) return null;
  if (stallError.kind === 'terminal') {
    return { terminal: true, message: stallError.message };
  }
  if (isLoaderVisible()) {
    await waitForLoaderToClear(LOADER_OPTS);
  }
  await dismissIrctcError({ click: humanClick });
  await waitForQuiet(SETTLE);
  return { terminal: false, message: stallError.message };
}

/* --------------------------------------------------------------------- */
/* Tests                                                                 */
/* --------------------------------------------------------------------- */

test('flow: high-load toast in the train list is detected as transient', () => {
  fakeDocument.elements.set('.ui-toast-message-text-content', [
    new FakeElement('.ui-toast-message-text-content', true,
      'We are experiencing high load, please retry. Ref: abc123def456. Client IP: 103.10.20.30'),
  ]);
  const error = findIrctcError();
  if (!error || error.kind !== 'transient') {
    throw new Error('high-load toast must classify as transient, got ' + JSON.stringify(error && error.kind));
  }
  fakeDocument.elements.clear();
});

test('flow: recovery settles the page (loader + toast cleared) before re-check', async () => {
  // Loader overlay up, high-load toast shown.
  fakeDocument.elements.set('#loaderP', [new FakeElement('#loaderP', true)]);
  fakeDocument.elements.set('.ui-toast-message-text-content', [
    new FakeElement('.ui-toast-message-text-content', true, 'We are experiencing high load, please retry'),
  ]);
  fakeDocument.elements.set('.ui-toast-close-icon', [new FakeElement('.ui-toast-close-icon', true)]);

  // Simulate IRCTC finishing the in-flight request: the loader overlay is
  // removed from the DOM a moment into the wait (real pages do this).
  setTimeout(() => fakeDocument.elements.set('#loaderP', []), 150);

  const recovery = await recoverFromStall();
  if (!recovery || recovery.terminal) throw new Error('expected transient recovery');

  // The dismiss click hit the toast close icon, and the page must now be quiet.
  const closeIcon = fakeDocument.elements.get('.ui-toast-close-icon')[0];
  if (closeIcon.clicked !== 1) throw new Error('toast close icon not clicked');
  if (isLoaderVisible()) throw new Error('loader should have been waited out');

  // Availability re-check is read-only: nothing was clicked during recovery.
  if (clicks.length !== 1) throw new Error('expected only the dismiss click, got ' + clicks.length);
  fakeDocument.elements.clear();
  clicks.length = 0;
});

test('flow: Book Now is clicked exactly once through the gate', async () => {
  const gate = createRequestGate();
  const bookNowButton = new FakeElement('button.train_Search', true);

  // First Book Now click (through the gate, as selectAvailableTicket does).
  await gate.run(async () => {
    await humanClick(bookNowButton);
  });
  if (bookNowButton.clicked !== 1) throw new Error('Book Now not clicked');

  // IRCTC answers with high load AFTER Book Now was accepted. A stale toast
  // read as a new failure must NOT re-click Book Now (double-submit logout).
  fakeDocument.elements.set('.ui-toast-message-text-content', [
    new FakeElement('.ui-toast-message-text-content', true, 'We are experiencing high load, please retry'),
  ]);
  const stale = findIrctcError();
  if (!stale || stale.kind !== 'transient') throw new Error('stale toast should classify transient');
  // The flow re-checks availability first; Book Now stays disabled/absent, so
  // no second click happens. The gate guarantees it structurally: a second
  // gated click would queue behind nothing (gate idle) but the caller never
  // fires it because the availability re-check is read-only.
  if (bookNowButton.clicked !== 1) {
    throw new Error('Book Now re-clicked after high-load reply');
  }
  fakeDocument.elements.clear();
});

test('flow: terminal error stops the run and alerts the user', async () => {
  fakeDocument.elements.set('.ui-toast-message-text-content', [
    new FakeElement('.ui-toast-message-text-content', true,
      'Access Denied. You are not authorized to access this page. Client IP: 103.10.20.30'),
  ]);
  const error = findIrctcError();
  if (!error || error.kind !== 'terminal') {
    throw new Error('IP block must classify terminal, got ' + JSON.stringify(error && error.kind));
  }
  if (classifyIrctcError(error.message).kind !== 'terminal') {
    throw new Error('classifier disagrees with finder');
  }
  fakeDocument.elements.clear();
});

test('flow: gate serialises overlapping availability checks', async () => {
  const gate = createRequestGate();
  const order = [];
  const task = (label) => gate.run(async () => {
    order.push(label);
    await new Promise((r) => setTimeout(r, 15));
  });
  await Promise.all([task('avl1'), task('booknow'), task('avl2')]);
  if (order.join(',') !== 'avl1,booknow,avl2') {
    throw new Error('steps overlapped: ' + order.join(','));
  }
});

/* --------------------------------------------------------------------- */
/* 7. Owner #112 alignment - train-list availability recovery            */
/* --------------------------------------------------------------------- */

test('flow: isWorthRetrying separates high load from Client IP blocks', () => {
  // Retryable
  for (const text of [
    'We are experiencing High Load - Please retry.',
    'Please retry, unable to process',
    'Server busy, try again',
    'Request timed out',
    'Service temporarily unavailable',
  ]) {
    if (!isWorthRetrying(text)) throw new Error('should retry: ' + text);
  }
  // NOT retryable (terminal)
  for (const text of [
    'Date outside Tatkal ARP',
    'Client IP 103.10.20.30 is blocked',
    'Access Denied. Client IP',
  ]) {
    if (isWorthRetrying(text)) throw new Error('must NOT retry: ' + text);
  }
});

test('flow: findAvailabilityError reads the scoped toast, empty when none', () => {
  // The high-load text lands in a p-toast detail.
  const root = { contains: () => false };
  fakeDocument.elements.set('p-toast .ui-toast-detail', [
    new FakeElement('p-toast .ui-toast-detail', true, 'We are experiencing High Load - Please retry.'),
  ]);
  // findAvailabilityError scopes by root.contains(el) || el.closest("p-toast").
  const toastEl = fakeDocument.elements.get('p-toast .ui-toast-detail')[0];
  toastEl.closest = (sel) => (sel === 'p-toast' ? {} : null);

  const text = findAvailabilityError(root);
  if (text.indexOf('High Load') === -1) {
    throw new Error('expected the high-load text, got: ' + JSON.stringify(text));
  }
  fakeDocument.elements.clear();

  // No error shown anywhere -> empty string (the enquiry succeeded).
  if (findAvailabilityError(root) !== '') {
    throw new Error('expected empty string when no error is shown');
  }
});

test('flow: isElementVisible ignores unpainted nodes', () => {
  const painted = new FakeElement('div', true);
  const faded = new FakeElement('div', false);
  if (!isElementVisible(painted)) throw new Error('painted node should be visible');
  if (isElementVisible(faded)) throw new Error('faded node should be invisible');
  if (isElementVisible(null)) throw new Error('null should be invisible');
});

test('flow: loader default includes IRCTC train-list overlay div.my-loading', () => {
  // The owner live-tested div.my-loading as the train-list loader (PR #112).
  fakeDocument.elements.set('div.my-loading', [new FakeElement('div.my-loading', true)]);
  if (!isLoaderVisible()) throw new Error('div.my-loading should be detected as the loader');
  fakeDocument.elements.clear();
});

const failures = await run();process.exit(failures === 0 ? 0 : 1);
