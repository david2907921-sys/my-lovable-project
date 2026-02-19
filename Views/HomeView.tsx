
import React, { useState, useEffect, useMemo } from 'react';
import { Heart, ArrowRight, Sparkles as SparklesIcon, Newspaper } from 'lucide-react';
import { AppConfig, GazettePage, Language } from '../../../types';
import { LanguageToggle, WeatherPill } from '../../UI';
import { useLanguage } from '../../../contexts/LanguageContext';
import { TabID } from '../BottomNav';
import { DailyPlanner } from './DailyPlanner';
import { resolvePlaceholders } from '../../../utils/placeholders';

interface HomeViewProps {
  config: AppConfig;
  lang: Language;
  setLang: (l: Language) => void;
  setActiveTab: (id: TabID | 'tips') => void;
  setActiveGazettePage: (page: GazettePage) => void;
}

export const HomeView = ({ config, lang, setLang, setActiveTab, setActiveGazettePage }: HomeViewProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<{ temp: number; code: number } | null>(null);
  const { t, tc } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${config.coordinates.lat}&longitude=${config.coordinates.lng}&current_weather=true`);
        const data = await res.json();
        setWeatherData({ temp: data.current_weather.temperature, code: data.current_weather.weathercode });
      } catch (e) { console.error(e); }
    };
    fetchWeather();
  }, [config.coordinates]);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h >= 5 && h < 12) return t('morning');
    if (h >= 12 && h < 18) return t('afternoon');
    if (h >= 18 && h < 22) return t('evening');
    return t('night');
  };

  const filteredGazette = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return config.gazette.filter(page => {
        if (!page.scheduledDate) return true;
        return page.scheduledDate === todayStr;
    });
  }, [config.gazette]);

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] pb-44 bg-[#fcfcf7] min-h-screen">
        {/* Hero Container */}
        <div className="relative h-[68vh] w-full text-white">
          
          {/* Visual Backdrop Layer */}
          <div className="absolute inset-0 overflow-hidden rounded-b-[4.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.12)] bg-theme-primary">
            <img 
                src={config.heroImage || "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200"} 
                alt="Hero" 
                className="absolute inset-0 w-full h-full object-cover opacity-85" 
            />
            <div 
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, var(--primary) 10%, color-mix(in srgb, var(--primary), transparent 45%) 40%, transparent 100%)` }}
            ></div>
          </div>
          
          {/* Header Bar */}
          <div className="absolute top-10 left-0 right-0 px-8 flex justify-between items-center z-50">
              <LanguageToggle lang={lang} setLang={setLang} />
              <WeatherPill coordinates={config.coordinates} city={config.city} />
          </div>

          {/* Text Content Layer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center pt-16 pointer-events-none">
              <h2 className="text-white text-[10px] font-black uppercase tracking-[0.5em] font-serif mb-4 drop-shadow-md">{config.propertyName}</h2>
              <h1 className="text-6xl font-serif text-white font-bold leading-none mb-6 drop-shadow-2xl italic tracking-tighter">
                {getGreeting()}.
              </h1>
              <p className="text-white/85 text-sm font-medium leading-relaxed tracking-tight max-w-[280px]">
                {tc(config.heroTitle)}
              </p>
          </div>
        </div>

        {/* Daily Curator Widget */}
        <div className="relative z-20 px-6 -mt-16 mb-10 pt-4">
            <DailyPlanner config={config} weatherData={weatherData} onOpenGuide={() => setActiveTab('guide')} />
        </div>

        {/* Gazette Section */}
        <div className="px-6 mb-6">
          {filteredGazette.length > 0 && (
              <div className="space-y-8">
                <div className="text-center px-4 py-8 border-y border-theme-primary/5">
                    <h3 className="font-serif text-[36px] font-bold text-theme-primary tracking-tighter leading-none mb-3 italic">The {config.city || 'Šibenik'} Insider</h3>
                    <div className="flex items-center justify-center gap-4 text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">
                        <span>{new Date().toLocaleDateString(lang, { day: '2-digit', month: 'long' }).toUpperCase()}</span>
                        <div className="w-1 h-1 rounded-full bg-theme-secondary/40"></div>
                        <span>Vol. 1 - No. {new Date().getDate()}</span>
                    </div>
                </div>
                
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-6 px-2 pb-10">
                    {filteredGazette.map((page, idx) => {
                      const displayTag = tc(page.tag) || (page.category === 'EDITORIAL' ? 'Host Note' : page.category === 'LOCAL_DISCOVERY' ? 'Explore' : page.category === 'UPSELL_OFFER' ? 'Offer' : 'Update');
                      
                      return (
                        <div key={page.id} onClick={() => setActiveGazettePage(page)} 
                          className="min-w-[92%] snap-center bg-white rounded-[3.5rem] relative overflow-hidden h-[620px] cursor-pointer group active:scale-[0.99] transition-all flex flex-col border border-white"
                          style={{
                            boxShadow: `
                              0 40px 100px -30px color-mix(in srgb, var(--primary), transparent 96%),
                              0 20px 40px -20px color-mix(in srgb, var(--primary), transparent 97%),
                              0 10px 20px -10px color-mix(in srgb, var(--primary), transparent 98%)
                            `
                          }}
                        >
                            {/* Image Container: Fixed height for 100% consistency (approx 30% of card) */}
                            <div className="h-[190px] w-full overflow-hidden relative bg-slate-50 shrink-0">
                                {page.image ? (
                                  <img src={page.image} className="w-full h-full object-cover grayscale-[0.05] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-theme-primary/5 text-theme-primary/20 p-8">
                                     <Newspaper size={48} strokeWidth={1} className="mb-2 opacity-50" />
                                     <span className="text-[7px] font-black uppercase tracking-[0.4em]">{config.propertyName}</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-navy-900/5"></div>
                                <div className="absolute top-6 left-6">
                                    <span className={`px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-widest shadow-2xl text-white ${page.category === 'UPSELL_OFFER' ? 'bg-theme-secondary' : 'bg-theme-primary'}`}>
                                        {displayTag}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 p-10 pt-8 flex flex-col justify-between relative bg-white">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
                                
                                <div className="relative z-10">
                                    <h4 className="font-serif font-black text-theme-primary text-[28px] leading-[1.15] mb-4 tracking-tighter group-hover:text-theme-secondary transition-colors line-clamp-3 italic">
                                        {resolvePlaceholders(tc(page.title), config, lang)}
                                    </h4>
                                    <div className="w-10 h-[1px] bg-theme-secondary/20 mb-4"></div>
                                    <p className="font-serif italic text-base leading-relaxed text-slate-500 line-clamp-4">
                                        {resolvePlaceholders(tc(page.content), config, lang)}
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto relative z-10">
                                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-theme-primary/60 group-hover:text-theme-primary transition-all">Open Article</span>
                                    <div className="w-12 h-12 rounded-full bg-theme-primary flex items-center justify-center text-white transition-all shadow-lg group-hover:scale-110 active:scale-95">
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </div>
                      );
                    })}
                </div>
              </div>
          )}
        </div>

        {/* The Echo Highlight Card */}
        <div className="relative z-20 px-6 mb-16">
          <button 
            onClick={() => setActiveTab('tips')}
            className="w-full bg-[#fdf6e9] rounded-[4rem] p-12 text-left relative overflow-hidden group active:scale-[0.98] transition-all border border-white"
            style={{
                boxShadow: `
                  0 60px 120px -30px rgba(197,160,40,0.18),
                  0 30px 60px -20px rgba(0,0,0,0.03)
                `
            }}
          >
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-gold-500/10 rounded-full blur-[90px] group-hover:bg-theme-secondary/20 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-theme-primary/5 rounded-full blur-[60px]"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-white text-theme-secondary rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(197,160,40,0.4)] border border-gold-100 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <Heart size={26} fill="currentColor" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <SparklesIcon size={12} className="text-theme-secondary animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-theme-secondary/80">{t('tipsSubtitle')}</p>
                    </div>
                    <h3 className="text-[32px] font-serif font-black text-theme-primary italic tracking-tighter leading-none">{t('tipsTitle')}</h3>
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-theme-secondary/20 pl-10 mb-14">
                 <p className="text-[21px] font-serif text-slate-800 leading-relaxed italic drop-shadow-sm">
                   {t('echo_desc')}
                 </p>
              </div>

              <div className="mt-auto pt-10 border-t border-gold-500/20 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 group-hover:text-theme-primary transition-colors">{t('open_pinnwall')}</span>
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-theme-primary group-hover:bg-theme-primary group-hover:text-white transition-all shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] border border-gold-50/50">
                  <ArrowRight size={28} />
                </div>
              </div>
            </div>
          </button>
        </div>
    </div>
  );
};
