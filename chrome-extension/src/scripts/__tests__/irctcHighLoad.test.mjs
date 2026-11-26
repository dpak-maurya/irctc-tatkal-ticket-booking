/**
 * Test harness for irctcHighLoad.js (issue #86, PR #102 rework).
 *
 * Node-based (no jsdom dependency): the module touches `document`, `chrome`
 * and `window` globals, so we install minimal fakes before importing it.
 * Run with: node chrome-extension/src/scripts/__tests__/irctcHighLoad.test.mjs
 */

import { test, run } from './tiny-test-runner.mjs';

/* --------------------------------------------------------------------- */
/* Browser-global fakes (installed before the module under test loads)   */
/* --------------------------------------------------------------------- */

// Minimal element fake with just enough for querySelector/querySelectorAll.
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

// Controllable document fake. Understands comma-joined selector lists by
// splitting them, mirroring querySelectorAll.
const fakeDocument = {
  elements: new Map(), // selector -> FakeElement[]
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
globalThis.alert = (msg) => {
  globalThis.__alerts.push(String(msg));
};
globalThis.__alerts = [];

// chrome.storage fake (logger.js reads debugMode at import time).
globalThis.chrome = {
  storage: {
    local: {
      get(key, cb) {
        cb({});
      },
    },
  },
};

/* Import the module under test AFTER the globals exist. */
const highLoad = await import('../irctcHighLoad.js');

const {
  classifyIrctcError,
  errorIdentity,
  createRequestGate,
  retryBackoffMs,
  holdForPassengerPageMinWait,
  advanceOrRetry,
  findIrctcError,
  isLoaderVisible,
  waitForQuiet,
  backoffDelay,
} = highLoad;

/* --------------------------------------------------------------------- */
/* 1. Error classification                                               */
/* --------------------------------------------------------------------- */

test('classifyIrctcError: high-load toast is transient', () => {
  const result = classifyIrctcError(
    'We are experiencing high load, please retry. Ref: 1a2b3c. Client IP: 103.10.20.30'
  );
  if (!result || result.kind !== 'transient') {
    throw new Error('expected transient, got ' + JSON.stringify(result));
  }
});

test('classifyIrctcError: "unable to process request" is transient', () => {
  const result = classifyIrctcError('Unable to process request, please retry');
  if (!result || result.kind !== 'transient') {
    throw new Error('expected transient, got ' + JSON.stringify(result));
  }
});

test('classifyIrctcError: Akamai IP block is terminal', () => {
  const result = classifyIrctcError(
    'Access Denied. Client IP: 1.2.3.4. Request blocked by Akamai'
  );
  if (!result || result.kind !== 'terminal') {
    throw new Error('expected terminal, got ' + JSON.stringify(result));
  }
});

test('classifyIrctcError: date outside Tatkal ARP is terminal', () => {
  const result = classifyIrctcError(
    'Date outside Tatkal ARP. Please select a valid date.'
  );
  if (!result || result.kind !== 'terminal') {
    throw new Error('expected terminal, got ' + JSON.stringify(result));
  }
});

test('classifyIrctcError: session expired is terminal even with "please try again"', () => {
  // "session expired, please try again" must be terminal, not transient:
  // the transient list contains /please try again/ and is checked AFTER the
  // terminal list precisely for this case.
  const result = classifyIrctcError('Session expired, please try again');
  if (!result || result.kind !== 'terminal') {
    throw new Error('expected terminal, got ' + JSON.stringify(result));
  }
});

test('classifyIrctcError: captcha / sold-out / quota are NOT our errors', () => {
  for (const text of [
    'Captcha does not match',
    'No seats available',
    'Regret, waitlist',
    'Booking not allowed for this quota',
  ]) {
    if (classifyIrctcError(text) !== null) {
      throw new Error('expected null for: ' + text);
    }
  }
});

test('classifyIrctcError: unknown text is null (left alone)', () => {
  if (classifyIrctcError('Please fill all mandatory fields') !== null) {
    throw new Error('expected null for form-validation text');
  }
  if (classifyIrctcError('') !== null) {
    throw new Error('expected null for empty text');
  }
});

test('errorIdentity: rolling reference ids and IPs normalise to one identity', () => {
  const a = errorIdentity('High load, please retry. Ref: a1b2c3d4e5f6. Client IP: 10.20.30.40');
  const b = errorIdentity('High load, please retry. Ref: 9f8e7d6c5b4a. Client IP: 10.20.30.41');
  if (a !== b) {
    throw new Error('identities differ: ' + a + ' vs ' + b);
  }
});

/* --------------------------------------------------------------------- */
/* 2. Request gate — one step at a time                                  */
/* --------------------------------------------------------------------- */

test('createRequestGate: runs tasks strictly one after another', async () => {
  const gate = createRequestGate();
  const order = [];
  const makeTask = (label) => () =>
    gate.run(async () => {
      order.push('start' + label);
      await new Promise((r) => setTimeout(r, 20));
      order.push('end' + label);
      return label;
    });
  const [r0, r1, r2] = await Promise.all([makeTask(0)(), makeTask(1)(), makeTask(2)()]);
  if (r0 !== 0 || r1 !== 1 || r2 !== 2) throw new Error('results out of order');
  // Interleaving start0..end0..start1..end1..start2..end2 proves no overlap.
  const joined = order.join(',');
  if (joined !== 'start0,end0,start1,end1,start2,end2') {
    throw new Error('tasks overlapped: ' + joined);
  }
  if (gate.isBusy()) throw new Error('gate should be idle after all tasks');
});

test('createRequestGate: a rejected task does not break the chain', async () => {
  const gate = createRequestGate();
  let rejected = false;
  try {
    await gate.run(async () => {
      throw new Error('boom');
    });
  } catch (e) {
    rejected = true;
  }
  if (!rejected) throw new Error('expected rejection to propagate');
  const after = await gate.run(async () => 42);
  if (after !== 42) throw new Error('chain broken after rejection');
});

/* --------------------------------------------------------------------- */
/* 3. Backoff pacing                                                     */
/* --------------------------------------------------------------------- */

test('retryBackoffMs: grows, capped, with jitter, never below floor', () => {
  const seen = new Set();
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const ms = retryBackoffMs(attempt);
    if (ms < 200) throw new Error('below floor: ' + ms);
    if (ms > 11500) throw new Error('above cap+jitter: ' + ms);
    seen.add(ms);
  }
  if (seen.size < 2) throw new Error('jitter produced identical delays');
});

