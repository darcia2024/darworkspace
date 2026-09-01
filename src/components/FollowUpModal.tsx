import React, { useState } from 'react';
import { 
  MessageSquare, 
  X, 
  Copy, 
  Check, 
  Send, 
  Sparkles,
  ExternalLink,
  Phone,
  RefreshCw
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
  const [activeItemName, setActiveItemName] = useState<string>(selectedProject?.name || 'Barber POS / Membership System');
  const [tone, setTone] = useState<ToneType>('santai');
  const [customClientName, setCustomClientName] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Sync selected project if opened from a specific card
  React.useEffect(() => {
    if (selectedProject) {
      setActiveItemName(selectedProject.name);
    }
  }, [selectedProject]);

  if (!isOpen) return null;

  // Preset smart message templates for each of Daru's real clients
  const getFollowUpTemplate = (targetName: string, selectedTone: ToneType, clientNameInput: string) => {
    const client = clientNameInput.trim() || 'Pak/Mas/Mba';

    // 1. Barber Underrated POS & Membership
    if (targetName.toLowerCase().includes('barber')) {
      if (selectedTone === 'formal') {
        return `Selamat pagi/siang ${client},\n\nIzin menyampaikan progress report pengerjaan sistem POS Kasir & Membership Barber Underrated.\n\nModul transaksi kasir multi-metode bayar (Tunai/QRIS/EDC) dan kirim struk WhatsApp cepat sudah siap untuk mendukung Opening outlet besok Minggu, 30 Agustus 2026.\n\nKira-kira apakah ada penyesuaian daftar layanan atau harga sebelum kita live? Terima kasih banyak.`;
      }
      if (selectedTone === 'payment_reminder') {
        return `Halo ${client},\n\nIzin update bahwa Fase 2 (Aplikasi Member PWA 5 Tab) Barber Underrated sudah selesai dan siap digunakan pelanggan.\n\nSesuai kesepakatan termin kontrak kita, ini kami lampirkan invoice untuk Termin ke-2 (30% / Rp 1.800.000) ya. Terima kasih banyak atas kerjasamanya!`;
      }
      return `Halo Mas ${clientNameInput.trim() || 'Bro'},\n\nUpdate progress Barber Underrated ya: Sistem kasir POS, rekap omzet, dan kirim struk WA cepat udah siap buat persiapan Opening Minggu besok 30 Agustus 2026.\n\nBoleh dicek previewnya ya Mas, kalau ada yang mau disesuaikan tinggal kabari aja! 💈🚀`;
    }

    // 2. Umi Elly — LMS Peradaban Islam Azhariyah
    if (targetName.toLowerCase().includes('elly') || targetName.toLowerCase().includes('azhariyah')) {
      if (selectedTone === 'islamic' || selectedTone === 'formal') {
        return `Assalamu'alaikum warahmatullah Umi Elly,\n\nSemoga Umi dan keluarga senantiasa dalam keadaan sehat dan berkah.\n\nIzin menanyakan perihal kelanjutan rencana pengembangan platform LMS Peradaban Islam Azhariyah. Sesuai skema kesepakatan termin (Rp3jt → Rp2jt → Rp2jt), begitu transfer termin pertama Rp3.000.000 diterima, tim kami akan langsung mulai pengerjaan teknis tahap awal.\n\nMohon informasi kabar baiknya ya Umi. Jazakillahu khairan katsiran.`;
      }
      return `Assalamu'alaikum Umi Elly,\n\nIzin konfirmasi terkait rencana kick-off pembuatan website LMS Azhariyah ya Umi. Jika transfer termin pertama (Rp3jt) sudah siap, kami langsung jadwalkan mulai pengerjaan minggu ini. Terima kasih Umi.`;
    }

    // 3. Bedug.net
    if (targetName.toLowerCase().includes('bedug')) {
      if (selectedTone === 'formal') {
        return `Selamat pagi/siang tim Bedug.net / ${client},\n\nIzin menanyakan kelanjutan hasil diskusi internal redaksi/manajemen terkait rencana redesign media website dan fitur paywall/advertising kemarin.\n\nKira-kira apakah ada hal atau rincian proposal yang perlu kami perjelas kembali? Ditunggu kabar baiknya ya. Terima kasih.`;
      }
      return `Halo Mas ${clientNameInput.trim() || ''},\n\nIzin follow-up hasil obrolan internal tim Bedug.net kemarin ya. Kira-kira udah ada update terkait rencana redesign media dan kolom paywall-nya? Kabari ya Mas kalau ada yang mau didiskusikan lagi.`;
    }

    // 4. Teh Umi — E-reader Basic
    if (targetName.toLowerCase().includes('teh umi') || targetName.toLowerCase().includes('reader')) {
      return `Assalamu'alaikum Teh Umi,\n\nSemoga sehat selalu ya Teh. Izin reminder santai terkait pelunasan cicilan ke-2 untuk project e-reader basic (total Rp300.000).\n\nBegitu pelunasan selesai, aplikasinya langsung kami proses build dan deploy ya Teh. Nuhun pisan.`;
    }

    // 5. El Massa
    if (targetName.toLowerCase().includes('massa')) {
      return `Selamat pagi/siang ${client},\n\nIzin menanyakan status proses pembayaran invoice untuk deliverables pekerjaan yang sudah selesai kami serahkan kemarin ya.\n\nMohon informasinya agar status administrasi project di sistem kami bisa di-update ke status selesai. Terima kasih banyak.`;
    }

    // 6. Ar-Ruwad Logo
    if (targetName.toLowerCase().includes('ruwad')) {
      return `Assalamu'alaikum ${client},\n\nIzin menanyakan apakah sudah ada pilihan konsep logo yang paling cocok dari opsi yang kemarin kami kirimkan? Jika ada masukan atau arahan revisi, kabari saja ya agar bisa segera kami siapkan master filenya. Terima kasih.`;
    }

    // 7. Al Madroj / Watra
    if (targetName.toLowerCase().includes('watra') || targetName.toLowerCase().includes('madroj')) {
      return `Assalamu'alaikum ${client},\n\nIzin follow-up terkait rencana pembuatan platform kelas/LMS yang kemarin sempat kita bicarakan. Kira-kira kapan waktu yang pas untuk kita ngobrol singkat gali scope kebutuhannya lebih detail? Terima kasih.`;
    }

    // 8. Zalvice Logo (Bang Edo)
    if (targetName.toLowerCase().includes('zalvice')) {
      return `Halo Bang Edo,\n\nIni draft 2 arah konsep logo awal untuk Zalvice beserta preview mockup penerapannya ya Bang.\n\nBoleh dicek santai dan kasih feedback kira-kira arah visual mana yang paling cocok dan representatif. Thank you Bang!`;
    }

    // 9. Laptopbisnis Logo
    if (targetName.toLowerCase().includes('laptopbisnis')) {
      return `Halo ${client},\n\nDraft 2 opsi konsep logo baru (simbol + wordmark) untuk Laptopbisnis sudah siap kami presentasikan. Kapan waktu yang pas untuk kami kirimkan preview lengkapnya? Terima kasih.`;
    }

    // 10. KAEL Offline Marketing (Demo ke Calon UMKM)
    if (targetName.toLowerCase().includes('kael')) {
      return `Halo Mas/Pak ${clientNameInput.trim() || '[Nama Pemilik Toko]'},\n\nTerima kasih banyak kemarin sudah luangkan waktu lihat demo KAEL POS & Review.\n\nKira-kira dari demo kemarin, fitur apa yang paling pas dan mendesak buat bantu operasional toko saat ini? Kebetulan minggu ini kami ada program pendampingan khusus untuk 3 UMKM pilot pertama. Kalau Mas tertarik mau langsung coba di toko, kabari ya Mas!`;
    }

    // Generic Fallback
    return `Halo ${client},\n\nIzin menindaklanjuti progress terkait project ${targetName} kemarin. Kira-kira apakah ada update atau hal yang perlu kami bantu sesuaikan? Ditunggu kabar baiknya ya. Terima kasih!`;
  };

  const messageText = getFollowUpTemplate(activeItemName, tone, customClientName);

  const handleCopy = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    soundManager.playClick();
    const encoded = encodeURIComponent(messageText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Combine unique project names for quick dropdown
  const uniqueNames = Array.from(new Set([
    'Barber POS / Membership System',
    'Umi Elly — LMS Peradaban Islam Azhariyah',
    'Bedug.net',
    'KAEL — Offline Marketing',
    'El Massa',
    'Ar-Ruwad Logo',
    'Teh Umi — E-reader Basic',
    'Al Madroj / Watra',
    'Zalvice Logo',
    'Laptopbisnis Logo',
    ...allProjects.map(p => p.name),
    ...allWaitingItems.map(w => w.name)
  ]));

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
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings: Target Project & Tone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Target Client Dropdown */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-zinc-400 font-mono mb-1">
              // Pilih Client / Project:
            </label>
            <select
              value={activeItemName}
              onChange={(e) => setActiveItemName(e.target.value)}
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
              placeholder="Contoh: Bang Edo / Umi Elly"
              value={customClientName}
              onChange={(e) => setCustomClientName(e.target.value)}
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
              <span>Buka WA Web</span>
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
