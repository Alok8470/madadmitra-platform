import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { CITIES, INITIAL_BOOKINGS } from '../data/mockData';
import { getStoredSession, clearSession } from '../services/authService';
import type { Booking, Worker, UserProfile, UserRole, CatalogMode } from '../types';

export type View = 'home' | 'worker-profile' | 'customer' | 'worker' | 'bookings' | 'admin' | 'partner-join' | 'category' | 'wallet';

const STORAGE_LIVE_WORKERS = 'madadmitra_live_workers';
const STORAGE_CATALOG_MODE = 'madadmitra_catalog_mode';

function getInitialWorkers(): Worker[] {
  try {
    const raw = localStorage.getItem(STORAGE_LIVE_WORKERS);
    const liveWorkers: Worker[] = raw ? JSON.parse(raw) : [];
    // Only return actual live partners registered through the KYC flow
    return liveWorkers.filter((w) => w.isRealPartner || w.id.startsWith('w_live_'));
  } catch {
    return [];
  }
}

function getInitialCatalogMode(): CatalogMode {
  return 'verified_only';
}

interface AppState {
  city: string;
  setCity: (c: string) => void;
  cities: string[];
  view: View;
  setView: (v: View) => void;
  selectedWorker: Worker | null;
  setSelectedWorker: (w: Worker | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
  workers: Worker[];
  toggleWorkerOnline: (id: string) => void;
  toggleWorkerVerified: (id: string) => void;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string) => void;
  // worker dashboard
  freeBookingsLeft: number;
  decrementFreeBooking: () => void;
  // customer dashboard
  contractActive: boolean;
  setContractActive: (v: boolean) => void;
  workerAbsent: boolean;
  setWorkerAbsent: (v: boolean) => void;
  currentContractWorker: string;
  setContractWorker: (name: string) => void;
  // User Authentication
  currentUser: UserProfile | null;
  setCurrentUser: (u: UserProfile | null) => void;
  logout: () => void;
  addWorker: (w: Worker) => void;
  // Platform Deployment / Showcase Mode
  catalogMode: CatalogMode;
  setCatalogMode: (mode: CatalogMode) => void;
  // Global Auth Modal Controls
  authModalOpen: boolean;
  authModalRole: UserRole;
  authModalWorkerMode: 'login' | 'signup';
  openAuthModal: (role?: UserRole, mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

const AppContext = createContext<AppState | null>(null);

const FREE_LIMIT = 5;

function getViewFromPathname(): View {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.replace(/^\//, '');
  if (path === 'bookings') return 'bookings';
  if (path === 'worker') return 'worker';
  if (path === 'customer') return 'customer';
  if (path === 'admin') return 'admin';
  if (path === 'partner-join') return 'partner-join';
  return 'home';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState<string>('Deoria (All Areas)');
  const [view, setViewState] = useState<View>(getViewFromPathname);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [workers, setWorkers] = useState<Worker[]>(getInitialWorkers);
  const [catalogMode, setCatalogModeState] = useState<CatalogMode>(getInitialCatalogMode);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [freeBookingsLeft, setFreeBookingsLeft] = useState<number>(FREE_LIMIT);
  const [contractActive, setContractActive] = useState<boolean>(false);
  const [workerAbsent, setWorkerAbsent] = useState<boolean>(false);
  const [currentContractWorker, setContractWorker] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredSession);

  // Global Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('customer');
  const [authModalWorkerMode, setAuthModalWorkerMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (role: UserRole = 'customer', mode: 'login' | 'signup' = 'login') => {
    setAuthModalRole(role);
    setAuthModalWorkerMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const setCatalogMode = (mode: CatalogMode) => {
    setCatalogModeState(mode);
    try {
      localStorage.setItem(STORAGE_CATALOG_MODE, mode);
    } catch (e) {
      console.error('Failed to save catalog mode', e);
    }
  };

  // Sync browser URL with view state
  const setView = (newView: View) => {
    setViewState(newView);
    if (typeof window !== 'undefined') {
      const newPath = newView === 'home' ? '/' : `/${newView}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    }
  };

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setViewState(getViewFromPathname());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const toggleWorkerOnline = (id: string) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, online: !w.online } : w))
    );
  };

  const toggleWorkerVerified = (id: string) => {
    setWorkers((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, verified: !w.verified } : w));
      try {
        const liveOnly = updated.filter((x) => x.isRealPartner || x.id.startsWith('w_live_'));
        localStorage.setItem(STORAGE_LIVE_WORKERS, JSON.stringify(liveOnly));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const addBooking = (b: Booking) => setBookings((prev) => [b, ...prev]);

  const cancelBooking = (id: string) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
    );

  const decrementFreeBooking = () =>
    setFreeBookingsLeft((n) => Math.max(0, n - 1));

  const addWorker = (w: Worker) => {
    const partnerWorker: Worker = { ...w, isRealPartner: true };
    setWorkers((prev) => {
      const updated = [partnerWorker, ...prev.filter((x) => x.id !== partnerWorker.id)];
      try {
        const liveOnly = updated.filter((x) => x.isRealPartner || x.id.startsWith('w_live_'));
        localStorage.setItem(STORAGE_LIVE_WORKERS, JSON.stringify(liveOnly));
      } catch (e) {
        console.error('Failed to save worker to local storage', e);
      }
      return updated;
    });
  };

  const logout = () => {
    clearSession();
    setCurrentUser(null);
    setView('home');
  };

  const value = useMemo<AppState>(
    () => ({
      city,
      setCity,
      cities: CITIES,
      view,
      setView,
      selectedWorker,
      setSelectedWorker,
      selectedCategory,
      setSelectedCategory,
      workers,
      toggleWorkerOnline,
      toggleWorkerVerified,
      bookings,
      addBooking,
      cancelBooking,
      freeBookingsLeft,
      decrementFreeBooking,
      contractActive,
      setContractActive,
      workerAbsent,
      setWorkerAbsent,
      currentContractWorker,
      setContractWorker,
      currentUser,
      setCurrentUser,
      logout,
      addWorker,
      catalogMode,
      setCatalogMode,
      authModalOpen,
      authModalRole,
      authModalWorkerMode,
      openAuthModal,
      closeAuthModal,
    }),
    [
      city,
      view,
      selectedWorker,
      workers,
      bookings,
      freeBookingsLeft,
      contractActive,
      workerAbsent,
      currentContractWorker,
      currentUser,
      catalogMode,
      authModalOpen,
      authModalRole,
      authModalWorkerMode,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}