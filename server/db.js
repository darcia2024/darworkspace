import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'daru_os.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Schema & Baseline (Context 7)
const DEFAULT_DB = {
  version: '7.0.0',
  lastSyncedAt: new Date().toISOString(),
  state: null,
  transactions: [],
  syncLogs: []
};

class DatabaseManager {
  constructor() {
    this.data = DEFAULT_DB;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.warn('Initializing fresh DB due to read error', e);
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  getState() {
    return this.data.state;
  }

  saveState(state) {
    this.data.state = state;
    this.data.lastSyncedAt = new Date().toISOString();
    this.save();
    return this.data.state;
  }

  getTransactions() {
    return this.data.state?.financialReport?.transactions || [];
  }

  addTransaction(tx) {
    if (!this.data.state) return null;
    const currentReport = this.data.state.financialReport;
    const updatedTx = [tx, ...(currentReport.transactions || [])];
    this.data.state.financialReport.transactions = updatedTx;
    this.data.lastSyncedAt = new Date().toISOString();
    this.save();
    return tx;
  }

  logSync(type, message) {
    const log = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message
    };
    this.data.syncLogs = [log, ...(this.data.syncLogs || []).slice(0, 50)];
    this.save();
    return log;
  }

  getSyncLogs() {
    return this.data.syncLogs || [];
  }
}

export const db = new DatabaseManager();
