import React from 'react';
import { 
  DollarSign,
  Clock,
  ShieldCheck,
  TrendingUp,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { FinancialReport } from '../types';

interface TopQuickStatsProps {
  todayPursuit: Array<{ id: string; project: string; action: string; isDone?: boolean }>;
  onTogglePursuit: (id: string) => void;
  quickStats: {
    paidClientActive: number;
    waitingPaymentKickoff: number;
    maintenanceOpen: number;
    salesAndProductActive: number;
  };
  onSelectTab: (tab: string) => void;
  financialReport?: FinancialReport;
}

export const TopQuickStats: React.FC<TopQuickStatsProps> = ({
  todayPursuit,
  onTogglePursuit,
  quickStats,
  onSelectTab,
  financialReport
}) => {
  const completedPursuits = todayPursuit.filter(p => p.isDone).length;
  const progressPercent = Math.round((completedPursuits / (todayPursuit.length || 1)) * 100);

  const totalBal = financialReport?.totalLiquidBalance || 9892741;
  const isRed = totalBal < (financialReport?.hardFloor || 4000000);
  const isGreen = totalBal >= (financialReport?.monthlyIncomeTarget || 10000000);
  const runwayDays = financialReport?.runwayDays || 66;
  const runwayMonths = (runwayDays / 30).toFixed(1);

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div className="space-y-4 font-sans select-none">
      
      {/* 1. SITUATION COMMAND DECK (Warm Cream Agency Card) */}
      <div className="cream-shell">
        <div className="p-5 sm:p-6 space-y-4 bg-[#fffdf5] rounded-[14px]">
          
          {/* Top Header & Progress */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded7c8] pb-3.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#305d46] animate-pulse" />
                <h2 className="text-base sm:text-lg font-bold text-[#24241f] tracking-tight">
                  Hari ini gue harus ngejar apa?
                </h2>
              </div>
              <p className="text-xs text-[#59594f]">
                3 prioritas emas: Modul LMS Umi Elly • Handover DreamMecca • Setup KAEL SaaS Pilot
              </p>
            </div>

            {/* Progress Pill & Beacon */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-[#eae5d8] border border-[#ded7c8] px-3 py-1.5 rounded-xl">
                <span className="text-[10px] font-mono text-[#666256] uppercase font-semibold">PROGRESS</span>
                <span className="text-xs font-mono font-bold text-[#24241f]">
                  {completedPursuits}/{todayPursuit.length} ({progressPercent}%)
                </span>
              </div>
              <span className="dev-tag-emerald text-[10px]">ACTIVE_SPRINT</span>
            </div>
          </div>

          {/* 4 Interactive Command Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {todayPursuit.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  onTogglePursuit(item.id);
                  if (!item.isDone) {
                    soundManager.playCompletionChime();
                    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 group relative ${
                  item.isDone
                    ? 'bg-[#eae5d8]/60 border-[#ded7c8] opacity-50'
                    : 'bg-[#fffdf5] border-[#ded7c8] hover:border-[#928876] hover:bg-[#ffffff] shadow-sm'
                }`}
              >
                {/* Checkbox Trigger */}
                <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                  item.isDone
                    ? 'bg-[#292a24] border-[#292a24] text-[#fffdf5]'
                    : 'border-[#ded7c8] bg-[#fffdf5] group-hover:border-[#928876]'
                }`}>
                  {item.isDone && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono text-[#666256] font-semibold uppercase truncate">
                      {item.project}
                    </span>
                  </div>
                  <p className={`text-xs font-medium leading-snug line-clamp-2 ${
                    item.isDone ? 'line-through text-[#666256]' : 'text-[#24241f]'
                  }`}>
                    {item.action}
                  </p>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 2. THE 4 ICONIC PASTEL STAT CARDS (EXACT FROM INVOICE DESIGN REPO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Profit / Pemasukan September (Lavender #d0b4e9) */}
        <button
          onClick={() => {
            soundManager.playClick();
            onSelectTab('money');
          }}
          className="stat-card profit-stat text-left group"
        >
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-xs font-mono font-semibold text-[#34332f] uppercase tracking-wide">
              September Realized
            </span>
            <div className="stat-icon-circle shadow-sm">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#272722]">
              Rp 6.500.000
            </div>
            <div className="text-[11px] text-[#4c4a40] font-mono mt-1">
              65% dari target Rp10 Juta (Barber, Umi Elly, Ifdony)
            </div>
          </div>
        </button>

        {/* Card 2: Total Kas Likuid Real (Peach #ffb99f) */}
        <button
          onClick={() => {
            soundManager.playClick();
            onSelectTab('money');
          }}
          className="stat-card paid-stat text-left group"
        >
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-xs font-mono font-semibold text-[#34332f] uppercase tracking-wide">
              Saldo Kas Likuid
            </span>
            <div className="stat-icon-circle shadow-sm">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#272722]">
              {formatRupiah(totalBal)}
            </div>
            <div className="text-[11px] text-[#4c4a40] font-mono mt-1">
              Surplus +Rp5,89M di atas Hard Floor (Mandiri Rp9,78M)
            </div>
          </div>
        </button>

        {/* Card 3: Pipeline Piutang Aktif (Sky Blue #adc6ed) */}
        <button
          onClick={() => {
            soundManager.playClick();
            onSelectTab('waiting');
          }}
          className="stat-card unpaid-stat text-left group"
        >
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-xs font-mono font-semibold text-[#34332f] uppercase tracking-wide">
              Piutang / Pipeline
            </span>
            <div className="stat-icon-circle shadow-sm">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#272722]">
              Rp 8.600.000
            </div>
            <div className="text-[11px] text-[#4c4a40] font-mono mt-1">
              Al Madroj (Rp3,5M) + Sisa Umi Elly (Rp4M) + Ibrahim (Rp1,1M)
            </div>
          </div>
        </button>

        {/* Card 4: Defense Runway Safe (Pale Sage #e3e6c7) */}
        <button
          onClick={() => {
            soundManager.playClick();
            onSelectTab('money');
          }}
          className="stat-card total-stat text-left group"
        >
          <div className="flex justify-between items-center w-full mb-3">
            <span className="text-xs font-mono font-semibold text-[#34332f] uppercase tracking-wide">
              Defense Runway
            </span>
            <div className="stat-icon-circle shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#272722]">
              ±{runwayDays} Hari ({runwayMonths} Bln)
            </div>
            <div className="text-[11px] text-[#4c4a40] font-mono mt-1">
              Burn riil Rp4,5M/bln • Status Kas: Green Safe Growth 🟢
            </div>
          </div>
        </button>

      </div>

    </div>
  );
};
