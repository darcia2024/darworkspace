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
    <div className="space-y-6 font-sans animate-fade-in select-none">
      
      {/* Header */}
      <div className="figma-shell">
        <div className="figma-core p-4 sm:p-5 bg-[#fffdf5] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#925f18]" />
              <h3 className="text-base font-bold text-[#252520] tracking-tight">Waiting View & Pipeline Radar</h3>
              <span className="dev-tag text-[9px]">{waitingItems.length} ITEMS ACTIVE</span>
            </div>
            <p className="text-xs text-[#59594f] font-mono mt-0.5">
              // External dependencies: Umi Elly (Termin 2 Rp2M), Bedug (Rp2.2M), Teh Umi, El Massa, Ar-Ruwad, Watra
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-4 py-2 dev-btn-primary text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Waiting Item</span>
          </button>
        </div>
      </div>

      {/* Add Inline Form */}
      {isAdding && (
        <div className="p-5 rounded-2xl bg-[#fffdf5] border border-[#ded7c8] shadow-md space-y-3 animate-slide-up font-mono text-xs">
          <h4 className="text-sm font-bold text-[#252520] font-sans">Tambah Item Antrian Eksternal</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[#59594f] mb-1">Client / Project</label>
              <input
                type="text"
                placeholder="Contoh: Barber POS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#faf9f3] border border-[#ded7c8] rounded-xl px-3 py-2 text-xs text-[#252520] focus:outline-none focus:border-[#292a24]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#59594f] mb-1">Reason / Menunggu Apa</label>
              <input
                type="text"
                placeholder="Contoh: Menunggu approval modul"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#faf9f3] border border-[#ded7c8] rounded-xl px-3 py-2 text-xs text-[#252520] focus:outline-none focus:border-[#292a24]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#59594f] mb-1">Value / Potensi Kas</label>
              <input
                type="text"
                placeholder="Contoh: Rp2.000.000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-[#faf9f3] border border-[#ded7c8] rounded-xl px-3 py-2 text-xs text-[#252520] focus:outline-none focus:border-[#292a24]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#ded7c8]">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-xl bg-[#faf9f3] text-[#59594f] text-xs hover:bg-[#eae5d8] border border-[#ded7c8] font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-1.5 rounded-xl dev-btn-primary text-xs font-semibold shadow-sm"
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
            className="figma-shell hover:border-[#928876] transition-all"
          >
            <div className="figma-core p-5 bg-[#fffdf5] h-full flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="dev-tag text-[9px]">
                      {item.status.toUpperCase()}
                    </span>
                    <h4 className="text-base font-bold text-[#252520] mt-1.5 tracking-tight">{item.name}</h4>
                  </div>
                  <span className="text-xs font-bold text-[#305d46] bg-[#e2ecdc] border border-[#305d46]/30 px-2.5 py-1 rounded-lg font-mono">
                    {item.value}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#faf9f3] border border-[#ded7c8] text-xs space-y-1 font-mono">
                  <div className="text-[#59594f]">
                    <span className="font-bold text-[#252520]">Alasan:</span> {item.reason}
                  </div>
                  {item.actionToUnblock && (
                    <div className="text-[#925f18]">
                      <span className="font-bold">Next Action:</span> {item.actionToUnblock}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#ded7c8] flex items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleQuickCopy(item)}
                    className="p-1.5 rounded-lg bg-[#faf9f3] hover:bg-[#eae5d8] text-[#59594f] hover:text-[#252520] border border-[#ded7c8] transition-colors"
                    title="Copas quick message"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-[#305d46]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {onOpenFollowUpModal && (
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onOpenFollowUpModal(item);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#ffb99f]/30 hover:bg-[#ffb99f]/60 text-[#814637] border border-[#ffb99f] transition-colors flex items-center gap-1 font-medium"
                      title="Buka generator pesan follow-up"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WA Draft</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    onResolveItem(item.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#e2ecdc] hover:bg-[#d5e4cf] text-[#305d46] border border-[#305d46]/30 font-bold transition-colors"
                >
                  ✓ Beres
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
