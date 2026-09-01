import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, Sparkles, Delete, ArrowRight, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PinLockScreenProps {
  onUnlock: () => void;
}

const CORRECT_PIN = '120426';
export const AUTH_STORAGE_KEY = 'DARU_WORK_OS_AUTH_V1';

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input box on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleVerify = (pinCode: string) => {
    if (pinCode === CORRECT_PIN) {
      setIsSuccess(true);
      setError(false);
      soundManager.playLevelUp();
      localStorage.setItem(AUTH_STORAGE_KEY, 'AUTHENTICATED_120426');
      setTimeout(() => {
        onUnlock();
      }, 600);
    } else {
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
    }
  };

  const handleInputChange = (index: number, value: string) => {
    // Handle paste of full PIN
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newPin = [...pin];
      digits.forEach((d, i) => {
        if (i < 6) newPin[i] = d;
      });
      setPin(newPin);
      if (digits.length === 6) {
        handleVerify(newPin.join(''));
      } else {
        const nextIdx = Math.min(digits.length, 5);
        inputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullPin = newPin.join('');
    if (fullPin.length === 6 && !newPin.includes('')) {
      handleVerify(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const fullPin = pin.join('');
      if (fullPin.length === 6) {
        handleVerify(fullPin);
      }
    }
  };

  const handleKeypadPress = (num: string) => {
    const emptyIndex = pin.findIndex(d => d === '');
    if (emptyIndex !== -1) {
      const newPin = [...pin];
      newPin[emptyIndex] = num;
      setPin(newPin);
      if (emptyIndex < 5) {
        inputRefs.current[emptyIndex + 1]?.focus();
      }
      if (emptyIndex === 5) {
        handleVerify(newPin.join(''));
      }
    }
  };

  const handleBackspace = () => {
    const lastFilledIndex = [...pin].reverse().findIndex(d => d !== '');
    if (lastFilledIndex !== -1) {
      const realIndex = 5 - lastFilledIndex;
      const newPin = [...pin];
      newPin[realIndex] = '';
      setPin(newPin);
      inputRefs.current[realIndex]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500/30 selection:text-amber-200 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Lock Card */}
      <div className={`w-full max-w-md bg-slate-900/90 border ${error ? 'border-red-500/60 shadow-red-500/20' : isSuccess ? 'border-emerald-500/60 shadow-emerald-500/20' : 'border-slate-800 shadow-amber-500/5'} backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 ${error ? 'animate-bounce' : ''}`}>
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
            isSuccess 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20' 
              : error 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/10'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8 animate-scale" />
            ) : error ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              COMMAND CENTER
            </span>
          </div>
          
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            DARU WORK OS
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Akses Terproteksi. Masukkan 6 Digit PIN Otorisasi Anda.
          </p>
        </div>

        {/* PIN Inputs (6 Boxes) */}
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
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border bg-slate-950/80 transition-all duration-200 focus:outline-none ${
                digit 
                  ? 'border-amber-500 text-amber-300 shadow-md shadow-amber-500/10' 
                  : 'border-slate-800 text-white'
              } ${
                error 
                  ? 'border-red-500/80 bg-red-950/20 text-red-400' 
                  : isSuccess 
                    ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-400' 
                    : 'focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-red-400 flex items-center justify-center gap-1.5 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMessage}
            </p>
          </div>
        )}

        {/* Success message */}
        {isSuccess && (
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-emerald-400 flex items-center justify-center gap-1.5">
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
              className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-750 active:bg-amber-500/20 border border-slate-700/50 hover:border-slate-600 text-lg font-bold text-slate-100 hover:text-white transition-all duration-150 flex items-center justify-center shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin(['', '', '', '', '', ''])}
            className="h-12 rounded-xl bg-slate-800/30 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all duration-150 flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-750 active:bg-amber-500/20 border border-slate-700/50 hover:border-slate-600 text-lg font-bold text-slate-100 hover:text-white transition-all duration-150 flex items-center justify-center shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-800/30 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-red-400 transition-all duration-150 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Persistence Notice */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Device ini akan diingat otomatis selamanya.</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-slate-400 flex items-center gap-2 relative z-10">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Daru Work OS — Secure Execution System</span>
      </div>
    </div>
  );
};
