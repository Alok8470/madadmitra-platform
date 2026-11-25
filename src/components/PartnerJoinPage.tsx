import { useState } from 'react';
import {
  Briefcase,
  ShieldCheck,
  Wallet,
  CheckCircle2,
  BadgeCheck,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function PartnerJoinPage() {
  const { setView, openAuthModal } = useApp();
  const { language } = useLanguage();
  const isHi = language === 'hi';

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
          <h1 className="mt-3 font-display text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">
            {isHi
              ? 'स्थानीय पार्टनर के रूप में मददमित्र से जुड़ें — ₹20,000+ / माह तक कमाने की क्षमता'
              : 'Join MadadMitra as a Local Partner — Potential to Earn ₹20,000+ / Month'}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed">
            {isHi
              ? 'आपके सेवा शुल्क से कोई कमीशन कटौती नहीं। ग्राहक केवल ₹10 सुविधा शुल्क देता है। वास्तविक मासिक कमाई आपके क्षेत्र में सक्रिय बुकिंग पर निर्भर करती है।'
              : 'Zero commission cut from your service charge. Customers pay only a ₹10 convenience fee. Actual monthly earnings depend on active bookings in your area.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {isHi ? '0% कमीशन कटौती' : '0% Commission Cut'}
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-accent-400" />
              {isHi ? 'सीधा UPI / बैंक भुगतान' : 'Direct UPI / Bank Payout'}
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-sky-400" />
              {isHi ? 'आधार सत्यापित बैज' : 'Aadhaar-Verified Badge'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Worker Earnings Calculator */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="badge bg-brand-50 text-brand-700 font-extrabold text-xs uppercase">
              {isHi ? 'कमाई सिम्युलेटर' : 'Income Simulator'}
            </span>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
              {isHi ? 'अपनी मासिक आय की गणना करें' : 'Calculate Your Monthly Income'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isHi
                ? 'चुनें कि आप अपने शहर में प्रतिदिन कितने घरों में सेवा देना चाहते हैं'
                : 'Select how many homes you want to work at daily in your city'}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 text-white p-4 text-center shrink-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {isHi ? 'संभावित कमाई (अनुमान)' : 'POTENTIAL EARNINGS (ESTIMATE)'}
            </p>
            <p className="font-display text-3xl font-black text-emerald-400">
              ₹{monthlyEarnings.toLocaleString('en-IN')}
              <span className="text-xs text-slate-400 font-normal"> / month</span>
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700">
              {isHi ? 'दैनिक घर / स्लॉट:' : 'Daily Houses / Slots:'}
            </span>
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

          {/* Realistic launch expectation note */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-start gap-2 text-slate-500 text-[11px] leading-relaxed">
            <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p>
              {isHi
                ? 'अनुमान पूर्ण क्षमता (उदा. 4 घर/दिन) पर आधारित हैं। देवरिया जैसे नए लॉन्च क्षेत्रों में बुकिंग धीरे-धीरे शुरू हो सकती है।'
                : 'Estimates reflect full capacity (e.g., 4 homes/day). Actual bookings may start gradually in new launch areas like Deoria.'}
            </p>
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
            {isHi
              ? 'मददमित्र पार्टनर बनने के लिए अपना 10-अंकों का मोबाइल नंबर दर्ज करें और आधार पहचान सत्यापन पूरा करें। सत्यापन के तुरंत बाद आप बुकिंग प्राप्त करना शुरू कर सकते हैं!'
              : 'To become a MadadMitra partner, complete your identity verification with your mobile number and Aadhaar document verification. Start receiving direct customer bookings immediately!'}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartKyc}
              className="btn-primary py-3.5 px-8 text-sm font-extrabold flex items-center justify-center gap-2 shadow-soft w-full sm:w-auto"
            >
              <Briefcase className="h-4 w-4" />
              <span>
                {isHi
                  ? 'पार्टनर केवाईसी साइन-अप शुरू करें'
                  : 'Start Worker KYC Sign-Up (Aadhaar)'}
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
