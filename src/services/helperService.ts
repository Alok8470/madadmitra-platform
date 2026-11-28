import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Worker, VerificationStatus, ServiceId } from '../types';

/**
 * Ensures an ID is a valid 36-character UUID accepted by PostgreSQL.
 * If the input is not a valid UUID, generates a fresh RFC 4122 v4 UUID.
 */
export function ensureValidUuid(id?: string | null): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Maps a Supabase public.helpers row to the frontend Worker interface.
 * Strict Verification Guarantee:
 * - verified is ONLY true when verification_status === 'verified' AND is_verified === true.
 */
export function mapHelperRowToWorker(row: any): Worker {
  const isApproved =
    row.verification_status === 'verified' &&
    (row.is_verified === true || row.verified === true);

  return {
    id: row.id,
    user_id: row.user_id || undefined,
    name: row.full_name || row.name || 'Service Partner',
    phone: row.phone || '',
    service: (row.service_category || row.service || 'cook') as ServiceId,
    service_category: row.service_category || row.service || 'cook',
    rating: Number(row.rating) || 5.0,
    jobs: Number(row.jobs_count) || 0,
    area: row.primary_area || row.area || 'Deoria',
    primary_area: row.primary_area || row.area || 'Deoria',
    serviceable_areas: Array.isArray(row.serviceable_areas)
      ? row.serviceable_areas
      : [row.primary_area || row.area || 'Deoria'],
    city: row.city || 'Deoria',
    online: row.is_online ?? row.online ?? true,
    is_online: row.is_online ?? row.online ?? true,
    verified: isApproved,
    is_verified: isApproved,
    verification_status: (row.verification_status as VerificationStatus) || 'unsubmitted',
    aadhaar_last4: row.aadhaar_last4 || undefined,
    aadhaar_front_path: row.aadhaar_front_path || null,
    aadhaar_back_path: row.aadhaar_back_path || null,
    selfie_path: row.selfie_path || null,
    rejection_reason: row.rejection_reason || null,
    verified_at: row.verified_at || null,
    pricePerVisit: Number(row.price_per_visit) || 200,
    experienceYears: Number(row.experience_years) || 2,
    avatarColor: row.avatar_color || 'bg-brand-600',
    lat: row.lat !== null && row.lat !== undefined ? Number(row.lat) : undefined,
    lng: row.lng !== null && row.lng !== undefined ? Number(row.lng) : undefined,
    isRealPartner: true,
    created_at: row.created_at || new Date().toISOString(),
  };
}

/**
 * Reads all helper records from the Supabase public.helpers table.
 * Falls back to public.workers or empty array if not found.
 */
export async function fetchHelpersFromSupabase(): Promise<Worker[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    // 1. Primary: Fetch from public.helpers table
    const { data: helpersData, error: helpersErr } = await supabase
      .from('helpers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!helpersErr && Array.isArray(helpersData)) {
      return helpersData.map(mapHelperRowToWorker);
    }

    if (helpersErr) {
      console.warn('Error fetching from public.helpers table:', helpersErr.message);
    }

    // 2. Fallback: Fetch from public.workers table
    const { data: workersData, error: workersErr } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!workersErr && Array.isArray(workersData)) {
      return workersData.map(mapHelperRowToWorker);
    }
  } catch (err) {
    console.warn('Failed to fetch helpers from Supabase:', err);
  }

  return [];
}

/**
 * Creates a new helper directly in the public.helpers table with default:
 * is_verified = false, verification_status = 'unsubmitted'
 */
export async function createHelperInSupabase(
  helper: Partial<Worker>
): Promise<{ success: boolean; worker?: Worker; error?: string }> {
  const id = ensureValidUuid(helper.id);
  const srv = helper.service_category || helper.service || 'cook';
  const primaryArea = helper.primary_area || helper.area || 'Deoria';
  const serviceable = helper.serviceable_areas || [primaryArea];

  // Default Verified Status Bug Fix:
  // Brand new helpers MUST always be unsubmitted and is_verified = false by default!
  const isApproved = helper.verification_status === 'verified' && helper.is_verified === true;
  const verStatus: VerificationStatus = isApproved ? 'verified' : (helper.verification_status || 'unsubmitted');
  const isVer = isApproved;

  const validUserId =
    helper.user_id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(helper.user_id)
      ? helper.user_id
      : null;

  const rowPayload = {
    id,
    user_id: validUserId,
    full_name: helper.name || 'New Partner',
    phone: helper.phone || '',
    service_category: srv,
    primary_area: primaryArea,
    serviceable_areas: serviceable,
    price_per_visit: helper.pricePerVisit || 200,
    experience_years: helper.experienceYears || 2,
    is_online: helper.online ?? helper.is_online ?? true,
    is_verified: isVer,
    verification_status: verStatus,
    aadhaar_last4: helper.aadhaar_last4 || null,
    aadhaar_front_path: helper.aadhaar_front_path || null,
    aadhaar_back_path: helper.aadhaar_back_path || null,
    selfie_path: helper.selfie_path || null,
    rejection_reason: helper.rejection_reason || null,
    verified_at: isVer ? new Date().toISOString() : null,
    rating: helper.rating || 5.0,
    jobs_count: helper.jobs || 0,
    avatar_color: helper.avatarColor || 'bg-brand-600',
    lat: helper.lat || null,
    lng: helper.lng || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Direct insert into public.helpers
      const { error: helpersErr } = await supabase.from('helpers').insert([rowPayload]);
      if (helpersErr) {
        console.error('public.helpers insert error:', helpersErr.message);
        // If row already exists (duplicate key), try upsert
        if (helpersErr.code === '23505') {
          await supabase.from('helpers').upsert(rowPayload);
        }
      }

      // 2. Also sync to public.workers for backward-compatibility
      const workerPayload = {
        id,
        name: rowPayload.full_name,
        phone: rowPayload.phone,
        service: srv,
        service_category: srv,
        city: 'Deoria',
        area: primaryArea,
        primary_area: primaryArea,
        serviceable_areas: serviceable,
        price_per_visit: rowPayload.price_per_visit,
        is_online: rowPayload.is_online,
        online: rowPayload.is_online,
        is_verified: isVer,
        verified: isVer,
        rating: rowPayload.rating,
        jobs_count: rowPayload.jobs_count,
        created_at: rowPayload.created_at,
      };
      await supabase.from('workers').upsert(workerPayload);
    } catch (err: any) {
      console.warn('Sync to Supabase helper/worker error:', err);
    }
  }

  const mapped = mapHelperRowToWorker(rowPayload);
  return { success: true, worker: mapped };
}

