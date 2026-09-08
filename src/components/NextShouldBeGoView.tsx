import React, { useState } from 'react';
import { DaruWorkOSState, TodayBlock } from '../types';
import { actionableProjects } from '../utils/selectors';
import { projectIdFor } from '../../shared/domain.js';

interface NextShouldBeGoViewProps {
  state: DaruWorkOSState;
  onStartFocus: (block: TodayBlock) => void;
  onSelectTab: (tab: 'today' | 'lanes' | 'waiting' | 'money' | 'deepwork' | 'nextgo') => void;
  onToggleBlock?: (id: string) => void;
}

export const NextShouldBeGoView: React.FC<NextShouldBeGoViewProps> = ({ state, onStartFocus, onSelectTab, onToggleBlock }) => {
  const [filter, setFilter] = useState<'all' | 'client_delivery' | 'maintenance' | 'growth'>('all');
  const projects = actionableProjects(state.projects).filter(project => filter === 'all' || (filter === 'growth' ? ['bizdev', 'own_product'].includes(project.lane) : project.lane === filter));
  const focus = (project: typeof projects[number]) => {
    const existing = state.todayBlocks.find(block => projectIdFor(block, state.projects) === project.id && !block.isDone);
    onStartFocus(existing || { id: crypto.randomUUID(), projectId: project.id, projectName: project.name, action: project.nextAction || 'Tentukan langkah konkrit berikutnya', blockType: project.lane === 'maintenance' ? 'Admin/Maintenance' : 'Deep Work 1', timeboxMinutes: project.lane === 'maintenance' ? 25 : 50, isDone: false, rule: project.rule || 'Selesaikan satu langkah sebelum berpindah.' });
  };
  return <section className="space-y-5">
    <h2 className="text-2xl font-bold">Abis ini ngapain?</h2>
    <p className="text-sm text-zinc-700">Rekomendasi mengikuti isi board. Project Done, Parked, dan Waiting tidak masuk antrean fokus.</p>
    <div className="flex flex-wrap gap-2">
      {([['all', 'Semua'], ['client_delivery', 'Client'], ['maintenance', 'Maintenance'], ['growth', 'Sales & product']] as const).map(([id, label]) => <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id} className={filter === id ? 'pill-black' : 'pill-white'}>{label}</button>)}
    </div>
    {projects.map((project, index) => <article key={project.id} className="bento-card p-6 space-y-4">
      <p className="text-xs text-zinc-600">{index + 1} · {project.priority} · {project.status} · {project.paymentStatus}</p>
      <h3 className="text-xl font-bold">{project.name}</h3>
      <p className="text-sm">{project.nextAction || 'Tambahkan next action melalui detail project.'}</p>
      {project.definitionOfDone && <p className="text-sm text-zinc-700">Selesai ketika: {project.definitionOfDone}</p>}
      <p className="text-sm">Sisa tagihan: Rp{project.unpaidNumeric.toLocaleString('id-ID')} · Pembayaran diterima: Rp{project.paidNumeric.toLocaleString('id-ID')}</p>
      <div className="flex flex-wrap gap-2"><button className="pill-black" onClick={() => focus(project)}>Mulai fokus</button><button className="pill-white" onClick={() => onSelectTab('lanes')}>Buka board</button></div>
      {state.todayBlocks.filter(block => projectIdFor(block, state.projects) === project.id).map(block => <label key={block.id} className="flex gap-2 text-sm"><input type="checkbox" checked={block.isDone} onChange={() => onToggleBlock?.(block.id)} />{block.action}</label>)}
    </article>)}
    {!projects.length && <div className="bento-card p-6 space-y-3"><p>Belum ada pekerjaan untuk filter ini.</p><button className="pill-white" onClick={() => onSelectTab('lanes')}>Buka board project</button><button className="pill-white" onClick={() => onSelectTab('waiting')}>Cek radar</button></div>}
  </section>;
};
