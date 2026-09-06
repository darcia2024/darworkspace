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
    <div className="figma-shell">
      <div className="figma-core p-5 sm:p-6 space-y-4 font-sans bg-[#fffdf5]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ded7c8] pb-3">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-[#252520] stroke-[1.75]" />
            <div>
              <h3 className="text-sm font-semibold text-[#252520] tracking-tight">
                Panduan Fokus Saat Kepala Penuh
              </h3>
              <p className="text-[11px] text-[#59594f] font-mono">
                // Urutan prioritas mutlak eksekusi:
              </p>
            </div>
          </div>
          <span className="dev-tag text-[9px]">DECISION_TREE</span>
        </div>

        {/* 3 Simple Rows */}
        <div className="space-y-2 text-xs">
          
          {/* Step 1: Active DP Delivery */}
          <div className="p-3 rounded-xl bg-[#faf9f3] border border-[#ded7c8] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-[#292a24] text-[#fffdf5] font-mono font-bold text-[10px] flex items-center justify-center">01</span>
              <div>
                <span className="text-[#59594f]">Project aktif ber-DP & momentum tinggi?</span>
                <p className="text-[#252520] font-semibold">Sprint Modul 1 LMS Umi Elly Azhariyah (Buka Termin 2 +Rp2M)</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onSelectAction('Umi Elly');
              }}
              className="px-3.5 py-1.5 dev-btn-primary text-xs font-semibold whitespace-nowrap shadow-sm"
            >
              Pilih
            </button>
          </div>

          {/* Step 2: Clean Desk & Handover */}
          <div className="p-3 rounded-xl bg-[#faf9f3] border border-[#ded7c8] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-[#eae5d8] text-[#252520] font-mono font-bold text-[10px] flex items-center justify-center border border-[#ded7c8]">02</span>
              <div>
                <span className="text-[#59594f]">Project lunas butuh final handover?</span>
                <p className="text-[#252520] font-semibold">Final Polish & Serah Terima DreamMecca (Bebas Utang Mental)</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onSelectAction('DreamMecca');
              }}
              className="px-3.5 py-1.5 dev-btn-secondary text-xs whitespace-nowrap"
            >
              Pilih
            </button>
          </div>

          {/* Step 3: Scale MRR */}
          <div className="p-3 rounded-xl bg-[#faf9f3] border border-[#ded7c8] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-[#eae5d8] text-[#252520] font-mono font-bold text-[10px] flex items-center justify-center border border-[#ded7c8]">03</span>
              <div>
                <span className="text-[#59594f]">Core Product SaaS untuk Recurring MRR?</span>
                <p className="text-[#252520] font-semibold">Repackage Demo Multi-Tenant & Role Kasir KAEL POS</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onSelectAction('Setting KAEL');
              }}
              className="px-3.5 py-1.5 dev-btn-secondary text-xs whitespace-nowrap"
            >
              Pilih
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
