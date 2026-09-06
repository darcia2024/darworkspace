import React from 'react';
import { 
  Terminal,
  ArrowUpRight
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DecisionAnchorBoxProps {
  onSelectAction: (targetProject: string) => void;
}

export const DecisionAnchorBox: React.FC<DecisionAnchorBoxProps> = ({ onSelectAction }) => {
  return (
    <div className="bento-card p-6 space-y-4 border border-zinc-200/90 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-[#111111] stroke-[2]" />
          <div>
            <h3 className="text-base font-extrabold text-[#111111] tracking-tight font-sans">
              <span className="lead-italic font-normal">Kepala Lo Penuh?</span> Ikutin Urutan Ini Bro!
            </h3>
            <p className="text-xs text-zinc-700 font-medium">
              Gak usah pusing milih, tinggal sikat dari nomor 1 ke bawah:
            </p>
          </div>
        </div>
        <span className="sticker-pill sticker-lime text-[9px]">DECISION_TREE</span>
      </div>

      {/* 3 Simple Rows as Bento Pods */}
      <div className="space-y-3 text-xs">
        
        {/* Step 1: Active DP Delivery */}
        <div className="bento-card bento-apricot p-4 rounded-[20px] border border-[#fed7aa] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#111111] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">01</span>
            <div>
              <span className="text-zinc-800 font-semibold text-[11px]">Langkah 1: Project ber-DP & paling cepet cairin duit</span>
              <p className="text-black font-extrabold text-sm font-sans">Sprint LMS Umi Elly → Langsung Buka Tagihan Termin 2 (+Rp2 Juta!)</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectAction('Umi Elly');
            }}
            className="btn-circle-arrow w-9 h-9 shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Step 2: Clean Desk & Handover */}
        <div className="bento-card bento-blue p-4 rounded-[20px] border border-[#bae6fd] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-white text-zinc-800 font-mono font-bold text-xs flex items-center justify-center border border-black/5 shadow-xs">02</span>
            <div>
              <span className="text-zinc-800 font-semibold text-[11px]">Langkah 2: Tuntaskan sisa utang kerjaan biar pikiran lega</span>
              <p className="text-black font-extrabold text-sm font-sans">Serah Terima Resmi DreamMecca → Pikiran 100% Plong Tanpa Beban</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectAction('DreamMecca');
            }}
            className="btn-circle-arrow w-9 h-9 shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Step 3: Scale MRR */}
        <div className="bento-card bento-pink p-4 rounded-[20px] border border-[#fbcfe8] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-white text-zinc-800 font-mono font-bold text-xs flex items-center justify-center border border-black/5 shadow-xs">03</span>
            <div>
              <span className="text-zinc-800 font-semibold text-[11px]">Langkah 3: Bangun mesin software penghasil uang pasif</span>
              <p className="text-black font-extrabold text-sm font-sans">Bungkus Demo KAEL POS SaaS → Siap Jual Langganan Tiap Bulan</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectAction('Setting KAEL');
            }}
            className="btn-circle-arrow w-9 h-9 shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
