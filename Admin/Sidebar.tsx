
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Globe, Newspaper, BookOpen, Settings, Eye, ChevronLeft, MapPin, LogOut, ShieldCheck, MapPinned, Printer } from 'lucide-react';
import { authService } from '../../services/supabase';
import { Language } from '../../types';
import { t as translate } from '../../translations';

interface SidebarProps {
  propertyName: string;
  activeSection: string;
  setActiveSection: (s: any) => void;
  isMaster: boolean;
  propertyId?: string;
  uiLang: Language;
  onBackToFleet: () => void;
}

export const Sidebar = ({ propertyName, activeSection, setActiveSection, isMaster, propertyId, uiLang, onBackToFleet }: SidebarProps) => {
  const [canAccessMaster, setCanAccessMaster] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const isAdmin = await authService.isAdmin();
      setCanAccessMaster(isAdmin);
    };
    checkRole();
  }, []);

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await authService.signOut();
      window.location.href = '/';
    }
  };

  const handleViewGuestApp = () => {
    const url = propertyId ? `/?pid=${propertyId}` : '/';
    window.open(url, '_blank');
  };

  const handleBackToFleet = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('pid');
      window.history.replaceState({}, '', url.toString());
      onBackToFleet();
  };

  return (
    <aside className="w-full md:w-80 bg-navy-900 text-white p-10 flex flex-col shrink-0 min-h-screen print:hidden">
      <div className="flex items-center gap-5 mb-20 px-2 group cursor-pointer" onClick={handleBackToFleet}>
        <div className="bg-white/10 p-4 rounded-2xl border border-white/10 group-hover:bg-gold-500 transition-all">
          {isMaster ? <ChevronLeft size={24} className="text-white group-hover:text-navy-900" /> : <LayoutDashboard size={24} className="text-gold-400" />}
        </div>
        <div>
          <h2 className="font-serif font-black text-2xl leading-tight line-clamp-1">{propertyName}</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{isMaster ? 'Fleet View' : 'Property Management'}</p>
        </div>
      </div>

      <nav className="space-y-4 flex-1">
        {[
          { id: 'overview', label: translate('admin_overview', uiLang), icon: Globe },
          { id: 'logistics', label: translate('admin_logistics', uiLang), icon: MapPinned },
          { id: 'marketing', label: translate('admin_marketing', uiLang), icon: Printer },
          { id: 'gazette', label: translate('admin_gazette', uiLang), icon: Newspaper },
          { id: 'manual', label: translate('admin_manual', uiLang), icon: BookOpen },
          { id: 'guide', label: translate('admin_guide', uiLang), icon: MapPin },
          { id: 'settings', label: translate('admin_settings', uiLang), icon: Settings }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveSection(item.id as any)}
            className={`w-full flex items-center gap-4 px-8 py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSection === item.id ? 'bg-gold-500 text-navy-900 shadow-2xl scale-105' : 'hover:bg-white/5 text-white/60'}`}
          >
            <item.icon size={20} /> {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4 pt-10 border-t border-white/5">
        {canAccessMaster && !isMaster && (
            <button 
                onClick={handleBackToFleet}
                className="w-full flex items-center gap-4 px-8 py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest text-gold-500 bg-gold-500/10 border border-gold-500/20 hover:bg-gold-500 hover:text-navy-900 transition-all mb-4"
            >
                <ShieldCheck size={20} /> Master Hub
            </button>
        )}
        
        <button 
          onClick={handleViewGuestApp}
          className="w-full flex items-center gap-4 px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10"
        >
          <Eye size={20} /> View Guest App
        </button>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-all bg-red-500/5 hover:bg-red-500/10"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </div>
    </aside>
  );
};
