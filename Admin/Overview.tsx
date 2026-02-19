
import React, { useState } from 'react';
import { AppConfig, Language, LocalizedContent } from '../../types';
import { MultiLangInput } from './Shared';
import { Sparkles, MapPin, Search, Loader2, Wand2, Navigation } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { t as translate } from '../../translations';

interface OverviewProps {
  prop: AppConfig;
  editLang: Language;
  setEditLang: (l: Language) => void;
  updateProperty: (key: keyof AppConfig, value: any) => void;
  uiLang: Language;
}

export const OverviewSection = ({ prop, editLang, setEditLang, updateProperty, uiLang }: OverviewProps) => {
  const [magicQuery, setMagicQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const updateLocalized = (current: LocalizedContent, newValue: string) => {
    return { ...current, [editLang]: newValue };
  };

  const handleMagicSearch = async () => {
    if (!magicQuery) return;
    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find the precise location and coordinates for the property: "${magicQuery}".
        Extract and return exactly this format:
        ADDRESS: [Full Street Address]
        CITY: [City Name]
        LAT: [Latitude]
        LNG: [Longitude]`,
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
      
      const addr = extract(/ADDRESS:\s*(.*)/i);
      const city = extract(/CITY:\s*(.*)/i);
      const lat = parseFloat(extract(/LAT:\s*(.*)/i) || '0');
      const lng = parseFloat(extract(/LNG:\s*(.*)/i) || '0');

      if (lat && lng) {
        updateProperty('address', addr || magicQuery);
        updateProperty('city', city || prop.city);
        updateProperty('coordinates', { lat, lng });
        setMagicQuery('');
      }
    } catch (err) {
      console.error("AI Search failed", err);
      alert("Suche fehlgeschlagen.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-10 animate-[fadeIn_0.4s_ease-out]">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm mb-10">
         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">{translate('admin_label_brand', uiLang)}</label>
         <input 
          type="text" 
          value={prop.propertyName} 
          onChange={(e) => updateProperty('propertyName', e.target.value)}
          className="w-full bg-slate-50 border-none rounded-2xl p-6 font-serif font-black text-3xl text-navy-900 focus:ring-2 focus:ring-navy-100 transition-all outline-none"
         />
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
        <h4 className="text-xl font-serif font-black text-navy-900 flex items-center gap-3 italic">
            <MapPin className="text-gold-500" /> {translate('admin_label_location', uiLang)}
        </h4>

        <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-gold-200">
            <label className="text-[10px] font-black uppercase tracking-widest text-gold-600 ml-2 mb-3 block flex items-center gap-2">
                <Sparkles size={12} /> {translate('admin_label_ai_search', uiLang)}
            </label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        value={magicQuery} 
                        onChange={e => setMagicQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleMagicSearch()}
                        placeholder="e.g. Villa Serenity Sibenik..." 
                        className="w-full bg-white rounded-2xl py-4 pl-14 pr-4 font-bold outline-none border-none shadow-sm" 
                    />
                </div>
                <button 
                    onClick={handleMagicSearch}
                    disabled={isSearching || !magicQuery}
                    className="bg-navy-900 text-white px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                    {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    Find
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{translate('admin_label_city', uiLang)}</label>
                <input value={prop.city || ''} onChange={e => updateProperty('city', e.target.value)} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none" placeholder="e.g. Šibenik" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{translate('admin_label_address', uiLang)}</label>
                <input value={prop.address || ''} onChange={e => updateProperty('address', e.target.value)} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none" placeholder="Street name and number" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{translate('admin_label_lat', uiLang)}</label>
                <input type="number" value={prop.coordinates.lat} onChange={e => updateProperty('coordinates', {...prop.coordinates, lat: parseFloat(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{translate('admin_label_lng', uiLang)}</label>
                <input type="number" value={prop.coordinates.lng} onChange={e => updateProperty('coordinates', {...prop.coordinates, lng: parseFloat(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none" />
            </div>
        </div>
      </div>

      <MultiLangInput 
        label={translate('admin_label_welcome', uiLang)} 
        value={prop.heroTitle} 
        editLang={editLang}
        setEditLang={setEditLang}
        onChange={(val) => updateProperty('heroTitle', updateLocalized(prop.heroTitle, val))}
        onFullUpdate={(full) => updateProperty('heroTitle', full)}
      />
      <MultiLangInput 
        label={translate('admin_label_tagline', uiLang)} 
        value={prop.heroSubtitle} 
        editLang={editLang}
        setEditLang={setEditLang}
        onChange={(val) => updateProperty('heroSubtitle', updateLocalized(prop.heroSubtitle, val))}
        onFullUpdate={(full) => updateProperty('heroSubtitle', full)}
        isTextArea 
      />
    </div>
  );
};
