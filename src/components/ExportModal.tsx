import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DaruWorkOSState } from '../types';
import { apiService, getApiToken, setApiToken } from '../services/api';
import { generateProjectNewsReport } from '../../shared/projectReport.js';

export const ExportModal: React.FC<{ isOpen: boolean; onClose: () => void; state: DaruWorkOSState; onUseServerState: (state: DaruWorkOSState) => void }> = ({ isOpen, onClose, state, onUseServerState }) => {
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(() => getApiToken());
  const [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  const markdown = generateProjectNewsReport(state);
  const backup = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `daru-workspace-${Date.now()}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const downloadReport = () => {
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `laporan-update-project-${new Date().toLocaleDateString('sv-SE')}.md`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div role="dialog" aria-modal="true" aria-labelledby="export-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
    <section className="w-full max-w-2xl bg-white rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center"><h2 id="export-title" className="font-bold text-xl">Laporan update project</h2><button aria-label="Tutup laporan" onClick={onClose}><X /></button></div>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap bg-zinc-50 p-4 border rounded text-xs">{markdown}</pre>
      <p className="text-sm">Format berita Markdown dengan ringkasan, kabar project, radar hambatan, dan agenda berikutnya.</p>
      <div className="flex flex-wrap gap-2">
        <button className="pill-black" onClick={downloadReport}>Unduh laporan Markdown</button>
        <button className="pill-white" onClick={async () => { try { await navigator.clipboard.writeText(markdown); setMessage('Laporan Markdown tersalin.'); } catch { setMessage('Clipboard tidak tersedia. Salin laporan dari pratinjau.'); } }}>Salin laporan</button>
        <button className="pill-black" onClick={backup}>Unduh backup JSON</button>
        <button className="pill-white" disabled={busy} onClick={async () => { setBusy(true); const result = await apiService.triggerObsidianSync(state); setMessage(result.success ? 'Catatan tersimpan di folder Daru Work OS Exports dalam vault.' : result.error || result.reason || 'Ekspor gagal.'); setBusy(false); }}>Sinkron ke vault</button>
      </div>
      <div className="border-t pt-4 space-y-2">
        <h3 className="font-bold text-sm">Token API perangkat ini</h3>
        <p className="text-sm text-zinc-600">Isi hanya jika server dijalankan dengan <code>DARU_API_TOKEN</code>, misalnya saat markas dibuka dari HP lewat jaringan lokal. Token disimpan di browser ini saja.</p>
        <div className="flex flex-wrap gap-2">
          <input
            type="password"
            aria-label="Token API perangkat ini"
            placeholder="Kosongkan jika server tanpa token"
            className="flex-1 min-w-[200px] border rounded-lg p-2 text-sm font-mono"
            value={token}
            onChange={event => setToken(event.target.value)}
          />
          <button className="pill-white" onClick={() => {
            setApiToken(token);
            setMessage(token.trim() ? 'Token tersimpan di browser ini.' : 'Token dihapus dari browser ini.');
            void apiService.checkHealth();
          }}>Simpan token</button>
        </div>
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
