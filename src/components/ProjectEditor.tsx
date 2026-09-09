import { useState } from 'react';
import { ProjectCard } from '../types';

export function ProjectEditor({
  project,
  onSave,
  onClose,
  onDelete
}: {
  project: ProjectCard;
  onSave: (project: ProjectCard) => void;
  onClose: () => void;
  onDelete?: (projectId: string) => void;
}) {
  const [draft, setDraft] = useState(project);
  const field = <K extends keyof ProjectCard>(key: K, value: ProjectCard[K]) => setDraft(previous => ({ ...previous, [key]: value }));

  const handleDelete = () => {
    if (window.confirm(`Yakin ingin menghapus project "${project.name}"? Task dan referensi terkait akan dibersihkan.`)) {
      onDelete?.(project.id);
      onClose();
    }
  };

  return <div role="dialog" aria-modal="true" aria-labelledby="project-editor-title" className="fixed inset-0 z-50 p-4 bg-black/70 flex items-center justify-center font-sans">
    <form className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4" onSubmit={event => {
      event.preventDefault();
      if (!draft.name.trim() || !Number.isSafeInteger(draft.nominalNumeric) || draft.nominalNumeric < 0) return;
      onSave({ ...draft, name: draft.name.trim(), valueText: `Rp${draft.nominalNumeric.toLocaleString('id-ID')}`, paymentStatus: draft.paidNumeric > 0 ? draft.paidNumeric >= draft.nominalNumeric ? 'Paid' : 'Partial' : draft.paymentStatus });
      onClose();
    }}>
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <h2 id="project-editor-title" className="text-xl font-bold">Edit project</h2>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
          >
            Hapus Project
          </button>
        )}
      </div>
      <label className="block text-sm font-medium">Nama project<input autoFocus required className="block border rounded-lg p-2 w-full mt-1 text-sm" value={draft.name} onChange={event => field('name', event.target.value)} /></label>
      <label className="block text-sm font-medium">Nomor WhatsApp Klien<input placeholder="Contoh: 08123456789 atau 628123456789" className="block border rounded-lg p-2 w-full mt-1 text-sm font-mono" value={draft.clientPhone || ''} onChange={event => field('clientPhone', event.target.value)} /></label>
      <label className="block text-sm font-medium">Next action<textarea className="block border rounded-lg p-2 w-full mt-1 text-sm" value={draft.nextAction} onChange={event => field('nextAction', event.target.value)} /></label>
      <label className="block text-sm font-medium">Kriteria selesai<textarea className="block border rounded-lg p-2 w-full mt-1 text-sm" value={draft.definitionOfDone || ''} onChange={event => field('definitionOfDone', event.target.value)} /></label>
      <label className="block text-sm font-medium">Nilai kontrak (rupiah)<input type="number" min="0" step="1" required className="block border rounded-lg p-2 w-full mt-1 text-sm font-mono" value={draft.nominalNumeric} onChange={event => field('nominalNumeric', Number(event.target.value))} /></label>
      <p className="text-xs text-zinc-600 font-mono">Sudah diterima Rp{draft.paidNumeric.toLocaleString('id-ID')}. Tambahkan pembayaran melalui Catat Kas.</p>
      <label className="block text-sm font-medium">Prioritas<select className="block border rounded-lg p-2 w-full mt-1 text-sm" value={draft.priority} onChange={event => field('priority', event.target.value as ProjectCard['priority'])}>{['P1', 'P2', 'P3', 'PARKED'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="block text-sm font-medium">Kolom board<select className="block border rounded-lg p-2 w-full mt-1 text-sm" value={draft.boardColumn} onChange={event => field('boardColumn', event.target.value as ProjectCard['boardColumn'])}>{['DOING', 'QUEUE', 'WAITING', 'PARKED', 'DONE'].map(value => <option key={value}>{value}</option>)}</select></label>
      {draft.boardColumn === 'WAITING' && <label className="block text-sm font-medium">Jenis penantian<select className="block border rounded-lg p-2 w-full mt-1 text-sm" value={draft.status.startsWith('Waiting') ? draft.status : 'Waiting Client'} onChange={event => field('status', event.target.value as ProjectCard['status'])}>{['Waiting Payment', 'Waiting Approval', 'Waiting Client', 'Waiting Kickoff'].map(value => <option key={value}>{value}</option>)}</select></label>}
      <label className="block text-sm font-medium">Blocker<input className="block border rounded-lg p-2 w-full mt-1 text-sm" value={draft.blocker || ''} onChange={event => field('blocker', event.target.value)} /></label>
      <label className="block text-sm font-medium">Tanggal follow-up<input type="date" className="block border rounded-lg p-2 w-full mt-1 text-sm font-mono" value={draft.followUpDeadline || ''} onChange={event => field('followUpDeadline', event.target.value)} /></label>
      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2">
          <button className="pill-black text-sm" type="submit">Simpan perubahan</button>
          <button className="pill-white text-sm" type="button" onClick={onClose}>Batal</button>
        </div>
      </div>
    </form>
  </div>;
}
