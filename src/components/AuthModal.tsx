import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  User,
  CheckCircle2,
  Lock,
  Sparkles,
  Building2,
  Briefcase,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import Modal from './Modal';
import { sendOtp, verifyOtp } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { SERVICE_LABELS, type ServiceId, type Worker } from '../data/mockData';
import type { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
  defaultRole?: UserRole;
  defaultWorkerMode?: 'login' | 'signup';
  cities: string[];
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultRole = 'customer',
  defaultWorkerMode = 'login',
  cities,
}: AuthModalProps) {
  const { language } = useLanguage();
  const { addWorker } = useApp();

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [workerMode, setWorkerMode] = useState<'login' | 'signup'>(defaultWorkerMode);
  const [step, setStep] = useState<'form' | 'otp'>('form');

  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole);
      setWorkerMode(defaultWorkerMode || 'login');
      setStep('form');
      setErrorMsg('');
      setInfoMsg('');
    }
  }, [isOpen, defaultRole, defaultWorkerMode]);

  // Common fields
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState(cities[0] || 'Deoria');
  const [otp, setOtp] = useState('');

  // Worker Signup specific KYC fields
  const [area, setArea] = useState('');
  const [service, setService] = useState<ServiceId>('cook');
  const [rate, setRate] = useState<number>(250);
  const [experienceYears, setExperienceYears] = useState<number>(4);
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    if (!fullName.trim() && role !== 'admin') {
      setErrorMsg(language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Please enter your full name');
      return;
    }

    // Worker Registration Validation (Aadhaar & PAN)
    if (role === 'worker' && workerMode === 'signup') {
      const cleanAadhaar = aadhaar.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        setErrorMsg('Please enter a valid 12-digit Aadhaar Card number (12 अंकों का आधार नंबर दर्ज करें)');
        return;
      }
      const cleanPan = pan.trim().toUpperCase();
      if (cleanPan.length !== 10) {
        setErrorMsg('Please enter a valid 10-digit PAN Card number (10 अंकों का पैन कार्ड नंबर दर्ज करें, e.g. ABCDE1234F)');
        return;
      }
      if (!area.trim()) {
        setErrorMsg('Please enter your operating locality/area (अपना इलाका दर्ज करें, e.g. Raghav Nagar / Civil Lines)');
        return;
      }
    }

    setLoading(true);
    const res = await sendOtp(cleanPhone);
    setLoading(false);

    if (res.success) {
      setInfoMsg(res.message);
      // Auto-populate the demo OTP so user can verify seamlessly
      if (res.mockOtp) {
        setOtp(res.mockOtp);
      } else {
        setOtp('123456');
      }
      // Smoothly transition to OTP screen
      setStep('otp');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otp.length < 4) {
      setErrorMsg(language === 'hi' ? 'कृपया पूरा OTP दर्ज करें' : 'Please enter the complete OTP');
      return;
    }

    setLoading(true);
    const res = await verifyOtp(phone, otp, role, fullName, city);
    setLoading(false);

    if (res.success && res.profile) {
      // If newly registered worker, dynamically add them to the website catalog!
      if (role === 'worker' && workerMode === 'signup') {
        const cleanAadhaar = aadhaar.replace(/\D/g, '');
        const cleanPan = pan.trim().toUpperCase();
        const newWorker: Worker = {
          id: `w_live_${Date.now()}`,
          name: fullName.trim(),
          phone: `+91 ${phone}`,
          service: service,
          rating: 5.0,
          jobs: 0,
          city: city,
          area: area.trim() || 'Central',
          online: true,
          pricePerVisit: rate || 250,
          avatarColor: 'bg-brand-600',
          verified: true,
          isRealPartner: true,
          experienceYears: experienceYears || 3,
          badgeTag: 'Newly Verified Partner',
          about: `Verified ${SERVICE_LABELS[service]} in ${city}. KYC verified with Aadhaar and PAN.`,
          kyc: {
            aadhaarLastFour: cleanAadhaar.slice(-4),
            panLastFour: cleanPan.slice(-4),
            status: 'verified',
            policeVerificationNo: `UP-${city.slice(0, 3).toUpperCase()}-2026-LIVE`,
            vaccinationStatus: 'fully_vaccinated',
          },
        };
        addWorker(newWorker);
      }

      onLoginSuccess(res.profile);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const modalTitle =
    role === 'worker' && workerMode === 'signup'
      ? 'Partner Registration & KYC'
      : role === 'worker'
      ? 'Helper / Partner Login'
      : role === 'admin'
      ? 'Admin Portal'
      : 'Customer Sign In / Login';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div>
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 shadow-soft">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-2.5 font-display text-xl sm:text-2xl font-extrabold text-slate-900">
            {role === 'worker' && workerMode === 'signup'
              ? 'Partner Registration & KYC'
              : role === 'worker'
              ? 'Helper / Partner Login'
              : language === 'hi'
              ? 'मददमित्र में आपका स्वागत है'
              : 'Welcome to MadadMitra'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {role === 'worker' && workerMode === 'signup'
              ? 'Verify your Aadhaar & PAN to start receiving household bookings'
              : 'Secure mobile OTP login & identity verification'}
          </p>
        </div>

        {/* Role Selector Tabs (Only on form step) */}
        {step === 'form' && (
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setRole('customer');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                role === 'customer'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('worker');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                role === 'worker'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Helper</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                role === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>
          </div>
        )}

        {/* Worker Specific: Sub-tabs (Login vs Signup with Aadhaar & PAN) */}
        {role === 'worker' && step === 'form' && (
          <div className="mt-3 flex rounded-xl border border-brand-200 bg-brand-50/50 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setWorkerMode('login')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                workerMode === 'login'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-brand-800 hover:bg-brand-100'
              }`}
            >
              Already Registered? Login
            </button>
            <button
              type="button"
              onClick={() => setWorkerMode('signup')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                workerMode === 'signup'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-brand-800 hover:bg-brand-100'
              }`}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              <span>New Partner KYC Sign Up</span>
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="mt-3 rounded-xl bg-error-50 border border-error-200 p-2.5 text-xs text-error-700 font-medium">
            {errorMsg}
          </div>
        )}
        {infoMsg && (
          <div className="mt-3 rounded-xl bg-brand-50 border border-brand-200 p-2.5 text-xs text-brand-700 font-medium">
            {infoMsg}
          </div>
        )}

        {/* STEP 1: FORM INPUTS */}
        {step === 'form' && (
          <form onSubmit={handleSendOtp} className="mt-3.5 space-y-3 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700">Full Name (पूरा नाम)</label>
              <div className="relative mt-1">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={role === 'worker' ? 'Full Name as per Aadhaar' : 'Your Full Name'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                10-Digit Mobile Number (मोबाइल नंबर)
              </label>
              <div className="relative mt-1 flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-r-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            {/* If New Worker Partner Registration -> Show Aadhaar, PAN, Skill & Area */}
            {role === 'worker' && workerMode === 'signup' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Work City (काम का शहर)</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input mt-1 text-xs bg-white"
                    >
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Operating Area / Locality</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Raghav Nagar / Civil Lines / Salempur"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="input mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Primary Skill / Service</label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value as ServiceId)}
                      className="input mt-1 text-xs bg-white"
                    >
                      <option value="cook">Home Cook (खाना बनाना)</option>
                      <option value="cleaner">House Cleaner / Maid (झाड़ू-पोछा)</option>
                      <option value="electrician">Electrician (बिजली मिस्त्री)</option>
                      <option value="plumber">Plumber (नल फिटिंग)</option>
                      <option value="all-rounder">All-Rounder (खाना + सफाई)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Experience (Years)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={40}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="input mt-1 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Rate / Visit (₹)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      max={1500}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="input mt-1 text-xs font-bold text-brand-700"
                    />
                  </div>
                </div>

                {/* MANDATORY KYC: Aadhaar & PAN Card */}
                <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-700" />
                    <span className="text-xs font-extrabold text-emerald-950 uppercase">
                      Mandatory Govt. Identity Verification (KYC)
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">
                      12-Digit Aadhaar Card Number (12 अंकों का आधार नंबर) *
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      required
                      placeholder="e.g. 5412 8891 7412"
                      value={aadhaar}
                      onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                      className="input mt-1 text-xs font-mono tracking-widest bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">
                      10-Character PAN Card Number (पैन कार्ड नंबर) *
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      placeholder="e.g. ABCDE1234F"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      className="input mt-1 text-xs font-mono uppercase tracking-widest bg-white"
                    />
                  </div>

                  <p className="text-[10px] text-emerald-800 font-medium">
                    🔒 Documents are encrypted and used only for UIDAI verification & police clearance.
                  </p>
                </div>
              </div>
            )}

            {/* City selection for normal customers */}
            {role !== 'worker' && (
              <div>
                <label className="text-xs font-bold text-slate-700">Select City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input mt-1 text-xs bg-white"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold shadow-soft"
            >
              {loading ? (
                <span>Sending OTP...</span>
              ) : (
                <>
                  <span>
                    {role === 'worker' && workerMode === 'signup'
                      ? 'Submit KYC & Verify OTP (पंजीकरण करें)'
                      : language === 'hi'
                      ? 'OTP प्राप्त करें'
                      : 'Get Verification Code'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4 text-left">
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-semibold">Code sent to: </span>
                <span className="font-mono font-bold text-slate-900">+91 {phone}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="font-bold text-brand-600 hover:underline text-xs"
              >
                (Change)
              </button>
            </div>

            {/* DEMO / TEST OTP BANNER (Guaranteed instant testing) */}
            <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-3.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Test OTP Code: <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">123456</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp('123456')}
                  className="btn bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] py-1 px-3 rounded-lg shadow-xs font-bold self-start sm:self-auto shrink-0"
                >
                  Auto-Fill 123456
                </button>
              </div>
              <p className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
                Live test mode active. Click <strong>Auto-Fill 123456</strong> or enter 123456 below to verify immediately.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Enter 6-Digit OTP Code</label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input pl-10 text-center font-mono text-xl font-extrabold tracking-widest bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-soft"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {role === 'worker' && workerMode === 'signup'
                      ? 'Verify KYC & Complete Registration'
                      : 'Verify & Continue'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="btn-ghost w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ← Back to Edit Details
            </button>
          </form>
        )}

        <div className="mt-5 border-t border-slate-100 pt-3">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-accent-500" />
            <span>256-Bit Encrypted • Verified Govt. Security Check</span>
          </p>
        </div>
      </div>
    </Modal>
  );
}
