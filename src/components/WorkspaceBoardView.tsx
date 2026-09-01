import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Search, 
  SlidersHorizontal, 
  FileText, 
  Play, 
  Check, 
  MessageSquare,
  Sparkles,
  Palette,
  Scissors,
  Sliders,
  Laptop,
  BookOpen,
  Globe,
  Receipt,
  CreditCard,
  Briefcase,
  Layers,
  Zap,
  Clock,
  Compass
} from 'lucide-react';
import { ProjectCard, TodayBlock, WaitingItem } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface WorkspaceBoardViewProps {
  projects: ProjectCard[];
  todayBlocks: TodayBlock[];
  onStartFocus: (block: TodayBlock) => void;
  onToggleBlock: (id: string) => void;
  onOpenFollowUpForProject: (project: ProjectCard | WaitingItem) => void;
}

export const WorkspaceBoardView: React.FC<WorkspaceBoardViewProps> = ({
  projects,
  todayBlocks,
  onStartFocus,
  onToggleBlock,
  onOpenFollowUpForProject
}) => {
  const [pipelineFilter, setPipelineFilter] = useState<'all' | 'payment' | 'client' | 'approval'>('all');
  const [taskFilter, setTaskFilter] = useState<'all' | 'doing' | 'queue'>('all');

  // Section 1: Client Pipeline & Waiting Deals (Proyek/Klien yang sedang menunggu follow-up/pembayaran/keputusan)
  const pipelineDeals = [
    {
      id: 'pipe-umi-elly',
      name: 'Umi Elly — LMS Azhariyah',
      subtitle: 'Tunggu transfer DP Termin 1 (Rp3 jt) baru coding',
      value: 'Rp7.000.000',
      status: 'Waiting Payment',
      category: 'payment',
      icon: 'book',
      source: 'WA',
      warmthLevel: 4,
    },
    {
      id: 'pipe-bedug',
      name: 'Bedug.net (Media Website)',
      subtitle: 'Tunggu hasil keputusan diskusi internal redaksi',
      value: 'Rp2.200.000',
      status: 'Waiting Client',
      category: 'client',
      icon: 'globe',
      source: 'WA',
      warmthLevel: 3,
    },
    {
      id: 'pipe-el-massa',
      name: 'El Massa (Deliverables)',
      subtitle: 'Follow-up tagihan invoice deliverables selesai',
      value: 'Outstanding',
      status: 'Waiting Payment',
      category: 'payment',
      icon: 'receipt',
      source: 'WA/Email',
      warmthLevel: 2,
    },
    {
      id: 'pipe-ar-ruwad',
      name: 'Ar-Ruwad Logo',
      subtitle: 'Tunggu feedback & pilihan logo final dari client',
      value: 'Paid Rp600k',
      status: 'Waiting Approval',
      category: 'approval',
      icon: 'palette',
      source: 'WA',
      warmthLevel: 2,
    },
  ];

  const filteredPipeline = pipelineDeals.filter(p => {
    if (pipelineFilter === 'payment') return p.category === 'payment';
    if (pipelineFilter === 'client') return p.category === 'client';
    if (pipelineFilter === 'approval') return p.category === 'approval';
    return true;
  });

  const getOutlineIcon = (iconName: string) => {
    switch (iconName) {
      case 'book': return <BookOpen className="w-5 h-5 text-zinc-300 stroke-[1.75]" />;
      case 'globe': return <Globe className="w-5 h-5 text-zinc-300 stroke-[1.75]" />;
      case 'receipt': return <Receipt className="w-5 h-5 text-zinc-300 stroke-[1.75]" />;
      case 'palette': return <Palette className="w-5 h-5 text-zinc-300 stroke-[1.75]" />;
      case 'scissors': return <Scissors className="w-5 h-5 text-zinc-300 stroke-[1.75]" />;
      case 'sliders': return <Sliders className="w-5 h-5 text-zinc-300 stroke-[1.75]" />;
      case 'laptop': return <Laptop className="w-5 h-5 text-zinc-300 stroke-[1.75]" />;
      default: return <Briefcase className="w-5 h-5 text-zinc-300 stroke-[1.75]" />;
    }
  };

  return (
    <div className="space-y-10 font-sans animate-fade-in pb-16">
      
      {/* ========================================================================= */}
      {/* SECTION 1: CLIENT PIPELINE & WAITING DEALS (Follow-up Radar)              */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        
        {/* Section Header & Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Section Pill Title */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-[#141418] border border-white/10 text-white font-semibold text-sm flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-zinc-400 stroke-[2]" />
              <span>Pipeline & Waiting Deals</span>
              <span className="text-zinc-200 font-mono font-bold text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {pipelineDeals.length}
              </span>
            </div>
            <span className="hidden md:inline text-xs text-zinc-500 font-mono">// Radar follow-up & tagihan</span>
          </div>

          {/* Search, Filter Icon, & Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button className="w-8 h-8 rounded-full bg-[#141418] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white">
              <Search className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            <button className="w-8 h-8 rounded-full bg-[#141418] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white">
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            <button
              onClick={() => setPipelineFilter('all')}
              className={pipelineFilter === 'all' ? 'pill-filter-active' : 'pill-filter'}
            >
              All
            </button>

            <button
              onClick={() => setPipelineFilter('payment')}
              className={pipelineFilter === 'payment' ? 'pill-filter-active' : 'pill-filter'}
            >
              <span>Waiting Payment</span>
            </button>

            <button
              onClick={() => setPipelineFilter('client')}
              className={pipelineFilter === 'client' ? 'pill-filter-active' : 'pill-filter'}
            >
              <span>Waiting Client</span>
            </button>

            <button
              onClick={() => setPipelineFilter('approval')}
              className={pipelineFilter === 'approval' ? 'pill-filter-active' : 'pill-filter'}
            >
              <span>Waiting Approval</span>
            </button>
          </div>

        </div>

        {/* 4 Pipeline Squircle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPipeline.map((item) => (
            <div
              key={item.id}
              className="workspace-card p-5 flex flex-col justify-between space-y-4"
            >
              {/* Top Row: Avatar Outline Icon & Corner Action Button */}
              <div className="flex items-start justify-between">
                
                {/* Round Avatar with Outline Icon */}
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shadow-md">
                  {getOutlineIcon(item.icon)}
                </div>

                {/* Top-Right Round Action Arrow for 1-Click Copas WA */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    const matchedProject = projects.find(p => p.name.toLowerCase().includes(item.name.slice(0, 5).toLowerCase()));
                    onOpenFollowUpForProject(matchedProject || ({ name: item.name, currentGoal: item.subtitle } as any));
                  }}
                  className="action-corner-btn"
                  title="Copas WA Follow-up"
                >
                  <ArrowUpRight className="w-4 h-4 stroke-[2]" />
                </button>
              </div>

              {/* Middle Info: Name, Subtitle & Value */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {item.name}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 font-normal line-clamp-1">
                  {item.subtitle}
                </p>
                <p className="text-[11px] font-mono text-zinc-300 pt-0.5">
                  Value: <strong className="text-white font-semibold">{item.value}</strong>
                </p>
              </div>

              {/* Bottom Row: Source Tags & Warmth Dots */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                
                {/* Source & Status Tag */}
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/5 text-zinc-300 text-[10px]">
                    {item.status}
                  </span>
                </div>

                {/* Dot Indicators */}
                <div className="flex items-center gap-1">
                  <span className={`dot-indicator ${item.warmthLevel >= 1 ? 'bg-white' : 'bg-zinc-700'}`} />
                  <span className={`dot-indicator ${item.warmthLevel >= 2 ? 'bg-white' : 'bg-zinc-700'}`} />
                  <span className={`dot-indicator ${item.warmthLevel >= 3 ? 'bg-zinc-400' : 'bg-zinc-800'}`} />
                  <span className={`dot-indicator ${item.warmthLevel >= 4 ? 'bg-zinc-500' : 'bg-zinc-800'}`} />
                </div>

              </div>

            </div>
          ))}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: TODAY'S TASKS & ACTIVE FOCUS (Daily Deep Work Execution)       */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        
        {/* Section Header & Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Section Title Capsule */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-[#141418] border border-white/10 text-white font-semibold text-sm flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-zinc-400 stroke-[2]" />
              <span>Today's Execution Tasks</span>
              <span className="text-zinc-200 font-mono font-bold text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {todayBlocks.length}
              </span>
            </div>
            <span className="hidden md:inline text-xs text-zinc-500 font-mono">// 3 fokus eksekusi aktif + 1 antrian</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setTaskFilter('all')}
              className={taskFilter === 'all' ? 'pill-filter-active' : 'pill-filter'}
            >
              All Focus
            </button>

            <button
              onClick={() => setTaskFilter('doing')}
              className={taskFilter === 'doing' ? 'pill-filter-active' : 'pill-filter'}
            >
              <span>Doing Active (3)</span>
            </button>

            <button
              onClick={() => setTaskFilter('queue')}
              className={taskFilter === 'queue' ? 'pill-filter-active' : 'pill-filter'}
            >
              <span>Queue Ready (1)</span>
            </button>
          </div>

        </div>

        {/* Task Cards Grid: 1 Hero High-Contrast White Card (Zalvice) + 3 Dark Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. HERO HIGH-CONTRAST MONOCHROME CARD: Zalvice Logo */}
          <div className="workspace-card-hero p-5 flex flex-col justify-between space-y-4">
            
            {/* Top Row: Avatar + Action Buttons */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-inner">
                <Palette className="w-5 h-5 text-white stroke-[1.75]" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStartFocus(todayBlocks[0])}
                  className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 flex items-center justify-center transition-all border border-zinc-300"
                  title="Lock In Flow Mode"
                >
                  <Play className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => onStartFocus(todayBlocks[0])}
                  className="action-corner-btn-hero"
                  title="Start Session"
                >
                  <ArrowUpRight className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Middle Title & Details */}
            <div className="space-y-1 text-zinc-950">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-950 animate-pulse" />
                <h4 className="text-lg font-extrabold tracking-tight">
                  Zalvice Logo
                </h4>
              </div>
              <p className="text-xs font-medium text-zinc-800 leading-snug">
                Selesaikan 2 arah konsep logo & kirim preview ke Bang Edo
              </p>
              <p className="text-[11px] font-mono text-zinc-600 pt-1">
                ⏱️ 90m Timebox • Paid in Full
              </p>
            </div>

            {/* Bottom Status Capsule */}
            <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-950">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 font-semibold text-[11px] border border-zinc-300 font-mono">
                <span>DOING_NOW</span>
              </div>

              <button
                onClick={() => {
                  soundManager.playCompletionChime();
                  onToggleBlock(todayBlocks[0]?.id || 'tb-1');
                  confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                }}
                className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center hover:scale-110 transition-transform"
                title="Mark Done"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

          </div>

          {/* 2. DARK CARD: Kasir Barber Underrated */}
          <div className="workspace-card p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-zinc-300 stroke-[1.75]" />
              </div>
              <button
                onClick={() => onStartFocus(todayBlocks[1] || todayBlocks[0])}
                className="action-corner-btn"
                title="Focus"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-300 stroke-[1.75]" />
                <h4 className="text-base font-bold text-white tracking-tight">
                  Kasir Barber Underrated
                </h4>
              </div>
              <p className="text-xs text-zinc-400 font-normal line-clamp-2">
                Finalkan alur kasir POS, membership system, & invoice DP 50%
              </p>
              <p className="text-[11px] font-mono text-zinc-400 pt-0.5">
                Amount: <strong className="text-white">Rp3.000.000 (DP)</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-full bg-[#18181f] border border-white/10 text-zinc-300 font-mono text-[10px]">
                Sprint Kickoff Prep
              </span>

              <button
                onClick={() => {
                  const p = projects.find(item => item.name.toLowerCase().includes('barber'));
                  if (p) onOpenFollowUpForProject(p);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-mono text-[11px]"
              >
                <MessageSquare className="w-3 h-3 stroke-[1.75]" />
                <span>Copas WA</span>
              </button>
            </div>
          </div>

          {/* 3. DARK CARD: Setting KAEL Core */}
          <div className="workspace-card p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-zinc-300 stroke-[1.75]" />
              </div>
              <button
                onClick={() => onStartFocus(todayBlocks[2] || todayBlocks[0])}
                className="action-corner-btn"
                title="Focus"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-300 stroke-[1.75]" />
                <h4 className="text-base font-bold text-white tracking-tight">
                  Setting KAEL Core
                </h4>
              </div>
              <p className="text-xs text-zinc-400 font-normal line-clamp-2">
                Setting role kasir vs owner dashboard & sync tenant demo
              </p>
              <p className="text-[11px] font-mono text-zinc-400 pt-0.5">
                Timebox: <strong className="text-white">45m</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-full bg-[#18181f] border border-white/10 text-zinc-300 font-mono text-[10px]">
                Pilot Ready
              </span>
              <button
                onClick={() => onStartFocus(todayBlocks[2] || todayBlocks[0])}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-[11px]"
              >
                <Play className="w-3 h-3 stroke-[2.5]" />
                <span>Lock In</span>
              </button>
            </div>
          </div>

          {/* 4. DARK CARD: Laptopbisnis Logo */}
          <div className="workspace-card p-5 flex flex-col justify-between space-y-4 opacity-90">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                <Laptop className="w-5 h-5 text-zinc-300 stroke-[1.75]" />
              </div>
              <button
                onClick={() => onStartFocus(todayBlocks[3] || todayBlocks[0])}
                className="action-corner-btn"
                title="Focus"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400 stroke-[1.75]" />
                <h4 className="text-base font-bold text-white tracking-tight">
                  Laptopbisnis Logo
                </h4>
              </div>
              <p className="text-xs text-zinc-400 font-normal line-clamp-2">
                Eksplor simbol + wordmark, 2 opsi siap kirim
              </p>
              <p className="text-[11px] font-mono text-zinc-400 pt-0.5">
                Status: <strong className="text-zinc-200">Queue (After Zalvice)</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-full bg-[#18181f] border border-white/10 text-zinc-400 font-mono text-[10px]">
                Paid Rp600k
              </span>
              <button
                onClick={() => {
                  const p = projects.find(item => item.name.toLowerCase().includes('laptop'));
                  if (p) onOpenFollowUpForProject(p);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-mono text-[11px]"
              >
                <MessageSquare className="w-3 h-3 stroke-[1.75]" />
                <span>Copas WA</span>
              </button>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};
