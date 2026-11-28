import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Clock,
  BadgeCheck,
  ExternalLink,
  X,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import type { HelperVerification, VerificationStatus } from '../types';

// ---------------------------------------------------------------------------
// Mock data shown when Supabase is not configured
// ---------------------------------------------------------------------------
const MOCK_DATA: HelperVerification[] = [
  {
    id: 'mock-1',
    helper_id: 'uuid-aaa',
    aadhaar_last4: '5678',
    aadhaar_front_path: null,
    aadhaar_back_path: null,
    selfie_path: null,
    verification_status: 'pending',
    rejection_reason: null,
    submitted_at: new Date(Date.now() - 3600_000).toISOString(),
    verified_at: null,
    helper_name: 'Ramesh Kumar',
    helper_phone: '+91 98765 43210',
  },
  {
    id: 'mock-2',
    helper_id: 'uuid-bbb',
    aadhaar_last4: '1234',
    aadhaar_front_path: null,
    aadhaar_back_path: null,
    selfie_path: null,
    verification_status: 'verified',
    rejection_reason: null,
    submitted_at: new Date(Date.now() - 86400_000).toISOString(),
    verified_at: new Date(Date.now() - 43200_000).toISOString(),
    helper_name: 'Sunita Devi',
    helper_phone: '+91 91234 56789',
  },
  {
    id: 'mock-3',
    helper_id: 'uuid-ccc',
    aadhaar_last4: '9999',
    aadhaar_front_path: null,
    aadhaar_back_path: null,
    selfie_path: null,
    verification_status: 'rejected',
    rejection_reason: 'Document image was blurry and unreadable.',
    submitted_at: new Date(Date.now() - 172800_000).toISOString(),
    verified_at: null,
    helper_name: 'Ajay Singh',
    helper_phone: '+91 70000 11223',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

type TabKey = 'all' | VerificationStatus;

interface Tab {
  key: TabKey;
  label: string;
}

const TABS: Tab[] = [
  { key: 'all', label: 'All Helpers' },
  { key: 'pending', label: 'Pending Review' },
  { key: 'unsubmitted', label: 'Unsubmitted KYC' },
  { key: 'verified', label: 'Verified' },
  { key: 'rejected', label: 'Rejected' },
];

function statusBadge(status: VerificationStatus) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          <Clock size={12} /> Pending
        </span>
      );
    case 'verified':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          <BadgeCheck size={12} /> Verified
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
          <XCircle size={12} /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          Unsubmitted
        </span>
      );
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ViewButtonProps {
  label: string;
  path: string | null;
  onPreview?: (url: string) => void;
}

