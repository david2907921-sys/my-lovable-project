
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { AppConfig, GazettePage, GuestTip } from '../../types';
import { GazetteModal } from '../Gazette';
import { LocalGuide } from '../Guide';
import { Billboard } from './Billboard';
import { ManualSection } from './Manual/ManualSection';
import { BottomNav, TabID } from './BottomNav';
import { HomeView } from './Views/HomeView';
import { ContactView } from './Views/ContactView';

interface GuestAppProps {
  config: AppConfig;
  onEnterAdmin?: () => void;
}

export const GuestApp = ({ config, onEnterAdmin }: GuestAppProps) => {
  const [activeTab, setActiveTab] = useState<TabID | 'tips'>('home');
  const [activeGazettePage, setActiveGazettePage] = useState<GazettePage | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { lang, setLang } = useLanguage();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const themeStyles = {
    '--primary': config.themeColors?.primary || '#0a2472',
    '--secondary': config.themeColors?.secondary || '#c5a028',
    opacity: isReady ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out'
  } as React.CSSProperties;

  return (
    <div className="bg-slate-200 min-h-screen font-sans flex justify-center" style={themeStyles}>
      <div className="w-full max-w-md bg-slate-50 relative shadow-2xl h-screen flex flex-col overflow-hidden">
        
        <main ref={mainRef} className={`h-full no-scrollbar scroll-smooth ${['guide'].includes(activeTab) ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {activeTab === 'home' && (
            <HomeView 
                config={config} 
                lang={lang} 
                setLang={setLang}
                setActiveTab={setActiveTab}
                setActiveGazettePage={setActiveGazettePage}
            />
          )}

          {activeTab === 'guide' && <LocalGuide lang={lang} recommendations={config.recommendations} coordinates={config.coordinates} />}
          
          {activeTab === 'manual' && (
            <ManualSection 
              config={config} 
              lang={lang} 
              setLang={setLang}
              isUnlocked={isUnlocked} 
              setIsUnlocked={setIsUnlocked} 
            />
          )}
          
          {activeTab === 'tips' && (
            <Billboard 
              lang={lang} 
              primaryColor={config.themeColors.primary}
            />
          )}
          
          {activeTab === 'contact' && (
             <ContactView config={config} onEnterAdmin={onEnterAdmin} />
          )}
        </main>
        
        <BottomNav activeTab={activeTab === 'tips' ? 'home' : activeTab} setActiveTab={setActiveTab as any} />
      </div>
      
      <GazetteModal 
        page={activeGazettePage} 
        lang={lang} 
        onClose={() => setActiveGazettePage(null)} 
        config={config}
      />
    </div>
  );
};
