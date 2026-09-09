import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  Target, 
  Layers, 
  Edit3, 
  DollarSign, 
  Flame, 
  Compass, 
  Clock, 
  Receipt, 
  Plus, 
  MessageSquare, 
  FileDown,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { ActiveTabType, FinancialReport, ProjectCard } from '../types';

interface DaruPartnerCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
  onSelectTab?: (tab: ActiveTabType) => void;
  onOpenFinanceInput?: () => void;
  onOpenInvoice?: () => void;
  onOpenFollowUp?: () => void;
  onOpenExport?: () => void;
  financialReport?: FinancialReport;
  projects: ProjectCard[];
}

export const DaruPartnerCopilot: React.FC<DaruPartnerCopilotProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  onSelectTab,
  onOpenFinanceInput,
  onOpenInvoice,
  onOpenFollowUp,
  onOpenExport,
  projects,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const quickActions = [
    {
      id: 'action-finance',
      title: 'Catat Kas & Transaksi Baru',
      category: 'Tindakan Cepat',
      icon: Plus,
      badge: '+ Kas',
      run: () => { onOpenFinanceInput?.(); onClose(); }
    },
    {
      id: 'action-invoice',
      title: 'Buat Invoice Tagihan Klien',
      category: 'Tindakan Cepat',
      icon: Receipt,
      badge: '+ Invoice',
      run: () => { onOpenInvoice?.(); onClose(); }
    },
    {
      id: 'action-followup',
      title: 'Salin Template Follow-up WhatsApp',
      category: 'Tindakan Cepat',
      icon: MessageSquare,
      badge: 'Copas WA',
      run: () => { onOpenFollowUp?.(); onClose(); }
    },
    {
      id: 'action-export',
      title: 'Ekspor Dokumen Laporan Project',
      category: 'Tindakan Cepat',
      icon: FileDown,
      badge: 'Laporan',
      run: () => { onOpenExport?.(); onClose(); }
    },
  ];

  const navigations: { id: string; title: string; tab: ActiveTabType; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'nav-today', title: 'Sikat Hari Ini (Daily Focus)', tab: 'today', icon: Target },
    { id: 'nav-nextgo', title: 'Abis Ini Ngapain? (Next Step Navigator)', tab: 'nextgo', icon: Compass },
    { id: 'nav-lanes', title: 'Markas Project & Kanban Board', tab: 'lanes', icon: Layers },
    { id: 'nav-waiting', title: 'Radar Tagihan & Piutang Menunggu', tab: 'waiting', icon: Clock },
    { id: 'nav-updates', title: 'Laporan Redaksi Project', tab: 'updates', icon: Edit3 },
    { id: 'nav-money', title: 'Cek Dompet, Kas, & Arus Uang', tab: 'money', icon: DollarSign },
    { id: 'nav-deepwork', title: 'Kamar Fokus Audio 40Hz', tab: 'deepwork', icon: Flame },
  ];

  const filteredActions = useMemo(() => {
    if (!query.trim()) return quickActions;
    return quickActions.filter(a => 
      a.title.toLowerCase().includes(query.toLowerCase()) || 
      a.badge.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const filteredNavigations = useMemo(() => {
    if (!query.trim()) return navigations;
    return navigations.filter(n => 
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.tab.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const filteredProjects = useMemo(() => {
    if (!query.trim()) return [];
    return (projects || [])
      .filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.currentGoal && p.currentGoal.toLowerCase().includes(query.toLowerCase())) ||
        (p.nextAction && p.nextAction.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5);
  }, [query, projects]);

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette Workspace"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/70">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari menu, tindakan cepat, atau project..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none font-medium"
          />
          <button 
            onClick={onClose}
            aria-label="Tutup Command Palette"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4 text-xs">
          
          {/* Section 1: Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600">
                Tindakan Cepat
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        soundManager.playClick();
                        action.run();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-zinc-100 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-zinc-100 group-hover:bg-white text-zinc-700 flex items-center justify-center border border-zinc-200">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-zinc-900">{action.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 px-2 py-0.5 rounded-md bg-zinc-100 group-hover:bg-white border border-zinc-200">
                        {action.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Navigation Tabs */}
          {filteredNavigations.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600">
                Navigasi Workspace
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredNavigations.map((nav) => {
                  const Icon = nav.icon;
                  return (
                    <button
                      key={nav.id}
                      onClick={() => {
                        soundManager.playClick();
                        onSelectTab?.(nav.tab);
                        onSelectAction?.(nav.tab);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-zinc-100 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-900" />
                        <span className="font-medium text-zinc-800 group-hover:text-zinc-950">{nav.title}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-zinc-300 group-hover:text-zinc-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Matching Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600">
                Project Sesuai Pencarian
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      soundManager.playClick();
                      onSelectTab?.('lanes');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-zinc-100 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-zinc-900 truncate">{p.name}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{p.currentGoal || p.nextAction || p.status}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                      {p.boardColumn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 && filteredNavigations.length === 0 && filteredProjects.length === 0 && (
            <div className="p-8 text-center text-zinc-600 font-medium">
              Tidak ada perintah atau project yang cocok dengan &quot;{query}&quot;.
            </div>
          )}

        </div>

        {/* Footer info strip */}
        <div className="p-2.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-[11px] text-zinc-600 font-mono">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-zinc-600" />
            Command Palette
          </span>
          <span className="text-zinc-600">ESC untuk tutup</span>
        </div>
      </div>
    </div>
  );
};
