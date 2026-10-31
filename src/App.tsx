import { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Homepage from './components/Homepage';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import type { UserProfile } from './types';

// Performance Optimization: Dynamic Route Code-Splitting for Sub-1.2s LCP
const WorkerDashboard = lazy(() => import('./components/WorkerDashboard'));
const BookingsView = lazy(() => import('./components/BookingsView'));
const CustomerDashboard = lazy(() => import('./components/CustomerDashboard'));
const WorkerProfilePage = lazy(() => import('./components/WorkerProfilePage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const PartnerJoinPage = lazy(() => import('./components/PartnerJoinPage'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const WalletPage = lazy(() => import('./components/WalletPage'));

function RouteSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6 animate-pulse">
      <div className="h-44 rounded-3xl bg-slate-200/80" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-28 rounded-2xl bg-slate-200/80" />
        <div className="h-28 rounded-2xl bg-slate-200/80" />
        <div className="h-28 rounded-2xl bg-slate-200/80" />
      </div>
      <div className="h-64 rounded-2xl bg-slate-200/80" />
    </div>
  );
}

function Shell() {
  const {
    view,
    selectedWorker,
    selectedCategory,
    setView,
    authModalOpen,
    closeAuthModal,
    authModalRole,
    authModalWorkerMode,
    cities,
    setCurrentUser,
  } = useApp();

  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    if (profile.role === 'worker') {
      setView('worker');
    } else if (profile.role === 'admin') {
      setView('admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
      <div>
        <Header />
        <main>
          {view === 'home' && <Homepage />}

          <Suspense fallback={<RouteSkeleton />}>
            {view === 'bookings' && <BookingsView />}
            {view === 'worker' && <WorkerDashboard />}
            {view === 'customer' && <CustomerDashboard />}
            {view === 'admin' && <AdminDashboard />}
            {view === 'partner-join' && <PartnerJoinPage />}
            {view === 'category' && <CategoryPage />}
            {view === 'wallet' && <WalletPage />}

            {/* WORKER PROFILE ROUTE */}
            {view === 'worker-profile' && selectedWorker && (
              <WorkerProfilePage
                worker={selectedWorker}
                onBack={() => setView(selectedCategory ? 'category' : 'home')}
              />
            )}

            {/* FALLBACK IF SELECTED WORKER NULL */}
            {view === 'worker-profile' && !selectedWorker && (
              <div className="mx-auto max-w-6xl px-4 py-16 text-center">
                <p className="text-slate-600 font-semibold">No worker selected.</p>
                <button onClick={() => setView('home')} className="btn-primary mt-4">
                  Back to Home
                </button>
              </div>
            )}
          </Suspense>
        </main>
      </div>

      <footer className="border-t border-slate-100 bg-white mt-12 mb-6 sm:mb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-center">
          <p className="font-display text-sm font-bold text-slate-700">MadadMitra</p>
          <p className="mt-1 text-xs text-slate-400">
            Trusted helpers for your household needs • Flat ₹10 platform fee • No expensive subscriptions
          </p>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Bar */}
      <BottomNav />

      {/* Global Auth Modal rendered outside header for full viewport layering */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={authModalRole}
        defaultWorkerMode={authModalWorkerMode}
        cities={cities}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </LanguageProvider>
  );
}