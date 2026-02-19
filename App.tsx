
import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, Sparkles, LayoutDashboard } from 'lucide-react';
import { usePropertyData } from './hooks/usePropertyData.ts';
import { authService, propertyService } from './services/supabase.ts';
import { cacheService } from './services/cache.ts';
import { AppConfig } from './types.ts';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { GuestApp } from './components/Guest/GuestApp.tsx';
import { AdminLogin } from './components/Admin/Login.tsx';
import { AdminDashboard } from './components/Admin/index.tsx';

type AppStatus = 'guest_view' | 'admin_ready' | 'admin_login_required';

export default function App() {
  const [status, setStatus] = useState<AppStatus | 'init'>('init');
  const [adminRole, setAdminRole] = useState<'master' | 'host' | 'none'>('none');
  const [session, setSession] = useState<any>(null);
  
  const { config, setConfig, propertyId, isLoading, error, reload } = usePropertyData();

  // 1. App-Status Initialisierung
  useEffect(() => {
    const initApp = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const pid = urlParams.get('pid');
      const isHostIntended = urlParams.get('host') === 'true' || urlParams.get('admin') === 'true';
      
      // Gast-Priorität
      if (pid) {
        setStatus('guest_view');
        return;
      }

      // Prüfe auf bestehende Session für Admin
      const currentSession = await authService.getSession();
      if (currentSession) {
        setSession(currentSession);
        const isAdmin = await authService.isAdmin();
        setAdminRole(isAdmin ? 'master' : 'host');
        setStatus('admin_ready');
        return;
      }

      // Login erzwingen wenn Host-URL
      if (isHostIntended) {
        setStatus('admin_login_required');
      } else {
        setStatus('guest_view');
      }
    };

    initApp();

    // Login-Listener für Echtzeit-Wechsel
    const subscription = authService.onAuthStateChange(async (s) => {
      if (s) {
        setSession(s);
        const isAdmin = await authService.isAdmin();
        setAdminRole(isAdmin ? 'master' : 'host');
        setStatus('admin_ready');
      } else {
        setSession(null);
        setAdminRole('none');
        // Falls wir nicht im Gast-Modus sind, zurück zum Login oder Landing
        const params = new URLSearchParams(window.location.search);
        if (params.get('host') === 'true' || params.get('admin') === 'true') {
          setStatus('admin_login_required');
        }
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleUpdateConfig = async (newConfig: AppConfig, explicitId?: string) => {
    // Nutze explizite ID (vom Dashboard) oder Fallback auf ID vom Hook
    const targetPid = explicitId || propertyId;
    
    if (!targetPid || !session) {
      console.warn("Update failed: No Property ID or Session found.");
      return;
    }

    try {
      await propertyService.syncPropertyData(targetPid, newConfig);
      setConfig(newConfig);
      await cacheService.remove(targetPid);
      console.log("Sync complete for PID:", targetPid);
    } catch (e) {
      console.error("Critical Sync Error:", e);
      throw e; // Weitergeben an AdminDashboard für Fehleranzeige
    }
  };

  // --- RENDERING ---

  if (status === 'init') return null;

  if (status === 'admin_login_required') return <AdminLogin />;
  
  if (status === 'admin_ready' && session) {
    return (
      <LanguageProvider>
          <AdminDashboard 
              currentConfig={config} 
              isMaster={adminRole === 'master'} 
              onUpdate={handleUpdateConfig} 
              propertyId={propertyId || undefined} 
              onExit={() => {
                authService.signOut().then(() => {
                   window.location.href = window.location.origin;
                });
              }}
              onReload={reload}
          />
      </LanguageProvider>
    );
  }

  if (status === 'guest_view') {
    if (isLoading && !config && propertyId) {
      return (
        <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-10">
          <Loader2 className="text-gold-500 animate-spin mb-4" size={40} />
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Sanctuary is loading...</p>
        </div>
      );
    }

    if (error && !config && propertyId) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
          <ShieldAlert className="text-red-500 mb-6" size={48} />
          <h2 className="text-navy-900 font-serif text-2xl font-black italic mb-4">Sanctuary Offline</h2>
          <button onClick={() => window.location.reload()} className="bg-navy-900 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Retry</button>
        </div>
      );
    }

    if (config) {
      return (
        <LanguageProvider>
          <GuestApp config={config} onEnterAdmin={() => setStatus('admin_login_required')} />
        </LanguageProvider>
      );
    }

    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[4rem] p-12 md:p-16 shadow-2xl">
          <div className="w-20 h-20 bg-navy-900 rounded-3xl flex items-center justify-center text-gold-500 mb-10 mx-auto shadow-xl">
            <Sparkles size={40} />
          </div>
          <h1 className="text-5xl font-serif font-black text-navy-900 mb-4 italic tracking-tighter leading-none">Sibenik Insider</h1>
          <button onClick={() => setStatus('admin_login_required')} className="w-full bg-navy-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl transition-all">
              <LayoutDashboard size={20} className="text-gold-500" /> Host Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
