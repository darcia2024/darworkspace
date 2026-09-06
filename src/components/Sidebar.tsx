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
    <div className="h-full flex flex-col justify-between bg-[#faf9f3] border-r border-[#dedbd0] p-4 text-[#252520] select-none font-sans">
      
      {/* Top Brand Header */}
      <div className="space-y-4">
        
        {/* Workspace Brand */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            {/* Minimalist Typographic Avatar */}
            <div className="w-8 h-8 rounded-xl bg-[#292a24] text-[#fffdf5] flex items-center justify-center font-bold text-sm shadow-sm font-mono">
              D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#24241f] tracking-tight text-sm">DARU WORK OS</span>
                <span className="text-[10px] font-mono bg-[#eae5d8] px-1.5 py-0.2 rounded text-[#59594f] border border-[#ded7c8]">v2.7</span>
              </div>
              <p className="text-[11px] text-[#666256] font-mono">Agency Workstation</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#59594f] hover:text-[#24241f] bg-[#eae5d8]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Active Status Badge */}
        <div className="p-2.5 rounded-xl bg-[#fffdf5] border border-[#ded7c8] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#666256]">
            <span className="flex items-center gap-1.5 text-[#305d46] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#305d46] animate-pulse" />
              ACTIVE SPRINT
            </span>
            <span>{time}</span>
          </div>
          <p className="text-[11px] text-[#24241f] font-medium truncate">
            Umi Elly LMS • DreamMecca • KAEL
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-mono text-[#666256] uppercase tracking-wider px-2 block mb-1.5 font-semibold">
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
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-[#292a24] text-[#fffdf5] font-semibold shadow-sm'
                    : 'text-[#514f45] hover:text-[#24241f] hover:bg-[#eae5d8]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 stroke-[1.8] ${isActive ? 'text-[#fffdf5]' : 'text-[#666256]'}`} />
                  <div className="text-left truncate">
                    <span className="block truncate">{item.label}</span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-[#fffdf5] text-[#292a24] font-bold' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-1.5 pt-2 border-t border-[#ded7c8]">
          <span className="text-[10px] font-mono text-[#666256] uppercase tracking-wider px-2 block mb-1 font-semibold">
            QUICK ACTIONS
          </span>

          <button
            onClick={() => {
              soundManager.playClick();
              if (onOpenInvoice) onOpenInvoice();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-[#252520] bg-[#fffdf5] hover:bg-[#eae5d8] border border-[#ded7c8] transition-all font-mono shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5 text-[#305d46]" />
              <span>+ Buat Invoice</span>
            </div>
            <span className="text-[10px] text-[#666256]">⌘I</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenFinanceInput();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-[#fffdf5] bg-[#292a24] hover:bg-[#3c3e34] transition-all font-mono shadow-sm"
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
            className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-[#252520] bg-[#fffdf5] hover:bg-[#eae5d8] border border-[#ded7c8] transition-all font-mono shadow-sm"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#666256]" />
              <span>Copas Pesan WA</span>
            </div>
            <span className="text-[10px] text-[#666256]">⌘F</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCopilot();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-[#252520] bg-[#fffdf5] hover:bg-[#eae5d8] border border-[#ded7c8] transition-all font-mono shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-[#584272]" />
              <span>Partner Copilot</span>
            </div>
            <span className="text-[10px] text-[#666256]">⌘K</span>
          </button>
        </div>

      </div>

      {/* Bottom Financial Health Widget & Sync Status */}
      <div className="space-y-3 pt-3 border-t border-[#ded7c8]">
        
        {/* Cash Health Miniature Card */}
        <div 
          onClick={() => {
            soundManager.playClick();
            setActiveTab('money');
            setIsMobileOpen(false);
          }}
          className={`p-3 rounded-xl bg-[#fffdf5] border ${isRed ? 'border-[#814637]' : isGreen ? 'border-[#305d46]' : 'border-[#b87e2b]'} cursor-pointer hover:bg-[#ffffff] shadow-sm transition-all space-y-1`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className={`flex items-center gap-1.5 font-bold ${isRed ? 'text-[#814637]' : isGreen ? 'text-[#305d46]' : 'text-[#b87e2b]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isRed ? 'bg-[#814637]' : isGreen ? 'bg-[#305d46]' : 'bg-[#b87e2b]'} animate-pulse`} />
              {isRed ? 'CASH DEFENSE' : isGreen ? 'GROWTH ZONE' : 'STAGE 2 BUFFER'}
            </span>
            <span className="text-[#666256]">±{report.runwayDays} Hari</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-base font-extrabold text-[#24241f] font-mono">
              {formatRupiah(report.totalLiquidBalance)}
            </span>
            <span className="text-[10px] text-[#666256] font-mono">
              Burn: ~Rp4,5M
            </span>
          </div>
        </div>

        {/* 2-Way Obsidian Live Sync Indicator */}
        <div className="p-2 rounded-xl bg-[#fffdf5] border border-[#ded7c8] flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              syncStatus.isOnline 
                ? (syncStatus.vaultConnected ? 'bg-[#305d46]' : 'bg-[#b87e2b]') 
                : 'bg-[#666256]'
            }`} />
            <span className="text-[#59594f]">
              {syncStatus.isOnline 
                ? (syncStatus.vaultConnected ? 'Obsidian Sync: OK' : 'API OK (Vault OTW)') 
                : 'Local Offline'}
            </span>
          </div>

          <button
            onClick={() => apiService.checkHealth()}
            title="Manual Obsidian Sync"
            className="text-[#666256] hover:text-[#24241f] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Utility Bar (Audio Toggle & Export) */}
        <div className="flex items-center justify-between px-1 text-xs text-[#666256] font-mono">
          <button
            onClick={() => {
              const muted = soundManager.toggleMute();
              setIsSoundMuted(muted);
            }}
            className="flex items-center gap-1.5 hover:text-[#24241f] transition-colors p-1"
          >
            {isSoundMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#814637]" />
                <span className="text-[10px]">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#666256]" />
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
            className="flex items-center gap-1 hover:text-[#24241f] transition-colors p-1 text-[10px]"
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
      <div className="lg:hidden sticky top-0 z-40 bg-[#f1eddf]/95 backdrop-blur-md border-b border-[#ded7c8] p-3 flex items-center justify-between text-[#252520]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-[#fffdf5] border border-[#ded7c8] text-[#252520]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#292a24] text-[#fffdf5] flex items-center justify-center font-bold text-xs font-mono">
              D
            </div>
            <span className="font-bold text-[#24241f] text-sm">DARU WORK OS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#24241f] bg-[#fffdf5] px-2.5 py-1 rounded-full border border-[#ded7c8] shadow-sm">
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
            className="fixed inset-0 bg-[#292923]/60 backdrop-blur-sm"
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
