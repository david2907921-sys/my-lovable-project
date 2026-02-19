
import React, { useState, useMemo, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft, Building2, Wifi, User, Sparkles, Loader2, Globe, LayoutGrid, MapPin, Palette } from 'lucide-react';
import { AppConfig, ManualItem } from '../../types';
import { propertyService, generateId } from '../../services/supabase';
import { aiTranslator } from '../../services/aiTranslator';
import { LivePreview } from './Onboarding/LivePreview';
import { 
    StepIdentity, StepLocation, StepBranding, StepConnect, StepPersona, StepFeatures, HERO_PRESETS 
} from './Onboarding/WizardSteps';
import { GoogleGenAI } from "@google/genai";

interface OnboardingWizardProps {
  propertyId: string | null;
  config: AppConfig | null;
  onComplete: () => void;
}

export const OnboardingWizard = ({ propertyId, config, onComplete }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(propertyId);
  
  const [data, setData] = useState<AppConfig>(() => {
    return {
        propertyName: config?.propertyName || "",
        heroTitle: config?.heroTitle || { en: "Welcome Home" },
        heroSubtitle: config?.heroSubtitle || { en: "Your sanctuary awaits" },
        hostName: config?.hostName || "",
        hostPhone: config?.hostPhone || "",
        wifiSsid: config?.wifiSsid || "",
        wifiPass: config?.wifiPass || "",
        themeColors: config?.themeColors || { primary: '#0a2472', secondary: '#c5a028' },
        validBookings: config?.validBookings || [],
        coordinates: config?.coordinates || { lat: 43.7350, lng: 15.8952 },
        recommendations: config?.recommendations || [],
        manual: config?.manual || [],
        checkInGuide: config?.checkInGuide || [],
        guestTips: config?.guestTips || [],
        gazette: config?.gazette || [],
        heroImage: config?.heroImage || HERO_PRESETS[0].url,
        city: config?.city || "",
        address: config?.address || "",
        logistics: config?.logistics || {}
    };
  });

  const [addressSearch, setAddressSearch] = useState(data.address || "");
  const [isSearchingAddr, setIsSearchingAddr] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initPresetsFromDB = async () => {
        if (data.manual.length > 0) return;
        try {
            const { data: presets, error: fetchError } = await propertyService.getManualPresets();
            if (fetchError) throw fetchError;
            if (presets && presets.length > 0) {
                const manualItems: ManualItem[] = presets.map((p: any) => ({
                    id: generateId(),
                    category: p.category,
                    icon: p.icon,
                    title: p.title,
                    content: p.content,
                    isVisible: false
                }));
                updateData({ manual: manualItems });
            }
        } catch (e) {
            console.error("Library load failed", e);
            setError("Die globale Bibliothek konnte nicht geladen werden.");
        }
    };
    initPresetsFromDB();
  }, []);

  const steps = [
    { id: 1, title: 'Identität', subtitle: 'Name deiner Unterkunft', icon: Building2 },
    { id: 2, title: 'Standort', subtitle: 'Adresse finden', icon: MapPin },
    { id: 3, title: 'Branding', subtitle: 'Farben & Vibe', icon: Palette },
    { id: 4, title: 'Verbindung', subtitle: 'WiFi & Technik', icon: Wifi },
    { id: 5, title: 'Persona', subtitle: 'Gastgeber Profil', icon: User },
    { id: 6, title: 'Features', subtitle: 'Ausstattung wählen', icon: LayoutGrid },
  ];

  const updateData = (updates: Partial<AppConfig>) => {
      setData(prev => ({ ...prev, ...updates }));
  };

  const handleAiGenerate = async () => {
    if (!data.propertyName || data.propertyName.length < 3) {
      setError("Bitte gib zuerst einen Namen für die Unterkunft ein.");
      return;
    }
    setIsAiGenerating(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Schreibe einen kurzen, luxuriösen Willkommensgruß (max. 15 Wörter) für eine Ferienunterkunft namens "${data.propertyName}". Antworte NUR mit dem Gruß in Englisch.`,
      });
      const generatedText = response.text?.trim().replace(/^"|"$/g, '');
      if (generatedText) {
        // AUTOMATISCHE ÜBERSETZUNG IN ALLE SPRACHEN
        const translations = await aiTranslator.translateContent(generatedText, 'en');
        updateData({ heroTitle: translations });
      }
    } catch (err) {
      setError("KI-Generierung fehlgeschlagen.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSearchAddress = async () => {
    if (!addressSearch) return;
    setIsSearchingAddr(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find the precise location and coordinates for the property: "${addressSearch}".
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
        updateData({
          address: addr || addressSearch,
          city: city || data.city,
          coordinates: { lat, lng }
        });
      } else {
        throw new Error("Location not found");
      }
    } catch (err) {
      setError("KI-Standortsuche fehlgeschlagen. Bitte nutze den manuellen Pin.");
    } finally {
      setIsSearchingAddr(false);
    }
  };

  const canGoNext = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return (data.propertyName || "").length > 2;
    if (step === 2) return (data.city || "").length > 2;
    if (step === 3) return !!data.heroImage;
    if (step === 4) return (data.wifiSsid || "").length > 0;
    if (step === 5) return (data.hostName || "").length > 1;
    return true;
  }, [step, data]);

  const saveCurrentProgress = async () => {
    setIsSaving(true);
    setError(null);
    try {
      let currentId = activePropertyId;
      if (step === 1) {
        if (!currentId) {
            const newProp = await propertyService.createProperty(data);
            currentId = newProp.id;
            setActivePropertyId(newProp.id);
            const url = new URL(window.location.search, window.location.origin);
            url.searchParams.set('pid', currentId!);
            window.history.replaceState({}, '', url.toString());
        } else {
             await propertyService.updateProperty(currentId, {
                name: data.propertyName,
                hero_title: data.heroTitle,
            });
        }
      }
      
      if (step >= 2 && step <= 5 && currentId) {
          await propertyService.updateProperty(currentId, {
            city: data.city,
            address: data.address,
            lat: data.coordinates.lat,
            lng: data.coordinates.lng,
            hero_image: data.heroImage,
            logo: data.logo,
            theme_colors: data.themeColors,
            wifi_ssid: data.wifiSsid,
            wifi_pass: data.wifiPass,
            host_name: data.hostName,
            host_phone: data.hostPhone
          });
      }
      
      if (step === 6 && currentId) {
        await propertyService.syncPropertyData(currentId, data);
        await propertyService.updateProperty(currentId, { is_onboarding_complete: true });
      }
      
      if (step === steps.length) {
        onComplete();
      } else {
        setStep(s => s + 1);
      }
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.message || "Fehler beim Speichern.");
    } finally {
      setIsSaving(false);
    }
  };

  if (step === 0) {
    return (
        <div className="fixed inset-0 z-[6000] bg-navy-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative z-10 max-w-lg w-full">
                <div className="w-24 h-24 bg-gold-500 rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-2xl animate-bounce">
                    <Sparkles className="text-navy-900" size={48} />
                </div>
                <h1 className="text-5xl font-serif font-black text-white italic mb-6">Willkommen</h1>
                <p className="text-white/40 text-xs font-black uppercase tracking-[0.4em] mb-12">Konfiguration deiner digitalen Gästemappe</p>
                <button onClick={() => setStep(1)} className="bg-white text-navy-900 px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-4 mx-auto">
                    Jetzt starten <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] border border-white">
        <div className="bg-navy-900 w-full md:w-64 p-8 text-white flex flex-col shrink-0 overflow-y-auto no-scrollbar">
          <h2 className="text-xl font-serif font-black italic mb-12">Setup</h2>
          <div className="flex-1 space-y-6">
            {steps.map((s) => (
                <div key={s.id} className={`flex items-center gap-4 transition-all ${step === s.id ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 ${step >= s.id ? 'bg-gold-500 border-gold-500 text-navy-900' : 'border-white/20'}`}>
                        {step > s.id ? <Check size={14} /> : <s.icon size={14} />}
                    </div>
                    <p className="font-serif font-bold text-xs">{s.title}</p>
                </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col md:flex-row bg-slate-50 relative overflow-hidden">
            <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-100">
                <div className="p-8 border-b border-slate-100 bg-white">
                    <h3 className="text-2xl font-serif font-black text-navy-900">{steps[step-1]?.subtitle}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">{error}</div>}
                    {step === 1 && <StepIdentity data={data} update={updateData} onAiGenerate={handleAiGenerate} isAiGenerating={isAiGenerating} />}
                    {step === 2 && <StepLocation data={data} update={updateData} addressSearch={addressSearch} setAddressSearch={setAddressSearch} onSearch={handleSearchAddress} isSearching={isSearchingAddr} />}
                    {step === 3 && <StepBranding data={data} update={updateData} propertyId={activePropertyId || undefined} />}
                    {step === 4 && <StepConnect data={data} update={updateData} />}
                    {step === 5 && <StepPersona data={data} update={updateData} />}
                    {step === 6 && <StepFeatures data={data} toggleItem={(i) => {
                        const next = [...data.manual];
                        next[i].isVisible = !next[i].isVisible;
                        updateData({ manual: next });
                    }} selectAll={(sel) => {
                        const next = data.manual.map(m => ({ ...m, isVisible: sel }));
                        updateData({ manual: next });
                    }} />}
                </div>
                <div className="p-8 border-t border-slate-100 bg-white flex justify-between">
                    <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="text-slate-400 font-bold text-xs flex items-center gap-2"><ArrowLeft size={16} /> Zurück</button>
                    <button onClick={saveCurrentProgress} disabled={isSaving || !canGoNext} className="bg-navy-900 text-white px-8 py-4 rounded-xl font-black text-xs shadow-xl flex items-center gap-3">
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Weiter'} <ArrowRight size={16} />
                    </button>
                </div>
            </div>
            <div className="hidden lg:flex flex-1 bg-slate-100 items-center justify-center p-8">
                 <LivePreview data={data} />
            </div>
        </div>
      </div>
    </div>
  );
};
