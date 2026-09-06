import { DaruWorkOSState } from '../types';

// Upstash Redis Configuration (Isolated from dar-invoices)
const UPSTASH_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL || 'https://positive-iguana-201067.upstash.io';
const UPSTASH_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAAxFrAAIgcDEyNDIyMjA1MTMwMjc0OGZkYTJiNjM2YTY2MmFkYWFiMQ';

// Isolated key namespace so it never touches or affects dar-invoices
export const UPSTASH_WORKSPACE_KEY = 'daru_workspace:state_v1';
export const UPSTASH_SYNC_TIME_KEY = 'daru_workspace:last_synced_at';

export interface UpstashResponse<T = any> {
  result: T;
  error?: string;
}

/**
 * Fetch the latest DaruWorkOSState from Upstash Redis REST API
 */
export async function fetchUpstashState(): Promise<DaruWorkOSState | null> {
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(UPSTASH_WORKSPACE_KEY)}`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      console.warn('Upstash GET failed status:', res.status);
      return null;
    }

    const data: UpstashResponse<string | null> = await res.json();
    if (!data.result) {
      return null;
    }

    const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    return parsed as DaruWorkOSState;
  } catch (err) {
    console.warn('Upstash Redis fetch error:', err);
    return null;
  }
}

/**
 * Persist DaruWorkOSState to Upstash Redis REST API
 */
export async function saveUpstashState(state: DaruWorkOSState): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(state);
    
    const res = await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(UPSTASH_WORKSPACE_KEY)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: jsonString,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn('Upstash SET failed status:', res.status);
      return false;
    }

    const nowIso = new Date().toISOString();
    fetch(`${UPSTASH_URL}/set/${encodeURIComponent(UPSTASH_SYNC_TIME_KEY)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: nowIso,
    }).catch(() => {});

    return true;
  } catch (err) {
    console.warn('Upstash Redis save error:', err);
    return false;
  }
}
