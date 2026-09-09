import React, { useState } from 'react';
import { 
  ProjectCard, 
  LaneType, 
  BoardColumn, 
  PriorityLevel 
} from '../types';
import { soundManager } from '../utils/audio';
import { 
  Search, 
  Check, 
  ArrowRight, 
  Layers, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Save, 
  RefreshCw 
} from 'lucide-react';

interface ProjectUpdateViewProps {
  projects: ProjectCard[];
  onUpdateProject: (project: ProjectCard) => void;
  onAddProject?: (project: Omit<ProjectCard, 'id'>) => void;
  onSelectTab: (tab: string) => void;
}

const laneLabels: Record<LaneType, string> = {
  client_delivery: 'Lane 1 - Client Delivery',
  maintenance: 'Lane 2 - Maintenance',
  bizdev: 'Lane 3 - BizDev & Sales',
  own_product: 'Lane 4 - Core Product',
  operations: 'Lane 5 - Daily Operations',
  parking_lot: 'Lane 6 - Parking Lot'
};

const columnLabels: Record<BoardColumn, string> = {
  DOING: 'Sedang Dikerjakan (Doing)',
  QUEUE: 'Antrian Siap Eksekusi (Queue)',
  WAITING: 'Menunggu Klien / Bayar (Waiting)',
  DONE: 'Selesai Tuntas (Done)',
  PARKED: 'Diparkir Dulu (Parked)'
};

