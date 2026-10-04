import { useState } from 'react';
import { Sparkles, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

export default function SavingsCalculator() {
  const [visitsPerMonth, setVisitsPerMonth] = useState(25); // Default: Daily monthly worker (25 days)

  // Calculations:
  // MadadMitra: visits * ₹260 + (monthly single ₹10 platform fee or per booking ₹10) = ~₹6,510
  // Corporate apps: visits * ₹340 (25-30% platform markup) + ₹499 subscription fee = ~₹9,000
  // Offline Broker: ₹1,500 commission + visits * ₹280 = ~₹8,500
  const baseCost = visitsPerMonth * 260;
  const madadMitraCost = baseCost + 10;
  const aggregatorAppCost = Math.round(visitsPerMonth * 330 + (visitsPerMonth > 5 ? 499 : 150));
  const brokerCost = baseCost + 1500;

  const monthlySavingsVsAggregator = Math.max(0, aggregatorAppCost - madadMitraCost);
  const annualSavings = monthlySavingsVsAggregator * 12;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" /> Transparent Pricing
          </span>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            How Much Do You Save With MadadMitra?
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
            See the exact difference between our flat ₹10 convenience fee vs high agency commissions
            and premium app markups.
          </p>
        </div>

        {/* Big Savings Highlight */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-soft shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Estimated Annual Savings
          </p>
          <div className="mt-1 font-display text-3xl sm:text-4xl font-black">
            ₹{annualSavings.toLocaleString('en-IN')}
          </div>
          <p className="mt-0.5 text-[11px] text-emerald-100">
            Saved on commission & membership fees
          </p>
        </div>
      </div>

      {/* Slider Control */}
      <div className="mt-8 rounded-2xl bg-slate-50 p-5 border border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Your Frequency:
          </label>
          <span className="rounded-xl bg-white px-3 py-1 text-sm font-extrabold text-brand-700 shadow-sm border border-slate-200">
            {visitsPerMonth} {visitsPerMonth === 1 ? 'Visit' : 'Visits'} / Month ({visitsPerMonth >= 20 ? 'Daily Regular' : visitsPerMonth >= 8 ? 'Weekly Regular' : 'Occasional'})
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={visitsPerMonth}
          onChange={(e) => setVisitsPerMonth(Number(e.target.value))}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2">
          <span>1 time / month</span>
          <span>8 times (Weekend only)</span>
          <span>25 times (Daily contract)</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MadadMitra (Winning Card) */}
        <div className="relative rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 p-5 shadow-sm">
          <span className="badge absolute -top-3 right-4 bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 shadow-sm">
            Best Value
          </span>
          <p className="font-display font-extrabold text-slate-900 text-base">MadadMitra</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Flat ₹10 platform fee</p>
          <div className="mt-4 font-display text-2xl font-black text-emerald-800">
            ₹{madadMitraCost.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-500">/mo</span>
          </div>
          <ul className="mt-4 space-y-2 text-xs font-medium text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Just ₹10 platform fee</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>100% money goes to helper</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Free instant replacement guarantee</span>
            </li>
          </ul>
        </div>

        {/* Corporate Aggregators / Big Tech */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="font-display font-bold text-slate-700 text-base">Corporate Apps / Aggregators</p>
          <p className="text-[11px] text-slate-400 mt-0.5">High commission & club fee</p>
          <div className="mt-4 font-display text-2xl font-bold text-slate-700">
            ₹{aggregatorAppCost.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </div>
          <ul className="mt-4 space-y-2 text-xs text-slate-500">
            <li className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-error-500 shrink-0" />
              <span>25% - 30% platform markup</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-error-500 shrink-0" />
              <span>₹499 mandatory annual membership</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0" />
              <span>App-based booking</span>
            </li>
          </ul>
        </div>

        {/* Offline Brokers & Local Agencies */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="font-display font-bold text-slate-700 text-base">Local Maid Agencies</p>
          <p className="text-[11px] text-slate-400 mt-0.5">High broker cut & no safety</p>
          <div className="mt-4 font-display text-2xl font-bold text-slate-700">
            ₹{brokerCost.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </div>
          <ul className="mt-4 space-y-2 text-xs text-slate-500">
            <li className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-error-500 shrink-0" />
              <span>₹1,500 - ₹3,000 upfront broker commission</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-error-500 shrink-0" />
              <span>No police or background checks</span>
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-error-500 shrink-0" />
              <span>No backup when maid disappears</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
