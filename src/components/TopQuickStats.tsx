import React from 'react';
import { 
  ArrowRight,
  Check,
  Zap,
  Activity,
  DollarSign,
  Clock,
  ShieldCheck,
  Layers,
  Sparkles
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
  const progressPercent = Math.round((completedPursuits / todayPursuit.length) * 100);

  const totalBal = financialReport?.totalLiquidBalance || 6844233;
  const isRed = totalBal < (financialReport?.hardFloor || 4000000);
  const isGreen = totalBal >= (financialReport?.monthlyIncomeTarget || 10000000);
  const runwayDays = financialReport?.runwayDays || Math.round((totalBal / (financialReport?.estimatedRealBurn || 4500000)) * 30);
  const runwayMonths = (runwayDays / 30).toFixed(1);

  return (
    <div className="space-y-4 font-sans select-none">
      
      {/* 1. SITUATION COMMAND DECK (Figma Doppelrand Double-Bezel) */}
      <div className="figma-shell">
        <div className="figma-core p-5 sm:p-6 space-y-4">
          
          {/* Top Header & Progress */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Hari ini gue harus ngejar apa?
                </h2>
              </div>
              <p className="text-xs text-zinc-400 font-normal">
                4 fokus mutlak: Lunasin Zalvice • Amankan DP Barber POS (Rp3M) & Umi Elly (Rp3M) • Setting KAEL
              </p>
            </div>

            {/* Progress Pill & Beacon */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#060609] border border-white/[0.08] px-3 py-1.5 rounded-xl">
                <span className="text-[10px] font-mono text-zinc-400">PROGRESS</span>
                <span className="text-xs font-mono font-bold text-white">
                  {completedPursuits}/{todayPursuit.length} ({progressPercent}%)
                </span>
              </div>
              <span className="dev-tag">ACTIVE_SPRINT</span>
            </div>
          </div>

          {/* 4 Interactive Command Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {todayPursuit.map((item, idx) => (
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
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3 group relative ${
                  item.isDone
                    ? 'bg-black/50 border-white/[0.04] opacity-40'
                    : 'bg-[#060609] border-white/[0.06] hover:border-white/20 hover:bg-[#0c0c14]'
                }`}
              >
                {/* Checkbox Trigger */}
                <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                  item.isDone
                    ? 'bg-white border-white text-zinc-950 font-bold text-[10px]'
                    : 'border-zinc-700 group-hover:border-zinc-400 bg-black/40'
                }`}>
                  {item.isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${item.isDone ? 'line-through text-zinc-500' : 'text-white font-bold'}`}>
                      {item.project}
                    </p>
                    <span className="text-[9px] font-mono text-zinc-600">0{idx + 1}</span>
                  </div>
                  <p className={`text-[11px] mt-0.5 line-clamp-2 leading-relaxed ${item.isDone ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {item.action}
                  </p>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 2. Micro-Stat Pods (Horizontal Figma Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Paid Clients Active',
            val: `${quickStats.paidClientActive} Clients`,
            sub: 'Zalvice & Laptopbisnis (Paid)',
            tag: 'DELIVERY',
            tagStyle: 'dev-tag-emerald',
            tab: 'lanes'
          },
          {
            label: 'Radar Kickoff & DP',
            val: `${quickStats.waitingPaymentKickoff} Deals OTW`,
            sub: 'Barber POS + Umi Elly (Rp6M)',
            tag: 'REVENUE',
            tagStyle: 'dev-tag-amber',
            tab: 'waiting'
          },
          {
            label: 'Sales & Product Active',
            val: `${quickStats.salesAndProductActive} Systems`,
            sub: 'KAEL Core & Offline Outreach',
            tag: 'CORE SAAS',
            tagStyle: 'dev-tag',
            tab: 'lanes'
          },
          {
            label: 'Monthly Burn Rate',
            val: 'Rp2,67M / Bln',
            sub: `Runway: ±${runwayDays} Hari (${runwayMonths} Bln)`,
            tag: isRed ? 'RED MODE' : isGreen ? 'GREEN MODE' : 'STAGE 2 SAFE',
            tagStyle: isRed ? 'dev-tag-rose' : isGreen ? 'dev-tag-emerald' : 'dev-tag-amber',
            tab: 'money'
          }
        ].map((stat, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundManager.playClick();
              onSelectTab(stat.tab);
            }}
            className="figma-shell text-left group"
          >
            <div className="figma-core p-3.5 space-y-1 group-hover:bg-[#0e0e16] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">{stat.label}</span>
                <span className={stat.tagStyle}>{stat.tag}</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">{stat.val}</div>
              <div className="text-[10px] text-zinc-500 font-mono truncate">{stat.sub}</div>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
};
