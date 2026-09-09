import React, { useState, useEffect } from 'react';
import { 
  ProjectCard, 
  LaneType, 
  BoardColumn, 
  PriorityLevel 
} from '../types';
import { soundManager } from '../utils/audio';
import { 
  Play, 
  Check, 
  Plus, 
  Save, 
  Edit3, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Clock, 
  DollarSign, 
  ExternalLink,
  Layers,
  FolderOpen,
  Share2,
  Bookmark,
  ChevronRight,
  Sparkles,
  Maximize2,
  Volume2
} from 'lucide-react';

interface ProjectUpdateViewProps {
  projects: ProjectCard[];
  onUpdateProject: (project: ProjectCard) => void;
  onAddProject?: (project: Omit<ProjectCard, 'id'>) => void;
  onSelectTab: (tab: string) => void;
}

const laneLabels: Record<LaneType, string> = {
  client_delivery: 'Client Delivery',
  maintenance: 'Maintenance',
  bizdev: 'BizDev & Sales',
  own_product: 'Core Product',
  operations: 'Daily Operations',
  parking_lot: 'Parking Lot'
};

const columnLabels: Record<BoardColumn, string> = {
  DOING: 'Sedang Dikerjakan (Doing)',
  QUEUE: 'Antrian Eksekusi (Queue)',
  WAITING: 'Menunggu Klien / Bayar (Waiting)',
  DONE: 'Selesai Tuntas (Done)',
  PARKED: 'Diparkir Dulu (Parked)'
};

