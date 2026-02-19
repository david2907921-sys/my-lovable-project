
import React from 'react';
import { Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { AppConfig } from '../../../types';

interface ContactViewProps {
  config: AppConfig;
  onEnterAdmin?: () => void;
}

export const ContactView = ({ config, onEnterAdmin }: ContactViewProps) => {
  return (
    <div className="pb-44 pt-16 px-8 animate-[fadeIn_0.3s_ease-out] bg-slate-50 min-h-screen flex flex-col items-center">
        <div className="text-center mb-16 relative">
            <div className="w-40 h-40 rounded-[4rem] mx-auto mb-8 flex items-center justify-center text-white font-serif text-5xl shadow-2xl tracking-tighter overflow-hidden bg-theme-primary">
                {config.logo ? <img src={config.logo} className="w-full h-full object-cover" alt="Logo" /> : config.hostName.charAt(0)}
            </div>
            <h2 className="text-5xl font-serif font-bold tracking-tight mb-2 text-theme-primary">{config.hostName}</h2>
            <p className="font-black text-[10px] uppercase tracking-[0.4em] text-theme-secondary">Personal Concierge</p>
        </div>
        <div className="space-y-5 w-full max-w-sm mb-20">
            <a href={`https://wa.me/${config.hostPhone.replace('+', '')}`} className="w-full bg-[#25D366] text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all">
                <MessageCircle size={24} /> Chat via WhatsApp
            </a>
            <a href={`tel:${config.hostPhone}`} className="w-full text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all bg-theme-primary">
                <Phone size={24} /> Direct Voice Call
            </a>
        </div>

        <button 
            onClick={onEnterAdmin}
            className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-all py-4 px-6 rounded-full border border-slate-200"
        >
            <ShieldCheck size={16} className="text-theme-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-theme-primary">Admin Login</span>
        </button>
    </div>
  );
};
