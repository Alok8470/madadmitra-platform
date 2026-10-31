import { useMemo } from 'react';
import { ArrowLeft, Star, ShieldCheck, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SERVICES, type Worker } from '../data/mockData';

export default function CategoryPage() {
    const { workers, city, selectedCategory, setView, setSelectedWorker, catalogMode } = useApp();

    const categoryData = SERVICES.find(s => s.id === selectedCategory);
    
    // Filter logic similar to Homepage
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
                matchCity = workerAreaLower.includes(selectedLower) || selectedLower.includes(workerAreaLower) || workerCityLower.includes(selectedLower);
            } else {
                const cleanComingSoon = selectedLower.replace(' (coming soon)', '').trim();
                matchCity = workerCityLower.includes(cleanComingSoon);
            }
            return matchCity;
        });
    }, [workers, city, selectedCategory, catalogMode]);

    const handleViewProfile = (worker: Worker) => {
        setSelectedWorker(worker);
        setView('worker-profile');
    };

    if (!categoryData) {
        return (
            <div className="py-20 text-center">
                <p>Category not found.</p>
                <button onClick={() => setView('home')} className="btn-primary mt-4">Back to Home</button>
            </div>
        );
    }

    const Icon = categoryData.icon;

    return (
        <div className="pb-28 max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => setView('home')} className="btn-ghost flex items-center gap-2 text-slate-600">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {city}
                </span>
            </div>

            {/* Premium Category Banner */}
            <div className={`rounded-3xl bg-gradient-to-br ${categoryData.accent} p-8 sm:p-12 text-white shadow-xl relative overflow-hidden mb-8`}>
                <div className="absolute -right-10 -top-10 opacity-20 transform rotate-12">
                    <Icon className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white mb-4 border border-white/20">
                        <ShieldCheck className="h-4 w-4" /> Premium Quality Assured
                    </div>
                    <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">
                        {categoryData.title} Services
                    </h1>
                    <p className="text-white/90 text-sm sm:text-base max-w-md font-medium">
                        Professional, background-verified {categoryData.title.toLowerCase()}s ready to serve you with flat platform pricing.
                    </p>
                </div>
            </div>

            {/* Workers Grid */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-slate-900">
                    Available {categoryData.title}s ({filteredWorkers.length})
                </h2>
                <span className="badge bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Ready to book
                </span>
            </div>

            {filteredWorkers.length === 0 ? (
                <div className="card p-12 text-center bg-slate-50 border border-slate-200 shadow-none">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-200 text-slate-500 mb-4">
                        <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">No {categoryData.title.toLowerCase()}s found in your area.</h3>
                    <p className="text-sm text-slate-500 mt-2">Try changing your locality in the header or check back later.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkers.map(w => (
                        <div key={w.id} onClick={() => handleViewProfile(w)} className="card p-5 hover:border-brand-400 cursor-pointer transition-all flex flex-col justify-between group">
                            <div className="flex items-start gap-3.5">
                                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${w.avatarColor} text-white font-bold shadow-soft`}>
                                    {w.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-display font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-brand-600 transition-colors">
                                        {w.name}
                                        {w.verified && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                                    </h3>
                                    <p className="text-xs text-slate-500">{w.area}</p>
                                    <div className="mt-2 flex items-center gap-3 text-xs font-semibold">
                                        <span className="flex items-center gap-1 text-amber-500"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {w.rating}</span>
                                        <span className="text-emerald-700">{w.jobs} Jobs</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="font-bold text-slate-900">₹{w.pricePerVisit}<span className="text-slate-400 text-[10px]"> / visit</span></span>
                                <span className="text-xs font-bold text-brand-600 group-hover:underline">View Profile</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
