import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { syncToObsidianVault, isVaultAvailable } from './obsidianSync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;

// CORS Headers
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const sendJson = (res, statusCode, data) => {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const readBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
};

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  console.log(`[${new Date().toLocaleTimeString('id-ID')}] ${req.method} ${pathname}`);

  // 1. Health Check
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'ok',
      server: 'Daru Work OS Native API Server',
      version: '2.7.0',
      timestamp: new Date().toISOString(),
      vaultConnected: isVaultAvailable(),
      dbRecords: db.getTransactions().length
    });
  }

  // 2. Get State
  if (pathname === '/api/state' && req.method === 'GET') {
    const state = db.getState();
    return sendJson(res, 200, { success: true, state });
  }

  // 3. Save State & Obsidian Sync
  if (pathname === '/api/state' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const state = body.state;
      if (!state) {
        return sendJson(res, 400, { success: false, error: 'State payload is required' });
      }

      const saved = db.saveState(state);
      db.logSync('STATE_SAVE', 'State saved to SQLite/JSON store');

      let obsidianSyncResult = null;
      if (isVaultAvailable()) {
        obsidianSyncResult = syncToObsidianVault(state);
        db.logSync('OBSIDIAN_SYNC', `Synced ${obsidianSyncResult.syncedFiles?.length || 0} files to Dar Vault`);
      }

      return sendJson(res, 200, {
        success: true,
        state: saved,
        obsidianSync: obsidianSyncResult
      });
    } catch (e) {
      return sendJson(res, 500, { success: false, error: e.message });
    }
  }

  // 4. Log Single Transaction
  if (pathname === '/api/transactions' && req.method === 'POST') {
    try {
      const tx = await readBody(req);
      if (!tx || !tx.amount) {
        return sendJson(res, 400, { success: false, error: 'Transaction amount required' });
      }

      const savedTx = db.addTransaction({
        ...tx,
        id: tx.id || `tx-${Date.now()}`,
        createdAt: new Date().toISOString()
      });

      return sendJson(res, 200, { success: true, transaction: savedTx });
    } catch (e) {
      return sendJson(res, 500, { success: false, error: e.message });
    }
  }

  // 5. Manual Trigger Obsidian Sync
  if (pathname === '/api/sync/obsidian' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const state = body.state || db.getState();
      const result = syncToObsidianVault(state);
      return sendJson(res, 200, result);
    } catch (e) {
      return sendJson(res, 500, { success: false, error: e.message });
    }
  }

  // Static files or fallback
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 DARU WORK OS API SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📍 Local API:    http://localhost:${PORT}/api/health`);
  console.log(`📍 Obsidian:     ${isVaultAvailable() ? '🟢 CONNECTED (Dar Vault)' : '🟡 NOT DETECTED'}`);
  console.log(`======================================================\n`);
});
