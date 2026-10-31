import { useState } from 'react';
import { ArrowLeft, Wallet, Landmark, ArrowDownRight, Clock, ShieldCheck, PlusCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WalletPage() {
    const { currentUser, setView } = useApp();
    const [sikkeBalance, setSikkeBalance] = useState(5);

    if (!currentUser) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center animate-fade-in">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 mb-4">
                    <Wallet className="h-8 w-8" />
                </div>
                <h2 className="font-display text-2xl font-extrabold text-slate-900">Sign in to view Wallet</h2>
                <p className="mt-2 text-slate-500">Manage your earnings, lead tokens, and refund protections.</p>
                <button onClick={() => setView('home')} className="btn-primary mt-6">Back to Home</button>
            </div>
        );
    }

    const isWorker = currentUser.role === 'worker';

    return (
        <div className="pb-28 max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-fade-in w-full max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView(isWorker ? 'worker' : 'home')} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                            {isWorker ? 'Lead Sikka & Earnings' : 'Madad Wallet & Suraksha'}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500">
                            {isWorker ? 'Manage your lead tokens (सिक्के) and direct customer earnings' : 'Manage your warranty escrow, refunds, and booking coins'}
                        </p>
                    </div>
                </div>
            </div>

            {isWorker ? (
                // ---------------- WORKER WALLET VIEW (SIKKA TOKEN MODEL) ----------------
                <div className="space-y-6 w-full max-w-full">
                    {/* SIKKA TOKENS CARD */}
                    <div className="card bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-4 sm:p-8 text-white relative overflow-hidden shadow-xl w-full max-w-full">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                                <span className="text-amber-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="h-4 w-4" /> Active Lead Tokens (सिक्के)
                                </span>
                                <h2 className="font-display text-4xl sm:text-5xl font-black mt-1 text-white">
                                    {sikkeBalance} <span className="text-amber-200 text-2xl">सिक्के</span>
                                </h2>
                                <p className="text-amber-100 text-xs mt-2 max-w-md">
                                    1 सिक्का = 1 ग्राहक का काम (₹10)। ग्राहक से मिलने वाला 100% नकद आपका है।
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => {
                                        setSikkeBalance(prev => prev + 10);
                                        alert('10 सिक्के सफलतापूर्वक जोड़े गए! ₹100 UPI द्वारा प्राप्त हुए।');
                                    }}
                                    className="btn bg-white text-slate-950 hover:bg-amber-50 px-5 py-3 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm"
                                >
                                    <PlusCircle className="h-4 w-4 text-amber-600" />
                                    <span>10 सिक्के खरीदें (₹100)</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DIRECT CASH COLLECTION EXPLANATION */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="text-xs text-emerald-900 leading-relaxed">
                            <strong>100% Direct Settlement Policy: </strong>
                            MadadMitra does NOT deduct 20-30% from your hard work. Customers pay the service fee directly to you in physical cash or via your personal QR code upon End OTP confirmation.
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="card p-5 border border-slate-100">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Direct Cash Earned</p>
                            <p className="font-display text-xl font-bold text-slate-900 mt-1">₹8,450</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Retained directly from customers</p>
                        </div>
                        <div className="card p-5 border border-slate-100">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 mb-3">
                                <Clock className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Sikke Used This Month</p>
                            <p className="font-display text-xl font-bold text-slate-900 mt-1">14 Leads</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Platform fee paid: ₹140</p>
                        </div>
                    </div>

                    {/* Bank / UPI Details */}
                    <div className="card p-6 border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Registered UPI ID for Customer Transfers</h3>
                            <button className="text-xs font-bold text-brand-600">Update</button>
                        </div>
                        <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white shadow-sm border border-slate-100">
                                <Landmark className="h-6 w-6 text-slate-700" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">PhonePe / GPay Primary UPI</p>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.phone}@ybl</p>
                            </div>
                            <span className="badge bg-emerald-100 text-emerald-700 font-bold ml-auto text-[10px]">Active</span>
                        </div>
                    </div>
                </div>
            ) : (
                // ---------------- CUSTOMER WALLET VIEW ----------------
                <div className="space-y-6">
                    {/* Madad Suraksha & Protection Card */}
                    <div className="card bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">
                            <ShieldCheck className="h-4 w-4" /> Madad Suraksha Protection Status
                        </div>
                        <h2 className="font-display text-4xl sm:text-5xl font-extrabold">Active ✓</h2>
                        <p className="text-slate-300 text-xs mt-2 max-w-sm leading-relaxed">
                            Every booking made via MadadMitra includes a <strong>7-Day Re-work Guarantee</strong> and up to <strong>₹1,500 property damage buffer</strong>.
                        </p>
                    </div>

                    {/* Saved Payment Methods */}
                    <div className="card p-6 border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Fast UPI & Cards</h3>
                            <button className="text-xs font-bold text-brand-600 flex items-center gap-1">
                                <PlusCircle className="h-3.5 w-3.5" /> Add New
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm border border-slate-100 text-lg font-bold text-brand-700">
                                    UPI
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">Instant PhonePe / Google Pay</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{currentUser.phone}@upi</p>
                                </div>
                                <span className="badge bg-emerald-100 text-emerald-700 ml-auto text-[10px] font-bold">Preferred</span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="card p-6 border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4">Recent In-App Protection Receipts</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600">
                                        <ArrowDownRight className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Madad Suraksha Fee</p>
                                        <p className="text-xs text-slate-500">Electrician Service • Yesterday</p>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-900">₹15</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
