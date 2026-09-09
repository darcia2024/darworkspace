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
      <div className="bento-card p-5 sm:p-6 bg-white border border-zinc-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ea580c]" />
            <h3 className="text-xl font-extrabold text-[#111111] tracking-tight font-sans">
              <span className="lead-italic font-normal">Radar Tagihan:</span> Siapa Aja yang Masih Nahan Duit?
            </h3>
            <span className="sticker-pill sticker-yellow text-[9px]">{waitingItems.length} ITEMS ACTIVE</span>
          </div>
          <p className="text-xs text-zinc-800 font-medium font-sans mt-1">
            Pantau klien yang belum transfer atau belum kasih feedback biar gak kelupaan ditagih.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="pill-black flex items-center gap-2 text-xs font-semibold shadow-md"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ Catat Tagihan / Klien</span>
        </button>
      </div>

      {/* Add Inline Form */}
      {isAdding && (
        <div className="bento-card p-6 bg-white border border-zinc-200 shadow-lg space-y-4 animate-slide-up font-mono text-xs">
          <h4 className="text-base font-extrabold text-[#111111] font-sans">Catat Siapa yang Lagi Ditungguin</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-800 font-medium mb-1">Client / Project</label>
              <input
                type="text"
                placeholder="Contoh: Website Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-black font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-800 font-medium mb-1">Reason / Menunggu Apa</label>
              <input
                type="text"
                placeholder="Contoh: Menunggu approval modul"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-black font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-800 font-medium mb-1">Value / Potensi Kas</label>
              <input
                type="text"
                placeholder="Contoh: Rp2.000.000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-black font-sans"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              onClick={() => setIsAdding(false)}
              className="pill-white px-4 py-2 text-zinc-900 font-semibold text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="pill-black px-5 py-2 text-xs font-semibold shadow-sm"
            >
              Save Item
            </button>
          </div>
        </div>
      )}

      {/* Waiting Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {waitingItems.map((item, idx) => {
          const itemThemes = [
            { bg: 'bento-apricot', border: 'border-[#fed7aa]', sticker: 'sticker-apricot' },
            { bg: 'bento-blue', border: 'border-[#bae6fd]', sticker: 'sticker-blue' },
            { bg: 'bento-pink', border: 'border-[#fbcfe8]', sticker: 'sticker-pink' },
            { bg: 'bento-lime', border: 'border-[#d9f99d]', sticker: 'sticker-lime' },
          ];
          const theme = itemThemes[idx % itemThemes.length];

          return (
            <div
              key={item.id}
              className={`bento-card ${theme.bg} border ${theme.border} p-5 transition-all hover:-translate-y-0.5 hover:shadow-md h-full flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`sticker-pill ${theme.sticker} text-[9px]`}>
                      {item.status.toUpperCase()}
                    </span>
                    <h4 className="text-base font-extrabold text-[#111111] mt-2 tracking-tight font-sans">{item.name}</h4>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 bg-white/80 border border-black/5 px-2.5 py-1 rounded-full font-mono shadow-xs">
                    {item.value}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 border border-black/5 text-xs space-y-1.5 font-mono">
                  <div className="text-zinc-900 font-semibold">
                    <span className="font-bold text-zinc-900 font-sans">Alasan:</span> {item.reason}
                  </div>
                  {item.actionToUnblock && (
                    <div className="text-[#c2410c]">
                      <span className="font-bold font-sans">Next Action:</span> {item.actionToUnblock}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleQuickCopy(item)}
                    className="p-2 rounded-full bg-white text-zinc-700 hover:text-black border border-black/5 shadow-xs transition-colors"
                    title="Copas quick message"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-[#15803d]" />
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
                      className="px-3 py-1.5 rounded-full bg-white text-[#c2410c] border border-black/5 shadow-xs hover:bg-zinc-50 transition-colors flex items-center gap-1 font-semibold"
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
                  className="px-3.5 py-1.5 rounded-full bg-[#ecfccb] hover:bg-[#d9f99d] text-[#15803d] border border-[#d9f99d] font-bold transition-colors shadow-xs"
                >
                   Beres
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
