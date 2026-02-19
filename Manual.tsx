
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Info, Edit3, Eye, EyeOff, Library, Plus, Trash2, Sparkles, Loader2, Check, X, ChevronRight, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react';
import { AppConfig, Language, LocalizedContent, ManualItem, ManualCategory } from '../../types';
import { tc, t as translate } from '../../translations';
import { MultiLangInput } from './Shared';
import { propertyService, generateId } from '../../services/supabase';
import { compressImage, base64ToBlob } from '../../utils/image';

interface ManualProps {
    prop: AppConfig;
    editLang: Language;
    setEditLang: (l: Language) => void;
    updateProperty: (key: keyof AppConfig, value: any) => void;
    uiLang: Language;
}

export const ManualSection = ({ prop, editLang, setEditLang, updateProperty, uiLang }: ManualProps) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['arrival', 'essentials']));
  const [optimizingId, setOptimizingId] = useState<string | null>(null);

  useEffect(() => {
    if (showLibrary) loadLibrary();
  }, [showLibrary]);

  const loadLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const { data } = await propertyService.getManualPresets();
      if (data) setDbTemplates(data);
    } catch (e) { console.error(e); } finally { setIsLoadingLibrary(false); }
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const pid = window.location.search.match(/pid=([^&]+)/)?.[1];

    if (file && pid) {
      setOptimizingId(prop.manual[index].id);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const optimizedBase64 = await compressImage(reader.result as string);
          const blob = await base64ToBlob(optimizedBase64);
          const publicUrl = await propertyService.uploadImage(pid, blob, file.name);
          
          const newManual = [...prop.manual];
          newManual[index].images = [publicUrl];
          updateProperty('manual', newManual);
        } catch (err) {
          console.error("Manual image upload failed", err);
        } finally {
          setOptimizingId(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateLocalized = (current: LocalizedContent, newValue: string) => {
    return { ...current, [editLang]: newValue };
  };

  const toggleVisibility = (index: number) => {
    const newManual = [...prop.manual];
    newManual[index].isVisible = !newManual[index].isVisible;
    updateProperty('manual', newManual);
  };

  const removeManualItem = (index: number) => {
    if (confirm("Remove this item?")) {
        const newManual = prop.manual.filter((_, i) => i !== index);
        updateProperty('manual', newManual);
    }
  };

  const groupedLibrary = useMemo(() => {
    const groups: Record<string, any[]> = {};
    dbTemplates.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [dbTemplates]);

  const isAlreadyAdded = (templateTitle: LocalizedContent) => {
    return prop.manual.some(m => tc(m.title, 'en') === tc(templateTitle, 'en'));
  };

  const toggleTemplateSelection = (id: string, alreadyAdded: boolean) => {
    if (alreadyAdded) return;
    const next = new Set(selectedTemplates);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTemplates(next);
  };

  const addSelectedItems = () => {
    const newItems: ManualItem[] = Array.from(selectedTemplates).map(id => {
        const t = dbTemplates.find(tpl => tpl.id === id);
        return { id: generateId(), category: t.category, icon: t.icon, title: t.title, content: t.content, isVisible: true };
    });
    updateProperty('manual', [...prop.manual, ...newItems]);
    setSelectedTemplates(new Set());
    setShowLibrary(false);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex-1 bg-navy-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><Info size={80} /></div>
             <h4 className="text-3xl font-serif font-black mb-2 italic text-gold-500">{translate('admin_manual_instr', uiLang)}</h4>
             <p className="text-white/40 font-black text-[10px] uppercase tracking-widest">{prop.manual.length} {translate('admin_manual_active', uiLang)}</p>
          </div>
          <button onClick={() => setShowLibrary(!showLibrary)} className="bg-gold-500 text-navy-900 p-10 rounded-[3.5rem] shadow-xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all">
            <Library size={32} /><span className="font-black text-[10px] uppercase tracking-widest">{translate('admin_manual_library', uiLang)}</span>
          </button>
        </div>

        {/* ... Magic Drawer info remains same ... */}

        {showLibrary && (
           <div className="bg-white border-4 border-gold-500/10 rounded-[4rem] p-10 animate-[slideUp_0.3s_ease-out] mb-12 shadow-2xl relative z-50">
            <div className="flex justify-between items-center mb-10">
                <h5 className="font-serif font-black text-navy-900 text-3xl flex items-center gap-3"><Sparkles className="text-gold-500" /> Premium Templates</h5>
                <button onClick={() => setShowLibrary(false)} className="bg-slate-100 p-4 rounded-full text-slate-400 hover:text-navy-900 transition-all"><X size={24} /></button>
            </div>
            <div className="space-y-6 max-h-[500px] overflow-y-auto no-scrollbar mb-10 pr-4">
                {Object.entries(groupedLibrary).map(([cat, items]) => (
                    <div key={cat} className="space-y-3">
                        <span className="font-serif font-black text-navy-900 text-lg italic uppercase tracking-tighter px-2">{cat}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(items as any[]).map((t) => {
                                const added = isAlreadyAdded(t.title);
                                const selected = selectedTemplates.has(t.id);
                                return (
                                    <button key={t.id} onClick={() => toggleTemplateSelection(t.id, added)} disabled={added} className={`p-6 rounded-3xl flex items-center justify-between border-2 transition-all ${added ? 'bg-slate-50 border-slate-100 opacity-50' : selected ? 'bg-navy-900 text-white border-navy-900 shadow-xl scale-[1.02]' : 'bg-white border-slate-50 hover:border-navy-100'}`}>
                                        <p className="font-bold text-sm leading-tight">{tc(t.title, editLang)}</p>
                                        {!added && <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selected ? 'bg-gold-500 text-navy-900' : 'bg-slate-50 text-transparent'}`}><Check size={16} /></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            {selectedTemplates.size > 0 && (
                <button onClick={addSelectedItems} className="w-full bg-navy-900 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl flex items-center justify-center gap-4 animate-[slideUp_0.2s_ease-out]">
                    Add {selectedTemplates.size} Items <Plus size={24} />
                </button>
            )}
          </div>
        )}

        <div className="space-y-12">
          {prop.manual.map((item, index) => (
             <div key={item.id} className={`bg-white p-10 rounded-[3.5rem] border relative transition-all ${item.isVisible === false ? 'opacity-60 border-slate-100' : 'border-slate-100 shadow-sm group hover:shadow-xl'}`}>
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl shadow-inner transition-all ${item.isVisible === false ? 'bg-slate-100 text-slate-300' : 'bg-slate-50 text-slate-400 group-hover:bg-navy-900 group-hover:text-white'}`}>
                      <Edit3 size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">{item.category}</p>
                      <h4 className="text-2xl font-serif font-black text-navy-900">{tc(item.title, editLang)}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleVisibility(index)} className={`flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${item.isVisible === false ? 'bg-slate-100 text-slate-400' : 'bg-navy-900 text-white shadow-lg'}`}>
                      {item.isVisible === false ? <><EyeOff size={16} /> {translate('admin_manual_hidden', uiLang)}</> : <><Eye size={16} /> {translate('admin_manual_visible', uiLang)}</>}
                    </button>
                    <button onClick={() => removeManualItem(index)} className="p-3 text-slate-200 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
                    <div className="md:col-span-2 space-y-4">
                        <MultiLangInput label="Title" value={item.title} editLang={editLang} setEditLang={setEditLang} 
                          onChange={(val) => {
                            const newManual = [...prop.manual];
                            newManual[index].title = updateLocalized(newManual[index].title, val);
                            updateProperty('manual', newManual);
                          }}
                          onFullUpdate={(full) => {
                            const newManual = [...prop.manual];
                            newManual[index].title = full;
                            updateProperty('manual', newManual);
                          }} 
                        />
                        <MultiLangInput label="Description" value={item.content} editLang={editLang} setEditLang={setEditLang} isTextArea 
                          onChange={(val) => {
                            const newManual = [...prop.manual];
                            newManual[index].content = updateLocalized(newManual[index].content, val);
                            updateProperty('manual', newManual);
                          }}
                          onFullUpdate={(full) => {
                            const newManual = [...prop.manual];
                            newManual[index].content = full;
                            updateProperty('manual', newManual);
                          }} 
                        />
                    </div>
                    {/* ... Visual Guide section same ... */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Visual Guide</label>
                        <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 group/img flex items-center justify-center">
                            {item.images && item.images[0] ? (
                                <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <ImageIcon size={32} className="text-slate-200" />
                            )}
                            <label className="absolute inset-0 cursor-pointer bg-navy-900/0 hover:bg-navy-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                                {optimizingId === item.id ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(index, e)} />
                            </label>
                        </div>
                    </div>
                </div>
             </div>
          ))}
        </div>
        
        <button onClick={() => updateProperty('manual', [...prop.manual, { id: generateId(), category: 'essentials', icon: 'Info', title: { en: 'New Instruction' }, content: { en: '' }, isVisible: true }])} className="w-full border-4 border-dashed border-slate-200 p-12 rounded-[4rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-navy-900 hover:text-navy-900 transition-all group"
        >
          <Plus size={48} className="group-hover:scale-125 transition-all" />
          <span className="font-black uppercase tracking-[0.4em] text-xs text-slate-400 group-hover:text-navy-900">{translate('admin_manual_add', uiLang)}</span>
        </button>
    </div>
  );
};
