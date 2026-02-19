
import React, { useState } from 'react';
import { Lock, ChevronDown, MapPin, ArrowUpRight } from 'lucide-react';
import { Language, ManualItem, AppConfig } from '../types';
import { IconRenderer } from './Common/IconRenderer';
import { VideoPlayer, ImageGallery } from './UI';
import { UnlockGate } from './Guest/Manual/UnlockGate';
import { resolvePlaceholders } from '../utils/placeholders';
import { tc } from '../translations';

interface ManualItemCardProps {
  item: ManualItem;
  lang: Language;
  isLocked?: boolean;
  onUnlockRequest?: any;
  isCheckInGroup?: boolean;
  config?: AppConfig;
}

export const ManualItemCard: React.FC<ManualItemCardProps> = ({ item, lang, isLocked, onUnlockRequest, isCheckInGroup = false, config }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Nutzen der robusten tc-Funktion
  const resolvedContent = config 
    ? resolvePlaceholders(tc(item.content, lang), config, lang)
    : tc(item.content, lang);

  const renderSmartContent = (text: string) => {
    const parts = text.split(/(https:\/\/(?:maps\.app\.goo\.gl|www\.google\.com\/maps)[^\s]+)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('https://')) {
        return (
          <div key={i} className="my-6 flex justify-center">
            <a 
              href={part} 
              target="_blank" 
              rel="noreferrer"
              className="group relative flex items-center gap-4 bg-[#c5a028] text-white px-6 py-4 rounded-[1.8rem] shadow-lg hover:scale-105 transition-all active:scale-95 pointer-events-auto border border-white/20"
            >
              <div className="bg-white/20 p-2 rounded-xl">
                <MapPin size={20} fill="white" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{lang === 'de' ? 'Navigation' : 'Navigation'}</span>
                <span className="text-xs font-black uppercase tracking-tight">{lang === 'de' ? 'Maps öffnen' : 'Open Maps'}</span>
              </div>
              <ArrowUpRight size={16} className="opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        );
      }
      return <span key={i} className="whitespace-pre-line leading-relaxed">{part}</span>;
    });
  };

  return (
    <div className={`mb-4 rounded-[2rem] shadow-sm border-2 overflow-hidden bg-white transition-all duration-300 ${isOpen ? 'border-theme-primary/20 shadow-xl' : 'border-slate-50 hover:border-theme-primary/10'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-2xl transition-all duration-500 ${isOpen ? 'bg-theme-primary text-white shadow-lg scale-110' : 'bg-theme-primary/5 text-theme-primary'}`}>
            {isLocked && !isOpen ? <Lock size={22} /> : <IconRenderer name={item.icon} />}
          </div>
          <div>
            <span className={`font-serif text-lg leading-tight block font-bold transition-colors ${isOpen ? 'text-theme-primary' : 'text-slate-900'}`}>
              {tc(item.title, lang)}
            </span>
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-opacity ${isOpen ? 'text-theme-primary opacity-60' : 'text-slate-400 opacity-50'}`}>{item.category}</span>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-theme-secondary' : 'text-slate-300'}`}>
          <ChevronDown size={24} />
        </div>
      </button>
      
      {isOpen && (
        <div className="pb-8 px-8 pl-[5.5rem] text-slate-800 animate-[fadeIn_0.2s_ease-out]">
          {isLocked && config ? (
            <UnlockGate config={config} onUnlocked={() => onUnlockRequest?.()} />
          ) : (
            <div className="space-y-6">
              {isCheckInGroup && config ? (
                config.checkInGuide.map((checkItem) => (
                    <div key={checkItem.id} className="border-b border-slate-100 last:border-0 pb-6 mb-6 last:pb-0 last:mb-0">
                        <div className="flex items-center gap-3 mb-4">
                            <h4 className="font-serif font-black text-theme-primary text-lg">{tc(checkItem.title, lang)}</h4>
                        </div>
                        <div className="text-sm font-semibold text-slate-700 mb-4">
                          {renderSmartContent(resolvePlaceholders(tc(checkItem.content, lang), config, lang))}
                        </div>
                        {checkItem.images && <ImageGallery images={checkItem.images} />}
                    </div>
                ))
              ) : (
                <>
                    {item.videoUrl && <VideoPlayer src={item.videoUrl} />}
                    {item.images && <ImageGallery images={item.images} />}
                    <div className="prose prose-slate prose-sm max-w-none">
                        <div className="text-sm font-semibold text-slate-700 leading-relaxed border-l-2 border-theme-primary/10 pl-4">
                            {renderSmartContent(resolvedContent)}
                        </div>
                    </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
