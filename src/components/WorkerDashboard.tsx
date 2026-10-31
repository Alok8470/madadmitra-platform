import { useState } from 'react';
import {
  Power,
  Star,
  TrendingUp,
  Wallet,
  BadgeCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MapPin,
  Lock,
  PlusCircle,
  Radio,
  Sparkles,
  Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { SERVICE_LABELS } from '../data/mockData';
import type { Booking, Worker } from '../types';
import AudioJobAlert from './AudioJobAlert';
import Modal from './Modal';

export default function WorkerDashboard() {
  const { workers, toggleWorkerOnline, bookings, addBooking, cancelBooking, setView, currentUser, openAuthModal } = useApp();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [animating, setAnimating] = useState(false);
  const [sikkaBalance, setSikkaBalance] = useState(5); // Default 5 free lead tokens
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showIncomingAlert, setShowIncomingAlert] = useState(false);
  const [startOtpInputs, setStartOtpInputs] = useState<Record<string, string>>({});
  const [endOtpInputs, setEndOtpInputs] = useState<Record<string, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});
  const [successNotices, setSuccessNotices] = useState<Record<string, string>>({});

  // If user is not logged in as a worker, show the Dedicated Partner Onboarding Portal
  if (currentUser?.role !== 'worker') {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-3.5 py-1 text-xs font-bold text-brand-300 border border-brand-500/30">
              <ShieldCheck className="h-4 w-4" />
              {isHi ? 'आधिकारिक मदद मित्र सेवा साथी पोर्टल' : 'Official MadadMitra Service Partner Portal'}
            </span>
            <h1 className="mt-4 font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {isHi ? (
                <>अपनी मेहनत की पूरी कमाई खुद रखें।<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-amber-300 to-white">0% कमीशन। मात्र ₹10 का लीड सिक्का।</span></>
              ) : (
                <>Keep 100% of Your Earnings.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-amber-300 to-white">0% Commission. Flat ₹10 Lead Token.</span></>
              )}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              {isHi
                ? 'भारत के सबसे ईमानदार घरेलू सहायक नेटवर्क से जुड़ें। स्थानीय हार्डवेयर केंद्रों व आधार द्वारा सत्यापित होकर दैनिक काम पाएं।'
                : 'Join India’s most honest manual helper network. Keep 100% of what customers pay with zero platform cut. Verified through local Hardware Kendras & Aadhaar.'}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openAuthModal('worker', 'signup')}
                className="btn bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-900/50 flex items-center justify-center gap-2"
              >
                <span>{isHi ? 'हेल्पर के रूप में पंजीकरण करें' : 'Register as Service Partner'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => openAuthModal('worker', 'login')}
                className="btn bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 px-6 rounded-xl border border-white/20 flex items-center justify-center gap-2"
              >
                <span>{isHi ? 'मौजूदा साथी लॉगिन' : 'Existing Partner Login'}</span>
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
                {isHi ? '100% सरकारी पहचान एवं दुकानदार गारंटी' : '100% Verified Identity & Nodal Merchant Vouching'}
              </h3>
              <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                {isHi
                  ? 'मदद मित्र पर कोई फर्जी प्रोफाइल नहीं है। हर कारीगर यूआईडीएआई आधार और स्थानीय हार्डवेयर/पेंट स्टोर द्वारा सत्यापित है।'
                  : 'MadadMitra maintains a strict Zero-Dummy Profile Policy. Every technician is verified via UIDAI paperless Aadhaar and endorsed by their local Hardware/Paint Store.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('worker', 'signup')}
            className="btn-primary py-2 px-4 text-xs font-bold whitespace-nowrap self-start sm:self-auto shrink-0"
          >
            {isHi ? 'केवाईसी शुरू करें' : 'Start KYC Verification'}
          </button>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 font-bold text-lg">
              ₹0
            </div>
            <h4 className="mt-3 font-bold text-slate-900 text-sm">
              {isHi ? '0% कमीशन कट' : '0% Commission Cut'}
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              {isHi
                ? 'एग्रीगेटर 20-30% कमीशन काटते हैं। मदद मित्र पर पूरे पैसे सीधे आपके हैं।'
                : 'Aggregators take 20–30% of your earnings. With MadadMitra, you keep every rupee customers pay.'}
            </p>
          </div>

          <div className="card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <Wallet className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-bold text-slate-900 text-sm">
              {isHi ? 'सीधे नकद / यूपीआई भुगतान' : 'Direct Customer Cash/UPI'}
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              {isHi
                ? 'ग्राहक काम पूरा होने पर सीधे नकद या आपके क्यूआर कोड पर भुगतान करता है।'
                : 'Customer pays cash or scans your personal UPI QR upon completion. Zero delay or holding.'}
            </p>
          </div>

          <div className="card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 font-bold">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-bold text-slate-900 text-sm">
              {isHi ? 'दुकानदार गारंटी बैज' : 'Hardware Store Trust'}
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              {isHi
                ? 'आपके इलाके के हार्डवेयर स्टोर पार्टनर की गारंटी से ग्राहकों का पक्का भरोसा मिलता है।'
                : 'Guaranteed by your local hardware store partner with official guarantor trust marks.'}
            </p>
          </div>

          <div className="card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600 font-bold">
              <Star className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-bold text-slate-900 text-sm">
              {isHi ? '5 मुफ़्त लीड टोकन' : '5 Free Lead Tokens'}
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              {isHi
                ? 'पंजीकरण पर तुरंत 5 मुफ़्त लीड टोकन पाएं और पहले ही दिन से काम शुरू करें।'
                : 'Receive 5 Free Lead Tokens (₹50 value) upon signing up to start getting local jobs immediately.'}
            </p>
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
      service: (currentUser.service as any) || 'electrician',
      rating: 4.9,
      jobs: 24,
      city: currentUser.city || 'Agra',
      area: currentUser.area || 'Kamla Nagar',
      online: true,
      pricePerVisit: 200,
      avatarColor: 'bg-emerald-600',
      verified: true,
      experienceYears: 4,
      badgeTag: isHi ? 'सत्यापित मिस्त्री' : 'Verified Partner',
      about: 'Verified household service professional.',
      sikkaBalance: sikkaBalance,
      kyc: currentUser.kyc || {
        aadhaarLastFour: '4819',
        status: 'verified',
        policeVerificationNo: 'UP-POLICE-VERIFIED',
        vaccinationStatus: 'fully_vaccinated',
        kendraGuarantorName: 'Shri Ram Hardware & Sanitary',
        kendraGuarantorShop: 'Kamla Nagar Main Market, Agra',
      },
    };

  const myBookings = bookings.filter((b) => b.workerName === me.name || b.workerId === me.id);
  const activeBookings = myBookings.filter((b) => b.status === 'accepted' || b.status === 'in_progress');
  const completedJobs = myBookings.filter((b) => b.status === 'completed').length;

  const handleToggle = () => {
    setAnimating(true);
    toggleWorkerOnline(me.id);
    setTimeout(() => setAnimating(false), 400);
  };

  const handleSimulateAlert = () => {
    setShowIncomingAlert(true);
  };

  const handleAcceptAlert = () => {
    if (sikkaBalance < 1) {
      alert(isHi ? 'आपके पास पर्याप्त सिक्के नहीं हैं। कृपया सिक्के रिचार्ज करें।' : 'Insufficient Lead Tokens. Please recharge your wallet.');
      setShowRechargeModal(true);
      setShowIncomingAlert(false);
      return;
    }

    setSikkaBalance((prev) => prev - 1);
    setShowIncomingAlert(false);

    // Create a new active accepted booking
    const newBooking: Booking = {
      id: `b_live_${Date.now()}`,
      bookingCode: `MM-${Math.floor(100000 + Math.random() * 900000)}`,
      workerName: me.name,
      workerId: me.id,
      service: me.service,
      customerName: 'Sunil Agarwal',
      customerPhone: '9837124589',
      date: new Date().toISOString().slice(0, 10),
      time: 'Immediate Dispatch',
      status: 'accepted',
      paymentStatus: 'paid_cash_cod',
      fee: 15,
      totalAmount: 250,
      area: me.area,
      address: `House No. 42, Block C, Near Radha Swamy Satsang, ${me.area}`,
      startJobOtp: '4821',
      endJobOtp: '9134',
    };
    addBooking(newBooking);
  };

  const handleVerifyStartOtp = (booking: Booking) => {
    const entered = startOtpInputs[booking.id] || '';
    const targetOtp = booking.startJobOtp || '4821';

    if (entered === targetOtp) {
      cancelBooking(booking.id);
      addBooking({
        ...booking,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      });
      setOtpErrors((prev) => ({ ...prev, [booking.id]: '' }));
      setSuccessNotices((prev) => ({
        ...prev,
        [booking.id]: isHi ? 'काम शुरू हुआ! ग्राहक के परिसर में काम करें।' : 'Job started! You can now proceed with the service.',
      }));
    } else {
      setOtpErrors((prev) => ({
        ...prev,
        [booking.id]: isHi ? 'गलत Start OTP! ग्राहक से 4-अंकों का सही कोड लें।' : 'Invalid Start OTP. Please ask customer for the 4-digit code.',
      }));
    }
  };

  const handleVerifyEndOtp = (booking: Booking) => {
    const entered = endOtpInputs[booking.id] || '';
    const targetOtp = booking.endJobOtp || '9134';

    if (entered === targetOtp) {
      cancelBooking(booking.id);
      addBooking({
        ...booking,
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      setOtpErrors((prev) => ({ ...prev, [booking.id]: '' }));
      setSuccessNotices((prev) => ({
        ...prev,
        [booking.id]: isHi
          ? `काम संपन्न! ग्राहक से ₹${booking.totalAmount || 200} सीधे नकद या अपने QR पर लें।`
          : `Job Completed! Collect ₹${booking.totalAmount || 200} directly from customer in cash or personal UPI.`,
      }));
    } else {
      setOtpErrors((prev) => ({
        ...prev,
        [booking.id]: isHi ? 'गलत End OTP! काम की जांच के बाद ग्राहक से कोड लें।' : 'Invalid End OTP. Ask customer to verify completed work.',
      }));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-6 animate-fade-in">
      {/* SIKKA LEAD WALLET CARD */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              {isHi ? 'मदद मित्र लीड सिक्का वॉलेट' : 'MadadMitra Lead Token Wallet'}
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-4xl sm:text-5xl font-black text-amber-400">
                {sikkaBalance}
              </span>
              <span className="text-slate-300 text-base font-semibold">
                {isHi ? 'सिक्के शेष' : 'Available Lead Tokens'}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300 max-w-md leading-relaxed">
              {isHi
                ? '1 सिक्का = 1 ग्राहक का काम (₹10)। काम का 100% पैसा (₹150 - ₹350) सीधे ग्राहक से आपको मिलता है। 0% कमीशन।'
                : '1 Token = 1 Confirmed Customer Lead (₹10). You keep 100% of customer payments (₹150 - ₹350) with Zero Commission.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowRechargeModal(true)}
              className="btn bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 px-5 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isHi ? 'सिक्के रिचार्ज करें' : 'Buy Lead Tokens'}</span>
            </button>
            <button
              onClick={handleSimulateAlert}
              className="btn bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl border border-white/20 flex items-center justify-center gap-2 text-xs"
            >
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>{isHi ? 'टेस्ट नया काम' : 'Simulate Demo Alert'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE JOBS IN PROGRESS (OTP WORKFLOW) */}
      {activeBookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-rose-500 animate-pulse" />
              <h2 className="font-display text-lg font-black text-slate-900">
                {isHi ? 'चालू काम' : 'Active Job in Progress'}
              </h2>
            </div>
            <span className="badge bg-rose-100 text-rose-700 font-bold text-xs">
              {isHi ? 'कार्यवाही आवश्यक' : 'Action Required'}
            </span>
          </div>

          {activeBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border-2 border-brand-500 bg-white p-5 shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <span className="badge bg-brand-50 text-brand-700 font-mono text-xs font-bold">
                    {b.bookingCode || 'MM-JOB'}
                  </span>
                  <h3 className="font-display font-extrabold text-slate-900 text-lg mt-1">
                    {SERVICE_LABELS[b.service]}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    <strong>{b.address || b.area}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-600">₹{b.totalAmount || 250}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {isHi ? '100% नकद आपको मिलेगा' : '100% direct cash to you'}
                  </p>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">{b.customerName || 'Customer'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{b.customerPhone || '9876543210'}</p>
                </div>
                <a
                  href={`tel:${b.customerPhone || '9876543210'}`}
                  className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5 text-brand-600" />
                  <span>{isHi ? 'ग्राहक को कॉल करें' : 'Call Customer'}</span>
                </a>
              </div>

              {/* Step 1: Start OTP Input */}
              {b.status === 'accepted' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <span>
                      {isHi
                        ? 'चरण 1: ग्राहक के घर पहुँचने पर 4-अंकों का स्टार्ट OTP दर्ज करें'
                        : 'Step 1: Arrive at customer premise & enter 4-digit Start OTP'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 4821"
                      value={startOtpInputs[b.id] || ''}
                      onChange={(e) => setStartOtpInputs({ ...startOtpInputs, [b.id]: e.target.value })}
                      className="input-field max-w-[140px] text-center font-mono font-bold text-lg py-2"
                    />
                    <button
                      onClick={() => handleVerifyStartOtp(b)}
                      className="btn-primary py-2 px-5 text-xs font-bold"
                    >
                      {isHi ? 'सत्यापित करें व काम शुरू करें' : 'Verify & Start Job'}
                    </button>
                  </div>
                  {otpErrors[b.id] && (
                    <p className="text-xs font-bold text-rose-600">{otpErrors[b.id]}</p>
                  )}
                  <p className="text-[11px] text-amber-800">
                    {isHi
                      ? '* ग्राहक के ऐप में स्टार्ट OTP प्रदर्शित है। ग्राहक से पूछकर दर्ज करें।'
                      : '* Start OTP is displayed on customer screen. Ask customer upon arrival.'}
                  </p>
                </div>
              )}

              {/* Step 2: In-Progress & End OTP Input */}
              {b.status === 'in_progress' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      {isHi
                        ? 'चरण 2: काम पूरा करने के बाद ग्राहक से एंड OTP लें व फोटो खींचें'
                        : 'Step 2: Complete work, take photo & enter End OTP to collect payment'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                      <Camera className="h-3.5 w-3.5 text-slate-600" />
                      <span>{isHi ? 'काम का फोटो लें' : 'Take After Photo'}</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" />
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder={isHi ? 'एंड OTP (9134)' : 'End OTP (9134)'}
                      value={endOtpInputs[b.id] || ''}
                      onChange={(e) => setEndOtpInputs({ ...endOtpInputs, [b.id]: e.target.value })}
                      className="input-field max-w-[140px] text-center font-mono font-bold text-lg py-2"
                    />
                    <button
                      onClick={() => handleVerifyEndOtp(b)}
                      className="btn bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-5 text-xs font-bold rounded-xl shadow-md"
                    >
                      {isHi ? 'काम संपन्न करें व पैसे लें' : 'Complete Job & Collect Cash'}
                    </button>
                  </div>
                  {otpErrors[b.id] && (
                    <p className="text-xs font-bold text-rose-600">{otpErrors[b.id]}</p>
                  )}
                  {successNotices[b.id] && (
                    <p className="text-xs font-bold text-emerald-800">{successNotices[b.id]}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Profile Header */}
      <div className="card overflow-hidden bg-white">
        <div className="h-3 bg-gradient-to-r from-brand-600 to-brand-800" />
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
                  {SERVICE_LABELS[me.service]} • {me.area} ({me.city || 'Agra'})
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="font-bold text-brand-700">₹{me.pricePerVisit} / {isHi ? 'विज़िट' : 'visit charge'}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{me.experienceYears || 4} {isHi ? 'साल का अनुभव' : 'Years Experience'}</span>
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
                {me.online
                  ? isHi
                    ? 'ऑनलाइन (उपलब्ध)'
                    : 'Online (Ready for Jobs)'
                  : isHi
                  ? 'ऑफलाइन'
                  : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LOCAL HARDWARE KENDRA GUARANTOR BADGE */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-emerald-950">
              {isHi ? 'हार्डवेयर स्टोर गारंटी व पहचान स्थिति' : 'Hardware Store Guarantor & Identity Status'}
            </h3>
          </div>
          <span className="badge bg-emerald-600 text-white font-bold text-[10px] tracking-wide">
            {isHi ? '100% सत्यापित' : '100% VERIFIED'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-white p-3 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isHi ? 'हार्डवेयर स्टोर पार्टनर' : 'Nodal Hardware Store'}
            </span>
            <p className="mt-1 font-bold text-slate-900 flex items-center gap-1.5 truncate">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{me.kyc?.kendraGuarantorName || 'Shri Ram Hardware'}</span>
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {isHi ? 'दुकानदार गारंटी प्रमाणित' : 'Vouched by Local Store'}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isHi ? 'आधार सत्यापन' : 'UIDAI Aadhaar Scan'}
            </span>
            <p className="mt-1 font-mono font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              •••• •••• {me.kyc?.aadhaarLastFour || '4819'}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {isHi ? 'यूआईडीएआई ऑफलाइन सत्यापित' : 'UIDAI Offline Verified'}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isHi ? 'मोहल्ला ट्रस्ट रिकॉर्ड' : 'Mohalla Trust Record'}
            </span>
            <p className="mt-1 font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {me.mohallaJobsCount || 18} {isHi ? 'घरों में सेवा' : 'Homes Served'}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {isHi ? 'पड़ोसी द्वारा प्रमाणित' : 'Neighbor Vouched'}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isHi ? 'प्लेटफ़ॉर्म टेक-रेट' : 'Platform Take-Rate'}
            </span>
            <p className="mt-1 font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              0% Commission
            </p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {isHi ? 'केवल ₹10 प्रति लीड' : 'Flat ₹10 per accepted lead'}
            </p>
          </div>
        </div>
      </div>

      {/* ONLINE/OFFLINE TOGGLE */}
      <div className={`card p-6 sm:p-8 text-center transition-all ${animating ? 'scale-[0.99]' : ''}`}>
        <p className="text-sm font-semibold text-slate-500">
          {isHi ? 'अपनी उपलब्धता स्थिति अपडेट करें' : 'Update your availability status'}
        </p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
          {me.online
            ? isHi
              ? 'आप ऑनलाइन हैं'
              : 'You are Online'
            : isHi
            ? 'आप ऑफलाइन हैं'
            : 'You are Offline'}
        </h2>
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
          {me.online
            ? isHi
              ? 'आपके इलाके के ग्राहक अब आपको सीधे बुक कर सकते हैं।'
              : 'Customers in your area can now book you directly.'
            : isHi
            ? 'आप अभी सर्च परिणामों में छिपे हुए हैं।'
            : 'You are currently hidden from customer search results.'}
        </p>

        <button
          onClick={handleToggle}
          className={`group relative mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-full transition-all duration-300 ${
            me.online
              ? 'bg-gradient-to-br from-success-500 to-success-700 shadow-[0_8px_30px_-8px_rgba(16,185,129,0.6)]'
              : 'bg-gradient-to-br from-error-500 to-error-700 shadow-[0_8px_30px_-8px_rgba(239,68,68,0.6)]'
          }`}
        >
          {me.online && <span className="absolute inset-0 rounded-full animate-pulse-ring" />}
          <Power className="h-14 w-14 text-white transition-transform group-hover:scale-110" />
        </button>

        <p className="mt-4 font-display text-base font-bold">
          <span className={me.online ? 'text-error-600' : 'text-success-700'}>
            {me.online
              ? isHi
                ? '🔴 ऑफलाइन हों'
                : '🔴 Go Offline'
              : isHi
              ? '🟢 ऑनलाइन हों / काम पाएं'
              : '🟢 Go Online / Get Jobs'}
          </span>
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Star, label: isHi ? 'रेटिंग' : 'Rating', value: me.rating, color: 'text-amber-500 bg-amber-50' },
          { icon: TrendingUp, label: isHi ? 'कुल काम' : 'Total Jobs', value: me.jobs, color: 'text-brand-600 bg-brand-50' },
          { icon: BadgeCheck, label: isHi ? 'सफल काम' : 'Completed', value: completedJobs, color: 'text-success-600 bg-success-50' },
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
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">
            {isHi ? 'हालिया बुकिंग्स का इतिहास' : 'Recent Bookings History'}
          </h3>
          <button onClick={() => setView('bookings')} className="text-xs font-bold text-brand-600 inline-flex items-center gap-1">
            {isHi ? 'सभी देखें' : 'View all'} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {myBookings.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              {isHi ? 'अभी तक कोई बुकिंग नहीं।' : 'No bookings yet.'}
            </p>
          ) : (
            myBookings.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{SERVICE_LABELS[b.service]}</div>
                  <div className="text-xs text-slate-500">{b.date} • {b.time} • {b.area}</div>
                </div>
                <div className="text-right">
                  <span className={`badge ${b.status === 'completed' ? 'bg-success-100 text-success-700' : b.status === 'cancelled' ? 'bg-slate-100 text-slate-500' : 'bg-brand-50 text-brand-700'}`}>
                    {b.status}
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">₹{b.totalAmount || 200}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RECHARGE SIKKA MODAL */}
      {showRechargeModal && (
        <Modal
          open={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          title={isHi ? 'सिक्के खरीदें' : 'Buy Lead Tokens (Sikka Packs)'}
        >
          <div className="py-2 space-y-4">
            <p className="text-xs text-slate-600">
              {isHi
                ? 'प्रत्येक सिक्का (1 सिक्का = ₹10) से आपको 1 कन्फर्म ग्राहक का काम मिलता है। ग्राहक से मिलने वाली पूरी मजदूरी सीधे आपकी है।'
                : '1 Lead Token (₹10) unlocks 1 confirmed household booking. You keep 100% of customer payments directly with Zero Commission.'}
            </p>

            <div className="space-y-3">
              {[
                {
                  sikke: 10,
                  price: 100,
                  tag: isHi ? 'सबसे लोकप्रिय' : 'Most Popular',
                  label: isHi ? '10 सिक्के' : '10 Lead Tokens',
                  sub: isHi ? '10 सीधे ग्राहक के काम' : '10 direct confirmed jobs',
                },
                {
                  sikke: 25,
                  price: 220,
                  tag: isHi ? 'बचत पैक' : 'Saver Pack (+3 Bonus Tokens)',
                  label: isHi ? '25 सिक्के' : '25 Lead Tokens',
                  sub: isHi ? '25 सीधे ग्राहक के काम' : '25 direct confirmed jobs',
                },
                {
                  sikke: 50,
                  price: 400,
                  tag: isHi ? 'सुपर सेवर पैक' : 'Super Saver Pack',
                  label: isHi ? '50 सिक्के' : '50 Lead Tokens',
                  sub: isHi ? '50 सीधे ग्राहक के काम' : '50 direct confirmed jobs',
                },
              ].map((pack) => (
                <div
                  key={pack.sikke}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50/20 transition-all cursor-pointer"
                  onClick={() => {
                    setSikkaBalance((prev) => prev + pack.sikke);
                    setShowRechargeModal(false);
                    alert(
                      isHi
                        ? `बधाई! आपके खाते में ${pack.sikke} सिक्के जोड़ दिए गए हैं।`
                        : `Success! ${pack.sikke} Lead Tokens added to your wallet.`
                    );
                  }}
                >
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded-full">
                      {pack.tag}
                    </span>
                    <h4 className="font-display font-extrabold text-slate-900 text-lg mt-1">
                      {pack.label}
                    </h4>
                    <p className="text-xs text-slate-500">{pack.sub}</p>
                  </div>
                  <button className="btn bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 px-5 text-sm rounded-xl shadow-sm">
                    ₹{pack.price} (UPI)
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
              {isHi ? (
                <>🏪 <strong>दुकान से रिचार्ज:</strong> आप अपने नजदीकी मदद मित्र हार्डवेयर केंद्र पर नकद ₹100 देकर भी 10 सिक्के डलवा सकते हैं।</>
              ) : (
                <>🏪 <strong>Offline Store Recharge:</strong> You can also pay ₹100 cash at any registered MadadMitra Hardware Partner Store to add 10 tokens.</>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* AUDIO JOB ALERT MODAL */}
      {showIncomingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <AudioJobAlert
            areaName={me.area}
            serviceTitleHi={SERVICE_LABELS[me.service]}
            serviceTitleEn={me.service}
            estimatedFee={me.pricePerVisit + 50}
            distanceKm={1.4}
            onAccept={handleAcceptAlert}
            onDecline={() => setShowIncomingAlert(false)}
          />
        </div>
      )}
    </div>
  );
}
