import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopQuickStats } from './components/TopQuickStats';
import { TodaySuperSmallView } from './components/TodaySuperSmallView';
import { WorkflowLanes } from './components/WorkflowLanes';
import { WaitingRadarView } from './components/WaitingRadarView';
import { MoneyCashflowView } from './components/MoneyCashflowView';
import { NextShouldBeGoView } from './components/NextShouldBeGoView';
import { FocusStudio } from './components/FocusStudio';
import { ExportModal } from './components/ExportModal';
import { FollowUpModal } from './components/FollowUpModal';
import { DaruPartnerCopilot } from './components/DaruPartnerCopilot';
import { DecisionAnchorBox } from './components/DecisionAnchorBox';
import { QuickFinanceInputModal } from './components/QuickFinanceInputModal';
import { InvoiceGeneratorModal } from './components/InvoiceGeneratorModal';
import { loadState } from './utils/storage';
import { applyTransaction, deriveState, projectIdFor, updateProject, validateTransaction } from '../shared/domain.js';
import { apiService, ServerSyncStatus } from './services/api';
import { DaruWorkOSState, TodayBlock, ProjectCard, WaitingItem, TransactionRecord, AssetAccount, InvoiceRecord, ActiveTabType } from './types';
import { soundManager } from './utils/audio';
import { ChevronRight, Sparkles, MessageSquare, Bot, Plus, Receipt, Lock, PanelLeft } from 'lucide-react';
import { PinLockScreen, AUTH_STORAGE_KEY } from './components/PinLockScreen';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'AUTHENTICATED_120426';
    } catch {
      return false;
    }
  });

  const [state, setStateValue] = useState<DaruWorkOSState>(loadState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<ServerSyncStatus | null>(null);
  const editedDuringLoad = useRef(false);
  const setState = (updater: (previous: DaruWorkOSState) => DaruWorkOSState) => {
    editedDuringLoad.current = true;
    setStateValue(previous => deriveState(updater(previous)));
  };
  useEffect(() => apiService.subscribeStatus(setSyncStatus), []);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('today');
  const [activeFocusBlock, setActiveFocusBlock] = useState<TodayBlock | null>(null);
  const [focusQueue, setFocusQueue] = useState<TodayBlock[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('daru_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    soundManager.playClick();
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('daru_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;
    apiService.loadInitialState().then((serverState) => {
      if (cancelled) return;
      if (!editedDuringLoad.current) setStateValue(serverState);
      setIsLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Modals state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isFinanceInputOpen, setIsFinanceInputOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [targetFollowUpProject, setTargetFollowUpProject] = useState<ProjectCard | WaitingItem | null>(null);
  const [targetInvoiceProject, setTargetInvoiceProject] = useState<ProjectCard | null>(null);

  useEffect(() => {
    if (isLoaded && editedDuringLoad.current) apiService.saveState(state);
  }, [state, isLoaded]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFollowUpOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsInvoiceOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open Follow-up Modal for specific item
  const handleOpenFollowUpForItem = (item: ProjectCard | WaitingItem) => {
    setTargetFollowUpProject(item);
    setIsFollowUpOpen(true);
  };

  // Handlers for Today Pursuit
  const handleTogglePursuit = (id: string) => {
    setState((prev) => ({
      ...prev,
      todayPursuit: prev.todayPursuit.map((p) => (p.id === id ? { ...p, isDone: !p.isDone, isCompleted: !p.isDone } : p)),
    }));
  };

  // Handlers for Today Blocks
  const handleToggleBlock = (id: string) => {
    setState((prev) => ({
      ...prev,
      todayBlocks: prev.todayBlocks.map((b) => (b.id === id ? { ...b, isDone: !b.isDone } : b)),
    }));
  };

  const handleStartFocus = (block: TodayBlock) => {
    if (!block) return;
    setFocusQueue([]);
    if (!state.todayBlocks.some(item => item.id === block.id)) setState(prev => ({ ...prev, todayBlocks: prev.todayBlocks.some(item => item.id === block.id) ? prev.todayBlocks : [...prev.todayBlocks, block] }));
    setActiveFocusBlock(block);
    setActiveTab('deepwork');
  };

  const handleStartFocusOnProject = (project: ProjectCard) => {
    const existing = state.todayBlocks.find((block) => projectIdFor(block, state.projects) === project.id && !block.isDone);
    const block: TodayBlock = existing || {
      id: crypto.randomUUID(), projectId: project.id,
      blockType: project.lane === 'maintenance' ? 'Admin/Maintenance' : 'Deep Work 1',
      projectName: project.name, action: project.nextAction || 'Eksekusi next action',
      timeboxMinutes: 50, isDone: false, rule: project.rule || 'Fokus satu next action.',
    };
    if (!existing) setState(prev => ({ ...prev, todayBlocks: [...prev.todayBlocks, block] }));
    handleStartFocus(block);
  };

  const handleUpdateProject = (project: ProjectCard) => {
    setState(prev => updateProject(prev, project));
  };

  const handleAddProject = (project: Omit<ProjectCard, 'id'>) => {
    setState(prev => updateProject(prev, { ...project, id: crypto.randomUUID() }));
  };

  // Handlers for Waiting Items
  const handleAddWaitingItem = (newItem: Omit<WaitingItem, 'id'>) => {
    const item: WaitingItem = {
      ...newItem,
      id: `w-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      waitingItems: [item, ...prev.waitingItems],
      quickStats: {
        ...prev.quickStats,
        waitingPaymentKickoff: prev.quickStats.waitingPaymentKickoff + 1
      }
    }));
  };

  const handleResolveWaitingItem = (id: string) => {
    setState(prev => {
      const item = prev.waitingItems.find(w => w.id === id);
      const project = item && prev.projects.find(p => p.id === projectIdFor(item, prev.projects));
      if (project) return updateProject(prev, { ...project, boardColumn: 'QUEUE', blocker: undefined });
      return { ...prev, waitingItems: prev.waitingItems.filter(w => w.id !== id) };
    });
  };

  const handleSaveTransaction = (txData: Omit<TransactionRecord, 'id' | 'createdAt'>) => {
    validateTransaction(state, txData);
    const transaction: TransactionRecord = { ...txData, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setState(prev => applyTransaction(prev, transaction));
  };

  const handleUpdateAllBalances = (accounts: AssetAccount[]) => {
    if (accounts.some(account => !Number.isSafeInteger(account.balance) || account.balance < 0)) throw new Error('Saldo harus berupa rupiah bulat, minimal nol.');
    const ids = new Map(accounts.map(account => [account.name, crypto.randomUUID()]));
    const now = new Date();
    setState(prev => accounts.reduce((next, account) => {
      if (next.financialReport.accounts.find(a => a.name === account.name)?.balance === account.balance) return next;
      return applyTransaction(next, {
        id: ids.get(account.name)!, type: 'balance_update', amount: account.balance,
        accountName: account.name, date: now.toISOString().slice(0, 10), createdAt: now.toISOString(),
        category: 'Koreksi saldo', description: 'Penyesuaian saldo rekening',
      });
    }, prev));
  };

  const handleToggleExpensePaid = (expenseId: string) => {
    setState((prev) => {
      const currentReport = prev.financialReport;
      if (!currentReport || !currentReport.monthlyExpenses) return prev;

      const updatedExpenses = currentReport.monthlyExpenses.map((exp) => {
        if (exp.id === expenseId) {
          const month = new Date().toLocaleDateString('sv-SE').slice(0, 7);
          const nextPaid = !(exp.isPaid && exp.paidMonth === month);
          const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          return {
            ...exp,
            isPaid: nextPaid,
            paidDate: nextPaid ? todayFormatted : undefined,
            paidMonth: nextPaid ? month : undefined
          };
        }
        return exp;
      });

      return {
        ...prev,
        financialReport: {
          ...currentReport,
          monthlyExpenses: updatedExpenses
        }
      };
    });
  };

  const completedCount = state.todayBlocks.filter((b) => b.isDone).length;

  const tabLabels = {
    today: 'Sikat Hari Ini',
    nextgo: 'Abis Ini Ngapain?',
    lanes: 'Markas Project',
    waiting: 'Radar Tagihan',
    money: 'Cek Dompet & Cuan',
    deepwork: 'Kamar Fokus'
  };

  if (!isLoaded && isAuthenticated) {
    return <div className="p-8" role="status">Memuat workspace…</div>;
  }

  if (!isAuthenticated) {
    return <PinLockScreen onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111111] flex flex-col lg:flex-row font-sans selection:bg-[#111111] selection:text-white">
      
      {/* 1. Sleek Left Dashboard Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen((prev) => !prev)}
        onOpenFollowUp={() => {
          setTargetFollowUpProject(null);
          setIsFollowUpOpen(true);
        }}
        onOpenFinanceInput={() => setIsFinanceInputOpen(true)}
        onOpenInvoice={() => {
          setTargetInvoiceProject(null);
          setIsInvoiceOpen(true);
        }}
        todayCompletedCount={completedCount}
        todayTotalCount={state.todayBlocks.length}
        syncLabel={syncStatus?.cloudRedisConnected ? 'Cloud tersinkron' : syncStatus?.isOnline ? 'Server lokal' : 'Offline'}
        waitingCount={state.waitingItems.length}
        financialReport={state.financialReport}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* 2. Main Dashboard Content View */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#fafafa]">
        
        {/* Top Agency Editorial Breadcrumb Bar */}
        {/* Clean & Elegant Minimalist Header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3 border-b border-zinc-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-20 transition-all">
          {/* Left: Sidebar Toggle, Brand, Breadcrumb & Subtle Live Dot */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSidebar}
              title={isSidebarCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <div className="h-3.5 w-px bg-zinc-200" />

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-zinc-900 tracking-tight">Daru.OS</span>
              <span className="text-zinc-300 font-normal">/</span>
              <span className="font-medium text-zinc-600">{tabLabels[activeTab]}</span>
            </div>

            <div className="flex items-center gap-1.5 pl-1.5" title={syncStatus?.cloudRedisConnected ? 'Cloud Online' : syncStatus?.isOnline ? 'Server Lokal' : 'Mode Offline'}>
              <span className={`w-1.5 h-1.5 rounded-full ${syncStatus?.cloudRedisConnected ? 'bg-emerald-500 ring-2 ring-emerald-100' : syncStatus?.isOnline ? 'bg-blue-500 ring-2 ring-blue-100' : 'bg-zinc-400'}`} />
              <span className="text-[11px] text-zinc-400 font-sans hidden xl:inline">
                {syncStatus?.cloudRedisConnected ? 'Online' : syncStatus?.isOnline ? 'Lokal' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Right: Focused & Elegant Action Bar */}
          <div className="flex items-center gap-2">
            {/* Primary Action: Catat Kas */}
            <button
              onClick={() => {
                soundManager.playClick();
                setIsFinanceInputOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-medium shadow-xs transition-all active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Kas</span>
            </button>

            {/* Secondary Action: Buat Invoice */}
            <button
              onClick={() => {
                soundManager.playClick();
                setTargetInvoiceProject(null);
                setIsInvoiceOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100/80 hover:bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200/60 transition-all active:scale-98"
            >
              <Receipt className="w-3.5 h-3.5 text-zinc-500" />
              <span>Invoice</span>
            </button>

            <div className="h-3.5 w-px bg-zinc-200 mx-0.5" />

            {/* Subtle Utility Actions */}
            <button
              onClick={() => {
                soundManager.playClick();
                setTargetFollowUpProject(null);
                setIsFollowUpOpen(true);
              }}
              title="Template Follow Up WA"
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setIsCopilotOpen((prev) => !prev);
              }}
              title="Buka Partner AI (⌘K)"
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 text-xs"
            >
              <Bot className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                localStorage.removeItem(AUTH_STORAGE_KEY);
                setIsAuthenticated(false);
              }}
              title="Kunci Layar (Lock Device)"
              className="p-1.5 rounded-full hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        {syncStatus?.error && <div role="alert" className="px-6 py-3 bg-amber-50 text-amber-900 text-sm">{syncStatus.error}</div>}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
          
          {/* Top Quick Status (Only show on Today & Board tabs) */}
          {(activeTab === 'today' || activeTab === 'lanes') && (
            <TopQuickStats
              todayPursuit={state.todayPursuit}
              onTogglePursuit={handleTogglePursuit}
              quickStats={state.quickStats}
              projects={state.projects}
              onSelectTab={(tab) => setActiveTab(tab as any)}
              financialReport={state.financialReport}
            />
          )}

          {/* TAB 1: TODAY SUPER SMALL VIEW */}
          {activeTab === 'today' && (
            <div className="space-y-6">
              <TodaySuperSmallView
                todayBlocks={state.todayBlocks}
                onToggleBlock={handleToggleBlock}
                onStartFocus={handleStartFocus}
                onStartMultiFocus={(blocks) => {
                  if (!blocks.length) return;
                  handleStartFocus(blocks[0]);
                  setFocusQueue(blocks.slice(1));
                }}
              />

              <DecisionAnchorBox projects={state.projects} onSelectAction={handleStartFocusOnProject} />
            </div>
          )}

          {/* TAB: NEXT SHOULD BE GO (STRATEGIC DIRECTIVE MATRIX) */}
          {activeTab === 'nextgo' && (
            <NextShouldBeGoView
              state={state}
              onStartFocus={handleStartFocus}
              onSelectTab={(tab) => setActiveTab(tab as any)}
              onToggleBlock={handleToggleBlock}
            />
          )}

          {/* TAB 2: WORKFLOW LANES */}
          {activeTab === 'lanes' && (
            <WorkflowLanes
              projects={state.projects}
              onUpdateProject={handleUpdateProject}
              onAddProject={handleAddProject}
              onStartFocusOnProject={handleStartFocusOnProject}
              onOpenFollowUpForProject={handleOpenFollowUpForItem}
              onOpenInvoiceForProject={(proj) => {
                setTargetInvoiceProject(proj);
                setIsInvoiceOpen(true);
              }}
            />
          )}

          {/* TAB 3: WAITING RADAR VIEW */}
          {activeTab === 'waiting' && (
            <WaitingRadarView
              waitingItems={state.waitingItems}
              onAddWaitingItem={handleAddWaitingItem}
              onResolveItem={handleResolveWaitingItem}
              onOpenFollowUpModal={handleOpenFollowUpForItem}
            />
          )}

          {/* TAB 4: MONEY & CASHFLOW MATRIX */}
          {activeTab === 'money' && (
            <MoneyCashflowView
              projects={state.projects}
              financialReport={state.financialReport}
              onOpenFollowUp={handleOpenFollowUpForItem}
              onOpenFinanceInput={() => setIsFinanceInputOpen(true)}
              onToggleExpensePaid={handleToggleExpensePaid}
              onUpdateMonthlyTarget={(target) => setState(prev => ({ ...prev, financialReport: { ...prev.financialReport, monthlyIncomeTarget: target } }))}
            />
          )}

          {/* TAB 5: FOCUS STUDIO POMODORO */}
          {activeTab === 'deepwork' && (
            <FocusStudio
              todayBlocks={state.todayBlocks}
              activeBlock={activeFocusBlock}
              setActiveBlock={setActiveFocusBlock}
              onCompleteBlock={(id) => {
                setState(prev => ({ ...prev, todayBlocks: prev.todayBlocks.map(block => block.id === id ? { ...block, isDone: true } : block) }));
                if (focusQueue.length) {
                  setActiveFocusBlock(focusQueue[0]);
                  setFocusQueue(focusQueue.slice(1));
                }
              }}
              queuedCount={focusQueue.length}
            />
          )}

        
          {/* HIGH-CONTRAST BLACK FOOTER BANNER (Exact Jobforge Signature Footer!) */}
          <section className="bg-[#0c0c0e] text-white rounded-[32px] p-8 sm:p-14 mt-12 mb-8 border border-zinc-800 text-center relative overflow-hidden shadow-2xl select-none">
            {/* Ambient subtle glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-zinc-800/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

            {/* Giant Bold Headline with Italic Accent */}
            <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight uppercase font-sans">
                YUK <span className="lead-italic font-normal normal-case text-amber-300">Tuntasin</span> TARGET BULAN INI!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-200 font-medium max-w-lg mx-auto leading-relaxed">
                Masih ada {state.todayBlocks.filter(block => !block.isDone).length} blok fokus dan {state.waitingItems.length} item radar. Pilih satu langkah yang bisa dibereskan sekarang.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8 relative z-10">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('today');
                }}
                className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all shadow-lg flex items-center gap-2"
              >
                <span>Sikat Kerja Hari Ini </span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsFinanceInputOpen(true);
                }}
                className="px-6 py-3 rounded-full bg-zinc-900 text-white font-bold text-xs border border-zinc-700 hover:bg-zinc-800 transition-all shadow-md"
              >
                + Catat Duit Masuk 
              </button>
            </div>

            {/* Brand footer line */}
            <div className="mt-10 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-300 font-medium relative z-10">
              <span>DARU WORK OS // AUTONOMOUS OPERATING SYSTEM</span>
              <span>EST. 2026 • SOLO MULTITASK ARCHITECTURE</span>
            </div>
          </section>
        </main>
      </div>

      {/* Instant Invoice Generator & Printable PDF Modal */}
      <InvoiceGeneratorModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        projects={state.projects}
        initialProject={targetInvoiceProject}
        invoices={state.invoices}
        onSaveInvoice={(newInv) => {
          setState((prev) => ({
            ...prev,
            invoices: [newInv, ...(prev.invoices || []).filter(invoice => invoice.id !== newInv.id)]
          }));
        }}
      />

      {/* Manual Financial Input & Receipt Photo Upload Modal */}
      <QuickFinanceInputModal
        isOpen={isFinanceInputOpen}
        onClose={() => setIsFinanceInputOpen(false)}
        projects={state.projects}
        financialReport={state.financialReport}
        onSaveTransaction={handleSaveTransaction}
        onUpdateAllBalances={handleUpdateAllBalances}
      />

      {/* Follow-up Message Generator & Copas Modal */}
      <FollowUpModal
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        selectedProject={targetFollowUpProject}
        allProjects={state.projects}
        allWaitingItems={state.waitingItems}
      />

      {/* Partner Copilot Sidebar */}
      <DaruPartnerCopilot
        projects={state.projects}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        financialReport={state.financialReport}
        onSelectAction={() => {
          setActiveTab('today');
        }}
      />

      {/* Obsidian Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={state}
        onUseServerState={(serverState) => { editedDuringLoad.current = false; setStateValue(serverState); }}
      />

    </div>
  );
}

export default App;
