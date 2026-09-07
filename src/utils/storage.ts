import { DaruWorkOSState } from '../types';
import { INITIAL_STATE } from './initialData';

const STORAGE_KEY = 'DARU_WORK_OS_STATE_V24';

export function loadState(): DaruWorkOSState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(saved);
    return {
      ...INITIAL_STATE,
      ...parsed,
      financialReport: {
        ...INITIAL_STATE.financialReport,
        ...(parsed.financialReport || {}),
        monthlyExpenses: parsed.financialReport?.monthlyExpenses || INITIAL_STATE.financialReport.monthlyExpenses,
        fixedMonthlyBurn: parsed.financialReport?.fixedMonthlyBurn || INITIAL_STATE.financialReport.fixedMonthlyBurn,
        estimatedRealBurn: parsed.financialReport?.estimatedRealBurn || INITIAL_STATE.financialReport.estimatedRealBurn,
        runwayDays: parsed.financialReport?.runwayDays || INITIAL_STATE.financialReport.runwayDays,
        runwayMonths: parsed.financialReport?.runwayMonths || INITIAL_STATE.financialReport.runwayMonths,
      },
      quickStats: parsed.quickStats || INITIAL_STATE.quickStats,
      todayBlocks: Array.isArray(parsed.todayBlocks) ? parsed.todayBlocks : INITIAL_STATE.todayBlocks,
      todayPursuit: Array.isArray(parsed.todayPursuit)
        ? parsed.todayPursuit.map((tp: any) => ({
            ...tp,
            project: tp.project || tp.title || 'General Pursuit',
            action: tp.action || tp.title || '',
            title: tp.title || tp.project || '',
            isDone: tp.isDone ?? tp.isCompleted ?? false,
            isCompleted: tp.isCompleted ?? tp.isDone ?? false,
          }))
        : INITIAL_STATE.todayPursuit,
      projects: Array.isArray(parsed.projects) ? parsed.projects : INITIAL_STATE.projects,
      waitingItems: Array.isArray(parsed.waitingItems) ? parsed.waitingItems : INITIAL_STATE.waitingItems,
    };
  } catch (error) {
    console.error('Failed to load state from localStorage', error);
    return INITIAL_STATE;
  }
}

export function saveState(state: DaruWorkOSState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage', error);
  }
}
