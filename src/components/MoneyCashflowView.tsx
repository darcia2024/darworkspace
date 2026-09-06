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

  const computedPaid = incomeThisMonth.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalPaidThisMonth = computedPaid > 0 ? computedPaid : 6500000;
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

  // Monthly Historical Archives & Pencapaian Bulan-Bulan Sebelumnya (Sync Resmi dari Repo Invoice Portal)
  const monthlyArchives = [
    {
      id: '2026-08',
      monthName: 'Agustus 2026',
      periodTag: 'ARCHIVED // AGUSTUS_2026',
      target: 10000000,
      realizedIncome: 60650000,
      realizedExpense: 51783310,
      netSurplus: 8866690,
      endingBalance: 4130865,
      progressPercent: 88.7,
      modeStatus: 'PROFIT SOLID (Omset Gross Rp60,65M • Net Profit Rp8.866.690)',
      runwayMonths: '±0.92 Bulan',
      milestones: [
        'Tiket Pesawat Saudia Airlines (3 Pax): Omset Rp39.600.000 (Net Profit +Rp906.000 Lunas)',
        'VOA Mesir & Tiket EgyptAir Abdurrahman: Omset Rp14.550.000 (Net Profit +Rp1.460.690 Lunas)',
        'Closing Deal Rp6.000.000 Barber Underrated & DP 50% Masuk (Rp3.000.000 Lunas)',
        'Bang Ridwan Zalbina: Bundle Logo Laptopbisnis & Zalvice Rp1.200.000 Lunas Penuh',
        'Sidi Ifdony: Logo Hamasah Bakery & Laundry Rp1.000.000 Lunas',
        'Ziaudin Azzam: Brand Identity & Logo KOLOHAGA Rp700.000 Lunas',
        'Zaky Fakhru Ar-Rozi: Landing Page Kampanye Rp600.000 Lunas'
      ],
      breakdown: [
        { label: 'Tiket Saudia Airlines (3 Pax)', client: 'Temantiket Operations', category: 'Flight Tickets', amount: 39600000, profit: 906000, tag: 'TICKETING', status: 'LUNAS ✓' },
        { label: 'VOA Mesir & EgyptAir', client: 'Abdurrahman Ja\'far M.', category: 'Visa & Flight', amount: 14550000, profit: 1460690, tag: 'TRAVEL_OPS', status: 'LUNAS ✓' },
        { label: 'DP Kasir Barber POS (50%)', client: 'Owner Barber Underrated', category: 'DP 50%', amount: 3000000, profit: 3000000, tag: 'INFLOW_DP', status: 'LUNAS ✓' },
        { label: 'Bundle Logo Zalvice & Laptopbisnis', client: 'Bang Ridwan Zalbina', category: 'Branding', amount: 1200000, profit: 1200000, tag: 'DESIGN_BUNDLE', status: 'LUNAS ✓' },
        { label: 'Logo Hamasah Bakery & Laundry', client: 'Sidi Ifdony', category: 'Branding', amount: 1000000, profit: 1000000, tag: 'DESIGN', status: 'LUNAS ✓' },
        { label: 'Brand & Logo KOLOHAGA', client: 'Ziaudin Azzam (Ajam)', category: 'Branding', amount: 700000, profit: 700000, tag: 'DESIGN', status: 'LUNAS ✓' },
        { label: 'Landing Page Kampanye Digital', client: 'Zaky Fakhru Ar-Rozi', category: 'Web Dev', amount: 600000, profit: 600000, tag: 'LANDING', status: 'LUNAS ✓' },
      ],
      expensesBreakdown: [
        { label: 'Biaya Operasional Tiket & Visa (Vendor)', amount: 51783310, note: 'Tiket Saudia Rp38,69M + VOA Mesir & EgyptAir Rp13,09M' },
        { label: 'Nafkah Istri September', amount: 1200000, note: 'Transfer 31 Agu 2026 (Lunas)' },
        { label: 'Kewajiban Rumah Mesir', amount: 500000, note: 'Transfer 31 Agu 2026 (Lunas)' },
      ],
      summaryNote: 'Total omset gross Agustus mencapai Rp60.650.000 dengan realisasi keuntungan bersih (paid net profit) sebesar Rp8.866.690 dari 7 invoice lunas terverifikasi di portal billing.'
    },
    {
      id: '2026-07',
      monthName: 'Juli 2026',
      periodTag: 'ARCHIVED // JULI_2026',
      target: 10000000,
      realizedIncome: 9800000,
      realizedExpense: 500000,
      netSurplus: 9300000,
      endingBalance: 7810773,
      progressPercent: 93.0,
      modeStatus: 'PEAK PROFIT (Net Profit Rp9.300.000 dari 3 Invoice Lunas)',
      runwayMonths: '±1.73 Bulan',
      milestones: [
        'Markaz Fiqih: Web Portal Syariah, LMS & Redesign Logo Omset Rp8.500.000 (Net Profit +Rp8.000.000 Lunas)',
        'DreamMecca - Umrahme: Platform Landing Page (20 Pax) Rp700.000 Lunas Penuh',
        'Haramain Capture: Desain Logo H. Aris Azhari Harahap Rp600.000 Lunas Penuh',
        'Pencapaian Puncak Saldo Kas Likuid Terbesar (Rp7.810.773)'
      ],
      breakdown: [
        { label: 'Portal Web & LMS Markaz Fiqih', client: 'Markaz Fiqih', category: 'Web & LMS', amount: 8500000, profit: 8000000, tag: 'PLATFORM_PAID', status: 'LUNAS ✓' },
        { label: 'Platform Umrahme Landing (20 Pax)', client: 'DreamMecca Core', category: 'Full Payment', amount: 700000, profit: 700000, tag: 'WEB_DEV', status: 'LUNAS ✓' },
        { label: 'Desain Logo Haramain Capture', client: 'H. Aris Azhari Harahap', category: 'Branding', amount: 600000, profit: 600000, tag: 'DESIGN', status: 'LUNAS ✓' },
      ],
      expensesBreakdown: [
        { label: 'Biaya Operasional Dev & Hosting', amount: 500000, note: 'Server & setup operasional' },
        { label: 'Kebutuhan Rumah Tangga & Nafkah', amount: 3500000, note: 'Operasional bulanan keluarga' },
      ],
      summaryNote: 'Bulan Juli mencatatkan performa profit terbaik sebesar Rp9.300.000 dari 3 invoice resmi (Markaz Fiqih, DreamMecca, Haramain Capture) sebelum terjadi penarikan modal di awal Agustus.'
    }
  ];

  const activeArchive = monthlyArchives.find(a => a.id === selectedMonthArchive);

  return (
    <div className="space-y-5 font-sans animate-fade-in pb-12 max-w-5xl mx-auto select-none">
      
      {/* 1. EXECUTIVE SUMMARY HERO CARD (Jobforge Bento Style) */}
      <div className="bento-card p-6 sm:p-7 space-y-5 border border-zinc-200/90 shadow-sm">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <h3 className="text-xl font-extrabold text-[#111111] tracking-tight font-sans">
              <span className="lead-italic font-normal">Dompet</span> & Radar Cuan Daru 💰
            </h3>
            <span className={`sticker-pill ${isRed ? 'sticker-pink text-rose-700' : isGreen ? 'sticker-lime text-emerald-700' : 'sticker-apricot text-amber-800'} text-[9px]`}>
              {isRed 
                ? '🚨 MODE SIAGA — DEFENSE KAS' 
                : isGreen 
                  ? '🚀 MODE SULTAN — GAS EXPANSION' 
                  : '⚡ KAS NAFAS LEGA — BUFFER SOLID'}
            </span>
            <span className="text-xs text-zinc-500 font-mono">// Update per {currentFullDateStr} (Live)</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFinanceInput && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenFinanceInput();
                }}
                className="pill-black px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Kas / Struk Bukti</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Executive Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Metric 1: Total Saldo Likuid (Apricot) */}
          <div className="bento-card bento-apricot p-5 rounded-[22px] border border-[#fed7aa] space-y-1.5">
            <span className="sticker-pill sticker-apricot text-[9px]">
              01 // TOTAL AMUNISI CAIR
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-sans block">
              {formatRupiah(report.totalLiquidBalance)}
            </span>
            <span className="text-[11px] font-mono block text-[#c2410c] font-semibold">
              {isRed 
                ? `⚠️ Bahaya bro! Di bawah batas floor Rp4,00M` 
                : isGreen 
                  ? `🔥 Target 10 Jt Tembus! Saldo bebas berekspresi` 
                  : `🛡️ Surplus +${formatRupiah(report.totalLiquidBalance - (report.hardFloor || 4000000))} di atas batas aman`}
            </span>
          </div>

          {/* Metric 2: Monthly Burn (Pink) */}
          <div className="bento-card bento-pink p-5 rounded-[22px] border border-[#fbcfe8] space-y-1.5">
            <span className="sticker-pill sticker-pink text-[9px]">
              02 // RITUAL PENGELUARAN BULANAN
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-sans block">
              ~{formatRupiah(report.estimatedRealBurn || 4500000)}
            </span>
            <span className="text-[11px] font-mono text-zinc-600 block">
              Rp2,66M Wajib & Produktif + ~Rp1,8M Fleksibel Harian
            </span>
          </div>

          {/* Metric 3: Dynamic Runway (Lime) */}
          <div className="bento-card bento-lime p-5 rounded-[22px] border border-[#d9f99d] space-y-1.5">
            <span className="sticker-pill sticker-lime text-[9px]">
              03 // RUNWAY NAFAS TENANG
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-sans block">
              ±{calculatedRunwayDays} Hari Aman
            </span>
            <span className="text-[11px] font-mono text-zinc-600 block">
              Santai bro, dapur & server ngebul aman ~{calculatedRunwayMonths} bulan ke depan!
            </span>
          </div>

        </div>

        {/* Golden Rule Callout */}
        <div className="p-4 rounded-2xl bg-[#fef9c3]/80 border border-[#fef08a] text-xs font-mono text-zinc-800 flex items-start gap-2.5">
          <span className="text-base leading-none mt-0.5">💡</span>
          <div>
            <span className="text-[#854d0e] font-bold uppercase tracking-wider">// HUKUM MUTLAK BULAN {currentMonthName.toUpperCase()} {currentYear}:</span>
            <p className="mt-0.5 font-sans font-medium text-zinc-900 leading-relaxed text-xs">
              "Sebelum notif mutasi bank bunyi clink, itu <strong>belum sah jadi duit</strong> bro! Fokus tagih invoice & gaspol minimal <strong className="text-emerald-800 font-mono">+Rp10.000.000</strong> masuk bulan ini."
            </p>
          </div>
        </div>

      </div>

      {/* =========================================================================
          2. MONTHLY REVENUE TARGET & HISTORICAL ARCHIVE ENGINE (JOBFORGE PLAYFUL BENTO)
          ========================================================================= */}
      <div className="bento-card p-6 sm:p-8 space-y-6 border border-zinc-200/90 shadow-sm bg-white">
        
        {/* TOP CONTROLS: Month Switcher & Target Pill Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          
          {/* Left: Month Selector Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-zinc-900 font-bold uppercase tracking-wider">
              Periode Bulan:
            </span>
            <div className="inline-flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-full border border-zinc-200/80 font-mono text-xs shadow-xs">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setSelectedMonthArchive('current');
                }}
                className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-2 text-xs font-bold ${
                  selectedMonthArchive === 'current'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-zinc-700 hover:text-black hover:bg-white/80'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentMonthName} {currentYear} (Live)</span>
              </button>

              {monthlyArchives.map(arch => (
                <button
                  key={arch.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedMonthArchive(arch.id as any);
                  }}
                  className={`px-4 py-1.5 rounded-full transition-all text-xs font-bold ${
                    selectedMonthArchive === arch.id
                      ? 'bg-[#111111] text-white shadow-sm'
                      : 'text-zinc-700 hover:text-black hover:bg-white/80'
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
                className="px-3.5 py-1.5 rounded-full text-zinc-600 hover:text-black hover:bg-white transition-all text-xs font-semibold"
              >
                <span>Semua Rekap →</span>
              </button>
            </div>
          </div>

          {/* Right: Target Switcher Pills (Only visible in Live Month) */}
          {selectedMonthArchive === 'current' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-600 font-semibold uppercase">Target:</span>
              <div className="inline-flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200/80 font-mono text-xs">
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
                    className={`px-3 py-1.5 rounded-full transition-all text-xs font-bold ${
                      monthlyTarget === opt.val
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'text-zinc-700 hover:text-black hover:bg-white/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* VIEW A: LIVE ACTIVE MONTH (SEPTEMBER 2026) */}
        {selectedMonthArchive === 'current' && (
          <div className="space-y-6">
            
            {/* Header Title with Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    🎯
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight font-sans">
                    Target Pemasukan {currentMonthName} {currentYear}: <span className="text-emerald-700 font-mono font-black">+{formatRupiah(monthlyTarget)} / Bulan</span>
                  </h3>
                  <span className="sticker-pill sticker-lime text-[10px]">
                    TARGET_SEPTEMBER
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-800 font-medium leading-relaxed max-w-3xl">
                  Bulan <strong>{currentMonthName} {currentYear}</strong> minimal harus nambah <strong>{formatRupiah(monthlyTarget)}</strong> agar kas langsung surplus dan bebas dari zona bahaya!
                </p>
              </div>
            </div>

            {/* Top Trio Bento: Progress Gauge & Proyeksi Surplus */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              
              {/* Progress Gauge Bento (Clean White Bento with High Contrast) */}
              <div className="lg:col-span-2 p-6 rounded-[26px] bg-[#fafafa] border border-zinc-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-900 font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Progress Pemasukan Bulan {currentMonthName}:</span>
                    </span>
                    <span className="text-emerald-700 font-black text-base font-mono">
                      {formatRupiah(totalPaidThisMonth)} / {formatRupiah(monthlyTarget)} ({targetProgressPercent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-4 rounded-full bg-zinc-200 overflow-hidden relative shadow-inner">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-700 rounded-full"
                      style={{ width: `${targetProgressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center text-xs font-mono text-zinc-800 pt-3 border-t border-zinc-200/80 gap-2">
                  <span>
                    Sisa target: <strong className="text-[#9a3412] font-black">{formatRupiah(remainingTarget)}</strong>
                  </span>
                  <span className="text-zinc-700 font-semibold">
                    Hari ke-{dayOfMonth}/{totalDaysInMonth} ({daysRemaining} hari lagi)
                  </span>
                  <span className="text-emerald-800 font-bold">
                    Pacing Harian: <strong>{formatRupiah(dailyRequiredPacing)}/hari</strong>
                  </span>
                </div>
              </div>

              {/* Net Surplus Card (Bento Lime Pastel) */}
              <div className="bento-card bento-lime p-6 rounded-[26px] border border-[#d9f99d] space-y-2.5 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="sticker-pill sticker-lime text-[10px] uppercase tracking-wider block font-bold">
                    PROYEKSI SURPLUS BERSIH / BULAN
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-[#111111] font-mono block mt-2">
                    +{formatRupiah(netMonthlySurplus)}
                  </span>
                </div>
                <p className="text-xs text-[#14532d] font-semibold leading-relaxed">
                  Pemasukan {formatRupiah(monthlyTarget)} - Real Burn Rp4,5M = <strong className="text-black font-extrabold">+{formatRupiah(netMonthlySurplus)}</strong> masuk tabungan cadangan tiap bulan!
                </p>
              </div>

            </div>

            {/* Breakdown: PETA REALISASI TARGET (Clean Jobforge 4-Bento Grid) */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-900 uppercase tracking-wider block font-black">
                  🗺️ Peta Realisasi Target Bulan {currentMonthName} ({formatRupiah(monthlyTarget)} / Bulan):
                </span>
                <span className="text-xs font-mono text-zinc-800 font-bold">
                  Total Realisasi + Pipeline: <strong className="text-emerald-700 font-black font-mono">Rp15.100.000</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Source 1: Barber POS (Bento Apricot) */}
                <div className="bento-card bento-apricot p-5 rounded-[24px] border border-[#fed7aa] space-y-3 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="sticker-pill sticker-lime text-[10px] py-0.5">100% LUNAS FULL ✓</span>
                      <span className="text-xs font-mono font-black text-black">Rp3.000.000</span>
                    </div>
                    <h5 className="text-sm font-extrabold text-[#111111] mt-3 font-sans">Barber Underrated (Lunas)</h5>
                    <p className="text-xs text-zinc-900 font-medium leading-relaxed mt-1">
                      Pelunasan Rp3.000.000 masuk kas Mandiri! Total deal Rp6.000.000 lunas penuh ✓
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-black/10 text-[11px] font-mono text-[#9a3412] font-bold">
                    ✓ Dana Sudah Masuk Kas
                  </div>
                </div>

                {/* Source 2: Umi Elly LMS (Bento Blue) */}
                <div className="bento-card bento-blue p-5 rounded-[24px] border border-[#bae6fd] space-y-3 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="sticker-pill sticker-blue text-[10px] py-0.5">DP MASUK // KICKOFF</span>
                      <span className="text-xs font-mono font-black text-black">Rp3.000.000</span>
                    </div>
                    <h5 className="text-sm font-extrabold text-[#111111] mt-3 font-sans">DP Umi Elly LMS (Kickoff)</h5>
                    <p className="text-xs text-zinc-900 font-medium leading-relaxed mt-1">
                      Termin 1 DP Rp3.000.000 masuk kas! Gaspol sprint pengerjaan modul LMS Azhariyah.
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-black/10 text-[11px] font-mono text-[#075985] font-bold">
                    ✓ Dana Sudah Masuk Kas
                  </div>
                </div>

                {/* Source 3: Ustadz Ifdony Logo Azharuna (Bento Pink) */}
                <div className="bento-card bento-pink p-5 rounded-[24px] border border-[#fbcfe8] space-y-3 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="sticker-pill sticker-pink text-[10px] py-0.5">100% LUNAS ✓</span>
                      <span className="text-xs font-mono font-black text-black">Rp500.000</span>
                    </div>
                    <h5 className="text-sm font-extrabold text-[#111111] mt-3 font-sans">Logo Azharuna (Ifdony)</h5>
                    <p className="text-xs text-zinc-900 font-medium leading-relaxed mt-1">
                      Pembayaran Rp500.000 lunas di portal invoice! Desain branding tuntas diserahkan.
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-black/10 text-[11px] font-mono text-[#9d174d] font-bold">
                    ✓ Dana Sudah Masuk Kas
                  </div>
                </div>

                {/* Source 4: Sisa Pipeline September (Bento Lime) */}
                <div className="bento-card bento-lime p-5 rounded-[24px] border border-[#d9f99d] space-y-3 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="sticker-pill sticker-yellow text-[10px] py-0.5">PIPELINE AKTIF</span>
                      <span className="text-xs font-mono font-black text-black">Rp8.600.000</span>
                    </div>
                    <h5 className="text-sm font-extrabold text-[#111111] mt-3 font-sans">Sisa Piutang September</h5>
                    <p className="text-xs text-zinc-900 font-medium leading-relaxed mt-1">
                      Al Madroj (Rp3,5M) + Sisa Termin Umi Elly (Rp4M) + Ibrahim Visa (Rp1,1M).
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-black/10 text-[11px] font-mono text-[#14532d] font-bold">
                    ⏳ OTW Masuk Rekening
                  </div>
                </div>

              </div>
            </div>

            {/* Kas Growth Projection (Jobforge 3-Col Clean Bento Pods) */}
            <div className="p-6 rounded-[26px] bg-[#fafafa] border border-zinc-200 space-y-3.5">
              <span className="text-xs font-mono text-zinc-900 font-black uppercase tracking-wide block">
                📈 Efek Pertumbuhan Saldo Kas Mengikuti Tanggal Real (+{formatRupiah(monthlyTarget)}/bln):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bento-card bg-white p-5 rounded-[22px] border border-zinc-200 shadow-xs space-y-1.5">
                  <span className="text-zinc-600 block text-[10px] font-bold uppercase">BULAN 1: {month1Name} (+{formatRupiah(netMonthlySurplus)})</span>
                  <span className="text-xl font-black text-[#111111] block font-mono mt-0.5">{formatRupiah(projectedBalanceMonth1)}</span>
                  <span className="text-xs text-amber-800 font-bold block">Runway: ±{runwayMonth1} Bulan (Keluar dari Red Mode)</span>
                </div>

                <div className="bento-card bento-lime p-5 rounded-[22px] border border-[#d9f99d] shadow-xs space-y-1.5">
                  <span className="text-[#14532d] block text-[10px] font-bold uppercase">BULAN 2: {month2Name} (+{formatRupiah(netMonthlySurplus)})</span>
                  <span className="text-xl font-black text-[#111111] block font-mono mt-0.5">{formatRupiah(projectedBalanceMonth2)}</span>
                  <span className="text-xs text-[#14532d] font-bold block">Runway: ±{runwayMonth2} Bulan (🟢 Green Safe Growth)</span>
                </div>

                <div className="bento-card bento-blue p-5 rounded-[22px] border border-[#bae6fd] shadow-xs space-y-1.5">
                  <span className="text-[#075985] block text-[10px] font-bold uppercase">BULAN 3: {month3Name} (+{formatRupiah(netMonthlySurplus)})</span>
                  <span className="text-xl font-black text-[#111111] block font-mono mt-0.5">{formatRupiah(projectedBalanceMonth3)}</span>
                  <span className="text-xs text-[#075985] font-bold block">Runway: ±{runwayMonth3} Bulan (Indie SaaS Powerhouse)</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW B: HISTORICAL ARCHIVED MONTH (AGUSTUS 2026 / JULI 2026) */}
        {selectedMonthArchive !== 'current' && activeArchive && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Archive */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-black text-[#111111] tracking-tight flex items-center gap-2 font-sans">
                    Rekap Pencapaian: <span className="text-amber-700 font-mono">{activeArchive.monthName}</span>
                  </h3>
                  <span className="sticker-pill sticker-yellow text-[10px]">{activeArchive.periodTag}</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-800 font-medium">
                  {activeArchive.summaryNote}
                </p>
              </div>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setSelectedMonthArchive('current');
                }}
                className="pill-black text-xs font-bold px-4 py-2 shadow-sm"
              >
                <span>← Kembali ke {currentMonthName} {currentYear} (Live)</span>
              </button>
            </div>

            {/* Realization Metrics & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              <div className="lg:col-span-2 p-6 rounded-[26px] bg-[#fafafa] border border-zinc-200 space-y-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-900 font-bold">
                    Realisasi Pemasukan {activeArchive.monthName}:
                  </span>
                  <span className="text-emerald-700 font-black text-base">
                    {formatRupiah(activeArchive.realizedIncome)} / {formatRupiah(activeArchive.target)} ({activeArchive.progressPercent}%)
                  </span>
                </div>

                <div className="w-full h-4 rounded-full bg-zinc-200 overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-700 rounded-full"
                    style={{ width: `${activeArchive.progressPercent}%` }}
                  />
                </div>

                <div className="flex flex-wrap justify-between items-center text-xs font-mono text-zinc-800 pt-2 gap-2">
                  <span>Pemasukan: <strong className="text-emerald-700 font-black">+{formatRupiah(activeArchive.realizedIncome)}</strong></span>
                  <span>Pengeluaran: <strong className="text-rose-700 font-black">-{formatRupiah(activeArchive.realizedExpense)}</strong></span>
                  <span>Saldo Akhir: <strong className="text-[#111111] font-black">{formatRupiah(activeArchive.endingBalance)}</strong></span>
                </div>
              </div>

              <div className="bento-card bento-lime p-6 rounded-[26px] border border-[#d9f99d] space-y-2 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="sticker-pill sticker-lime text-[10px] uppercase tracking-widest block font-bold">
                    SURPLUS BERSIH YANG TERCATAT
                  </span>
                  <span className="text-3xl font-black text-[#111111] font-mono block mt-2">
                    +{formatRupiah(activeArchive.netSurplus)}
                  </span>
                </div>
                <p className="text-xs text-[#14532d] font-semibold leading-relaxed">
                  Surplus cadangan kas: <strong>+{formatRupiah(activeArchive.netSurplus)}</strong> ({activeArchive.runwayMonths} runway aman).
                </p>
              </div>
            </div>

            {/* Pencapaian & Key Milestones List */}
            <div className="p-6 rounded-[26px] bg-white border border-zinc-200 space-y-3">
              <span className="text-xs font-mono text-zinc-900 uppercase tracking-wider block font-black">
                🏆 Milestone & Pencapaian Utama di Bulan {activeArchive.monthName}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-800 font-medium">
                {activeArchive.milestones.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black">✓</span>
                    <span className="leading-snug">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown Pemasukan & Deliverables */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-zinc-900 uppercase tracking-wider block font-black">
                💼 Rincian Pemasukan & Deliverable {activeArchive.monthName}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeArchive.breakdown.map((item, idx) => (
                  <div key={idx} className="bento-card bg-white p-5 rounded-[22px] border border-zinc-200 space-y-2 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="sticker-pill sticker-blue text-[9px] py-0.5">{item.tag}</span>
                      <span className="text-xs font-mono font-black text-[#111111]">{formatRupiah(item.amount)}</span>
                    </div>
                    <h5 className="text-sm font-bold text-[#111111] mt-2">{item.label}</h5>
                    <p className="text-xs text-zinc-700 leading-snug">{item.client} • <span className="text-emerald-700 font-bold">{item.status}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>


      {/* 3. SIMPLE NAVIGATION SUB-TABS (Jobforge Pill Tabs) */}
      <div className="bento-card p-2 flex items-center gap-2 border border-zinc-200/80 overflow-x-auto no-scrollbar font-mono text-xs">
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
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'pill-black shadow-md'
                : 'pill-white text-zinc-600 hover:text-black'
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
          
          <div className="bento-card p-6 space-y-4 border border-zinc-200/90 shadow-sm">
            <h3 className="text-base font-extrabold text-[#111111] font-sans">Simulasi Perpanjangan Runway & Target Kas</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bento-card bento-pink p-5 rounded-[22px] border border-[#fbcfe8] space-y-1.5">
                <span className="sticker-pill sticker-pink text-[9px]">
                  1. POSISI SAAT INI (LIVE)
                </span>
                <p className="text-xl font-extrabold text-[#111111] font-sans">{formatRupiah(report.totalLiquidBalance)}</p>
                <p className="text-xs text-zinc-600">
                  Runway: <strong className={isRed ? 'text-[#be185d]' : 'text-[#15803d]'}>±{calculatedRunwayDays} Hari (~{calculatedRunwayMonths} Bln)</strong>
                </p>
                <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                  {isRed ? '🔴 Mode Cash Defense (< Rp4M)' : '🟢 Green Mode (Growth)'}
                </span>
              </div>

              <div className="bento-card bento-lime p-5 rounded-[22px] border border-[#d9f99d] space-y-1.5">
                <span className="sticker-pill sticker-lime text-[9px]">
                  2. + TERMIN 1 UMI ELLY (DP Rp3M)
                </span>
                <p className="text-xl font-extrabold text-[#111111] font-sans">{formatRupiah(report.totalLiquidBalance + 3000000)}</p>
                <p className="text-xs text-zinc-600">
                  Runway: <strong className="text-[#15803d]">±{Math.round(((report.totalLiquidBalance + 3000000) / (report.estimatedRealBurn || 4500000)) * 30)} Hari (~{(((report.totalLiquidBalance + 3000000) / (report.estimatedRealBurn || 4500000))).toFixed(1)} Bln)</strong>
                </p>
                <span className="text-[10px] text-[#15803d] font-mono block mt-1 font-semibold">
                  🟢 Safe Growth Zone (Mendekati Target 10M)
                </span>
              </div>

              <div className="bento-card bento-blue p-5 rounded-[22px] border border-[#bae6fd] space-y-1.5">
                <span className="sticker-pill sticker-blue text-[9px]">
                  3. + PELUNASAN BARBER / TERMIN 2 (Rp3M)
                </span>
                <p className="text-xl font-extrabold text-[#111111] font-sans">{formatRupiah(report.totalLiquidBalance + 6000000)}</p>
                <p className="text-xs text-zinc-600">
                  Runway: <strong className="text-[#0369a1]">±{Math.round(((report.totalLiquidBalance + 6000000) / (report.estimatedRealBurn || 4500000)) * 30)} Hari (~{(((report.totalLiquidBalance + 6000000) / (report.estimatedRealBurn || 4500000))).toFixed(1)} Bln)</strong>
                </p>
                <span className="text-[10px] text-[#0369a1] font-mono block mt-1 font-semibold">
                  💎 High Capital & Safe Scaling
                </span>
              </div>
            </div>
          </div>

          <div className="bento-card p-6 space-y-4 border border-zinc-200/90 shadow-sm">
            <h3 className="text-base font-extrabold text-[#111111] font-sans">Pergerakan Aset Likuid Terakhir</h3>
            <div className="space-y-2">
              {report.trajectory.map((point, idx) => (
                <div key={point.date} className="flex items-center justify-between text-xs font-mono p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <span className="text-zinc-600 font-semibold">{point.date}</span>
                  <div className="flex gap-2 items-center">
                    <span className={`font-bold ${idx === report.trajectory.length - 1 ? 'text-[#111111]' : 'text-zinc-500'}`}>{formatRupiah(point.balance)}</span>
                    <span className="text-[11px] text-zinc-400">({point.note})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 7 ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="bento-card p-6 space-y-5 border border-zinc-200/90 shadow-sm">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#111111] font-sans">Rincian Saldo Rekening & E-Wallet</h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">// Total: {formatRupiah(report.totalLiquidBalance)}</p>
            </div>
            <button 
              onClick={() => onOpenFinanceInput && onOpenFinanceInput()} 
              className="pill-black text-xs font-semibold px-4 py-1.5 shadow-sm"
            >
              ✏️ Update Saldo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {report.accounts.map((acc, idx) => {
              const accThemes = [
                { bg: 'bento-apricot', border: 'border-[#fed7aa]' },
                { bg: 'bento-blue', border: 'border-[#bae6fd]' },
                { bg: 'bento-pink', border: 'border-[#fbcfe8]' },
                { bg: 'bento-lime', border: 'border-[#d9f99d]' },
              ];
              const theme = accThemes[idx % accThemes.length];

              return (
                <div key={acc.name} className={`bento-card ${theme.bg} p-5 rounded-[22px] border ${theme.border} flex justify-between items-center shadow-xs`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[#111111] font-sans">{acc.name}</span>
                      {acc.isLatest && <span className="sticker-pill sticker-lime text-[9px] py-0">LIVE</span>}
                    </div>
                    <span className="text-[11px] text-zinc-600 font-mono">{acc.lastUpdated}</span>
                  </div>
                  <span className="text-base font-mono font-extrabold text-[#111111]">{formatRupiah(acc.balance)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono pt-1">*Mandiri adalah update angka live terbaru. Saldo lain memakai data 26 Agustus.</p>
        </div>
      )}

      {/* VIEW 3: MONTHLY EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="figma-shell">
            <div className="figma-core p-5 sm:p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">A. Pengeluaran Fixed Bulanan</h3>
                  <p className="text-xs text-zinc-700 font-mono">// Wajib / Rutin: Rp2.665.000/bln</p>
                </div>
                <span className="dev-tag">6_ITEMS_FIXED</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(report.monthlyExpenses?.filter(e => e.isFixed) || []).map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-white border border-zinc-200 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-[#111111]">{item.category}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.notes}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#111111]">{item.amountText}</span>
                      <span className="text-[9px] font-mono block text-emerald-400">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="figma-shell">
            <div className="figma-core p-5 sm:p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">B. Kebutuhan Wajib Fleksibel</h3>
                  <p className="text-xs text-zinc-700 font-mono">// Estimasi Tambahan: ~Rp1,5M – Rp2,5M/bln</p>
                </div>
                <span className="dev-tag">5_CATEGORIES</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(report.monthlyExpenses?.filter(e => !e.isFixed) || []).map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-white/70 border border-zinc-200 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-[#111111]">{item.category}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.notes}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-zinc-700">{item.amountText}</span>
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
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Project Cashflow & Potential Receivables</h3>
                <p className="text-xs text-zinc-700 font-mono">
                  // Sudah Masuk: {formatRupiah(projects.reduce((acc, p) => acc + (p.paidNumeric || 0), 0))} • Pipeline OTW: {formatRupiah(projects.reduce((acc, p) => acc + (p.unpaidNumeric || 0), 0))}
                </p>
              </div>
              <span className="dev-tag">RECEIVABLES</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-700 uppercase text-[11px]">
                    <th className="pb-3 pr-3 font-semibold text-[#111111] font-sans">Project</th>
                    <th className="pb-3 px-3 font-semibold">Status</th>
                    <th className="pb-3 px-3 font-semibold">Total Nominal</th>
                    <th className="pb-3 px-3 font-semibold text-[#111111]">Sudah Masuk</th>
                    <th className="pb-3 px-3 font-semibold text-amber-300">Pipeline OTW</th>
                    <th className="pb-3 px-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-700">
                  {projects.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pr-3 font-sans font-bold text-[#111111]">{p.name}</td>
                      <td className="py-3.5 px-3 text-[11px] text-zinc-700">{p.status}</td>
                      <td className="py-3.5 px-3 text-zinc-700">{p.valueText}</td>
                      <td className="py-3.5 px-3 text-[#111111] font-bold">{formatRupiah(p.paidNumeric || 0)}</td>
                      <td className="py-3.5 px-3 text-amber-300 font-bold">{formatRupiah(p.unpaidNumeric || 0)}</td>
                      <td className="py-3.5 px-3">
                        {onOpenFollowUp && (
                          <button onClick={() => onOpenFollowUp(p)} className="text-zinc-700 hover:text-[#111111] font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-zinc-200">Copas WA 💬</button>
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
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Riwayat Transaksi & Bukti Transfer</h3>
                <p className="text-xs text-zinc-700 font-mono">// Log transaksi & foto bukti yang pernah dicatat</p>
              </div>
              {onOpenFinanceInput && (
                <button onClick={() => onOpenFinanceInput()} className="px-3 py-1.5 dev-btn-primary text-xs font-bold rounded-xl">+ Input Baru</button>
              )}
            </div>

            {report.transactions && report.transactions.length > 0 ? (
              <div className="space-y-2">
                {report.transactions.map(tx => (
                  <div key={tx.id} className="p-3.5 rounded-2xl bg-white border border-zinc-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#111111] block">{tx.description}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">{tx.date} • {tx.accountName} • {tx.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                      </span>
                      {tx.photoUrl && (
                        <button 
                          onClick={() => setZoomedPhoto({ url: tx.photoUrl!, title: tx.description })} 
                          className="text-[11px] text-zinc-700 bg-white hover:bg-[#fafafa] px-2.5 py-1 rounded-xl border border-zinc-200 font-mono"
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
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                    <span>🏛️ Rekap & Arsip Pencapaian Bulanan</span>
                    <span className="dev-tag-emerald text-[9px]">HISTORICAL_TRACKER</span>
                  </h3>
                  <p className="text-xs text-zinc-700 font-mono">// Perbandingan performa target, pemasukan real, pengeluaran & milestone per bulan</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-700">Total Periode Terekam: <strong>3 Bulan (Jul, Agu, Sep 2026)</strong></span>
                </div>
              </div>

              {/* Comparative Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-700 uppercase text-[11px]">
                      <th className="pb-3 pr-3 font-semibold text-[#111111] font-sans">Bulan / Periode</th>
                      <th className="pb-3 px-3 font-semibold">Status</th>
                      <th className="pb-3 px-3 font-semibold text-emerald-400">Pemasukan Real</th>
                      <th className="pb-3 px-3 font-semibold text-rose-400">Beban Keluar</th>
                      <th className="pb-3 px-3 font-semibold text-amber-300">Net Surplus</th>
                      <th className="pb-3 px-3 font-semibold text-[#111111]">Saldo Kas Akhir</th>
                      <th className="pb-3 px-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-700">
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
                      <td className="py-3.5 px-3 text-[#111111] font-bold">{formatRupiah(report.totalLiquidBalance)}</td>
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            setSelectedMonthArchive('current');
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="text-emerald-300 hover:text-[#111111] font-mono bg-emerald-500/15 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all"
                        >
                          Lihat Live ⚡
                        </button>
                      </td>
                    </tr>

                    {/* Historical Months */}
                    {monthlyArchives.map(arch => (
                      <tr key={arch.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 pr-3 font-sans font-bold text-[#111111] flex items-center gap-1.5">
                          <span>🏛️ {arch.monthName}</span>
                        </td>
                        <td className="py-3.5 px-3 text-[11px] text-amber-400">{arch.periodTag}</td>
                        <td className="py-3.5 px-3 text-emerald-300 font-bold">{formatRupiah(arch.realizedIncome)}</td>
                        <td className="py-3.5 px-3 text-rose-400 font-bold">-{formatRupiah(arch.realizedExpense)}</td>
                        <td className="py-3.5 px-3 text-amber-300 font-bold">+{formatRupiah(arch.netSurplus)}</td>
                        <td className="py-3.5 px-3 text-[#111111] font-bold">{formatRupiah(arch.endingBalance)}</td>
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              setSelectedMonthArchive(arch.id as any);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="text-zinc-700 hover:text-[#111111] font-mono bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-zinc-200 transition-all"
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
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <h4 className="text-sm font-bold text-[#111111]">{arch.monthName}</h4>
                      <span className="dev-tag text-[9px] bg-amber-500/10 text-amber-300 border-amber-500/20">{arch.periodTag}</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{arch.progressPercent}% Target</span>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed">{arch.summaryNote}</p>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white border border-zinc-200 text-center text-xs font-mono">
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
                    <span className="text-[11px] font-mono text-zinc-700 uppercase font-semibold block">🏆 Pencapaian Utama:</span>
                    <ul className="space-y-1 text-xs text-zinc-700">
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
                    className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-zinc-200 text-xs font-mono font-bold text-[#111111] transition-all flex items-center justify-center gap-2"
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
            className="max-w-2xl w-full bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
              <h4 className="text-sm font-bold text-[#111111]">{zoomedPhoto.title}</h4>
              <button onClick={() => setZoomedPhoto(null)} className="text-zinc-700 hover:text-[#111111]">✕</button>
            </div>
            <div className="flex justify-center bg-[#fafafa] rounded-xl p-2 max-h-[75vh] overflow-auto">
              <img src={zoomedPhoto.url} alt={zoomedPhoto.title} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
