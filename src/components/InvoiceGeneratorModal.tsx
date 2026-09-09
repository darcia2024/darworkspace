import React, { useEffect, useState } from 'react';
import { X, Printer, Copy, Save, Plus, Trash2, MessageSquare, FileText, List } from 'lucide-react';
import { ProjectCard, InvoiceRecord, InvoiceItem } from '../types';

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
const BANK_STORAGE_KEY = 'DARU_OS_DEFAULT_BANK';

const getStoredBank = () => {
  try {
    const saved = localStorage.getItem(BANK_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { bankName: '', bankAccount: '', accountHolder: '' };
};

export const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({
  isOpen,
  onClose,
  projects,
  initialProject,
  invoices = [],
  onSaveInvoice
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'list'>('editor');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'>('ALL');
  const [draft, setDraft] = useState<InvoiceRecord | null>(null);
  const [message, setMessage] = useState('');

  const createDraft = (project?: ProjectCard) => {
    const id = crypto.randomUUID();
    const date = localDate();
    const amount = project?.unpaidNumeric ?? 0;
    const bankDefaults = getStoredBank();
    const initialItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: project?.billingMilestone || 'Sisa tagihan project',
      quantity: 1,
      unitPrice: amount,
      amount
    };
    setDraft({
      id,
      invoiceNumber: `INV/${date.replace(/-/g, '')}/${id.slice(0, 8).toUpperCase()}`,
      projectId: project?.id,
      projectName: project?.name || '',
      clientName: '',
      clientPhone: project?.clientPhone || '',
      date,
      dueDate: date,
      items: [initialItem],
      subtotal: amount,
      total: amount,
      status: 'DRAFT',
      notes: 'Pembayaran mohon ditransfer sesuai rekening di bawah.',
      bankName: bankDefaults.bankName || '',
      bankAccount: bankDefaults.bankAccount || '',
      accountHolder: bankDefaults.accountHolder || '',
      createdAt: new Date().toISOString(),
    });
    setMessage('');
  };

  useEffect(() => {
    if (isOpen) {
      createDraft(initialProject || projects[0]);
      setActiveTab('editor');
    }
  }, [isOpen, initialProject]);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [isOpen, onClose]);

  if (!isOpen || !draft) return null;
  const project = projects.find(item => item.id === draft.projectId);

  const field = <K extends keyof InvoiceRecord>(key: K, value: InvoiceRecord[K]) => {
    setDraft(previous => previous ? { ...previous, [key]: value } : previous);
  };

  // Recalculate subtotal and total whenever items change
  const updateItems = (newItems: InvoiceItem[]) => {
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    setDraft(prev => prev ? {
      ...prev,
      items: newItems,
      subtotal,
      total: subtotal
    } : null);
  };

  const handleItemChange = (index: number, key: keyof InvoiceItem, val: string | number) => {
    const updated = [...draft.items];
    const target = { ...updated[index] };
    if (key === 'quantity') {
      const q = Math.max(1, parseInt(String(val), 10) || 1);
      target.quantity = q;
      target.amount = target.unitPrice * q;
    } else if (key === 'unitPrice') {
      const p = Math.max(0, parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0);
      target.unitPrice = p;
      target.amount = p * target.quantity;
    } else if (key === 'description') {
      target.description = String(val);
    }
    updated[index] = target;
    updateItems(updated);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    updateItems([...draft.items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (draft.items.length <= 1) return;
    updateItems(draft.items.filter((_, i) => i !== index));
  };

  const setPresetAmount = (amount: number, description: string) => {
    updateItems([{
      id: crypto.randomUUID(),
      description,
      quantity: 1,
      unitPrice: amount,
      amount
    }]);
  };

  const save = () => {
    if (!draft.projectName.trim() || !draft.clientName.trim() || !draft.invoiceNumber.trim() || !draft.date || !draft.dueDate || draft.dueDate < draft.date || !Number.isSafeInteger(draft.total) || draft.total <= 0) {
      setMessage('Isi nama project, klien, tanggal yang valid, dan nominal total rupiah lebih dari nol.');
      return false;
    }
    if (invoices.some(invoice => invoice.id !== draft.id && invoice.invoiceNumber === draft.invoiceNumber)) {
      setMessage('Nomor invoice sudah digunakan. Pakai nomor berbeda.');
      return false;
    }
    try {
      if (draft.bankName || draft.bankAccount || draft.accountHolder) {
        localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify({
          bankName: draft.bankName,
          bankAccount: draft.bankAccount,
          accountHolder: draft.accountHolder,
        }));
      }
    } catch {}
    onSaveInvoice?.(draft);
    setMessage('Invoice tersimpan dengan status ' + draft.status + '.');
    return true;
  };

  const copy = async () => {
    const text = [
      `*INVOICE ${draft.invoiceNumber}*`,
      `Klien: ${draft.clientName}`,
      `Project: ${draft.projectName}`,
      `Tanggal: ${draft.date} (Jatuh Tempo: ${draft.dueDate})`,
      `Status: ${draft.status}`,
      '',
      ...draft.items.map(item => `- ${item.description} (${item.quantity}x @ ${rupiah(item.unitPrice)}): ${rupiah(item.amount)}`),
      '',
      `*Total: ${rupiah(draft.total)}*`,
      `Rekening: ${draft.bankName} ${draft.bankAccount} a.n. ${draft.accountHolder}`,
      draft.notes ? `Catatan: ${draft.notes}` : ''
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setMessage('Ringkasan invoice berhasil disalin!');
    } catch {
      setMessage('Clipboard tidak tersedia. Silakan pilih teks dan salin manual.');
    }
  };

  const handleOpenWhatsApp = () => {
    const phone = draft.clientPhone || project?.clientPhone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const text = encodeURIComponent(
      `Halo ${draft.clientName || 'Bapak/Ibu'},\n\nBerikut ringkasan invoice untuk project *${draft.projectName}*:\nNomor: ${draft.invoiceNumber}\nTotal: ${rupiah(draft.total)}\nJatuh Tempo: ${draft.dueDate}\n\nPembayaran dapat ditransfer ke:\n${draft.bankName} ${draft.bankAccount}\na.n. ${draft.accountHolder}\n\nTerima kasih banyak!`
    );
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredInvoices = invoices.filter(inv => statusFilter === 'ALL' || inv.status === statusFilter);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="invoice-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 font-sans">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center no-print border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <h2 id="invoice-title" className="text-xl font-extrabold text-zinc-900">Invoice Generator & Tracker</h2>
            <div className="flex items-center bg-zinc-100 p-1 rounded-full text-xs font-semibold">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                  activeTab === 'editor' ? 'pill-black' : 'text-zinc-600 hover:text-black'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                  activeTab === 'list' ? 'pill-black' : 'text-zinc-600 hover:text-black'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Daftar ({invoices.length})</span>
              </button>
            </div>
          </div>
          <button aria-label="Tutup modal invoice" onClick={onClose} className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeTab === 'list' ? (
          <div className="space-y-4 no-print">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {(['ALL', 'DRAFT', 'SENT', 'PAID', 'CANCELLED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                      statusFilter === st ? 'pill-black' : 'pill-white text-zinc-600'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  createDraft(projects[0]);
                  setActiveTab('editor');
                }}
                className="pill-black text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Invoice Baru</span>
              </button>
            </div>

            <div className="space-y-2">
              {filteredInvoices.map(inv => (
                <div key={inv.id} className="bento-card p-4 flex flex-wrap items-center justify-between gap-3 border border-zinc-200">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-mono">{inv.invoiceNumber}</strong>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                        inv.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                        'bg-zinc-100 text-zinc-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium">
                      {inv.clientName} · {inv.projectName} · Jatuh tempo: {inv.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <strong className="text-base font-mono tabular-nums font-bold text-zinc-900">
                      {rupiah(inv.total)}
                    </strong>
                    <select
                      value={inv.status}
                      onChange={e => {
                        const updated: InvoiceRecord = { ...inv, status: e.target.value as any };
                        onSaveInvoice?.(updated);
                      }}
                      className="text-xs font-mono border rounded-lg px-2 py-1 bg-white focus:outline-none"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="SENT">SENT</option>
                      <option value="PAID">PAID</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button
                      onClick={() => {
                        setDraft(structuredClone(inv));
                        setActiveTab('editor');
                      }}
                      className="pill-white text-xs px-3 py-1 font-semibold"
                    >
                      Buka
                    </button>
                  </div>
                </div>
              ))}
              {!filteredInvoices.length && (
                <p className="text-sm text-zinc-500 text-center py-8">Belum ada invoice dengan filter ini.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Editor Top Config */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 no-print text-xs">
              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">Project Terkait:</span>
                <select
                  className="block w-full border border-zinc-200 rounded-xl p-2 bg-white"
                  value={draft.projectId || ''}
                  onChange={event => createDraft(projects.find(item => item.id === event.target.value))}
                >
                  <option value="">-- Invoice Manual (Tanpa Project) --</option>
                  {projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">Status Invoice:</span>
                <select
                  className="block w-full border border-zinc-200 rounded-xl p-2 bg-white font-mono font-bold"
                  value={draft.status}
                  onChange={e => field('status', e.target.value as any)}
                >
                  <option value="DRAFT">DRAFT (Konsep)</option>
                  <option value="SENT">SENT (Terkirim ke Klien)</option>
                  <option value="PAID">PAID (Sudah Lunas)</option>
                  <option value="CANCELLED">CANCELLED (Batal)</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">Nomor Invoice:</span>
                <input
                  className="block w-full border border-zinc-200 rounded-xl p-2 font-mono"
                  value={draft.invoiceNumber}
                  onChange={event => field('invoiceNumber', event.target.value)}
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">Nama Project / Perihal:</span>
                <input
                  className="block w-full border border-zinc-200 rounded-xl p-2"
                  value={draft.projectName}
                  onChange={event => field('projectName', event.target.value)}
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">Nama Klien / Perusahaan:</span>
                <input
                  className="block w-full border border-zinc-200 rounded-xl p-2"
                  placeholder="Contoh: PT Harapan Jaya"
                  value={draft.clientName}
                  onChange={event => field('clientName', event.target.value)}
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">No. WhatsApp Klien:</span>
                <input
                  className="block w-full border border-zinc-200 rounded-xl p-2 font-mono"
                  placeholder="08123456789"
                  value={draft.clientPhone || ''}
                  onChange={event => field('clientPhone', event.target.value)}
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">Tanggal Invoice:</span>
                <input
                  type="date"
                  className="block w-full border border-zinc-200 rounded-xl p-2 font-mono"
                  value={draft.date}
                  onChange={event => field('date', event.target.value)}
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">Jatuh Tempo:</span>
                <input
                  type="date"
                  min={draft.date}
                  className="block w-full border border-zinc-200 rounded-xl p-2 font-mono"
                  value={draft.dueDate}
                  onChange={event => field('dueDate', event.target.value)}
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">Nama Bank:</span>
                <input
                  className="block w-full border border-zinc-200 rounded-xl p-2"
                  placeholder="BCA / Mandiri / Jago"
                  value={draft.bankName}
                  onChange={event => field('bankName', event.target.value)}
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">Nomor Rekening:</span>
                <input
                  className="block w-full border border-zinc-200 rounded-xl p-2 font-mono"
                  placeholder="1234567890"
                  value={draft.bankAccount}
                  onChange={event => field('bankAccount', event.target.value)}
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-zinc-700">Atas Nama Rekening:</span>
                <input
                  className="block w-full border border-zinc-200 rounded-xl p-2"
                  placeholder="Nama Pemilik Rekening"
                  value={draft.accountHolder}
                  onChange={event => field('accountHolder', event.target.value)}
                />
              </label>
            </div>

            {/* Quick Presets for Project */}
            {project && (
              <div className="flex flex-wrap items-center gap-2 no-print text-xs">
                <span className="font-semibold text-zinc-500 mr-1">// Quick Preset:</span>
                {([[0.5, 'DP 50%'], [0.3, 'Termin 2 (30%)'], [0.2, 'Termin 3 (20%)'], [1, 'Kontrak Penuh']] as const).map(([fraction, label]) => (
                  <button
                    key={label}
                    type="button"
                    className="pill-white px-3 py-1 font-mono"
                    onClick={() => setPresetAmount(Math.round(project.nominalNumeric * fraction), `${label} - ${project.name}`)}
                  >
                    {label} ({rupiah(Math.round(project.nominalNumeric * fraction))})
                  </button>
                ))}
                {project.unpaidNumeric > 0 && (
                  <button
                    type="button"
                    className="pill-white px-3 py-1 font-mono font-semibold text-rose-700"
                    onClick={() => setPresetAmount(project.unpaidNumeric, `Pelunasan Sisa - ${project.name}`)}
                  >
                    Sisa Tagihan ({rupiah(project.unpaidNumeric)})
                  </button>
                )}
              </div>
            )}

            {/* Line Items Table */}
            <div className="border border-zinc-200 rounded-2xl p-4 space-y-3 no-print">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">// Rincian Item Tagihan</h4>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="pill-black text-xs px-3 py-1 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              <div className="space-y-2">
                {draft.items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                    <div className="col-span-12 sm:col-span-5">
                      <input
                        type="text"
                        placeholder="Deskripsi item / pekerjaan..."
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full border border-zinc-200 rounded-lg px-2.5 py-1.5 font-mono text-center focus:outline-none"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Harga Satuan (Rp)"
                        value={item.unitPrice ? item.unitPrice.toLocaleString('id-ID') : ''}
                        onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full border border-zinc-200 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-right focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-1 font-mono font-semibold tabular-nums text-right">
                      {rupiah(item.amount)}
                    </div>
                    <div className="col-span-1 sm:col-span-1 text-center">
                      {draft.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-zinc-400 hover:text-rose-600 p-1"
                          aria-label="Hapus baris item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 pt-3 flex justify-end gap-6 text-sm font-mono">
                <span className="text-zinc-500">Subtotal:</span>
                <span className="font-bold tabular-nums">{rupiah(draft.subtotal)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="no-print">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Catatan / Terms of Payment:</label>
              <textarea
                className="w-full border border-zinc-200 rounded-xl p-2.5 text-xs focus:outline-none"
                rows={2}
                value={draft.notes}
                onChange={event => field('notes', event.target.value)}
              />
            </div>

            {/* Printable A4 Sheet Preview */}
            <article id="printable-a4-sheet" className="border border-zinc-300 rounded-2xl p-6 sm:p-8 space-y-5 text-zinc-900 bg-white shadow-sm">
              <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
                <div>
                  <h3 className="text-2xl font-black tracking-tight font-sans">INVOICE</h3>
                  <p className="font-mono text-xs text-zinc-600 mt-0.5">{draft.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                    draft.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                    draft.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                    draft.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                    'bg-zinc-100 text-zinc-800'
                  }`}>
                    {draft.status}
                  </span>
                  <p className="font-mono text-xs text-zinc-500 mt-2">Tanggal: {draft.date}</p>
                  <p className="font-mono text-xs text-zinc-500">Jatuh Tempo: {draft.dueDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 font-mono">DITUJUKAN KEPADA:</span>
                  <p className="font-bold text-sm text-zinc-900 mt-0.5">{draft.clientName || '(Nama Klien)'}</p>
                  {draft.clientPhone && <p className="font-mono text-zinc-600">{draft.clientPhone}</p>}
                </div>
                <div>
                  <span className="text-zinc-500 font-mono">PROJECT:</span>
                  <p className="font-bold text-sm text-zinc-900 mt-0.5">{draft.projectName}</p>
                </div>
              </div>

              {/* Items in Printable */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 font-mono text-zinc-500">
                    <th className="py-2">Deskripsi</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Harga Satuan</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {draft.items.map(item => (
                    <tr key={item.id}>
                      <td className="py-2.5">{item.description || 'Pekerjaan project'}</td>
                      <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums">{rupiah(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-mono font-semibold tabular-nums">{rupiah(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-zinc-200 pt-3 flex justify-between items-center">
                <div className="text-xs space-y-0.5">
                  <span className="font-mono text-zinc-500">REKENING PEMBAYARAN:</span>
                  <p className="font-semibold">{draft.bankName} - {draft.bankAccount}</p>
                  <p className="text-zinc-600">a.n. {draft.accountHolder}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-zinc-500">TOTAL PEMBAYARAN</span>
                  <p className="text-2xl font-black font-mono tabular-nums text-zinc-900">{rupiah(draft.total)}</p>
                </div>
              </div>

              {draft.notes && (
                <div className="border-t border-zinc-100 pt-3 text-xs text-zinc-600 whitespace-pre-wrap">
                  <span className="font-mono text-zinc-500">Catatan: </span>{draft.notes}
                </div>
              )}
            </article>

            {message && (
              <p role="status" className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl no-print">
                {message}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 no-print pt-2">
              <button className="pill-black flex gap-2 items-center text-xs" onClick={save}>
                <Save size={14} />
                <span>Simpan Invoice</span>
              </button>
              <button className="pill-white flex gap-2 items-center text-xs" onClick={() => { if (save()) window.print(); }}>
                <Printer size={14} />
                <span>Cetak / Simpan PDF</span>
              </button>
              <button className="pill-white flex gap-2 items-center text-xs" onClick={copy}>
                <Copy size={14} />
                <span>Salin Ringkasan</span>
              </button>
              <button className="pill-white flex gap-2 items-center text-xs text-emerald-700 hover:text-emerald-800" onClick={handleOpenWhatsApp}>
                <MessageSquare size={14} />
                <span>Kirim via WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
