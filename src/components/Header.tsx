import { useState, useRef, useEffect, useMemo } from 'react';
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
  Wallet,
  Navigation,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { DEORIA_AREAS, COMING_SOON_CITIES } from '../data/mockData';
import type { UserRole } from '../types';

export default function Header() {
  const {
    city,
    setCity,
    view,
    setView,
    currentUser,
    logout,
    openAuthModal,
    bookings,
  } = useApp();
  const { language, toggleLanguage, t } = useLanguage();

  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const activeBookingsCount = useMemo(() => {
    return bookings.filter(
      (b) => b.status === 'upcoming' || b.status === 'accepted' || b.status === 'in_progress'
    ).length;
  }, [bookings]);

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

  const handleDetectLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setCity('Raghav Nagar');
      setIsLocating(false);
      setCityOpen(false);
    }, 450);
  };

  const filteredDeoria = useMemo(() => {
    if (!citySearch.trim()) return DEORIA_AREAS;
    return DEORIA_AREAS.filter((a) => a.toLowerCase().includes(citySearch.toLowerCase()));
  }, [citySearch]);

  const filteredUpcoming = useMemo(() => {
    if (!citySearch.trim()) return COMING_SOON_CITIES;
    return COMING_SOON_CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()));
  }, [citySearch]);

  const navBtn = (
    label: string,
    active: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    badgeCount?: number
  ) => (
    <button
      onClick={onClick}
      className={`relative hidden sm:inline-flex btn px-3.5 py-2 text-xs sm:text-sm transition-all duration-150 ${
        active
          ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-soft'
          : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-black text-white animate-pulse">
          {badgeCount}
        </span>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs box-border pt-[env(safe-area-inset-top,0px)]">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 w-full box-border">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-1.5 sm:gap-4">
          {/* Logo */}
          <button onClick={() => setView('home')} className="flex items-center gap-2 shrink-0 text-left group focus-visible:outline-none">
            <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-soft group-hover:scale-105 transition-transform shrink-0">
              <Handshake className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm sm:text-lg font-black tracking-tight text-slate-900">
                Madad<span className="text-brand-600">Mitra</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 hidden sm:block">
                {language === 'hi' ? 'भरोसेमंद मददगार' : 'Trusted Helpers'}
              </div>
            </div>
          </button>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              title="Toggle English / हिंदी"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 px-2 sm:px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-700 transition-all active:scale-95 shadow-xs shrink-0"
            >
              <Languages className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-600 shrink-0" />
              <span>{language === 'en' ? 'हिं' : 'EN'}</span>
            </button>

            {/* Location selector */}
            <div ref={cityRef} className="relative shrink-0">
              <button
                onClick={() => setCityOpen((o) => !o)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-700 transition-all active:scale-95 shadow-xs shrink-0 max-w-[85px] xs:max-w-[110px] sm:max-w-[150px]"
              >
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-600 shrink-0" />
                <span className="truncate">{city.replace(' (Coming Soon)', '')}</span>
                <ChevronDown
                  className={`h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400 transition-transform duration-200 shrink-0 ${
                    cityOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {cityOpen && (
                <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] max-h-[80vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated animate-scale-in origin-top-right z-50 flex flex-col">
                  {/* Search bar inside location dropdown */}
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder={language === 'hi' ? 'इलाका खोजें...' : 'Search colony / area...'}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 outline-none focus:border-brand-500"
                      />
                    </div>
                    {/* 1-Tap Geolocation button */}
                    <button
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-[11px] font-bold border border-brand-200/70 transition-colors active:scale-98"
                    >
                      <Navigation className={`h-3 w-3 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? (language === 'hi' ? 'स्थान खोज रहे हैं...' : 'Detecting GPS...') : (language === 'hi' ? '🎯 मेरा वर्तमान स्थान चुनें (GPS)' : '🎯 Detect My Area (GPS)')}</span>
                    </button>
                  </div>

                  {/* Scrollable Area List */}
                  <div className="overflow-y-auto overscroll-contain p-2 space-y-1 max-h-64">
                    <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 rounded-lg flex items-center justify-between">
                      <span>{language === 'hi' ? '📍 देवरिया • सक्रिय क्षेत्र' : '📍 Deoria • Live Service Areas'}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="space-y-0.5">
                      {filteredDeoria.map((areaName) => (
                        <button
                          key={areaName}
                          onClick={() => {
                            setCity(areaName);
                            setCityOpen(false);
                            setCitySearch('');
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs transition-colors active:scale-98 ${
                            areaName === city
                              ? 'bg-brand-50 font-bold text-brand-700'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <MapPin
                              className={`h-3.5 w-3.5 shrink-0 ${areaName === city ? 'text-brand-600' : 'text-slate-300'}`}
                            />
                            {areaName}
                          </span>
                          {areaName === city && <Check className="h-3.5 w-3.5 text-brand-600 shrink-0" />}
                        </button>
                      ))}
                    </div>

                    {filteredUpcoming.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 rounded-lg flex items-center justify-between">
                          <span>{language === 'hi' ? '🚀 आगामी शहर' : '🚀 Upcoming Hubs'}</span>
                          <Sparkles className="h-3 w-3 text-amber-600" />
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {filteredUpcoming.map((cName) => {
                            const cleanName = cName.replace(' (Coming Soon)', '');
                            return (
                              <button
                                key={cName}
                                onClick={() => {
                                  setCity(cName);
                                  setCityOpen(false);
                                  setCitySearch('');
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
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {navBtn(
              t.myBookings,
              view === 'bookings',
              () => setView('bookings'),
              <CalendarCheck className="h-4 w-4" />,
              activeBookingsCount
            )}

            {/* Partner / Worker Button (Only for Logged Out users) */}
            {!currentUser &&
              navBtn(
                'Partner with Us',
                view === 'partner-join',
                () => setView('partner-join'),
                <Briefcase className="h-4 w-4" />
              )}

            {/* User Session / Login Button */}
            {currentUser ? (
              <div ref={userRef} className="relative shrink-0">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors shrink-0 active:scale-95 shadow-xs"
                >
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="max-w-[50px] xs:max-w-[70px] sm:max-w-[80px] truncate">{currentUser.fullName}</span>
                  <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-card animate-scale-in origin-top-right z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{currentUser.role} Account</p>
                    </div>

                    {/* Customer Mode Links */}
                    {view !== 'worker' && (
                      <>
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
                        
                        <button
                          onClick={() => {
                            setView('wallet');
                            setUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          <span>My Wallet</span>
                        </button>
                      </>
                    )}

                    {/* Worker Mode Switcher */}
                    {currentUser.role === 'worker' && (
                      <div className="my-1">
                        {view === 'worker' ? (
                          <button
                            onClick={() => {
                              setView('home');
                              setUserMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-100 border border-brand-100 transition-colors"
                          >
                            <Handshake className="h-3.5 w-3.5" />
                            <span>Switch to Customer Mode</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setView('worker');
                              setUserMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-100 transition-colors"
                          >
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>Switch to Partner Mode</span>
                          </button>
                        )}
                        
                        {view === 'worker' && (
                          <button
                            onClick={() => {
                              setView('wallet');
                              setUserMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 mt-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Wallet className="h-3.5 w-3.5" />
                            <span>Payouts & Earnings</span>
                          </button>
                        )}
                      </div>
                    )}

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
                className="btn-primary px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold shadow-soft rounded-xl active:scale-95 shrink-0 gap-1 sm:gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{t.loginSignUp}</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