/* --------------------------------------------------------------------- */
/* 4. The 45-second passenger-page hold                                  */
/* --------------------------------------------------------------------- */

test('holdForPassengerPageMinWait: waits the full hold on the device clock', async () => {
  const ticks = [];
  const target = Date.now() + 700; // 0.7 s stand-in for the 45 s hold
  const startedAt = Date.now();
  await holdForPassengerPageMinWait(
    {
      tickMs: 50,
      keepAlive: async () => {},
      onTick: (remaining) => ticks.push(remaining),
    },
    target
  );
  const elapsed = Date.now() - startedAt;
  if (elapsed < 690) throw new Error('hold ended early: ' + elapsed + 'ms');
  if (ticks.length < 5) throw new Error('too few ticks: ' + ticks.length);
  if (ticks[0] < 650) throw new Error('first tick should report near-full hold');
});

test('holdForPassengerPageMinWait: resolves immediately when the hold is past', async () => {
  const startedAt = Date.now();
  await holdForPassengerPageMinWait({ tickMs: 250 }, Date.now() - 1000);
  const elapsed = Date.now() - startedAt;
  if (elapsed > 500) throw new Error('did not resolve immediately: ' + elapsed + 'ms');
});

/* --------------------------------------------------------------------- */
/* 5. Toast / loader reading (fake DOM)                                  */
/* --------------------------------------------------------------------- */

test('findIrctcError: reads a visible high-load toast', () => {
  fakeDocument.elements.set('.ui-toast-message-text-content', [
    new FakeElement('.ui-toast-message-text-content', true, 'We are experiencing high load, please retry'),
  ]);
  const found = findIrctcError();
  if (!found || found.kind !== 'transient') {
    throw new Error('expected transient toast, got ' + JSON.stringify(found && found.kind));
  }
  fakeDocument.elements.clear();
});

test('findIrctcError: skips faded-out toasts still in the DOM', () => {
  fakeDocument.elements.set('[role="alert"]', [
    new FakeElement('[role="alert"]', false, 'We are experiencing high load, please retry'),
  ]);
  if (findIrctcError() !== null) throw new Error('invisible toast should be ignored');
  fakeDocument.elements.clear();
});

test('isLoaderVisible: true for a painted overlay, false when cleared', () => {
  fakeDocument.elements.set('#loaderP', [new FakeElement('#loaderP', true)]);
  if (!isLoaderVisible()) throw new Error('loader should be visible');
  fakeDocument.elements.clear();
  fakeDocument.elements.set('#loaderP', [new FakeElement('#loaderP', false)]);
  if (isLoaderVisible()) throw new Error('cleared loader should be invisible');
  fakeDocument.elements.clear();
});

test('isLoaderVisible: detects bare "Please Wait..." text', () => {
  const withChildren = new FakeElement('div', true, '');
  withChildren.children.push(new FakeElement('span', true));
  const bareText = new FakeElement('div', true, 'Please Wait...');
  fakeDocument.elements.set('div', [withChildren, bareText]);
  if (!isLoaderVisible()) throw new Error('bare "Please Wait..." text should count as busy');
  fakeDocument.elements.clear();
});

test('waitForQuiet: true once the page stops being busy', async () => {
  fakeDocument.elements.set('#loaderP', [new FakeElement('#loaderP', true)]);
  const quietPromise = waitForQuiet({ settleMs: 300, timeoutMs: 3000, pollMs: 50 });
  // Clear the loader after a moment so the page goes quiet.
  setTimeout(() => fakeDocument.elements.set('#loaderP', []), 400);
  const quiet = await quietPromise;
  if (!quiet) throw new Error('expected quiet after loader cleared');
  fakeDocument.elements.clear();
});

