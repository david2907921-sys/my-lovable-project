
import React from 'react';
import { Home, Compass, BookOpen, Phone, LucideIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export type TabID = 'home' | 'guide' | 'manual' | 'contact';

interface NavItem {
  id: TabID;
  icon: LucideIcon;
  labelKey: string;
}

interface BottomNavProps {
  activeTab: TabID;
  setActiveTab: (id: TabID) => void;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: Home, labelKey: 'home' },
  { id: 'guide', icon: Compass, labelKey: 'map' },
  { id: 'manual', icon: BookOpen, labelKey: 'manual' },
  { id: 'contact', icon: Phone, labelKey: 'contact' },
];

export const BottomNav = ({ activeTab, setActiveTab }: BottomNavProps) => {
  const { t } = useLanguage();

  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50 px-8 pointer-events-none">
      <nav 
        className="backdrop-blur-3xl text-white shadow-2xl rounded-[2.8rem] px-3 py-3 flex items-center justify-around gap-1 pointer-events-auto border border-white/20 max-w-[400px] w-full transition-all duration-500 hover:shadow-gold-500/10 hover:border-white/30"
        style={{ backgroundColor: `color-mix(in srgb, var(--primary), transparent 10%)` }} 
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-center gap-3 rounded-full transition-all duration-500 outline-none
                ${isActive 
                  ? 'bg-white px-6 py-4 shadow-2xl font-black grow scale-105 text-theme-primary' 
                  : 'p-4 text-white/40 hover:text-white/70 active:scale-90'
                }`}
            >
              <Icon size={isActive ? 18 : 22} strokeWidth={isActive ? 3 : 2} />
              {isActive && (
                <span className="text-[10px] uppercase font-black tracking-[0.2em] whitespace-nowrap animate-[fadeIn_0.3s_ease-out]">
                  {t(item.labelKey)}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
