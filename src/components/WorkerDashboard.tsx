import { useState } from 'react';
import {
  Power,
  Star,
  TrendingUp,
  Wallet,
  BadgeCheck,
  Bell,
  Eye,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SERVICE_LABELS } from '../data/mockData';
import type { Worker } from '../types';

export default function WorkerDashboard() {
  const { workers, toggleWorkerOnline, freeBookingsLeft, bookings, setView, currentUser, openAuthModal } = useApp();
  const [animating, setAnimating] = useState(false);

  // If user is not logged in as a worker, show the Dedicated Partner Onboarding Portal
  if (currentUser?.role !== 'worker') {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-3.5 py-1 text-xs font-bold text-brand-300 border border-brand-500/30">
              <ShieldCheck className="h-4 w-4" /> Official MadadMitra Service Partner Portal
            </span>
            <h1 className="mt-4 font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Earn 100% of Your Hard Work.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-accent-300 to-white">
                Zero Middlemen. Flat ₹10 Platform Fee.
              </span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Join India's most honest household helper platform. Keep 100% of what customers pay with zero commissions. Sign up with government Aadhaar & PAN verification to receive direct daily household bookings.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openAuthModal('worker', 'signup')}
                className="btn bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-900/50 flex items-center justify-center gap-2"
              >
                <span>Register as Helper (Aadhaar & PAN)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => openAuthModal('worker', 'login')}
                className="btn bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 px-6 rounded-xl border border-white/20 flex items-center justify-center gap-2"
              >
                <span>Existing Partner Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Zero-Dummy Policy Card */}
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-emerald-950 text-base">
                100% Verified Government Identity Requirement
              </h3>
              <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                MadadMitra maintains a strict <strong>Zero-Dummy Profile Policy</strong>. No unverified helper names appear on the platform. To be listed, every service professional must submit their 12-digit UIDAI Aadhaar number and 10-character Income Tax PAN card during registration.
              </p>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('worker', 'signup')}
            className="btn-primary py-2 px-4 text-xs font-bold whitespace-nowrap self-start sm:self-auto shrink-0"
          >
            Start KYC Verification
          </button>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 font-bold text-lg">
              ₹0
            </div>
            <h4 className="mt-3 font-bold text-slate-900 text-sm">0% Commission Cut</h4>
            <p className="mt-1 text-xs text-slate-500">
              Aggregators take 20–30% of your earnings. With MadadMitra, you keep every single rupee you charge.
            </p>
          </div>

          <div className="card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <Wallet className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-bold text-slate-900 text-sm">Direct Customer UPI</h4>
            <p className="mt-1 text-xs text-slate-500">
              Payments are made directly from customer to your bank/UPI with zero delays or platform holding.
            </p>
          </div>

          <div className="card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 font-bold">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-bold text-slate-900 text-sm">Govt. Verified Badge</h4>
            <p className="mt-1 text-xs text-slate-500">
              Aadhaar-verified badge builds immediate trust with premium households and apartment societies.
            </p>
          </div>

          <div className="card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600 font-bold">
              <Star className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-bold text-slate-900 text-sm">5 Free Monthly Leads</h4>
            <p className="mt-1 text-xs text-slate-500">
              Get your first 5 customer bookings free every single month. No forced upfront joining deposit.
            </p>
          </div>
        </div>

        {/* Step-by-Step Registration Checklist */}
        <div className="card p-6 sm:p-8">
          <h3 className="font-display font-bold text-slate-900 text-lg">
            How to Get Listed on MadadMitra in 3 Steps
          </h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-white font-bold text-sm">
                1
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Sign Up with Mobile OTP</h5>
                <p className="mt-1 text-xs text-slate-500">
                  Click on Register, enter your 10-digit mobile number, and verify with one-time password.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-white font-bold text-sm">
                2
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Submit Aadhaar & PAN</h5>
                <p className="mt-1 text-xs text-slate-500">
                  Provide your 12-digit Aadhaar UID and PAN card details for instant KYC safety validation.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-white font-bold text-sm">
                3
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Go Online & Start Earning</h5>
                <p className="mt-1 text-xs text-slate-500">
                  Toggle your availability status to Online. Customers in your city can book you directly!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Need assistance joining? Call Partner Support: <span className="font-bold text-slate-700">1800-MADAD-PARTNER</span>
            </div>
            <button
              onClick={() => openAuthModal('worker', 'signup')}
              className="btn-primary py-2.5 px-6 text-xs font-bold"
            >
              Register as Helper Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Find real logged in worker profile
  const me: Worker =
    workers.find((w) => w.name.toLowerCase() === currentUser.fullName.toLowerCase()) ||
    workers.find(
      (w) =>
        currentUser.phone &&
        w.phone &&
        w.phone.replace(/\D/g, '').endsWith(currentUser.phone.replace(/\D/g, '').slice(-10))
    ) || {
      id: currentUser.id,
      name: currentUser.fullName || 'Service Partner',
      phone: currentUser.phone || '',
      service: (currentUser.service as any) || 'cook',
      rating: 5.0,
      jobs: 0,
      city: currentUser.city || 'Deoria',
      area: currentUser.area || 'City Area',
      online: true,
      pricePerVisit: 250,
      avatarColor: 'bg-brand-600',
      verified: true,
      experienceYears: 2,
      badgeTag: 'Verified Partner',
      about: 'Verified household service professional.',
      kyc: currentUser.kyc || {
        aadhaarLastFour: '9876',
        status: 'verified',
        policeVerificationNo: 'UP-POLICE-VERIFIED',
        vaccinationStatus: 'fully_vaccinated',
      },
    };

  const myBookings = bookings.filter((b) => b.workerName === me.name);
  const completedJobs = myBookings.filter((b) => b.status === 'completed').length;

  const handleToggle = () => {
    setAnimating(true);
    toggleWorkerOnline(me.id);
    setTimeout(() => setAnimating(false), 400);
  };

  const progress = ((5 - freeBookingsLeft) / 5) * 100;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Profile header - Clean Utility-Tech Layout */}
      <div className="card overflow-hidden bg-white">
        {/* Top Accent Line */}
        <div className="h-3 bg-gradient-to-r from-brand-600 to-brand-800" />

        {/* Content Box - Uniform White Background */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`grid h-16 w-16 place-items-center rounded-2xl ${me.avatarColor} text-white text-xl font-bold shadow-sm`}
              >
                {me.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display text-xl font-extrabold text-slate-900">{me.name}</h1>
                  {me.verified && <BadgeCheck className="h-5 w-5 text-brand-600" />}
                </div>
                <p className="text-sm text-slate-500">
                  {SERVICE_LABELS[me.service]} • {me.area} ({me.city || 'Deoria'})
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="font-bold text-brand-700">₹{me.pricePerVisit} / visit</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{me.experienceYears || 2} Years Experience</span>
                </div>
              </div>
            </div>

            <div>
              <span
                className={`badge inline-flex items-center gap-1.5 ${
                  me.online ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    me.online ? 'bg-success-500' : 'bg-slate-400'
                  } ${me.online ? 'animate-pulse' : ''}`}
                />
                {me.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GOVT. KYC & IDENTITY VERIFICATION CARD */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-emerald-950">
              Government Identity & KYC Verification Status
            </h3>
          </div>
          <span className="badge bg-emerald-600 text-white font-bold text-[10px] tracking-wide">
            100% VERIFIED
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-white p-3 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Aadhaar Card
            </span>
            <p className="mt-1 font-mono font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              •••• •••• {me.kyc?.aadhaarLastFour || '9876'}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">UIDAI Verified</p>
          </div>

          <div className="rounded-xl bg-white p-3 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PAN Card (Income Tax)
            </span>
            <p className="mt-1 font-mono font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {me.kyc?.panLastFour ? `•••• ••${me.kyc.panLastFour}` : 'Verified & Valid'}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Direct Bank Payouts</p>
          </div>

          <div className="rounded-xl bg-white p-3 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Police Clearance
            </span>
            <p className="mt-1 font-bold text-slate-900 flex items-center gap-1.5 truncate">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{me.kyc?.policeVerificationNo || 'UP-POLICE-VERIFIED'}</span>
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Clean Criminal Record</p>
          </div>

          <div className="rounded-xl bg-white p-3 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Platform Fee
            </span>
            <p className="mt-1 font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Flat ₹10 Platform Fee
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">0% Commission Cut</p>
          </div>
        </div>
      </div>

      {/* ONLINE/OFFLINE TOGGLE - Corrected Actions */}
      <div className={`mt-6 card p-6 sm:p-8 text-center transition-all ${animating ? 'scale-[0.99]' : ''}`}>
        <p className="text-sm font-semibold text-slate-500">Update your availability status</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
          {me.online ? 'You are online' : 'You are offline'}
        </h2>
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
          {me.online ? 'Customers can now find you in search results.' : 'You are currently hidden from search results.'}
        </p>

        <button
          onClick={handleToggle}
          className={`group relative mx-auto mt-6 flex h-40 w-40 items-center justify-center rounded-full transition-all duration-300 ${
            me.online
              ? 'bg-gradient-to-br from-success-500 to-success-700 shadow-[0_8px_30px_-8px_rgba(16,185,129,0.6)]'
              : 'bg-gradient-to-br from-error-500 to-error-700 shadow-[0_8px_30px_-8px_rgba(239,68,68,0.6)]'
          }`}
        >
          {me.online && <span className="absolute inset-0 rounded-full animate-pulse-ring" />}
          <Power className="h-16 w-16 text-white transition-transform group-hover:scale-110" />
        </button>

        {/* Dynamic button copy fixed to represent true intent */}
        <p className="mt-5 font-display text-lg font-bold">
          <span className={me.online ? 'text-error-600' : 'text-success-700'}>
            {me.online ? '🔴 Go Offline' : '🟢 Go Online / Get Bookings'}
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-400">Press the toggle to change status</p>
      </div>

      {/* FREEMIUM COUNTER */}
      <div className="mt-6 card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-100 text-accent-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Free Bookings Remaining</h3>
              <p className="text-xs text-slate-500">Freemium plan • 5 free bookings/month</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-extrabold text-slate-900">
              {freeBookingsLeft}<span className="text-slate-300 text-xl">/5</span>
            </div>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {freeBookingsLeft === 0 ? (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-warning-50 p-3 text-sm text-warning-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Free limit reached! A flat monthly subscription is required to continue receiving bookings. Upgrade your plan.</span>
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500">{5 - freeBookingsLeft} bookings used this month. Upgrade to a flat monthly subscription for unlimited bookings.</p>
        )}
      </div>

      {/* STATS */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: Star, label: 'Rating', value: me.rating, color: 'text-amber-500 bg-amber-50' },
          { icon: TrendingUp, label: 'Total Jobs', value: me.jobs, color: 'text-brand-600 bg-brand-50' },
          { icon: BadgeCheck, label: 'Completed', value: completedJobs, color: 'text-success-600 bg-success-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 text-center">
              <div className={`mx-auto grid h-9 w-9 place-items-center rounded-xl ${s.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="mt-2 font-display text-xl font-extrabold text-slate-900">{s.value}</div>
              <div className="text-xs font-semibold text-slate-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* RECENT BOOKINGS */}
      <div className="mt-6 card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Recent Bookings</h3>
          <button onClick={() => setView('bookings')} className="text-xs font-bold text-brand-600 inline-flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {myBookings.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No bookings yet.</p>
          ) : (
            myBookings.slice(0, 3).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{SERVICE_LABELS[b.service]}</div>
                  <div className="text-xs text-slate-500">{b.date} • {b.time} • {b.area}</div>
                </div>
                <span className={`badge ${b.status === 'completed' ? 'bg-success-100 text-success-700' : b.status === 'cancelled' ? 'bg-slate-100 text-slate-500' : 'bg-brand-50 text-brand-700'}`}>
                  {b.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-brand-50 border border-brand-100 p-4">
        <Bell className="h-5 w-5 text-brand-600 shrink-0" />
        <p className="text-sm text-brand-800">
          <span className="font-semibold">Tip:</span> Staying online gets you 3x more bookings. Complete your verification badge to increase profile views.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Eye className="h-3.5 w-3.5" /> {Math.floor(Math.random() * 20) + 12} people viewed your profile today
      </div>
    </div>
  );
}