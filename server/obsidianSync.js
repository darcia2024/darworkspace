import fs from 'node:fs';
import path from 'node:path';
import { generateProjectNewsReport } from '../shared/projectReport.js';

export function isVaultAvailable(vault = process.env.OBSIDIAN_VAULT_PATH) {
  try { return Boolean(vault && fs.statSync(vault).isDirectory()); }
  catch { return false; }
}

export function syncToObsidianVault(state, vault = process.env.OBSIDIAN_VAULT_PATH) {
  if (!state || !isVaultAvailable(vault)) return { success: false, reason: 'Atur OBSIDIAN_VAULT_PATH ke folder vault yang tersedia.' };
  // Dedicated exports preserve the user's handwritten dashboard notes.
  const directory = path.join(vault, 'Daru Work OS Exports');
  const stamp = new Date().toISOString();
  const report = state.financialReport;
  const today = [
    `# Today\n\nDiperbarui: ${stamp}\n`,
    '## Target hari ini\n',
    ...state.todayPursuit.map((p) => `- [${p.isDone ? 'x' : ' '}] **${p.project}**: ${p.action}`),
    '\n## Blok fokus\n',
    ...state.todayBlocks.map((b) => `- [${b.isDone ? 'x' : ' '}] **${b.projectName}** (${b.timeboxMinutes} menit): ${b.action}`),
    '\n## Keuangan\n',
    `- Saldo likuid: Rp${report.totalLiquidBalance.toLocaleString('id-ID')}`,
    `- Beban bulanan estimasi: Rp${report.estimatedRealBurn.toLocaleString('id-ID')}`,
    `- Runway: ${report.estimatedRealBurn > 0 ? `${report.runwayDays} hari` : 'Belum ada estimasi pengeluaran'}`,
  ].join('\n');
  const priorities = [
    `# Current Priorities\n\nDiperbarui: ${stamp}\n`,
    ...state.projects.filter((p) => !['DONE', 'PARKED'].includes(p.boardColumn)).sort((a, b) => a.priority.localeCompare(b.priority))
      .map((p) => `- **${p.name}** [${p.priority}, ${p.status}]: ${p.nextAction}`),
    '\n## Waiting radar\n',
    ...state.waitingItems.map((w) => `- **${w.name}** [${w.status}]: ${w.reason}\n  - Follow-up: ${w.followUpDate}; ${w.actionToUnblock}`),
  ].join('\n');
  const syncedFiles = [];
  const errors = [];
  try { fs.mkdirSync(directory, { recursive: true }); }
  catch { return { success: false, error: 'Folder ekspor vault tidak dapat dibuat.', syncedFiles }; }
  for (const [name, content] of [['Today.md', today], ['Current Priorities.md', priorities], ['Project Update Report.md', generateProjectNewsReport(state)]]) {
    try {
      const target = path.join(directory, name);
      fs.writeFileSync(`${target}.tmp`, content, 'utf8');
      fs.renameSync(`${target}.tmp`, target);
      syncedFiles.push(`Daru Work OS Exports/${name}`);
    } catch { errors.push(`Gagal menulis ${name}`); }
  }
  return { success: errors.length === 0, syncedFiles, errors, timestamp: stamp };
}
