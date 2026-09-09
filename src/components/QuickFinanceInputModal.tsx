import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  Building2,
  Receipt,
  FileText
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
    tx: Omit<TransactionRecord, 'id' | 'createdAt'>,
    linkedProjectUpdates?: { projectId: string; amountAdded: number }
  ) => void;
  onUpdateAllBalances: (newAccounts: AssetAccount[]) => void;
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
  const [amountStr, setAmountStr] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('Mandiri');
  const [toAccount, setToAccount] = useState('Bank Jago');
  const [selectedProject, setSelectedProject] = useState('');
  const [category, setCategory] = useState('DP Project');
  const [description, setDescription] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 1024 * 1024) {
      alert('Pilih foto bukti maksimal 1 MB supaya penyimpanan browser tetap cukup.');
      return;
    }

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoBase64(null);
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

    const newTx: Omit<TransactionRecord, 'id' | 'createdAt'> = {
      date: new Date().toLocaleDateString('sv-SE'),
      type: txType,
      amount: cleanAmount,
      accountName: selectedAccount,
      toAccountName: txType === 'transfer' ? toAccount : undefined,
      category: category || (txType === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      description: description.trim() || (selectedProject ? `Pembayaran untuk ${selectedProject}` : 'Transaksi kas'),
      photoUrl: photoBase64 || undefined,
      linkedProjectId: txType === 'income' ? (projects.find(project => project.id === selectedProject || project.name === selectedProject)?.id || undefined) : undefined
    };

    let linkedProjectUpdate;
    if (selectedProject && txType === 'income') {
      const p = projects.find(proj => proj.name === selectedProject || proj.id === selectedProject);
      if (p) {
        linkedProjectUpdate = {
          projectId: p.id,
          amountAdded: cleanAmount
        };
      }
    }

    try { onSaveTransaction(newTx, linkedProjectUpdate); }
    catch (error) { alert(error instanceof Error ? error.message : 'Transaksi gagal.'); return; }
    soundManager.playCompletionChime();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onClose();

    // Reset
    setAmountStr('');
    setDescription('');
    setPhotoBase64(null);
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
                    onClick={() => { soundManager.playClick(); setTxType('income'); setCategory('DP Project'); }}
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
                    onClick={() => { soundManager.playClick(); setTxType('expense'); setCategory('Operasional'); }}
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
                    onClick={() => { soundManager.playClick(); setTxType('transfer'); setCategory('Pindah Dana'); }}
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

              {/* Description */}
              <div>
                <label className="block text-[11px] text-zinc-400 font-mono mb-1">// Keterangan / Catatan:</label>
                <input
                  type="text"
                  placeholder="Contoh: DP 50% Kasir Barber Underrated / Pembayaran Hosting"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#14141a] border border-white/10 rounded-xl px-3 py-2 text-white font-sans text-xs focus:outline-none"
                />
              </div>

              {/* Photo / Bukti Transfer Upload */}
              <div className="space-y-2">
                <label className="block text-[11px] text-zinc-400 font-mono">// Foto Bukti Transfer / Nota Fisik:</label>
                
                {photoBase64 ? (
                  <div className="relative rounded-xl border border-white/15 overflow-hidden bg-black/40 p-2 flex items-center gap-3">
                    <img
                      src={photoBase64}
                      alt="Bukti Transfer"
                      className="w-16 h-16 object-cover rounded-lg border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{photoName || 'bukti_transfer.png'}</p>
                      <span className="text-[10px] text-emerald-400 font-mono"> Foto terlampir</span>
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
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">PNG, JPG, screenshot m-banking</p>
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
