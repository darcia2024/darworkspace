import React, { useState } from 'react';
import { QuickStats, TodayPursuit, FinancialReport, ProjectCard } from '../types';
import { incomeForMonth } from '../utils/selectors';
import { Plus, Trash2 } from 'lucide-react';

interface TopQuickStatsProps {
  todayPursuit: TodayPursuit[];
  onTogglePursuit: (id: string) => void;
  onAddPursuit?: (pursuit: { project: string; action: string; timeEstimate?: string }) => void;
  onDeletePursuit?: (id: string) => void;
  quickStats: QuickStats;
  onSelectTab: (tab: string) => void;
  financialReport: FinancialReport;
  projects: ProjectCard[];
}

export const TopQuickStats: React.FC<TopQuickStatsProps> = ({
  todayPursuit,
  onTogglePursuit,
  onAddPursuit,
  onDeletePursuit,
  quickStats,
  onSelectTab,
  financialReport: report,
  projects
}) => {
  const [newProject, setNewProject] = useState('');
  const [newAction, setNewAction] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const rupiah = (amount: number) => `Rp${amount.toLocaleString('id-ID')}`;
  const income = incomeForMonth(report);
  const target = report.monthlyIncomeTarget ?? 10000000;
  const remaining = Math.max(0, target - income);
  const receivables = projects.filter(project => !['Parked', 'Free', 'Recurring/Pipeline'].includes(project.paymentStatus)).reduce((sum, project) => sum + project.unpaidNumeric, 0);
  const cards = [
    { title: 'Saldo likuid', value: rupiah(report.totalLiquidBalance), detail: `${report.accounts.length} rekening · Batas kas ${rupiah(report.hardFloor)}`, tab: 'money', color: 'bento-apricot' },
    { title: `Pemasukan ${new Date().toLocaleDateString('id-ID', { month: 'long' })}`, value: rupiah(income), detail: `Target ${rupiah(target)} · Sisa ${rupiah(remaining)}`, tab: 'money', color: 'bento-pink' },
    { title: 'Sisa tagihan project', value: rupiah(receivables), detail: `${quickStats.waitingPaymentKickoff} item menunggu · Belum termasuk saldo kas`, tab: 'waiting', color: 'bento-blue' },
    { title: 'Client berbayar aktif', value: String(quickStats.paidClientActive), detail: `${quickStats.maintenanceOpen} maintenance terbuka · ${quickStats.salesAndProductActive} sales/product aktif`, tab: 'lanes', color: 'bento-lime' },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.trim() || !newAction.trim()) return;
    onAddPursuit?.({
      project: newProject.trim(),
      action: newAction.trim(),
    });
    setNewProject('');
    setNewAction('');
    setIsAdding(false);
  };

  return (
    <section className="space-y-5">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Fokus satu-satu, kerjaan beres.</h1>
      <p className="text-sm text-zinc-700">Pilih tugas berikutnya, lihat yang menunggu, lalu catat uang yang benar-benar masuk.</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(card => (
          <button key={card.title} onClick={() => onSelectTab(card.tab)} className={`bento-card ${card.color} p-5 text-left space-y-3`}>
            <span className="text-sm font-semibold">{card.title}</span>
            <strong className="block text-2xl break-words tabular-nums font-mono">{card.value}</strong>
            <span className="block text-xs text-zinc-700">{card.detail}</span>
          </button>
        ))}
      </div>
      <div className="bento-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-zinc-900">Target Hari Ini</h2>
          {onAddPursuit && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full pill-black flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Target</span>
            </button>
          )}
        </div>

        {isAdding && onAddPursuit && (
          <form onSubmit={handleAdd} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-wrap gap-2 items-center text-xs">
            <input
              type="text"
              placeholder="Nama Project / Klien..."
              value={newProject}
              onChange={e => setNewProject(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-black"
              autoFocus
            />
            <input
              type="text"
              placeholder="Aksi nyata yang mau disikat..."
              value={newAction}
              onChange={e => setNewAction(e.target.value)}
              className="flex-2 min-w-[200px] px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-black"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 pill-black text-white font-semibold rounded-lg hover:opacity-90"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 pill-white text-zinc-600 font-medium rounded-lg"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {todayPursuit.length === 0 && (
          <p className="text-sm text-zinc-600">Belum ada target harian. Mulai fokus dari project di board atau tambah target di atas.</p>
        )}
        <div className="space-y-2">
          {todayPursuit.map(pursuit => (
            <div key={pursuit.id} className="flex items-center justify-between gap-3 text-sm py-1 border-b border-zinc-100 last:border-0">
              <label className="flex items-start gap-3 cursor-pointer flex-1">
                <input
                  className="mt-1 rounded accent-black"
                  type="checkbox"
                  checked={Boolean(pursuit.isDone)}
                  onChange={() => onTogglePursuit(pursuit.id)}
                />
                <span className={pursuit.isDone ? 'line-through text-zinc-400' : 'text-zinc-800'}>
                  <strong>{pursuit.project}</strong> · {pursuit.action}
                </span>
              </label>
              {onDeletePursuit && (
                <button
                  type="button"
                  onClick={() => onDeletePursuit(pursuit.id)}
                  className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
                  aria-label="Hapus target"
                  title="Hapus target"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
