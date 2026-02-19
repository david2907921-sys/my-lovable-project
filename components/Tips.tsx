
import React, { useState, useMemo } from 'react';
import { Sparkles, X, Send, Plus, Heart, BadgeCheck } from 'lucide-react';
import { Language, GuestTip } from '../types';
import { TRANSLATIONS } from '../constants';

export const AddTipModal = ({ lang, onAdd, onClose }: { lang: Language, onAdd: (tip: Partial<GuestTip>) => void, onClose: () => void }) => {
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<'food' | 'activity' | 'hidden-gem'>('food');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!author || !content) return;
        onAdd({ author, content, category });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-md" onClick={onClose}></div>
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 relative z-10 shadow-2xl">
                <button type="button" onClick={onClose} className="absolute top-6 right-6 text-gray-500"><X size={24} /></button>
                <div className="mb-6">
                    <h3 className="text-2xl font-serif text-navy-900 font-bold">{TRANSLATIONS.addTip[lang]}</h3>
                </div>
                <div className="space-y-4">
                    <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-navy-900 outline-none" required />
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Your Tip" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-navy-900 h-32 resize-none outline-none" required />
                </div>
                <button type="submit" className="w-full bg-navy-900 text-white py-4.5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest mt-8 flex items-center justify-center gap-2 shadow-xl"><Send size={18} /> Pin it!</button>
            </form>
        </div>
    );
};

export const GuestTipsWidget = ({ tips, lang, onUpvote, onAddTip }: { tips: GuestTip[], lang: Language, onUpvote: (id: string) => void, onAddTip: (tip: Partial<GuestTip>) => void }) => {
    const [filter, setFilter] = useState<'all' | 'popular' | 'food' | 'activity' | 'hidden-gem'>('all');
    const [isAdding, setIsAdding] = useState(false);

    const filteredTips = useMemo(() => {
        let list = [...tips];
        if (filter === 'popular') return list.sort((a,b) => b.upvotes - a.upvotes);
        if (filter !== 'all') list = list.filter(t => t.category === filter);
        return list.sort((a,b) => b.upvotes - a.upvotes);
    }, [tips, filter]);

    return (
        <div className="pb-40 pt-10 px-6 animate-[fadeIn_0.2s_ease-out] bg-slate-50 min-h-screen">
            <div className="flex justify-between items-end mb-8">
                <div><h2 className="text-4xl font-serif text-navy-900 font-bold mb-1.5">{TRANSLATIONS.tipsTitle[lang]}</h2><p className="text-gray-500 text-sm font-bold tracking-tight">{TRANSLATIONS.tipsSubtitle[lang]}</p></div>
                <button onClick={() => setIsAdding(true)} className="bg-navy-900 text-white p-4.5 rounded-2xl shadow-xl"><Plus size={24} /></button>
            </div>
            <div className="grid grid-cols-1 gap-8">
                {filteredTips.map((tip) => (
                    <div key={tip.id} className="bg-white p-7 rounded-[2.5rem] relative group shadow-sm border-2 border-white">
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-navy-900/5 flex items-center justify-center text-navy-900 font-serif font-black italic text-xl">{tip.author.charAt(0)}</div>
                                <div><p className="text-sm font-black text-navy-900 flex items-center gap-1.5">{tip.author}{tip.isHostVerified && <BadgeCheck size={16} className="text-blue-500" />}</p><p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">{tip.date}</p></div>
                            </div>
                        </div>
                        <p className="text-slate-800 text-lg leading-relaxed italic font-medium mb-7">"{tip.content}"</p>
                        <div className="flex items-center justify-between border-t border-slate-50 pt-5">
                            <button onClick={() => onUpvote(tip.id)} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${tip.upvotes > 0 ? 'text-navy-900 bg-navy-50/50' : 'text-slate-500'}`}><Heart size={20} fill={tip.upvotes > 0 ? "#0a2472" : "none"} /> {tip.upvotes} Votes</button>
                        </div>
                    </div>
                ))}
            </div>
            {isAdding && <AddTipModal lang={lang} onClose={() => setIsAdding(false)} onAdd={onAddTip} />}
        </div>
    );
};
