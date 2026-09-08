import React, { useEffect, useState } from 'react';
import { X, Printer, Copy, Save } from 'lucide-react';
import { ProjectCard, InvoiceRecord } from '../types';

interface InvoiceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectCard[];
  initialProject?: ProjectCard | null;
  invoices?: InvoiceRecord[];
  onSaveInvoice?: (invoice: InvoiceRecord) => void;
}

const rupiah = (amount: number) => `Rp${amount.toLocaleString('id-ID')}`;
const localDate = () => new Date().toLocaleDateString('sv-SE');

export const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({ isOpen, onClose, projects, initialProject, invoices = [], onSaveInvoice }) => {
  const [draft, setDraft] = useState<InvoiceRecord | null>(null);
  const [message, setMessage] = useState('');

  const createDraft = (project?: ProjectCard) => {
    const id = crypto.randomUUID();
    const date = localDate();
    const amount = project?.unpaidNumeric ?? 0;
    setDraft({
      id, invoiceNumber: `INV/${date.replace(/-/g, '')}/${id.slice(0, 8).toUpperCase()}`,
      projectId: project?.id, projectName: project?.name || '', clientName: '', date, dueDate: date,
      items: [{ id: crypto.randomUUID(), description: project?.billingMilestone || 'Sisa tagihan project', quantity: 1, unitPrice: amount, amount }],
      subtotal: amount, total: amount, status: 'DRAFT', notes: '',
      bankName: 'Bank Mandiri', bankAccount: '1550010616962', accountHolder: 'Daru Fahmaa Muliawan', createdAt: new Date().toISOString(),
    });
    setMessage('');
  };

  useEffect(() => {
    if (isOpen) createDraft(initialProject || projects[0]);
  }, [isOpen, initialProject]);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [isOpen, onClose]);

  if (!isOpen || !draft) return null;
  const project = projects.find(item => item.id === draft.projectId);
  const field = <K extends keyof InvoiceRecord>(key: K, value: InvoiceRecord[K]) => setDraft(previous => previous ? { ...previous, [key]: value } : previous);
  const setAmount = (amount: number, description = draft.items[0]?.description || 'Tagihan project') => {
    setDraft(previous => previous ? { ...previous, subtotal: amount, total: amount, items: [{ id: previous.items[0]?.id || crypto.randomUUID(), description, quantity: 1, unitPrice: amount, amount }] } : previous);
  };
  const save = () => {
    if (!draft.projectName.trim() || !draft.clientName.trim() || !draft.invoiceNumber.trim() || !draft.date || !draft.dueDate || draft.dueDate < draft.date || !Number.isSafeInteger(draft.total) || draft.total <= 0) {
      setMessage('Isi nama project, klien, tanggal yang valid, dan nominal rupiah lebih dari nol.');
      return false;
    }
    if (invoices.some(invoice => invoice.id !== draft.id && invoice.invoiceNumber === draft.invoiceNumber)) {
      setMessage('Nomor invoice sudah digunakan. Pakai nomor berbeda.');
      return false;
    }
    onSaveInvoice?.(draft);
    setMessage('Draft tersimpan. Penerimaan uang dicatat melalui Catat Kas.');
    return true;
  };
  const copy = async () => {
    const text = [`Invoice ${draft.invoiceNumber}`, `Klien: ${draft.clientName}`, `Project: ${draft.projectName}`, `Tanggal: ${draft.date}`, `Jatuh tempo: ${draft.dueDate}`, ...draft.items.map(item => `${item.description}: ${rupiah(item.amount)}`), `Total: ${rupiah(draft.total)}`, `${draft.bankName} ${draft.bankAccount} a.n. ${draft.accountHolder}`, draft.notes].join('\n');
    try { await navigator.clipboard.writeText(text); setMessage('Ringkasan invoice tersalin.'); }
    catch { setMessage('Clipboard tidak tersedia. Pilih teks invoice dan salin secara manual.'); }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="invoice-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-5">
        <div className="flex justify-between items-center no-print">
          <h2 id="invoice-title" className="text-xl font-bold">Invoice project</h2>
          <button aria-label="Tutup invoice" onClick={onClose}><X /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 no-print">
          <label className="text-sm">Project
            <select className="block w-full border p-2 rounded" value={draft.projectId || ''} onChange={event => createDraft(projects.find(item => item.id === event.target.value))}>
              <option value="">Invoice manual</option>
              {projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="text-sm">Buka invoice tersimpan
            <select className="block w-full border p-2 rounded" value={invoices.some(item => item.id === draft.id) ? draft.id : ''} onChange={event => { const invoice = invoices.find(item => item.id === event.target.value); if (invoice) { setDraft(structuredClone(invoice)); setMessage(''); } }}>
              <option value="">Pilih invoice</option>
              {invoices.map(item => <option key={item.id} value={item.id}>{item.invoiceNumber} · {item.clientName}</option>)}
            </select>
          </label>
          {(['invoiceNumber', 'projectName', 'clientName', 'bankName', 'bankAccount', 'accountHolder'] as const).map((key, index) => (
            <label key={key} className="text-sm">{['Nomor invoice', 'Nama project', 'Nama klien', 'Bank', 'Nomor rekening', 'Pemilik rekening'][index]}
              <input autoFocus={index === 0} className="block w-full border p-2 rounded" value={draft[key]} onChange={event => field(key, event.target.value)} />
            </label>
          ))}
          <label className="text-sm">Tanggal<input type="date" className="block w-full border p-2 rounded" value={draft.date} onChange={event => field('date', event.target.value)} /></label>
          <label className="text-sm">Jatuh tempo<input type="date" min={draft.date} className="block w-full border p-2 rounded" value={draft.dueDate} onChange={event => field('dueDate', event.target.value)} /></label>
          <label className="text-sm">Nominal rupiah<input type="number" min="1" step="1" className="block w-full border p-2 rounded" value={draft.total} onChange={event => setAmount(Number(event.target.value))} /></label>
          <label className="text-sm">Deskripsi tagihan<input className="block w-full border p-2 rounded" value={draft.items[0]?.description || ''} onChange={event => setAmount(draft.total, event.target.value)} /></label>
          <label className="text-sm sm:col-span-2">Catatan<textarea className="block w-full border p-2 rounded" value={draft.notes} onChange={event => field('notes', event.target.value)} /></label>
        </div>
        {project && <div className="flex flex-wrap gap-2 no-print">
          {([[0.5, 'DP 50%'], [0.3, 'Termin 2 (30%)'], [0.2, 'Termin 3 (20%)'], [1, 'Kontrak penuh']] as const).map(([fraction, label]) => <button key={label} className="border rounded px-3 py-2 text-sm" onClick={() => setAmount(Math.round(project.nominalNumeric * fraction), label)}>{label}</button>)}
          <button className="border rounded px-3 py-2 text-sm" onClick={() => setAmount(project.unpaidNumeric, 'Sisa tagihan')}>Sisa tagihan</button>
        </div>}
        <article id="printable-a4-sheet" className="border p-6 space-y-4 text-zinc-900 bg-white">
          <h3 className="text-2xl font-bold">INVOICE · {draft.invoiceNumber}</h3>
          <p>{draft.date} · Jatuh tempo {draft.dueDate}</p>
          <p>Kepada: <strong>{draft.clientName || '(isi nama klien)'}</strong><br />Project: {draft.projectName}</p>
          {draft.items.map(item => <p key={item.id} className="flex justify-between gap-4"><span>{item.description}</span><span>{rupiah(item.amount)}</span></p>)}
          <p className="text-xl font-bold border-t pt-3">Total: {rupiah(draft.total)}</p>
          <p>{draft.bankName} · {draft.bankAccount}<br />a.n. {draft.accountHolder}</p>
          <p className="whitespace-pre-wrap">{draft.notes}</p>
        </article>
        {message && <p role="status" className="text-sm no-print">{message}</p>}
        <div className="flex flex-wrap gap-3 no-print">
          <button className="pill-black flex gap-2 items-center" onClick={save}><Save size={16} />Simpan draft</button>
          <button className="pill-white flex gap-2 items-center" onClick={() => { if (save()) window.print(); }}><Printer size={16} />Cetak / simpan PDF</button>
          <button className="pill-white flex gap-2 items-center" onClick={copy}><Copy size={16} />Salin ringkasan</button>
        </div>
      </div>
    </div>
  );
};
