
import React, { useState } from 'react';
import { Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import { Language, LocalizedContent } from '../../types';
import { GLOBAL_TRANSLATIONS, t as translate } from '../../translations';
import { aiTranslator } from '../../services/aiTranslator';

interface MultiLangInputProps {
  label: string;
  value: LocalizedContent;
  editLang: Language;
  setEditLang: (l: Language) => void;
  onChange: (val: string) => void;
  onFullUpdate?: (full: LocalizedContent) => void;
  isTextArea?: boolean;
}

export const MultiLangInput = ({ label, value, editLang, setEditLang, onChange, onFullUpdate, isTextArea = false }: MultiLangInputProps) => {
  const availableLanguages = Object.keys(GLOBAL_TRANSLATIONS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showStatus, setShowStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleMagicTranslate = async () => {
    const currentText = value[editLang];
    if (!currentText || currentText.trim().length < 2) return;

    setIsTranslating(true);
    setShowStatus('idle');

    try {
      const result = await aiTranslator.translateContent(currentText, editLang);
      if (onFullUpdate) {
        onFullUpdate(result);
        setShowStatus('success');
        setTimeout(() => setShowStatus('idle'), 3000);
      }
    } catch (e) {
      setShowStatus('error');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6 relative group">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
            {onFullUpdate && (
                <button 
                    onClick={handleMagicTranslate}
                    disabled={isTranslating || !value[editLang]}
                    title={translate('admin_translate_info', editLang)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all
                        ${showStatus === 'success' ? 'bg-green-100 text-green-600' : 
                          showStatus === 'error' ? 'bg-red-100 text-red-600' :
                          'bg-gold-500/10 text-gold-600 hover:bg-gold-500 hover:text-white disabled:opacity-30'}`}
                >
                    {isTranslating ? <Loader2 size={10} className="animate-spin" /> : 
                     showStatus === 'success' ? <Check size={10} /> :
                     showStatus === 'error' ? <AlertCircle size={10} /> : <Sparkles size={10} />}
                    
                    {isTranslating ? translate('admin_translating', editLang) : 
                     showStatus === 'success' ? translate('admin_translate_done', editLang) : translate('admin_translate', editLang)}
                </button>
            )}
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          <div className="flex gap-1 bg-slate-50 p-1 rounded-full border border-slate-100 whitespace-nowrap">
            {availableLanguages.map(l => (
              <button 
                key={l}
                onClick={() => setEditLang(l as Language)}
                className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${editLang === l ? 'bg-navy-900 text-white shadow-md' : 'text-slate-400 hover:text-navy-900'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isTextArea ? (
        <textarea 
          value={value[editLang] || ''} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${editLang.toUpperCase()} text...`}
          className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-navy-900 min-h-[120px] focus:ring-2 focus:ring-navy-100 transition-all outline-none"
        />
      ) : (
        <input 
          type="text" 
          value={value[editLang] || ''} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${editLang.toUpperCase()} text...`}
          className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-navy-900 focus:ring-2 focus:ring-navy-100 transition-all outline-none"
        />
      )}
      {!value[editLang] && editLang !== 'en' && (
        <div className="mt-2 text-[9px] font-bold text-amber-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Missing {editLang.toUpperCase()} translation (falling back to EN)
        </div>
      )}
    </div>
  );
};
