
export type Language = 'en' | 'de' | 'hr' | 'it' | 'cs' | string;

export interface Dictionary {
  [key: string]: string;
}

export interface LocalizedContent {
  en: string;
  de?: string;
  hr?: string;
  it?: string;
  cs?: string;
  [key: string]: string | undefined;
}

export type GazetteCategory = 'EDITORIAL' | 'LOCAL_DISCOVERY' | 'UPSELL_OFFER' | 'EVENT';

// Added missing Event interface to resolve import error in constants.ts
export interface Event {
  id: string;
  title: LocalizedContent;
  date: string;
  location?: string;
  category?: string;
}

export interface CTAConfig {
  type: 'nav' | 'whatsapp' | 'internal_modal' | 'none';
  label: LocalizedContent;
  payload?: string; 
  template?: string; 
}

export interface LogisticsItem {
  name: string;
  address?: string;
  distCar?: string;
  distFoot?: string;
  note?: string;
}

export interface PropertyLogistics {
  bakery?: LogisticsItem;
  pharmacy?: LogisticsItem;
  doctor?: LogisticsItem;
  beach?: LogisticsItem;
  atm?: LogisticsItem;
  supermarket?: LogisticsItem;
  gas_station?: LogisticsItem;
  hospital?: LogisticsItem;
  [key: string]: LogisticsItem | undefined;
}

export interface GazettePage {
  id: string;
  type: 'editorial' | 'highlight' | 'offer'; 
  category: GazetteCategory;
  tag: LocalizedContent;
  title: LocalizedContent;
  content: LocalizedContent;
  longContent?: LocalizedContent;
  image?: string;
  cta?: LocalizedContent; 
  ctaConfig?: CTAConfig;
  scheduledDate?: string; 
}

export interface Recommendation {
  id: string;
  title: LocalizedContent; // Geändert von string zu LocalizedContent
  category: 'food' | 'beach' | 'culture' | 'transport' | 'activity' | 'cafes' | 'bars' | 'nightlife' | 'sightseeing';
  town: string;
  description: LocalizedContent;
  hostTip: LocalizedContent;
  lat: number;
  lng: number;
  image?: string;
  priceLevel?: 1 | 2 | 3 | 4;
  googleMapsUrl?: string; 
  tags?: string[];
}

export type ManualCategory = 'essentials' | 'arrival' | 'living' | 'kitchen' | 'wellness' | 'service' | 'rules' | 'emergency';

export interface ManualItem {
  id: string;
  category: ManualCategory;
  icon: string;
  title: LocalizedContent;
  content: LocalizedContent;
  images?: string[];
  videoUrl?: string;
  pdfUrl?: string;
  isEssential?: boolean;
  isVisible?: boolean; 
}

export interface GuestTip {
  id: string;
  author: string;
  date: string;
  content: string;
  category: 'food' | 'activity' | 'hidden-gem';
  upvotes: number;
  isHostVerified?: boolean;
}

export interface AppConfig {
  propertyName: string;
  heroTitle: LocalizedContent;
  heroSubtitle: LocalizedContent;
  heroImage?: string; 
  logo?: string;      
  city?: string;
  address?: string;   
  themeColors: ThemeColors; 
  hostName: string;
  hostPhone: string;
  wifiSsid: string;
  wifiPass: string;
  validBookings: { surname: string; phoneLast5: string }[]; 
  coordinates: { lat: number; lng: number };
  recommendations: Recommendation[];
  manual: ManualItem[];
  checkInGuide: ManualItem[];
  guestTips: GuestTip[];
  gazette: GazettePage[];
  logistics: PropertyLogistics;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
}
