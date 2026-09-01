import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Copy, 
  Check
} from 'lucide-react';
import { DaruWorkOSState } from '../types';
import { soundManager } from '../utils/audio';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: DaruWorkOSState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  state
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    return `# Daru Work OS — ${todayStr}

## Hari ini gue harus ngejar apa?
${state.todayPursuit.map(p => `- ${p.isDone ? '[x]' : '[ ]'} **${p.project}** — ${p.action}`).join('\n')}

---

## 4 Fokus Terbesar Saat Ini
1. Lunasin utang deliverable Zalvice + Laptopbisnis (Rp1,2M Paid)
2. Siapkan masuknya Barber Rp6 jt & Umi Elly Rp7 jt
3. Mulai beneran jual KAEL offline (3-5 pilot customer)
4. Tetap hunting Upwork tanpa mengganggu delivery

---

## Quick Stats
- Paid Client Active: **${state.quickStats.paidClientActive}** (Zalvice, Laptopbisnis)
- Waiting Payment/Kickoff: **${state.quickStats.waitingPaymentKickoff}** (Barber POS, Umi Elly, Bedug, dll.)
- Maintenance Open: **${state.quickStats.maintenanceOpen}** (Markaz Fiqih)
- Sales & Own Product: **${state.quickStats.salesAndProductActive}** (KAEL Marketing, Upwork, KAEL Product)

---

## Today Focus Blocks
${state.todayBlocks.map(b => `### [${b.isDone ? 'x' : ' '}] ${b.blockType} — ${b.projectName}
- Action: ${b.action}
- Timebox: ${b.timeboxMinutes} menit
- Rule: ${b.rule}`).join('\n\n')}

---

## Board Status (Doing, Queue, Waiting, Parked)
${state.projects.map(p => `### [${p.boardColumn}] ${p.name} (${p.lane.toUpperCase()}) — ${p.priority} | ${p.paymentStatus}
- Status: ${p.status}
- Value: ${p.valueText}
- Current Goal: ${p.currentGoal}
- Next Action: ${p.nextAction}
- Definition of Done: ${p.definitionOfDone || '-'}`).join('\n\n')}

---

## Waiting Radar
${state.waitingItems.map(w => `- **${w.name}** (${w.value}): ${w.reason} → Unblock: ${w.actionToUnblock}`).join('\n')}

---

## Kalau Gue Bingung Mau Ngerjain Apa:
1. Ada client yang sudah bayar dan masih nunggu? → **Kerjain itu.** (Zalvice & Laptopbisnis)
2. Ada project besar yang tinggal kickoff? → **Siapkan scope & amankan DP.** (Barber POS & Umi Elly LMS)
3. Ada sales activity yang bisa menghasilkan uang? → **Kerjain.** (KAEL Offline Demo / Upwork)
4. Maintenance gratis? → **Timebox maksimal 1-2 jam.** (Markaz Fiqih - jangan makan slot berbayar)
5. Own product? → **Kerjain cuma kalau mendukung penjualan.** (KAEL Product)

> Golden Rule: Zalvice + Laptopbisnis harus beres dulu. Barber siap masuk setelah kickoff. KAEL tetap jalan tiap hari tapi cukup lewat satu blok marketing. Markaz jangan dikasih ruang lebih besar dari value-nya. Temantiket jangan masuk daily deep-work kecuali ada order/issue konkret.
`;
  };

  const markdownContent = generateMarkdown();

  const handleCopy = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-[#0e0e12] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col justify-between">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Daru Work OS — Obsidian Sync</h3>
              <p className="text-[11px] text-zinc-400 font-mono">// Ready to paste to Today.md</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {markdownContent}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <p className="text-[11px] text-zinc-400 font-mono">
            Vault Path: <code className="text-white">00 Dashboard/Today.md</code>
          </p>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 mono-btn-primary text-xs font-semibold shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY_MARKDOWN'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
