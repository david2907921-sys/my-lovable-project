
import React, { useEffect, useState, useRef } from 'react';
import { 
  Sun, Cloud, CloudRain, CloudSnow, Globe, ChevronDown, 
  ThermometerSun, Thermometer, Wind, Droplets, Gauge, ExternalLink, CloudSun
} from 'lucide-react';
import { Language } from '../types';
import { GLOBAL_TRANSLATIONS } from '../translations';

export const LanguageToggle = ({ 
  lang, 
  setLang, 
  variant = 'light', 
  align = 'left' 
}: { 
  lang: Language, 
  setLang: (l: Language) => void, 
  variant?: 'light' | 'dark',
  align?: 'left' | 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const availableLanguages = Object.keys(GLOBAL_TRANSLATIONS);
  const isDark = variant === 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (l: string) => {
    setLang(l as Language);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 backdrop-blur-xl rounded-full p-1 pl-4 pr-3 border shadow-xl h-[48px] transition-all active:scale-95 group ${
          isDark 
          ? 'bg-theme-primary/5 border-theme-primary/10 shadow-theme-primary/5' 
          : 'bg-white/20 border-white/30 shadow-xl'
        }`}
      >
        <Globe size={16} className={`${isDark ? 'text-theme-primary/40 group-hover:text-theme-primary' : 'text-white/70 group-hover:text-white'} transition-colors`} />
        <span className={`font-black text-[11px] tracking-[0.2em] ${isDark ? 'text-theme-primary' : 'text-white'}`}>{lang.toUpperCase()}</span>
        <ChevronDown size={14} className={`${isDark ? 'text-theme-primary/20' : 'text-white/40'} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-3 z-[5000] animate-[fadeIn_0.2s_ease-out] ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <div className={`${isDark ? 'bg-white border-slate-200 shadow-2xl' : 'bg-white/20 backdrop-blur-2xl border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'} rounded-[2rem] p-2 border min-w-[140px]`}>
            <div className="grid grid-cols-2 gap-1">
              {availableLanguages.map((l) => (
                <button
                  key={l}
                  onClick={() => handleSelect(l)}
                  className={`px-4 py-3 rounded-[1.2rem] text-[10px] font-black tracking-widest transition-all flex items-center justify-center ${
                    lang === l 
                    ? 'text-white bg-theme-primary shadow-lg' 
                    : isDark ? 'text-slate-400 hover:bg-slate-50' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  code: number;
}

interface WeatherDetail {
  temp: number;
  apparent: number;
  wind: number;
  humidity: number;
  code: number;
}

export const WeatherPill = ({ coordinates, city = "Sibenik" }: { coordinates?: { lat: number; lng: number }, city?: string }) => {
  const [current, setCurrent] = useState<WeatherDetail | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!coordinates) return;
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lng}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,apparent_temperature&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
        const res = await fetch(url);
        const data = await res.json();
        
        setCurrent({
          temp: Math.round(data.current_weather.temperature),
          apparent: Math.round(data.hourly.apparent_temperature[0]),
          wind: Math.round(data.current_weather.windspeed),
          humidity: data.hourly.relative_humidity_2m[0],
          code: data.current_weather.weathercode
        });
        
        const days: ForecastDay[] = data.daily.time.slice(1, 4).map((time: string, i: number) => ({
          date: time,
          maxTemp: Math.round(data.daily.temperature_2m_max[i+1]),
          minTemp: Math.round(data.daily.temperature_2m_min[i+1]),
          code: data.daily.weathercode[i+1]
        }));
        setForecast(days);
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };
    fetchWeather();
  }, [coordinates]);

  const getWeatherIcon = (code: number, size = 20) => {
    if (code === 0) return <Sun size={size} className="text-yellow-400 fill-yellow-400 animate-pulse" />;
    if (code === 1 || code === 2) return <CloudSun size={size} className="text-yellow-200" />;
    if (code === 3) return <Cloud size={size} className="text-gray-200" />;
    if (code >= 71) return <CloudSnow size={size} className="text-white" />;
    if (code >= 51) return <CloudRain size={size} className="text-blue-300" />;
    return <Sun size={size} className="text-yellow-400 fill-yellow-400" />;
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' });
  };

  if (!current) return null;

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Pill */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/20 backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/30 shadow-xl h-[48px] transition-all hover:bg-white/30 active:scale-95 group"
      >
        <div className="group-hover:rotate-12 transition-transform duration-500">
            {getWeatherIcon(current.code, 22)}
        </div>
        <span className="text-white font-serif font-black text-xl tracking-tighter">{current.temp}°</span>
        <ChevronDown size={12} className={`text-white/30 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Forecast Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-4 z-[5000] animate-[fadeIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div 
              className="bg-white/15 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/20 min-w-[340px] relative overflow-hidden"
              style={{
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.4), 0 20px 40px -10px rgba(0,0,0,0.2)'
              }}
            >
                {/* Background Glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-[60px]"></div>
                
                {/* Header: Today Detail */}
                <div className="relative z-10 grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/10">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">Right Now</span>
                        <div className="flex items-center gap-4">
                             {getWeatherIcon(current.code, 42)}
                             <div className="flex flex-col">
                                <span className="text-4xl font-serif font-black text-white leading-none">{current.temp}°</span>
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Feels {current.apparent}°</span>
                             </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 text-white/70">
                            <Wind size={16} className="text-white/30" />
                            <span className="text-[11px] font-black uppercase tracking-widest">{current.wind} <span className="text-[9px] opacity-50">km/h</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                            <Droplets size={16} className="text-white/30" />
                            <span className="text-[11px] font-black uppercase tracking-widest">{current.humidity}<span className="text-[9px] opacity-50">%</span></span>
                        </div>
                    </div>
                </div>
                
                {/* 3-Day List */}
                <div className="relative z-10 space-y-6 mb-8">
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 block mb-2">3-Day Briefing</span>
                    {forecast.map((day, idx) => (
                        <div key={day.date} className="flex items-center justify-between group/day animate-[fadeIn_0.5s_ease-out]" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="flex items-center gap-6">
                                <div className="w-10 text-[12px] font-black uppercase tracking-widest text-white/90">
                                    {getDayName(day.date)}
                                </div>
                                <div className="p-2.5 bg-white/5 rounded-2xl border border-white/5 group-hover/day:bg-white/10 transition-all duration-500 group-hover/day:scale-110">
                                    {getWeatherIcon(day.code, 18)}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 font-serif font-bold text-white text-base">
                                <span className="w-8 text-right tracking-tighter">{day.maxTemp}°</span>
                                <div className="w-px h-3 bg-white/10"></div>
                                <span className="w-8 text-white/40 text-sm tracking-tighter">{day.minTemp}°</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between opacity-30">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white">Hyperlocal Data</p>
                    <Gauge size={12} className="text-white" />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export const VideoPlayer = ({ src }: { src: string }) => (
  <div className="relative rounded-xl overflow-hidden shadow-sm bg-black aspect-video mb-4">
    <video src={src} className="w-full h-full object-cover" autoPlay loop muted playsInline />
  </div>
);

export const ImageGallery = ({ images }: { images: string[] }) => {
  if (!images || images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="rounded-xl overflow-hidden shadow-sm aspect-video mb-4 relative border border-slate-100">
        <img src={images[0]} alt="Manual content" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 snap-x no-scrollbar mb-4">
      {images.map((img, idx) => (
        <div key={idx} className="min-w-[85%] rounded-xl overflow-hidden shadow-sm aspect-video snap-center relative border border-slate-100">
          <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
            {idx + 1} / {images.length}
          </div>
        </div>
      ))}
    </div>
  );
};
