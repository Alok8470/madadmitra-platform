import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Worker, Booking, BookingStatus, ServiceId } from '../types';

// Approximate coordinates for Deoria main localities and tehsils
export const DEORIA_AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'raghav nagar': { lat: 26.5024, lng: 83.7785 },
  'civil lines': { lat: 26.5055, lng: 83.782 },
  'subhash chowk': { lat: 26.501, lng: 83.776 },
  'kasia road': { lat: 26.5015, lng: 83.777 },
  'malviya road': { lat: 26.5038, lng: 83.7798 },
  'cc road': { lat: 26.5035, lng: 83.779 },
  'garulpar': { lat: 26.508, lng: 83.775 },
  'uma nagar': { lat: 26.498, lng: 83.784 },
  'saket nagar': { lat: 26.504, lng: 83.787 },
  'salempur': { lat: 26.3005, lng: 83.9288 },
  'bhatpar rani': { lat: 26.2167, lng: 84.0333 },
  'rudrapur': { lat: 26.442, lng: 83.618 },
  'barhaj': { lat: 26.275, lng: 83.754 },
  'gauri bazar': { lat: 26.578, lng: 83.682 },
  'rampur karkhana': { lat: 26.566, lng: 83.82 },
  'lar': { lat: 26.205, lng: 83.97 },
  'baitalpur': { lat: 26.545, lng: 83.73 },
  'tarkulwa': { lat: 26.602, lng: 83.88 },
  'bhaluani': { lat: 26.35, lng: 83.79 },
  'deoria': { lat: 26.5024, lng: 83.7785 },
};

/**
 * Resolves GPS coordinates for a locality name, falling back to central Deoria
 */
export function getCoordinatesForArea(areaName?: string): { lat: number; lng: number } {
  if (!areaName) return DEORIA_AREA_COORDINATES['deoria'];
  const lower = areaName.toLowerCase().replace(/\(coming soon\)/i, '').trim();
  for (const [key, coords] of Object.entries(DEORIA_AREA_COORDINATES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return coords;
    }
  }
  return DEORIA_AREA_COORDINATES['deoria'];
}

/**
 * Haversine formula to compute great-circle distance in kilometers between two GPS points
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export interface FindHelperParams {
  serviceCategory: string;
  customerArea: string;
  customerLat?: number;
  customerLng?: number;
  rejectedHelperIds?: string[];
  localWorkers?: Worker[];
}

export interface HelperMatchWithScore {
  worker: Worker;
  tier: 1 | 2 | 3;
  matchType: 'primary_area' | 'serviceable_area' | 'general_area';
  distanceKm: number;
}

/**
 * Finds the best available helper matching:
 * - is_verified === true
 * - is_online === true
 * - requested service_category
 * - id NOT in rejected_helper_ids
 *
 * Prioritizes:
 * 1. primary_area match
 * 2. serviceable_areas match
 * 3. closest GPS distance (if coordinates are available)
 */
