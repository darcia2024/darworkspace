import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DaruWorkOSState } from '../types';
import { apiService } from '../services/api';

export const ExportModal: React.FC<{ isOpen: boolean; onClose: () => void; state: DaruWorkOSState; onUseServerState: (state: DaruWorkOSState) => void }> = ({ isOpen, onClose, state, onUseServerState }) => {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  const markdown = [
    `# Daru Work OS · ${new Date().toLocaleDateString('id-ID')}\n`,
    '## Target hari ini', ...state.todayPursuit.map(p => `- [${p.isDone ? 'x' : ' '}] **${p.project}**: ${p.action}`),
    '\n## Blok fokus', ...state.todayBlocks.map(b => `- [${b.isDone ? 'x' : ' '}] **${b.projectName}** (${b.timeboxMinutes} menit): ${b.action}`),
    '\n## Project', ...state.projects.map(p => `- **${p.name}** [${p.boardColumn}, ${p.priority}]: ${p.nextAction}\n  - Terbayar Rp${p.paidNumeric.toLocaleString('id-ID')}; sisa Rp${p.unpaidNumeric.toLocaleString('id-ID')}`),
    '\n## Waiting radar', ...state.waitingItems.map(w => `- **${w.name}**: ${w.reason}; tindak lanjut ${w.followUpDate}: ${w.actionToUnblock}`),
    '\n## Keuangan', `- Saldo likuid: Rp${state.financialReport.totalLiquidBalance.toLocaleString('id-ID')}`,
    ...state.financialReport.accounts.map(a => `- ${a.name}: Rp${a.balance.toLocaleString('id-ID')}`),
  ].join('\n');
  const backup = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `daru-workspace-${Date.now()}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div role="dialog" aria-modal="true" aria-labelledby="export-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
    <section className="w-full max-w-2xl bg-white rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center"><h2 id="export-title" className="font-bold text-xl">Ekspor & pemulihan data</h2><button aria-label="Tutup ekspor" onClick={onClose}><X /></button></div>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap bg-zinc-50 p-4 border rounded text-xs">{markdown}</pre>
      <p className="text-sm">JSON menyertakan seluruh workspace, transaksi, dan invoice. Markdown untuk catatan Obsidian.</p>
      <div className="flex flex-wrap gap-2">
        <button className="pill-black" onClick={backup}>Unduh backup JSON</button>
        <button className="pill-white" onClick={async () => { try { await navigator.clipboard.writeText(markdown); setMessage('Markdown tersalin.'); } catch { setMessage('Clipboard tidak tersedia. Salin teks di atas secara manual.'); } }}>Salin Markdown</button>
        <button className="pill-white" disabled={busy} onClick={async () => { setBusy(true); const result = await apiService.triggerObsidianSync(state); setMessage(result.success ? 'Catatan tersimpan di folder Daru Work OS Exports dalam vault.' : result.error || result.reason || 'Ekspor gagal.'); setBusy(false); }}>Sinkron ke vault</button>
      </div>
      <div className="border-t pt-4 space-y-2">
        <p className="text-sm">Jika ada konflik antar-sesi, unduh backup lokal dahulu. Memuat versi server mengganti tampilan dan salinan browser dengan data server.</p>
        <button className="pill-white" disabled={busy} onClick={async () => {
          if (!window.confirm('Sudah mengunduh backup JSON? Ganti workspace browser dengan versi server?')) return;
          setBusy(true);
          try { onUseServerState(await apiService.useServerState()); setMessage('Versi server dimuat.'); }
          catch (error) { setMessage(error instanceof Error ? error.message : 'Pemulihan gagal.'); }
          finally { setBusy(false); }
        }}>Muat versi server</button>
      </div>
      {message && <p className="text-sm" role="status">{message}</p>}
    </section>
  </div>;
};
