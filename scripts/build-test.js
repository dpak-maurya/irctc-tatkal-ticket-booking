/**
 * Test build: builds the current branch into builds/ (never dist/) and stamps
 * it, so you can always tell which build Chrome has loaded:
 *   - name     "Tatkal Ticket Booking (TEST 6.4.0)"
 *   - version  "6.4.0 · feat/timed-availability-flow · beeb979"
 *   - build-info.json, used for the toolbar badge ("6.4"), the "TEST" chip in
 *     the settings page, and the version recorded in Booking History logs.
 *
 *   npm run build:test            -> builds/test/  (always the same folder: Chrome
 *                                    keeps your settings; rebuild, then Reload)
 *   npm run build:test -- --keep  -> builds/<version>-<branch>/  (one folder per
 *                                    branch, side by side; turn on one at a time)
 *
 * `npm run build` (the release build in dist/) is not affected.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const git = (args) => execSync(`git ${args}`, { cwd: root }).toString().trim();

const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const branch = git('rev-parse --abbrev-ref HEAD');
const commit = git('rev-parse --short HEAD');
const dirty = git('status --porcelain --untracked-files=no') !== '';
const keep = process.argv.includes('--keep');

const folder = keep ? `${version}-${branch.replace(/[^a-z0-9.-]+/gi, '-')}` : 'test';
const out = path.join(root, 'builds', folder);

const run = (command, env = {}) =>
  execSync(command, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });

// Same webpack builds as `npm run build`, written to `out` instead of dist/.
run('npm run build:chrome', { BUILD_OUT: out });
run('npm run build:react', { BUILD_OUT: out });

const info = {
  version,
  badge: version.split('.').slice(0, 2).join('.'), // "6.4" on the toolbar icon
  branch,
  commit: dirty ? `${commit}+` : commit, // "+": built with uncommitted changes
  builtAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(out, 'build-info.json'), `${JSON.stringify(info, null, 2)}\n`);

const manifestPath = path.join(out, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.name = `${manifest.name} (TEST ${version})`;
manifest.version_name = `${version} · ${branch} · ${info.commit}`;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

// Branches with Firefox support also get a Firefox copy next to it.
const firefoxScript = path.join(__dirname, 'build-firefox.js');
if (fs.existsSync(firefoxScript)) {
  run(`node "${firefoxScript}"`, { BUILD_OUT: out, FIREFOX_OUT: `${out}-firefox` });
}

const relative = path.relative(root, out);
console.log(`\nTest build ${manifest.version_name}`);
console.log(`  Chrome/Edge: Load unpacked -> ${relative}/`);
if (fs.existsSync(`${out}-firefox`)) console.log(`  Firefox:     about:debugging -> ${relative}-firefox/manifest.json`);
console.log('  Toolbar badge and the TEST chip in settings show which build is loaded.');
