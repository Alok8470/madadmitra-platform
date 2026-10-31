import { useState } from 'react';
import {
  Briefcase,
  ShieldCheck,
  Award,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function PartnerJoinPage() {
  const { setView, openAuthModal } = useApp();
  const { language } = useLanguage();

  const [dailyHomes, setDailyHomes] = useState(4); // 4 houses

  // Earning formula:
  // Avg rate per house per visit: ~₹260 * 25 days = ₹6,500/house/month
  const monthlyEarnings = dailyHomes * 5200;

  const handleStartKyc = () => {
    openAuthModal('worker', 'signup');
  };

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12 w-full max-w-full overflow-x-hidden">
      {/* Top Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white p-4 sm:p-12 relative overflow-hidden shadow-2xl w-full max-w-full">
        <div className="absolute top-0 right-0 h-64 w-64 bg-accent-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <span className="badge bg-accent-400 text-slate-950 font-black text-xs uppercase px-3 py-1">
            MadadMitra Partner Program
          </span>
          <h1 className="mt-3 font-display text-2xl sm:text-5xl font-black leading-tight">
            {language === 'hi'
              ? 'मददमित्र से जुड़ें और हर महीने ₹20,000+ कमाएं'
              : 'Join MadadMitra & Earn ₹20,000+ Every Month'}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed">
            {language === 'hi'
              ? 'बिना किसी कमीशन कटौती के। ग्राहक केवल ₹10 सुविधा शुल्क देता है — आपकी पूरी कमाई 100% आपकी जेब में!'
              : 'Zero commission cut. We charge customers just ₹10 convenience fee — you keep 100% of your earnings directly in your bank account or UPI!'}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> ₹2 Lakh Free Accident Insurance
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-accent-400" /> Weekly On-Time Payments
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-sky-400" /> Free Identity Card & Uniform
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Worker Earnings Calculator */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="badge bg-brand-50 text-brand-700 font-extrabold text-xs uppercase">
              Income Simulator
            </span>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
              Calculate Your Monthly Income
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Select how many homes you want to work at daily in your city
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 text-white p-4 text-center shrink-0">
            <p className="text-[10px] uppercase font-bold text-slate-400">Estimated Earnings</p>
            <p className="font-display text-3xl font-black text-emerald-400">
              ₹{monthlyEarnings.toLocaleString('en-IN')}
              <span className="text-xs text-slate-400 font-normal"> / month</span>
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700">Daily Houses / Slots:</span>
            <span className="rounded-lg bg-white px-3 py-1 text-xs font-extrabold text-brand-700 shadow-sm border border-slate-200">
              {dailyHomes} {dailyHomes === 1 ? 'House' : 'Houses'} / Day (~{dailyHomes * 2} hrs total)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            value={dailyHomes}
            onChange={(e) => setDailyHomes(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2">
            <span>1 House (Part-time: ₹5,200)</span>
            <span>3 Houses (Regular: ₹15,600)</span>
            <span>6 Houses (Full-time: ₹31,200)</span>
          </div>
        </div>
      </div>

      {/* Official KYC Registration Prompt */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        <div className="text-center py-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-soft mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            {language === 'hi' ? 'आधिकारिक पार्टनर पंजीकरण (KYC)' : 'Official Partner Registration (KYC)'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {language === 'hi'
              ? 'मददमित्र पार्टनर बनने के लिए अपना 10-अंकों का मोबाइल नंबर, 12-अंकों का आधार नंबर और पैन कार्ड विवरण दर्ज करें। सत्यापन के तुरंत बाद आप बुकिंग प्राप्त करना शुरू कर सकते हैं!'
              : 'To become a MadadMitra partner, complete your government identity verification with your 12-digit Aadhaar and 10-character PAN card. Start receiving direct customer bookings immediately!'}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartKyc}
              className="btn-primary py-3.5 px-8 text-sm font-extrabold flex items-center justify-center gap-2 shadow-soft w-full sm:w-auto"
            >
              <Briefcase className="h-4 w-4" />
              <span>
                {language === 'hi'
                  ? 'पार्टनर केवाईसी साइन-अप शुरू करें'
                  : 'Start Worker KYC Sign-Up (Aadhaar & PAN)'}
              </span>
            </button>
            <button
              onClick={() => setView('home')}
              className="btn-secondary py-3.5 px-6 text-sm font-bold w-full sm:w-auto"
            >
              {language === 'hi' ? 'होमपेज पर जाएं' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