export const ProjectUpdateView: React.FC<ProjectUpdateViewProps> = ({
  projects,
  onUpdateProject,
  onAddProject,
  onSelectTab
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLane, setFilterLane] = useState<string>('all');
  const [filterColumn, setFilterColumn] = useState<string>('all');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // New Project Drawer/Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLane, setNewLane] = useState<LaneType>('client_delivery');
  const [newNominal, setNewNominal] = useState(0);
  const [newGoal, setNewGoal] = useState('');
  const [newAction, setNewAction] = useState('');

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Local draft state for selected project
  const [draft, setDraft] = useState<ProjectCard>(selectedProject || projects[0]);

  // When selected project changes, update draft
  React.useEffect(() => {
    if (selectedProject) {
      setDraft(selectedProject);
    }
  }, [selectedProjectId, selectedProject]);

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.nextAction && p.nextAction.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchLane = filterLane === 'all' || p.lane === filterLane;
    const matchCol = filterColumn === 'all' || p.boardColumn === filterColumn;
    return matchSearch && matchLane && matchCol;
  });

  const handleFieldChange = <K extends keyof ProjectCard>(key: K, value: ProjectCard[K]) => {
    setDraft(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;

    soundManager.playClick();

    const nominal = Number(draft.nominalNumeric || 0);
    const paid = Number(draft.paidNumeric || 0);
    const updatedPaymentStatus = paid > 0 
      ? (paid >= nominal && nominal > 0 ? 'Paid' : 'Partial')
      : (draft.paymentStatus || 'Expected');

    const updated: ProjectCard = {
      ...draft,
      name: draft.name.trim(),
      nominalNumeric: nominal,
      paidNumeric: paid,
      unpaidNumeric: Math.max(0, nominal - paid),
      valueText: nominal > 0 ? `Rp${nominal.toLocaleString('id-ID')}` : draft.valueText,
      paymentStatus: updatedPaymentStatus
    };

    onUpdateProject(updated);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !onAddProject) return;

    soundManager.playClick();
    onAddProject({
      name: newName.trim(),
      lane: newLane,
      boardColumn: 'QUEUE',
      status: 'Queue',
      paymentStatus: newNominal > 0 ? 'Expected' : 'Free',
      valueText: newNominal > 0 ? `Rp${newNominal.toLocaleString('id-ID')}` : 'Internal Project',
      nominalNumeric: newNominal,
      paidNumeric: 0,
      unpaidNumeric: newNominal,
      priority: 'P2',
      currentGoal: newGoal.trim() || 'Setup & Kickoff',
      nextAction: newAction.trim() || 'Rencanakan langkah awal proyek',
      billingMilestone: newNominal > 0 ? 'Kickoff DP' : 'Non-billable',
      followUpDeadline: 'Hari ini'
    });

    setNewName('');
    setNewGoal('');
    setNewAction('');
    setNewNominal(0);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Update Project</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Kelola perkembangan, ubah status fase kerja, sesuaikan next action, dan sinkronkan otomatis ke seluruh dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingNew(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Tutup Form' : 'Tambah Project Baru'}</span>
          </button>

          <button
            onClick={() => onSelectTab('lanes')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-all"
          >
            <span>Lihat Markas Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New Project Form Card (Collapsible) */}
      {isAddingNew && (
        <form onSubmit={handleCreateNewProject} className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Buat Entri Project Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Nama Project</label>
              <input
                type="text"
                required
                placeholder="Contoh: Platform CRM Klien X"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Jalur / Lane</label>
              <select
                value={newLane}
                onChange={e => setNewLane(e.target.value as LaneType)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
              >
                {(Object.keys(laneLabels) as LaneType[]).map(lane => (
                  <option key={lane} value={lane}>{laneLabels[lane]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Nilai Kontrak (Rp)</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0 jika non-billable"
                value={newNominal || ''}
                onChange={e => setNewNominal(Number(e.target.value))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Next Action Pertama</label>
              <input
                type="text"
                placeholder="Langkah konkrit awal"
                value={newAction}
                onChange={e => setNewAction(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-medium"
            >
              Simpan Project Baru
            </button>
          </div>
        </form>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Project Selector & Quick Filters (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari project..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 placeholder:text-zinc-400"
            />
          </div>

          {/* Quick Filter Row */}
          <div className="flex gap-2 text-xs">
            <select
              value={filterColumn}
              onChange={e => setFilterColumn(e.target.value)}
              className="flex-1 bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-zinc-700 text-[11px] focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="DOING">Doing (Aktif)</option>
              <option value="QUEUE">Queue (Antrian)</option>
              <option value="WAITING">Waiting (Nunggu)</option>
              <option value="DONE">Done (Selesai)</option>
              <option value="PARKED">Parked</option>
            </select>

            <select
              value={filterLane}
              onChange={e => setFilterLane(e.target.value)}
              className="flex-1 bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-zinc-700 text-[11px] focus:outline-none"
            >
              <option value="all">Semua Jalur</option>
              <option value="client_delivery">Client Delivery</option>
              <option value="maintenance">Maintenance</option>
              <option value="bizdev">BizDev</option>
              <option value="own_product">Core Product</option>
            </select>
          </div>

          {/* Project List */}
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredProjects.map(project => {
              const isSelected = project.id === (draft?.id || selectedProjectId);
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedProjectId(project.id);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                      : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono font-bold ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      {project.priority} · {project.boardColumn}
                    </span>
                    <span className={`text-[10px] font-mono ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      {project.nominalNumeric > 0 ? `Rp${(project.nominalNumeric / 1000000).toFixed(1)}M` : 'Free'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold mt-1 line-clamp-1">{project.name}</h4>

                  <p className={`text-[11px] mt-1 line-clamp-1 ${
                    isSelected ? 'text-zinc-300' : 'text-zinc-500'
                  }`}>
                    {project.nextAction || 'Belum ada next action'}
                  </p>
                </button>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="p-6 text-center text-xs text-zinc-500 bg-white border border-zinc-200 rounded-2xl">
                Tidak ada project yang cocok.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Detailed Project Update Editor (8 cols) */}
        <div className="lg:col-span-8">
          {draft ? (
            <form onSubmit={handleSave} className="p-6 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-5">
              
              {/* Card Title & Fast Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                    DETAIL & STATUS PROYEK
                  </span>
                  <h2 className="text-lg font-bold text-zinc-900 tracking-tight mt-0.5">
                    {draft.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {isSavedNotice && (
                    <span className="text-xs text-emerald-600 font-medium animate-fade-in flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Tersinkronisasi
                    </span>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-medium transition-all shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan & Sinkronkan</span>
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 font-medium mb-1">Nama Project</label>
                  <input
                    type="text"
                    required
                    value={draft.name}
                    onChange={e => handleFieldChange('name', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500 font-semibold"
                  />
                </div>

                {/* Status Column & Lane */}
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Kolom Tahapan (Status Board)</label>
                  <select
                    value={draft.boardColumn}
                    onChange={e => handleFieldChange('boardColumn', e.target.value as BoardColumn)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
                  >
                    {(Object.keys(columnLabels) as BoardColumn[]).map(col => (
                      <option key={col} value={col}>{columnLabels[col]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Jalur Kerja (Workflow Lane)</label>
                  <select
                    value={draft.lane}
                    onChange={e => handleFieldChange('lane', e.target.value as LaneType)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
                  >
                    {(Object.keys(laneLabels) as LaneType[]).map(lane => (
                      <option key={lane} value={lane}>{laneLabels[lane]}</option>
                    ))}
                  </select>
                </div>

                {/* Next Action & Current Goal */}
                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 font-medium mb-1">
                    Next Action Terkini (Langkah Nyata Berikutnya)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={draft.nextAction}
                    onChange={e => handleFieldChange('nextAction', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500 leading-relaxed"
                    placeholder="Contoh: Showcase demo ke owner & sepakati penawaran harga"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Mengubah next action ini akan otomatis memperbarui target harian (Today Pursuit) dan blok fokus (Today Blocks).
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 font-medium mb-1">
                    Goal & Progres Terkini (Current Milestone)
                  </label>
                  <textarea
                    rows={2}
                    value={draft.currentGoal || ''}
                    onChange={e => handleFieldChange('currentGoal', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500 leading-relaxed"
                    placeholder="Ringkasan apa yang baru saja dicapai atau target utama fase ini"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 font-medium mb-1">
                    Kriteria Selesai (Definition of Done)
                  </label>
                  <input
                    type="text"
                    value={draft.definitionOfDone || ''}
                    onChange={e => handleFieldChange('definitionOfDone', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
                    placeholder="Kapan project ini bisa dinyatakan 100% tuntas?"
                  />
                </div>

                {/* Financial Section */}
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Nilai Kontrak Total (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={draft.nominalNumeric || ''}
                    onChange={e => handleFieldChange('nominalNumeric', Number(e.target.value))}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Uang Sudah Masuk (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={draft.paidNumeric || ''}
                    onChange={e => handleFieldChange('paidNumeric', Number(e.target.value))}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Sisa belum lunas: Rp{Math.max(0, (draft.nominalNumeric || 0) - (draft.paidNumeric || 0)).toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Priority & Deadline */}
                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Tingkat Prioritas</label>
                  <select
                    value={draft.priority}
                    onChange={e => handleFieldChange('priority', e.target.value as PriorityLevel)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
                  >
                    <option value="P1">P1 (Tinggi / Urgent)</option>
                    <option value="P2">P2 (Menengah / Terjadwal)</option>
                    <option value="P3">P3 (Rendah / Rutin)</option>
                    <option value="PARKED">PARKED (Ditunda)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-medium mb-1">Target Tindak Lanjut / Deadline</label>
                  <input
                    type="text"
                    value={draft.followUpDeadline || ''}
                    onChange={e => handleFieldChange('followUpDeadline', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
                    placeholder="Contoh: Hari ini, Besok, atau Tanggal"
                  />
                </div>

                {/* If waiting, allow setting blocker */}
                {draft.boardColumn === 'WAITING' && (
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-700 font-medium mb-1">
                      Kendala / Apa yang Ditunggu (Blocker)
                    </label>
                    <input
                      type="text"
                      value={draft.blocker || ''}
                      onChange={e => handleFieldChange('blocker', e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
                      placeholder="Contoh: Menunggu review manajemen atau transfer invoice termin 1"
                    />
                  </div>
                )}

              </div>

              {/* Bottom Sync Summary */}
              <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-zinc-500 font-medium">
                  ID: <span className="font-mono">{draft.id}</span> · Status Keuangan: <span className="font-semibold text-zinc-800">{draft.paymentStatus}</span>
                </span>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-medium transition-all shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>

            </form>
          ) : (
            <div className="p-12 text-center text-xs text-zinc-400 bg-white border border-zinc-200 rounded-2xl">
              Pilih project di sebelah kiri untuk melihat dan memperbarui detail.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
