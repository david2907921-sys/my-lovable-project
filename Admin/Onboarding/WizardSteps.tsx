
import React, { useRef, useState, useEffect } from 'react';
import { Search, Loader2, Check, Wand2, Upload, Trash2, LayoutGrid, MapPin, CheckSquare, Square, Navigation, Sparkles } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AppConfig, ManualItem } from '../../../types';
import { IconRenderer } from '../../Common/IconRenderer';
import { compressImage, base64ToBlob } from '../../../utils/image';
import { propertyService } from '../../../services/supabase';

export const HERO_PRESETS = [
    { name: 'Coastal Luxury', url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200' },
    { name: 'Modern Minimal', url: 'https://images.unsplash.com/photo-1600596542815-2a4d9f958876?auto=format&fit=crop&w=1200' },
    { name: 'Rustic Charm', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200' },
    { name: 'Urban Chic', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200' },
];

export const COLOR_PRESETS = [
    { name: 'Navy & Gold', primary: '#0a2472', secondary: '#c5a028' },
    { name: 'Emerald & Cream', primary: '#047857', secondary: '#d1fae5' },
    { name: 'Slate & White', primary: '#1e293b', secondary: '#f8fafc' },
    { name: 'Berry & Rose', primary: '#831843', secondary: '#fbcfe8' },
    { name: 'Ocean & Sand', primary: '#0e7490', secondary: '#fed7aa' },
];

interface StepProps {
    data: AppConfig;
    update: (updates: Partial<AppConfig>) => void;
    propertyId?: string;
}

interface StepIdentityProps extends StepProps {
    onAiGenerate: () => void;
    isAiGenerating: boolean;
}

interface StepLocationProps extends StepProps {
    addressSearch: string;
    setAddressSearch: (v: string) => void;
    onSearch: () => void;
    isSearching: boolean;
}

interface StepFeaturesProps {
    data: AppConfig;
    toggleItem: (index: number) => void;
    selectAll: (select: boolean, category?: string) => void;
}

const LocationMarker = ({ position, onMove }: { position: [number, number], onMove: (pos: [number, number]) => void }) => {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      onMove([e.latlng.lat, e.latlng.lng]);
    },
  });

  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          onMove([pos.lat, pos.lng]);
        }
      }}
    />
  );
};

