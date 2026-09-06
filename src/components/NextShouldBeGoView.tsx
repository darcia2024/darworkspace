import React, { useState } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Zap, 
  Target, 
  Sparkles, 
  DollarSign, 
  Layers, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Flame, 
  Play, 
  Compass, 
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { DaruWorkOSState, TodayBlock } from '../types';

interface NextShouldBeGoViewProps {
  state: DaruWorkOSState;
  onStartFocus: (block: TodayBlock) => void;
  onSelectTab: (tab: 'today' | 'lanes' | 'waiting' | 'money' | 'deepwork' | 'nextgo') => void;
  onToggleBlock?: (id: string) => void;
}

interface StrategicMove {
  id: string;
  rank: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  projectTarget: string;
  roiType: 'CASH_ACCELERATOR' | 'CLEAN_DESK' | 'WEALTH_SCALE';
  cashImpactText: string;
  timeboxMinutes: number;
  urgency: 'IMMEDIATE' | 'HIGH' | 'STRATEGIC';
  energyLevel: 'high' | 'medium' | 'creative' | 'quick';
  description: string;
  keyWhy: string;
  actionChecklist: { id: string; text: string; done: boolean }[];
  financialUnlockNote: string;
  projectRefId: string;
}

export const NextShouldBeGoView: React.FC<NextShouldBeGoViewProps> = ({
  state,
  onStartFocus,
  onSelectTab,
  onToggleBlock
}) => {
  const [energyFilter, setEnergyFilter] = useState<'all' | 'high' | 'medium' | 'creative' | 'quick'>('all');
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [expandedMoveId, setExpandedMoveId] = useState<string>('move-1');

  const report = state.financialReport;
  const totalLiquid = report?.totalLiquidBalance || 8306524;
  const hardFloor = report?.hardFloor || 4000000;
  const surplusFloor = totalLiquid - hardFloor;
  const formatShortRupiah = (num: number) => `Rp${(num / 1000000).toFixed(2)}M`;

  const strategicMoves: StrategicMove[] = [
    {
      id: 'move-1',
      rank: 1,
      badge: 'LANGKAH #1 // TUNTASKAN CLIENT BRANDING & KAEL FINISHING 🎯',
      badgeColor: 'bg-[#e2ecdc] text-[#305d46] border border-[#305d46]/30',
      title: 'Logo Azharuna & KAEL Finishing — Eksekusi Desain & Konfigurasi Core',
      subtitle: 'Logo Azharuna Rp500k Udah Lunas Masuk Kas + Finishing KAEL Siap Buka Demo Tenant!',
      projectTarget: 'Logo Azharuna & KAEL Finishing',
      roiType: 'CASH_ACCELERATOR',
      cashImpactText: 'Rp500.000 (Lunas Kas Mandiri) + Aset Core SaaS Pilot',
      timeboxMinutes: 75,
      urgency: 'IMMEDIATE',
      energyLevel: 'high',
      description: 'Dua tugas deliverable utama yang sedang lo kerjakan aktif sekarang: tuntaskan eksplorasi konsep simbol logo Azharuna Ustadz Ifdony, dan tuntaskan finishing konfigurasi role POS & QRIS flow KAEL.',
      keyWhy: 'Biar delivery desain Azharuna tuntas rapi dan software KAEL lo langsung siap ditawarin ke calon klien outlet!',
      actionChecklist: [
        { id: 'act-1-1', text: 'Eksplorasi konsep simbol, tipografi arab/modern & visual mockup Logo Azharuna', done: false },
        { id: 'act-1-2', text: 'Finishing konfigurasi role Kasir vs Owner & sinkronisasi data POS KAEL', done: false },
        { id: 'act-1-3', text: 'Validasi flow QRIS static & self-order checkout di tenant demo KAEL', done: false },
        { id: 'act-1-4', text: 'Export aset logo Azharuna & siapkan preview presentasi ke Ustadz Ifdony', done: false },
      ],
      financialUnlockNote: 'Delivery tuntas untuk Logo Azharuna dan mengamankan engine KAEL siap demo pilot ke UMKM.',
      projectRefId: 'p-ifdony-azharuna'
    },
    {
      id: 'move-2',
      rank: 2,
      badge: 'LANGKAH #2 // SISA TESTING & VERIFIKASI AKHIR 🧪',
      badgeColor: 'bg-[#e2edf9] text-[#2b5675] border border-[#3c6b8c]/30',
      title: 'Umi Elly LMS Azhariyah — Testing Modul & Verifikasi Bareng Klien',
      subtitle: 'Modul Udah Selesai! Tinggal Sisa Testing Flow Santri Buat Cairkan Termin 2 (+Rp2 Juta)',
      projectTarget: 'Umi Elly — LMS Peradaban Islam Azhariyah',
      roiType: 'CLEAN_DESK',
      cashImpactText: '+Rp2.000.000 (Termin 2) Menunggu Verifikasi Akhir',
      timeboxMinutes: 45,
      urgency: 'HIGH',
      energyLevel: 'medium',
      description: 'Modul utama LMS Umi Elly sudah rampung dibangun. Sekarang posisinya tinggal sisa testing modul, uji coba alur santri, dan verifikasi respon bareng Umi Elly untuk buka invoice Termin 2.',
      keyWhy: 'Tinggal selangkah lagi testing bareng Umi Elly kelar, kas lo langsung ketambahan Rp2 Juta lagi!',
      actionChecklist: [
        { id: 'act-2-1', text: 'Simulasi alur santri login, buka materi kurikulum & pengerjaan latihan', done: false },
        { id: 'act-2-2', text: 'Testing respon form & checklist validasi akses bareng Umi Elly', done: false },
        { id: 'act-2-3', text: 'Konfirmasi hasil testing ke Umi Elly via WA & ajukan invoice Termin 2 (+Rp2M)', done: false },
      ],
      financialUnlockNote: 'Testing sukses langsung membuka pencairan Termin 2 (+Rp2.000.000). Total deal Rp7.000.000.',
      projectRefId: 'p-umi-elly'
    },
    {
      id: 'move-3',
      rank: 3,
      badge: 'LANGKAH #3 // BLUEPRINT ARSITEKTUR & PIPELINE CUAN 📐',
      badgeColor: 'bg-[#f0e6f9] text-[#4e3a68] border border-[#4e3a68]/30',
      title: 'Rancangan Komisi Peduli Interaksi & Rancangan LMS Al Madroj',
      subtitle: 'Dua Fondasi Sistem Baru Sedang Dirancang: Pipeline Alur Komisi & Arsitektur Kelas Al Madroj!',
      projectTarget: 'Rancangan Komisi Interaksi & LMS Al Madroj',
      roiType: 'WEALTH_SCALE',
      cashImpactText: 'Sistem Pipeline Komisi + Prospek Deal Proyek Platform LMS',
      timeboxMinutes: 60,
      urgency: 'STRATEGIC',
      energyLevel: 'creative',
      description: 'Lagi aktif menyusun blueprint alur kerja dan sistem Komisi Peduli Interaksi, sekaligus merancang struktur fitur modul & kurikulum platform kelas LMS Al Madroj.',
      keyWhy: 'Rancangan arsitektur yang solid bikin closing deal jauh lebih gampang dan deliverable nanti gak berantakan.',
      actionChecklist: [
        { id: 'act-3-1', text: 'Susun mapping workflow alur kerja & sistem struktur komisi Peduli Interaksi', done: false },
        { id: 'act-3-2', text: 'Petakan arsitektur modul kurikulum & user flow platform kelas Al Madroj', done: false },
        { id: 'act-3-3', text: 'Dokumentasikan technical scope & wireframe konsep siap presentasi', done: false },
      ],
      financialUnlockNote: 'Membangun pipeline pendapatan baru dari komisi operasional dan kesepakatan build platform Al Madroj.',
      projectRefId: 'p-komisi-interaksi'
    }
  ];

  const toggleAction = (moveId: string, actId: string) => {
    soundManager.playClick();
    const key = `${moveId}_${actId}`;
    const nextState = !completedActions[key];
    setCompletedActions(prev => ({ ...prev, [key]: nextState }));
    
    if (nextState) {
      soundManager.playCompletionChime();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleLaunchMoveFocus = (move: StrategicMove) => {
    soundManager.playClick();
    const tempBlock: TodayBlock = {
      id: `tb-nextgo-${Date.now()}`,
      blockType: 'Deep Work 1',
      projectName: move.projectTarget,
      action: move.title,
      timeboxMinutes: move.timeboxMinutes,
      isDone: false,
      rule: move.keyWhy
    };
    onStartFocus(tempBlock);
  };

  const filteredMoves = strategicMoves.filter(m => {
    if (energyFilter === 'all') return true;
    return m.energyLevel === energyFilter;
  });

  const formatRupiah = (num: number) => {
    return `Rp${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in select-none">
      
      {/* 1. EXECUTIVE DIRECTIVE HERO (BENTO PLAYFUL STYLE) */}
      <div className="bento-card p-6 sm:p-8 space-y-5 border border-zinc-200/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#10b981] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight flex items-center gap-2 font-sans">
              <span className="lead-italic font-normal">Next</span> Should Be Go Matrix
            </h2>
            <span className="sticker-pill sticker-lime text-[10px]">ZERO_DECISION_FATIGUE</span>
          </div>
          <span className="text-xs font-mono text-[#15803d] bg-[#ecfccb] px-3.5 py-1.5 rounded-full border border-[#d9f99d] font-bold">
            SALDO KAS REAL: {formatRupiah(totalLiquid)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bento-card bento-lime p-5 rounded-[22px] border border-[#d9f99d] space-y-1.5">
            <span className="sticker-pill sticker-lime text-[9px]">01 // POSISI MOMENTUM</span>
            <span className="text-base font-extrabold text-[#111111] block font-sans">65% Target Tembus!</span>
            <p className="text-xs text-zinc-800 font-semibold leading-snug">Kas aman di {formatShortRupiah(totalLiquid)} (Surplus +{formatShortRupiah(surplusFloor)} di atas Floor). Bebas utang deliverable.</p>
          </div>

          <div className="bento-card bento-apricot p-5 rounded-[22px] border border-[#fed7aa] space-y-1.5">
            <span className="sticker-pill sticker-apricot text-[9px]">02 // SISA TARGET SEP</span>
            <span className="text-base font-extrabold text-[#111111] block font-sans">Sisa Rp3.500.000 OTW</span>
            <p className="text-xs text-zinc-800 font-semibold leading-snug">Terkunci di Termin 2 (Rp2M) & Termin 3 (Rp2M) project LMS Umi Elly.</p>
          </div>

          <div className="bento-card bento-blue p-5 rounded-[22px] border border-[#bae6fd] space-y-1.5">
            <span className="sticker-pill sticker-blue text-[9px]">03 // STRATEGI GOLDEN MOVE</span>
            <span className="text-base font-extrabold text-[#111111] block font-sans">Sprint Cepat → Cairkan Sisa</span>
            <p className="text-xs text-zinc-800 font-semibold leading-snug">Kerjakan hal dengan dampak cash & mental clarity tertinggi sekarang.</p>
          </div>
        </div>

        {/* The Golden Directive Rule */}
        <div className="p-4 rounded-2xl bg-[#fef9c3]/70 border border-[#fef08a] text-xs font-mono text-zinc-800 flex items-start gap-3">
          <Compass className="w-4 h-4 text-[#854d0e] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="text-[#854d0e] font-bold">// ATURAN UTAMA:</span> "Jangan buka kerjaan baru yang belum jelas! Fokus tuntaskan <strong>Modul 1 Umi Elly</strong> (buka kunci Termin 2 +Rp2M) & serahkan <strong>DreamMecca</strong> (otak 100% plong)."
          </div>
        </div>
      </div>

      {/* 2. ENERGY & CONTEXT SELECTOR */}
      <div className="bento-card p-4 flex flex-wrap items-center justify-between gap-3 border border-zinc-200/80">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#ea580c]" />
          <span className="text-xs font-extrabold text-[#111111] font-sans">Pilih Kondisi Energi Lo Sekarang:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar font-mono text-xs">
          {[
            { id: 'all', label: 'Semua Prioritas' },
            { id: 'high', label: 'High Energy (Coding)' },
            { id: 'medium', label: 'Medium Flow (Handover)' },
            { id: 'creative', label: 'BizDev / Scale SaaS' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => { soundManager.playClick(); setEnergyFilter(btn.id as any); }}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap font-semibold ${
                energyFilter === btn.id
                  ? 'pill-black shadow-md'
                  : 'pill-white text-zinc-800 font-semibold hover:text-black'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. THE 3 GOLDEN STRATEGIC MOVES MATRIX */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono text-zinc-700 font-medium uppercase tracking-wider font-semibold">
            // DAFTAR LANGKAH PALING BERDAMPAK (URUTAN PRIORITAS):
          </span>
          <span className="text-[11px] font-mono text-[#15803d] font-bold">
            {filteredMoves.length} Rekomendasi Terpilih
          </span>
        </div>

        <div className="space-y-4">
          {filteredMoves.map(move => {
            const isExpanded = expandedMoveId === move.id;
            const completedCount = move.actionChecklist.filter(a => completedActions[`${move.id}_${a.id}`]).length;
            const totalActionCount = move.actionChecklist.length;
            const progress = totalActionCount > 0 ? Math.round((completedCount / totalActionCount) * 100) : 0;

            const moveThemes = {
              'move-1': { bg: 'bento-apricot', border: 'border-[#fed7aa]', sticker: 'sticker-apricot' },
              'move-2': { bg: 'bento-blue', border: 'border-[#bae6fd]', sticker: 'sticker-blue' },
              'move-3': { bg: 'bento-pink', border: 'border-[#fbcfe8]', sticker: 'sticker-pink' },
            };
            const currentTheme = moveThemes[move.id as keyof typeof moveThemes] || { bg: 'bg-white', border: 'border-zinc-200', sticker: 'sticker-lime' };

            return (
              <div 
                key={move.id}
                className={`bento-card ${currentTheme.bg} border ${currentTheme.border} p-6 sm:p-7 space-y-4 transition-all duration-300 ${
                  move.rank === 1 ? 'ring-2 ring-[#111111] shadow-lg' : 'hover:shadow-md'
                }`}
              >
                {/* Card Header & Summary */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`sticker-pill ${currentTheme.sticker} text-[10px]`}>
                      {move.badge}
                    </span>
                    <span className="text-xs font-mono text-zinc-700 flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-black/5 font-semibold">
                      <Clock className="w-3 h-3 text-zinc-700 font-medium" />
                      {move.timeboxMinutes} Menit Timebox
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-800 bg-white/80 px-3 py-1 rounded-full border border-black/5 shadow-xs">
                      {move.cashImpactText}
                    </span>
                    <button
                      onClick={() => handleLaunchMoveFocus(move)}
                      className="pill-black text-xs font-bold font-mono flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Kunci Focus Lock</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#111111] tracking-tight font-sans">
                    #{move.rank} — {move.title}
                  </h3>
                  <p className="text-xs text-zinc-700 mt-1 font-medium leading-relaxed font-sans">
                    {move.subtitle}
                  </p>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                  {move.description}
                </p>

                <div className="pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="text-zinc-800 font-semibold">
                    Progress Tindakan: <strong className={completedCount > 0 ? "text-[#15803d] font-bold" : "text-[#111111]"}>{completedCount}/{totalActionCount} Selesai</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLaunchMoveFocus(move)}
                      className="pill-black px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Sikat Fokus</span>
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setExpandedMoveId(isExpanded ? '' : move.id);
                      }}
                      className="p-2 rounded-full border border-zinc-200 hover:bg-zinc-100 transition-colors text-zinc-600"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500">Progress:</span>
                    <div className="flex-1 bg-zinc-100 h-2 rounded-full overflow-hidden max-w-[200px]">
                      <div 
                        className="bg-[#111111] h-full rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#111111]">{completedCount}/{move.actionChecklist.length}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {move.cashImpactText}
                    </span>
                  </div>
                </div>

                {/* Expanded Action Detail */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-zinc-100 space-y-4 animate-fade-in text-xs font-mono">
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 text-zinc-700 leading-relaxed font-sans">
                      <strong className="text-black font-mono font-bold block mb-1">// KENAPA INI PENTING BANGET:</strong>
                      {move.description} <br />
                      <span className="font-semibold text-emerald-800 font-sans mt-1 inline-block">💡 {move.keyWhy}</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                        CHECKLIST AKSI PRAKTIS:
                      </span>
                      <div className="space-y-1.5">
                        {move.actionChecklist.map((act) => {
                          const isDone = !!completedActions[`${move.id}_${act.id}`];
                          return (
                            <div
                              key={act.id}
                              onClick={() => toggleAction(move.id, act.id)}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isDone 
                                  ? 'bg-emerald-50/70 border-emerald-200 text-zinc-400 line-through' 
                                  : 'bg-white border-zinc-200 hover:border-black/40 text-[#111111]'
                              }`}
                            >
                              <div className="flex items-center gap-3 font-sans text-xs">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-400'
                                }`}>
                                  {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                                <span className={isDone ? 'font-normal' : 'font-semibold'}>{act.text}</span>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {isDone ? 'DONE' : 'KLIK UNTUK SELESAIKAN'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 font-sans text-xs flex items-center justify-between">
                      <span>{move.financialUnlockNote}</span>
                      <span className="font-mono text-[10px] font-bold text-amber-800 uppercase px-2 py-0.5 bg-amber-200/60 rounded">
                        UNLOCK
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SEPTEMBER 2026 4-PHASE BLUEPRINT TIMELINE */}
      <div className="bento-card p-6 sm:p-7 space-y-5 border border-zinc-200/90 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#111111] flex items-center gap-2 font-sans">
              <span className="lead-italic font-normal">September</span> 2026 Execution Blueprint
              <span className="sticker-pill sticker-lime text-[9px]">TIMELINE</span>
            </h3>
            <p className="text-xs text-zinc-700 font-medium font-mono">// 4 Fase strategis untuk mengunci target +Rp10 Juta dan scaling SaaS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs font-mono">
          
          {/* Phase 1 */}
          <div className="bento-card bento-lime p-5 rounded-[22px] border border-[#d9f99d] space-y-2">
            <div className="flex justify-between items-center">
              <span className="sticker-pill sticker-lime text-[9px]">FASE 1 // 1-3 SEP</span>
              <span className="text-[#15803d] font-bold">✓ TUNTAS</span>
            </div>
            <h5 className="font-extrabold text-[#111111] font-sans text-xs">Cash Defense & Closing</h5>
            <p className="text-[11px] text-zinc-700 font-sans leading-snug">
              • Barber lunas Rp6M ✓<br />
              • DreamMecca 100% selesai ✓<br />
              • DP Umi Elly Rp3M masuk ✓
            </p>
          </div>

          {/* Phase 2 */}
          <div className="bento-card bento-apricot p-5 rounded-[22px] border border-[#fed7aa] space-y-2">
            <div className="flex justify-between items-center">
              <span className="sticker-pill sticker-apricot text-[9px]">FASE 2 // 4-10 SEP</span>
              <span className="text-[#c2410c] font-bold animate-pulse">SEDANG AKTIF</span>
            </div>
            <h5 className="font-extrabold text-[#111111] font-sans text-xs">Active Build & Architecture</h5>
            <p className="text-[11px] text-zinc-700 font-sans leading-snug">
              • Logo Azharuna & KAEL Finishing<br />
              • Umi Elly sisa testing modul<br />
              • Rancang Komisi & LMS Al Madroj
            </p>
          </div>

          {/* Phase 3 */}
          <div className="bento-card bento-blue p-5 rounded-[22px] border border-[#bae6fd] space-y-2">
            <div className="flex justify-between items-center">
              <span className="sticker-pill sticker-blue text-[9px]">FASE 3 // 11-20 SEP</span>
              <span className="text-[#0369a1] font-bold">NEXT HARVEST</span>
            </div>
            <h5 className="font-extrabold text-[#111111] font-sans text-xs">Cairkan Termin 2 & Demo KAEL</h5>
            <p className="text-[11px] text-zinc-700 font-sans leading-snug">
              • Masuk Termin 2 Umi Elly (+Rp2M)<br />
              • Pitching demo KAEL ke outlet<br />
              • Kas tembus Rp10,3M+
            </p>
          </div>

          {/* Phase 4 */}
          <div className="bento-card bento-pink p-5 rounded-[22px] border border-[#fbcfe8] space-y-2">
            <div className="flex justify-between items-center">
              <span className="sticker-pill sticker-pink text-[9px]">FASE 4 // 21-30 SEP</span>
              <span className="text-[#be185d] font-bold">SCALE & MRR</span>
            </div>
            <h5 className="font-extrabold text-[#111111] font-sans text-xs">Termin 3 & Growth Mode</h5>
            <p className="text-[11px] text-zinc-700 font-sans leading-snug">
              • Pelunasan Termin 3 (+Rp2M)<br />
              • Pilot pertama KAEL jalan<br />
              • Kas tembus Rp12,3M+ bersih
            </p>
          </div>

        </div>
      </div>

      {/* 5. INSTANT LAUNCH TO FOCUS STUDIO */}
      <div className="bento-card p-6 flex flex-wrap items-center justify-between gap-4 border border-zinc-200/90">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-md">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-[#111111] font-sans">Siap Mulai Eksekusi Sekarang?</h4>
            <p className="text-xs text-zinc-700 font-medium font-sans">Pilih salah satu move di atas, lalu kunci layar dan fokus coding tanpa distraksi.</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            handleLaunchMoveFocus(strategicMoves[0]);
          }}
          className="pill-black px-6 py-3 text-xs font-bold font-mono flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <span>Mulai Move #1: Logo Azharuna & KAEL (75m)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
