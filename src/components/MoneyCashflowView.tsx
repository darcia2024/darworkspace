import React, { useState } from 'react';
import { FinancialReport, ProjectCard, TransactionRecord } from '../types';
import { incomeForMonth } from '../utils/selectors';
import { legacyArchives } from '../utils/legacyArchives';
import { Pencil, Trash2, X, Check } from 'lucide-react';

interface MoneyCashflowViewProps {
  projects: ProjectCard[];
  financialReport: FinancialReport;
  onOpenFollowUp?: (project: ProjectCard) => void;
  onOpenFinanceInput?: () => void;
  onToggleExpensePaid?: (expenseId: string) => void;
  onUpdateMonthlyTarget?: (target: number) => void;
  onDeleteTransaction?: (txId: string) => void;
  onEditTransaction?: (tx: TransactionRecord) => void;
}

const rupiah = (amount: number) => `Rp${amount.toLocaleString('id-ID')}`;
const transactionDate = (tx: FinancialReport['transactions'][number]) => new Date(/^\d{4}-\d{2}-\d{2}$/.test(tx.date) ? `${tx.date}T12:00:00` : tx.createdAt);
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (key: string) => new Date(`${key}-01T12:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

export const MoneyCashflowView: React.FC<MoneyCashflowViewProps> = ({
  projects,
  financialReport: report,
  onOpenFollowUp,
  onOpenFinanceInput,
  onToggleExpensePaid,
  onUpdateMonthlyTarget,
  onDeleteTransaction,
  onEditTransaction
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [photo, setPhoto] = useState<string | null>(null);

  // Edit Transaction State
  const [editingTx, setEditingTx] = useState<TransactionRecord | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');

  const startEdit = (tx: TransactionRecord) => {
    setEditingTx(tx);
    setEditDesc(tx.description);
    setEditCategory(tx.category);
    setEditAmount(String(tx.amount));
    setEditDate(tx.date);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const cleanAmount = parseInt(editAmount.replace(/[^0-9]/g, ''), 10) || 0;
    if (cleanAmount <= 0 && editingTx.type !== 'balance_update') {
      alert('Nominal harus lebih dari 0.');
      return;
    }
    const updated: TransactionRecord = {
      ...editingTx,
      description: editDesc.trim() || editingTx.description,
      category: editCategory.trim() || editingTx.category,
      amount: cleanAmount,
      date: editDate || editingTx.date,
    };
    onEditTransaction?.(updated);
    setEditingTx(null);
  };

  const handleDelete = (tx: TransactionRecord) => {
    if (window.confirm(`Hapus transaksi "${tx.description}" sebesar ${rupiah(tx.amount)}? Saldo rekening akan disesuaikan otomatis.`)) {
      onDeleteTransaction?.(tx.id);
    }
  };

  const now = new Date();
  const month = monthKey(now);
  const income = incomeForMonth(report, now);
  const monthlyTransactions = report.transactions.filter(tx => monthKey(transactionDate(tx)) === month);
  const expense = monthlyTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const target = report.monthlyIncomeTarget ?? 10000000;
  const remaining = Math.max(0, target - income);
  const remainingDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
  const periods = Array.from(new Set(report.transactions.map(transactionDate).filter(date => !Number.isNaN(date.getTime())).map(monthKey))).sort().reverse();
  const tabs = [
    ['overview', 'Ringkasan'],
    ['accounts', 'Rekening'],
    ['expenses', 'Kewajiban bulanan'],
    ['projects', 'Tagihan project'],
    ['history', 'Riwayat transaksi'],
    ['archive', 'Rekap bulanan']
  ];

  return (
    <section className="space-y-5 max-w-5xl mx-auto font-sans">
      <div className="flex flex-wrap justify-between gap-3 items-center">
        <div>
          <h2 className="text-2xl font-bold">Dompet & cashflow</h2>
          <p className="text-sm text-zinc-600">Data terakhir: {report.asOfDate} · {report.modeStatus}</p>
        </div>
        <button className="pill-black" onClick={onOpenFinanceInput}>+ Catat kas / koreksi saldo</button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bento-card bento-apricot p-5">
          <p className="text-sm font-semibold">Saldo likuid</p>
          <strong className="block text-2xl mt-2 font-mono tabular-nums">{rupiah(report.totalLiquidBalance)}</strong>
          <p className="text-xs text-zinc-600 mt-2 font-mono">Batas kas: {rupiah(report.hardFloor)}</p>
        </div>
        <div className="bento-card bento-pink p-5">
          <p className="text-sm font-semibold">Pemasukan {monthLabel(month)}</p>
          <strong className="block text-2xl mt-2 font-mono tabular-nums">{rupiah(income)}</strong>
          <p className="text-xs text-zinc-600 mt-2 font-mono">Pengeluaran tercatat: {rupiah(expense)}</p>
        </div>
        <div className="bento-card bento-blue p-5">
          <p className="text-sm font-semibold">Runway estimasi</p>
          <strong className="block text-2xl mt-2 font-mono tabular-nums">{report.estimatedRealBurn > 0 ? `${report.runwayDays} hari` : 'Belum dihitung'}</strong>
          <p className="text-xs text-zinc-600 mt-2 font-mono">Beban estimasi: {rupiah(report.estimatedRealBurn)}/bulan</p>
        </div>
      </div>

      <nav aria-label="Bagian keuangan" className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={activeTab === id ? 'pill-black' : 'pill-white'}
            aria-pressed={activeTab === id}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="bento-card p-6 space-y-4">
            <h3 className="font-bold text-lg">Target pemasukan bulanan</h3>
            <div className="flex flex-wrap gap-2">
              {[5000000, 10000000, 15000000, 20000000].map(amount => (
                <button
                  key={amount}
                  className={`font-mono tabular-nums ${target === amount ? 'pill-black' : 'pill-white'}`}
                  aria-pressed={target === amount}
                  onClick={() => onUpdateMonthlyTarget?.(amount)}
                >
                  {rupiah(amount)}
                </button>
              ))}
            </div>
            <p className="text-sm">
              <span className="font-mono font-semibold tabular-nums">{rupiah(income)}</span> dari target <span className="font-mono font-semibold tabular-nums">{rupiah(target)}</span>. Sisa <span className="font-mono font-semibold tabular-nums">{rupiah(remaining)}</span>.
            </p>
            <progress className="w-full" aria-label="Pencapaian target bulanan" value={Math.min(income, target)} max={target || 1} />
            <p className="text-sm text-zinc-600">
              Untuk mencapai target, rata-rata pemasukan yang dibutuhkan <span className="font-mono tabular-nums font-semibold">{rupiah(Math.ceil(remaining / remainingDays))}</span> per hari selama {remainingDays} hari tersisa.
            </p>
          </div>

          <div className="bento-card p-6 space-y-3">
            <h3 className="font-bold text-lg">Simulasi 3 bulan</h3>
            <p className="text-sm text-zinc-600">
              Asumsi setiap bulan mencapai target {rupiah(target)} dengan pengeluaran {rupiah(report.estimatedRealBurn)}. Ini proyeksi, bukan uang yang sudah diterima.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[1, 2, 3].map(offset => (
                <div key={offset} className="border border-zinc-200 rounded-xl p-4">
                  <p className="text-sm font-semibold">{new Date(now.getFullYear(), now.getMonth() + offset, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                  <strong className="block text-lg mt-1 font-mono tabular-nums">{rupiah(report.totalLiquidBalance + offset * (target - report.estimatedRealBurn))}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-card p-6 space-y-3">
            <h3 className="font-bold">Riwayat snapshot saldo</h3>
            {report.trajectory.length ? (
              report.trajectory.slice(-12).map((point, index) => (
                <div key={`${point.date}-${index}`} className="flex flex-wrap justify-between gap-2 text-sm border-b border-zinc-100 py-2">
                  <span>{point.date} · {point.note}</span>
                  <strong className="font-mono tabular-nums">{rupiah(point.balance)}</strong>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600">Belum ada snapshot saldo.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {report.accounts.map(account => (
            <article key={account.name} className="bento-card p-5 space-y-2">
              <h3 className="font-bold">{account.name}</h3>
              <p className="text-2xl font-bold font-mono tabular-nums">{rupiah(account.balance)}</p>
              <p className="text-xs text-zinc-600 font-mono">Diperbarui {account.lastUpdated || 'belum tercatat'}</p>
            </article>
          ))}
          {!report.accounts.length && <p className="text-sm text-zinc-600">Belum ada rekening dalam workspace ini.</p>}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bento-card p-6 space-y-4">
          <h3 className="font-bold">Checklist {monthLabel(month)}</h3>
          <p className="text-sm text-zinc-600">Checklist hanya menandai kewajiban. Catat pengeluaran melalui Catat Kas agar saldo ikut berkurang.</p>
          {report.monthlyExpenses.map(item => (
            <label key={item.id} className="flex items-start gap-3 border-b border-zinc-100 py-3 cursor-pointer">
              <input
                className="mt-1 rounded accent-black"
                type="checkbox"
                checked={Boolean(item.isPaid && item.paidMonth === month)}
                onChange={() => onToggleExpensePaid?.(item.id)}
              />
              <span className="flex-1">
                <strong>{item.category}</strong>
                <span className="block text-xs text-zinc-600">{item.notes}</span>
              </span>
              <span className="text-sm font-mono tabular-nums font-semibold">
                {typeof item.estimatedAmount === 'number' ? rupiah(item.estimatedAmount) : item.amountText}
              </span>
            </label>
          ))}
          {!report.monthlyExpenses.length && <p className="text-sm text-zinc-600">Belum ada kewajiban bulanan.</p>}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bento-card p-6 space-y-3">
          <h3 className="font-bold">Tagihan dan penerimaan project</h3>
          <p className="text-sm text-zinc-600">Nominal project belum diterima tidak menambah saldo kas.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="p-2">Project</th>
                  <th className="p-2">Nilai</th>
                  <th className="p-2">Diterima</th>
                  <th className="p-2">Sisa</th>
                  <th className="p-2">Tindak lanjut</th>
                </tr>
              </thead>
              <tbody>
                {projects.filter(project => project.nominalNumeric > 0).map(project => (
                  <tr key={project.id} className="border-t border-zinc-100">
                    <td className="p-2">
                      <strong className="block text-zinc-900">{project.name}</strong>
                      <small className="block text-zinc-500">{project.paymentStatus}</small>
                    </td>
                    <td className="p-2 whitespace-nowrap font-mono tabular-nums">{rupiah(project.nominalNumeric)}</td>
                    <td className="p-2 whitespace-nowrap font-mono tabular-nums">{rupiah(project.paidNumeric)}</td>
                    <td className="p-2 whitespace-nowrap font-mono tabular-nums font-semibold text-rose-700">{rupiah(project.unpaidNumeric)}</td>
                    <td className="p-2">
                      {project.unpaidNumeric > 0 && (
                        <button className="pill-white text-xs px-3 py-1" onClick={() => onOpenFollowUp?.(project)}>Follow-up</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bento-card p-6 space-y-4">
          <h3 className="font-bold text-lg">Riwayat transaksi</h3>
          {report.transactions.map(tx => (
            <article key={tx.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 py-3">
              <div className="space-y-0.5">
                <strong className="text-sm font-semibold text-zinc-900">{tx.description}</strong>
                <p className="text-xs text-zinc-600 font-mono">
                  {tx.date} · <span className="uppercase font-bold">{tx.type}</span> · {tx.accountName}{tx.toAccountName ? ` → ${tx.toAccountName}` : ''} · <span className="bg-zinc-100 px-1.5 py-0.5 rounded">{tx.category}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <strong className={`tabular-nums font-mono text-sm block ${tx.type === 'income' ? 'text-emerald-700' : tx.type === 'expense' ? 'text-rose-700' : 'text-zinc-900'}`}>
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{rupiah(tx.amount)}
                  </strong>
                  {tx.photoUrl && /^(data:image\/(png|jpeg|webp|gif);base64,|https?:\/\/|\/api\/receipts\/)/.test(tx.photoUrl) && (
                    <button className="block text-xs text-zinc-600 hover:text-black underline mt-0.5" onClick={() => setPhoto(tx.photoUrl!)}>
                      Lihat bukti
                    </button>
                  )}
                </div>
                {(onEditTransaction || onDeleteTransaction) && (
                  <div className="flex items-center gap-1">
                    {onEditTransaction && (
                      <button
                        onClick={() => startEdit(tx)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
                        aria-label="Edit transaksi"
                        title="Edit transaksi"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteTransaction && (
                      <button
                        onClick={() => handleDelete(tx)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        aria-label="Hapus transaksi"
                        title="Hapus transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
          {!report.transactions.length && <p className="text-sm text-zinc-600">Belum ada transaksi. Tambahkan lewat Catat Kas.</p>}
        </div>
      )}

      {activeTab === 'archive' && (
        <div className="space-y-5">
          <div className="bento-card p-6 space-y-3">
            <h3 className="font-bold">Rekap dari transaksi yang tercatat</h3>
            <p className="text-sm text-zinc-600">Transfer dan koreksi saldo tidak dihitung sebagai pemasukan atau pengeluaran.</p>
            {periods.map(period => {
              const entries = report.transactions.filter(tx => monthKey(transactionDate(tx)) === period);
              const incoming = entries.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
              const outgoing = entries.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
              return (
                <div key={period} className="border-b border-zinc-100 py-3 text-sm">
                  <h4 className="font-bold">{monthLabel(period)}</h4>
                  <p className="text-zinc-700 font-mono tabular-nums mt-0.5">
                    Masuk {rupiah(incoming)} · Keluar {rupiah(outgoing)} · Selisih {rupiah(incoming - outgoing)}
                  </p>
                </div>
              );
            })}
            {!periods.length && <p className="text-sm text-zinc-600">Belum ada transaksi bertanggal untuk direkap.</p>}
          </div>

          {legacyArchives.length > 0 && (
            <details className="bento-card p-6 space-y-3">
              <summary className="cursor-pointer font-bold">Snapshot arsip bawaan repo</summary>
              <p className="text-sm text-zinc-600">Catatan lama dipertahankan apa adanya. Angka ini belum direkonsiliasi dengan ledger dan tidak masuk perhitungan saldo atau pemasukan saat ini.</p>
              {legacyArchives.map(archive => (
                <details key={archive.id} className="border-t border-zinc-100 py-3">
                  <summary className="cursor-pointer font-semibold">{archive.monthName}</summary>
                  <p className="text-sm my-2 text-zinc-700">{archive.summaryNote}</p>
                  <ul className="text-sm space-y-1 font-mono tabular-nums">
                    {archive.breakdown.map(item => (
                      <li key={item.label} className="text-zinc-600">{item.label} · {rupiah(item.amount)}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </details>
          )}
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div role="dialog" aria-modal="true" aria-label="Edit Transaksi" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Edit Transaksi</h3>
              <button type="button" onClick={() => setEditingTx(null)} className="p-1 rounded-full text-zinc-400 hover:text-zinc-600" aria-label="Tutup modal edit">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Keterangan:</label>
                <input
                  type="text"
                  required
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Kategori:</label>
                <input
                  type="text"
                  required
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Nominal (Rp):</label>
                <input
                  type="text"
                  required
                  value={editAmount}
                  onChange={e => {
                    const num = e.target.value.replace(/[^0-9]/g, '');
                    setEditAmount(num);
                  }}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-zinc-900 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Tanggal (YYYY-MM-DD):</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 pill-white text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 pill-black text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Receipt Photo Viewer Modal */}
      {photo && (
        <div role="dialog" aria-modal="true" aria-label="Bukti transaksi" className="fixed inset-0 z-50 bg-black/80 p-6 flex flex-col items-center justify-center gap-3">
          <button className="pill-white" onClick={() => setPhoto(null)}>Tutup bukti</button>
          <img src={photo} alt="Bukti transaksi" className="max-h-[80vh] max-w-full object-contain rounded-xl" />
        </div>
      )}
    </section>
  );
};
