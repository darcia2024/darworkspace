import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createAppServer } from '../server/index.js';
import { workspace } from './fixtures.js';

function stubDb() {
  let state = workspace();
  let revision = 1;
  return {
    get revision() { return revision; },
    getState: () => state,
    saveState: (next) => { state = next; revision += 1; return state; },
    addTransaction: () => ({}),
  };
}

const stubCloud = { configured: false, load: async () => null, save: async () => false };

function listen(server) {
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}

function request(port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method: 'GET', headers }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function withServer(opts, run) {
  const server = createAppServer({
    db: stubDb(),
    cloud: stubCloud,
    vaultAvailable: () => false,
    syncVault: () => ({ success: false }),
    ...opts,
  });
  const port = await listen(server);
  try { await run(port); } finally { await new Promise(r => server.close(r)); }
}

test('without DARU_API_TOKEN the API stays open, exactly as before', async () => {
  await withServer({ apiToken: '' }, async port => {
    const state = await request(port, '/api/state');
    assert.equal(state.status, 200, 'unauthenticated read must still work when no token is configured');

    const health = await request(port, '/api/health');
    assert.equal(JSON.parse(health.body).authRequired, false);
  });
});

test('with DARU_API_TOKEN set the API refuses every request that lacks the token', async () => {
  await withServer({ apiToken: 'secret-token-value' }, async port => {
    const anonymous = await request(port, '/api/state');
    assert.equal(anonymous.status, 401, 'workspace must not be readable without the token');
    assert.match(JSON.parse(anonymous.body).error, /Token API/);

    const wrong = await request(port, '/api/state', { 'X-Daru-Token': 'secret-token-valuX' });
    assert.equal(wrong.status, 401, 'a same-length wrong token must be rejected');

    const shorter = await request(port, '/api/state', { 'X-Daru-Token': 'short' });
    assert.equal(shorter.status, 401, 'a different-length token must be rejected');

    const authorised = await request(port, '/api/state', { 'X-Daru-Token': 'secret-token-value' });
    assert.equal(authorised.status, 200);
    assert.ok(JSON.parse(authorised.body).success);
  });
});

test('health stays reachable without a token so the client can report why it is locked out', async () => {
  await withServer({ apiToken: 'secret-token-value' }, async port => {
    const health = await request(port, '/api/health');
    assert.equal(health.status, 200);
    assert.equal(JSON.parse(health.body).authRequired, true);
  });
});
