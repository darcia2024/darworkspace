import React, { useState } from 'react';
import { 
  MessageSquare, 
  X, 
  Copy, 
  Check, 
  ExternalLink
} from 'lucide-react';
import { ProjectCard, WaitingItem } from '../types';
import { soundManager } from '../utils/audio';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject?: ProjectCard | WaitingItem | null;
  allProjects: ProjectCard[];
  allWaitingItems: WaitingItem[];
}

type ToneType = 'formal' | 'santai' | 'islamic' | 'payment_reminder';

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  selectedProject,
  allProjects,
  allWaitingItems
}) => {
  const [activeItemName, setActiveItemName] = useState<string>(selectedProject?.name || allProjects[0]?.name || allWaitingItems[0]?.name || '');
  const [tone, setTone] = useState<ToneType>('santai');
  const [customClientName, setCustomClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Sync selected project if opened from a specific card
  React.useEffect(() => {
    if (isOpen) {
      const initialName = selectedProject?.name || allProjects[0]?.name || allWaitingItems[0]?.name || '';
      setActiveItemName(initialName);
      setCopied(false);
      const proj = allProjects.find(p => p.name === initialName);
      const wait = allWaitingItems.find(w => w.name === initialName);
      setClientPhone(proj?.clientPhone || wait?.clientPhone || '');
    }
  }, [selectedProject, isOpen, allProjects, allWaitingItems]);

  const handleProjectChange = (name: string) => {
    setActiveItemName(name);
    const proj = allProjects.find(p => p.name === name);
    const wait = allWaitingItems.find(w => w.name === name);
    setClientPhone(proj?.clientPhone || wait?.clientPhone || '');
  };

  if (!isOpen) return null;

  const getFollowUpTemplate = (targetName: string, selectedTone: ToneType, clientNameInput: string) => {
    const client = clientNameInput.trim() || 'Bapak/Ibu';
    const project = allProjects.find(item => item.name === targetName);
    const waiting = allWaitingItems.find(item => item.name === targetName);
    const greeting = selectedTone === 'islamic' ? "Assalamu'alaikum" : selectedTone === 'formal' ? 'Selamat pagi/siang' : 'Halo';
    if (!targetName) return 'Pilih project atau tambahkan item radar dahulu.';
    const request = selectedTone === 'payment_reminder'
      ? project ? (project.unpaidNumeric > 0 ? `Menurut catatan kami, sisa tagihan project ${targetName} adalah Rp${project.unpaidNumeric.toLocaleString('id-ID')}. Mohon konfirmasi jadwal pembayaran atau kabari jika sudah ditransfer.` : `Pembayaran project ${targetName} sudah tercatat lunas. Terima kasih atas kerja samanya.`)
        : `Izin konfirmasi status pembayaran untuk ${targetName}. Mohon kabari perkembangan terakhirnya.`
      : `Izin menindaklanjuti project ${targetName}. ${waiting?.actionToUnblock || project?.nextAction || 'Apakah ada perkembangan yang bisa dikonfirmasi?'}`;
    return `${greeting} ${client},\n\n${request}\n\nTerima kasih.`;
  };

  const messageText = getFollowUpTemplate(activeItemName, tone, customClientName);

  const handleCopy = async () => {
    soundManager.playClick();
    try { await navigator.clipboard.writeText(messageText); }
    catch { alert('Clipboard tidak tersedia. Salin teks pesan secara manual.'); return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    soundManager.playClick();
    const encoded = encodeURIComponent(messageText);
    const digits = clientPhone.replace(/\D/g, '');
    const cleanPhone = digits.startsWith('0') ? '62' + digits.slice(1) : digits;
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const uniqueNames = Array.from(new Set([...allProjects.map(p => p.name), ...allWaitingItems.map(w => w.name)]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-[#0e0e12] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-white font-mono text-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white tracking-tight">Follow-up Message Generator</h3>
                <span className="mono-tag text-[9px]">1-CLICK_COPAS</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">// Siap kirim ke WhatsApp / Chat Client</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Tutup modal follow up" className="p-1 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings: Target Project, Panggilan, & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Target Client Dropdown */}
          <div>
            <label className="block text-[11px] text-zinc-400 font-mono mb-1">
              // Pilih Client / Project:
            </label>
            <select
              value={activeItemName}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              {uniqueNames.map(name => (
                <option key={name} value={name} className="bg-[#121215] text-white">
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Client Name / Panggilan */}
          <div>
            <label className="block text-[11px] text-zinc-400 font-mono mb-1">
              // Nama / Panggilan:
            </label>
            <input
              type="text"
              placeholder="Contoh: Mas / Bapak / Ibu"
              value={customClientName}
              onChange={(e) => setCustomClientName(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono placeholder-zinc-600"
            />
          </div>

          {/* Client Phone Number */}
          <div>
            <label className="block text-[11px] text-zinc-400 font-mono mb-1">
              // No. WhatsApp (Opsional):
            </label>
            <input
              type="tel"
              placeholder="0812xxxx / 62812xxxx"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono placeholder-zinc-600"
            />
          </div>

        </div>

        {/* Tone Selector Pills */}
        <div className="space-y-1.5">
          <label className="block text-[10px] text-zinc-400 font-mono uppercase">
            // Gaya Bahasa / Tone:
          </label>
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            <button
              onClick={() => { soundManager.playClick(); setTone('santai'); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                tone === 'santai' ? 'bg-white text-zinc-950 font-semibold' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              Santai & Akrab
            </button>
            <button
              onClick={() => { soundManager.playClick(); setTone('formal'); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                tone === 'formal' ? 'bg-white text-zinc-950 font-semibold' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              Sopan & Formal
            </button>
            <button
              onClick={() => { soundManager.playClick(); setTone('islamic'); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                tone === 'islamic' ? 'bg-white text-zinc-950 font-semibold' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              Salam Santun (Islamic)
            </button>
            <button
              onClick={() => { soundManager.playClick(); setTone('payment_reminder'); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                tone === 'payment_reminder' ? 'bg-amber-400 text-zinc-950 font-semibold' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              Payment / Kickoff DP
            </button>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="relative">
          <div className="p-4 rounded-xl bg-black/70 border border-white/10 font-sans text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed min-h-[140px] max-h-[220px] overflow-y-auto">
            {messageText}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <p className="text-[11px] text-zinc-500 font-mono">
            Tersimpan langsung untuk siap paste ke WA.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{clientPhone.trim() ? 'Chat WA Langsung' : 'Buka WA Web'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl mono-btn-primary text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'SALIN PESAN'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