/* --------------------------------------------------------------------- */
/* 6. advanceOrRetry — the transition wrapper                            */
/* --------------------------------------------------------------------- */

test('advanceOrRetry: resolves ok when the target appears', async () => {
  fakeDocument.elements.set('app-train-list', [new FakeElement('app-train-list', true)]);
  const result = await advanceOrRetry({
    name: 'train search',
    target: { appear: 'app-train-list' },
    budgetMs: 5000,
  });
  if (!result.ok) throw new Error('expected ok, got ' + JSON.stringify(result));
  fakeDocument.elements.clear();
});

test('advanceOrRetry: stops immediately on a terminal error', async () => {
  // The login modal is still on screen (target = disappear), and IRCTC answered
  // with a session-expired toast that no retry can fix.
  fakeDocument.elements.set('app-login', [new FakeElement('app-login', true)]);
  fakeDocument.elements.set('[role="alert"]', [
    new FakeElement('[role="alert"]', true, 'Session expired, please login again'),
  ]);
  let retries = 0;
  const result = await advanceOrRetry({
    name: 'login',
    target: { disappear: 'app-login' },
    retryAction: async () => {
      retries += 1;
    },
    waitMs: 60000,
    budgetMs: 60000,
  });
  if (result.ok) throw new Error('expected failure on terminal error');
  if (result.reason !== 'terminal') throw new Error('expected terminal, got ' + result.reason);
  if (retries !== 0) throw new Error('terminal error must not be retried, retries=' + retries);
  fakeDocument.elements.clear();
});

test('advanceOrRetry: retries a transient error until the page advances', async () => {
  // First poll: high-load toast, no train list. After the first retry action
  // the toast is gone and the train list appears.
  let actionRuns = 0;
  fakeDocument.elements.set('[role="alert"]', [
    new FakeElement('[role="alert"]', true, 'We are experiencing high load, please retry'),
  ]);
  fakeDocument.elements.set('app-train-list', []);

  const result = await advanceOrRetry({
    name: 'train search',
    target: { appear: 'app-train-list' },
    retryAction: async () => {
      actionRuns += 1;
      // Simulate IRCTC recovering: remove the toast, render the list.
      fakeDocument.elements.set('[role="alert"]', []);
      fakeDocument.elements.set('app-train-list', [new FakeElement('app-train-list', true)]);
    },
    waitMs: 15000,
    budgetMs: 15000,
    ceiling: 5,
    settleMs: 100,
    quietTimeoutMs: 200,
    backoffOptions: { firstMs: 100, maxMs: 200, jitterMs: 50 },
  });
  if (!result.ok) throw new Error('expected ok after recovery, got ' + JSON.stringify(result));
  if (actionRuns !== 1) throw new Error('expected exactly one retry action, got ' + actionRuns);
  fakeDocument.elements.clear();
});

test('advanceOrRetry: a plain timeout is NOT retried (no double-submit)', async () => {
  // No error toast, no target element: the page is merely slow. The old code
  // replayed the step here and double-submitted; the new code must wait, and
  // the overall waitMs bound must surface the slow page instead of hanging.
  fakeDocument.elements.set('app-train-list', []);
  fakeDocument.elements.set('[role="alert"]', []);
  let retries = 0;
  const result = await advanceOrRetry({
    name: 'seat selection',
    target: { appear: 'app-passenger-input' },
    retryAction: async () => {
      retries += 1;
    },
    waitMs: 600, // short for the test
  });
  if (result.ok) throw new Error('expected not-ok (timeout), got ok');
  if (result.reason !== 'timeout') throw new Error('expected timeout, got ' + result.reason);
  if (retries !== 0) throw new Error('plain timeout must not retry, retries=' + retries);
  fakeDocument.elements.clear();
});

test('advanceOrRetry: exhausted budget returns a failure, not a hang', async () => {
  // Persistent transient error that never recovers.
  fakeDocument.elements.set('[role="alert"]', [
    new FakeElement('[role="alert"]', true, 'We are experiencing high load, please retry'),
  ]);
  fakeDocument.elements.set('app-train-list', []);
  const result = await advanceOrRetry({
    name: 'train search',
    target: { appear: 'app-train-list' },
    retryAction: async () => {},
    waitMs: 10000,
    budgetMs: 1200, // short for the test
    ceiling: 3,
    settleMs: 100,
    quietTimeoutMs: 200,
    backoffOptions: { firstMs: 200, maxMs: 400, jitterMs: 50 },
  });
  if (result.ok) throw new Error('expected failure');
  if (result.reason !== 'exhausted' && result.reason !== 'terminal') {
    throw new Error('expected exhausted, got ' + result.reason);
  }
  fakeDocument.elements.clear();
});

test('backoffDelay alias is a function', () => {
  if (typeof backoffDelay !== 'function') throw new Error('backoffDelay missing');
  const ms = backoffDelay(1);
  if (typeof ms !== 'number' || ms < 200) throw new Error('bad backoffDelay value: ' + ms);
});

/* --------------------------------------------------------------------- */
/* Run                                                                   */
/* --------------------------------------------------------------------- */

const failures = await run();
process.exit(failures === 0 ? 0 : 1);
