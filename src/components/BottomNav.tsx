import { Home, CalendarCheck, Handshake, User, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { view, setView, bookings, currentUser } = useApp();

  const upcomingCount = bookings.filter((b) => b.status === 'upcoming').length;

  // Hide bottom nav on detail checkout screens
  if (view === 'worker-profile') return null;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
      <div className="flex items-center justify-around text-[10px] font-bold">
        {/* Home */}
        <button
          onClick={() => setView('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            view === 'home' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </button>

        {/* Bookings */}
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
          <span>Bookings</span>
        </button>

        {/* Customer Contract */}
        <button
          onClick={() => setView('customer')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            view === 'customer' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Handshake className="h-5 w-5" />
          <span>Contract</span>
        </button>

        {/* Helper Portal */}
        <button
          onClick={() => setView('worker')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            view === 'worker' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="h-5 w-5" />
          <span>Helper</span>
        </button>

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