export async function findBestAvailableHelper(
  params: FindHelperParams
): Promise<HelperMatchWithScore | null> {
  const {
    serviceCategory,
    customerArea,
    customerLat,
    customerLng,
    rejectedHelperIds = [],
    localWorkers = [],
  } = params;

  const cleanCustomerArea = customerArea.toLowerCase().replace(/\(coming soon\)/i, '').trim();
  const customerCoords =
    customerLat !== undefined && customerLng !== undefined
      ? { lat: customerLat, lng: customerLng }
      : getCoordinatesForArea(cleanCustomerArea);

  const candidatePool: Worker[] = [];
  const seenIds = new Set<string>();

  // 1. Fetch from Supabase workers table if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .or('is_online.eq.true,online.eq.true')
        .or('is_verified.eq.true,verified.eq.true');

      if (!error && Array.isArray(data)) {
        data.forEach((row) => {
          const srv = (row.service_category || row.service || '').toLowerCase();
          if (srv === serviceCategory.toLowerCase() && !rejectedHelperIds.includes(row.id)) {
            const mappedWorker: Worker = {
              id: row.id,
              name: row.name,
              phone: row.phone,
              service: row.service_category || row.service,
              service_category: row.service_category || row.service,
              rating: Number(row.rating) || 5.0,
              jobs: Number(row.jobs_count) || 0,
              area: row.primary_area || row.area,
              primary_area: row.primary_area || row.area,
              serviceable_areas: row.serviceable_areas || [row.area],
              city: row.city || 'Deoria',
              online: row.is_online ?? row.online ?? true,
              is_online: row.is_online ?? row.online ?? true,
              verified: row.is_verified ?? row.verified ?? true,
              is_verified: row.is_verified ?? row.verified ?? true,
              pricePerVisit: row.price_per_visit || 200,
              avatarColor: row.avatar_color || 'bg-brand-600',
              lat: row.lat !== null ? Number(row.lat) : undefined,
              lng: row.lng !== null ? Number(row.lng) : undefined,
            };
            candidatePool.push(mappedWorker);
            seenIds.add(mappedWorker.id);
          }
        });
      }
    } catch (err) {
      console.warn('Supabase fetch helpers for dispatch error:', err);
    }
  }

  // 2. Also incorporate local workers from AppContext (e.g., live partners created during session)
  localWorkers.forEach((w) => {
    if (seenIds.has(w.id)) return;
    const verified = w.is_verified ?? w.verified ?? false;
    const online = w.is_online ?? w.online ?? false;
    const srv = (w.service_category || w.service || '').toLowerCase();

    if (
      verified &&
      online &&
      srv === serviceCategory.toLowerCase() &&
      !rejectedHelperIds.includes(w.id)
    ) {
      candidatePool.push(w);
      seenIds.add(w.id);
    }
  });

  if (candidatePool.length === 0) {
    return null;
  }

  // 3. Rank and score each helper
  const scoredCandidates: HelperMatchWithScore[] = [];

  for (const worker of candidatePool) {
    const helperPrimary = (worker.primary_area || worker.area || '').toLowerCase();
    const helperServiceable = Array.isArray(worker.serviceable_areas)
      ? worker.serviceable_areas.map((a) => a.toLowerCase())
      : [];

    let tier: 1 | 2 | 3 = 3;
    let matchType: 'primary_area' | 'serviceable_area' | 'general_area' = 'general_area';

    // Tier 1: Primary Area Match
    const isPrimaryMatch =
      helperPrimary.includes(cleanCustomerArea) ||
      cleanCustomerArea.includes(helperPrimary) ||
      cleanCustomerArea === 'deoria (all areas)' ||
      cleanCustomerArea === 'deoria';

    // Tier 2: Serviceable Areas Match
    const isServiceableMatch =
      !isPrimaryMatch &&
      helperServiceable.some((area) =>
        area.includes(cleanCustomerArea) || cleanCustomerArea.includes(area)
      );

    if (isPrimaryMatch) {
      tier = 1;
      matchType = 'primary_area';
    } else if (isServiceableMatch) {
      tier = 2;
      matchType = 'serviceable_area';
    } else {
      tier = 3;
      matchType = 'general_area';
    }

    // Resolve helper coordinates
    const helperCoords =
      worker.lat !== undefined && worker.lng !== undefined
        ? { lat: worker.lat, lng: worker.lng }
        : getCoordinatesForArea(worker.primary_area || worker.area);

    const distanceKm = calculateDistanceKm(
      customerCoords.lat,
      customerCoords.lng,
      helperCoords.lat,
      helperCoords.lng
    );

    scoredCandidates.push({
      worker,
      tier,
      matchType,
      distanceKm,
    });
  }

  // 4. Sort by priority tier ASC (1 first, then 2, then 3), then by distance ASC, then rating DESC
  scoredCandidates.sort((a, b) => {
    if (a.tier !== b.tier) {
      return a.tier - b.tier;
    }
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    return (b.worker.rating || 5.0) - (a.worker.rating || 5.0);
  });

  return scoredCandidates[0] || null;
}

export interface InitiateDispatchParams {
  bookingId?: string;
  serviceCategory: string;
  customerArea: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  totalAmount?: number;
  customerLat?: number;
  customerLng?: number;
  rejectedHelperIds?: string[];
  localWorkers?: Worker[];
}

export interface DispatchInitiationResult {
  bookingId: string;
  status: 'searching_helper' | 'manual_needed';
  current_offer_helper_id: string | null;
  assigned_helper?: Worker | null;
  offer_expires_at: string | null;
  attempt_count: number;
  rejected_helper_ids: string[];
  distanceKm?: number;
  matchType?: 'primary_area' | 'serviceable_area' | 'general_area';
}

/**
 * Initiates auto-dispatch for a new customer booking:
 * 1. Sets status to 'searching_helper'
 * 2. Finds the nearest verified & online helper (priority: primary_area -> serviceable_areas -> closest GPS)
 * 3. Sets current_offer_helper_id to nearest helper's ID
 * 4. Sets offer_expires_at to now() + 2 minutes
 * 5. Updates Supabase and broadcasts via Realtime channel
 */
