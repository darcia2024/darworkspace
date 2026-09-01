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
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'expenses' | 'projects' | 'history'>('overview');
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

  // Calculations for Monthly Target
  const totalPaidThisMonth = projects.reduce((sum, p) => sum + (p.paidNumeric || 0), 0);
  const targetProgressPercent = Math.min(100, Math.round((totalPaidThisMonth / monthlyTarget) * 100));
  const remainingTarget = Math.max(0, monthlyTarget - totalPaidThisMonth);
  const weeklyTarget = Math.round(monthlyTarget / 4);
  const dailyTarget = Math.round(monthlyTarget / 30);

  // Net Surplus Projection: Income (Rp10M) - Real Burn (Rp4.5M) = +Rp5.5M / bulan
  const netMonthlySurplus = monthlyTarget - (report.estimatedRealBurn || 4500000);
  const projectedBalanceMonth1 = report.totalLiquidBalance + netMonthlySurplus;
  const projectedBalanceMonth2 = projectedBalanceMonth1 + netMonthlySurplus;
  const projectedBalanceMonth3 = projectedBalanceMonth2 + netMonthlySurplus;

  const isRed = report.totalLiquidBalance < (report.hardFloor || 4000000);
  const isGreen = report.totalLiquidBalance >= (report.monthlyIncomeTarget || 10000000);
  const modeColor = isRed ? 'rose' : isGreen ? 'emerald' : 'amber';
  const calculatedRunwayDays = report.runwayDays || Math.round((report.totalLiquidBalance / (report.estimatedRealBurn || 4500000)) * 30);
  const calculatedRunwayMonths = (calculatedRunwayDays / 30).toFixed(1);

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
              <span className="text-xs text-zinc-500 font-mono">// as of {report.asOfDate}</span>
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
                02 // BEBAN KELUAR BULANAN
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono block">
                Rp2,67M <span className="text-xs text-zinc-400 font-normal">fixed</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono block">
                Real burn: ~Rp4M – Rp5M / bulan
              </span>
            </div>

            {/* Metric 3: Runway */}
            <div className="p-4 rounded-2xl bg-[#060609] border border-white/[0.05] space-y-1">
              <span className={`text-[10px] font-mono uppercase tracking-widest block ${isRed ? 'text-rose-300' : 'text-emerald-300'}`}>
                03 // SISA RUNWAY KAS
              </span>
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono block ${isRed ? 'text-rose-400' : 'text-emerald-400'}`}>
                ±{calculatedRunwayDays} Hari
              </span>
              <span className="text-[11px] text-zinc-400 font-mono block">
                ~{calculatedRunwayMonths} Bulan operasional aman
              </span>
            </div>

          </div>

          {/* Golden Rule Callout */}
          <div className="p-3 rounded-xl bg-[#060609] border border-white/[0.06] text-xs font-mono text-zinc-300">
            <span className={`${isRed ? 'text-rose-400' : isGreen ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>// STRATEGI:</span> "Belum masuk rekening = belum jadi uang. Target mutlak: <strong>Minimal +Rp10 Juta Masuk Tiap Bulan</strong>."
          </div>

        </div>
      </div>

      {/* =========================================================================
          2. MONTHLY REVENUE TARGET ENGINE (+Rp10.000.000 / BULAN)
          ========================================================================= */}
      <div className="figma-shell border-emerald-500/40 ring-1 ring-emerald-500/20">
        <div className="figma-core p-5 sm:p-6 bg-gradient-to-br from-[#101915] via-[#090d0b] to-[#060609] space-y-5">
          
          {/* Header Target */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  Target Pemasukan Bulanan: <span className="text-emerald-400 font-mono">+{formatRupiah(monthlyTarget)} / Bulan</span>
                </h3>
                <span className="dev-tag-emerald text-[9px]">TARGET_MANDATE</span>
              </div>
              <p className="text-xs text-zinc-300">
                Pokoknya sebulan minimal harus nambah <strong>{formatRupiah(monthlyTarget)}</strong> agar kas langsung surplus dan keluar dari zona bahaya!
              </p>
            </div>

            {/* Target Preset Selector */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
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
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    monthlyTarget === opt.val
                      ? 'bg-emerald-500 text-black font-bold shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar & Pacing Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            
            {/* Progress Gauge */}
            <div className="lg:col-span-2 p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Progress Pemasukan Bulan Ini:
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

              <div className="flex flex-wrap justify-between items-center text-[11px] font-mono text-zinc-400 pt-1">
                <span>
                  Sisa target yang harus dikejar: <strong className="text-amber-300 font-bold">{formatRupiah(remainingTarget)}</strong>
                </span>
                <span className="text-emerald-300">
                  Target Mingguan: <strong>{formatRupiah(weeklyTarget)}/minggu</strong>
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
            <span className="text-xs font-mono text-emerald-300 uppercase tracking-wider block font-bold">
              🗺️ Peta Realisasi Target {formatRupiah(monthlyTarget)} / Bulan:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Source 1: Barber POS */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/20 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="dev-tag text-[9px]">P1_CLIENT_DP</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">Rp3.000.000</span>
                </div>
                <h5 className="text-xs font-bold text-white">DP Kasir Barber POS</h5>
                <p className="text-[11px] text-zinc-400 leading-snug">DP 50% dari total deal Rp6jt. Siapkan invoice & scope.</p>
              </div>

              {/* Source 2: Umi Elly LMS */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/20 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="dev-tag text-[9px]">P1_CLIENT_DP</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">Rp3.000.000</span>
                </div>
                <h5 className="text-xs font-bold text-white">Termin 1 Umi Elly LMS</h5>
                <p className="text-[11px] text-zinc-400 leading-snug">Termin pertama dari total deal Rp7jt. Follow up transfer.</p>
              </div>

              {/* Source 3: Zalvice & Laptopbisnis */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="dev-tag-emerald text-[9px]">DELIVERY_PAID</span>
                  <span className="text-xs font-mono font-bold text-white">Rp1.200.000</span>
                </div>
                <h5 className="text-xs font-bold text-white">Zalvice + Laptopbisnis</h5>
                <p className="text-[11px] text-zinc-400 leading-snug">Paket logo sudah lunas. Selesaikan deliverable.</p>
              </div>

              {/* Source 4: KAEL Core & Global Leads */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="dev-tag text-[9px]">P2_SAAS_BIZDEV</span>
                  <span className="text-xs font-mono font-bold text-amber-300">Rp3.000.000+</span>
                </div>
                <h5 className="text-xs font-bold text-white">KAEL SaaS & Upwork</h5>
                <p className="text-[11px] text-zinc-400 leading-snug">3-5 pilot outlet KAEL + apply proposal USD high-ticket.</p>
              </div>

            </div>
          </div>

          {/* Kas Growth Projection (Efek Nambah 10 Juta Sebulan) */}
          <div className="p-4 rounded-2xl bg-[#060609] border border-white/10 space-y-2">
            <span className="text-xs font-mono text-zinc-300 font-bold block">
              📈 Efek Pertumbuhan Saldo Kas Jika Target +{formatRupiah(monthlyTarget)}/bln Tercapai:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-zinc-400 block text-[10px]">BULAN KE-1 (+{formatRupiah(netMonthlySurplus)})</span>
                <span className="text-base font-bold text-white block mt-0.5">{formatRupiah(projectedBalanceMonth1)}</span>
                <span className="text-[11px] text-amber-300">Runway: ±2.1 Bulan (Keluar dari Red Mode)</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-emerald-400 block text-[10px] font-bold">BULAN KE-2 (+{formatRupiah(netMonthlySurplus)})</span>
                <span className="text-base font-bold text-emerald-300 block mt-0.5">{formatRupiah(projectedBalanceMonth2)}</span>
                <span className="text-[11px] text-emerald-400">Runway: ±3.3 Bulan (🟢 Green Safe Growth)</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40">
                <span className="text-emerald-300 block text-[10px] font-bold">BULAN KE-3 (+{formatRupiah(netMonthlySurplus)})</span>
                <span className="text-base font-bold text-emerald-200 block mt-0.5">{formatRupiah(projectedBalanceMonth3)}</span>
                <span className="text-[11px] text-emerald-300">Runway: ±4.5 Bulan (Indie SaaS Powerhouse)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. SIMPLE NAVIGATION SUB-TABS (Pill Tabs) */}
      <div className="flex items-center gap-1.5 bg-[#09090d] p-1.5 rounded-2xl border border-white/[0.06] overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: '📊 Ringkasan & Roadmap' },
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
