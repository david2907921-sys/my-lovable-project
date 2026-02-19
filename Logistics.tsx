
import React from 'react';
import { AppConfig, PropertyLogistics, LogisticsItem, Language } from '../../types';
import { Coffee, Pill, Stethoscope, Waves, ShoppingCart, MapPin, CreditCard, Fuel, Hospital, Car, Footprints, Info, Zap, Dumbbell, Mail, Bus, Plane, Store } from 'lucide-react';

interface LogisticsSectionProps {
  prop: AppConfig;
  updateProperty: (key: keyof AppConfig, value: any) => void;
  uiLang: Language;
}

const LOGISTICS_FIELDS = [
  { id: 'bakery', label: 'Bakery', icon: Coffee },
  { id: 'supermarket', label: 'Supermarket', icon: ShoppingCart },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'doctor', label: 'Medical Doctor', icon: Stethoscope },
  { id: 'gas_station', label: 'Gas Station', icon: Fuel },
  { id: 'hospital', label: 'Emergency Room', icon: Hospital },
  { id: 'beach', label: 'Closest Beach', icon: Waves },
  { id: 'atm', label: 'Nearest ATM', icon: CreditCard },
  { id: 'parking', label: 'Public Parking', icon: Car },
  { id: 'charging', label: 'EV Charging', icon: Zap },
  { id: 'gym', label: 'Fitness/Gym', icon: Dumbbell },
  { id: 'post', label: 'Post Office', icon: Mail },
  { id: 'bus', label: 'Bus/Train Station', icon: Bus },
  { id: 'market', label: 'Local Market', icon: Store },
];

export const LogisticsSection = ({ prop, updateProperty, uiLang }: LogisticsSectionProps) => {
  const updateLogistics = (id: string, updates: Partial<LogisticsItem>) => {
    const current = prop.logistics[id] || { name: '' };
    const newLogistics = { 
      ...prop.logistics, 
      [id]: { ...current, ...updates } 
    };
    updateProperty('logistics', newLogistics);
  };

  return (
    <div className="space-y-12 animate-[fadeIn_0.4s_ease-out] pb-20">
      <div className="bg-navy-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 right-0 p-8 opacity-10"><MapPin size={80} /></div>
        <div className="relative z-10">
            <h4 className="text-3xl font-serif font-black mb-2 italic text-gold-500">Local Logistics</h4>
            <p className="text-white/40 font-black text-[10px] uppercase tracking-widest">Manually manage the essential services for your guests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {LOGISTICS_FIELDS.map(field => {
          const data = prop.logistics[field.id] || { name: '' };

          return (
            <div key={field.id} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
              <div className="flex flex-col md:flex-row gap-10">
                
                {/* Left: Category Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-all">
                            <field.icon size={24} />
                        </div>
                        <label className="text-xl font-serif font-black text-navy-900 uppercase italic tracking-tighter">{field.label}</label>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold px-1">Enter the details for the nearest {field.label.toLowerCase()} below.</p>
                </div>

                {/* Right: Manual Fields */}
                <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Official Name</label>
                        <input 
                            value={data.name} 
                            onChange={e => updateLogistics(field.id, { name: e.target.value })}
                            className="w-full bg-slate-50 rounded-2xl p-5 font-bold text-navy-900 outline-none border-none focus:ring-2 focus:ring-navy-100"
                            placeholder="Name of the place"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Address (Optional)</label>
                        <input 
                            value={data.address || ''} 
                            onChange={e => updateLogistics(field.id, { address: e.target.value })}
                            className="w-full bg-slate-50 rounded-2xl p-5 font-bold text-navy-900 outline-none border-none focus:ring-2 focus:ring-navy-100"
                            placeholder="Street and Number"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2"><Car size={12} /> By Car</label>
                        <input 
                            value={data.distCar || ''} 
                            onChange={e => updateLogistics(field.id, { distCar: e.target.value })}
                            className="w-full bg-slate-50 rounded-2xl p-5 font-bold text-navy-900 outline-none border-none focus:ring-2 focus:ring-navy-100"
                            placeholder="e.g. 5 min"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2"><Footprints size={12} /> On Foot</label>
                        <input 
                            value={data.distFoot || ''} 
                            onChange={e => updateLogistics(field.id, { distFoot: e.target.value })}
                            className="w-full bg-slate-50 rounded-2xl p-5 font-bold text-navy-900 outline-none border-none focus:ring-2 focus:ring-navy-100"
                            placeholder="e.g. 10 min"
                        />
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 p-10 rounded-[3rem] border border-blue-100 flex items-start gap-6">
        <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 shadow-sm"><Info size={24} /></div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 mb-2">Pro Tip</p>
          <p className="text-sm font-bold text-blue-900 leading-relaxed max-w-2xl">
            You can reference these locations in your Morning Gazette or House Manual using placeholders like <code className="bg-white px-2 py-0.5 rounded">{'{{bakery}}'}</code>. 
            Want to add a Navigation-Link? Use <code className="bg-white px-2 py-0.5 rounded">{'{{bakery_maps_url}}'}</code> inside a text or button.
          </p>
        </div>
      </div>
    </div>
  );
};
