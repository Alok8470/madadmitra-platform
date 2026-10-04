import { useMemo, useState } from 'react';
import {
  Search,
  Star,
  BadgeCheck,
  ShieldCheck,
  Clock,
  ArrowRight,
  MapPin,
  ThumbsUp,
  Award,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { SERVICES, SERVICE_LABELS, TESTIMONIALS, type ServiceId, type Worker } from '../data/mockData';
import SavingsCalculator from './SavingsCalculator';
import SOSBookingModal from './SOSBookingModal';

const QUICK_FILTERS: { id: ServiceId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Services' },
  { id: 'cook', label: 'Cook' },
  { id: 'cleaner', label: 'Maid & Cleaning' },
  { id: 'electrician', label: 'Electrician' },
  { id: 'plumber', label: 'Plumber' },
  { id: 'all-rounder', label: 'All-Rounder' },
];

export default function Homepage() {
  const { workers, city, setView, setSelectedWorker, catalogMode, openAuthModal } = useApp();
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

  const handleViewProfile = (worker: Worker) => {
    if (setSelectedWorker) {
      setSelectedWorker(worker);
    }
    setView('worker-profile');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
              <div className="mt-8 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-100 max-w-xl">
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
                        ? 'bg-accent-400 text-slate-950 font-bold shadow-soft'
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

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            const active = filter === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setFilter(s.id);
                  document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group card p-4 text-center transition-all hover:-translate-y-1 hover:shadow-soft ${
                  active ? 'border-brand-600 ring-2 ring-brand-200 bg-brand-50/30' : ''
                }`}
              >
                <div
                  className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${s.accent} text-white shadow-soft transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-3 font-display text-sm font-bold text-slate-900 line-clamp-1">
                  {s.title}
                </h3>
                <p className="mt-1 text-[11px] font-bold text-brand-600">
                  Starts ₹{s.startingPrice}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION: RESULTS LIST (Available helpers in selected City) */}
      <section id="results" className="mx-auto max-w-6xl px-4 sm:px-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-extrabold text-slate-900">
                Verified Helpers in {city}
              </h2>
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                {filteredWorkers.length} Available
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Available for same-day booking or regular monthly contracts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ServiceId | 'all')}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="cook">Cook</option>
              <option value="cleaner">House Cleaner / Maid</option>
              <option value="electrician">Electrician</option>
              <option value="plumber">Plumber</option>
              <option value="all-rounder">All-Rounder</option>
              <option value="tag-team">Tag-Team Combo</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {filteredWorkers.length === 0 ? (
          <div className="card mt-6 p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 bg-slate-50/50">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 shadow-soft">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-display text-xl sm:text-2xl font-extrabold text-slate-900">
              {city.includes('Coming Soon')
                ? `Launching Soon in ${city.replace(' (Coming Soon)', '')}`
                : `No registered partners in ${city} yet`}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {city.includes('Coming Soon')
                ? `MadadMitra is expanding to ${city.replace(' (Coming Soon)', '')} soon! Currently servicing Deoria and surrounding localities. Are you a skilled service provider in ${city.replace(' (Coming Soon)', '')}? Pre-register as a partner today.`
                : `We do not show sample or unverified profiles. Real helpers appear here only after full government KYC verification (Aadhaar & PAN). Are you a skilled Cook, Maid, Electrician, or Plumber in ${city}? Partner with MadadMitra today and keep 100% of your earnings!`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => openAuthModal('worker', 'signup')}
                className="btn-primary text-xs sm:text-sm font-bold flex items-center gap-2 py-2.5 px-5 shadow-soft"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Worker KYC Registration (Aadhaar & PAN)</span>
              </button>
              {(filter !== 'all' || query) && (
                <button
                  onClick={() => {
                    setFilter('all');
                    setQuery('');
                  }}
                  className="btn-secondary text-xs sm:text-sm font-bold py-2.5 px-4"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map((w) => (
              <div
                key={w.id}
                onClick={() => handleViewProfile(w)}
                className="card p-5 hover:shadow-card transition-all cursor-pointer border border-slate-200/80 hover:border-brand-400 flex flex-col justify-between group"
              >
                <div>
                  {/* Top card row */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${w.avatarColor} text-white font-extrabold text-xl shadow-soft`}
                    >
                      {w.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="truncate font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
                          {w.name}
                        </h3>
                        {w.verified && (
                          <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-brand-700">
                        {SERVICE_LABELS[w.service]}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {w.area}, {w.city || city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & stats strip */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {w.rating}
                      <span className="font-normal text-slate-400">({w.jobs} jobs)</span>
                    </span>
                    <span className="font-semibold text-slate-600">
                      {w.experienceYears ? `${w.experienceYears}+ Yrs Exp` : 'Verified Pro'}
                    </span>
                    <span className="badge bg-emerald-100 text-emerald-800 text-[10px]">
                      Aadhaar Verified
                    </span>
                  </div>

                  {/* About snippet */}
                  {w.about && (
                    <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      "{w.about}"
                    </p>
                  )}
                </div>

                {/* Card footer with pricing & CTA */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Rate</p>
                    <p className="font-display text-lg font-extrabold text-slate-900">
                      ₹{w.pricePerVisit}
                      <span className="text-xs font-normal text-slate-400"> / visit</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProfile(w);
                    }}
                    className="btn-primary py-2 px-4 text-xs font-bold shadow-sm group-hover:bg-brand-700"
                  >
                    Book Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SAVINGS CALCULATOR (MADADMITRA VS COMPETITION) */}
        <div className="mt-14">
          <SavingsCalculator />
        </div>

        {/* CUSTOMER REVIEWS & TESTIMONIALS */}
        <div className="mt-14">
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
        </div>

        {/* CUSTOMER DASHBOARD CONTRACT BANNER */}
        <div className="mt-14 card overflow-hidden bg-gradient-to-r from-slate-900 via-brand-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="badge bg-accent-400 text-slate-950 font-bold text-xs uppercase px-2.5 py-1">
                Absence Guarantee
              </span>
              <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold">
                Maid or Cook on Leave Today?
              </h3>
              <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                If you have an active monthly contract, get a 1-day replacement helper summoned
                to your doorstep in 45 minutes or receive an instant ₹80 refund.
              </p>
            </div>
            <button
              onClick={() => setView('customer')}
              className="btn-accent px-6 py-3 font-bold text-sm shrink-0 shadow-lg"
            >
              Open Customer Contract <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
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