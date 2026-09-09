import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Flame, 
  ArrowUpRight, 
  Target, 
  Layers, 
  Zap, 
  ArrowRight
} from 'lucide-react';
import { TodayBlock } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface TodaySuperSmallViewProps {
  todayBlocks: TodayBlock[];
  onToggleBlock: (id: string) => void;
  onStartFocus: (block: TodayBlock) => void;
  onStartMultiFocus?: (blocks: TodayBlock[]) => void;
}

export const TodaySuperSmallView: React.FC<TodaySuperSmallViewProps> = ({
  todayBlocks,
  onToggleBlock,
  onStartFocus,
  onStartMultiFocus
}) => {
  const [strategyMode, setStrategyMode] = useState<'single' | 'multi'>('single');
  const [selectedSingleId, setSelectedSingleId] = useState<string>(todayBlocks[0]?.id || 'tb-1');
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>(todayBlocks.filter(block => !block.isDone).slice(0, 2).map(block => block.id));

  const activeSingleBlock = todayBlocks.find(b => b.id === selectedSingleId) || todayBlocks[0];
  const activeMultiBlocks = todayBlocks.filter(b => selectedMultiIds.includes(b.id));
  const totalMultiMinutes = activeMultiBlocks.reduce((sum, b) => sum + (b.timeboxMinutes || 50), 0);

  const toggleMultiSelect = (id: string) => {
    soundManager.playClick();
    setSelectedMultiIds(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(item => item !== id) : prev)
        : [...prev, id]
    );
  };

  const handleSelectAllMulti = () => {
    soundManager.playClick();
    setSelectedMultiIds(todayBlocks.map(b => b.id));
  };

  return (
    <div className="space-y-5 font-sans animate-fade-in">
      
      {/* 1. STRATEGY MODE SWITCHER BANNER */}
      <div className="bento-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <h3 className="text-base font-extrabold text-[#111111] tracking-tight font-sans">
              <span className="lead-italic font-normal mr-1">Gaya Kerja</span> Lo Hari Ini
            </h3>
            <span className="sticker-pill sticker-lime text-[10px]">
              {strategyMode === 'single' ? ' FOKUS 1 HAL (ANTI MUMET)' : ' SIKAT BEBERAPA (MULTI-SPRINT)'}
            </span>
          </div>
          <p className="text-xs text-zinc-700 font-medium">
            Pilih satu tugas sampai beres, atau susun beberapa sprint yang dikerjakan berurutan.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => {
              soundManager.playClick();
              setStrategyMode('single');
            }}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 font-semibold ${
              strategyMode === 'single'
                ? 'pill-black shadow-md'
                : 'pill-white text-zinc-800 font-bold'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>1 Hal Dulu (Fokus Penuh)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setStrategyMode('multi');
            }}
            className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 font-semibold ${
              strategyMode === 'multi'
                ? 'pill-black shadow-md'
                : 'pill-white text-zinc-800 font-medium'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Beberapa Hal (Multi-Task)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODE 1: SINGLE FOCUS MODE (1 HAL DULU)
          ========================================================================= */}
      {strategyMode === 'single' && (
        <div className="space-y-4">
          
          {/* Active Single Focus Hero Stage */}
          {activeSingleBlock && (
            <div className="bento-card p-6 sm:p-7 space-y-4 border border-zinc-200/90 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="sticker-pill sticker-pink flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#be185d]" />
                    <span>WAKTU DIKUNCI </span>
                  </span>
                  <span className="sticker-pill sticker-blue text-[10px]">{activeSingleBlock.blockType.toUpperCase()}</span>
                </div>

                <span className="text-xs font-mono text-zinc-600 flex items-center gap-1 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Timebox: <strong className="text-black font-bold">{activeSingleBlock.timeboxMinutes} Menit</strong></span>
                </span>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight font-sans">
                  {activeSingleBlock.projectName}
                </h4>
                <div className="p-3.5 rounded-2xl bg-[#fef9c3]/60 border border-[#fef08a] text-xs font-mono text-zinc-800 space-y-1">
                  <span className="text-[#713f12] font-black block uppercase tracking-wide">
                     LANGKAH KONKRIT YANG HARUS LO BIKIN SEKARANG:
                  </span>
                  <p className="text-sm font-sans font-medium text-zinc-950 font-bold leading-relaxed">
                    {activeSingleBlock.action}
                  </p>
                </div>

                {activeSingleBlock.rule && (
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs font-mono text-zinc-600">
                    <span className="text-[#14532d] font-bold"> ATURAN BIAR CEPET BERES:</span> {activeSingleBlock.rule}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-zinc-800 font-medium">
                  Tutup dulu sosmed & tab lain bro. Kunci fokus ke tugas ini, abis itu lo bebas istirahat!
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onToggleBlock(activeSingleBlock.id);
                      if (!activeSingleBlock.isDone) {
                        soundManager.playCompletionChime();
                        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-mono font-semibold transition-all ${
                      activeSingleBlock.isDone
                        ? 'bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d]'
                        : 'pill-white text-zinc-700'
                    }`}
                  >
                    {activeSingleBlock.isDone ? ' Sudah Selesai' : 'Tandai Beres'}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onStartFocus(activeSingleBlock);
                    }}
                    className="pill-black text-xs font-bold flex items-center gap-2 shadow-md"
                  >
                    <span>Mulai Focus Lock ({activeSingleBlock.timeboxMinutes}m)</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Switch to other Single Tasks (Fanned-out Bento Pastel Cards!) */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                // EXPLORE TASKS • GANTI FOKUS KE KARTU LAIN:
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {todayBlocks.length} Triad Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {todayBlocks.map((block, idx) => {
                const isSelected = block.id === selectedSingleId;
                const pastelThemes = [
                  { bg: 'bento-apricot', border: 'border-[#fed7aa]', tag: 'sticker-apricot', accent: 'text-[#c2410c]' },
                  { bg: 'bento-blue', border: 'border-[#bae6fd]', tag: 'sticker-blue', accent: 'text-[#0369a1]' },
                  { bg: 'bento-pink', border: 'border-[#fbcfe8]', tag: 'sticker-pink', accent: 'text-[#be185d]' },
                  { bg: 'bento-lime', border: 'border-[#d9f99d]', tag: 'sticker-lime', accent: 'text-[#3f6212]' },
                ];
                const theme = pastelThemes[idx % pastelThemes.length];

                return (
                  <div
                    key={block.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedSingleId(block.id);
                    }}
                    className={`bento-card ${theme.bg} p-5 rounded-[24px] border ${theme.border} cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[160px] ${
                      isSelected ? 'ring-2 ring-[#111111] shadow-lg -translate-y-1' : 'hover:-translate-y-1 hover:shadow-md'
                    } ${block.isDone ? 'opacity-50' : ''}`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`sticker-pill ${theme.tag} text-[9px] py-0.5 px-2`}>
                          {block.blockType}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-white/70 px-2 py-0.5 rounded-full text-zinc-800">
                          {block.timeboxMinutes}m
                        </span>
                      </div>
                      <h5 className="text-sm font-extrabold text-[#111111] line-clamp-1">
                        {block.projectName}
                      </h5>
                      <p className="text-[11px] text-zinc-700 line-clamp-2 leading-relaxed">
                        {block.action}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-black/5 flex items-center justify-between mt-2">
                      <span className={`text-[10px] font-mono font-bold ${theme.accent}`}>
                        {isSelected ? '● LOCKED' : 'Pilih Task'}
                      </span>
                      <div className="btn-circle-arrow w-7 h-7">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          MODE 2: MULTI-SPRINT BATCH MODE (BEBERAPA HAL SEKALIGUS)
          ========================================================================= */}
      {strategyMode === 'multi' && (
        <div className="space-y-4">
          
          {/* Multi-Sprint Batch Cockpit Bar */}
          <div className="bento-card p-6 space-y-4 border border-zinc-200/90 shadow-md">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="sticker-pill sticker-yellow flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#854d0e]" />
                  <span>PARALLEL MULTI-SPRINT BATCH</span>
                </span>
                <span className="text-xs font-mono font-bold text-zinc-800 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                  {activeMultiBlocks.length} Task Dipilih ({totalMultiMinutes}m Total)
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <button
                  onClick={handleSelectAllMulti}
                  className="pill-white text-xs text-zinc-700"
                >
                  Pilih Semua ({todayBlocks.length} Task)
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    if (onStartMultiFocus) {
                      onStartMultiFocus(activeMultiBlocks);
                    } else if (activeMultiBlocks[0]) {
                      onStartFocus(activeMultiBlocks[0]);
                    }
                  }}
                  disabled={activeMultiBlocks.length === 0}
                  className="pill-black text-xs font-bold flex items-center gap-2 disabled:opacity-40 shadow-sm"
                >
                  <span>Jalankan Batch ({totalMultiMinutes}m)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Execution Sequence Flow */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-semibold">
                // URUTAN EKSEKUSI INTERLEAVED:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {activeMultiBlocks.map((b, idx) => (
                  <div 
                    key={b.id}
                    className="flex items-center gap-2 bg-zinc-50 border border-zinc-200/80 px-3 py-1.5 rounded-full text-xs font-mono"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#ecfccb] text-[#3f6212] font-bold text-[10px] flex items-center justify-center border border-[#d9f99d]">
                      {idx + 1}
                    </span>
                    <span className="text-[#111111] font-semibold">{b.projectName}</span>
                    <span className="text-zinc-500">({b.timeboxMinutes}m)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Cards with Multi-Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayBlocks.map((block, idx) => {
              const isSelected = selectedMultiIds.includes(block.id);
              const cardThemes = [
                { bg: 'bento-apricot', border: 'border-[#fed7aa]', tag: 'sticker-apricot' },
                { bg: 'bento-blue', border: 'border-[#bae6fd]', tag: 'sticker-blue' },
                { bg: 'bento-pink', border: 'border-[#fbcfe8]', tag: 'sticker-pink' },
                { bg: 'bento-lime', border: 'border-[#d9f99d]', tag: 'sticker-lime' },
              ];
              const theme = cardThemes[idx % cardThemes.length];

              return (
                <div
                  key={block.id}
                  onClick={() => toggleMultiSelect(block.id)}
                  className={`bento-card ${theme.bg} p-6 border ${theme.border} transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-[#111111] shadow-lg -translate-y-0.5'
                      : block.isDone
                      ? 'opacity-40'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="h-full flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isSelected 
                              ? 'bg-[#111111] border-[#111111] text-white' 
                              : 'border-black/20 bg-white/60'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className={`sticker-pill ${theme.tag} text-[10px]`}>
                            {block.blockType.toUpperCase()}
                          </span>
                        </div>
                        
                        <span className="text-[11px] font-mono font-bold text-zinc-700 flex items-center gap-1 bg-white/70 px-2.5 py-0.5 rounded-full border border-black/5">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{block.timeboxMinutes}m</span>
                        </span>
                      </div>

                      <div>
                        <h4 className={`text-base font-extrabold tracking-tight ${
                          block.isDone ? 'line-through text-zinc-400' : 'text-[#111111]'
                        }`}>
                          {block.projectName}
                        </h4>
                        <p className="text-xs mt-1.5 leading-relaxed text-zinc-700 font-sans">
                          {block.action}
                        </p>
                      </div>

                      {block.rule && (
                        <div className="p-2.5 rounded-2xl bg-white/60 border border-black/5 text-[11px] font-mono text-zinc-700">
                          <span className="text-[#15803d] font-bold">// RULE:</span> {block.rule}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-black/5 text-xs font-mono">
                      <span className={isSelected ? 'text-[#15803d] font-bold' : 'text-zinc-600'}>
                        {isSelected ? ' Masuk dalam Batch Sprint' : '+ Klik untuk tambahkan'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                          onStartFocus(block);
                        }}
                        className="text-zinc-800 hover:text-black flex items-center gap-1 font-semibold"
                      >
                        <span>Fokus ini saja</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
