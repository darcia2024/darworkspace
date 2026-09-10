import React, { useState } from 'react';
import { DaruWorkOSState, TodayBlock } from '../types';
import { actionableProjects } from '../utils/selectors';
import { projectIdFor } from '../../shared/domain.js';
import { soundManager } from '../utils/audio';
import { Compass, Flame, ArrowUpRight, CheckCircle2, Layers, Zap, Check } from 'lucide-react';

interface NextShouldBeGoViewProps {
  state: DaruWorkOSState;
  onStartFocus: (block: TodayBlock) => void;
  onSelectTab: (tab: 'today' | 'lanes' | 'waiting' | 'money' | 'deepwork' | 'nextgo') => void;
  onToggleBlock?: (id: string) => void;
}

const laneLabels: Record<string, string> = {
  client_delivery: 'Client Delivery',
  maintenance: 'Maintenance',
  bizdev: 'Sales & BizDev',
  own_product: 'Core Product',
  operations: 'Internal Ops',
  parking_lot: 'Archive / Parked',
};

const priorityStyles: Record<string, { badge: string; text: string }> = {
  P1: { badge: 'bg-rose-100 text-rose-800 border-rose-200', text: 'P1 · Mendesak' },
  P2: { badge: 'bg-amber-100 text-amber-800 border-amber-200', text: 'P2 · Penting' },
  P3: { badge: 'bg-zinc-100 text-zinc-700 border-zinc-200', text: 'P3 · Normal' },
};

