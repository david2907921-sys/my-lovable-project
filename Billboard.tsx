
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sparkles, Heart, Plus, Search, Trophy, Star, Filter, X, Send, Award, ShieldAlert, Loader2, Globe, Trees, Waves, Baby, Landmark, Moon, Camera, Languages } from 'lucide-react';
import { Language } from '../../types';
import { supabase, generateId, propertyService } from '../../services/supabase';
import { GoogleGenAI } from "@google/genai";
import { t as translate } from '../../translations';
import { compressImage, base64ToBlob } from '../../utils/image';

interface BillboardProps {
  lang: Language;
  primaryColor: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  'food': Star,
  'activity': Trophy,
  'hidden-gem': Sparkles,
  'nature': Trees,
  'beach': Waves,
  'kids': Baby,
  'culture': Landmark,
  'nightlife': Moon
};

const getTravelerRank = (upvotes: number, lang: Language) => {
  if (upvotes > 150) return { name: translate('rank_4', lang), color: 'text-amber-500', icon: Award };
  if (upvotes > 75) return { name: translate('rank_3', lang), color: 'text-indigo-500', icon: Sparkles };
  if (upvotes > 25) return { name: translate('rank_2', lang), color: 'text-emerald-500', icon: Trophy };
  return { name: translate('rank_1', lang), color: 'text-slate-400', icon: Star };
};

