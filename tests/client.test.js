import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { workspace } from './fixtures.js';

const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) };
globalThis.window = { addEventListener() {} };
const interval = globalThis.setInterval;
globalThis.setInterval = () => 0;
const compiled = await build({ entryPoints: ['src/services/api.ts'], bundle: true, platform: 'node', format: 'esm', write: false, define: { 'import.meta.env': '{}' } });
const { ApiService } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
globalThis.setInterval = interval;
const key = 'DARU_WORK_OS_STATE_V24';
const metadataKey = `${key}_SYNC`;
beforeEach(t => { storage.clear(); t.mock.method(globalThis, 'setTimeout', () => 0); });

test('loading is deduplicated and cannot autosave before hydration', async () => {
  let resolve;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Promise(done => { resolve = done; }); };
  const service = new ApiService(false);
  const first = service.loadInitialState(); const second = service.loadInitialState();
  service.saveState(workspace());
  assert.equal(calls, 1); assert.equal(storage.has(key), false);
  resolve(Response.json({ success: true, revision: 3, state: workspace() }));
  assert.equal(await first, await second);
  assert.equal(calls, 1);
  assert.equal(JSON.parse(storage.get(metadataKey)).dirty, false);
});

test('offline pending changes win over stale remote data and conflicts block upload', async () => {
  const local = workspace(); local.projects[0].name = 'Offline edit';
  storage.set(key, JSON.stringify(local)); storage.set(metadataKey, JSON.stringify({ dirty: true, revision: 1 }));
  let posts = 0;
  globalThis.fetch = async (_url, options) => { if (options.method === 'POST') posts++; return Response.json({ success: true, revision: 2, state: workspace() }); };
  const service = new ApiService(false);
  assert.equal((await service.loadInitialState()).projects[0].name, 'Offline edit');
  service.saveState(local); await service.flush();
  assert.equal(posts, 0); assert.equal(JSON.parse(storage.get(key)).projects[0].name, 'Offline edit');
});

test('sequential autosave keeps newest edit and advances server revisions', async () => {
  const posted = []; let release;
  globalThis.fetch = async (_url, options) => {
    if (options.method !== 'POST') return Response.json({ success: true, revision: 0, state: workspace() });
    const body = JSON.parse(options.body); posted.push(body);
    if (posted.length === 1) return new Promise(resolve => { release = () => resolve(Response.json({ success: true, revision: 1 })); });
    return Response.json({ success: true, revision: 2 });
  };
  const service = new ApiService(false); await service.loadInitialState();
  const first = workspace(); first.projects[0].name = 'First'; service.saveState(first);
  const saving = service.flush();
  const second = workspace(); second.projects[0].name = 'Second'; service.saveState(second);
  await service.flush(); assert.equal(posted.length, 1);
  release(); await saving;
  assert.deepEqual(posted.map(body => body.revision), [0, 1]);
  assert.equal(posted[1].state.projects[0].name, 'Second');
  assert.equal(JSON.parse(storage.get(metadataKey)).dirty, false);
});

test('failed save preserves a dirty local copy for retry', async () => {
  globalThis.fetch = async (_url, options) => options.method === 'POST' ? Response.json({ success: false, error: 'Disk full' }, { status: 500 }) : Response.json({ success: true, revision: 0, state: workspace() });
  const service = new ApiService(false); await service.loadInitialState();
  service.saveState(workspace()); await service.flush();
  assert.equal(JSON.parse(storage.get(metadataKey)).dirty, true);
  let status; service.subscribeStatus(value => { status = value; });
  assert.equal(status.error, 'Disk full'); assert.equal(status.isOnline, false);
});

test('health check marks offline without claiming a cloud connection', async () => {
  const service = new ApiService(false);
  globalThis.fetch = async () => { throw new Error('Offline'); };
  assert.equal(await service.checkHealth(), false);
  let status; service.subscribeStatus(value => { status = value; });
  assert.equal(status.isOnline, false); assert.equal(status.cloudRedisConnected, false);
});

test('zero budgets survive normalization through remote and local storage', async () => {
  const state = workspace(); state.financialReport.estimatedRealBurn = 0; state.financialReport.hardFloor = 0;
  globalThis.fetch = async () => Response.json({ success: true, state, revision: 0 });
  const service = new ApiService(false); const loaded = await service.loadInitialState();
  assert.equal(loaded.financialReport.estimatedRealBurn, 0); assert.equal(loaded.financialReport.hardFloor, 0);
});

test('html fallback response (e.g. static spa rewrite) is treated as offline without json parsing syntax error', async () => {
  const service = new ApiService(false);
  globalThis.fetch = async () => new Response('<!doctype html><html><body>SPA fallback</body></html>', {
    status: 200,
    headers: { 'content-type': 'text/html' },
  });
  const state = await service.loadInitialState();
  assert.ok(state, 'local state must be loaded even when server responds with HTML');
  let status;
  service.subscribeStatus(value => { status = value; });
  assert.equal(status.isOnline, false);
  assert.equal(status.error, null);

  service.saveState(workspace());
  await service.flush();
  assert.equal(status.isOnline, false);
  assert.equal(status.error, null);
});

test('parseProjectTitle formats client prefixes and category details without truncation', async () => {
  const compiledSel = await build({ entryPoints: ['src/utils/selectors.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
  const { parseProjectTitle } = await import(`data:text/javascript;base64,${Buffer.from(compiledSel.outputFiles[0].text).toString('base64')}`);

  // 1. Client - Project
  const r1 = parseProjectTitle('Umi Elly — LMS Azhariyah');
  assert.equal(r1.client, 'Umi Elly');
  assert.equal(r1.title, 'LMS Azhariyah');
  assert.equal(r1.detail, null);

  // 2. Project (Category / Detail)
  const r2 = parseProjectTitle('Setting KAEL (Core Product)');
  assert.equal(r2.client, null);
  assert.equal(r2.title, 'Setting KAEL');
  assert.equal(r2.detail, 'Core Product');

  // 3. Project with person in parentheses
  const r3 = parseProjectTitle('Logo Azharuna (Ustadz Ifdol)');
  assert.equal(r3.client, null);
  assert.equal(r3.title, 'Logo Azharuna');
  assert.equal(r3.detail, 'Ustadz Ifdol');

  // 4. Plain title
  const r4 = parseProjectTitle('Rancangan LMS Al Madroj');
  assert.equal(r4.client, null);
  assert.equal(r4.title, 'Rancangan LMS Al Madroj');
  assert.equal(r4.detail, null);

  // 5. Empty/fallback
  const r5 = parseProjectTitle('');
  assert.equal(r5.title, 'Untitled Task');
});

