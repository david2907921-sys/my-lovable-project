
import React, { useState } from 'react';
import { Wand2, X, Search, Copy, Check, Navigation, MapPin, Zap, Link } from 'lucide-react';

const PLACEHOLDERS = {
    logistics: [
        { id: 'bakery', label: 'Bäcker' },
        { id: 'supermarket', label: 'Supermarkt' },
        { id: 'pharmacy', label: 'Apotheke' },
        { id: 'doctor', label: 'Arzt' },
        { id: 'hospital', label: 'Klinik' },
        { id: 'beach', label: 'Strand' },
        { id: 'atm', label: 'ATM' },
        { id: 'parking', label: 'Parken' },
        { id: 'charging', label: 'E-Laden' },
        { id: 'gym', label: 'Fitness' },
        { id: 'post', label: 'Post' },
        { id: 'bus', label: 'Bus/Bahn' },
        { id: 'market', label: 'Markt' },
    ],
    house: [
        { id: 'property_name', label: 'Haus Name' },
        { id: 'host_name', label: 'Host Name' },
        { id: 'city', label: 'Stadt' },
        { id: 'address', label: 'Adresse' }
    ]
};

export const MagicDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [copiedTag, setCopiedTag] = useState<string | null>(null);

    const copyTag = (tag: string) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        setTimeout(() => setCopiedTag(null), 2000);
    };

    const filteredLogistics = PLACEHOLDERS.logistics.filter(i => 
        i.label.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="print:hidden">
            <button 
                onClick={() => setIsOpen(true)}
                className={`fixed right-0 top-1/2 -translate-y-1/2 z-[4000] bg-navy-900 text-gold-500 p-4 rounded-l-3xl shadow-[-10px_0_30px_rgba(0,0,0,0.2)] border-y border-l border-white/10 transition-all hover:pr-8 group ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
            >
                <div className="flex flex-col items-center gap-2">
                    < Wand2 size={24} className="group-hover:rotate-12 transition-transform animate-pulse" />
                    <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-[0.3em] py-2">Magic Tags</span>
                </div>
            </button>

            <div className={`fixed inset-y-0 right-0 z-[5000] w-80 bg-white shadow-[-20px_0_60px_rgba(10,36,114,0.15)] transform transition-transform duration-500 ease-in-out border-l border-slate-100 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-8 bg-navy-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Wand2 size={80} /></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-serif font-black text-2xl italic text-gold-500 tracking-tighter">Magic Toolbox</h3>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"><X size={20} /></button>
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Klicke zum Kopieren der Platzhalter</p>
                        </div>
                    </div>

                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tag suchen..." 
                                className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-navy-900 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1 border-b border-slate-50 pb-2">
                                <Zap size={12} className="text-navy-900" />
                                <span className="text-[10px] font-black text-navy-900 uppercase tracking-widest">Haus & Host</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {PLACEHOLDERS.house.map(item => {
                                    const tag = `{{${item.id}}}`;
                                    const isCopied = copiedTag === tag;
                                    return (
                                        <button 
                                            key={item.id}
                                            onClick={() => copyTag(tag)}
                                            className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left group ${isCopied ? 'bg-green-500 border-green-500 text-white shadow-lg' : 'bg-white border-slate-50 hover:border-navy-900'}`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`text-[8px] font-black uppercase tracking-tighter mb-0.5 ${isCopied ? 'text-white/70' : 'text-slate-400'}`}>{item.label}</span>
                                                <code className={`text-[11px] font-bold ${isCopied ? 'text-white' : 'text-navy-900'}`}>{tag}</code>
                                            </div>
                                            {isCopied ? <Check size={14} /> : <Copy size={14} className="text-slate-200 group-hover:text-navy-900" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1 border-b border-slate-50 pb-2">
                                <MapPin size={12} className="text-navy-900" />
                                <span className="text-[10px] font-black text-navy-900 uppercase tracking-widest">Umgebung & Details</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {filteredLogistics.map(item => (
                                    <div key={item.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                        <p className="text-[9px] font-black uppercase text-navy-900/60 tracking-widest px-1">{item.label}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { suffix: '_name', label: 'Name' },
                                                { suffix: '_car', label: '🚗 Auto' },
                                                { suffix: '_foot', label: '🚶 Fuß' },
                                                { suffix: '_maps_url', label: '📍 Route' }
                                            ].map(s => {
                                                const tag = `{{${item.id}${s.suffix}}}`;
                                                const isCopied = copiedTag === tag;
                                                return (
                                                    <button 
                                                        key={s.suffix}
                                                        onClick={() => copyTag(tag)}
                                                        className={`flex flex-col p-2.5 rounded-xl border-2 transition-all text-left ${isCopied ? 'bg-green-500 border-green-500 text-white shadow-md' : 'bg-white border-slate-50 hover:border-navy-900'}`}
                                                    >
                                                        <span className={`text-[7px] font-black uppercase mb-0.5 ${isCopied ? 'text-white/70' : 'text-slate-400'}`}>{s.label}</span>
                                                        <code className={`text-[9px] font-bold truncate ${isCopied ? 'text-white' : 'text-navy-900'}`}>{tag}</code>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && <div className="fixed inset-0 z-[4900]" onClick={() => setIsOpen(false)}></div>}
        </div>
    );
};
