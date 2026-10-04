import { useState } from 'react';
import {
  CalendarCheck,
  MapPin,
  Clock,
  Star,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Phone,
  ShieldCheck,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SERVICE_LABELS } from '../data/mockData';
import type { Booking } from '../types';
import Modal from './Modal';

const statusStyle: Record<Booking['status'], string> = {
  upcoming: 'bg-brand-50 text-brand-700 border-brand-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  disputed: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function BookingsView() {
  const { bookings, cancelBooking, addBooking, setView } = useApp();
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [activeCallModal, setActiveCallModal] = useState<Booking | null>(null);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<Booking | null>(null);
  const [ratedBookings, setRatedBookings] = useState<Record<string, number>>({});
  const [ratingTarget, setRatingTarget] = useState<Booking | null>(null);
  const [selectedRating, setSelectedRating] = useState(5);

  const filtered = bookings.filter((b) => b.status === tab);

  const confirmCancel = () => {
    if (cancelTarget) {
      cancelBooking(cancelTarget.id);
      setCancelTarget(null);
    }
  };

  const markCompleted = (booking: Booking) => {
    cancelBooking(booking.id);
    addBooking({
      ...booking,
      id: `MM-done-${Date.now()}`,
      status: 'completed',
    });
  };

  const handleRateSubmit = () => {
    if (ratingTarget) {
      setRatedBookings((prev) => ({ ...prev, [ratingTarget.id]: selectedRating }));
      setRatingTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <CalendarCheck className="h-3.5 w-3.5" />
            MadadMitra Real-Time Booking Tracker
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Bookings
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage your service appointments, track assigned helpers, and view invoices
          </p>
        </div>
        <button onClick={() => setView('home')} className="btn-ghost text-xs">
          <ArrowRight className="h-4 w-4 rotate-180" /> Home
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1.5 rounded-2xl bg-slate-100 p-1.5">
        {(['upcoming', 'completed', 'cancelled'] as const).map((t) => {
          const count = bookings.filter((b) => b.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold capitalize transition-all ${
                tab === t
                  ? 'bg-white text-slate-900 shadow-soft'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t} ({count})
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      <div className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <CalendarCheck className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-bold text-slate-800 text-lg">No {tab} bookings found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
              Book a verified cook, cleaner, or electrician in your area with flat ₹10 fee.
            </p>
            <button onClick={() => setView('home')} className="btn-primary mt-5 text-xs py-2.5 px-6">
              Find a Helper
            </button>
          </div>
        ) : (
          filtered.map((b) => {
            const mockOtp = (Math.abs(b.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000)) % 9000 + 1000).toString();
            return (
              <div key={b.id} className="card p-5 sm:p-6 border border-slate-200 hover:border-slate-300 transition-all">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      ID: {b.id}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-600">
                      {SERVICE_LABELS[b.service]}
                    </span>
                  </div>
                  <span className={`badge self-start sm:self-auto border px-3 py-1 font-bold ${statusStyle[b.status]}`}>
                    {b.status.toUpperCase()}
                  </span>
                </div>

                {/* Worker Profile row */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white font-extrabold text-xl shadow-soft">
                      {b.workerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-bold text-slate-900 text-lg">
                          {b.workerName}
                        </h3>
                        <BadgeCheck className="h-4 w-4 text-brand-600" />
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          Aadhaar Verified
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="h-3.5 w-3.5 text-brand-600" /> {b.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-brand-600" /> {b.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-brand-600" /> {b.area}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for upcoming */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <p className="font-display text-lg font-extrabold text-slate-900">
                      ₹{b.totalAmount || 260 + b.fee}
                    </p>
                    <p className="text-[11px] text-slate-400">₹10 platform fee paid</p>
                  </div>
                </div>

                {/* MadadMitra Security OTP Box (For Upcoming Bookings) */}
                {b.status === 'upcoming' && (
                  <div className="mt-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-200/60 text-amber-800">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-950">
                          Service Start Code (MadadMitra SafeStart™ Security Protocol)
                        </p>
                        <p className="text-[11px] text-amber-800">
                          Share this OTP with {b.workerName} only after they arrive at your home.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs font-semibold text-amber-800">OTP:</span>
                      <span className="rounded-xl bg-white px-3.5 py-1.5 font-mono text-base font-extrabold tracking-widest text-slate-900 shadow-sm border border-amber-200">
                        {mockOtp}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes or Address info if present */}
                {b.address && (
                  <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                    <span className="font-bold text-slate-700">Service Address: </span>
                    {b.address}
                  </p>
                )}

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveCallModal(b)}
                      className="btn-ghost py-2 px-3 text-xs flex items-center gap-1.5 text-slate-700"
                    >
                      <Phone className="h-3.5 w-3.5 text-emerald-600" /> Call Helper
                    </button>
                    <button
                      onClick={() => setActiveInvoiceModal(b)}
                      className="btn-ghost py-2 px-3 text-xs flex items-center gap-1.5 text-slate-700"
                    >
                      <FileText className="h-3.5 w-3.5 text-brand-600" /> Invoice Breakdown
                    </button>
                  </div>

                  {b.status === 'upcoming' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCancelTarget(b)}
                        className="btn-ghost py-2 px-3 text-xs text-error-600 hover:bg-error-50"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel Booking
                      </button>
                      <button
                        onClick={() => markCompleted(b)}
                        className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                      </button>
                    </div>
                  )}

                  {b.status === 'completed' && (
                    <div className="flex items-center gap-2">
                      {ratedBookings[b.id] ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
                          <Star className="h-3.5 w-3.5 fill-amber-400" /> Rated {ratedBookings[b.id]} Stars
                        </span>
                      ) : (
                        <button
                          onClick={() => setRatingTarget(b)}
                          className="btn-ghost py-2 px-3 text-xs flex items-center gap-1 text-amber-700 border-amber-200 hover:bg-amber-50"
                        >
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Rate Experience
                        </button>
                      )}
                      <button
                        onClick={() => setView('home')}
                        className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Book Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CALL HELPER MODAL */}
      {activeCallModal && (
        <Modal open={true} onClose={() => setActiveCallModal(null)} title="Contact Service Partner">
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
              <Phone className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                {activeCallModal.workerName}
              </h3>
              <p className="text-xs text-slate-500">{SERVICE_LABELS[activeCallModal.service]}</p>
              <p className="mt-3 font-mono text-lg font-bold text-slate-800">
                +91 98765 43210
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Available between 07:00 AM - 08:00 PM for booking coordination
              </p>
            </div>
            <div className="pt-2 flex gap-2">
              <button onClick={() => setActiveCallModal(null)} className="btn-ghost flex-1 text-xs">
                Close
              </button>
              <a
                href="tel:+919876543210"
                className="btn-primary flex-1 text-xs py-3 flex items-center justify-center gap-1"
              >
                <Phone className="h-3.5 w-3.5" /> Call Now
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* INVOICE BREAKDOWN MODAL */}
      {activeInvoiceModal && (
        <Modal open={true} onClose={() => setActiveInvoiceModal(null)} title="Official Tax Invoice">
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="font-display font-bold text-slate-900">MadadMitra Household Services</p>
                <p className="text-[11px] text-slate-400">Order ID: {activeInvoiceModal.id}</p>
              </div>
              <span className="badge bg-emerald-100 text-emerald-800">Paid Online</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Partner Base Payout ({activeInvoiceModal.workerName})</span>
                <span className="font-bold text-slate-900">₹{activeInvoiceModal.totalAmount ? activeInvoiceModal.totalAmount - 10 : 250}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Convenience Fee</span>
                <span className="font-bold text-slate-900">₹10</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST / Taxes (18% on ₹10 platform fee)</span>
                <span className="font-bold text-slate-900">₹1.80 (Included)</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-display text-base font-extrabold text-slate-900">
                <span>Total Amount Paid</span>
                <span>₹{activeInvoiceModal.totalAmount || 260}</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
              💡 Zero hidden charges. MadadMitra operates on a fixed ₹10 convenience fee per booking.
            </div>

            <button onClick={() => setActiveInvoiceModal(null)} className="btn-primary w-full text-xs py-3">
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* RATE HELPER MODAL */}
      {ratingTarget && (
        <Modal open={true} onClose={() => setRatingTarget(null)} title="Rate Your Service Experience">
          <div className="text-center py-4 space-y-4">
            <p className="text-sm font-semibold text-slate-700">
              How was your service with <span className="text-brand-700 font-bold">{ratingTarget.workerName}</span>?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= selectedRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-700">
              {selectedRating === 5
                ? '⭐ Excellent! Highly Recommended'
                : selectedRating === 4
                ? '⭐ Very Good'
                : selectedRating === 3
                ? 'Average Service'
                : 'Needs Improvement'}
            </p>
            <textarea
              rows={2}
              placeholder="Leave a quick review for the community (optional)..."
              className="input text-xs"
            />
            <div className="flex gap-2">
              <button onClick={() => setRatingTarget(null)} className="btn-ghost flex-1 text-xs">
                Cancel
              </button>
              <button onClick={handleRateSubmit} className="btn-primary flex-1 text-xs py-2.5">
                Submit Review
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelTarget && (
        <Modal open={true} onClose={() => setCancelTarget(null)} title="Cancel Booking?">
          <div className="py-2 space-y-3">
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel the appointment with{' '}
              <span className="font-bold text-slate-900">{cancelTarget.workerName}</span> on{' '}
              <span className="font-semibold">{cancelTarget.date}</span> at{' '}
              <span className="font-semibold">{cancelTarget.time}</span>?
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-[11px] text-amber-800">
              Free cancellation available up to 2 hours before scheduled slot. Your ₹10 platform fee
              will be credited to your account.
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setCancelTarget(null)} className="btn-ghost flex-1 text-xs">
                Keep Booking
              </button>
              <button onClick={confirmCancel} className="btn-primary bg-error-600 hover:bg-error-700 flex-1 text-xs">
                Confirm Cancellation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
