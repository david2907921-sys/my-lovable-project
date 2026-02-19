
import React, { useRef, useState } from 'react';
import { Wifi, User, Palette, Image as ImageIcon, Check, Upload, Loader2, Trash2 } from 'lucide-react';
import { AppConfig, Language } from '../../types';
import { COLOR_PRESETS, HERO_PRESETS } from './Onboarding/WizardSteps';
import { compressImage, base64ToBlob } from '../../utils/image';
import { propertyService } from '../../services/supabase';

interface SettingsProps {
  prop: AppConfig;
  updateProperty: (key: keyof AppConfig, value: any) => void;
  uiLang: Language;
  propertyId?: string;
}

const SettingsImageUploader = ({ value, onChange, label, propertyId, aspect = "aspect-square" }: { value?: string, onChange: (v: string) => void, label: string, propertyId?: string, aspect?: string }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && propertyId) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const optimized = await compressImage(reader.result as string);
          const blob = await base64ToBlob(optimized);
          const publicUrl = await propertyService.uploadImage(propertyId, blob, file.name);
          onChange(publicUrl);
        } catch (err) {
          console.error("Upload failed", err);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">{label}</label>
      <div className="flex items-center gap-4">
        <div 
          onClick={() => !isUploading && fileRef.current?.click()}
          className={`${aspect} w-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-navy-900 hover:bg-navy-50 transition-all overflow-hidden relative group`}
        >
          {isUploading ? (
            <Loader2 className="animate-spin text-navy-900" size={24} />
          ) : value ? (
            <>
              <img src={value} className="w-full h-full object-cover" alt="Preview" />
              <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="text-white" size={20} />
              </div>
            </>
          ) : (
            <Upload className="text-slate-300" size={24} />
          )}
        </div>
        {value && !isUploading && (
          <button 
            onClick={() => onChange('')}
            className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"
            title="Remove Image"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
};

export const SettingsSection = ({ prop, updateProperty, uiLang, propertyId }: SettingsProps) => {
  return (
    <div className="space-y-12 animate-[fadeIn_0.4s_ease-out]">
      {/* Branding & Aesthetics */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
        <h4 className="text-2xl font-serif font-black text-navy-900 mb-8 flex items-center gap-3">
          <Palette className="text-gold-500" /> Branding & Aesthetics
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Colors & Logo */}
          <div className="space-y-10">
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Theme Colors</label>
              <div className="flex gap-3 flex-wrap">
                {COLOR_PRESETS.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => updateProperty('themeColors', { primary: p.primary, secondary: p.secondary })}
                    className={`w-12 h-12 rounded-full border-4 transition-all shadow-md hover:scale-110 ${prop.themeColors.primary === p.primary ? 'border-navy-900 scale-110' : 'border-white'}`}
                    style={{ background: `linear-gradient(135deg, ${p.primary} 50%, ${p.secondary} 50%)` }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Primary</span>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                      <input type="color" value={prop.themeColors.primary} onChange={e => updateProperty('themeColors', {...prop.themeColors, primary: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
                      <span className="text-[10px] font-mono font-bold uppercase">{prop.themeColors.primary}</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Accent</span>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                      <input type="color" value={prop.themeColors.secondary} onChange={e => updateProperty('themeColors', {...prop.themeColors, secondary: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
                      <span className="text-[10px] font-mono font-bold uppercase">{prop.themeColors.secondary}</span>
                    </div>
                 </div>
              </div>
            </div>

            <SettingsImageUploader 
              label="Property Logo" 
              value={prop.logo} 
              onChange={(v) => updateProperty('logo', v)} 
              propertyId={propertyId} 
            />
          </div>

          {/* Hero Image */}
          <div className="space-y-10">
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Hero Presets</label>
              <div className="grid grid-cols-2 gap-3">
                {HERO_PRESETS.map((h) => (
                  <button 
                    key={h.name} 
                    onClick={() => updateProperty('heroImage', h.url)}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${prop.heroImage === h.url ? 'border-navy-900 scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={h.url} className="w-full h-full object-cover" alt="" />
                    {prop.heroImage === h.url && <div className="absolute inset-0 bg-navy-900/20 flex items-center justify-center"><Check className="text-white" size={16} /></div>}
                  </button>
                ))}
              </div>
            </div>

            <SettingsImageUploader 
              label="Custom Hero Image" 
              value={prop.heroImage} 
              onChange={(v) => updateProperty('heroImage', v)} 
              propertyId={propertyId} 
              aspect="aspect-video"
            />
          </div>
        </div>
      </div>

      {/* Connectivity */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
        <h4 className="text-2xl font-serif font-black text-navy-900 mb-8 flex items-center gap-3"><Wifi className="text-gold-500" /> Guest Connectivity</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">WiFi SSID (Network Name)</label>
              <input 
                type="text" 
                value={prop.wifiSsid} 
                onChange={(e) => updateProperty('wifiSsid', e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-navy-900 focus:ring-2 focus:ring-navy-100 outline-none"
              />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">WiFi Password</label>
              <input 
                type="text" 
                value={prop.wifiPass} 
                onChange={(e) => updateProperty('wifiPass', e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-navy-900 focus:ring-2 focus:ring-navy-100 outline-none"
              />
           </div>
        </div>
      </div>

      {/* Host Identity */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
        <h4 className="text-2xl font-serif font-black text-navy-900 mb-8 flex items-center gap-3"><User className="text-navy-900" /> Host Identity</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Host Name</label>
              <input 
                type="text" 
                value={prop.hostName} 
                onChange={(e) => updateProperty('hostName', e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-navy-900 focus:ring-2 focus:ring-navy-100 outline-none"
              />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Host Phone (WhatsApp Format)</label>
              <input 
                type="text" 
                value={prop.hostPhone} 
                onChange={(e) => updateProperty('hostPhone', e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-navy-900 focus:ring-2 focus:ring-navy-100 outline-none"
              />
           </div>
        </div>
      </div>
    </div>
  );
};