/**
 * Updates a helper's information in Supabase public.helpers table.
 */
export async function updateHelperInSupabase(
  id: string,
  updates: Partial<Worker>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  const patch: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name) patch.full_name = updates.name;
  if (updates.phone) patch.phone = updates.phone;
  if (updates.service_category || updates.service) {
    patch.service_category = updates.service_category || updates.service;
  }
  if (updates.primary_area || updates.area) {
    patch.primary_area = updates.primary_area || updates.area;
  }
  if (updates.serviceable_areas) {
    patch.serviceable_areas = updates.serviceable_areas;
  }
  if (updates.pricePerVisit !== undefined) {
    patch.price_per_visit = updates.pricePerVisit;
  }
  if (updates.experienceYears !== undefined) {
    patch.experience_years = updates.experienceYears;
  }
  if (updates.online !== undefined || updates.is_online !== undefined) {
    patch.is_online = updates.online ?? updates.is_online;
  }
  if (updates.verification_status !== undefined) {
    patch.verification_status = updates.verification_status;
    patch.is_verified = updates.verification_status === 'verified';
    if (updates.verification_status === 'verified') {
      patch.verified_at = new Date().toISOString();
      patch.rejection_reason = null;
    }
  } else if (updates.verified !== undefined || updates.is_verified !== undefined) {
    const isVer = updates.verified ?? updates.is_verified;
    patch.is_verified = isVer;
    if (isVer) {
      patch.verification_status = 'verified';
      patch.verified_at = new Date().toISOString();
    }
  }
  if (updates.rejection_reason !== undefined) {
    patch.rejection_reason = updates.rejection_reason;
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Update public.helpers table
    if (isUuid) {
      await supabase.from('helpers').update(patch).eq('id', id);
    } else {
      await supabase.from('helpers').update(patch).eq('phone', id);
    }

    // Sync to public.workers table
    const workerPatch: Record<string, any> = {};
    if (patch.full_name) workerPatch.name = patch.full_name;
    if (patch.service_category) {
      workerPatch.service = patch.service_category;
      workerPatch.service_category = patch.service_category;
    }
    if (patch.primary_area) {
      workerPatch.area = patch.primary_area;
      workerPatch.primary_area = patch.primary_area;
    }
    if (patch.serviceable_areas) workerPatch.serviceable_areas = patch.serviceable_areas;
    if (patch.is_online !== undefined) {
      workerPatch.is_online = patch.is_online;
      workerPatch.online = patch.is_online;
    }
    if (patch.is_verified !== undefined) {
      workerPatch.is_verified = patch.is_verified;
      workerPatch.verified = patch.is_verified;
    }
    if (Object.keys(workerPatch).length > 0) {
      if (isUuid) {
        await supabase.from('workers').update(workerPatch).eq('id', id);
      } else {
        await supabase.from('workers').update(workerPatch).eq('phone', id);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Update helper in Supabase error:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Deletes a helper from public.helpers and cleans up verifications and workers.
 */
export async function deleteHelperFromSupabase(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // 1. Delete from public.helpers
    if (isUuid) {
      await supabase.from('helpers').delete().eq('id', id);
    } else {
      await supabase.from('helpers').delete().eq('phone', id);
    }

    // 2. Delete from public.workers
    if (isUuid) {
      await supabase.from('workers').delete().eq('id', id);
    } else {
      await supabase.from('workers').delete().eq('phone', id);
    }

    // 3. Delete from public.helper_verifications
    if (isUuid) {
      await supabase.from('helper_verifications').delete().eq('helper_id', id);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Delete helper error:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Updates verification status for a helper (called on Admin approval or rejection in KYC tab).
 */
export async function setHelperVerificationInSupabase(
  idOrPhone: string,
  status: VerificationStatus,
  rejectionReason?: string | null
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const isVerified = status === 'verified';
  const verifiedAt = isVerified ? new Date().toISOString() : null;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrPhone);
    const updatePayload = {
      verification_status: status,
      is_verified: isVerified,
      verified_at: verifiedAt,
      rejection_reason: rejectionReason || null,
      updated_at: new Date().toISOString(),
    };

    // Update public.helpers
    if (isUuid) {
      await supabase.from('helpers').update(updatePayload).eq('id', idOrPhone);
    } else {
      await supabase.from('helpers').update(updatePayload).eq('phone', idOrPhone);
    }

    // Update public.workers
    const workerPayload = {
      is_verified: isVerified,
      verified: isVerified,
    };
    if (isUuid) {
      await supabase.from('workers').update(workerPayload).eq('id', idOrPhone);
    } else {
      await supabase.from('workers').update(workerPayload).eq('phone', idOrPhone);
    }
  } catch (err) {
    console.warn('setHelperVerificationInSupabase error:', err);
  }
}
