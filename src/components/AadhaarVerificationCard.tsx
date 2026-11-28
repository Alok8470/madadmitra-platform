import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Eye,
  Loader2,
  Lock,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { compressImage } from '../lib/imageCompressor';
import type { HelperVerification, VerificationStatus } from '../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface AadhaarVerificationCardProps {
  userId: string;
  helperName: string;
  helperPhone: string;
  language: 'en' | 'hi';
}

// ---------------------------------------------------------------------------
// Bilingual strings
// ---------------------------------------------------------------------------
const T = {
  title: { en: 'Aadhaar Verification', hi: 'आधार सत्यापन' },
  notSubmitted: { en: 'Not Submitted', hi: 'सबमिट नहीं हुआ' },
  pending: { en: 'Pending Admin Review', hi: 'प्रशासक समीक्षा में' },
  verified: { en: '✓ Aadhaar Verified', hi: '✓ आधार सत्यापित' },
  rejected: { en: 'Rejected', hi: 'अस्वीकृत' },
  rejectionReason: { en: 'Rejection reason:', hi: 'अस्वीकृति कारण:' },
  last4Label: { en: 'Last 4 digits of Aadhaar', hi: 'आधार के अंतिम 4 अंक' },
  last4Placeholder: { en: '1234', hi: '1234' },
  privacyNote: {
    en: 'We never store your full Aadhaar number. Only last 4 digits are recorded.',
    hi: 'हम आपका पूरा आधार नंबर कभी संग्रहीत नहीं करते। केवल अंतिम 4 अंक दर्ज किए जाते हैं।',
  },
  frontLabel: { en: 'Aadhaar Front', hi: 'आधार फ्रंट' },
  backLabel: { en: 'Aadhaar Back', hi: 'आधार बैक' },
  selfieLabel: { en: 'Live Selfie', hi: 'लाइव सेल्फी' },
  uploadHint: { en: 'JPG / PNG / WEBP · max 5 MB', hi: 'JPG / PNG / WEBP · अधिकतम 5 MB' },
  fileError: {
    en: 'Please upload a JPG, PNG, or WEBP image under 5 MB',
    hi: 'कृपया 5 MB से कम का JPG, PNG या WEBP चित्र अपलोड करें',
  },
  consent: {
    en: 'I voluntarily submit these documents for identity verification. I confirm these are genuine documents.',
    hi: 'मैं स्वेच्छा से पहचान सत्यापन के लिए ये दस्तावेज़ सबमिट कर रहा/रही हूँ। मैं पुष्टि करता/करती हूँ कि ये वास्तविक दस्तावेज़ हैं।',
  },
  submit: { en: 'Submit for Verification', hi: 'सत्यापन के लिए सबमिट करें' },
  submitting: { en: 'Uploading…', hi: 'अपलोड हो रहा है…' },
  successMsg: {
    en: 'Documents submitted! An admin will review your Aadhaar shortly.',
    hi: 'दस्तावेज़ सबमिट हो गए! एक प्रशासक जल्द ही आपके आधार की समीक्षा करेगा।',
  },
  verifiedTitle: { en: 'Identity Verified', hi: 'पहचान सत्यापित' },
  verifiedSub: {
    en: 'Your Aadhaar has been verified successfully.',
    hi: 'आपका आधार सफलतापूर्वक सत्यापित हो गया है।',
  },
  disclaimer: {
    en: 'Your documents are encrypted and stored securely. They are only accessible to authorised administrators.',
    hi: 'आपके दस्तावेज़ एन्क्रिप्टेड और सुरक्षित रूप से संग्रहीत हैं। वे केवल अधिकृत प्रशासकों द्वारा ही देखे जा सकते हैं।',
  },
  supabaseNotConfigured: {
    en: 'Supabase is not configured. Aadhaar verification is unavailable.',
    hi: 'Supabase कॉन्फ़िगर नहीं है। आधार सत्यापन उपलब्ध नहीं है।',
  },
  uploadError: {
    en: 'Upload failed. Please try again.',
    hi: 'अपलोड विफल हुआ। कृपया पुनः प्रयास करें।',
  },
  dbError: {
    en: 'Failed to save verification record. Please try again.',
    hi: 'सत्यापन रिकॉर्ड सहेजने में विफल। कृपया पुनः प्रयास करें।',
  },
  clickOrDrag: { en: 'Click to upload', hi: 'अपलोड करने के लिए क्लिक करें' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function t(key: keyof typeof T, lang: 'en' | 'hi'): string {
  return T[key][lang];
}

/**
 * Resolves the actual helper row from public.helpers by UUID id, user_id, or phone.
 * Guarantees we target a valid Supabase row UUID.
 */
async function resolveHelperRow(userId: string, phone?: string) {
  if (!isSupabaseConfigured || !supabase) return null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

  // 1. Try finding by primary key id (if userId is a UUID)
  if (isUuid) {
    const { data: byId } = await supabase
      .from('helpers')
      .select('id, user_id, full_name, phone, verification_status, aadhaar_last4, aadhaar_front_path, aadhaar_back_path, selfie_path, rejection_reason, submitted_at, verified_at')
      .eq('id', userId)
      .maybeSingle();
    if (byId) return byId;

    // 2. Try finding by user_id
    const { data: byUserId } = await supabase
      .from('helpers')
      .select('id, user_id, full_name, phone, verification_status, aadhaar_last4, aadhaar_front_path, aadhaar_back_path, selfie_path, rejection_reason, submitted_at, verified_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (byUserId) return byUserId;
  }

  // 3. Try finding by phone if available
  if (phone) {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length >= 8) {
      const { data: byPhone } = await supabase
        .from('helpers')
        .select('id, user_id, full_name, phone, verification_status, aadhaar_last4, aadhaar_front_path, aadhaar_back_path, selfie_path, rejection_reason, submitted_at, verified_at')
        .ilike('phone', `%${cleanDigits}%`)
        .maybeSingle();
      if (byPhone) return byPhone;
    }
  }

  return null;
}

function StatusBadge({
  status,
  lang,
}: {
  status: VerificationStatus;
  lang: 'en' | 'hi';
}) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        {t('verified', lang)}
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        <Loader2 size={13} className="animate-spin" />
        {t('pending', lang)}
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        <XCircle size={13} />
        {t('rejected', lang)}
      </span>
    );
  }
  // unsubmitted / default
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
      {t('notSubmitted', lang)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// File upload zone sub-component
// ---------------------------------------------------------------------------
interface UploadZoneProps {
  label: string;
  hint: string;
  icon: React.ReactNode;
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  onFileChange: (f: File | null) => void;
  onError: (msg: string | null) => void;
  disabled?: boolean;
  lang: 'en' | 'hi';
}

function UploadZone({
  label,
  hint,
  icon,
  file,
  previewUrl,
  error,
  onFileChange,
  onError,
  disabled,
  lang,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!ALLOWED_TYPES.includes(f.type) || f.size > MAX_SIZE) {
      onError(t('fileError', lang));
      onFileChange(null);
      return;
    }
    onError(null);
    onFileChange(f);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            inputRef.current?.click();
          }
        }}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-xl
          border-2 border-dashed border-slate-300 bg-slate-50
          p-5 text-center transition-colors
          ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'}
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={label}
              className="mx-auto h-28 w-auto rounded-lg object-cover shadow-sm"
            />
            <span className="mt-1 block text-xs text-slate-500">{file?.name}</span>
          </div>
        ) : (
          <>
            <span className="text-slate-400">{icon}</span>
            <span className="text-sm font-medium text-slate-600">
              {t('clickOrDrag', lang)}
            </span>
            <span className="text-xs text-slate-400">{hint}</span>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AadhaarVerificationCard({
  userId,
  helperName,
  helperPhone,
  language,
}: AadhaarVerificationCardProps) {
  const isHi = language === 'hi';
  const lang = language;

  // ── State ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<HelperVerification | null>(null);
  const [status, setStatus] = useState<VerificationStatus>('unsubmitted');

  // Form fields
  const [last4, setLast4] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [frontError, setFrontError] = useState<string | null>(null);
  const [backError, setBackError] = useState<string | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Fetch existing record ────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    async function fetchVerification() {
      try {
        // 1. Primary: Check public.helpers table
        const helperRecord = await resolveHelperRow(userId, helperPhone);
        if (helperRecord) {
          const vStatus = (helperRecord.verification_status as VerificationStatus) || 'unsubmitted';
          if (vStatus !== 'unsubmitted') {
            setStatus(vStatus);
            setVerification({
              id: helperRecord.id,
              helper_id: helperRecord.id,
              aadhaar_last4: helperRecord.aadhaar_last4 || '',
              aadhaar_front_path: helperRecord.aadhaar_front_path || null,
              aadhaar_back_path: helperRecord.aadhaar_back_path || null,
              selfie_path: helperRecord.selfie_path || null,
              verification_status: vStatus,
              rejection_reason: helperRecord.rejection_reason || null,
              submitted_at: helperRecord.submitted_at || null,
              verified_at: helperRecord.verified_at || null,
            });
            setLoading(false);
            return;
          }
        }

        // 2. Secondary check: helper_verifications table for legacy records
        const { data: legData } = await supabase
          .from('helper_verifications')
          .select('*')
          .eq('helper_id', userId)
          .maybeSingle();

        if (legData) {
          setVerification(legData as HelperVerification);
          setStatus((legData as HelperVerification).verification_status);
        } else {
          setStatus('unsubmitted');
        }
      } catch (err) {
        console.warn('Error fetching helper verification state:', err);
        setStatus('unsubmitted');
      } finally {
        setLoading(false);
      }
    }
    fetchVerification();
  }, [userId, helperPhone]);

  // ── Revoke preview URLs on unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── File setters with preview generation ────────────────────────────────
  function setFront(f: File | null) {
    if (frontPreview) URL.revokeObjectURL(frontPreview);
    setFrontFile(f);
    setFrontPreview(f ? URL.createObjectURL(f) : null);
  }
  function setBack(f: File | null) {
    if (backPreview) URL.revokeObjectURL(backPreview);
    setBackFile(f);
    setBackPreview(f ? URL.createObjectURL(f) : null);
  }
  function setSelfie(f: File | null) {
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfieFile(f);
    setSelfiePreview(f ? URL.createObjectURL(f) : null);
  }

  // ── Derived submit eligibility ───────────────────────────────────────────
  const canSubmit =
    /^\d{4}$/.test(last4) &&
    frontFile !== null &&
    backFile !== null &&
    selfieFile !== null &&
    consent &&
    !submitting;

  // ── Submit handler ───────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !isSupabaseConfigured || !supabase) return;

    setSubmitting(true);
    setToastError(null);
    setSuccessMsg(null);

    try {
      // 1. Resolve or ensure a valid helper row exists in public.helpers with a real UUID
      let targetHelperId: string | null = null;
      const existingHelper = await resolveHelperRow(userId, helperPhone);

      if (existingHelper) {
        targetHelperId = existingHelper.id;
      } else {
        // If helper row does not exist in public.helpers, insert one so it receives a real Supabase UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        const newHelperPayload: Record<string, any> = {
          full_name: helperName || 'Service Partner',
          phone: helperPhone || '+910000000000',
          service_category: 'electrician',
          primary_area: 'Deoria',
          serviceable_areas: ['Deoria'],
          is_online: true,
          is_verified: false,
          verification_status: 'pending',
          updated_at: new Date().toISOString(),
        };
        if (isUuid) {
          newHelperPayload.user_id = userId;
        }

        const { data: inserted, error: insertErr } = await supabase
          .from('helpers')
          .insert([newHelperPayload])
          .select('id')
          .single();

        if (!insertErr && inserted?.id) {
          targetHelperId = inserted.id;
        } else {
          console.warn('Could not auto-insert helper row:', insertErr?.message);
          if (isUuid) targetHelperId = userId;
        }
      }

      const effectiveHelperId = targetHelperId || userId;

      // 2. Client-Side Image Auto-Compression before upload (max 1280px, quality 0.75, < ~300KB)
      const [compressedFront, compressedBack, compressedSelfie] = await Promise.all([
        compressImage(frontFile!, { maxWidth: 1280, maxHeight: 1280, quality: 0.75 }),
        compressImage(backFile!, { maxWidth: 1280, maxHeight: 1280, quality: 0.75 }),
        compressImage(selfieFile!, { maxWidth: 1280, maxHeight: 1280, quality: 0.75 }),
      ]);

      // 3. Clean storage paths with timestamp and resolved helper ID
      const timestamp = Date.now();
      const frontPath = `${effectiveHelperId}/aadhaar_front_${timestamp}.jpg`;
      const backPath = `${effectiveHelperId}/aadhaar_back_${timestamp}.jpg`;
      const selfiePath = `${effectiveHelperId}/selfie_${timestamp}.jpg`;

      // 4. Upload front image
      const { data: frontData, error: frontErr } = await supabase.storage
        .from('helper-documents')
        .upload(frontPath, compressedFront, { contentType: 'image/jpeg', upsert: true });
      if (frontErr) throw new Error(`Front Aadhaar upload failed: ${frontErr.message}`);

      // 5. Upload back image
      const { data: backData, error: backErr } = await supabase.storage
        .from('helper-documents')
        .upload(backPath, compressedBack, { contentType: 'image/jpeg', upsert: true });
      if (backErr) throw new Error(`Back Aadhaar upload failed: ${backErr.message}`);

      // 6. Upload live selfie
      const { data: selfieData, error: selfieErr } = await supabase.storage
        .from('helper-documents')
        .upload(selfiePath, compressedSelfie, { contentType: 'image/jpeg', upsert: true });
      if (selfieErr) throw new Error(`Live selfie upload failed: ${selfieErr.message}`);

      // 7. Update helper row in public.helpers with verification details
      const nowIso = new Date().toISOString();
      const updatePayload: Record<string, any> = {
        aadhaar_last4: last4,
        aadhaar_front_path: frontData?.path || frontPath,
        aadhaar_back_path: backData?.path || backPath,
        selfie_path: selfieData?.path || selfiePath,
        verification_status: 'pending',
        submitted_at: nowIso,
        updated_at: nowIso,
      };

      // Perform update on public.helpers
      let updateError: any = null;
      if (targetHelperId) {
        const { error } = await supabase
          .from('helpers')
          .update(updatePayload)
          .eq('id', targetHelperId);
        updateError = error;
      } else {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        if (isUuid) {
          const { error } = await supabase
            .from('helpers')
            .update(updatePayload)
            .or(`id.eq.${userId},user_id.eq.${userId}`);
          updateError = error;
        } else if (helperPhone) {
          const cleanDigits = helperPhone.replace(/\D/g, '').slice(-10);
          const { error } = await supabase
            .from('helpers')
            .update(updatePayload)
            .ilike('phone', `%${cleanDigits}%`);
          updateError = error;
        }
      }

      // If update failed because 'submitted_at' column is missing in older DB schema, retry without it
      if (updateError && updateError.message?.toLowerCase().includes('submitted_at')) {
        delete updatePayload.submitted_at;
        if (targetHelperId) {
          const { error } = await supabase
            .from('helpers')
            .update(updatePayload)
            .eq('id', targetHelperId);
          updateError = error;
        } else {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
          if (isUuid) {
            const { error } = await supabase
              .from('helpers')
              .update(updatePayload)
              .or(`id.eq.${userId},user_id.eq.${userId}`);
            updateError = error;
          } else if (helperPhone) {
            const cleanDigits = helperPhone.replace(/\D/g, '').slice(-10);
            const { error } = await supabase
              .from('helpers')
              .update(updatePayload)
              .ilike('phone', `%${cleanDigits}%`);
            updateError = error;
          }
        }
      }

      // If database update returned an error, log and display exact error message
      if (updateError) {
        console.error('Helper record update error in public.helpers:', updateError);
        throw new Error(`Failed to save verification record: ${updateError.message}`);
      }

      // 8. Secondary upsert into helper_verifications for backward-compatibility
      try {
        await supabase.from('helper_verifications').upsert({
          helper_id: effectiveHelperId,
          aadhaar_last4: last4,
          aadhaar_front_path: frontData?.path || frontPath,
          aadhaar_back_path: backData?.path || backPath,
          selfie_path: selfieData?.path || selfiePath,
          verification_status: 'pending',
          submitted_at: nowIso,
          helper_name: helperName,
          helper_phone: helperPhone,
        });
      } catch (dbErr) {
        console.warn('helper_verifications legacy sync note:', dbErr);
      }

      setStatus('pending');
      setVerification({
        id: effectiveHelperId,
        helper_id: effectiveHelperId,
        aadhaar_last4: last4,
        aadhaar_front_path: frontData?.path || frontPath,
        aadhaar_back_path: backData?.path || backPath,
        selfie_path: selfieData?.path || selfiePath,
        verification_status: 'pending',
        submitted_at: nowIso,
      });
      setSuccessMsg(t('successMsg', lang));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('KYC Upload failed:', err);
      setToastError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render: Supabase not configured ─────────────────────────────────────
  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0 text-amber-500" size={20} />
          <p className="text-sm text-amber-800">{t('supabaseNotConfigured', lang)}</p>
        </div>
      </div>
    );
  }

  // ── Render: Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  // ── Render: Verified success card ────────────────────────────────────────
  if (status === 'verified') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={22} />
            <h3 className="text-base font-semibold text-slate-800">
              {t('title', lang)}
            </h3>
          </div>
          <StatusBadge status="verified" lang={lang} />
        </div>

        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="text-emerald-500" size={48} />
          <p className="text-lg font-semibold text-slate-800">{t('verifiedTitle', lang)}</p>
          <p className="text-sm text-slate-500">{t('verifiedSub', lang)}</p>
        </div>
      </div>
    );
  }

  // ── Render: Main card ────────────────────────────────────────────────────
  const showForm = status === 'unsubmitted' || status === 'rejected';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* ── Header ── */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-600" size={22} />
          <h3 className="text-base font-semibold text-slate-800">{t('title', lang)}</h3>
        </div>
        <StatusBadge status={status} lang={lang} />
      </div>

      {/* ── Rejection notice ── */}
      {status === 'rejected' && verification?.rejection_reason && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle className="mt-0.5 shrink-0 text-red-500" size={16} />
          <div>
            <p className="text-sm font-medium text-red-700">
              {t('rejectionReason', lang)}
            </p>
            <p className="mt-0.5 text-sm text-red-600">{verification.rejection_reason}</p>
          </div>
        </div>
      )}

      {/* ── Pending notice ── */}
      {status === 'pending' && !showForm && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Loader2 className="animate-spin text-amber-500" size={36} />
          <p className="text-sm font-medium text-slate-600">{t('pending', lang)}</p>
          {successMsg && (
            <p className="text-xs text-slate-400">{successMsg}</p>
          )}
        </div>
      )}

      {/* ── Upload form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Success banner after re-submit */}
          {successMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={16} />
              <p className="text-sm text-emerald-700">{successMsg}</p>
            </div>
          )}

          {/* Toast error */}
          {toastError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={16} />
              <p className="text-sm text-red-700">{toastError}</p>
            </div>
          )}

          {/* Last 4 digits */}
          <div className="space-y-1.5">
            <label
              htmlFor="aadhaar-last4"
              className="block text-sm font-medium text-slate-700"
            >
              {t('last4Label', lang)}
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              id="aadhaar-last4"
              type="text"
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              required
              value={last4}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                setLast4(v);
              }}
              placeholder={t('last4Placeholder', lang)}
              className="block w-32 rounded-lg border border-slate-300 px-3 py-2 text-center text-lg font-mono tracking-widest shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            {/* Privacy note */}
            <p className="flex items-start gap-1.5 text-xs text-slate-400">
              <Lock size={11} className="mt-0.5 shrink-0" />
              {t('privacyNote', lang)}
            </p>
          </div>

          {/* File uploads — grid on sm+ */}
          <div className="grid gap-4 sm:grid-cols-3">
            <UploadZone
              label={t('frontLabel', lang)}
              hint={t('uploadHint', lang)}
              icon={<Upload size={28} />}
              file={frontFile}
              previewUrl={frontPreview}
              error={frontError}
              onFileChange={setFront}
              onError={setFrontError}
              disabled={submitting}
              lang={lang}
            />
            <UploadZone
              label={t('backLabel', lang)}
              hint={t('uploadHint', lang)}
              icon={<Eye size={28} />}
              file={backFile}
              previewUrl={backPreview}
              error={backError}
              onFileChange={setBack}
              onError={setBackError}
              disabled={submitting}
              lang={lang}
            />
            <UploadZone
              label={t('selfieLabel', lang)}
              hint={t('uploadHint', lang)}
              icon={<Camera size={28} />}
              file={selfieFile}
              previewUrl={selfiePreview}
              error={selfieError}
              onFileChange={setSelfie}
              onError={setSelfieError}
              disabled={submitting}
              lang={lang}
            />
          </div>

          {/* Consent checkbox */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={submitting}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-slate-700">{t('consent', lang)}</span>
          </label>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`
              flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold
              transition focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1
              ${
                canSubmit
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400'
              }
            `}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('submitting', lang)}
              </>
            ) : (
              t('submit', lang)
            )}
          </button>
        </form>
      )}

      {/* ── Bottom disclaimer ── */}
      <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4">
        <Lock size={12} className="mt-0.5 shrink-0 text-slate-400" />
        <p className="text-xs text-slate-400">{t('disclaimer', lang)}</p>
      </div>
    </div>
  );
}