const ImageUploader = ({ value, onChange, label, propertyId }: { value?: string, onChange: (v: string) => void, label: string, propertyId?: string }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [isOptimizing, setIsOptimizing] = React.useState(false);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsOptimizing(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                try {
                    const optimizedBase64 = await compressImage(base64);
                    const blob = await base64ToBlob(optimizedBase64);
                    
                    if (propertyId) {
                      const publicUrl = await propertyService.uploadImage(propertyId, blob, file.name);
                      onChange(publicUrl);
                    } else {
                      onChange(optimizedBase64);
                    }
                } catch (err) {
                    console.error("Storage upload failed", err);
                    onChange(base64);
                } finally {
                    setIsOptimizing(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-4">
                <button 
                    disabled={isOptimizing}
                    onClick={() => fileRef.current?.click()}
                    className="flex-1 bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-navy-900 hover:bg-navy-50/50 transition-all group disabled:opacity-50"
                >
                    {isOptimizing ? (
                        <div className="flex flex-col items-center gap-2 animate-pulse">
                            <Loader2 className="animate-spin text-navy-900" size={24} />
                            <span className="text-[10px] font-black uppercase text-navy-900">Uploading...</span>
                        </div>
                    ) : value ? (
                        <div className="flex flex-col items-center gap-2">
                            <img src={value} className="h-16 w-16 object-cover rounded-xl shadow-md" alt="Preview" />
                            <span className="text-[10px] font-black uppercase text-navy-900">Change Image</span>
                        </div>
                    ) : (
                        <>
                            <Upload className="text-slate-300 group-hover:text-navy-900 transition-colors" size={24} />
                            <span className="text-[10px] font-black uppercase text-slate-400">Click to Upload</span>
                        </>
                    )}
                </button>
                {value && !isOptimizing && (
                    <button onClick={() => onChange('')} className="p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 size={20} />
                    </button>
                )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>
    );
};

export const StepIdentity = ({ data, update, onAiGenerate, isAiGenerating }: StepIdentityProps) => (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Property Name</label>
            <input autoFocus value={data.propertyName} onChange={e => update({ propertyName: e.target.value })} className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 font-serif font-black text-xl outline-none focus:border-navy-900 transition-all" placeholder="e.g. Villa Serenity" />
        </div>
        <div className="space-y-2 relative">
            <div className="flex justify-between items-center px-2 mb-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Welcome Message</label>
                <button 
                    onClick={onAiGenerate}
                    disabled={isAiGenerating}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gold-600 hover:text-navy-900 transition-colors"
                >
                    <Wand2 size={12} /> {isAiGenerating ? 'Writing...' : 'Auto-Write'}
                </button>
            </div>
            <textarea value={data.heroTitle.en} onChange={e => update({ heroTitle: {...data.heroTitle, en: e.target.value}})} className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 font-bold h-32 resize-none outline-none focus:border-navy-900 transition-all" />
        </div>
    </div>
);

export const StepLocation = ({ data, addressSearch, setAddressSearch, onSearch, isSearching, update }: StepLocationProps) => {
  const center: [number, number] = [data.coordinates.lat, data.coordinates.lng];

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out] flex flex-col h-full">
        <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-gold-200">
            <label className="text-[10px] font-black uppercase tracking-widest text-gold-600 ml-2 mb-3 block flex items-center gap-2">
                <Sparkles size={12} /> AI Magic Search
            </label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        value={addressSearch} 
                        onChange={e => setAddressSearch(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && onSearch()} 
                        className="w-full bg-white rounded-2xl py-4 pl-14 pr-4 font-bold outline-none border-none shadow-sm" 
                        placeholder="Search property (e.g. Villa Serenity Sibenik)..." 
                    />
                </div>
                <button 
                    onClick={onSearch} 
                    disabled={isSearching || !addressSearch} 
                    className="bg-navy-900 text-white px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                    {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    Find
                </button>
            </div>
        </div>

        <div className="flex-1 min-h-[300px] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
            <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <LocationMarker 
                  position={center} 
                  onMove={(pos) => update({ coordinates: { lat: pos[0], lng: pos[1] } })} 
                />
            </MapContainer>
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-2">
                <Navigation size={14} className="text-theme-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-navy-900">Drag pin to adjust precisely</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">City (shown to guest)</label>
              <input 
                value={data.city} 
                onChange={e => update({ city: e.target.value })} 
                className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 font-bold text-navy-900 outline-none focus:border-navy-900 shadow-sm" 
                placeholder="e.g. Šibenik" 
              />
          </div>
          <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Display Address</label>
              <input 
                value={data.address} 
                onChange={e => update({ address: e.target.value })} 
                className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 font-bold text-navy-900 outline-none focus:border-navy-900 shadow-sm" 
                placeholder="Street name and number" 
              />
          </div>
        </div>
    </div>
  );
};

export const StepBranding = ({ data, update, propertyId }: StepProps) => (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
        <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Visual Identity</label>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 ml-1">Primary Color</span>
                    <div className="flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl p-3">
                        <input type="color" value={data.themeColors.primary} onChange={e => update({ themeColors: {...data.themeColors, primary: e.target.value}})} className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" />
                        <input type="text" value={data.themeColors.primary} onChange={e => update({ themeColors: {...data.themeColors, primary: e.target.value}})} className="w-full text-xs font-mono font-bold outline-none uppercase" />
                    </div>
                </div>
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 ml-1">Accent Color</span>
                    <div className="flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl p-3">
                        <input type="color" value={data.themeColors.secondary} onChange={e => update({ themeColors: {...data.themeColors, secondary: e.target.value}})} className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" />
                        <input type="text" value={data.themeColors.secondary} onChange={e => update({ themeColors: {...data.themeColors, secondary: e.target.value}})} className="w-full text-xs font-mono font-bold outline-none uppercase" />
                    </div>
                </div>
            </div>
            <div className="flex gap-3 flex-wrap p-2 bg-slate-100 rounded-2xl">
                {COLOR_PRESETS.map((p, i) => (
                    <button key={i} onClick={() => update({ themeColors: { primary: p.primary, secondary: p.secondary }})} className="w-10 h-10 rounded-full border-4 border-white shadow-md hover:scale-110 transition-all ring-1 ring-slate-200" style={{ background: `linear-gradient(135deg, ${p.primary} 50%, ${p.secondary} 50%)` }} title={p.name} />
                ))}
            </div>
        </div>

        <ImageUploader label="Property Logo" value={data.logo} onChange={v => update({ logo: v })} propertyId={propertyId} />
        
        <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Hero Image</label>
            <div className="grid grid-cols-4 gap-2">
                {HERO_PRESETS.map((preset) => (
                    <button key={preset.name} onClick={() => update({ heroImage: preset.url })} className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all ${data.heroImage === preset.url ? 'border-navy-900 scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={preset.url} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
            <ImageUploader label="Custom Hero Image" value={data.heroImage} onChange={v => update({ heroImage: v })} propertyId={propertyId} />
        </div>
    </div>
);

export const StepConnect = ({ data, update }: StepProps) => (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">WiFi SSID (Network Name)</label>
            <input value={data.wifiSsid} onChange={e => update({ wifiSsid: e.target.value })} className="w-full bg-white border-2 border-slate-100 rounded-2xl p-6 font-bold text-navy-900 outline-none focus:border-navy-900 shadow-sm" placeholder="e.g. Villa_Serenity_5G" />
        </div>
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">WiFi Password</label>
            <input value={data.wifiPass} onChange={e => update({ wifiPass: e.target.value })} className="w-full bg-white border-2 border-slate-100 rounded-2xl p-6 font-bold text-navy-900 outline-none focus:border-navy-900 shadow-sm" placeholder="••••••••" />
        </div>
    </div>
);

export const StepPersona = ({ data, update }: StepProps) => (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Host Display Name</label>
            <input value={data.hostName} onChange={e => update({ hostName: e.target.value })} className="w-full bg-white border-2 border-slate-100 rounded-2xl p-6 font-serif font-black text-xl outline-none focus:border-navy-900" placeholder="e.g. Marko" />
        </div>
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">WhatsApp / Phone Number</label>
            <input value={data.hostPhone} onChange={e => update({ hostPhone: e.target.value })} className="w-full bg-white border-2 border-slate-100 rounded-2xl p-6 font-bold outline-none focus:border-navy-900" placeholder="+385 91 ..." />
        </div>
    </div>
);

export const StepFeatures = ({ data, toggleItem, selectAll }: StepFeaturesProps) => {
    const categories = ['arrival', 'essentials', 'kitchen', 'living', 'wellness', 'rules', 'emergency'];

    return (
        <div className="space-y-12 animate-[fadeIn_0.4s_ease-out] pb-10">
            <div className="flex gap-4 p-2 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <button onClick={() => selectAll(true)} className="flex-1 py-4 bg-navy-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"><CheckSquare size={14} /> Select All</button>
                <button onClick={() => selectAll(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"><Square size={14} /> Clear All</button>
            </div>

            <div className="space-y-16">
                {categories.map(cat => {
                    const items = data.manual.filter(m => m.category === cat);
                    const allActive = items.every(m => m.isVisible !== false);
                    
                    return (
                        <div key={cat} className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-8 bg-gold-500 rounded-full"></div>
                                    <h4 className="text-xl font-serif font-black text-navy-900 uppercase italic tracking-tighter">{cat}</h4>
                                </div>
                                <button 
                                    onClick={() => selectAll(!allActive, cat)}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-navy-900 transition-colors"
                                >
                                    {allActive ? 'Deselect Category' : 'Select Category'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map((item) => {
                                    const idx = data.manual.findIndex(m => m.id === item.id);
                                    const active = item.isVisible !== false;
                                    return (
                                        <button 
                                            key={item.id} 
                                            onClick={() => toggleItem(idx)} 
                                            className={`group relative p-6 rounded-[2rem] border-2 text-left transition-all h-36 flex flex-col justify-between
                                                ${active ? 'border-navy-900 bg-navy-50 shadow-xl scale-105 z-10' : 'border-slate-100 bg-white opacity-40 grayscale hover:grayscale-0 hover:opacity-80'}`}
                                        >
                                            <div className={`p-3 rounded-xl w-fit transition-all ${active ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <IconRenderer name={item.icon} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs leading-tight text-navy-900 group-hover:underline">{item.title.en}</p>
                                            </div>
                                            {active && <Check className="absolute top-4 right-4 text-navy-900" size={16} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
