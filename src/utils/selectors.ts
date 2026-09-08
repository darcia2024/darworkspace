import { FinancialReport, ProjectCard } from '../types';

export function incomeForMonth(report: FinancialReport, now = new Date()): number {
  const month = now.getMonth();
  const year = now.getFullYear();
  return report.transactions.filter(tx => {
    if (tx.type !== 'income') return false;
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(tx.date) ? `${tx.date}T12:00:00` : tx.createdAt);
    return date.getMonth() === month && date.getFullYear() === year;
  }).reduce((sum, tx) => sum + tx.amount, 0);
}

export function actionableProjects(projects: ProjectCard[]): ProjectCard[] {
  const rank = { P1: 0, P2: 1, P3: 2, PARKED: 3 };
  return projects.filter(project => ['DOING', 'QUEUE'].includes(project.boardColumn))
    .sort((a, b) => rank[a.priority] - rank[b.priority] || Number(b.boardColumn === 'DOING') - Number(a.boardColumn === 'DOING') || Number(b.paidNumeric > 0) - Number(a.paidNumeric > 0) || a.name.localeCompare(b.name));
}
