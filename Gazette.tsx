
import React from 'react';
import { ChevronLeft, Zap, MapPin, ArrowUpRight } from 'lucide-react';
import { tc, t } from '../translations';
import { Language, GazettePage, AppConfig } from '../types';
import { resolvePlaceholders } from '../utils/placeholders';

interface GazetteModalProps {
  page: GazettePage | null;
  lang: Language;
  onClose: () => void;
  config: AppConfig;
}

export const GazetteModal = ({ page, lang, onClose, config }: GazetteModalProps) => {
  if (!page) return null;

  const handleCTAAction = () => {
    if (!page.ctaConfig || page.ctaConfig.type === 'none') return;
    const { type, payload, template } = page.ctaConfig;

    if (type === 'whatsapp') {
        const phone = config.hostPhone.replace(/\D/g, '');
        const message = resolvePlaceholders(template || `Hi ${config.hostName}, I'm interested in this!`, config, lang);
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    } else if (type === 'nav') {
        const destination = resolvePlaceholders(payload || "", config, lang);
        if (destination) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, '_blank');
        }
    }
  };

  const hasCTA = page.ctaConfig && page.ctaConfig.type !== 'none';
  const ctaLabel = page.ctaConfig?.label ? tc(page.ctaConfig.label, lang) : tc(page.cta, lang) || "Inquire Now";
  
  const rawContent = tc(page.longContent || page.content, lang);
  const resolvedText = resolvePlaceholders(rawContent, config, lang);

  const renderSmartContent = (text: string) => {
    const parts = text.split(/(https:\/\/(?:maps\.app\.goo\.gl|www\.google\.com\/maps)[^\s]+)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('https://')) {
        return (
          <div key={i} className="my-8 flex justify-center">
            <a 
              href={part} 
              target="_blank" 
              rel="noreferrer"
              className="group relative flex items-center gap-4 bg-[#c5a028] text-white px-7 py-4 rounded-[2rem] shadow-[0_15px_30px_-5px_rgba(197,160,40,0.4)] hover:scale-105 transition-all active:scale-95 pointer-events-auto border-2 border-white/20"
            >
              <div className="bg-white/20 p-2 rounded-xl">
                <MapPin size={22} fill="white" className="animate-pulse" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">{lang === 'de' ? 'Navigation' : 'Navigation'}</span>
                <span className="text-xs font-black uppercase tracking-tight">{lang === 'de' ? 'In Google Maps öffnen' : 'Open in Google Maps'}</span>
              </div>
              <ArrowUpRight size={18} className="opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ml-1" />
            </a>
          </div>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-end justify-center">
        <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className="bg-[#fcfcf7] w-full max-w-lg h-[94vh] rounded-t-[3.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col border-t-4 border-black/5 animate-slideUp">
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }}></div>
            
            <div className="p-6 pb-4 flex items-center justify-between border-b border-black/5 relative z-20 shrink-0 mx-8 mt-4">
                 <div className="flex-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] mb-0.5">Edition</p>
                    <p className="text-[11px] font-serif font-black text-theme-primary italic">{config.propertyName}</p>
                 </div>
                 <div className="text-center px-6">
                    <h3 className="font-serif font-black text-2xl text-theme-primary uppercase tracking-tighter border-y border-black/10 py-1 mb-1">{t('gazetteTitle', lang)}</h3>
                    <p className="text-[7px] font-black uppercase text-slate-300 tracking-[0.6em] whitespace-nowrap">Premium Guest Access</p>
                 </div>
                 <div className="flex-1 text-right">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] mb-0.5">Date</p>
                    <p className="text-[11px] font-serif font-black text-theme-primary">{new Date().toLocaleDateString(lang, { day: '2-digit', month: 'short' })}</p>
                 </div>
            </div>

            <div className="overflow-y-auto p-10 pt-8 relative z-20 no-scrollbar flex-1">
                <div className="flex items-center gap-3 mb-6">
                    <span className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-md ${page.category === 'UPSELL_OFFER' ? 'bg-[#c5a028] text-white' : 'bg-theme-primary text-white'}`}>
                        {tc(page.tag, lang) || page.category}
                    </span>
                    <div className="h-px flex-1 bg-black/5"></div>
                </div>
                
                <h2 className="font-serif font-black text-3xl text-theme-primary leading-[1.1] mb-8 drop-shadow-sm">
                    {resolvePlaceholders(tc(page.title, lang), config, lang)}
                </h2>
                
                {page.image && (
                    <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl border-[8px] border-white -rotate-1 aspect-video">
                        <img src={page.image} alt="" className="w-full h-full object-cover grayscale-[0.1]" />
                    </div>
                )}

                <div className="font-serif text-xl leading-relaxed text-slate-800 space-y-8 pb-48 whitespace-pre-line">
                    <div className="first-letter:text-8xl first-letter:font-black first-letter:text-theme-primary first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:leading-[0.7]">
                        {renderSmartContent(resolvedText)}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-[#fcfcf7] via-[#fcfcf7] to-transparent z-30 pointer-events-none">
               <div className="flex flex-col gap-4 pointer-events-auto">
                    {hasCTA && (
                        <button 
                            onClick={handleCTAAction}
                            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${page.category === 'UPSELL_OFFER' ? 'bg-[#c5a028] text-white' : 'bg-theme-primary text-white'}`}
                        >
                            <Zap size={18} fill="currentColor" /> {ctaLabel}
                        </button>
                    )}
                    <button onClick={onClose} className="w-full bg-white text-theme-primary border-2 border-black/5 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-xl">
                        <ChevronLeft size={16} /> {t('gazetteFrontPage', lang)}
                    </button>
               </div>
            </div>
        </div>
    </div>
  );
};
