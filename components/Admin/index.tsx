
import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Loader2, AlertTriangle, ShieldAlert, Check, Languages } from 'lucide-react';
import { AppConfig, Language, Recommendation } from '../../types';

import { Sidebar } from './Sidebar';
import { PropertySelector } from './PropertySelector';
import { OverviewSection } from './Overview';
import { GazetteSection } from './Gazette';
import { ManualSection } from './Manual';
import { SettingsSection } from './Settings';
import { LogisticsSection } from './Logistics';
import { MarketingSection } from './Marketing';
import { GuideManager } from './GuideManager';
import { OnboardingWizard } from './OnboardingWizard';
import { MagicDrawer } from './MagicDrawer';
import { propertyService } from '../../services/supabase';
import { t as translate, GLOBAL_TRANSLATIONS } from '../../translations';

interface AdminProps {
  currentConfig: AppConfig | null;
  onUpdate: (newConfig: AppConfig, id?: string) => void | Promise<void>;
  isMaster?: boolean;
  propertyId?: string;
  onExit?: () => void;
  onReload?: () => void;
}

export const AdminDashboard = ({ currentConfig, onUpdate, isMaster = false, propertyId, onExit, onReload }: AdminProps) => {
  const [activeProperty, setActiveProperty] = useState<AppConfig | null>(currentConfig);
  // Lokaler State für die ID, um Kontext-Verlust zu vermeiden
  const [activePid, setActivePid] = useState<string | undefined>(propertyId);
  const [activeSection, setActiveSection] = useState<'overview' | 'gazette' | 'manual' | 'guide' | 'settings' | 'logistics' | 'marketing'>('overview');
  const [editLang, setEditLang] = useState<Language>('en');
  const [uiLang, setUiLang] = useState<Language>('de'); 
  
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [hasNoProperty, setHasNoProperty] = useState(false);
  const [isCheckingOwned, setIsCheckingOwned] = useState(!isMaster && !propertyPidFromUrl() && !activeProperty);

  function propertyPidFromUrl() {
    return window.location.search.match(/pid=([^&]+)/)?.[1];
  }

  useEffect(() => {
    setActiveProperty(currentConfig);
    if (propertyId) setActivePid(propertyId);
  }, [currentConfig, propertyId]);

  useEffect(() => {
    if (!isMaster && !propertyPidFromUrl() && !activeProperty) {
        const checkOwned = async () => {
            const prop = await propertyService.getProperty();
            if (!prop) {
                setHasNoProperty(true);
            } else {
                const url = new URL(window.location.href);
                url.searchParams.set('pid', prop.id);
                window.history.replaceState({}, '', url.toString());
                setActivePid(prop.id);
                onReload?.();
            }
            setIsCheckingOwned(false);
        };
        checkOwned();
    }
  }, [isMaster, activeProperty, onReload]);

  const handleSave = async () => {
    if (!activeProperty || saveState === 'saving') return;

    setSaveState('saving');
    setErrorMessage(null);

    try {
      // Priorität: State ID > URL ID > Prop ID
      const targetId = activePid || propertyPidFromUrl() || propertyId;
      if (!targetId) throw new Error("Kein Objekt-Kontext gefunden (PID fehlt).");
      
      await onUpdate(activeProperty, targetId);
      
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (err: any) {
      console.error("Save Error:", err);
      setSaveState('error');
      setErrorMessage(err.message || 'Synchronisierung fehlgeschlagen.');
    }
  };

  const updateProperty = (key: keyof AppConfig, value: any) => {
    if (!activeProperty) return;
    setActiveProperty({ ...activeProperty, [key]: value });
    if (saveState === 'success') setSaveState('idle');
  };

  const handlePropertySelect = (config: AppConfig, id: string) => {
      setActivePid(id);
      setActiveProperty(config);
  };

  const handleToggleRec = async (rec: Recommendation, active: boolean) => {
    const targetId = activePid || propertyPidFromUrl();
    if (!targetId || !activeProperty) return;
    try {
      await propertyService.toggleRecommendation(targetId, rec.id, active);
      const newRecs = active 
        ? [...activeProperty.recommendations, rec]
        : activeProperty.recommendations.filter(r => r.id !== rec.id);
      updateProperty('recommendations', newRecs);
    } catch (e) {
      setSaveState('error');
      setErrorMessage("Guide-Update fehlgeschlagen.");
    }
  };

  const handleReorderRecs = async (newIds: string[]) => {
    const targetId = activePid || propertyPidFromUrl();
    if (!targetId || !activeProperty) return;
    try {
      await propertyService.updateRecommendationOrder(targetId, newIds);
      const newRecs = newIds.map(id => activeProperty.recommendations.find(r => r.id === id)!).filter(Boolean);
      updateProperty('recommendations', newRecs);
    } catch (e) {
      setSaveState('error');
      setErrorMessage("Reihenfolge konnte nicht gespeichert werden.");
    }
  };

  if (isCheckingOwned) {
      return (
          <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-10">
              <Loader2 className="text-gold-500 animate-spin mb-6" size={48} />
              <h2 className="text-white font-serif text-2xl font-black italic tracking-widest uppercase">Securing Session</h2>
          </div>
      );
  }

  if (hasNoProperty && !isMaster) {
      return (
        <OnboardingWizard 
            propertyId={null} 
            config={{} as any} 
            onComplete={() => {
                setHasNoProperty(false);
                onReload?.();
            }} 
        />
      );
  }

  if (!activeProperty) {
    return <PropertySelector onSelect={handlePropertySelect} />;
  }

  const prop = activeProperty!;
  const availableLanguages = Object.keys(GLOBAL_TRANSLATIONS);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar 
        propertyName={prop.propertyName} 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isMaster={isMaster}
        propertyId={activePid || propertyPidFromUrl()}
        uiLang={uiLang}
        onBackToFleet={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('pid');
            window.history.replaceState({}, '', url.toString());
            setActivePid(undefined);
            setActiveProperty(null);
            onReload?.();
        }}
      />

      <main className="flex-1 overflow-y-auto p-8 md:p-20 no-scrollbar pb-40">
        <div className="max-w-3xl mx-auto print:max-w-none print:p-0">
          <header className="flex items-center justify-between mb-16 gap-6 print:hidden">
            <div className="flex-1">
              <h2 className="text-5xl font-serif font-black text-theme-primary mb-2 italic uppercase tracking-tighter truncate">
                {translate(`admin_${activeSection}`, uiLang)}
              </h2>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${saveState === 'saving' ? 'bg-amber-500 animate-pulse' : saveState === 'success' ? 'bg-green-500' : 'bg-theme-secondary animate-pulse'}`}></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] truncate">
                    {saveState === 'saving' ? translate('admin_saving', uiLang) : saveState === 'success' ? translate('admin_saved', uiLang) : `${translate('admin_editing', uiLang)}: ${prop.propertyName}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <div className="bg-white/60 p-1.5 rounded-2xl border border-slate-100 flex items-center gap-1 shadow-sm overflow-x-auto no-scrollbar max-w-[150px] md:max-w-none">
                   {availableLanguages.map(l => (
                     <button 
                        key={l}
                        onClick={() => setUiLang(l as Language)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all shrink-0 ${uiLang === l ? 'bg-navy-900 text-white shadow-md' : 'text-slate-300 hover:text-slate-500'}`}
                     >
                        {l.toUpperCase()}
                     </button>
                   ))}
                </div>

                <button 
                  disabled={saveState === 'saving'}
                  onClick={handleSave}
                  className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 transition-all shadow-xl
                    ${saveState === 'saving' ? 'bg-slate-200 text-slate-400 cursor-wait' : 
                      saveState === 'success' ? 'bg-green-600 text-white' : 
                      'bg-theme-primary text-white hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(10,36,114,0.4)]'}
                  `}
                >
                  {saveState === 'saving' ? <Loader2 className="animate-spin" size={18} /> : 
                   saveState === 'success' ? <Check size={18} /> : <Save size={18} />}
                  
                  <span className="hidden md:inline">{saveState === 'saving' ? translate('admin_saving', uiLang) : saveState === 'success' ? translate('admin_saved', uiLang) : translate('admin_save', uiLang)}</span>
                </button>
            </div>
          </header>

          {saveState === 'error' && (
            <div className="mb-10 p-5 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 animate-shake print:hidden">
              <AlertTriangle size={24} />
              <div className="flex flex-col">
                <span className="font-black text-[9px] uppercase tracking-[0.3em]">Save Failed</span>
                <span className="text-[9px] font-bold">{errorMessage}</span>
              </div>
            </div>
          )}

          <div className="animate-[fadeIn_0.5s_ease-out]">
            {activeSection === 'overview' && <OverviewSection prop={prop} editLang={editLang} setEditLang={setEditLang} updateProperty={updateProperty} uiLang={uiLang} />}
            {activeSection === 'logistics' && <LogisticsSection prop={prop} updateProperty={updateProperty} uiLang={uiLang} />}
            {activeSection === 'marketing' && <MarketingSection prop={prop} uiLang={uiLang} />}
            {activeSection === 'gazette' && <GazetteSection prop={prop} editLang={editLang} setEditLang={setEditLang} updateProperty={updateProperty} uiLang={uiLang} />}
            {activeSection === 'manual' && <ManualSection prop={prop} editLang={editLang} setEditLang={setEditLang} updateProperty={updateProperty} uiLang={uiLang} />}
            {activeSection === 'guide' && <GuideManager propertyId={activePid || propertyPidFromUrl() || ''} currentRecommendations={prop.recommendations} onToggle={handleToggleRec} onReorder={handleReorderRecs} editLang={editLang} />}
            {activeSection === 'settings' && <SettingsSection prop={prop} updateProperty={updateProperty} uiLang={uiLang} propertyId={activePid || propertyPidFromUrl()} />}
          </div>
        </div>
      </main>

      <MagicDrawer />
    </div>
  );
};
