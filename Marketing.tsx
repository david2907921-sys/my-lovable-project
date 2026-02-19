
import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import { AppConfig, Language } from '../../types';
import { Printer, Layout, Download, Eye, Check, Wifi, BookOpen, Smartphone, ShieldCheck, MapPin, Link as LinkIcon, Zap, Type as TypeIcon, Edit3, CheckCircle2, Share2, Info, Maximize, Minimize } from 'lucide-react';
import { t as translate, GLOBAL_TRANSLATIONS } from '../../translations';

const MARKETING_PRESETS: Record<string, any> = {
    en: {
        welcome: { h: "Welcome.", s: "Your digital sanctuary companion.", c: "Scan for VIP Access" },
        tech: { h: "Stay Connected.", s: "Seamless Digital Hospitality", c: "Scan for Full Guide" },
        minimal: { h: "Villa Serenity", s: "A Signature Experience", c: "Digital Concierge" }
    },
    de: {
        welcome: { h: "Willkommen.", s: "Ihr digitaler Begleiter für den Aufenthalt.", c: "Scan für VIP-Zugang" },
        tech: { h: "Online bleiben.", s: "Nahtlose digitale Gastfreundschaft", c: "Scan für Haus-Guide" },
        minimal: { h: "Villa Serenity", s: "Ein exklusives Erlebnis", c: "Digitaler Concierge" }
    },
    hr: {
        welcome: { h: "Dobrodošli.", s: "Vaš digitalni suputnik kroz vilu.", c: "Skeniraj za VIP pristup" },
        tech: { h: "Povežite se.", s: "Vrhunsko digitalno gostoprimstvo", c: "Skeniraj za vodič" },
        minimal: { h: "Villa Serenity", s: "Potpuno iskustvo odmora", c: "Digitalni portir" }
    },
    it: {
        welcome: { h: "Benvenuti.", s: "Il tuo compagno digitale.", c: "Scansiona per l'accesso" },
        tech: { h: "Resta connesso.", s: "Ospitalità digitale fluida", c: "Guida completa" },
        minimal: { h: "Villa Serenity", s: "Un'esperienza exclusiva", c: "Concierge Digitale" }
    },
    cs: {
        welcome: { h: "Vítejte.", s: "Váš digitální společník na cesty.", c: "Skenujte pro VIP přístup" },
        tech: { h: "Zůstaňte online.", s: "Bezproblémová digitální pohostinnost", c: "Skenujte pro průvodce" },
        minimal: { h: "Villa Serenity", s: "Exkluzivní zážitek", c: "Digitální recepce" }
    }
};

interface MarketingProps {
  prop: AppConfig;
  uiLang: Language;
}

type TemplateId = 'welcome' | 'tech' | 'minimal';
type FontFamily = 'serif' | 'sans' | 'signature';
type PrintFormat = 'A4' | 'A5';

