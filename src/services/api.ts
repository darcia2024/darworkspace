import { DaruWorkOSState } from '../types';
import { loadState, normalizeState, saveState, STORAGE_KEY, SYNC_KEY } from '../utils/storage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Optional shared token. The server only demands it when DARU_API_TOKEN is configured,
// so leaving this unset keeps the previous localhost-only behaviour untouched.
const UNAUTHORIZED_MESSAGE = 'Server minta token API. Buka Laporan project lalu isi Token API perangkat ini.';

export const API_TOKEN_STORAGE_KEY = 'DARU_API_TOKEN';

export function getApiToken(): string {
  try { return localStorage.getItem(API_TOKEN_STORAGE_KEY) || ''; } catch { return ''; }
}

export function setApiToken(token: string) {
  try {
    if (token.trim()) localStorage.setItem(API_TOKEN_STORAGE_KEY, token.trim());
    else localStorage.removeItem(API_TOKEN_STORAGE_KEY);
  } catch { /* storage unavailable; token stays in memory for this tab only */ }
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getApiToken();
  return token ? { ...extra, 'X-Daru-Token': token } : { ...extra };
}

export interface ServerSyncStatus {
  isOnline: boolean;
  vaultConnected: boolean;
  cloudRedisConnected: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

async function safeJson<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export class ApiService {
  private syncTimeout: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<(status: ServerSyncStatus) => void>();
  private pending: DaruWorkOSState | null = null;
  private saving = false;
  private revision: number | undefined;
  private conflict = false;
  private corruptLocal = false;
  private loaded = false;
  private initialLoad: Promise<DaruWorkOSState> | null = null;
  private currentStatus: ServerSyncStatus = {
    isOnline: false, vaultConnected: false, cloudRedisConnected: false, lastSyncedAt: null, error: null,
  };

  constructor(monitor = true) {
    if (!monitor) return;
    setInterval(() => { void this.checkHealth(); }, 30000);
    window.addEventListener('online', () => { void this.checkHealth(); });
  }

  subscribeStatus(listener: (status: ServerSyncStatus) => void) {
    this.listeners.add(listener);
    listener(this.currentStatus);
    return () => { this.listeners.delete(listener); };
  }
  private status(patch: Partial<ServerSyncStatus>) {
    this.currentStatus = { ...this.currentStatus, ...patch };
    this.listeners.forEach((listener) => listener(this.currentStatus));
  }
  private metadata(dirty: boolean) {
    localStorage.setItem(SYNC_KEY, JSON.stringify({ dirty, revision: this.revision }));
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { headers: authHeaders(), signal: AbortSignal.timeout(2500), cache: 'no-store' });
      if (res.status === 401) { this.status({ isOnline: true, error: UNAUTHORIZED_MESSAGE }); return false; }
      if (!res.ok) throw new Error('Server offline');
      const data = await safeJson<{ status?: string; vaultConnected?: boolean; cloudRedisConnected?: boolean }>(res);
      if (!data || data.status !== 'ok') throw new Error('API tidak tersedia');
      this.status({ isOnline: true, vaultConnected: Boolean(data.vaultConnected), cloudRedisConnected: Boolean(data.cloudRedisConnected), error: null });
      if (this.loaded && this.pending && !this.conflict) void this.flush();
      return true;
    } catch {
      this.status({ isOnline: false, vaultConnected: false, cloudRedisConnected: false });
      return false;
    }
  }

  loadInitialState(): Promise<DaruWorkOSState> {
    return this.initialLoad ??= this.load();
  }

  private async load(): Promise<DaruWorkOSState> {
    const local = loadState();
    // The catch below returns, so this is always assigned before it is read.
    let dirty: boolean;
    try {
      const metadata = JSON.parse(localStorage.getItem(SYNC_KEY) || '{}');
      dirty = Boolean(metadata.dirty);
      this.revision = metadata.revision;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) normalizeState(JSON.parse(raw));
    } catch {
      this.conflict = true;
      this.corruptLocal = true;
      this.status({ error: 'Data lokal rusak. Ekspor atau pulihkan salinan sebelum menyimpan.' });
      this.loaded = true;
      return local;
    }
    try {
      const res = await fetch(`${API_BASE}/state`, { headers: authHeaders(), signal: AbortSignal.timeout(12000), cache: 'no-store' });
      if (res.status === 401) throw new Error(UNAUTHORIZED_MESSAGE);
      if (!res.ok) throw new Error('State unavailable');
      const data = await safeJson<{ success?: boolean; revision?: number; state?: DaruWorkOSState; cloudRedisConnected?: boolean }>(res);
      if (!data || !data.success || !Number.isInteger(data.revision)) throw new Error('Invalid API response');
      if (dirty && this.revision !== undefined && this.revision !== data.revision) {
        this.conflict = true;
        this.status({ error: 'Ada perubahan lokal dan server yang berbeda. Ekspor data lokal sebelum memuat versi server.' });
      } else if (dirty && this.revision === undefined && data.state) {
        this.conflict = true;
        this.status({ error: 'Data offline belum punya revisi server. Ekspor data lokal sebelum memilih versi yang dipakai.' });
      } else {
        this.revision = data.revision;
      }
      this.status({ isOnline: true, cloudRedisConnected: Boolean(data.cloudRedisConnected), error: null });
      if (!dirty && data.state) {
        const state = normalizeState(data.state);
        saveState(state);
        this.metadata(false);
        this.loaded = true;
        return state;
      }
    } catch (err) {
      if (err instanceof Error && err.message === UNAUTHORIZED_MESSAGE) {
        this.status({ isOnline: true, error: UNAUTHORIZED_MESSAGE });
      } else {
        this.status({ isOnline: false, error: null });
      }
    }
    this.loaded = true;
    if (dirty && !this.conflict) { this.pending = local; void this.flush(); }
    return local;
  }

  saveState(state: DaruWorkOSState) {
    if (!this.loaded) return;
    if (this.conflict) {
      if (!this.corruptLocal) {
        try { saveState(state); this.metadata(true); }
        catch { this.status({ error: 'Penyimpanan browser penuh. Ekspor perubahan sebelum menutup tab.' }); return; }
      }
      this.status({ error: 'Sinkronisasi konflik. Ekspor perubahan sebelum memuat ulang; autosave ditahan.' });
      return;
    }
    try { this.metadata(true); saveState(state); }
    catch {
      this.status({ error: 'Penyimpanan browser gagal atau penuh. Ekspor data sebelum menutup tab.' });
      return;
    }
    this.pending = structuredClone(state);
    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => { void this.flush(); }, 600);
  }

  private async flush() {
    if (this.saving || !this.pending || this.conflict) return;
    this.saving = true;
    try {
      if (this.revision === undefined) {
        const res = await fetch(`${API_BASE}/state`, { headers: authHeaders(), signal: AbortSignal.timeout(12000), cache: 'no-store' });
        if (!res.ok) throw new Error('Server belum tersedia.');
        const data = await safeJson<{ success?: boolean; revision?: number; state?: DaruWorkOSState }>(res);
        if (!data || !data.success || !Number.isInteger(data.revision)) throw new Error('Server belum tersedia.');
        if (data.state) {
          this.conflict = true;
          throw new Error('Server sudah punya data. Ekspor perubahan lokal sebelum memuat ulang.');
        }
        this.revision = data.revision;
      }
      while (this.pending && !this.conflict) {
        const snapshot = this.pending;
        const res = await fetch(`${API_BASE}/state`, {
          method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ state: snapshot, revision: this.revision }), signal: AbortSignal.timeout(15000),
        });
        const data = await safeJson<{ success?: boolean; revision?: number; error?: string; cloudRedisConnected?: boolean; obsidianSync?: { success?: boolean }; cloudError?: string }>(res);
        if (res.status === 409) this.conflict = true;
        if (!res.ok || !data?.success) {
          const errMsg = data?.error || (res.status >= 500 ? 'Gagal menyimpan ke server.' : 'Server belum tersedia.');
          throw new Error(errMsg);
        }
        this.revision = data.revision;
        if (this.pending === snapshot) this.pending = null;
        this.metadata(Boolean(this.pending));
        this.status({ isOnline: true, cloudRedisConnected: Boolean(data.cloudRedisConnected), vaultConnected: Boolean(data.obsidianSync?.success), lastSyncedAt: new Date().toLocaleTimeString('id-ID'), error: data.cloudError || (data.obsidianSync?.success === false ? 'Tersimpan; ekspor Obsidian gagal.' : null) });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal sinkronisasi.';
      const isOfflineError = msg === 'Server belum tersedia.' || msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('aborted');
      this.status({
        error: isOfflineError ? null : msg,
        ...(!this.conflict ? { isOnline: false } : {})
      });
    } finally { this.saving = false; }
  }

  async triggerObsidianSync(state: DaruWorkOSState) {
    try {
      const res = await fetch(`${API_BASE}/sync/obsidian`, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ state }), signal: AbortSignal.timeout(10000) });
      const data = await safeJson<{ success?: boolean; error?: string; reason?: string }>(res);
      if (!data) return { success: false, error: 'Server tidak dapat dihubungi.' };
      return res.ok ? data : { success: false, error: data.error || data.reason || 'Ekspor vault gagal.' };
    } catch { return { success: false, error: 'Server tidak dapat dihubungi.' }; }
  }

  async useServerState(): Promise<DaruWorkOSState> {
    if (this.saving) throw new Error('Tunggu penyimpanan yang sedang berjalan selesai.');
    const response = await fetch(`${API_BASE}/state`, { headers: authHeaders(), signal: AbortSignal.timeout(12000), cache: 'no-store' });
    const data = await safeJson<{ success?: boolean; revision?: number; state?: DaruWorkOSState }>(response);
    if (!response.ok || !data?.success || !data.state) throw new Error('Data server belum tersedia.');
    const state = normalizeState(data.state);
    saveState(state);
    this.revision = data.revision;
    this.metadata(false);
    this.pending = null;
    this.conflict = false;
    this.corruptLocal = false;
    this.status({ error: null, isOnline: true });
    return state;
  }
}

export const apiService = new ApiService();
