/**
 * tiny-test-runner.mjs — zero-dependency test runner.
 * Collects `test(name, fn)` cases and runs them sequentially (awaiting async fns).
 */

const cases = [];

export function test(name, fn) {
  cases.push({ name, fn });
}

export async function run() {
  let passed = 0;
  const failures = [];
  for (const { name, fn } of cases) {
    const startedAt = Date.now();
    try {
      await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TEST TIMED OUT after 10s')), 10000)
        ),
      ]);
      passed += 1;
      console.log('  ok   - ' + name + ' (' + (Date.now() - startedAt) + 'ms)');
    } catch (error) {
      failures.push({ name, error });
      console.log('  FAIL - ' + name + ' (' + (Date.now() - startedAt) + 'ms): ' + (error && error.message ? error.message : error));
    }
  }
  console.log('');
  console.log((total(failures)) + ' passed, ' + failures.length + ' failed, of ' + cases.length);
  if (failures.length > 0) {
    console.log('');
    console.log('Failures:');
    for (const f of failures) {
      console.log('  - ' + f.name + ': ' + (f.error && f.error.message ? f.error.message : f.error));
    }
  }
  return failures.length;
}

function total(failures) {
  return cases.length - failures.length;
}