function ViewDocButton({ label, path, onPreview }: ViewButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleView() {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: signedErr } = await supabase.storage
        .from('helper-documents')
        .createSignedUrl(path, 300);
      if (signedErr || !data?.signedUrl) {
        setError(signedErr?.message ?? 'Could not generate URL');
        return;
      }
      if (onPreview) {
        onPreview(data.signedUrl);
      } else {
        window.open(data.signedUrl, '_blank');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (!path) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-400 cursor-not-allowed"
      >
        <Eye size={12} /> {label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={handleView}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
      >
        {loading ? <Loader2 size={12} className="animate-spin text-brand-600" /> : <Eye size={12} />}
        {label}
      </button>
      {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

interface RejectFormProps {
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

function RejectForm({ onConfirm, onCancel, submitting }: RejectFormProps) {
  const [reason, setReason] = useState('');
  const tooShort = reason.trim().length > 0 && reason.trim().length < 10;

  return (
    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
      <p className="text-xs font-medium text-red-700">Rejection reason (required, min 10 chars)</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder="e.g. Document image was blurry and unreadable."
        className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
      />
      {tooShort && <p className="text-xs text-red-500">Please enter at least 10 characters.</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onConfirm(reason.trim())}
          disabled={reason.trim().length < 10 || submitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
          Confirm Reject
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface VerificationCardProps {
  record: HelperVerification;
  onRefresh: () => void;
  onMockUpdate?: (id: string, status: VerificationStatus, reason?: string) => void;
  onPreview?: (title: string, url: string) => void;
}

function VerificationCard({ record, onRefresh, onMockUpdate, onPreview }: VerificationCardProps) {
  const { setWorkerVerified } = useApp();
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [cleanUpStorageOnApprove, setCleanUpStorageOnApprove] = useState(false);

  async function handleApprove() {
    setApproving(true);
    setApproveError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(record.id || '');
        const updatePayload: Record<string, any> = {
          verification_status: 'verified',
          is_verified: true,
          verified_at: new Date().toISOString(),
          rejection_reason: null,
          updated_at: new Date().toISOString(),
        };

        // Optionally delete raw ID images from storage to save space & protect privacy
        if (cleanUpStorageOnApprove) {
          const filesToDelete = [
            record.aadhaar_front_path,
            record.aadhaar_back_path,
            record.selfie_path,
          ].filter(Boolean) as string[];

          if (filesToDelete.length > 0) {
            try {
              const { error: remErr } = await supabase.storage.from('helper-documents').remove(filesToDelete);
              if (!remErr) {
                updatePayload.aadhaar_front_path = null;
                updatePayload.aadhaar_back_path = null;
                updatePayload.selfie_path = null;
              }
            } catch (delErr) {
              console.warn('Storage cleanup note:', delErr);
            }
          }
        }

        if (isUuid) {
          const { error } = await supabase.from('helpers').update(updatePayload).eq('id', record.id);
          if (error) { setApproveError(error.message); return; }
        } else if (record.helper_phone) {
          const { error } = await supabase.from('helpers').update(updatePayload).eq('phone', record.helper_phone);
          if (error) { setApproveError(error.message); return; }
        }

        // Also update helper_verifications if record exists
        try {
          await supabase
            .from('helper_verifications')
            .update({
              verification_status: 'verified',
              verified_at: new Date().toISOString(),
              rejection_reason: null,
            })
            .eq('id', record.id as string);
        } catch {}
      }
      // Reflect verified status on the helper's public profile immediately
      setWorkerVerified(record.helper_id || record.id || record.helper_phone || record.helper_name || '', true, 'verified');
      onMockUpdate?.(record.id as string, 'verified');
      onRefresh();
    } catch (e: unknown) {
      setApproveError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setApproving(false);
    }
  }

  async function handleReject(reason: string) {
    setRejecting(true);
    setRejectError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(record.id || '');
        const updatePayload = {
          verification_status: 'rejected',
          is_verified: false,
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        };

        if (isUuid) {
          const { error } = await supabase.from('helpers').update(updatePayload).eq('id', record.id);
          if (error) { setRejectError(error.message); return; }
        } else if (record.helper_phone) {
          const { error } = await supabase.from('helpers').update(updatePayload).eq('phone', record.helper_phone);
          if (error) { setRejectError(error.message); return; }
        }

        // Also update helper_verifications if record exists
        try {
          await supabase
            .from('helper_verifications')
            .update({
              verification_status: 'rejected',
              rejection_reason: reason,
            })
            .eq('id', record.id as string);
        } catch {}
      }
      // Reflect rejected status on the helper's public profile
      setWorkerVerified(record.helper_id || record.id || record.helper_phone || record.helper_name || '', false, 'rejected', reason);
      onMockUpdate?.(record.id as string, 'rejected', reason);
      setShowRejectForm(false);
      onRefresh();
    } catch (e: unknown) {
      setRejectError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setRejecting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-800 text-sm">
            {record.helper_name ?? 'Unknown Helper'}
          </p>
          <p className="text-xs text-slate-500">{record.helper_phone ?? '—'}</p>
        </div>
        {statusBadge(record.verification_status)}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
        <div>
          <span className="text-slate-400">Aadhaar</span>
          <p className="font-mono font-medium tracking-widest text-slate-700">
            XXXX&nbsp;XXXX&nbsp;XXXX&nbsp;{record.aadhaar_last4}
          </p>
        </div>
        <div>
          <span className="text-slate-400">Submitted</span>
          <p>{formatDate(record.submitted_at)}</p>
        </div>
        {record.verification_status === 'verified' && record.verified_at && (
          <div className="col-span-2">
            <span className="text-slate-400">Verified at</span>
            <p>{formatDate(record.verified_at)}</p>
          </div>
        )}
        {record.verification_status === 'rejected' && record.rejection_reason && (
          <div className="col-span-2">
            <span className="text-slate-400">Rejection reason</span>
            <p className="text-red-600">{record.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Document view buttons */}
      <div className="flex flex-wrap gap-2">
        <ViewDocButton
          label="View Front"
          path={record.aadhaar_front_path}
          onPreview={(url) => onPreview?.(`${record.helper_name ?? 'Helper'} — Aadhaar Front`, url)}
        />
        <ViewDocButton
          label="View Back"
          path={record.aadhaar_back_path}
          onPreview={(url) => onPreview?.(`${record.helper_name ?? 'Helper'} — Aadhaar Back`, url)}
        />
        <ViewDocButton
          label="View Selfie"
          path={record.selfie_path}
          onPreview={(url) => onPreview?.(`${record.helper_name ?? 'Helper'} — Live Selfie`, url)}
        />
      </div>

      {/* Admin actions — for pending, unsubmitted, or rejected helpers */}
      {record.verification_status !== 'verified' ? (
        <div className="border-t border-slate-100 pt-3 space-y-2.5">
          <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cleanUpStorageOnApprove}
              onChange={(e) => setCleanUpStorageOnApprove(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
            />
            <span>Delete raw ID images from storage on approve (saves storage space & protects privacy)</span>
          </label>

          {!showRejectForm && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleApprove}
                disabled={approving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
              >
                {approving
                  ? <Loader2 size={12} className="animate-spin" />
                  : <CheckCircle2 size={12} />}
                ✓ Approve
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <XCircle size={12} /> ✗ Reject
              </button>
            </div>
          )}
          {approveError && <p className="text-xs text-red-500">{approveError}</p>}
          {showRejectForm && (
            <RejectForm
              onConfirm={handleReject}
              onCancel={() => { setShowRejectForm(false); setRejectError(null); }}
              submitting={rejecting}
            />
          )}
          {rejectError && <p className="text-xs text-red-500">{rejectError}</p>}
        </div>
      ) : (
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 size={13} /> Active & Verified in Catalog
          </span>
          {!showRejectForm && (
            <button
              onClick={() => setShowRejectForm(true)}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 underline cursor-pointer"
            >
              Revoke / Reject Verification
            </button>
          )}
          {showRejectForm && (
            <div className="w-full mt-2">
              <RejectForm
                onConfirm={handleReject}
                onCancel={() => { setShowRejectForm(false); setRejectError(null); }}
                submitting={rejecting}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export default function AdminVerificationPanel() {
  const [records, setRecords] = useState<HelperVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [previewModal, setPreviewModal] = useState<{ title: string; url: string } | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setRecords(MOCK_DATA);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      // 1. Primary: fetch all helpers directly from public.helpers table
      const { data, error } = await supabase
        .from('helpers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch from helpers table:', error.message);
        setFetchError(error.message);
        return;
      }

      if (Array.isArray(data)) {
        const mappedRecords: HelperVerification[] = data.map((row: any) => ({
          id: row.id,
          helper_id: row.id,
          helper_name: row.full_name || row.name || 'Service Partner',
          helper_phone: row.phone || '',
          aadhaar_last4: row.aadhaar_last4 || '••••',
          aadhaar_front_path: row.aadhaar_front_path || null,
          aadhaar_back_path: row.aadhaar_back_path || null,
          selfie_path: row.selfie_path || null,
          verification_status: (row.verification_status as VerificationStatus) || 'unsubmitted',
          rejection_reason: row.rejection_reason || null,
          submitted_at: row.submitted_at || row.updated_at || row.created_at || null,
          verified_at: row.verified_at || null,
        }));
        setRecords(mappedRecords);
      }
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();

    // Subscribe to Supabase Realtime changes on public.helpers
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('admin_kyc_helpers_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'helpers' },
          () => {
            fetchRecords();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchRecords]);

  const handleMockUpdate = (id: string, newStatus: VerificationStatus, reason?: string) => {
    if (!isSupabaseConfigured) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                verification_status: newStatus,
                verified_at: newStatus === 'verified' ? new Date().toISOString() : r.verified_at,
                rejection_reason: reason || null,
              }
            : r
        )
      );
    }
  };

  const countFor = (tab: TabKey) =>
    tab === 'all' ? records.length : records.filter((r) => r.verification_status === tab).length;

  const filtered =
    activeTab === 'all'
      ? records
      : records.filter((r) => r.verification_status === activeTab);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-brand-600" size={22} />
          <h2 className="text-lg font-bold text-slate-800">Aadhaar Verification Review</h2>
        </div>
        <button
          onClick={fetchRecords}
          disabled={loading}
          title="Refresh"
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Supabase not configured notice */}
      {!isSupabaseConfigured && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Supabase not configured.</span> Add{' '}
            <code className="rounded bg-amber-100 px-1 font-mono text-xs">VITE_SUPABASE_URL</code>{' '}
            and{' '}
            <code className="rounded bg-amber-100 px-1 font-mono text-xs">VITE_SUPABASE_ANON_KEY</code>{' '}
            to your <code className="rounded bg-amber-100 px-1 font-mono text-xs">.env</code> file.
            Showing mock data below.
          </p>
        </div>
      )}

      {/* Fetch error */}
      {fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <AlertTriangle size={16} /> {fetchError}
        </div>
      )}

      {/* Tab filter bar */}
      <div className="flex gap-0 border-b border-slate-200">
        {TABS.map((tab) => {
          const count = countFor(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-b-2 border-brand-600 text-brand-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  isActive
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex justify-center py-10 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      )}

      {/* Card grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((record) => (
            <VerificationCard
              key={record.id ?? record.helper_id}
              record={record}
              onRefresh={fetchRecords}
              onMockUpdate={handleMockUpdate}
              onPreview={(title, url) => setPreviewModal({ title, url })}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && !fetchError && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
          <ShieldCheck size={40} className="opacity-30" />
          <p className="text-sm font-medium">
            {activeTab === 'pending'
              ? 'No pending verifications — all clear!'
              : `No ${activeTab === 'all' ? '' : activeTab + ' '}records found.`}
          </p>
        </div>
      )}

      {/* Lightbox Document Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">{previewModal.title}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Open full size in new tab"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-950/5 min-h-[300px] max-h-[72vh] overflow-auto">
              <img
                src={previewModal.url}
                alt={previewModal.title}
                className="max-h-[66vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
              <span>Secure preview generated via Supabase signed URL (300s expiry)</span>
              <button
                onClick={() => setPreviewModal(null)}
                className="btn py-1 px-3 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
