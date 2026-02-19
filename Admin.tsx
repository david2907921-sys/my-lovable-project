
import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Loader2, AlertTriangle, ShieldAlert, Plus, Building2 } from 'lucide-react';
import { AppConfig, Language, Recommendation } from '../types';

import { Sidebar } from './Admin/Sidebar';
import { PropertySelector } from './Admin/PropertySelector';
import { OverviewSection } from './Admin/Overview';
import { GazetteSection } from './Admin/Gazette';
// Correcting the import path to find ManualSection in the Admin subfolder
import { ManualSection } from './Admin/Manual';
import { SettingsSection } from './Admin/Settings';
import { LogisticsSection } from './Admin/Logistics';
import { GuideManager } from './Admin/GuideManager';
import { OnboardingWizard } from './Admin/OnboardingWizard';
import { propertyService, authService } from '../services/supabase';

interface AdminProps {
  currentConfig: AppConfig | null;
  onUpdate: (newConfig: AppConfig) => void | Promise<void>;
  isMaster?: boolean;
  propertyId?: string;
  onExit?: () => void;
  onReload?: () => void;
}

export const AdminDashboard = ({ currentConfig, onUpdate, isMaster = false, propertyId, onExit, onReload }: AdminProps) => {
  const [activeProperty, setActiveProperty] = useState<AppConfig | null>(currentConfig);
  // Adjusted activeSection type to include 'logistics' which is present in Sidebar
  const [activeSection, setActiveSection] = useState<'overview' | 'gazette' | 'manual' | 'guide' | 'settings' | 'logistics'>('overview');
  const [editLang, setEditLang] = useState<Language>('en');
  // Added uiLang state to resolve missing prop errors in Sidebar, GazetteSection and ManualSection
  const [uiLang, setUiLang] = useState<Language>('de');
  const [saveStatus, setSaveStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasNoProperty, setHasNoProperty] = useState(false);
  const [isCheckingOwned, setIsCheckingOwned] = useState(!isMaster && !propertyId && !activeProperty);

  // Sync internal state with prop changes (important for Master Hub navigation)
  useEffect(() => {
    setActiveProperty(currentConfig);
  }, [currentConfig]);

  useEffect(() => {
    if (!isMaster && !propertyId && !activeProperty) {
        const checkOwned = async () => {
            const prop = await propertyService.getProperty();
            if (!prop) {
                setHasNoProperty(true);
            } else {
                const url = new URL(window.location.href);
                url.searchParams.set('pid', prop.id);
                window.history.replaceState({}, '', url.toString());
                onReload?.();
            }
            setIsCheckingOwned(false);
        };
        checkOwned();
    }
  }, [isMaster, propertyId, activeProperty, onReload]);

  const handleSave = async () => {
    if (activeProperty) {
      setIsSaving(true);
      setSaveStatus(null);
      try {
        const targetId = propertyId || (window.location.search.match(/pid=([^&]+)/)?.[1]);
        if (!targetId) throw new Error("No property context found for saving.");
        
        await onUpdate(activeProperty);
        setSaveStatus({ message: 'All changes synchronized!', type: 'success' });
        setTimeout(() => setSaveStatus(null), 4000);
      } catch (err: any) {
        console.error("Dashboard Save Error:", err);
        setSaveStatus({ message: err.message || 'Sync failed.', type: 'error' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const updateProperty = (key: keyof AppConfig, value: any) => {
    if (!activeProperty) return;
    setActiveProperty({ ...activeProperty, [key]: value });
  };

  const handleToggleRec = async (rec: Recommendation, active: boolean) => {
    const targetId = propertyId || (window.location.search.match(/pid=([^&]+)/)?.[1]);
    if (!targetId || !activeProperty) return;
    try {
      await propertyService.toggleRecommendation(targetId, rec.id, active);
      const newRecs = active 
        ? [...activeProperty.recommendations, rec]
        : activeProperty.recommendations.filter(r => r.id !== rec.id);
      updateProperty('recommendations', newRecs);
    } catch (e) {
      setSaveStatus({ message: 'Guide update failed.', type: 'error' });
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

  // If we are a Master and no property is selected, show the Selector
  if (!activeProperty) {
    // Fix: Updated onSelect wrapper to accommodate (config: AppConfig, id: string) => void signature
    return <PropertySelector onSelect={(config) => setActiveProperty(config)} />;
  }

  const prop = activeProperty!;
  const currentPid = propertyId || (window.location.search.match(/pid=([^&]+)/)?.[1]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar 
        propertyName={prop.propertyName} 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isMaster={isMaster}
        propertyId={currentPid}
        // Passed uiLang to Sidebar to fix TS error
        uiLang={uiLang}
        onBackToFleet={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('pid');
            window.history.replaceState({}, '', url.toString());
            onReload?.(); // This will trigger usePropertyData to return null config, showing the Selector
        }}
      />

      <main className="flex-1 overflow-y-auto p-8 md:p-20 no-scrollbar pb-40">
        <div className="max-w-3xl mx-auto">
          <header className="flex items-center justify-between mb-20">
            <div>
              <h2 className="text-5xl font-serif font-black text-theme-primary mb-2 italic uppercase tracking-tighter">
                {activeSection === 'overview' && 'Brand & Greeting'}
                {activeSection === 'gazette' && 'Gazette Editor'}
                {activeSection === 'manual' && 'House Manual'}
                {activeSection === 'guide' && 'Guide Manager'}
                {activeSection === 'settings' && 'Technical Settings'}
                {activeSection === 'logistics' && 'Local Logistics'}
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-theme-secondary animate-pulse"></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Editing: {prop.propertyName}</p>
              </div>
            </div>
            <button 
              disabled={isSaving}
              onClick={handleSave}
              className={`bg-theme-primary text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-[0_20px_40px_-10px_rgba(10,36,114,0.4)] transition-all ${isSaving ? 'opacity-70 scale-95' : 'hover:scale-105 active:scale-95'}`}
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isSaving ? 'Syncing...' : 'Push Changes'}
            </button>
          </header>

          {saveStatus && (
            <div className={`fixed top-12 right-12 z-[5000] px-10 py-6 rounded-[2.5rem] shadow-2xl border flex items-center gap-5 animate-slideUp transition-all ${saveStatus.type === 'error' ? 'bg-red-600 text-white border-red-400' : 'bg-navy-900 text-white border-white/10'}`}>
              {saveStatus.type === 'error' ? (
                saveStatus.message.includes('Permission') ? <ShieldAlert size={28} className="animate-pulse" /> : <AlertTriangle size={28} />
              ) : <CheckCircle2 size={28} className="text-green-400" />}
              <div className="flex flex-col">
                <span className="font-black text-[11px] uppercase tracking-[0.3em]">{saveStatus.type === 'error' ? 'Security Notice' : 'Success'}</span>
                <span className="text-[10px] opacity-80 font-bold">{saveStatus.message}</span>
              </div>
            </div>
          )}

          <div className="animate-[fadeIn_0.5s_ease-out]">
            {/* Added uiLang prop to OverviewSection and SettingsSection to resolve TypeScript errors */}
            {activeSection === 'overview' && <OverviewSection prop={prop} editLang={editLang} setEditLang={setEditLang} updateProperty={updateProperty} uiLang={uiLang} />}
            {activeSection === 'logistics' && <LogisticsSection prop={prop} updateProperty={updateProperty} uiLang={uiLang} />}
            {/* Passed uiLang to GazetteSection and ManualSection to resolve TypeScript errors */}
            {activeSection === 'gazette' && <GazetteSection prop={prop} editLang={editLang} setEditLang={setEditLang} updateProperty={updateProperty} uiLang={uiLang} />}
            {activeSection === 'manual' && <ManualSection prop={prop} editLang={editLang} setEditLang={setEditLang} updateProperty={updateProperty} uiLang={uiLang} />}
            {activeSection === 'guide' && <GuideManager propertyId={currentPid || ''} currentRecommendations={prop.recommendations} onToggle={handleToggleRec} />}
            {activeSection === 'settings' && <SettingsSection prop={prop} updateProperty={updateProperty} uiLang={uiLang} />}
          </div>
        </div>
      </main>
    </div>
  );
};
