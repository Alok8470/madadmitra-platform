import { useState, useEffect } from 'react';
import {
    Star,
    BadgeCheck,
    ShieldCheck,
    Clock,
    MapPin,
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Smartphone,
    Zap,
    Sparkles,
    Info,
    PlusCircle,
    AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SERVICE_LABELS, type Worker } from '../data/mockData';
import Modal from './Modal';
import MealCustomizerModal from './MealCustomizerModal';
import SafetyBadgeModal from './SafetyBadgeModal';
import type { MealPlanConfig } from '../types';

import { initiatePayment } from '../services/paymentService';

const PLATFORM_FEE = 10;

const TIME_SLOTS = [
    '08:00 AM',
    '10:00 AM',
    '12:00 PM',
    '02:00 PM',
    '04:00 PM',
    '06:00 PM',
];

const DURATION_OPTIONS = [1, 2, 3];

interface Props {
    worker: Worker;
    onBack: () => void;
}

export default function WorkerProfilePage({ worker, onBack }: Props) {
    const { addBooking, decrementFreeBooking, setView, currentUser } = useApp();

    // Reset scroll to top whenever worker profile opens
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [worker.id]);

    const [bookingType, setBookingType] = useState<'daily' | 'subscription'>('daily');
    const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | null>(null);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
    const [selectedHours, setSelectedHours] = useState(1);
    const [address, setAddress] = useState(`${worker.area}, ${worker.city || 'Deoria'}`);

    // Add-on Extras State
    const [extraGuests, setExtraGuests] = useState(false);
    const [extraUtensils, setExtraUtensils] = useState(false);
    const [extraNonVeg, setExtraNonVeg] = useState(false);

    // Modal States
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showMealModal, setShowMealModal] = useState(false);
    const [showSafetyModal, setShowSafetyModal] = useState(false);
    const [mealPlan, setMealPlan] = useState<MealPlanConfig | undefined>(undefined);
    const [isPaymentStep, setIsPaymentStep] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // Calculate Active Add-ons Count
    const selectedAddonsCount = (extraGuests ? 1 : 0) + (extraUtensils ? 1 : 0) + (extraNonVeg ? 1 : 0);

    // Determine Required Minimum Hours based on Add-ons
    let minRequiredHours = 1;
    if (selectedAddonsCount === 1 || selectedAddonsCount === 2) {
        minRequiredHours = 2;
    } else if (selectedAddonsCount === 3) {
        minRequiredHours = 3;
    }

    // Auto-update duration if selected hours fall below minRequiredHours
    useEffect(() => {
        if (selectedHours < minRequiredHours) {
            setSelectedHours(minRequiredHours);
        }
    }, [selectedAddonsCount, minRequiredHours, selectedHours]);

    const extrasTotal =
        (extraGuests ? 40 : 0) +
        (extraUtensils ? 50 : 0) +
        (extraNonVeg ? 50 : 0);

    const baseSubtotal = bookingType === 'daily'
        ? worker.pricePerVisit * selectedHours
        : selectedPlan === 'weekly'
            ? worker.pricePerVisit * 6 * 0.9
            : worker.pricePerVisit * 25 * 0.8;

    const subtotal = Math.round(baseSubtotal + (bookingType === 'daily' ? extrasTotal : 0));
    const totalFee = Math.round(subtotal + PLATFORM_FEE);

    const handleFinalPayment = (method: 'upi' | 'card' = 'upi') => {
        setIsPaymentProcessing(true);
        setPaymentError('');

        initiatePayment({
            amountRupees: totalFee,
            customerName: currentUser?.fullName || 'Valued Customer',
            customerPhone: currentUser?.phone || '9876543210',
            description: `MadadMitra - ${worker.name} (${SERVICE_LABELS[worker.service]})`,
            notes: {
                workerId: worker.id,
                date: selectedDate,
                time: selectedTime,
                method: method,
            },
            onSuccess: (_paymentId) => {
                setIsPaymentProcessing(false);
                addBooking({
                    id: `b${Date.now()}`,
                    workerName: worker.name,
                    service: worker.service,
                    date: selectedDate,
                    time: bookingType === 'daily' ? `${selectedTime} (${selectedHours} hr)` : `${selectedPlan?.toUpperCase()} Plan`,
                    status: 'upcoming',
                    paymentStatus: 'paid',
                    fee: PLATFORM_FEE,
                    totalAmount: totalFee,
                    area: worker.area,
                    address: address,
                    mealPlan: mealPlan,
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

    const startSubscriptionBooking = (plan: 'weekly' | 'monthly') => {
        setBookingType('subscription');
        setSelectedPlan(plan);
        setIsPaymentStep(false);
        setShowSummaryModal(true);
    };

    const startDailyBooking = () => {
        setBookingType('daily');
        setSelectedPlan(null);
        setIsPaymentStep(false);
        setShowSummaryModal(true);
    };

    return (
        <div className="pb-28 max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <button
                onClick={onBack}
                className="btn-ghost mb-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Search Results
            </button>

            {/* Profile Header */}
            <div className="card p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-2xl ${worker.avatarColor} text-white font-bold text-3xl shadow-soft`}>
                        {worker.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="font-display text-2xl font-extrabold text-slate-900">{worker.name}</h1>
                            {worker.verified && <BadgeCheck className="h-6 w-6 text-brand-600" />}
                        </div>
                        <p className="text-slate-500 font-medium">{SERVICE_LABELS[worker.service]} • {worker.area}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
                            <span className="flex items-center gap-1 text-amber-500">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {worker.rating} (48 Reviews)
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-brand-600">
                                <Clock className="h-4 w-4" /> 4+ Years Experience
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700">{worker.jobs} Jobs Completed</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 flex flex-wrap gap-2.5">
                    <button
                        type="button"
                        onClick={() => setShowSafetyModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200"
                    >
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> Aadhaar Verified (View ID Card)
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSafetyModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800 hover:bg-brand-100 transition-colors border border-brand-200"
                    >
                        <CheckCircle2 className="h-4 w-4 text-brand-600" /> Police Clearance Check
                    </button>
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-800 border border-purple-200">
                        🛡️ ₹10,000 Property Insurance
                    </span>
                </div>
            </div>

            {/* MEAL CUSTOMIZER CARD (FOR COOKS) */}
            {worker.service === 'cook' && (
                <div className="mt-6 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="badge bg-amber-200 text-amber-950 font-black text-[10px]">
                                MEAL SELECTION
                            </span>
                            <span className="text-xs font-bold text-amber-900">
                                {mealPlan ? `✓ ${mealPlan.rotisCount} Rotis • ${mealPlan.sabziType}` : 'No menu selected yet'}
                            </span>
                        </div>
                        <h4 className="mt-1 font-display text-base font-extrabold text-slate-900">
                            Tell {worker.name} What To Cook Today
                        </h4>
                        <p className="text-xs text-slate-600">
                            Set your exact chapati count, sabzi, dal, rice, and spice preference.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowMealModal(true)}
                        className="btn-accent text-xs py-2.5 px-4 font-bold shrink-0 shadow-sm"
                    >
                        {mealPlan ? 'Edit Menu Preferences' : '🍽️ Customize Meal Menu'}
                    </button>
                </div>
            )}

            {/* POLICY BANNER */}
            <div className="mt-6 rounded-2xl bg-amber-50/70 p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                            🛡️ MadadMitra Fair-Work Policy
                        </h4>
                        <ul className="mt-1.5 space-y-1 text-xs text-amber-800 font-medium">
                            <li>• Standard pricing covers family meal/work (Up to 5 members).</li>
                            <li>• Additional heavy work (Extra guests, utensils, non-veg) auto-adjusts required time.</li>
                            <li>• Every slot includes a natural ~30 min buffer for prep and kitchen clean-up.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* DAILY HOURLY SELECTION */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-brand-600" />
                    <h2 className="font-display text-xl font-bold text-slate-900">Book for Daily / Hourly Basis</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="card p-5 sm:p-6 space-y-5">
                        {/* Hours Selector with Auto-Disabled Logic */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase text-slate-400">Select Duration (Hours)</label>
                                {minRequiredHours > 1 && (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Min {minRequiredHours} Hours for selected Add-ons
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-3">
                                {DURATION_OPTIONS.map((hr) => {
                                    const isDisabled = hr < minRequiredHours;
                                    return (
                                        <button
                                            key={hr}
                                            disabled={isDisabled}
                                            onClick={() => setSelectedHours(hr)}
                                            className={`rounded-xl py-3 text-sm font-bold transition-all ${selectedHours === hr
                                                    ? 'bg-brand-600 text-white shadow-soft ring-2 ring-brand-300'
                                                    : isDisabled
                                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                        >
                                            {hr} Hour{hr > 1 ? 's' : ''}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Date Selector */}
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400">Select Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-brand-400"
                            />
                        </div>

                        {/* Time Slot */}
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400">Start Time Slot</label>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                {TIME_SLOTS.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedTime(slot)}
                                        className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all ${selectedTime === slot
                                                ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Location & Addons */}
                    <div className="card p-5 sm:p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-brand-600" /> Service Location
                            </h3>
                            <textarea
                                rows={2}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-brand-400"
                                placeholder="Enter complete address..."
                            />

                            <div className="mt-4 pt-3 border-t border-slate-100">
                                <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                                    <PlusCircle className="h-3.5 w-3.5 text-brand-600" /> Optional Work Add-ons
                                </p>
                                <div className="mt-2 space-y-2 text-xs">
                                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100">
                                        <div>
                                            <span className="text-slate-700 font-medium block">Extra Guests</span>
                                            <span className="text-[10px] text-slate-400 font-normal">Up to 3 guests (6-8 members total)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 font-bold">+₹40</span>
                                            <input type="checkbox" checked={extraGuests} onChange={(e) => setExtraGuests(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-400" />
                                        </div>
                                    </label>
                                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100">
                                        <div>
                                            <span className="text-slate-700 font-medium block">Utensil Washing (Bartan)</span>
                                            <span className="text-[10px] text-slate-400 font-normal">Includes cooking utensils wash</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 font-bold">+₹50</span>
                                            <input type="checkbox" checked={extraUtensils} onChange={(e) => setExtraUtensils(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-400" />
                                        </div>
                                    </label>
                                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100">
                                        <div>
                                            <span className="text-slate-700 font-medium block">Non-Veg Special Prep</span>
                                            <span className="text-[10px] text-slate-400 font-normal">Cleaning & specialized cooking</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 font-bold">+₹50</span>
                                            <input type="checkbox" checked={extraNonVeg} onChange={(e) => setExtraNonVeg(e.target.checked)} className="rounded text-brand-600 focus:ring-brand-400" />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Base rate ({selectedHours} hr):</span>
                                <span className="font-semibold text-slate-900">₹{worker.pricePerVisit * selectedHours}</span>
                            </div>
                            {extrasTotal > 0 && (
                                <div className="flex justify-between text-xs text-slate-600 mt-1">
                                    <span>Work Add-ons ({selectedAddonsCount}):</span>
                                    <span className="font-semibold text-brand-600">+₹{extrasTotal}</span>
                                </div>
                            )}
                            <div className="mt-2 border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                                <span>Hourly Subtotal:</span>
                                <span>₹{worker.pricePerVisit * selectedHours + extrasTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SUBSCRIPTIONS */}
            <div className="mt-10">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h2 className="font-display text-xl font-bold text-slate-900">Regular Helper Subscriptions</h2>
                </div>
                <p className="text-xs text-slate-500 mb-5">Save up to 20% + get free instant worker replacement if absent.</p>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="card relative p-6 border-2 border-brand-100 hover:border-brand-300 transition-all flex flex-col justify-between">
                        <span className="badge absolute top-4 right-4 bg-brand-100 text-brand-700 font-bold text-xs">
                            10% OFF
                        </span>
                        <div>
                            <h3 className="font-display text-lg font-bold text-slate-900">Weekly Pass (6 Days)</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Best for short-term regular needs.</p>

                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                <Clock className="h-3.5 w-3.5 text-brand-600" /> 1 Visit/Day • ~2 Hours/Visit
                            </div>

                            <div className="mt-4 font-display text-2xl font-extrabold text-slate-900">
                                ₹{Math.round(worker.pricePerVisit * 6 * 0.9)}{' '}
                                <span className="text-xs line-through text-slate-400 font-normal">₹{worker.pricePerVisit * 6}</span>
                            </div>

                            <ul className="mt-4 space-y-2 text-xs font-medium text-slate-600">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Fixed daily arrival time slot</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Meals/Cleaning for full family</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Free replacement guarantee</li>
                            </ul>
                        </div>

                        <button onClick={() => startSubscriptionBooking('weekly')} className="btn-ghost mt-6 w-full border border-brand-200 text-brand-700 hover:bg-brand-50">
                            Subscribe Weekly
                        </button>
                    </div>

                    <div className="card relative p-6 border-2 border-amber-400 bg-gradient-to-b from-amber-50/40 to-white shadow-soft transition-all flex flex-col justify-between">
                        <span className="badge absolute top-4 right-4 bg-amber-400 text-slate-900 font-extrabold text-xs flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5 fill-slate-900" /> 20% OFF
                        </span>
                        <div>
                            <h3 className="font-display text-lg font-bold text-slate-900">Monthly Contract (25 Days)</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Hassle-free household management.</p>

                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-100/80 px-2.5 py-1 text-xs font-bold text-amber-900">
                                <Zap className="h-3.5 w-3.5 text-amber-600" /> 2 Visits/Day (Morning & Evening)
                            </div>

                            <div className="mt-4 font-display text-2xl font-extrabold text-slate-900">
                                ₹{Math.round(worker.pricePerVisit * 25 * 0.8)}{' '}
                                <span className="text-xs line-through text-slate-400 font-normal">₹{worker.pricePerVisit * 25}</span>
                            </div>

                            <ul className="mt-4 space-y-2 text-xs font-medium text-slate-600">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Dedicated monthly worker (Same person)</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Morning & Night food prep (Full family)</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Priority replacement in 30 mins</li>
                            </ul>
                        </div>

                        <button onClick={() => startSubscriptionBooking('monthly')} className="btn-accent mt-6 w-full font-bold shadow-md">
                            Subscribe Monthly
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4 shadow-2xl z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400">Total Payable ({selectedHours} hr{selectedHours > 1 ? 's' : ''})</p>
                        <p className="font-display text-2xl font-extrabold text-slate-900">
                            ₹{worker.pricePerVisit * selectedHours + extrasTotal + PLATFORM_FEE}{' '}
                            <span className="text-xs font-normal text-slate-500">(Fee ₹{PLATFORM_FEE} incl.)</span>
                        </p>
                    </div>
                    <button onClick={startDailyBooking} className="btn-primary px-8 py-3.5 text-base">
                        Book Now ({selectedHours} Hr)
                    </button>
                </div>
            </div>

            {/* MODAL */}
            <Modal open={showSummaryModal} onClose={() => setShowSummaryModal(false)} title={isPaymentStep ? "Complete Payment" : "Booking Summary"}>
                {!paymentSuccess ? (
                    <div>
                        {!isPaymentStep ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`grid h-12 w-12 place-items-center rounded-xl ${worker.avatarColor} text-white font-bold`}>
                                            {worker.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{worker.name}</h4>
                                            <p className="text-xs text-slate-500">{SERVICE_LABELS[worker.service]}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 border-t border-slate-200/60 pt-3 text-xs text-slate-700">
                                        <p className="flex items-center justify-between font-semibold">
                                            <span>Booking Type:</span>
                                            <span className="text-brand-700 uppercase font-bold">{bookingType === 'daily' ? `${selectedHours} Hour(s) Booking` : `${selectedPlan} Subscription`}</span>
                                        </p>
                                        {bookingType === 'daily' && (
                                            <p className="flex items-center justify-between font-semibold">
                                                <span>Date & Slot:</span> <span className="text-slate-900">{selectedDate} at {selectedTime}</span>
                                            </p>
                                        )}
                                        <p className="flex items-center justify-between font-semibold">
                                            <span>Location:</span> <span className="text-slate-900 truncate max-w-[200px]">{address}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-brand-50 p-4 border border-brand-100">
                                    <p className="text-xs font-bold text-brand-800 uppercase">Fee Breakdown</p>
                                    <div className="mt-2 space-y-1.5 text-sm">
                                        <div className="flex justify-between text-slate-600">
                                            <span>{bookingType === 'daily' ? `Worker Base Fee (${selectedHours} hrs)` : 'Subscription Charges'}</span>
                                            <span className="font-semibold text-slate-900">₹{baseSubtotal}</span>
                                        </div>
                                        {bookingType === 'daily' && extrasTotal > 0 && (
                                            <div className="flex justify-between text-slate-600">
                                                <span>Add-on Services</span>
                                                <span className="font-semibold text-slate-900">₹{extrasTotal}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-slate-600">
                                            <span>Platform Convenience Fee</span>
                                            <span className="font-semibold text-slate-900">₹{PLATFORM_FEE}</span>
                                        </div>
                                        <div className="mt-2 border-t border-brand-200 pt-2 flex justify-between font-bold text-brand-900 text-base">
                                            <span>Total Amount</span>
                                            <span>₹{totalFee}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setShowSummaryModal(false)} className="btn-ghost flex-1">Cancel</button>
                                    <button onClick={() => setIsPaymentStep(true)} className="btn-primary flex-1">
                                        Proceed to Pay ₹{totalFee}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <div className="rounded-xl bg-slate-900 text-white p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400">Total Payable</p>
                                        <p className="font-display text-2xl font-extrabold">₹{totalFee}</p>
                                    </div>
                                    <span className="badge bg-brand-600 text-white">MadadMitra Pay</span>
                                </div>

                                {paymentError && (
                                    <div className="rounded-xl bg-error-50 border border-error-200 p-2.5 text-xs text-error-700 font-medium">
                                        {paymentError}
                                    </div>
                                )}

                                {isPaymentProcessing ? (
                                    <div className="py-8 text-center space-y-3">
                                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                                        <p className="text-sm font-bold text-slate-800">Connecting to Payment Gateway...</p>
                                        <p className="text-xs text-slate-400">Please complete the payment in the secure window</p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400">Select Payment Method</label>
                                        <div className="mt-2 space-y-2">
                                            <button
                                                disabled={isPaymentProcessing}
                                                onClick={() => handleFinalPayment('upi')}
                                                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-brand-600 hover:bg-brand-50 transition-all text-left"
                                            >
                                                <span className="flex items-center gap-3 font-semibold text-slate-800 text-sm">
                                                    <Smartphone className="h-5 w-5 text-emerald-600" /> UPI (GPay / PhonePe / Paytm / BHIM)
                                                </span>
                                                <span className="text-xs font-bold text-brand-600">Fast Payment</span>
                                            </button>

                                            <button
                                                disabled={isPaymentProcessing}
                                                onClick={() => handleFinalPayment('card')}
                                                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-brand-600 hover:bg-brand-50 transition-all text-left"
                                            >
                                                <span className="flex items-center gap-3 font-semibold text-slate-800 text-sm">
                                                    <CreditCard className="h-5 w-5 text-brand-600" /> Debit / Credit Card / NetBanking
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">Cards</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    disabled={isPaymentProcessing}
                                    onClick={() => setIsPaymentStep(false)}
                                    className="btn-ghost w-full text-xs text-slate-400"
                                >
                                    ← Back to Summary
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                            <BadgeCheck className="h-10 w-10" />
                        </div>
                        <h3 className="mt-3 font-display text-xl font-bold text-slate-900">Booking Confirmed!</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            Your booking for <span className="font-semibold text-slate-900">{worker.name}</span> has been successfully placed.
                        </p>
                        <button
                            onClick={() => {
                                setShowSummaryModal(false);
                                setView('bookings');
                            }}
                            className="btn-primary w-full mt-6"
                        >
                            Go to My Bookings
                        </button>
                    </div>
                )}
            </Modal>

            {/* MEAL CUSTOMIZER MODAL */}
            {showMealModal && (
                <MealCustomizerModal
                    open={showMealModal}
                    onClose={() => setShowMealModal(false)}
                    onSave={(cfg) => setMealPlan(cfg)}
                    initialConfig={mealPlan}
                    workerName={worker.name}
                />
            )}

            {/* SAFETY & IDENTITY TRUST BADGE MODAL */}
            {showSafetyModal && (
                <SafetyBadgeModal
                    open={showSafetyModal}
                    onClose={() => setShowSafetyModal(false)}
                    worker={worker}
                />
            )}
        </div>
    );
}