import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { applyTransaction, deriveState, validateState } from '../shared/domain.js';
import { APP_VERSION } from '../shared/version.js';

const defaultFile = fileURLToPath(new URL('./data/daru_os.json', import.meta.url));
const exampleFile = fileURLToPath(new URL('./data/daru_os.example.json', import.meta.url));

export class DatabaseManager {
  constructor(file = process.env.DARU_DB_FILE || defaultFile) {
    this.file = path.resolve(file);
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    if (this.file === path.resolve(defaultFile) && !fs.existsSync(this.file) && fs.existsSync(exampleFile)) {
      try {
        fs.copyFileSync(exampleFile, this.file);
      } catch {
        // Continue if copy fails
      }
    }
    this.data = fs.existsSync(this.file)
      ? JSON.parse(fs.readFileSync(this.file, 'utf8'))
      : { version: APP_VERSION, revision: 0, state: null, syncLogs: [] };
    if (!this.data || typeof this.data !== 'object' || !('state' in this.data)) throw new Error('Invalid database; restore a backup before restarting.');
    if (this.data.state) validateState(this.data.state);
  }

  commit(next) {
    const temporary = `${this.file}.tmp`;
    try {
      fs.writeFileSync(temporary, JSON.stringify(next, null, 2), { encoding: 'utf8', flush: true });
      if (fs.existsSync(this.file)) fs.copyFileSync(this.file, `${this.file}.bak`);
      fs.renameSync(temporary, this.file);
      this.data = next;
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  }

  getState() { return this.data.state ? deriveState(structuredClone(this.data.state)) : null; }
  get revision() { return this.data.revision || 0; }

  saveState(state, expectedRevision) {
    if (expectedRevision !== undefined && expectedRevision !== this.revision) {
      const error = new Error('Workspace berubah di sesi lain. Ekspor perubahan lokal sebelum memuat ulang.');
      error.status = 409;
      throw error;
    }
    const saved = deriveState(validateState(state));
    this.commit({ ...this.data, state: saved, revision: this.revision + 1, lastSyncedAt: new Date().toISOString() });
    return this.getState();
  }

  getTransactions() { return this.getState()?.financialReport.transactions || []; }
  addTransaction(tx) {
    const state = this.getState();
    const next = applyTransaction(state, tx);
    if (next !== state) this.saveState(next);
    return next.financialReport.transactions.find((item) => item.id === tx.id);
  }
  logSync(type, message) {
    const log = { id: randomUUID(), timestamp: new Date().toISOString(), type, message };
    this.commit({ ...this.data, syncLogs: [log, ...(this.data.syncLogs || [])].slice(0, 50) });
    return log;
  }
  getSyncLogs() { return structuredClone(this.data.syncLogs || []); }
}
