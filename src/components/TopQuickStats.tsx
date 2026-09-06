import React from 'react';
import { 
  ArrowUpRight, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Zap, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Flame,
  Briefcase
} from 'lucide-react';
import { QuickStats, TodayPursuit, FinancialReport } from '../types';
import { soundManager } from '../utils/audio';

interface TopQuickStatsProps {
  todayPursuit: TodayPursuit[];
  onTogglePursuit: (id: string) => void;
  quickStats: QuickStats;
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
  const formatRupiah = (num: number) => {
    return `Rp${num.toLocaleString('id-ID')}`;
  };

  const formatShortRupiah = (num: number) => {
    if (num >= 1000000) {
      const jt = (num / 1000000).toFixed(2).replace(/\.00$/, '');
      return `Rp${jt}M`;
    }
    return formatRupiah(num);
  };

  const totalLiquid = financialReport?.totalLiquidBalance || 8306524;
  const hardFloor = financialReport?.hardFloor || 4000000;
  const surplusFloor = totalLiquid - hardFloor;
  const mandiriAccount = financialReport?.accounts?.find((a) => a.name.toLowerCase().includes('mandiri'));
  const mandiriBalanceText = mandiriAccount ? formatShortRupiah(mandiriAccount.balance) : 'Rp6,85M';
  const targetIncome = financialReport?.monthlyIncomeTarget || 10000000;
  // Realized income September from verified invoices
  const realizedIncome = 6500000;
  const progressPercent = Math.round((realizedIncome / targetIncome) * 100);