export const NextShouldBeGoView: React.FC<NextShouldBeGoViewProps> = ({ state, onStartFocus, onSelectTab, onToggleBlock }) => {
  const [filter, setFilter] = useState<'all' | 'client_delivery' | 'maintenance' | 'growth'>('all');
  
  const allActionable = actionableProjects(state.projects);
  const projects = allActionable.filter(project => 
    filter === 'all' || (filter === 'growth' ? ['bizdev', 'own_product'].includes(project.lane) : project.lane === filter)
  );

  const counts = {
    all: allActionable.length,
    client_delivery: allActionable.filter(p => p.lane === 'client_delivery').length,
    maintenance: allActionable.filter(p => p.lane === 'maintenance').length,
    growth: allActionable.filter(p => ['bizdev', 'own_product'].includes(p.lane)).length,
  };

  const focus = (project: typeof projects[number]) => {
    soundManager.playClick();
    const existing = state.todayBlocks.find(block => projectIdFor(block, state.projects) === project.id && !block.isDone);
    onStartFocus(existing || { 
      id: crypto.randomUUID(), 
      projectId: project.id, 
      projectName: project.name, 
      action: project.nextAction || 'Tentukan langkah konkrit berikutnya', 
      blockType: project.lane === 'maintenance' ? 'Admin/Maintenance' : 'Deep Work 1', 
      timeboxMinutes: project.lane === 'maintenance' ? 25 : 50, 
      isDone: false, 
      rule: project.rule || 'Selesaikan satu langkah sebelum berpindah.' 
    });
  };

  return (
    <section className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-zinc-100 text-zinc-700 border border-zinc-200">
                <Compass className="w-3.5 h-3.5 text-zinc-800" />
                KOMPAS STRATEGIS · ANTI-DECISION PARALYSIS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
              Abis Ini Ngapain?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
              Mesin penyaring aksi dari seluruh project aktif di Kanban (<span className="font-bold text-zinc-800">DOING</span> & <span className="font-bold text-zinc-800">QUEUE</span>). Saat lo selesai satu tugas atau bingung mau lanjut apa, pilih satu task di bawah dan langsung lempar ke Kamar Fokus.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => {
                soundManager.playClick();
                onSelectTab('lanes');
              }}
              className="px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs transition-all flex items-center gap-1.5 border border-zinc-200/80"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Papan Kanban</span>
            </button>
          </div>
        </div>

        {/* 2. Filter Pills with Counters */}
        <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-zinc-100">
          <span className="text-[11px] font-mono text-zinc-600 font-bold uppercase tracking-wider mr-1">
            Filter Jalur:
          </span>
          {([
            ['all', 'Semua Jalur', counts.all],
            ['client_delivery', 'Client Delivery', counts.client_delivery],
            ['maintenance', 'Maintenance', counts.maintenance],
            ['growth', 'Sales & Product', counts.growth],
          ] as const).map(([id, label, count]) => {
            const isActive = filter === id;
            return (
              <button
                key={id}
                onClick={() => {
                  soundManager.playClick();
                  setFilter(id);
                }}
                aria-pressed={isActive}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'bg-[#111111] text-white shadow-sm' 
                    : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Actionable Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, index) => {
          const priorityInfo = priorityStyles[project.priority] || priorityStyles.P3;
          const laneTitle = laneLabels[project.lane] || project.lane;
          const projectTodayBlocks = state.todayBlocks.filter(block => projectIdFor(block, state.projects) === project.id);
          const isDoing = project.boardColumn === 'DOING';

          return (
            <article 
              key={project.id} 
              className="bento-card p-6 flex flex-col justify-between space-y-4 hover:border-black/30 transition-all shadow-xs group"
            >
              <div className="space-y-3.5">
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-600 font-bold text-[11px]">
                      #{index + 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${priorityInfo.badge}`}>
                      {priorityInfo.text}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {laneTitle}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                    isDoing ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isDoing ? '⚡ SEDANG DIGARAP' : '⏳ ANTREAN'}
                  </span>
                </div>

                {/* Project Name */}
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight leading-snug group-hover:text-black">
                  {project.name}
                </h3>

                {/* Next Action Box (High visibility) */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-amber-800 tracking-wider">
                    <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                    <span>Langkah Konkrit Berikutnya:</span>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed">
                    {project.nextAction || 'Belum ada next action konkrit. Klik buka board untuk mengisi.'}
                  </p>
                </div>

                {/* Definition of Done */}
                {project.definitionOfDone && (
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-zinc-700 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-zinc-900">Selesai jika: </span>
                      <span>{project.definitionOfDone}</span>
                    </div>
                  </div>
                )}

                {/* Financial context */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 pt-1">
                  <span>Sisa Tagihan: <strong className="text-zinc-900">Rp{project.unpaidNumeric.toLocaleString('id-ID')}</strong></span>
                  <span>Diterima: <strong className="text-emerald-700">Rp{project.paidNumeric.toLocaleString('id-ID')}</strong></span>
                </div>

                {/* Today Blocks Checklist (if any already mapped) */}
                {projectTodayBlocks.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-600 font-bold uppercase">
                      Agenda Hari Ini:
                    </span>
                    {projectTodayBlocks.map(block => (
                      <label 
                        key={block.id} 
                        className="flex items-center gap-2 text-xs text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer"
                      >
                        <input 
                          type="checkbox" 
                          checked={block.isDone} 
                          onChange={() => {
                            soundManager.playClick();
                            onToggleBlock?.(block.id);
                          }}
                          className="w-3.5 h-3.5 rounded accent-black" 
                        />
                        <span className={block.isDone ? 'line-through text-zinc-600' : 'font-medium'}>
                          {block.action}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100">
                <button 
                  onClick={() => focus(project)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-zinc-800 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Sikat di Kamar Fokus</span>
                </button>
                <button 
                  onClick={() => {
                    soundManager.playClick();
                    onSelectTab('lanes');
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs border border-zinc-200 transition-all flex items-center gap-1"
                >
                  <span>Lihat di Board</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty State */}
      {!projects.length && (
        <div className="bento-card p-10 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-zinc-900">Tidak ada task aktif di filter ini</h3>
            <p className="text-xs text-zinc-600">
              Semua project di kategori ini sudah selesai (DONE), diparkir (PARKED), atau sedang menunggu pihak luar (WAITING).
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button 
              className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-bold" 
              onClick={() => {
                soundManager.playClick();
                onSelectTab('lanes');
              }}
            >
              Buka Board Project
            </button>
            <button 
              className="px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-200" 
              onClick={() => {
                soundManager.playClick();
                onSelectTab('waiting');
              }}
            >
              Cek Radar Tagihan
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
