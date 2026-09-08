import React, { useState } from 'react';
import { FinancialReport, ProjectCard } from '../types';
import { incomeForMonth } from '../utils/selectors';
import { legacyArchives } from '../utils/legacyArchives';

interface MoneyCashflowViewProps {
  projects: ProjectCard[];
  financialReport: FinancialReport;
  onOpenFollowUp?: (project: ProjectCard) => void;
  onOpenFinanceInput?: () => void;
  onToggleExpensePaid?: (expenseId: string) => void;
  onUpdateMonthlyTarget?: (target: number) => void;
}

const rupiah = (amount: number) => `Rp${amount.toLocaleString('id-ID')}`;
const transactionDate = (tx: FinancialReport['transactions'][number]) => new Date(/^\d{4}-\d{2}-\d{2}$/.test(tx.date) ? `${tx.date}T12:00:00` : tx.createdAt);
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (key: string) => new Date(`${key}-01T12:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

export const MoneyCashflowView: React.FC<MoneyCashflowViewProps> = ({ projects, financialReport: report, onOpenFollowUp, onOpenFinanceInput, onToggleExpensePaid, onUpdateMonthlyTarget }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [photo, setPhoto] = useState<string | null>(null);
  const now = new Date();
  const month = monthKey(now);
  const income = incomeForMonth(report, now);
  const monthlyTransactions = report.transactions.filter(tx => monthKey(transactionDate(tx)) === month);
  const expense = monthlyTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const target = report.monthlyIncomeTarget ?? 10000000;
  const remaining = Math.max(0, target - income);
  const remainingDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
  const periods = Array.from(new Set(report.transactions.map(transactionDate).filter(date => !Number.isNaN(date.getTime())).map(monthKey))).sort().reverse();
  const tabs = [['overview', 'Ringkasan'], ['accounts', 'Rekening'], ['expenses', 'Kewajiban bulanan'], ['projects', 'Tagihan project'], ['history', 'Riwayat transaksi'], ['archive', 'Rekap bulanan']];
  return <section className="space-y-5 max-w-5xl mx-auto">
    <div className="flex flex-wrap justify-between gap-3 items-center"><div><h2 className="text-2xl font-bold">Dompet & cashflow</h2><p className="text-sm text-zinc-600">Data terakhir: {report.asOfDate} · {report.modeStatus}</p></div><button className="pill-black" onClick={onOpenFinanceInput}>+ Catat kas / koreksi saldo</button></div>
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="bento-card bento-apricot p-5"><p className="text-sm">Saldo likuid</p><strong className="block text-2xl mt-2">{rupiah(report.totalLiquidBalance)}</strong><p className="text-xs mt-2">Batas kas: {rupiah(report.hardFloor)}</p></div>
      <div className="bento-card bento-pink p-5"><p className="text-sm">Pemasukan {monthLabel(month)}</p><strong className="block text-2xl mt-2">{rupiah(income)}</strong><p className="text-xs mt-2">Pengeluaran tercatat: {rupiah(expense)}</p></div>
      <div className="bento-card bento-blue p-5"><p className="text-sm">Runway estimasi</p><strong className="block text-2xl mt-2">{report.estimatedRealBurn > 0 ? `${report.runwayDays} hari` : 'Belum dihitung'}</strong><p className="text-xs mt-2">Beban estimasi: {rupiah(report.estimatedRealBurn)}/bulan</p></div>
    </div>
    <nav aria-label="Bagian keuangan" className="flex flex-wrap gap-2">{tabs.map(([id, label]) => <button key={id} className={activeTab === id ? 'pill-black' : 'pill-white'} aria-pressed={activeTab === id} onClick={() => setActiveTab(id)}>{label}</button>)}</nav>

    {activeTab === 'overview' && <div className="space-y-5">
      <div className="bento-card p-6 space-y-4">
        <h3 className="font-bold text-lg">Target pemasukan bulanan</h3>
        <div className="flex flex-wrap gap-2">{[5000000, 10000000, 15000000, 20000000].map(amount => <button key={amount} className={target === amount ? 'pill-black' : 'pill-white'} aria-pressed={target === amount} onClick={() => onUpdateMonthlyTarget?.(amount)}>{rupiah(amount)}</button>)}</div>
        <p>{rupiah(income)} dari target {rupiah(target)}. Sisa {rupiah(remaining)}.</p>
        <progress className="w-full" aria-label="Pencapaian target bulanan" value={Math.min(income, target)} max={target || 1} />
        <p className="text-sm text-zinc-600">Untuk mencapai target, rata-rata pemasukan yang dibutuhkan {rupiah(Math.ceil(remaining / remainingDays))} per hari selama {remainingDays} hari tersisa.</p>
      </div>
      <div className="bento-card p-6 space-y-3">
        <h3 className="font-bold text-lg">Simulasi 3 bulan</h3>
        <p className="text-sm text-zinc-600">Asumsi setiap bulan mencapai target {rupiah(target)} dengan pengeluaran {rupiah(report.estimatedRealBurn)}. Ini proyeksi, bukan uang yang sudah diterima.</p>
        <div className="grid sm:grid-cols-3 gap-3">{[1, 2, 3].map(offset => <div key={offset} className="border rounded-xl p-4"><p className="text-sm">{new Date(now.getFullYear(), now.getMonth() + offset, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p><strong>{rupiah(report.totalLiquidBalance + offset * (target - report.estimatedRealBurn))}</strong></div>)}</div>
      </div>
      <div className="bento-card p-6 space-y-3"><h3 className="font-bold">Riwayat snapshot saldo</h3>{report.trajectory.length ? report.trajectory.slice(-12).map((point, index) => <div key={`${point.date}-${index}`} className="flex flex-wrap justify-between gap-2 text-sm border-b py-2"><span>{point.date} · {point.note}</span><strong>{rupiah(point.balance)}</strong></div>) : <p className="text-sm">Belum ada snapshot saldo.</p>}</div>
    </div>}

    {activeTab === 'accounts' && <div className="grid sm:grid-cols-2 gap-4">{report.accounts.map(account => <article key={account.name} className="bento-card p-5 space-y-2"><h3 className="font-bold">{account.name}</h3><p className="text-xl font-bold">{rupiah(account.balance)}</p><p className="text-xs text-zinc-600">Diperbarui {account.lastUpdated || 'belum tercatat'}</p></article>)}{!report.accounts.length && <p>Belum ada rekening dalam workspace ini.</p>}</div>}

    {activeTab === 'expenses' && <div className="bento-card p-6 space-y-4">
      <h3 className="font-bold">Checklist {monthLabel(month)}</h3>
      <p className="text-sm text-zinc-600">Checklist hanya menandai kewajiban. Catat pengeluaran melalui Catat Kas agar saldo ikut berkurang.</p>
      {report.monthlyExpenses.map(item => <label key={item.id} className="flex items-start gap-3 border-b py-3 cursor-pointer"><input className="mt-1" type="checkbox" checked={Boolean(item.isPaid && item.paidMonth === month)} onChange={() => onToggleExpensePaid?.(item.id)} /><span className="flex-1"><strong>{item.category}</strong><span className="block text-xs text-zinc-600">{item.notes}</span></span><span className="text-sm">{typeof item.estimatedAmount === 'number' ? rupiah(item.estimatedAmount) : item.amountText}</span></label>)}
      {!report.monthlyExpenses.length && <p>Belum ada kewajiban bulanan.</p>}
    </div>}

    {activeTab === 'projects' && <div className="bento-card p-6 space-y-3"><h3 className="font-bold">Tagihan dan penerimaan project</h3><p className="text-sm text-zinc-600">Nominal project belum diterima tidak menambah saldo kas.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Project</th><th className="p-2">Nilai</th><th className="p-2">Diterima</th><th className="p-2">Sisa</th><th className="p-2">Tindak lanjut</th></tr></thead><tbody>{projects.filter(project => project.nominalNumeric > 0).map(project => <tr key={project.id} className="border-t"><td className="p-2">{project.name}<small className="block">{project.paymentStatus}</small></td><td className="p-2 whitespace-nowrap">{rupiah(project.nominalNumeric)}</td><td className="p-2 whitespace-nowrap">{rupiah(project.paidNumeric)}</td><td className="p-2 whitespace-nowrap">{rupiah(project.unpaidNumeric)}</td><td className="p-2">{project.unpaidNumeric > 0 && <button className="pill-white" onClick={() => onOpenFollowUp?.(project)}>Follow-up</button>}</td></tr>)}</tbody></table></div></div>}

    {activeTab === 'history' && <div className="bento-card p-6 space-y-3"><h3 className="font-bold">Riwayat transaksi</h3>{report.transactions.map(tx => <article key={tx.id} className="flex flex-wrap justify-between gap-3 border-b py-3"><div><strong className="text-sm">{tx.description}</strong><p className="text-xs text-zinc-600">{tx.date} · {tx.type} · {tx.accountName}{tx.toAccountName ? ` → ${tx.toAccountName}` : ''} · {tx.category}</p></div><div className="text-right"><strong>{rupiah(tx.amount)}</strong>{tx.photoUrl && /^(data:image\/(png|jpeg|webp|gif);base64,|https?:\/\/)/.test(tx.photoUrl) && <button className="block text-sm underline" onClick={() => setPhoto(tx.photoUrl!)}>Lihat bukti</button>}</div></article>)}{!report.transactions.length && <p className="text-sm">Belum ada transaksi. Tambahkan lewat Catat Kas.</p>}</div>}

    {activeTab === 'archive' && <div className="space-y-5">
      <div className="bento-card p-6 space-y-3"><h3 className="font-bold">Rekap dari transaksi yang tercatat</h3><p className="text-sm text-zinc-600">Transfer dan koreksi saldo tidak dihitung sebagai pemasukan atau pengeluaran.</p>{periods.map(period => {
        const entries = report.transactions.filter(tx => monthKey(transactionDate(tx)) === period);
        const incoming = entries.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const outgoing = entries.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
        return <div key={period} className="border-b py-3 text-sm"><h4 className="font-bold">{monthLabel(period)}</h4><p>Masuk {rupiah(incoming)} · Keluar {rupiah(outgoing)} · Selisih {rupiah(incoming - outgoing)}</p></div>;
      })}{!periods.length && <p>Belum ada transaksi bertanggal untuk direkap.</p>}</div>
      <details className="bento-card p-6 space-y-3"><summary className="cursor-pointer font-bold">Snapshot arsip bawaan repo</summary><p className="text-sm text-zinc-600">Catatan lama dipertahankan apa adanya. Angka ini belum direkonsiliasi dengan ledger dan tidak masuk perhitungan saldo atau pemasukan saat ini.</p>{legacyArchives.map(archive => <details key={archive.id} className="border-t py-3"><summary className="cursor-pointer">{archive.monthName}</summary><p className="text-sm my-2">{archive.summaryNote}</p><ul className="text-sm space-y-1">{archive.breakdown.map(item => <li key={item.label}>{item.label} · {rupiah(item.amount)}</li>)}</ul></details>)}</details>
    </div>}
    {photo && <div role="dialog" aria-modal="true" aria-label="Bukti transaksi" className="fixed inset-0 z-50 bg-black/80 p-6 flex flex-col items-center justify-center gap-3"><button className="pill-white" onClick={() => setPhoto(null)}>Tutup bukti</button><img src={photo} alt="Bukti transaksi" className="max-h-[80vh] max-w-full object-contain" /></div>}
  </section>;
};
