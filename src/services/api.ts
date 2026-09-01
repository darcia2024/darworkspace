import { DaruWorkOSState } from '../types';
import { loadState as loadLocalStorageState, saveState as saveLocalStorageState } from '../utils/storage';

const API_BASE = 'http://localhost:3001/api';

export interface ServerSyncStatus {
  isOnline: boolean;
  vaultConnected: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

class ApiService {
  private syncTimeout: NodeJS.Timeout | null = null;
  private statusListeners: Array<(status: ServerSyncStatus) => void> = [];
  private currentStatus: ServerSyncStatus = {
    isOnline: false,
    vaultConnected: false,
    lastSyncedAt: null,
    error: null
  };

  constructor() {
    this.checkHealth();
    // Periodic health check every 15 seconds
    setInterval(() => this.checkHealth(), 15000);
  }

  subscribeStatus(listener: (status: ServerSyncStatus) => void) {
    this.statusListeners.push(listener);
    listener(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private notifyStatus() {
    this.statusListeners.forEach((l) => l(this.currentStatus));
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        this.currentStatus = {
          isOnline: true,
          vaultConnected: data.vaultConnected ?? false,
          lastSyncedAt: this.currentStatus.lastSyncedAt,
          error: null
        };
        this.notifyStatus();
        return true;
      }
    } catch (e) {
      // Server is offline
    }
    this.currentStatus = {
      ...this.currentStatus,
      isOnline: false,
      vaultConnected: false
    };
    this.notifyStatus();
    return false;
  }

  async loadInitialState(): Promise<DaruWorkOSState> {
    // 1. Try to fetch from backend server
    try {
      const res = await fetch(`${API_BASE}/state`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.state) {
          saveLocalStorageState(json.state);
          this.currentStatus.lastSyncedAt = new Date().toLocaleTimeString('id-ID');
          this.currentStatus.isOnline = true;
          this.notifyStatus();
          return json.state;
        }
      }
    } catch (e) {
      console.info('Backend server not reachable, using offline LocalStorage');
    }

    // 2. Fallback to LocalStorage
    return loadLocalStorageState();
  }

  saveState(state: DaruWorkOSState) {
    // 1. Immediate LocalStorage save (Optimistic UI)
    saveLocalStorageState(state);

    // 2. Debounced API save (to prevent flooding server on every keystroke)
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state }),
          signal: AbortSignal.timeout(5000)
        });

        if (res.ok) {
          const json = await res.json();
          this.currentStatus = {
            isOnline: true,
            vaultConnected: json.obsidianSync?.success ?? false,
            lastSyncedAt: new Date().toLocaleTimeString('id-ID'),
            error: null
          };
          this.notifyStatus();
        }
      } catch (e: any) {
        this.currentStatus = {
          ...this.currentStatus,
          isOnline: false,
          error: e.message
        };
        this.notifyStatus();
      }
    }, 800);
  }

  async triggerObsidianSync(state: DaruWorkOSState) {
    try {
      const res = await fetch(`${API_BASE}/sync/obsidian`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: 'Server unreachable' };
    }
  }
}

export const apiService = new ApiService();
