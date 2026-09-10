import React, { useState } from 'react';
import { 
  Target, 
  Layers, 
  DollarSign, 
  Flame, 
  Compass, 
  Menu, 
  X, 
  Plus, 
  FileDown, 
  MessageSquare, 
  Bot, 
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Receipt,
  Edit3
} from 'lucide-react';
import { ActiveTabType, FinancialReport } from '../types';
import { soundManager } from '../utils/audio';
import { APP_VERSION } from '../../shared/version.js';

interface SidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenExport: () => void;
  onOpenCopilot: () => void;
  onOpenFollowUp: () => void;
  onOpenFinanceInput: () => void;
  onOpenInvoice: () => void;
  waitingCount: number;
  financialReport?: FinancialReport;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onOpenCopilot,
  onOpenFollowUp,
  onOpenFinanceInput,
  onOpenInvoice,
  waitingCount,
  financialReport,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const totalLiquid = financialReport?.totalLiquidBalance ?? 0;
  const hardFloor = financialReport?.hardFloor ?? 4000000;
  const surplusFloor = totalLiquid - hardFloor;

  const navItems: { 
    id: ActiveTabType; 
    label: string; 
    subtitle: string;
    icon: any; 
    subPills?: { label: string; activeTab: ActiveTabType; count?: number }[];
  }[] = [
    { 
      id: 'today', 
      label: 'Sikat Hari Ini', 
      subtitle: 'Target & Agenda Harian',
      icon: Target, 
    },
    { 
      id: 'nextgo', 
      label: 'Abis Ini Ngapain?', 
      subtitle: 'Pencari Aksi Berikutnya',
      icon: Compass, 
    },
    { 
      id: 'lanes', 
      label: 'Markas Project & Radar', 
      subtitle: 'Kanban 6 Jalur & Blocker',
      icon: Layers, 
      subPills: [
        { label: '6 Jalur Kerja', activeTab: 'lanes' },
        { label: `Radar Tagihan (${waitingCount})`, activeTab: 'waiting', count: waitingCount }
      ]
    },
    { 
      id: 'updates', 
      label: 'Laporan Project', 
      subtitle: 'Export Update ke Klien',
      icon: Edit3, 
    },
    { 
      id: 'money', 
      label: 'Cek Dompet & Cuan', 
      subtitle: 'Cashflow & Runway Kas',
      icon: DollarSign, 
    },
    { 
      id: 'deepwork', 
      label: 'Kamar Fokus 40Hz', 
      subtitle: 'Timer & Gelombang Gamma',
      icon: Flame, 
    }
  ];

  const formatShortRupiah = (num: number) => {
    if (Math.abs(num) >= 1_000_000_000) {
      return `Rp${(num / 1_000_000_000).toFixed(2)} M`;
    }
    if (Math.abs(num) >= 1_000_000) {
      return `Rp${(num / 1_000_000).toFixed(2)} jt`;
    }
    if (Math.abs(num) >= 1_000) {
      return `Rp${(num / 1_000).toFixed(0)} rb`;
    }
    return `Rp${num.toLocaleString('id-ID')}`;
  };

  const sidebarContent = (
    <div className={`w-full h-full flex flex-col justify-between p-4 font-sans bg-white border-r border-zinc-200/80 transition-all duration-300 ${
      isCollapsed ? 'items-center px-2' : 'p-5'
    }`}>
      
      {/* 1. Header & Brand */}
      <div className={`space-y-6 w-full ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <div className="flex items-center justify-between w-full">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div 
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
              title={isCollapsed ? 'Klik untuk buka sidebar' : 'Daru.OS'}
            >
              D
            </div>
            {!isCollapsed && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-[#111111]">
                    <span className="lead-italic font-normal">Daru</span>.OS
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] text-zinc-500 font-medium">Markas Tempur Daru</p>
                  <span className="mono-tag text-[9px]">v{APP_VERSION}</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle button */}
          {!isCollapsed && (
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleCollapse?.();
              }}
              title="Tutup Sidebar"
              aria-label="Tutup sidebar"
              className="hidden lg:flex w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black items-center justify-center transition-all border border-zinc-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Mobile close button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            aria-label="Tutup menu navigasi"
            className="lg:hidden p-2 rounded-full hover:bg-zinc-100 text-zinc-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsed toggle button when in icon rail mode */}
        {isCollapsed && (
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleCollapse?.();
            }}
            title="Buka Sidebar"
            aria-label="Buka sidebar"
            className="hidden lg:flex w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black items-center justify-center transition-all border border-zinc-200"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        )}

        {/* 2. Navigation Pills */}
        <div className="space-y-1.5 w-full">
          {!isCollapsed && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 font-bold px-3">
              MENU UTAMA
            </span>
          )}
          <nav className="space-y-1 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = activeTab === item.id || (item.subPills && item.subPills.some(sp => sp.activeTab === activeTab));

              return (
                <div key={item.id} className="space-y-1 w-full">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveTab(item.id);
                      setIsMobileOpen(false);
                    }}
                    title={isCollapsed ? `${item.label} (${item.subtitle})` : undefined}
                    aria-label={item.label}
                    className={`w-full flex items-center transition-all ${
                      isCollapsed 
                        ? 'justify-center p-2.5 rounded-2xl' 
                        : 'justify-between px-3 py-2 rounded-2xl'
                    } ${
                      isItemActive
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'text-zinc-800 hover:text-black hover:bg-zinc-100/80'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 w-full'}`}>
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isItemActive ? 'bg-white/15 text-white' : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                      </div>
                      {!isCollapsed && (
                        <div className="flex flex-col text-left min-w-0 flex-1">
                          <span className="font-bold text-[12px] leading-tight truncate">{item.label}</span>
                          <span className={`text-[10px] font-normal leading-tight mt-0.5 truncate ${
                            isItemActive ? 'text-zinc-400' : 'text-zinc-500'
                          }`}>
                            {item.subtitle}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Compact Blend Sub-pills (When active and not collapsed) */}
                  {!isCollapsed && item.subPills && isItemActive && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100/90 rounded-2xl border border-zinc-200/80 mx-1 animate-fade-in font-mono text-[10px]">
                      {item.subPills.map((sub) => {
                        const isSubActive = activeTab === sub.activeTab;
                        return (
                          <button
                            key={sub.activeTab}
                            onClick={(e) => {
                              e.stopPropagation();
                              soundManager.playClick();
                              setActiveTab(sub.activeTab);
                              setIsMobileOpen(false);
                            }}
                            className={`flex-1 py-1 px-2 rounded-xl transition-all font-bold text-center flex items-center justify-center gap-1 ${
                              isSubActive 
                                ? 'bg-white text-[#111111] shadow-xs border border-black/10' 
                                : 'text-zinc-600 hover:text-black hover:bg-white/50'
                            }`}
                          >
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* 3. Quick Actions Bento Stickers */}
        {!isCollapsed && (
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 font-bold px-3">
              SHORTCUT CEPAT
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => { soundManager.playClick(); onOpenInvoice(); }}
                className="p-2.5 rounded-2xl bg-[#e0f2fe] text-[#075985] font-bold border border-[#7dd3fc] hover:scale-[1.02] transition-all flex items-center gap-1.5 font-semibold text-[11px]"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>+ Invoice</span>
              </button>

              <button
                onClick={() => { soundManager.playClick(); onOpenFinanceInput(); }}
                className="p-2.5 rounded-2xl bg-[#ecfccb] text-[#14532d] font-bold border border-[#a3e635] hover:scale-[1.02] transition-all flex items-center gap-1.5 font-semibold text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Kas</span>
              </button>

              <button
                onClick={() => { soundManager.playClick(); onOpenFollowUp(); }}
                className="p-2.5 rounded-2xl bg-[#ffedd5] text-[#9a3412] font-bold border border-[#fdba74] hover:scale-[1.02] transition-all flex items-center gap-1.5 font-semibold text-[11px]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Copas WA</span>
              </button>

              <button
                onClick={() => { soundManager.playClick(); onOpenCopilot(); }}
                className="p-2.5 rounded-2xl bg-[#fce7f3] text-[#9d174d] font-bold border border-[#f9a8d4] hover:scale-[1.02] transition-all flex items-center gap-1.5 font-semibold text-[11px]"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Partner lokal</span>
              </button>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="space-y-2 pt-2 border-t border-zinc-100 flex flex-col items-center">
            <button
              onClick={() => { soundManager.playClick(); onOpenFinanceInput(); }}
              title="+ Catat Kas"
              aria-label="Catat kas baru"
              className="p-2.5 rounded-2xl bg-[#ecfccb] text-[#14532d] hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => { soundManager.playClick(); onOpenInvoice(); }}
              title="+ Invoice"
              aria-label="Buat invoice baru"
              className="p-2.5 rounded-2xl bg-[#e0f2fe] text-[#075985] hover:scale-105 transition-all"
            >
              <Receipt className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Bottom Live Balance Mini Bento Widget */}
      {!isCollapsed ? (
        <div className="pt-4 border-t border-zinc-100 space-y-3 w-full">
          <div 
            onClick={() => { soundManager.playClick(); setActiveTab('money'); }}
            className="p-3.5 rounded-2xl bg-[#fafafa] border border-zinc-200/80 hover:border-zinc-300 cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-700 font-medium">
              <span>SALDO LIKUID</span>
              <span className="font-extrabold">{surplusFloor >= 0 ? 'DI ATAS BATAS' : 'DI BAWAH BATAS'}</span>
            </div>
            <div className="text-base font-black text-[#111111] font-mono">
              {formatShortRupiah(totalLiquid)}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between">
              <span>Selisih dari batas kas</span>
              <span className="font-extrabold">{formatShortRupiah(surplusFloor)}</span>
            </div>
          </div>

          <button
            onClick={() => { soundManager.playClick(); onOpenExport(); }}
            className="w-full py-2 px-3 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Buka laporan project</span>
          </button>
        </div>
      ) : (
        <div className="pt-4 border-t border-zinc-100 flex flex-col items-center">
          <button
            onClick={() => { soundManager.playClick(); setActiveTab('money'); }}
            title={`Saldo Kas: ${formatShortRupiah(totalLiquid)}`}
            aria-label={`Lihat saldo kas: ${formatShortRupiah(totalLiquid)}`}
            className="w-10 h-10 rounded-2xl bg-[#fafafa] border border-zinc-200 flex items-center justify-center text-xs font-mono font-black text-black hover:border-zinc-400"
          >
            Rp
          </button>
        </div>
      )}

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Expandable & Collapsible) */}
      <aside className={`hidden lg:block h-screen shrink-0 sticky top-0 z-30 transition-all duration-300 ${
        isCollapsed ? 'w-18 min-w-[4.5rem]' : 'w-72 min-w-[18rem]'
      }`}>
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
            aria-label="Catat kas baru"
            className="p-2 rounded-full bg-[#111111] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileOpen(true)}
            aria-label="Buka menu navigasi"
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
