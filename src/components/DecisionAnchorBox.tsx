import React from 'react';
import { ProjectCard } from '../types';
import { actionableProjects } from '../utils/selectors';

export const DecisionAnchorBox: React.FC<{ projects: ProjectCard[]; onSelectAction: (project: ProjectCard) => void }> = ({ projects, onSelectAction }) => {
  const candidates = actionableProjects(projects).slice(0, 3);
  return <section className="bento-card p-6 space-y-4">
    <h3 className="font-bold text-lg">Bingung mulai dari mana?</h3>
    <p className="text-sm text-zinc-600">Urutan berdasarkan prioritas, pekerjaan berjalan, dan client yang sudah membayar.</p>
    {candidates.map((project, index) => <button key={project.id} onClick={() => onSelectAction(project)} className="block w-full text-left p-4 border rounded-xl hover:bg-zinc-50">
      <strong>{index + 1}. {project.name}</strong><span className="block text-sm mt-1">{project.nextAction || 'Tentukan next action di board'}</span>
    </button>)}
    {!candidates.length && <p className="text-sm">Tidak ada project dalam Doing atau Queue. Cek radar untuk membuka pekerjaan yang tertahan.</p>}
  </section>;
};
