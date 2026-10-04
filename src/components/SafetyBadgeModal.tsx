import { ShieldCheck, Lock, UserCheck, Award } from 'lucide-react';
import Modal from './Modal';
import type { Worker } from '../types';

interface SafetyBadgeModalProps {
  open: boolean;
  onClose: () => void;
  worker: Worker;
}

export default function SafetyBadgeModal({ open, onClose, worker }: SafetyBadgeModalProps) {
  const aadhaarNumber = worker.kyc?.aadhaarLastFour || '8412';
  const policeNo = worker.kyc?.policeVerificationNo || 'UP-VER-2024-9102';

  return (
    <Modal open={open} onClose={onClose} title="Verified Professional Identity">
      <div className="py-2 space-y-4">
        {/* Digital ID Card Preview */}
        <div className="rounded-2xl border-2 border-brand-500 bg-gradient-to-br from-brand-900 to-slate-900 text-white p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top ID Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="font-display text-xs font-black tracking-wider uppercase text-slate-200">
                MadadMitra Trust Card
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-400/30">
              ● VERIFIED PARTNER
            </span>
          </div>

          {/* Partner Photo & Details */}
          <div className="mt-4 flex items-center gap-4">
            <div
              className={`grid h-16 w-16 place-items-center rounded-2xl ${worker.avatarColor} text-white font-black text-2xl shadow-lg border-2 border-white/20`}
            >
              {worker.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-white">{worker.name}</h3>
              <p className="text-xs text-brand-200 font-medium">
                Partner ID: MM-{worker.id.toUpperCase()}-2026
              </p>
              <p className="text-[11px] text-slate-300">
                {worker.area}, {worker.city || 'Deoria'}
              </p>
            </div>
          </div>

          {/* Verification Items Grid */}
          <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] bg-white/5 p-3 rounded-xl border border-white/10">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Govt. Aadhaar</p>
              <p className="font-mono font-bold text-emerald-400">
                XXXX-XXXX-{aadhaarNumber} ✓
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Police Verification</p>
              <p className="font-mono font-bold text-emerald-400 truncate">{policeNo}</p>
            </div>
            <div className="mt-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Punctuality Score</p>
              <p className="font-bold text-amber-300">
                {worker.punctualityRate || 98}% On-Time Record
              </p>
            </div>
            <div className="mt-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Vaccination Status</p>
              <p className="font-bold text-emerald-300">Double Vaccinated ✓</p>
            </div>
          </div>
        </div>

        {/* Safety Guarantees list */}
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <UserCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Physical In-Person Verification: </span>
              Our field manager personally met {worker.name} and verified their residence proof.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Award className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">₹10,000 Property Damage Cover: </span>
              All bookings are insured against accidental household breakage during service.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Lock className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">OTP Protected Service Start: </span>
              The worker can only begin work once you verify their presence and share your OTP.
            </div>
          </div>
        </div>

        <button onClick={onClose} className="btn-primary w-full text-xs py-3 font-bold">
          Close Verification Card
        </button>
      </div>
    </Modal>
  );
}
