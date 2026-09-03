import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Layers, 
  Radar, 
  Wallet, 
  Timer, 
  Plus, 
  MessageSquare, 
  Bot, 
  Download, 
  Volume2, 
  VolumeX, 
  Menu, 
  X,
  Flame,
  ShieldAlert,
  ChevronRight,
  Clock,
  Sparkles,
  Command,
  Database,
  RefreshCw,
  Triangle,
  Zap,
  DollarSign,
  Receipt,
  Compass
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { FinancialReport, ActiveTabType } from '../types';
import { apiService, ServerSyncStatus } from '../services/api';

interface SidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenExport: () => void;
  onOpenCopilot: () => void;
  onOpenFollowUp: () => void;
  onOpenFinanceInput: () => void;
  onOpenInvoice?: () => void;
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
  const [time, setTime] = useState<string>('');
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<ServerSyncStatus>({
    isOnline: false,
    vaultConnected: false,
    lastSyncedAt: null,
    error: null
  });

  useEffect(() => {
    const unsub = apiService.subscribeStatus(setSyncStatus);
    return unsub;
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Jakarta'
        }) + ' WIB'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const report = financialReport || {
    totalLiquidBalance: 6844233,
    runwayDays: 46,
    estimatedRealBurn: 4500000,
    hardFloor: 4000000
  };

  const isRed = report.totalLiquidBalance < 4000000;
  const isGreen = report.totalLiquidBalance >= 10000000;

  const navItems = [
    {
      id: 'today' as const,
      label: 'Command Hub',
      sublabel: 'Today Focus & Triad',
      icon: Terminal,
      badge: todayCompletedCount > 0 ? `${todayCompletedCount}/4` : '4 Tasks',
      badgeColor: 'bg-white/10 text-zinc-300'
    },
    {
      id: 'nextgo' as const,
      label: 'Next Should Be Go',
      sublabel: 'Strategic Move Matrix',
      icon: Compass,
      badge: '3 Moves ⚡',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'lanes' as const,
      label: 'Board & Lanes',
      sublabel: 'Active Kanban Projects',
      icon: Layers,
      badge: 'Doing',
      badgeColor: 'bg-[#0070F3]/15 text-[#3291ff] border border-[#0070F3]/30'
    },
    {
      id: 'waiting' as const,
      label: 'Radar Pipeline',
      sublabel: 'Pending Decisions',
      icon: Radar,
      badge: `${waitingCount || 4} Deals`,
      badgeColor: 'bg-[#F5A623]/15 text-[#f5a623] border border-[#F5A623]/30'
    },
    {
      id: 'money' as const,
      label: 'Cashflow Matrix',
      sublabel: 'Defense & Burn Rate',
      icon: DollarSign,
      badge: isRed ? '🔴 Red Mode' : isGreen ? '🟢 Green Mode' : '🟡 Yellow Mode',
      badgeColor: isRed 
        ? 'bg-[#EE0000]/15 text-[#ff4444] border border-[#EE0000]/30' 
        : isGreen 
          ? 'bg-[#10B981]/15 text-[#34d399] border border-[#10B981]/30' 
          : 'bg-[#F5A623]/15 text-[#f5a623] border border-[#F5A623]/30'
    },
    {
      id: 'deepwork' as const,
      label: 'Focus Engine',
      sublabel: 'Pomodoro Studio',
      icon: Timer,
      badge: '50m',
      badgeColor: 'bg-white/10 text-zinc-300'
    },
  ];

  const formatRupiah = (num: number) => {
    if (num >= 1000000) {
      return `Rp${(num / 1000000).toFixed(2).replace('.', ',')}M`;
    }
    return `Rp${num.toLocaleString('id-ID')}`;
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#000000] border-r border-white/[0.12] p-4 text-zinc-300 select-none">
      
      {/* Top Brand Header */}
      <div className="space-y-4">
        
        {/* Vercel Workspace Brand */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            {/* Vercel Iconic Delta Triangle */}
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold shadow-md">
              <svg width="15" height="15" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-sm">DARU WORK OS</span>
                <span className="text-[10px] font-mono bg-white/[0.08] px-1.5 py-0.2 rounded text-zinc-400 border border-white/10">v2.7</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">Geist Workstation</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Active Triad Status Badge */}
        <div className="p-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-[#0070F3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0070F3] animate-pulse" />
              ACTIVE SPRINT
            </span>
            <span>{time}</span>
          </div>
          <p className="text-[11px] text-zinc-200 font-medium truncate">
            Zalvice • Barber POS • KAEL Core
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider px-2 block mb-1.5">
            NAVIGATION
          </span>

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
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.2)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 stroke-[1.8] ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <div className="text-left truncate">
                    <span className="block truncate">{item.label}</span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-zinc-200 text-black font-bold' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider px-2 block mb-1">
            QUICK ACTIONS
          </span>

          <button
            onClick={() => {
              soundManager.playClick();
              if (onOpenInvoice) onOpenInvoice();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-blue-300 bg-[#0070F3]/10 hover:bg-[#0070F3]/20 border border-[#0070F3]/25 transition-all font-mono"
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5 text-[#0070F3]" />
              <span>+ Buat Invoice</span>
            </div>
            <span className="text-[10px] text-[#0070F3]/80">⌘I</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenFinanceInput();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Kas / Bukti</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenFollowUp();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-zinc-300 bg-[#0a0a0a] hover:bg-[#111111] border border-white/[0.08] hover:border-white/20 transition-all font-mono"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copas Pesan WA</span>
            </div>
            <span className="text-[10px] text-zinc-400">⌘F</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCopilot();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg text-xs text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all font-mono"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Partner Copilot</span>
            </div>
            <span className="text-[10px] text-purple-400/80">⌘K</span>
          </button>
        </div>

      </div>

      {/* Bottom Financial Health Widget & Sync Status */}
      <div className="space-y-3 pt-3 border-t border-white/[0.08]">
        
        {/* Cash Health Miniature Card */}
        <div 
          onClick={() => {
            soundManager.playClick();
            setActiveTab('money');
            setIsMobileOpen(false);
          }}
          className={`p-3 rounded-lg bg-[#0a0a0a] border ${isRed ? 'border-rose-500/30 hover:border-rose-500/60' : isGreen ? 'border-emerald-500/30 hover:border-emerald-500/60' : 'border-amber-500/30 hover:border-amber-500/60'} cursor-pointer transition-all space-y-1`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className={`flex items-center gap-1.5 font-bold ${isRed ? 'text-rose-400' : isGreen ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isRed ? 'bg-rose-500' : isGreen ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              {isRed ? 'CASH DEFENSE' : isGreen ? 'GROWTH ZONE' : 'STAGE 2 BUFFER'}
            </span>
            <span className="text-zinc-400">±{report.runwayDays} Hari</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-base font-extrabold text-white font-mono">
              {formatRupiah(report.totalLiquidBalance)}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              Burn: ~Rp4,5M
            </span>
          </div>
        </div>

        {/* 2-Way Obsidian Live Sync Indicator */}
        <div className="p-2 rounded-lg bg-[#0a0a0a] border border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              syncStatus.isOnline 
                ? (syncStatus.vaultConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400') 
                : 'bg-zinc-600'
            }`} />
            <span className="text-zinc-300">
              {syncStatus.isOnline 
                ? (syncStatus.vaultConnected ? 'Obsidian Sync: OK' : 'API OK (Vault OTW)') 
                : 'Local Offline'}
            </span>
          </div>

          <button
            onClick={() => apiService.checkHealth()}
            title="Manual Obsidian Sync"
            className="text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Utility Bar (Audio Toggle & Export) */}
        <div className="flex items-center justify-between px-1 text-xs text-zinc-400 font-mono">
          <button
            onClick={() => {
              const muted = soundManager.toggleMute();
              setIsSoundMuted(muted);
            }}
            className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors p-1"
          >
            {isSoundMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[10px]">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px]">Sound</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenExport();
              setIsMobileOpen(false);
            }}
            className="flex items-center gap-1 hover:text-white transition-colors p-1 text-[10px]"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Top App Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-md border-b border-white/[0.12] p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="white"/>
            </svg>
            <span className="font-bold text-white text-sm">DARU WORK OS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
            {formatRupiah(report.totalLiquidBalance)}
          </span>
        </div>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 h-full z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
