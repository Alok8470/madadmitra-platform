import { useState } from 'react';
import {
    MapPin,
    ArrowLeft,
    CheckCircle2,
    PlusCircle,
    Calendar,
    CreditCard,
    Smartphone,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SERVICE_LABELS } from '../data/mockData';
import { initiatePayment } from '../services/paymentService';
import type { MealPlanConfig, Worker } from '../types';

const PLATFORM_FEE = 15; // ₹15 Madad Suraksha Fee
const TIME_SLOTS = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];
const STEPS = ['Customize', 'Schedule', 'Location', 'Payment'];

interface Props {
    worker: Worker;
    plan: 'daily' | 'weekly' | 'monthly';
    onClose: () => void;
}

export default function CheckoutWizard({ worker, plan, onClose }: Props) {
    const { addBooking, decrementFreeBooking, currentUser } = useApp();
    const [step, setStep] = useState(0);

    // Step 1: Customization
    const [selectedHours, setSelectedHours] = useState(1);
    const [extraGuests, setExtraGuests] = useState(false);
    const [extraUtensils, setExtraUtensils] = useState(false);
    const [extraNonVeg, setExtraNonVeg] = useState(false);
    const [mealPlan] = useState<MealPlanConfig | undefined>(undefined);

    // Step 2: Schedule
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);

    // Step 3: Location
    const [address, setAddress] = useState(`${worker.area}, ${worker.city || 'Agra'}`);

    // Step 4: Payment
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [generatedOtps, setGeneratedOtps] = useState<{ start: string; end: string }>({ start: '4821', end: '9134' });

    // Dynamic Price calculation
    const basePrice = plan === 'daily'
        ? (worker.pricePerVisit * selectedHours)
        : plan === 'weekly'
            ? (worker.pricePerVisit * 6)
            : (worker.dailyRate || worker.pricePerVisit * 0.8) * 26;

    let addonsCost = 0;
    if (extraGuests) addonsCost += 100;
    if (extraUtensils) addonsCost += 50;
    if (extraNonVeg) addonsCost += 150;

    const totalFee = Math.round(basePrice + addonsCost + PLATFORM_FEE);

    const handleNext = () => {
        if (step < STEPS.length - 1) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
        else onClose();
    };

    const handleConfirmPayment = (method: string) => {
        setIsPaymentProcessing(true);
        setPaymentError('');

        // Generate 4-digit OTPs
        const startOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const endOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtps({ start: startOtp, end: endOtp });

        initiatePayment({
            amountRupees: totalFee,
            customerName: currentUser?.fullName || 'Valued Customer',
            customerPhone: currentUser?.phone || '9876543210',
            description: `MadadMitra - ${worker.name} (${SERVICE_LABELS[worker.service]})`,
            notes: { workerId: worker.id, date: selectedDate, time: selectedTime, method: method },
            onSuccess: () => {
                setIsPaymentProcessing(false);
                addBooking({
                    id: `b${Date.now()}`,
                    bookingCode: `MM-${Math.floor(100000 + Math.random() * 900000)}`,
                    workerName: worker.name,
                    workerId: worker.id,
                    service: worker.service,
                    date: selectedDate,
                    time: plan === 'daily' ? `${selectedTime} (${selectedHours} hr)` : `${plan.toUpperCase()} Plan`,
                    status: 'accepted',
                    paymentStatus: 'paid_online',
                    fee: PLATFORM_FEE,
                    totalAmount: totalFee,
                    area: worker.area,
                    address: address,
                    mealPlan: mealPlan,
                    startJobOtp: startOtp,
                    endJobOtp: endOtp,
                });
                decrementFreeBooking();
                setPaymentSuccess(true);
            },
            onError: (errMsg) => {
                setIsPaymentProcessing(false);
                setPaymentError(errMsg);
            },
        });
    };

    if (paymentSuccess) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-in">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h1 className="font-display text-3xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h1>
                <p className="text-slate-600 mb-6">
                    Your {plan === 'daily' ? 'service' : `${plan} subscription`} with <strong>{worker.name}</strong> is confirmed.
                </p>

                {/* OTP Security Verification Box */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-brand-950 p-6 text-white text-left shadow-xl mb-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-amber-400" />
                            <span className="font-bold text-sm tracking-wide">Madad OTP Security Codes</span>
                        </div>
                        <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            सुरक्षित सेवा
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                            <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">1. Start OTP (काम शुरू)</p>
                            <p className="font-mono text-3xl font-black text-amber-300 mt-1">{generatedOtps.start}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Share when helper arrives at door</p>
                        </div>
                        <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                            <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">2. End OTP (काम समाप्त)</p>
                            <p className="font-mono text-3xl font-black text-emerald-300 mt-1">{generatedOtps.end}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Share only after inspecting final work</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6 bg-slate-50 border border-slate-100 text-left space-y-3 mb-8">
                    <p className="text-sm"><strong>Date:</strong> {selectedDate}</p>
                    <p className="text-sm"><strong>Time:</strong> {selectedTime}</p>
                    <p className="text-sm"><strong>Address:</strong> {address}</p>
                    <p className="text-sm"><strong>Total Bill:</strong> ₹{totalFee}</p>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        <span>Protected by <strong>₹1,500 Madad Suraksha Guarantee</strong> + 7-Day Re-work Warranty.</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => {
                            const text = encodeURIComponent(
                                `*MadadMitra Booking Confirmed!*\n` +
                                `• Helper: ${worker.name} (${SERVICE_LABELS[worker.service]})\n` +
                                `• Date & Time: ${selectedDate} at ${selectedTime}\n` +
                                `• Start OTP: ${generatedOtps.start}\n` +
                                `• Total Bill: ₹${totalFee}\n` +
                                `Address: ${address}`
                            );
                            window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                        }}
                        className="btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-soft flex-1 active:scale-95 transition-transform"
                    >
                        <span>📲 WhatsApp Summary to Family</span>
                    </button>
                    <button onClick={onClose} className="btn-primary py-3.5 px-6 text-sm font-bold shadow-soft flex-1">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-28 max-w-2xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
            {/* Header / Stepper */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={handleBack} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                    <h2 className="font-display text-xl font-extrabold text-slate-900">Secure Checkout</h2>
                    <div className="flex items-center gap-2 mt-2">
                        {STEPS.map((_, idx) => (
                            <div key={idx} className="flex-1 flex items-center gap-1.5">
                                <div className={`h-1.5 flex-1 rounded-full ${idx <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase px-1">
                        {STEPS.map((label, idx) => (
                            <span key={idx} className={idx === step ? 'text-brand-600' : ''}>{label}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card p-6 border-slate-100 shadow-sm min-h-[400px]">
                {/* STEP 0: CUSTOMIZE */}
                {step === 0 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-display text-lg font-bold text-slate-900">Configure Service</h3>
                            <p className="text-xs text-slate-500">Tailor visit duration and extra tasks</p>
                        </div>

                        {plan === 'daily' && (
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-700">Estimated Duration</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3].map((hr) => (
                                        <button
                                            key={hr}
                                            onClick={() => setSelectedHours(hr)}
                                            className={`p-3 rounded-xl border text-center transition-all ${
                                                selectedHours === hr
                                                    ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-bold ring-2 ring-brand-500/20'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                        >
                                            <p className="text-sm font-bold">{hr} Hour{hr > 1 ? 's' : ''}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">₹{worker.pricePerVisit * hr}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-700">Add-on Assistance</label>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={extraGuests}
                                            onChange={(e) => setExtraGuests(e.target.checked)}
                                            className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Additional Heavy Fixture / Room (+₹100)</p>
                                            <p className="text-[11px] text-slate-400">Extra switches, taps, or deep scrubbing</p>
                                        </div>
                                    </div>
                                    <PlusCircle className="h-4 w-4 text-slate-400" />
                                </label>

                                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={extraUtensils}
                                            onChange={(e) => setExtraUtensils(e.target.checked)}
                                            className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Post-Work Site Cleanup (+₹50)</p>
                                            <p className="text-[11px] text-slate-400">Clean dust, debris, and leftover wiring/fixtures</p>
                                        </div>
                                    </div>
                                    <PlusCircle className="h-4 w-4 text-slate-400" />
                                </label>

                                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={extraNonVeg}
                                            onChange={(e) => setExtraNonVeg(e.target.checked)}
                                            className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Express Priority Dispatch (+₹150)</p>
                                            <p className="text-[11px] text-slate-400">Guaranteed arrival within 45 minutes</p>
                                        </div>
                                    </div>
                                    <PlusCircle className="h-4 w-4 text-slate-400" />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 1: SCHEDULE */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-display text-lg font-bold text-slate-900">Select Date & Time</h3>
                            <p className="text-xs text-slate-500">Choose when you want {worker.name} to arrive</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-slate-400" /> Visit Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                min={new Date().toISOString().slice(0, 10)}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="input-field py-2 text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Preferred Arrival Slot</label>
                            <div className="grid grid-cols-2 gap-3">
                                {TIME_SLOTS.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedTime(slot)}
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            selectedTime === slot
                                                ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-bold ring-2 ring-brand-500/20'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <p className="text-xs font-bold">{slot}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: LOCATION */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-display text-lg font-bold text-slate-900">Service Address</h3>
                            <p className="text-xs text-slate-500">Provide exact house/flat and landmark</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-brand-600" /> Complete Address & Landmark
                            </label>
                            <textarea
                                rows={4}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="input-field p-3 text-sm"
                                placeholder="House / Flat No., Society / Mohalla, Landmark (e.g. Near Shiv Mandir)"
                            />
                            <p className="text-[11px] text-slate-400">
                                Exact address will only be disclosed to {worker.name} after you confirm booking.
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 3: PAYMENT & SUMMARY */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-display text-lg font-bold text-slate-900">Price Breakdown & Payment</h3>
                            <p className="text-xs text-slate-500">Transparent pricing with zero hidden commissions</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Service Fee ({worker.name})</span>
                                <span className="font-semibold">₹{basePrice}</span>
                            </div>
                            {addonsCost > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Selected Add-ons</span>
                                    <span className="font-semibold">₹{addonsCost}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-brand-700 font-medium">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck className="h-3.5 w-3.5" /> Madad Suraksha Fee (7-Day Warranty)
                                </span>
                                <span>₹{PLATFORM_FEE}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                                <span>Total Amount</span>
                                <span className="text-brand-600 text-lg">₹{totalFee}</span>
                            </div>
                        </div>

                        {paymentError && (
                            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                                {paymentError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">Select Payment Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleConfirmPayment('upi')}
                                    disabled={isPaymentProcessing}
                                    className="p-4 rounded-xl border border-slate-200 hover:border-brand-600 hover:bg-brand-50/30 flex flex-col items-center justify-center gap-2 group transition-all"
                                >
                                    <Smartphone className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <p className="text-xs font-extrabold text-slate-900">Instant UPI</p>
                                        <p className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleConfirmPayment('cod')}
                                    disabled={isPaymentProcessing}
                                    className="p-4 rounded-xl border border-slate-200 hover:border-brand-600 hover:bg-brand-50/30 flex flex-col items-center justify-center gap-2 group transition-all"
                                >
                                    <CreditCard className="h-6 w-6 text-brand-600 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <p className="text-xs font-extrabold text-slate-900">Pay Helper (COD)</p>
                                        <p className="text-[10px] text-slate-400">Cash / Direct UPI</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Navigation */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="btn-secondary py-2.5 px-5 text-xs font-bold"
                    >
                        {step === 0 ? 'Cancel' : 'Back'}
                    </button>

                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="btn-primary py-2.5 px-6 text-xs font-bold"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            onClick={() => handleConfirmPayment('upi')}
                            disabled={isPaymentProcessing}
                            className="btn-primary py-3 px-8 text-xs font-bold shadow-lg flex items-center gap-2"
                        >
                            {isPaymentProcessing ? 'Securing Booking...' : `Book for ₹${totalFee}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
