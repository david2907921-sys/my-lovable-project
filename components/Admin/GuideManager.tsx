
import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, CheckCircle2, Circle, Search, ArrowUp, ArrowDown, ListOrdered } from 'lucide-react';
import { Recommendation, Language } from '../../types';
import { propertyService } from '../../services/supabase';
import { tc } from '../../translations';

interface GuideManagerProps {
  propertyId: string;
  currentRecommendations: Recommendation[];
  onToggle: (rec: Recommendation, active: boolean) => void;
  onReorder?: (newIds: string[]) => void;
  // Added editLang to props to support localized display and search
  editLang?: Language;
}

const CATEGORY_ORDER = ['all', 'food', 'cafes', 'bars', 'beach', 'sightseeing', 'culture', 'activity', 'transport'];

export const GuideManager = ({ propertyId, currentRecommendations, onToggle, onReorder, editLang = 'en' }: GuideManagerProps) => {
  const [globalPool, setGlobalPool] = useState<Recommendation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewSelectedOnly, setViewSelectedOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await propertyService.getAllGlobalRecommendations();
      if (data) setGlobalPool(data);
      setLoading(false);
    };
    load();
  }, []);

  const isSelected = (id: string) => currentRecommendations.some(r => r.id === id);

  const filteredPool = useMemo(() => {
    let list = viewSelectedOnly ? currentRecommendations : globalPool;
    
    return list.filter(r => {
      // Fixed: r.title is LocalizedContent, must use tc() before performing search
      const titleStr = tc(r.title, editLang);
      const matchesSearch = titleStr.toLowerCase().includes(search.toLowerCase()) || 
                            r.town.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [globalPool, currentRecommendations, search, activeCategory, viewSelectedOnly, editLang]);

  const handleMove = (recId: string, direction: 'up' | 'down') => {
    if (!onReorder) return;
    const currentIds = currentRecommendations.map(r => r.id);
    const idx = currentIds.indexOf(recId);
    if (idx === -1) return;
    
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= currentIds.length) return;

    const newIds = [...currentIds];
    const [moved] = newIds.splice(idx, 1);
    newIds.splice(newIdx, 0, moved);
    onReorder(newIds);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="bg-navy-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><MapPin size={80} /></div>
        <h4 className="text-3xl font-serif font-black mb-2 italic">Guide Librarian</h4>
        <p className="text-white/40 font-black text-[10px] uppercase tracking-widest">Select & Arrange POIs for your property</p>
      </div>

      <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search POIs..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-4 font-bold text-navy-900 shadow-sm outline-none focus:border-navy-900 transition-all"
                />
            </div>
            <button 
                onClick={() => setViewSelectedOnly(!viewSelectedOnly)}
                className={`p-4 rounded-2xl transition-all border flex items-center gap-2 font-black text-[9px] uppercase tracking-widest
                    ${viewSelectedOnly ? 'bg-gold-500 text-navy-900 border-gold-500' : 'bg-white text-slate-400 border-slate-100'}`}
            >
                <ListOrdered size={16} /> {viewSelectedOnly ? 'View All' : 'Manage Selected'}
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORY_ORDER.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                  ${activeCategory === cat 
                    ? 'bg-navy-900 text-white border-navy-900 shadow-lg' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-navy-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredPool.map(rec => {
          const active = isSelected(rec.id);
          const showOrderTools = viewSelectedOnly && active && !search;
          
          return (
            <div 
              key={rec.id}
              className={`p-4 rounded-[2rem] border transition-all flex items-center justify-between text-left group
                ${active 
                  ? 'bg-navy-900 border-navy-900 text-white shadow-lg' 
                  : 'bg-white border-slate-100 text-navy-900 hover:border-navy-200'
                }`}
            >
              <button onClick={() => onToggle(rec, !active)} className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${active ? 'bg-white/10 text-gold-400' : 'bg-slate-50 text-slate-400'}`}>
                  {active ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>
                <div>
                  {/* Fixed: title is LocalizedContent and must be rendered as a string using tc() */}
                  <p className="font-serif font-black text-base leading-tight">{tc(rec.title, editLang)}</p>
                  <p className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-white/40' : 'text-slate-300'}`}>{rec.town} • {rec.category}</p>
                </div>
              </button>

              {showOrderTools && (
                <div className="flex flex-col gap-1 ml-4 pr-2">
                    <button onClick={() => handleMove(rec.id, 'up')} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowUp size={14} /></button>
                    <button onClick={() => handleMove(rec.id, 'down')} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowDown size={14} /></button>
                </div>
              )}
            </div>
          );
        })}
        {filteredPool.length === 0 && (
            <div className="py-20 text-center text-slate-300">
                <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-serif italic text-xl">No resources match your filters.</p>
            </div>
        )}
      </div>
    </div>
  );
};
