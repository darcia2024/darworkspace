import React, { useState } from 'react';
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
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt
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
  const [viewMode, setViewMode] = useState<'board' | 'lanes'>('lanes');
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
      subtitle: 'Sudah Deal / Sudah Ada Kewajiban (Zalvice, Laptopbisnis, Barber POS, Umi Elly, dll.)',
      icon: Briefcase,
      tag: 'LANE_01',
      rule: '🎯 PRIORITAS #1: Lunasin kewajiban & amankan DP sebelum buka scope baru.',
      color: 'border-emerald-500/40 text-emerald-300'
    },
    maintenance: {
      title: 'Lane 2 — Maintenance',
      subtitle: 'Timebox Ketat: Max 1-2 Jam Per Sesi (Markaz Fiqih)',
      icon: Wrench,
      tag: 'LANE_02',
      rule: '⏱️ TIMEBOX ONLY: Jangan biarkan maintenance makan jatah deep work berbayar.',
      color: 'border-blue-500/40 text-blue-300'
    },
    bizdev: {
      title: 'Lane 3 — Business Development / Sales',
      subtitle: 'KAEL Offline Marketing, Upwork Global, Lead Pipeline, Watra',
      icon: TrendingUp,
      tag: 'LANE_03',
      rule: '📈 CLOSING FIRST: Follow up lead hangat, ajak demo, amankan DP 50%.',
      color: 'border-amber-500/40 text-amber-300'
    },
    own_product: {
      title: 'Lane 4 — Own Product (KAEL Core & Demo)',
      subtitle: 'Hanya Eksekusi yang Mendukung Demo / Penjualan (Bukan Fitur Random)',
      icon: Package,
      tag: 'LANE_04',
      rule: '🚀 DEMO READY: Setting role kasir/owner & QRIS flow agar siap demo closing.',
      color: 'border-purple-500/40 text-purple-300'
    },
    operations: {
      title: 'Lane 5 — Business Operations',
      subtitle: 'Temantiket — Eksekusi hanya jika ada order / issue konkret',
      icon: Activity,
      tag: 'LANE_05',
      rule: '⚡ ON-DEMAND: Jangan ngulik kalau belum ada transaksi atau tiket masuk.',
      color: 'border-cyan-500/40 text-cyan-300'
    },
    parking_lot: {
      title: 'Lane 6 — Parking Lot',
      subtitle: 'Paused / Dormant — Jangan rebutan perhatian dengan kerjaan aktif',
      icon: Archive,
      tag: 'PARKED',
      rule: '🔒 ARSIP / DORMANT: Simpan ide liar di sini sampai ada kapasitas eksekusi.',
      color: 'border-zinc-700 text-zinc-500'
    }
  };

  const boardColumns: Array<{ id: BoardColumn; label: string; desc: string; color: string; badgeStyle: string }> = [
    { id: 'DOING', label: 'DOING', desc: 'Fokus aktif hari ini', color: 'border-white/30 text-white', badgeStyle: 'dev-tag-emerald' },
    { id: 'QUEUE', label: 'QUEUE', desc: 'Antrian siap eksekusi', color: 'border-zinc-500 text-zinc-300', badgeStyle: 'dev-tag' },
    { id: 'WAITING', label: 'WAITING', desc: 'Menunggu payment / kickoff', color: 'border-amber-400/40 text-amber-300', badgeStyle: 'dev-tag-amber' },
    { id: 'PARKED', label: 'PARKED', desc: 'Paused / Dormant', color: 'border-zinc-700 text-zinc-500', badgeStyle: 'dev-tag-rose' }
  ];

  const allLanes: LaneType[] = ['client_delivery', 'maintenance', 'bizdev', 'own_product', 'operations', 'parking_lot'];

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

    onUpdateProject({
      ...project,
      boardColumn: targetCol,
      status: newStatus
    });

    soundManager.playCompletionChime();
    if (targetCol === 'DOING') {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
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
    soundManager.playCompletionChime();
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
  };

  // Quick Switch Column directly inside Card
  const handleSwitchColumn = (project: ProjectCard, newCol: BoardColumn) => {
    soundManager.playClick();
    let newStatus = project.status;
    if (newCol === 'DOING') newStatus = 'Doing';
    else if (newCol === 'QUEUE') newStatus = 'Queue';
    else if (newCol === 'WAITING') newCol === 'WAITING' ? (project.paidNumeric > 0 ? 'Waiting Approval' : 'Waiting Payment') : 'Waiting Payment';
    else if (newCol === 'PARKED') newStatus = 'Parked';

    onUpdateProject({
      ...project,
      boardColumn: newCol,
      status: newStatus
    });

    if (newCol === 'DOING') {
      soundManager.playCompletionChime();
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
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
      
      {/* Header with Switcher (Figma Doppelrand) */}
      <div className="figma-shell">
        <div className="figma-core p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold text-white tracking-tight">Daru Project Workspace</h3>
              <span className="dev-tag text-[9px]">{viewMode === 'lanes' ? '6_LANES_MODE' : 'KANBAN_BOARD'}</span>
            </div>
            <p className="text-xs text-zinc-400 font-normal mt-0.5">
              Kelola beban kerja per Lane strategis • Drag & Drop antar Lane/Kolom • Direct Focus & WhatsApp Trigger
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 dev-btn-primary text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Project</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                onClick={() => { soundManager.playClick(); setViewMode('lanes'); }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'lanes' ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Lanes View</span>
              </button>
              <button
                onClick={() => { soundManager.playClick(); setViewMode('board'); }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'board' ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Board View</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: FUNCTIONAL 6 WORKFLOW LANES VIEW (INTERACTIVE)
          ========================================================================= */}
      {viewMode === 'lanes' && (
        <div className="space-y-6">
          
          {/* Lane Filter Pill Switcher */}
          <div className="flex items-center gap-1.5 bg-[#09090d] p-1.5 rounded-2xl border border-white/[0.06] overflow-x-auto no-scrollbar font-mono text-xs">
            <button
              onClick={() => { soundManager.playClick(); setSelectedLane('ALL'); }}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedLane === 'ALL' ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
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
                  className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    selectedLane === l ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
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
                    className={`figma-shell transition-all duration-200 ${
                      isHoveredLane ? 'ring-2 ring-emerald-400/80 border-emerald-400/50 scale-[1.005]' : ''
                    }`}
                    onDragOver={(e) => handleDragOverLane(e, laneKey)}
                    onDragLeave={() => setDragOverLane(null)}
                    onDrop={(e) => handleDropLane(e, laneKey)}
                  >
                    <div className="figma-core p-5 sm:p-6 space-y-4">
                      
                      {/* Lane Header Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner">
                            <Icon className="w-5 h-5 text-white stroke-[2]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white tracking-tight">{config.title}</h4>
                              <span className={`dev-tag ${config.color}`}>{config.tag}</span>
                            </div>
                            <p className="text-xs text-zinc-400 font-normal mt-0.5">{config.subtitle}</p>
                          </div>
                        </div>

                        {/* Lane Stats & Add Project Button */}
                        <div className="flex items-center gap-2">
                          {(lanePaidTotal > 0 || laneUnpaidTotal > 0) && (
                            <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                              {lanePaidTotal > 0 && (
                                <span className="text-emerald-400">Paid: {formatRupiah(lanePaidTotal)}</span>
                              )}
                              {lanePaidTotal > 0 && laneUnpaidTotal > 0 && <span className="text-zinc-600">•</span>}
                              {laneUnpaidTotal > 0 && (
                                <span className="text-amber-300">OTW: {formatRupiah(laneUnpaidTotal)}</span>
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
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1 transition-all"
                            title={`Tambah project ke ${config.title}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px]">Tambah</span>
                          </button>
                        </div>
                      </div>

                      {/* Strategic Lane Rule Banner */}
                      <div className="p-2.5 rounded-xl bg-[#060609] border border-white/[0.05] text-xs font-mono text-zinc-300 flex items-center justify-between">
                        <div>
                          <span className="text-amber-400 font-bold">// STRATEGI:</span> {config.rule}
                        </div>
                      </div>

                      {/* Drop Target Indicator */}
                      {isHoveredLane && draggedProjectId && (
                        <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-400/70 bg-emerald-500/10 text-emerald-300 text-xs font-mono text-center animate-pulse">
                          ↓ Lepaskan untuk pindahkan project ke {config.title}
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
                                  ? 'opacity-30 scale-95 border-dashed border-white/50 bg-[#161624]'
                                  : 'bg-[#060609] border-white/[0.06] hover:border-white/20 hover:bg-[#0c0c14] hover:-translate-y-0.5 shadow-md'
                              }`}
                            >
                              {/* Card Header & Priority */}
                              <div className="flex justify-between items-start gap-1">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="dev-tag text-[9px] py-0 px-2">
                                      {p.priority}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-400">
                                      {p.paymentStatus}
                                    </span>
                                  </div>
                                  <h5 className="text-sm font-bold text-white mt-1.5 truncate">{p.name}</h5>
                                  <p className="text-[11px] text-zinc-400 font-mono">{p.valueText}</p>
                                </div>
                                <GripVertical className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 shrink-0" />
                              </div>

                              {/* Next Action Pod */}
                              <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-[11px] space-y-1">
                                <p className="text-zinc-200 leading-relaxed">
                                  <span className="text-amber-400 font-mono font-bold">⚡ Next:</span> {p.nextAction}
                                </p>
                                {p.rule && (
                                  <p className="text-[10px] text-zinc-500 font-mono italic">
                                    // {p.rule}
                                  </p>
                                )}
                              </div>

                              {/* Interactive Kanban Column Switcher Pills */}
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
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
                                            ? 'bg-emerald-500 text-black shadow-sm'
                                            : col === 'WAITING'
                                            ? 'bg-amber-400 text-black shadow-sm'
                                            : col === 'PARKED'
                                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                            : 'bg-white text-black shadow-sm'
                                          : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                                      }`}
                                    >
                                      {col}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-1 text-[11px] font-mono">
                                <button
                                  onClick={() => {
                                    soundManager.playClick();
                                    onStartFocusOnProject(p);
                                  }}
                                  className="text-zinc-300 hover:text-white font-medium flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
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
                                      className="text-blue-300 hover:text-blue-200 flex items-center gap-1 bg-[#0070F3]/10 px-2.5 py-1.5 rounded-xl border border-[#0070F3]/20 hover:bg-[#0070F3]/20 transition-colors"
                                      title="Buat invoice tagihan untuk project ini"
                                    >
                                      <Receipt className="w-3 h-3 text-[#0070F3]" />
                                      <span>Invoice</span>
                                    </button>
                                  )}

                                  {onOpenFollowUpForProject && (
                                    <button
                                      onClick={() => {
                                        soundManager.playClick();
                                        onOpenFollowUpForProject(p);
                                      }}
                                      className="text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
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
                          <div className="col-span-full p-8 text-center text-zinc-600 font-mono text-xs border border-dashed border-white/5 rounded-2xl">
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
          {boardColumns.map((col) => {
            const colProjects = projects.filter(p => p.boardColumn === col.id);
            const isColumnHovered = dragOverColumn === col.id;

            return (
              <div 
                key={col.id} 
                className={`figma-shell transition-all duration-200 ${
                  isColumnHovered 
                    ? 'ring-2 ring-emerald-400/80 border-emerald-400/50 scale-[1.01]' 
                    : ''
                }`}
                onDragOver={(e) => handleDragOverColumn(e, col.id)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => handleDropColumn(e, col.id)}
              >
                <div className="figma-core p-3.5 space-y-3 min-h-[500px] flex flex-col justify-start">
                  
                  {/* Column Header */}
                  <div className={`p-3 rounded-xl bg-[#060609] border ${col.color} flex items-center justify-between`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold tracking-wider">{col.label}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono">{col.desc}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">
                      {colProjects.length}
                    </span>
                  </div>

                  {/* Drop Placeholder Indicator when hovering */}
                  {isColumnHovered && draggedProjectId && (
                    <div className="p-3.5 rounded-2xl border-2 border-dashed border-emerald-400/60 bg-emerald-500/10 text-emerald-300 text-xs font-mono text-center animate-pulse">
                      ↓ Lepaskan untuk pindah ke {col.label}
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
                              ? 'opacity-30 scale-95 border-dashed border-white/50 bg-[#161624]'
                              : 'bg-[#060609] border-white/[0.06] hover:border-white/20 hover:bg-[#0c0c14] hover:-translate-y-0.5 shadow-md'
                          }`}
                        >
                          {/* Card Header & Priority */}
                          <div className="flex justify-between items-start gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="dev-tag text-[9px] py-0 px-2">
                                  {project.priority}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  {project.paymentStatus}
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-white mt-1 truncate">{project.name}</h5>
                              <p className="text-[11px] text-zinc-400 font-mono">{project.valueText}</p>
                            </div>
                            <GripVertical className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300" />
                          </div>

                          {/* Next Action Pod */}
                          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-[11px] space-y-1">
                            <p className="text-zinc-200">
                              <span className="text-amber-400 font-mono font-bold">⚡ Next:</span> {project.nextAction}
                            </p>
                            {project.rule && (
                              <p className="text-[10px] text-zinc-500 font-mono italic">
                                // {project.rule}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {project.boardColumn !== 'PARKED' && (
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1 text-[11px] font-mono">
                              <button
                                onClick={() => {
                                  soundManager.playClick();
                                  onStartFocusOnProject(project);
                                }}
                                className="text-zinc-300 hover:text-white font-medium flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
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
                                    className="text-blue-300 hover:text-blue-200 flex items-center gap-1 bg-[#0070F3]/10 px-2 py-1 rounded-lg border border-[#0070F3]/20 hover:bg-[#0070F3]/20 transition-colors"
                                    title="Buat invoice tagihan untuk project ini"
                                  >
                                    <Receipt className="w-3 h-3 text-[#0070F3]" />
                                    <span>Invoice</span>
                                  </button>
                                )}

                                {onOpenFollowUpForProject && (
                                  <button
                                    onClick={() => {
                                      soundManager.playClick();
                                      onOpenFollowUpForProject(project);
                                    }}
                                    className="text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                                    title="Copas follow up ke client"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WA</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}

                    {colProjects.length === 0 && !isColumnHovered && (
                      <div className="p-8 text-center text-zinc-600 font-mono text-xs border border-dashed border-white/5 rounded-2xl">
                        Tarik kartu ke sini
                      </div>
                    )}
                  </div>

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="max-w-lg w-full bg-[#0a0a0f] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <h4 className="text-base font-bold text-white">Tambah Project Baru</h4>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-mono">
              
              {/* Lane Selector */}
              <div>
                <label className="text-zinc-400 block mb-1">Target Lane:</label>
                <select
                  value={newProjectLane}
                  onChange={(e) => setNewProjectLane(e.target.value as LaneType)}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl p-2.5 text-white focus:border-white focus:outline-none"
                >
                  {allLanes.map(l => (
                    <option key={l} value={l}>{laneConfigs[l].title}</option>
                  ))}
                </select>
              </div>

              {/* Project Name */}
              <div>
                <label className="text-zinc-400 block mb-1">Nama Project / Client:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasir Barber Underrated / Logo Baru"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl p-2.5 text-white focus:border-white focus:outline-none font-sans"
                />
              </div>

              {/* Next Action */}
              <div>
                <label className="text-zinc-400 block mb-1">Next Action Konkret:</label>
                <input
                  type="text"
                  placeholder="e.g. Siapkan scope & kirim invoice DP 50%"
                  value={newProjectAction}
                  onChange={(e) => setNewProjectAction(e.target.value)}
                  className="w-full bg-[#12121a] border border-white/10 rounded-xl p-2.5 text-white focus:border-white focus:outline-none font-sans"
                />
              </div>

              {/* Nominal & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Nominal / Nilai:</label>
                  <input
                    type="text"
                    placeholder="e.g. Rp3.000.000 (DP)"
                    value={newProjectValue}
                    onChange={(e) => setNewProjectValue(e.target.value)}
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl p-2.5 text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Priority:</label>
                  <select
                    value={newProjectPriority}
                    onChange={(e) => setNewProjectPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-[#12121a] border border-white/10 rounded-xl p-2.5 text-white focus:border-white focus:outline-none"
                  >
                    <option value="P1">P1 (Urgent Cash / Delivery)</option>
                    <option value="P2">P2 (Important Setup)</option>
                    <option value="P3">P3 (Routine / Maintenance)</option>
                    <option value="PARKED">PARKED (Dormant)</option>
                  </select>
                </div>
              </div>

              {/* Initial Kanban Column */}
              <div>
                <label className="text-zinc-400 block mb-1">Initial Kanban Column:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['DOING', 'QUEUE', 'WAITING', 'PARKED'] as BoardColumn[]).map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewProjectCol(c)}
                      className={`p-2 rounded-xl text-center font-bold text-[10px] ${
                        newProjectCol === c ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 border border-white/10'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 dev-btn-primary font-bold text-black"
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
