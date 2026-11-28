import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { CITIES, INITIAL_BOOKINGS } from '../data/mockData';
import { getStoredSession, clearSession } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchHelpersFromSupabase,
  createHelperInSupabase,
  updateHelperInSupabase,
  deleteHelperFromSupabase,
  setHelperVerificationInSupabase,
  mapHelperRowToWorker,
} from '../services/helperService';
import type { Booking, Worker, UserProfile, UserRole, CatalogMode, VerificationStatus } from '../types';

export type View = 'home' | 'worker-profile' | 'customer' | 'worker' | 'bookings' | 'admin' | 'partner-join' | 'category' | 'wallet' | 'admin-login';

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
  setWorkerVerified: (
    idOrPhone: string,
    verified: boolean,
    status?: VerificationStatus,
    rejectionReason?: string | null
  ) => void;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  updateBooking: (b: Booking) => void;
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
  updateWorker: (w: Worker) => void;
  removeWorker: (id: string) => void;
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
  if (path === 'admin-login') return 'admin-login';
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

  // Sync helpers with Supabase public.helpers table on mount and via Realtime
  useEffect(() => {
    let isMounted = true;

    async function loadHelpersFromSupabase() {
      try {
        const supaHelpers = await fetchHelpersFromSupabase();
        if (isMounted && supaHelpers.length > 0) {
          setWorkers((prev) => {
            const supaMap = new Map<string, Worker>();
            supaHelpers.forEach((h) => supaMap.set(h.id, h));

            const merged = supaHelpers.slice();
            prev.forEach((localW) => {
              if (!supaMap.has(localW.id)) {
                merged.push(localW);
              }
            });

            try {
              localStorage.setItem(STORAGE_LIVE_WORKERS, JSON.stringify(merged));
            } catch (e) {
              console.error(e);
            }
            return merged;
          });
        }
      } catch (err) {
        console.warn('Could not load helpers from Supabase on mount:', err);
      }
    }

    loadHelpersFromSupabase();

    // Supabase Realtime channel for helpers
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('helpers_live_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'helpers' },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const mapped = mapHelperRowToWorker(payload.new);
              setWorkers((prev) => {
                const exists = prev.some((w) => w.id === mapped.id);
                const next = exists
                  ? prev.map((w) => (w.id === mapped.id ? { ...w, ...mapped } : w))
                  : [mapped, ...prev];
                try {
                  localStorage.setItem(STORAGE_LIVE_WORKERS, JSON.stringify(next));
                } catch {}
                return next;
              });
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as any)?.id;
              if (deletedId) {
                setWorkers((prev) => {
                  const next = prev.filter((w) => w.id !== deletedId);
                  try {
                    localStorage.setItem(STORAGE_LIVE_WORKERS, JSON.stringify(next));
                  } catch {}
                  return next;
                });
              }
            }
          }
        )
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleWorkerOnline = (id: string) => {
    let newOnline = false;
    setWorkers((prev) => {
      const updated = prev.map((w) => {
        if (w.id === id) {
          newOnline = !w.online;
          return { ...w, online: newOnline, is_online: newOnline };
        }
        return w;
      });
      try {
        const liveOnly = updated.filter((x) => x.isRealPartner || x.id.startsWith('w_live_'));
        localStorage.setItem(STORAGE_LIVE_WORKERS, JSON.stringify(liveOnly));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    updateHelperInSupabase(id, { online: newOnline, is_online: newOnline }).catch(console.warn);
  };

  const toggleWorkerVerified = (id: string) => {
    let newVerified = false;
    setWorkers((prev) => {
      const updated = prev.map((w) => {
        if (w.id === id) {
          newVerified = !(w.verification_status === 'verified' && (w.verified || w.is_verified));
          return {
            ...w,
            verified: newVerified,
            is_verified: newVerified,
            verification_status: newVerified ? ('verified' as VerificationStatus) : ('unsubmitted' as VerificationStatus),
          };
        }
        return w;
      });
      try {
        const liveOnly = updated.filter((x) => x.isRealPartner || x.id.startsWith('w_live_'));
        localStorage.setItem(STORAGE_LIVE_WORKERS, JSON.stringify(liveOnly));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setHelperVerificationInSupabase(id, newVerified ? 'verified' : 'unsubmitted').catch(console.warn);
  };

  const setWorkerVerified = (
    idOrPhone: string,
    verified: boolean,
    status?: VerificationStatus,
    rejectionReason?: string | null
  ) => {
    const finalStatus: VerificationStatus = status || (verified ? 'verified' : 'unsubmitted');
    const isVer = finalStatus === 'verified' && verified;

    setWorkers((prev) => {
      const updated = prev.map((w) => {
        const matches =
          w.id === idOrPhone ||
          (w.phone && idOrPhone && w.phone.replace(/\D/g, '').endsWith(idOrPhone.replace(/\D/g, '').slice(-10))) ||
          (w.name && idOrPhone && w.name.toLowerCase() === idOrPhone.toLowerCase());
        return matches
          ? {
              ...w,
              verified: isVer,
              is_verified: isVer,
              verification_status: finalStatus,
              rejection_reason: rejectionReason || null,
              isRealPartner: isVer ? true : w.isRealPartner,
            }
          : w;
      });
      try {
        const liveOnly = updated.filter((x) => x.isRealPartner || x.id.startsWith('w_live_'));
        localStorage.setItem(STORAGE_LIVE_WORKERS, JSON.stringify(liveOnly));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setHelperVerificationInSupabase(idOrPhone, finalStatus, rejectionReason).catch(console.warn);
  };

  const addBooking = (b: Booking) => setBookings((prev) => [b, ...prev]);

  const updateBooking = (b: Booking) =>
    setBookings((prev) => {
      const exists = prev.some((x) => x.id === b.id);
      if (exists) {
        return prev.map((x) => (x.id === b.id ? b : x));
      }
      return [b, ...prev];
    });

  const cancelBooking = (id: string) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
    );

  const decrementFreeBooking = () =>
    setFreeBookingsLeft((n) => Math.max(0, n - 1));

  const addWorker = (w: Worker) => {
    const isApproved = w.verification_status === 'verified' && (w.is_verified === true || w.verified === true);
    const partnerWorker: Worker = {
      ...w,
      isRealPartner: true,
      verified: isApproved,
      is_verified: isApproved,
      verification_status: isApproved ? 'verified' : (w.verification_status || 'unsubmitted'),
    };
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

    createHelperInSupabase(partnerWorker).catch(console.warn);
  };

  const updateWorker = (w: Worker) => {
    setWorkers((prev) => {
      const updated = prev.map((x) => (x.id === w.id ? { ...x, ...w } : x));
      try {
        const liveOnly = updated.filter((x) => x.isRealPartner || x.id.startsWith('w_live_'));
        localStorage.setItem(STORAGE_LIVE_WORKERS, JSON.stringify(liveOnly));
      } catch (e) {
        console.error('Failed to save worker to local storage', e);
      }
      return updated;
    });

    updateHelperInSupabase(w.id, w).catch(console.warn);
  };

  const removeWorker = (id: string) => {
    setWorkers((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      try {
        const liveOnly = updated.filter((x) => x.isRealPartner || x.id.startsWith('w_live_'));
        localStorage.setItem(STORAGE_LIVE_WORKERS, JSON.stringify(liveOnly));
      } catch (e) {
        console.error('Failed to update local storage after worker delete', e);
      }
      return updated;
    });

    deleteHelperFromSupabase(id).catch(console.warn);
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
      setWorkerVerified,
      bookings,
      addBooking,
      updateBooking,
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
      updateWorker,
      removeWorker,
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