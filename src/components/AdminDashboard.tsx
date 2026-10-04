import { useState } from 'react';
import {
  ShieldCheck,
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SERVICE_LABELS } from '../data/mockData';

interface RefundClaim {
  id: string;
  customerName: string;
  workerName: string;
  reason: string;
  amount: number;
  claimedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboard() {
  const {
    workers,
    bookings,
    setView,
    toggleWorkerOnline,
    toggleWorkerVerified,
    catalogMode,
    setCatalogMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'workers' | 'bookings' | 'refunds'>('workers');
  const [searchQuery, setSearchQuery] = useState('');
  const [refundClaims, setRefundClaims] = useState<RefundClaim[]>([]);

  const toggleVerify = (workerId: string) => {
    toggleWorkerVerified(workerId);
  };

  const approveRefund = (claimId: string) => {
    setRefundClaims((prev) =>
      prev.map((r) => (r.id === claimId ? { ...r, status: 'approved' } : r))
    );
  };

  const rejectRefund = (claimId: string) => {
    setRefundClaims((prev) =>
      prev.map((r) => (r.id === claimId ? { ...r, status: 'rejected' } : r))
    );
  };

  // Metrics
  const totalRevenue = bookings.filter((b) => b.status === 'completed').length * 10;
  const verifiedWorkersCount = workers.filter((w) => w.verified).length;
  const pendingRefundsCount = refundClaims.filter((r) => r.status === 'pending').length;

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-400" />
            MadadMitra Operations Center
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Admin Back-Office
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage worker verification, oversee platform bookings, and approve refunds
          </p>
        </div>
        <button onClick={() => setView('home')} className="btn-ghost text-sm self-start sm:self-auto">
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to Website
        </button>
      </div>

      {/* PLATFORM DEPLOYMENT & CATALOG CONTROLLER */}
      <div className="mt-6 rounded-2xl border-2 border-brand-200 bg-white p-5 shadow-sm">
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
              <h2 className="font-display text-base font-extrabold text-slate-900">
                Platform Worker Catalog Mode:{' '}
                {catalogMode === 'verified_only'
                  ? 'Live Production (Real KYC Partners Only)'
                  : 'Showcase Demo Mode (All Workers)'}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl">
              {catalogMode === 'verified_only'
                ? 'Only real helpers who have registered with Aadhaar & PAN verification through Worker Login are visible to customers. Unpartnered cities show the onboarding invitation.'
                : 'Showing both real partners and demo showcase fixtures so you can test all services, bookings, and customer flows.'}
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

      {/* KPI METRIC CARDS */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Platform Earnings
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-extrabold text-slate-900">
            ₹{totalRevenue}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">From ₹10 platform fee / booking</p>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Helpers
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent-50 text-accent-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-extrabold text-slate-900">
            {workers.length}
          </div>
          <p className="mt-1 text-[11px] text-success-600 font-medium">
            {verifiedWorkersCount} verified with KYC
          </p>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Bookings
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-extrabold text-slate-900">
            {bookings.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {bookings.filter((b) => b.status === 'upcoming').length} active right now
          </p>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Refund Claims
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-extrabold text-slate-900">
            {pendingRefundsCount} Pending
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Absence guarantee payouts</p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="mt-8 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('workers')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'workers'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Worker KYC & Approvals</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {workers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'bookings'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          <span>Platform Bookings</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'refunds'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Absence & Refund Disputes</span>
          {pendingRefundsCount > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
              {pendingRefundsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: WORKERS KYC & APPROVALS */}
      {activeTab === 'workers' && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search helper by name, skill, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 text-xs"
              />
            </div>
            <div className="text-xs text-slate-500">
              Showing {filteredWorkers.length} registered helpers
            </div>
          </div>

          {filteredWorkers.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900">No Helpers Registered Yet</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                MadadMitra enforces strict zero dummy profiles. Real service helpers will appear here after registering with Aadhaar & PAN verification.
              </p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Helper Profile</th>
                    <th className="px-4 py-3.5">Service Category</th>
                    <th className="px-4 py-3.5">Area & Location</th>
                    <th className="px-4 py-3.5">Rate / Visit</th>
                    <th className="px-4 py-3.5">Availability</th>
                    <th className="px-4 py-3.5">KYC Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWorkers.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${w.avatarColor} text-white font-bold text-sm`}
                          >
                            {w.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1 font-bold text-slate-900">
                              {w.name}
                              {w.verified && <BadgeCheck className="h-4 w-4 text-brand-600" />}
                            </div>
                            <div className="text-xs text-slate-400">
                              ⭐ {w.rating} • {w.jobs} completed jobs
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-700">
                          {SERVICE_LABELS[w.service]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{w.area}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">₹{w.pricePerVisit}</td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => toggleWorkerOnline(w.id)}
                          className={`badge cursor-pointer ${
                            w.online
                              ? 'bg-success-100 text-success-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              w.online ? 'bg-success-500' : 'bg-slate-400'
                            }`}
                          />
                          {w.online ? 'Online' : 'Offline'}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span
                            className={`badge ${
                              w.verified
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {w.verified ? 'KYC Verified' : 'KYC Pending'}
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Aadhaar: •••• {w.kyc?.aadhaarLastFour || '7412'}
                          </div>
                          {w.kyc?.panLastFour && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              PAN: •••• ••{w.kyc.panLastFour}
                            </div>
                          )}
                          {(w.isRealPartner || w.id.startsWith('w_live_')) && (
                            <span className="badge bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-extrabold uppercase block w-fit">
                              Live Partner
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => toggleVerify(w.id)}
                          className={`btn px-3 py-1.5 text-xs ${
                            w.verified
                              ? 'bg-white text-error-600 border border-error-200 hover:bg-error-50'
                              : 'bg-brand-600 text-white hover:bg-brand-700'
                          }`}
                        >
                          {w.verified ? 'Revoke Badge' : 'Verify & Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLATFORM BOOKINGS */}
      {activeTab === 'bookings' && (
        bookings.length === 0 ? (
          <div className="mt-6 card p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-bold text-slate-900">No Platform Bookings Yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Direct customer bookings with flat ₹10 platform fee will appear here once bookings are placed.
            </p>
          </div>
        ) : (
          <div className="mt-6 card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Booking ID</th>
                  <th className="px-4 py-3.5">Helper Assigned</th>
                  <th className="px-4 py-3.5">Service Type</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Platform Fee</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-600">{b.id}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{b.workerName}</td>
                    <td className="px-4 py-3.5 text-slate-700">{SERVICE_LABELS[b.service]}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {b.date} • {b.time}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{b.area}</td>
                    <td className="px-4 py-3.5 font-bold text-brand-600">₹{b.fee}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`badge capitalize ${
                          b.status === 'upcoming'
                            ? 'bg-brand-50 text-brand-700'
                            : b.status === 'completed'
                            ? 'bg-success-50 text-success-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB 3: REFUND & ABSENCE CLAIMS */}
      {activeTab === 'refunds' && (
        refundClaims.length === 0 ? (
          <div className="mt-6 card p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-bold text-slate-900">Zero Pending Disputes</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              All daily service requests and contracts are running smoothly without active dispute claims.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {refundClaims.map((claim) => (
              <div key={claim.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{claim.customerName}</span>
                    <span className="text-xs text-slate-400">reported absence of</span>
                    <span className="font-bold text-brand-700 text-sm">{claim.workerName}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {claim.reason}
                    </span>
                    <span>Claimed: {claim.claimedAt}</span>
                    <span className="font-bold text-slate-900">Refund Amount: ₹{claim.amount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {claim.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => approveRefund(claim.id)}
                        className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve ₹{claim.amount} Refund
                      </button>
                      <button
                        onClick={() => rejectRefund(claim.id)}
                        className="btn-ghost text-xs py-2 px-3 text-error-600 hover:bg-error-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`badge capitalize px-3 py-1 ${
                        claim.status === 'approved'
                          ? 'bg-success-100 text-success-800'
                          : 'bg-error-100 text-error-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
