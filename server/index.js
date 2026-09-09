import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { DatabaseManager } from './db.js';
import { createCloudStore } from './cloud.js';
import { validateState, validateTransaction } from '../shared/domain.js';
import { syncToObsidianVault, isVaultAvailable } from './obsidianSync.js';
import { APP_VERSION } from '../shared/version.js';

const dist = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const receiptsDir = path.resolve(fileURLToPath(new URL('./data/receipts', import.meta.url)));
const MAX_BODY_BYTES = 10 * 1024 * 1024;
const httpError = (status, message) => Object.assign(new Error(message), { status });

// Constant-time compare so a wrong token cannot be recovered by measuring responses.
function timingSafeEqualString(received, expected) {
  if (typeof received !== 'string' || typeof expected !== 'string') return false;
  const a = Buffer.from(received, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isAllowedOrigin(origin, explicitAllowedSet) {
  if (!origin) return true;
  if (explicitAllowedSet && explicitAllowedSet.has(origin)) return true;
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  } catch {
    return false;
  }
  return false;
}

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

export function createAppServer({ db = new DatabaseManager(), cloud = createCloudStore(), vaultAvailable = isVaultAvailable, syncVault = syncToObsidianVault, apiToken = process.env.DARU_API_TOKEN || '' } = {}) {
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
      const pathname = new URL(req.url, 'http://localhost').pathname;
      const isApi = pathname.startsWith('/api/');

      if (isApi && origin && !isAllowedOrigin(origin, allowedOrigins)) {
        return send(res, 403, { success: false, error: 'Origin tidak diizinkan.' });
      }

      if (origin && isAllowedOrigin(origin, allowedOrigins)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      } else if (!isApi) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }

      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Daru-Token');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
      if (pathname === '/api/health' && req.method === 'GET') return send(res, 200, {
        status: 'ok', version: APP_VERSION, vaultConnected: vaultAvailable(), cloudConfigured: cloud.configured,
        cloudRedisConnected: cloudConnected, revision: db.revision, authRequired: Boolean(apiToken),
      });

      // The PIN screen only gates rendering, so it never protected this API. When the
      // server is reachable beyond this machine (LAN access), set DARU_API_TOKEN and
      // every endpoint below starts demanding it. Unset, behaviour is unchanged.
      if (isApi && apiToken && !timingSafeEqualString(req.headers['x-daru-token'], apiToken)) {
        return send(res, 401, { success: false, error: 'Token API tidak valid. Atur token perangkat ini di menu Laporan.' });
      }
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
      if (pathname === '/api/receipts' && req.method === 'POST') {
        const body = await readBody(req);
        const dataUrl = body?.data;
        if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
          throw httpError(400, 'Format gambar tidak valid. Kirimkan data URL gambar.');
        }
        const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (!match) throw httpError(400, 'Data base64 tidak valid.');
        const rawExt = match[1].toLowerCase();
        const ext = rawExt === 'jpeg' ? 'jpg' : rawExt.replace(/[^a-z0-9]/g, '');
        const buffer = Buffer.from(match[2], 'base64');
        if (buffer.length > 5 * 1024 * 1024) throw httpError(413, 'Ukuran gambar maksimal 5 MB.');
        fs.mkdirSync(receiptsDir, { recursive: true });
        const filename = `receipt-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
        const filePath = path.join(receiptsDir, filename);
        fs.writeFileSync(filePath, buffer);
        return send(res, 201, { success: true, url: `/api/receipts/${filename}` });
      }
      if (pathname.startsWith('/api/receipts/') && (req.method === 'GET' || req.method === 'HEAD')) {
        const filename = path.basename(pathname);
        const filePath = path.join(receiptsDir, filename);
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) throw httpError(404, 'Foto struk tidak ditemukan.');
        const ext = path.extname(filePath).toLowerCase();
        const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
        res.writeHead(200, {
          'Content-Type': types[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=86400',
        });
        if (req.method === 'HEAD') res.end();
        else fs.createReadStream(filePath).pipe(res);
        return;
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
  const host = process.env.HOST || '0.0.0.0';
  createAppServer().listen(port, host, () => console.log(`Daru Work OS: http://localhost:${port} (listening on ${host})`));
}
