
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Map as MapIcon, MapPin, Utensils, Waves, Landmark, Footprints, Bus, Info, Home, Heart, X, ArrowRight, Navigation, List
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Language, Recommendation } from '../types';
import { t, tc } from '../translations';

const CATEGORY_ORDER = ['all', 'food', 'cafes', 'bars', 'beach', 'sightseeing', 'culture', 'activity', 'transport'];

const createCustomIcon = (category: string, isProperty: boolean = false) => {
  const icons: Record<string, React.ElementType> = {
    food: Utensils, beach: Waves, culture: Landmark, activity: Footprints, transport: Bus, property: Home
  };

  const IconComponent = isProperty ? icons.property : (icons[category] || Info);
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0a2472';
  const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim() || '#c5a028';
  const colorClass = isProperty ? secondaryColor : primaryColor;
  
  const html = renderToStaticMarkup(
    <div className="flex items-center justify-center w-[42px] h-[42px] relative">
      <div className="absolute bottom-[-2px] w-3 h-1 bg-black/20 rounded-full blur-[2px]" />
      <div style={{ backgroundColor: colorClass }} className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white rotate-45">
        <div className="-rotate-45">
          <IconComponent size={18} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );

  return L.divIcon({ html, className: 'custom-leaflet-marker', iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -42] });
};

