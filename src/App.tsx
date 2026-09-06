import React, { useState, useEffect } from 'react';
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
import { loadState, saveState } from './utils/storage';
import { apiService } from './services/api';
import { DaruWorkOSState, TodayBlock, ProjectCard, WaitingItem, TransactionRecord, AssetAccount, InvoiceRecord, ActiveTabType } from './types';
import { soundManager } from './utils/audio';
import { ChevronRight, Sparkles, MessageSquare, Bot, Plus, Receipt, Lock } from 'lucide-react';
import { PinLockScreen, AUTH_STORAGE_KEY } from './components/PinLockScreen';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'AUTHENTICATED_120426';
    } catch {
      return false;
    }
  });

  const [state, setState] = useState<DaruWorkOSState>(loadState);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('today');
  const [activeFocusBlock, setActiveFocusBlock] = useState<TodayBlock | null>(null);

  // Load from server if available on mount
  useEffect(() => {
    apiService.loadInitialState().then((serverState) => {
      if (serverState) {
        setState(serverState);
      }
    });
  }, []);

  // Modals state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isFinanceInputOpen, setIsFinanceInputOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [targetFollowUpProject, setTargetFollowUpProject] = useState<ProjectCard | WaitingItem | null>(null);
  const [targetInvoiceProject, setTargetInvoiceProject] = useState<ProjectCard | null>(null);

  // Autosave via apiService (LocalStorage + Backend SQLite + Obsidian)
  useEffect(() => {
    apiService.saveState(state);
  }, [state]);

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
      todayPursuit: prev.todayPursuit.map((p) => (p.id === id ? { ...p, isDone: !p.isDone } : p)),
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
    setActiveFocusBlock(block);
    setActiveTab('deepwork');
  };

  const handleStartFocusOnProject = (project: ProjectCard) => {
    const existing = state.todayBlocks.find((b) => b.projectName.toLowerCase().includes(project.name.toLowerCase()));
    if (existing) {
      setActiveFocusBlock(existing);
    } else {
      const tempBlock: TodayBlock = {
        id: `tb-${Date.now()}`,
        blockType: 'Deep Work 1',
        projectName: project.name,
        action: project.nextAction,
        timeboxMinutes: 50,
        isDone: false,
        rule: project.rule || 'Fokus eksekusi next action konkrit.'
      };
      setActiveFocusBlock(tempBlock);
    }
    setActiveTab('deepwork');
  };

  // Handlers for Projects
  const handleUpdateProject = (updatedProject: ProjectCard) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    }));
  };

  const handleAddProject = (newProject: Omit<ProjectCard, 'id'>) => {
    const project: ProjectCard = {
      ...newProject,
      id: `p-${Date.now()}`
    };
    setState((prev) => ({
      ...prev,
      projects: [project, ...prev.projects]
    }));
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
    setState((prev) => ({
      ...prev,
      waitingItems: prev.waitingItems.filter((w) => w.id !== id),
      quickStats: {
        ...prev.quickStats,
        waitingPaymentKickoff: Math.max(0, prev.quickStats.waitingPaymentKickoff - 1)
      }
    }));
  };

  // Financial Handlers
  const handleSaveTransaction = (
    txData: Omit<TransactionRecord, 'id' | 'createdAt'>,
    linkedProjectUpdates?: { projectId: string; amountAdded: number }
  ) => {
    const newTx: TransactionRecord = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setState((prev) => {
      const currentReport = prev.financialReport;
      
      const updatedAccounts = currentReport.accounts.map((acc) => {
        if (acc.name === txData.accountName) {
          let newBal = acc.balance;
          if (txData.type === 'income') newBal += txData.amount;
          else if (txData.type === 'expense') newBal -= txData.amount;
          else if (txData.type === 'transfer') newBal -= txData.amount;
          else if (txData.type === 'balance_update') newBal = txData.amount;
          return { ...acc, balance: newBal, isLatest: true, lastUpdated: 'Live Just Now' };
        }
        if (txData.type === 'transfer' && acc.name === txData.toAccountName) {
          return { ...acc, balance: acc.balance + txData.amount, isLatest: true, lastUpdated: 'Live Just Now' };
        }
        return acc;
      });

      const newTotal = updatedAccounts.reduce((sum, a) => sum + a.balance, 0);
      const newMode = newTotal < 4000000 
        ? 'RED MODE — CASH DEFENSE' 
        : newTotal < 10000000 
        ? 'YELLOW MODE — CAUTION' 
        : 'GREEN MODE — GROWTH';

      let updatedProjects = prev.projects;
      if (linkedProjectUpdates) {
        updatedProjects = prev.projects.map((p) => {
          if (p.id === linkedProjectUpdates.projectId) {
            const newPaid = (p.paidNumeric || 0) + linkedProjectUpdates.amountAdded;
            const newUnpaid = Math.max(0, (p.nominalNumeric || 0) - newPaid);
            const isFull = newPaid >= (p.nominalNumeric || 0);
            return {
              ...p,
              paidNumeric: newPaid,
              unpaidNumeric: newUnpaid,
              paymentStatus: isFull ? 'Paid' : 'Expected',
              status: p.status.includes('Waiting') ? 'Doing' : p.status,
              boardColumn: p.boardColumn === 'WAITING' ? 'DOING' : p.boardColumn
            };
          }
          return p;
        });
      }

      const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const newTrajectory = [
        ...currentReport.trajectory,
        { date: todayStr, balance: newTotal, note: txData.description }
      ];

      return {
        ...prev,
        projects: updatedProjects,
        financialReport: {
          ...currentReport,
          accounts: updatedAccounts,
          totalLiquidBalance: newTotal,
          modeStatus: newMode,
          transactions: [newTx, ...(currentReport.transactions || [])],
          trajectory: newTrajectory
        }
      };
    });
  };

  const handleUpdateAllBalances = (newAccounts: AssetAccount[]) => {
    setState((prev) => {
      const currentReport = prev.financialReport;
      const newTotal = newAccounts.reduce((sum, a) => sum + a.balance, 0);
      const newMode = newTotal < 4000000 
        ? 'RED MODE — CASH DEFENSE' 
        : newTotal < 10000000 
        ? 'YELLOW MODE — CAUTION' 
        : 'GREEN MODE — GROWTH';

      const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const newTrajectory = [
        ...currentReport.trajectory,
        { date: todayStr, balance: newTotal, note: 'Multi-account Sync' }
      ];

      return {
        ...prev,
        financialReport: {
          ...currentReport,
          accounts: newAccounts,
          totalLiquidBalance: newTotal,
          modeStatus: newMode,
          trajectory: newTrajectory
        }
      };
    });
  };

  const completedCount = state.todayBlocks.filter((b) => b.isDone).length;

  const tabLabels = {
    today: 'Command Hub // Today Execution',
    nextgo: 'Next Should Be Go // Strategic Directive Matrix',
    lanes: 'Board & Lanes // Project Workspace',
    waiting: 'Radar Pipeline // Pending Deals & Kickoffs',
    money: 'Cashflow Matrix // Financial Telemetry',
    deepwork: 'Focus Engine // Deep Work Pomodoro'
  };

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
        waitingCount={state.waitingItems.length}
        financialReport={state.financialReport}
      />

      {/* 2. Main Dashboard Content View */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#fafafa]">
        
        {/* Top Agency Editorial Breadcrumb Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="text-[#111111] font-bold">Daru.OS</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-800 font-medium">{tabLabels[activeTab]}</span>
            <span className="text-zinc-300">/</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ecfccb] text-[#3f6212] text-[10px] font-mono font-bold border border-[#d9f99d]">LIVE ACTIVE</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setTargetInvoiceProject(null);
                setIsInvoiceOpen(true);
              }}
              className="pill-white text-xs font-mono flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5 text-zinc-700" />
              <span>+ Buat Invoice ⌘I</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setIsFinanceInputOpen(true);
              }}
              className="pill-black text-xs font-mono flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Catat Kas</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setTargetFollowUpProject(null);
                setIsFollowUpOpen(true);
              }}
              className="pill-white text-xs font-mono flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
              <span>Copas WA</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setIsCopilotOpen((prev) => !prev);
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#fce7f3] hover:bg-[#fbcfe8] text-[#be185d] border border-[#fbcfe8] text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Partner ⌘K</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                localStorage.removeItem(AUTH_STORAGE_KEY);
                setIsAuthenticated(false);
              }}
              title="Kunci Layar (Lock Device)"
              className="p-2 rounded-full bg-white hover:bg-rose-50 text-zinc-400 hover:text-rose-600 border border-zinc-200 text-xs transition-all flex items-center justify-center shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
          
          {/* Top Quick Status (Only show on Today & Board tabs) */}
          {(activeTab === 'today' || activeTab === 'lanes') && (
            <TopQuickStats
              todayPursuit={state.todayPursuit}
              onTogglePursuit={handleTogglePursuit}
              quickStats={state.quickStats}
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
              />

              <DecisionAnchorBox
                onSelectAction={(target) => {
                  const matched = state.todayBlocks.find(b => target.toLowerCase().includes(b.projectName.toLowerCase()));
                  if (matched) {
                    handleStartFocus(matched);
                  } else {
                    setActiveTab('lanes');
                  }
                }}
              />
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
            />
          )}

          {/* TAB 5: FOCUS STUDIO POMODORO */}
          {activeTab === 'deepwork' && (
            <FocusStudio
              todayBlocks={state.todayBlocks}
              activeBlock={activeFocusBlock}
              setActiveBlock={setActiveFocusBlock}
              onCompleteBlock={(id) => {
                handleToggleBlock(id);
                soundManager.playCompletionChime();
              }}
            />
          )}

        
          {/* HIGH-CONTRAST BLACK FOOTER BANNER (Exact Jobforge Signature Footer!) */}
          <section className="bg-[#0c0c0e] text-white rounded-[32px] p-8 sm:p-14 mt-12 mb-8 border border-zinc-800 text-center relative overflow-hidden shadow-2xl select-none">
            {/* Ambient subtle glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-zinc-800/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

            {/* Floating Playful Pastel Sticker Tags */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 relative z-10">
              <span className="sticker-pill sticker-pink transform -rotate-2 text-xs">
                Sprint Modul 1 LMS
              </span>
              <span className="sticker-pill sticker-lime transform rotate-3 text-xs">
                DreamMecca Handover
              </span>
              <span className="sticker-pill sticker-yellow transform -rotate-1 text-xs">
                KAEL POS Multi-Tenant
              </span>
              <span className="sticker-pill sticker-blue transform rotate-2 text-xs">
                Barber Kasir Lunas
              </span>
              <span className="sticker-pill sticker-apricot transform -rotate-3 text-xs">
                Mandiri Live Rp9,78M
              </span>
            </div>

            {/* Giant Bold Headline with Italic Accent */}
            <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight uppercase font-sans">
                YUK <span className="lead-italic font-normal normal-case text-amber-300">Tuntasin</span> TARGET BULAN INI!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-200 font-medium max-w-lg mx-auto leading-relaxed">
                Udah jalan mantap banget bro! Sisa Rp3,5 Juta lagi buat tembus target Rp10 Juta September. Gaskeun tuntaskan satu-satu!
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
                <span>Sikat Kerja Hari Ini 🚀</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsFinanceInputOpen(true);
                }}
                className="px-6 py-3 rounded-full bg-zinc-900 text-white font-bold text-xs border border-zinc-700 hover:bg-zinc-800 transition-all shadow-md"
              >
                + Catat Duit Masuk 💰
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
        onSaveInvoice={(newInv) => {
          setState((prev) => ({
            ...prev,
            invoices: [newInv, ...(prev.invoices || [])]
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
      />

    </div>
  );
}

export default App;
