import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  MapPin,
  Phone,
  Star,
  Clock,
  X,
  Lock,
  Timer,
  AlertCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import {
  initiateAutoDispatch,
  handleHelperDeclineOrTimeout,
  type DispatchInitiationResult,
} from '../services/dispatchService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Booking, ServiceId, Worker } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  serviceCategory?: string;
  areaName: string;
  totalBill: number;
}

export const DispatchRadarModal: React.FC<Props> = ({
  open,
  onClose,
  serviceName,
  serviceCategory,
  areaName,
  totalBill,
}) => {
  const { language } = useLanguage();
  const { workers, currentUser, addBooking } = useApp();
  const isHi = language === 'hi';

  const [phase, setPhase] = useState<'scanning' | 'offer_made' | 'assigned' | 'manual_needed'>('scanning');
  const [dispatchResult, setDispatchResult] = useState<DispatchInitiationResult | null>(null);
  const [matchedHelper, setMatchedHelper] = useState<Worker | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);

  const startOtp = '4821';
  const cleanArea = areaName.replace(/\(coming soon\)/i, '').trim();
  const activeBookingIdRef = useRef<string | null>(null);
  const matchedHelperRef = useRef<Worker | null>(null);
  matchedHelperRef.current = matchedHelper;

  useEffect(() => {
    if (!open) {
      setPhase('scanning');
      setDispatchResult(null);
      setMatchedHelper(null);
      setSecondsRemaining(120);
      activeBookingIdRef.current = null;
      return;
    }

    let active = true;

    // Step 1: Initiate auto-dispatch matching
    const srvCat = (serviceCategory || serviceName).toLowerCase();
    initiateAutoDispatch({
      serviceCategory: srvCat,
      customerArea: cleanArea,
      totalAmount: totalBill,
      customerName: currentUser?.fullName,
      customerPhone: currentUser?.phone,
      localWorkers: workers,
    }).then((res) => {
      if (!active) return;
      setDispatchResult(res);
      activeBookingIdRef.current = res.bookingId;

      if (res.status === 'searching_helper' && res.assigned_helper) {
        setMatchedHelper(res.assigned_helper);

        // Record initial booking in state
        const newBooking: Booking = {
          id: res.bookingId,
          bookingCode: `MM-${Date.now().toString().slice(-6)}`,
          workerName: res.assigned_helper.name,
          workerId: res.assigned_helper.id,
          service: (serviceCategory || 'cook') as ServiceId,
          date: 'Today',
          time: 'Immediate Express Dispatch',
          status: 'searching_helper',
          paymentStatus: 'paid_cash_cod',
          fee: 15,
          totalAmount: totalBill,
          area: cleanArea,
          address: `Residential location in ${cleanArea}`,
          assigned_helper_id: null,
          current_offer_helper_id: res.current_offer_helper_id,
          offer_expires_at: res.offer_expires_at,
          attempt_count: res.attempt_count,
          rejected_helper_ids: res.rejected_helper_ids,
          startJobOtp: startOtp,
          endJobOtp: '9134',
        };
        addBooking(newBooking);

        // Transition from initial radar pulse to offer active
        setTimeout(() => {
          if (active) setPhase('offer_made');
        }, 1800);
      } else {
        setTimeout(() => {
          if (active) setPhase('manual_needed');
        }, 1500);
      }
    });

    return () => {
      active = false;
    };
  }, [open, cleanArea, serviceCategory, serviceName, totalBill, workers, currentUser]);

  // Real-time listener for booking status changes
  useEffect(() => {
    if (!open || !dispatchResult?.bookingId) return;

    const bId = dispatchResult.bookingId;
    let channel: any = null;

    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel(`booking_updates:${bId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `id=eq.${bId}`,
          },
          (payload) => {
            const row = payload.new as any;
            if (!row) return;

            if (row.status === 'assigned') {
              setPhase('assigned');
              if (row.worker_id || row.assigned_helper_id) {
                const helper = workers.find((w) => w.id === (row.assigned_helper_id || row.worker_id));
                if (helper) setMatchedHelper(helper);
              }
            } else if (row.status === 'manual_needed') {
              setPhase('manual_needed');
            } else if (row.status === 'searching_helper') {
              setPhase('offer_made');
              setSecondsRemaining(120);
              const nextHelper = workers.find((w) => w.id === row.current_offer_helper_id);
              if (nextHelper) setMatchedHelper(nextHelper);
              setDispatchResult((prev) => prev ? {
                ...prev,
                attempt_count: row.attempt_count || prev.attempt_count + 1,
                current_offer_helper_id: row.current_offer_helper_id,
              } : null);
            }
          }
        )
        .on('broadcast', { event: 'booking_assigned' }, (payload) => {
          setPhase('assigned');
          if (payload.payload?.helperId) {
            const h = workers.find((w) => w.id === payload.payload.helperId);
            if (h) setMatchedHelper(h);
          }
        })
        .on('broadcast', { event: 'booking_status_changed' }, (payload) => {
          if (payload.payload?.status === 'manual_needed') {
            setPhase('manual_needed');
          }
        })
        .subscribe();
    }

    // Window event listeners for local / instant updates
    const handleAssignedEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.bookingId === bId) {
        setPhase('assigned');
        if (detail.helper) {
          setMatchedHelper(detail.helper);
        }
      }
    };

    const handleStatusUpdateEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.bookingId === bId) {
        if (detail.status === 'assigned') {
          setPhase('assigned');
          if (detail.helper) setMatchedHelper(detail.helper);
        } else if (detail.status === 'manual_needed') {
          setPhase('manual_needed');
        } else if (detail.status === 'searching_helper') {
          setPhase('offer_made');
          setSecondsRemaining(120);
          if (detail.candidate) setMatchedHelper(detail.candidate);
          setDispatchResult((prev) => prev ? {
            ...prev,
            attempt_count: detail.attempt_count || prev.attempt_count + 1,
          } : null);
        }
      }
    };

    window.addEventListener('madadmitra:booking_assigned', handleAssignedEvent);
    window.addEventListener('madadmitra:booking_status_updated', handleStatusUpdateEvent);

    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
      window.removeEventListener('madadmitra:booking_assigned', handleAssignedEvent);
      window.removeEventListener('madadmitra:booking_status_updated', handleStatusUpdateEvent);
    };
  }, [open, dispatchResult?.bookingId, workers]);

  // 2-Minute Countdown Timer for offer_expires_at with auto-timeout cascade
  useEffect(() => {
    if (phase !== 'offer_made') return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // 2-Minute Window Expired: Cascade to next helper
          const bId = activeBookingIdRef.current;
          const currentH = matchedHelperRef.current;
          if (bId && currentH) {
            handleHelperDeclineOrTimeout(bId, currentH.id, {
              serviceCategory: (serviceCategory || serviceName).toLowerCase(),
              customerArea: cleanArea,
              localWorkers: workers,
            }).then((nextRes) => {
              setDispatchResult(nextRes);
              if (nextRes.status === 'searching_helper' && nextRes.assigned_helper) {
                setMatchedHelper(nextRes.assigned_helper);
                setSecondsRemaining(120);
                setPhase('offer_made');
              } else {
                setPhase('manual_needed');
              }
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, serviceCategory, serviceName, cleanArea, workers]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border-2 border-slate-200 shadow-elevated p-5 sm:p-8 text-slate-900 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* PHASE 1: SCANNING FOR NEAREST HELPER */}
        {phase === 'scanning' && (
          <div className="py-8 text-center space-y-6">
            <div className="relative mx-auto h-40 w-40 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-brand-400 animate-ping opacity-60" />
              <div className="absolute inset-4 rounded-full border border-brand-500 animate-pulse opacity-80" />
              <div className="absolute inset-10 rounded-full bg-brand-500/10" />

              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-white shadow-elevated z-10 animate-bounce">
                <MapPin className="h-8 w-8" />
              </div>
            </div>

            <div>
              <span className="badge bg-brand-50 text-brand-700 font-bold tracking-wider text-xs px-3 py-1 mb-2">
                {isHi ? 'निकटतम हेल्पर एल्गोरिदम सक्रिय' : 'NEAREST HELPER AUTO-DISPATCH'}
              </span>
              <h2 className="font-display text-2xl font-black text-slate-950">
                {isHi ? `${cleanArea} में निकटतम सत्यापित सहायक खोज रहे हैं...` : 'Finding the nearest verified helper in your area...'}
              </h2>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-brand-600 bg-brand-50/70 border border-brand-200 py-1.5 px-3 rounded-full w-fit mx-auto">
                <span className="h-2 w-2 rounded-full bg-brand-600 animate-ping" />
                <span>
                  {isHi
                    ? `निकटवर्ती पार्टनर्स की जांच जारी है (प्रयास ${dispatchResult?.attempt_count || 1}/3)...`
                    : `Checking nearby partners (Attempt ${dispatchResult?.attempt_count || 1} of 3)...`}
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                {isHi
                  ? 'प्राथमिक क्षेत्र और GPS दूरी के आधार पर ऑनलाइन व सत्यापित सहायकों को आर्डर भेजा जा रहा है।'
                  : 'Prioritizing helpers by primary area, verified status, and GPS coordinates within 2.5 km.'}
              </p>
            </div>
          </div>
        )}

        {/* PHASE 2: OFFER MADE (Awaiting helper confirmation with 2-min timer) */}
        {phase === 'offer_made' && matchedHelper && (
          <div className="space-y-5 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="badge bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 px-3 py-0.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{isHi ? 'ऑफर भेजा गया (प्रतीक्षा जारी)' : 'Offer Sent • Reserving Helper'}</span>
                </span>
                <h3 className="font-display text-xl font-black text-slate-950 mt-1">
                  {isHi ? 'आपके इलाके में निकटतम सत्यापित सहायक खोज रहे हैं...' : 'Finding the nearest verified helper in your area...'}
                </h3>
                <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>
                    {isHi
                      ? `निकटवर्ती पार्टनर्स की जांच जारी है (प्रयास ${dispatchResult?.attempt_count || 1}/3)`
                      : `Checking nearby partners (Attempt ${dispatchResult?.attempt_count || 1} of 3)`}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2-Min Accept Window</span>
                <span className="text-xl font-mono font-black text-amber-600 flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {formatCountdown(secondsRemaining)}
                </span>
              </div>
            </div>

            {/* Candidate Helper Card */}
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-4 space-y-3">
              <div className="flex items-center gap-3.5">
                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
                    matchedHelper.avatarColor || 'bg-brand-600'
                  } text-white font-extrabold text-xl shadow-soft`}
                >
                  {matchedHelper.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-slate-950 text-base flex items-center gap-1.5">
                    <span>{matchedHelper.name}</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {matchedHelper.rating || 5.0}
                    </span>
                    <span>•</span>
                    <span>{matchedHelper.jobs || 18} Mohalla Visits</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                    <span className="badge bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5">
                      ✓ Primary Area: {matchedHelper.primary_area || cleanArea}
                    </span>
                    {dispatchResult?.distanceKm !== undefined && (
                      <span className="text-slate-500">
                        📍 ~{dispatchResult.distanceKm} km away
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 shrink-0 animate-spin" />
                <span>
                  {isHi
                    ? `सहायक को 2 मिनट के लिए सुरक्षित रखा गया है। स्वीकृति की प्रतीक्षा की जा रही है...`
                    : `Offer dispatched exclusively to ${matchedHelper.name}. Helper is reviewing to accept...`}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px]">Estimated Bill:</span>
                <p className="font-extrabold text-slate-900 text-base">₹{totalBill} (Pay Cash/UPI)</p>
              </div>
              <span className="badge bg-brand-100 text-brand-800 font-bold">
                Attempt #{dispatchResult?.attempt_count || 1} of 3
              </span>
            </div>
          </div>
        )}

        {/* PHASE 3: HELPER ASSIGNED & EN-ROUTE */}
        {phase === 'assigned' && matchedHelper && (
          <div className="space-y-5 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="badge bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 px-3 py-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{isHi ? 'कारीगर ने काम स्वीकार किया' : 'Job Accepted • Helper Assigned'}</span>
                </span>
                <h3 className="font-display text-xl font-black text-slate-950 mt-1">
                  {serviceName}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Arrival</span>
                <span className="text-xl font-black text-brand-600 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  ~18 mins
                </span>
              </div>
            </div>

            {/* Assigned Helper Card */}
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
                    matchedHelper.avatarColor || 'bg-brand-600'
                  } text-white font-extrabold text-xl shadow-soft`}
                >
                  {matchedHelper.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 text-base flex items-center gap-1.5">
                    <span>{matchedHelper.name}</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {matchedHelper.rating || 5.0}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">Aadhaar Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    📍 {matchedHelper.primary_area || cleanArea} • {matchedHelper.phone || '94500 00000'}
                  </p>
                </div>
              </div>

              {matchedHelper.phone && (
                <a
                  href={`tel:${matchedHelper.phone}`}
                  className="btn bg-emerald-600 hover:bg-emerald-500 text-white h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-soft active:scale-95"
                  aria-label="Call helper"
                >
                  <Phone className="h-5 w-5" />
                </a>
              )}
            </div>

            {/* SafeStart Start-Job OTP Card */}
            <div className="rounded-2xl bg-slate-950 text-white p-4 space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  SafeStart™ Service Code (Start OTP)
                </span>
                <span className="badge bg-amber-400/20 text-amber-300 text-[10px]">
                  {isHi ? 'कारीगर को बताएं' : 'Share on arrival'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="font-mono text-3xl font-black text-amber-400 tracking-widest">{startOtp}</span>
                <p className="text-[11px] text-slate-300 max-w-[180px] leading-tight text-right">
                  {isHi
                    ? 'कारीगर के घर पहुँचने पर यह कोड बताएं ताकि काम शुरू हो सके।'
                    : 'Helper will input this 4-digit code to start the service session.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px]">Total Transparent Amount:</span>
                <p className="font-extrabold text-slate-900 text-base">₹{totalBill} (Pay Cash/UPI after work)</p>
              </div>
              <span className="badge bg-emerald-100 text-emerald-800 font-bold">Direct To Helper</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `*MadadMitra Dispatch Update!*\n` +
                    `• Service: ${serviceName}\n` +
                    `• Helper: ${matchedHelper.name} (Arriving in ~18 mins)\n` +
                    `• Start OTP: ${startOtp}\n` +
                    `• Bill: ₹${totalBill} (Pay after service)`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }}
                className="btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 sm:py-3 px-4 rounded-xl text-xs flex-1 flex items-center justify-center gap-2 shadow-soft min-h-[44px] active:scale-95 cursor-pointer"
              >
                <span>📲 Share ETA on WhatsApp</span>
              </button>
              <button
                onClick={onClose}
                className="btn-primary py-3.5 sm:py-3 px-5 text-xs font-bold min-h-[44px] active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* PHASE 4: MANUAL NEEDED (High Demand / Fallback after 3 attempts or no partners) */}
        {phase === 'manual_needed' && (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700 shadow-soft">
              <AlertCircle className="h-7 w-7 text-amber-700" />
            </div>
            <span className="badge bg-amber-100 text-amber-900 font-bold text-xs">
              {isHi ? 'स्थिति: मैन्युअल असाइनमेंट जारी' : 'Status: Manual Assignment in Progress'}
            </span>
            <h3 className="font-display text-xl font-bold text-slate-950">
              {isHi
                ? 'आपके क्षेत्र में भारी मांग है'
                : 'High Demand in Your Area'}
            </h3>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-sm font-semibold leading-relaxed max-w-md mx-auto">
              <p>
                {isHi
                  ? 'आपके क्षेत्र में भारी मांग है — हमारी टीम जल्द ही आपके लिए एक सत्यापित पार्टनर को मैन्युअल रूप से असाइन कर रही है।'
                  : 'High demand in your area — our team is manually assigning a verified partner for you shortly.'}
              </p>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {isHi
                ? 'हमारा देवरिया क्षेत्रीय नोडल केंद्र तुरंत उपलब्ध सबसे नजदीकी मिस्त्री से संपर्क कर रहा है। आपको जल्द ही कॉल या एसएमएस प्राप्त होगा।'
                : 'Our Deoria nodal team is directly coordinating with nearby partners. You will receive an SMS/call confirmation shortly.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <a
                href="tel:9450000000"
                className="btn bg-amber-400 hover:bg-amber-300 text-slate-950 py-3 px-5 text-xs font-bold rounded-xl shadow-soft flex items-center justify-center gap-1.5"
              >
                <Phone className="h-4 w-4" />
                <span>Call Deoria Helpdesk (+91 94500 00000)</span>
              </a>
              <button
                onClick={onClose}
                className="btn-primary py-3 px-6 text-xs font-bold rounded-xl shadow-soft"
              >
                Understood, Keep Me Updated
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatchRadarModal;
