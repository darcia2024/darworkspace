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
    <div className="min-h-screen bg-[#f1eddf] text-[#252520] flex flex-col lg:flex-row font-sans selection:bg-[#292a24]/20 selection:text-[#252520]">
      
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
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#f1eddf]">
        
        {/* Top Agency Editorial Breadcrumb Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 border-b border-[#ded7c8] bg-[#f1eddf]/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-mono text-[#59594f]">
            <span className="text-[#252520] font-semibold">Workspace</span>
            <span className="text-[#ded7c8]">/</span>
            <span className="text-[#252520]">{tabLabels[activeTab]}</span>
            <span className="text-[#ded7c8]">/</span>
            <span className="px-2 py-0.5 rounded-full bg-[#e3e6c7] text-[#252520] text-[10px] font-mono font-bold tracking-wide">PROD</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setTargetInvoiceProject(null);
                setIsInvoiceOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#fffdf5] hover:bg-[#eae5d8] text-[#252520] border border-[#ded7c8] text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Receipt className="w-3.5 h-3.5 text-[#252520]" />
              <span>+ Buat Invoice ⌘I</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setIsFinanceInputOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#292a24] hover:bg-[#1a1b16] text-[#fffdf5] border border-[#292a24] text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
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
              className="px-3 py-1.5 rounded-lg bg-[#fffdf5] hover:bg-[#eae5d8] text-[#252520] border border-[#ded7c8] text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#59594f]" />
              <span>Copas WA</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setIsCopilotOpen((prev) => !prev);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#d0b4e9]/30 hover:bg-[#d0b4e9]/50 text-[#252520] border border-[#d0b4e9] text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Bot className="w-3.5 h-3.5 text-[#59594f]" />
              <span>Partner ⌘K</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                localStorage.removeItem(AUTH_STORAGE_KEY);
                setIsAuthenticated(false);
              }}
              title="Kunci Layar (Lock Device)"
              className="p-2 rounded-lg bg-[#fffdf5] hover:bg-rose-100 text-[#59594f] hover:text-rose-600 border border-[#ded7c8] text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
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
