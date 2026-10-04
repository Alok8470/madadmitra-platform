import { useState } from 'react';
import { Zap, Clock, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { SERVICE_LABELS, type ServiceId } from '../data/mockData';

interface SOSBookingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SOSBookingModal({ open, onClose }: SOSBookingModalProps) {
  const { workers, city, addBooking, setView } = useApp();
  const [selectedService, setSelectedService] = useState<ServiceId>('cook');
  const [step, setStep] = useState<'select' | 'dispatched'>('select');
  const [matchedWorker, setMatchedWorker] = useState<string>('');

  const availableHelpers = workers.filter(
    (w) => w.online && (!w.city || w.city.toLowerCase() === city.toLowerCase()) && w.service === selectedService
  );

  const handleDispatch = () => {
    const candidate = availableHelpers[0] || workers.find((w) => w.online) || workers[0];
    setMatchedWorker(candidate.name);

    addBooking({
      id: `SOS-${Date.now().toString().slice(-4)}`,
      workerName: candidate.name,
      service: selectedService,
      date: 'Today (Within 30 Mins)',
      time: 'Immediate Express Dispatch',
      status: 'upcoming',
      fee: 10,
      totalAmount: candidate.pricePerVisit + 30 + 10, // +₹30 express priority fee
      area: candidate.area,
      address: `Immediate residential call in ${city}`,
      isUrgentSOS: true,
      notes: '🚨 URGENT 30-MIN DISPATCH: Helper summoned with high priority.',
    });

    setStep('dispatched');
  };

  const handleViewBookings = () => {
    onClose();
    setView('bookings');
  };

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="py-2 space-y-4">
        {step === 'select' ? (
          <div>
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-sm border border-amber-200">
                <Zap className="h-7 w-7 text-amber-600 animate-bounce" />
              </div>
              <span className="badge bg-amber-100 text-amber-900 font-extrabold uppercase mt-3">
                Emergency Rapid Response
              </span>
              <h3 className="mt-1 font-display text-2xl font-black text-slate-900">
                Summon Helper in 30 Minutes
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Maid absent or urgent guests arriving in {city}? We ping nearby available
                helpers directly via WhatsApp with express priority.
              </p>
            </div>

            {/* Select category */}
            <div className="mt-6 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Required Service
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['cook', 'cleaner', 'electrician', 'plumber'] as ServiceId[]).map((srv) => (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => setSelectedService(srv)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                      selectedService === srv
                        ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-200'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {SERVICE_LABELS[srv]}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing note */}
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between border border-slate-200">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Clock className="h-4 w-4 text-amber-600" /> Guaranteed arrival in 30-45 mins
              </span>
              <span className="font-bold text-slate-900">+₹30 Express Fee</span>
            </div>

            <button
              onClick={handleDispatch}
              className="btn-primary bg-amber-600 hover:bg-amber-700 w-full mt-5 py-3 text-xs font-black shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" /> Dispatch Nearest Available Helper
            </button>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-display text-2xl font-extrabold text-slate-900">
              SOS Helper Dispatched!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              <span className="font-bold text-slate-900">{matchedWorker}</span> has accepted your
              emergency request and is en route to your location in {city}.
            </p>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-bold">
              ⏱️ Estimated Arrival: 25 - 35 Minutes
            </div>
            <button
              onClick={handleViewBookings}
              className="btn-primary w-full py-3 text-xs font-bold"
            >
              Track in My Bookings
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
