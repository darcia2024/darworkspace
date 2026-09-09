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
  ArrowUpRight,
  AlertTriangle,
  Lightbulb,
  Compass,
  MessageSquare
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

// Generates default smart journalistic article & critique if not manually populated
function getEditorialStory(project: ProjectCard): { article: string; critique: string } {
  if (project.newsArticle && project.newsCritique) {
    return { article: project.newsArticle, critique: project.newsCritique };
  }

  // Smart journalistic fallback based on project identity & current status
  if (project.id === 'p-pgs-tour') {
    return {
      article: project.newsArticle || 
        "PGS Tour & Travel resmi mencatatkan lompatan signifikan dalam transformasi digitalnya. Seluruh 15 halaman statis berhasil di-prerender dan live sempurna di pgstour.vercel.app. Navigasi mobile kini mengadopsi standar editorial modern tanpa ornamen berlebih, trust strip legalitas izin PPIU Kemenag tertata rapi dalam layout dua kolom yang kokoh, dan kendala galeri jamaah di perangkat seluler telah teratasi tuntas menggunakan multi-source WebP fallback. Proyek ini membuktikan daya saing platform resmi yang menggabungkan kredibilitas agen perjalanan dengan konversi penjualan tinggi.",
      critique: project.newsCritique ||
        "Pekerjaan teknis dan antarmuka sudah 100% matang, namun ada satu celah krusial: penawaran harga dan ikatan kontrak resmi belum diformalkan sebelum serah terima. Jangan sampai website yang sudah live sempurna ini dimanfaatkan tanpa kepastian nominal invoice atau DP komitmen. Evaluasi: segera kunci pertemuan closing dengan owner, bawa demo live ini sebagai bargaining chip utama, dan terbitkan invoice pengerjaan."
    };
  }

  if (project.id === 'p-el-massa') {
    return {
      article: project.newsArticle ||
        "Katalog digital El Massa Tour & Travel telah resmi mencapai status operasional penuh dengan 12 paket ibadah yang seluruhnya terbuka dan siap diakses publik. Setiap paket kini dilengkapi brosur visual beresolusi tinggi, timeline itinerary perjalanan harian terperinci, pelacak kursi real-time, hingga simulator tabungan umrah mandiri bagi calon jamaah. Seluruh infrastruktur kode juga telah terhubung langsung ke kanal WhatsApp resmi operasional dan tersinkronisasi stabil pada branch main.",
      critique: project.newsCritique ||
        "Secara fungsional, katalog ini sangat solid dan melebihi ekspektasi standar web travel. Namun dari sisi bisnis, status penyelesaian 100% ini harus segera diiringi dengan penagihan biaya jasa. Begitu sistem diserahkan, leverage negosiasi developer akan menurun jika invoice final tidak dikirimkan serentak bersama dokumen serah terima. Evaluasi: kirim laporan resmi ini hari ini juga dan kunci kepastian tanggal transfer pelunasan."
    };
  }

  if (project.id === 'p-umi-elly') {
    return {
      article: project.newsArticle ||
        "Pembangunan platform LMS Peradaban Islam Azhariyah bersama Umi Elly kini telah memasuki fase krusial pasca-kickoff. Platform inti telah berhasil dibangun dan siap diuji coba. Fokus operasional beralih pada pendampingan kurikulum serta input konten modul pembelajaran agar sistem dapat digunakan secara mandiri dan intuitif oleh para pengajar dan santri.",
      critique: project.newsCritique ||
        "DP Termin 1 (Rp3.000.000) sudah aman di kas, namun risiko terbesar pada proyek edukasi adalah 'scope creep' materi. Jika format kurikulum tidak dibatasi dengan template yang baku, proses input modul bisa molor berminggu-minggu. Evaluasi: batasi sesi review maksimal 2 kali dan sepakati batas akhir penyerahan materi sebelum masuk termin 2."
    };
  }

  if (project.id === 'p-hamasah-ai') {
    return {
      article: project.newsArticle ||
        "Inisiatif integrasi kecerdasan buatan (AI) untuk ekosistem digital Hamasah Internasional resmi dibuka melalui tahapan discovery meeting langsung bersama owner. Pertemuan ini difokuskan untuk membedah pain point operasional, memetakan use-case AI yang benar-benar memberikan ROI nyata bagi website mereka, serta menyusun estimasi arsitektur teknis yang sesuai.",
      critique: project.newsCritique ||
        "Pertemuan eksplorasi rentan berakhir menjadi 'diskusi ide tanpa ujung' jika developer tidak segera menawarkan paket implementasi spesifik. Evaluasi: jangan tunggu owner merumuskan maunya apa. Begitu meeting selesai, langsung kirim proposal ringkas 1-halaman berisi 2 opsi paket AI konkret beserta nominal investasi yang jelas."
    };
  }

  // General fallback journalistic template
  return {
    article: project.newsArticle || 
      `Inisiatif ${project.name} saat ini berada dalam fase ${columnLabels[project.boardColumn]}. Tim memfokuskan tenaga pada pencapaian milestone: "${project.currentGoal || project.nextAction || 'Penyelesaian deliverable utama'}". Dengan status alokasi prioritas ${project.priority} di ${laneLabels[project.lane]}, progres diarahkan untuk menjaga ritme kerja tanpa distraksi non-esensial.`,
    critique: project.newsCritique ||
      `Perlu pengawasan ketat pada kriteria selesai. Pastikan setiap deliverable memiliki batasan waktu (timebox) yang jelas dan tidak menunda konfirmasi pembayaran atau feedback dari pihak terkait.`
  };
}

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
      const story = getEditorialStory(selectedProject);
      setDraft({
        ...selectedProject,
        newsArticle: selectedProject.newsArticle || story.article,
        newsCritique: selectedProject.newsCritique || story.critique
      });
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
      followUpDeadline: 'Hari ini',
      newsArticle: `Inisiatif baru ${newName.trim()} telah masuk ke radar antrian kerja. Langkah awal difokuskan pada pemetaan kebutuhan dan persiapan kickoff.`,
      newsCritique: 'Kritik awal: pastikan ruang lingkup dan komitmen pembayaran terkunci sebelum mulai menulis baris kode pertama.'
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

  const currentStory = draft ? getEditorialStory(draft) : { article: '', critique: '' };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Newspaper / Magazine Masthead */}
      <header className="border-b-2 border-zinc-900 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
            <span>Daru.OS Newsroom</span>
            <span>·</span>
            <span>Investigasi & Laporan Proyek</span>
            <span>·</span>
            <span>Edisi {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-serif">
            Kabar Proyek & Analisis Lapangan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl mt-1.5 leading-relaxed">
            Pengolahan cerita progres mentah menjadi artikel berita presisi, dilengkapi arahan langkah nyata berikutnya serta kritik objektif atas apa yang telah dikerjakan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddingNew(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Tutup Berita Baru' : 'Rilis Entri Proyek Baru'}</span>
          </button>

          <button
            onClick={() => onSelectTab('lanes')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200/80 transition-all"
          >
            <span>Buka Markas Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* New Project Entry Modal/Sheet */}
      {isAddingNew && (
        <form onSubmit={handleCreateNewProject} className="p-6 bg-white border-2 border-zinc-900 rounded-3xl shadow-sm space-y-4 animate-fade-in">
          <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 font-serif">Tulis Draf Liputan Proyek Baru</h3>
            <span className="text-[11px] font-mono text-zinc-500">Formulir Inisiasi</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Nama Proyek</label>
              <input
                type="text"
                required
                placeholder="Contoh: Platform Web Klien X"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">Jalur / Lane</label>
              <select
                value={newLane}
                onChange={e => setNewLane(e.target.value as LaneType)}
                className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
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
                className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">Langkah Nyata Awal (Next Step)</label>
              <input
                type="text"
                placeholder="Langkah konkrit pertama"
                value={newAction}
                onChange={e => setNewAction(e.target.value)}
                className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
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
              Simpan & Terbitkan
            </button>
          </div>
        </form>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Headlines Feed / Index List (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-wide">
                Indeks Berita ({filteredProjects.length})
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Pilih Liputan</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari berita proyek..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-500 placeholder:text-zinc-400"
              />
            </div>

            {/* Filter */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <select
                value={filterColumn}
                onChange={e => setFilterColumn(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-1 text-zinc-700 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="DOING">Doing (Aktif)</option>
                <option value="QUEUE">Queue (Antrian)</option>
                <option value="WAITING">Waiting (Nunggu)</option>
                <option value="DONE">Done (Beres)</option>
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

          {/* Feed of Project Headlines */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
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
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-md ring-2 ring-zinc-950/10'
                      : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={isSelected ? 'text-zinc-400' : 'text-zinc-500'}>
                      EDISI #{String(index + 1).padStart(2, '0')} · {project.boardColumn}
                    </span>
                    <span className={`font-semibold ${isSelected ? 'text-emerald-300' : 'text-zinc-700'}`}>
                      {project.nominalNumeric > 0 ? rupiah(project.nominalNumeric) : 'Free'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold mt-1.5 line-clamp-1 font-serif">
                    {project.name}
                  </h3>

                  <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                    isSelected ? 'text-zinc-300' : 'text-zinc-600'
                  }`}>
                    {project.newsArticle || project.currentGoal || project.nextAction || 'Belum ada catatan liputan.'}
                  </p>
                </article>
              );
            })}
          </div>
        </aside>

        {/* Right Column: Full Journalistic Article View (8 cols) */}
        <main className="lg:col-span-8">
          {draft ? (
            <article className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 animate-fade-in">
              
              {/* Article Topline Meta */}
              <div className="border-b border-zinc-200 pb-6 space-y-3">
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
                      Status: {columnLabels[draft.boardColumn]}
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
                      <span>{isEditMode ? 'Baca Format Berita' : 'Edit Lembar Kerja'}</span>
                    </button>
                  </div>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-serif leading-tight">
                  {draft.name}
                </h1>

                {/* Sub-headline / Pull Quote */}
                <p className="text-sm sm:text-base text-zinc-700 font-serif italic border-l-2 border-zinc-900 pl-4 py-1 leading-relaxed">
                  "{draft.currentGoal || 'Proyek sedang berjalan aktif dalam pemantauan ekosistem Daru.OS.'}"
                </p>
              </div>

              {/* READ MODE: The Clean Newspaper Article */}
              {!isEditMode ? (
                <div className="space-y-8 text-zinc-900">
                  
                  {/* Financial & Status Ticker Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-zinc-100 py-4 font-mono text-xs">
                    <div>
                      <span className="text-zinc-500 block">NILAI KONTRAK</span>
                      <strong className="text-base text-zinc-900 block mt-0.5 font-sans font-bold">
                        {rupiah(draft.nominalNumeric)}
                      </strong>
                      <span className="text-[10px] text-zinc-500">Status Bayar: {draft.paymentStatus}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block">DANA TEREALISASI</span>
                      <strong className="text-base text-emerald-700 block mt-0.5 font-sans font-bold">
                        {rupiah(draft.paidNumeric)}
                      </strong>
                      <span className="text-[10px] text-zinc-500">
                        Sisa tagihan: {rupiah(Math.max(0, (draft.nominalNumeric || 0) - (draft.paidNumeric || 0)))}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block">FASE LAPANGAN</span>
                      <strong className="text-base text-zinc-900 block mt-0.5 font-sans font-bold">
                        {draft.boardColumn}
                      </strong>
                      <span className="text-[10px] text-zinc-500">Target Tanggal: {draft.followUpDeadline || 'Hari ini'}</span>
                    </div>
                  </div>

                  {/* 1. Liputan Progres (The News Article) */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                      <BookOpen className="w-4 h-4 text-zinc-700" />
                      <span>Liputan Lapangan & Perkembangan Terkini</span>
                    </div>
                    <div className="text-sm sm:text-base leading-relaxed text-zinc-800 font-serif space-y-3 bg-zinc-50/70 p-6 rounded-2xl border border-zinc-200/80">
                      <p className="first-letter:text-3xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-zinc-950">
                        {currentStory.article}
                      </p>
                    </div>
                  </section>

                  {/* 2. Next Step (Arahan Konkrit Berikutnya) */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                      <Compass className="w-4 h-4 text-zinc-900" />
                      <span>Langkah Nyata Berikutnya (Next Step)</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-950 text-white shadow-xs space-y-1.5">
                      <p className="text-sm sm:text-base font-semibold leading-relaxed">
                        {draft.nextAction || 'Tentukan next action konkrit berikutnya.'}
                      </p>
                      <p className="text-xs text-zinc-400 font-mono">
                        // Tindakan ini otomatis disinkronkan ke Target Harian (Today Pursuit) dan Kamar Fokus.
                      </p>
                    </div>
                  </section>

                  {/* 3. Kritik Tajam & Evaluasi Objektif */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Kritik & Evaluasi Apa yang Sudah Dikerjakan</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-950 font-serif leading-relaxed space-y-2">
                      <p>
                        {currentStory.critique}
                      </p>
                    </div>
                  </section>

                  {/* 4. Definition of Done & Rules */}
                  {(draft.definitionOfDone || draft.rule || draft.blocker) && (
                    <section className="space-y-3 border-t border-zinc-100 pt-6">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                        <CheckCircle2 className="w-4 h-4 text-zinc-600" />
                        <span>Kriteria Selesai & Kendala Tertahan</span>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
                        {draft.definitionOfDone && (
                          <p className="text-zinc-800">
                            <strong>Definition of Done:</strong> {draft.definitionOfDone}
                          </p>
                        )}
                        {draft.blocker && (
                          <p className="text-rose-700">
                            <strong>Blocker / Kendala:</strong> {draft.blocker}
                          </p>
                        )}
                        {draft.rule && (
                          <p className="text-zinc-500 font-mono italic">
                            // Aturan: {draft.rule}
                          </p>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Article Footer Controls */}
                  <footer className="border-t border-zinc-200 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500">
                    <div>
                      <span>Arsip ID: {draft.id}</span>
                      <span className="mx-2">·</span>
                      <span>Sinkronisasi Otomatis Seluruh Dashboard</span>
                    </div>

                    <button
                      onClick={() => setIsEditMode(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Ubah Narasi Berita & Data</span>
                    </button>
                  </footer>

                </div>
              ) : (
                /* EDIT MODE: Structured Form to Refine Story, Next Action & Critique */
                <form onSubmit={handleSave} className="space-y-6 animate-fade-in text-xs">
                  <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 font-medium">
                    Mode Redaksi Aktif. Lo bisa memodifikasi narasi berita, mempertajam next step, atau menambah catatan kritik sendiri sebelum disimpan.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-zinc-700 font-semibold mb-1">Judul / Nama Proyek</label>
                      <input
                        type="text"
                        required
                        value={draft.name}
                        onChange={e => handleFieldChange('name', e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800 font-semibold"
                      />
                    </div>

                    {/* Article Body Textarea */}
                    <div className="sm:col-span-2">
                      <label className="block text-zinc-700 font-semibold mb-1">
                        Teks Berita / Artikel Progres Lapangan
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={draft.newsArticle || currentStory.article}
                        onChange={e => handleFieldChange('newsArticle', e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800 font-serif text-sm leading-relaxed"
                        placeholder="Tulis ulasan liputan progres..."
                      />
                    </div>

                    {/* Next Action */}
                    <div className="sm:col-span-2">
                      <label className="block text-zinc-700 font-semibold mb-1">
                        Langkah Nyata Berikutnya (Next Step)
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={draft.nextAction}
                        onChange={e => handleFieldChange('nextAction', e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800 font-sans"
                        placeholder="Tentukan aksi paling konkrit berikutnya"
                      />
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Kalimat ini akan otomatis memperbarui Today Pursuit (Target Harian) dan Today Blocks.
                      </p>
                    </div>

                    {/* Critique Textarea */}
                    <div className="sm:col-span-2">
                      <label className="block text-zinc-700 font-semibold mb-1">
                        Kritik Tajam & Evaluasi Objektif
                      </label>
                      <textarea
                        rows={3}
                        value={draft.newsCritique || currentStory.critique}
                        onChange={e => handleFieldChange('newsCritique', e.target.value)}
                        className="w-full border border-amber-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-amber-600 font-serif text-sm leading-relaxed bg-amber-50/40"
                        placeholder="Tulis analisis kritik atas hasil pengerjaan..."
                      />
                    </div>

                    {/* Milestone / Sub-headline */}
                    <div className="sm:col-span-2">
                      <label className="block text-zinc-700 font-semibold mb-1">
                        Kutipan Sub-headline / Current Goal
                      </label>
                      <input
                        type="text"
                        value={draft.currentGoal || ''}
                        onChange={e => handleFieldChange('currentGoal', e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
                      />
                    </div>

                    {/* Status & Lane */}
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Fase Status Board</label>
                      <select
                        value={draft.boardColumn}
                        onChange={e => handleFieldChange('boardColumn', e.target.value as BoardColumn)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
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
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
                      >
                        {(Object.keys(laneLabels) as LaneType[]).map(lane => (
                          <option key={lane} value={lane}>{laneLabels[lane]}</option>
                        ))}
                      </select>
                    </div>

                    {/* Financials */}
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Nilai Kontrak Total (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draft.nominalNumeric || ''}
                        onChange={e => handleFieldChange('nominalNumeric', Number(e.target.value))}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
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
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
                      />
                    </div>

                    {/* Priority & Deadline */}
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Prioritas</label>
                      <select
                        value={draft.priority}
                        onChange={e => handleFieldChange('priority', e.target.value as PriorityLevel)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
                      >
                        <option value="P1">P1 (Prioritas Tertinggi / Urgent)</option>
                        <option value="P2">P2 (Menengah / Terjadwal)</option>
                        <option value="P3">P3 (Rendah / Rutin)</option>
                        <option value="PARKED">PARKED (Ditunda)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Target Tanggal / Deadline</label>
                      <input
                        type="text"
                        value={draft.followUpDeadline || ''}
                        onChange={e => handleFieldChange('followUpDeadline', e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
                        placeholder="Hari ini, Besok, atau Tanggal"
                      />
                    </div>

                    {/* Blocker */}
                    {draft.boardColumn === 'WAITING' && (
                      <div className="sm:col-span-2">
                        <label className="block text-zinc-700 font-semibold mb-1">
                          Kendala / Apa yang Sedang Ditunggu (Blocker)
                        </label>
                        <input
                          type="text"
                          value={draft.blocker || ''}
                          onChange={e => handleFieldChange('blocker', e.target.value)}
                          className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800"
                          placeholder="Contoh: Menunggu review manajemen atau transfer invoice termin 1"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-200">
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
                      <span>Simpan & Terbitkan Berita</span>
                    </button>
                  </div>
                </form>
              )}

            </article>
          ) : (
            <div className="p-16 text-center text-zinc-400 bg-white border border-zinc-200 rounded-3xl font-serif italic">
              Pilih salah satu liputan berita di sebelah kiri untuk membaca arsip lengkap.
            </div>
          )}
        </main>

      </div>

    </div>
  );
};
