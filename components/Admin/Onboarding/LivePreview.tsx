
import React from 'react';
import { MapPin } from 'lucide-react';
import { AppConfig } from '../../../types';
import { LanguageToggle, WeatherPill } from '../../UI';

interface LivePreviewProps {
  data: AppConfig;
}

const HERO_PRESETS = [
    { name: 'Coastal Luxury', url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200' },
];

export const LivePreview = ({ data }: LivePreviewProps) => {
    // Dynamic CSS variables for preview matching GuestApp
    const previewStyle = {
        '--primary': data.themeColors.primary,
        '--secondary': data.themeColors.secondary,
    } as React.CSSProperties;

    return (
        <div className="w-[300px] h-[600px] bg-white rounded-[3rem] border-8 border-slate-900 shadow-2xl relative overflow-hidden select-none mx-auto transform scale-90 md:scale-100 transition-all duration-500" style={previewStyle}>
            <div className="absolute inset-0 bg-slate-50 flex flex-col font-sans">
                {/* Hero Section */}
                <div className="relative h-[60%] w-full text-white overflow-hidden rounded-b-[2.5rem] shadow-xl shrink-0 transition-all duration-500 bg-theme-primary">
                    <img src={data.heroImage || HERO_PRESETS[0].url} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Hero" />
                    <div 
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to top, var(--primary) 10%, color-mix(in srgb, var(--primary), transparent 40%) 40%, transparent 100%)` }}
                    ></div>
                    
                    <div className="absolute top-8 left-0 right-0 px-4 flex justify-between items-center z-20 scale-75 origin-top">
                        <LanguageToggle lang="en" setLang={() => {}} />
                        {data.logo ? (
                            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl p-1 shadow-lg border border-white/30">
                                <img src={data.logo} className="w-full h-full object-contain" alt="Logo" />
                            </div>
                        ) : <WeatherPill />}
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pt-10">
                        <h2 className="text-white text-[8px] font-black uppercase tracking-[0.4em] font-serif mb-2">{data.propertyName}</h2>
                        <h1 className="text-4xl font-serif text-white font-bold leading-none mb-4 italic">Good Afternoon.</h1>
                        <p className="text-white/80 text-[10px] font-medium leading-relaxed max-w-[200px] line-clamp-2">{data.heroTitle.en}</p>
                    </div>
                </div>

                {/* Body Content */}
                <div className="px-4 -mt-10 relative z-10 flex-1 overflow-hidden">
                    <div className="bg-white p-4 rounded-[2rem] shadow-lg flex flex-col items-center justify-center border border-slate-50 mb-6">
                        <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.4em] mb-2">TODAY IS</p>
                        <div className="flex items-center gap-2">
                             <span className="text-2xl font-serif font-black text-theme-primary">14:30</span>
                        </div>
                        {data.city && (
                             <div className="mt-2 flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full">
                                <MapPin size={8} className="text-theme-secondary" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{data.city}</span>
                             </div>
                        )}
                    </div>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-50"></div>
            </div>
        </div>
    );
};
