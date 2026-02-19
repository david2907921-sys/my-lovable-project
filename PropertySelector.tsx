
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, ChevronRight, Plus, Library, Sparkles, Loader2, Trash2, 
  Globe, RefreshCw, Edit3, Save, X, MapPin, Newspaper, BookOpen, Search, Filter, Upload, Navigation, Copy, Link, Wand2, Tag,
  ChevronDown, Moon, Coffee, Utensils, Music, Landmark, Waves, Footprints, Bus, MessageCircle, ArrowUpCircle, EyeOff, Languages, DollarSign
} from 'lucide-react';
import { Language, AppConfig, LocalizedContent, Recommendation, GazetteCategory, CTAConfig } from '../../types';
import { propertyService, supabase, authService, generateId } from '../../services/supabase';
import { MultiLangInput } from './Shared';
import { MagicDrawer } from './MagicDrawer';
import { tc } from '../../translations';
import { ICON_MAP, IconRenderer } from '../Common/IconRenderer';
import { compressImage, base64ToBlob } from '../../utils/image';
import { GoogleGenAI } from "@google/genai";
import { aiTranslator } from '../../services/aiTranslator';

const POI_CATEGORIES = [
    { id: 'food', label: 'Food & Dining', icon: Utensils },
    { id: 'cafes', label: 'Cafés', icon: Coffee },
    { id: 'bars', label: 'Bars', icon: Music },
    { id: 'nightlife', label: 'Nightlife', icon: Moon },
    { id: 'beach', label: 'Beach', icon: Waves },
    { id: 'sightseeing', label: 'Sightseeing', icon: MapPin },
    { id: 'culture', label: 'Culture & History', icon: Landmark },
    { id: 'activity', label: 'Activity & Sport', icon: Footprints },
    { id: 'transport', label: 'Transport', icon: Bus }
];

const GAZETTE_CATEGORIES: { id: GazetteCategory; label: string }[] = [
    { id: 'EDITORIAL', label: 'Editorial' },
    { id: 'LOCAL_DISCOVERY', label: 'Local Discovery' },
    { id: 'UPSELL_OFFER', label: 'Upsell / Offer' },
    { id: 'EVENT', label: 'Time-based Event' }
];

const TOWNS = ['Šibenik', 'Vodice', 'Skradin', 'Lozovac', 'Brodarica', 'Srima', 'Prvić', 'Zlarin', 'Tisno', 'Murter', 'Pirovac', 'Rogoznica', 'Primošten', 'Knin', 'Drniš'];

// --- SUB-COMPONENTS ---

