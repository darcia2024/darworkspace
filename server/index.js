import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { DatabaseManager } from './db.js';
import { createCloudStore } from './cloud.js';
import { validateState, validateTransaction } from '../shared/domain.js';
import { syncToObsidianVault, isVaultAvailable } from './obsidianSync.js';

const dist = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const MAX_BODY_BYTES = 10 * 1024 * 1024;
const httpError = (status, message) => Object.assign(new Error(message), { status });

async function readBody(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw httpError(415, 'Gunakan Content-Type application/json.');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw httpError(413, 'Data melebihi batas 10 MB.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw httpError(400, 'JSON tidak valid.'); }
}

export function createAppServer({ db = new DatabaseManager(), cloud = createCloudStore(), vaultAvailable = isVaultAvailable, syncVault = syncToObsidianVault } = {}) {
  const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001').split(',').map((s) => s.trim()));
  const send = (res, status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
  };
  let cloudConnected = false;
  async function mirror(state) {
    let cloudError = null;
    try { cloudConnected = await cloud.save(state); }
    catch { cloudConnected = false; cloudError = 'Tersimpan di server; sinkronisasi cloud gagal.'; }
    let obsidianSync = null;
    if (vaultAvailable()) {
      try { obsidianSync = syncVault(state); }
      catch { obsidianSync = { success: false, error: 'Gagal menulis vault.' }; }
    }
    return { cloudRedisConnected: cloudConnected, cloudError, obsidianSync };
  }
  return http.createServer(async (req, res) => {
    try {
      const origin = req.headers.origin;
      if (origin && !allowedOrigins.has(origin)) return send(res, 403, { success: false, error: 'Origin tidak diizinkan.' });
      if (origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname === '/api/health' && req.method === 'GET') return send(res, 200, {
        status: 'ok', version: '2.7.0', vaultConnected: vaultAvailable(), cloudConfigured: cloud.configured,
        cloudRedisConnected: cloudConnected, revision: db.revision,
      });
      if (pathname === '/api/state' && req.method === 'GET') {
        let state = db.getState();
        if (!state && cloud.configured) {
          const revision = db.revision;
          try {
            const remote = await cloud.load();
            if (remote && db.revision === revision) { validateState(remote); db.saveState(remote, revision); }
            cloudConnected = true;
            state = db.getState();
          } catch { throw httpError(503, 'Cloud belum bisa dimuat. Data awal tidak akan dikirim ke cloud.'); }
        }
        return send(res, 200, { success: true, state, revision: db.revision, cloudRedisConnected: cloudConnected });
      }
      if (pathname === '/api/state' && req.method === 'POST') {
        const body = await readBody(req);
        try { validateState(body?.state); } catch (error) { throw httpError(400, error.message); }
        if (!Number.isInteger(body.revision) || body.revision < 0) throw httpError(428, 'Muat revisi workspace sebelum menyimpan.');
        const state = db.saveState(body.state, body.revision);
        const revision = db.revision;
        const result = await mirror(state);
        return send(res, 200, { success: true, revision, ...result });
      }
      if (pathname === '/api/transactions' && req.method === 'POST') {
        const body = await readBody(req);
        try { validateTransaction(db.getState(), body); } catch (error) { throw httpError(400, error.message); }
        const tx = { ...body, id: body.id || randomUUID(), date: body.date || new Date().toISOString().slice(0, 10), createdAt: body.createdAt || new Date().toISOString() };
        let transaction;
        try { transaction = db.addTransaction(tx); } catch (error) { if (!error.code) throw httpError(409, error.message); throw error; }
        const revision = db.revision;
        const result = await mirror(db.getState());
        return send(res, 200, { success: true, transaction, revision, ...result });
      }
      if (pathname === '/api/sync/obsidian' && req.method === 'POST') {
        const body = await readBody(req);
        const state = body?.state || db.getState();
        try { validateState(state); } catch (error) { throw httpError(400, error.message); }
        const result = syncVault(state);
        return send(res, result.success ? 200 : 503, result);
      }
      if (pathname.startsWith('/api/')) return send(res, 404, { success: false, error: 'Endpoint tidak ditemukan.' });
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { success: false, error: 'Method tidak diizinkan.' });
      const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
      let file = path.resolve(dist, relative || 'index.html');
      if (!file.startsWith(dist + path.sep) && file !== path.join(dist, 'index.html')) throw httpError(403, 'Path tidak diizinkan.');
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        if (path.extname(relative)) throw httpError(404, 'File tidak ditemukan.');
        file = path.join(dist, 'index.html');
      }
      if (!fs.existsSync(file)) throw httpError(503, 'Jalankan npm run build terlebih dahulu.');
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': path.extname(file) === '.html' || path.basename(file) === 'sw.js' ? 'no-cache' : 'public, max-age=3600' });
      if (req.method === 'HEAD') res.end();
      else fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
    } catch (error) {
      if (!res.headersSent) send(res, error.status || 500, { success: false, error: error.status ? error.message : 'Penyimpanan gagal. Periksa log server; data belum dikonfirmasi tersimpan.' });
      if (!error.status) console.error(error);
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (fs.existsSync('.env')) process.loadEnvFile('.env');
  const port = Number(process.env.PORT || 3001);
  createAppServer().listen(port, '127.0.0.1', () => console.log(`Daru Work OS: http://localhost:${port}`));
}
