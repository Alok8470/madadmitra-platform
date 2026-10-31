import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Wrench,
  Store,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { SERVICES, SERVICE_SKUS, HARDWARE_PARTS, type Worker } from '../data/mockData';
import DispatchRadarModal from './DispatchRadarModal';
import MadadSurakshaModal from './MadadSurakshaModal';

export default function CategoryPage() {
  const { workers, city, selectedCategory, setView, setSelectedWorker, catalogMode } = useApp();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'rate_card' | 'workers' | 'parts'>('rate_card');
  const [selectedSkus, setSelectedSkus] = useState<Record<string, number>>({});
  const [selectedParts, setSelectedParts] = useState<Record<string, number>>({});
  const [expandedSku, setExpandedSku] = useState<string | null>(null);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [showSurakshaModal, setShowSurakshaModal] = useState(false);

  const categoryData = SERVICES.find((s) => s.id === selectedCategory);

  // Available SKUs for this service
  const categorySkus = useMemo(() => {
    if (!selectedCategory) return [];
    return SERVICE_SKUS.filter((s) => s.serviceId === selectedCategory);
  }, [selectedCategory]);

  // Available Hardware Parts for this service
  const categoryParts = useMemo(() => {
    if (!selectedCategory) return [];
    return HARDWARE_PARTS.filter((p) => p.serviceId === selectedCategory);
  }, [selectedCategory]);

  // Available Workers
  const filteredWorkers = useMemo(() => {
    if (!selectedCategory) return [];
    return workers.filter((w) => {
      if (catalogMode === 'verified_only' && !w.isRealPartner && !w.id.startsWith('w_live_')) return false;
      if (!w.online) return false;
      if (w.service !== selectedCategory) return false;

      const selectedLower = city.toLowerCase();
      const workerCityLower = (w.city || 'deoria').toLowerCase();
      const workerAreaLower = (w.area || '').toLowerCase();

      let matchCity = true;
      if (selectedLower.includes('all deoria') || selectedLower === 'deoria') {
        matchCity = workerCityLower.includes('deoria') || workerAreaLower.length > 0;
      } else if (!selectedLower.includes('coming soon')) {
        matchCity =
          workerAreaLower.includes(selectedLower) ||
          selectedLower.includes(workerAreaLower) ||
          workerCityLower.includes(selectedLower);
      } else {
        const cleanComingSoon = selectedLower.replace(' (coming soon)', '').trim();
        matchCity = workerCityLower.includes(cleanComingSoon);
      }
      return matchCity;
    });
  }, [workers, city, selectedCategory, catalogMode]);

  // Cart calculations
  const skuTotal = useMemo(() => {
    return Object.entries(selectedSkus).reduce((acc, [skuId, qty]) => {
      const sku = categorySkus.find((s) => s.id === skuId);
      return acc + (sku ? sku.price * qty : 0);
    }, 0);
  }, [selectedSkus, categorySkus]);

  const partsTotal = useMemo(() => {
    return Object.entries(selectedParts).reduce((acc, [partId, qty]) => {
      const part = categoryParts.find((p) => p.id === partId);
      return acc + (part ? part.mrp * qty : 0);
    }, 0);
  }, [selectedParts, categoryParts]);

  const totalCartCount =
    Object.values(selectedSkus).reduce((a, b) => a + b, 0) +
    Object.values(selectedParts).reduce((a, b) => a + b, 0);

  const grandTotal = skuTotal + partsTotal + (totalCartCount > 0 ? 15 : 0); // ₹15 Madad Suraksha Fee

  const handleAddSku = (id: string) => {
    setSelectedSkus((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemoveSku = (id: string) => {
    setSelectedSkus((prev) => {
      const cur = prev[id] || 0;
      if (cur <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: cur - 1 };
    });
  };

  const handleAddPart = (id: string) => {
    setSelectedParts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemovePart = (id: string) => {
    setSelectedParts((prev) => {
      const cur = prev[id] || 0;
      if (cur <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: cur - 1 };
    });
  };

  const handleViewProfile = (worker: Worker) => {
    setSelectedWorker(worker);
    setView('worker-profile');
  };

  if (!categoryData) {
    return (
      <div className="py-20 text-center">
        <p>Category not found.</p>
        <button onClick={() => setView('home')} className="btn-primary mt-4">
          Back to Home
        </button>
      </div>
    );
  }

  const Icon = categoryData.icon;

  return (
    <div className="pb-44 sm:pb-36 max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-fade-in w-full max-w-full overflow-x-hidden">
      {/* Header Back & Location */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setView('home')}
          className="btn-ghost flex items-center gap-2 text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" /> {isHi ? 'होम पर वापस' : 'Back to Home'}
        </button>
        <span className="text-xs sm:text-sm font-bold text-slate-500 flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
          <MapPin className="h-4 w-4 text-brand-600" /> {city}
        </span>
      </div>

      {/* Premium Hero Banner */}
      <div
        className={`rounded-3xl bg-gradient-to-br ${categoryData.accent} p-5 sm:p-10 text-white shadow-elevated relative overflow-hidden mb-6 w-full max-w-full`}
      >
        <div className="absolute right-0 top-0 opacity-15 pointer-events-none overflow-hidden">
          <Icon className="w-36 h-36 sm:w-56 sm:h-56 transform translate-x-4 -translate-y-4" />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/25">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              {isHi ? '100% स्थानीय हार्डवेयर गारंटी' : 'Vouched by Local Hardware Partner'}
            </span>
            <button
              onClick={() => setShowSurakshaModal(true)}
              className="text-[11px] underline font-bold text-white hover:text-amber-200"
            >
              ₹10,000 Madad Suraksha &rarr;
            </button>
          </div>
          <h1 className="font-display text-xl sm:text-4xl font-black tracking-tight text-white">
            {categoryData.title}
          </h1>
          <p className="mt-2 text-white/90 text-xs sm:text-sm leading-relaxed font-medium">
            {isHi
              ? 'बिना किसी ऑन-साइट मोलभाव के पारदर्शी दरें। 0% कमीशन पर प्रशिक्षित स्थानीय कारीगर।'
              : 'Standardized rate card with zero on-site haggling. 100% verified technicians backed by neighborhood store guarantees.'}
          </p>
        </div>
      </div>

      {/* SUB-TABS: Rate Card vs Verified Technicians vs Spare Parts */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x w-full max-w-full">
        <button
          onClick={() => setActiveTab('rate_card')}
          className={`pb-3 px-3 text-xs sm:text-sm font-extrabold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'rate_card'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>{isHi ? '📋 मानक रेट कार्ड व टास्क मेन्यू' : '📋 Standard Rate Card & Tasks'}</span>
          <span className="rounded-full bg-brand-100 text-brand-800 text-[10px] px-2 py-0.2">
            {categorySkus.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`pb-3 px-3 text-xs sm:text-sm font-extrabold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'workers'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{isHi ? '👷 सत्यापित कारीगर सूची' : '👷 Verified Local Pros'}</span>
          <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.2">
            {filteredWorkers.length}
          </span>
        </button>

        {categoryParts.length > 0 && (
          <button
            onClick={() => setActiveTab('parts')}
            className={`pb-3 px-3 text-xs sm:text-sm font-extrabold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'parts'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>{isHi ? '🏪 असली हार्डवेयर स्टोर स्पेयर पार्ट्स' : '🏪 Genuine Store Spare Parts'}</span>
            <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] px-2 py-0.2">
              MRP
            </span>
          </button>
        )}
      </div>

      {/* TAB 1: STANDARDIZED RATE CARD & MENU (BEATS URBAN COMPANY) */}
      {activeTab === 'rate_card' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-black text-slate-950">
                {isHi ? 'फिक्स्ड रेट टास्क मेन्यू' : 'Transparent Fixed-Price Rate Card'}
              </h2>
              <p className="text-xs text-slate-500">
                {isHi
                  ? 'पहले से तय दरें। कोई गुप्त शुल्क या घर पहुँचकर मोलभाव नहीं।'
                  : 'Upfront prices down to the rupee. No on-site haggling or surprise extra charges.'}
              </p>
            </div>
            <button
              onClick={() => setShowSurakshaModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>₹10,000 Protection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorySkus.map((sku) => {
              const qty = selectedSkus[sku.id] || 0;
              const isExpanded = expandedSku === sku.id;
              return (
                <div
                  key={sku.id}
                  className={`card p-5 flex flex-col justify-between transition-all ${
                    qty > 0 ? 'border-brand-500 ring-2 ring-brand-200 bg-brand-50/20' : 'hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {sku.badge && (
                          <span className="badge bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 mb-1.5">
                            {sku.badge}
                          </span>
                        )}
                        <h3 className="font-display font-extrabold text-slate-950 text-base">
                          {isHi ? sku.titleHi : sku.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {sku.timeEstimateMins} mins
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">7-Day Warranty</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-display text-2xl font-black text-slate-950">
                          ₹{sku.price}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {isHi ? sku.descriptionHi : sku.description}
                    </p>

                    {/* What's Included Accordion */}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setExpandedSku(isExpanded ? null : sku.id)}
                        className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'What is Included?'}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-scale-in">
                          <div>
                            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-emerald-800">
                              ✓ Included:
                            </span>
                            <ul className="mt-1 space-y-0.5 text-slate-600 text-[11px]">
                              {sku.included.map((inc, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                  <span>{inc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {sku.excluded.length > 0 && (
                            <div className="pt-1.5 border-t border-slate-200">
                              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-rose-800">
                                ✕ Excluded:
                              </span>
                              <ul className="mt-1 space-y-0.5 text-slate-500 text-[11px]">
                                {sku.excluded.map((exc, i) => (
                                  <li key={i}>• {exc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Control */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Standard Fix</span>
                    {qty === 0 ? (
                      <button
                        onClick={() => handleAddSku(sku.id)}
                        className="btn-primary py-2.5 px-5 text-xs font-bold rounded-xl shadow-soft min-h-[40px] active:scale-95"
                      >
                        + Add to Bill
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 p-1 rounded-xl">
                        <button
                          onClick={() => handleRemoveSku(sku.id)}
                          className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg bg-white text-brand-700 font-bold flex items-center justify-center hover:bg-brand-100 shadow-xs active:scale-90 transition-transform"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-bold text-brand-900 text-sm px-2 select-none">{qty}</span>
                        <button
                          onClick={() => handleAddSku(sku.id)}
                          className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center hover:bg-brand-700 shadow-xs active:scale-90 transition-transform"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VERIFIED LOCAL PROS */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-black text-slate-950">
              Verified {categoryData.title}s in {city} ({filteredWorkers.length})
            </h2>
            <span className="badge bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              100% UIDAI KYC
            </span>
          </div>

          {filteredWorkers.length === 0 ? (
            <div className="card p-10 text-center bg-slate-50 border border-slate-200">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-200 text-slate-500 mb-3">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                No individual helper profiles in {city} yet.
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You can still book any task from our Standard Rate Card with 30-min fast-track dispatch!
              </p>
              <button
                onClick={() => setActiveTab('rate_card')}
                className="btn-primary mt-4 py-2 px-5 text-xs font-bold"
              >
                View Rate Card Menu
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWorkers.map((w) => (
                <div
                  key={w.id}
                  onClick={() => handleViewProfile(w)}
                  className="card-hover p-5 cursor-pointer flex flex-col justify-between group bg-white"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${w.avatarColor} text-white font-extrabold text-lg shadow-soft`}
                    >
                      {w.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-extrabold text-slate-950 text-base flex items-center gap-1.5 group-hover:text-brand-600 transition-colors truncate">
                        <span>{w.name}</span>
                        {w.verified && <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{w.area}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs font-semibold">
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {w.rating}
                        </span>
                        <span className="text-emerald-700 font-bold">{w.jobs} Jobs</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 font-medium mt-1">
                        🏪 Vouched by {w.kyc?.kendraGuarantorName || 'Local Store'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Visiting Charge</span>
                      <span className="font-extrabold text-slate-900 text-sm">₹{w.pricePerVisit}</span>
                    </div>
                    <span className="text-xs font-bold text-brand-600 group-hover:underline inline-flex items-center gap-1">
                      View Profile &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GENUINE HARDWARE STORE SPARE PARTS (EXCLUSIVE MADADMITRA EDGE) */}
      {activeTab === 'parts' && categoryParts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-black text-slate-950">
                {isHi ? 'असली हार्डवेयर स्टोर स्पेयर पार्ट्स' : 'Genuine Hardware Store Spare Parts (MRP)'}
              </h2>
              <p className="text-xs text-slate-500">
                {isHi
                  ? 'स्थानीय हार्डवेयर व्यापारियों से सीधे आधिकारिक MRP पर। कोई अवैध कमीशन या नकली माल नहीं।'
                  : 'Billed directly from verified neighborhood hardware stores at official store MRP.'}
              </p>
            </div>
            <span className="badge bg-amber-100 text-amber-900 font-bold border border-amber-300">
              Zero App Markup
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryParts.map((part) => {
              const qty = selectedParts[part.id] || 0;
              return (
                <div
                  key={part.id}
                  className={`card p-5 flex flex-col justify-between transition-all ${
                    qty > 0 ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/20' : 'hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="badge bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                          {part.brand}
                        </span>
                        <h3 className="font-display font-extrabold text-slate-950 text-base mt-1">
                          {isHi ? part.nameHi : part.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Store className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>{part.hardwareStoreShop}</span>
                        </p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          ✓ {part.warranty}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-display text-2xl font-black text-slate-950">
                          ₹{part.mrp}
                        </span>
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Store MRP</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-bold">In-Stock at Local Shop</span>
                    {qty === 0 ? (
                      <button
                        onClick={() => handleAddPart(part.id)}
                        className="btn bg-amber-400 hover:bg-amber-300 text-slate-950 py-2.5 px-4 text-xs font-black rounded-xl shadow-soft min-h-[40px] active:scale-95"
                      >
                        + Add Part to Bill
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 p-1 rounded-xl">
                        <button
                          onClick={() => handleRemovePart(part.id)}
                          className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg bg-white text-slate-900 font-bold flex items-center justify-center hover:bg-amber-100 shadow-xs active:scale-90 transition-transform"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-bold text-slate-900 text-sm px-2 select-none">{qty}</span>
                        <button
                          onClick={() => handleAddPart(part.id)}
                          className="h-8 w-8 sm:h-7 sm:w-7 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center justify-center hover:bg-amber-300 shadow-xs active:scale-90 transition-transform"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STICKY BOTTOM FLOATING CART TRAY (CLEARANCE FOR MOBILE BOTTOMNAV) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 inset-x-0 z-40 px-3 sm:px-4 pointer-events-none animate-slide-up">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <div className="rounded-2xl bg-slate-950 text-white p-3 sm:p-4 shadow-elevated border-2 border-emerald-400 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 truncate">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {totalCartCount} Item(s) • ₹{grandTotal} (Incl. ₹15 Cover)
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 truncate">
                  {isHi ? '30-मिनट तत्काल डिस्पैच उपलब्ध' : 'Instant 30-min technician dispatch to your door'}
                </p>
              </div>

              <button
                onClick={() => setShowRadarModal(true)}
                className="btn bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 sm:py-3 px-3.5 sm:px-5 text-xs rounded-xl shadow-soft flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform min-h-[44px]"
              >
                <Zap className="h-4 w-4 fill-slate-950" />
                <span>{isHi ? 'तत्काल बुक करें' : 'Dispatch Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH RADAR SIMULATION MODAL */}
      {showRadarModal && (
        <DispatchRadarModal
          open={showRadarModal}
          onClose={() => setShowRadarModal(false)}
          serviceName={categoryData.title}
          areaName={city}
          totalBill={grandTotal}
        />
      )}

      {/* MADAD SURAKSHA POLICY MODAL */}
      {showSurakshaModal && (
        <MadadSurakshaModal
          open={showSurakshaModal}
          onClose={() => setShowSurakshaModal(false)}
        />
      )}
    </div>
  );
}
