
import { useState, useEffect, useCallback } from 'react';
import { propertyService, authService } from '../services/supabase';
import { cacheService } from '../services/cache';
import { AppConfig } from '../types';

export function usePropertyData() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    if (config && !forceRefresh) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get('pid');
      const isAdminFlow = urlParams.get('admin') === 'true' || urlParams.get('host') === 'true';

      // 1. GAST-MODUS (PID vorhanden) -> Schneller Pfad ohne Auth-Check
      if (targetId && !isAdminFlow) {
        setPropertyId(targetId);
        
        // Cache-Check
        const cached = await cacheService.get(targetId);
        if (cached && !forceRefresh) {
          setConfig(cached);
          setIsLoading(false);
          // Refresh im Hintergrund
          propertyService.loadFullConfig(targetId).then(fresh => {
              setConfig(fresh);
              cacheService.set(targetId, fresh);
          }).catch(() => {});
          return;
        }

        // Kein Cache -> Echtzeit-Load
        const fullConfig = await propertyService.loadFullConfig(targetId);
        setConfig(fullConfig);
        await cacheService.set(targetId, fullConfig);
        setIsLoading(false);
        return;
      }

      // 2. ADMIN-MODUS (Auth benötigt)
      if (isAdminFlow) {
        // Erst hier Session prüfen
        const session = await authService.getSession();
        let finalId = targetId;

        if (!finalId && session) {
          const propData = await propertyService.getProperty();
          if (propData) finalId = propData.id;
        }

        if (finalId) {
          setPropertyId(finalId);
          const fullConfig = await propertyService.loadFullConfig(finalId);
          setConfig(fullConfig);
        }
      }

    } catch (err: any) {
      console.error("Property Load Failed:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { config, setConfig, propertyId, isLoading, error, reload: () => loadData(true) };
}
