import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseManager } from '../server/db.js';
import { createAppServer } from '../server/index.js';
import { createCloudStore } from '../server/cloud.js';
import { syncToObsidianVault } from '../server/obsidianSync.js';
import { workspace, transaction } from './fixtures.js';

function database(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'daru-audit-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return { dir, db: new DatabaseManager(path.join(dir, 'state.json')) };
}
test('database persistence, revisions, backup, and restart', t => {
  const { db } = database(t);
  db.saveState(workspace(), 0);
  db.addTransaction(transaction());
  assert.equal(new DatabaseManager(db.file).getState().financialReport.totalLiquidBalance, 1200);
  assert.equal(JSON.parse(fs.readFileSync(`${db.file}.bak`, 'utf8')).revision, 1);
  assert.throws(() => db.saveState(workspace(), 0), { status: 409 });
});
test('corrupt database is never reset or overwritten', t => {
  const { db } = database(t);
  fs.writeFileSync(db.file, '{broken');
  assert.throws(() => new DatabaseManager(db.file));
  assert.equal(fs.readFileSync(db.file, 'utf8'), '{broken');
});
test('failed disk write does not change memory or acknowledge new state', t => {
  const { db } = database(t);
  db.saveState(workspace());
  fs.mkdirSync(`${db.file}.bak`);
  assert.throws(() => db.addTransaction(transaction()));
  assert.equal(db.getTransactions().length, 0);
  assert.equal(JSON.parse(fs.readFileSync(db.file, 'utf8')).revision, 1);
});
test('Obsidian export is dynamic and preserves handwritten dashboard', t => {
  const { dir, db } = database(t); db.saveState(workspace());
  fs.mkdirSync(path.join(dir, '00 Dashboard'));
  fs.writeFileSync(path.join(dir, '00 Dashboard', 'Today.md'), 'Handwritten');
  const result = syncToObsidianVault(db.getState(), dir);
  assert.equal(result.success, true);
  assert.equal(result.syncedFiles.length, 3);
  assert.match(fs.readFileSync(path.join(dir, 'Daru Work OS Exports', 'Current Priorities.md'), 'utf8'), /Client/);
  assert.match(fs.readFileSync(path.join(dir, 'Daru Work OS Exports', 'Project Update Report.md'), 'utf8'), /^# Laporan Update Project/m);
  assert.equal(fs.readFileSync(path.join(dir, '00 Dashboard', 'Today.md'), 'utf8'), 'Handwritten');
  assert.equal(syncToObsidianVault(db.getState(), path.join(dir, 'missing')).success, false);
});
test('cloud rejects successful HTTP responses containing command errors', async () => {
  const cloud = createCloudStore({ UPSTASH_REDIS_REST_URL: 'https://example.invalid', UPSTASH_REDIS_REST_TOKEN: 'test' }, async () => Response.json({ error: 'Denied' }));
  await assert.rejects(cloud.save(workspace()));
});
test('cloud writes execute serially and recover after failure', async () => {
  const events = []; let attempt = 0;
  const cloud = createCloudStore({ UPSTASH_REDIS_REST_URL: 'https://example.invalid', UPSTASH_REDIS_REST_TOKEN: 'test' }, async () => {
    const id = ++attempt; events.push(`start${id}`);
    await new Promise(resolve => setTimeout(resolve, 10)); events.push(`end${id}`);
    return Response.json(id === 1 ? { error: 'Temporary' } : { result: 'OK' });
  });
  const first = cloud.save(workspace()); const second = cloud.save(workspace());
  await assert.rejects(first); assert.equal(await second, true);
  assert.deepEqual(events, ['start1', 'end1', 'start2', 'end2']);
});

test('HTTP API validates, persists, rejects conflicts, and returns truthful sync status', async t => {
  const { db } = database(t);
  const server = createAppServer({ db, cloud: { configured: false, save: async () => false }, vaultAvailable: () => false });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (endpoint, body, headers = {}) => fetch(url + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  assert.equal((await (await fetch(url + '/api/health')).json()).status, 'ok');
  assert.equal((await post('/api/state', '{bad')).status, 400);
  assert.equal((await post('/api/state', { state: [] })).status, 400);
  assert.equal((await post('/api/state', { state: workspace() })).status, 428);
  assert.equal((await post('/api/state', { state: workspace(), revision: 0 }, { Origin: 'https://evil.example' })).status, 403);
  const saved = await (await post('/api/state', { state: workspace(), revision: 0 })).json();
  assert.equal(saved.success, true); assert.equal(saved.cloudRedisConnected, false); assert.equal(saved.revision, 1);
  assert.equal((await post('/api/state', { state: workspace(), revision: 0 })).status, 409);
  assert.equal((await post('/api/transactions', transaction({ type: 'transfer', toAccountName: 'Bank' }))).status, 400);
  assert.equal((await post('/api/transactions', transaction())).status, 200);
  assert.equal((await post('/api/transactions', transaction())).status, 200);
  assert.equal(db.getTransactions().length, 1);
  assert.equal((await (await fetch(url + '/api/state')).json()).state.financialReport.totalLiquidBalance, 1200);
  assert.equal((await fetch(url + '/api/missing')).status, 404);
});
test('empty local database is not seeded when cloud retrieval fails', async t => {
  const { db } = database(t);
  const server = createAppServer({ db, cloud: { configured: true, load: async () => { throw new Error('Offline'); } }, vaultAvailable: () => false });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const result = await fetch(`http://127.0.0.1:${server.address().port}/api/state`);
  assert.equal(result.status, 503); assert.equal(db.getState(), null);
});
