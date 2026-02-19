
import React, { useState, useMemo, useRef } from 'react';
import { Search } from 'lucide-react';
import { ManualItem, Language, AppConfig, ManualCategory } from '../../../types';
import { ManualItemCard } from '../../Manual';
import { LanguageToggle } from '../../UI';
import { t } from '../../../translations';

interface ManualSectionProps {
  config: AppConfig;
  lang: Language;
  setLang: (l: Language) => void;
  isUnlocked: boolean;
  setIsUnlocked: (val: boolean) => void;
}

const CATEGORIES: { id: ManualCategory; labelKey: string; color: string }[] = [
  { id: 'arrival', labelKey: 'filter_transport', color: 'bg-blue-500' },
  { id: 'essentials', labelKey: 'essentials', color: 'bg-gold-500' },
  { id: 'living', labelKey: 'living', color: 'bg-indigo-500' },
  { id: 'kitchen', labelKey: 'kitchen', color: 'bg-orange-500' },
  { id: 'wellness', labelKey: 'wellness', color: 'bg-emerald-500' },
  { id: 'rules', labelKey: 'rules', color: 'bg-rose-500' },
  { id: 'emergency', labelKey: 'emergency', color: 'bg-red-600' }
];

export const ManualSection = ({ config, lang, setLang, isUnlocked, setIsUnlocked }: ManualSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ManualCategory | 'all'>('all');

  const groupedItems = useMemo(() => {
    const search = searchQuery.toLowerCase();
    const items = config.manual.filter(item => {
        const matchesVisibility = item.isVisible !== false;
        const matchesSearch = search === '' || 
                             item.title[lang]?.toLowerCase().includes(search) || 
                             item.content[lang]?.toLowerCase().includes(search);
        return matchesVisibility && matchesSearch;
    });

    const groups: Record<string, ManualItem[]> = {};
    items.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });

    return groups;
  }, [config.manual, searchQuery, lang]);

  const categoriesToShow = CATEGORIES.filter(cat => 
    (activeTab === 'all' || activeTab === cat.id) && groupedItems[cat.id]
  );

  return (
    <div className="pb-44 pt-16 px-6 animate-[fadeIn_0.3s_ease-out] bg-slate-50 min-h-screen">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-8">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-theme-secondary mb-2">{t('manual_subtitle', lang)}</p>
                <h2 className="text-5xl font-serif text-theme-primary font-bold tracking-tight">{t('manual', lang)}</h2>
            </div>
            <div className="shrink-0">
                <LanguageToggle lang={lang} setLang={setLang} variant="dark" align="right" />
            </div>
        </div>
        
        <div className="relative mb-8 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-theme-primary transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'de' ? "Suchen..." : "Search..."}
            className="w-full bg-white border-none rounded-[2rem] py-5 pl-16 pr-6 font-bold text-navy-900 shadow-sm focus:ring-2 focus:ring-theme-primary/10 transition-all outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm
              ${activeTab === 'all' ? 'bg-theme-primary text-white scale-105' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
          >
            {t('filter_all', lang)}
          </button>
          {CATEGORIES.map(cat => {
              if (!groupedItems[cat.id]) return null;
              return (
                <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm
                    ${activeTab === cat.id ? 'bg-theme-primary text-white scale-105' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                >
                {t(cat.labelKey, lang) || cat.id}
                </button>
              );
          })}
        </div>
      </div>

      <div className="space-y-12">
        {categoriesToShow.map(cat => (
          <section key={cat.id} className="animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-serif font-black text-theme-primary text-xl italic tracking-tighter">
                    {t(cat.labelKey, lang) || cat.id}
                </h3>
            </div>
            <div className="space-y-4">
              {groupedItems[cat.id]?.map(item => (
                <ManualItemCard key={item.id} item={item} lang={lang} config={config} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
