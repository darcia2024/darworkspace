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
import { getApiToken } from '../services/api';
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

// Offline receipts are held inside the workspace state, so they share the browser's
// storage quota with everything else. Keep them small and refuse anything oversized.
const OFFLINE_MAX_DIMENSION = 900;
const OFFLINE_QUALITY = 0.6;
const OFFLINE_MAX_BYTES = 300 * 1024;

const dataUrlBytes = (dataUrl: string) => Math.ceil((dataUrl.split(',')[1]?.length ?? 0) * 3 / 4);

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
  const [isHeldLocally, setIsHeldLocally] = useState(false);

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
        const token = getApiToken();
        const res = await fetch('/api/receipts', {
          method: 'POST',
          headers: token
            ? { 'Content-Type': 'application/json', 'X-Daru-Token': token }
            : { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: compressed }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            setPhotoUrl(data.url);
            setIsHeldLocally(false);
            setIsUploading(false);
            return;
          }
        }
      } catch {
        // Server unreachable; fall through to the local copy below.
      }

      // Offline path. This copy lives inside the workspace state, which means it also
      // lands in localStorage, so it gets compressed harder and capped. Without the cap
      // a handful of receipts is enough to fill the browser's storage quota.
      const offlineCopy = await compressImageFile(file, OFFLINE_MAX_DIMENSION, OFFLINE_QUALITY);
      if (dataUrlBytes(offlineCopy) > OFFLINE_MAX_BYTES) {
        alert(
          'Server tidak bisa dihubungi dan foto ini masih terlalu besar untuk disimpan sementara di browser.\n\n' +
          'Simpan transaksinya dulu tanpa foto, lalu lampirkan lagi setelah server hidup.',
        );
        setPhotoName('');
        return;
      }
      setPhotoUrl(offlineCopy);
      setIsHeldLocally(true);
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
    setIsHeldLocally(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md font-sans">
      <div className="w-full max-w-xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-4 h-4 text-zinc-600" />
              <span>Input Data Keuangan Daru</span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              // input cepat di jalan • lampirkan bukti transfer / nota
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 bg-zinc-100">
          <button
            onClick={() => { soundManager.playClick(); setTabMode('single_tx'); }}
            className={`flex-1 py-2.5 text-xs font-mono transition-all flex items-center justify-center gap-2 ${
              tabMode === 'single_tx'
                ? 'bg-zinc-50 text-zinc-900 font-semibold border-b-2 border-white'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>+ Catat Transaksi / Pemasukan</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(); setTabMode('quick_balances'); }}
            className={`flex-1 py-2.5 text-xs font-mono transition-all flex items-center justify-center gap-2 ${
              tabMode === 'quick_balances'
                ? 'bg-zinc-50 text-zinc-900 font-semibold border-b-2 border-white'
                : 'text-zinc-600 hover:text-zinc-900'
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
                <label className="block text-[11px] text-zinc-500 font-mono mb-1.5">// Jenis Transaksi:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { soundManager.playClick(); setTxType('income'); setSelectedCategory('Project / Klien'); }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      txType === 'income'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pemasukan / DP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundManager.playClick(); setTxType('expense'); setSelectedCategory('Operasional'); }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      txType === 'expense'
                        ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-700" />
                    <span>Pengeluaran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundManager.playClick(); setTxType('transfer'); setSelectedCategory('Transfer Antar Rekening'); }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      txType === 'transfer'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                    <span>Transfer Antar Rek</span>
                  </button>
                </div>
              </div>

              {/* Nominal Input */}
              <div>
                <label className="block text-[11px] text-zinc-500 font-mono mb-1">// Nominal Uang (Rp):</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-sm font-semibold">Rp</span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 3.000.000"
                    value={amountStr}
                    onChange={(e) => {
                      const num = e.target.value.replace(/[^0-9]/g, '');
                      setAmountStr(num ? parseInt(num, 10).toLocaleString('id-ID') : '');
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-2.5 text-zinc-900 font-mono text-base font-semibold focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              {/* Account Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-500 font-mono mb-1">
                    // {txType === 'income' ? 'Rekening Masuk:' : 'Rekening Sumber:'}
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 font-mono text-xs focus:outline-none"
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
                    <label className="block text-[11px] text-zinc-500 font-mono mb-1">// Rekening Tujuan:</label>
                    <select
                      value={toAccount}
                      onChange={(e) => setToAccount(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 font-mono text-xs focus:outline-none"
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
                    <label className="block text-[11px] text-zinc-500 font-mono mb-1">// Hubungkan ke Project (Opsional):</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 font-mono text-xs focus:outline-none"
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
                  <label className="block text-[11px] text-zinc-500 font-mono mb-1">// Tanggal Transaksi:</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 font-mono text-xs focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-500 font-mono mb-1">// Kategori Transaksi:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 font-mono text-xs focus:outline-none"
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
                  <label className="block text-[11px] text-zinc-500 font-mono mb-1">// Tulis Kategori Kustom:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Belanja Kantor, Konsumsi, dsb."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 font-sans text-xs focus:outline-none"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-[11px] text-zinc-500 font-mono mb-1">// Keterangan / Catatan:</label>
                <input
                  type="text"
                  placeholder="Contoh: DP 50% Project Website / Pembayaran Hosting"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 font-sans text-xs focus:outline-none"
                />
              </div>

              {/* Photo / Bukti Transfer Upload */}
              <div className="space-y-2">
                <label className="block text-[11px] text-zinc-500 font-mono">// Foto Bukti Transfer / Nota Fisik:</label>
                
                {photoUrl ? (
                  <div className="relative rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50 p-2 flex items-center gap-3">
                    <img
                      src={photoUrl}
                      alt="Bukti Transfer"
                      className="w-16 h-16 object-cover rounded-lg border border-zinc-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{photoName || 'bukti_transfer.jpg'}</p>
                      {isUploading ? (
                        <span className="text-[10px] text-amber-700 font-mono animate-pulse">Mengompres & mengunggah...</span>
                      ) : isHeldLocally ? (
                        <span className="text-[10px] text-amber-700 font-mono">Disimpan di browser (server offline)</span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-mono">Foto tersimpan di server</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-xl p-4 text-center cursor-pointer transition-colors bg-zinc-50/70 hover:bg-zinc-50"
                  >
                    <div className="flex justify-center mb-1">
                      <Camera className="w-5 h-5 text-zinc-500" />
                    </div>
                    <p className="text-xs text-zinc-600 font-medium">Klik untuk upload atau ambil foto bukti transfer</p>
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
              <p className="text-zinc-500 text-xs">
                Ketik saldo terbaru dari m-banking lo di bawah ini. Saldo total dan trajektori akan otomatis dihitung ulang:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {financialReport.accounts.map(acc => (
                  <div key={acc.name} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                    <label className="block text-[11px] font-semibold text-zinc-900 font-mono">{acc.name}:</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">Rp</span>
                      <input
                        type="text"
                        value={accountBalances[acc.name] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setAccountBalances(prev => ({ ...prev, [acc.name]: val ? parseInt(val, 10).toLocaleString('id-ID') : '0' }));
                        }}
                        className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-zinc-900 font-mono text-xs focus:outline-none"
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
