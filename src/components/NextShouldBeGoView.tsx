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
      badge: 'LANGKAH #1 // DUIT PALING CEPET MASUK 🚀',
      badgeColor: 'bg-[#e2ecdc] text-[#305d46] border border-[#305d46]/30',
      title: 'LMS Umi Elly Azhariyah — Sprint Modul 1 & Portal Santri',
      subtitle: 'DP Rp3 Juta Udah Masuk Rekening → Selesaiin Modul 1 Buat Cairin +Rp2 Juta Lagi!',
      projectTarget: 'Umi Elly — LMS Peradaban Islam Azhariyah',
      roiType: 'CASH_ACCELERATOR',
      cashImpactText: '+Rp2.000.000 (Termin 2) + Rp2.000.000 (Termin 3)',
      timeboxMinutes: 90,
      urgency: 'IMMEDIATE',
      energyLevel: 'high',
      description: 'DP Termin 1 (Rp3M) sudah cair ke Mandiri. Klien sedang dalam momentum antusias tinggi. Eksekusi cepat modul tahap 1 adalah kartu as untuk langsung trigger invoice Termin 2 (+Rp2M) minggu ini.',
      keyWhy: 'Ini cara paling instan buat naikin saldo kas lo jadi Rp12,3M+ dan lunasin target September 100%!',
      actionChecklist: [
        { id: 'act-1-1', text: 'Setup folder arsitektur & struktur modular LMS Azhariyah', done: false },
        { id: 'act-1-2', text: 'Bikin dashboard kurikulum & akses santri yang rapi & estetik', done: false },
        { id: 'act-1-3', text: 'Bikin video singkat demo modul 1 buat dikirim ke WA Umi Elly', done: false },
        { id: 'act-1-4', text: 'Kirim preview ke Umi Elly & langsung tagih Termin 2 (+Rp2 Juta)', done: false },
      ],
      financialUnlockNote: 'Jika modul 1 selesai: Langsung mencairkan Termin 2 (+Rp2M). Total pembayaran proyek ini: Rp7.000.000.',
      projectRefId: 'p-umi-elly'
    },
    {
      id: 'move-2',
      rank: 2,
      badge: 'LANGKAH #2 // BEBASKAN OTAK DARI BEBAN ✨',
      badgeColor: 'bg-[#e2edf9] text-[#2b5675] border border-[#3c6b8c]/30',
      title: 'DreamMecca Platform — Final Polish & Official Handover',
      subtitle: 'Udah Dibayar Lunas dari Dulu → Tinggal Serah Terima Biar Gak Ada Utang Pikiran!',
      projectTarget: 'DreamMecca Platform',
      roiType: 'CLEAN_DESK',
      cashImpactText: 'Nol Utang Mental (100% Zero Historical Debt)',
      timeboxMinutes: 50,
      urgency: 'HIGH',
      energyLevel: 'medium',
      description: 'Uang platform DreamMecca sudah lunas dibayar klien dari lama. Menuntaskan dan menyerahkan deliverable terakhir platform ini akan membersihkan sisa beban pikiran masa lalu.',
      keyWhy: 'Biar kepala lo plong 100% dan lo bisa fokus total tanpa kepikiran sisa revisi lama!',
      actionChecklist: [
        { id: 'act-2-1', text: 'Review kelengkapan UI paket umrah & alur kontak WhatsApp', done: false },
        { id: 'act-2-2', text: 'Testing respon form & checklist deploy production', done: false },
        { id: 'act-2-3', text: 'Kirim link akses final & pesan serah terima resmi ke owner DreamMecca', done: false },
        { id: 'act-2-4', text: 'Tandai status Done & arsipkan ke portfolio selesai', done: false },
      ],
      financialUnlockNote: 'Memberikan reputasi tier-1 dan membebaskan 100% fokus untuk scaling SaaS.',
      projectRefId: 'p-dreammecca'
    },
    {
      id: 'move-3',
      rank: 3,
      badge: 'LANGKAH #3 // MESIN CUAN PASIF (RECURRING) 💼',
      badgeColor: 'bg-[#f0e6f9] text-[#4e3a68] border border-[#4e3a68]/30',
      title: 'KAEL POS SaaS — Repackage Core Engine & Demo Multi-Tenant',
      subtitle: 'Kemarin Sukses Dijual Rp6M di Barber → Sekarang Waktunya Dijual Berulang Tiap Bulan!',
      projectTarget: 'Setting KAEL (Core Product)',
      roiType: 'WEALTH_SCALE',
      cashImpactText: 'Langganan Bulanan (MRR) dari Jaringan Outlet',
      timeboxMinutes: 45,
      urgency: 'STRATEGIC',
      energyLevel: 'creative',
      description: 'Engine kasir & membership Barber Underrated kemarin terbukti berhasil lo jual Rp6 Juta lunas. Sekarang saatnya membungkus core yang sama jadi SaaS multi-outlet untuk passive recurring cashflow.',
      keyWhy: 'Biar lo gak terus-terusan barter waktu sama uang, tapi punya aset software yang ngasilin cuan terus.',
      actionChecklist: [
        { id: 'act-3-1', text: 'Kunci konfigurasi permission role Kasir vs Owner vs Admin', done: false },
        { id: 'act-3-2', text: 'Rapikan demo tenant kafe/barber siap live pitch ke calon klien', done: false },
        { id: 'act-3-3', text: 'Siapkan list 3-5 calon outlet prospek pilot pertama', done: false },
      ],
      financialUnlockNote: 'Potensi penambahan kas stabil Rp1.500.000 - Rp5.000.000/bulan per cluster tenant.',
      projectRefId: 'p-kael-product'
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

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setExpandedMoveId(isExpanded ? '' : move.id);
                    }}
                    className="text-xs text-zinc-800 hover:text-black font-semibold flex items-center gap-1 underline underline-offset-4"
                  >
                    <span>{isExpanded ? 'Tutup Detail Rencana' : 'Buka Checklist & Roadmap Eksekusi'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>

                {/* Expanded Action Checklist & Details */}
                {isExpanded && (
                  <div className="pt-4 border-t border-black/10 space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-zinc-800 font-semibold uppercase font-bold tracking-wider block">
                        Checklist Eksekusi Micro-Step (Tandai Saat Selesai):
                      </span>
                      <div className="space-y-2">
                        {move.actionChecklist.map((act) => {
                          const isDone = !!completedActions[`${move.id}_${act.id}`];
                          return (
                            <button
                              key={act.id}
                              onClick={() => toggleAction(move.id, act.id)}
                              className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                                isDone 
                                  ? 'bg-[#ecfccb] border-[#d9f99d] text-[#15803d]' 
                                  : 'bg-white/80 border-black/10 hover:border-black/30 text-zinc-900'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-600 font-bold" />
                                )}
                              </div>
                              <span className={`text-xs font-sans font-medium leading-relaxed ${isDone ? 'line-through text-zinc-700 font-medium' : ''}`}>
                                {act.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Financial Unlock Impact Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-white/70 border border-black/5 text-xs font-mono space-y-1">
                      <span className="text-[#15803d] font-bold block">// EFEK KE SALDO REKENING:</span>
                      <p className="text-zinc-700">{move.financialUnlockNote}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => onSelectTab('lanes')}
                        className="text-xs text-zinc-700 hover:text-black font-mono font-semibold flex items-center gap-1"
                      >
                        <span>Lihat detail di Board Kanban</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleLaunchMoveFocus(move)}
                        className="pill-black text-xs font-bold font-mono flex items-center gap-1.5 shadow-md"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Mulai Eksekusi {move.timeboxMinutes}m Sekarang</span>
                      </button>
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
            <h5 className="font-extrabold text-[#111111] font-sans text-xs">Cash Defense & Kickoff</h5>
            <p className="text-[11px] text-zinc-700 font-sans leading-snug">
              • Barber lunas Rp6M<br />
              • DP Umi Elly Rp3M masuk<br />
              • Saldo aman Rp9,89M
            </p>
          </div>

          {/* Phase 2 */}
          <div className="bento-card bento-apricot p-5 rounded-[22px] border border-[#fed7aa] space-y-2">
            <div className="flex justify-between items-center">
              <span className="sticker-pill sticker-apricot text-[9px]">FASE 2 // 4-10 SEP</span>
              <span className="text-[#c2410c] font-bold animate-pulse">SEDANG AKTIF</span>
            </div>
            <h5 className="font-extrabold text-[#111111] font-sans text-xs">Sprint Modul 1 & Handover</h5>
            <p className="text-[11px] text-zinc-700 font-sans leading-snug">
              • Modul 1 LMS Umi Elly<br />
              • Handover DreamMecca<br />
              • Siap tagih Termin 2 (+Rp2M)
            </p>
          </div>

          {/* Phase 3 */}
          <div className="bento-card bento-blue p-5 rounded-[22px] border border-[#bae6fd] space-y-2">
            <div className="flex justify-between items-center">
              <span className="sticker-pill sticker-blue text-[9px]">FASE 3 // 11-20 SEP</span>
              <span className="text-[#0369a1] font-bold">NEXT HARVEST</span>
            </div>
            <h5 className="font-extrabold text-[#111111] font-sans text-xs">Cairkan Termin 2 & KAEL</h5>
            <p className="text-[11px] text-zinc-700 font-sans leading-snug">
              • Masuk Termin 2 (+Rp2M)<br />
              • Demo KAEL ke 3 outlet<br />
              • Kas tembus Rp11M+
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
              • Masuk Termin 3 (+Rp2M)<br />
              • Pilot pertama KAEL jalan<br />
              • Kas surplus +Rp5,5M bersih
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
          <span>Mulai Move #1: LMS Umi Elly (90m)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
