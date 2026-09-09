import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Trash2, 
  Check, 
  Receipt
} from 'lucide-react';
import { ProjectCard, AssetAccount, TransactionRecord, FinancialReport } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface QuickFinanceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectCard[];
  financialReport: FinancialReport;
  onSaveTransaction: (
    tx: Omit<TransactionRecord, 'id' | 'createdAt'>
  ) => void;
  onUpdateAllBalances: (newAccounts: AssetAccount[]) => void;
}

async function compressImageFile(file: File, maxDimension = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal membaca gambar.'));
    };
    img.src = url;
  });
}

export const QuickFinanceInputModal: React.FC<QuickFinanceInputModalProps> = ({
  isOpen,
  onClose,
  projects,
  financialReport,
  onSaveTransaction,
  onUpdateAllBalances
}) => {
  const [tabMode, setTabMode] = useState<'single_tx' | 'quick_balances'>('single_tx');
  
  // Single Transaction Form
  const [txType, setTxType] = useState<'income' | 'expense' | 'transfer' | 'balance_update'>('income');
  const [txDate, setTxDate] = useState(() => new Date().toLocaleDateString('sv-SE'));
  const [amountStr, setAmountStr] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('Mandiri');
  const [toAccount, setToAccount] = useState('Bank Jago');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Project / Klien');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Quick Balances Form
  const [accountBalances, setAccountBalances] = useState<{ [key: string]: string }>(() => {
    const map: { [key: string]: string } = {};
    financialReport.accounts.forEach(acc => {
      map[acc.name] = acc.balance.toString();
    });
    return map;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setAccountBalances(Object.fromEntries(financialReport.accounts.map(account => [account.name, String(account.balance)])));
    setSelectedAccount(financialReport.accounts[0]?.name || '');
    setToAccount(financialReport.accounts[1]?.name || '');
    setSelectedProject('');
  }, [isOpen, financialReport.accounts]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Pilih file gambar struk yang valid.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran gambar terlalu besar (maksimal 10 MB).');
      return;
    }

    setPhotoName(file.name);
    setIsUploading(true);

    try {
      const compressed = await compressImageFile(file);
      try {
        const res = await fetch('/api/receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: compressed }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            setPhotoUrl(data.url);
            setIsUploading(false);
            return;
          }
        }
      } catch {
        // Fallback for offline usage
      }
      setPhotoUrl(compressed);
    } catch (err) {
      alert('Gagal memproses foto: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setPhotoName('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    setPhotoName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitSingleTx = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;
    if (cleanAmount <= 0) {
      alert('Masukkan nominal uang yang valid bro!');
      return;
    }

    soundManager.playClick();

    const finalCategory = txType === 'transfer'
      ? 'Transfer Antar Rekening'
      : selectedCategory === 'Lainnya'
        ? (customCategory.trim() || 'Lainnya')
        : selectedCategory;

    const newTx: Omit<TransactionRecord, 'id' | 'createdAt'> = {
      date: txDate || new Date().toLocaleDateString('sv-SE'),
      type: txType,
      amount: cleanAmount,
      accountName: selectedAccount,
      toAccountName: txType === 'transfer' ? toAccount : undefined,
      category: finalCategory,
      description: description.trim() || (selectedProject ? `Pembayaran untuk ${selectedProject}` : 'Transaksi kas'),
      photoUrl: photoUrl || undefined,
      linkedProjectId: txType === 'income' ? (projects.find(project => project.id === selectedProject || project.name === selectedProject)?.id || undefined) : undefined
    };

    try { onSaveTransaction(newTx); }
    catch (error) { alert(error instanceof Error ? error.message : 'Transaksi gagal.'); return; }
    soundManager.playCompletionChime();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onClose();

    // Reset
    setAmountStr('');
    setDescription('');
    setPhotoUrl(null);
    setPhotoName('');
  };

  const handleSaveAllBalances = () => {
    soundManager.playClick();
    const updatedAccounts: AssetAccount[] = financialReport.accounts.map(acc => {
      const rawVal = accountBalances[acc.name];
      const parsed = parseInt((rawVal || '0').replace(/[^0-9]/g, ''), 10) || 0;
      return {
        ...acc,
        balance: parsed,
        isLatest: true,
        lastUpdated: `${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} (Live)`
      };
    });

    try { onUpdateAllBalances(updatedAccounts); }
    catch (error) { alert(error instanceof Error ? error.message : 'Koreksi saldo gagal.'); return; }
    soundManager.playCompletionChime();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-xl bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#121217]">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Receipt className="w-4 h-4 text-zinc-300" />
              <span>Input Data Keuangan Daru</span>
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              // input cepat di jalan • lampirkan bukti transfer / nota
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-[#09090d]">
          <button
            onClick={() => { soundManager.playClick(); setTabMode('single_tx'); }}
            className={`flex-1 py-2.5 text-xs font-mono transition-all flex items-center justify-center gap-2 ${
              tabMode === 'single_tx'
                ? 'bg-[#14141c] text-white font-semibold border-b-2 border-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>+ Catat Transaksi / Pemasukan</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(); setTabMode('quick_balances'); }}
            className={`flex-1 py-2.5 text-xs font-mono transition-all flex items-center justify-center gap-2 ${
              tabMode === 'quick_balances'
                ? 'bg-[#14141c] text-white font-semibold border-b-2 border-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span> Update Saldo 7 Rekening</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {tabMode === 'single_tx' ? (
            <form onSubmit={handleSubmitSingleTx} className="space-y-4">
              
              {/* Type Selector */}
              <div>
                <label className="block text-[11px] text-zinc-400 font-mono mb-1.5">// Jenis Transaksi:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { soundManager.playClick(); setTxType('income'); setSelectedCategory('Project / Klien'); }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      txType === 'income'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                        : 'bg-[#14141c] border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pemasukan / DP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundManager.playClick(); setTxType('expense'); setSelectedCategory('Operasional'); }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      txType === 'expense'
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-semibold'
                        : 'bg-[#14141c] border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                    <span>Pengeluaran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundManager.playClick(); setTxType('transfer'); setSelectedCategory('Transfer Antar Rekening'); }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      txType === 'transfer'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                        : 'bg-[#14141c] border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Transfer Antar Rek</span>
                  </button>
                </div>
              </div>

              {/* Nominal Input */}
              <div>
                <label className="block text-[11px] text-zinc-400 font-mono mb-1">// Nominal Uang (Rp):</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-zinc-400 text-sm font-semibold">Rp</span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 3.000.000"
                    value={amountStr}
                    onChange={(e) => {
                      const num = e.target.value.replace(/[^0-9]/g, '');
                      setAmountStr(num ? parseInt(num, 10).toLocaleString('id-ID') : '');
                    }}
                    className="w-full bg-[#14141a] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white font-mono text-base font-semibold focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Account Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 font-mono mb-1">
                    // {txType === 'income' ? 'Rekening Masuk:' : 'Rekening Sumber:'}
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full bg-[#14141a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                  >
                    {financialReport.accounts.map(acc => (
                      <option key={acc.name} value={acc.name}>
                        {acc.name} (Saldo: Rp{acc.balance.toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>

                {txType === 'transfer' ? (
                  <div>
                    <label className="block text-[11px] text-zinc-400 font-mono mb-1">// Rekening Tujuan:</label>
                    <select
                      value={toAccount}
                      onChange={(e) => setToAccount(e.target.value)}
                      className="w-full bg-[#14141a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                    >
                      {financialReport.accounts.filter(a => a.name !== selectedAccount).map(acc => (
                        <option key={acc.name} value={acc.name}>
                          {acc.name} (Saldo: Rp{acc.balance.toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] text-zinc-400 font-mono mb-1">// Hubungkan ke Project (Opsional):</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full bg-[#14141a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                    >
                      <option value="">-- Bukan Pembayaran Project --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.paymentStatus})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Date and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 font-mono mb-1">// Tanggal Transaksi:</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-[#14141a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 font-mono mb-1">// Kategori Transaksi:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-[#14141a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="Project / Klien">Project / Klien</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Software / Tools">Software / Tools</option>
                    <option value="Gaji / Pribadi">Gaji / Pribadi</option>
                    <option value="Pajak / Admin">Pajak / Admin</option>
                    <option value="Lainnya">Lainnya / Custom...</option>
                  </select>
                </div>
              </div>

              {selectedCategory === 'Lainnya' && (
                <div>
                  <label className="block text-[11px] text-zinc-400 font-mono mb-1">// Tulis Kategori Kustom:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Belanja Kantor, Konsumsi, dsb."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-[#14141a] border border-white/10 rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-[11px] text-zinc-400 font-mono mb-1">// Keterangan / Catatan:</label>
                <input
                  type="text"
                  placeholder="Contoh: DP 50% Project Website / Pembayaran Hosting"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#14141a] border border-white/10 rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none"
                />
              </div>

              {/* Photo / Bukti Transfer Upload */}
              <div className="space-y-2">
                <label className="block text-[11px] text-zinc-400 font-mono">// Foto Bukti Transfer / Nota Fisik:</label>
                
                {photoUrl ? (
                  <div className="relative rounded-xl border border-white/15 overflow-hidden bg-black/40 p-2 flex items-center gap-3">
                    <img
                      src={photoUrl}
                      alt="Bukti Transfer"
                      className="w-16 h-16 object-cover rounded-lg border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{photoName || 'bukti_transfer.jpg'}</p>
                      {isUploading ? (
                        <span className="text-[10px] text-amber-400 font-mono animate-pulse">Mengompres & mengunggah...</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-mono"> Foto tersimpan</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-white/25 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#14141c]/50 hover:bg-[#14141c]"
                  >
                    <div className="flex justify-center mb-1">
                      <Camera className="w-5 h-5 text-zinc-400" />
                    </div>
                    <p className="text-xs text-zinc-300 font-medium">Klik untuk upload atau ambil foto bukti transfer</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">PNG, JPG, dikompresi otomatis &lt; 200 KB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl dev-btn-primary font-semibold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Simpan Transaksi & Update Saldo</span>
                </button>
              </div>

            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-400 text-xs">
                Ketik saldo terbaru dari m-banking lo di bawah ini. Saldo total dan trajektori akan otomatis dihitung ulang:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {financialReport.accounts.map(acc => (
                  <div key={acc.name} className="p-3 rounded-xl bg-[#14141c] border border-white/10 space-y-1">
                    <label className="block text-[11px] font-semibold text-white font-mono">{acc.name}:</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs">Rp</span>
                      <input
                        type="text"
                        value={accountBalances[acc.name] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setAccountBalances(prev => ({ ...prev, [acc.name]: val ? parseInt(val, 10).toLocaleString('id-ID') : '0' }));
                        }}
                        className="w-full bg-black/60 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveAllBalances}
                  className="w-full py-2.5 rounded-xl dev-btn-primary font-semibold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Simpan & Sinkronisasi Semua Saldo</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
