// Historical legacy archives interface
// Real financial snapshots are stored in server/data or ledger, not embedded into client code.

export interface LegacyArchiveItem {
  label: string;
  client: string;
  category: string;
  amount: number;
  profit: number;
  tag: string;
  status: string;
}

export interface LegacyArchive {
  id: string;
  monthName: string;
  periodTag: string;
  target: number;
  realizedIncome: number;
  realizedExpense: number;
  netSurplus: number;
  endingBalance: number;
  progressPercent: number;
  modeStatus: string;
  runwayMonths: string;
  milestones: string[];
  breakdown: LegacyArchiveItem[];
  expensesBreakdown: Array<{ label: string; amount: number; note: string }>;
  summaryNote: string;
}

export const legacyArchives: LegacyArchive[] = [];