  // Sample micro-bar heights for the pink bento card
  const barSurges = [40, 65, 30, 85, 95, 70, 100, 80];

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* 1. HERO HEADLINE (Matching Jobforge: Leading Italic + Bold Grotesk + Avatar Stack) */}
      <div className="pt-2 pb-1 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight">
              <span className="lead-italic font-normal mr-2">Fokus</span>
              Satu-Satu, Cuan Ngalir!
              <span className="inline-flex items-center ml-3 -space-x-1.5 align-middle">
                <span className="w-8 h-8 rounded-full bg-[#fdecd2] border-2 border-white flex items-center justify-center text-xs shadow-sm">⚡</span>
                <span className="w-8 h-8 rounded-full bg-[#fce7f3] border-2 border-white flex items-center justify-center text-xs shadow-sm">💰</span>
                <span className="w-8 h-8 rounded-full bg-[#e0f2fe] border-2 border-white flex items-center justify-center text-xs shadow-sm">🚀</span>
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-800 max-w-2xl mt-1.5 leading-relaxed font-medium">
              Santai aja bro, jangan overthinking. Beresin 1 tugas berbayar hari ini, tagih DP-nya, dan biar sistem ini yang jagain sirkulasi kas lo!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onSelectTab('nextgo');
              }}
              className="pill-black text-xs font-semibold px-5 py-2.5 shadow-md flex items-center gap-2"
            >
              <span>Langkah Paling Cuan 🚀</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onSelectTab('money');
              }}
              className="pill-white text-xs font-semibold px-5 py-2.5 shadow-sm"
            >
              Cek Dompet & Rekening
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE HERO BENTO TRIO + 1 (Exact Jobforge Bento Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* BENTO CARD 1: APRICOT (Liquid Operating Cash) */}
        <div 
          onClick={() => {
            soundManager.playClick();
            onSelectTab('money');
          }}
          className="bento-card bento-apricot p-6 rounded-[28px] cursor-pointer group flex flex-col justify-between min-h-[190px] border border-[#fed7aa] shadow-sm hover:shadow-md transition-all"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-900 font-bold">
                01 // SALDO KAS AMAN
              </span>
              <span className="text-[10px] font-mono bg-white/80 px-2.5 py-0.5 rounded-full text-zinc-800 font-bold border border-black/5">
                LIVE
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#111111] font-mono">
                {formatShortRupiah(totalLiquid)}
              </div>
              <p className="text-xs text-zinc-900 font-bold mt-1 font-medium leading-snug">
                Total uang cair di 7 rekening (Mandiri {mandiriBalanceText} + e-wallet)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-black/10">
            <span className="text-[11px] font-mono text-zinc-700 font-medium">
              Aman +{formatShortRupiah(surplusFloor)} di atas batas minimal
            </span>
            <div className="btn-circle-arrow group-hover:bg-[#111111] group-hover:text-white transition-all">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* BENTO CARD 2: BUBBLEGUM PINK with MICRO BAR CHART (Realisasi Profit September) */}
        <div 
          onClick={() => {
            soundManager.playClick();
            onSelectTab('money');
          }}
          className="bento-card bento-pink p-6 rounded-[28px] cursor-pointer group flex flex-col justify-between min-h-[190px] border border-[#f472b6] shadow-sm hover:shadow-md transition-all"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#9d174d]">
                PROFIT SEPTEMBER
              </span>
              <span className="text-[10px] font-mono bg-white/80 px-2 py-0.5 rounded-full text-[#be185d] font-bold border border-[#fbcfe8]">
                {progressPercent}%
              </span>
            </div>
            <div className="mt-2">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#111111] font-mono">
                {formatShortRupiah(realizedIncome)}
              </div>
              <p className="text-xs text-[#be185d] font-medium leading-snug">
                Udah masuk Rp6,5M dari target Rp10 Juta (Kurang 3,5jt lagi bro!)
              </p>
            </div>
          </div>

          {/* Micro Vertical Bar Chart (Iconic from Jobforge Pink Card!) */}
          <div className="pt-2">
            <div className="flex items-end justify-between gap-1.5 h-10 px-1 bg-white/40 rounded-xl p-1.5 border border-white/60">
              {barSurges.map((val, idx) => (
                <div 
                  key={idx}
                  className="flex-1 rounded-full bg-[#db2777] transition-all duration-500 hover:bg-[#9d174d]"
                  style={{ height: `${val}%` }}
                  title={`Surge #${idx + 1}: ${val}%`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* BENTO CARD 3: POWDER SKY BLUE (Stacked Telemetry Badges) */}
        <div 
          onClick={() => {
            soundManager.playClick();
            onSelectTab('waiting');
          }}
          className="bento-card bento-blue p-6 rounded-[28px] cursor-pointer group flex flex-col justify-between min-h-[190px] border border-[#bae6fd] shadow-sm hover:shadow-md transition-all"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#075985]">
                UANG OTW MASUK
              </span>
              <span className="text-[10px] font-mono bg-white/80 px-2 py-0.5 rounded-full text-[#0369a1] font-bold border border-[#bae6fd]">
                OTW
              </span>
            </div>

            {/* Stacked Telemetry Badges like in Jobforge Blue Card */}
            <div className="space-y-1.5 mt-3 font-mono">
              <div className="flex items-center justify-between bg-white/70 px-3 py-1 rounded-xl text-xs border border-white/80">
                <span className="text-zinc-800 font-semibold">Duit Lagi Ditunggu:</span>
                <strong className="text-[#0369a1] font-bold">Rp4.000.000</strong>
              </div>
              <div className="flex items-center justify-between bg-white/70 px-3 py-1 rounded-xl text-xs border border-white/80">
                <span className="text-zinc-600">Nafas Kas (Runway):</span>
                <strong className="text-[#111111] font-bold">~2.2 Bulan</strong>
              </div>
              <div className="flex items-center justify-between bg-white/70 px-3 py-1 rounded-xl text-xs border border-white/80">
                <span className="text-zinc-600">Batas Aman Dompet:</span>
                <strong className="text-emerald-700 font-bold">Rp4.000.000</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/5">
            <span className="text-[11px] font-mono text-[#0369a1] font-semibold">
              Cek 6 Klien yang Lagi Nahan Duit
            </span>
            <div className="btn-circle-arrow group-hover:bg-[#111111] group-hover:text-white transition-all">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* BENTO CARD 4: SOFT LIME GREEN (Execution Flow & Golden Move) */}
        <div 
          onClick={() => {
            soundManager.playClick();
            onSelectTab('nextgo');
          }}
          className="bento-card bento-lime p-6 rounded-[28px] cursor-pointer group flex flex-col justify-between min-h-[190px] border border-[#d9f99d] shadow-sm hover:shadow-md transition-all"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#14532d]">
                ACTION HARI INI
              </span>
              <span className="text-[10px] font-mono bg-white/80 px-2 py-0.5 rounded-full text-[#3f6212] font-bold border border-[#d9f99d]">
                ACTIVE
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold tracking-tight text-[#111111]">
                Azharuna & KAEL
              </div>
              <p className="text-xs text-zinc-900 font-medium mt-1 leading-relaxed">
                Desain Logo Azharuna (Lunas) + Finishing Konfigurasi POS Kasir KAEL
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-black/10">
            <span className="text-[11px] font-mono text-[#3f6212] font-bold">
              Fokus: 75 Menit Aja
            </span>
            <div className="btn-circle-arrow group-hover:bg-[#111111] group-hover:text-white transition-all">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. CLIENT / PARTNER MONOCHROME LOGOS STRIP */}
      <div className="py-2 px-4 rounded-2xl bg-white border border-zinc-200/70 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500">
        <span className="text-[10px] uppercase font-bold text-zinc-700 font-bold tracking-wider">
          PROJECT AKTIF & SELESAI:
        </span>
        <div className="flex flex-wrap items-center gap-5 sm:gap-8 font-semibold text-zinc-700">
          <span className="hover:text-black transition-colors cursor-default">LOGO AZHARUNA</span>
          <span className="hover:text-black transition-colors cursor-default">KAEL FINISHING</span>
          <span className="hover:text-black transition-colors cursor-default">KOMISI PEDULI INTERAKSI</span>
          <span className="hover:text-black transition-colors cursor-default">LMS AL MADROJ</span>
          <span className="hover:text-black transition-colors cursor-default text-emerald-700">✓ UMI ELLY (TESTING)</span>
          <span className="hover:text-black transition-colors cursor-default text-emerald-700">✓ DREAMMECCA (DONE)</span>
          <span className="hover:text-black transition-colors cursor-default text-emerald-700">✓ BARBER (LUNAS)</span>
        </div>
      </div>

      {/* 4. "RECOMMENDED MOVES" TAG CLOUD (Exact from Jobforge "Recommended Jobs" Pill Cloud) */}
      <div className="space-y-2.5 text-center pt-2">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-extrabold text-[#111111] tracking-tight">
            Mau Mulai dari Mana Bro?
          </h3>
          <p className="text-xs text-zinc-700 font-medium">
            Tinggal klik salah satu, gak usah bingung mikir langkah awal:
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-xs">
          <button
            onClick={() => onSelectTab('nextgo')}
            className="pill-black px-4 py-2 hover:scale-105 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>🚀 Logo Azharuna & KAEL (Aktif Dikerjakan)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectTab('waiting')}
            className="pill-white px-4 py-2 hover:scale-105 transition-all shadow-sm"
          >
            Umi Elly (Sisa Testing Modul)
          </button>

          <button
            onClick={() => onSelectTab('lanes')}
            className="pill-white px-4 py-2 hover:scale-105 transition-all shadow-sm"
          >
            Rancangan Komisi Peduli Interaksi
          </button>

          <button
            onClick={() => onSelectTab('lanes')}
            className="pill-black px-4 py-2 hover:scale-105 transition-all shadow-sm"
          >
            Rancangan LMS Al Madroj
          </button>

          <button
            onClick={() => onSelectTab('today')}
            className="pill-white px-4 py-2 hover:scale-105 transition-all shadow-sm"
          >
            Checklist 5 Target Hari Ini
          </button>

          <button
            onClick={() => onSelectTab('deepwork')}
            className="pill-black px-4 py-2 hover:scale-105 transition-all shadow-sm flex items-center gap-1"
          >
            <span>Pomodoro Focus (Gamma 40Hz)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
