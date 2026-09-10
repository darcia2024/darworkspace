import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Headphones,
  Check,
  Flame,
  Target,
  ArrowRight,
  Clock,
  Zap,
  TrendingUp,
  Sparkles,
  Layers
} from 'lucide-react';
import { TodayBlock } from '../types';
import { soundManager } from '../utils/audio';
import { parseProjectTitle } from '../utils/selectors';
import confetti from 'canvas-confetti';

interface FocusStudioProps {
  todayBlocks: TodayBlock[];
  activeBlock: TodayBlock | null;
  setActiveBlock: (block: TodayBlock | null) => void;
  onCompleteBlock: (id: string) => void;
  queuedCount?: number;
}

const getBlockTheme = (blockType: string, idx: number) => {
  if (blockType.startsWith('Deep Work 1')) {
    return {
      bg: 'bg-gradient-to-b from-[#fff7ed] to-[#ffedd5]/40',
      border: 'border-[#fed7aa]',
      tagBg: 'bg-[#ffedd5] text-[#9a3412] border-[#fdba74]',
      icon: Flame
    };
  }
  if (blockType.startsWith('Deep Work 2')) {
    return {
      bg: 'bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe]/40',
      border: 'border-[#bae6fd]',
      tagBg: 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]',
      icon: Zap
    };
  }
  if (blockType.startsWith('Deep Work 3')) {
    return {
      bg: 'bg-gradient-to-b from-[#f5f3ff] to-[#ede9fe]/40',
      border: 'border-[#ddd6fe]',
      tagBg: 'bg-[#ede9fe] text-[#6d28d9] border-[#c4b5fd]',
      icon: Sparkles
    };
  }
  if (blockType === 'Growth Block') {
    return {
      bg: 'bg-gradient-to-b from-[#fdf2f8] to-[#fce7f3]/40',
      border: 'border-[#fbcfe8]',
      tagBg: 'bg-[#fce7f3] text-[#be185d] border-[#f9a8d4]',
      icon: TrendingUp
    };
  }
  if (blockType === 'Admin/Product') {
    return {
      bg: 'bg-gradient-to-b from-[#f7fee7] to-[#ecfccb]/40',
      border: 'border-[#d9f99d]',
      tagBg: 'bg-[#ecfccb] text-[#3f6212] border-[#bef264]',
      icon: Layers
    };
  }
  if (blockType === 'Admin/Maintenance') {
    return {
      bg: 'bg-gradient-to-b from-[#fffbeb] to-[#fef3c7]/40',
      border: 'border-[#fde68a]',
      tagBg: 'bg-[#fef3c7] text-[#92400e] border-[#fcd34d]',
      icon: Clock
    };
  }

  const fallback = [
    { bg: 'bg-gradient-to-b from-[#fff7ed] to-[#ffedd5]/40', border: 'border-[#fed7aa]', tagBg: 'bg-[#ffedd5] text-[#9a3412] border-[#fdba74]', icon: Flame },
    { bg: 'bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe]/40', border: 'border-[#bae6fd]', tagBg: 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]', icon: Zap },
    { bg: 'bg-gradient-to-b from-[#fdf2f8] to-[#fce7f3]/40', border: 'border-[#fbcfe8]', tagBg: 'bg-[#fce7f3] text-[#be185d] border-[#f9a8d4]', icon: TrendingUp },
    { bg: 'bg-gradient-to-b from-[#f7fee7] to-[#ecfccb]/40', border: 'border-[#d9f99d]', tagBg: 'bg-[#ecfccb] text-[#3f6212] border-[#bef264]', icon: Layers },
  ];
  return fallback[idx % fallback.length];
};

