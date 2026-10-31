import { Home, CalendarCheck, Handshake, User, Briefcase, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav() {
  const { view, setView, bookings, currentUser } = useApp();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const upcomingCount = bookings.filter((b) => b.status === 'upcoming' || b.status === 'accepted' || b.status === 'in_progress').length;

  // Hide bottom nav on worker profile view
  if (view === 'worker-profile') return null;

  const isWorkerRole = currentUser?.role === 'worker';

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around text-[10px] font-bold">
        {isWorkerRole ? (
          <>
            {/* Worker: Dashboard */}
            <button
              onClick={() => setView('worker')}
              className={`flex flex-col items-center gap-1 transition-colors ${view === 'worker' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Briefcase className="h-5 w-5" />
              <span>{isHi ? 'काम' : 'Jobs'}</span>
            </button>
            {/* Worker: Wallet */}
            <button
              onClick={() => setView('wallet')}
              className={`flex flex-col items-center gap-1 transition-colors ${view === 'wallet' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Wallet className="h-5 w-5" />
              <span>{isHi ? 'सिक्के' : 'Tokens'}</span>
            </button>
            {/* Worker: Switch to Customer View */}
            <button
              onClick={() => setView('home')}
              className={`flex flex-col items-center gap-1 transition-colors ${view === 'home' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Home className="h-5 w-5" />
              <span>{isHi ? 'ग्राहक ऐप' : 'Customer Mode'}</span>
            </button>
          </>
        ) : (
          <>
            {/* Customer: Home */}
            <button
              onClick={() => setView('home')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                view === 'home' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>{isHi ? 'होम' : 'Home'}</span>
            </button>

            {/* Customer: Bookings */}
            <button
              onClick={() => setView('bookings')}
              className={`relative flex flex-col items-center gap-1 transition-colors ${
                view === 'bookings' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <CalendarCheck className="h-5 w-5" />
                {upcomingCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-extrabold text-white">
                    {upcomingCount}
                  </span>
                )}
              </div>
              <span>{isHi ? 'बुकिंग्स' : 'Bookings'}</span>
            </button>

            {/* Customer: Contract */}
            <button
              onClick={() => setView('customer')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                view === 'customer' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Handshake className="h-5 w-5" />
              <span>{isHi ? 'योजना' : 'Plan'}</span>
            </button>

            {/* Customer: Wallet */}
            <button
              onClick={() => setView('wallet')}
              className={`flex flex-col items-center gap-1 transition-colors ${
                view === 'wallet' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Wallet className="h-5 w-5" />
              <span>{isHi ? 'वॉलेट' : 'Wallet'}</span>
            </button>
          </>
        )}

        {/* Account / Admin */}
        {currentUser?.role === 'admin' ? (
          <button
            onClick={() => setView('admin')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              view === 'admin' ? 'text-purple-700' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Admin</span>
          </button>
        ) : null}
      </div>
    </nav>
  );
}
