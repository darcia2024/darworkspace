import React from 'react';
import { QuickStats, TodayPursuit, FinancialReport, ProjectCard } from '../types';
import { incomeForMonth } from '../utils/selectors';

interface TopQuickStatsProps {
  todayPursuit: TodayPursuit[];
  onTogglePursuit: (id: string) => void;
  quickStats: QuickStats;
  onSelectTab: (tab: string) => void;
  financialReport: FinancialReport;
  projects: ProjectCard[];
}

export const TopQuickStats: React.FC<TopQuickStatsProps> = ({ todayPursuit, onTogglePursuit, quickStats, onSelectTab, financialReport: report, projects }) => {
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
  return <section className="space-y-5">
    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Fokus satu-satu, kerjaan beres.</h1>
    <p className="text-sm text-zinc-700">Pilih tugas berikutnya, lihat yang menunggu, lalu catat uang yang benar-benar masuk.</p>
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(card => <button key={card.title} onClick={() => onSelectTab(card.tab)} className={`bento-card ${card.color} p-5 text-left space-y-3`}>
        <span className="text-sm font-semibold">{card.title}</span><strong className="block text-2xl break-words">{card.value}</strong><span className="block text-xs text-zinc-700">{card.detail}</span>
      </button>)}
    </div>
    <div className="bento-card p-5 space-y-3">
      <h2 className="font-bold">Target hari ini</h2>
      {todayPursuit.length === 0 && <p className="text-sm text-zinc-600">Belum ada target harian. Mulai fokus dari project di board.</p>}
      {todayPursuit.map(pursuit => <label key={pursuit.id} className="flex items-start gap-3 text-sm cursor-pointer">
        <input className="mt-1" type="checkbox" checked={Boolean(pursuit.isDone)} onChange={() => onTogglePursuit(pursuit.id)} />
        <span className={pursuit.isDone ? 'line-through text-zinc-500' : ''}><strong>{pursuit.project}</strong> · {pursuit.action}</span>
      </label>)}
    </div>
  </section>;
};
