import { DaruWorkOSState } from '../types';
import { loadState as loadLocalStorageState, saveState as saveLocalStorageState } from '../utils/storage';
import { fetchUpstashState, saveUpstashState } from './upstash';

const API_BASE = 'http://localhost:3001/api';

export interface ServerSyncStatus {
  isOnline: boolean;
  vaultConnected: boolean;
  cloudRedisConnected: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

class ApiService {
  private syncTimeout: any = null;
  private statusListeners: Array<(status: ServerSyncStatus) => void> = [];
  private currentStatus: ServerSyncStatus = {
    isOnline: true,
    vaultConnected: false,
    cloudRedisConnected: true,
    lastSyncedAt: null,
    error: null
  };

  constructor() {
    this.checkHealth();
    // Periodic health check every 30 seconds
    setInterval(() => this.checkHealth(), 30000);
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
          ...this.currentStatus,
          isOnline: true,
          vaultConnected: data.vaultConnected ?? false,
        };
        this.notifyStatus();
        return true;
      }
    } catch (e) {
      // Local server is offline (normal on Vercel deployment)
    }
    this.currentStatus = {
      ...this.currentStatus,
      vaultConnected: false
    };
    this.notifyStatus();
    return false;
  }

  async loadInitialState(): Promise<DaruWorkOSState> {
    // 1. First priority: Fetch from Upstash Redis Cloud
    try {
      const cloudState = await fetchUpstashState();
      if (cloudState && cloudState.projects && cloudState.financialReport) {
        console.info('Loaded state from Upstash Redis Cloud');
        saveLocalStorageState(cloudState);
        this.currentStatus = {
          ...this.currentStatus,
          isOnline: true,
          cloudRedisConnected: true,
          lastSyncedAt: new Date().toLocaleTimeString('id-ID'),
          error: null
        };
        this.notifyStatus();
        return cloudState;
      }
    } catch (err) {
      console.warn('Upstash fetch failed, trying fallback:', err);
    }

    // 2. Second priority: Local backend server if running
    try {
      const res = await fetch(`${API_BASE}/state`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.state) {
          saveLocalStorageState(json.state);
          this.currentStatus.lastSyncedAt = new Date().toLocaleTimeString('id-ID');
          this.currentStatus.isOnline = true;
          this.notifyStatus();
          // Seed Upstash Redis with this state
          saveUpstashState(json.state).catch(() => {});
          return json.state;
        }
      }
    } catch (e) {
      // Backend not running
    }

    // 3. Fallback: LocalStorage / Initial Data
    const localState = loadLocalStorageState();
    // Seed Upstash Redis in the background so it's immediately initialized
    saveUpstashState(localState).catch(() => {});
    return localState;
  }

  saveState(state: DaruWorkOSState) {
    // 1. Immediate LocalStorage save (Optimistic UI)
    saveLocalStorageState(state);

    // 2. Debounced Cloud Save to Upstash Redis & Backend server
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(async () => {
      let redisSuccess = false;
      try {
        redisSuccess = await saveUpstashState(state);
      } catch (e: any) {
        console.warn('Upstash save error:', e);
      }

      // Also try local server if available
      try {
        const res = await fetch(`${API_BASE}/state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state }),
          signal: AbortSignal.timeout(3000)
        });

        if (res.ok) {
          const json = await res.json();
          this.currentStatus = {
            isOnline: true,
            vaultConnected: json.obsidianSync?.success ?? false,
            cloudRedisConnected: redisSuccess,
            lastSyncedAt: new Date().toLocaleTimeString('id-ID'),
            error: null
          };
          this.notifyStatus();
          return;
        }
      } catch (e: any) {
        // Backend offline
      }

      this.currentStatus = {
        isOnline: redisSuccess,
        vaultConnected: false,
        cloudRedisConnected: redisSuccess,
        lastSyncedAt: redisSuccess ? new Date().toLocaleTimeString('id-ID') : this.currentStatus.lastSyncedAt,
        error: redisSuccess ? null : 'Gagal sync ke cloud'
      };
      this.notifyStatus();
    }, 600);
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

