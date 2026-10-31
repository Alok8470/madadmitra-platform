import { Home, CalendarCheck, Handshake, User, Briefcase, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav() {
  const { view, setView, bookings, currentUser } = useApp();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const upcomingCount = bookings.filter(
    (b) => b.status === 'upcoming' || b.status === 'accepted' || b.status === 'in_progress'
  ).length;

  // Hide bottom nav on worker profile view (it has its own sticky book bar)
  if (view === 'worker-profile') return null;

  const isWorkerRole = currentUser?.role === 'worker';

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 w-full max-w-full bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] touch-manipulation select-none">
      <div className="flex items-center justify-around text-[10px] font-bold w-full max-w-md mx-auto">
        {isWorkerRole ? (
          <>
            {/* Worker: Dashboard */}
            <button
              onClick={() => setView('worker')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
                view === 'worker'
                  ? 'text-emerald-700 bg-emerald-50/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className={`h-5 w-5 ${view === 'worker' ? 'stroke-[2.5]' : ''}`} />
              <span className="mt-0.5 tracking-tight">{isHi ? 'काम' : 'Jobs'}</span>
            </button>

            {/* Worker: Wallet */}
            <button
              onClick={() => setView('wallet')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
                view === 'wallet'
                  ? 'text-emerald-700 bg-emerald-50/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wallet className={`h-5 w-5 ${view === 'wallet' ? 'stroke-[2.5]' : ''}`} />
              <span className="mt-0.5 tracking-tight">{isHi ? 'सिक्के' : 'Tokens'}</span>
            </button>

            {/* Worker: Switch to Customer View */}
            <button
              onClick={() => setView('home')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
                view === 'home'
                  ? 'text-brand-700 bg-brand-50/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Home className={`h-5 w-5 ${view === 'home' ? 'stroke-[2.5]' : ''}`} />
              <span className="mt-0.5 tracking-tight">{isHi ? 'ग्राहक ऐप' : 'Customer'}</span>
            </button>
          </>
        ) : (
          <>
            {/* Customer: Home */}
            <button
              onClick={() => setView('home')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
                view === 'home' || view === 'category'
                  ? 'text-brand-700 bg-brand-50/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Home className={`h-5 w-5 ${view === 'home' || view === 'category' ? 'stroke-[2.5]' : ''}`} />
              <span className="mt-0.5 tracking-tight">{isHi ? 'होम' : 'Home'}</span>
            </button>

            {/* Customer: Bookings */}
            <button
              onClick={() => setView('bookings')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all active:scale-90 relative ${
                view === 'bookings'
                  ? 'text-brand-700 bg-brand-50/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <CalendarCheck className={`h-5 w-5 ${view === 'bookings' ? 'stroke-[2.5]' : ''}`} />
                {upcomingCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-brand-600 text-[9px] font-black text-white shadow-xs animate-pulse">
                    {upcomingCount}
                  </span>
                )}
              </div>
              <span className="mt-0.5 tracking-tight">{isHi ? 'बुकिंग्स' : 'Bookings'}</span>
            </button>

            {/* Customer: Contract */}
            <button
              onClick={() => setView('customer')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
                view === 'customer'
                  ? 'text-brand-700 bg-brand-50/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Handshake className={`h-5 w-5 ${view === 'customer' ? 'stroke-[2.5]' : ''}`} />
              <span className="mt-0.5 tracking-tight">{isHi ? 'योजना' : 'Plan'}</span>
            </button>

            {/* Customer: Wallet */}
            <button
              onClick={() => setView('wallet')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
                view === 'wallet'
                  ? 'text-brand-700 bg-brand-50/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wallet className={`h-5 w-5 ${view === 'wallet' ? 'stroke-[2.5]' : ''}`} />
              <span className="mt-0.5 tracking-tight">{isHi ? 'वॉलेट' : 'Wallet'}</span>
            </button>
          </>
        )}

        {/* Account / Admin */}
        {currentUser?.role === 'admin' ? (
          <button
            onClick={() => setView('admin')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
              view === 'admin'
                ? 'text-purple-700 bg-purple-50/80 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className={`h-5 w-5 ${view === 'admin' ? 'stroke-[2.5]' : ''}`} />
            <span className="mt-0.5 tracking-tight">Admin</span>
          </button>
        ) : null}
      </div>
    </nav>
  );
}
