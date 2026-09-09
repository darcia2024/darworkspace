import type { DaruWorkOSState, ProjectCard, TransactionRecord } from '../src/types';
export function projectIdFor(item: { id: string; projectId?: string; name?: string; project?: string; projectName?: string }, projects: ProjectCard[]): string | undefined;
export function deriveState(state: DaruWorkOSState): DaruWorkOSState;
export function updateProject(state: DaruWorkOSState, project: ProjectCard): DaruWorkOSState;
export function validateTransaction(state: DaruWorkOSState, tx: Omit<TransactionRecord, 'id' | 'createdAt'>): void;
export function applyTransaction(state: DaruWorkOSState, tx: TransactionRecord): DaruWorkOSState;
export function deleteTransaction(state: DaruWorkOSState, txId: string): DaruWorkOSState;
export function editTransaction(state: DaruWorkOSState, tx: TransactionRecord): DaruWorkOSState;
export function validateState(state: unknown): DaruWorkOSState;
