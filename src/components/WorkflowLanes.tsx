import React, { useState } from 'react';
import { 
  Briefcase, 
  Wrench, 
  TrendingUp, 
  Package, 
  Activity, 
  Archive,
  ArrowRight,
  ArrowLeft,
  Filter,
  Columns,
  MessageSquare,
  GripVertical,
  Plus,
  X,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ChevronRight,
  Check
} from 'lucide-react';
import { ProjectCard, LaneType, BoardColumn, PriorityLevel } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface WorkflowLanesProps {
  projects: ProjectCard[];
  onUpdateProject: (project: ProjectCard) => void;
  onAddProject?: (project: Omit<ProjectCard, 'id'>) => void;
  onStartFocusOnProject: (project: ProjectCard) => void;
  onOpenFollowUpForProject?: (project: ProjectCard) => void;
  onOpenInvoiceForProject?: (project: ProjectCard) => void;
}

export const WorkflowLanes: React.FC<WorkflowLanesProps> = ({
  projects,
  onUpdateProject,
  onAddProject,
  onStartFocusOnProject,
  onOpenFollowUpForProject,
  onOpenInvoiceForProject
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'lanes'>('board');
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

  const laneConfigs: Record<LaneType, { title: string; subtitle: string; icon: any; tag: string; rule: string; color: string }> = {
    client_delivery: {
      title: 'Lane 1 — Client Delivery',
      subtitle: 'Sudah Deal / Sudah Ada Kewajiban (Umi Elly, Barber POS, DreamMecca, Zalvice, dll.)',
      icon: Briefcase,
      tag: 'LANE_01',
      rule: 'PRIORITAS #1: Lunasin kewajiban & amankan DP sebelum buka scope baru.',
      color: 'border-[#305d46]/30 text-[#305d46] bg-[#e2ecdc]'
    },
    maintenance: {
      title: 'Lane 2 — Maintenance',
      subtitle: 'Timebox Ketat: Max 1-2 Jam Per Sesi (Markaz Fiqih)',
      icon: Wrench,
      tag: 'LANE_02',
      rule: 'TIMEBOX ONLY: Jangan biarkan maintenance makan jatah deep work berbayar.',
      color: 'border-[#3c6b8c]/30 text-[#2b5675] bg-[#e2edf9]'
    },
    bizdev: {
      title: 'Lane 3 — Business Development / Sales',
      subtitle: 'KAEL Offline Marketing, Upwork Global, Lead Pipeline, Watra',
      icon: TrendingUp,
      tag: 'LANE_03',
      rule: 'GROWTH ENGINE: Sisihkan 30-45 menit/hari untuk kontak prospek.',
      color: 'border-[#b87e2b]/30 text-[#925f18] bg-[#fdf3d8]'
    },
    own_product: {
      title: 'Lane 4 — Core Product (SaaS & Assets)',
      subtitle: 'KAEL POS, Engine Kasir, Template High-Ticket',
      icon: Package,
      tag: 'LANE_04',
      rule: 'EQUITY BUILDING: Bangun recurring asset yang bisa dijual berulang.',
      color: 'border-[#4e3a68]/30 text-[#4e3a68] bg-[#f0e6f9]'
    },
    operations: {
      title: 'Lane 5 — Daily Life & Operations',
      subtitle: 'Audit Kas Harian, Backup Database, Olahraga, Rumah Tangga',
      icon: Activity,
      tag: 'LANE_05',
      rule: 'HEALTH & DISCIPLINE: Rekap keuangan & sinkron saldo tiap malam.',
      color: 'border-zinc-300 text-zinc-800 bg-zinc-100 font-bold'
    },
    parking_lot: {
      title: 'Lane 6 — Parking Lot (Ide Disimpan)',
      subtitle: 'Semua ide liar/distraksi yang belum waktunya dieksekusi',
      icon: Archive,
      tag: 'LANE_06',
      rule: 'ANTI DISTRAKSI: Parkir di sini dulu biar otak tenang.',
      color: 'border-[#fed7aa] text-[#9a3412] bg-[#ffedd5] font-bold'
    },
  };

  const allLanes: LaneType[] = ['client_delivery', 'maintenance', 'bizdev', 'own_product', 'operations', 'parking_lot'];

  const boardColumns: { id: BoardColumn; label: string; desc: string; color: string }[] = [
    { id: 'DOING', label: '⚡ SEDANG DIGARAP', desc: 'Fokus aktif lo hari ini', color: 'border-[#305d46]/40 text-[#305d46]' },
    { id: 'WAITING', label: '⏳ LAGI NUNGGU', desc: 'Menunggu respon / pembayaran klien', color: 'border-[#b87e2b]/40 text-[#925f18]' },
    { id: 'QUEUE', label: '📋 ANTRIAN KICKOFF', desc: 'Siap dieksekusi giliran berikutnya', color: 'border-zinc-200 text-[#111111]' },
    { id: 'DONE', label: '✅ BERES & LUNAS', desc: '100% Selesai tanpa beban pikiran', color: 'border-emerald-300 text-emerald-800' }
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

  // Submit New Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject: Omit<ProjectCard, 'id'> = {
      name: newProjectName.trim(),
      lane: newProjectLane,
      boardColumn: newProjectCol,
      status: newProjectCol === 'DOING' ? 'Doing' : newProjectCol === 'WAITING' ? 'Waiting Payment' : newProjectCol === 'PARKED' ? 'Parked' : 'Queue',
      paymentStatus: newProjectLane === 'client_delivery' ? 'Expected' : 'Free',
      valueText: newProjectValue.trim() || 'Custom Scope',
      nominalNumeric: 0,
      paidNumeric: 0,
      unpaidNumeric: 0,
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
    <div className="space-y-6 font-sans select-none animate-fade-in pb-12">
      
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
          <p className="text-xs text-zinc-500 font-normal mt-1">
            Kelola beban kerja per Lane strategis • Drag & Drop antar Lane/Kolom • Direct Focus & WhatsApp Trigger
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
                                    <span className="dev-tag text-[9px] py-0 px-2">
                                      {p.priority}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-700">
                                      {p.paymentStatus}
                                    </span>
                                  </div>
                                  <h5 className="text-sm font-bold text-[#111111] mt-1.5 truncate">{p.name}</h5>
                                  <p className="text-[11px] text-zinc-700 font-mono">{p.valueText}</p>
                                </div>
                                <GripVertical className="w-4 h-4 text-zinc-500 group-hover:text-[#111111] shrink-0" />
                              </div>

                              {/* Next Action Pod */}
                              <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-[11px] space-y-1">
                                <p className="text-[#111111] leading-relaxed">
                                  <span className="text-[#925f18] font-mono font-bold">Next:</span> {p.nextAction}
                                </p>
                                {p.rule && (
                                  <p className="text-[10px] text-zinc-700 font-mono italic">
                                    // {p.rule}
                                  </p>
                                )}
                              </div>

                              {/* Interactive Kanban Column Switcher Pills */}
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-zinc-700 block uppercase tracking-wider">
                                  Status Kolom Kanban:
                                </span>
                                <div className="grid grid-cols-4 gap-1">
                                  {(['DOING', 'QUEUE', 'WAITING', 'PARKED'] as BoardColumn[]).map((col) => (
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

                              {/* Action Buttons */}
                              <div className="pt-2.5 border-t border-zinc-200 flex items-center justify-between gap-1 text-[11px] font-mono">
                                <button
                                  onClick={() => {
                                    soundManager.playClick();
                                    onStartFocusOnProject(p);
                                  }}
                                  className="text-[#111111] hover:text-black font-medium flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-[#fafafa] transition-colors shadow-sm"
                                >
                                  <span>Focus</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>

                                <div className="flex items-center gap-1">
                                  {onOpenInvoiceForProject && (
                                    <button
                                      onClick={() => {
                                        soundManager.playClick();
                                        onOpenInvoiceForProject(p);
                                      }}
                                      className="text-[#111111] hover:text-black flex items-center gap-1 bg-[#adc6ed]/40 px-2.5 py-1.5 rounded-xl border border-[#adc6ed] hover:bg-[#adc6ed]/70 transition-colors shadow-sm"
                                      title="Buat invoice tagihan untuk project ini"
                                    >
                                      <Receipt className="w-3 h-3 text-[#111111]" />
                                      <span>Invoice</span>
                                    </button>
                                  )}

                                  {onOpenFollowUpForProject && (
                                    <button
                                      onClick={() => {
                                        soundManager.playClick();
                                        onOpenFollowUpForProject(p);
                                      }}
                                      className="text-[#925f18] hover:text-amber-900 flex items-center gap-1 bg-[#ffb99f]/40 px-2.5 py-1.5 rounded-xl border border-[#ffb99f] hover:bg-[#ffb99f]/70 transition-colors shadow-sm"
                                      title="Copas follow up ke client"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      <span>WA</span>
                                    </button>
                                  )}
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
          VIEW 2: KANBAN BOARD VIEW WITH DRAG & DROP
          ========================================================================= */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {boardColumns.map((col, idx) => {
            const colProjects = projects.filter(p => p.boardColumn === col.id);
            const isColumnHovered = dragOverColumn === col.id;

            const colThemes = [
              { bg: 'bg-[#fafafa]', border: 'border-zinc-200', sticker: 'sticker-yellow' },
              { bg: 'bento-lime', border: 'border-[#d9f99d]', sticker: 'sticker-lime' },
              { bg: 'bento-apricot', border: 'border-[#fed7aa]', sticker: 'sticker-apricot' },
              { bg: 'bento-pink', border: 'border-[#fbcfe8]', sticker: 'sticker-pink' },
            ];
            const theme = colThemes[idx % colThemes.length];

            return (
              <div 
                key={col.id} 
                className={`bento-card ${theme.bg} border ${theme.border} p-4 space-y-3 min-h-[500px] flex flex-col justify-start transition-all duration-200 shadow-sm ${
                  isColumnHovered 
                    ? 'ring-2 ring-[#111111] scale-[1.01]' 
                    : ''
                }`}
                onDragOver={(e) => handleDragOverColumn(e, col.id)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => handleDropColumn(e, col.id)}
              >
                {/* Column Header */}
                <div className="p-3 rounded-2xl bg-white/80 border border-black/5 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`sticker-pill ${theme.sticker} text-[9px]`}>{col.label}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">{col.desc}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                    {colProjects.length}
                  </span>
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

                      return (
                        <div
                          key={project.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, project)}
                          onDragEnd={() => {
                            setDraggedProjectId(null);
                            setDragOverColumn(null);
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all duration-200 space-y-2.5 cursor-grab active:cursor-grabbing ${
                            isBeingDragged
                              ? 'opacity-30 scale-95 border-dashed border-[#292a24] bg-[#fafafa]'
                              : 'bg-white border-zinc-200 hover:border-[#928876] hover:bg-white hover:-translate-y-0.5 shadow-sm'
                          }`}
                        >
                          {/* Card Header & Priority */}
                          <div className="flex justify-between items-start gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="dev-tag text-[9px] py-0 px-2">
                                  {project.priority}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-700">
                                  {project.paymentStatus}
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-[#111111] mt-1 truncate">{project.name}</h5>
                              <p className="text-[11px] text-zinc-700 font-mono">{project.valueText}</p>
                            </div>
                            <GripVertical className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#111111]" />
                          </div>

                          {/* Next Action Pod */}
                          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-[11px] space-y-1">
                            <p className="text-[#111111]">
                              <span className="text-[#925f18] font-mono font-bold">Next:</span> {project.nextAction}
                            </p>
                            {project.rule && (
                              <p className="text-[10px] text-zinc-700 font-mono italic">
                                // {project.rule}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons & Fast Column Transit */}
                          <div className="pt-2 border-t border-zinc-200 space-y-2 text-[11px] font-mono">
                            
                            {/* Fast Phase Advance Button (Lanjut ke Fase Selanjutnya) */}
                            {project.boardColumn === 'QUEUE' && (
                              <button
                                onClick={() => handleSwitchColumn(project, 'DOING')}
                                className="w-full py-1.5 px-3 rounded-xl bg-[#111111] text-white hover:bg-black font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                              >
                                <span>⚡ Lanjut Eksekusi (Mulai DOING)</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {project.boardColumn === 'WAITING' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  onClick={() => handleSwitchColumn(project, 'DOING')}
                                  className="py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all text-[10px]"
                                  title="Feedback masuk / DP cair → lanjut eksekusi"
                                >
                                  <span>⚡ Lanjut Doing</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleSwitchColumn(project, 'DONE')}
                                  className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all text-[10px]"
                                  title="Pembayaran lunas & tuntas"
                                >
                                  <span>✓ Lunas/Done</span>
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {project.boardColumn === 'DOING' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  onClick={() => handleSwitchColumn(project, 'WAITING')}
                                  className="py-1.5 px-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold flex items-center justify-center gap-1 border border-zinc-300 shadow-xs active:scale-95 transition-all text-[10px]"
                                  title="Tunggu review klien / termin invoice"
                                >
                                  <span>⏳ Nunggu Klien</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleSwitchColumn(project, 'DONE')}
                                  className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all text-[10px]"
                                  title="Selesai tuntas & lunas"
                                >
                                  <span>✅ Beres 100%</span>
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {project.boardColumn === 'DONE' && (
                              <div className="flex items-center justify-between px-1 text-[10px] text-emerald-800 font-bold">
                                <span>✓ 100% Selesai & Bebas Tanggungan</span>
                                <button
                                  onClick={() => handleSwitchColumn(project, 'DOING')}
                                  className="text-zinc-500 hover:text-black underline"
                                  title="Revisi / Buka kembali ke Doing"
                                >
                                  Re-open
                                </button>
                              </div>
                            )}

                            {/* Secondary Actions: Focus, Invoice, WA */}
                            <div className="flex items-center justify-between gap-1 pt-1">
                              <button
                                onClick={() => {
                                  soundManager.playClick();
                                  onStartFocusOnProject(project);
                                }}
                                className="text-[#111111] hover:text-black font-semibold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-zinc-200 hover:bg-[#fafafa] transition-colors shadow-xs text-[10px]"
                              >
                                <span>Focus</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              <div className="flex items-center gap-1">
                                {onOpenInvoiceForProject && (
                                  <button
                                    onClick={() => {
                                      soundManager.playClick();
                                      onOpenInvoiceForProject(project);
                                    }}
                                    className="text-[#111111] hover:text-black flex items-center gap-1 bg-[#adc6ed]/40 px-2 py-1 rounded-lg border border-[#adc6ed] hover:bg-[#adc6ed]/70 transition-colors shadow-xs text-[10px]"
                                    title="Buat invoice tagihan untuk project ini"
                                  >
                                    <Receipt className="w-3 h-3 text-[#111111]" />
                                    <span>Invoice</span>
                                  </button>
                                )}

                                {onOpenFollowUpForProject && (
                                  <button
                                    onClick={() => {
                                      soundManager.playClick();
                                      onOpenFollowUpForProject(project);
                                    }}
                                    className="text-[#925f18] hover:text-amber-900 flex items-center gap-1 bg-[#ffb99f]/40 px-2 py-1 rounded-lg border border-[#ffb99f] hover:bg-[#ffb99f]/70 transition-colors shadow-xs text-[10px]"
                                    title="Copas follow up ke client"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WA</span>
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>

                        </div>
                      );
                    })}

                    {colProjects.length === 0 && !isColumnHovered && (
                      <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-300 rounded-2xl bg-white/60">
                        Tarik kartu ke sini
                      </div>
                    )}
                  </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW PROJECT
          ========================================================================= */}
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
                  placeholder="e.g. Kasir Barber Underrated / Logo Baru"
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
                    type="text"
                    placeholder="e.g. Rp6.000.000 (DP Rp3M)"
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
                    <option value="P0">P0 (Critical / Hari Ini)</option>
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
