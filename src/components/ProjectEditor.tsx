import React, { useState } from 'react';
import { ProjectCard } from '../types';

export function ProjectEditor({ project, onSave, onClose }: { project: ProjectCard; onSave: (project: ProjectCard) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(project);
  const field = <K extends keyof ProjectCard>(key: K, value: ProjectCard[K]) => setDraft(previous => ({ ...previous, [key]: value }));
  return <div role="dialog" aria-modal="true" aria-labelledby="project-editor-title" className="fixed inset-0 z-50 p-4 bg-black/70 flex items-center justify-center">
    <form className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4" onSubmit={event => {
      event.preventDefault();
      if (!draft.name.trim() || !Number.isSafeInteger(draft.nominalNumeric) || draft.nominalNumeric < 0) return;
      onSave({ ...draft, name: draft.name.trim(), valueText: `Rp${draft.nominalNumeric.toLocaleString('id-ID')}`, paymentStatus: draft.paidNumeric > 0 ? draft.paidNumeric >= draft.nominalNumeric ? 'Paid' : 'Partial' : draft.paymentStatus });
      onClose();
    }}>
      <h2 id="project-editor-title" className="text-xl font-bold">Edit project</h2>
      <label className="block text-sm">Nama project<input autoFocus required className="block border rounded p-2 w-full" value={draft.name} onChange={event => field('name', event.target.value)} /></label>
      <label className="block text-sm">Next action<textarea className="block border rounded p-2 w-full" value={draft.nextAction} onChange={event => field('nextAction', event.target.value)} /></label>
      <label className="block text-sm">Kriteria selesai<textarea className="block border rounded p-2 w-full" value={draft.definitionOfDone || ''} onChange={event => field('definitionOfDone', event.target.value)} /></label>
      <label className="block text-sm">Nilai kontrak (rupiah)<input type="number" min="0" step="1" required className="block border rounded p-2 w-full" value={draft.nominalNumeric} onChange={event => field('nominalNumeric', Number(event.target.value))} /></label>
      <p className="text-xs text-zinc-600">Sudah diterima Rp{draft.paidNumeric.toLocaleString('id-ID')}. Tambahkan pembayaran melalui Catat Kas.</p>
      <label className="block text-sm">Prioritas<select className="block border rounded p-2 w-full" value={draft.priority} onChange={event => field('priority', event.target.value as ProjectCard['priority'])}>{['P1', 'P2', 'P3', 'PARKED'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="block text-sm">Kolom board<select className="block border rounded p-2 w-full" value={draft.boardColumn} onChange={event => field('boardColumn', event.target.value as ProjectCard['boardColumn'])}>{['DOING', 'QUEUE', 'WAITING', 'PARKED', 'DONE'].map(value => <option key={value}>{value}</option>)}</select></label>
      {draft.boardColumn === 'WAITING' && <label className="block text-sm">Jenis penantian<select className="block border rounded p-2 w-full" value={draft.status.startsWith('Waiting') ? draft.status : 'Waiting Client'} onChange={event => field('status', event.target.value as ProjectCard['status'])}>{['Waiting Payment', 'Waiting Approval', 'Waiting Client', 'Waiting Kickoff'].map(value => <option key={value}>{value}</option>)}</select></label>}
      <label className="block text-sm">Blocker<input className="block border rounded p-2 w-full" value={draft.blocker || ''} onChange={event => field('blocker', event.target.value)} /></label>
      <label className="block text-sm">Tanggal follow-up<input type="date" className="block border rounded p-2 w-full" value={draft.followUpDeadline || ''} onChange={event => field('followUpDeadline', event.target.value)} /></label>
      <div className="flex gap-2"><button className="pill-black" type="submit">Simpan perubahan</button><button className="pill-white" type="button" onClick={onClose}>Batal</button></div>
    </form>
  </div>;
}
