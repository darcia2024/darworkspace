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
  BookOpen, 
  Coffee, 
  ChevronRight,
  Award,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { DaruWorkOSState, TodayBlock, ProjectCard } from '../types';

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
  const totalLiquid = report?.totalLiquidBalance || 9892741;

  const strategicMoves: StrategicMove[] = [
    {
      id: 'move-1',
      rank: 1,
      badge: 'PRIORITAS MUTLAK #1 // CASH ACCELERATOR',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      title: 'LMS Umi Elly Azhariyah — Sprint Modul 1 & Portal Santri',
      subtitle: 'DP Rp3.000.000 Sudah Masuk Kas ➔ Kunci Pencairan Termin 2 (+Rp2.000.000)',
      projectTarget: 'Umi Elly — LMS Peradaban Islam Azhariyah',
      roiType: 'CASH_ACCELERATOR',
      cashImpactText: '+Rp2.000.000 (Termin 2) + Rp2.000.000 (Termin 3)',
      timeboxMinutes: 90,
      urgency: 'IMMEDIATE',
      energyLevel: 'high',
      description: 'DP Termin 1 (Rp3M) sudah cair ke Mandiri. Klien sedang dalam momentum antusias tinggi. Eksekusi cepat modul tahap 1 adalah kartu as untuk langsung trigger invoice Termin 2 (+Rp2M) minggu ini.',
      keyWhy: 'Kunci paling cepat melesatkan saldo kas dari Rp9,89M ke Rp11,89M+ dan menyempurnakan target September 100%!',
      actionChecklist: [
        { id: 'act-1-1', text: 'Setup folder arsitektur & struktur modular LMS Azhariyah', done: false },
        { id: 'act-1-2', text: 'Buat dashboard kurikulum & portal akses materi santri (Clean Geist UI)', done: false },
        { id: 'act-1-3', text: 'Siapkan video/demo interaktif prototype modul 1 untuk approval Umi Elly', done: false },
        { id: 'act-1-4', text: 'Kirim preview & siapkan draft penagihan Termin 2 (+Rp2.000.000)', done: false },
      ],
      financialUnlockNote: 'Jika modul 1 selesai: Langsung mencairkan Termin 2 (+Rp2M). Total pembayaran proyek ini: Rp7.000.000.',
      projectRefId: 'p-umi-elly'
    },
    {
      id: 'move-2',
      rank: 2,
      badge: 'PRIORITAS #2 // CLEAN DESK & MIND CLARITY',
      badgeColor: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
      title: 'DreamMecca Platform — Final Polish & Official Handover',
      subtitle: 'Sudah Lunas dari Lama ➔ Tuntaskan 100% Biar Bebas Utang Deliverable',
      projectTarget: 'DreamMecca Platform',
      roiType: 'CLEAN_DESK',
      cashImpactText: 'Nol Utang Mental (100% Zero Historical Debt)',
      timeboxMinutes: 50,
      urgency: 'HIGH',
      energyLevel: 'medium',
      description: 'Uang platform DreamMecca sudah lunas dibayar klien dari lama. Menuntaskan dan menyerahkan deliverable terakhir platform ini akan membersihkan sisa beban pikiran masa lalu.',
      keyWhy: 'Membuat kapasitas otak 100% plong dan bebas dari risiko revisi menumpuk.',
      actionChecklist: [
        { id: 'act-2-1', text: 'Review kelengkapan UI paket umrah & alur kontak inquiry WhatsApp', done: false },
        { id: 'act-2-2', text: 'Testing respon form & checklist deploy production', done: false },
        { id: 'act-2-3', text: 'Kirim link akses final & pesan serah terima resmi ke owner DreamMecca', done: false },
        { id: 'act-2-4', text: 'Tandai status Done & arsipkan ke portfolio selesai ✓', done: false },
      ],
      financialUnlockNote: 'Memberikan reputasi tier-1 dan membebaskan 100% fokus untuk scaling SaaS.',
      projectRefId: 'p-dreammecca'
    },
    {
      id: 'move-3',
      rank: 3,
      badge: 'PRIORITAS #3 // HIGH-LEVERAGE ASSET (MRR)',
      badgeColor: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
      title: 'KAEL POS SaaS — Repackage Core Engine & Demo Multi-Tenant',
      subtitle: 'Validasi Sukses di Barber Rp6M ➔ Jadikan Mesin Recurring Revenue (MRR)',
      projectTarget: 'Setting KAEL (Core Product)',
      roiType: 'WEALTH_SCALE',
      cashImpactText: 'Langganan Bulanan (MRR) dari Jaringan Outlet',
      timeboxMinutes: 45,
      urgency: 'STRATEGIC',
      energyLevel: 'creative',
      description: 'Engine kasir & membership Barber Underrated kemarin terbukti berhasil lo jual Rp6 Juta lunas. Sekarang saatnya membungkus core yang sama jadi SaaS multi-outlet untuk passive recurring cashflow.',
      keyWhy: 'Mengubah solo-developer service (aktif barter waktu) menjadi software asset yang menghasilkan uang saat tidur.',
      actionChecklist: [
        { id: 'act-3-1', text: 'Kunci konfigurasi permission role Kasir vs Owner vs Admin', done: false },
        { id: 'act-3-2', text: 'Rapikan demo tenant kafe/barber siap live pitch ke calon klien', done: false },
        { id: 'act-3-3', text: 'Siapkan list 3–5 calon outlet prospek pilot pertama', done: false },
      ],
      financialUnlockNote: 'Potensi penambahan kas stabil Rp1.500.000 – Rp5.000.000/bulan per cluster tenant.',
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
      
      {/* 1. EXECUTIVE DIRECTIVE HERO */}
      <div className="dev-card p-6 sm:p-7 border-l-4 border-l-emerald-500 space-y-4 bg-gradient-to-br from-[#0c1410] via-[#080b09] to-[#050508]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-glow-white" />
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2 font-sans">
              <span>🎯 NEXT SHOULD BE GO — ENGINE KEPUTUSAN STRATEGIS</span>
              <span className="dev-tag-emerald text-[9px]">ZERO_DECISION_FATIGUE</span>
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            // SALDO KAS REAL: {formatRupiah(totalLiquid)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">01 // POSISI MOMENTUM</span>
            <span className="text-sm font-bold text-emerald-300 block">60% Target September Tembus!</span>
            <p className="text-[11px] text-zinc-400 leading-snug">Kas aman di Rp9,89M (Surplus +Rp5,89M di atas Floor). Bebas utang deliverable.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">02 // SISA TARGET SEPTEMBER</span>
            <span className="text-sm font-bold text-amber-300 block">Sisa Rp4.000.000 OTW</span>
            <p className="text-[11px] text-zinc-400 leading-snug">Terkunci di Termin 2 (Rp2M) & Termin 3 (Rp2M) project LMS Umi Elly.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block">03 // STRATEGI GOLDEN MOVE</span>
            <span className="text-sm font-bold text-white block">Sprint Cepat ➔ Cairkan Sisa</span>
            <p className="text-[11px] text-zinc-400 leading-snug">Kerjakan hal dengan dampak cash & mental clarity tertinggi sekarang.</p>
          </div>
        </div>

        {/* The Golden Directive Rule */}
        <div className="p-3.5 rounded-xl bg-[#090d0b] border border-emerald-500/30 text-xs font-mono text-zinc-200 flex items-start gap-2.5">
          <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-emerald-400 font-bold">ATURAN UTAMA SAAT INI:</span> "Jangan buka kerjaan baru yang gak jelas! Fokus tuntaskan <strong>Modul 1 Umi Elly</strong> (buka kunci Rp2M) & serahkan <strong>DreamMecca</strong> (otak 100% plong)."
          </div>
        </div>
      </div>

      {/* 2. ENERGY & CONTEXT SELECTOR (Filter Apa yang Mau Dikerjakan) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0f] p-3 rounded-2xl border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white font-mono">Pilih Kondisi Energi Lo Sekarang:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-xs">
          {[
            { id: 'all', label: '🌟 Semua Prioritas' },
            { id: 'high', label: '⚡ High Energy (Coding Berat)' },
            { id: 'medium', label: '☕ Medium Flow (Polish & Handover)' },
            { id: 'creative', label: '💡 Strategic / BizDev (Scale SaaS)' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => { soundManager.playClick(); setEnergyFilter(btn.id as any); }}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                energyFilter === btn.id
                  ? 'bg-white text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
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
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
            // DAFTAR LANGKAH PALING BERDAMPAK (URUTAN PRIORITAS):
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            {filteredMoves.length} Rekomendasi Terpilih
          </span>
        </div>

        <div className="space-y-4">
          {filteredMoves.map(move => {
            const isExpanded = expandedMoveId === move.id;
            const completedCount = move.actionChecklist.filter(a => completedActions[`${move.id}_${a.id}`]).length;
            const totalActionCount = move.actionChecklist.length;

            return (
              <div 
                key={move.id}
                className={`dev-card overflow-hidden transition-all duration-300 border ${
                  move.rank === 1 
                    ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 bg-gradient-to-b from-[#0e1612] to-[#07070b]' 
                    : move.rank === 2
                    ? 'border-blue-500/30 bg-gradient-to-b from-[#0c1218] to-[#07070b]'
                    : 'border-white/[0.1] bg-[#07070b]'
                }`}
              >
                {/* Card Header & Summary */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${move.badgeColor}`}>
                        {move.badge}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {move.timeboxMinutes} Menit Timebox
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {move.cashImpactText}
                      </span>
                      <button
                        onClick={() => handleLaunchMoveFocus(move)}
                        className="px-4 py-1.5 dev-btn-primary text-xs font-bold font-mono flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Kunci Focus Lock →</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-sans">
                      #{move.rank} — {move.title}
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1 font-medium leading-relaxed">
                      {move.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {move.description}
                  </p>

                  <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <div className="text-zinc-400">
                      Progress Tindakan: <strong className={completedCount > 0 ? "text-emerald-400 font-bold" : "text-zinc-300"}>{completedCount}/{totalActionCount} Selesai</strong>
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setExpandedMoveId(isExpanded ? '' : move.id);
                      }}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 underline underline-offset-4"
                    >
                      <span>{isExpanded ? 'Tutup Detail Rencana' : 'Buka Checklist & Roadmap Eksekusi'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Action Checklist & Details */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/[0.06] bg-black/40 space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold tracking-wider block">
                        📋 Checklist Eksekusi Micro-Step (Tandai Saat Selesai):
                      </span>
                      <div className="space-y-2">
                        {move.actionChecklist.map((act) => {
                          const isDone = !!completedActions[`${move.id}_${act.id}`];
                          return (
                            <button
                              key={act.id}
                              onClick={() => toggleAction(move.id, act.id)}
                              className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                isDone 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                                  : 'bg-[#060609] border-white/[0.06] hover:border-white/20 text-zinc-300'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-500" />
                                )}
                              </div>
                              <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-zinc-400' : ''}`}>
                                {act.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Financial Unlock Impact Simulation Box */}
                    <div className="p-3.5 rounded-xl bg-[#090d0b] border border-emerald-500/30 text-xs font-mono space-y-1">
                      <span className="text-emerald-400 font-bold block">// EFEK KE SALDO REKENING:</span>
                      <p className="text-zinc-300">{move.financialUnlockNote}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => onSelectTab('lanes')}
                        className="text-xs text-zinc-400 hover:text-white font-mono flex items-center gap-1"
                      >
                        <span>Lihat detail di Board Kanban →</span>
                      </button>

                      <button
                        onClick={() => handleLaunchMoveFocus(move)}
                        className="px-4 py-2 dev-btn-primary text-xs font-bold font-mono flex items-center gap-1.5 shadow-lg"
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
      <div className="dev-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
              <span>🗺️ Peta Roadmap Eksekusi Bulan September 2026</span>
              <span className="dev-tag text-[9px]">TIMELINE_EXECUTION</span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono">// 4 Fase strategis untuk mengunci target +Rp10 Juta dan scaling SaaS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          
          {/* Phase 1 */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="dev-tag-emerald text-[9px]">FASE 1 // 1–3 SEP</span>
              <span className="text-emerald-400 font-bold">100% TUNTAS ✓</span>
            </div>
            <h5 className="font-bold text-white font-sans text-xs">Cash Defense & Kickoff</h5>
            <p className="text-[11px] text-zinc-300 font-sans leading-snug">
              • Barber lunas Rp6M ✓<br />
              • DP Umi Elly Rp3M masuk ✓<br />
              • Saldo aman Rp9,89M ✓
            </p>
          </div>

          {/* Phase 2 */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2 ring-1 ring-amber-500/20">
            <div className="flex justify-between items-center">
              <span className="dev-tag text-[9px] bg-amber-500/20 text-amber-300 border-amber-500/30">FASE 2 // 4–10 SEP</span>
              <span className="text-amber-400 font-bold animate-pulse">SEDANG AKTIF ⚡</span>
            </div>
            <h5 className="font-bold text-white font-sans text-xs">Sprint Modul 1 & Handover</h5>
            <p className="text-[11px] text-zinc-300 font-sans leading-snug">
              • Modul 1 LMS Umi Elly<br />
              • Handover DreamMecca<br />
              • Siap tagih Termin 2 (+Rp2M)
            </p>
          </div>

          {/* Phase 3 */}
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex justify-between items-center">
              <span className="dev-tag text-[9px]">FASE 3 // 11–20 SEP</span>
              <span className="text-zinc-400 font-bold">NEXT HARVEST</span>
            </div>
            <h5 className="font-bold text-white font-sans text-xs">Cairkan Termin 2 & KAEL</h5>
            <p className="text-[11px] text-zinc-400 font-sans leading-snug">
              • Masuk Termin 2 (+Rp2M)<br />
              • Demo KAEL ke 3 outlet<br />
              • Kas tembus Rp11M+
            </p>
          </div>

          {/* Phase 4 */}
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex justify-between items-center">
              <span className="dev-tag text-[9px]">FASE 4 // 21–30 SEP</span>
              <span className="text-zinc-400 font-bold">SCALE & MRR</span>
            </div>
            <h5 className="font-bold text-white font-sans text-xs">Termin 3 & Growth Mode</h5>
            <p className="text-[11px] text-zinc-400 font-sans leading-snug">
              • Masuk Termin 3 (+Rp2M)<br />
              • Pilot pertama KAEL jalan<br />
              • Kas surplus +Rp5,5M bersih
            </p>
          </div>

        </div>
      </div>

      {/* 5. INSTANT LAUNCH TO FOCUS STUDIO */}
      <div className="p-5 rounded-2xl bg-[#09090d] border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Siap Mulai Eksekusi Sekarang?</h4>
            <p className="text-xs text-zinc-400">Pilih salah satu move di atas, lalu kunci layar dan fokus coding tanpa distraksi.</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            handleLaunchMoveFocus(strategicMoves[0]);
          }}
          className="px-5 py-2.5 dev-btn-primary text-xs font-bold font-mono flex items-center gap-2 shadow-lg"
        >
          <span>Mulai Move #1: LMS Umi Elly (90m)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
