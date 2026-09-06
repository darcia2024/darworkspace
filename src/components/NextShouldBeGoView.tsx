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
  const totalLiquid = report?.totalLiquidBalance || 9892741;

  const strategicMoves: StrategicMove[] = [
    {
      id: 'move-1',
      rank: 1,
      badge: 'PRIORITAS MUTLAK #1 // CASH ACCELERATOR',
      badgeColor: 'bg-[#e2ecdc] text-[#305d46] border border-[#305d46]/30',
      title: 'LMS Umi Elly Azhariyah — Sprint Modul 1 & Portal Santri',
      subtitle: 'DP Rp3.000.000 Sudah Masuk Kas → Kunci Pencairan Termin 2 (+Rp2.000.000)',
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
      badgeColor: 'bg-[#e2edf9] text-[#2b5675] border border-[#3c6b8c]/30',
      title: 'DreamMecca Platform — Final Polish & Official Handover',
      subtitle: 'Sudah Lunas dari Lama → Tuntaskan 100% Biar Bebas Utang Deliverable',
      projectTarget: 'DreamMecca Platform',
      roiType: 'CLEAN_DESK',
      cashImpactText: 'Nol Utang Mental (100% Zero Historical Debt)',
      timeboxMinutes: 50,
      urgency: 'HIGH',
      energyLevel: 'medium',
      description: 'Uang platform DreamMecca sudah lunas dibayar klien dari lama. Menuntaskan dan menyerahkan deliverable terakhir platform ini akan membersihkan sisa beban pikiran masa lalu.',
      keyWhy: 'Membuat kapasitas otak 100% plong dan bebas dari risiko revisi menumpuk.',
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
      badge: 'PRIORITAS #3 // HIGH-LEVERAGE ASSET (MRR)',
      badgeColor: 'bg-[#f0e6f9] text-[#4e3a68] border border-[#4e3a68]/30',
      title: 'KAEL POS SaaS — Repackage Core Engine & Demo Multi-Tenant',
      subtitle: 'Validasi Sukses di Barber Rp6M → Jadikan Mesin Recurring Revenue (MRR)',
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
      
      {/* 1. EXECUTIVE DIRECTIVE HERO */}
      <div className="figma-shell border-l-4 border-l-[#305d46]">
        <div className="figma-core p-6 sm:p-7 space-y-4 bg-[#fffdf5]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded7c8] pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#305d46] animate-pulse" />
              <h2 className="text-base sm:text-lg font-extrabold text-[#252520] tracking-tight flex items-center gap-2 font-sans">
                <span>NEXT SHOULD BE GO — ENGINE KEPUTUSAN STRATEGIS</span>
                <span className="dev-tag-emerald text-[9px]">ZERO_DECISION_FATIGUE</span>
              </h2>
            </div>
            <span className="text-xs font-mono text-[#305d46] bg-[#e2ecdc] px-3 py-1 rounded-full border border-[#305d46]/30 font-bold">
              SALDO KAS REAL: {formatRupiah(totalLiquid)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#faf9f3] border border-[#ded7c8] space-y-1">
              <span className="text-[10px] font-mono text-[#59594f] uppercase tracking-widest block font-bold">01 // POSISI MOMENTUM</span>
              <span className="text-sm font-bold text-[#305d46] block">65% Target September Tembus!</span>
              <p className="text-[11px] text-[#59594f] leading-snug">Kas aman di Rp9,89M (Surplus +Rp5,89M di atas Floor). Bebas utang deliverable.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faf9f3] border border-[#ded7c8] space-y-1">
              <span className="text-[10px] font-mono text-[#925f18] uppercase tracking-widest block font-bold">02 // SISA TARGET SEPTEMBER</span>
              <span className="text-sm font-bold text-[#925f18] block">Sisa Rp3.500.000 OTW</span>
              <p className="text-[11px] text-[#59594f] leading-snug">Terkunci di Termin 2 (Rp2M) & Termin 3 (Rp2M) project LMS Umi Elly.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faf9f3] border border-[#ded7c8] space-y-1">
              <span className="text-[10px] font-mono text-[#2b5675] uppercase tracking-widest block font-bold">03 // STRATEGI GOLDEN MOVE</span>
              <span className="text-sm font-bold text-[#252520] block">Sprint Cepat → Cairkan Sisa</span>
              <p className="text-[11px] text-[#59594f] leading-snug">Kerjakan hal dengan dampak cash & mental clarity tertinggi sekarang.</p>
            </div>
          </div>

          {/* The Golden Directive Rule */}
          <div className="p-3.5 rounded-xl bg-[#e3e6c7]/40 border border-[#ded7c8] text-xs font-mono text-[#252520] flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-[#305d46] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#305d46] font-bold">ATURAN UTAMA SAAT INI:</span> "Jangan buka kerjaan baru yang belum jelas! Fokus tuntaskan <strong>Modul 1 Umi Elly</strong> (buka kunci Termin 2 +Rp2M) & serahkan <strong>DreamMecca</strong> (otak 100% plong)."
            </div>
          </div>
        </div>
      </div>

      {/* 2. ENERGY & CONTEXT SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fffdf5] p-3.5 rounded-2xl border border-[#ded7c8] shadow-sm">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#925f18]" />
          <span className="text-xs font-bold text-[#252520] font-mono">Pilih Kondisi Energi Lo Sekarang:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-xs">
          {[
            { id: 'all', label: 'Semua Prioritas' },
            { id: 'high', label: 'High Energy (Coding Berat)' },
            { id: 'medium', label: 'Medium Flow (Polish & Handover)' },
            { id: 'creative', label: 'Strategic / BizDev (Scale SaaS)' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => { soundManager.playClick(); setEnergyFilter(btn.id as any); }}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                energyFilter === btn.id
                  ? 'bg-[#292a24] text-[#fffdf5] font-bold shadow-sm'
                  : 'text-[#59594f] hover:text-[#252520] hover:bg-[#eae5d8]'
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
          <span className="text-xs font-mono text-[#59594f] uppercase tracking-wider font-semibold">
            // DAFTAR LANGKAH PALING BERDAMPAK (URUTAN PRIORITAS):
          </span>
          <span className="text-[11px] font-mono text-[#305d46] font-bold">
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
                className={`figma-shell transition-all duration-300 ${
                  move.rank === 1 ? 'border-[#305d46]/40 shadow-md' : 'shadow-sm'
                }`}
              >
                <div className="figma-core p-5 sm:p-6 space-y-3 bg-[#fffdf5]">
                  {/* Card Header & Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${move.badgeColor}`}>
                        {move.badge}
                      </span>
                      <span className="text-xs font-mono text-[#59594f] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#59594f]" />
                        {move.timeboxMinutes} Menit Timebox
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#305d46] bg-[#e2ecdc] px-2.5 py-1 rounded-lg border border-[#305d46]/30">
                        {move.cashImpactText}
                      </span>
                      <button
                        onClick={() => handleLaunchMoveFocus(move)}
                        className="px-4 py-1.5 dev-btn-primary text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Kunci Focus Lock</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#252520] tracking-tight font-sans">
                      #{move.rank} — {move.title}
                    </h3>
                    <p className="text-xs text-[#59594f] mt-1 font-medium leading-relaxed">
                      {move.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#59594f] leading-relaxed">
                    {move.description}
                  </p>

                  <div className="pt-2 border-t border-[#ded7c8] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <div className="text-[#59594f]">
                      Progress Tindakan: <strong className={completedCount > 0 ? "text-[#305d46] font-bold" : "text-[#252520]"}>{completedCount}/{totalActionCount} Selesai</strong>
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setExpandedMoveId(isExpanded ? '' : move.id);
                      }}
                      className="text-xs text-[#59594f] hover:text-[#252520] flex items-center gap-1 underline underline-offset-4"
                    >
                      <span>{isExpanded ? 'Tutup Detail Rencana' : 'Buka Checklist & Roadmap Eksekusi'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* Expanded Action Checklist & Details */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-[#ded7c8] space-y-4 animate-fade-in">
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono text-[#59594f] uppercase font-bold tracking-wider block">
                          Checklist Eksekusi Micro-Step (Tandai Saat Selesai):
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
                                    ? 'bg-[#e2ecdc] border-[#305d46]/30 text-[#305d46]' 
                                    : 'bg-[#faf9f3] border-[#ded7c8] hover:border-[#928876] text-[#252520]'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-[#305d46]" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-[#928876]" />
                                  )}
                                </div>
                                <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-[#59594f]' : ''}`}>
                                  {act.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Financial Unlock Impact Simulation Box */}
                      <div className="p-3.5 rounded-xl bg-[#faf9f3] border border-[#ded7c8] text-xs font-mono space-y-1">
                        <span className="text-[#305d46] font-bold block">// EFEK KE SALDO REKENING:</span>
                        <p className="text-[#59594f]">{move.financialUnlockNote}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          onClick={() => onSelectTab('lanes')}
                          className="text-xs text-[#59594f] hover:text-[#252520] font-mono flex items-center gap-1"
                        >
                          <span>Lihat detail di Board Kanban</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleLaunchMoveFocus(move)}
                          className="px-4 py-2 dev-btn-primary text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Mulai Eksekusi {move.timeboxMinutes}m Sekarang</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SEPTEMBER 2026 4-PHASE BLUEPRINT TIMELINE */}
      <div className="figma-shell">
        <div className="figma-core p-5 sm:p-6 space-y-4 bg-[#fffdf5]">
          <div className="flex items-center justify-between border-b border-[#ded7c8] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#252520] flex items-center gap-2 font-sans">
                <span>Peta Roadmap Eksekusi Bulan September 2026</span>
                <span className="dev-tag text-[9px]">TIMELINE_EXECUTION</span>
              </h3>
              <p className="text-xs text-[#59594f] font-mono">// 4 Fase strategis untuk mengunci target +Rp10 Juta dan scaling SaaS</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            
            {/* Phase 1 */}
            <div className="p-4 rounded-xl bg-[#e2ecdc] border border-[#305d46]/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="dev-tag-emerald text-[9px]">FASE 1 // 1-3 SEP</span>
                <span className="text-[#305d46] font-bold">100% TUNTAS</span>
              </div>
              <h5 className="font-bold text-[#252520] font-sans text-xs">Cash Defense & Kickoff</h5>
              <p className="text-[11px] text-[#59594f] font-sans leading-snug">
                • Barber lunas Rp6M<br />
                • DP Umi Elly Rp3M masuk<br />
                • Saldo aman Rp9,89M
              </p>
            </div>

            {/* Phase 2 */}
            <div className="p-4 rounded-xl bg-[#fdf3d8] border border-[#b87e2b]/40 space-y-2">
              <div className="flex justify-between items-center">
                <span className="dev-tag-amber text-[9px]">FASE 2 // 4-10 SEP</span>
                <span className="text-[#925f18] font-bold animate-pulse">SEDANG AKTIF</span>
              </div>
              <h5 className="font-bold text-[#252520] font-sans text-xs">Sprint Modul 1 & Handover</h5>
              <p className="text-[11px] text-[#59594f] font-sans leading-snug">
                • Modul 1 LMS Umi Elly<br />
                • Handover DreamMecca<br />
                • Siap tagih Termin 2 (+Rp2M)
              </p>
            </div>

            {/* Phase 3 */}
            <div className="p-4 rounded-xl bg-[#e2edf9] border border-[#3c6b8c]/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="dev-tag-blue text-[9px]">FASE 3 // 11-20 SEP</span>
                <span className="text-[#2b5675] font-bold">NEXT HARVEST</span>
              </div>
              <h5 className="font-bold text-[#252520] font-sans text-xs">Cairkan Termin 2 & KAEL</h5>
              <p className="text-[11px] text-[#59594f] font-sans leading-snug">
                • Masuk Termin 2 (+Rp2M)<br />
                • Demo KAEL ke 3 outlet<br />
                • Kas tembus Rp11M+
              </p>
            </div>

            {/* Phase 4 */}
            <div className="p-4 rounded-xl bg-[#f0e6f9] border border-[#4e3a68]/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="dev-tag text-[9px] bg-[#f0e6f9] text-[#4e3a68] border-[#4e3a68]/30">FASE 4 // 21-30 SEP</span>
                <span className="text-[#4e3a68] font-bold">SCALE & MRR</span>
              </div>
              <h5 className="font-bold text-[#252520] font-sans text-xs">Termin 3 & Growth Mode</h5>
              <p className="text-[11px] text-[#59594f] font-sans leading-snug">
                • Masuk Termin 3 (+Rp2M)<br />
                • Pilot pertama KAEL jalan<br />
                • Kas surplus +Rp5,5M bersih
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* 5. INSTANT LAUNCH TO FOCUS STUDIO */}
      <div className="p-5 rounded-2xl bg-[#fffdf5] border border-[#ded7c8] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292a24] text-[#fffdf5] flex items-center justify-center">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#252520]">Siap Mulai Eksekusi Sekarang?</h4>
            <p className="text-xs text-[#59594f]">Pilih salah satu move di atas, lalu kunci layar dan fokus coding tanpa distraksi.</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            handleLaunchMoveFocus(strategicMoves[0]);
          }}
          className="px-5 py-2.5 dev-btn-primary text-xs font-bold font-mono flex items-center gap-2 shadow-sm"
        >
          <span>Mulai Move #1: LMS Umi Elly (90m)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
