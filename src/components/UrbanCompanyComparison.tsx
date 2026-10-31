import React from 'react';
import { Check, X, ShieldCheck, Zap, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const UrbanCompanyComparison: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const rows = [
    {
      parameter: isHi ? 'कारीगर से कमीशन कटौती' : 'Worker Commission Cut',
      uc: '25% to 32% cut (Worker earns less)',
      mm: '0% Commission (Worker keeps 100%)',
      advantage: 'mm',
      detail: isHi
        ? 'अर्बन कंपनी कारीगर की मेहनत से 30% काटती है जिससे कारीगर ऐप बंद कर देता है। मदद मित्र पर पूरे पैसे कारीगर के हैं।'
        : 'Aggregators deduct 25-30% from worker labor, causing partner resentment and hidden costs. MadadMitra takes ₹0.',
    },
    {
      parameter: isHi ? 'पारदर्शी सेवा दरें (Starting Rate)' : 'Minimum Job Starting Rate',
      uc: '₹499 to ₹899 minimum visiting charge',
      mm: '₹89 to ₹199 clear standardized rate',
      advantage: 'mm',
      detail: isHi
        ? 'छोटे-मोटे स्विच या नल रिपेयर के लिए भारी ₹500 खर्च करने की जरूरत नहीं।'
        : 'Tier-2/3 households should not pay ₹600 for a simple 10-minute switchboard repair or tap washer change.',
    },
    {
      parameter: isHi ? 'स्पेयर पार्ट्स (सामान) की कीमत' : 'Spare Parts & Materials',
      uc: 'Inflated proprietary app parts markup',
      mm: 'Exact MRP from neighborhood Hardware Store',
      advantage: 'mm',
      detail: isHi
        ? 'पार्ट्स सीधे आपके जाने-पहचाने स्थानीय हार्डवेयर स्टोर से आधिकारिक बिल पर मिलते हैं।'
        : 'Genuine Panasonic, Havells, and Jaguar parts billed directly from registered neighborhood hardware shops at MRP.',
    },
    {
      parameter: isHi ? 'भरोसा व स्थानीय पहचान' : 'Ground Verification & Trust',
      uc: 'Distant call-center in Gurgaon',
      mm: 'UIDAI Aadhaar + Local Store Guarantor',
      advantage: 'mm',
      detail: isHi
        ? 'स्थानीय हार्डवेयर व्यापारी (जैसे श्री राम हार्डवेयर) की जमानत और पक्का रिकॉर्ड।'
        : 'Backed by physical endorsement from neighborhood merchants who have known the technician for years.',
    },
    {
      parameter: isHi ? 'संपत्ति सुरक्षा व री-वर्क गारंटी' : 'Damage Cover & Warranty',
      uc: 'Complicated T&C claims process',
      mm: '₹10,000 Madad Suraksha + 7-Day Free Re-work',
      advantage: 'mm',
      detail: isHi
        ? 'काम में कोई कमी रहने पर 7 दिनों तक बिना किसी विज़िट चार्ज के फ्री सुधार।'
        : '7-day hassle-free rework warranty with one-click claim dispatch right from the booking screen.',
    },
    {
      parameter: isHi ? 'ऐप बाईपास (Platfom Leakage)' : 'Platform Disintermediation',
      uc: 'Worker asks to cancel app and take cash',
      mm: 'Zero conflict: Direct cash & UPI to worker',
      advantage: 'mm',
      detail: isHi
        ? 'मदद मित्र पर नकद भुगतान की पूरी छूट है, कोई पेनाल्टी नहीं।'
        : 'Workers love MadadMitra because we encourage transparent direct customer relationships with low ₹10 lead tokens.',
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-10 shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-700 border border-brand-200/80 mb-3">
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>{isHi ? 'तथ्यात्मक तुलना' : 'TRANSPARENT COMPARISON'}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            {isHi ? 'मदद मित्र बनाम अर्बन कंपनी: कौन बेहतर है?' : 'How MadadMitra Compares to Urban Company'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {isHi
              ? 'टियर-2 और टियर-3 भारतीय शहरों में मेट्रो-आधारित एग्रीगेटर मॉडल क्यों विफल हो जाते हैं और मदद मित्र क्यों जीतता है।'
              : 'Why metro aggregator models fail outside Tier-1 cities, and how our 0% commission local model delivers superior ground reliability.'}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="py-4 px-4 w-1/3">{isHi ? 'सुविधा व नियम' : 'Operational Metric'}</th>
                <th className="py-4 px-4 w-1/3 bg-slate-50/80 rounded-t-2xl text-slate-600 font-extrabold">
                  Urban Company
                </th>
                <th className="py-4 px-4 w-1/3 bg-emerald-50 rounded-t-2xl text-emerald-950 font-black">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    MadadMitra
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">
                    <div>{r.parameter}</div>
                    <div className="text-[11px] font-normal text-slate-500 mt-0.5 leading-relaxed">
                      {r.detail}
                    </div>
                  </td>
                  <td className="py-4 px-4 bg-slate-50/50 text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold">
                      <X className="h-4 w-4 shrink-0 text-rose-500" />
                      {r.uc}
                    </span>
                  </td>
                  <td className="py-4 px-4 bg-emerald-50/40 text-emerald-950 font-bold">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600 stroke-[3]" />
                      {r.mm}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Callout */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-slate-950 font-black">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-base">
                {isHi ? '100% स्थानीय आजीविका का समर्थन' : 'Supporting Local Craftsmen, Not Distant Giants'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {isHi
                  ? 'जब आप मदद मित्र से बुक करते हैं, तो आपका पैसा स्थानीय मेहनतकश कारीगर और हार्डवेयर व्यापारी के पास रहता है।'
                  : 'Every rupee paid goes directly to your local neighborhood electrician or cook with zero middleman deductions.'}
              </p>
            </div>
          </div>
          <span className="badge bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-1.5 whitespace-nowrap">
            0% COMMISSION
          </span>
        </div>
      </div>
    </section>
  );
};

export default UrbanCompanyComparison;
