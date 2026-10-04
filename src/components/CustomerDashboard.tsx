import { useState } from 'react';
import { Calendar, IndianRupee, UserMinus, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, BadgeCheck, Star, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';

const CONTRACT_TOTAL = 3000;
const CONTRACT_DAYS = 30;
const DAILY = CONTRACT_TOTAL / CONTRACT_DAYS; // 100

export default function CustomerDashboard() {
  const { contractActive, setContractActive, workerAbsent, setWorkerAbsent, currentContractWorker, workers, setView } = useApp();
  const [absentModal, setAbsentModal] = useState(false);
  const [flow, setFlow] = useState<'idle' | 'temp-confirm' | 'temp-done' | 'refund-confirm' | 'refund-done'>('idle');
  const [tempWorkerName, setTempWorkerName] = useState<string | null>(null);

  const onlineWorkers = workers.filter((w) => w.online && w.name !== currentContractWorker).slice(0, 3);
  const daysUsed = 12;
  const daysLeft = CONTRACT_DAYS - daysUsed;
  const refundAmount = Math.round(DAILY * 0.8); // 20% charge on today's ₹100

  const openAbsent = () => {
    setWorkerAbsent(true);
    setAbsentModal(true);
  };

  const handleTemp = () => {
    const pick = onlineWorkers[0];
    setTempWorkerName(pick?.name ?? 'Raju Yadav');
    setFlow('temp-confirm');
  };

  const confirmTemp = () => {
    setFlow('temp-done');
  };

  const handleRefund = () => {
    setFlow('refund-confirm');
  };

  const confirmRefund = () => {
    setFlow('refund-done');
  };

  const closeAll = () => {
    setAbsentModal(false);
    setFlow('idle');
    setTempWorkerName(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">Customer Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your monthly helper contract</p>
        </div>
        <button onClick={() => setView('home')} className="btn-ghost text-sm">
          <ArrowRight className="h-4 w-4 rotate-180" /> Home
        </button>
      </div>

      {/* CONTRACT CARD OR EMPTY STATE */}
      {!contractActive || !currentContractWorker ? (
        <div className="mt-6 card p-8 sm:p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 shadow-soft">
            <Calendar className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-display text-xl sm:text-2xl font-extrabold text-slate-900">
            No Active Monthly Contract
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            When you hire a verified cook or maid on a recurring monthly contract, your plan will appear here with MadadMitra automated absence replacement and 20% refund protection.
          </p>
          <button
            onClick={() => setView('home')}
            className="btn-primary mt-6 py-2.5 px-6 text-xs font-bold shadow-soft"
          >
            Explore Household Services
          </button>
        </div>
      ) : (
        <div className="mt-6 card overflow-hidden">
          <div className={`flex items-center justify-between px-5 py-3 ${contractActive ? 'bg-success-50' : 'bg-slate-100'}`}>
            <span className={`badge ${contractActive ? 'bg-success-100 text-success-700' : 'bg-slate-200 text-slate-500'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${contractActive ? 'bg-success-500 animate-pulse' : 'bg-slate-400'}`} />
              {contractActive ? 'Contract Active' : 'Contract Paused'}
            </span>
            <span className="text-xs font-semibold text-slate-500">Monthly Plan</span>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-rose-500 text-white text-lg font-bold shadow-soft">
                {currentContractWorker.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display text-lg font-bold text-slate-900">{currentContractWorker}</h2>
                  <BadgeCheck className="h-4 w-4 text-brand-600" />
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-amber-600">4.9</span>
                  <span>•</span>
                  <span>Cook (Daily)</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-extrabold text-slate-900">₹{CONTRACT_TOTAL}</div>
                <div className="text-xs text-slate-400">/month</div>
              </div>
            </div>

            {/* Split breakdown */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-xs font-semibold text-slate-400">Daily Rate</div>
                <div className="font-display text-lg font-bold text-slate-900">₹{DAILY}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-xs font-semibold text-slate-400">Days Used</div>
                <div className="font-display text-lg font-bold text-slate-900">{daysUsed}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-xs font-semibold text-slate-400">Days Left</div>
                <div className="font-display text-lg font-bold text-slate-900">{daysLeft}</div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Contract progress</span>
                <span>{Math.round((daysUsed / CONTRACT_DAYS) * 100)}%</span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all" style={{ width: `${(daysUsed / CONTRACT_DAYS) * 100}%` }} />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-slate-100">
              <button onClick={openAbsent} className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5">
                <UserMinus className="h-4 w-4" /> Helper is Absent Today
              </button>
              <button
                onClick={() => setContractActive(!contractActive)}
                className="btn-ghost py-2.5 px-4 text-xs font-bold text-slate-600 border border-slate-200"
              >
                <RefreshCw className="h-3.5 w-3.5" /> {contractActive ? 'Pause Contract' : 'Resume Contract'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* INFO ROW */}
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <div className="card p-4 flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">1-Day Temporary Switch</h3>
            <p className="text-xs text-slate-500 mt-0.5">Get a temporary worker if your helper is absent — zero extra fees.</p>
          </div>
        </div>
        <div className="card p-4 flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent-100 text-accent-600 shrink-0">
            <IndianRupee className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Refund policy</h3>
            <p className="text-xs text-slate-500 mt-0.5">A 20% processing retention fee applies on cancellation; the rest is refunded.</p>
          </div>
        </div>
      </div>

      {/* ABSENT MODAL */}
      <Modal open={absentModal} onClose={closeAll} maxWidth="max-w-md">
        {flow === 'idle' && (
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-error-100 text-error-600 animate-scale-in">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">High Alert!</h3>
                <p className="text-sm text-slate-500">Your helper is absent today</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              <span className="font-semibold">{currentContractWorker}</span> is unavailable today. Choose an option below — get a temporary worker for the day, or cancel and claim a refund.
            </p>

            <div className="mt-5 space-y-2.5">
              <button onClick={handleTemp} className="btn-primary w-full text-left justify-start p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 shrink-0">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold">Find Temporary 1-Day Worker</div>
                  <div className="text-xs text-brand-100 font-normal">Matched with an alternative live worker • Zero extra fees</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </button>

              <button onClick={handleRefund} className="btn w-full text-left justify-start bg-white border border-slate-200 hover:bg-slate-50 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-error-50 text-error-600 shrink-0">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Cancel & Claim Refund</div>
                  <div className="text-xs text-slate-500">Note: A 20% processing retention fee applies (You receive ₹{refundAmount} back to your wallet).</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {flow === 'temp-confirm' && (
          <div className="text-center py-2">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-600 animate-scale-in">
              <RefreshCw className="h-8 w-8" />
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-slate-900">Confirm temporary worker</h3>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-semibold">{tempWorkerName}</span> will arrive at your home today. No extra charge — today's ₹{DAILY} will simply be adjusted.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-left">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white font-bold text-sm">
                  {tempWorkerName?.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{tempWorkerName}</div>
                  <div className="text-xs text-slate-500">Verified • 4.7 rating</div>
                </div>
                <BadgeCheck className="h-4 w-4 text-brand-600 ml-auto" />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={closeAll} className="btn-ghost flex-1">Go back</button>
              <button onClick={confirmTemp} className="btn-primary flex-1">Confirm</button>
            </div>
          </div>
        )}

        {flow === 'temp-done' && (
          <div className="text-center py-2">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-100 text-success-600 animate-scale-in">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-slate-900">All set!</h3>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-semibold">{tempWorkerName}</span> will arrive at your home today. Zero extra charges applied. <span className="font-semibold">{currentContractWorker}</span> will resume from tomorrow.
            </p>
            <button onClick={closeAll} className="btn-primary mt-5 w-full">Done</button>
          </div>
        )}

        {flow === 'refund-confirm' && (
          <div className="py-2">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-warning-100 text-warning-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">Confirm refund</h3>
                <p className="text-sm text-slate-500">Refund for today's service</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-error-50 border border-error-100 p-4">
              <p className="text-sm text-error-700">
                Note: A <span className="font-bold">20% processing retention fee</span> applies. You will receive <span className="font-bold">₹{refundAmount} back to your wallet</span> (₹{DAILY - refundAmount} retained from today's ₹{DAILY}).
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-sm text-slate-500">Today's amount</span>
              <span className="font-bold text-slate-900">₹{DAILY}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-sm text-slate-500">Processing fee (20%)</span>
              <span className="font-bold text-error-600">-₹{DAILY - refundAmount}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between rounded-xl bg-success-50 p-3 border border-success-100">
              <span className="text-sm font-semibold text-success-700">You receive</span>
              <span className="font-display text-lg font-extrabold text-success-700">₹{refundAmount}</span>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={closeAll} className="btn-ghost flex-1">Go back</button>
              <button onClick={confirmRefund} className="btn flex-1 bg-success-600 text-white hover:bg-success-700 shadow-soft">
                <CheckCircle2 className="h-4 w-4" /> Claim refund
              </button>
            </div>
          </div>
        )}

        {flow === 'refund-done' && (
          <div className="text-center py-2">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-100 text-success-600 animate-scale-in">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-slate-900">Refund processed!</h3>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-bold text-success-700">₹{refundAmount}</span> will be credited to your wallet within 3-5 business days. A 20% processing retention fee was applied.
            </p>
            <button onClick={closeAll} className="btn-primary mt-5 w-full">Done</button>
          </div>
        )}
      </Modal>

      {/* Absent banner */}
      {workerAbsent && flow === 'idle' && !absentModal && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-error-50 border border-error-100 p-4">
          <AlertTriangle className="h-5 w-5 text-error-600 shrink-0" />
          <p className="text-sm text-error-700">
            Your helper has been marked absent today. Use the button above to take action.
          </p>
          <button onClick={() => setAbsentModal(true)} className="btn bg-error-600 text-white px-3 py-1.5 text-xs ml-auto shrink-0">
            Take action
          </button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Calendar className="h-3.5 w-3.5" /> Contract period: 01 Jul 2026 – 30 Jul 2026
      </div>
    </div>
  );
}
