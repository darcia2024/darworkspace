import React from 'react';
import { 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  Plus, 
  Bell, 
  Zap,
  Activity,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TopScheduleHeaderProps {
  onOpenNewTask?: () => void;
  onOpenFollowUp?: () => void;
  onOpenCopilot?: () => void;
  paidDealsCount: number;
  pipelineDealsCount: number;
  activeDealsCount: number;
  onSelectTab: (tab: string) => void;
}

export const TopScheduleHeader: React.FC<TopScheduleHeaderProps> = ({
  onOpenNewTask,
  onOpenFollowUp,
  onOpenCopilot,
  paidDealsCount,
  pipelineDealsCount,
  activeDealsCount,
  onSelectTab,
}) => {
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <header className="space-y-6 pt-2 font-sans animate-fade-in">
      
      {/* 1. TOP SCHEDULE PILL BAR (Dark Monochrome Outline Style) */}
      <div className="flex items-center justify-between gap-3">
        
        {/* Left Outline Icon */}
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/15 flex items-center justify-center text-white shadow-inner flex-shrink-0 cursor-pointer hover:border-white/30 transition-colors">
          <Layers className="w-4 h-4 text-zinc-200 stroke-[1.75]" />
        </div>

        {/* Center Main Schedule Capsule */}
        <div className="flex-1 max-w-4xl bg-[#111115] border border-white/10 text-white rounded-full p-1.5 sm:p-2 flex items-center justify-between gap-2 shadow-2xl overflow-hidden">
          
          {/* Left Schedule Label & Date */}
          <div className="flex items-center gap-2.5 pl-3 sm:pl-4">
            <span className="font-semibold text-xs sm:text-sm tracking-tight text-white whitespace-nowrap">
              Your Schedule
            </span>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-[11px] font-mono text-zinc-300">
              <Calendar className="w-3 h-3 text-zinc-400 stroke-[1.75]" />
              <span>{todayStr}</span>
            </div>
          </div>

          {/* Timeline Middle Graphic (Monochrome Connected Blocks) */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-2 bg-black/60 border border-white/10 rounded-full p-1 text-white shadow-inner justify-between px-3">
            
            {/* Slot 1: Active Now (Zalvice) */}
            <div className="flex items-center gap-1.5 bg-white text-zinc-950 rounded-full px-3 py-0.5 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse" />
              <span>Zalvice (90m)</span>
              <span className="text-zinc-600 text-[10px] font-mono">09:00</span>
            </div>

            {/* Slot 2: Barber Underrated */}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono">
              <span className="text-zinc-500">14:00</span>
              <span className="hidden lg:inline text-zinc-200">Barber Underrated</span>
            </div>

            {/* Slot 3: Setting KAEL */}
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
              <span className="text-zinc-500">16:00</span>
              <span className="hidden lg:inline text-zinc-300">Setting KAEL</span>
            </div>

          </div>

          {/* Right Action Circle Button */}
          <button 
            onClick={() => onSelectTab('deepwork')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-sm"
            title="Open Focus Studio"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2]" />
          </button>

        </div>

        {/* Right Notification & Profile Icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={onOpenFollowUp}
            className="w-10 h-10 rounded-full bg-[#141418] border border-white/10 hover:border-white/25 flex items-center justify-center text-zinc-300 hover:text-white transition-all relative"
            title="Copas Follow-up WA"
          >
            <Bell className="w-4 h-4 stroke-[1.75]" />
            <span className="w-2 h-2 rounded-full bg-white absolute top-2.5 right-2.5" />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-[#18181f] border border-white/15 p-0.5 flex items-center justify-center text-xs font-mono text-zinc-200">
            DAR
          </div>
        </div>

      </div>

      {/* 2. MAIN TITLE "WORKSPACE", + NEW TASK, & DEALS METRICS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        
        {/* Left Title & Action */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => onSelectTab('today')}
            className="w-9 h-9 rounded-full bg-[#141418] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
          </button>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
            WORKSPACE
          </h1>

          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-md"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>

        {/* Right 3 Deals Counters with Outline Indicators */}
        <div className="flex items-center gap-6 sm:gap-8">
          
          {/* Metric 1: Paid Deals */}
          <div onClick={() => onSelectTab('lanes')} className="flex items-center gap-2 cursor-pointer group">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {paidDealsCount}
            </span>
            <div className="flex flex-col">
              <span className="px-2 py-0.5 rounded-full bg-white text-zinc-950 font-bold text-[10px] flex items-center gap-0.5">
                ↑ {paidDealsCount} Paid
              </span>
              <span className="text-[11px] text-zinc-400 font-mono mt-0.5">Deals</span>
            </div>
          </div>

          {/* Metric 2: Pipeline Deals */}
          <div onClick={() => onSelectTab('waiting')} className="flex items-center gap-2 cursor-pointer group">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {pipelineDealsCount}
            </span>
            <div className="flex flex-col">
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-white/15 text-zinc-200 font-bold text-[10px] flex items-center gap-0.5">
                ↑ {pipelineDealsCount} Pipe
              </span>
              <span className="text-[11px] text-zinc-400 font-mono mt-0.5">Deals</span>
            </div>
          </div>

          {/* Metric 3: Active Setup */}
          <div onClick={() => onSelectTab('lanes')} className="flex items-center gap-2 cursor-pointer group">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {activeDealsCount}
            </span>
            <div className="flex flex-col">
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-white/15 text-zinc-300 font-mono text-[10px] flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 stroke-[2]" />
                <span>{activeDealsCount} Active</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono mt-0.5">Deals</span>
            </div>
          </div>

        </div>

      </div>

    </header>
  );
};
