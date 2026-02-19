
import { AppConfig, Language, LogisticsItem } from '../types';
import { t } from '../translations';

/**
 * Ersetzt Platzhalter wie {{bakery}} durch die echten Werte aus der Host-Logistik.
 * Erkennt automatisch, ob die Adresse bereits eine URL ist.
 */
export const resolvePlaceholders = (text: string, config: AppConfig, lang: Language): string => {
  if (!text) return "";
  let resolved = text;

  const logisticsKeys = [
    'bakery', 'supermarket', 'pharmacy', 'doctor', 'gas_station', 
    'hospital', 'beach', 'atm', 'parking', 'charging', 'gym', 
    'post', 'bus', 'market'
  ];

  const formatDistance = (value: string | undefined, unitKey: string) => {
    if (!value) return "";
    // Entferne alle Wörter wie "min" oder "Minuten", um nur die Zahl zu behalten
    const cleanValue = value.replace(/[a-zA-Z\s\.]/g, '');
    if (!cleanValue) return value; // Fallback falls keine Zahl gefunden wurde
    return `${cleanValue} ${t(unitKey, lang)}`;
  };

  logisticsKeys.forEach(key => {
    const item = config.logistics?.[key] as LogisticsItem | undefined;
    
    if (item && item.name) {
      // 1. Basis-String: Jetzt NUR der Name
      resolved = resolved.replace(new RegExp(`{{${key}}}`, 'g'), item.name);
      
      // 2. Granulare Suffixe
      resolved = resolved.replace(new RegExp(`{{${key}_name}}`, 'g'), item.name);
      
      // Formatiere Entfernungen automatisch mit Einheiten
      const distCar = formatDistance(item.distCar, 'unit_car');
      const distFoot = formatDistance(item.distFoot, 'unit_foot');
      
      resolved = resolved.replace(new RegExp(`{{${key}_car}}`, 'g'), distCar);
      resolved = resolved.replace(new RegExp(`{{${key}_foot}}`, 'g'), distFoot);
      resolved = resolved.replace(new RegExp(`{{${key}_address}}`, 'g'), item.address || "");
      
      // 3. Google Maps URL (Deep-Link Optimierung)
      const addr = item.address || "";
      let mapsUrl = "";
      
      if (addr.startsWith('http')) {
        mapsUrl = addr; // Nutze Direkt-Link
      } else {
        // Nutzen von 'dir' (Directions) anstatt 'search', um App-Wechsel zu forcieren
        const destination = encodeURIComponent(`${item.name} ${addr}`);
        mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      }
      
      resolved = resolved.replace(new RegExp(`{{${key}_maps_url}}`, 'g'), mapsUrl);
    }
  });

  // Allgemeine Platzhalter
  resolved = resolved.replace(/{{property_name}}/g, config.propertyName || "");
  resolved = resolved.replace(/{{city}}/g, config.city || "Šibenik");
  resolved = resolved.replace(/{{address}}/g, config.address || "");
  resolved = resolved.replace(/{{host_name}}/g, config.hostName || "");

  // Fallback
  resolved = resolved.replace(/{{[a-zA-Z0-9_]+}}/g, "");

  return resolved;
};
