import React, { useState } from 'react';
import { 
  Play, 
  Check, 
  Clock, 
  Terminal, 
  Flame, 
  ArrowUpRight, 
  Sparkles, 
  Target, 
  Layers, 
  CheckSquare, 
  Square,
  Zap,
  ArrowRight,
  ListOrdered
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
  // Strategy Mode: 'single' (1 Hal Dulu) vs 'multi' (Beberapa Hal Bersamaan)
  const [strategyMode, setStrategyMode] = useState<'single' | 'multi'>('single');
  
  // Single focus selected block
  const [selectedSingleId, setSelectedSingleId] = useState<string>(todayBlocks[0]?.id || 'tb-1');
  
  // Multi sprint selected block IDs
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>(['tb-1', 'tb-2']);

  const completedCount = todayBlocks.filter(b => b.isDone).length;
  const progressPercent = Math.round((completedCount / (todayBlocks.length || 4)) * 100);

  const activeSingleBlock = todayBlocks.find(b => b.id === selectedSingleId) || todayBlocks[0];
  const activeMultiBlocks = todayBlocks.filter(b => selectedMultiIds.includes(b.id));
  const totalMultiMinutes = activeMultiBlocks.reduce((sum, b) => sum + (b.timeboxMinutes || 50), 0);

  const toggleMultiSelect = (id: string) => {
    soundManager.playClick();
    setSelectedMultiIds(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(item => item !== id) : prev) // keep at least 1
        : [...prev, id]
    );
  };

  const handleSelectAllMulti = () => {
    soundManager.playClick();
    setSelectedMultiIds(todayBlocks.map(b => b.id));
  };

  return (
    <div className="space-y-5 font-sans select-none animate-fade-in">
      
      {/* 1. STRATEGY MODE SWITCHER BANNER (Figma Doppelrand) */}
      <div className="figma-shell">
        <div className="figma-core p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Hari ini mau ngerjain apa dulu?
              </h3>
              <span className="dev-tag text-[9px]">
                {strategyMode === 'single' ? 'MONOTASK_LOCK' : 'MULTI_SPRINT_BATCH'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Pilih mode eksekusi: Fokus 1 hal sampai tuntas tanpa distraksi, atau batch beberapa hal sekaligus.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
            <button
              onClick={() => {
                soundManager.playClick();
                setStrategyMode('single');
              }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                strategyMode === 'single'
                  ? 'bg-white text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>🎯 1 Hal Dulu (Single Focus)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setStrategyMode('multi');
              }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                strategyMode === 'multi'
                  ? 'bg-white text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>⚡ Beberapa Hal (Multi-Sprint)</span>
            </button>
          </div>

        </div>
      </div>

      {/* =========================================================================
          MODE 1: SINGLE FOCUS MODE (1 HAL DULU)
          ========================================================================= */}
      {strategyMode === 'single' && (
        <div className="space-y-4">
          
          {/* Active Single Focus Hero Stage */}
          {activeSingleBlock && (
            <div className="figma-shell border-emerald-500/30 ring-1 ring-emerald-500/20">
              <div className="figma-core p-5 sm:p-6 bg-gradient-to-br from-[#12121c] via-[#09090e] to-[#07070a] space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="dev-tag-emerald flex items-center gap-1">
                      <Flame className="w-3 h-3 text-emerald-400" />
                      <span>EXCLUSIVE MONOTASK LOCK</span>
                    </span>
                    <span className="dev-tag text-[9px]">{activeSingleBlock.blockType.toUpperCase()}</span>
                  </div>

                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 bg-black/40 px-3 py-1 rounded-xl border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Timebox: <strong className="text-white font-bold">{activeSingleBlock.timeboxMinutes} Menit</strong></span>
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {activeSingleBlock.projectName}
                  </h4>
                  <p className="text-sm text-zinc-200 leading-relaxed max-w-3xl">
                    <span className="text-amber-400 font-bold font-mono">⚡ Action Langkah Demi Langkah:</span> {activeSingleBlock.action}
                  </p>

                  {activeSingleBlock.rule && (
                    <div className="p-3 rounded-2xl bg-[#060609] border border-white/[0.06] text-xs font-mono text-zinc-300">
                      <span className="text-emerald-400 font-bold">// ATURAN FOKUS:</span> {activeSingleBlock.rule}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400 font-mono">
                    💡 Tutup semua tab lain. Kunci pikiran ke 1 hal ini sampai timebox selesai.
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
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                        activeSingleBlock.isDone
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#14141c] hover:bg-[#1a1a24] text-zinc-300 border border-white/10'
                      }`}
                    >
                      {activeSingleBlock.isDone ? '✓ Sudah Selesai' : 'Tandai Beres'}
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onStartFocus(activeSingleBlock);
                      }}
                      className="group pl-5 pr-3 py-2 dev-btn-primary text-xs font-bold flex items-center gap-2.5 shadow-lg shadow-white/5"
                    >
                      <span>Mulai Focus Lock ({activeSingleBlock.timeboxMinutes}m)</span>
                      <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                        <ArrowUpRight className="w-3 h-3 text-black stroke-[2.5]" />
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Quick Switch to other Single Tasks */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-zinc-400 px-1">
              Atau klik untuk ganti fokus ke tugas lain:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {todayBlocks.map((block) => {
                const isSelected = block.id === selectedSingleId;
                return (
                  <button
                    key={block.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedSingleId(block.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 space-y-1.5 ${
                      isSelected
                        ? 'bg-white/[0.08] border-white/40 ring-1 ring-white/20'
                        : block.isDone
                        ? 'bg-[#060609]/60 border-white/[0.04] opacity-40'
                        : 'bg-[#060609] border-white/[0.06] hover:border-white/20 hover:bg-[#0c0c14]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="dev-tag text-[9px] py-0">{block.blockType}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{block.timeboxMinutes}m</span>
                    </div>
                    <h5 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                      {block.projectName}
                    </h5>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {block.action}
                    </p>
                  </button>
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
          <div className="figma-shell border-amber-500/30 ring-1 ring-amber-500/20">
            <div className="figma-core p-5 bg-gradient-to-br from-[#16141c] via-[#09090e] to-[#07070a] space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <span className="dev-tag-amber flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>PARALLEL MULTI-SPRINT BATCH</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    {activeMultiBlocks.length} Task Dipilih ({totalMultiMinutes}m Total)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllMulti}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono border border-white/10"
                  >
                    Pilih Semua (4 Task)
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
                    className="group pl-4 pr-3 py-1.5 dev-btn-primary text-xs font-bold flex items-center gap-2 disabled:opacity-40"
                  >
                    <span>Jalankan Batch ({totalMultiMinutes}m)</span>
                    <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-3 h-3 text-black stroke-[2.5]" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Execution Sequence Flow */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Urutan Eksekusi Interleaved:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {activeMultiBlocks.map((b, idx) => (
                    <div 
                      key={b.id}
                      className="flex items-center gap-2 bg-[#060609] border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-white font-semibold">{b.projectName}</span>
                      <span className="text-zinc-500">({b.timeboxMinutes}m)</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* 4 Cards with Multi-Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayBlocks.map((block) => {
              const isSelected = selectedMultiIds.includes(block.id);

              return (
                <div
                  key={block.id}
                  onClick={() => toggleMultiSelect(block.id)}
                  className={`figma-shell transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-amber-400/40 ring-1 ring-amber-400/30'
                      : block.isDone
                      ? 'opacity-40'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`figma-core p-5 h-full flex flex-col justify-between space-y-4 ${
                    isSelected ? 'bg-gradient-to-br from-[#14141e] to-[#0a0a0f]' : ''
                  }`}>
                    
                    <div className="space-y-3">
                      {/* Checkbox Trigger Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                            isSelected 
                              ? 'bg-amber-400 border-amber-300 text-black' 
                              : 'border-white/20 bg-black/40'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="dev-tag">
                            {block.blockType.toUpperCase()}
                          </span>
                        </div>
                        
                        <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{block.timeboxMinutes}m</span>
                        </span>
                      </div>

                      {/* Project Title & Next Action */}
                      <div>
                        <h4 className={`text-base font-bold tracking-tight ${
                          block.isDone ? 'line-through text-zinc-500' : 'text-white'
                        }`}>
                          {block.projectName}
                        </h4>
                        <p className={`text-xs mt-1.5 leading-relaxed ${
                          block.isDone ? 'text-zinc-500' : 'text-zinc-300'
                        }`}>
                          {block.action}
                        </p>
                      </div>

                      {block.rule && (
                        <div className="p-2.5 rounded-xl bg-[#060609] border border-white/[0.05] text-[11px] font-mono text-zinc-400">
                          <span className="text-zinc-500">// RULE:</span> {block.rule}
                        </div>
                      )}
                    </div>

                    {/* Bottom Indicator */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-xs font-mono">
                      <span className={isSelected ? 'text-amber-300 font-semibold' : 'text-zinc-500'}>
                        {isSelected ? '✓ Masuk dalam Batch Sprint' : '+ Klik untuk tambahkan'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                          onStartFocus(block);
                        }}
                        className="text-zinc-400 hover:text-white flex items-center gap-1"
                      >
                        <span>Fokus ini saja →</span>
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