const RecommendationItem = React.memo(({ rec, lang, onClick }: { rec: Recommendation, lang: Language, onClick: () => void }) => (
    <div 
        onClick={onClick} 
        className="min-w-[94%] sm:min-w-[440px] h-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden snap-center relative shrink-0 cursor-pointer group border border-white/10"
    >
        <img src={rec.image || ""} alt={tc(rec.title, lang)} className="w-full h-full object-cover absolute inset-0 transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute top-8 left-8 bg-theme-primary/90 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10 shadow-lg z-10">
          {t(`filter_${rec.category}`, lang)}
        </div>
        
        {rec.category === 'food' && rec.priceLevel && (
          <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[12px] font-black text-theme-primary border border-white/10 shadow-lg z-10">
            {"€".repeat(rec.priceLevel)}
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-10 text-white z-10">
            <div className="flex items-center gap-2 text-theme-secondary text-xs font-black uppercase tracking-[0.3em] mb-2 drop-shadow-sm">
              <MapPin size={14} fill="currentColor" />{rec.town}
            </div>
            <h3 className="text-4xl font-serif font-bold leading-tight mb-4 tracking-tight drop-shadow-xl">{tc(rec.title, lang)}</h3>
            
            <p className="text-white/95 text-sm line-clamp-3 leading-relaxed mb-6 font-medium italic drop-shadow-md">
              {tc(rec.description, lang)}
            </p>
            
            <button className="bg-white text-theme-primary px-10 py-5 rounded-[1.8rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 transition-all duration-300 shadow-xl border border-transparent hover:!bg-theme-primary hover:!text-white group-hover:shadow-theme-primary/20">
                <span>{t('guide_discover', lang)}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    </div>
));

export const RecommendationModal = React.memo(({ item, lang, onClose }: { item: Recommendation | null, lang: Language, onClose: () => void }) => {
    if (!item) return null;
    const titleStr = tc(item.title, lang);
    const hostTipStr = tc(item.hostTip, lang);
    const hasHostTip = hostTipStr && hostTipStr.trim().length > 0;
    
    const directionsUrl = item.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(titleStr + ' ' + item.town)}+${item.lat},${item.lng}`;

    return (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center pointer-events-none">
            <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md rounded-t-[3.5rem] shadow-2xl h-[94vh] flex flex-col pointer-events-auto overflow-hidden relative animate-slideUp">
                <div className="relative h-64 shrink-0">
                    <button onClick={onClose} className="absolute top-8 right-8 z-40 bg-white/90 p-3 rounded-full shadow-2xl text-theme-primary border border-white/50"><X size={24} /></button>
                    <img src={item.image || ""} alt={titleStr} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                </div>
                <div className="flex-1 overflow-y-auto px-10 pb-40 no-scrollbar">
                    <div className="flex justify-between items-start mb-8 pt-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-theme-secondary text-[11px] font-black uppercase tracking-[0.25em] mb-2">
                                <MapPin size={14} fill="currentColor" /> {item.town}
                            </div>
                            <h2 className="text-4xl font-serif text-theme-primary font-bold leading-tight">{titleStr}</h2>
                        </div>
                        {item.category === 'food' && item.priceLevel && (
                            <div className="bg-slate-50 px-5 py-3 rounded-[1.5rem] text-theme-primary font-black text-sm border-2 border-slate-100 shadow-sm ml-4 self-center whitespace-nowrap">
                                {"€".repeat(item.priceLevel)}
                            </div>
                        )}
                    </div>
                    <div className="space-y-12">
                        <p className="text-slate-800 leading-relaxed text-lg font-medium italic">"{tc(item.description, lang)}"</p>
                        
                        {hasHostTip && (
                            <div className="bg-slate-50 p-8 rounded-[2.8rem] border border-slate-100 flex flex-col gap-5 shadow-sm relative">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-3 rounded-xl shadow-md text-theme-secondary"><Heart size={20} fill="currentColor" /></div>
                                    <p className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.3em]">{t('guide_host_recommendation', lang)}</p>
                                </div>
                                <p className="text-lg text-theme-primary font-bold leading-relaxed">{hostTipStr}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="absolute bottom-10 left-0 right-0 px-10 pointer-events-none z-40">
                    <a href={directionsUrl} target="_blank" rel="noreferrer" className="w-full bg-theme-primary text-white py-6 rounded-[2.2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl pointer-events-auto active:scale-95 transition-all">
                        <Navigation size={20} className="text-white" fill="currentColor" /> {t('guide_directions', lang)}
                    </a>
                </div>
            </div>
        </div>
    );
});

export const LocalGuide = ({ lang, recommendations, coordinates, propertyCity = "Šibenik" }: { lang: Language, recommendations: Recommendation[], coordinates: { lat: number, lng: number }, propertyCity?: string }) => {
    const center: [number, number] = [coordinates.lat, coordinates.lng];
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [cityFilter, setCityFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [activeRec, setActiveRec] = useState<Recommendation | null>(null);

    const availableCategories = useMemo(() => {
        const cats = new Set<string>();
        recommendations.forEach(r => { if (cityFilter === 'all' || r.town === cityFilter) cats.add(r.category); });
        const list = Array.from(cats);
        return list.length > 1 ? ['all', ...CATEGORY_ORDER.filter(c => cats.has(c)), ...list.filter(c => !CATEGORY_ORDER.includes(c)).sort()] : [];
    }, [recommendations, cityFilter]);

    const availableTowns = useMemo(() => {
        const towns = new Set<string>();
        recommendations.forEach(r => { if (categoryFilter === 'all' || r.category === categoryFilter) towns.add(r.town); });
        const list = Array.from(towns);
        return list.length > 1 ? ['all', ...list.sort((a,b) => {
            if (a === propertyCity) return -1;
            if (b === propertyCity) return 1;
            return a.localeCompare(b);
        })] : [];
    }, [recommendations, categoryFilter, propertyCity]);

    const filteredRecs = useMemo(() => {
        return recommendations.filter(r => {
            const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
            const matchCity = cityFilter === 'all' || r.town === cityFilter;
            return matchCat && matchCity;
        });
    }, [recommendations, categoryFilter, cityFilter]);

    const MapContent = () => {
        const map = useMap();
        useEffect(() => { setTimeout(() => map.invalidateSize(), 50); }, [map]);
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 relative overflow-hidden" style={{ overscrollBehaviorY: 'none' }}>
            <div className="bg-white px-5 py-3 z-20 border-b border-slate-100 flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between">
                     <h2 className="text-xl font-serif text-theme-primary font-bold tracking-tight">{t('guide_title', lang)}</h2>
                     <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white shadow-md text-theme-primary' : 'text-slate-400'}`}><MapIcon size={16} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-theme-primary' : 'text-slate-400'}`}><List size={16} /></button>
                     </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    {availableCategories.length > 0 && (
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                            {availableCategories.map(cat => (
                                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${categoryFilter === cat ? 'bg-theme-primary text-white border-theme-primary' : 'bg-white text-slate-400 border-slate-100'}`}>
                                    {cat === 'all' ? t('filter_all', lang) : t(`filter_${cat}`, lang)}
                                </button>
                            ))}
                        </div>
                    )}

                    {availableTowns.length > 0 && (
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                            {availableTowns.map(town => (
                                <button key={town} onClick={() => setCityFilter(town)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${cityFilter === town ? 'bg-theme-primary text-white border-theme-primary' : 'bg-white text-slate-400 border-slate-100'}`}>
                                    {town === 'all' ? t('town_all', lang) : town}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 relative z-0 bg-slate-100 flex flex-col min-h-0">
                {viewMode === 'map' ? (
                    <div className="flex-1 relative">
                        <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                            <MapContent />
                            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                            <Marker position={center} icon={createCustomIcon('property', true)} />
                            {filteredRecs.map(rec => (<Marker key={rec.id} position={[rec.lat, rec.lng]} icon={createCustomIcon(rec.category)} eventHandlers={{ click: () => setActiveRec(rec) }} />))}
                        </MapContainer>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden items-center justify-center">
                        <div className="w-full h-full flex flex-col justify-center items-center relative">
                            <div className="w-full h-full flex items-stretch overflow-x-auto snap-x snap-mandatory px-6 gap-6 no-scrollbar pt-6 pb-36">
                                {filteredRecs.length > 0 ? (
                                    filteredRecs.map(rec => (
                                        <RecommendationItem key={rec.id} rec={rec} lang={lang} onClick={() => setActiveRec(rec)} />
                                    ))
                                ) : (
                                    <div className="w-full flex flex-col items-center justify-center text-slate-300 gap-6 opacity-60 text-center px-10">
                                        <Info size={64} />
                                        <p className="font-serif italic text-2xl">{t('guide_no_results', lang)}</p>
                                        <button onClick={() => { setCategoryFilter('all'); setCityFilter('all'); }} className="text-theme-primary font-black uppercase tracking-widest text-[9px] border-b border-theme-primary pb-0.5">{t('guide_reset', lang)}</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <RecommendationModal item={activeRec} lang={lang} onClose={() => setActiveRec(null)} />
        </div>
    );
};
