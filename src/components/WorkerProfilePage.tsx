import { useState, useEffect } from 'react';
import {
    Star,
    BadgeCheck,
    ShieldCheck,
    Clock,
    ArrowLeft,
    CheckCircle2,
    Zap,
    Sparkles,
    Info
} from 'lucide-react';
import { SERVICE_LABELS, type Worker } from '../data/mockData';
import SafetyBadgeModal from './SafetyBadgeModal';
import CheckoutWizard from './CheckoutWizard';
import SubscriptionWizard from './SubscriptionWizard';

interface Props {
    worker: Worker;
    onBack: () => void;
}

export default function WorkerProfilePage({ worker, onBack }: Props) {
    const [checkoutPlan, setCheckoutPlan] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
    const [showSafetyModal, setShowSafetyModal] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [worker.id]);

    if (checkoutPlan === 'weekly' || checkoutPlan === 'monthly') {
        return (
            <SubscriptionWizard 
                worker={worker} 
                plan={checkoutPlan} 
                onClose={() => setCheckoutPlan(null)} 
            />
        );
    }

    if (checkoutPlan === 'daily') {
        return (
            <CheckoutWizard 
                worker={worker} 
                plan={checkoutPlan} 
                onClose={() => setCheckoutPlan(null)} 
            />
        );
    }

    return (
        <div className="pb-28 max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full max-w-full overflow-x-hidden">
            <button
                onClick={onBack}
                className="btn-ghost mb-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Search Results
            </button>

            {/* Profile Header */}
            <div className="card p-4 sm:p-8">
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
                        onClick={() => setShowSafetyModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> Identity Verified
                    </button>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Police Clearance
                    </span>
                </div>
            </div>

            {/* About / Description */}
            <div className="mt-6 card p-6">
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">About {worker.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Experienced and reliable helper from Deoria. Specializes in household {worker.service} services. Known for punctuality, hygienic work standards, and respectful behavior.
                </p>

                <div className="rounded-xl bg-brand-50 p-4 flex gap-3 items-start border border-brand-100">
                    <Info className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-brand-900">100% Satisfaction Guarantee</p>
                        <p className="text-xs text-brand-700 mt-1">If you are not satisfied with the first visit, MadadMitra will provide a free replacement instantly.</p>
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

                        <button onClick={() => setCheckoutPlan('weekly')} className="btn-ghost mt-6 w-full border border-brand-200 text-brand-700 hover:bg-brand-50">
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

                        <button onClick={() => setCheckoutPlan('monthly')} className="btn-accent mt-6 w-full font-bold shadow-md">
                            Subscribe Monthly
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Bar for Daily Booking */}
            <div className="fixed bottom-0 inset-x-0 border-t border-slate-200 bg-white px-3 sm:px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-2xl z-40 box-border">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400">One-time Trial (1 Hour)</p>
                        <p className="font-display text-2xl font-extrabold text-slate-900">
                            ₹{worker.pricePerVisit} <span className="text-xs font-normal text-slate-500">starts at</span>
                        </p>
                    </div>
                    <button onClick={() => setCheckoutPlan('daily')} className="btn-primary px-8 py-3.5 text-base">
                        Book Now
                    </button>
                </div>
            </div>

            <SafetyBadgeModal open={showSafetyModal} onClose={() => setShowSafetyModal(false)} worker={worker} />
        </div>
    );
}