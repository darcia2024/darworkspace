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

export function parseProjectTitle(rawName: string): { client: string | null; title: string; detail: string | null } {
  if (!rawName) return { client: null, title: 'Untitled Task', detail: null };
  
  const dashMatch = rawName.match(/^([^—-]+)\s*[—-]\s*(.+)$/);
  if (dashMatch) {
    const part1 = dashMatch[1].trim();
    const part2 = dashMatch[2].trim();
    const parenInPart2 = part2.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (parenInPart2) {
      return {
        client: part1,
        title: parenInPart2[1].trim(),
        detail: parenInPart2[2].trim()
      };
    }
    return {
      client: part1,
      title: part2,
      detail: null
    };
  }

  const parenMatch = rawName.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    return {
      client: null,
      title: parenMatch[1].trim(),
      detail: parenMatch[2].trim()
    };
  }

  return {
    client: null,
    title: rawName,
    detail: null
  };
}

