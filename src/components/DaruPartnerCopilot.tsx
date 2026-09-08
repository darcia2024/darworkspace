import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { FinancialReport, ProjectCard } from '../types';
import { actionableProjects } from '../utils/selectors';

interface DaruPartnerCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
  financialReport?: FinancialReport;
  projects: ProjectCard[];
}

interface Message {
  id: string;
  sender: 'partner' | 'user';
  text: string;
  timestamp: string;
  ruleTag?: string;
}

export const DaruPartnerCopilot: React.FC<DaruPartnerCopilotProps> = ({
  isOpen,
  onClose,
  financialReport,
  projects
}) => {
  const totalBal = financialReport?.totalLiquidBalance ?? 0;
  const isRed = totalBal < (financialReport?.hardFloor ?? 4000000);
  const runwayDays = financialReport?.runwayDays ?? 0;
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome', sender: 'partner',
    text: 'Partner ini memakai aturan lokal dan data workspace, tanpa model AI. Tanyakan saldo atau urutan project untuk melihat ringkasan terbaru.',
    timestamp: 'now', ruleTag: 'LOCAL_RULES',
  }]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    { label: 'Status keuangan', query: 'Berapa saldo dan runway sekarang?' },
    { label: 'Urutan project', query: 'Project mana yang perlu dikerjakan?' },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;
    const financial = /saldo|uang|runway|kas|finansial|burn/i.test(query);
    const candidates = actionableProjects(projects);
    const reply = financial
      ? `Saldo likuid: Rp${totalBal.toLocaleString('id-ID')}.\nStatus: ${financialReport?.modeStatus || 'Belum tersedia'}.\nBeban bulanan estimasi: Rp${(financialReport?.estimatedRealBurn ?? 0).toLocaleString('id-ID')}.\nRunway berdasarkan estimasi pengeluaran: ${financialReport?.estimatedRealBurn ? `${runwayDays} hari` : 'Belum bisa dihitung'}.`
      : candidates.length ? candidates.slice(0, 5).map((project, index) => `${index + 1}. ${project.name} [${project.priority}, ${project.status}]\n   ${project.nextAction || 'Tentukan next action di board.'}`).join('\n\n') : 'Tidak ada project dalam Doing atau Queue. Cek Waiting Radar untuk membuka blocker.';
    setMessages(previous => [...previous, { id: crypto.randomUUID(), sender: 'user', text: query, timestamp: 'now' }, { id: crypto.randomUUID(), sender: 'partner', text: reply, timestamp: 'now', ruleTag: 'WORKSPACE_SNAPSHOT' }]);
    setInputText('');
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-[#0c0c0f] border-l border-white/10 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 font-sans">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#121216]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-white font-mono text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Partner Copilot</h3>
            <p className="text-[11px] text-zinc-400 font-mono">// Active Triad Support</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            {m.ruleTag && (
              <span className="mono-tag text-[9px]">
                {m.ruleTag}
              </span>
            )}
            <div
              className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-white text-zinc-950 rounded-br-none font-medium shadow-sm'
                  : 'bg-[#18181e] text-zinc-200 rounded-bl-none border border-white/10 font-normal'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>
            </div>
            <span className="text-[10px] text-zinc-500 px-1 font-mono">{m.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Quick Questions */}
      <div className="p-3 border-t border-white/5 bg-[#121216] space-y-2 font-mono">
        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
          // Quick Triad Query:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="text-[11px] font-sans px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:text-white text-zinc-400 border border-white/5 transition-all text-left"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3.5 border-t border-white/10 bg-[#09090b] flex items-center gap-2">
        <input
          type="text"
          placeholder="Tanya strategi Zalvice, Barber, atau KAEL..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white font-mono"
        />
        <button
          onClick={() => handleSendMessage()}
          className="p-2 rounded-xl mono-btn-primary"
        >
          <Send className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

    </aside>
  );
};
