import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Star,
  BadgeCheck,
  ShieldCheck,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Sparkles,
  Wrench,
  Users,
  UserPlus,
  Hammer,
  Paintbrush,
  MapPin,
  AlertCircle,
  ArrowRight,
  Tag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { SERVICES, SERVICE_LABELS, TESTIMONIALS, type ServiceId } from '../data/mockData';
import SavingsCalculator from './SavingsCalculator';
import SOSBookingModal from './SOSBookingModal';
import UrbanCompanyComparison from './UrbanCompanyComparison';

// ─── Offer Banner Data ────────────────────────────────────────────────────────
const OFFER_BANNERS = [
  {
    id: 'b1',
    bg: 'from-violet-600 via-purple-600 to-indigo-700',
    icon: '🎉',
    label: 'LAUNCH OFFER',
    title: 'First Booking Free Platform Fee',
    subtitle: 'Use code MADAD0 — Limited period offer for Deoria households',
    cta: 'Book Now',
    accent: 'bg-white/20',
    textAccent: 'text-white',
    blob1: 'bg-white/10',
    blob2: 'bg-purple-400/20',
  },
  {
    id: 'b2',
    bg: 'from-emerald-600 via-teal-600 to-cyan-700',
    icon: '👨‍🍳',
    label: 'DAILY MEAL PLAN',
    title: 'Monthly Cook Package at ₹3,499',
    subtitle: '25 visits/month — fresh North Indian meals, zero commission to your cook',
    cta: 'View Plans',
    accent: 'bg-white/20',
    textAccent: 'text-white',
    blob1: 'bg-emerald-400/20',
    blob2: 'bg-white/10',
  },
  {
    id: 'b3',
    bg: 'from-amber-500 via-orange-500 to-rose-500',
    icon: '⚡',
    label: 'EMERGENCY',
    title: '30-Min Urgent Helper Dispatch',
    subtitle: 'Electrician · Plumber · Maid — All within 30 minutes. 24 × 7 in Deoria',
    cta: 'Call Now',
    accent: 'bg-white/20',
    textAccent: 'text-white',
    blob1: 'bg-amber-400/20',
    blob2: 'bg-white/10',
  },
  {
    id: 'b4',
    bg: 'from-brand-700 via-brand-600 to-sky-700',
    icon: '🛡️',
    label: 'VERIFIED PARTNERS',
    title: '0% Commission to Your Helper',
    subtitle: 'Workers keep 100% of their pay — no hidden cuts, no loan traps ever',
    cta: 'Join as Partner',
    accent: 'bg-white/20',
    textAccent: 'text-white',
    blob1: 'bg-brand-400/20',
    blob2: 'bg-sky-400/10',
  },
];

// ─── Service Category Data (icon-first grid cards) ────────────────────────────
const CATEGORY_GRID = [
  { id: 'cook',        icon: ChefHat,     label: 'Cook / Chef',       price: '₹250',  bg: 'bg-orange-50',    iconBg: 'from-orange-400 to-amber-500',   glow: 'rgba(249,115,22,0.30)' },
  { id: 'cleaner',     icon: Sparkles,    label: 'Maid & Cleaning',   price: '₹200',  bg: 'bg-sky-50',       iconBg: 'from-sky-400 to-blue-500',       glow: 'rgba(14,165,233,0.30)' },
  { id: 'electrician', icon: Zap,         label: 'Electrician',       price: '₹150',  bg: 'bg-yellow-50',    iconBg: 'from-amber-400 to-yellow-500',   glow: 'rgba(245,158,11,0.30)' },
  { id: 'plumber',     icon: Wrench,      label: 'Plumber',           price: '₹180',  bg: 'bg-blue-50',      iconBg: 'from-blue-500 to-indigo-600',    glow: 'rgba(59,130,246,0.30)' },
  { id: 'carpenter',   icon: Hammer,      label: 'Carpenter',         price: '₹180',  bg: 'bg-amber-50',     iconBg: 'from-amber-700 to-yellow-800',   glow: 'rgba(180,83,9,0.25)' },
  { id: 'painter',     icon: Paintbrush,  label: 'Painter',           price: '₹200',  bg: 'bg-rose-50',      iconBg: 'from-rose-400 to-red-500',       glow: 'rgba(239,68,68,0.25)' },
  { id: 'all-rounder', icon: Users,       label: 'All-Rounder',       price: '₹400',  bg: 'bg-emerald-50',   iconBg: 'from-emerald-500 to-teal-600',   glow: 'rgba(16,185,129,0.30)' },
  { id: 'tag-team',    icon: UserPlus,    label: 'Tag-Team Combo',    price: '₹650',  bg: 'bg-violet-50',    iconBg: 'from-violet-500 to-purple-600',  glow: 'rgba(139,92,246,0.30)' },
];

