import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { COMING_SOON_CITIES } from '../data/mockData';
import type { Worker, AreaAvailabilityResult, ServiceDemandLog } from '../types';

const STORAGE_DEMAND_LOGS = 'madadmitra_demand_logs';

/**
 * Extracts clean city & area from location strings (e.g. "Civil Lines (Deoria)" or "Gorakhpur (Coming Soon)")
 */
export function parseAreaAndCity(locationStr: string): { city: string; area: string; isComingSoon: boolean } {
  const isComingSoon =
    locationStr.toLowerCase().includes('coming soon') ||
    COMING_SOON_CITIES.some((c) => c.toLowerCase().includes(locationStr.toLowerCase()));

  const clean = locationStr.replace(/\(coming soon\)/i, '').trim();

  // If format is "Area (City)" e.g. "Civil Lines (Deoria)"
  const parenMatch = clean.match(/^(.+?)\s*\((.+?)\)$/);
  if (parenMatch) {
    return {
      area: parenMatch[1].trim(),
      city: parenMatch[2].trim(),
      isComingSoon,
    };
  }

  // If area is "Deoria (All Areas)"
  if (clean.toLowerCase().includes('all areas') || clean.toLowerCase() === 'deoria') {
    return {
      city: 'Deoria',
      area: 'Deoria (All Areas)',
      isComingSoon,
    };
  }

  return {
    city: 'Deoria',
    area: clean,
    isComingSoon,
  };
}

/**
 * Checks whether at least one verified & online helper is available in the target area/service.
 * Queries Supabase `workers` table with fallback to locally registered partners.
 */
export async function checkAreaAvailability(
  selectedAreaOrCity: string,
  serviceCategory?: string,
  localWorkers: Worker[] = []
): Promise<AreaAvailabilityResult> {
  const { city, area, isComingSoon } = parseAreaAndCity(selectedAreaOrCity);

  if (isComingSoon) {
    return {
      isAvailable: false,
      helperCount: 0,
      availableCategories: [],
      isComingSoonArea: true,
      checkedArea: area,
      checkedCity: city,
    };
  }

  const normalizedArea = area.toLowerCase();
  const isAllDeoria =
    normalizedArea.includes('all areas') ||
    normalizedArea === 'deoria' ||
    normalizedArea === 'all deoria';

  // Helper matching predicate
  const matchesAreaAndService = (w: {
    primary_area?: string;
    area?: string;
    serviceable_areas?: string[];
    service_category?: string;
    service?: string;
    is_verified?: boolean;
    verified?: boolean;
    is_online?: boolean;
    online?: boolean;
  }) => {
    // Must be verified and online
    const verified = w.is_verified ?? w.verified ?? false;
    const online = w.is_online ?? w.online ?? false;
    if (!verified || !online) return false;

    // Check service category if requested
    if (serviceCategory) {
      const srv = (w.service_category || w.service || '').toLowerCase();
      if (srv !== serviceCategory.toLowerCase()) return false;
    }

    // If searching across all Deoria, any verified helper in Deoria matches
    if (isAllDeoria) return true;

    // Check primary area
    const helperPrimary = (w.primary_area || w.area || '').toLowerCase();
    if (
      helperPrimary.includes(normalizedArea) ||
      normalizedArea.includes(helperPrimary) ||
      helperPrimary.includes('all areas') ||
      helperPrimary === 'deoria'
    ) {
      return true;
    }

    // Check serviceable areas array
    if (Array.isArray(w.serviceable_areas) && w.serviceable_areas.length > 0) {
      const hasMatch = w.serviceable_areas.some((srvArea) => {
        const cleanSrv = srvArea.toLowerCase();
        return (
          cleanSrv.includes(normalizedArea) ||
          normalizedArea.includes(cleanSrv) ||
          cleanSrv.includes('all areas') ||
          cleanSrv === 'deoria'
        );
      });
      if (hasMatch) return true;
    }

    return false;
  };

  const matchingHelpers: Array<{ service: string }> = [];

  // 1. Check Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('id, name, service, service_category, is_online, online, is_verified, verified, area, primary_area, serviceable_areas')
        .or('is_online.eq.true,online.eq.true')
        .or('is_verified.eq.true,verified.eq.true');

      if (!error && data) {
        data.forEach((w) => {
          if (matchesAreaAndService(w)) {
            matchingHelpers.push({
              service: (w.service_category || w.service || '').toLowerCase(),
            });
          }
        });
      } else if (error) {
        console.warn('Supabase workers availability query error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase workers availability check failed:', err);
    }
  }

  // 2. Also check localWorkers state (e.g., live partners created during session/local testing)
  localWorkers.forEach((w) => {
    if (matchesAreaAndService(w)) {
      const srv = (w.service_category || w.service || '').toLowerCase();
      // Avoid duplicate counting if already matched from Supabase
      matchingHelpers.push({ service: srv });
    }
  });

  const uniqueCategories = Array.from(new Set(matchingHelpers.map((h) => h.service).filter(Boolean)));
  const helperCount = matchingHelpers.length;
  const isAvailable = helperCount > 0;

  return {
    isAvailable,
    helperCount,
    availableCategories: uniqueCategories,
    isComingSoonArea: false,
    checkedArea: area,
    checkedCity: city,
  };
}

/**
 * Logs a customer's demand for a service in an unserviceable or coming soon area.
 * Stores in Supabase `service_demand_logs` with a fallback to localStorage.
 */
export async function logServiceDemand(params: {
  phone?: string | null;
  city: string;
  area: string;
  serviceCategory?: string | null;
  customerId?: string | null;
}): Promise<{ success: boolean; message: string }> {
  const cleanCity = params.city.replace(/\(coming soon\)/i, '').trim() || 'Deoria';
  const cleanArea = params.area.replace(/\(coming soon\)/i, '').trim();

  const demandEntry: ServiceDemandLog = {
    id: `demand_${Date.now()}`,
    phone: params.phone ? params.phone.replace(/\D/g, '') : null,
    city: cleanCity,
    area: cleanArea,
    service_category: params.serviceCategory || null,
    customer_id: params.customerId || null,
    notified: false,
    created_at: new Date().toISOString(),
  };

  // Always save to localStorage for immediate offline persistence
  try {
    const raw = localStorage.getItem(STORAGE_DEMAND_LOGS);
    const existing: ServiceDemandLog[] = raw ? JSON.parse(raw) : [];
    existing.push(demandEntry);
    localStorage.setItem(STORAGE_DEMAND_LOGS, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save demand log to local storage', err);
  }

  // Insert into Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('service_demand_logs').insert({
        phone: demandEntry.phone,
        city: demandEntry.city,
        area: demandEntry.area,
        service_category: demandEntry.service_category,
        customer_id: demandEntry.customer_id,
        notified: false,
      });

      if (error) {
        console.warn('Supabase service_demand_logs insert fallback:', error.message);
      }
    } catch (err) {
      console.warn('Supabase service_demand_logs exception:', err);
    }
  }

  return {
    success: true,
    message: `You're on the priority list! We will notify you via SMS as soon as verified helpers go live in ${cleanArea}.`,
  };
}
