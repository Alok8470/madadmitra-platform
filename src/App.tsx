import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Homepage from './components/Homepage';
import WorkerDashboard from './components/WorkerDashboard';
import BookingsView from './components/BookingsView';
import CustomerDashboard from './components/CustomerDashboard';
import WorkerProfilePage from './components/WorkerProfilePage';
import AdminDashboard from './components/AdminDashboard';
import BottomNav from './components/BottomNav';
import PartnerJoinPage from './components/PartnerJoinPage';

function Shell() {
  const { view, selectedWorker, setView } = useApp();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pb-16 sm:pb-0">
      <div>
        <Header />
        <main>
          {view === 'home' && <Homepage />}
          {view === 'bookings' && <BookingsView />}
          {view === 'worker' && <WorkerDashboard />}
          {view === 'customer' && <CustomerDashboard />}
          {view === 'admin' && <AdminDashboard />}
          {view === 'partner-join' && <PartnerJoinPage />}

          {/* WORKER PROFILE ROUTE */}
          {view === 'worker-profile' && selectedWorker && (
            <WorkerProfilePage
              worker={selectedWorker}
              onBack={() => setView('home')}
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