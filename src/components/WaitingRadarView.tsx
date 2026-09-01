import React, { useState } from 'react';
import { 
  Clock, 
  Copy, 
  Check, 
  Plus,
  MessageSquare
} from 'lucide-react';
import { WaitingItem } from '../types';
import { soundManager } from '../utils/audio';

interface WaitingRadarViewProps {
  waitingItems: WaitingItem[];
  onAddWaitingItem: (item: Omit<WaitingItem, 'id'>) => void;
  onResolveItem: (id: string) => void;
  onOpenFollowUpModal?: (item: WaitingItem) => void;
}

export const WaitingRadarView: React.FC<WaitingRadarViewProps> = ({
  waitingItems,
  onAddWaitingItem,
  onResolveItem,
  onOpenFollowUpModal
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [value, setValue] = useState('');
  const [action, setAction] = useState('');

  const handleQuickCopy = (item: WaitingItem) => {
    soundManager.playClick();
    const text = `Halo ${item.name}, izin menanyakan kelanjutan progress: ${item.reason}. Kabari ya.`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    soundManager.playClick();
    onAddWaitingItem({
      name: name.trim(),
      reason: reason.trim() || 'Waiting feedback / payment',
      value: value.trim() || 'TBD',
      nextTrigger: 'Follow-up / Confirmation',
      actionToUnblock: action.trim() || 'Kirim pesan follow-up santai',
      followUpDate: 'Hari ini',
      status: 'Waiting Payment'
    });
    setIsAdding(false);
    setName('');
    setReason('');
    setValue('');
    setAction('');
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white tracking-tight">Waiting View & Pipeline Radar</h3>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            // External dependencies: Barber POS (Rp6M), Umi Elly (Rp7M), Bedug (Rp2.2M), Teh Umi, El Massa, Ar-Ruwad, Watra
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 mono-btn-primary text-xs font-semibold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Waiting Item</span>
        </button>
      </div>

      {/* Add Inline Form */}
      {isAdding && (
        <div className="p-5 rounded-xl bg-[#141418] border border-white/20 shadow-2xl space-y-3 animate-slide-up">
          <h4 className="text-sm font-semibold text-white">Add New Waiting Item</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 font-mono mb-1">Client / Project</label>
              <input
                type="text"
                placeholder="Contoh: Barber POS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 font-mono mb-1">Reason</label>
              <input
                type="text"
                placeholder="Contoh: Menunggu DP 50%"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 font-mono mb-1">Value</label>
              <input
                type="text"
                placeholder="Contoh: Rp6.000.000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-1.5 rounded-xl mono-btn-primary text-xs font-semibold"
            >
              Save Item
            </button>
          </div>
        </div>
      )}

      {/* Waiting Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {waitingItems.map((item) => (
          <div
            key={item.id}
            className="mono-card p-5 bg-[#111115] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="mono-tag">
                    {item.status.toUpperCase()}
                  </span>
                  <h4 className="text-base font-semibold text-white mt-1.5 tracking-tight">{item.name}</h4>
                </div>
                <span className="text-xs text-amber-300 font-mono bg-black/60 px-2.5 py-1 rounded-lg border border-white/5 whitespace-nowrap">
                  {item.value}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-xs space-y-1">
                <p className="text-zinc-300">
                  <span className="text-zinc-400 font-mono">Blocked on:</span> {item.reason}
                </p>
                <p className="text-zinc-400 text-[11px] font-mono">
                  Trigger: <span className="text-zinc-200">{item.nextTrigger}</span>
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#16161c] border border-white/10 text-xs space-y-0.5">
                <p className="text-white font-mono uppercase font-semibold text-[11px]">Unblock Action:</p>
                <p className="text-zinc-300 text-xs font-normal">{item.actionToUnblock}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              {onOpenFollowUpModal ? (
                <button
                  onClick={() => onOpenFollowUpModal(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 text-xs border border-white/10 transition-all font-mono"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>COPAS PESAN WA</span>
                </button>
              ) : (
                <button
                  onClick={() => handleQuickCopy(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs border border-white/10 transition-all font-mono"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === item.id ? 'COPIED' : 'COPY_FOLLOWUP'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  soundManager.playClick();
                  onResolveItem(item.id);
                }}
                className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
              >
                [RESOLVE]
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
