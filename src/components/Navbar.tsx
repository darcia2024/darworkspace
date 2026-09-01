import React, { useState, useEffect } from 'react';
import { 
  Terminal,
  Layers, 
  Radar, 
  DollarSign, 
  Timer,
  MessageSquare,
  Sparkles,
  FileCode,
  Maximize2, 
  Minimize2,
  Activity
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface NavbarProps {
  activeTab: 'today' | 'lanes' | 'waiting' | 'money' | 'deepwork';
  setActiveTab: (tab: 'today' | 'lanes' | 'waiting' | 'money' | 'deepwork') => void;
  onOpenExport: () => void;
  onOpenCopilot: () => void;
  onOpenFollowUp: () => void;
  isCopilotOpen: boolean;
  todayCompletedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onOpenCopilot,
  onOpenFollowUp,
  isCopilotOpen,
  todayCompletedCount
}) => {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const navItems = [
    { id: 'today', label: 'Command Hub', icon: Terminal, hotkey: '1', count: todayCompletedCount > 0 ? `${todayCompletedCount}/4` : null },
    { id: 'lanes', label: 'Board & Lanes', icon: Layers, hotkey: '2' },
    { id: 'waiting', label: 'Radar Pipeline', icon: Radar, hotkey: '3' },
    { id: 'money', label: 'Cashflow Matrix', icon: DollarSign, hotkey: '4' },
    { id: 'deepwork', label: 'Focus Engine', icon: Timer, hotkey: '5' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-3 pb-2 transition-all font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 p-2 rounded-xl dev-glass">
        
        {/* Brand Terminal Beacon */}
        <div className="flex items-center gap-3 pl-2">
          <div className="w-8 h-8 rounded-lg bg-[#14141c] border border-white/15 flex items-center justify-center text-white font-mono text-xs font-bold shadow-inner">
            D_
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-tight text-sm">DARU WORK OS</span>
              <span className="dev-tag text-[9px] px-1.5 py-0">v2.6</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
              <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">delivery & core ops</span>
            </div>
          </div>
        </div>

        {/* Developer Tab Navigation */}
        <nav className="flex items-center gap-1 bg-[#09090d] p-1 rounded-lg border border-white/[0.06] overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(item.id as any);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
                {item.count && (
                  <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-zinc-200 text-zinc-900' : 'bg-white/10 text-zinc-400'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Developer Action Toolbar */}
        <div className="flex items-center gap-2 pr-1">
          {/* Quick Copas WA Follow-up */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenFollowUp();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14141c] hover:bg-[#1a1a24] text-zinc-200 hover:text-white border border-white/10 text-xs font-mono transition-all"
            title="Copas WA (⌘F)"
          >
            <MessageSquare className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden md:inline">Copas WA</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">⌘F</span>
          </button>

          {/* Partner Copilot */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCopilot();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
              isCopilotOpen
                ? 'bg-white text-zinc-950 font-semibold border-white shadow-sm'
                : 'bg-[#14141c] text-zinc-300 border-white/10 hover:border-white/20 hover:text-white'
            }`}
            title="Daru Partner Copilot (⌘K)"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isCopilotOpen ? 'text-zinc-950' : 'text-zinc-300'}`} />
            <span className="hidden sm:inline font-medium">Partner</span>
            <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${isCopilotOpen ? 'bg-zinc-200 text-zinc-950' : 'bg-white/10 text-zinc-400'}`}>⌘K</span>
          </button>

          {/* Obsidian Export */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenExport();
            }}
            className="p-1.5 rounded-lg bg-[#14141c] text-zinc-400 hover:text-white transition-colors border border-white/10"
            title="Export to Obsidian"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-[#14141c] text-zinc-400 hover:text-white transition-colors border border-white/10"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </header>
  );
};
