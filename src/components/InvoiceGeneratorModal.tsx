import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Download, 
  Code2, 
  Plane, 
  FileText, 
  Share2, 
  Check, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { ProjectCard, InvoiceRecord } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface InvoiceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectCard[];
  initialProject?: ProjectCard | null;
  onSaveInvoice?: (invoice: InvoiceRecord) => void;
}

export const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({
  isOpen,
  onClose,
  projects,
  initialProject,
  onSaveInvoice
}) => {
  const [activePreset, setActivePreset] = useState<string>('barber');
  const [barberTermin, setBarberTermin] = useState<'dp' | 't2' | 't3' | 'full'>('dp');

  // Barber State
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV/BU/2026/013');
  const [invoiceDate, setInvoiceDate] = useState<string>('29th August, 2026');
  const [clientName, setClientName] = useState<string>('Owner Barber Underrated');
  const [projectName, setProjectName] = useState<string>('Website & Kasir Barber Underrated');

  // Bank Info
  const bankName = 'Bank Mandiri';
  const bankAccount = '1550010616962';
  const accountHolder = 'Daru Fahmaa Muliawan';
  const issuerContact = '081311506025';

  // Copy status
  const [copiedBank, setCopiedBank] = useState<boolean>(false);
  const [copiedWA, setCopiedWA] = useState<boolean>(false);

  useEffect(() => {
    if (activePreset === 'barber') {
      if (barberTermin === 'dp') {
        setInvoiceNumber('INV/BU/2026/013');
      } else if (barberTermin === 't2') {
        setInvoiceNumber('INV/BU/2026/014-T2');
      } else if (barberTermin === 't3') {
        setInvoiceNumber('INV/BU/2026/015-FINAL');
      } else {
        setInvoiceNumber('INV/BU/2026/013-KONTRAK');
      }
    }
  }, [barberTermin, activePreset]);

  const copyBankToClipboard = () => {
    navigator.clipboard.writeText(bankAccount);
    setCopiedBank(true);
    soundManager.playCompletionChime();
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const copyWhatsAppSummary = () => {
    const text = `*PENAWARAN & INVOICE // UNDERRATED BARBERSHOP*
📄 *No. Invoice:* #${invoiceNumber}
📅 *Tanggal:* ${invoiceDate}
👤 *Kpd Yth:* ${clientName}
📌 *Proyek:* ${projectName}
🌐 *Detail Penawaran:* https://dar-invoices.vercel.app/barber

━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL TAGIHAN (TERMIN 1 DP 50%): Rp 3.000.000*
_// tiga juta rupiah //_
━━━━━━━━━━━━━━━━━━━━━

*Tahapan Termin Pembayaran:*
• *Termin 1 (DP 50% / Rp 3.000.000):* Kickoff Sprint proyek & Opening 30 Agt 2026.
• *Termin 2 (30% / Rp 1.800.000):* Setelah Fase 2 selesai (App Member 5 Tab berjalan).
• *Termin 3 (20% / Rp 1.200.000):* Serah terima akhir modul HPP, absensi & pelatihan.

🏦 *Instruksi Transfer:*
*Bank:* ${bankName}
*No. Rekening:* ${bankAccount}
*Atas Nama:* ${accountHolder}

_Mohon konfirmasi bukti transfer jika sudah dikirimkan ya. Terima kasih banyak atas kerjasamanya!_ 🙏🚀`;

    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    soundManager.playCompletionChime();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setCopiedWA(false), 2500);
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto animate-fade-in font-sans">
      
      {/* Container Box */}
      <div className="relative w-full max-w-5xl bg-[#0f172a] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[98vh]">
        
        {/* Top Header Control Bar */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-[#080d1a] flex flex-wrap items-center justify-between gap-3 no-print">
          
          {/* Preset Selector */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-zinc-400 font-mono pr-1">Pilih Mode:</span>
            
            <button
              onClick={() => { setActivePreset('barber'); setBarberTermin('dp'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                activePreset === 'barber' && barberTermin === 'dp' ? 'bg-[#dc2626] text-white font-bold shadow' : 'bg-white/5 text-zinc-300 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>💈 Barber: DP 50% (3M)</span>
            </button>

            <button
              onClick={() => { setActivePreset('barber'); setBarberTermin('t2'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                activePreset === 'barber' && barberTermin === 't2' ? 'bg-[#dc2626] text-white font-bold shadow' : 'bg-white/5 text-zinc-300 hover:text-white'
              }`}
            >
              <span>💈 Barber: Termin 2 (1,8M)</span>
            </button>

            <button
              onClick={() => { setActivePreset('barber'); setBarberTermin('t3'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                activePreset === 'barber' && barberTermin === 't3' ? 'bg-[#dc2626] text-white font-bold shadow' : 'bg-white/5 text-zinc-300 hover:text-white'
              }`}
            >
              <span>💈 Barber: Pelunasan (1,2M)</span>
            </button>

            <button
              onClick={() => { setActivePreset('barber'); setBarberTermin('full'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                activePreset === 'barber' && barberTermin === 'full' ? 'bg-[#dc2626] text-white font-bold shadow' : 'bg-white/5 text-zinc-300 hover:text-white'
              }`}
            >
              <span>💈 Barber: Kontrak 6M</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable A4 Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-5 bg-[#cbd5e1] flex justify-center items-start">
          
          {/* A4 Outer Envelope */}
          <div className="w-full max-w-[840px] space-y-3">
            
            {/* Top Action Pill Bar (Matching https://dar-invoices.vercel.app/barber) */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-white p-2.5 sm:p-3 rounded-lg border border-[#cbd5e1] shadow-sm no-print">
              <div className="flex items-center gap-2 font-bold text-[#0f172a]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] animate-pulse" />
                <span>INVOICE #{invoiceNumber} — {clientName}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyBankToClipboard}
                  className="flex items-center gap-1.5 bg-[#f8fafc] hover:bg-zinc-100 border border-[#cbd5e1] text-[#0f172a] font-bold px-3 py-1.5 rounded shadow-sm transition-all"
                >
                  <Copy className="w-3.5 h-3.5 text-[#0f172a]" />
                  <span>{copiedBank ? '✓ Rekening Tersalin' : 'Salin Rekening'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold px-3.5 py-1.5 rounded shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF (1 Hal A4)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold px-3.5 py-1.5 rounded shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Print</span>
                </button>

                <button
                  type="button"
                  onClick={copyWhatsAppSummary}
                  className="flex items-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#15803d] border border-[#25D366]/40 font-bold px-3 py-1.5 rounded shadow-sm transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#15803d]" />
                  <span>{copiedWA ? '✓ Tersalin!' : 'Copas WA'}</span>
                </button>
              </div>
            </div>

            {/* EXACT SINGLE-PAGE A4 INVOICE SHEET */}
            <div 
              id="printable-a4-sheet" 
              className="bg-[#f8fafc] border-[1.5px] border-[#0f172a] shadow-xl flex text-[#0f172a] select-text overflow-hidden"
              style={{ minHeight: '1080px' }}
            >
              
              {/* SIDEBAR KIRI ACCENT (70px) */}
              <div className="w-14 sm:w-16 bg-[#f1f5f9] border-r border-[#cbd5e1] flex flex-col justify-between items-center py-6 shrink-0 select-none">
                
                {/* Vertical "invoice" in Crimson Red */}
                <div 
                  className="font-extrabold text-2xl sm:text-3xl text-[#dc2626] tracking-widest lowercase font-sans"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  invoice
                </div>

                {/* Vertical Brand Name */}
                <div 
                  className="font-bold text-[10px] sm:text-[11px] text-[#0f172a] tracking-widest uppercase font-sans opacity-90"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  UNDERRATED BARBERSHOP
                </div>

              </div>

              {/* MAIN RIGHT PANEL */}
              <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between space-y-4">
                
                <div className="space-y-3.5">
                  
                  {/* HEADER META ROW */}
                  <div className="flex justify-between items-start border-b border-[#cbd5e1] pb-3">
                    <div className="space-y-0.5">
                      <div className="font-mono text-xs sm:text-sm font-bold text-[#0f172a] tracking-wider">
                        Invoice No. #{invoiceNumber}
                      </div>
                      <div className="text-[11px] text-[#475569] font-medium">
                        {invoiceDate}
                      </div>

                      <div className="pt-2">
                        <span className="text-[9px] font-bold text-[#dc2626] uppercase tracking-wider block font-mono">
                          BILLED TO // DITUJUKAN KEPADA:
                        </span>
                        <h3 className="text-sm font-bold text-[#0f172a] leading-tight">
                          {clientName}
                        </h3>
                        <p className="text-[11px] text-[#334155]">
                          Proyek: <strong>{projectName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1.5 flex flex-col items-end">
                      <div className="inline-flex items-center gap-1 bg-[#0f172a] text-white px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase font-mono shadow-xs">
                        <span>💈 OMNICHANNEL PWA & POS KASIR</span>
                      </div>
                      <div className="text-[10px] text-[#475569] font-mono">
                        📅 Opening: 30 Agt 2026 • Rampung: 4 Sep 2026
                      </div>
                    </div>
                  </div>

                  {/* SCOPE BREAKDOWN TABLE */}
                  <div className="space-y-1.5">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="border-b-2 border-[#0f172a] text-[10px] font-bold uppercase tracking-wider text-[#0f172a]">
                          <th className="pb-1.5">DESCRIPTION // RINCIAN PENGEMBANGAN</th>
                          <th className="pb-1.5 text-right font-mono w-32">SUBTOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        
                        {/* BANNER BAGIAN I */}
                        <tr>
                          <td colSpan={2} className="pt-1.5 pb-1">
                            <div className="bg-[#0f172a] text-white px-3 py-1.5 text-[11px] font-bold font-mono flex justify-between items-center border-l-4 border-[#dc2626] rounded-xs">
                              <span>BAGIAN I: LINGKUP UTAMA PAKET FULL (TOTAL KONTRAK: RP 6.000.000)</span>
                              <span>Subtotal: Rp 6.000.000</span>
                            </div>
                          </td>
                        </tr>

                        {/* ITEM 1.1 */}
                        <tr className="border-b border-[#cbd5e1]">
                          <td className="py-2 pr-2">
                            <div className="font-bold text-[#0f172a] text-[12px] mb-0.5">
                              Paket Full — Omnichannel PWA (5 Tab, 5-Tier Membership, POS Kasir & Multi-Cabang)
                            </div>
                            <ul className="text-[10.5px] text-[#475569] space-y-0.5 pl-3 leading-relaxed">
                              <li className="relative pl-2.5">
                                <span className="absolute left-0 text-[#dc2626] font-bold">•</span>
                                <strong>PWA 5 Tab:</strong> Home, Reward, Scan QR, Product, dan Store (bisa install di HP tanpa Play Store)
                              </li>
                              <li className="relative pl-2.5">
                                <span className="absolute left-0 text-[#dc2626] font-bold">•</span>
                                <strong>5-Tier Membership Auto-Upgrade:</strong> (Silver sampai Black) & Poin Cashback Retroaktif
                              </li>
                              <li className="relative pl-2.5">
                                <span className="absolute left-0 text-[#dc2626] font-bold">•</span>
                                <strong>POS Kasir Multi-Device:</strong> Catat Tunai/QRIS/EDC, input WA cepat, & konfirmasi struk WA
                              </li>
                              <li className="relative pl-2.5">
                                <span className="absolute left-0 text-[#dc2626] font-bold">•</span>
                                <strong>Dashboard Owner Multi-Cabang:</strong> Rekap omzet harian & performa capster real-time
                              </li>
                            </ul>
                          </td>
                          <td className="py-2 text-right font-mono font-bold text-[#0f172a] align-top text-xs">
                            Rp 5.250.000
                          </td>
                        </tr>

                        {/* ITEM 1.2 */}
                        <tr className="border-b border-[#cbd5e1]">
                          <td className="py-2 pr-2">
                            <div className="font-bold text-[#0f172a] text-[12px] mb-0.5">
                              Add-on: Modul Kalkulator HPP Produk + Absensi Selfie & Cuti Karyawan
                            </div>
                            <ul className="text-[10.5px] text-[#475569] space-y-0.5 pl-3 leading-relaxed">
                              <li className="relative pl-2.5">
                                <span className="absolute left-0 text-[#dc2626] font-bold">•</span>
                                <strong>Kalkulator HPP Produk:</strong> Hitung modal per unit, margin kotor %, laba kotor & batas diskon aman poin
                              </li>
                              <li className="relative pl-2.5">
                                <span className="absolute left-0 text-[#dc2626] font-bold">•</span>
                                <strong>Absensi Karyawan Selfie:</strong> Selfie + Geofence GPS 100m Server-Time & Kalender Cuti Tim
                              </li>
                            </ul>
                          </td>
                          <td className="py-2 text-right font-mono font-bold text-[#0f172a] align-top text-xs">
                            Rp 750.000
                          </td>
                        </tr>

                        {/* BANNER BAGIAN II (TERMIN ADJUSTMENT) */}
                        {barberTermin !== 'full' && (
                          <>
                            <tr>
                              <td colSpan={2} className="pt-2 pb-1">
                                <div className="bg-[#1e293b] text-white px-3 py-1.5 text-[11px] font-bold font-mono flex justify-between items-center border-l-4 border-[#0284c7] rounded-xs">
                                  <span>BAGIAN II: PENYESUAIAN TERMIN 1 (DP 50% KICKOFF SPRINT)</span>
                                  <span>Subtotal: -Rp 3.000.000</span>
                                </div>
                              </td>
                            </tr>

                            <tr className="border-b border-[#cbd5e1]">
                              <td className="py-2 pr-2">
                                <div className="font-bold text-[#0f172a] text-[12px] mb-0.5">
                                  Sisa Termin 2 (30% - Rp 1.800.000) & Termin 3 (20% - Rp 1.200.000)
                                </div>
                                <ul className="text-[10.5px] text-[#475569] space-y-0.5 pl-3 leading-relaxed">
                                  <li className="relative pl-2.5">
                                    <span className="absolute left-0 text-[#0284c7] font-bold">•</span>
                                    <strong>Termin 2 (Rp 1.800.000):</strong> ditagihkan setelah Fase 2 selesai (Aplikasi Member 5 Tab berjalan)
                                  </li>
                                  <li className="relative pl-2.5">
                                    <span className="absolute left-0 text-[#0284c7] font-bold">•</span>
                                    <strong>Termin 3 (Rp 1.200.000):</strong> ditagihkan saat serah terima akhir modul HPP, absensi & pelatihan
                                  </li>
                                </ul>
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-[#dc2626] align-top text-xs">
                                -Rp 3.000.000
                              </td>
                            </tr>
                          </>
                        )}

                        {/* GRAND TOTAL ROW */}
                        <tr className="border-t-2 border-b-2 border-[#0f172a] bg-[#fef2f2]">
                          <td className="py-2.5 px-2 font-bold text-[#0f172a] text-xs sm:text-sm font-sans">
                            {barberTermin === 'full' ? 'TOTAL KONTRAK (NET INVESTMENT)' : 'TOTAL TAGIHAN (TERMIN 1 DP 50%)'}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-black text-sm sm:text-base text-[#0f172a]">
                            {barberTermin === 'full' ? 'Rp 6.000.000' : 'Rp 3.000.000'}
                          </td>
                        </tr>

                      </tbody>
                    </table>

                    <div className="text-right text-[10.5px] text-[#475569] italic font-mono pr-1">
                      {barberTermin === 'full' ? '// enam juta rupiah //' : '// tiga juta rupiah //'}
                    </div>
                  </div>

                  {/* DETAIL TAHAPAN PENGEMBANGAN (FASE 1, 2, & 3) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold tracking-wider text-[#dc2626] uppercase font-mono flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#dc2626]" />
                      <span>DETAIL TAHAPAN PENGEMBANGAN (FASE 1, 2, & 3)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-sans">
                      
                      {/* FASE 1 */}
                      <div className="bg-white border border-[#cbd5e1] border-t-3 border-t-[#dc2626] rounded p-2.5 space-y-1 shadow-2xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-[#dc2626] font-mono tracking-wider">FASE 1 • DP 50%</span>
                          <span className="text-[8.5px] bg-[#fef2f2] text-[#dc2626] px-1.5 py-0.2 rounded font-bold">RUNNING</span>
                        </div>
                        <div className="font-bold text-[11px] text-[#0f172a] leading-snug">Kickoff Sprint & POS Kasir</div>
                        <div className="text-[9px] text-[#475569] font-mono">📅 Target: 30 Agt 2026 (Opening)</div>
                        <ul className="text-[9.5px] text-[#334155] space-y-0.5 pl-2 leading-relaxed">
                          <li>• Setup PWA 5 Tab & POS Kasir Multi-Device</li>
                          <li>• Catat Tunai/QRIS/EDC & Struk WA Cepat</li>
                          <li>• Dashboard Owner Rekap Omzet & Capster</li>
                        </ul>
                        <div className="text-[9.5px] font-bold text-[#0f172a] font-mono border-t border-dashed border-[#cbd5e1] pt-1 mt-1">
                          Termin 1: Rp 3.000.000 (DP 50%)
                        </div>
                      </div>

                      {/* FASE 2 */}
                      <div className="bg-white border border-[#cbd5e1] border-t-3 border-t-[#0f172a] rounded p-2.5 space-y-1 shadow-2xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-[#0f172a] font-mono tracking-wider">FASE 2 • TERMIN 2</span>
                          <span className="text-[8.5px] bg-[#f1f5f9] text-[#475569] px-1.5 py-0.2 rounded font-bold">UPCOMING</span>
                        </div>
                        <div className="font-bold text-[11px] text-[#0f172a] leading-snug">App Member & Retention</div>
                        <div className="text-[9px] text-[#475569] font-mono">📅 Ditagihkan Setelah Member App Live</div>
                        <ul className="text-[9.5px] text-[#334155] space-y-0.5 pl-2 leading-relaxed">
                          <li>• App Member PWA (5 Tab Lengkap)</li>
                          <li>• 5-Tier Membership (Silver s/d Black)</li>
                          <li>• Program Poin Cashback & Loyalty</li>
                        </ul>
                        <div className="text-[9.5px] font-bold text-[#0f172a] font-mono border-t border-dashed border-[#cbd5e1] pt-1 mt-1">
                          Termin 2: Rp 1.800.000 (30%)
                        </div>
                      </div>

                      {/* FASE 3 */}
                      <div className="bg-white border border-[#cbd5e1] border-t-3 border-t-[#059669] rounded p-2.5 space-y-1 shadow-2xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-[#059669] font-mono tracking-wider">FASE 3 • TERMIN 3</span>
                          <span className="text-[8.5px] bg-[#ecfdf5] text-[#047857] px-1.5 py-0.2 rounded font-bold">HANDOVER</span>
                        </div>
                        <div className="font-bold text-[11px] text-[#0f172a] leading-snug">Add-on HPP & Absensi</div>
                        <div className="text-[9px] text-[#475569] font-mono">📅 Estimasi Rampung: 4 Sep 2026</div>
                        <ul className="text-[9.5px] text-[#334155] space-y-0.5 pl-2 leading-relaxed">
                          <li>• Modul Kalkulator HPP Produk Retail</li>
                          <li>• Absensi Selfie + Geofence 100m GPS</li>
                          <li>• Final Handover, Pelatihan & Garansi</li>
                        </ul>
                        <div className="text-[9.5px] font-bold text-[#0f172a] font-mono border-t border-dashed border-[#cbd5e1] pt-1 mt-1">
                          Termin 3: Rp 1.200.000 (20%)
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* HIGHLIGHTS & SPECIFICATION 2-CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5 font-sans">
                    <div className="bg-white border border-[#cbd5e1] border-l-3 border-l-[#dc2626] p-2.5 rounded shadow-2xs space-y-1">
                      <div className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#dc2626]" />
                        <span>KEUNGGULAN SYSTEM BARBER</span>
                      </div>
                      <ul className="text-[10px] text-[#475569] space-y-0.5 pl-1 leading-relaxed">
                        <li>• <strong>PWA App 5 Tab:</strong> Tanpa perlu unduh Play Store/App Store.</li>
                        <li>• <strong>5-Tier Membership:</strong> Auto-Upgrade & Cashback Poin.</li>
                        <li>• <strong>POS Kasir Multi-Cabang:</strong> Struk WA & Rekap Omzet Realtime.</li>
                      </ul>
                    </div>

                    <div className="bg-white border border-[#cbd5e1] border-l-3 border-l-[#0f172a] p-2.5 rounded shadow-2xs space-y-1">
                      <div className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#0f172a]" />
                        <span>ADD-ON FITUR MANAJEMEN</span>
                      </div>
                      <ul className="text-[10px] text-[#475569] space-y-0.5 pl-1 leading-relaxed">
                        <li>• <strong>Kalkulator HPP Produk:</strong> Hitung modal & batas diskon aman.</li>
                        <li>• <strong>Absensi Selfie & GPS:</strong> Geofence 100m & Cuti Tim Staff.</li>
                        <li>• <strong>Cicilan 3 Termin:</strong> DP 50% Kickoff Sprint Pengerjaan.</li>
                      </ul>
                    </div>
                  </div>

                </div>

                {/* BOTTOM PAYMENTS, ISSUER & TERMS */}
                <div className="space-y-2 pt-2 border-t border-[#cbd5e1]">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    
                    {/* Left: Payments Info */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#dc2626] font-mono block">
                        PAYMENTS & REKENING RESMI
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-[#0f172a] text-xs">
                        <span>💳 {bankName}</span>
                      </div>
                      <p className="text-[11px] text-[#475569]">
                        Account Name: <strong className="text-[#0f172a]">{accountHolder}</strong>
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#475569]">Account No:</span>
                        <strong className="font-mono text-xs text-[#0f172a]">{bankAccount}</strong>
                        <button
                          type="button"
                          onClick={copyBankToClipboard}
                          className="bg-[#f1f5f9] hover:bg-[#0f172a] hover:text-white text-[#0f172a] border border-[#cbd5e1] text-[9px] font-bold font-mono px-1.5 py-0.2 rounded transition-colors no-print"
                        >
                          {copiedBank ? '✓' : 'SALIN'}
                        </button>
                      </div>
                    </div>

                    {/* Right: Issuer Details */}
                    <div className="space-y-0.5 sm:text-right">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#dc2626] font-mono block">
                        ISSUER & CONTACT
                      </span>
                      <h4 className="font-bold text-xs text-[#0f172a]">{accountHolder}</h4>
                      <p className="text-[11px] font-semibold text-[#dc2626]">Web Developer & Tech Consultant</p>
                      <p className="text-[11px] text-[#334155] font-mono">WA: {issuerContact}</p>
                    </div>

                  </div>

                  {/* Terms & Conditions Section */}
                  <div className="bg-white border border-dashed border-[#cbd5e1] p-2 sm:p-2.5 rounded text-[10px] text-[#475569] leading-relaxed font-sans">
                    <div className="font-bold text-[#0f172a] uppercase tracking-wider text-[9px] font-mono mb-0.5">
                      KETENTUAN TERMIN PEMBAYARAN:
                    </div>
                    <div>
                      • <strong>Termin 1 (DP 50% / Rp 3.000.000):</strong> Ditagihkan saat Kickoff Sprint proyek (Agustus 2026).<br />
                      • <strong>Termin 2 (30% / Rp 1.800.000):</strong> Ditagihkan setelah Fase 2 selesai (Aplikasi Member 5 Tab berjalan).<br />
                      • <strong>Termin 3 (20% / Rp 1.200.000):</strong> Ditagihkan saat serah terima akhir modul HPP, absensi & pelatihan.
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
