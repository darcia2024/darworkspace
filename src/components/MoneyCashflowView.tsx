import React, { useState } from 'react';
import { 
  Plus, 
  Receipt, 
  Image as ImageIcon, 
  Flame, 
  Clock, 
  MessageSquare, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldAlert, 
  Wallet,
  Sparkles,
  TrendingDown,
  Building2,
  Target,
  Zap,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Calendar
} from 'lucide-react';
import { ProjectCard, FinancialReport } from '../types';
import { soundManager } from '../utils/audio';

interface MoneyCashflowViewProps {
  projects: ProjectCard[];
  financialReport?: FinancialReport;
  onOpenFollowUp?: (project: ProjectCard) => void;
  onOpenFinanceInput?: () => void;
}

export const MoneyCashflowView: React.FC<MoneyCashflowViewProps> = ({
  projects,
  financialReport,
  onOpenFollowUp,
  onOpenFinanceInput
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'expenses' | 'projects' | 'history' | 'archive'>('overview');
  const [selectedMonthArchive, setSelectedMonthArchive] = useState<'current' | '2026-08' | '2026-07'>('current');
  const [zoomedPhoto, setZoomedPhoto] = useState<{ url: string; title: string } | null>(null);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(financialReport?.monthlyIncomeTarget || 10000000);

  const formatRupiah = (num: number) => {
    if (num === 0) return 'Rp0';
    return `Rp${num.toLocaleString('id-ID')}`;
  };

  const report = financialReport || {
    asOfDate: '29 Agustus 2026',
    totalLiquidBalance: 3945918,
    modeStatus: 'RED MODE — CASH DEFENSE' as const,
    hardFloor: 4000000,
    financialDebt: 0,
    projectLiabilityNote: 'Ada project yang sudah dibayar tetapi belum selesai (Zalvice & Laptopbisnis)',
    dropFrom26Aug: 809707,
    dropFrom12Aug: 3864855,
    dropPercentageFrom12Aug: 49.5,
    fixedMonthlyBurn: 2665000,
    estimatedRealBurn: 4500000,
    runwayDays: 26,
    runwayMonths: 0.88,
    monthlyIncomeTarget: 10000000,
    accounts: [
      { name: 'Mandiri', balance: 3867000, isLatest: true, lastUpdated: '29 Agu 2026 (Live)', type: 'bank' as const },
      { name: 'Bank Jago', balance: 28991, isLatest: false, lastUpdated: '26 Agu 2026*', type: 'bank' as const },
      { name: 'blu by BCA', balance: 17434, isLatest: false, lastUpdated: '26 Agu 2026*', type: 'bank' as const },
      { name: 'LINE Bank', balance: 15512, isLatest: false, lastUpdated: '26 Agu 2026*', type: 'bank' as const },
      { name: 'DANA', balance: 13596, isLatest: false, lastUpdated: '26 Agu 2026*', type: 'ewallet' as const },
      { name: 'GoPay', balance: 3385, isLatest: false, lastUpdated: '26 Agu 2026*', type: 'ewallet' as const },
      { name: 'Cash', balance: 0, isLatest: false, lastUpdated: '26 Agu 2026*', type: 'cash' as const },
    ],
    trajectory: [
      { date: '12 Agu', balance: 7810773, note: 'Peak Balance' },
      { date: '20 Agu', balance: 5885040, note: '-Rp1.92M' },
      { date: '26 Agu', balance: 4755625, note: '-Rp1.13M' },
      { date: '29 Agu', balance: 3945918, note: 'Current (< Rp4M Floor)' },
    ],
    monthlyExpenses: [
      { id: 'exp-1', category: 'Uang istri', estimatedAmount: 1000000, amountText: 'Rp1.000.000', status: 'Wajib', isFixed: true, notes: 'Nafkah bulanan' },
      { id: 'exp-2', category: 'Kewajiban rumah Mesir', estimatedAmount: 500000, amountText: 'Rp500.000', status: 'Wajib', isFixed: true, notes: 'Kewajiban Mesir' },
      { id: 'exp-3', category: 'Internet / kuota', estimatedAmount: 200000, amountText: 'Rp200.000', status: 'Wajib', isFixed: true, notes: 'Koneksi dev' },
      { id: 'exp-4', category: 'ChatGPT Plus', estimatedAmount: 360000, amountText: 'Rp360.000', status: 'Produktif / langganan aktif', isFixed: true, notes: 'AI Dev workflow' },
      { id: 'exp-5', category: 'Claude Pro', estimatedAmount: 360000, amountText: '±Rp360.000', status: 'Produktif / langganan aktif', isFixed: true, notes: 'AI Reasoning' },
      { id: 'exp-6', category: 'Wavebox', estimatedAmount: 245000, amountText: '±Rp245.000', status: 'Produktif / langganan aktif', isFixed: true, notes: 'Multi-account browser' },
      { id: 'exp-7', category: 'Makan / jajan rumah tangga', estimatedAmount: 'fleksibel', amountText: 'fleksibel (~Rp1.000.000)', status: 'Wajib, fleksibel', isFixed: false, notes: 'Kebutuhan pangan' },
      { id: 'exp-8', category: 'Kebutuhan anak', estimatedAmount: 'fleksibel', amountText: 'fleksibel', status: 'Wajib, fleksibel', isFixed: false, notes: 'Susu, popok & bayi' },
      { id: 'exp-9', category: 'Token / listrik', estimatedAmount: 'fleksibel', amountText: 'fleksibel', status: 'Wajib, fleksibel', isFixed: false, notes: 'Listrik kerja & rumah' },
      { id: 'exp-10', category: 'Transport / harian', estimatedAmount: 'fleksibel', amountText: 'fleksibel', status: 'Wajib, fleksibel', isFixed: false, notes: 'Bensin & mobilitas' },
      { id: 'exp-11', category: 'Imunisasi / kesehatan', estimatedAmount: 'tidak selalu bulanan', amountText: 'saat ada', status: 'Wajib, fleksibel', isFixed: false, notes: 'Vaksin & darurat' },
    ],
    transactions: [],
    recoveryRoadmap: {
      stage1: 'Rp3.945.918 (Hold Cash Defense, jangan jatuh lebih jauh)',
      stage2: 'Rp5.000.000 (Delivery Zalvice + Kickoff Barber DP Rp3jt)',
      stage3: 'Rp7.500.000 (Masuk DP Umi Elly Rp3jt + Closing KAEL Pilot)',
      stage4: 'Rp10.000.000 (Safe Growth Zone)',
    },
    defenseProtocolRule: 'Belum masuk rekening = belum jadi uang. Pengeluaran hanya untuk yang wajib/produktif. Fokus: Delivery kewajiban + Closing DP project.'
  };

  // Real Live Date & Time Engine
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('id-ID', { month: 'long' });
  const currentYear = now.getFullYear();
  const currentFullDateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const dayOfMonth = now.getDate();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - dayOfMonth + 1);

  // Dynamic 3-Month Projection Sequence
  const month1Date = new Date(now.getFullYear(), now.getMonth(), 1);
  const month2Date = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const month3Date = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  
  const month1Name = month1Date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const month2Name = month2Date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const month3Name = month3Date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Calculations for Monthly Target based strictly on income transactions in current month
  const currentMonthShort = now.toLocaleDateString('id-ID', { month: 'short' }).toLowerCase();
  const currentMonthLong = now.toLocaleDateString('id-ID', { month: 'long' }).toLowerCase();
  const currentYearNum = now.getFullYear();

  const incomeThisMonth = (report.transactions || []).filter(tx => {
    if (tx.type !== 'income') return false;
    if (tx.createdAt) {
      const d = new Date(tx.createdAt);
      if (!isNaN(d.getTime())) {
        return d.getMonth() === now.getMonth() && d.getFullYear() === currentYearNum;
      }
    }
    const dateStr = (tx.date || '').toLowerCase();
    const isThisMonth = dateStr.includes(currentMonthShort) || dateStr.includes(currentMonthLong) || dateStr.includes(`-09-`) || dateStr.includes(`/09/`);
    const isThisYear = dateStr.includes(currentYearNum.toString());
    return isThisMonth && isThisYear;
  });

  const totalPaidThisMonth = incomeThisMonth.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const targetProgressPercent = Math.min(100, Math.round((totalPaidThisMonth / monthlyTarget) * 100));
  const remainingTarget = Math.max(0, monthlyTarget - totalPaidThisMonth);
  const weeklyTarget = Math.round(monthlyTarget / 4);
  const dailyRequiredPacing = Math.round(remainingTarget / daysRemaining);

  // Net Surplus Projection: Income (Rp10M) - Real Burn (Rp4.5M) = +Rp5.5M / bulan
  const netMonthlySurplus = monthlyTarget - (report.estimatedRealBurn || 4500000);
  const projectedBalanceMonth1 = report.totalLiquidBalance + netMonthlySurplus;
  const projectedBalanceMonth2 = projectedBalanceMonth1 + netMonthlySurplus;
  const projectedBalanceMonth3 = projectedBalanceMonth2 + netMonthlySurplus;

  const runwayMonth1 = (projectedBalanceMonth1 / (report.estimatedRealBurn || 4500000)).toFixed(1);
  const runwayMonth2 = (projectedBalanceMonth2 / (report.estimatedRealBurn || 4500000)).toFixed(1);
  const runwayMonth3 = (projectedBalanceMonth3 / (report.estimatedRealBurn || 4500000)).toFixed(1);

  const isRed = report.totalLiquidBalance < (report.hardFloor || 4000000);
  const isGreen = report.totalLiquidBalance >= (report.monthlyIncomeTarget || 10000000);
  const modeColor = isRed ? 'rose' : isGreen ? 'emerald' : 'amber';
  const calculatedRunwayDays = report.runwayDays || Math.round((report.totalLiquidBalance / (report.estimatedRealBurn || 4500000)) * 30);
  const calculatedRunwayMonths = (calculatedRunwayDays / 30).toFixed(1);

  // Monthly Historical Archives & Pencapaian Bulan-Bulan Sebelumnya
  const monthlyArchives = [
    {
      id: '2026-08',
      monthName: 'Agustus 2026',
      periodTag: 'ARCHIVED // AGUSTUS_2026',
      target: 10000000,
      realizedIncome: 4806000,
      realizedExpense: 1700000,
      netSurplus: 3106000,
      endingBalance: 4130865,
      progressPercent: 48.1,
      modeStatus: 'YELLOW MODE (Surplus Cadangan +Rp130k di atas Floor)',
      runwayMonths: '±0.92 Bulan',
      milestones: [
        'Zalvice & Laptopbisnis Logo System 100% Selesai & Lunas (Nol utang deliverable)',
        'Closing Deal Rp6.000.000 Barber Underrated & DP 50% Masuk (Rp3.000.000)',
        'Inflow Operasional Mandiri +Rp906.000 Masuk (31 Agu)',
        'Nafkah Istri (Rp1.200.000) & Kewajiban Mesir (Rp500.000) Dibayar di Muka per 31 Agu',
        'Investasi 2 Akun Claude Pro & AI Multi-agent Setup untuk Dev Boost'
      ],
      breakdown: [
        { label: 'DP Kasir Barber POS', client: 'Owner Barber Underrated', category: 'DP 50%', amount: 3000000, tag: 'INFLOW_DP', status: 'RECEIVED ✓' },
        { label: 'Inflow Kas Masuk Mandiri', client: 'Direct Operasional', category: 'Inflow', amount: 906000, tag: 'INFLOW_MANDIRI', status: 'RECEIVED ✓' },
        { label: 'Zalvice Logo Package', client: 'Bang Edo / Zalvice', category: 'Design', amount: 600000, tag: 'DELIVERED', status: 'LUNAS ✓' },
        { label: 'Laptopbisnis Logo Package', client: 'Owner Laptopbisnis', category: 'Design', amount: 600000, tag: 'DELIVERED', status: 'LUNAS ✓' },
      ],
      expensesBreakdown: [
        { label: 'Nafkah Istri September', amount: 1200000, note: 'Transfer 31 Agu 2026 (Lunas)' },
        { label: 'Kewajiban Rumah Mesir', amount: 500000, note: 'Transfer 31 Agu 2026 (Lunas)' },
      ],
      summaryNote: 'Bulan Agustus berhasil keluar dari zona bahaya (<Rp4M) menjadi Rp4.130.865 berkat closing DP Barber POS Rp3M & tuntasnya 2 logo liabilities.'
    },
    {
      id: '2026-07',
      monthName: 'Juli 2026',
      periodTag: 'ARCHIVED // JULI_2026',
      target: 10000000,
      realizedIncome: 7800000,
      realizedExpense: 4500000,
      netSurplus: 3300000,
      endingBalance: 7810773,
      progressPercent: 78.0,
      modeStatus: 'PEAK BALANCE (Pertumbuhan Kas Maksimal Rp7,81M)',
      runwayMonths: '±1.73 Bulan',
      milestones: [
        'Pelunasan Penuh Platform DreamMecca dari Klien & Live Production',
        'Retainer Maintenance Markaz Fiqih Berjalan Tertib',
        'Pencapaian Puncak Saldo Kas Likuid Terbesar (Rp7.810.773)',
        'Inisiasi Riset Desain Sistem KAEL & Temantiket Operations'
      ],
      breakdown: [
        { label: 'DreamMecca Platform Pelunasan', client: 'DreamMecca Core', category: 'Full Payment', amount: 6000000, tag: 'PLATFORM_PAID', status: 'LUNAS ✓' },
        { label: 'Markaz Fiqih Maintenance Retainer', client: 'Markaz Fiqih', category: 'Retainer', amount: 1800000, tag: 'MAINTENANCE', status: 'PAID ✓' },
      ],
      expensesBreakdown: [
        { label: 'Kebutuhan Rumah Tangga & Nafkah', amount: 3500000, note: 'Operasional bulanan' },
        { label: 'Server & AI Subscriptions', amount: 1000000, note: 'ChatGPT, Wavebox, Hosting' },
      ],
      summaryNote: 'Bulan Juli mencatatkan performa saldo kas terbaik sebesar Rp7.810.773 sebelum terjadi penarikan modal & kebutuhan keluarga di awal Agustus.'
    }
  ];

  const activeArchive = monthlyArchives.find(a => a.id === selectedMonthArchive);

  return (
    <div className="space-y-5 font-sans animate-fade-in pb-12 max-w-5xl mx-auto select-none">
      
      {/* 1. EXECUTIVE SUMMARY HERO CARD (Figma Doppelrand Double-Bezel) */}
      <div className={`figma-shell border-l-4 ${isRed ? 'border-l-rose-500' : isGreen ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
        <div className="figma-core p-5 sm:p-6 space-y-4">
          
          {/* Top Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRed ? 'bg-rose-500' : isGreen ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              <span className={`text-xs font-mono font-bold uppercase ${isRed ? 'text-rose-400' : isGreen ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isRed 
                  ? '🔴 RED MODE — CASH DEFENSE' 
                  : isGreen 
                    ? '🟢 GREEN MODE — GROWTH & EXPANSION' 
                    : '🟡 YELLOW MODE — RECOVERY STAGE 2 (SAFE BUFFER)'}
              </span>
              <span className="text-xs text-zinc-400 font-mono">// as of {currentFullDateStr} (Live)</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenFinanceInput && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onOpenFinanceInput();
                  }}
                  className="px-3.5 py-1.5 dev-btn-primary text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Catat Kas / Foto Bukti</span>
                </button>
              )}
            </div>
          </div>

          {/* 3 Executive Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Metric 1: Total Saldo Likuid */}
            <div className="p-4 rounded-2xl bg-[#060609] border border-white/[0.05] space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                01 // SALDO LIKUID TOTAL
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono block">
                {formatRupiah(report.totalLiquidBalance)}
              </span>
              <span className={`text-[11px] font-mono block ${isRed ? 'text-rose-400' : isGreen ? 'text-emerald-400' : 'text-amber-300'}`}>
                {isRed 
                  ? `< Rp4,00M Hard Floor (Mandiri Live)` 
                  : isGreen 
                    ? `Target +10M Tercapai! (Zona Bebas)` 
                    : `+${formatRupiah(report.totalLiquidBalance - (report.hardFloor || 4000000))} di atas Floor (Aman)`}
              </span>
            </div>

            {/* Metric 2: Monthly Burn */}
            <div className="p-4 rounded-2xl bg-[#060609] border border-white/[0.05] space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                02 // REAL BURN RATE
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono block">
                ~{formatRupiah(report.estimatedRealBurn || 4500000)}
              </span>
              <span className="text-[11px] font-mono text-zinc-400 block">
                Rp2,66M Wajib Tetap + ~Rp1,8M Fleksibel
              </span>
            </div>

            {/* Metric 3: Dynamic Runway */}
            <div className="p-4 rounded-2xl bg-[#060609] border border-white/[0.05] space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                03 // DEFENSE RUNWAY
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono block">
                ±{calculatedRunwayDays} Hari
              </span>
              <span className="text-[11px] font-mono text-zinc-400 block">
                ~{calculatedRunwayMonths} Bulan operasional aman
              </span>
            </div>

          </div>

          {/* Golden Rule Callout */}
          <div className="p-3 rounded-xl bg-[#060609] border border-white/[0.06] text-xs font-mono text-zinc-300">
            <span className={`${isRed ? 'text-rose-400' : isGreen ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>// STRATEGI BULAN {currentMonthName.toUpperCase()} {currentYear}:</span> "Belum masuk rekening = belum jadi uang. Target mutlak: <strong>Minimal +Rp10 Juta Masuk di Bulan {currentMonthName}</strong>."
          </div>

        </div>
      </div>

      {/* =========================================================================
          2. MONTHLY REVENUE TARGET & HISTORICAL ARCHIVE ENGINE
          ========================================================================= */}
      <div className="figma-shell border-emerald-500/40 ring-1 ring-emerald-500/20">
        <div className="figma-core p-5 sm:p-6 bg-gradient-to-br from-[#101915] via-[#090d0b] to-[#060609] space-y-5">
          
          {/* Top Month Switcher Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                Pilih Periode Bulan:
              </span>
              <div className="flex items-center gap-1.5 bg-black/70 p-1 rounded-2xl border border-white/10 text-xs font-mono">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedMonthArchive('current');
                  }}
                  className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                    selectedMonthArchive === 'current'
                      ? 'bg-emerald-500 text-black font-bold shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                  <span>{currentMonthName} {currentYear} (Live)</span>
                </button>

                {monthlyArchives.map(arch => (
                  <button
                    key={arch.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedMonthArchive(arch.id as any);
                    }}
                    className={`px-3 py-1 rounded-xl transition-all ${
                      selectedMonthArchive === arch.id
                        ? 'bg-amber-500 text-black font-bold shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🏛️ {arch.monthName}</span>
                  </button>
                ))}

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveTab('archive');
                  }}
                  className="px-2.5 py-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-[11px]"
                >
                  <span>📜 Semua Rekap →</span>
                </button>
              </div>
            </div>

            {selectedMonthArchive === 'current' && (
              <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-2xl border border-white/10 font-mono text-xs">
                {[
                  { val: 10000000, label: 'Rp10 Jt (Wajib)' },
                  { val: 15000000, label: 'Rp15 Jt (Growth)' },
                  { val: 20000000, label: 'Rp20 Jt (Scale)' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      soundManager.playClick();
                      setMonthlyTarget(opt.val);
                    }}
                    className={`px-2.5 py-1 rounded-xl transition-all text-xs ${
                      monthlyTarget === opt.val
                        ? 'bg-emerald-500 text-black font-bold shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIEW A: LIVE ACTIVE MONTH (SEPTEMBER 2026) */}
          {selectedMonthArchive === 'current' && (
            <div className="space-y-5">
              {/* Header Target */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                      Target Pemasukan {currentMonthName} {currentYear}: <span className="text-emerald-400 font-mono">+{formatRupiah(monthlyTarget)} / Bulan</span>
                    </h3>
                    <span className="dev-tag-emerald text-[9px]">TARGET_{currentMonthName.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Pokoknya bulan <strong>{currentMonthName} {currentYear}</strong> minimal harus nambah <strong>{formatRupiah(monthlyTarget)}</strong> agar kas langsung surplus dan keluar dari zona bahaya!
                  </p>
                </div>
              </div>

              {/* Progress Bar & Pacing Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                
                {/* Progress Gauge */}
                <div className="lg:col-span-2 p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Progress Pemasukan Bulan {currentMonthName}:
                    </span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {formatRupiah(totalPaidThisMonth)} / {formatRupiah(monthlyTarget)} ({targetProgressPercent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3.5 rounded-full bg-[#12121a] border border-white/10 overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-700 shadow-glow-white"
                      style={{ width: `${targetProgressPercent}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap justify-between items-center text-[11px] font-mono text-zinc-400 pt-1 gap-2">
                    <span>
                      Sisa target {currentMonthName}: <strong className="text-amber-300 font-bold">{formatRupiah(remainingTarget)}</strong>
                    </span>
                    <span className="text-zinc-400">
                      Hari ke-{dayOfMonth}/{totalDaysInMonth} ({daysRemaining} hari tersisa)
                    </span>
                    <span className="text-emerald-300">
                      Pacing Harian: <strong>{formatRupiah(dailyRequiredPacing)}/hari</strong>
                    </span>
                  </div>
                </div>

                {/* Net Surplus Card */}
                <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/30 space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                    PROYEKSI SURPLUS BERSIH / BULAN
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-300 font-mono block">
                    +{formatRupiah(netMonthlySurplus)}
                  </span>
                  <p className="text-[11px] text-zinc-400 font-mono leading-tight">
                    Pemasukan {formatRupiah(monthlyTarget)} - Real Burn Rp4,5M = <strong>+{formatRupiah(netMonthlySurplus)}</strong> masuk cadangan kas tiap bulan!
                  </p>
                </div>

              </div>

              {/* Breakdown: Dari Mana Saja Target 10 Juta Ini Didapat? */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-300 uppercase tracking-wider block font-bold">
                    🗺️ Peta Realisasi Target Bulan {currentMonthName} ({formatRupiah(monthlyTarget)} / Bulan):
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Total Pipeline: <strong className="text-emerald-300">Rp10.200.000</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Source 1: Barber POS */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40 space-y-1.5 ring-1 ring-emerald-500/20">
                    <div className="flex justify-between items-center">
                      <span className="dev-tag-emerald text-[9px]">100% LUNAS FULL ✓</span>
                      <span className="text-xs font-mono font-bold text-emerald-300">Rp3.000.000</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">Barber Underrated (Lunas)</h5>
                    <p className="text-[11px] text-zinc-400 leading-snug">Pelunasan Rp3.000.000 masuk kas Mandiri! Total deal Rp6.000.000 lunas penuh ✓</p>
                  </div>

                  {/* Source 2: Umi Elly LMS */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40 space-y-1.5 ring-1 ring-emerald-500/20">
                    <div className="flex justify-between items-center">
                      <span className="dev-tag-emerald text-[9px]">DP MASUK // KICKOFF</span>
                      <span className="text-xs font-mono font-bold text-emerald-300">Rp3.000.000</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">DP Umi Elly LMS (Kickoff)</h5>
                    <p className="text-[11px] text-zinc-400 leading-snug">Termin 1 DP Rp3.000.000 masuk kas! Gaspol sprint pengerjaan modul LMS Azhariyah.</p>
                  </div>

                  {/* Source 3: Zalvice, Laptopbisnis & DreamMecca */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="dev-tag-emerald text-[9px]">DELIVERY // LUNAS ✓</span>
                      <span className="text-xs font-mono font-bold text-white">Rp1.200.000</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">DreamMecca + 2 Logo</h5>
                    <p className="text-[11px] text-zinc-400 leading-snug">Logo Zalvice & Laptopbisnis 100% kelar! DreamMecca lunas dari lama.</p>
                  </div>

                  {/* Source 4: KAEL Core & Sisa Termin Umi Elly */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="dev-tag text-[9px]">NEXT SPRINT // SCALE</span>
                      <span className="text-xs font-mono font-bold text-amber-300">Rp4.000.000+</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">Termin 2 & 3 + KAEL SaaS</h5>
                    <p className="text-[11px] text-zinc-400 leading-snug">Sisa termin LMS Umi Elly (Rp4M) + pilot KAEL SaaS untuk amankan target scale Rp15M+.</p>
                  </div>

                </div>
              </div>

              {/* Kas Growth Projection (Efek Nambah 10 Juta Sebulan) */}
              <div className="p-4 rounded-2xl bg-[#060609] border border-white/10 space-y-2">
                <span className="text-xs font-mono text-zinc-300 font-bold block">
                  📈 Efek Pertumbuhan Saldo Kas Mengikuti Tanggal Real (+{formatRupiah(monthlyTarget)}/bln):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="text-zinc-400 block text-[10px] font-bold uppercase">BULAN 1: {month1Name} (+{formatRupiah(netMonthlySurplus)})</span>
                    <span className="text-base font-bold text-white block mt-0.5">{formatRupiah(projectedBalanceMonth1)}</span>
                    <span className="text-[11px] text-amber-300">Runway: ±{runwayMonth1} Bulan (Keluar dari Red Mode)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-emerald-400 block text-[10px] font-bold uppercase">BULAN 2: {month2Name} (+{formatRupiah(netMonthlySurplus)})</span>
                    <span className="text-base font-bold text-emerald-300 block mt-0.5">{formatRupiah(projectedBalanceMonth2)}</span>
                    <span className="text-[11px] text-emerald-400">Runway: ±{runwayMonth2} Bulan (🟢 Green Safe Growth)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40">
                    <span className="text-emerald-300 block text-[10px] font-bold uppercase">BULAN 3: {month3Name} (+{formatRupiah(netMonthlySurplus)})</span>
                    <span className="text-base font-bold text-emerald-200 block mt-0.5">{formatRupiah(projectedBalanceMonth3)}</span>
                    <span className="text-[11px] text-emerald-300">Runway: ±{runwayMonth3} Bulan (Indie SaaS Powerhouse)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: HISTORICAL ARCHIVED MONTH (AGUSTUS 2026 / JULI 2026) */}
          {selectedMonthArchive !== 'current' && activeArchive && (
            <div className="space-y-5 animate-fade-in">
              {/* Header Archive */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                      Rekap Pencapaian: <span className="text-amber-400 font-mono">{activeArchive.monthName}</span>
                    </h3>
                    <span className="dev-tag text-[9px] bg-amber-500/15 text-amber-300 border border-amber-500/20">{activeArchive.periodTag}</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {activeArchive.summaryNote}
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedMonthArchive('current');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-md"
                >
                  <span>← Kembali ke {currentMonthName} {currentYear} (Live)</span>
                </button>
              </div>

              {/* Realization Metrics & Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                <div className="lg:col-span-2 p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-300 font-semibold">
                      Realisasi Pemasukan {activeArchive.monthName}:
                    </span>
                    <span className="text-amber-400 font-bold text-sm">
                      {formatRupiah(activeArchive.realizedIncome)} / {formatRupiah(activeArchive.target)} ({activeArchive.progressPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-3.5 rounded-full bg-[#12121a] border border-white/10 overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-700 shadow-glow-white"
                      style={{ width: `${activeArchive.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap justify-between items-center text-[11px] font-mono text-zinc-400 pt-1 gap-2">
                    <span>Pemasukan: <strong className="text-emerald-300 font-bold">+{formatRupiah(activeArchive.realizedIncome)}</strong></span>
                    <span>Pengeluaran: <strong className="text-rose-400 font-bold">-{formatRupiah(activeArchive.realizedExpense)}</strong></span>
                    <span>Saldo Akhir: <strong className="text-white font-bold">{formatRupiah(activeArchive.endingBalance)}</strong></span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 space-y-1.5">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
                    SURPLUS BERSIH YANG TERCATAT
                  </span>
                  <span className="text-2xl font-extrabold text-amber-300 font-mono block">
                    +{formatRupiah(activeArchive.netSurplus)}
                  </span>
                  <p className="text-[11px] text-zinc-400 font-mono leading-tight">
                    Surplus cadangan kas masuk: <strong>+{formatRupiah(activeArchive.netSurplus)}</strong> ({activeArchive.runwayMonths} runway operasional aman).
                  </p>
                </div>
              </div>

              {/* Pencapaian & Key Milestones List */}
              <div className="p-4 rounded-2xl bg-[#060609] border border-white/10 space-y-2.5">
                <span className="text-xs font-mono text-amber-300 uppercase tracking-wider block font-bold">
                  🏆 Milestone & Pencapaian Utama di Bulan {activeArchive.monthName}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                  {activeArchive.milestones.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className="leading-snug">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breakdown Pemasukan & Deliverables */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider block font-bold">
                  💼 Rincian Pemasukan & Deliverable {activeArchive.monthName}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {activeArchive.breakdown.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="dev-tag text-[9px]">{item.tag}</span>
                        <span className="text-xs font-mono font-bold text-amber-300">{formatRupiah(item.amount)}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white">{item.label}</h5>
                      <p className="text-[11px] text-zinc-400 leading-snug">{item.client} • <span className="text-emerald-400 font-semibold">{item.status}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. SIMPLE NAVIGATION SUB-TABS (Pill Tabs) */}
      <div className="flex items-center gap-1.5 bg-[#09090d] p-1.5 rounded-2xl border border-white/[0.06] overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: '📊 Ringkasan & Roadmap' },
          { id: 'archive', label: '🏛️ Arsip & Rekap Bulanan' },
          { id: 'accounts', label: '🏦 7 Saldo Rekening' },
          { id: 'expenses', label: '💸 Beban Bulanan (11 Item)' },
          { id: 'projects', label: '💼 Piutang & DP Project' },
          { id: 'history', label: `📜 Riwayat Transaksi (${report.transactions?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundManager.playClick();
              setActiveTab(tab.id as any);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENT VIEWS */}

      {/* VIEW 1: OVERVIEW & ROADMAP */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          
          <div className="figma-shell">
            <div className="figma-core p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Simulasi Perpanjangan Runway & Target Kas</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#060609] border border-white/[0.05] space-y-1">
                  <span className={`text-[11px] font-mono font-bold block ${isRed ? 'text-rose-400' : isGreen ? 'text-emerald-400' : 'text-amber-300'}`}>
                    1. POSISI SAAT INI (LIVE)
                  </span>
                  <p className="text-lg font-bold text-white font-mono">{formatRupiah(report.totalLiquidBalance)}</p>
                  <p className="text-xs text-zinc-400">
                    Runway: <strong className={isRed ? 'text-rose-400' : isGreen ? 'text-emerald-400' : 'text-amber-300'}>±{calculatedRunwayDays} Hari (~{calculatedRunwayMonths} Bln)</strong>
                  </p>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                    {isRed ? '🔴 Mode Cash Defense (< Rp4M)' : isGreen ? '🟢 Green Mode (Growth & Expansion)' : '🟡 Yellow Mode (Stage 2 Safe Buffer)'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#060609] border border-emerald-500/20 space-y-1">
                  <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                    2. + TERMIN 1 UMI ELLY (DP Rp3M)
                  </span>
                  <p className="text-lg font-bold text-white font-mono">{formatRupiah(report.totalLiquidBalance + 3000000)}</p>
                  <p className="text-xs text-zinc-400">
                    Runway: <strong className="text-emerald-400">±{Math.round(((report.totalLiquidBalance + 3000000) / (report.estimatedRealBurn || 4500000)) * 30)} Hari (~{(((report.totalLiquidBalance + 3000000) / (report.estimatedRealBurn || 4500000))).toFixed(1)} Bln)</strong>
                  </p>
                  <span className="text-[10px] text-emerald-400/80 font-mono block mt-1">
                    🟢 Safe Growth Zone (Mendekati Target 10M)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#060609] border border-teal-500/30 space-y-1">
                  <span className="text-[11px] font-mono text-teal-300 font-bold block">
                    3. + PELUNASAN BARBER / TERMIN 2 (Rp3M)
                  </span>
                  <p className="text-lg font-bold text-white font-mono">{formatRupiah(report.totalLiquidBalance + 6000000)}</p>
                  <p className="text-xs text-zinc-400">
                    Runway: <strong className="text-teal-300">±{Math.round(((report.totalLiquidBalance + 6000000) / (report.estimatedRealBurn || 4500000)) * 30)} Hari (~{(((report.totalLiquidBalance + 6000000) / (report.estimatedRealBurn || 4500000))).toFixed(1)} Bln)</strong>
                  </p>
                  <span className="text-[10px] text-teal-300 font-mono block mt-1">
                    💎 High Capital & Safe Scaling
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="figma-shell">
            <div className="figma-core p-5 sm:p-6 space-y-3">
              <h3 className="text-sm font-bold text-white">Pergerakan Aset Likuid Terakhir</h3>
              <div className="space-y-2">
                {report.trajectory.map((point, idx) => (
                  <div key={point.date} className="flex items-center justify-between text-xs font-mono p-3 rounded-xl bg-[#060609] border border-white/[0.04]">
                    <span className="text-zinc-300 font-semibold">{point.date}</span>
                    <div className="flex gap-2 items-center">
                      <span className={`font-bold ${idx === report.trajectory.length - 1 ? 'text-white' : 'text-zinc-400'}`}>{formatRupiah(point.balance)}</span>
                      <span className="text-[11px] text-zinc-500">({point.note})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 7 ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="figma-shell">
          <div className="figma-core p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Rincian Saldo Rekening & E-Wallet</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">// Total: {formatRupiah(report.totalLiquidBalance)}</p>
              </div>
              <button 
                onClick={() => onOpenFinanceInput && onOpenFinanceInput()} 
                className="dev-tag hover:text-white"
              >
                ✏️ Update Saldo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.accounts.map(acc => (
                <div key={acc.name} className={`p-4 rounded-2xl border flex justify-between items-center ${acc.isLatest ? 'bg-white/[0.04] border-white/20' : 'bg-[#060609] border-white/[0.05]'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{acc.name}</span>
                      {acc.isLatest && <span className="dev-tag-emerald text-[9px] py-0">LIVE</span>}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{acc.lastUpdated}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white">{formatRupiah(acc.balance)}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 font-mono pt-1">*Mandiri adalah update angka live terbaru. Saldo lain memakai data 26 Agustus.</p>
          </div>
        </div>
      )}

      {/* VIEW 3: MONTHLY EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="figma-shell">
            <div className="figma-core p-5 sm:p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">A. Pengeluaran Fixed Bulanan</h3>
                  <p className="text-xs text-zinc-400 font-mono">// Wajib / Rutin: Rp2.665.000/bln</p>
                </div>
                <span className="dev-tag">6_ITEMS_FIXED</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(report.monthlyExpenses?.filter(e => e.isFixed) || []).map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-[#060609] border border-white/[0.05] flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">{item.category}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.notes}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-white">{item.amountText}</span>
                      <span className="text-[9px] font-mono block text-emerald-400">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="figma-shell">
            <div className="figma-core p-5 sm:p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">B. Kebutuhan Wajib Fleksibel</h3>
                  <p className="text-xs text-zinc-400 font-mono">// Estimasi Tambahan: ~Rp1,5M – Rp2,5M/bln</p>
                </div>
                <span className="dev-tag">5_CATEGORIES</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(report.monthlyExpenses?.filter(e => !e.isFixed) || []).map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-[#060609]/70 border border-white/[0.04] flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{item.category}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.notes}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-zinc-400">{item.amountText}</span>
                      <span className="text-[9px] font-mono block text-amber-400">Wajib, fleksibel</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: PROJECTS CASHFLOW */}
      {activeTab === 'projects' && (
        <div className="figma-shell">
          <div className="figma-core p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Project Cashflow & Potential Receivables</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  // Sudah Masuk: {formatRupiah(projects.reduce((acc, p) => acc + (p.paidNumeric || 0), 0))} • Pipeline OTW: {formatRupiah(projects.reduce((acc, p) => acc + (p.unpaidNumeric || 0), 0))}
                </p>
              </div>
              <span className="dev-tag">RECEIVABLES</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase text-[11px]">
                    <th className="pb-3 pr-3 font-semibold text-white font-sans">Project</th>
                    <th className="pb-3 px-3 font-semibold">Status</th>
                    <th className="pb-3 px-3 font-semibold">Total Nominal</th>
                    <th className="pb-3 px-3 font-semibold text-white">Sudah Masuk</th>
                    <th className="pb-3 px-3 font-semibold text-amber-300">Pipeline OTW</th>
                    <th className="pb-3 px-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {projects.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pr-3 font-sans font-bold text-white">{p.name}</td>
                      <td className="py-3.5 px-3 text-[11px] text-zinc-400">{p.status}</td>
                      <td className="py-3.5 px-3 text-zinc-300">{p.valueText}</td>
                      <td className="py-3.5 px-3 text-white font-bold">{formatRupiah(p.paidNumeric || 0)}</td>
                      <td className="py-3.5 px-3 text-amber-300 font-bold">{formatRupiah(p.unpaidNumeric || 0)}</td>
                      <td className="py-3.5 px-3">
                        {onOpenFollowUp && (
                          <button onClick={() => onOpenFollowUp(p)} className="text-zinc-300 hover:text-white font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">Copas WA 💬</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: HISTORY TRANSACTIONS */}
      {activeTab === 'history' && (
        <div className="figma-shell">
          <div className="figma-core p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Riwayat Transaksi & Bukti Transfer</h3>
                <p className="text-xs text-zinc-400 font-mono">// Log transaksi & foto bukti yang pernah dicatat</p>
              </div>
              {onOpenFinanceInput && (
                <button onClick={() => onOpenFinanceInput()} className="px-3 py-1.5 dev-btn-primary text-xs font-bold rounded-xl">+ Input Baru</button>
              )}
            </div>

            {report.transactions && report.transactions.length > 0 ? (
              <div className="space-y-2">
                {report.transactions.map(tx => (
                  <div key={tx.id} className="p-3.5 rounded-2xl bg-[#060609] border border-white/[0.05] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{tx.description}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">{tx.date} • {tx.accountName} • {tx.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                      </span>
                      {tx.photoUrl && (
                        <button 
                          onClick={() => setZoomedPhoto({ url: tx.photoUrl!, title: tx.description })} 
                          className="text-[11px] text-zinc-300 bg-[#14141c] hover:bg-[#1c1c28] px-2.5 py-1 rounded-xl border border-white/10 font-mono"
                        >
                          📷 Bukti Foto
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 font-mono text-center py-6">Belum ada transaksi tambahan yang dicatat.</p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 6: MONTHLY HISTORICAL ARCHIVES & PERFORMANCE MATRIX */}
      {activeTab === 'archive' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header Summary */}
          <div className="figma-shell">
            <div className="figma-core p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🏛️ Rekap & Arsip Pencapaian Bulanan</span>
                    <span className="dev-tag-emerald text-[9px]">HISTORICAL_TRACKER</span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">// Perbandingan performa target, pemasukan real, pengeluaran & milestone per bulan</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">Total Periode Terekam: <strong>3 Bulan (Jul, Agu, Sep 2026)</strong></span>
                </div>
              </div>

              {/* Comparative Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 uppercase text-[11px]">
                      <th className="pb-3 pr-3 font-semibold text-white font-sans">Bulan / Periode</th>
                      <th className="pb-3 px-3 font-semibold">Status</th>
                      <th className="pb-3 px-3 font-semibold text-emerald-400">Pemasukan Real</th>
                      <th className="pb-3 px-3 font-semibold text-rose-400">Beban Keluar</th>
                      <th className="pb-3 px-3 font-semibold text-amber-300">Net Surplus</th>
                      <th className="pb-3 px-3 font-semibold text-white">Saldo Kas Akhir</th>
                      <th className="pb-3 px-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {/* Live Month: September 2026 */}
                    <tr className="hover:bg-white/5 transition-colors bg-emerald-500/[0.04]">
                      <td className="py-3.5 pr-3 font-sans font-bold text-emerald-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{currentMonthName} {currentYear} (Live)</span>
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-emerald-400 font-semibold">ONGOING // TARGET 10M</td>
                      <td className="py-3.5 px-3 text-emerald-300 font-bold">{formatRupiah(totalPaidThisMonth)}</td>
                      <td className="py-3.5 px-3 text-rose-300 font-bold">~Rp4.500.000 (Burn)</td>
                      <td className="py-3.5 px-3 text-emerald-300 font-bold">+{formatRupiah(netMonthlySurplus)} (Proyeksi)</td>
                      <td className="py-3.5 px-3 text-white font-bold">{formatRupiah(report.totalLiquidBalance)}</td>
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            setSelectedMonthArchive('current');
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="text-emerald-300 hover:text-white font-mono bg-emerald-500/15 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all"
                        >
                          Lihat Live ⚡
                        </button>
                      </td>
                    </tr>

                    {/* Historical Months */}
                    {monthlyArchives.map(arch => (
                      <tr key={arch.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 pr-3 font-sans font-bold text-white flex items-center gap-1.5">
                          <span>🏛️ {arch.monthName}</span>
                        </td>
                        <td className="py-3.5 px-3 text-[11px] text-amber-400">{arch.periodTag}</td>
                        <td className="py-3.5 px-3 text-emerald-300 font-bold">{formatRupiah(arch.realizedIncome)}</td>
                        <td className="py-3.5 px-3 text-rose-400 font-bold">-{formatRupiah(arch.realizedExpense)}</td>
                        <td className="py-3.5 px-3 text-amber-300 font-bold">+{formatRupiah(arch.netSurplus)}</td>
                        <td className="py-3.5 px-3 text-white font-bold">{formatRupiah(arch.endingBalance)}</td>
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              setSelectedMonthArchive(arch.id as any);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="text-zinc-300 hover:text-white font-mono bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-all"
                          >
                            Detail Rekap 🔍
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cards for each Historical Month */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthlyArchives.map(arch => (
              <div key={arch.id} className="figma-shell">
                <div className="figma-core p-5 space-y-3.5">
                  <div className="flex justify-between items-center border-b border-white/[0.06] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <h4 className="text-sm font-bold text-white">{arch.monthName}</h4>
                      <span className="dev-tag text-[9px] bg-amber-500/10 text-amber-300 border-amber-500/20">{arch.periodTag}</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{arch.progressPercent}% Target</span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{arch.summaryNote}</p>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#060609] border border-white/5 text-center text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Pemasukan</span>
                      <span className="text-emerald-400 font-bold">{formatRupiah(arch.realizedIncome)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Pengeluaran</span>
                      <span className="text-rose-400 font-bold">{formatRupiah(arch.realizedExpense)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Surplus</span>
                      <span className="text-amber-300 font-bold">+{formatRupiah(arch.netSurplus)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold block">🏆 Pencapaian Utama:</span>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {arch.milestones.slice(0, 3).map((m, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold text-[10px]">✓</span>
                          <span className="leading-tight text-[11px]">{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedMonthArchive(arch.id as any);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-bold text-white transition-all flex items-center justify-center gap-2"
                  >
                    <span>Buka Peta Realisasi {arch.monthName}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Zoom Modal */}
      {zoomedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setZoomedPhoto(null)}
        >
          <div 
            className="max-w-2xl w-full bg-[#0d0d12] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h4 className="text-sm font-bold text-white">{zoomedPhoto.title}</h4>
              <button onClick={() => setZoomedPhoto(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="flex justify-center bg-black/60 rounded-xl p-2 max-h-[75vh] overflow-auto">
              <img src={zoomedPhoto.url} alt={zoomedPhoto.title} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
