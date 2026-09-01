import fs from 'fs';
import path from 'path';

const VAULT_PATH = 'C:\\Users\\ASUS\\OneDrive\\Documents\\Dar Vault\\Dar Vault';

export function isVaultAvailable() {
  try {
    return fs.existsSync(VAULT_PATH);
  } catch (e) {
    return false;
  }
}

export function syncToObsidianVault(state) {
  if (!state || !isVaultAvailable()) {
    return { success: false, reason: 'Vault path not found or state empty' };
  }

  const results = [];
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const report = state.financialReport;

  // 1. Sync Today.md
  try {
    const todayFile = path.join(VAULT_PATH, '00 Dashboard', 'Today.md');
    let todayContent = `\n_Last synced from Daru Work OS: ${todayStr}_\n\n`;
    todayContent += `## 🎯 Target Win Hari Ini (P1 Focus)\n\n`;
    (state.todayPursuit || []).forEach((tp) => {
      todayContent += `- [${tp.isDone ? 'x' : ' '}] **${tp.project}** — ${tp.action}\n`;
    });

    todayContent += `\n## ⚡ Timebox Deep Work Blocks\n\n`;
    (state.todayBlocks || []).forEach((tb, i) => {
      todayContent += `${i + 1}. [${tb.isDone ? 'x' : ' '}] **${tb.projectName}** (${tb.timeboxMinutes || 50}m)\n`;
      todayContent += `   - Action: ${tb.action}\n`;
      if (tb.rule) todayContent += `   - Rule: ${tb.rule}\n`;
    });

    todayContent += `\n## 🔴 Live Financial Telemetry\n\n`;
    if (report) {
      todayContent += `- **Saldo Likuid:** Rp${(report.totalLiquidBalance || 0).toLocaleString('id-ID')} (${report.modeStatus})\n`;
      todayContent += `- **Beban Fixed:** Rp${(report.fixedMonthlyBurn || 2665000).toLocaleString('id-ID')}/bln (Real: ~Rp4,5M/bln)\n`;
      todayContent += `- **Sisa Runway:** ±${report.runwayDays || 26} Hari\n`;
    }

    fs.writeFileSync(todayFile, todayContent, 'utf-8');
    results.push('00 Dashboard/Today.md');
  } catch (e) {
    console.error('Error syncing Today.md', e);
  }

  // 2. Sync Current Priorities.md
  try {
    const prioritiesFile = path.join(VAULT_PATH, '00 Dashboard', 'Current Priorities.md');
    let prioContent = `\n_Last synced from Daru Work OS: ${todayStr}_\n\n`;
    prioContent += `## Fokus Utama Sekarang\n\n`;
    prioContent += `Fase saat ini adalah: **Konsolidasi, bukan ekspansi.**\n\n`;
    prioContent += `### Live Snapshot — ${todayStr}\n\n`;
    prioContent += `1. **Zalvice Logo Bang Edo** — Delivery 2 konsep logo (Paid Rp1,2M)\n`;
    prioContent += `2. **Kasir Barber Underrated** — Finalkan alur kasir & invoice DP 50% (Rp3.000.000)\n`;
    prioContent += `3. **Setting KAEL Core** — Setting tenant, role kasir/owner, QRIS flow\n`;
    prioContent += `4. **Umi Elly LMS** — Tunggu konfirmasi termin 1 (Rp3.000.000)\n\n`;

    prioContent += `### Active Radar Pipeline\n\n`;
    (state.waitingItems || []).forEach((w) => {
      prioContent += `- **${w.name}** [${w.status}]: ${w.reason} (Value: ${w.value})\n`;
      prioContent += `  - Next Trigger: ${w.nextTrigger}\n`;
    });

    fs.writeFileSync(prioritiesFile, prioContent, 'utf-8');
    results.push('00 Dashboard/Current Priorities.md');
  } catch (e) {
    console.error('Error syncing Current Priorities.md', e);
  }

  return {
    success: true,
    syncedFiles: results,
    timestamp: new Date().toISOString()
  };
}
