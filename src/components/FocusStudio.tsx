import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Headphones,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { TodayBlock } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface FocusStudioProps {
  todayBlocks: TodayBlock[];
  activeBlock: TodayBlock | null;
  setActiveBlock: (block: TodayBlock | null) => void;
  onCompleteBlock: (id: string) => void;
}

export const FocusStudio: React.FC<FocusStudioProps> = ({
  todayBlocks,
  activeBlock,
  setActiveBlock,
  onCompleteBlock
}) => {
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(50);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundMode, setSoundMode] = useState<'none' | 'gamma40' | 'brown'>('none');
  const [completedCount, setCompletedCount] = useState(0);
  const [showTaskPicker, setShowTaskPicker] = useState(!activeBlock);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeBlock && activeBlock.timeboxMinutes) {
      setSessionDurationMinutes(activeBlock.timeboxMinutes);
      setTimeLeftSeconds(activeBlock.timeboxMinutes * 60);
      setShowTaskPicker(false);
    }
  }, [activeBlock]);

  const selectDuration = (mins: number) => {
    soundManager.playClick();
    setIsRunning(false);
    setSessionDurationMinutes(mins);
    setTimeLeftSeconds(mins * 60);
  };

  const handleSelectBlock = (block: TodayBlock) => {
    soundManager.playClick();
    setActiveBlock(block);
    setSessionDurationMinutes(block.timeboxMinutes || 50);
    setTimeLeftSeconds((block.timeboxMinutes || 50) * 60);
    setShowTaskPicker(false);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            soundManager.playCompletionChime();
            soundManager.stopNoise();
            setSoundMode('none');
            setCompletedCount((c) => c + 1);
            
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ffffff', '#a1a1aa', '#52525b']
            });

            if (activeBlock) {
              onCompleteBlock(activeBlock.id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, activeBlock]);

  const toggleRunning = () => {
    soundManager.playClick();
    if (!isRunning) {
      if (soundMode === 'gamma40') soundManager.startGammaFocus();
      else if (soundMode === 'brown') soundManager.startBrownNoise();
    } else {
      soundManager.stopNoise();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    soundManager.playClick();
    setIsRunning(false);
    soundManager.stopNoise();
    setTimeLeftSeconds(sessionDurationMinutes * 60);
  };

  const handleSoundChange = (mode: 'none' | 'gamma40' | 'brown') => {
    soundManager.playClick();
    setSoundMode(mode);
    if (mode === 'none') {
      soundManager.stopNoise();
    } else if (mode === 'gamma40') {
      soundManager.startGammaFocus();
    } else if (mode === 'brown') {
      soundManager.startBrownNoise();
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((sessionDurationMinutes * 60 - timeLeftSeconds) / (sessionDurationMinutes * 60)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans select-none animate-fade-in pb-12">
      
      {/* 1. STEP 1: TASK SELECTION STAGE (Always prominent when opening Focus Studio) */}
      <div className="figma-shell">
        <div className="figma-core p-5 sm:p-6 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Pilih Task yang Mau Lo Kunci untuk Deep Work Ini:
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-normal">
                Pilih salah satu tugas dari Triad hari ini untuk mengunci timebox dan instruksi langkah demi langkah.
              </p>
            </div>

            {activeBlock && (
              <span className="dev-tag-emerald flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span>LOCKED: {activeBlock.projectName}</span>
              </span>
            )}
          </div>

          {/* 4 Interactive Task Cards to Pick From */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {todayBlocks.map((block) => {
              const isSelected = activeBlock?.id === block.id;

              return (
                <button
                  key={block.id}
                  onClick={() => handleSelectBlock(block)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 space-y-2 relative group ${
                    isSelected
                      ? 'bg-gradient-to-br from-white/10 to-white/5 border-emerald-400/80 ring-2 ring-emerald-400/30 scale-[1.02] shadow-xl'
                      : block.isDone
                      ? 'bg-[#060609]/60 border-white/[0.04] opacity-40'
                      : 'bg-[#060609] border-white/[0.06] hover:border-white/20 hover:bg-[#0c0c14] hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="dev-tag text-[9px] py-0">{block.blockType}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{block.timeboxMinutes}m</span>
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                      {block.projectName}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {block.action}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono">
                    <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-zinc-500 group-hover:text-zinc-300'}>
                      {isSelected ? '✓ Terkunci di Timer' : 'Pilih Task Ini →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 2. STEP 2: ACTIVE FOCUS FLOW COCKPIT */}
      <div className="figma-shell">
        <div className="figma-core p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col items-center text-center space-y-6">
            
            {/* Active Lock Info Card */}
            {activeBlock ? (
              <div className="w-full max-w-xl p-4 rounded-2xl bg-[#060609] border border-white/10 space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="dev-tag-emerald text-[9px] flex items-center gap-1">
                    <Flame className="w-3 h-3 text-emerald-400" />
                    <span>SESI AKTIF: {activeBlock.projectName}</span>
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{activeBlock.timeboxMinutes}m Timebox</span>
                </div>
                <p className="text-sm font-bold text-white">{activeBlock.action}</p>
                {activeBlock.rule && (
                  <p className="text-xs text-zinc-400 font-mono">// Aturan: {activeBlock.rule}</p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
                ⚡ Belum ada task yang dikunci. Silakan klik salah satu task di atas untuk memulai deep work terarah.
              </div>
            )}

            {/* Circular Timer Ring */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
                <circle
                  cx="120"
                  cy="120"
                  r="96"
                  className="stroke-zinc-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="96"
                  className="stroke-white transition-all duration-1000 ease-linear shadow-glow-white"
                  strokeWidth="6"
                  strokeDasharray={603.2}
                  strokeDashoffset={603.2 - (603.2 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-6xl sm:text-7xl font-extrabold font-mono text-white tracking-tighter">
                  {formatTime(timeLeftSeconds)}
                </span>
                <span className="text-[10px] text-zinc-400 mt-2 uppercase tracking-widest font-mono font-bold">
                  {isRunning ? '🟢 FLOW_STATE_ACTIVE' : '⚪ READY_TO_LOCK'}
                </span>
              </div>
            </div>

            {/* Duration Presets */}
            <div className="flex items-center gap-1.5 bg-[#060609] p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
              {[25, 45, 50, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => selectDuration(mins)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    sessionDurationMinutes === mins && !isRunning
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={resetTimer}
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (!activeBlock && todayBlocks[0]) {
                    handleSelectBlock(todayBlocks[0]);
                  }
                  toggleRunning();
                }}
                className={`px-10 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl ${
                  isRunning
                    ? 'bg-amber-400 hover:bg-amber-300 text-black'
                    : 'dev-btn-primary'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Flow</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Mulai Deep Work ({sessionDurationMinutes}m)</span>
                  </>
                )}
              </button>

              {activeBlock && (
                <button
                  onClick={() => {
                    soundManager.playCompletionChime();
                    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                    onCompleteBlock(activeBlock.id);
                  }}
                  className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"
                  title="Tandai Task Ini Beres"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>

            {/* Audio Focus Waves */}
            <div className="pt-4 border-t border-white/5 w-full max-w-sm flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Headphones className="w-4 h-4 text-zinc-400" />
                <span>Audio Wave:</span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs">
                <button
                  onClick={() => handleSoundChange('none')}
                  className={`px-3 py-1 rounded-xl text-[11px] transition-all ${
                    soundMode === 'none' ? 'bg-white text-black font-bold' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Off
                </button>
                <button
                  onClick={() => handleSoundChange('gamma40')}
                  className={`px-3 py-1 rounded-xl text-[11px] transition-all ${
                    soundMode === 'gamma40' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Gamma 40Hz
                </button>
                <button
                  onClick={() => handleSoundChange('brown')}
                  className={`px-3 py-1 rounded-xl text-[11px] transition-all ${
                    soundMode === 'brown' ? 'bg-amber-400 text-black font-bold' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Brown Noise
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
