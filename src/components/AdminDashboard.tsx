import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Users,
  CalendarCheck,
  AlertTriangle,
  ArrowRight,
  Search,
  BadgeCheck,
  FileCheck,
  Phone,
  Clock,
  MapPin,
  PlusCircle,
  Edit,
  Tag,
  Sliders,
  Sparkles,
  Zap,
  Lock,
  ChevronDown,
  X,
  RefreshCw,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SERVICE_LABELS, SERVICES } from '../data/mockData';
import { DEORIA_AREA_COORDINATES } from '../services/dispatchService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ensureValidUuid } from '../services/helperService';
import type { Booking, Worker, BookingStatus } from '../types';
import AdminVerificationPanel from './AdminVerificationPanel';
import Modal from './Modal';

// Available localities in Deoria for area assignment
const DEORIA_LOCALITIES = Object.keys(DEORIA_AREA_COORDINATES).map(
  (k) => k.charAt(0).toUpperCase() + k.slice(1)
);

// Initial Promo Banners config editable by Admin
interface PromoBanner {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  cta: string;
  promoCode?: string;
  active: boolean;
  bg: string;
}

const INITIAL_PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'b1',
    label: 'LAUNCH OFFER',
    title: 'First Booking Free Platform Fee',
    subtitle: 'Use code MADAD0 — Limited period offer for Deoria households',
    cta: 'Book Now',
    promoCode: 'MADAD0',
    active: true,
    bg: 'from-violet-600 via-purple-600 to-indigo-700',
  },
  {
    id: 'b2',
    label: 'DAILY MEAL PLAN',
    title: 'Monthly Cook Package at ₹3,499',
    subtitle: '25 visits/month — fresh North Indian meals, zero commission to your cook',
    cta: 'View Plans',
    promoCode: 'COOKPLAN',
    active: true,
    bg: 'from-emerald-600 via-teal-600 to-cyan-700',
  },
  {
    id: 'b3',
    label: 'EMERGENCY',
    title: '30-Min Urgent Helper Dispatch',
    subtitle: 'Electrician · Plumber · Maid — All within 30 minutes. 24 × 7 in Deoria',
    cta: 'Call Now',
    promoCode: 'EXPRESS30',
    active: true,
    bg: 'from-amber-500 via-orange-500 to-rose-500',
  },
  {
    id: 'b4',
    label: 'VERIFIED PARTNERS',
    title: '0% Commission to Your Helper',
    subtitle: 'Workers keep 100% of their pay — no hidden cuts, no loan traps ever',
    cta: 'Join as Partner',
    promoCode: 'PARTNER0',
    active: true,
    bg: 'from-brand-700 via-brand-600 to-sky-700',
  },
];

