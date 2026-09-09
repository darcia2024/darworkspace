import React from 'react';
import { Target, Layers, Edit3, DollarSign } from 'lucide-react';
import { ActiveTabType } from '../types';
import { soundManager } from '../utils/audio';

interface BottomFloatingDockProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
}

export const BottomFloatingDock: React.FC<BottomFloatingDockProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const navItems: { id: ActiveTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'Hari Ini', icon: Target },
    { id: 'lanes', label: 'Markas', icon: Layers },
    { id: 'updates', label: 'Laporan', icon: Edit3 },
    { id: 'money', label: 'Dompet', icon: DollarSign },
  ];

  return (
    <nav
      aria-label="Navigasi cepat mobile"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden animate-fade-in pointer-events-auto"
    >
      <div className="bg-[#111111]/95 backdrop-blur-md px-3 py-2 rounded-full flex items-center gap-1.5 shadow-2xl border border-white/15 text-white">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(item.id);
              }}
              aria-label={item.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-[#111111] shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {isActive && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