export const FocusStudio: React.FC<FocusStudioProps> = ({
  todayBlocks,
  activeBlock,
  setActiveBlock,
  onCompleteBlock,
  queuedCount = 0
}) => {
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(() => {
    try {
      const saved = localStorage.getItem('DARU_FOCUS_DURATION');
      return saved ? parseInt(saved, 10) || 50 : 50;
    } catch {
      return 50;
    }
  });

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(() => {
    try {
      const savedRunning = localStorage.getItem('DARU_FOCUS_RUNNING') === 'true';
      const savedDeadline = localStorage.getItem('DARU_FOCUS_DEADLINE');
      if (savedRunning && savedDeadline) {
        const rem = Math.max(0, Math.ceil((parseInt(savedDeadline, 10) - Date.now()) / 1000));
        return rem;
      }
      const savedDur = localStorage.getItem('DARU_FOCUS_DURATION');
      return (savedDur ? parseInt(savedDur, 10) || 50 : 50) * 60;
    } catch {
      return 50 * 60;
    }
  });

  const [isRunning, setIsRunning] = useState(() => {
    try {
      const savedRunning = localStorage.getItem('DARU_FOCUS_RUNNING') === 'true';
      const savedDeadline = localStorage.getItem('DARU_FOCUS_DEADLINE');
      if (savedRunning && savedDeadline) {
        return parseInt(savedDeadline, 10) > Date.now();
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [soundMode, setSoundMode] = useState<'none' | 'gamma40' | 'brown'>('none');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialDeadline = (() => {
    try {
      const saved = localStorage.getItem('DARU_FOCUS_DEADLINE');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  })();
  const deadlineRef = useRef<number>(initialDeadline);
  const completionRef = useRef(onCompleteBlock);
  completionRef.current = onCompleteBlock;
  const prevBlockIdRef = useRef<string | undefined>(activeBlock?.id);

  useEffect(() => () => soundManager.stopNoise(), []);

  useEffect(() => {
    if (activeBlock?.id !== prevBlockIdRef.current) {
      prevBlockIdRef.current = activeBlock?.id;
      if (activeBlock && activeBlock.timeboxMinutes) {
        setIsRunning(false);
        soundManager.stopNoise();
        try {
          localStorage.setItem('DARU_FOCUS_RUNNING', 'false');
          localStorage.removeItem('DARU_FOCUS_DEADLINE');
          localStorage.setItem('DARU_FOCUS_DURATION', activeBlock.timeboxMinutes.toString());
        } catch { /* storage safe */ }
        setSessionDurationMinutes(activeBlock.timeboxMinutes);
        setTimeLeftSeconds(activeBlock.timeboxMinutes * 60);
      }
    }
  }, [activeBlock]);

  const selectDuration = (mins: number) => {
    soundManager.playClick();
    setIsRunning(false);
    soundManager.stopNoise();
    try {
      localStorage.setItem('DARU_FOCUS_RUNNING', 'false');
      localStorage.removeItem('DARU_FOCUS_DEADLINE');
      localStorage.setItem('DARU_FOCUS_DURATION', mins.toString());
    } catch { /* storage safe */ }
    setSessionDurationMinutes(mins);
    setTimeLeftSeconds(mins * 60);
  };

  const handleSelectBlock = (block: TodayBlock) => {
    soundManager.playClick();
    setIsRunning(false);
    soundManager.stopNoise();
    setActiveBlock(block);
    const dur = block.timeboxMinutes || 50;
    try {
      localStorage.setItem('DARU_FOCUS_RUNNING', 'false');
      localStorage.removeItem('DARU_FOCUS_DEADLINE');
      localStorage.setItem('DARU_FOCUS_DURATION', dur.toString());
    } catch { /* storage safe */ }
    setSessionDurationMinutes(dur);
    setTimeLeftSeconds(dur * 60);
  };

  useEffect(() => {
    if (isRunning) {
      // Re-establish deadline if missing
      if (!deadlineRef.current || deadlineRef.current <= Date.now()) {
        deadlineRef.current = Date.now() + timeLeftSeconds * 1000;
        try {
          localStorage.setItem('DARU_FOCUS_DEADLINE', deadlineRef.current.toString());
          localStorage.setItem('DARU_FOCUS_RUNNING', 'true');
        } catch { /* storage safe */ }
      }

      timerRef.current = setInterval(() => {
        const target = deadlineRef.current;
        const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
        setTimeLeftSeconds(remaining);
        if (remaining === 0) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          try {
            localStorage.setItem('DARU_FOCUS_RUNNING', 'false');
            localStorage.removeItem('DARU_FOCUS_DEADLINE');
          } catch { /* storage safe */ }
          soundManager.playCompletionChime();
          soundManager.stopNoise();
          setSoundMode('none');
          
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });

          if (activeBlock) {
            completionRef.current(activeBlock.id);
          }
        }
      }, 250);
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
      if (timeLeftSeconds <= 0) return;
      const targetDeadline = Date.now() + timeLeftSeconds * 1000;
      deadlineRef.current = targetDeadline;
      try {
        localStorage.setItem('DARU_FOCUS_DEADLINE', targetDeadline.toString());
        localStorage.setItem('DARU_FOCUS_RUNNING', 'true');
        localStorage.setItem('DARU_FOCUS_DURATION', sessionDurationMinutes.toString());
      } catch { /* storage safe */ }
      if (soundMode === 'gamma40') soundManager.startGammaFocus();
      else if (soundMode === 'brown') soundManager.startBrownNoise();
      setIsRunning(true);
    } else {
      try {
        localStorage.setItem('DARU_FOCUS_RUNNING', 'false');
      } catch { /* storage safe */ }
      soundManager.stopNoise();
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    soundManager.playClick();
    setIsRunning(false);
    soundManager.stopNoise();
    try {
      localStorage.setItem('DARU_FOCUS_RUNNING', 'false');
      localStorage.removeItem('DARU_FOCUS_DEADLINE');
    } catch { /* storage safe */ }
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
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = sessionDurationMinutes > 0 
    ? Math.min(100, Math.max(0, ((sessionDurationMinutes * 60 - timeLeftSeconds) / (sessionDurationMinutes * 60)) * 100))
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans animate-fade-in pb-12">
      {queuedCount > 0 && <p role="status" className="text-sm">{queuedCount} sesi berikutnya dalam antrean. Selesaikan sesi ini untuk memilih tugas berikutnya otomatis.</p>}
      
      {/* 1. STEP 1: TASK SELECTION STAGE */}
      <div className="bento-card p-6 space-y-4 border border-zinc-200/90 shadow-sm">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#10b981]" />
              <h3 className="text-base font-extrabold text-[#111111] tracking-tight font-sans">
                <span className="lead-italic font-normal">Pilih Satu Task</span> Buat Disikat Sekarang:
              </h3>
            </div>
            <p className="text-xs text-zinc-800 font-medium">
              Pasang headphone lo, tutup tab lain yang bikin buyar, dan nikmati sensasi nuntasin kerjaan!
            </p>
          </div>

          {activeBlock && (
            <span className="sticker-pill sticker-lime flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] font-bold">
              <Flame className="w-3.5 h-3.5 text-[#15803d] fill-[#15803d]" />
              <span>LOCKED: {parseProjectTitle(activeBlock.projectName).title}</span>
            </span>
          )}
        </div>

        {/* Interactive Task Cards to Pick From */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {todayBlocks.map((block, idx) => {
            const isSelected = activeBlock?.id === block.id;
            const theme = getBlockTheme(block.blockType, idx);
            const parsed = parseProjectTitle(block.projectName);
            const Icon = theme.icon;

            return (
              <button
                key={block.id}
                onClick={() => handleSelectBlock(block)}
                className={`bento-card ${theme.bg} p-4 sm:p-5 rounded-[24px] border ${theme.border} text-left transition-all duration-200 flex flex-col justify-between min-h-[200px] relative group ${
                  isSelected
                    ? 'ring-2 ring-[#111111] shadow-xl scale-[1.02]'
                    : block.isDone
                    ? 'opacity-40'
                    : 'hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <div className="space-y-3 w-full">
                  {/* Top: Block Type & Timebox */}
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${theme.tagBg}`}>
                      <Icon className="w-3 h-3" />
                      <span>{block.blockType}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white/90 px-2 py-0.5 rounded-full text-zinc-800 border border-black/5 shadow-2xs flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-zinc-500" />
                      <span>{block.timeboxMinutes}m</span>
                    </span>
                  </div>

                  {/* Title & Metadata (Crisp, High-Impact Editorial Hierarchy) */}
                  <div className="space-y-1">
                    {parsed.client && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                        <span className="truncate">{parsed.client}</span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-[13px] sm:text-sm font-black tracking-tight text-[#111111] font-sans leading-snug line-clamp-2">
                        {parsed.title}
                      </h4>
                      {parsed.detail && (
                        <span className="inline-block text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/5 text-zinc-700 border border-black/5 shrink-0">
                          {parsed.detail}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Description */}
                  <div className="p-2.5 rounded-xl bg-white/70 border border-black/5 text-[11px] text-zinc-700 line-clamp-2 leading-relaxed font-sans shadow-2xs">
                    {block.action}
                  </div>
                </div>

                {/* Bottom CTA / Status */}
                <div className="pt-3 mt-2 border-t border-black/5 w-full">
                  {isSelected ? (
                    <div className="w-full py-1.5 px-3 rounded-xl bg-[#111111] text-white flex items-center justify-between text-[10px] font-mono shadow-sm">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>TERKUNCI DI TIMER</span>
                      </div>
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </div>
                  ) : (
                    <div className="w-full py-1.5 px-3 rounded-xl bg-white/80 border border-black/10 group-hover:border-black/25 group-hover:bg-white text-zinc-700 group-hover:text-black flex items-center justify-between text-[10px] font-mono font-bold transition-all shadow-2xs">
                      <span>Pilih Task Ini</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                    </div>
                  )}
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
          {activeBlock ? (() => {
            const activeTheme = getBlockTheme(activeBlock.blockType, 0);
            const activeParsed = parseProjectTitle(activeBlock.projectName);
            const ActiveIcon = activeTheme.icon;

            return (
              <div className={`bento-card ${activeTheme.bg} p-5 sm:p-6 rounded-[24px] border ${activeTheme.border} max-w-xl w-full text-left space-y-3 shadow-md`}>
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wide px-3 py-1 rounded-full border ${activeTheme.tagBg}`}>
                    <ActiveIcon className="w-3.5 h-3.5" />
                    <span>{activeBlock.blockType}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-800 bg-white/85 px-3 py-1 rounded-full border border-black/5 shadow-2xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{activeBlock.timeboxMinutes} Menit Timebox</span>
                  </span>
                </div>

                <div className="space-y-1">
                  {activeParsed.client && (
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <span>{activeParsed.client}</span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight font-sans">
                      {activeParsed.title}
                    </h3>
                    {activeParsed.detail && (
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-black/5 text-zinc-700 font-semibold border border-black/5">
                        {activeParsed.detail}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-black/5 text-xs text-zinc-800 space-y-1 shadow-2xs">
                  <span className="text-[#c2410c] font-black font-mono block text-[10px] tracking-wider uppercase">
                    Langkah Konkrit:
                  </span>
                  <p className="text-sm font-sans font-medium text-zinc-900 leading-relaxed">
                    {activeBlock.action}
                  </p>
                </div>

                {activeBlock.rule && (
                  <div className="p-3 rounded-xl bg-zinc-50 border border-black/5 text-[11px] font-mono text-zinc-700">
                    <span className="text-[#15803d] font-bold">// ATURAN:</span> {activeBlock.rule}
                  </div>
                )}
              </div>
            );
          })() : (
            <div className="p-5 rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 max-w-xl w-full text-center text-xs font-mono text-zinc-700 font-medium">
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
                    ? 'pill-black shadow-sm'
                    : 'text-zinc-800 font-semibold hover:text-black'
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
              aria-label="Reset Timer"
              className="p-3.5 rounded-full pill-white transition-all shadow-sm"
            >
              <RotateCcw className="w-5 h-5 text-zinc-700" />
            </button>

            <button
              onClick={toggleRunning}
              aria-label={isRunning ? 'Pause Sesi' : 'Mulai Fokus'}
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
                  setIsRunning(false);
                  soundManager.stopNoise();
                  soundManager.playCompletionChime();
                  onCompleteBlock(activeBlock.id);
                  confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                }}
                title="Tandai Selesai Sekarang"
                aria-label="Tandai Selesai Sekarang"
                className="p-3.5 rounded-full bg-[#ecfccb] hover:bg-[#d9f99d] text-[#15803d] border border-[#d9f99d] transition-all shadow-sm"
              >
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Ambient Soundscape Selection */}
          <div className="pt-4 border-t border-zinc-100 w-full flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-700 font-medium">
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
                      ? 'pill-black shadow-sm'
                      : 'pill-white text-zinc-800 font-semibold hover:text-black'
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
