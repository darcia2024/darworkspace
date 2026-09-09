import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { APP_VERSION } from '../shared/version.js';

// The version used to live in four places and drifted apart silently.
// These assertions keep shared/version.js the single source of truth.

test('package.json version matches shared/version.js', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.version, APP_VERSION, 'package.json "version" drifted from APP_VERSION');
});

test('service worker cache name carries the current app version', () => {
  const sw = fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  const match = sw.match(/const CACHE_NAME = '([^']+)'/);
  assert.ok(match, 'CACHE_NAME constant not found in public/sw.js');
  assert.equal(
    match[1],
    `daru-work-os-v${APP_VERSION}`,
    'public/sw.js CACHE_NAME drifted from APP_VERSION',
  );
});

test('version string is a plain semver triple', () => {
  assert.match(APP_VERSION, /^\d+\.\d+\.\d+$/);
});
