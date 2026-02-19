
import React, { useState, useEffect, useMemo } from 'react';
import { Newspaper, Library, Plus, Trash2, ArrowUpCircle, Sparkles, Upload, Loader2, Navigation, MessageCircle, Info, Calendar, Copy, ChevronRight, Clock, Zap, Check, Wand2, CopyPlus, ArrowLeftRight, Repeat, EyeOff } from 'lucide-react';
import { AppConfig, Language, LocalizedContent, GazettePage, GazetteCategory } from '../../types';
import { MultiLangInput } from './Shared';
import { propertyService, generateId } from '../../services/supabase';
import { tc, t as translate } from '../../translations';
import { compressImage, base64ToBlob } from '../../utils/image';

const CATEGORIES: { id: GazetteCategory; label: string; icon: any }[] = [
    { id: 'EDITORIAL', label: 'Editorial', icon: Info },
    { id: 'LOCAL_DISCOVERY', label: 'Discovery', icon: Navigation },
    { id: 'UPSELL_OFFER', label: 'Offer', icon: Sparkles },
    { id: 'EVENT', label: 'Event', icon: ArrowUpCircle }
];

interface GazetteProps {
    prop: AppConfig;
    editLang: Language;
    setEditLang: (l: Language) => void;
    updateProperty: (key: keyof AppConfig, value: any) => void;
    uiLang: Language;
}