function getProjectMediaInfo(project: ProjectCard) {
  if (project.id === 'p-pgs-tour') {
    return {
      category: 'Web Development & PPIU Travel',
      duration: '15 Pages Prerendered',
      headline: 'Peluncuran Platform Resmi PGS Tour & Travel di pgstour.vercel.app',
      url: 'https://pgstour.vercel.app',
      image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80',
      article: 'PGS Tour & Travel resmi mencatatkan tonggak sejarah baru dalam digitalisasi layanan umrah mereka. Seluruh 15 halaman statis berhasil di-prerender dan live sempurna di pgstour.vercel.app. Navigasi mobile kini mengadopsi standar editorial modern tanpa ornamen berlebih, trust strip legalitas izin PPIU Kemenag tertata rapi dalam layout dua kolom yang kokoh, dan kendala galeri jamaah di perangkat seluler telah teratasi tuntas menggunakan multi-source WebP fallback.',
      nextStep: 'Showcase live demo pgstour.vercel.app ke owner PGS Tour, presentasikan 15 halaman yang sudah aktif, dan kunci kesepakatan nilai kontrak pengerjaan.',
      critique: 'Pekerjaan antarmuka dan performa teknis sudah 100% matang, namun ikatan kontrak resmi belum diformalkan sebelum serah terima. Evaluasi: jangan biarkan website live dimanfaatkan tanpa kepastian nominal invoice atau DP komitmen tertulis. Kunci invoice pengerjaan hari ini.'
    };
  }

  if (project.id === 'p-el-massa') {
    return {
      category: 'Digital Catalog & Interactive Booking',
      duration: '12 Paket Ibadah 100% Live',
      headline: 'Peluncuran Penuh Galeri & Katalog Web El Massa Tour & Travel (12 Paket Ibadah Live)',
      url: 'https://github.com/darcia2024/elmassa-katalog',
      image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
      article: 'Platform Galeri & Katalog Web El Massa Tour & Travel telah resmi mencapai kesiapan operasional 100% dengan status live sempurna. Sebanyak 12 paket ibadah unggulan (mulai dari Umrah Reguler November 2026, paket akbar bersama Ustadz Hanan Attaki dengan flyer ganda interaktif JKT/PGK, Special Landing Madinah, Nisfu Sya\'ban, Awal Ramadan, paket Syawal 0 KM, hingga paket Liburan Sekolah Juni 2027) telah sepenuhnya unlocked dilengkapi brosur HD resmi, rincian jadwal, dan itinerary harian berstandar profesional.\n\nSistem telah dipersenjatai kapabilitas komersial mutakhir: live seat tracker terintegrasi, simulator kalkulator tabungan baitullah siap ekspor ke WhatsApp resmi (+62 811-7171-5125), sistem multi-filter e-commerce (kota keberangkatan, maskapai, kategori, bulan), serta dashboard admin pengelola mandiri (manajemen CRUD paket, bulk seat manager, master data kota & maskapai). Seluruh basis kode telah tersinkronisasi 100% pada branch main repository darcia2024/elmassa-katalog dengan penguncian versi cache EL_MASSA_APP_DATA_V36 guna menjamin stabilitas data pengunjung.',
      nextStep: 'Kirimkan laporan komprehensif serah terima 12 paket ibadah dan akses dashboard admin ke manajemen El Massa Tour & Travel via WA resmi, lalu terbitkan invoice pembayaran final.',
      critique: 'Pencapaian teknis dan kelengkapan 12 paket serta fitur admin sangat impresif melampaui rata-rata web katalog travel. Namun ada risiko operasional dan komersial nyata: sistem yang sudah 100% beroperasi di production tanpa invoice dan termin pelunasan yang terkunci membuat posisi tawar developer melemah. Evaluasi kritis: hindari penyerahan kredensial admin dan source code penuh sebelum dokumen invoice resmi terbit dan komitmen pembayaran termin pelunasan disepakati secara tertulis hari ini.'
    };
  }

  if (project.id === 'p-umi-elly') {
    return {
      category: 'EdTech & Learning Management System',
      duration: 'Modul Inti Azhariyah',
      headline: 'Pembangunan Platform LMS Peradaban Islam Azhariyah Bersama Umi Elly',
      url: '#',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      article: 'Platform inti LMS Peradaban Islam Azhariyah telah selesai dibangun dan kini memasuki tahap peninjauan langsung bersama Umi Elly. Tim mendampingi penyusunan struktur kurikulum dan penataan modul materi digital agar ramah pengguna bagi pengajar maupun santri.',
      nextStep: 'Review platform bersama Umi Elly dan pandu input kurikulum modul pembelajaran termin pertama.',
      critique: 'DP Termin 1 (Rp3.000.000) sudah aman di kas. Namun risiko proyek edukasi adalah pembengkakan lingkup materi (scope creep). Evaluasi: batasi sesi review maksimal dua kali dan tetapkan batas akhir penyerahan materi sebelum masuk termin berikutnya.'
    };
  }

  if (project.id === 'p-hamasah-ai') {
    return {
      category: 'AI Architecture & Business Discovery',
      duration: 'Discovery & Proposal Phase',
      headline: 'Discovery Integrasi Kecerdasan Buatan (AI) untuk Hamasah Internasional',
      url: '#',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
      article: 'Inisiatif integrasi teknologi AI pada situs web Hamasah Internasional telah dibuka melalui sesi discovery meeting langsung bersama pemilik perusahaan. Agenda berpusat pada pemetaan use-case konkret yang dapat mengotomatisasi konversi prospek dan efisiensi operasional.',
      nextStep: 'Meeting dengan owner Hamasah Internasional: dengar kebutuhan AI, petakan use-case konkrit & rumuskan estimasi investasi.',
      critique: 'Diskusi eksplorasi rentan menjadi obrolan tanpa ujung bila developer tidak menyajikan batasan paket. Evaluasi: segera susun proposal 1-halaman berisi 2 opsi paket AI konkret dengan harga pasti.'
    };
  }

  // Fallback
  return {
    category: laneLabels[project.lane] || 'Software & Operations',
    duration: project.timebox || 'Active Sprint',
    headline: `Laporan Operasional & Progres Proyek ${project.name}`,
    url: '#',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    article: project.newsArticle || `Inisiatif ${project.name} saat ini berada dalam fase ${columnLabels[project.boardColumn]}. Fokus diarahkan pada target: "${project.currentGoal || project.nextAction || 'Penyelesaian deliverable utama'}" dengan alokasi prioritas ${project.priority}.`,
    nextStep: project.nextAction || 'Tentukan langkah aksi konkrit berikutnya di board.',
    critique: project.newsCritique || 'Evaluasi: pastikan setiap tahapan kerja memiliki kriteria selesai yang terukur dan tidak menunda konfirmasi pembayaran atau feedback penting dari klien.'
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
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'all_projects' | 'resources' | 'notes'>('all_projects');

  // New Project State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLane, setNewLane] = useState<LaneType>('client_delivery');
  const [newNominal, setNewNominal] = useState(0);
  const [newAction, setNewAction] = useState('');

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const [draft, setDraft] = useState<ProjectCard>(selectedProject || projects[0]);

  useEffect(() => {
    if (selectedProject) {
      const media = getProjectMediaInfo(selectedProject);
      setDraft({
        ...selectedProject,
        newsArticle: selectedProject.newsArticle || media.article,
        newsCritique: selectedProject.newsCritique || media.critique
      });
    }
  }, [selectedProjectId, selectedProject]);

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.nextAction && p.nextAction.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchLane = filterLane === 'all' || p.lane === filterLane;
    return matchSearch && matchLane;
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
      currentGoal: 'Inisiasi dan kickoff pengerjaan proyek',
      nextAction: newAction.trim() || 'Rencanakan langkah awal proyek',
      billingMilestone: newNominal > 0 ? 'Kickoff DP' : 'Non-billable',
      followUpDeadline: 'Hari ini',
      newsArticle: `Inisiatif baru ${newName.trim()} telah resmi dibuka dalam pipeline kerja Daru.OS. Tim memfokuskan persiapan pada langkah konkrit awal: ${newAction.trim() || 'penyusunan requirement'}.`,
      newsCritique: 'Evaluasi awal: pastikan komitmen pembayaran atau ruang lingkup telah terkunci tertulis sebelum pengerjaan intensif dimulai.'
    });

    setNewName('');
    setNewAction('');
    setNewNominal(0);
    setIsAddingNew(false);
  };

  const rupiah = (num?: number) => {
    if (!num) return 'Rp0';
    return `Rp${num.toLocaleString('id-ID')}`;
  };

  const mediaInfo = draft ? getProjectMediaInfo(draft) : getProjectMediaInfo(projects[0]);

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* Top Breadcrumb & User Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-800">Laporan Proyek</span>
          <span className="text-zinc-300">·</span>
          <span className="text-zinc-700 font-medium truncate max-w-xs">{draft.name}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {isSavedNotice && (
            <span className="text-emerald-600 font-medium flex items-center gap-1 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              Tersinkronisasi ke Seluruh Dashboard
            </span>
          )}
          
          <button
            onClick={() => setIsAddingNew(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Tutup Form' : '+ Proyek Baru'}</span>
          </button>

          <button
            onClick={() => onSelectTab('lanes')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-white font-medium transition-all shadow-xs"
          >
            <span>Buka Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New Project Quick Sheet */}
      {isAddingNew && (
        <form onSubmit={handleCreateNewProject} className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h4 className="font-bold text-zinc-900">Input Entri Proyek Baru</h4>
            <span className="text-zinc-400 font-mono">Daru.OS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Nama Proyek</label>
              <input
                type="text"
                required
                placeholder="Contoh: Platform Web PGS Tour"
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
                placeholder="0 jika internal"
                value={newNominal || ''}
                onChange={e => setNewNominal(Number(e.target.value))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Langkah Nyata Awal (Next Step)</label>
              <input
                type="text"
                placeholder="Langkah konkrit pertama"
                value={newAction}
                onChange={e => setNewAction(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-white font-medium"
            >
              Simpan & Sinkronkan
            </button>
          </div>
        </form>
      )}

      {/* Main LMS/Article Master Layout: Left Main Video/Article (8 cols) + Right Course Playlist (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Large Visual Banner, Controls, Article Body, Next Step & Critique (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. Large Visual Player / Hero Banner Card */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-950 aspect-video shadow-xs group">
            <img 
              src={mediaInfo.image} 
              alt={draft.name}
              className="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity"
            />
            
            {/* Top Badges over banner */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
                {laneLabels[draft.lane]}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 text-[11px] font-mono font-medium border border-white/10">
                {draft.boardColumn}
              </span>
            </div>

            {/* Floating Live Web Indicator */}
            {mediaInfo.url && mediaInfo.url !== '#' && (
              <a 
                href={mediaInfo.url} 
                target="_blank" 
                rel="noreferrer"
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 hover:bg-white text-zinc-900 text-[11px] font-semibold backdrop-blur-md transition-all shadow-sm"
              >
                <span>Kunjungi URL Live</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Bottom Media Bar Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                  <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                </div>
                <div>
                  <span className="font-semibold block text-sm leading-tight text-white drop-shadow-sm">{draft.name}</span>
                  <span className="text-[11px] text-zinc-300 font-mono">{mediaInfo.duration} · Kontrak {rupiah(draft.nominalNumeric)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditMode(prev => !prev)}
                  className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-medium transition-all"
                >
                  {isEditMode ? 'Lihat Artikel' : 'Edit Proyek'}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Action Buttons & Pill Row (Exactly as in reference design) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 font-semibold border border-zinc-200">
                Prioritas {draft.priority}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 font-semibold border border-zinc-200">
                {draft.paymentStatus}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 font-semibold border border-zinc-200">
                Deadline: {draft.followUpDeadline || 'Hari ini'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditMode(prev => !prev)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Mode Baca Artikel' : 'Edit Lembar Kerja'}</span>
              </button>
            </div>
          </div>

          {/* 3. Headline & Main Article Card */}
          {!isEditMode ? (
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
              
              {/* Title & Pull Quote */}
              <div className="space-y-2 border-b border-zinc-100 pb-5">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                  {mediaInfo.headline}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 font-serif italic border-l-2 border-zinc-400 pl-3 py-0.5">
                  "{draft.currentGoal || 'Inisiatif proyek ini sedang berjalan aktif sesuai dengan arahan kerja Daru.OS.'}"
                </p>
              </div>

              {/* The News Article Prose */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                  Liputan & Ulasan Perkembangan Proyek
                </h3>
                <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 text-sm leading-relaxed text-zinc-800 font-serif space-y-3">
                  <p className="first-letter:text-2xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-zinc-950">
                    {draft.newsArticle || mediaInfo.article}
                  </p>
                </div>
              </div>

              {/* Next Step Section (Kotak Langkah Nyata Berikutnya) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                  <Compass className="w-4 h-4 text-zinc-900" />
                  <span>Langkah Nyata Berikutnya (Next Step)</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900 text-white space-y-1 shadow-xs">
                  <p className="text-sm font-semibold leading-relaxed">
                    {draft.nextAction || mediaInfo.nextStep}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    // Otomatis tersinkronisasi ke Target Harian (Today Pursuit) dan Kamar Fokus.
                  </p>
                </div>
              </div>

              {/* Critique Section (Kritik Tajam & Evaluasi Objektif) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Kritik & Evaluasi Atas Apa yang Sudah Dikerjakan</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-xs sm:text-sm text-amber-950 font-serif leading-relaxed">
                  <p>
                    {draft.newsCritique || mediaInfo.critique}
                  </p>
                </div>
              </div>

              {/* Definition of Done Footer Pod */}
              {draft.definitionOfDone && (
                <div className="pt-3 border-t border-zinc-100 flex items-start gap-2 text-xs text-zinc-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-zinc-800">Tolok Ukur Selesai (Definition of Done):</span> {draft.definitionOfDone}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* EDIT MODE: Structured Form */
            <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-xs text-xs animate-fade-in">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="text-sm font-bold text-zinc-900">Sunting Naskah Berita & Data Proyek</h3>
                <span className="text-zinc-500 font-mono">ID: {draft.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 font-semibold mb-1">Nama Proyek</label>
                  <input
                    type="text"
                    required
                    value={draft.name}
                    onChange={e => handleFieldChange('name', e.target.value)}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 font-semibold focus:outline-none focus:border-zinc-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 font-semibold mb-1">Artikel Berita / Ulasan Progres</label>
                  <textarea
                    rows={4}
                    required
                    value={draft.newsArticle || mediaInfo.article}
                    onChange={e => handleFieldChange('newsArticle', e.target.value)}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 font-serif text-sm focus:outline-none focus:border-zinc-800 leading-relaxed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 font-semibold mb-1">Langkah Nyata Berikutnya (Next Step)</label>
                  <textarea
                    rows={2}
                    required
                    value={draft.nextAction}
                    onChange={e => handleFieldChange('nextAction', e.target.value)}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-800 font-sans"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 font-semibold mb-1">Kritik & Evaluasi Apa yang Sudah Dikerjakan</label>
                  <textarea
                    rows={3}
                    value={draft.newsCritique || mediaInfo.critique}
                    onChange={e => handleFieldChange('newsCritique', e.target.value)}
                    className="w-full border border-amber-300 bg-amber-50/40 rounded-xl px-3 py-2 text-zinc-900 font-serif text-sm focus:outline-none focus:border-amber-600"
                  />
                </div>

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
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-zinc-900 hover:bg-black text-white font-medium shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan & Sinkronkan</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* RIGHT COLUMN: Interactive Course / Project Playlist (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Top Playlist Tab Pills */}
          <div className="bg-zinc-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveRightTab('all_projects')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                activeRightTab === 'all_projects' 
                  ? 'bg-white text-zinc-900 shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Semua Proyek
            </button>
            <button
              onClick={() => setActiveRightTab('resources')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                activeRightTab === 'resources' 
                  ? 'bg-white text-zinc-900 shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Finansial
            </button>
            <button
              onClick={() => setActiveRightTab('notes')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                activeRightTab === 'notes' 
                  ? 'bg-white text-zinc-900 shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Catatan
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari proyek dalam daftar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-500 placeholder:text-zinc-400"
            />
          </div>

          {/* Playlist Items List */}
          {activeRightTab === 'all_projects' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-2 space-y-1 max-h-[640px] overflow-y-auto shadow-xs">
              {filteredProjects.map((project, idx) => {
                const isSelected = project.id === (draft?.id || selectedProjectId);
                const info = getProjectMediaInfo(project);

                return (
                  <div
                    key={project.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedProjectId(project.id);
                      setIsEditMode(false);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'hover:bg-zinc-50 text-zinc-900'
                    }`}
                  >
                    {/* Play / Icon Badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected 
                        ? 'bg-white text-black' 
                        : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold truncate leading-snug">
                          {project.name}
                        </h4>
                        <span className={`text-[10px] font-mono shrink-0 ${
                          isSelected ? 'text-zinc-300' : 'text-zinc-400'
                        }`}>
                          {project.nominalNumeric > 0 ? rupiah(project.nominalNumeric) : 'Free'}
                        </span>
                      </div>

                      <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-zinc-300' : 'text-zinc-500'
                      }`}>
                        {project.nextAction || info.nextStep}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono">
                        <span className={`px-1.5 py-0.2 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {project.boardColumn}
                        </span>
                        <span className={isSelected ? 'text-zinc-300' : 'text-zinc-400'}>
                          {laneLabels[project.lane]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Resources / Financial Summary Tab */}
          {activeRightTab === 'resources' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 text-xs shadow-xs">
              <h4 className="font-bold text-zinc-900">Rekap Finansial Proyek</h4>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500">Nilai Kontrak</span>
                  <span className="font-bold text-zinc-900">{rupiah(draft.nominalNumeric)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500">Sudah Diterima</span>
                  <span className="font-bold text-emerald-600">{rupiah(draft.paidNumeric)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500">Sisa Tagihan</span>
                  <span className="font-bold text-zinc-900">
                    {rupiah(Math.max(0, (draft.nominalNumeric || 0) - (draft.paidNumeric || 0)))}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Status Bayar</span>
                  <span className="font-bold text-zinc-800">{draft.paymentStatus}</span>
                </div>
              </div>
              <button
                onClick={() => onSelectTab('money')}
                className="w-full py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold transition-all text-center"
              >
                Buka Matriks Keuangan Lengkap
              </button>
            </div>
          )}

          {/* Notes / Aturan Kerja Tab */}
          {activeRightTab === 'notes' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 text-xs shadow-xs">
              <h4 className="font-bold text-zinc-900">Catatan & Aturan Kerja</h4>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <span className="font-bold text-zinc-800 block">Aturan Proyek:</span>
                <p className="text-zinc-600 font-mono text-[11px] leading-relaxed">
                  {draft.rule || 'Fokus selesaikan deliverable utama sebelum membuka scope baru.'}
                </p>
              </div>
              {draft.blocker && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <span className="font-bold text-amber-900 block">Blocker Tertahan:</span>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    {draft.blocker}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
