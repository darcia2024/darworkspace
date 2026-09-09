import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, AlertCircle, Sparkles, Delete, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PinLockScreenProps {
  onUnlock: () => void;
}

// Local Device Privacy Lock (Screen Lock for shoulder-surfing protection)
// Stored as SHA-256 hash in localStorage or falls back to standard hashed default.
// Plaintext PIN is never bundled in source code or production JS.
const DEFAULT_PIN_HASH = '1180ce3297aa01f51c304d058afca783cb8dc2735f11ca4ae995450ce013cff3';
export const AUTH_STORAGE_KEY = 'DARU_WORK_OS_AUTH_V1';

async function computeSha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleVerify = async (pinCode: string) => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const hash = await computeSha256(pinCode);
      const expectedHash = localStorage.getItem('DARU_OS_PIN_HASH') || DEFAULT_PIN_HASH;
      if (hash === expectedHash) {
        setIsSuccess(true);
        setError(false);
        soundManager.playLevelUp();
        try { localStorage.setItem(AUTH_STORAGE_KEY, 'UNLOCKED'); } catch { /* Session unlock works */ }
        setTimeout(() => {
          onUnlock();
        }, 500);
        return;
      }
    } catch {
      // Fall through to error
    } finally {
      setIsVerifying(false);
    }

    setError(true);
    soundManager.playError();
    setErrorMessage('PIN salah! Silakan coba lagi.');
    setTimeout(() => {
      setPin(['', '', '', '', '', '']);
      setError(false);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 1000);
  };

  useEffect(() => {
    const fullPin = pin.join('');
    if (fullPin.length === 6 && !pin.includes('') && !isVerifying && !error) {
      void handleVerify(fullPin);
    }
  }, [pin, isVerifying, error]);

  const handleInputChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 1) {
      const next = [...pin];
      digits.slice(0, 6).split('').forEach((d, i) => {
        if (i < 6) next[i] = d;
      });
      setPin(next);
      const nextIdx = Math.min(digits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const digit = digits.slice(-1);
    const next = [...pin];
    next[index] = digit;
    setPin(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const fullPin = pin.join('');
      if (fullPin.length === 6) {
        void handleVerify(fullPin);
      }
    }
  };

  const handleKeypadPress = (num: string) => {
    const emptyIndex = pin.findIndex(d => d === '');
    if (emptyIndex !== -1) {
      const next = [...pin];
      next[emptyIndex] = num;
      setPin(next);
      if (emptyIndex < 5) {
        inputRefs.current[emptyIndex + 1]?.focus();
      }
    }
  };

  const handleBackspace = () => {
    const lastFilledIndex = [...pin].reverse().findIndex(d => d !== '');
    if (lastFilledIndex !== -1) {
      const realIndex = 5 - lastFilledIndex;
      const next = [...pin];
      next[realIndex] = '';
      setPin(next);
      inputRefs.current[realIndex]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111111] flex flex-col justify-center items-center p-4 selection:bg-[#111111] selection:text-white relative overflow-hidden font-sans select-none">
      {/* Background Pastel Floating Blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#fdecd2]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#fce7f3]/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#e0f2fe]/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Bento Lock Card */}
      <div className={`w-full max-w-md bg-white border ${
        error ? 'border-rose-400 shadow-rose-200/40' : isSuccess ? 'border-emerald-500 shadow-emerald-200/40' : 'border-zinc-200/90 shadow-2xl'
      } rounded-[32px] p-7 sm:p-9 relative z-10 transition-all duration-300 ${error ? 'animate-bounce' : ''}`}>
        
        {/* Header Icon & Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 shadow-md ${
            isSuccess 
              ? 'bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d]' 
              : error 
                ? 'bg-[#fce7f3] text-[#be185d] border border-[#fbcfe8]' 
                : 'bg-[#111111] text-white'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : error ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>
          
          <span className="sticker-pill sticker-lime text-[10px] uppercase font-bold tracking-wider mb-2">
            PRIVACY LOCK
          </span>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
            <span className="lead-italic font-normal">Daru</span>.OS
          </h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs font-normal">
            Kunci Privasi Perangkat. Masukkan 6 Digit PIN untuk membuka layar.
          </p>
        </div>

        {/* 6 PIN Input Boxes */}
        <div className="flex justify-center items-center gap-2.5 sm:gap-3 mb-6">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { inputRefs.current[idx] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInputChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-2xl border bg-zinc-50 transition-all duration-200 focus:outline-none font-mono ${
                digit 
                  ? 'border-[#111111] bg-white text-[#111111] shadow-sm' 
                  : 'border-zinc-200 text-[#111111]'
              } ${
                error 
                  ? 'border-rose-400 bg-rose-50 text-rose-700' 
                  : isSuccess 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'focus:border-[#111111] focus:ring-2 focus:ring-black/10'
              }`}
            />
          ))}
        </div>

        {/* Feedback Message */}
        {error && (
          <div className="text-center mb-4">
            <p className="text-xs font-semibold text-rose-600 flex items-center justify-center gap-1.5 animate-pulse font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMessage}
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="text-center mb-4">
            <p className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PIN Terverifikasi! Membuka Workspace...
            </p>
          </div>
        )}

        {/* Touch / On-screen Keypad */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-xs mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              className="h-12 rounded-2xl bg-white hover:bg-zinc-100 active:scale-95 border border-zinc-200/90 text-lg font-bold text-[#111111] transition-all duration-150 flex items-center justify-center shadow-sm font-mono"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin(['', '', '', '', '', ''])}
            className="h-12 rounded-2xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-bold text-zinc-600 hover:text-black transition-all duration-150 flex items-center justify-center font-mono"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-12 rounded-2xl bg-white hover:bg-zinc-100 active:scale-95 border border-zinc-200/90 text-lg font-bold text-[#111111] transition-all duration-150 flex items-center justify-center shadow-sm font-mono"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-zinc-100 hover:bg-rose-50 border border-zinc-200 text-zinc-600 hover:text-rose-600 transition-all duration-150 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Persistent Authorization Notice */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-zinc-500 text-center font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Device ini akan diotorisasi permanen.</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-zinc-400 flex items-center gap-2 relative z-10 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
        <span>DARU WORK OS // PLAYFUL BENTO ARCHITECTURE</span>
      </div>
    </div>
  );
};