export const GazetteSection = ({ prop, editLang, setEditLang, updateProperty, uiLang }: GazetteProps) => {
  const [presets, setPresets] = useState<any[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [optimizingIdx, setOptimizingIdx] = useState<number | null>(null);

  const weekTabs = useMemo(() => {
    const tabs = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        const count = prop.gazette.filter(p => p.scheduledDate === iso).length;
        tabs.push({
            date: iso,
            day: i === 0 ? translate('admin_gazette_today', uiLang) : i === 1 ? translate('admin_gazette_tomorrow', uiLang) : d.toLocaleDateString(uiLang, { weekday: 'short' }),
            display: d.toLocaleDateString(uiLang, { day: '2-digit', month: '2-digit' }),
            count
        });
    }
    return tabs;
  }, [prop.gazette, uiLang]);

  const [activeTabDate, setActiveTabDate] = useState(weekTabs[0].date);

  useEffect(() => {
    const loadPresets = async () => {
      const { data } = await propertyService.getGlobalPresets();
      if (data) setPresets(data);
    };
    loadPresets();
  }, []);

  const filteredGazette = useMemo(() => {
    return prop.gazette
        .map((p, originalIdx) => ({ ...p, originalIdx }))
        .filter(page => page.scheduledDate === activeTabDate || (!page.scheduledDate && activeTabDate === weekTabs[0].date));
  }, [prop.gazette, activeTabDate, weekTabs]);

  const handleImageUpload = (originalIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const pid = window.location.search.match(/pid=([^&]+)/)?.[1];
    
    if (file && pid) {
      setOptimizingIdx(originalIndex);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const optimizedBase64 = await compressImage(reader.result as string);
          const blob = await base64ToBlob(optimizedBase64);
          const publicUrl = await propertyService.uploadImage(pid, blob, file.name);
          
          const newGazette = [...prop.gazette];
          newGazette[originalIndex].image = publicUrl;
          updateProperty('gazette', newGazette);
        } catch (err) {
          console.error("Gazette image upload failed", err);
        } finally {
          setOptimizingIdx(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateLocalized = (current: LocalizedContent, newValue: string) => {
    return { ...current, [editLang]: newValue };
  };

  const addFromPreset = (preset: any) => {
    const newPage: GazettePage = {
      id: generateId(),
      type: preset.type || 'editorial',
      category: preset.category || 'EDITORIAL',
      tag: preset.tag,
      title: preset.title,
      content: preset.content,
      longContent: preset.longContent,
      image: preset.image_url,
      cta: preset.cta,
      ctaConfig: preset.cta_config || { type: 'none', label: { en: 'Inquire' } },
      scheduledDate: activeTabDate
    };
    updateProperty('gazette', [...prop.gazette, newPage]);
    setShowPresets(false);
  };

  const removePage = (originalIndex: number) => {
    if (confirm("Delete this entry?")) {
        const newGazette = prop.gazette.filter((_, i) => i !== originalIndex);
        updateProperty('gazette', newGazette);
    }
  };

  const duplicateToNextDay = (originalIndex: number) => {
    const currentPage = prop.gazette[originalIndex];
    const d = new Date(activeTabDate);
    d.setDate(d.getDate() + 1);
    const nextDayStr = d.toISOString().split('T')[0];

    const newPage: GazettePage = {
        ...JSON.parse(JSON.stringify(currentPage)),
        id: generateId(),
        scheduledDate: nextDayStr
    };
    
    updateProperty('gazette', [...prop.gazette, newPage]);
    setActiveTabDate(nextDayStr);
  };

  const copyToFullWeek = (originalIndex: number) => {
    if (!confirm("Duplicate this for the entire week?")) return;
    
    const currentPage = prop.gazette[originalIndex];
    const newItems: GazettePage[] = [];
    
    weekTabs.forEach(tab => {
        if (tab.date === activeTabDate) return; 
        newItems.push({
            ...JSON.parse(JSON.stringify(currentPage)),
            id: generateId(),
            scheduledDate: tab.date
        });
    });
    
    updateProperty('gazette', [...prop.gazette, ...newItems]);
  };

  const importFromYesterday = () => {
    const d = new Date(activeTabDate);
    d.setDate(d.getDate() - 1);
    const yesterdayStr = d.toISOString().split('T')[0];
    
    const yesterdayItems = prop.gazette.filter(p => p.scheduledDate === yesterdayStr);
    if (yesterdayItems.length === 0) {
        alert("No entries from yesterday to copy.");
        return;
    }
    
    const newItems = yesterdayItems.map(p => ({
        ...JSON.parse(JSON.stringify(p)),
        id: generateId(),
        scheduledDate: activeTabDate
    }));
    
    updateProperty('gazette', [...prop.gazette, ...newItems]);
  };

  const updatePage = (originalIndex: number, updates: Partial<GazettePage>) => {
      const newGazette = [...prop.gazette];
      newGazette[originalIndex] = { ...newGazette[originalIndex], ...updates };
      updateProperty('gazette', newGazette);
  };

  return (
    <div className="space-y-10 animate-[fadeIn_0.4s_ease-out] pb-20">
      
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="bg-navy-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-1">
          <div className="absolute top-0 right-0 p-8 opacity-20"><Zap size={80} /></div>
          <div className="relative z-10">
            <h4 className="text-3xl font-serif font-black mb-2 italic text-gold-500">{translate('admin_gazette_weekly_cmd', uiLang)}</h4>
            <p className="text-white/40 font-black text-[10px] uppercase tracking-widest">{translate('admin_gazette_weekly_desc', uiLang)}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowPresets(!showPresets)}
          className="bg-gold-500 text-navy-900 p-10 rounded-[3.5rem] shadow-xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all"
        >
          <Library size={32} />
          <span className="font-black text-[10px] uppercase tracking-widest">{translate('admin_gazette_presets', uiLang)}</span>
        </button>
      </div>

      <div className="flex bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 gap-2 overflow-x-auto no-scrollbar sticky top-4 z-[200]">
         {weekTabs.map(tab => (
           <button 
            key={tab.date}
            onClick={() => setActiveTabDate(tab.date)}
            className={`flex-1 min-w-[85px] flex flex-col items-center justify-center py-4 rounded-[2rem] transition-all relative
              ${activeTabDate === tab.date ? 'bg-navy-900 text-white shadow-xl scale-[1.03] z-10' : 'bg-transparent text-slate-400 hover:bg-slate-50'}`}
           >
            {tab.count > 0 && (
                <span className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${activeTabDate === tab.date ? 'bg-gold-500 text-navy-900 border-navy-900' : 'bg-navy-900 text-white border-white'}`}>
                    {tab.count}
                </span>
            )}
            <span className="font-black text-[8px] uppercase tracking-tighter mb-0.5">{tab.day}</span>
            <span className="font-serif font-black text-sm italic">{tab.display}</span>
           </button>
         ))}
      </div>

      {showPresets && (
        <div className="bg-white border-4 border-gold-100 rounded-[4rem] p-10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-[slideUp_0.3s_ease-out]">
          <h5 className="col-span-full font-serif font-black text-navy-900 text-2xl mb-4 flex items-center gap-3">
            <Sparkles className="text-gold-500" /> {translate('admin_gazette_presets', uiLang)}
          </h5>
          {presets.map(p => (
            <button key={p.id} onClick={() => addFromPreset(p)} className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between hover:bg-navy-900 hover:text-white transition-all group">
              <div className="text-left">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{p.category || p.type}</span>
                <p className="font-bold text-sm leading-tight">{tc(p.title, editLang)}</p>
              </div>
              <Plus size={20} className="text-gold-500 group-hover:rotate-90 transition-all" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-16">
        {filteredGazette.length > 0 ? filteredGazette.map((page) => (
          <div key={page.id} className="relative bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-navy-900 text-white rounded-full flex items-center justify-center font-serif font-black italic shadow-xl z-20">
              {page.originalIdx + 1}
            </div>
            
            <div className="flex justify-between items-start mb-10">
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat.id} 
                            onClick={() => updatePage(page.originalIdx, { category: cat.id })}
                            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${page.category === cat.id ? 'bg-navy-900 text-white border-navy-900' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                        >
                            <cat.icon size={12} /> {cat.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => copyToFullWeek(page.originalIdx)} 
                        title={translate('admin_gazette_fill_week', uiLang)}
                        className="p-4 text-slate-300 hover:text-navy-900 transition-all bg-slate-50 rounded-2xl flex items-center gap-2"
                    >
                        <Repeat size={18} />
                        <span className="text-[9px] font-black uppercase">{translate('admin_gazette_fill_week', uiLang)}</span>
                    </button>
                    <button 
                        onClick={() => duplicateToNextDay(page.originalIdx)} 
                        title={translate('admin_gazette_to_tomorrow', uiLang)}
                        className="bg-gold-500/10 text-gold-600 p-4 rounded-2xl flex items-center gap-2 hover:bg-gold-500 hover:text-white transition-all shadow-sm"
                    >
                        <Zap size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{translate('admin_gazette_to_tomorrow', uiLang)}</span>
                    </button>
                    <button 
                        onClick={() => removePage(page.originalIdx)} 
                        className="p-4 text-red-300 hover:text-red-600 hover:bg-red-50 transition-all bg-slate-50 rounded-2xl"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-6">
                    <MultiLangInput 
                        label={translate('admin_label_headline', uiLang)} 
                        value={page.title} 
                        editLang={editLang}
                        setEditLang={setEditLang}
                        onChange={(val) => {
                            const newGazette = [...prop.gazette];
                            newGazette[page.originalIdx].title = updateLocalized(newGazette[page.originalIdx].title, val);
                            updateProperty('gazette', newGazette);
                        }} 
                        onFullUpdate={(full) => {
                            const newGazette = [...prop.gazette];
                            newGazette[page.originalIdx].title = full;
                            updateProperty('gazette', newGazette);
                        }}
                    />
                    
                    <MultiLangInput 
                        label={translate('admin_label_content', uiLang)} 
                        value={page.longContent || page.content} 
                        editLang={editLang}
                        setEditLang={setEditLang}
                        isTextArea 
                        onChange={(val) => {
                            const newGazette = [...prop.gazette];
                            newGazette[page.originalIdx].content = updateLocalized(newGazette[page.originalIdx].content, val);
                            newGazette[page.originalIdx].longContent = updateLocalized(newGazette[page.originalIdx].longContent || { en: '' }, val);
                            updateProperty('gazette', newGazette);
                        }} 
                        onFullUpdate={(full) => {
                            const newGazette = [...prop.gazette];
                            newGazette[page.originalIdx].content = full;
                            newGazette[page.originalIdx].longContent = full;
                            updateProperty('gazette', newGazette);
                        }}
                    />

                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">{translate('admin_label_action', uiLang)}</label>
                                <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl">
                                    {[
                                        { id: 'none', icon: EyeOff },
                                        { id: 'whatsapp', icon: MessageCircle },
                                        { id: 'nav', icon: Navigation },
                                        { id: 'internal_modal', icon: Library }
                                    ].map(type => (
                                        <button 
                                            key={type.id}
                                            onClick={() => updatePage(page.originalIdx, { ctaConfig: { ...(page.ctaConfig || { label: { en: 'Inquire' }, type: 'none' }), type: type.id as any } })}
                                            className={`flex-1 py-3 rounded-xl flex items-center justify-center border transition-all ${ (page.ctaConfig?.type || 'none') === type.id ? 'bg-navy-900 text-white shadow-md' : 'bg-transparent text-slate-300 border-transparent hover:text-navy-900'}`}
                                        >
                                            <type.icon size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">{translate('admin_label_btn_text', uiLang)}</label>
                                <input 
                                    disabled={(page.ctaConfig?.type || 'none') === 'none'}
                                    value={page.ctaConfig?.label ? tc(page.ctaConfig.label, editLang) : ''}
                                    onChange={(e) => updatePage(page.originalIdx, { ctaConfig: { ...(page.ctaConfig || { type: 'whatsapp' }), label: updateLocalized(page.ctaConfig?.label || { en: '' }, e.target.value) } })}
                                    className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-bold text-xs disabled:opacity-30"
                                    placeholder="e.g. Inquire now"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{translate('admin_label_image', uiLang)}</label>
                    <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border-2 border-slate-100 bg-slate-50 group/img">
                        {page.image ? (
                            <img src={page.image} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
                                <Upload size={32} />
                                <span className="text-[8px] font-black uppercase">{translate('admin_label_no_image', uiLang)}</span>
                            </div>
                        )}
                        <label className="absolute inset-0 cursor-pointer bg-navy-900/0 hover:bg-navy-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                            {optimizingIdx === page.originalIdx ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(page.originalIdx, e)} />
                        </label>
                    </div>
                </div>
            </div>
          </div>
        )) : (
          <div className="py-24 text-center border-4 border-dashed border-slate-100 rounded-[4rem] bg-white/50 space-y-8">
             <div className="space-y-4">
                <Calendar size={48} className="mx-auto text-slate-200" />
                <h3 className="font-serif font-black text-2xl text-slate-300 italic uppercase tracking-tighter">{translate('admin_gazette_empty_title', uiLang)}</h3>
             </div>
             
             <div className="flex flex-col md:flex-row justify-center gap-4 px-10">
                <button 
                    onClick={importFromYesterday}
                    className="bg-navy-900 text-white px-8 py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
                >
                    <CopyPlus size={18} className="text-gold-500" /> {translate('admin_gazette_copy_yesterday', uiLang)}
                </button>
                <button 
                    onClick={() => updateProperty('gazette', [...prop.gazette, { 
                        id: generateId(), category: 'EDITORIAL', type: 'editorial', tag: { en: 'Daily' }, title: { en: 'New Entry' }, content: { en: '' }, scheduledDate: activeTabDate, ctaConfig: { type: 'none', label: { en: 'Inquire' } } 
                    }])}
                    className="bg-white text-navy-900 border-2 border-slate-100 px-8 py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-sm hover:border-navy-900 transition-all"
                >
                    <Plus size={18} /> {translate('admin_gazette_create_new', uiLang)}
                </button>
             </div>
          </div>
        )}
      </div>

      {filteredGazette.length > 0 && (
          <button 
            onClick={() => updateProperty('gazette', [...prop.gazette, { 
              id: generateId(), 
              category: 'EDITORIAL', 
              type: 'editorial', 
              tag: { en: 'Daily Update', de: 'Tagespost' }, 
              title: { en: 'New Article', de: 'Neuer Beitrag' }, 
              content: { en: '', de: '' }, 
              scheduledDate: activeTabDate,
              ctaConfig: { type: 'none', label: { en: 'Inquire', de: 'Anfragen' } } 
            }])}
            className="w-full border-4 border-dashed border-slate-200 p-12 rounded-[4rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-navy-900 hover:text-navy-900 transition-all group bg-white/50"
          >
            <Plus size={48} className="group-hover:scale-125 transition-all text-gold-500" />
            <span className="font-black uppercase tracking-[0.4em] text-xs text-slate-400 group-hover:text-navy-900">{translate('admin_gazette_create_new', uiLang)} ({weekTabs.find(t => t.date === activeTabDate)?.display})</span>
          </button>
      )}
    </div>
  );
};
