import { DaruWorkOSState } from '../types';
import { INITIAL_STATE } from './initialData';
import { deriveState, validateState } from '../../shared/domain.js';

export const STORAGE_KEY = 'DARU_WORK_OS_STATE_V24';
export const SYNC_KEY = `${STORAGE_KEY}_SYNC`;

export function normalizeState(raw: Partial<DaruWorkOSState>): DaruWorkOSState {
  const base = structuredClone(INITIAL_STATE);
  const report = raw.financialReport;

  // If raw has projects, keep raw's projects order and overrides, but inject missing base projects (e.g. p-el-massa)
  let mergedProjects = raw.projects;
  if (mergedProjects) {
    const rawIds = new Set(mergedProjects.map(p => p.id));
    const missingBase = base.projects.filter(bp => !rawIds.has(bp.id));
    if (missingBase.length > 0) {
      mergedProjects = [...mergedProjects, ...missingBase];
    }
    mergedProjects = mergedProjects.map(p => {
      const bp = base.projects.find(b => b.id === p.id);
      if (bp) {
        return {
          ...p,
          currentGoal: bp.currentGoal || p.currentGoal,
          nextAction: bp.nextAction || p.nextAction,
          newsArticle: bp.newsArticle || p.newsArticle,
          newsCritique: bp.newsCritique || p.newsCritique,
        };
      }
      return p;
    });
  } else {
    mergedProjects = base.projects;
  }

  const state = {
    ...base, ...raw,
    financialReport: {
      ...base.financialReport, ...report,
      accounts: report?.accounts ?? base.financialReport.accounts,
      transactions: report?.transactions ?? [],
      trajectory: report?.trajectory ?? [],
      monthlyExpenses: report?.monthlyExpenses ?? base.financialReport.monthlyExpenses,
    },
    todayPursuit: (raw.todayPursuit ?? base.todayPursuit).map((p) => ({
      ...p, project: p.project || p.title || 'General Pursuit', action: p.action || p.title || '',
      isDone: p.isDone ?? p.isCompleted ?? false, isCompleted: p.isDone ?? p.isCompleted ?? false,
    })),
    projects: mergedProjects,
    todayBlocks: raw.todayBlocks ?? base.todayBlocks,
    waitingItems: raw.waitingItems ?? base.waitingItems,
    invoices: raw.invoices ?? [],
  };
  return deriveState(validateState(state));
}

export function loadState(): DaruWorkOSState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return normalizeState(saved ? JSON.parse(saved) : INITIAL_STATE);
  } catch (error) {
    console.error('Data lokal tidak dapat dibaca; salinan aslinya tetap disimpan.', error);
    return normalizeState(INITIAL_STATE);
  }
}

export function saveState(state: DaruWorkOSState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
