import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Wrench, 
  TrendingUp, 
  Package, 
  Activity, 
  Archive,
  ArrowRight,
  Filter,
  Columns,
  MessageSquare,
  GripVertical,
  Plus,
  X,
  Receipt,
  ChevronRight,
  Check,
  Search,
  Edit3,
  MoreHorizontal,
  RotateCcw
} from 'lucide-react';
import { ProjectCard, LaneType, BoardColumn, PriorityLevel } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ProjectEditor } from './ProjectEditor';

interface WorkflowLanesProps {
  projects: ProjectCard[];
  onUpdateProject: (project: ProjectCard) => void;
  onAddProject?: (project: Omit<ProjectCard, 'id'>) => void;
  onDeleteProject?: (projectId: string) => void;
  onStartFocusOnProject: (project: ProjectCard) => void;
  onOpenFollowUpForProject?: (project: ProjectCard) => void;
  onOpenInvoiceForProject?: (project: ProjectCard) => void;
}

export const WorkflowLanes: React.FC<WorkflowLanesProps> = ({
  projects,
  onUpdateProject,
  onAddProject,
  onDeleteProject,
  onStartFocusOnProject,
  onOpenFollowUpForProject,
  onOpenInvoiceForProject
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'lanes'>('board');
  const [editingProject, setEditingProject] = useState<ProjectCard | null>(null);
  const [selectedLane, setSelectedLane] = useState<string>('ALL');
  
  // Drag and drop state
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<BoardColumn | null>(null);
  const [dragOverLane, setDragOverLane] = useState<LaneType | null>(null);

  // Quick Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProjectLane, setNewProjectLane] = useState<LaneType>('client_delivery');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAction, setNewProjectAction] = useState('');
  const [newProjectValue, setNewProjectValue] = useState('');
  const [newProjectPriority, setNewProjectPriority] = useState<PriorityLevel>('P1');
  const [newProjectCol, setNewProjectCol] = useState<BoardColumn>('QUEUE');

  // Board Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | PriorityLevel>('ALL');
  const [filterLane, setFilterLane] = useState<string>('ALL');

  // Inline Quick Edit Next Action State
  const [editingNextActionId, setEditingNextActionId] = useState<string | null>(null);
  const [nextActionInput, setNextActionInput] = useState('');

  // Quick Move Popover Menu State
  const [openMoveMenuId, setOpenMoveMenuId] = useState<string | null>(null);

  // Close move menu on outside click
  useEffect(() => {
    if (!openMoveMenuId) return;
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.move-menu-container')) {
        setOpenMoveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [openMoveMenuId]);

  const laneConfigs: Record<LaneType, { title: string; subtitle: string; icon: any; tag: string; rule: string; color: string }> = {
    client_delivery: {
      title: 'Lane 1 - Client Delivery',
      subtitle: 'Sudah Deal / Sudah Ada Kewajiban Deliverable Aktif',
      icon: Briefcase,
      tag: 'LANE_01',
      rule: 'PRIORITAS #1: Lunasin kewajiban & amankan DP sebelum buka scope baru.',
      color: 'border-[#305d46]/30 text-[#305d46] bg-[#e2ecdc]'
    },
    maintenance: {
      title: 'Lane 2 - Maintenance',
      subtitle: 'Timebox Ketat: Max 1-2 Jam Per Sesi Support & Retainer',
      icon: Wrench,
      tag: 'LANE_02',
      rule: 'TIMEBOX ONLY: Jangan biarkan maintenance makan jatah deep work berbayar.',
      color: 'border-[#3c6b8c]/30 text-[#2b5675] bg-[#e2edf9]'
    },
    bizdev: {
      title: 'Lane 3 - Business Development / Sales',
      subtitle: 'Outreach Prospek, Portfolio Showcase, Lead Pipeline',
      icon: TrendingUp,
      tag: 'LANE_03',
      rule: 'GROWTH ENGINE: Sisihkan 30-45 menit/hari untuk kontak prospek.',
      color: 'border-[#b87e2b]/30 text-[#925f18] bg-[#fdf3d8]'
    },
    own_product: {
      title: 'Lane 4 - Core Product (SaaS & Assets)',
      subtitle: 'Internal Products, Platform Engine, Template High-Ticket',
      icon: Package,
      tag: 'LANE_04',
      rule: 'EQUITY BUILDING: Bangun recurring asset yang bisa dijual berulang.',
      color: 'border-[#4e3a68]/30 text-[#4e3a68] bg-[#f0e6f9]'
    },
    operations: {
      title: 'Lane 5 - Daily Life & Operations',
      subtitle: 'Audit Kas Harian, Backup Database, Olahraga, Rumah Tangga',
      icon: Activity,
      tag: 'LANE_05',
      rule: 'HEALTH & DISCIPLINE: Rekap keuangan & sinkron saldo tiap malam.',
      color: 'border-zinc-300 text-zinc-800 bg-zinc-100 font-bold'
    },
    parking_lot: {
      title: 'Lane 6 - Parking Lot (Ide Disimpan)',
      subtitle: 'Semua ide liar/distraksi yang belum waktunya dieksekusi',
      icon: Archive,
      tag: 'LANE_06',
      rule: 'ANTI DISTRAKSI: Parkir di sini dulu biar otak tenang.',
      color: 'border-[#fed7aa] text-[#9a3412] bg-[#ffedd5] font-bold'
    },
  };

  const allLanes: LaneType[] = ['client_delivery', 'maintenance', 'bizdev', 'own_product', 'operations', 'parking_lot'];

  const boardColumns: { id: BoardColumn; label: string; desc: string; color: string }[] = [
    { id: 'DOING', label: ' SEDANG DIGARAP', desc: 'Fokus aktif lo hari ini', color: 'border-[#305d46]/40 text-[#305d46]' },
    { id: 'WAITING', label: '⏳ LAGI NUNGGU', desc: 'Menunggu respon / pembayaran klien', color: 'border-[#b87e2b]/40 text-[#925f18]' },
    { id: 'QUEUE', label: ' ANTRIAN KICKOFF', desc: 'Siap dieksekusi giliran berikutnya', color: 'border-zinc-200 text-[#111111]' },
    { id: 'DONE', label: ' PEKERJAAN SELESAI', desc: 'Status pembayaran dilihat terpisah', color: 'border-emerald-300 text-emerald-800' },
    { id: 'PARKED', label: 'DISIMPAN DULU', desc: 'Belum dijadwalkan untuk dikerjakan', color: 'border-zinc-300 text-zinc-700' }
  ];

  const formatRupiah = (num: number) => {
    if (!num || num === 0) return 'Rp0';
    return `Rp${num.toLocaleString('id-ID')}`;
  };

  // Drag Handlers for Board
  const handleDragStart = (e: React.DragEvent, project: ProjectCard) => {
    e.dataTransfer.setData('text/plain', project.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedProjectId(project.id);
    soundManager.playClick();
  };

  const handleDragOverColumn = (e: React.DragEvent, colId: BoardColumn) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDropColumn = (e: React.DragEvent, targetCol: BoardColumn) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain') || draggedProjectId;
    setDragOverColumn(null);
    setDraggedProjectId(null);

    if (!projectId) return;

    const project = projects.find(p => p.id === projectId);
    if (!project || project.boardColumn === targetCol) return;

    let newStatus = project.status;
    if (targetCol === 'DOING') newStatus = 'Doing';
    else if (targetCol === 'QUEUE') newStatus = 'Queue';
    else if (targetCol === 'WAITING') newStatus = (project.paidNumeric || 0) > 0 ? 'Waiting Approval' : 'Waiting Payment';
    else if (targetCol === 'PARKED') newStatus = 'Parked';
    else if (targetCol === 'DONE') newStatus = 'Done';

    onUpdateProject({
      ...project,
      boardColumn: targetCol,
      status: newStatus
    });

    const safeConfetti = (opts: confetti.Options) => {
      try {
        if (typeof confetti === 'function') {
          confetti(opts);
        } else if (typeof (confetti as any)?.default === 'function') {
          (confetti as any).default(opts);
        }
      } catch (e) {
        console.warn('Confetti skipped:', e);
      }
    };

    try { soundManager.playCompletionChime(); } catch {}
    if (targetCol === 'DOING' || targetCol === 'DONE') {
      safeConfetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
  };

  // Drag Handlers for Lanes
  const handleDragOverLane = (e: React.DragEvent, laneKey: LaneType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverLane !== laneKey) {
      setDragOverLane(laneKey);
    }
  };

  const handleDropLane = (e: React.DragEvent, targetLane: LaneType) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain') || draggedProjectId;
    setDragOverLane(null);
    setDraggedProjectId(null);

    if (!projectId) return;

    const project = projects.find(p => p.id === projectId);
    if (!project || project.lane === targetLane) return;

    const updatedProject: ProjectCard = {
      ...project,
      lane: targetLane,
      boardColumn: targetLane === 'parking_lot' ? 'PARKED' : project.boardColumn,
      status: targetLane === 'parking_lot' ? 'Parked' : project.status
    };

    onUpdateProject(updatedProject);
    try { soundManager.playCompletionChime(); } catch {}
    try {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
      }
    } catch {}
  };

  // Quick Switch Column directly inside Card
  const handleSwitchColumn = (project: ProjectCard, newCol: BoardColumn) => {
    try { soundManager.playClick(); } catch {}
    let newStatus = project.status;
    if (newCol === 'DOING') newStatus = 'Doing';
    else if (newCol === 'QUEUE') newStatus = 'Queue';
    else if (newCol === 'WAITING') newStatus = ((project.paidNumeric || 0) > 0 ? 'Waiting Approval' : 'Waiting Payment');
    else if (newCol === 'PARKED') newStatus = 'Parked';
    else if (newCol === 'DONE') newStatus = 'Done';

    onUpdateProject({
      ...project,
      boardColumn: newCol,
      status: newStatus
    });

    if (newCol === 'DOING' || newCol === 'DONE') {
      try { soundManager.playCompletionChime(); } catch {}
      try {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
        } else if (typeof (confetti as any)?.default === 'function') {
          (confetti as any).default({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
        }
      } catch (e) {
        console.warn('Confetti skipped:', e);
      }
    }
  };

  const priorityColorMap: Record<PriorityLevel, { bg: string; text: string; border: string }> = {
    P1: { bg: 'bg-rose-50 hover:bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
    P2: { bg: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    P3: { bg: 'bg-zinc-100 hover:bg-zinc-200', text: 'text-zinc-700', border: 'border-zinc-300' },
    PARKED: { bg: 'bg-zinc-100 hover:bg-zinc-200', text: 'text-zinc-500', border: 'border-zinc-300' }
  };

  const getPaymentBadgeClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid' || s === 'lunas') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('waiting') || s.includes('partial') || s.includes('belum') || s.includes('follow-up')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (s.includes('recurring') || s.includes('pipeline')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-zinc-100 text-zinc-600 border-zinc-200';
  };

  const handleCyclePriority = (e: React.MouseEvent, project: ProjectCard) => {
    e.stopPropagation();
    soundManager.playClick();
    const nextMap: Record<PriorityLevel, PriorityLevel> = {
      P1: 'P2',
      P2: 'P3',
      P3: 'P1',
      PARKED: 'P1'
    };
    const next = nextMap[project.priority] || 'P1';
    onUpdateProject({
      ...project,
      priority: next
    });
  };

  const handleStartEditNextAction = (e: React.MouseEvent, project: ProjectCard) => {
    e.stopPropagation();
    soundManager.playClick();
    setEditingNextActionId(project.id);
    setNextActionInput(project.nextAction);
  };

  const handleSaveNextAction = (project: ProjectCard) => {
    soundManager.playClick();
    const trimmed = nextActionInput.trim();
    if (trimmed && trimmed !== project.nextAction) {
      onUpdateProject({
        ...project,
        nextAction: trimmed
      });
    }
    setEditingNextActionId(null);
  };

  const handleCancelEditNextAction = () => {
    setEditingNextActionId(null);
  };

  const filteredBoardProjects = useMemo(() => {
    return projects.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.nextAction.toLowerCase().includes(q) ||
          (p.currentGoal && p.currentGoal.toLowerCase().includes(q)) ||
          (p.valueText && p.valueText.toLowerCase().includes(q)) ||
          (p.status && p.status.toLowerCase().includes(q)) ||
          (p.lane && p.lane.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (priorityFilter !== 'ALL' && p.priority !== priorityFilter) {
        return false;
      }
      if (filterLane !== 'ALL' && p.lane !== filterLane) {
        return false;
      }
      return true;
    });
  }, [projects, searchQuery, priorityFilter, filterLane]);

  // Submit New Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const normalized = newProjectName.trim().toLowerCase();
    if (projects.some(p => p.name.trim().toLowerCase() === normalized)) {
      alert(`Project "${newProjectName.trim()}" sudah ada. Gunakan nama yang berbeda atau buka kartu project yang sudah ada.`);
      return;
    }
    const nominal = Number(newProjectValue || 0);
    if (!Number.isSafeInteger(nominal) || nominal < 0) { alert('Isi nilai kontrak sebagai nominal rupiah bulat, minimal nol.'); return; }

    const newProject: Omit<ProjectCard, 'id'> = {
      name: newProjectName.trim(),
      lane: newProjectLane,
      boardColumn: newProjectCol,
      status: newProjectCol === 'DOING' ? 'Doing' : newProjectCol === 'WAITING' ? 'Waiting Payment' : newProjectCol === 'PARKED' ? 'Parked' : 'Queue',
      paymentStatus: newProjectLane === 'client_delivery' ? 'Expected' : 'Free',
      valueText: nominal ? `Rp${nominal.toLocaleString('id-ID')}` : 'Tanpa nilai kontrak',
      nominalNumeric: nominal,
      paidNumeric: 0,
      unpaidNumeric: nominal,
      priority: newProjectPriority,
      currentGoal: newProjectName.trim(),
      nextAction: newProjectAction.trim() || 'Mulai kickoff & susun spesifikasi.',
      rule: laneConfigs[newProjectLane]?.rule || ''
    };

    if (onAddProject) {
      onAddProject(newProject);
    } else {
      onUpdateProject({ ...newProject, id: `p-${Date.now()}` });
    }

    soundManager.playCompletionChime();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setIsAddModalOpen(false);
    setNewProjectName('');
    setNewProjectAction('');
    setNewProjectValue('');
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in pb-12">
      
      {/* Header with Switcher */}
      <div className="bento-card p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-zinc-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <h3 className="text-xl font-extrabold text-[#111111] tracking-tight font-sans">
              <span className="lead-italic font-normal">Project</span> Workspace & Kanban
            </h3>
            <span className="sticker-pill sticker-lime text-[9px]">{viewMode === 'lanes' ? '6_LANES_MODE' : 'KANBAN_BOARD'}</span>
          </div>
          <p className="text-xs text-zinc-600 font-normal mt-1">
            Kelola beban kerja per Lane strategis • Pindahkan atau atur kolom • Direct Focus & WhatsApp Trigger
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsAddModalOpen(true);
            }}
            className="pill-black px-4 py-2 font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Project</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200">
            <button
              onClick={() => { soundManager.playClick(); setViewMode('lanes'); }}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-semibold ${
                viewMode === 'lanes' ? 'pill-black shadow-xs' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Lanes View</span>
            </button>
            <button
              onClick={() => { soundManager.playClick(); setViewMode('board'); }}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-semibold ${
                viewMode === 'board' ? 'pill-black shadow-xs' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Board View</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: FUNCTIONAL 6 WORKFLOW LANES VIEW (INTERACTIVE)
          ========================================================================= */}
      {viewMode === 'lanes' && (
        <div className="space-y-6">
          
          {/* Lane Filter Pill Switcher */}
          <div className="bento-card p-2.5 flex items-center gap-2 border border-zinc-200/80 overflow-x-auto no-scrollbar font-mono text-xs shadow-xs">
            <button
              onClick={() => { soundManager.playClick(); setSelectedLane('ALL'); }}
              className={`px-4 py-2 rounded-full transition-all whitespace-nowrap font-semibold ${
                selectedLane === 'ALL' ? 'pill-black shadow-xs' : 'pill-white text-zinc-600 hover:text-black'
              }`}
            >
              ALL_LANES ({projects.length})
            </button>
            {allLanes.map((l) => {
              const count = projects.filter(p => p.lane === l).length;
              return (
                <button
                  key={l}
                  onClick={() => { soundManager.playClick(); setSelectedLane(l); }}
                  className={`px-3.5 py-2 rounded-full transition-all whitespace-nowrap font-semibold ${
                    selectedLane === l ? 'pill-black shadow-xs' : 'pill-white text-zinc-600 hover:text-black'
                  }`}
                >
                  {laneConfigs[l].tag} ({count})
                </button>
              );
            })}
          </div>

          {/* 6 Interactive Lane Sections */}
          <div className="space-y-6">
            {allLanes
              .filter(l => selectedLane === 'ALL' || selectedLane === l)
              .map((laneKey) => {
                const config = laneConfigs[laneKey];
                const laneProjects = projects.filter(p => p.lane === laneKey);
                const Icon = config.icon;
                const isHoveredLane = dragOverLane === laneKey;

                const lanePaidTotal = laneProjects.reduce((sum, p) => sum + (p.paidNumeric || 0), 0);
                const laneUnpaidTotal = laneProjects.reduce((sum, p) => sum + (p.unpaidNumeric || 0), 0);

                return (
                  <div 
                    key={laneKey} 
                    className={`bento-card p-6 border border-zinc-200/90 shadow-sm transition-all duration-200 ${
                      isHoveredLane ? 'ring-2 ring-[#111111] scale-[1.005]' : ''
                    }`}
                    onDragOver={(e) => handleDragOverLane(e, laneKey)}
                    onDragLeave={() => setDragOverLane(null)}
                    onDrop={(e) => handleDropLane(e, laneKey)}
                  >
                    <div className="space-y-4">
                      
                      {/* Lane Header Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-2xl bg-[#fafafa] border border-zinc-200 text-[#111111]">
                            <Icon className="w-5 h-5 text-[#111111] stroke-[2]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-[#111111] tracking-tight">{config.title}</h4>
                              <span className={`dev-tag ${config.color}`}>{config.tag}</span>
                            </div>
                            <p className="text-xs text-zinc-700 font-normal mt-0.5">{config.subtitle}</p>
                          </div>
                        </div>

                        {/* Lane Stats & Add Project Button */}
                        <div className="flex items-center gap-2">
                          {(lanePaidTotal > 0 || laneUnpaidTotal > 0) && (
                            <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-white px-3 py-1.5 rounded-xl border border-zinc-200">
                              {lanePaidTotal > 0 && (
                                <span className="text-[#305d46] font-bold">Paid: {formatRupiah(lanePaidTotal)}</span>
                              )}
                              {lanePaidTotal > 0 && laneUnpaidTotal > 0 && <span className="text-[#ded7c8]">•</span>}
                              {laneUnpaidTotal > 0 && (
                                <span className="text-[#925f18] font-bold">OTW: {formatRupiah(laneUnpaidTotal)}</span>
                              )}
                            </div>
                          )}
                          
                          <span className="dev-tag">
                            {laneProjects.length} ITEMS
                          </span>

                          <button
                            onClick={() => {
                              soundManager.playClick();
                              setNewProjectLane(laneKey);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-white hover:bg-[#fafafa] text-[#111111] border border-zinc-200 text-xs font-mono flex items-center gap-1 transition-all"
                            title={`Tambah project ke ${config.title}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px]">Tambah</span>
                          </button>
                        </div>
                      </div>

                      {/* Strategic Lane Rule Banner */}
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-mono text-zinc-700 flex items-center justify-between">
                        <div>
                          <span className="text-[#925f18] font-bold">// STRATEGI:</span> {config.rule}
                        </div>
                      </div>

                      {/* Drop Target Indicator */}
                      {isHoveredLane && draggedProjectId && (
                        <div className="p-4 rounded-2xl border-2 border-dashed border-[#305d46] bg-[#e2ecdc] text-[#305d46] text-xs font-mono text-center animate-pulse">
                          Lepaskan untuk pindahkan project ke {config.title}
                        </div>
                      )}

                      {/* Project Cards Grid in this Lane */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {laneProjects.map((p) => {
                          const isBeingDragged = draggedProjectId === p.id;

                          return (
                            <div
                              key={p.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, p)}
                              onDragEnd={() => {
                                setDraggedProjectId(null);
                                setDragOverLane(null);
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all duration-200 space-y-3 cursor-grab active:cursor-grabbing ${
                                isBeingDragged
                                  ? 'opacity-30 scale-95 border-dashed border-[#292a24] bg-[#fafafa]'
                                  : 'bg-white border-zinc-200 hover:border-[#928876] hover:bg-white hover:-translate-y-0.5 shadow-sm'
                              }`}
                            >
                              {/* Card Header & Priority */}
                              <div className="flex justify-between items-start gap-1">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={(e) => handleCyclePriority(e, p)}
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all active:scale-90 ${priorityColorMap[p.priority]?.bg} ${priorityColorMap[p.priority]?.text} ${priorityColorMap[p.priority]?.border}`}
                                      title="Klik untuk ubah prioritas (P1 / P2 / P3)"
                                    >
                                      {p.priority}
                                    </button>
                                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${getPaymentBadgeClass(p.paymentStatus)}`}>
                                      {p.paymentStatus}
                                    </span>
                                  </div>
                                  <h5
                                    onClick={() => {
                                      soundManager.playClick();
                                      setEditingProject(p);
                                    }}
                                    className="text-sm font-bold text-[#111111] mt-1.5 truncate hover:text-rose-600 cursor-pointer transition-colors"
                                    title="Klik untuk edit project"
                                  >
                                    {p.name}
                                  </h5>
                                  <p className="text-[11px] text-zinc-700 font-mono">{p.valueText}</p>
                                </div>
                                <GripVertical className="w-4 h-4 text-zinc-500 group-hover:text-[#111111] shrink-0" />
                              </div>

                              {/* Next Action Pod */}
                              {editingNextActionId === p.id ? (
                                <div className="space-y-1.5 p-2 rounded-xl bg-amber-50/60 border border-amber-200 animate-fade-in font-sans">
                                  <textarea
                                    autoFocus
                                    rows={2}
                                    value={nextActionInput}
                                    onChange={(e) => setNextActionInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSaveNextAction(p);
                                      } else if (e.key === 'Escape') {
                                        handleCancelEditNextAction();
                                      }
                                    }}
                                    className="w-full text-xs p-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:border-zinc-600 font-sans resize-none"
                                    placeholder="Tulis langkah konkret berikutnya..."
                                  />
                                  <div className="flex justify-end gap-1 font-mono text-[10px]">
                                    <button
                                      type="button"
                                      onClick={handleCancelEditNextAction}
                                      className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition-colors"
                                    >
                                      Batal (Esc)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveNextAction(p)}
                                      className="px-2 py-0.5 rounded-md bg-black text-white font-bold hover:bg-zinc-800 transition-colors"
                                    >
                                      Simpan (Enter)
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="group/action p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/80 text-[11px] space-y-1 transition-colors cursor-pointer"
                                  onClick={(e) => handleStartEditNextAction(e, p)}
                                  title="Klik untuk ubah next action cepat"
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <p className="text-[#111111] leading-relaxed flex-1">
                                      <span className="text-[#925f18] font-mono font-bold">Next:</span> {p.nextAction}
                                    </p>
                                    <Edit3 className="w-3 h-3 text-zinc-400 opacity-0 group-hover/action:opacity-100 shrink-0 mt-0.5 transition-opacity" />
                                  </div>
                                  {p.rule && (
                                    <p className="text-[10px] text-zinc-500 font-mono italic">
                                      // {p.rule}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Interactive Kanban Column Switcher Pills */}
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-zinc-700 block uppercase tracking-wider">
                                  Status Kolom Kanban:
                                </span>
                                <div className="grid grid-cols-4 gap-1">
                                  {(['DOING', 'QUEUE', 'WAITING', 'PARKED', 'DONE'] as BoardColumn[]).map((col) => (
                                    <button
                                      key={col}
                                      onClick={() => handleSwitchColumn(p, col)}
                                      className={`py-1 rounded-lg text-[9px] font-mono font-bold transition-all text-center ${
                                        p.boardColumn === col
                                          ? col === 'DOING'
                                            ? 'bg-[#305d46] text-[#fffdf5] shadow-sm'
                                            : col === 'WAITING'
                                            ? 'bg-[#b87e2b] text-[#fffdf5] shadow-sm'
                                            : col === 'PARKED'
                                            ? 'bg-[#f9ded1] text-[#814637] border border-[#814637]/30'
                                            : 'bg-[#292a24] text-[#fffdf5] shadow-sm'
                                          : 'bg-[#fafafa] text-zinc-700 hover:text-[#111111] hover:bg-[#ded7c8]'
                                      }`}
                                    >
                                      {col}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Action Buttons Toolbar */}
                              <div className="pt-2.5 border-t border-zinc-200 flex items-center justify-between gap-1 text-[11px] font-mono">
                                <button
                                  type="button"
                                  onClick={() => {
                                    soundManager.playClick();
                                    onStartFocusOnProject(p);
                                  }}
                                  className="text-[#111111] hover:text-black font-semibold flex items-center gap-1 bg-white hover:bg-zinc-50 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all shadow-2xs active:scale-95 text-[10px]"
                                  title="Mulai sesi focus untuk project ini"
                                >
                                  <span>Focus</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>

                                <div className="flex items-center gap-1">
                                  {onOpenInvoiceForProject && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        soundManager.playClick();
                                        onOpenInvoiceForProject(p);
                                      }}
                                      className="text-blue-900 hover:text-blue-950 flex items-center gap-1 bg-[#adc6ed]/40 hover:bg-[#adc6ed]/70 px-2 py-1.5 rounded-xl border border-[#adc6ed] transition-all shadow-2xs active:scale-95 text-[10px]"
                                      title="Buat invoice tagihan untuk project ini"
                                    >
                                      <Receipt className="w-3 h-3 text-blue-900" />
                                      <span>Invoice</span>
                                    </button>
                                  )}

                                  {onOpenFollowUpForProject && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        soundManager.playClick();
                                        onOpenFollowUpForProject(p);
                                      }}
                                      className="text-[#925f18] hover:text-amber-900 flex items-center gap-1 bg-[#ffb99f]/40 hover:bg-[#ffb99f]/70 px-2 py-1.5 rounded-xl border border-[#ffb99f] transition-all shadow-2xs active:scale-95 text-[10px]"
                                      title="Copas follow up ke client"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      <span>WA</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundManager.playClick();
                                      setEditingProject(p);
                                    }}
                                    className="text-zinc-600 hover:text-black flex items-center gap-1 bg-zinc-50 hover:bg-zinc-100 px-2 py-1.5 rounded-xl border border-zinc-200 transition-all shadow-2xs active:scale-95 text-[10px]"
                                    title="Buka editor detail project"
                                  >
                                    <Edit3 className="w-3 h-3 text-zinc-500" />
                                    <span>Edit</span>
                                  </button>
                                </div>
                              </div>

                            </div>
                          );
                        })}

                        {laneProjects.length === 0 && !isHoveredLane && (
                          <div className="col-span-full p-8 text-center text-zinc-700 font-mono text-xs border border-dashed border-zinc-200 rounded-2xl bg-white">
                            Belum ada project di lane ini. Tarik project ke sini atau klik "+ Tambah".
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: KANBAN BOARD VIEW WITH DRAG & DROP & EFFICIENCY SUITE
          ========================================================================= */}
      {viewMode === 'board' && (
        <div className="space-y-4">
          
          {/* Smart Board Filter & Search Bar */}
          <div className="bento-card p-3 sm:p-4 border border-zinc-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Search Box */}
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari project di board (nama, next action, nilai)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:bg-white transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    title="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Controls: Lane, Priority & Reset */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                
                {/* Lane Selector */}
                <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Lane:</span>
                  <select
                    value={filterLane}
                    onChange={(e) => { soundManager.playClick(); setFilterLane(e.target.value); }}
                    className="bg-transparent text-xs font-semibold text-zinc-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Lane ({projects.length})</option>
                    {allLanes.map((l) => (
                      <option key={l} value={l}>
                        {laneConfigs[l].tag} ({projects.filter(p => p.lane === l).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Selector Pills */}
                <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-xl border border-zinc-200">
                  {(['ALL', 'P1', 'P2', 'P3'] as const).map((pLevel) => (
                    <button
                      key={pLevel}
                      type="button"
                      onClick={() => { soundManager.playClick(); setPriorityFilter(pLevel); }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        priorityFilter === pLevel
                          ? 'bg-black text-white shadow-2xs'
                          : 'text-zinc-600 hover:text-black hover:bg-zinc-200/60'
                      }`}
                    >
                      {pLevel}
                    </button>
                  ))}
                </div>

                {/* Reset Active Filters */}
                {(searchQuery || filterLane !== 'ALL' || priorityFilter !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setSearchQuery('');
                      setFilterLane('ALL');
                      setPriorityFilter('ALL');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[10px] font-bold flex items-center gap-1 transition-colors"
                    title="Kembalikan tampilan ke semua project"
                  >
                    <X className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}

                {/* Project Counter Tag */}
                <span className="text-[11px] text-zinc-600 py-1 px-2.5 bg-zinc-50 rounded-xl border border-zinc-200 font-semibold">
                  {filteredBoardProjects.length} / {projects.length} Project
                </span>
              </div>

            </div>
          </div>

          {/* Columns Container */}
          <div className="flex gap-4 items-start overflow-x-auto pb-6">
            {boardColumns.map((col, idx) => {
              const colProjects = filteredBoardProjects.filter(p => p.boardColumn === col.id);
              const allInColCount = projects.filter(p => p.boardColumn === col.id).length;
              const isColumnHovered = dragOverColumn === col.id;

              const totalUnpaid = colProjects.reduce((sum, p) => sum + (p.unpaidNumeric || 0), 0);
              const totalPaid = colProjects.reduce((sum, p) => sum + (p.paidNumeric || 0), 0);
              const totalNominal = colProjects.reduce((sum, p) => sum + (p.nominalNumeric || 0), 0);

              const colThemes = [
                { bg: 'bg-[#fafafa]', border: 'border-zinc-200', sticker: 'sticker-yellow' },
                { bg: 'bento-lime', border: 'border-[#d9f99d]', sticker: 'sticker-lime' },
                { bg: 'bento-apricot', border: 'border-[#fed7aa]', sticker: 'sticker-apricot' },
                { bg: 'bento-pink', border: 'border-[#fbcfe8]', sticker: 'sticker-pink' },
                { bg: 'bg-zinc-50', border: 'border-zinc-200', sticker: 'sticker-lime' }
              ];
              const theme = colThemes[idx % colThemes.length];

              return (
                <div 
                  key={col.id} 
                  className={`bento-card ${theme.bg} border ${theme.border} p-4 space-y-3 min-w-[280px] flex-1 min-h-[520px] flex flex-col justify-start transition-all duration-200 shadow-sm ${
                    isColumnHovered 
                      ? 'ring-2 ring-[#111111] scale-[1.01]' 
                      : ''
                  }`}
                  onDragOver={(e) => handleDragOverColumn(e, col.id)}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDropColumn(e, col.id)}
                >
                  {/* Column Header with Stats & Quick Add */}
                  <div className="p-3 rounded-2xl bg-white/90 border border-black/5 flex items-start justify-between shadow-2xs gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`sticker-pill ${theme.sticker} text-[9px]`}>{col.label}</span>
                        <span className="text-[10px] font-mono font-bold text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">
                          {colProjects.length}{colProjects.length !== allInColCount ? ` (${allInColCount})` : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1 truncate">{col.desc}</p>
                      
                      {/* Financial indicator in column header */}
                      {col.id === 'WAITING' && totalUnpaid > 0 && (
                        <div className="mt-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/70 inline-block">
                          Tertahan: {formatRupiah(totalUnpaid)}
                        </div>
                      )}
                      {col.id === 'DOING' && totalNominal > 0 && (
                        <div className="mt-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/70 inline-block">
                          Nilai: {formatRupiah(totalNominal)}
                        </div>
                      )}
                      {col.id === 'DONE' && totalPaid > 0 && (
                        <div className="mt-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/70 inline-block">
                          Lunas: {formatRupiah(totalPaid)}
                        </div>
                      )}
                    </div>

                    {/* Quick Add Project to this Column Button */}
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setNewProjectCol(col.id);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200 shadow-2xs transition-all active:scale-95 shrink-0"
                      title={`Tambah project baru ke ${col.label}`}
                      aria-label={`Tambah project baru ke ${col.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Drop Placeholder Indicator when hovering */}
                  {isColumnHovered && draggedProjectId && (
                    <div className="p-3.5 rounded-2xl border-2 border-dashed border-[#111111] bg-white text-[#111111] text-xs font-mono text-center animate-pulse">
                      Lepaskan untuk pindah ke {col.label}
                    </div>
                  )}

                  {/* Cards Container */}
                  <div className="space-y-3 flex-1">
                    {colProjects.map((project) => {
                      const isBeingDragged = draggedProjectId === project.id;
                      const isEditingNext = editingNextActionId === project.id;
                      const isMoveOpen = openMoveMenuId === project.id;

                      return (
                        <div
                          key={project.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, project)}
                          onDragEnd={() => {
                            setDraggedProjectId(null);
                            setDragOverColumn(null);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 space-y-2.5 cursor-grab active:cursor-grabbing relative ${
                            isBeingDragged
                              ? 'opacity-30 scale-95 border-dashed border-[#292a24] bg-[#fafafa]'
                              : 'bg-white border-zinc-200/90 hover:border-zinc-400 hover:bg-white hover:-translate-y-0.5 shadow-2xs hover:shadow-sm'
                          }`}
                        >
                          {/* Card Header: Priority (Interactive) + Payment + Move Menu + Drag Handle */}
                          <div className="flex justify-between items-start gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Interactive Priority Badge (Click to Cycle P1 -> P2 -> P3 -> P1) */}
                                <button
                                  type="button"
                                  onClick={(e) => handleCyclePriority(e, project)}
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all active:scale-90 ${priorityColorMap[project.priority]?.bg} ${priorityColorMap[project.priority]?.text} ${priorityColorMap[project.priority]?.border}`}
                                  title="Klik untuk ubah prioritas (P1 / P2 / P3)"
                                >
                                  {project.priority}
                                </button>

                                {/* Payment Status Badge */}
                                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${getPaymentBadgeClass(project.paymentStatus)}`}>
                                  {project.paymentStatus}
                                </span>

                                {/* Lane Tag Indicator */}
                                <span className="text-[10px] font-mono text-zinc-500 font-medium">
                                  {laneConfigs[project.lane]?.tag || project.lane}
                                </span>
                              </div>

                              {/* Project Title (Clickable to Edit) */}
                              <h5
                                onClick={() => {
                                  soundManager.playClick();
                                  setEditingProject(project);
                                }}
                                className="text-sm font-bold text-[#111111] mt-1.5 truncate hover:text-rose-600 cursor-pointer transition-colors"
                                title="Klik untuk edit project"
                              >
                                {project.name}
                              </h5>
                              <p className="text-[11px] text-zinc-600 font-mono mt-0.5">{project.valueText}</p>
                            </div>

                            {/* Top-Right Tools: Universal Column Mover & Grip */}
                            <div className="flex items-center gap-0.5 shrink-0">
                              
                              {/* Universal Column Mover Popover */}
                              <div className="relative move-menu-container">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    soundManager.playClick();
                                    setOpenMoveMenuId(isMoveOpen ? null : project.id);
                                  }}
                                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors"
                                  title="Pindahkan project ke kolom mana saja"
                                  aria-label="Pindahkan project ke kolom mana saja"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>

                                {isMoveOpen && (
                                  <div className="absolute right-0 top-6 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl z-40 py-1.5 font-sans text-xs animate-fade-in">
                                    <div className="px-3 py-1 text-[10px] font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                                      Pindah ke Kolom:
                                    </div>
                                    {(['DOING', 'WAITING', 'QUEUE', 'DONE', 'PARKED'] as BoardColumn[]).map((colId) => {
                                      if (colId === project.boardColumn) return null;
                                      const colMeta = boardColumns.find((c) => c.id === colId);
                                      return (
                                        <button
                                          key={colId}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMoveMenuId(null);
                                            handleSwitchColumn(project, colId);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center justify-between text-zinc-700 hover:text-black transition-colors"
                                        >
                                          <span className="font-medium text-[11px]">{colMeta?.label || colId}</span>
                                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <GripVertical className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700" />
                            </div>
                          </div>

                          {/* Next Action Pod (with Inline Quick-Edit) */}
                          {isEditingNext ? (
                            <div className="space-y-1.5 p-2 rounded-xl bg-amber-50/60 border border-amber-200 animate-fade-in font-sans">
                              <textarea
                                autoFocus
                                rows={2}
                                value={nextActionInput}
                                onChange={(e) => setNextActionInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSaveNextAction(project);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditNextAction();
                                  }
                                }}
                                className="w-full text-xs p-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:border-zinc-600 font-sans resize-none"
                                placeholder="Tulis langkah konkret berikutnya..."
                              />
                              <div className="flex justify-end gap-1 font-mono text-[10px]">
                                <button
                                  type="button"
                                  onClick={handleCancelEditNextAction}
                                  className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition-colors"
                                >
                                  Batal (Esc)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveNextAction(project)}
                                  className="px-2 py-0.5 rounded-md bg-black text-white font-bold hover:bg-zinc-800 transition-colors"
                                >
                                  Simpan (Enter)
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="group/action p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/80 text-[11px] space-y-1 transition-colors cursor-pointer"
                              onClick={(e) => handleStartEditNextAction(e, project)}
                              title="Klik untuk ubah next action cepat"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-[#111111] leading-relaxed flex-1">
                                  <span className="text-[#925f18] font-mono font-bold">Next:</span> {project.nextAction}
                                </p>
                                <Edit3 className="w-3 h-3 text-zinc-400 opacity-0 group-hover/action:opacity-100 shrink-0 mt-0.5 transition-opacity" />
                              </div>
                              {project.rule && (
                                <p className="text-[10px] text-zinc-500 font-mono italic">
                                  // {project.rule}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Fast Column Transit Buttons */}
                          <div className="pt-1.5 space-y-2 text-[11px] font-mono">
                            
                            {/* QUEUE Column: Start DOING */}
                            {project.boardColumn === 'QUEUE' && (
                              <button
                                type="button"
                                onClick={() => handleSwitchColumn(project, 'DOING')}
                                className="w-full py-1.5 px-3 rounded-xl bg-[#111111] hover:bg-black text-white font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all text-xs"
                                title="Mulai eksekusi sekarang"
                              >
                                <span>Lanjut Eksekusi (Mulai DOING)</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* WAITING Column: Lanjut Doing or Selesai */}
                            {project.boardColumn === 'WAITING' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSwitchColumn(project, 'DOING')}
                                  className="py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all text-[10px]"
                                  title="Feedback masuk / DP cair → lanjut eksekusi"
                                >
                                  <span>Lanjut Doing</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSwitchColumn(project, 'DONE')}
                                  className="py-1.5 px-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all text-[10px]"
                                  title="Pembayaran lunas & tuntas"
                                >
                                  <span>Pekerjaan selesai</span>
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {/* DOING Column: Nunggu Klien or Beres 100% */}
                            {project.boardColumn === 'DOING' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSwitchColumn(project, 'WAITING')}
                                  className="py-1.5 px-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold flex items-center justify-center gap-1 border border-zinc-300 shadow-2xs active:scale-95 transition-all text-[10px]"
                                  title="Tunggu review klien / termin invoice"
                                >
                                  <span>⏳ Nunggu Klien</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSwitchColumn(project, 'DONE')}
                                  className="py-1.5 px-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all text-[10px]"
                                  title="Selesai tuntas & lunas"
                                >
                                  <span>Beres 100%</span>
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {/* PARKED Column: Masuk Queue or Langsung Doing */}
                            {project.boardColumn === 'PARKED' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSwitchColumn(project, 'QUEUE')}
                                  className="py-1.5 px-2 rounded-xl bg-zinc-800 hover:bg-black text-white font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all text-[10px]"
                                  title="Pindahkan ke antrian kickoff"
                                >
                                  <span>Masuk Queue</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSwitchColumn(project, 'DOING')}
                                  className="py-1.5 px-2 rounded-xl bg-[#305d46] hover:bg-[#234533] text-white font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all text-[10px]"
                                  title="Langsung mulai eksekusi"
                                >
                                  <span>Langsung Doing</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {/* DONE Column: 100% Selesai Banner + Re-open */}
                            {project.boardColumn === 'DONE' && (
                              <div className="flex items-center justify-between px-2 py-1 bg-emerald-50/80 border border-emerald-200/70 rounded-xl text-[10px] text-emerald-800 font-bold">
                                <span className="flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>100% Selesai & Bebas Tanggungan</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSwitchColumn(project, 'DOING')}
                                  className="text-zinc-600 hover:text-black underline flex items-center gap-0.5 ml-1 shrink-0"
                                  title="Revisi / Buka kembali ke Doing"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" />
                                  <span>Re-open</span>
                                </button>
                              </div>
                            )}

                            {/* Unified Action Toolbar: Focus, Invoice, WA, Edit (No ugly underline link!) */}
                            <div className="pt-2 border-t border-zinc-200/70 flex items-center justify-between gap-1 text-[11px] font-mono">
                              <button
                                type="button"
                                onClick={() => {
                                  soundManager.playClick();
                                  onStartFocusOnProject(project);
                                }}
                                className="text-[#111111] hover:text-black font-semibold flex items-center gap-1 bg-white hover:bg-zinc-50 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all shadow-2xs active:scale-95 text-[10px]"
                                title="Mulai sesi deep work timer untuk project ini"
                              >
                                <span>Focus</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              <div className="flex items-center gap-1">
                                {onOpenInvoiceForProject && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundManager.playClick();
                                      onOpenInvoiceForProject(project);
                                    }}
                                    className="text-blue-900 hover:text-blue-950 flex items-center gap-1 bg-[#adc6ed]/40 hover:bg-[#adc6ed]/70 px-2 py-1.5 rounded-xl border border-[#adc6ed] transition-all shadow-2xs active:scale-95 text-[10px]"
                                    title="Buat invoice tagihan untuk project ini"
                                  >
                                    <Receipt className="w-3 h-3 text-blue-900" />
                                    <span>Invoice</span>
                                  </button>
                                )}

                                {onOpenFollowUpForProject && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundManager.playClick();
                                      onOpenFollowUpForProject(project);
                                    }}
                                    className="text-[#925f18] hover:text-amber-900 flex items-center gap-1 bg-[#ffb99f]/40 hover:bg-[#ffb99f]/70 px-2 py-1.5 rounded-xl border border-[#ffb99f] transition-all shadow-2xs active:scale-95 text-[10px]"
                                    title="Copas follow up ke client via WhatsApp"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WA</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    soundManager.playClick();
                                    setEditingProject(project);
                                  }}
                                  className="text-zinc-600 hover:text-black flex items-center gap-1 bg-zinc-50 hover:bg-zinc-100 px-2 py-1.5 rounded-xl border border-zinc-200 transition-all shadow-2xs active:scale-95 text-[10px]"
                                  title="Buka form edit detail project"
                                >
                                  <Edit3 className="w-3 h-3 text-zinc-500" />
                                  <span>Edit</span>
                                </button>
                              </div>
                            </div>

                          </div>

                        </div>
                      );
                    })}

                    {colProjects.length === 0 && !isColumnHovered && (
                      <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-300 rounded-2xl bg-white/60">
                        {searchQuery || filterLane !== 'ALL' || priorityFilter !== 'ALL'
                          ? 'Tidak ada project yang cocok dengan filter'
                          : 'Tarik kartu ke sini'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW PROJECT
          ========================================================================= */}
      {editingProject && <ProjectEditor key={editingProject.id} project={editingProject} projects={projects} onSave={onUpdateProject} onClose={() => setEditingProject(null)} onDelete={onDeleteProject} />}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="max-w-lg w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#305d46]" />
                <h4 className="text-base font-bold text-[#111111]">Tambah Project Baru</h4>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-700 hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-mono">
              
              {/* Lane Selector */}
              <div>
                <label className="text-zinc-700 block mb-1">Target Lane:</label>
                <select
                  value={newProjectLane}
                  onChange={(e) => setNewProjectLane(e.target.value as LaneType)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-[#111111] focus:border-[#292a24] focus:outline-none"
                >
                  {allLanes.map(l => (
                    <option key={l} value={l}>{laneConfigs[l].title}</option>
                  ))}
                </select>
              </div>

              {/* Project Name */}
              <div>
                <label className="text-zinc-700 block mb-1">Nama Project / Client:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign / Logo Baru"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-[#111111] focus:border-[#292a24] focus:outline-none font-sans"
                />
              </div>

              {/* Next Action */}
              <div>
                <label className="text-zinc-700 block mb-1">Next Action Konkret:</label>
                <input
                  type="text"
                  placeholder="e.g. Siapkan scope & kirim invoice DP 50%"
                  value={newProjectAction}
                  onChange={(e) => setNewProjectAction(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-[#111111] focus:border-[#292a24] focus:outline-none font-sans"
                />
              </div>

              {/* Nominal & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-700 block mb-1">Nominal / Nilai:</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Nilai kontrak rupiah, contoh 6000000"
                    value={newProjectValue}
                    onChange={(e) => setNewProjectValue(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-[#111111] focus:border-[#292a24] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-700 block mb-1">Priority Level:</label>
                  <select
                    value={newProjectPriority}
                    onChange={(e) => setNewProjectPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-[#111111] focus:border-[#292a24] focus:outline-none"
                  >
                    <option value="P1">P1 (High Priority)</option>
                    <option value="P2">P2 (Medium)</option>
                    <option value="P3">P3 (Backlog)</option>
                  </select>
                </div>
              </div>

              {/* Initial Kanban Column */}
              <div>
                <label className="text-zinc-700 block mb-1">Masuk Kolom Kanban:</label>
                <select
                  value={newProjectCol}
                  onChange={(e) => setNewProjectCol(e.target.value as BoardColumn)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-[#111111] focus:border-[#292a24] focus:outline-none"
                >
                  <option value="QUEUE">Queue (Antrian)</option>
                  <option value="DOING">Doing (Sedang Dikerjakan)</option>
                  <option value="WAITING">Waiting (Menunggu DP/Feedback)</option>
                  <option value="PARKED">Parked (Disimpan Dulu)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#fafafa] text-zinc-700 border border-zinc-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl dev-btn-primary font-bold shadow-sm"
                >
                  Simpan Project
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