export const Billboard = ({ lang, primaryColor }: BillboardProps) => {
  const [tips, setTips] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showOnlyMyLang, setShowOnlyMyLang] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [explodingId, setExplodingId] = useState<string | null>(null);

  useEffect(() => {
    fetchGlobalTips();
    const savedLikes = localStorage.getItem('billboard_likes');
    if (savedLikes) setLikedIds(JSON.parse(savedLikes));
  }, []);

  const fetchGlobalTips = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('global_guest_tips')
        .select('*');
      if (data) setTips(data);
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id: string, currentUpvotes: number) => {
    if (likedIds.includes(id)) return;

    setExplodingId(id);
    setTimeout(() => setExplodingId(null), 800);

    const { error } = await supabase
      .from('global_guest_tips')
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', id);

    if (!error) {
      setTips(tips.map(t => t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t));
      const newLikes = [...likedIds, id];
      setLikedIds(newLikes);
      localStorage.setItem('billboard_likes', JSON.stringify(newLikes));
    }
  };

  const filteredTips = useMemo(() => {
    return tips
      .filter(t => {
        const matchesFilter = filter === 'all' || t.category === filter;
        const matchesSearch = t.content.toLowerCase().includes(search.toLowerCase()) || 
                             t.author.toLowerCase().includes(search.toLowerCase());
        const matchesLang = !showOnlyMyLang || t.language === lang;
        return matchesFilter && matchesSearch && matchesLang;
      })
      .sort((a, b) => {
        if (a.language === lang && b.language !== lang) return -1;
        if (a.language !== lang && b.language === lang) return 1;
        return b.upvotes - a.upvotes;
      });
  }, [tips, filter, search, showOnlyMyLang, lang]);

  const activeCategories = useMemo(() => {
    const cats = new Set(tips.map(t => t.category));
    const list = Array.from(cats) as string[];
    return ['all', ...list].map(id => ({
      id,
      label: translate(`filter_${id === 'all' ? 'all' : id.replace('-', '_')}`, lang),
      icon: CATEGORY_ICONS[id] || Filter
    }));
  }, [tips, lang]);

  return (
    <div className="pb-48 pt-16 px-4 bg-[#fcfcf7] min-h-screen relative overflow-x-hidden no-scrollbar">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
      
      {/* Header Container */}
      <div className="relative z-10 mb-8 max-w-md mx-auto pt-4">
        <div className="flex justify-between items-center mb-8 px-1">
          <div className="flex-1">
            <p className="flex items-center gap-2 text-theme-secondary font-black text-[9px] uppercase tracking-[0.4em] mb-2">
               <Sparkles size={12} className="animate-pulse" /> Sibenik Network
            </p>
            <h2 className="text-4xl font-serif text-theme-primary font-bold tracking-tighter leading-none italic drop-shadow-sm">
              {translate('tipsTitle', lang)}
            </h2>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-14 h-14 bg-theme-primary text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-all hover:rotate-6 shrink-0 ml-4 border-2 border-white"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative group mx-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-theme-primary transition-colors" size={16} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={translate('billboard_search_placeholder', lang)}
              className="w-full bg-white rounded-2xl py-3.5 pl-12 pr-4 font-bold text-navy-900 shadow-md border-none focus:ring-4 focus:ring-theme-primary/5 transition-all outline-none text-xs"
            />
          </div>
          
          <div className="space-y-3">
             {/* Dynamic Language Toggle - Fixed Colors to use CSS Variables */}
             <div className="flex bg-white/60 p-1.5 rounded-2xl border border-slate-100 mx-1 shadow-sm relative z-20">
                <button 
                    onClick={() => setShowOnlyMyLang(false)}
                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${!showOnlyMyLang ? 'bg-theme-primary text-white shadow-lg' : 'text-slate-400'}`}
                >
                    <Globe size={12} /> {translate('filter_all', lang)}
                </button>
                <button 
                    onClick={() => setShowOnlyMyLang(true)}
                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${showOnlyMyLang ? 'bg-theme-secondary text-white shadow-lg' : 'text-slate-400'}`}
                >
                    <Languages size={12} /> {lang.toUpperCase()}
                </button>
             </div>

             {/* Categories Scrollable List */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
              {activeCategories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 shadow-sm border
                    ${filter === cat.id ? 'bg-theme-primary text-white border-theme-primary shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
                >
                  <cat.icon size={11} /> {cat.label}
                </button>
              ))}
             </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-20">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p className="font-serif italic text-lg tracking-tight">Gathering echoes...</p>
        </div>
      ) : (
        <div className="relative z-10 space-y-12 max-w-md mx-auto pb-20">
          {filteredTips.map((tip, idx) => {
            const rank = getTravelerRank(tip.upvotes, lang);
            const isLiked = likedIds.includes(tip.id);
            const isExploding = explodingId === tip.id;
            
            return (
              <div 
                key={tip.id} 
                className={`bg-white p-4 rounded-sm shadow-2xl relative border-[8px] border-white transition-all
                  ${idx % 2 === 0 ? 'rotate-[1deg]' : '-rotate-[1deg]'} hover:rotate-0 hover:scale-[1.01] active:scale-[0.99]`}
              >
                {/* Visual Pin Decoration */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-theme-primary/10 backdrop-blur-sm border border-white/50 rotate-[-1deg] z-20 shadow-sm opacity-60"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-theme-primary font-serif font-black italic text-lg shadow-inner border border-slate-50">
                      {tip.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-theme-primary leading-tight font-serif italic">{tip.author}</p>
                      <div className={`flex items-center gap-1 text-[7px] font-black uppercase tracking-widest ${rank.color}`}>
                        <rank.icon size={8} /> {rank.name}
                      </div>
                    </div>
                  </div>
                  {tip.language !== lang && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100">
                       <Globe size={9} className="text-slate-300" />
                       <span className="text-[7px] font-black uppercase text-slate-400">{tip.language}</span>
                    </div>
                  )}
                </div>

                {tip.image_url && (
                    <div className="mb-4 rounded-sm overflow-hidden aspect-square shadow-inner border border-slate-50 relative">
                         <img src={tip.image_url} className="w-full h-full object-cover grayscale-[0.05]" alt="Guest Memory" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    </div>
                )}

                <p className="text-slate-800 text-lg leading-relaxed italic font-serif mb-5 px-1 drop-shadow-sm">
                  "{tip.content}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-theme-primary/5 rounded-lg text-theme-primary/40">
                        {CATEGORY_ICONS[tip.category] ? React.createElement(CATEGORY_ICONS[tip.category], { size: 12 }) : <Sparkles size={12} />}
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        {translate(`filter_${tip.category.replace('-', '_')}`, lang)}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <button 
                        onClick={() => handleUpvote(tip.id, tip.upvotes)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                        ${isLiked ? 'bg-theme-primary text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                        <Heart size={14} fill={isLiked ? "white" : "none"} className={isLiked ? 'animate-[heartPop_0.4s_ease-out]' : ''} />
                        {tip.upvotes}
                    </button>

                    {isExploding && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {[1,2,3,4,5].map(i => (
                                <Heart key={i} size={14} className={`absolute text-theme-secondary fill-current animate-heartExplode-${i}`} />
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredTips.length === 0 && (
            <div className="py-20 text-center opacity-30">
                <Search size={40} className="mx-auto mb-4 text-slate-300" />
                <p className="font-serif italic text-lg">{translate('billboard_empty', lang)}</p>
            </div>
          )}
        </div>
      )}

      {isAdding && (
        <AddSecretModal 
          lang={lang}
          onClose={() => setIsAdding(false)} 
          onAdd={async (newTip) => {
            const { data } = await supabase.from('global_guest_tips').insert([{
                ...newTip,
                language: lang,
                created_at: new Date().toISOString()
            }]).select();
            if (data) setTips([data[0], ...tips]);
            setIsAdding(false);
          }} 
        />
      )}
      
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.6); }
          100% { transform: scale(1); }
        }
        ${[1,2,3,4,5].map(i => `
          @keyframes heartExplode-${i} {
            0% { transform: translate(0,0) scale(1); opacity: 1; }
            100% { transform: translate(${(i-3)*30}px, -60px) scale(0); opacity: 0; }
          }
          .animate-heartExplode-${i} { animation: heartExplode-${i} 0.8s ease-out forwards; }
        `).join('')}
      `}</style>
    </div>
  );
};

const AddSecretModal = ({ onClose, onAdd, lang }: { onClose: () => void, onAdd: (tip: any) => void, lang: Language }) => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('hidden-gem');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const optimized = await compressImage(reader.result as string, 800, 800, 0.7);
          const blob = await base64ToBlob(optimized);
          const publicUrl = await propertyService.uploadImage('community', blob, `${generateId()}-${file.name}`);
          setImageUrl(publicUrl);
          setError(null);
        } catch (e: any) { 
            console.error("Upload error", e);
            setError(lang === 'de' ? "Bildupload fehlgeschlagen. Bitte prüfe deine Internetverbindung." : "Image upload failed. Please check your connection."); 
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!author || !content) return;
    setIsChecking(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this thought for a collective traveler's echo wall: "${content}". 
        Is it offensive, does it contain ads, hate speech or private data like phone numbers? Reply ONLY "SAFE" or "UNSAFE".`,
      });

      if (response.text?.trim().toUpperCase() === 'SAFE') {
        onAdd({ author, content, category, image_url: imageUrl });
      } else {
        setError("Please keep it friendly and avoid ads or private data.");
      }
    } catch (e) {
      console.warn("AI check fallback", e);
      onAdd({ author, content, category, image_url: imageUrl });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl border-4 border-white overflow-y-auto no-scrollbar max-h-[85vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-navy-900 transition-all hover:rotate-90"><X size={24} /></button>
        
        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-theme-primary/5 text-theme-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Sparkles size={24} />
          </div>
          <h3 className="text-2xl font-serif font-black text-theme-primary italic leading-none">{translate('billboard_share_title', lang)}</h3>
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300 mt-2">{translate('billboard_share_subtitle', lang)}</p>
        </div>

        <div className="space-y-4">
          <div 
            onClick={() => fileRef.current?.click()}
            className="aspect-video w-full rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-theme-primary/5 hover:border-theme-primary/20 transition-all overflow-hidden relative"
          >
            {imageUrl ? (
                <>
                    <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Camera className="text-white opacity-80" size={24} />
                    </div>
                </>
            ) : (
                <>
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-200">
                        <Camera size={20} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{translate('billboard_upload_img', lang)}</span>
                </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <input 
            value={author} 
            onChange={e => setAuthor(e.target.value)}
            placeholder={lang === 'de' ? 'Dein Name' : 'Your Name'} 
            className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold text-navy-900 outline-none focus:ring-4 focus:ring-theme-primary/5 transition-all text-xs"
          />
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)}
            placeholder={translate('billboard_search_placeholder', lang)} 
            className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold text-navy-900 h-24 resize-none outline-none focus:ring-4 focus:ring-theme-primary/5 transition-all text-xs"
          />
          
          <div className="grid grid-cols-2 gap-2">
            {['hidden-gem', 'food', 'activity', 'nature', 'kids', 'nightlife', 'beach', 'culture'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategory(cat)}
                className={`py-2 rounded-xl text-[7px] font-black uppercase tracking-widest border transition-all ${category === cat ? 'bg-theme-primary text-white border-theme-primary shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}
              >
                {translate(`filter_${cat.replace('-', '_')}`, lang)}
              </button>
            ))}
          </div>
        </div>

        {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3">
                <ShieldAlert size={16} className="shrink-0" />
                <p className="text-[8px] font-bold uppercase tracking-tight leading-tight">{error}</p>
            </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={!author || !content || isChecking}
          className="w-full bg-theme-primary text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] mt-6 shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all"
        >
          {isChecking ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
          {isChecking ? translate('billboard_moderation', lang) : translate('billboard_btn_pin', lang)}
        </button>
      </div>
    </div>
  );
};
