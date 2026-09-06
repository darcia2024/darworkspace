import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Headphones,
  Check,
  Flame,
  Target,
  Clock,
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
              origin: { y: 0.6 }
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
      
      {/* 1. STEP 1: TASK SELECTION STAGE */}
      <div className="figma-shell">
        <div className="figma-core p-5 sm:p-6 space-y-4 bg-[#fffdf5]">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded7c8] pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#305d46]" />
                <h3 className="text-sm font-bold text-[#252520] tracking-tight">
                  Pilih Task yang Mau Lo Kunci untuk Deep Work Ini:
                </h3>
              </div>
              <p className="text-xs text-[#59594f] font-normal">
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
                      ? 'bg-[#fffdf5] border-[#292a24] ring-2 ring-[#292a24]/40 shadow-md scale-[1.02]'
                      : block.isDone
                      ? 'bg-[#eae5d8]/40 border-[#ded7c8] opacity-50'
                      : 'bg-[#faf9f3] border-[#ded7c8] hover:border-[#928876] hover:bg-[#fffdf5] hover:-translate-y-0.5 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="dev-tag text-[9px] py-0">{block.blockType}</span>
                    <span className="text-[10px] font-mono text-[#59594f]">{block.timeboxMinutes}m</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold truncate text-[#252520]">
                      {block.projectName}
                    </h4>
                    <p className="text-[11px] text-[#59594f] line-clamp-2 mt-0.5 leading-relaxed">
                      {block.action}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#ded7c8] flex items-center justify-between text-[10px] font-mono">
                    <span className={isSelected ? 'text-[#305d46] font-bold' : 'text-[#59594f]'}>
                      {isSelected ? '✓ Terkunci di Timer' : 'Pilih Task Ini'}
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
        <div className="figma-core p-6 sm:p-8 space-y-6 bg-[#fffdf5]">
          
          <div className="flex flex-col items-center text-center space-y-6">
            
            {/* Active Lock Info Card */}
            {activeBlock ? (
              <div className="p-4 rounded-2xl bg-[#faf9f3] border border-[#ded7c8] max-w-xl w-full text-left space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="dev-tag text-[9px]">{activeBlock.blockType}</span>
                  <span className="text-xs font-mono text-[#59594f]">{activeBlock.timeboxMinutes} Menit Timebox</span>
                </div>
                <h3 className="text-base font-bold text-[#252520] font-sans">{activeBlock.projectName}</h3>
                <p className="text-xs text-[#59594f] leading-relaxed">
                  <span className="text-[#925f18] font-bold font-mono">Action:</span> {activeBlock.action}
                </p>
                {activeBlock.rule && (
                  <div className="p-2 rounded-xl bg-[#fffdf5] border border-[#ded7c8] text-[11px] font-mono text-[#59594f]">
                    <span className="text-[#305d46] font-bold">// ATURAN:</span> {activeBlock.rule}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#faf9f3] border border-dashed border-[#ded7c8] max-w-xl w-full text-center text-xs font-mono text-[#59594f]">
                Belum ada task yang dikunci. Pilih task di atas atau langsung mulai timer bebas.
              </div>
            )}

            {/* Huge Clean Timer Clock */}
            <div className="space-y-3">
              <div className="font-mono text-6xl sm:text-8xl font-black tracking-tight text-[#252520] tabular-nums select-all">
                {formatTime(timeLeftSeconds)}
              </div>
              
              {/* Minimal Progress Bar */}
              <div className="w-64 sm:w-80 h-2 bg-[#ded7c8] rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-[#292a24] rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Timebox Duration Selectors */}
            <div className="flex items-center gap-2 bg-[#eae5d8] p-1.5 rounded-2xl border border-[#ded7c8] font-mono text-xs">
              {[25, 50, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => selectDuration(mins)}
                  className={`px-4 py-1.5 rounded-xl transition-all ${
                    sessionDurationMinutes === mins
                      ? 'bg-[#292a24] text-[#fffdf5] font-bold shadow-sm'
                      : 'text-[#59594f] hover:text-[#252520]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Big Primary Control Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={resetTimer}
                title="Reset Timer"
                className="p-3.5 rounded-2xl bg-[#faf9f3] hover:bg-[#eae5d8] text-[#59594f] hover:text-[#252520] border border-[#ded7c8] transition-all shadow-sm"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={toggleRunning}
                className={`px-8 py-4 rounded-2xl font-bold font-mono text-sm flex items-center gap-3 transition-all shadow-md active:scale-95 ${
                  isRunning
                    ? 'bg-[#faf9f3] hover:bg-[#eae5d8] text-[#252520] border border-[#ded7c8]'
                    : 'bg-[#292a24] hover:bg-[#1a1b16] text-[#fffdf5] border border-[#292a24]'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause Sesi</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Mulai Fokus</span>
                  </>
                )}
              </button>

              {activeBlock && (
                <button
                  onClick={() => {
                    soundManager.playCompletionChime();
                    onCompleteBlock(activeBlock.id);
                    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                  }}
                  title="Tandai Selesai Sekarang"
                  className="p-3.5 rounded-2xl bg-[#e2ecdc] hover:bg-[#d5e4cf] text-[#305d46] border border-[#305d46]/30 transition-all shadow-sm"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Ambient Soundscape Selection */}
            <div className="pt-4 border-t border-[#ded7c8] w-full flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#59594f]">
                <Headphones className="w-4 h-4 text-[#252520]" />
                <span>Binaural Soundscape:</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[
                  { id: 'none', label: 'Mute' },
                  { id: 'gamma40', label: 'Gamma 40Hz (Flow)' },
                  { id: 'brown', label: 'Brown Noise (Deep)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSoundChange(s.id as any)}
                    className={`px-3 py-1.5 rounded-xl border transition-all ${
                      soundMode === s.id
                        ? 'bg-[#292a24] text-[#fffdf5] border-[#292a24] font-bold shadow-sm'
                        : 'bg-[#faf9f3] text-[#59594f] border-[#ded7c8] hover:text-[#252520] hover:bg-[#eae5d8]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
