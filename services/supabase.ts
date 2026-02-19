
import { createClient } from '@supabase/supabase-js';
import { AppConfig, ManualItem, GazettePage, Recommendation, ManualCategory, GazetteCategory, CTAConfig } from '../types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://vkzndsjzssaytigjuzxp.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrem5kc2p6c3NheXRpZ2p1enhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTIyNDgsImV4cCI6MjA4NjQ4ODI0OH0.7bK_Us7VUBnpA3QsQgxNFl7qrFQsr6du3aKWhhd1FsI';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true 
  }
});

const MASTER_WHITELIST_IDS = [
  'eb5d38bf-a1c0-4c14-b1c6-b0a619a57fea', 
];

const BUCKET_NAME = 'property-assets';

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const mappers = {
  toManualItem: (db: any): ManualItem => ({
    id: db.id,
    category: db.category,
    icon: db.icon,
    title: db.title,
    content: db.content,
    isVisible: db.is_visible ?? true,
    images: db.image_url ? [db.image_url] : [],
    videoUrl: db.video_url || undefined
  }),
  toGazettePage: (db: any): GazettePage => ({
    id: db.id,
    type: db.type,
    category: db.category || 'EDITORIAL',
    tag: db.tag,
    title: db.title,
    content: db.content,
    longContent: db.long_content,
    image: db.image_url,
    cta: db.cta,
    ctaConfig: db.cta_config,
    scheduledDate: db.scheduled_date || undefined
  }),
  toRecommendation: (db: any): Recommendation => ({
    ...db,
    image: db.image_url,
    description: db.description,
    hostTip: db.host_tip,
    googleMapsUrl: db.google_maps_url,
    priceLevel: db.price_level, 
    tags: db.tags || [] 
  })
};

export const authService = {
  async getSession() {
    try {
      const { data: { session } } = await (supabase.auth as any).getSession();
      return session;
    } catch (e) {
      return null;
    }
  },
  
  async isAdmin() {
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return false;
      if (MASTER_WHITELIST_IDS.includes(user.id)) return true;
      
      const { data } = await supabase
        .from('app_admins')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
            
      return data && (data.role === 'master' || data.role === 'admin');
    } catch (e) {
      return false;
    }
  },

  onAuthStateChange(callback: (session: any) => void) {
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      callback(session);
    });
    return subscription;
  },

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await (supabase.auth as any).signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string) {
    const { data, error } = await (supabase.auth as any).signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signInWithOtp(email: string) {
    const { data, error } = await (supabase.auth as any).signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await (supabase.auth as any).signOut();
  }
};

