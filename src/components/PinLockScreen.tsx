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
    <div className="min-h-screen bg-[#f1eddf] text-[#252520] flex flex-col justify-center items-center p-4 selection:bg-[#292a24]/20 selection:text-[#252520] relative overflow-hidden font-sans">
      {/* Subtle Warm Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#e3e6c7]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-[#d0b4e9]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Lock Card */}
      <div className={`w-full max-w-md bg-[#fffdf5] border ${error ? 'border-rose-400 shadow-rose-300/30' : isSuccess ? 'border-emerald-500 shadow-emerald-400/20' : 'border-[#ded7c8] shadow-xl'} rounded-2xl p-8 relative z-10 transition-all duration-300 ${error ? 'animate-bounce' : ''}`}>
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
            isSuccess 
              ? 'bg-[#e2ecdc] text-[#305d46] border border-[#305d46]/40 shadow-md' 
              : error 
                ? 'bg-[#f9ded1] text-[#814637] border border-[#814637]/40 shadow-md' 
                : 'bg-[#292a24] text-[#fffdf5] border border-[#292a24] shadow-md'
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
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#252520] bg-[#e3e6c7] border border-[#ded7c8] px-3 py-1 rounded-full">
              SECURITY CHECKPOINT
            </span>
          </div>
          
          <h1 className="text-2xl font-black tracking-tight text-[#252520] mt-1 font-sans">
            DARU WORK OS
          </h1>
          <p className="text-xs text-[#59594f] mt-1 max-w-xs font-mono">
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
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border bg-[#faf9f3] transition-all duration-200 focus:outline-none font-mono ${
                digit 
                  ? 'border-[#292a24] text-[#252520] shadow-sm' 
                  : 'border-[#ded7c8] text-[#252520]'
              } ${
                error 
                  ? 'border-rose-400 bg-rose-50 text-rose-700' 
                  : isSuccess 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'focus:border-[#292a24] focus:ring-2 focus:ring-[#292a24]/10'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-rose-600 flex items-center justify-center gap-1.5 animate-pulse font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMessage}
            </p>
          </div>
        )}

        {/* Success message */}
        {isSuccess && (
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-emerald-600 flex items-center justify-center gap-1.5 font-mono">
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
              className="h-12 rounded-xl bg-[#faf9f3] hover:bg-[#eae5d8] active:bg-[#ded7c8] border border-[#ded7c8] text-lg font-bold text-[#252520] transition-all duration-150 flex items-center justify-center shadow-sm font-mono"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin(['', '', '', '', '', ''])}
            className="h-12 rounded-xl bg-[#faf9f3] hover:bg-[#eae5d8] border border-[#ded7c8] text-xs font-semibold text-[#59594f] hover:text-[#252520] transition-all duration-150 flex items-center justify-center font-mono"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-12 rounded-xl bg-[#faf9f3] hover:bg-[#eae5d8] active:bg-[#ded7c8] border border-[#ded7c8] text-lg font-bold text-[#252520] transition-all duration-150 flex items-center justify-center shadow-sm font-mono"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-[#faf9f3] hover:bg-[#eae5d8] border border-[#ded7c8] text-[#59594f] hover:text-rose-600 transition-all duration-150 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Persistence Notice */}
        <div className="pt-4 border-t border-[#ded7c8] flex items-center justify-center gap-2 text-[11px] text-[#59594f] text-center font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Device ini akan diingat otomatis selamanya.</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-[#59594f] flex items-center gap-2 relative z-10 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-[#292a24]" />
        <span>Daru Work OS // Editorial Agency System</span>
      </div>
    </div>
  );
};
