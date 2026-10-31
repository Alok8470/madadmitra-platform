import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Phone, Star, Clock, X, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  areaName: string;
  totalBill: number;
}

export const DispatchRadarModal: React.FC<Props> = ({
  open,
  onClose,
  serviceName,
  areaName,
  totalBill,
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [phase, setPhase] = useState<'scanning' | 'assigned' | 'en_route'>('scanning');
  const etaMins = 18;
  const startOtp = '4821';

  useEffect(() => {
    if (!open) {
      setPhase('scanning');
      return;
    }

    // Step 1: Scan for 2.4 seconds with radar animation
    const timer1 = setTimeout(() => {
      setPhase('assigned');
    }, 2400);

    // Step 2: Transition to En-Route after 4 seconds
    const timer2 = setTimeout(() => {
      setPhase('en_route');
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border-2 border-slate-200 shadow-elevated p-6 sm:p-8 text-slate-900 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors z-20"
        >
          <X className="h-5 w-5" />
        </button>

        {/* PHASE 1: RADAR SCANNING */}
        {phase === 'scanning' && (
          <div className="py-8 text-center space-y-6">
            <div className="relative mx-auto h-40 w-40 flex items-center justify-center">
              {/* Radar pulse rings */}
              <div className="absolute inset-0 rounded-full border-2 border-brand-400 animate-ping opacity-60" />
              <div className="absolute inset-4 rounded-full border border-brand-500 animate-pulse opacity-80" />
              <div className="absolute inset-10 rounded-full bg-brand-500/10" />

              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-white shadow-elevated z-10 animate-bounce">
                <MapPin className="h-8 w-8" />
              </div>
            </div>

            <div>
              <span className="badge bg-brand-50 text-brand-700 font-bold tracking-wider text-xs px-3 py-1 mb-2">
                {isHi ? 'लाइव मैचिंग जारी...' : 'LIVE SIKKA DISPATCH ENGINE'}
              </span>
              <h2 className="font-display text-2xl font-black text-slate-950">
                {isHi ? `${areaName} में निकटतम कारीगर खोज रहे हैं...` : `Matching Nearest Pro in ${areaName}...`}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                {isHi
                  ? 'स्थानीय हार्डवेयर स्टोर द्वारा सत्यापित और आधार प्रमाणित तकनीशियन को रिक्वेस्ट भेजी जा रही है।'
                  : 'Broadcasting task to active, hardware-vouched professionals within 2.5 km.'}
              </p>
            </div>
          </div>
        )}

        {/* PHASE 2 & 3: MATCH CONFIRMED / EN-ROUTE */}
        {(phase === 'assigned' || phase === 'en_route') && (
          <div className="space-y-5 animate-fade-in">
            {/* Header Status */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="badge bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 px-3 py-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {phase === 'en_route'
                    ? isHi
                      ? 'कारीगर रास्ते में है'
                      : 'Technician En Route'
                    : isHi
                    ? 'कारीगर ने काम स्वीकार किया'
                    : 'Job Accepted'}
                </span>
                <h3 className="font-display text-xl font-black text-slate-950 mt-1">
                  {serviceName}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Arrival</span>
                <span className="text-xl font-black text-brand-600 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {etaMins} mins
                </span>
              </div>
            </div>

            {/* Assigned Worker Profile Card */}
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white font-extrabold text-xl shadow-soft">
                  R
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 text-base flex items-center gap-1.5">
                    <span>Rajesh Kumar</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9
                    </span>
                    <span>•</span>
                    <span>32 Mohalla Visits</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                    🏪 Vouched by <strong>Shri Ram Hardware</strong>
                  </p>
                </div>
              </div>

              <a
                href="tel:9837124589"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-soft transition-colors"
                title="Call Technician"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>

            {/* OTP Security Verification Box */}
            <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-soft space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-amber-400" />
                  {isHi ? 'दरवाजे पर काम शुरू करने का Start OTP:' : 'Start Job Verification OTP:'}
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {isHi ? 'कारीगर को बताएं' : 'Share on arrival'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="font-mono text-3xl font-black text-amber-400 tracking-widest">{startOtp}</span>
                <p className="text-[11px] text-slate-300 max-w-[180px] leading-tight text-right">
                  {isHi
                    ? 'कारीगर के घर पहुँचने पर यह कोड बताएं ताकि काम शुरू हो सके।'
                    : 'Technician will input this 4-digit code to start the service timer.'}
                </p>
              </div>
            </div>

            {/* Bill & Warranty Note */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px]">Total Transparent Amount:</span>
                <p className="font-extrabold text-slate-900 text-base">₹{totalBill} (Pay Cash/UPI after work)</p>
              </div>
              <span className="badge bg-emerald-100 text-emerald-800 font-bold">₹10,000 Damage Cover</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `*MadadMitra Dispatch Update!*\n` +
                    `• Service: ${serviceName}\n` +
                    `• Technician: Rajesh Kumar (Arriving in ${etaMins} mins)\n` +
                    `• Start OTP: ${startOtp}\n` +
                    `• Bill: ₹${totalBill} (COD to worker)`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }}
                className="btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex-1 flex items-center justify-center gap-2 shadow-soft"
              >
                <span>📲 Share ETA on WhatsApp</span>
              </button>
              <button
                onClick={onClose}
                className="btn-primary py-3 px-5 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatchRadarModal;
