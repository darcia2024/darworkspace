import React, { useState } from 'react';
import { 
  Target, 
  Layers, 
  Clock, 
  DollarSign, 
  Flame, 
  Compass, 
  Menu, 
  X, 
  Plus, 
  FileDown, 
  MessageSquare, 
  Bot, 
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ActiveTabType, FinancialReport } from '../types';
import { soundManager } from '../utils/audio';

interface SidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenExport: () => void;
  onOpenCopilot: () => void;
  onOpenFollowUp: () => void;
  onOpenFinanceInput: () => void;
  onOpenInvoice: () => void;
  todayCompletedCount: number;
  waitingCount: number;
  financialReport?: FinancialReport;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onOpenCopilot,
  onOpenFollowUp,
  onOpenFinanceInput,
  onOpenInvoice,
  todayCompletedCount,
  waitingCount,
  financialReport
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const totalLiquid = financialReport?.totalLiquidBalance || 9892741;

  const navItems: { id: ActiveTabType; label: string; icon: any; badge?: string; badgeColor?: string }[] = [
    { id: 'today', label: 'Today Execution', icon: Target, badge: todayCompletedCount > 0 ? `${todayCompletedCount}/4` : undefined, badgeColor: 'bg-[#ecfccb] text-[#3f6212] border-[#d9f99d]' },
    { id: 'nextgo', label: 'Next Should Be Go', icon: Compass, badge: 'HOT', badgeColor: 'bg-[#fce7f3] text-[#be185d] border-[#fbcfe8]' },
    { id: 'lanes', label: 'Project Workspace', icon: Layers, badge: '6 Lanes', badgeColor: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
    { id: 'waiting', label: 'Waiting Radar', icon: Clock, badge: waitingCount > 0 ? `${waitingCount}` : undefined, badgeColor: 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]' },
    { id: 'money', label: 'Cashflow Matrix', icon: DollarSign, badge: 'Live', badgeColor: 'bg-[#fed7aa] text-[#c2410c] border-[#fed7aa]' },
    { id: 'deepwork', label: 'Focus Studio', icon: Flame, badge: '40Hz', badgeColor: 'bg-[#f3e8ff] text-[#6b21a8] border-[#e9d5ff]' }
  ];

  const formatShortRupiah = (num: number) => {
    return `Rp${(num / 1000000).toFixed(2)}M`;
  };

  const sidebarContent = (
    <div className="w-full h-full flex flex-col justify-between p-5 font-sans bg-white border-r border-zinc-200/80">
      
      {/* 1. Header & Brand */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-bold text-sm shadow-md">
              D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#111111]">
                  <span className="lead-italic font-normal">Daru</span>.OS
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">Solo Workstation 2026</p>
            </div>
          </div>

          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-full hover:bg-zinc-100 text-zinc-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Navigation Pills */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 font-bold px-3">
            WORKSPACE NAVIGATION
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full transition-all text-xs font-semibold ${
                    isActive
                      ? 'bg-[#111111] text-white shadow-sm'
                      : 'text-zinc-600 hover:text-[#111111] hover:bg-zinc-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isActive ? 'bg-white/20 text-white border-white/20' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 3. Quick Actions Bento Stickers */}
        <div className="space-y-2 pt-2 border-t border-zinc-100">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 font-bold px-3">
            QUICK ACTIONS
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={() => { soundManager.playClick(); onOpenInvoice(); }}
              className="p-2.5 rounded-2xl bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] hover:scale-[1.02] transition-all flex items-center gap-1.5 font-semibold text-[11px]"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>+ Invoice</span>
            </button>

            <button
              onClick={() => { soundManager.playClick(); onOpenFinanceInput(); }}
              className="p-2.5 rounded-2xl bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d] hover:scale-[1.02] transition-all flex items-center gap-1.5 font-semibold text-[11px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Catat Kas</span>
            </button>

            <button
              onClick={() => { soundManager.playClick(); onOpenFollowUp(); }}
              className="p-2.5 rounded-2xl bg-[#ffedd5] text-[#c2410c] border border-[#fed7aa] hover:scale-[1.02] transition-all flex items-center gap-1.5 font-semibold text-[11px]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Copas WA</span>
            </button>

            <button
              onClick={() => { soundManager.playClick(); onOpenCopilot(); }}
              className="p-2.5 rounded-2xl bg-[#fce7f3] text-[#be185d] border border-[#fbcfe8] hover:scale-[1.02] transition-all flex items-center gap-1.5 font-semibold text-[11px]"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Partner AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Live Balance Mini Bento Widget */}
      <div className="pt-4 border-t border-zinc-100 space-y-3">
        <div 
          onClick={() => { soundManager.playClick(); setActiveTab('money'); }}
          className="p-3.5 rounded-2xl bg-[#fafafa] border border-zinc-200/80 hover:border-zinc-300 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>MANDIRI + CASHPACK</span>
            <span className="text-emerald-700 font-bold">ONLINE</span>
          </div>
          <div className="text-base font-black text-[#111111] font-mono">
            {formatShortRupiah(totalLiquid)}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between">
            <span>Surplus Kas</span>
            <span className="text-emerald-600 font-bold">+Rp5,89M</span>
          </div>
        </div>

        <button
          onClick={() => { soundManager.playClick(); onOpenExport(); }}
          className="w-full py-2 px-3 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Export ke Obsidian</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 h-screen shrink-0 sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header Toggle */}
      <div className="lg:hidden px-4 py-3 bg-white border-b border-zinc-200 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
            D
          </div>
          <span className="text-base font-extrabold text-[#111111]">
            <span className="lead-italic font-normal">Daru</span>.OS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { soundManager.playClick(); onOpenFinanceInput(); }}
            className="p-2 rounded-full bg-[#111111] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-zinc-100 text-zinc-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