export const MarketingSection = ({ prop, uiLang }: MarketingProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('welcome');
  const [printLang, setPrintLang] = useState<Language>(uiLang);
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [printFormat, setPrintFormat] = useState<PrintFormat>('A4');
  const [showLogo, setShowLogo] = useState(true);
  const [isMockupView, setIsMockupView] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(0.5);
  
  const stageRef = useRef<HTMLDivElement>(null);
  const printableRef = useRef<HTMLDivElement>(null);
  const [headline, setHeadline] = useState('');
  const [subline, setSubline] = useState('');
  const [ctaText, setCtaText] = useState('');

  useEffect(() => {
    const langKey = MARKETING_PRESETS[printLang] ? printLang : 'en';
    const preset = MARKETING_PRESETS[langKey][selectedTemplate];
    setHeadline(selectedTemplate === 'minimal' ? prop.propertyName : preset.h);
    setSubline(selectedTemplate === 'welcome' ? `${translate('welcome', printLang)} ${prop.propertyName}. ${preset.s}` : preset.s);
    setCtaText(preset.c);
  }, [selectedTemplate, printLang, prop.propertyName]);

  useLayoutEffect(() => {
    const updateScale = () => {
      if (!stageRef.current) return;
      const stageRect = stageRef.current.getBoundingClientRect();
      const templateWidth = selectedTemplate === 'tech' ? 841 : 594;
      const templateHeight = selectedTemplate === 'tech' ? 594 : 841;
      
      const scaleX = (stageRect.width * 0.9) / templateWidth;
      const scaleY = (stageRect.height * 0.9) / templateHeight;
      
      setPreviewScale(Math.min(scaleX, scaleY, 1));
    };

    const observer = new ResizeObserver(updateScale);
    if (stageRef.current) observer.observe(stageRef.current);
    updateScale();
    return () => observer.disconnect();
  }, [selectedTemplate, isMockupView]);

  const propertyUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('pid');
    return pid ? `${window.location.origin}/?pid=${pid}` : window.location.origin;
  }, []);

  const qrUrl = useMemo(() => {
    const brandColor = prop.themeColors.primary.replace('#', '');
    return `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(propertyUrl)}&color=${brandColor}&bgcolor=FFFFFF&margin=2&format=png`;
  }, [propertyUrl, prop.themeColors.primary]);

  const handlePrint = () => {
    if (!printableRef.current) return;

    // Create a temporary hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '100%';
    iframe.style.bottom = '100%';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Clone the printable area
    const contentHtml = printableRef.current.innerHTML;
    const isLandscape = selectedTemplate === 'tech';

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print - ${prop.propertyName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700;1,900&family=Pinyon+Script&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    navy: { 900: '#0a2472' },
                    gold: { 500: '#c5a028' }
                  },
                  fontFamily: {
                    serif: ['"Playfair Display"', 'serif'],
                    sans: ['"Lato"', 'sans-serif'],
                    signature: ['"Pinyon Script"', 'cursive'],
                  }
                }
              }
            }
          </script>
          <style>
            :root {
                --primary: ${prop.themeColors.primary};
                --secondary: ${prop.themeColors.secondary};
            }
            @page {
                size: ${printFormat} ${isLandscape ? 'landscape' : 'portrait'};
                margin: 0;
            }
            body { 
                margin: 0; 
                padding: 0; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
            }
            .text-theme-primary { color: var(--primary) !important; }
            .bg-theme-primary { background-color: var(--primary) !important; }
            .printable-wrapper {
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
            }
          </style>
        </head>
        <body>
          <div class="printable-wrapper">
            ${contentHtml}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                setTimeout(() => { window.frameElement.remove(); }, 100);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <div className="flex flex-col gap-8 pb-32 max-w-[1600px] mx-auto h-full">
      
      {/* --- TOOLBAR --- */}
      <div className="bg-navy-900 text-white p-4 md:p-6 rounded-[2.5rem] shadow-2xl flex flex-wrap justify-between items-center gap-4 print:hidden border border-white/5 sticky top-4 z-[1000] backdrop-blur-xl">
        <div className="flex items-center gap-4 flex-wrap">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                {(['welcome', 'tech', 'minimal'] as TemplateId[]).map(t => (
                    <button key={t} onClick={() => setSelectedTemplate(t)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTemplate === t ? 'bg-gold-500 text-navy-900' : 'text-white/40 hover:text-white'}`}>{t}</button>
                ))}
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                {(['A4', 'A5'] as PrintFormat[]).map(f => (
                    <button key={f} onClick={() => setPrintFormat(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${printFormat === f ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>{f}</button>
                ))}
            </div>

            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                {Object.keys(GLOBAL_TRANSLATIONS).map(l => (
                    <button key={l} onClick={() => setPrintLang(l as Language)} className={`w-9 h-9 rounded-xl text-[10px] font-black uppercase transition-all ${printLang === l ? 'bg-white text-navy-900' : 'text-white/30 hover:text-white'}`}>{l}</button>
                ))}
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setIsMockupView(!isMockupView)} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all border ${isMockupView ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-white/60'}`}>
                {isMockupView ? <Layout size={14} /> : <Eye size={14} />} 
                {isMockupView ? 'Editor' : 'Mockup'}
            </button>
            <button onClick={handlePrint} className="bg-gold-500 text-navy-900 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                <Printer size={16} /> Print {printFormat}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch min-h-[70vh]">
        
        {/* --- SIDEBAR --- */}
        <div className="xl:col-span-4 space-y-6 print:hidden">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Share2 size={14} className="text-gold-500" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Export</label>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(propertyUrl); setCopyStatus('link'); setTimeout(() => setCopyStatus(null), 2000); }} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${copyStatus === 'link' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-navy-900 hover:bg-white'}`}>
                        <div className="flex items-center gap-3"><LinkIcon size={16} /><span className="text-[10px] font-black uppercase">App Link</span></div>
                        {copyStatus === 'link' && <CheckCircle2 size={14} />}
                    </button>
                    <a href={qrUrl} download={`${prop.propertyName}-QR.png`} target="_blank" className="p-4 rounded-2xl border-2 bg-slate-50 border-slate-50 text-slate-500 hover:border-navy-900 hover:bg-white flex items-center gap-3 transition-all"><Download size={16} /><span className="text-[10px] font-black uppercase">Download QR</span></a>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2"><TypeIcon size={14} className="text-gold-500" /><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Typography</label></div>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'serif', label: 'Heritage', font: 'font-serif' },
                            { id: 'sans', label: 'Modern', font: 'font-sans' },
                            { id: 'signature', label: 'Script', font: 'font-signature' }
                        ].map(f => (
                            <button key={f.id} onClick={() => setFontFamily(f.id as FontFamily)} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${fontFamily === f.id ? 'bg-navy-900 text-white border-navy-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-50 hover:bg-slate-100'}`}>
                                <span className={`${f.font} text-base leading-none`}>Aa</span>
                                <span className="text-[7px] font-black uppercase">{f.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2"><Edit3 size={14} className="text-gold-500" /><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content</label></div>
                    <div className="space-y-3">
                        <input value={headline} onChange={e => setHeadline(e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 font-bold text-navy-900 text-xs focus:ring-1 focus:ring-gold-500 outline-none" placeholder="Headline" />
                        <textarea value={subline} onChange={e => setSubline(e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 font-bold text-navy-900 text-xs h-20 resize-none focus:ring-1 focus:ring-gold-500 outline-none" placeholder="Body" />
                        <input value={ctaText} onChange={e => setCtaText(e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 font-bold text-navy-900 text-xs focus:ring-1 focus:ring-gold-500 outline-none" placeholder="CTA" />
                    </div>
                </div>
            </div>
        </div>

        {/* --- STAGE --- */}
        <div ref={stageRef} className="xl:col-span-8 flex justify-center items-center relative overflow-hidden bg-slate-100/50 rounded-[3.5rem] border-2 border-dashed border-slate-200 min-h-[500px]">
            <div 
              style={{ transform: `scale(${previewScale})`, transformOrigin: 'center center' }}
              className="preview-box transition-all duration-500 ease-out shrink-0"
            >
                <div 
                    ref={printableRef}
                    id="printable-area"
                    className={`relative bg-white overflow-hidden shadow-2xl
                        ${isMockupView ? 'rotate-y-[-12deg] rotate-x-[3deg] shadow-[50px_70px_120px_rgba(0,0,0,0.3)]' : ''}
                        ${selectedTemplate === 'tech' ? 'w-[841px] h-[594px]' : 'w-[594px] h-[841px]'}
                    `}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-[5]"></div>
                    <div className="absolute top-0 left-0 right-0 h-4 z-10" style={{ backgroundColor: prop.themeColors.primary }}></div>

                    <div className={`relative h-full w-full z-10 flex flex-col justify-between p-16 md:p-20 ${fontFamily === 'serif' ? 'font-serif' : fontFamily === 'sans' ? 'font-sans' : 'font-signature'}`}>
                        <div className="text-center space-y-8 shrink-0">
                            {showLogo && prop.logo ? (
                                <div className="h-24 flex items-center justify-center mb-2"><img src={prop.logo} className="h-full object-contain filter drop-shadow-sm" alt="Logo" /></div>
                            ) : (
                                <div className="space-y-3 mb-4">
                                    <h4 className="text-3xl italic font-black tracking-tighter" style={{ color: prop.themeColors.primary }}>{prop.propertyName}</h4>
                                    <div className="w-12 h-0.5 mx-auto bg-gold-500 opacity-30"></div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h1 className={`text-6xl font-black tracking-tighter leading-tight ${fontFamily === 'signature' ? 'text-7xl font-normal py-4' : ''}`} style={{ color: prop.themeColors.primary }}>{headline}</h1>
                                <div className="w-10 h-1 bg-gold-500/20 mx-auto rounded-full"></div>
                                <p className={`text-xl text-slate-500 leading-snug italic max-w-[400px] mx-auto ${fontFamily === 'signature' ? 'text-4xl leading-tight' : ''}`}>{subline}</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center py-6">
                            {selectedTemplate === 'tech' ? (
                                <div className="w-full flex items-center justify-around gap-10">
                                    <div className="space-y-8 text-left max-w-xs shrink-0">
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-5">
                                            <div className="flex items-center gap-3"><Wifi className="text-gold-500" size={20} /><span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Guest WiFi</span></div>
                                            <div className="space-y-2">
                                                <div className="font-black text-xl tracking-tight text-navy-900 border-b border-slate-200 pb-1 truncate">{prop.wifiSsid}</div>
                                                <div className="font-black text-xl tracking-tight text-navy-900 truncate">{prop.wifiPass}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-slate-50 shrink-0"><img src={qrUrl} className="w-44 h-44" alt="QR" /></div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="absolute -inset-10 border border-gold-500/10 rounded-full"></div>
                                    <div className="absolute -inset-6 border border-gold-500/20 rounded-[3rem] rotate-3"></div>
                                    <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl relative z-10 border border-slate-50"><img src={qrUrl} className="w-52 h-52" alt="QR" /></div>
                                </div>
                            )}
                        </div>

                        <div className="text-center space-y-8 shrink-0">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gold-600 block mb-1">{ctaText}</span>
                                <div className="flex items-center justify-center gap-3 text-slate-200">
                                    <div className="h-px w-8 bg-slate-100"></div>
                                    <MapPin size={16} />
                                    <ShieldCheck size={16} />
                                    <Zap size={16} />
                                    <div className="h-px w-8 bg-slate-100"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .perspective-2000 { perspective: 2000px; }
        .rotate-y-[-12deg] { transform: rotateY(-12deg) rotateX(3deg); }
      `}</style>
    </div>
  );
};
