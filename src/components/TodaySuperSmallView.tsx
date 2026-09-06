import React, { useState } from 'react';
import { 
  Play, 
  Check, 
  Clock, 
  Flame, 
  ArrowUpRight, 
  Sparkles, 
  Target, 
  Layers, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Circle
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
        ? (prev.length > 1 ? prev.filter(item => item !== id) : prev)
        : [...prev, id]
    );
  };

  const handleSelectAllMulti = () => {
    soundManager.playClick();
    setSelectedMultiIds(todayBlocks.map(b => b.id));
  };

  return (
    <div className="space-y-5 font-sans select-none animate-fade-in">
      
      {/* 1. STRATEGY MODE SWITCHER BANNER */}
      <div className="figma-shell">
        <div className="figma-core p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 bg-[#fffdf5]">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#305d46] animate-pulse" />
              <h3 className="text-sm font-bold text-[#252520] tracking-tight">
                Hari ini mau ngerjain apa dulu?
              </h3>
              <span className="dev-tag text-[9px]">
                {strategyMode === 'single' ? 'MONOTASK_LOCK' : 'MULTI_SPRINT_BATCH'}
              </span>
            </div>
            <p className="text-xs text-[#59594f]">
              Pilih mode eksekusi: Fokus 1 hal sampai tuntas tanpa distraksi, atau batch beberapa hal sekaligus.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-[#eae5d8] p-1.5 rounded-2xl border border-[#ded7c8] font-mono text-xs">
            <button
              onClick={() => {
                soundManager.playClick();
                setStrategyMode('single');
              }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                strategyMode === 'single'
                  ? 'bg-[#292a24] text-[#fffdf5] font-bold shadow-sm'
                  : 'text-[#59594f] hover:text-[#252520] hover:bg-[#fffdf5]/60'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>1 Hal Dulu (Single Focus)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setStrategyMode('multi');
              }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                strategyMode === 'multi'
                  ? 'bg-[#292a24] text-[#fffdf5] font-bold shadow-sm'
                  : 'text-[#59594f] hover:text-[#252520] hover:bg-[#fffdf5]/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Beberapa Hal (Multi-Sprint)</span>
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
            <div className="figma-shell border-[#305d46]/30 shadow-md">
              <div className="figma-core p-5 sm:p-6 bg-[#fffdf5] space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded7c8] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="dev-tag-emerald flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#305d46]" />
                      <span>EXCLUSIVE MONOTASK LOCK</span>
                    </span>
                    <span className="dev-tag text-[9px]">{activeSingleBlock.blockType.toUpperCase()}</span>
                  </div>

                  <span className="text-xs font-mono text-[#59594f] flex items-center gap-1 bg-[#eae5d8] px-3 py-1 rounded-xl border border-[#ded7c8]">
                    <Clock className="w-3.5 h-3.5 text-[#59594f]" />
                    <span>Timebox: <strong className="text-[#252520] font-bold">{activeSingleBlock.timeboxMinutes} Menit</strong></span>
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-[#252520] tracking-tight">
                    {activeSingleBlock.projectName}
                  </h4>
                  <p className="text-sm text-[#252520] leading-relaxed max-w-3xl">
                    <span className="text-[#925f18] font-bold font-mono">Action Langkah Demi Langkah:</span> {activeSingleBlock.action}
                  </p>

                  {activeSingleBlock.rule && (
                    <div className="p-3 rounded-2xl bg-[#faf9f3] border border-[#ded7c8] text-xs font-mono text-[#59594f]">
                      <span className="text-[#305d46] font-bold">// ATURAN FOKUS:</span> {activeSingleBlock.rule}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#ded7c8] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#59594f] font-mono">
                    Tutup semua tab lain. Kunci pikiran ke 1 hal ini sampai timebox selesai.
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
                          ? 'bg-[#e2ecdc] text-[#305d46] border border-[#305d46]/30'
                          : 'bg-[#faf9f3] hover:bg-[#eae5d8] text-[#252520] border border-[#ded7c8]'
                      }`}
                    >
                      {activeSingleBlock.isDone ? 'Sudah Selesai' : 'Tandai Beres'}
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onStartFocus(activeSingleBlock);
                      }}
                      className="group pl-5 pr-3 py-2 dev-btn-primary text-xs font-bold flex items-center gap-2.5 shadow-md"
                    >
                      <span>Mulai Focus Lock ({activeSingleBlock.timeboxMinutes}m)</span>
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                        <ArrowUpRight className="w-3 h-3 text-[#fffdf5] stroke-[2.5]" />
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Quick Switch to other Single Tasks */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#59594f] px-1">
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
                        ? 'bg-[#fffdf5] border-[#292a24] shadow-md ring-1 ring-[#292a24]'
                        : block.isDone
                        ? 'bg-[#eae5d8]/40 border-[#ded7c8] opacity-50'
                        : 'bg-[#fffdf5] border-[#ded7c8] hover:border-[#928876] hover:bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="dev-tag text-[9px] py-0">{block.blockType}</span>
                      <span className="text-[10px] font-mono text-[#59594f]">{block.timeboxMinutes}m</span>
                    </div>
                    <h5 className={`text-xs font-bold truncate ${isSelected ? 'text-[#252520]' : 'text-[#252520]'}`}>
                      {block.projectName}
                    </h5>
                    <p className="text-[11px] text-[#59594f] line-clamp-2 leading-relaxed">
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
          <div className="figma-shell border-[#b87e2b]/30">
            <div className="figma-core p-5 bg-[#fffdf5] space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded7c8] pb-3">
                <div className="flex items-center gap-2">
                  <span className="dev-tag-amber flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#925f18]" />
                    <span>PARALLEL MULTI-SPRINT BATCH</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-[#252520] bg-[#eae5d8] px-2.5 py-1 rounded-lg border border-[#ded7c8]">
                    {activeMultiBlocks.length} Task Dipilih ({totalMultiMinutes}m Total)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllMulti}
                    className="px-3 py-1.5 rounded-xl bg-[#faf9f3] hover:bg-[#eae5d8] text-[#252520] text-xs font-mono border border-[#ded7c8]"
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
                    className="group pl-4 pr-3 py-1.5 dev-btn-primary text-xs font-bold flex items-center gap-2 disabled:opacity-40 shadow-sm"
                  >
                    <span>Jalankan Batch ({totalMultiMinutes}m)</span>
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-3 h-3 text-[#fffdf5] stroke-[2.5]" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Execution Sequence Flow */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#59594f] uppercase tracking-wider block">
                  Urutan Eksekusi Interleaved:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {activeMultiBlocks.map((b, idx) => (
                    <div 
                      key={b.id}
                      className="flex items-center gap-2 bg-[#faf9f3] border border-[#ded7c8] px-3 py-1.5 rounded-xl text-xs font-mono"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#fdf3d8] text-[#925f18] font-bold text-[10px] flex items-center justify-center border border-[#b87e2b]/30">
                        {idx + 1}
                      </span>
                      <span className="text-[#252520] font-semibold">{b.projectName}</span>
                      <span className="text-[#59594f]">({b.timeboxMinutes}m)</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Cards with Multi-Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayBlocks.map((block) => {
              const isSelected = selectedMultiIds.includes(block.id);

              return (
                <div
                  key={block.id}
                  onClick={() => toggleMultiSelect(block.id)}
                  className={`figma-shell transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-[#292a24] shadow-md ring-1 ring-[#292a24]'
                      : block.isDone
                      ? 'opacity-40'
                      : 'hover:border-[#928876]'
                  }`}
                >
                  <div className="figma-core p-5 h-full flex flex-col justify-between space-y-4 bg-[#fffdf5]">
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                            isSelected 
                              ? 'bg-[#292a24] border-[#292a24] text-[#fffdf5]' 
                              : 'border-[#ded7c8] bg-[#faf9f3]'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="dev-tag">
                            {block.blockType.toUpperCase()}
                          </span>
                        </div>
                        
                        <span className="text-[11px] font-mono text-[#59594f] flex items-center gap-1 bg-[#eae5d8] px-2 py-0.5 rounded-md border border-[#ded7c8]">
                          <Clock className="w-3 h-3 text-[#59594f]" />
                          <span>{block.timeboxMinutes}m</span>
                        </span>
                      </div>

                      <div>
                        <h4 className={`text-base font-bold tracking-tight ${
                          block.isDone ? 'line-through text-[#59594f]' : 'text-[#252520]'
                        }`}>
                          {block.projectName}
                        </h4>
                        <p className={`text-xs mt-1.5 leading-relaxed ${
                          block.isDone ? 'text-[#59594f]' : 'text-[#59594f]'
                        }`}>
                          {block.action}
                        </p>
                      </div>

                      {block.rule && (
                        <div className="p-2.5 rounded-xl bg-[#faf9f3] border border-[#ded7c8] text-[11px] font-mono text-[#59594f]">
                          <span className="text-[#305d46] font-bold">// RULE:</span> {block.rule}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#ded7c8] text-xs font-mono">
                      <span className={isSelected ? 'text-[#305d46] font-semibold' : 'text-[#59594f]'}>
                        {isSelected ? 'Masuk dalam Batch Sprint' : '+ Klik untuk tambahkan'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                          onStartFocus(block);
                        }}
                        className="text-[#59594f] hover:text-[#252520] flex items-center gap-1 font-medium"
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