export default function AdminDashboard() {
  const {
    workers,
    bookings,
    setView,
    toggleWorkerOnline,
    toggleWorkerVerified,
    catalogMode,
    setCatalogMode,
    currentUser,
    setCurrentUser,
    updateBooking,
    updateWorker,
    removeWorker,
    addWorker,
    refreshHelpers,
  } = useApp();

  const [refreshingHelpers, setRefreshingHelpers] = useState<boolean>(false);

  const handleRefreshHelpers = async () => {
    setRefreshingHelpers(true);
    try {
      await refreshHelpers();
    } finally {
      setRefreshingHelpers(false);
    }
  };

  // Authentication & Route Security State
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState<
    'overview' | 'manual_queue' | 'bookings' | 'workers' | 'services_banners' | 'aadhaar'
  >('overview');

  // Manual Assignment selection state: bookingId -> helperId
  const [selectedHelpers, setSelectedHelpers] = useState<Record<string, string>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignmentSuccessMsg, setAssignmentSuccessMsg] = useState<string>('');

  // Delete Helper state
  const [deletingWorker, setDeletingWorker] = useState<Worker | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string>('');

  // Bookings list filter & search
  const [bookingFilter, setBookingFilter] = useState<'all' | BookingStatus>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');

  // Helper manager search & modal states
  const [workerSearch, setWorkerSearch] = useState<string>('');
  const [workerFilterCategory, setWorkerFilterCategory] = useState<string>('all');
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState<boolean>(false);

  // New Helper Form State
  const [newHelper, setNewHelper] = useState({
    name: '',
    phone: '',
    service: 'cook',
    primary_area: 'Raghav Nagar',
    serviceable_areas: ['Raghav Nagar', 'Civil Lines'],
    pricePerVisit: 200,
    experienceYears: 4,
    verified: false,
    online: true,
  });

  // Services & Pricing State
  const [servicePricing, setServicePricing] = useState<Record<string, number>>({
    cook: 250,
    cleaner: 200,
    electrician: 150,
    plumber: 180,
    carpenter: 180,
    painter: 200,
    'all-rounder': 400,
    'tag-team': 650,
  });

  // Promotional Carousel Banners State
  const [banners, setBanners] = useState<PromoBanner[]>(INITIAL_PROMO_BANNERS);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);

  // ============================================================================
  // 1. ROUTE SECURITY & ADMIN ROLE VERIFICATION
  // ============================================================================
  useEffect(() => {
    let isMounted = true;

    async function verifyAdminAccess() {
      // 1. Fast check if context already has role === 'admin'
      if (currentUser?.role === 'admin') {
        if (isMounted) {
          setIsAuthorized(true);
          setAuthChecking(false);
        }
        return;
      }

      // 2. Check Supabase session & profiles table
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, phone, role')
              .eq('id', user.id)
              .maybeSingle();

            if (profile && profile.role === 'admin') {
              if (isMounted) {
                setCurrentUser({
                  id: profile.id,
                  fullName: profile.full_name || 'Admin',
                  phone: profile.phone || '',
                  role: 'admin',
                });
                setIsAuthorized(true);
                setAuthChecking(false);
              }
              return;
            }
          }
        } catch (err) {
          console.warn('Admin verification check:', err);
        }
      }

      // 3. Fallback: Local / testing admin session stored in localStorage
      try {
        const stored = localStorage.getItem('madadmitra_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.role === 'admin') {
            if (isMounted) {
              setCurrentUser(parsed);
              setIsAuthorized(true);
              setAuthChecking(false);
            }
            return;
          }
        }
      } catch (e) {
        console.debug(e);
      }

      // If unauthorized, redirect to /admin-login
      if (isMounted) {
        setIsAuthorized(false);
        setAuthChecking(false);
        setView('admin-login');
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', '/admin-login');
        }
      }
    }

    verifyAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [currentUser, setCurrentUser, setView]);

  if (authChecking) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 space-y-4">
        <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
        <p className="text-sm font-bold text-slate-700">
          Verifying Administrator Authorization...
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 shadow-xl text-center space-y-4">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-700">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-black text-slate-900">
            Restricted Admin Area
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access to the MadadMitra Operations Center requires authenticated administrator privileges (<code className="bg-slate-100 px-1 py-0.5 rounded text-rose-700 font-bold">role: admin</code>).
          </p>
          <button
            onClick={() => {
              setView('admin-login');
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '/admin-login');
              }
            }}
            className="btn-primary w-full py-3 text-xs font-bold rounded-xl"
          >
            Go to Admin Sign In
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. PRIORITY "NEEDS MANUAL ASSIGNMENT" QUEUE & LOGIC
  // ============================================================================
  const manualNeededBookings = bookings.filter((b) => b.status === 'manual_needed');
  const searchingBookings = bookings.filter((b) => b.status === 'searching_helper');
  const assignedBookings = bookings.filter(
    (b) => b.status === 'assigned' || b.status === 'accepted' || b.status === 'in_progress'
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const totalConvenienceFee =
    completedBookings.length * 10 +
    assignedBookings.length * 10 || bookings.length * 10;
  const verifiedHelpersCount = workers.filter(
    (w) => w.verification_status === 'verified' && (w.verified === true || w.is_verified === true)
  ).length;

  // Handle Manual Helper Assignment
  const handleAssignHelperManually = async (booking: Booking) => {
    const helperId = selectedHelpers[booking.id];
    if (!helperId) {
      alert('Please select a verified helper from the dropdown first.');
      return;
    }

    const helper = workers.find((w) => w.id === helperId);
    if (!helper) return;

    setAssigningId(booking.id);

    try {
      // 1. Update Supabase
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('bookings')
          .update({
            status: 'assigned',
            assigned_helper_id: helper.id,
            worker_id: helper.id,
            worker_name: helper.name,
            current_offer_helper_id: null,
            offer_expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id);

        // Broadcast to customer and helper channels
        const channel = supabase.channel(`booking_updates:${booking.id}`);
        await channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            channel.send({
              type: 'broadcast',
              event: 'booking_assigned',
              payload: {
                bookingId: booking.id,
                helperId: helper.id,
                helperName: helper.name,
                status: 'assigned',
              },
            });
          }
        });
      }

      // 2. Update local state
      const updated: Booking = {
        ...booking,
        status: 'assigned',
        assigned_helper_id: helper.id,
        workerId: helper.id,
        workerName: helper.name,
        current_offer_helper_id: null,
        offer_expires_at: null,
      };
      updateBooking(updated);

      // 3. Dispatch window event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('madadmitra:booking_assigned', {
            detail: { bookingId: booking.id, helper },
          })
        );
      }

      setAssignmentSuccessMsg(
        `✓ ${helper.name} successfully assigned to Booking #${booking.id}! Customer notified.`
      );
      setTimeout(() => setAssignmentSuccessMsg(''), 6000);
    } catch (err) {
      console.error('Manual assignment error:', err);
      alert('Could not update booking status. Please try again.');
    } finally {
      setAssigningId(null);
    }
  };

  // Helper options for a booking: verified helpers in city / category (even if offline)
  const getEligibleHelpersForBooking = (b: Booking): Worker[] => {
    const srv = (b.service || '').toLowerCase();
    const city = (b.area || '').toLowerCase();

    // Prioritize verified helpers in that category
    let matches = workers.filter((w) => {
      const wSrv = (w.service_category || w.service || '').toLowerCase();
      const isVer = w.verification_status === 'verified' && (w.verified === true || w.is_verified === true);
      return isVer && (wSrv === srv || srv.includes(wSrv) || wSrv.includes(srv));
    });

    // If no exact category match, show all verified helpers so admin has options
    if (matches.length === 0) {
      matches = workers.filter(
        (w) => w.verification_status === 'verified' && (w.verified === true || w.is_verified === true)
      );
    }

    return matches;
  };

  // Filter Bookings Tab
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter !== 'all' && b.status !== bookingFilter) return false;
    if (!bookingSearch.trim()) return true;
    const q = bookingSearch.toLowerCase();
    return (
      b.id.toLowerCase().includes(q) ||
      (b.customerName || '').toLowerCase().includes(q) ||
      b.workerName.toLowerCase().includes(q) ||
      b.area.toLowerCase().includes(q) ||
      b.service.toLowerCase().includes(q)
    );
  });

  // Filter Helpers Tab
  const filteredWorkers = workers.filter((w) => {
    if (workerFilterCategory !== 'all') {
      const srv = (w.service_category || w.service || '').toLowerCase();
      if (srv !== workerFilterCategory) return false;
    }
    if (!workerSearch.trim()) return true;
    const q = workerSearch.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      (w.primary_area || w.area || '').toLowerCase().includes(q) ||
      (w.phone || '').includes(q) ||
      (w.service_category || w.service || '').toLowerCase().includes(q)
    );
  });

  // Save Add Helper Manually
  const handleCreateHelper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHelper.name.trim() || !newHelper.phone.trim()) {
      alert('Please fill in helper name and phone number.');
      return;
    }

    const helperId = ensureValidUuid();
    const helperPayload = {
      id: helperId,
      full_name: newHelper.name.trim(),
      phone: newHelper.phone.trim(),
      service_category: newHelper.service,
      primary_area: newHelper.primary_area,
      serviceable_areas: newHelper.serviceable_areas,
      price_per_visit: Number(newHelper.pricePerVisit) || 200,
      experience_years: Number(newHelper.experienceYears) || 3,
      is_online: newHelper.online,
      is_verified: false,
      verification_status: 'unsubmitted' as const,
      rating: 5.0,
      jobs_count: 0,
      avatar_color: 'bg-brand-600',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save directly to Supabase public.helpers table
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: insErr } = await supabase.from('helpers').insert([helperPayload]);
        if (insErr) {
          console.error('Supabase helpers insert error:', insErr.message);
          if (insErr.code === '23505') {
            await supabase.from('helpers').upsert(helperPayload);
          }
        }
      } catch (err) {
        console.warn('Supabase helper insert error:', err);
      }
    }

    const createdHelper: Worker = {
      id: helperId,
      name: newHelper.name.trim(),
      phone: newHelper.phone.trim(),
      service: newHelper.service as any,
      service_category: newHelper.service,
      primary_area: newHelper.primary_area,
      serviceable_areas: newHelper.serviceable_areas,
      area: newHelper.primary_area,
      city: 'Deoria',
      pricePerVisit: Number(newHelper.pricePerVisit) || 200,
      experienceYears: Number(newHelper.experienceYears) || 3,
      rating: 5.0,
      jobs: 0,
      online: newHelper.online,
      is_online: newHelper.online,
      verified: false,
      is_verified: false,
      verification_status: 'unsubmitted',
      avatarColor: 'bg-brand-600',
      isRealPartner: true,
      badgeTag: 'KYC Pending',
    };

    addWorker(createdHelper);
    setShowAddWorkerModal(false);
    setNewHelper({
      name: '',
      phone: '',
      service: 'cook',
      primary_area: 'Raghav Nagar',
      serviceable_areas: ['Raghav Nagar', 'Civil Lines'],
      pricePerVisit: 200,
      experienceYears: 4,
      verified: false,
      online: true,
    });
    alert(`Helper ${createdHelper.name} added successfully!`);
  };

  // Save Edited Helper Areas directly to public.helpers
  const handleSaveWorkerAreas = async () => {
    if (!editingWorker) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editingWorker.id);
        const updatePayload = {
          primary_area: editingWorker.primary_area,
          serviceable_areas: editingWorker.serviceable_areas,
          updated_at: new Date().toISOString(),
        };

        if (isUuid) {
          await supabase.from('helpers').update(updatePayload).eq('id', editingWorker.id);
        } else {
          await supabase.from('helpers').update(updatePayload).eq('phone', editingWorker.phone);
        }
      } catch (err) {
        console.warn('Supabase helpers update error:', err);
      }
    }

    updateWorker(editingWorker);
    setEditingWorker(null);
  };

  // Confirm and Execute Helper Deletion
  const handleConfirmDeleteHelper = async () => {
    if (!deletingWorker) return;

    // 1. Guard check: do not delete helper with active bookings
    const activeBookings = bookings.filter(
      (b) =>
        (b.workerId === deletingWorker.id || b.assigned_helper_id === deletingWorker.id) &&
        ['searching_helper', 'assigned', 'accepted', 'in_progress'].includes(b.status)
    );

    if (activeBookings.length > 0) {
      setDeleteErrorMsg(
        `Cannot remove ${deletingWorker.name}: this helper currently has ${activeBookings.length} active booking(s). Please reassign or complete those bookings first.`
      );
      setTimeout(() => setDeleteErrorMsg(''), 7000);
      setDeletingWorker(null);
      return;
    }

    setIsDeleting(true);

    try {
      // 2. Supabase Delete Logic & RLS support
      if (isSupabaseConfigured && supabase) {
        // Delete from helpers table
        try {
          await supabase.from('helpers').delete().eq('id', deletingWorker.id);
        } catch (err) {
          console.warn('Delete from helpers fallback:', err);
        }

        // Delete from workers table
        try {
          await supabase.from('workers').delete().eq('id', deletingWorker.id);
        } catch (err) {
          console.warn('Delete from workers fallback:', err);
        }

        // Clean up verifications or storage metadata if present
        try {
          await supabase.from('helper_verifications').delete().eq('helper_id', deletingWorker.id);
        } catch (err) {
          console.warn('Delete helper verifications fallback:', err);
        }
      }

      // 3. Update local state immediately
      removeWorker(deletingWorker.id);

      // 4. Success Toast Notification
      setAssignmentSuccessMsg('Helper removed successfully');
      setTimeout(() => setAssignmentSuccessMsg(''), 5000);
      setDeletingWorker(null);
    } catch (err: any) {
      console.error('Failed to remove helper:', err);
      setDeleteErrorMsg(err?.message || 'Failed to remove helper record.');
      setTimeout(() => setDeleteErrorMsg(''), 6000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-10 w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            MadadMitra Platform Operations
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Admin Command Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Priority manual assignment queue, live dispatch monitor, helpers roster, and banner controls
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setView('home')}
            className="btn-ghost text-xs py-2 px-3 border border-slate-200"
          >
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to App
          </button>
          <button
            onClick={() => {
              if (confirm('Sign out of Administrator console?')) {
                setCurrentUser(null);
                setView('home');
              }
            }}
            className="btn-ghost text-xs py-2 px-3 text-rose-600 hover:bg-rose-50 border border-rose-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {assignmentSuccessMsg && (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{assignmentSuccessMsg}</span>
          </div>
          <button
            onClick={() => setAssignmentSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {deleteErrorMsg && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 font-bold text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{deleteErrorMsg}</span>
          </div>
          <button
            onClick={() => setDeleteErrorMsg('')}
            className="text-rose-700 hover:text-rose-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. PRIORITY "NEEDS MANUAL ASSIGNMENT" SECTION (TOP ALERT)            */}
      {/* ==================================================================== */}
      {manualNeededBookings.length > 0 && (
        <div className="mt-6 rounded-3xl border-2 border-rose-400 bg-rose-50/70 p-5 sm:p-6 shadow-md animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/80 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-600 text-white shadow-soft animate-bounce">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-rose-600 text-white font-black text-[10px] tracking-wide uppercase px-2 py-0.5">
                    🚨 URGENT ACTION
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-800">
                    {manualNeededBookings.length} Bookings Failed 3 Auto-Dispatch Attempts
                  </span>
                </div>
                <h2 className="font-display text-lg sm:text-xl font-black text-rose-950 mt-0.5">
                  Priority "Needs Manual Assignment" Queue
                </h2>
              </div>
            </div>
            <p className="text-xs text-rose-800/90 max-w-sm leading-tight">
              These bookings could not be automatically accepted by 3 consecutive helpers. Local coordinator must assign a verified partner now.
            </p>
          </div>

          {/* List of Manual Needed Bookings */}
          <div className="mt-4 space-y-4">
            {manualNeededBookings.map((b) => {
              const eligibleHelpers = getEligibleHelpersForBooking(b);
              const selectedHelperId = selectedHelpers[b.id] || '';

              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-rose-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge bg-slate-900 text-white font-mono text-xs px-2.5 py-0.5 font-bold">
                        {b.id}
                      </span>
                      <span className="badge bg-amber-100 text-amber-900 font-extrabold text-xs">
                        {SERVICE_LABELS[b.service] || b.service}
                      </span>
                      <span className="badge bg-rose-100 text-rose-800 font-bold text-[11px]">
                        Failed 3 Attempts ({b.attempt_count || 3}/3)
                      </span>
                      <span className="text-xs font-black text-slate-900 ml-auto lg:ml-0">
                        ₹{b.totalAmount || 250} (COD / Cash)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <span className="font-semibold">{b.area}</span>
                        {b.address && <span className="text-slate-400">({b.address})</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Customer:</span>
                        <span>{b.customerName || 'Resident'}</span>
                        {b.customerPhone && (
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="inline-flex items-center gap-1 text-brand-600 font-bold hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {b.customerPhone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Manual Assignment Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="relative min-w-[240px]">
                      <select
                        value={selectedHelperId}
                        onChange={(e) =>
                          setSelectedHelpers((prev) => ({
                            ...prev,
                            [b.id]: e.target.value,
                          }))
                        }
                        className="input text-xs font-semibold py-2.5 pl-3 pr-8 w-full bg-slate-50 border-slate-300 rounded-xl"
                      >
                        <option value="">-- Choose Verified Helper --</option>
                        {eligibleHelpers.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} ({h.primary_area || h.area}) — ⭐{h.rating} [{h.online ? 'Online' : 'Offline'}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleAssignHelperManually(b)}
                      disabled={!selectedHelperId || assigningId === b.id}
                      className="btn bg-rose-600 hover:bg-rose-500 text-white py-2.5 px-4 text-xs font-bold rounded-xl shadow-soft disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      {assigningId === b.id ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Assigning...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Assign Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. FULL PLATFORM MANAGEMENT TABS                                    */}
      {/* ==================================================================== */}
      <div className="mt-8 flex gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Overview & KPIs</span>
        </button>

        <button
          onClick={() => setActiveTab('manual_queue')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'manual_queue'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Manual Queue</span>
          {manualNeededBookings.length > 0 && (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white">
              {manualNeededBookings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          <span>All Bookings</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'workers'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Helpers Manager</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
            {workers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('services_banners')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'services_banners'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Services & Banners</span>
        </button>

        <button
          onClick={() => setActiveTab('aadhaar')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'aadhaar'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Aadhaar KYC Review</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: OVERVIEW & KPIS                                               */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="mt-6 space-y-6">
          {/* KPI CARDS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="card p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Bookings
              </span>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                {bookings.length}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Across all Deoria mohallas</p>
            </div>

            <div className="card p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Searching / Active
              </span>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-brand-600">
                {searchingBookings.length + assignedBookings.length}
              </div>
              <p className="mt-1 text-[11px] text-brand-700 font-medium">
                {searchingBookings.length} on radar • {assignedBookings.length} assigned
              </p>
            </div>

            <div className={`card p-4 sm:p-5 ${manualNeededBookings.length > 0 ? 'bg-rose-50/50 border-rose-300' : ''}`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
                Manual Needed
              </span>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-rose-600">
                {manualNeededBookings.length}
              </div>
              <p className="mt-1 text-[11px] text-rose-700 font-semibold">
                {manualNeededBookings.length > 0 ? 'Urgent coordinator action' : 'Queue clear'}
              </p>
            </div>

            <div className="card p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Verified Helpers
              </span>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                {verifiedHelpersCount} <span className="text-sm font-normal text-slate-400">/ {workers.length}</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
                {workers.filter((w) => w.online || w.is_online).length} currently online
              </p>
            </div>

            <div className="card p-4 sm:p-5 col-span-2 lg:col-span-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Convenience Fees
              </span>
              <div className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-emerald-600">
                ₹{totalConvenienceFee}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">₹10 platform fee / booking</p>
            </div>
          </div>

          {/* CATALOG MODE & PLATFORM CONTROLS */}
          <div className="rounded-2xl border-2 border-brand-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      catalogMode === 'verified_only'
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-amber-500'
                    }`}
                  />
                  <h3 className="font-display text-base font-extrabold text-slate-900">
                    Platform Catalog Mode:{' '}
                    {catalogMode === 'verified_only'
                      ? 'Live Production (Aadhaar Verified Partners Only)'
                      : 'Showcase Demo Mode (All Workers)'}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Controls customer-facing worker visibility. When set to Live Production, only helpers verified by government Aadhaar and nodal hardware stores are displayed.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setCatalogMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    catalogMode === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Demo Showcase
                </button>
                <button
                  onClick={() => setCatalogMode('verified_only')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    catalogMode === 'verified_only'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Live Production Only
                </button>
              </div>
            </div>
          </div>

          {/* MOHALLA COVERAGE MATRIX */}
          <div className="card p-5">
            <h3 className="font-display text-base font-extrabold text-slate-900 mb-3">
              Deoria Mohalla Dispatch Coverage Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {DEORIA_LOCALITIES.slice(0, 12).map((loc) => {
                const count = workers.filter((w) => {
                  const pri = (w.primary_area || w.area || '').toLowerCase();
                  const srv = (w.serviceable_areas || []).map((a) => a.toLowerCase());
                  const match = pri.includes(loc.toLowerCase()) || srv.some((a) => a.includes(loc.toLowerCase()));
                  const isVerifiedHelper = w.verification_status === 'verified' && (w.verified === true || w.is_verified === true);
                  return match && isVerifiedHelper && (w.online || w.is_online);
                }).length;

                return (
                  <div
                    key={loc}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800">{loc}</span>
                    <span
                      className={`badge text-[10px] font-bold ${
                        count > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {count > 0 ? `${count} Active` : 'Gated'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MANUAL QUEUE ONLY                                             */}
      {/* ==================================================================== */}
      {activeTab === 'manual_queue' && (
        <div className="mt-6">
          {manualNeededBookings.length === 0 ? (
            <div className="card p-12 text-center space-y-3">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Manual Queue is Currently Empty
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All customer bookings have been matched with verified helpers, assigned, or completed. Whenever an auto-dispatch fails 3 attempts, it will surface here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-bold">
                Showing {manualNeededBookings.length} urgent manual requests
              </p>
              {manualNeededBookings.map((b) => {
                const eligibleHelpers = getEligibleHelpersForBooking(b);
                const selectedHelperId = selectedHelpers[b.id] || '';

                return (
                  <div
                    key={b.id}
                    className="card p-5 border-2 border-rose-300 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="badge bg-rose-600 text-white font-mono text-xs font-bold">
                          {b.id}
                        </span>
                        <span className="badge bg-amber-100 text-amber-900 font-extrabold">
                          {SERVICE_LABELS[b.service] || b.service}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          ₹{b.totalAmount || 250}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        📍 <strong>Area:</strong> {b.area} • <strong>Customer:</strong> {b.customerName} ({b.customerPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedHelperId}
                        onChange={(e) =>
                          setSelectedHelpers((prev) => ({
                            ...prev,
                            [b.id]: e.target.value,
                          }))
                        }
                        className="input text-xs py-2"
                      >
                        <option value="">-- Select Helper --</option>
                        {eligibleHelpers.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} ({h.primary_area}) - ⭐{h.rating} [{h.online ? 'Online' : 'Offline'}]
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignHelperManually(b)}
                        disabled={!selectedHelperId || assigningId === b.id}
                        className="btn bg-rose-600 hover:bg-rose-500 text-white py-2 px-4 text-xs font-bold rounded-xl whitespace-nowrap"
                      >
                        Assign Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: ALL BOOKINGS WITH STATUS CONTROLS                            */}
      {/* ==================================================================== */}
      {activeTab === 'bookings' && (
        <div className="mt-6 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(
                [
                  ['all', `All (${bookings.length})`],
                  ['searching_helper', `Searching (${searchingBookings.length})`],
                  ['manual_needed', `Manual (${manualNeededBookings.length})`],
                  ['assigned', `Assigned (${assignedBookings.length})`],
                  ['completed', `Done (${completedBookings.length})`],
                  ['cancelled', `Cancelled (${cancelledBookings.length})`],
                ] as const
              ).map(([fKey, fLabel]) => (
                <button
                  key={fKey}
                  onClick={() => setBookingFilter(fKey as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bookingFilter === fKey
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {fLabel}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, name, area..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="input pl-9 py-2 text-xs"
              />
            </div>
          </div>

          {/* Bookings Table */}
          {filteredBookings.length === 0 ? (
            <div className="card p-12 text-center text-slate-500 text-xs">
              No bookings matching this filter.
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Customer & Area</th>
                    <th className="px-4 py-3">Assigned Helper</th>
                    <th className="px-4 py-3">Amount & Fee</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">
                        {b.id}
                        {b.startJobOtp && (
                          <span className="block text-[10px] text-amber-700 font-semibold">
                            OTP: {b.startJobOtp}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {SERVICE_LABELS[b.service] || b.service}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{b.customerName || 'Customer'}</div>
                        <div className="text-[11px] text-slate-500">📍 {b.area}</div>
                      </td>
                      <td className="px-4 py-3">
                        {b.workerName ? (
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <span>{b.workerName}</span>
                            <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="font-bold text-slate-900">₹{b.totalAmount || 250}</div>
                        <div className="text-[10px] text-brand-600">₹{b.fee || 10} fee</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge text-[10px] font-bold ${
                            b.status === 'assigned' || b.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'manual_needed'
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : b.status === 'searching_helper'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : b.status === 'completed'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status !== 'completed' && b.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                const updated: Booking = { ...b, status: 'completed' };
                                updateBooking(updated);
                              }}
                              className="btn py-1 px-2 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg"
                            >
                              Mark Done
                            </button>
                          )}
                          {b.status !== 'cancelled' && b.status !== 'completed' && (
                            <button
                              onClick={() => {
                                if (confirm(`Cancel booking ${b.id}?`)) {
                                  const updated: Booking = { ...b, status: 'cancelled' };
                                  updateBooking(updated);
                                }
                              }}
                              className="btn py-1 px-2 text-[10px] font-bold bg-slate-50 text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: HELPERS MANAGER                                               */}
      {/* ==================================================================== */}
      {activeTab === 'workers' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search helper name, area..."
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  className="input pl-9 py-2 text-xs"
                />
              </div>

              <select
                value={workerFilterCategory}
                onChange={(e) => setWorkerFilterCategory(e.target.value)}
                className="input py-2 text-xs bg-white"
              >
                <option value="all">All Service Categories</option>
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleRefreshHelpers}
                disabled={refreshingHelpers}
                className="btn py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                title="Refresh helpers directly from Supabase"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshingHelpers ? 'animate-spin text-brand-600' : 'text-slate-500'}`} />
                <span>{refreshingHelpers ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <button
                onClick={() => setShowAddWorkerModal(true)}
                className="btn-primary py-2 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-soft"
              >
                <PlusCircle className="h-4 w-4" />
                <span>+ Add Helper Manually</span>
              </button>
            </div>
          </div>

          {/* Helpers Roster Table */}
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Helper</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Primary & Serviceable Areas</th>
                  <th className="px-4 py-3">Price/Visit</th>
                  <th className="px-4 py-3">Online Status</th>
                  <th className="px-4 py-3">KYC Verified</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkers.map((w) => {
                  const isVer = w.verification_status === 'verified' && (w.verified === true || w.is_verified === true);
                  const isOnline = w.online || w.is_online;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                              w.avatarColor || 'bg-brand-600'
                            } text-white font-bold text-xs`}
                          >
                            {w.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              <span>{w.name}</span>
                              {isVer && <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ⭐ {w.rating || 5.0} • {w.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {SERVICE_LABELS[w.service] || w.service}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">
                          {w.primary_area || w.area || 'Deoria'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                          {(w.serviceable_areas || [w.area || 'Deoria']).join(', ')}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        ₹{w.pricePerVisit || 200}
                      </td>

                      {/* Online Toggle */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleWorkerOnline(w.id)}
                          className={`badge cursor-pointer px-2.5 py-1 text-[10px] font-bold ${
                            isOnline
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full mr-1.5 inline-block ${
                              isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {isOnline ? 'Online' : 'Offline'}
                        </button>
                      </td>

                      {/* Verified Toggle */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleWorkerVerified(w.id)}
                          className={`badge cursor-pointer px-2.5 py-1 text-[10px] font-bold ${
                            isVer
                              ? 'bg-brand-100 text-brand-800'
                              : w.verification_status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isVer
                            ? 'Verified'
                            : w.verification_status === 'pending'
                            ? 'KYC Pending'
                            : w.verification_status === 'rejected'
                            ? 'KYC Rejected'
                            : 'Unsubmitted'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingWorker(w)}
                            className="btn py-1 px-2.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg inline-flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit Areas</span>
                          </button>
                          <button
                            onClick={() => setDeletingWorker(w)}
                            className="btn py-1 px-2.5 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="Remove Helper"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: SERVICES & BANNERS                                            */}
      {/* ==================================================================== */}
      {activeTab === 'services_banners' && (
        <div className="mt-6 space-y-8">
          {/* SECTION 1: HOMEPAGE PROMOTIONAL CAROUSEL BANNERS */}
          <div className="card p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  Homepage Promotional Carousel Banners
                </h3>
                <p className="text-xs text-slate-500">
                  Manage active banner slides, discount promo codes, and CTA triggers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    b.active ? 'border-brand-300 bg-brand-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="badge bg-slate-900 text-white font-black text-[10px]">
                      {b.label}
                    </span>
                    <button
                      onClick={() =>
                        setBanners((prev) =>
                          prev.map((x) => (x.id === b.id ? { ...x, active: !x.active } : x))
                        )
                      }
                      className={`badge text-[10px] font-bold cursor-pointer ${
                        b.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {b.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2">{b.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{b.subtitle}</p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-brand-600">
                      Code: {b.promoCode || 'None'}
                    </span>
                    <button
                      onClick={() => setEditingBanner(b)}
                      className="text-xs font-bold text-slate-700 hover:text-brand-600 underline"
                    >
                      Edit Content
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: SERVICE CATEGORIES & PRICING */}
          <div className="card p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  Service Categories & Pricing Controls
                </h3>
                <p className="text-xs text-slate-500">
                  Configure standard service rates, visiting fees, and platform convenience fee
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SERVICES.map((srv) => (
                <div key={srv.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{srv.title}</h4>
                    <span className="badge bg-emerald-50 text-emerald-700 text-[10px] font-bold">Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{srv.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Base Price:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold">₹</span>
                      <input
                        type="number"
                        value={servicePricing[srv.id] || 200}
                        onChange={(e) =>
                          setServicePricing((prev) => ({
                            ...prev,
                            [srv.id]: Number(e.target.value),
                          }))
                        }
                        className="input py-1 px-2 w-20 text-xs font-bold font-mono text-right"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: AADHAAR KYC DOCUMENT REVIEW                                   */}
      {/* ==================================================================== */}
      {activeTab === 'aadhaar' && (
        <div className="mt-6">
          <AdminVerificationPanel />
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT HELPER PRIMARY & SERVICEABLE AREAS                       */}
      {/* ==================================================================== */}
      {editingWorker && (
        <Modal
          open={!!editingWorker}
          onClose={() => setEditingWorker(null)}
          title={`Edit Areas — ${editingWorker.name}`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Primary Base Operating Area (Mohalla):
              </label>
              <select
                value={editingWorker.primary_area || editingWorker.area || 'Raghav Nagar'}
                onChange={(e) =>
                  setEditingWorker({
                    ...editingWorker,
                    primary_area: e.target.value,
                    area: e.target.value,
                  })
                }
                className="input text-xs"
              >
                {DEORIA_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Serviceable Localities in Deoria:
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs">
                {DEORIA_LOCALITIES.map((loc) => {
                  const currentAreas = editingWorker.serviceable_areas || [editingWorker.area || 'Deoria'];
                  const isChecked = currentAreas.includes(loc);

                  return (
                    <label key={loc} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingWorker({
                              ...editingWorker,
                              serviceable_areas: [...currentAreas, loc],
                            });
                          } else {
                            setEditingWorker({
                              ...editingWorker,
                              serviceable_areas: currentAreas.filter((a) => a !== loc),
                            });
                          }
                        }}
                        className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                      />
                      <span>{loc}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingWorker(null)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWorkerAreas}
                className="btn-primary text-xs py-2 px-5 font-bold"
              >
                Save Area Settings
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD HELPER MANUALLY                                           */}
      {/* ==================================================================== */}
      {showAddWorkerModal && (
        <Modal
          open={showAddWorkerModal}
          onClose={() => setShowAddWorkerModal(false)}
          title="+ Add Service Helper Manually"
        >
          <form onSubmit={handleCreateHelper} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar Prajapati"
                value={newHelper.name}
                onChange={(e) => setNewHelper({ ...newHelper, name: e.target.value })}
                className="input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={newHelper.phone}
                  onChange={(e) => setNewHelper({ ...newHelper, phone: e.target.value })}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Service Category</label>
                <select
                  value={newHelper.service}
                  onChange={(e) => setNewHelper({ ...newHelper, service: e.target.value })}
                  className="input text-xs"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Primary Area</label>
                <select
                  value={newHelper.primary_area}
                  onChange={(e) =>
                    setNewHelper({
                      ...newHelper,
                      primary_area: e.target.value,
                      serviceable_areas: Array.from(new Set([...newHelper.serviceable_areas, e.target.value])),
                    })
                  }
                  className="input text-xs"
                >
                  {DEORIA_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Rate per Visit (₹)</label>
                <input
                  type="number"
                  value={newHelper.pricePerVisit}
                  onChange={(e) => setNewHelper({ ...newHelper, pricePerVisit: Number(e.target.value) })}
                  className="input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={newHelper.verified}
                  onChange={(e) => setNewHelper({ ...newHelper, verified: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <span>KYC Verified Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={newHelper.online}
                  onChange={(e) => setNewHelper({ ...newHelper, online: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <span>Available Online Now</span>
              </label>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddWorkerModal(false)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold">
                Save & Add Partner
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT PROMO BANNER CONTENT                                     */}
      {/* ==================================================================== */}
      {editingBanner && (
        <Modal
          open={!!editingBanner}
          onClose={() => setEditingBanner(null)}
          title={`Edit Banner — ${editingBanner.label}`}
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Main Headline</label>
              <input
                type="text"
                value={editingBanner.title}
                onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                className="input text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subtext / Details</label>
              <input
                type="text"
                value={editingBanner.subtitle}
                onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                className="input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Promo Code</label>
                <input
                  type="text"
                  value={editingBanner.promoCode || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, promoCode: e.target.value })}
                  className="input text-xs uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Button CTA</label>
                <input
                  type="text"
                  value={editingBanner.cta}
                  onChange={(e) => setEditingBanner({ ...editingBanner, cta: e.target.value })}
                  className="input text-xs"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setBanners((prev) =>
                    prev.map((x) => (x.id === editingBanner.id ? editingBanner : x))
                  );
                  setEditingBanner(null);
                }}
                className="btn-primary text-xs py-2 px-5 font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CONFIRM DELETE HELPER                                         */}
      {/* ==================================================================== */}
      {deletingWorker && (
        <Modal
          open={!!deletingWorker}
          onClose={() => !isDeleting && setDeletingWorker(null)}
          title="Confirm Helper Removal"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-950 text-xs">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-rose-900">
                  Are you sure you want to remove {deletingWorker.name}? This action cannot be undone.
                </p>
                <p className="mt-1 text-slate-600 text-xs leading-relaxed">
                  All database records, KYC verifications, and partner links for this helper will be permanently removed from the system.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Service Category:</span>
                <span className="font-bold text-slate-900">
                  {SERVICE_LABELS[deletingWorker.service] || deletingWorker.service}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-900">{deletingWorker.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Area:</span>
                <span className="font-semibold text-slate-900">
                  {deletingWorker.primary_area || deletingWorker.area || 'Deoria'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingWorker(null)}
                className="btn-ghost text-xs py-2 px-4 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteHelper}
                className="btn bg-rose-600 hover:bg-rose-500 text-white text-xs py-2 px-4 font-bold rounded-xl shadow-soft flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Yes, Remove Helper</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
