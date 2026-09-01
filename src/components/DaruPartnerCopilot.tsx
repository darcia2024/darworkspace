import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { FinancialReport } from '../types';

interface DaruPartnerCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
  financialReport?: FinancialReport;
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
  financialReport
}) => {
  const totalBal = financialReport?.totalLiquidBalance || 6844233;
  const isRed = totalBal < (financialReport?.hardFloor || 4000000);
  const runwayDays = financialReport?.runwayDays || 46;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'partner',
      text: `Sip Bro Daru! Lo lagi lock-in di 3 eksekusi utama sekarang:

1. 🟡 Zalvice Logo — Selesaiin 2 konsep awal logo + mockup buat Bang Edo (Paid Rp1,2M).
2. 🟡 Kasir Barber Underrated — DP Rp3.000.000 SUDAH MASUK! Fokus eksekusi Fase 0 Opening 30 Agu (POS kasir & struk WA).
3. 🟡 Umi Elly LMS — Sudah Deal Rp7.000.000 (3x bayar)! Siap kickoff setelah transfer Termin 1 (Rp3jt) masuk.
4. ⚙️ Setting KAEL Core — Config core product, role kasir vs owner, QRIS static flow & tenant demo.

${isRed 
  ? '🔴 RED MODE: Saldo Rp3,95M (< Rp4M Floor). Jaga cash defense!' 
  : `🟡 YELLOW MODE (STAGE 2 ACHIEVED): Saldo Rp${(totalBal/1000000).toFixed(2).replace('.', ',')}M (Aman di atas Hard Floor Rp4M). Runway aman ±${runwayDays} Hari!`}`,
      timestamp: 'now',
      ruleTag: 'ACTIVE_TRIAD'
    }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    { label: isRed ? '🔴 Status Finansial & Red Mode' : '🟡 Status Finansial & Safe Buffer', query: 'Jelasin status keuangan, saldo likuid, dan roadmap kas gue saat ini.' },
    { label: 'Eksekusi Zalvice Logo', query: 'Gimana checklist DoD buat 2 konsep logo Zalvice Bang Edo?' },
    { label: 'Eksekusi Kasir Barber Underrated', query: 'Apa aja flow kasir POS & membership di Barber Underrated yang harus beres?' },
    { label: 'Checklist Setting KAEL', query: 'Apa aja settingan core product KAEL yang perlu diberesin hari ini?' },
    { label: 'Urutan eksekusi project hari ini', query: 'Bagi waktu terbaik buat Zalvice, Barber Underrated, dan Setting KAEL hari ini.' }
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;
    soundManager.playClick();

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: 'just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let partnerReply = '';
      let tag = 'STRATEGY';

      const lower = query.toLowerCase();

      if (lower.includes('finansial') || lower.includes('uang') || lower.includes('red mode') || lower.includes('aset') || lower.includes('saldo') || lower.includes('pengeluaran') || lower.includes('burn') || lower.includes('runway') || lower.includes('yellow')) {
        tag = 'CASH_RECOVERY_STAGE_2';
        partnerReply = `🟡 STATUS FINANSIAL & RUNWAY (29 AGUSTUS 2026 LIVE):
• Saldo Likuid Real: Rp${(totalBal/1000000).toFixed(2).replace('.', ',')}M.
• Status Mode: 🟡 YELLOW MODE — RECOVERY STAGE 2 ACHIEVED!
• Posisi Hard Floor: ${isRed ? 'Di bawah batas' : 'Aman di atas batas'} Hard Floor (Rp${(financialReport?.hardFloor || 4000000)/1000000}M).

🔥 MONTHLY BURN & RUNWAY:
• Fixed Minimum Burn: Rp2.665.000/bln (Uang istri Rp1M, Rumah Mesir Rp500k, Kuota Rp200k, AI Tools Rp965k).
• Real Monthly Burn: ~Rp4.500.000/bln.
• Daya Tahan Runway: ±${runwayDays} HARI (~1.52 BULAN).

🎯 ROADMAP TARGET BERIKUTNYA:
1. Stage 2 (DP Barber Rp3M): TERCAPAI ✓.
2. Stage 3 (Termin 1 Umi Elly Rp3M): OTW ➔ Saldo akan naik.
3. Stage 4 (Safe Growth Zone): Target +Rp10 Juta Masuk Tiap Bulan.

⚡ STRATEGI HARI INI: Fokus delivery Opening Barber (30 Agu) + Siapkan modul LMS Umi Elly untuk kickoff!`;
      } else if (lower.includes('zalvice')) {
        tag = 'DELIVERY_P1';
        partnerReply = `Checklist DoD Zalvice Logo (Bang Edo):
1. Konsep Arah 1: Modern minimalist / sharp tech mark.
2. Konsep Arah 2: Distinct monogram / geometric symbol.
3. Mockup Sederhana: Terapkan di 2 media (App icon / dark background & merchandise/signage).
4. Export: PDF/PNG preview clean, kirim via WA ke Bang Edo.`;
      } else if (lower.includes('barber') || lower.includes('underrated')) {
        tag = 'BARBER_POS_FLOW';
        partnerReply = `Alur Kasir Barber Underrated yang perlu difinalkan:
1. Flow Transaksi Kasir POS: Pilih kapster/barber → pilih service (haircut/treatment) → add-on produk → hitung komisi otomatis.
2. Membership & Tiering: Input no HP member → diskon / point loyalty bertambah otomatis.
3. Payment Gateway / Split: Cash, QRIS, Transfer.
4. Action Administrasi: Kirim dokumen alur ini bareng Invoice DP 50% (Rp3.000.000) ke client agar jadwal sprint kickoff langsung terkunci!`;
      } else if (lower.includes('kael') || lower.includes('setting')) {
        tag = 'KAEL_CORE_CONFIG';
        partnerReply = `Checklist Setting KAEL Core Product:
1. Role Isolation: Kasir cuma bisa buka POS / order, dilarang akses Owner Dashboard/HPP.
2. Staff Sync: Login kasir/staff tersinkron langsung ke Staff Management tenant.
3. Order Flow: Dine-in / Takeaway / Delivery flow konsisten, self-order dine-in jangan bayar dobel.
4. QRIS Flow: Konfirmasi manual static QRIS lancar.
5. Demo Tenant: Siapkan dummy data percetakan & F&B siap presentasi.`;
      } else if (lower.includes('bagi waktu') || lower.includes('urutan')) {
        tag = 'TIME_BLOCK_TRIAD';
        partnerReply = `Pembagian waktu 3 Fokus Hari Ini:

• Slot 1 (Pagi - 90m): Zalvice Logo → Selesaiin 2 konsep & kirim ke Bang Edo. (Utang deliverable lunas).
• Slot 2 (Siang - 60m): Kasir Barber Underrated → Rapiin flow kasir POS + kirim invoice DP 50%.
• Slot 3 (Sore - 45m): Setting KAEL → Beresin role kasir & test tenant demo.

Malam tinggal pantau respon Bang Edo & client Barber!`;
      } else {
        tag = 'TRIAD_FOCUS';
        partnerReply = `Ingat 3 pilar hari ini:
1. Zalvice Logo (Selesaiin draft)
2. Kasir Barber Underrated (Rapiin flow kasir & DP 50%)
3. Setting KAEL (Config core product & role kasir)`;
      }

      const partnerMsg: Message = {
        id: `p-${Date.now()}`,
        sender: 'partner',
        text: partnerReply,
        timestamp: 'just now',
        ruleTag: tag
      };

      setMessages((prev) => [...prev, partnerMsg]);
      soundManager.playCompletionChime();
    }, 400);
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
