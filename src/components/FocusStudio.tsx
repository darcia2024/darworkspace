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
      <div className="bento-card p-6 space-y-4 border border-zinc-200/90 shadow-sm">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#10b981]" />
              <h3 className="text-base font-extrabold text-[#111111] tracking-tight font-sans">
                <span className="lead-italic font-normal">Pilih</span> Task Kunci untuk Deep Work:
              </h3>
            </div>
            <p className="text-xs text-zinc-500 font-normal">
              Pilih salah satu tugas dari Triad hari ini untuk mengunci timebox dan instruksi langkah demi langkah.
            </p>
          </div>

          {activeBlock && (
            <span className="sticker-pill sticker-lime flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#15803d]" />
              <span>LOCKED: {activeBlock.projectName}</span>
            </span>
          )}
        </div>

        {/* 4 Interactive Task Cards to Pick From */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {todayBlocks.map((block, idx) => {
            const isSelected = activeBlock?.id === block.id;
            const taskThemes = [
              { bg: 'bento-apricot', border: 'border-[#fed7aa]', sticker: 'sticker-apricot' },
              { bg: 'bento-blue', border: 'border-[#bae6fd]', sticker: 'sticker-blue' },
              { bg: 'bento-pink', border: 'border-[#fbcfe8]', sticker: 'sticker-pink' },
              { bg: 'bento-lime', border: 'border-[#d9f99d]', sticker: 'sticker-lime' },
            ];
            const theme = taskThemes[idx % taskThemes.length];

            return (
              <button
                key={block.id}
                onClick={() => handleSelectBlock(block)}
                className={`bento-card ${theme.bg} p-4 rounded-[22px] border ${theme.border} text-left transition-all duration-200 space-y-2 relative group ${
                  isSelected
                    ? 'ring-2 ring-[#111111] shadow-md scale-[1.02]'
                    : block.isDone
                    ? 'opacity-40'
                    : 'hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`sticker-pill ${theme.sticker} text-[9px] py-0`}>{block.blockType}</span>
                  <span className="text-[10px] font-mono font-bold bg-white/70 px-2 py-0.5 rounded-full text-zinc-800">{block.timeboxMinutes}m</span>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold truncate text-[#111111] font-sans">
                    {block.projectName}
                  </h4>
                  <p className="text-[11px] text-zinc-700 line-clamp-2 mt-0.5 leading-relaxed font-sans">
                    {block.action}
                  </p>
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono">
                  <span className={isSelected ? 'text-[#15803d] font-bold' : 'text-zinc-600'}>
                    {isSelected ? '✓ Terkunci di Timer' : 'Pilih Task Ini'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* 2. STEP 2: ACTIVE FOCUS FLOW COCKPIT */}
      <div className="bento-card p-6 sm:p-8 space-y-6 border border-zinc-200/90 shadow-sm">
        
        <div className="flex flex-col items-center text-center space-y-6">
          
          {/* Active Lock Info Card */}
          {activeBlock ? (
            <div className="bento-card bento-apricot p-5 rounded-[24px] border border-[#fed7aa] max-w-xl w-full text-left space-y-2 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="sticker-pill sticker-apricot text-[9px]">{activeBlock.blockType}</span>
                <span className="text-xs font-mono font-bold text-zinc-800">{activeBlock.timeboxMinutes} Menit Timebox</span>
              </div>
              <h3 className="text-lg font-extrabold text-[#111111] font-sans">{activeBlock.projectName}</h3>
              <p className="text-xs text-zinc-800 leading-relaxed font-sans">
                <span className="text-[#c2410c] font-bold font-mono">Action:</span> {activeBlock.action}
              </p>
              {activeBlock.rule && (
                <div className="p-2.5 rounded-2xl bg-white/70 border border-black/5 text-[11px] font-mono text-zinc-700">
                  <span className="text-[#15803d] font-bold">// ATURAN:</span> {activeBlock.rule}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 max-w-xl w-full text-center text-xs font-mono text-zinc-500">
              Belum ada task yang dikunci. Pilih task di atas atau langsung mulai timer bebas.
            </div>
          )}

          {/* Huge Clean Timer Clock */}
          <div className="space-y-3">
            <div className="font-mono text-6xl sm:text-8xl font-black tracking-tight text-[#111111] tabular-nums select-all">
              {formatTime(timeLeftSeconds)}
            </div>
            
            {/* Minimal Progress Bar */}
            <div className="w-64 sm:w-80 h-2.5 bg-zinc-200 rounded-full mx-auto overflow-hidden">
              <div 
                className="h-full bg-[#111111] rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Timebox Duration Selectors */}
          <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-full border border-zinc-200 font-mono text-xs">
            {[25, 50, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => selectDuration(mins)}
                className={`px-4 py-1.5 rounded-full transition-all font-semibold ${
                  sessionDurationMinutes === mins
                    ? 'pill-black shadow-xs'
                    : 'text-zinc-600 hover:text-black'
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
              className="p-3.5 rounded-full pill-white transition-all shadow-xs"
            >
              <RotateCcw className="w-5 h-5 text-zinc-700" />
            </button>

            <button
              onClick={toggleRunning}
              className={`px-8 py-4 rounded-full font-bold font-mono text-sm flex items-center gap-3 transition-all shadow-md active:scale-95 ${
                isRunning
                  ? 'pill-white text-[#111111]'
                  : 'pill-black text-white shadow-lg'
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
                className="p-3.5 rounded-full bg-[#ecfccb] hover:bg-[#d9f99d] text-[#15803d] border border-[#d9f99d] transition-all shadow-xs"
              >
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Ambient Soundscape Selection */}
          <div className="pt-4 border-t border-zinc-100 w-full flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-500">
              <Headphones className="w-4 h-4 text-[#111111]" />
              <span>Binaural Soundscape:</span>
            </div>

            <div className="flex items-center gap-2">
              {[
                { id: 'none', label: 'Mute' },
                { id: 'gamma40', label: 'Gamma 40Hz (Flow)' },
                { id: 'brown', label: 'Brown Noise (Deep)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSoundChange(s.id as any)}
                  className={`px-3.5 py-1.5 rounded-full transition-all font-semibold ${
                    soundMode === s.id
                      ? 'pill-black shadow-xs'
                      : 'pill-white text-zinc-600 hover:text-black'
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
  );
};
