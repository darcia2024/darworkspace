import { DaruWorkOSState } from '../types';
import { loadState, normalizeState, saveState, STORAGE_KEY, SYNC_KEY } from '../utils/storage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ServerSyncStatus {
  isOnline: boolean;
  vaultConnected: boolean;
  cloudRedisConnected: boolean;
  lastSyncedAt: string | null;
  error: string | null;
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
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500), cache: 'no-store' });
      if (!res.ok) throw new Error('Server offline');
      const data = await res.json();
      if (data.status !== 'ok') throw new Error('API tidak tersedia');
      this.status({ isOnline: true, vaultConnected: Boolean(data.vaultConnected), cloudRedisConnected: Boolean(data.cloudRedisConnected) });
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
    let dirty = false;
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
      const res = await fetch(`${API_BASE}/state`, { signal: AbortSignal.timeout(12000), cache: 'no-store' });
      if (!res.ok) throw new Error('State unavailable');
      const data = await res.json();
      if (!data.success || !Number.isInteger(data.revision)) throw new Error('Invalid API response');
      if (dirty && this.revision !== undefined && this.revision !== data.revision) {
        this.conflict = true;
        this.status({ error: 'Ada perubahan lokal dan server yang berbeda. Ekspor data lokal sebelum memuat versi server.' });
      } else if (dirty && this.revision === undefined && data.state) {
        this.conflict = true;
        this.status({ error: 'Data offline belum punya revisi server. Ekspor data lokal sebelum memilih versi yang dipakai.' });
      } else {
        this.revision = data.revision;
      }
      this.status({ isOnline: true, cloudRedisConnected: Boolean(data.cloudRedisConnected) });
      if (!dirty && data.state) {
        const state = normalizeState(data.state);
        saveState(state);
        this.metadata(false);
        this.loaded = true;
        return state;
      }
    } catch {
      this.status({ isOnline: false, error: 'Mode lokal. Perubahan disimpan di browser sampai server tersedia.' });
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
        const res = await fetch(`${API_BASE}/state`, { signal: AbortSignal.timeout(12000), cache: 'no-store' });
        if (!res.ok) throw new Error('Server belum tersedia.');
        const data = await res.json();
        if (!data.success || !Number.isInteger(data.revision)) throw new Error('Respons server tidak valid.');
        if (data.state) {
          this.conflict = true;
          throw new Error('Server sudah punya data. Ekspor perubahan lokal sebelum memuat ulang.');
        }
        this.revision = data.revision;
      }
      while (this.pending && !this.conflict) {
        const snapshot = this.pending;
        const res = await fetch(`${API_BASE}/state`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: snapshot, revision: this.revision }), signal: AbortSignal.timeout(15000),
        });
        const data = await res.json();
        if (res.status === 409) this.conflict = true;
        if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menyimpan ke server.');
        this.revision = data.revision;
        if (this.pending === snapshot) this.pending = null;
        this.metadata(Boolean(this.pending));
        this.status({ isOnline: true, cloudRedisConnected: Boolean(data.cloudRedisConnected), vaultConnected: Boolean(data.obsidianSync?.success), lastSyncedAt: new Date().toLocaleTimeString('id-ID'), error: data.cloudError || (data.obsidianSync?.success === false ? 'Tersimpan; ekspor Obsidian gagal.' : null) });
      }
    } catch (error) {
      this.status({ error: error instanceof Error ? error.message : 'Gagal sinkronisasi.', ...(!this.conflict ? { isOnline: false } : {}) });
    } finally { this.saving = false; }
  }

  async triggerObsidianSync(state: DaruWorkOSState) {
    try {
      const res = await fetch(`${API_BASE}/sync/obsidian`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state }), signal: AbortSignal.timeout(10000) });
      const data = await res.json();
      return res.ok ? data : { success: false, error: data.error || data.reason || 'Ekspor vault gagal.' };
    } catch { return { success: false, error: 'Server tidak dapat dihubungi.' }; }
  }

  async useServerState(): Promise<DaruWorkOSState> {
    if (this.saving) throw new Error('Tunggu penyimpanan yang sedang berjalan selesai.');
    const response = await fetch(`${API_BASE}/state`, { signal: AbortSignal.timeout(12000), cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.success || !data.state) throw new Error('Data server belum tersedia.');
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