const RegistryEditor = ({ item, onSave, onCancel, editLang, setEditLang, isSyncing }: any) => {
    const [data, setData] = useState(item.data);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [magicQuery, setMagicQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateLocalized = (current: LocalizedContent, newValue: string) => {
        return { ...current, [editLang]: newValue };
    };

    const handleMagicSearch = async () => {
        if (!magicQuery) return;
        setIsAiSearching(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Find detailed information for the place: "${magicQuery}" in or near Sibenik, Croatia. 
                Extract and return exactly this format:
                NAME: [Official Name]
                TOWN: [Nearest City/Town from predefined list: Sibenik, Vodice, Primošten, etc.]
                LAT: [Latitude]
                LNG: [Longitude]
                DESC_EN: [Short 1-sentence description in English]
                DESC_DE: [Short 1-sentence description in German]
                DESC_HR: [Short 1-sentence description in Croatian]`,
                config: { 
                    tools: [{ googleMaps: {} }],
                    toolConfig: {
                        retrievalConfig: {
                            latLng: { latitude: 43.7350, longitude: 15.8952 }
                        }
                    }
                }
            });

            const text = response.text || '';
            const extract = (regex: RegExp) => {
                const match = text.match(regex);
                return match ? match[1].trim() : null;
            };
            
            const name = extract(/NAME:\s*(.*)/i);
            const town = extract(/TOWN:\s*(.*)/i);
            const lat = parseFloat(extract(/LAT:\s*(.*)/i) || '0');
            const lng = parseFloat(extract(/LNG:\s*(.*)/i) || '0');
            const descEn = extract(/DESC_EN:\s*(.*)/i);
            const descDe = extract(/DESC_DE:\s*(.*)/i);
            const descHr = extract(/DESC_HR:\s*(.*)/i);

            if (name) {
                setData({ 
                    ...data, 
                    title: name,
                    town: town || data.town,
                    lat: lat || data.lat,
                    lng: lng || data.lng,
                    description: {
                        en: descEn || data.description?.en || '',
                        de: descDe || data.description?.de || '',
                        hr: descHr || data.description?.hr || ''
                    }
                });
                setMagicQuery('');
            }
        } catch (e) {
            console.error("AI POI Search failed", e);
            alert("Suche fehlgeschlagen.");
        } finally {
            setIsAiSearching(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const optimized = await compressImage(reader.result as string);
                const blob = await base64ToBlob(optimized);
                const url = await propertyService.uploadImage('registry', blob, file.name);
                setData({ ...data, image_url: url });
            };
            reader.readAsDataURL(file);
        } catch (e) { alert("Upload failed"); }
    };

    return (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-md" onClick={onCancel}></div>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative z-10 overflow-y-auto no-scrollbar max-h-[90vh]">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-3xl font-serif font-black text-navy-900 uppercase italic">Edit {item.type}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Entry</p>
                    </div>
                    <button onClick={onCancel} className="p-4 bg-slate-50 rounded-full text-slate-400 hover:text-navy-900 transition-all"><X size={24} /></button>
                </div>

                <div className="space-y-8">
                    {item.type === 'poi' && (
                        <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-gold-200 mb-8">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold-600 ml-2 mb-3 block flex items-center gap-2">
                                <Sparkles size={12} /> AI Magic POI Search
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        value={magicQuery} 
                                        onChange={e => setMagicQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleMagicSearch()}
                                        placeholder="Search place (e.g. Pellegrini Sibenik)..." 
                                        className="w-full bg-white rounded-2xl py-4 pl-14 pr-4 font-bold outline-none border-none shadow-sm" 
                                    />
                                </div>
                                <button 
                                    onClick={handleMagicSearch}
                                    disabled={isAiSearching || !magicQuery}
                                    className="bg-navy-900 text-white px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isAiSearching ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                    Find
                                </button>
                            </div>
                        </div>
                    )}

                    {item.type === 'gazette' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                                    <select 
                                        value={data.category || 'EDITORIAL'} 
                                        onChange={e => setData({...data, category: e.target.value})}
                                        className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none border-none text-xs"
                                    >
                                        {GAZETTE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Action Type (CTA)</label>
                                    <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-2xl">
                                        {[
                                            { id: 'none', icon: EyeOff },
                                            { id: 'whatsapp', icon: MessageCircle },
                                            { id: 'nav', icon: Navigation },
                                            { id: 'internal_modal', icon: Library }
                                        ].map(type => (
                                            <button 
                                                key={type.id}
                                                onClick={() => setData({ ...data, cta_config: { ...(data.cta_config || { label: { en: 'Action' } }), type: type.id } })}
                                                className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${ (data.cta_config?.type || 'none') === type.id ? 'bg-navy-900 text-white shadow-md' : 'text-slate-300 hover:text-navy-900'}`}
                                            >
                                                <type.icon size={16} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {item.type === 'manual' && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                                <input value={data.category} onChange={e => setData({...data, category: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none border-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Icon</label>
                                <button onClick={() => setShowIconPicker(!showIconPicker)} className="w-full bg-slate-50 rounded-2xl p-5 font-bold flex items-center justify-between border-none">
                                    <div className="flex items-center gap-3"><IconRenderer name={data.icon} /><span>{data.icon}</span></div>
                                    <ChevronDown size={18} className="text-slate-300" />
                                </button>
                                {showIconPicker && (
                                    <div className="absolute z-[8000] bg-white border border-slate-100 shadow-2xl rounded-3xl p-6 mt-2 grid grid-cols-6 gap-3 max-h-60 overflow-y-auto w-full max-w-md">
                                        {Object.keys(ICON_MAP).map(iconName => (
                                            <button key={iconName} onClick={() => { setData({...data, icon: iconName}); setShowIconPicker(false); }} className={`p-3 rounded-xl flex items-center justify-center ${data.icon === iconName ? 'bg-navy-900 text-white' : 'bg-slate-50 text-slate-400'}`}><IconRenderer name={iconName} /></button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {item.type === 'poi' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Place Name</label>
                                <input value={data.title} onChange={e => setData({...data, title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-black text-xl text-navy-900 outline-none border-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Town</label>
                                    <select value={data.town} onChange={e => setData({...data, town: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none border-none">
                                        {TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                                    <select value={data.category || 'food'} onChange={e => setData({...data, category: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none border-none">
                                        {POI_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Budget Selector */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Budget Level</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setData({ ...data, price_level: level })}
                                            className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                                                (data.price_level || 1) === level 
                                                ? 'bg-navy-900 text-gold-500 border-navy-900 shadow-lg' 
                                                : 'bg-slate-50 text-slate-300 border-slate-50 hover:border-slate-200'
                                            }`}
                                        >
                                            {"€".repeat(level)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {(item.type === 'poi' || item.type === 'gazette') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Featured Image</label>
                            <div className="relative h-40 bg-slate-50 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-slate-200 group flex items-center justify-center">
                                {data.image_url ? <img src={data.image_url} className="w-full h-full object-cover" /> : <Upload size={32} className="text-slate-200" />}
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Upload className="text-white" /></button>
                            </div>
                        </div>
                    )}

                    <MultiLangInput 
                        label="Primary Text (Title/Headline/Description)" 
                        value={item.type === 'poi' ? data.description : data.title} 
                        editLang={editLang} 
                        setEditLang={setEditLang} 
                        isTextArea={item.type === 'poi'} 
                        onChange={(v:any) => setData({...data, [item.type === 'poi' ? 'description' : 'title']: updateLocalized(item.type === 'poi' ? data.description : data.title, v)})} 
                        onFullUpdate={(full: any) => setData({...data, [item.type === 'poi' ? 'description' : 'title']: full})}
                    />
                    <MultiLangInput 
                        label="Secondary Text (Content/Tip)" 
                        value={item.type === 'poi' ? data.host_tip : data.content} 
                        editLang={editLang} 
                        setEditLang={setEditLang} 
                        isTextArea 
                        onChange={(v:any) => setData({...data, [item.type === 'poi' ? 'host_tip' : 'content']: updateLocalized(item.type === 'poi' ? data.host_tip : data.content, v)})} 
                        onFullUpdate={(full: any) => setData({...data, [item.type === 'poi' ? 'host_tip' : 'content']: full})}
                    />

                    <button onClick={() => onSave(data)} disabled={isSyncing} className="w-full bg-navy-900 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                        {isSyncing ? <Loader2 className="animate-spin" /> : <Save size={24} />} Commit to Registry
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN HUB COMPONENT ---

export const PropertySelector = ({ onSelect }: { onSelect: (config: AppConfig, id: string) => void }) => {
  const [view, setView] = useState<HubView>('fleet');
  const [data, setData] = useState<{ fleet: any[], manuals: any[], gazettes: any[], pois: any[] }>({ fleet: [], manuals: [], gazettes: [], pois: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [translateProgress, setTranslateProgress] = useState({ current: 0, total: 0 });
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editLang, setEditLang] = useState<Language>('en');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const isMaster = await authService.isAdmin();
      const session = await authService.getSession();
      let pQuery = supabase.from('properties').select('*').order('updated_at', { ascending: false });
      if (!isMaster && session?.user) pQuery = pQuery.eq('owner_id', session.user.id);

      const [p, m, g, poi] = await Promise.all([
        pQuery,
        propertyService.getManualPresets(),
        propertyService.getGazettePresets(),
        propertyService.getAllGlobalRecommendations()
      ]);

      setData({ fleet: p.data || [], manuals: m.data || [], gazettes: g.data || [], pois: poi.data || [] });
    } finally { setIsLoading(false); }
  };

  const handleTranslateAll = async () => {
      const type = view === 'registry_manuals' ? 'manual' : view === 'registry_gazette' ? 'gazette' : 'poi';
      const items = type === 'manual' ? data.manuals : type === 'gazette' ? data.gazettes : data.pois;
      
      if (!confirm(`Möchtest du wirklich ALLE ${items.length} Einträge in dieser Kategorie automatisch übersetzen? Das kann einen Moment dauern.`)) return;
      
      setIsTranslatingAll(true);
      setTranslateProgress({ current: 0, total: items.length });

      try {
          for (let i = 0; i < items.length; i++) {
              const item = items[i];
              setTranslateProgress({ current: i + 1, total: items.length });

              if (type === 'manual') {
                  const translatedTitle = await aiTranslator.translateContent(tc(item.title, 'en'), 'en');
                  const translatedContent = await aiTranslator.translateContent(tc(item.content, 'en'), 'en');
                  await propertyService.updateManualPreset(item.id, { title: translatedTitle, content: translatedContent });
              } else if (type === 'gazette') {
                  const translatedTitle = await aiTranslator.translateContent(tc(item.title, 'en'), 'en');
                  const translatedContent = await aiTranslator.translateContent(tc(item.content, 'en'), 'en');
                  const translatedLong = item.long_content ? await aiTranslator.translateContent(tc(item.long_content, 'en'), 'en') : null;
                  await propertyService.updateGazettePreset(item.id, { 
                      title: translatedTitle, 
                      content: translatedContent,
                      long_content: translatedLong
                  });
              } else if (type === 'poi') {
                  const translatedDesc = await aiTranslator.translateContent(tc(item.description, 'en'), 'en');
                  const translatedTip = await aiTranslator.translateContent(tc(item.host_tip, 'en'), 'en');
                  await propertyService.updateGlobalRecommendation(item.id, { 
                      description: translatedDesc, 
                      host_tip: translatedTip 
                  });
              }
          }
          await loadData();
          alert("Alle Übersetzungen wurden erfolgreich abgeschlossen und gespeichert!");
      } catch (e) {
          console.error("Master Translate failed", e);
          alert("Fehler während der Massenübersetzung.");
      } finally {
          setIsTranslatingAll(false);
      }
  };

  const handleAction = async (action: 'save' | 'delete' | 'duplicate', type: string, itemData: any) => {
    setIsSyncing(true);
    try {
      if (action === 'delete') {
          if (!confirm("Wirklich löschen?")) return;
          if (type === 'manual') await propertyService.deleteManualPreset(itemData.id);
          if (type === 'gazette') await propertyService.deleteGazettePreset(itemData.id);
          if (type === 'poi') await propertyService.deleteGlobalRecommendation(itemData.id);
      } else if (action === 'save') {
          const cleanData: any = { ...itemData };
          
          if (type === 'poi') {
              const poiToSave = {
                  title: cleanData.title,
                  town: cleanData.town,
                  category: cleanData.category || 'food',
                  lat: cleanData.lat,
                  lng: cleanData.lng,
                  description: cleanData.description,
                  host_tip: cleanData.host_tip,
                  image_url: cleanData.image_url,
                  price_level: cleanData.price_level || 1,
                  google_maps_url: cleanData.google_maps_url,
                  tags: cleanData.tags || []
              };
              cleanData.id ? await propertyService.updateGlobalRecommendation(cleanData.id, poiToSave) : await propertyService.createGlobalRecommendation(poiToSave);
          } else if (type === 'manual') {
              const manualToSave = {
                  category: cleanData.category,
                  icon: cleanData.icon,
                  title: cleanData.title,
                  content: cleanData.content
              };
              cleanData.id ? await propertyService.updateManualPreset(cleanData.id, manualToSave) : await propertyService.createManualPreset(manualToSave);
          } else if (type === 'gazette') {
              const gazetteToSave = {
                  type: cleanData.type || 'editorial',
                  category: cleanData.category || 'EDITORIAL',
                  tag: cleanData.tag,
                  title: cleanData.title,
                  content: cleanData.content,
                  long_content: cleanData.longContent,
                  image_url: cleanData.image_url,
                  cta_config: cleanData.cta_config
              };
              cleanData.id ? await propertyService.updateGazettePreset(cleanData.id, gazetteToSave) : await propertyService.createGazettePreset(gazetteToSave);
          }
          setEditingItem(null);
      }
      await loadData();
    } catch (e: any) { 
        console.error("Master Action failed:", e);
        alert("Action failed: " + (e.message || "Unknown error")); 
    }
    finally { setIsSyncing(false); }
  };

  if (isLoading) return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-10">
          <Loader2 className="text-gold-500 animate-spin mb-6" size={60} />
          <h2 className="text-white font-serif text-2xl font-black italic tracking-widest uppercase">Master Hub Loading...</h2>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center w-full relative">
      <div className="w-full max-w-7xl p-6 md:p-12">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-navy-900 rounded-[2rem] flex items-center justify-center text-gold-500 shadow-2xl shrink-0"><Sparkles size={40} /></div>
                <div>
                  <h1 className="text-5xl font-serif font-black text-navy-900 italic tracking-tighter uppercase leading-none">Master Hub</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-2">Enterprise Resource Management</p>
                </div>
            </div>
            <div className="flex bg-white p-1 rounded-[2rem] border border-slate-100 shadow-sm">
                {[
                    { id: 'fleet', label: 'Fleet', icon: Building2 },
                    { id: 'registry_manuals', label: 'Manuals', icon: BookOpen },
                    { id: 'registry_gazette', label: 'Gazette', icon: Newspaper },
                    { id: 'registry_pois', label: 'POI Pool', icon: MapPin }
                ].map(tab => (
                    <button key={tab.id} onClick={() => { setView(tab.id as HubView); setSearch(''); }} className={`px-6 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === tab.id ? 'bg-navy-900 text-white shadow-xl' : 'text-slate-400'}`}>
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>
        </header>

        <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white border border-slate-100 rounded-[1.5rem] py-4 pl-14 pr-6 font-bold text-navy-900 shadow-sm focus:border-navy-900 outline-none" />
                </div>
                {view !== 'fleet' && (
                    <div className="flex gap-3">
                        <button 
                            onClick={handleTranslateAll}
                            disabled={isTranslatingAll}
                            className="bg-navy-900 text-gold-500 px-8 rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] flex items-center gap-2 shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {isTranslatingAll ? <Loader2 size={18} className="animate-spin" /> : <Languages size={18} />}
                            {isTranslatingAll ? `Translating (${translateProgress.current}/${translateProgress.total})` : 'Translate All'}
                        </button>
                        <button 
                            onClick={() => {
                                if (view === 'registry_manuals') setEditingItem({ type: 'manual', data: { category: 'essentials', icon: 'Info', title: { en: '' }, content: { en: '' } } });
                                if (view === 'registry_gazette') setEditingItem({ type: 'gazette', data: { type: 'editorial', category: 'EDITORIAL', tag: { en: '' }, title: { en: '' }, content: { en: '' }, cta_config: { type: 'none', label: { en: 'Inquire' } } } });
                                if (view === 'registry_pois') setEditingItem({ type: 'poi', data: { title: '', town: 'Šibenik', category: 'food', tags: [], lat: 43.7, lng: 15.9, description: { en: '', de: '', hr: '' }, host_tip: { en: '', de: '', hr: '' }, price_level: 1, google_maps_url: '' } });
                            }}
                            className="bg-gold-500 text-navy-900 px-8 rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                        >
                            <Plus size={18} /> Add Resource
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="animate-[fadeIn_0.4s_ease-out]">
            {view === 'fleet' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.fleet.map(p => (
                        <button key={p.id} onClick={async () => {
                            const url = new URL(window.location.href);
                            url.searchParams.set('pid', p.id);
                            window.history.replaceState({}, '', url.toString());
                            const config = await propertyService.loadFullConfig(p.id);
                            onSelect(config, p.id);
                        }} className="bg-white p-8 rounded-[3.5rem] border border-white shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all text-left flex flex-col group h-full">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-navy-900 flex items-center justify-center mb-6 shadow-inner group-hover:bg-navy-900 group-hover:text-white transition-all"><Building2 size={24} /></div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-serif font-black text-navy-900 leading-[1.1] mb-3">{p.name}</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Globe size={10} /> {p.city || 'Šibenik'}</p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-navy-900/40">Manage Property</span>
                                <ChevronRight className="text-slate-200 group-hover:text-navy-900 transition-all" size={20} />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {view === 'registry_manuals' && (
                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Resource</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.manuals.filter(m => tc(m.title, 'en').toLowerCase().includes(search.toLowerCase())).map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-navy-900"><IconRenderer name={p.icon} /></div>
                                            <span className="font-bold text-navy-900 text-sm">{tc(p.title, 'en')}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5"><span className="bg-navy-900/5 text-navy-900 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{p.category}</span></td>
                                    <td className="px-8 py-5 text-right space-x-1">
                                        <button onClick={() => setEditingItem({ type: 'manual', data: p })} className="p-2 text-slate-300 hover:text-navy-900"><Edit3 size={16} /></button>
                                        <button onClick={() => handleAction('delete', 'manual', p)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {view === 'registry_pois' && (
                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">POI</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Town</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.pois.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                                                {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <MapPin className="text-slate-300" size={14} />}
                                            </div>
                                            <span className="font-bold text-navy-900 text-sm">{p.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{p.town}</td>
                                    <td className="px-8 py-5 text-right space-x-1">
                                        <button onClick={() => setEditingItem({ type: 'poi', data: p })} className="p-2 text-slate-300 hover:text-navy-900"><Edit3 size={16} /></button>
                                        <button onClick={() => handleAction('delete', 'poi', p)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {view === 'registry_gazette' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.gazettes.filter(p => tc(p.title, 'en').toLowerCase().includes(search.toLowerCase())).map(p => (
                        <div key={p.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl flex flex-col border border-slate-100 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-navy-900/5 text-navy-900 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{p.category || p.type}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setEditingItem({ type: 'gazette', data: p })} className="p-2 text-slate-300 hover:text-navy-900"><Edit3 size={16} /></button>
                                    <button onClick={() => handleAction('delete', 'gazette', p)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <h4 className="text-xl font-serif font-black text-navy-900 mb-1">{tc(p.title, 'en')}</h4>
                            <p className="text-slate-400 text-[10px] line-clamp-3 italic mb-4">"{tc(p.content, 'en')}"</p>
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${p.cta_config?.type === 'none' ? 'bg-slate-300' : 'bg-green-500'}`}></div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Action: {p.cta_config?.type || 'none'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {editingItem && (
          <RegistryEditor 
              item={editingItem} 
              editLang={editLang} 
              setEditLang={setEditLang} 
              isSyncing={isSyncing} 
              onCancel={() => setEditingItem(null)} 
              onSave={(d:any) => handleAction('save', editingItem.type, d)} 
          />
      )}

      <MagicDrawer />
    </div>
  );
};

type HubView = 'fleet' | 'registry_manuals' | 'registry_gazette' | 'registry_pois';