export async function initiateAutoDispatch(
  params: InitiateDispatchParams
): Promise<DispatchInitiationResult> {
  const bookingId = params.bookingId || `MM-BK-${Date.now().toString().slice(-6)}`;
  const rejectedHelperIds = params.rejectedHelperIds || [];

  // Find the best available helper
  const bestMatch = await findBestAvailableHelper({
    serviceCategory: params.serviceCategory,
    customerArea: params.customerArea,
    customerLat: params.customerLat,
    customerLng: params.customerLng,
    rejectedHelperIds,
    localWorkers: params.localWorkers || [],
  });

  // Offer expiration set to now() + 2 minutes
  const offerExpiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

  if (bestMatch) {
    const candidate = bestMatch.worker;
    const attemptCount = rejectedHelperIds.length + 1;

    // Persist in Supabase bookings table if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bookings').upsert({
          id: bookingId,
          service: params.serviceCategory,
          area: params.customerArea,
          address: params.address || `Residential address in ${params.customerArea}`,
          customer_name: params.customerName || 'Valued Customer',
          customer_phone: params.customerPhone || '9876543210',
          worker_id: candidate.id,
          worker_name: candidate.name,
          status: 'searching_helper',
          current_offer_helper_id: candidate.id,
          offer_expires_at: offerExpiresAt,
          attempt_count: attemptCount,
          rejected_helper_ids: rejectedHelperIds,
          assigned_helper_id: null,
          total_amount: params.totalAmount || candidate.pricePerVisit || 200,
          booking_date: new Date().toISOString().split('T')[0],
          booking_time: 'Immediate Express Dispatch',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase booking dispatch upsert fallback:', err);
      }

      // Broadcast targeted offer to helper via Realtime channel
      try {
        const channel = supabase.channel(`helper_dispatch:${candidate.id}`);
        await channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            channel.send({
              type: 'broadcast',
              event: 'job_offer_received',
              payload: {
                bookingId,
                helperId: candidate.id,
                serviceCategory: params.serviceCategory,
                customerArea: params.customerArea,
                offerExpiresAt,
                totalAmount: params.totalAmount || candidate.pricePerVisit || 200,
              },
            });
          }
        });
      } catch (broadcastErr) {
        console.warn('Realtime channel broadcast fallback:', broadcastErr);
      }
    }

    return {
      bookingId,
      status: 'searching_helper',
      current_offer_helper_id: candidate.id,
      assigned_helper: candidate,
      offer_expires_at: offerExpiresAt,
      attempt_count: attemptCount,
      rejected_helper_ids: rejectedHelperIds,
      distanceKm: bestMatch.distanceKm,
      matchType: bestMatch.matchType,
    };
  }

  // If no helper available, set status to manual_needed
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('bookings').upsert({
        id: bookingId,
        service: params.serviceCategory,
        area: params.customerArea,
        status: 'manual_needed',
        current_offer_helper_id: null,
        offer_expires_at: null,
        attempt_count: rejectedHelperIds.length,
        rejected_helper_ids: rejectedHelperIds,
        assigned_helper_id: null,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase manual_needed status update:', err);
    }
  }

  return {
    bookingId,
    status: 'manual_needed',
    current_offer_helper_id: null,
    assigned_helper: null,
    offer_expires_at: null,
    attempt_count: rejectedHelperIds.length,
    rejected_helper_ids: rejectedHelperIds,
  };
}

/**
 * When a helper rejects an offer or the 2-minute timer expires:
 * Appends helper to rejected_helper_ids and immediately cascades to the next best helper.
 */
export async function cascadeOfferToNextHelper(
  bookingId: string,
  serviceCategory: string,
  customerArea: string,
  rejectedHelperId: string,
  existingRejectedIds: string[] = [],
  localWorkers: Worker[] = []
): Promise<DispatchInitiationResult> {
  const updatedRejected = Array.from(new Set([...existingRejectedIds, rejectedHelperId]));

  return initiateAutoDispatch({
    bookingId,
    serviceCategory,
    customerArea,
    rejectedHelperIds: updatedRejected,
    localWorkers,
  });
}

/**
 * When helper accepts the offer:
 * Transition status to 'assigned' and lock assigned_helper_id
 */
export async function acceptHelperOffer(
  bookingId: string,
  helperId: string,
  helperName: string
): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('bookings')
        .update({
          status: 'assigned',
          assigned_helper_id: helperId,
          current_offer_helper_id: null,
          offer_expires_at: null,
          worker_id: helperId,
          worker_name: helperName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);
    } catch (err) {
      console.warn('Supabase acceptHelperOffer error:', err);
    }
  }

  return {
    success: true,
    message: 'Booking successfully accepted and assigned!',
  };
}

/**
 * Speech synthesis helper for low-literacy workers in Hindi
 */
export function speakHindiJobAlert(areaName: string, serviceTitleHi: string, fee: number) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const text = `${areaName} से ${serviceTitleHi} का काम आया है। ग्राहक ${fee} रुपये देगा। काम स्वीकार करने के लिए हरा बटन दबाएं।`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.debug('Speech synthesis error:', e);
  }
}