// ─── Trust Stats Strip ────────────────────────────────────────────────────────
const TRUST_STATS = [
  { icon: ShieldCheck, value: '100%',   label: 'Aadhaar Verified', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Star,        value: '4.85★',  label: 'Avg Rating',       color: 'text-amber-600',   bg: 'bg-amber-50' },
  { icon: Clock,       value: '<30min', label: 'Avg Response',     color: 'text-sky-600',     bg: 'bg-sky-50' },
  { icon: Tag,         value: '₹10',    label: 'Flat Fee Only',    color: 'text-brand-600',   bg: 'bg-brand-50' },
];

export default function Homepage() {
  const { workers, city, setView, catalogMode, openAuthModal, setSelectedCategory, selectedCategory } = useApp();
  const { t: _t, language } = useLanguage();
  const isHi = language === 'hi';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ServiceId | 'all'>('all');
  const [showSosModal, setShowSosModal] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Filtered workers ──────────────────────────────────────────────────────
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      if (catalogMode === 'verified_only' && !w.isRealPartner && !w.id.startsWith('w_live_')) return false;
      if (!w.online) return false;
      const sel = city.toLowerCase();
      const wCity = (w.city || 'deoria').toLowerCase();
      const wArea = (w.area || '').toLowerCase();
      let matchCity = true;
      if (sel.includes('all deoria') || sel === 'deoria') {
        matchCity = wCity.includes('deoria') || wArea.length > 0;
      } else if (!sel.includes('coming soon')) {
        matchCity = wArea.includes(sel) || sel.includes(wArea) || wCity.includes(sel);
      } else {
        matchCity = wCity.includes(sel.replace(' (coming soon)', '').trim());
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

  const handleSearch = () =>
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // ── Carousel auto-advance ─────────────────────────────────────────────────
  const scrollTo = useCallback((idx: number) => {
    const next = (idx + OFFER_BANNERS.length) % OFFER_BANNERS.length;
    setBannerIdx(next);
    if (carouselRef.current) {
      const child = carouselRef.current.children[next] as HTMLElement;
      child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }, []);

  useEffect(() => {
    autoRef.current = setInterval(() => scrollTo(bannerIdx + 1), 4000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [bannerIdx, scrollTo]);

  const liveCount = filteredWorkers.length;
  const availText = liveCount > 0
    ? `${liveCount} Verified Helper${liveCount === 1 ? '' : 's'} Available Now in ${city.replace(' (Coming Soon)', '')}`
    : `KYC Partner Onboarding Active — ${city.replace(' (Coming Soon)', '')}`;

  // ── SUGGESTED SEARCH CHIPS ─────────────────────────────────────────────────
  const CHIPS = isHi
    ? [
        { text: 'नल टपक रहा है', filterKey: 'plumber' },
        { text: 'पंखा / लाइट फिटिंग', filterKey: 'electrician' },
        { text: 'घर की सफाई', filterKey: 'cleaner' },
        { text: 'दैनिक खाना', filterKey: 'cook' },
      ]
    : [
        { text: 'Leaking Tap', filterKey: 'plumber' },
        { text: 'Fan & Light Fitting', filterKey: 'electrician' },
        { text: 'House Cleaning', filterKey: 'cleaner' },
        { text: 'Daily Cooking', filterKey: 'cook' },
      ];

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-slate-50 pb-6">

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section className="relative w-full max-w-full bg-gradient-to-br from-brand-800 via-brand-700 to-indigo-900 text-white hero-clip overflow-hidden" style={{ contain: 'paint' }}>
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Ambient blobs — contained so they don't overflow */}
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-8 sm:pt-10 sm:pb-12 w-full min-w-0">

          {/* ── Live Status Pill ── */}
          <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 text-[11px] sm:text-xs font-semibold w-fit max-w-full min-w-0 mb-4 overflow-hidden">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate min-w-0 text-white/90">{availText}</span>
          </div>

          {/* ── Hero Heading ── */}
          <h1 className="font-display text-[1.65rem] sm:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tight text-white text-balance pr-2">
            {isHi ? 'घर के लिए भरोसेमंद\nमददगार खोजें' : 'Find Trusted Helpers\nfor Your Home'}
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-white/75 leading-relaxed max-w-sm sm:max-w-md font-normal pr-2">
            {isHi
              ? 'सत्यापित रसोइया, सफाईकर्मी, इलेक्ट्रीशियन — केवल ₹10 शुल्क'
              : 'Verified cooks, cleaners, electricians & more — just ₹10 fee, 0% helper commission'}
          </p>

          {/* ── Search Card ── */}
          <div className="mt-5 sm:mt-7 rounded-2xl bg-white p-2.5 shadow-2xl ring-1 ring-slate-200/60 w-full max-w-lg min-w-0">
            {/* Location Row */}
            <div className="flex items-center gap-2 px-1 mb-2">
              <MapPin className="h-3.5 w-3.5 text-brand-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-500 truncate min-w-0">
                {city.replace(' (Coming Soon)', '')}
              </span>
              <span className="ml-auto text-[10px] font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                {isHi ? 'लाइव सेवा' : 'Live Service'}
              </span>
            </div>

            {/* Search Input Row */}
            <div className="flex gap-2 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={isHi ? 'रसोइया, सफाईकर्मी, इलेक्ट्रीशियन...' : 'Search cook, maid, electrician...'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition min-w-0"
                />
              </div>
              <button
                onClick={handleSearch}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white px-4 py-3 text-sm font-bold shadow-md transition-all"
              >
                <Search className="h-4 w-4" />
                <span className="hidden xs:inline">{isHi ? 'खोजें' : 'Search'}</span>
              </button>
            </div>

            {/* Suggested Chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 self-center shrink-0">
                {isHi ? 'सुझाव:' : 'Try:'}
              </span>
              {CHIPS.map((chip) => (
                <button
                  key={chip.text}
                  type="button"
                  onClick={() => { setFilter(chip.filterKey as ServiceId); setQuery(''); handleSearch(); }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 active:scale-95 text-slate-600 text-[11px] font-medium border border-slate-200 hover:border-brand-200 transition-all break-words"
                >
                  {chip.text}
                </button>
              ))}
            </div>
          </div>

          {/* ── SOS CTA Strip ── */}
          <div className="mt-5 flex flex-wrap gap-3 items-center min-w-0">
            <button
              type="button"
              onClick={() => setShowSosModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-4 py-2.5 text-xs sm:text-sm shadow-lg transition-all min-h-[44px] max-w-full"
            >
              <Zap className="h-4 w-4 fill-slate-950 animate-bounce shrink-0" />
              <span className="leading-tight">{isHi ? '🚨 30 मिनट — अर्जेंट बुकिंग' : '🚨 30-Min Emergency Booking'}</span>
            </button>

            {/* Trust micro-badges */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-white/70">
              <span className="flex items-center gap-1 shrink-0"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{isHi ? 'आधार सत्यापित' : 'Aadhaar Verified'}</span>
              <span className="flex items-center gap-1 shrink-0"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />{isHi ? '4.85★ रेटिंग' : '4.85★ Rated'}</span>
              <span className="flex items-center gap-1 shrink-0"><Zap className="h-3.5 w-3.5 text-sky-400 shrink-0" />{isHi ? '₹10 शुल्क' : '₹10 Fee'}</span>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════ OFFER BANNER CAROUSEL ════════════════ */}
      <section className="mx-auto max-w-6xl px-4 mt-5 w-full min-w-0 overflow-hidden">
        <div className="relative min-w-0 overflow-hidden">
          {/* Slides */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto no-scrollbar rounded-2xl min-w-0"
            style={{ scrollSnapType: 'x mandatory', gap: 0 }}
          >
            {OFFER_BANNERS.map((b, i) => (
              <div
                key={b.id}
                style={{ scrollSnapAlign: 'start', minWidth: '100%', maxWidth: '100%' }}
                className={`relative flex-shrink-0 w-full rounded-2xl bg-gradient-to-r ${b.bg} p-4 sm:p-5 overflow-hidden cursor-pointer select-none`}
                onClick={() => scrollTo(i + 1)}
              >
                {/* Decorative blobs inside slide */}
                <div className={`absolute right-0 top-0 h-32 w-32 rounded-full ${b.blob1} blur-2xl pointer-events-none`} />
                <div className={`absolute -left-8 bottom-0 h-24 w-24 rounded-full ${b.blob2} blur-2xl pointer-events-none`} />

                <div className="relative z-10 flex items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase mb-2">
                      <span>{b.icon}</span>
                      <span>{b.label}</span>
                    </div>
                    <h3 className="font-display font-black text-white text-sm sm:text-lg leading-tight break-words">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-[11px] sm:text-xs text-white/80 leading-relaxed max-w-xs">
                      {b.subtitle}
                    </p>
                    <button className="mt-3 inline-flex items-center gap-1 rounded-xl bg-white text-slate-900 font-bold text-xs px-3.5 py-2 shadow-sm hover:scale-105 active:scale-95 transition-transform">
                      {b.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-4xl sm:text-5xl shrink-0 opacity-90">{b.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <button
            onClick={() => scrollTo(bannerIdx - 1)}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </button>
          <button
            onClick={() => scrollTo(bannerIdx + 1)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all"
          >
            <ChevronRight className="h-4 w-4 text-slate-700" />
          </button>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {OFFER_BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`rounded-full transition-all ${i === bannerIdx ? 'w-5 h-1.5 bg-brand-600' : 'w-1.5 h-1.5 bg-slate-300'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TRUST STATS STRIP ════════════════ */}
      <section className="mx-auto max-w-6xl px-4 mt-5 w-full min-w-0">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
          {TRUST_STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${s.bg} rounded-xl sm:rounded-2xl p-2 sm:p-3.5 flex flex-col items-center text-center`}>
                <Icon className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${s.color} mb-1`} />
                <span className={`font-black text-[11px] sm:text-base ${s.color} leading-none`}>{s.value}</span>
                <span className="text-[8px] sm:text-[10px] font-semibold text-slate-500 mt-0.5 leading-tight">{s.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════ SERVICE CATEGORIES GRID ════════════════ */}
      <section className="mx-auto max-w-6xl px-4 mt-7 w-full min-w-0">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-600">
              {isHi ? 'सेवाएं' : 'Our Services'}
            </span>
            <h2 className="mt-0.5 font-display text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {isHi ? 'घरेलू सेवाएं चुनें' : 'What do you need today?'}
            </h2>
          </div>
          <button
            onClick={() => { setFilter('all'); handleSearch(); }}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5 shrink-0"
          >
            {isHi ? 'सभी देखें' : 'See all'} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3.5 w-full">
          {CATEGORY_GRID.map((cat) => {
            const Icon = cat.icon;
            const isActive = filter === cat.id || selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setFilter(cat.id as ServiceId);
                  if (setSelectedCategory) setSelectedCategory(cat.id as ServiceId);
                  setView('category');
                }}
                className={`group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border transition-all duration-200 active:scale-95 text-center w-full ${
                  isActive
                    ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200 shadow-md'
                    : 'border-slate-200/80 bg-white hover:border-brand-200 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {/* Icon */}
                <div
                  className={`grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br ${cat.iconBg} text-white transition-transform group-hover:scale-110 group-active:scale-95 shadow-md`}
                  style={{ boxShadow: `0 8px 20px -4px ${cat.glow}` }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                {/* Label */}
                <div className="min-w-0 w-full">
                  <p className={`text-[10px] sm:text-xs font-extrabold leading-snug break-words ${isActive ? 'text-brand-700' : 'text-slate-800 group-hover:text-brand-700'} transition-colors`}>
                    {cat.label}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5">
                    from {cat.price}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ════════════════ COMING SOON BANNER ════════════════ */}
      {city.includes('Coming Soon') && (
        <section className="mx-auto max-w-6xl px-4 mt-7 w-full min-w-0">
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white text-xl shadow-sm">
                🚀
              </div>
              <div>
                <h3 className="font-display font-bold text-amber-950 text-sm sm:text-base">
                  MadadMitra Launching in {city.replace(' (Coming Soon)', '')}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-amber-800 leading-relaxed max-w-xl">
                  Partner pre-registrations now open. Full service live across <strong>Deoria</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => openAuthModal('worker', 'signup')}
              className="btn-primary py-2.5 px-4 text-xs font-bold whitespace-nowrap self-start sm:self-auto shrink-0 shadow-soft rounded-xl"
            >
              Pre-Register as Partner
            </button>
          </div>
        </section>
      )}

      {/* ════════════════ GUARANTEE CARDS ════════════════ */}
      <section className="mx-auto max-w-6xl px-4 mt-8 w-full min-w-0">
        <div className="text-center mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-700 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> {isHi ? 'मदद मित्र गारंटी' : 'The MadadMitra Guarantee'}
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
            {isHi ? 'हर बार सेवा में बेहतरीन' : 'Quality Guaranteed on Every Visit'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: BadgeCheck, color: 'text-brand-600', bg: 'bg-brand-50', title: isHi ? 'सत्यापित पृष्ठभूमि' : 'Verified Background', desc: isHi ? 'सरकारी ID + पड़ोस रेफरेंस' : 'Govt ID + locality refs checked' },
            { icon: Zap,        color: 'text-amber-600', bg: 'bg-amber-50',  title: isHi ? 'सिर्फ ₹10 शुल्क' : 'Flat ₹10 Fee',        desc: isHi ? 'कोई मंहगी सदस्यता नहीं' : 'No expensive subscriptions ever' },
            { icon: AlertCircle,color: 'text-emerald-600',bg:'bg-emerald-50',title: isHi ? 'अनुपस्थिति गारंटी' : 'Absence Guarantee',  desc: isHi ? 'बदल या रिफंड — तुरंत' : 'Instant backup or full refund' },
            { icon: ShieldCheck,color: 'text-sky-600',  bg: 'bg-sky-50',    title: isHi ? 'OTP के बाद भुगतान' : 'Pay After Service',   desc: isHi ? 'OTP सत्यापन पर ही भुगतान' : 'Pay only after OTP verification' },
          ].map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.title} className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
                <div className={`${g.bg} h-10 w-10 rounded-xl grid place-items-center mb-3`}>
                  <Icon className={`h-5 w-5 ${g.color}`} />
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{g.title}</h3>
                <p className="mt-1 text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">{g.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════ FULL SERVICE CATALOG (original card grid) ════════════════ */}
      <section id="results" className="mx-auto max-w-6xl px-4 mt-8 w-full min-w-0">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-600">
              {isHi ? 'सभी सेवाएं' : 'All Services'}
            </span>
            <h2 className="mt-0.5 font-display text-xl sm:text-2xl font-extrabold text-slate-900">
              {isHi ? 'पूरी सेवा सूची' : 'Complete Service Catalog'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHi ? `${city} में सेवा उपलब्ध` : `Live in ${city}`}
            </p>
          </div>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 inline-flex items-center gap-0.5 shrink-0"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            const isActive = selectedCategory === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (setSelectedCategory) setSelectedCategory(s.id);
                  setView('category');
                }}
                className={`group card-hover p-4 sm:p-5 text-left flex flex-col justify-between transition-all duration-200 active:scale-[0.97] w-full rounded-2xl border ${
                  isActive
                    ? 'border-brand-500 ring-2 ring-brand-200 bg-brand-50/30 shadow-soft'
                    : 'border-slate-200/80 bg-white hover:border-brand-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className={`grid h-11 w-11 sm:h-13 sm:w-13 place-items-center rounded-2xl bg-gradient-to-br ${s.accent} text-white shadow-soft transition-transform group-hover:scale-105 group-hover:-rotate-2 p-2.5 shrink-0`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] sm:text-[10px] px-2">
                      Live
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block">From</span>
                    <span className="font-extrabold text-brand-700 text-xs sm:text-sm">₹{s.startingPrice}</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                    Book →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ════════════════ COMPARISON ════════════════ */}
      <UrbanCompanyComparison />

      {/* ════════════════ SAVINGS CALCULATOR ════════════════ */}
      <section className="mx-auto max-w-6xl px-4 mt-8 w-full min-w-0">
        <SavingsCalculator />
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="mx-auto max-w-6xl px-4 mt-8 w-full min-w-0">
        <div className="text-center mb-6">
          <span className="badge bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase px-3 py-1 mb-2">
            {isHi ? 'ग्राहक कहानियां' : 'Customer Stories'}
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {isHi ? 'देवरिया व पूर्वी UP के परिवार' : 'Trusted by Families Across Eastern UP'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isHi
              ? 'राघव नगर, सिविल लाइंस, बहतपार रानी और सलेमपुर से समीक्षाएं'
              : 'Reviews from Raghav Nagar, Civil Lines, Bhatpar Rani & Salempur'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="card p-5 flex flex-col justify-between border border-slate-200/80 hover:shadow-card transition-all rounded-2xl">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{t.date}</span>
                </div>
                <p className="mt-3 text-xs text-slate-600 leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 font-black text-sm grid place-items-center shrink-0">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    {t.author}
                    {t.verifiedCustomer && <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />}
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

      {/* ════════════════ SOS MODAL ════════════════ */}
      {showSosModal && (
        <SOSBookingModal
          open={showSosModal}
          onClose={() => setShowSosModal(false)}
        />
      )}
    </div>
  );
}
