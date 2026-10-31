import React from 'react';
import { ShieldCheck, CheckCircle2, Award, FileText, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const MadadSurakshaModal: React.FC<Props> = ({ open, onClose }) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border-2 border-slate-200 shadow-elevated p-6 sm:p-8 text-slate-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Certificate Header */}
        <div className="text-center pb-4 border-b border-slate-150">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-soft mb-3">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <span className="badge bg-emerald-100 text-emerald-800 font-black tracking-widest text-[10px] uppercase px-3 py-1">
            OFFICIAL MADAD SURAKSHA POLICY
          </span>
          <h2 className="font-display text-2xl font-black text-slate-950 mt-2">
            {isHi ? 'मदद सुरक्षा ₹10,000 गारंटी प्रमाणपत्र' : 'Madad Suraksha ₹10,000 Protection Certificate'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isHi
              ? 'अर्बन कंपनी से 3 गुना बेहतर व पारदर्शी घरेलू सुरक्षा'
              : 'Enterprise-grade protection with local neighborhood accountability'}
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="mt-5 space-y-3.5">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white font-bold">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-950 text-sm">
                {isHi ? '₹10,000 आकस्मिक संपत्ति सुरक्षा' : '₹10,000 Property Damage Cover'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {isHi
                  ? 'काम के दौरान किसी भी आकस्मिक टूट-फूट या नुकसान पर प्लेटफॉर्म के सुरक्षा पूल द्वारा तुरंत ₹10,000 तक का दावा निपटान।'
                  : 'Instant platform-backed compensation up to ₹10,000 for accidental plumbing pipe, electrical, or structural damages.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-950 text-sm">
                {isHi ? '7-दिन की मुफ़्त री-वर्क वारंटी' : '7-Day Free Re-work Warranty'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {isHi
                  ? 'यदि काम के 7 दिनों के भीतर वही नल फिर टपके या वही स्विच खराब हो, तो बिना किसी विज़िट शुल्क के दोबारा फ्री रिपेयर।'
                  : 'If the same problem recurs within 7 days, a senior verified technician revisits and repairs it at ₹0 visit charge.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-slate-950 font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-950 text-sm">
                {isHi ? 'स्थानीय हार्डवेयर स्टोर व आधार सत्यापन' : 'Local Nodal Store Vouching & Aadhaar KYC'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {isHi
                  ? 'हर कारीगर यूआईडीएआई आधार और आपके इलाके के हार्डवेयर स्टोर (जैसे श्री राम हार्डवेयर) की व्यक्तिगत गारंटी से जुड़ा है।'
                  : 'Every technician is physically endorsed by registered neighborhood hardware merchants who act as local guarantors.'}
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Snippet */}
        <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            {isHi ? '0% कमीशन का वादा:' : 'The 0% Commission Fair Work Pledge:'}
          </p>
          <p className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
            {isHi
              ? 'अर्बन कंपनी कारीगर की कमाई से 25-30% कमीशन काटती है जिससे कारीगर असंतुष्ट रहते हैं। मदद मित्र पर 100% मजदूरी कारीगर की है, जिससे वे पूरे समर्पण से काम करते हैं।'
              : 'Unlike Urban Company taking 25-30% cuts from worker wages, MadadMitra gives 100% cash to technicians. Happy, respected local partners deliver superior craftsmanship.'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn-primary w-full mt-6 py-3.5 text-sm font-bold shadow-soft"
        >
          {isHi ? 'प्रमाणपत्र बंद करें' : 'Acknowledge Protection'}
        </button>
      </div>
    </div>
  );
};

export default MadadSurakshaModal;
