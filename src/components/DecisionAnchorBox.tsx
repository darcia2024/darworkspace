import React from 'react';
import { 
  Terminal,
  ArrowRight
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DecisionAnchorBoxProps {
  onSelectAction: (targetProject: string) => void;
}

export const DecisionAnchorBox: React.FC<DecisionAnchorBoxProps> = ({ onSelectAction }) => {
  return (
    <div className="dev-card p-5 sm:p-6 space-y-4 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-zinc-300 stroke-[1.75]" />
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Panduan Fokus Saat Kepala Penuh
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              // Urutan prioritas mutlak eksekusi:
            </p>
          </div>
        </div>
        <span className="dev-tag text-[9px]">DECISION_TREE</span>
      </div>

      {/* 3 Simple Rows */}
      <div className="space-y-2 text-xs">
        
        {/* Step 1: Paid Delivery */}
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.12] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-md bg-white text-zinc-950 font-mono font-bold text-[10px] flex items-center justify-center">01</span>
            <div>
              <span className="text-zinc-300">Ada client sudah bayar?</span>
              <p className="text-white font-semibold">→ Kerjain Zalvice Logo Bang Edo (Paid Rp1,2M)</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectAction('Zalvice Logo');
            }}
            className="px-3 py-1 dev-btn-primary text-xs font-semibold whitespace-nowrap"
          >
            Pilih →
          </button>
        </div>

        {/* Step 2: High-Ticket Delivery & Next DP */}
        <div className="p-3 rounded-xl bg-[#0a0a0f] border border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-md bg-[#181822] text-zinc-300 font-mono font-bold text-[10px] flex items-center justify-center border border-white/10">02</span>
            <div>
              <span className="text-zinc-400">Project besar sudah DP / tunggu kickoff?</span>
              <p className="text-zinc-200">→ Eksekusi Fase 0 Opening Barber (30 Agu) & Kickoff Termin 1 Umi Elly (Rp3M)</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectAction('Kasir Barber Underrated');
            }}
            className="px-3 py-1 dev-btn-secondary text-xs whitespace-nowrap"
          >
            Pilih →
          </button>
        </div>

        {/* Step 3: Product Setup */}
        <div className="p-3 rounded-xl bg-[#0a0a0f] border border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-md bg-[#181822] text-zinc-300 font-mono font-bold text-[10px] flex items-center justify-center border border-white/10">03</span>
            <div>
              <span className="text-zinc-400">Core Product SaaS?</span>
              <p className="text-zinc-200">→ Setting role kasir/owner & QRIS KAEL Core</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectAction('Setting KAEL');
            }}
            className="px-3 py-1 dev-btn-secondary text-xs whitespace-nowrap"
          >
            Pilih →
          </button>
        </div>

      </div>

    </div>
  );
};
