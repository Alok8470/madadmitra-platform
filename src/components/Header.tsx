import { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  CalendarCheck,
  LogIn,
  Handshake,
  Languages,
  LogOut,
  User,
  ShieldCheck,
  Briefcase,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { DEORIA_AREAS, COMING_SOON_CITIES } from '../data/mockData';
import AuthModal from './AuthModal';
import type { UserProfile, UserRole } from '../types';

export default function Header() {
  const {
    city,
    setCity,
    cities,
    view,
    setView,
    currentUser,
    setCurrentUser,
    logout,
    authModalOpen,
    authModalRole,
    authModalWorkerMode,
    openAuthModal,
    closeAuthModal,
  } = useApp();
  const { language, toggleLanguage, t } = useLanguage();

  const [cityOpen, setCityOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openAuth = (role: UserRole = 'customer', mode: 'login' | 'signup' = 'login') => {
    openAuthModal(role, mode);
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    if (profile.role === 'worker') {
      setView('worker');
    } else if (profile.role === 'admin') {
      setView('admin');
    }
  };

  const navBtn = (label: string, active: boolean, onClick: () => void, icon: React.ReactNode) => (
    <button
      onClick={onClick}
      className={`btn px-3 py-2 text-xs sm:text-sm transition-all ${
        active
          ? 'bg-brand-50 text-brand-700 border border-brand-200'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-3">
          {/* Logo */}
          <button onClick={() => setView('home')} className="flex items-center gap-2.5 shrink-0 text-left">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-soft">
              <Handshake className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-extrabold tracking-tight text-slate-900">
                Madad<span className="text-brand-600">Mitra</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {language === 'hi' ? 'भरोसेमंद मददगार' : 'Trusted Helpers'}
              </div>
            </div>
          </button>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              title="Toggle English / हिंदी"
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Languages className="h-3.5 w-3.5 text-brand-600" />
              <span>{language === 'en' ? 'हिंदी' : 'Eng'}</span>
            </button>

            {/* Location selector */}
            <div ref={cityRef} className="relative">
              <button
                onClick={() => setCityOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                <span className="max-w-[85px] sm:max-w-[130px] truncate">{city}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                    cityOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {cityOpen && (
                <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-2xl animate-scale-in origin-top-right z-50 p-2">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 rounded-xl flex items-center justify-between">
                    <span>📍 Deoria (देवरिया) • Live Areas</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {DEORIA_AREAS.map((areaName) => (
                      <button
                        key={areaName}
                        onClick={() => {
                          setCity(areaName);
                          setCityOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                          areaName === city
                            ? 'bg-brand-50 font-bold text-brand-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin
                            className={`h-3.5 w-3.5 ${areaName === city ? 'text-brand-600' : 'text-slate-300'}`}
                          />
                          {areaName}
                        </span>
                        {areaName === city && <Check className="h-3.5 w-3.5 text-brand-600" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 rounded-xl flex items-center justify-between">
                      <span>🚀 Upcoming Hubs (जल्द आ रहे हैं)</span>
                      <Sparkles className="h-3 w-3 text-amber-600" />
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {COMING_SOON_CITIES.map((cName) => {
                        const cleanName = cName.replace(' (Coming Soon)', '');
                        return (
                          <button
                            key={cName}
                            onClick={() => {
                              setCity(cName);
                              setCityOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                              cName === city
                                ? 'bg-amber-50 font-bold text-amber-900'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-slate-300" />
                              {cleanName}
                            </span>
                            <span className="rounded-full bg-amber-100 text-amber-800 font-extrabold text-[9px] px-2 py-0.5">
                              Coming Soon
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {navBtn(t.myBookings, view === 'bookings', () => setView('bookings'), <CalendarCheck className="h-4 w-4" />)}

            {/* Worker Portal Button */}
            {navBtn(
              t.workerLogin,
              view === 'worker',
              () => {
                if (currentUser?.role === 'worker') {
                  setView('worker');
                } else {
                  openAuth('worker');
                }
              },
              <Briefcase className="h-4 w-4" />
            )}

            {/* User Session / Login Button */}
            {currentUser ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="max-w-[80px] truncate">{currentUser.fullName}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-card animate-scale-in origin-top-right z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{currentUser.role} Account</p>
                    </div>

                    <button
                      onClick={() => {
                        setView('bookings');
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <CalendarCheck className="h-3.5 w-3.5" />
                      <span>{t.myBookings}</span>
                    </button>

                    <button
                      onClick={() => {
                        setView('customer');
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Handshake className="h-3.5 w-3.5" />
                      <span>{t.customerDashboard}</span>
                    </button>

                    {(currentUser.role === 'admin' || currentUser.phone.includes('admin')) && (
                      <button
                        onClick={() => {
                          setView('admin');
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Admin Back-Office</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-error-600 hover:bg-error-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuth('customer')}
                className="btn-primary px-3 sm:px-4 py-2 text-xs sm:text-sm"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.loginSignUp}</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={authModalRole}
        defaultWorkerMode={authModalWorkerMode}
        cities={cities}
      />
    </header>
  );
}
