import { useMemo, useState } from 'react';
import {
  Search,
  Star,
  BadgeCheck,
  ShieldCheck,
  Clock,
  ThumbsUp,
  Award,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { SERVICES, SERVICE_LABELS, TESTIMONIALS, type ServiceId } from '../data/mockData';
import SavingsCalculator from './SavingsCalculator';
import SOSBookingModal from './SOSBookingModal';
import UrbanCompanyComparison from './UrbanCompanyComparison';

const QUICK_FILTERS: { id: ServiceId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Services' },
  { id: 'cook', label: 'Cook' },
  { id: 'cleaner', label: 'Maid & Cleaning' },
  { id: 'electrician', label: 'Electrician' },
  { id: 'plumber', label: 'Plumber' },
  { id: 'all-rounder', label: 'All-Rounder' },
];

export default function Homepage() {
  const { workers, city, setView, catalogMode, openAuthModal, setSelectedCategory, selectedCategory } = useApp();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ServiceId | 'all'>('all');
  const [showSosModal, setShowSosModal] = useState(false);

  // Filter workers by current selected CITY/AREA, active online status, category, search query, and catalogMode
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      // In production mode (verified_only), only show real KYC partners who signed up
      if (catalogMode === 'verified_only' && !w.isRealPartner && !w.id.startsWith('w_live_')) {
        return false;
      }
      if (!w.online) return false;

      const selectedLower = city.toLowerCase();
      const workerCityLower = (w.city || 'deoria').toLowerCase();
      const workerAreaLower = (w.area || '').toLowerCase();

      let matchCity = true;
      if (selectedLower.includes('all deoria') || selectedLower === 'deoria') {
        // "Deoria (All Areas)" matches any worker in Deoria or its sub-areas
        matchCity = workerCityLower.includes('deoria') || workerAreaLower.length > 0;
      } else if (!selectedLower.includes('coming soon')) {
        // Specific Deoria locality selected (e.g. Raghav Nagar, Salempur)
        matchCity =
          workerAreaLower.includes(selectedLower) ||
          selectedLower.includes(workerAreaLower) ||
          workerCityLower.includes(selectedLower);
      } else {
        // Coming soon city selected
        const cleanComingSoon = selectedLower.replace(' (coming soon)', '').trim();
        matchCity = workerCityLower.includes(cleanComingSoon);
      }

      const matchService = filter === 'all' || w.service === filter;
      const matchQuery =
        !query ||
        w.name.toLowerCase().includes(query.toLowerCase()) ||
        w.area.toLowerCase().includes(query.toLowerCase()) ||
        SERVICE_LABELS[w.service].toLowerCase().includes(query.toLowerCase());
      return matchCity && matchService && matchQuery;
    });
  }, [workers, city, filter, query, catalogMode]);

  const handleSearch = () => {
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-slate-900 text-white">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md ring-1 ring-white/20">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-brand-50">
                  {filteredWorkers.length > 0
                    ? `${city}: ${filteredWorkers.length} Verified ${filteredWorkers.length === 1 ? 'Helper' : 'Helpers'} Available Today`
                    : `${city.replace(' (Coming Soon)', '')}: ${city.includes('Coming Soon') ? 'Partner Pre-Registration Active (Launching Soon)' : 'Real-Time KYC Partner Onboarding Active'}`}
                </span>
              </div>

              <h1 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold leading-[1.12] tracking-tight text-white">
                {t.tagline}
              </h1>
              <p className="mt-4 max-w-xl text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
                {t.subtagline}
              </p>

              {/* Quick Search Bar */}
              <div className="mt-8 rounded-2xl bg-white p-2 shadow-elevated ring-1 ring-slate-100 max-w-xl">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder={t.searchPlaceholder}
                      className="w-full rounded-xl border-0 bg-transparent py-3 pl-11 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="btn-primary w-full sm:w-auto px-6 py-3 text-sm font-bold shadow-soft rounded-xl"
                  >
                    <Search className="h-4 w-4" />
                    {t.searchBtn}
                  </button>
                </div>
              </div>

              {/* Colloquial Hindi Search Prompts */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                <span className="font-semibold text-amber-300 text-[11px]">💡 अक्सर पूछे जाने वाले:</span>
                {[
                  { text: 'नल टपक रहा है (Plumber)', filterKey: 'plumber' },
                  { text: 'पंखा/लाइट फिटिंग (Electrician)', filterKey: 'electrician' },
                  { text: 'घर की सफाई (Maid)', filterKey: 'cleaner' },
                  { text: 'दैनिक खाना (Cook)', filterKey: 'cook' },
                ].map((chip) => (
                  <button
                    key={chip.text}
                    type="button"
                    onClick={() => {
                      setFilter(chip.filterKey as ServiceId);
                      setQuery('');
                      handleSearch();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 text-[11px] font-medium border border-white/15 transition-all"
                  >
                    {chip.text}
                  </button>
                ))}
              </div>

              {/* Quick Filter Pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFilter(f.id);
                      handleSearch();
                    }}
                    className={`pill text-xs ${
                      filter === f.id
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-soft'
                        : 'bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Quick Action Button */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSosModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 text-slate-950 font-black px-4 py-2.5 text-xs shadow-lg hover:bg-amber-300 transition-all active:scale-95"
                >
                  <Zap className="h-4 w-4 fill-slate-950 animate-bounce" />
                  <span>🚨 Urgent 30-Min Dispatch (Emergency Helper)</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Aadhaar & Police Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-accent-400" /> Flat ₹10 Platform Fee
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-sky-400" /> Same-Day Slot Available
                </span>
              </div>
            </div>

            {/* Right Hero Image & Metric Cards */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/15 bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80"
                  alt="Verified household helper"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Floating Metric Card 1 */}
                <div className="absolute top-4 left-4 rounded-2xl bg-white/95 backdrop-blur-md p-3 text-slate-900 shadow-xl flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Quality Standard
                    </p>
                    <p className="text-xs font-extrabold text-slate-900">100% Verified Helpers</p>
                  </div>
                </div>

                {/* Floating Metric Card 2 */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 text-slate-900 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">4.85 / 5.0 Rating</p>
                      <p className="text-[10px] text-slate-400">Across 2,400+ household visits</p>
                    </div>
                  </div>
                  <span className="badge bg-brand-50 text-brand-700 border border-brand-200">
                    Trusted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMING SOON EXPANSION BANNER */}
      {city.includes('Coming Soon') && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white font-bold text-xl shadow-sm">
                🚀
              </div>
              <div>
                <h3 className="font-display font-bold text-amber-950 text-base sm:text-lg">
                  MadadMitra is Expanding: Launching Soon in {city.replace(' (Coming Soon)', '')}!
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-amber-800 leading-relaxed max-w-2xl">
                  We are actively establishing our verified helper network across Eastern Uttar Pradesh. We are currently accepting <strong>pre-registrations for service partners</strong> (Cooks, Maids, Electricians, Plumbers). Full household services are currently live across <strong>Deoria</strong> and its surrounding tehsils.
                </p>
              </div>
            </div>
            <button
              onClick={() => openAuthModal('worker', 'signup')}
              className="btn-primary py-3 px-5 text-xs font-bold whitespace-nowrap self-start sm:self-auto shrink-0 shadow-soft"
            >
              Pre-Register as Partner
            </button>
          </div>
        </section>
      )}

      {/* SECTION: THE MADADMITRA GUARANTEE */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-2xl mx-auto">
            <span className="badge bg-brand-50 text-brand-700 font-bold uppercase text-[10px] tracking-wider px-3 py-1">
              The MadadMitra Guarantee
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Customers Love MadadMitra Over Agencies
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Five-star verified helper quality at transparent local rates with a flat ₹10 platform fee.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700 font-bold">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-sm">Verified Background</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Govt. ID checked & locality references verified before onboarding.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700 font-bold">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-sm">Flat ₹10 Platform Fee</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                No high commission cuts from helpers, no expensive club memberships.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-sm">Absence Guarantee</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                If your regular cook/maid takes unexpected leave, get instant backup or refund.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-700 font-bold">
                <ThumbsUp className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-sm">Pay After Service</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Secure payment with service verification OTP on arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: CATEGORIES GRID */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Categories
            </span>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
              Select Household Service
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            Serving all residential localities in {city}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (setSelectedCategory) setSelectedCategory(s.id);
                  setView('category');
                }}
                className={`group card-hover p-5 text-left flex flex-col justify-between transition-all duration-200 ${
                  selectedCategory === s.id
                    ? 'border-brand-600 ring-2 ring-brand-200 bg-brand-50/40 shadow-soft'
                    : 'bg-white hover:border-brand-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className={`grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br ${s.accent} text-white shadow-soft transition-transform group-hover:scale-105 p-3`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                      Live Now
                    </span>
                  </div>
                  <h3 className="mt-3.5 font-display text-base font-extrabold text-slate-900 group-hover:text-brand-700 transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Starting Visit</span>
                    <span className="font-extrabold text-brand-700 text-sm">₹{s.startingPrice}</span>
                  </div>
                  <span className="text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Book &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* FACTUAL TEARDOWN: MADADMITRA VS URBAN COMPANY */}
      <UrbanCompanyComparison />

      {/* SAVINGS CALCULATOR (MADADMITRA VS COMPETITION) */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-14">
        <SavingsCalculator />
      </section>

      {/* CUSTOMER REVIEWS & TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 mt-14">
          <div className="text-center max-w-2xl mx-auto">
            <span className="badge bg-amber-100 text-amber-900 font-extrabold text-xs uppercase px-3 py-1">
              Customer Stories
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Trusted by Families in Deoria & Eastern UP
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Read how households across Raghav Nagar, Civil Lines, Bhatpar Rani, and Salempur rely on MadadMitra daily.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="card p-5 flex flex-col justify-between border border-slate-200/80 hover:shadow-card transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{t.date}</span>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed italic">
                    "{t.text}"
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      {t.author}
                      {t.verifiedCustomer && (
                        <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {t.locality}, {t.city} • <span className="font-semibold text-brand-700">{t.serviceType}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </section>

      {/* SOS EMERGENCY BOOKING MODAL */}
      {showSosModal && (
        <SOSBookingModal
          open={showSosModal}
          onClose={() => setShowSosModal(false)}
        />
      )}
    </div>
  );
}