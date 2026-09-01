import React from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Clock, 
  FileText
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BottomFloatingDockProps {
  onOpenFollowUp: () => void;
  onOpenCopilot: () => void;
  onOpenFocusStudio: () => void;
  onOpenExport: () => void;
  onSelectTab: (tab: string) => void;
}

export const BottomFloatingDock: React.FC<BottomFloatingDockProps> = ({
  onOpenFollowUp,
  onOpenCopilot,
  onOpenFocusStudio,
  onOpenExport,
  onSelectTab
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-40 animate-fade-in font-sans">
      <div className="floating-dock p-2 rounded-full flex items-center gap-2 shadow-2xl border border-white/15">
        
        {/* Button 1: Copas WA */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenFollowUp();
          }}
          className="w-10 h-10 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center transition-transform active:scale-95 shadow-md"
          title="1-Click Copas Follow-up WA"
        >
          <MessageSquare className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Button 2: Partner Copilot */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenCopilot();
          }}
          className="w-10 h-10 rounded-full bg-[#1c1c24] hover:bg-[#282834] text-white flex items-center justify-center transition-transform active:scale-95 border border-white/10"
          title="Partner Copilot (⌘K)"
        >
          <Sparkles className="w-4 h-4 text-zinc-200" />
        </button>

        {/* Button 3: Focus Studio Pomodoro */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenFocusStudio();
          }}
          className="w-10 h-10 rounded-full bg-[#1c1c24] hover:bg-[#282834] text-white flex items-center justify-center transition-transform active:scale-95 border border-white/10"
          title="Flow Lock Timer"
        >
          <Clock className="w-4 h-4 text-zinc-200" />
        </button>

        {/* Button 4: Obsidian Export */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenExport();
          }}
          className="w-10 h-10 rounded-full bg-[#1c1c24] hover:bg-[#282834] text-zinc-300 hover:text-white flex items-center justify-center transition-transform active:scale-95 border border-white/10"
          title="Obsidian Sync"
        >
          <FileText className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
