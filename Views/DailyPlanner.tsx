
import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, ArrowRight, Coffee, Utensils, Landmark, Footprints, X, Zap, Users, User, Heart, Sun, Moon, CloudSun, Camera, MapPin, ShoppingBag, Waves, Car, Check, Loader2 } from 'lucide-react';
import { AppConfig, Recommendation } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { propertyService } from '../../../services/supabase';
import { generateSmartItinerary, Itinerary } from '../../../services/aiPlanner';

interface DailyPlannerProps {
  config: AppConfig;
  weatherData: { temp: number; code: number } | null;
  onOpenGuide: () => void;
}

interface Answers {
  crew?: string;
  energy?: string;
  interests: string[];
  mobility?: string;
  pace?: string;
  focus?: string;
}

export const DailyPlanner = ({ config, weatherData, onOpenGuide }: DailyPlannerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({ interests: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const { t, tc } = useLanguage();

  const weatherAdvice = useMemo(() => {
    if (!weatherData) return "";
    if (weatherData.code >= 51) return t('weather_rain');
    if (weatherData.temp > 28) return t('weather_hot');
    return t('weather_mild');
  }, [weatherData, t]);

  const toggleInterest = (id: string) => {
    setAnswers(prev => ({
      ...prev,
      interests: prev.interests.includes(id) 
        ? prev.interests.filter(i => i !== id) 
        : [...prev.interests, id]
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStep(6); // Gehe zum Result-Screen
    try {
      const plan = await generateSmartItinerary(config, answers, weatherData);
      setItinerary(plan);
      
      // Speicher das Ergebnis im Backend
      const pid = window.location.search.match(/pid=([^&]+)/)?.[1];
      if (pid) {
          propertyService.savePlannerItinerary(pid, {
              guest_type: answers.crew || 'solo',
              energy_level: answers.energy || 'balanced',
              focus: answers.focus || 'general',
              morning_poi_id: plan.morning.id,
              afternoon_poi_id: plan.afternoon.id,
              evening_poi_id: plan.evening.id
          });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({ interests: [] });
    setItinerary(null);
  };

  const handleNext = () => setStep(s => s + 1);

  return (
    <>
      <div className="bg-white rounded-[3.5rem] p-10 shadow-[0_40px_80px_-20px_rgba(10,36,114,0.15)] border border-white animate-[fadeIn_0.5s_ease-out]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-theme-secondary/10 text-theme-secondary rounded-2xl flex items-center justify-center">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-theme-primary italic tracking-tight">{t('planner_title')}</h3>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">{weatherAdvice}</p>
          </div>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); reset(); }}
          className="w-full bg-theme-primary text-white py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
        >
          {t('planner_btn')} <ArrowRight size={18} />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[4000] flex items-end justify-center">
          <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-[#fcfcf7] w-full max-w-lg h-[94vh] rounded-t-[3.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col border-t-4 border-black/5 animate-slideUp">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
            
            <div className="pt-10 px-10 pb-4 flex justify-between items-center relative z-20 shrink-0">
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white rounded-full shadow-lg text-theme-primary border border-slate-100 active:scale-90 transition-all"><X size={20} /></button>
                <div className="flex-1 px-8">
                    <div className="h-1 bg-slate-100 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-theme-secondary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(197,160,40,0.5)]" style={{ width: `${(step / 6) * 100}%` }}></div>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-theme-secondary/20 flex items-center justify-center font-serif font-black italic text-theme-secondary text-sm">
                    {step < 6 ? step + 1 : '✓'}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar relative z-20 px-10 pb-32">
                {step === 0 && (
                    <div className="space-y-10 py-6 animate-fadeIn">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-theme-secondary">Step 1</span>
                            <h2 className="text-4xl font-serif font-black text-theme-primary italic leading-none">{t('planner_q0')}</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'solo', icon: User, label: t('planner_q0_a1') },
                                { id: 'couple', icon: Heart, label: t('planner_q0_a2') },
                                { id: 'family', icon: Users, label: t('planner_q0_a3') },
                                { id: 'friends', icon: Zap, label: t('planner_q0_a4') }
                            ].map(item => (
                                <button key={item.id} onClick={() => { setAnswers({...answers, crew: item.id}); handleNext(); }} className="bg-white p-7 rounded-[2rem] flex items-center gap-6 border border-slate-100 shadow-sm hover:shadow-xl active:scale-[0.98] transition-all">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-theme-primary"><item.icon size={22} /></div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-10 py-6 animate-fadeIn">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-theme-secondary">Step 2</span>
                            <h2 className="text-4xl font-serif font-black text-theme-primary italic leading-none">{t('planner_q1')}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'chill', icon: Coffee, label: t('planner_q1_a1') },
                                { id: 'balanced', icon: CloudSun, label: t('planner_q1_a2') },
                                { id: 'high', icon: Zap, label: t('planner_q1_a3') },
                                { id: 'social', icon: Users, label: 'Social & Lively' }
                            ].map(item => (
                                <button key={item.id} onClick={() => { setAnswers({...answers, energy: item.id}); handleNext(); }} className="bg-white p-8 rounded-[2.5rem] flex flex-col items-center gap-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                    <div className="w-14 h-14 bg-slate-50 rounded-3xl flex items-center justify-center text-theme-primary"><item.icon size={28} /></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-10 py-6 animate-fadeIn">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-theme-secondary">Step 3</span>
                            <h2 className="text-4xl font-serif font-black text-theme-primary italic leading-none">{t('planner_q2')}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'hidden-gem', icon: Sparkles, label: t('filter_hidden_gem') },
                                { id: 'food', icon: Utensils, label: t('filter_food') },
                                { id: 'nature', icon: Waves, label: t('filter_nature') },
                                { id: 'culture', icon: Landmark, label: t('filter_culture') },
                                { id: 'activity', icon: Footprints, label: t('filter_activity') },
                                { id: 'shopping', icon: ShoppingBag, label: 'Shopping' }
                            ].map(item => {
                                const isSelected = answers.interests.includes(item.id);
                                return (
                                    <button key={item.id} onClick={() => toggleInterest(item.id)} className={`p-6 rounded-[2rem] flex flex-col items-center gap-4 border-2 transition-all ${isSelected ? 'bg-theme-primary border-theme-primary text-white shadow-xl scale-105' : 'bg-white border-slate-50 text-slate-400'}`}>
                                        <item.icon size={22} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                        {isSelected && <Check size={14} className="absolute top-4 right-4" />}
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={handleNext} disabled={answers.interests.length === 0} className="w-full bg-theme-primary text-white py-6 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-30">Continue</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-10 py-6 animate-fadeIn">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-theme-secondary">Step 4</span>
                            <h2 className="text-4xl font-serif font-black text-theme-primary italic leading-none">{t('planner_q3')}</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'foot', icon: Footprints, label: t('planner_q3_a1') },
                                { id: 'car', icon: Car, label: t('planner_q3_a2') },
                                { id: 'sea', icon: Waves, label: t('planner_q3_a3') }
                            ].map(item => (
                                <button key={item.id} onClick={() => { setAnswers({...answers, mobility: item.id}); handleNext(); }} className="bg-white p-7 rounded-[2rem] flex items-center gap-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-theme-primary"><item.icon size={22} /></div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-10 py-6 animate-fadeIn">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-theme-secondary">Step 5</span>
                            <h2 className="text-4xl font-serif font-black text-theme-primary italic leading-none">{t('planner_q4')}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'slow', icon: Coffee, label: t('planner_q4_a1') },
                                { id: 'action', icon: Zap, label: t('planner_q4_a2') }
                            ].map(item => (
                                <button key={item.id} onClick={() => { setAnswers({...answers, pace: item.id}); handleNext(); }} className="bg-white p-10 rounded-[3rem] flex flex-col items-center gap-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                    <div className="w-14 h-14 bg-slate-50 rounded-3xl flex items-center justify-center text-theme-primary"><item.icon size={28} /></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-10 py-6 animate-fadeIn">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-theme-secondary">Final Choice</span>
                            <h2 className="text-4xl font-serif font-black text-theme-primary italic leading-none">{t('planner_q5')}</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'photo', icon: Camera, label: t('planner_q5_a1') },
                                { id: 'history', icon: Landmark, label: t('planner_q5_a2') },
                                { id: 'hidden', icon: Sparkles, label: t('planner_q5_a3') }
                            ].map(item => (
                                <button key={item.id} onClick={() => { setAnswers({...answers, focus: item.id}); handleGenerate(); }} className="bg-white p-7 rounded-[2rem] flex items-center gap-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="w-12 h-12 bg-slate-50 group-hover:bg-theme-primary group-hover:text-white rounded-2xl flex items-center justify-center text-theme-primary transition-colors"><item.icon size={22} /></div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 6 && (
                    <div className="animate-fadeIn pb-10">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-8">
                                <div className="relative">
                                    <Loader2 className="animate-spin text-theme-primary" size={64} />
                                    <Sparkles className="absolute -top-2 -right-2 text-theme-secondary animate-pulse" size={24} />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-theme-primary">Künstliche Intelligenz arbeitet...</p>
                                    <h2 className="text-2xl font-serif font-black italic">Kuratiere deinen perfekten Tag</h2>
                                </div>
                            </div>
                        ) : itinerary && (
                            <>
                                <div className="text-center mb-12 space-y-4">
                                    <div className="w-20 h-20 bg-theme-primary text-white rounded-[2.5rem] flex items-center justify-center mb-4 shadow-2xl mx-auto rotate-12 scale-110"><Zap size={32} fill="currentColor" /></div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-theme-secondary">{t('planner_result')}</p>
                                        <h2 className="text-4xl font-serif font-black text-theme-primary italic tracking-tight">{answers.crew?.toUpperCase()} EDITION</h2>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-sm text-slate-600 font-serif leading-relaxed">
                                        "{itinerary.reasoning}"
                                    </div>
                                </div>

                                <div className="space-y-16 relative">
                                    <div className="absolute left-[23px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-200 z-0"></div>

                                    {/* Morning */}
                                    <div className="relative pl-16 group">
                                        <div className="absolute left-0 top-0 w-12 h-12 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-theme-secondary shadow-xl z-10 transition-transform group-hover:scale-110">
                                            <CloudSun size={20} />
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">09:00 - Morning Awakening</p>
                                            {/* Fixed: Render localized title using tc() */}
                                            <h3 className="font-serif font-black text-3xl text-theme-primary italic leading-tight">{tc(itinerary.morning.title)}</h3>
                                            <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white" onClick={onOpenGuide}>
                                                <img src={itinerary.morning.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                            </div>
                                            {/* Fixed: Render localized description using tc() */}
                                            <p className="text-slate-600 font-serif italic text-lg leading-relaxed px-2">"{tc(itinerary.morning.description)}"</p>
                                        </div>
                                    </div>

                                    {/* Afternoon */}
                                    <div className="relative pl-16 group">
                                        <div className="absolute left-0 top-0 w-12 h-12 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-theme-secondary shadow-xl z-10 transition-transform group-hover:scale-110">
                                            <Sun size={20} />
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">13:30 - Afternoon Peak</p>
                                            {/* Fixed: Render localized title using tc() */}
                                            <h3 className="font-serif font-black text-3xl text-theme-primary italic leading-tight">{tc(itinerary.afternoon.title)}</h3>
                                            <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white" onClick={onOpenGuide}>
                                                <img src={itinerary.afternoon.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                            </div>
                                            {/* Fixed: Render localized description using tc() */}
                                            <p className="text-slate-600 font-serif italic text-lg leading-relaxed px-2">"{tc(itinerary.afternoon.description)}"</p>
                                        </div>
                                    </div>

                                    {/* Evening */}
                                    <div className="relative pl-16 group">
                                        <div className="absolute left-0 top-0 w-12 h-12 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-theme-secondary shadow-xl z-10 transition-transform group-hover:scale-110">
                                            <Moon size={20} />
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">19:30 - Evening Indulgence</p>
                                            {/* Fixed: Render localized title using tc() */}
                                            <h3 className="font-serif font-black text-3xl text-theme-primary italic leading-tight">{tc(itinerary.evening.title)}</h3>
                                            <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white" onClick={onOpenGuide}>
                                                <img src={itinerary.evening.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                            </div>
                                            {/* Fixed: Render localized description using tc() */}
                                            <p className="text-slate-600 font-serif italic text-lg leading-relaxed px-2">"{tc(itinerary.evening.description)}"</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {step < 6 && (
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#fcfcf7] via-[#fcfcf7] to-transparent z-40">
                    <div className="flex gap-4">
                        {step > 0 && (
                            <button onClick={() => setStep(s => s - 1)} className="p-6 bg-white rounded-[2rem] border border-slate-100 text-slate-400 active:scale-90 transition-all">
                                <X size={24} className="rotate-45" />
                            </button>
                        )}
                        <div className="flex-1 flex items-center justify-center bg-theme-primary/5 rounded-[2rem] border border-theme-primary/10">
                             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-theme-primary animate-pulse">Question {step + 1} / 6</span>
                        </div>
                    </div>
                </div>
            )}

            {step === 6 && !isGenerating && (
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#fcfcf7] via-[#fcfcf7] to-transparent z-40 flex gap-3">
                    <button onClick={reset} className="flex-1 bg-white border border-slate-100 text-slate-400 py-6 rounded-3xl font-black text-[9px] uppercase tracking-widest shadow-xl">Reset</button>
                    <button onClick={() => setIsModalOpen(false)} className="flex-[2] bg-theme-primary text-white py-6 rounded-3xl font-black text-[9px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Schließen</button>
                </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