export const propertyService = {
  async uploadImage(propertyId: string, blob: Blob, fileName: string): Promise<string> {
    const fileExt = fileName.split('.').pop() || 'jpg';
    const path = `${propertyId}/${generateId()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return publicUrl;
  },

  async getProperty(id?: string) {
    try {
      let query = supabase.from('properties').select('*');
      if (id && isUUID(id)) {
        query = query.eq('id', id);
      } else {
        const { data: { user } } = await (supabase.auth as any).getUser();
        if (!user) return null;
        query = query.eq('owner_id', user.id);
      }
      const { data } = await query.maybeSingle();
      return data;
    } catch (e) {
      return null;
    }
  },

  async createProperty(config: Partial<AppConfig>) {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase.from('properties').insert({
      owner_id: user.id,
      name: config.propertyName,
      hero_title: config.heroTitle,
      hero_subtitle: config.heroSubtitle,
      hero_image: config.heroImage,
      logo: config.logo,
      city: config.city,
      address: config.address,
      theme_colors: config.themeColors,
      wifi_ssid: config.wifiSsid,
      wifi_pass: config.wifiPass,
      host_name: config.hostName,
      host_phone: config.hostPhone,
      lat: config.coordinates?.lat || 43.735,
      lng: config.coordinates?.lng || 15.895,
      is_onboarding_complete: false,
      logistics: config.logistics || {}
    }).select().maybeSingle();

    if (error) throw error;
    return data;
  },

  async loadFullConfig(propertyId: string): Promise<AppConfig> {
    const [prop, gazetteRes, manualRes, recRes] = await Promise.all([
      supabase.from('properties').select('*').eq('id', propertyId).maybeSingle(),
      supabase.from('gazette_pages').select('*').eq('property_id', propertyId).order('order_index'),
      supabase.from('manual_items').select('*').eq('property_id', propertyId).order('order_index'),
      supabase.from('property_recommendations').select('order_index, recommendations(*)').eq('property_id', propertyId).order('order_index')
    ]);

    if (!prop.data) throw new Error("Property not found.");
    const p = prop.data;
    const allManualItems = (manualRes.data || []).map(mappers.toManualItem);

    const sortedRecs = (recRes.data || [])
      .map((r: any) => r.recommendations ? mappers.toRecommendation(r.recommendations) : null)
      .filter(Boolean) as Recommendation[];

    return {
      propertyName: p.name,
      heroTitle: p.hero_title || { en: "Welcome" },
      heroSubtitle: p.hero_subtitle || { en: "" },
      heroImage: p.hero_image,
      logo: p.logo,
      city: p.city || "Šibenik",
      address: p.address || "",
      themeColors: p.theme_colors || { primary: '#0a2472', secondary: '#c5a028' },
      hostName: p.host_name || "Host",
      hostPhone: p.host_phone || "",
      wifiSsid: p.wifi_ssid || "",
      wifiPass: p.wifi_pass || "",
      validBookings: p.valid_bookings || [],
      coordinates: { lat: p.lat || 43.735, lng: p.lng || 15.895 },
      recommendations: sortedRecs,
      manual: allManualItems,
      checkInGuide: allManualItems.filter(m => m.category === 'arrival'),
      guestTips: [],
      gazette: (gazetteRes.data || []).map(mappers.toGazettePage),
      logistics: p.logistics || {}
    };
  },

  async syncPropertyData(propertyId: string, config: AppConfig) {
    const { error: propError } = await supabase.from('properties').update({
      name: config.propertyName,
      hero_title: config.heroTitle,
      hero_subtitle: config.heroSubtitle,
      hero_image: config.heroImage,
      logo: config.logo,
      city: config.city,
      address: config.address,
      theme_colors: config.themeColors,
      wifi_ssid: config.wifiSsid,
      wifi_pass: config.wifiPass,
      host_name: config.hostName,
      host_phone: config.hostPhone,
      lat: config.coordinates.lat,
      lng: config.coordinates.lng,
      logistics: config.logistics,
      updated_at: new Date().toISOString()
    }).eq('id', propertyId);

    if (propError) throw propError;
    
    // Prepare data and ensure valid UUIDs
    const manualData = config.manual.map((m, i) => ({
      id: (m.id && isUUID(m.id)) ? m.id : generateId(),
      property_id: propertyId,
      category: m.category,
      icon: m.icon,
      title: m.title,
      content: m.content,
      is_visible: m.isVisible !== false,
      image_url: (m.images && m.images[0]) ? m.images[0] : null,
      order_index: i
    }));

    const gazetteData = config.gazette.map((g, i) => ({
      id: (g.id && isUUID(g.id)) ? g.id : generateId(),
      property_id: propertyId,
      type: g.type,
      category: g.category,
      tag: g.tag,
      title: g.title,
      content: g.content,
      long_content: g.longContent,
      image_url: g.image,
      cta: g.cta,
      cta_config: g.ctaConfig,
      scheduled_date: g.scheduledDate || null,
      order_index: i
    }));

    // CRITICAL FIX FOR DELETION: 
    // We explicitly identify all IDs that should be in the DB. 
    const activeManualIds = manualData.map(d => d.id);
    const activeGazetteIds = gazetteData.map(d => d.id);

    // DELETE Orphans: Anything for this property NOT in the current active list
    if (activeManualIds.length > 0) {
      await supabase.from('manual_items')
        .delete()
        .eq('property_id', propertyId)
        .filter('id', 'not.in', `(${activeManualIds.join(',')})`);
    } else {
      await supabase.from('manual_items').delete().eq('property_id', propertyId);
    }

    if (activeGazetteIds.length > 0) {
      await supabase.from('gazette_pages')
        .delete()
        .eq('property_id', propertyId)
        .filter('id', 'not.in', `(${activeGazetteIds.join(',')})`);
    } else {
      await supabase.from('gazette_pages').delete().eq('property_id', propertyId);
    }

    // Now upsert the current state
    const syncResults = await Promise.all([
      manualData.length > 0 ? supabase.from('manual_items').upsert(manualData) : Promise.resolve({ error: null }),
      gazetteData.length > 0 ? supabase.from('gazette_pages').upsert(gazetteData) : Promise.resolve({ error: null })
    ]);

    const error = syncResults.find(r => r.error);
    if (error) throw error.error;

    return { success: true };
  },

  async updateProperty(id: string, updates: any) {
    const dbUpdates: any = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('properties').update(dbUpdates).eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async toggleRecommendation(propertyId: string, recId: string, active: boolean) {
    if (active) {
      const { data: countData } = await supabase.from('property_recommendations').select('count', { count: 'exact', head: true }).eq('property_id', propertyId);
      const nextIdx = countData?.[0]?.count || 0;
      return supabase.from('property_recommendations').upsert({ property_id: propertyId, recommendation_id: recId, order_index: nextIdx });
    }
    return supabase.from('property_recommendations').delete().eq('property_id', propertyId).eq('recommendation_id', recId);
  },

  async updateRecommendationOrder(propertyId: string, recommendationIds: string[]) {
    const updates = recommendationIds.map((id, index) => ({
      property_id: propertyId,
      recommendation_id: id,
      order_index: index
    }));
    const { error } = await supabase.from('property_recommendations').upsert(updates);
    if (error) throw error;
    return { success: true };
  },

  async savePlannerItinerary(propertyId: string, data: { guest_type: string, energy_level: string, focus: string, morning_poi_id: string, afternoon_poi_id: string, evening_poi_id: string }) {
    const { error } = await supabase.from('planner_itineraries').insert([{
        property_id: propertyId,
        ...data
    }]);
    if (error) throw error;
    return { success: true };
  },

  async getManualPresets() { 
    return supabase.from('manual_presets').select('*').order('category'); 
  },
  async updateManualPreset(id: string, updates: any) {
    const { error } = await supabase.from('manual_presets').update(updates).eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  async deleteManualPreset(id: string) {
    const { error } = await supabase.from('manual_presets').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  async createManualPreset(data: any) {
    const { error } = await supabase.from('manual_presets').insert(data);
    if (error) throw error;
    return { success: true };
  },

  async getGazettePresets() {
    return supabase.from('gazette_presets').select('*').order('type');
  },
  async updateGazettePreset(id: string, updates: any) {
    const { error } = await supabase.from('gazette_presets').update(updates).eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  async deleteGazettePreset(id: string) {
    const { error } = await supabase.from('gazette_presets').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  async createGazettePreset(data: any) {
    const { error } = await supabase.from('gazette_presets').insert(data);
    if (error) throw error;
    return { success: true };
  },

  async updateGlobalRecommendation(id: string, updates: any) {
    const { error } = await supabase.from('recommendations').update(updates).eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  async deleteGlobalRecommendation(id: string) {
    const { error } = await supabase.from('recommendations').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },
  async createGlobalRecommendation(data: any) {
    const { error } = await supabase.from('recommendations').insert(data);
    if (error) throw error;
    return { success: true };
  },

  async seedManualPresets(templates: any[]) {
    const { data: existing } = await supabase.from('manual_presets').select('title');
    const existingTitles = new Set(existing?.map(e => e.title.en) || []);
    const newItems = templates.filter(t => !existingTitles.has(t.title.en)).map(t => ({
      category: t.category,
      icon: t.icon,
      title: t.title,
      content: t.content
    }));
    if (newItems.length === 0) return { error: null };
    return supabase.from('manual_presets').insert(newItems);
  },

  async getAllGlobalRecommendations() { return supabase.from('recommendations').select('*').order('town'); },
  async getGlobalPresets() { return supabase.from('gazette_presets').select('*').order('type'); }
};
