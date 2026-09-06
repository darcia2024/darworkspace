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
      color: 'border-[#ded7c8] text-[#59594f] bg-[#eae5d8]'
    },
    parking_lot: {
      title: 'Lane 6 — Parking Lot (Ide Disimpan)',
      subtitle: 'Semua ide liar/distraksi yang belum waktunya dieksekusi',
      icon: Archive,
      tag: 'LANE_06',
      rule: 'ANTI DISTRAKSI: Parkir di sini dulu biar otak tenang.',
      color: 'border-[#ded7c8] text-[#814637] bg-[#f9ded1]'
    },
  };

  const allLanes: LaneType[] = ['client_delivery', 'maintenance', 'bizdev', 'own_product', 'operations', 'parking_lot'];

  const boardColumns: { id: BoardColumn; label: string; desc: string; color: string }[] = [
    { id: 'QUEUE', label: '1. QUEUE // ANTRIAN', desc: 'Siap dieksekusi berikutnya', color: 'border-[#ded7c8] text-[#252520]' },
    { id: 'DOING', label: '2. DOING // SEDANG AKTIF', desc: 'Max 1-2 Task bersamaan', color: 'border-[#305d46]/40 text-[#305d46]' },
    { id: 'WAITING', label: '3. WAITING // FEEDBACK & DP', desc: 'Menunggu respon/uang masuk', color: 'border-[#b87e2b]/40 text-[#925f18]' },
    { id: 'PARKED', label: '4. PARKED // DISIMPAN', desc: 'Ide & project yang di-pause', color: 'border-[#ded7c8] text-[#59594f]' }
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
    else if (newCol === 'WAITING') newStatus = (project.paidNumeric > 0 ? 'Waiting Approval' : 'Waiting Payment');
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
      
      {/* Header with Switcher */}
      <div className="figma-shell">
        <div className="figma-core p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 bg-[#fffdf5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#305d46] animate-pulse" />
              <h3 className="text-base font-bold text-[#252520] tracking-tight">Daru Project Workspace</h3>
              <span className="dev-tag text-[9px]">{viewMode === 'lanes' ? '6_LANES_MODE' : 'KANBAN_BOARD'}</span>
            </div>
            <p className="text-xs text-[#59594f] font-normal mt-0.5">
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
              className="px-3.5 py-1.5 dev-btn-primary text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Project</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-[#eae5d8] p-1 rounded-xl border border-[#ded7c8] font-mono text-xs">
              <button
                onClick={() => { soundManager.playClick(); setViewMode('lanes'); }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'lanes' ? 'bg-[#292a24] text-[#fffdf5] font-bold shadow-sm' : 'text-[#59594f] hover:text-[#252520]'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Lanes View</span>
              </button>
              <button
                onClick={() => { soundManager.playClick(); setViewMode('board'); }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'board' ? 'bg-[#292a24] text-[#fffdf5] font-bold shadow-sm' : 'text-[#59594f] hover:text-[#252520]'
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
          <div className="flex items-center gap-1.5 bg-[#fffdf5] p-1.5 rounded-2xl border border-[#ded7c8] overflow-x-auto no-scrollbar font-mono text-xs shadow-sm">
            <button
              onClick={() => { soundManager.playClick(); setSelectedLane('ALL'); }}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedLane === 'ALL' ? 'bg-[#292a24] text-[#fffdf5] font-bold shadow-sm' : 'text-[#59594f] hover:text-[#252520] hover:bg-[#eae5d8]'
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
                    selectedLane === l ? 'bg-[#292a24] text-[#fffdf5] font-bold shadow-sm' : 'text-[#59594f] hover:text-[#252520] hover:bg-[#eae5d8]'
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
                      isHoveredLane ? 'ring-2 ring-[#305d46] border-[#305d46] scale-[1.005]' : ''
                    }`}
                    onDragOver={(e) => handleDragOverLane(e, laneKey)}
                    onDragLeave={() => setDragOverLane(null)}
                    onDrop={(e) => handleDropLane(e, laneKey)}
                  >
                    <div className="figma-core p-5 sm:p-6 space-y-4 bg-[#fffdf5]">
                      
                      {/* Lane Header Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded7c8] pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-2xl bg-[#eae5d8] border border-[#ded7c8] text-[#252520]">
                            <Icon className="w-5 h-5 text-[#252520] stroke-[2]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-[#252520] tracking-tight">{config.title}</h4>
                              <span className={`dev-tag ${config.color}`}>{config.tag}</span>
                            </div>
                            <p className="text-xs text-[#59594f] font-normal mt-0.5">{config.subtitle}</p>
                          </div>
                        </div>

                        {/* Lane Stats & Add Project Button */}
                        <div className="flex items-center gap-2">
                          {(lanePaidTotal > 0 || laneUnpaidTotal > 0) && (
                            <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-[#faf9f3] px-3 py-1.5 rounded-xl border border-[#ded7c8]">
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
                            className="p-1.5 rounded-xl bg-[#faf9f3] hover:bg-[#eae5d8] text-[#252520] border border-[#ded7c8] text-xs font-mono flex items-center gap-1 transition-all"
                            title={`Tambah project ke ${config.title}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px]">Tambah</span>
                          </button>
                        </div>
                      </div>

                      {/* Strategic Lane Rule Banner */}
                      <div className="p-2.5 rounded-xl bg-[#faf9f3] border border-[#ded7c8] text-xs font-mono text-[#59594f] flex items-center justify-between">
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
                                  ? 'opacity-30 scale-95 border-dashed border-[#292a24] bg-[#eae5d8]'
                                  : 'bg-[#faf9f3] border-[#ded7c8] hover:border-[#928876] hover:bg-[#fffdf5] hover:-translate-y-0.5 shadow-sm'
                              }`}
                            >
                              {/* Card Header & Priority */}
                              <div className="flex justify-between items-start gap-1">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="dev-tag text-[9px] py-0 px-2">
                                      {p.priority}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#59594f]">
                                      {p.paymentStatus}
                                    </span>
                                  </div>
                                  <h5 className="text-sm font-bold text-[#252520] mt-1.5 truncate">{p.name}</h5>
                                  <p className="text-[11px] text-[#59594f] font-mono">{p.valueText}</p>
                                </div>
                                <GripVertical className="w-4 h-4 text-[#928876] group-hover:text-[#252520] shrink-0" />
                              </div>

                              {/* Next Action Pod */}
                              <div className="p-2.5 rounded-xl bg-[#fffdf5] border border-[#ded7c8] text-[11px] space-y-1">
                                <p className="text-[#252520] leading-relaxed">
                                  <span className="text-[#925f18] font-mono font-bold">Next:</span> {p.nextAction}
                                </p>
                                {p.rule && (
                                  <p className="text-[10px] text-[#59594f] font-mono italic">
                                    // {p.rule}
                                  </p>
                                )}
                              </div>

                              {/* Interactive Kanban Column Switcher Pills */}
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-[#59594f] block uppercase tracking-wider">
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
                                          : 'bg-[#eae5d8] text-[#59594f] hover:text-[#252520] hover:bg-[#ded7c8]'
                                      }`}
                                    >
                                      {col}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="pt-2.5 border-t border-[#ded7c8] flex items-center justify-between gap-1 text-[11px] font-mono">
                                <button
                                  onClick={() => {
                                    soundManager.playClick();
                                    onStartFocusOnProject(p);
                                  }}
                                  className="text-[#252520] hover:text-black font-medium flex items-center gap-1 bg-[#fffdf5] px-2.5 py-1.5 rounded-xl border border-[#ded7c8] hover:bg-[#eae5d8] transition-colors shadow-sm"
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
                                      className="text-[#252520] hover:text-black flex items-center gap-1 bg-[#adc6ed]/40 px-2.5 py-1.5 rounded-xl border border-[#adc6ed] hover:bg-[#adc6ed]/70 transition-colors shadow-sm"
                                      title="Buat invoice tagihan untuk project ini"
                                    >
                                      <Receipt className="w-3 h-3 text-[#252520]" />
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
                          <div className="col-span-full p-8 text-center text-[#59594f] font-mono text-xs border border-dashed border-[#ded7c8] rounded-2xl bg-[#faf9f3]">
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
                    ? 'ring-2 ring-[#305d46] border-[#305d46] scale-[1.01]' 
                    : ''
                }`}
                onDragOver={(e) => handleDragOverColumn(e, col.id)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => handleDropColumn(e, col.id)}
              >
                <div className="figma-core p-3.5 space-y-3 min-h-[500px] flex flex-col justify-start bg-[#fffdf5]">
                  
                  {/* Column Header */}
                  <div className={`p-3 rounded-xl bg-[#faf9f3] border ${col.color} flex items-center justify-between`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold tracking-wider">{col.label}</span>
                      </div>
                      <p className="text-[10px] text-[#59594f] font-mono">{col.desc}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#252520] bg-[#eae5d8] border border-[#ded7c8] px-2 py-0.5 rounded-lg">
                      {colProjects.length}
                    </span>
                  </div>

                  {/* Drop Placeholder Indicator when hovering */}
                  {isColumnHovered && draggedProjectId && (
                    <div className="p-3.5 rounded-2xl border-2 border-dashed border-[#305d46] bg-[#e2ecdc] text-[#305d46] text-xs font-mono text-center animate-pulse">
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
                              ? 'opacity-30 scale-95 border-dashed border-[#292a24] bg-[#eae5d8]'
                              : 'bg-[#faf9f3] border-[#ded7c8] hover:border-[#928876] hover:bg-[#fffdf5] hover:-translate-y-0.5 shadow-sm'
                          }`}
                        >
                          {/* Card Header & Priority */}
                          <div className="flex justify-between items-start gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="dev-tag text-[9px] py-0 px-2">
                                  {project.priority}
                                </span>
                                <span className="text-[10px] font-mono text-[#59594f]">
                                  {project.paymentStatus}
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-[#252520] mt-1 truncate">{project.name}</h5>
                              <p className="text-[11px] text-[#59594f] font-mono">{project.valueText}</p>
                            </div>
                            <GripVertical className="w-3.5 h-3.5 text-[#928876] group-hover:text-[#252520]" />
                          </div>

                          {/* Next Action Pod */}
                          <div className="p-2.5 rounded-xl bg-[#fffdf5] border border-[#ded7c8] text-[11px] space-y-1">
                            <p className="text-[#252520]">
                              <span className="text-[#925f18] font-mono font-bold">Next:</span> {project.nextAction}
                            </p>
                            {project.rule && (
                              <p className="text-[10px] text-[#59594f] font-mono italic">
                                // {project.rule}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {project.boardColumn !== 'PARKED' && (
                            <div className="pt-2 border-t border-[#ded7c8] flex items-center justify-between gap-1 text-[11px] font-mono">
                              <button
                                onClick={() => {
                                  soundManager.playClick();
                                  onStartFocusOnProject(project);
                                }}
                                className="text-[#252520] hover:text-black font-medium flex items-center gap-1 bg-[#fffdf5] px-2.5 py-1 rounded-lg border border-[#ded7c8] hover:bg-[#eae5d8] transition-colors shadow-sm"
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
                                    className="text-[#252520] hover:text-black flex items-center gap-1 bg-[#adc6ed]/40 px-2 py-1 rounded-lg border border-[#adc6ed] hover:bg-[#adc6ed]/70 transition-colors shadow-sm"
                                    title="Buat invoice tagihan untuk project ini"
                                  >
                                    <Receipt className="w-3 h-3 text-[#252520]" />
                                    <span>Invoice</span>
                                  </button>
                                )}

                                {onOpenFollowUpForProject && (
                                  <button
                                    onClick={() => {
                                      soundManager.playClick();
                                      onOpenFollowUpForProject(project);
                                    }}
                                    className="text-[#925f18] hover:text-amber-900 flex items-center gap-1 bg-[#ffb99f]/40 px-2 py-1 rounded-lg border border-[#ffb99f] hover:bg-[#ffb99f]/70 transition-colors shadow-sm"
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
                      <div className="p-8 text-center text-[#59594f] font-mono text-xs border border-dashed border-[#ded7c8] rounded-2xl bg-[#faf9f3]">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="max-w-lg w-full bg-[#fffdf5] border border-[#ded7c8] rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#ded7c8] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#305d46]" />
                <h4 className="text-base font-bold text-[#252520]">Tambah Project Baru</h4>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#59594f] hover:text-[#252520]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-mono">
              
              {/* Lane Selector */}
              <div>
                <label className="text-[#59594f] block mb-1">Target Lane:</label>
                <select
                  value={newProjectLane}
                  onChange={(e) => setNewProjectLane(e.target.value as LaneType)}
                  className="w-full bg-[#faf9f3] border border-[#ded7c8] rounded-xl p-2.5 text-[#252520] focus:border-[#292a24] focus:outline-none"
                >
                  {allLanes.map(l => (
                    <option key={l} value={l}>{laneConfigs[l].title}</option>
                  ))}
                </select>
              </div>

              {/* Project Name */}
              <div>
                <label className="text-[#59594f] block mb-1">Nama Project / Client:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasir Barber Underrated / Logo Baru"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-[#faf9f3] border border-[#ded7c8] rounded-xl p-2.5 text-[#252520] focus:border-[#292a24] focus:outline-none font-sans"
                />
              </div>

              {/* Next Action */}
              <div>
                <label className="text-[#59594f] block mb-1">Next Action Konkret:</label>
                <input
                  type="text"
                  placeholder="e.g. Siapkan scope & kirim invoice DP 50%"
                  value={newProjectAction}
                  onChange={(e) => setNewProjectAction(e.target.value)}
                  className="w-full bg-[#faf9f3] border border-[#ded7c8] rounded-xl p-2.5 text-[#252520] focus:border-[#292a24] focus:outline-none font-sans"
                />
              </div>

              {/* Nominal & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#59594f] block mb-1">Nominal / Nilai:</label>
                  <input
                    type="text"
                    placeholder="e.g. Rp6.000.000 (DP Rp3M)"
                    value={newProjectValue}
                    onChange={(e) => setNewProjectValue(e.target.value)}
                    className="w-full bg-[#faf9f3] border border-[#ded7c8] rounded-xl p-2.5 text-[#252520] focus:border-[#292a24] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#59594f] block mb-1">Priority Level:</label>
                  <select
                    value={newProjectPriority}
                    onChange={(e) => setNewProjectPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-[#faf9f3] border border-[#ded7c8] rounded-xl p-2.5 text-[#252520] focus:border-[#292a24] focus:outline-none"
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
                <label className="text-[#59594f] block mb-1">Masuk Kolom Kanban:</label>
                <select
                  value={newProjectCol}
                  onChange={(e) => setNewProjectCol(e.target.value as BoardColumn)}
                  className="w-full bg-[#faf9f3] border border-[#ded7c8] rounded-xl p-2.5 text-[#252520] focus:border-[#292a24] focus:outline-none"
                >
                  <option value="QUEUE">Queue (Antrian)</option>
                  <option value="DOING">Doing (Sedang Dikerjakan)</option>
                  <option value="WAITING">Waiting (Menunggu DP/Feedback)</option>
                  <option value="PARKED">Parked (Disimpan Dulu)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ded7c8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#faf9f3] hover:bg-[#eae5d8] text-[#59594f] border border-[#ded7c8] transition-colors"
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
