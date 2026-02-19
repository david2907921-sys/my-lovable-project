
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AppConfig } from '../../../types';

interface UnlockGateProps {
  config: AppConfig;
  onUnlocked: () => void;
}

export const UnlockGate = ({ config, onUnlocked }: UnlockGateProps) => {
  const [lastName, setLastName] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = config.validBookings.some(
      b => b.surname.toLowerCase() === lastName.toLowerCase().trim() && 
      b.phoneLast5 === phoneCode.trim()
    );

    if (isValid) {
      onUnlocked();
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-navy-900 p-8 rounded-[2rem] space-y-5 shadow-2xl transition-all ${error ? 'shake-animation border-red-500 border' : ''}`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-gold-500/60 mb-2">Guest Verification Required</p>
      <input 
        type="text" 
        value={lastName} 
        onChange={e => setLastName(e.target.value)} 
        placeholder="Booking Surname" 
        className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none placeholder:text-white/30 focus:bg-white/20 transition-all" 
        required 
      />
      <div className="flex items-center gap-3">
        <input 
          type="password" 
          value={phoneCode} 
          onChange={e => setPhoneCode(e.target.value)} 
          placeholder="Last 5 digits of phone" 
          className="flex-1 bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white font-bold outline-none placeholder:text-white/30 focus:bg-white/20 transition-all" 
          required 
        />
        <button type="submit" className="bg-gold-500 text-navy-900 p-4 rounded-xl shadow-lg active:scale-90 transition-all">
          <ArrowRight size={24} />
        </button>
      </div>
      {error && <p className="text-red-400 text-[10px] font-bold text-center uppercase tracking-widest">Access Denied</p>}
    </form>
  );
};
