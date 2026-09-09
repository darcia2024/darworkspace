import React, { useState, useEffect } from 'react';
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
  Plus, 
  Save, 
  BookOpen, 
  FileText, 
  Edit3, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight
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
  const [isEditMode, setIsEditMode] = useState(false);

  // New Project Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLane, setNewLane] = useState<LaneType>('client_delivery');
  const [newNominal, setNewNominal] = useState(0);
  const [newGoal, setNewGoal] = useState('');
  const [newAction, setNewAction] = useState('');

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const [draft, setDraft] = useState<ProjectCard>(selectedProject || projects[0]);

  useEffect(() => {
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
    setIsEditMode(false);
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

  const rupiah = (num?: number) => {
    if (!num) return 'Rp0';
    return `Rp${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Magazine Masthead Header */}
      <header className="border-b border-zinc-200/80 pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1">
            <span>Daru.OS Publication</span>
            <span>·</span>
            <span>Project Field Journal</span>
            <span>·</span>
            <span>Volume {new Date().getFullYear()}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Jurnal & Progres Proyek
          </h1>
          <p className="text-sm text-zinc-600 max-w-xl mt-1 leading-relaxed">
            Catatan mendalam tiap inisiatif kerja: status fase lapangan, komitmen finansial, kriteria selesai, dan langkah eksekusi berikutnya.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddingNew(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Tutup Entri' : 'Tulis Entri Proyek Baru'}</span>
          </button>

          <button
            onClick={() => onSelectTab('lanes')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200/80 transition-all"
          >
            <span>Buka Board Visual</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* New Project Form (Card Sheet) */}
      {isAddingNew && (
        <form onSubmit={handleCreateNewProject} className="p-6 bg-white border border-zinc-300 rounded-3xl shadow-sm space-y-4 animate-fade-in">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">Inisiasi Entri Proyek Baru</h3>
            <span className="text-[11px] font-mono text-zinc-400">Draf Awal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Nama Proyek</label>
              <input
                type="text"
                required
                placeholder="Contoh: Platform LMS Klien"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">Jalur Kerja</label>
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
              <label className="block text-zinc-700 font-medium mb-1">Nilai Kontrak (Rp)</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0 jika internal"
                value={newNominal || ''}
                onChange={e => setNewNominal(Number(e.target.value))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">Langkah Nyata Awal</label>
              <input
                type="text"
                placeholder="Next action pertama"
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
              Simpan ke Sistem
            </button>
          </div>
        </form>
      )}

      {/* Magazine Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Table of Contents & Dispatch Filter (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-wide">
                Daftar Arsip ({filteredProjects.length})
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Pilih Dokumen</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari artikel proyek..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 placeholder:text-zinc-400"
              />
            </div>

            {/* Quick Filter */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <select
                value={filterColumn}
                onChange={e => setFilterColumn(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-1 text-zinc-700 focus:outline-none"
              >
                <option value="all">Semua Fase</option>
                <option value="DOING">Doing</option>
                <option value="QUEUE">Queue</option>
                <option value="WAITING">Waiting</option>
                <option value="DONE">Done</option>
                <option value="PARKED">Parked</option>
              </select>

              <select
                value={filterLane}
                onChange={e => setFilterLane(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-1 text-zinc-700 focus:outline-none"
              >
                <option value="all">Semua Jalur</option>
                <option value="client_delivery">Client Delivery</option>
                <option value="maintenance">Maintenance</option>
                <option value="bizdev">BizDev</option>
                <option value="own_product">Core Product</option>
              </select>
            </div>
          </div>

          {/* Project List / Index of Articles */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredProjects.map((project, index) => {
              const isSelected = project.id === (draft?.id || selectedProjectId);
              return (
                <article
                  key={project.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedProjectId(project.id);
                    setIsEditMode(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-zinc-900/10'
                      : 'bg-white hover:bg-zinc-50/90 border-zinc-200 text-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={isSelected ? 'text-zinc-300' : 'text-zinc-500'}>
                      #{String(index + 1).padStart(2, '0')} · {project.boardColumn}
                    </span>
                    <span className={`font-semibold ${isSelected ? 'text-emerald-300' : 'text-zinc-700'}`}>
                      {project.nominalNumeric > 0 ? rupiah(project.nominalNumeric) : 'Free'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold mt-1.5 line-clamp-1 leading-snug">
                    {project.name}
                  </h3>

                  <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed font-serif ${
                    isSelected ? 'text-zinc-300' : 'text-zinc-600'
                  }`}>
                    {project.currentGoal || project.nextAction || 'Belum ada catatan ringkasan.'}
                  </p>
                </article>
              );
            })}
          </div>
        </aside>

        {/* Right Main Column: Long-Form Editorial Article (8 cols) */}
        <main className="lg:col-span-8">
          {draft ? (
            <article className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 animate-fade-in">
              
              {/* Article Top Meta */}
              <div className="border-b border-zinc-100 pb-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-semibold">
                      {laneLabels[draft.lane]}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-zinc-700">
                      Prioritas {draft.priority}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-zinc-700">
                      Fase: {columnLabels[draft.boardColumn]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSavedNotice && (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-fade-in">
                        <Check className="w-3.5 h-3.5" />
                        Tersinkronisasi
                      </span>
                    )}

                    <button
                      onClick={() => setIsEditMode(prev => !prev)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditMode ? 'Mode Baca Artikel' : 'Edit Lembar Kerja'}</span>
                    </button>
                  </div>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                  {draft.name}
                </h1>

                {/* Sub-headline / Pull Quote */}
                <p className="text-sm sm:text-base text-zinc-600 font-serif leading-relaxed italic border-l-2 border-zinc-300 pl-4 py-1">
                  "{draft.currentGoal || 'Inisiatif proyek ini sedang berjalan sesuai dengan arahan operasional Daru.OS.'}"
                </p>
              </div>

              {/* READ MODE: Editorial Prose Format */}
              {!isEditMode ? (
                <div className="space-y-8 text-zinc-800">
                  
                  {/* Executive Summary Cards (Editorial Metric Bar) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-zinc-100 py-4 font-mono">
                    <div>
                      <span className="text-[11px] text-zinc-600 block">NILAI KONTRAK</span>
                      <strong className="text-lg text-zinc-900 block mt-0.5">
                        {rupiah(draft.nominalNumeric)}
                      </strong>
                      <span className="text-[10px] text-zinc-600">Status: {draft.paymentStatus}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-600 block">DANA TEREALISASI</span>
                      <strong className="text-lg text-emerald-700 block mt-0.5">
                        {rupiah(draft.paidNumeric)}
                      </strong>
                      <span className="text-[10px] text-zinc-600">
                        Sisa tagihan: {rupiah(Math.max(0, (draft.nominalNumeric || 0) - (draft.paidNumeric || 0)))}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-600 block">STATUS TAHAPAN</span>
                      <strong className="text-lg text-zinc-900 block mt-0.5">
                        {draft.boardColumn}
                      </strong>
                      <span className="text-[10px] text-zinc-600">Deadline: {draft.followUpDeadline || 'Hari ini'}</span>
                    </div>
                  </div>

                  {/* Section 1: Langkah Nyata Terkini */}
                  <section className="space-y-2.5">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600">
                      1. Langkah Nyata Terkini (Immediate Directive)
                    </h2>
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                      <p className="text-sm sm:text-base font-semibold text-zinc-900 leading-relaxed">
                        {draft.nextAction || 'Belum ada langkah yang ditentukan. Rumuskan arahan eksekusi berikutnya.'}
                      </p>
                    </div>
                  </section>

                  {/* Section 2: Ruang Lingkup & Kriteria Selesai */}
                  <section className="space-y-3">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600">
                      2. Tolok Ukur Keberhasilan (Definition of Done)
                    </h2>
                    <p className="text-sm leading-relaxed text-zinc-700 font-serif">
                      {draft.definitionOfDone 
                        ? draft.definitionOfDone 
                        : 'Pekerjaan dinyatakan selesai penuh setelah seluruh deliverable diserahkan ke klien, disetujui, dan seluruh hak pembayaran telah diselesaikan tanpa tanggungan terbuka.'}
                    </p>
                  </section>

                  {/* Section 3: Catatan Khusus & Regulasi Kerja */}
                  {(draft.rule || draft.blocker) && (
                    <section className="space-y-3 border-t border-zinc-100 pt-6">
                      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600">
                        3. Catatan Kendala & Aturan Kerja
                      </h2>
                      {draft.blocker && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                          <strong>Kendala Tertahan (Blocker):</strong> {draft.blocker}
                        </div>
                      )}
                      {draft.rule && (
                        <p className="text-xs text-zinc-600 font-mono italic">
                          // Aturan: {draft.rule}
                        </p>
                      )}
                    </section>
                  )}

                  {/* Article Footer Dispatch */}
                  <footer className="border-t border-zinc-100 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-600">
                    <div>
                      <span>Dokumen ID: {draft.id}</span>
                      <span className="mx-2">·</span>
                      <span>Otomatis tersinkron ke Target Harian & Board</span>
                    </div>

                    <button
                      onClick={() => setIsEditMode(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Ubah Isi Artikel & Status</span>
                    </button>
                  </footer>

                </div>
              ) : (
                /* EDIT MODE: Structured Editorial Form */
                <form onSubmit={handleSave} className="space-y-6 animate-fade-in text-xs">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-600">
                    Mode Sunting Aktif. Setiap data yang diubah di sini langsung memutakhirkan target harian, kamar fokus, radar tagihan, dan rekap keuangan.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-zinc-700 font-semibold mb-1">Judul / Nama Proyek</label>
                      <input
                        type="text"
                        required
                        value={draft.name}
                        onChange={e => handleFieldChange('name', e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Fase Status Board</label>
                      <select
                        value={draft.boardColumn}
                        onChange={e => handleFieldChange('boardColumn', e.target.value as BoardColumn)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700"
                      >
                        {(Object.keys(columnLabels) as BoardColumn[]).map(col => (
                          <option key={col} value={col}>{columnLabels[col]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Jalur Kerja</label>
                      <select
                        value={draft.lane}
                        onChange={e => handleFieldChange('lane', e.target.value as LaneType)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700"
                      >
                        {(Object.keys(laneLabels) as LaneType[]).map(lane => (
                          <option key={lane} value={lane}>{laneLabels[lane]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-zinc-700 font-semibold mb-1">
                        Langkah Nyata Terkini (Next Action)
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={draft.nextAction}
                        onChange={e => handleFieldChange('nextAction', e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700 font-sans"
                        placeholder="Contoh: Kirim penawaran harga dan jadwalkan kickoff meeting"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-zinc-700 font-semibold mb-1">
                        Catatan Capaian / Milestone Berjalan
                      </label>
                      <textarea
                        rows={2}
                        value={draft.currentGoal || ''}
                        onChange={e => handleFieldChange('currentGoal', e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700 font-sans"
                        placeholder="Ringkasan narasi perkembangan proyek"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-zinc-700 font-semibold mb-1">
                        Kriteria Selesai (Definition of Done)
                      </label>
                      <input
                        type="text"
                        value={draft.definitionOfDone || ''}
                        onChange={e => handleFieldChange('definitionOfDone', e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Nilai Kontrak Total (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draft.nominalNumeric || ''}
                        onChange={e => handleFieldChange('nominalNumeric', Number(e.target.value))}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Uang Sudah Masuk (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draft.paidNumeric || ''}
                        onChange={e => handleFieldChange('paidNumeric', Number(e.target.value))}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Prioritas Proyek</label>
                      <select
                        value={draft.priority}
                        onChange={e => handleFieldChange('priority', e.target.value as PriorityLevel)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700"
                      >
                        <option value="P1">P1 (Prioritas Tertinggi / Urgent)</option>
                        <option value="P2">P2 (Menengah / Terjadwal)</option>
                        <option value="P3">P3 (Rendah / Rutin)</option>
                        <option value="PARKED">PARKED (Ditunda Sementara)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Target Tindak Lanjut / Tanggal</label>
                      <input
                        type="text"
                        value={draft.followUpDeadline || ''}
                        onChange={e => handleFieldChange('followUpDeadline', e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700"
                        placeholder="Hari ini, Besok, atau Tanggal"
                      />
                    </div>

                    {draft.boardColumn === 'WAITING' && (
                      <div className="sm:col-span-2">
                        <label className="block text-zinc-700 font-semibold mb-1">
                          Kendala / Apa yang Sedang Ditunggu (Blocker)
                        </label>
                        <input
                          type="text"
                          value={draft.blocker || ''}
                          onChange={e => handleFieldChange('blocker', e.target.value)}
                          className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-700"
                          placeholder="Contoh: Menunggu approval revisi atau transfer invoice termin 1"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-zinc-900 hover:bg-black text-white font-medium shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan & Terbitkan Artikel</span>
                    </button>
                  </div>
                </form>
              )}

            </article>
          ) : (
            <div className="p-16 text-center text-zinc-400 bg-white border border-zinc-200 rounded-3xl font-serif italic">
              Pilih salah satu artikel proyek di sebelah kiri untuk membaca arsip lengkap.
            </div>
          )}
        </main>

      </div>

    </div>
  );
};
