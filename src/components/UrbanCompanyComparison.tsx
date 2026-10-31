import React from 'react';
import {
  Check,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  Briefcase,
  Users,
  Wrench,
  Sparkles,
  Award,
  CircleDollarSign,
  Store,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export const UrbanCompanyComparison: React.FC = () => {
  const { setView, openAuthModal } = useApp();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const comparisonRows = [
    {
      id: 'commission',
      icon: CircleDollarSign,
      parameter: isHi ? 'कारीगर कमीशन कटौती' : 'Worker Commission Cut',
      targetAudience: isHi ? 'कारीगर लाभ' : 'Worker Benefit',
      traditional: isHi
        ? '25% से 32% तक कमीशन कटौती (कारीगर की कम कमाई)'
        : '25% to 32% cut deducted from worker earnings',
      madadmitra: isHi
        ? '0% कमीशन (100% मजदूरी सीधे कारीगर के पास)'
        : '0% Commission (Worker keeps 100% of customer pay)',
      explanation: isHi
        ? 'पारंपरिक एग्रीगेटर्स 30% तक काटते हैं जिससे कारीगर असंतुष्ट रहते हैं। मदद मित्र पर कोई कमीशन नहीं कटता।'
        : 'Metro aggregators deduct heavy commissions, forcing workers to bypass apps. MadadMitra charges ₹0 commission on labor.',
    },
    {
      id: 'pricing',
      icon: Zap,
      parameter: isHi ? 'पारदर्शी प्रारंभिक दरें' : 'Starting Service Rates',
      targetAudience: isHi ? 'ग्राहक लाभ' : 'Customer Benefit',
      traditional: isHi
        ? '₹499 से ₹899 न्यूनतम विज़िटिंग शुल्क'
        : '₹499 to ₹899 minimum mandatory visiting fee',
      madadmitra: isHi
        ? '₹89 से ₹199 स्पष्ट व निश्चित कार्य दरें'
        : '₹89 to ₹199 standardized task-based rate card',
      explanation: isHi
        ? 'छोटे-मोटे स्विच या नल रिपेयर के लिए भारी ₹500 खर्च करने की जरूरत नहीं; तय रेट कार्ड पर काम होता है।'
        : 'No inflated visiting charges for minor 15-minute fixes. Pay only for the exact task completed.',
    },
    {
      id: 'parts',
      icon: Store,
      parameter: isHi ? 'स्पेयर पार्ट्स व सामान' : 'Spare Parts & Materials',
      targetAudience: isHi ? 'पारदर्शिता' : 'Transparency',
      traditional: isHi
        ? 'महंगे निजी ऐप पार्ट्स (भारी कमीशन मार्जिन)'
        : 'Inflated proprietary replacement parts markup',
      madadmitra: isHi
        ? 'नजदीकी हार्डवेयर स्टोर से सीधे एमआरपी पर'
        : 'Direct neighborhood store MRP (zero app markup)',
      explanation: isHi
        ? 'सामान सीधे आपके जाने-पहचाने स्थानीय हार्डवेयर व्यापारी से आधिकारिक बिल व गारंटी के साथ मिलता है।'
        : 'Genuine brand parts (Anchor, Havells, Prince) billed at official store MRP from verified local hardware partners.',
    },
    {
      id: 'trust',
      icon: ShieldCheck,
      parameter: isHi ? 'स्थानीय सत्यापन व भरोसा' : 'Local Verification & Trust',
      targetAudience: isHi ? 'सुरक्षा' : 'Safety',
      traditional: isHi
        ? 'दूरस्थ कॉल-सेंटर (स्थानीय पहचान का अभाव)'
        : 'Distant call-center support with no local roots',
      madadmitra: isHi
        ? 'आधार केवाईसी + स्थानीय दुकानदार गारंटी'
        : 'UIDAI Aadhaar KYC + Local Store Guarantor',
      explanation: isHi
        ? 'हर कारीगर यूआईडीएआई आधार और इलाके के प्रतिष्ठित हार्डवेयर व्यापारी की व्यक्तिगत गारंटी से जुड़ा है।'
        : 'Technicians are backed by registered neighborhood hardware shop owners who act as real local guarantors.',
    },
    {
      id: 'warranty',
      icon: Award,
      parameter: isHi ? 'संपत्ति सुरक्षा व री-वर्क वारंटी' : 'Damage Protection & Warranty',
      targetAudience: isHi ? 'ग्राहक सुरक्षा' : 'Guarantee',
      traditional: isHi
        ? 'जटिल नियम व शर्तें (दावा मिलना कठिन)'
        : 'Complex dispute terms with slow claim approvals',
      madadmitra: isHi
        ? '₹10,000 सुरक्षा कवर + 7-दिन फ्री री-वर्क'
        : '₹10,000 Property Cover + 7-Day Free Re-work',
      explanation: isHi
        ? 'काम के 7 दिनों के भीतर समस्या आने पर बिना किसी अतिरिक्त शुल्क के दोबारा प्राथमिकता से रिपेयर।'
        : 'If the same issue reoccurs within 7 days, a senior verified technician revisits at ₹0 visiting charge.',
    },
    {
      id: 'payment',
      icon: RotateCcw,
      parameter: isHi ? 'सीधा भुगतान व प्लेटफॉर्म निष्ठा' : 'Cash & Direct Payment Flexibility',
      targetAudience: isHi ? 'सुविधा' : 'Convenience',
      traditional: isHi
        ? 'कारीगर ऐप कैंसिल करके नकद मांगने को मजबूर'
        : 'Technicians ask to cancel the app for cash',
      madadmitra: isHi
        ? '100% पारदर्शी: नकद या यूपीआई सीधे कारीगर को'
        : 'Direct Cash or UPI to worker with zero penalty',
      explanation: isHi
        ? 'मदद मित्र पर केवल ₹10 का लीड टोकन लगता है, जिससे ग्राहक व कारीगर के बीच कोई विवाद नहीं होता।'
        : 'Low ₹10 lead tokens eliminate platform leakage, fostering happy, honest long-term relationships.',
    },
  ];

  const handleBookTechnician = () => {
    const el = document.getElementById('categories-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setView('home');
    }
  };

  const handleJoinPartner = () => {
    openAuthModal('worker', 'signup');
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 sm:p-10 shadow-elevated relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-700 border border-brand-200/80 mb-3 shadow-xs">
            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>{isHi ? 'तथ्यात्मक व निष्पक्ष तुलना' : 'TRANSPARENT MARKET COMPARISON'}</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            {isHi
              ? 'मदद मित्र आपके और कारीगरों दोनों के लिए सबसे बेहतर क्यों है?'
              : 'Why MadadMitra is Better for You and Workers'}
          </h2>

          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            {isHi
              ? 'स्थानीय ज़रूरतों के लिए निर्मित: 0% कारीगर कमीशन, पूरी तरह पारदर्शी दरें और भरोसेमंद स्थानीय सहायता।'
              : 'Designed for local needs with 0% worker commission, transparent pricing, and trusted local support.'}
          </p>
        </div>

        {/* DUAL BENEFIT PILLARS (Customer & Worker Harmony) */}
        <div className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-4 sm:p-5 flex items-start gap-3.5 shadow-soft">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white font-bold shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-md">
                {isHi ? 'ग्राहकों के लिए' : 'For Households'}
              </span>
              <h3 className="font-extrabold text-emerald-950 text-sm mt-1">
                {isHi ? 'उचित दरें व 100% स्थानीय गारंटी' : 'Fair Rates & Neighborhood Trust'}
              </h3>
              <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                {isHi
                  ? 'बिना किसी छुपे शुल्क के ₹89 से शुरू होने वाला पारदर्शी रेट कार्ड, एमआरपी पर असली सामान और ₹10,000 का सुरक्षा कवर।'
                  : 'Pay transparent fixed task rates starting at ₹89, genuine store parts at MRP, and get ₹10,000 property damage protection.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-brand-300 bg-brand-50/70 p-4 sm:p-5 flex items-start gap-3.5 shadow-soft">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white font-bold shadow-sm">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-brand-800 bg-brand-200/70 px-2 py-0.5 rounded-md">
                {isHi ? 'कारीगरों के लिए' : 'For Service Partners'}
              </span>
              <h3 className="font-extrabold text-brand-950 text-sm mt-1">
                {isHi ? '0% कमीशन व पूरा नकद हाथ में' : '0% Commission & 100% Earnings Kept'}
              </h3>
              <p className="text-xs text-brand-800/90 mt-0.5 leading-relaxed">
                {isHi
                  ? 'मेहनत की पूरी 100% कमाई सीधे आपकी। कोई भारी कटौती या लोन का झंझट नहीं; केवल ₹10 का सरल लीड टोकन।'
                  : 'Keep 100% of customer payments directly in cash or UPI. No 30% commission cuts or debt traps; just ₹10 per lead.'}
              </p>
            </div>
          </div>
        </div>

        {/* DESKTOP COMPARISON TABLE (>=md) */}
        <div className="relative z-10 mt-8 hidden md:block overflow-hidden rounded-2xl border border-slate-200/90 shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/80">
                <th className="py-4 px-5 w-2/5 font-extrabold">{isHi ? 'मापदंड व विवरण' : 'Evaluation Criteria'}</th>
                <th className="py-4 px-5 w-[30%] text-slate-600 font-extrabold">
                  {isHi ? 'पारंपरिक एग्रीगेटर्स' : 'Traditional Aggregators'}
                </th>
                <th className="py-4 px-5 w-[30%] bg-emerald-100/70 text-emerald-950 font-black relative">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm">
                      <ShieldCheck className="h-4 w-4 text-emerald-700" />
                      MadadMitra
                    </span>
                    <span className="badge bg-emerald-600 text-white text-[9px] font-extrabold tracking-wide">
                      RECOMMENDED
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {comparisonRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <row.icon className="h-4 w-4 text-brand-600 shrink-0" />
                      <span>{row.parameter}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {row.targetAudience}
                      </span>
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 mt-1 leading-relaxed pl-6">
                      {row.explanation}
                    </div>
                  </td>

                  {/* Traditional Aggregators Column */}
                  <td className="py-4 px-5 text-slate-600 font-medium bg-slate-50/40">
                    <div className="flex items-start gap-2 text-rose-800 font-semibold">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600 mt-0.5">
                        <X className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                      <span>{row.traditional}</span>
                    </div>
                  </td>

                  {/* MadadMitra Column (Elevated) */}
                  <td className="py-4 px-5 bg-emerald-50/70 text-emerald-950 font-bold border-l border-emerald-200">
                    <div className="flex items-start gap-2 text-emerald-800 font-extrabold">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-white mt-0.5 shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                      <span>{row.madadmitra}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE RESPONSIVE COMPARISON CARDS (<md) */}
        <div className="relative z-10 mt-6 space-y-3.5 md:hidden">
          {comparisonRows.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <row.icon className="h-4 w-4 text-brand-600 shrink-0" />
                  <span>{row.parameter}</span>
                </div>
                <span className="badge bg-slate-200 text-slate-700 text-[9px] font-bold">
                  {row.targetAudience}
                </span>
              </div>

              {/* MadadMitra Advantage Card */}
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-950">
                <div className="flex items-center justify-between font-black text-[11px] text-emerald-800 uppercase tracking-wide mb-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> MadadMitra
                  </span>
                  <span className="badge bg-emerald-600 text-white text-[8px]">SUPERIOR</span>
                </div>
                <div className="flex items-start gap-2 font-bold mt-1">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                  <span>{row.madadmitra}</span>
                </div>
              </div>

              {/* Traditional Platforms Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wide block mb-1">
                  {isHi ? 'पारंपरिक ऐप्स' : 'Other Platforms'}
                </span>
                <div className="flex items-start gap-2 text-rose-700 font-medium">
                  <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>{row.traditional}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic leading-relaxed">
                {row.explanation}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Callout & Action Bar */}
        <div className="relative z-10 mt-8 rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-elevated">
          <div className="flex items-start sm:items-center gap-3.5 max-w-xl">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-slate-950 font-black shadow-soft">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display font-black text-white text-base">
                {isHi ? 'विश्वसनीय स्थानीय सहायता का अनुभव करें' : 'Experience Transparent Household Care'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {isHi
                  ? 'स्थानीय हार्डवेयर व्यापारियों की गारंटी, 0% कमीशन और पारदर्शी दरों के साथ आज ही बुक करें।'
                  : 'Backed by verified local hardware merchants, 0% worker commission, and standardized task rates.'}
              </p>
            </div>
          </div>

          {/* DUAL CALL TO ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handleBookTechnician}
              className="btn bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 px-5 text-xs rounded-xl shadow-soft flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span>{isHi ? 'विश्वसनीय कारीगर बुक करें' : 'Book a Trusted Technician'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleJoinPartner}
              className="btn bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 text-xs rounded-xl border border-white/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Briefcase className="h-4 w-4 text-emerald-400" />
              <span>{isHi ? 'कारीगर साथी बनें (0% कट)' : 'Join as a Partner'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UrbanCompanyComparison;
