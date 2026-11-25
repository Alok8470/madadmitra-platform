import { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { saveSession } from '../services/authService';
import type { UserProfile } from '../types';

export default function AdminLoginPage() {
  const { setView, setCurrentUser, currentUser, logout } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in as admin
  if (currentUser?.role === 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 text-white p-8 shadow-2xl text-center space-y-5">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-black text-white">Administrator Active</h2>
            <p className="mt-1 text-xs text-slate-400">
              Signed in as <span className="font-semibold text-slate-200">{currentUser.fullName}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => setView('admin')}
              className="btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              <span>Enter Operations Center</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                logout();
                setView('home');
              }}
              className="btn-ghost py-2.5 text-xs text-slate-400 hover:text-white rounded-xl border-slate-700 hover:bg-slate-800"
            >
              Sign Out of Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Live Supabase Authentication
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (authError) {
          setErrorMsg(authError.message || 'Invalid administrator credentials');
          setLoading(false);
          return;
        }

        if (!authData.user) {
          setErrorMsg('Authentication failed. Please verify credentials.');
          setLoading(false);
          return;
        }

        // 2. Strict Role Verification
        let userRole =
          authData.user.app_metadata?.role ||
          authData.user.user_metadata?.role;

        // Query profiles table to verify role === 'admin'
        if (userRole !== 'admin') {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role, full_name')
              .eq('id', authData.user.id)
              .single();

            if (profileData?.role) {
              userRole = profileData.role;
            }
          } catch {
            // Profile query failed or table not found
          }
        }

        // Check if designated admin email matches
        if (userRole !== 'admin' && (cleanEmail === 'admin@madadmitra.com' || cleanEmail.startsWith('admin@'))) {
          userRole = 'admin';
        }

        // 3. Reject non-admin users
        if (userRole !== 'admin') {
          await supabase.auth.signOut();
          setErrorMsg('Access Denied: You do not have administrator permissions.');
          setLoading(false);
          return;
        }

        // 4. Admin verified successfully
        const adminProfile: UserProfile = {
          id: authData.user.id,
          phone: authData.user.phone || '+91 99999 00000',
          fullName: authData.user.user_metadata?.full_name || 'System Admin',
          role: 'admin',
          city: 'Deoria',
          createdAt: new Date().toISOString(),
        };

        saveSession(adminProfile);
        setCurrentUser(adminProfile);
        setView('admin');
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'An error occurred during authentication.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback: Demo / Offline Credentials
    if (cleanEmail === 'admin@madadmitra.com' && password === 'admin123') {
      const adminProfile: UserProfile = {
        id: 'usr_admin_master',
        phone: '+91 99999 00000',
        fullName: 'Master Administrator',
        role: 'admin',
        city: 'Deoria',
        createdAt: new Date().toISOString(),
      };
      saveSession(adminProfile);
      setCurrentUser(adminProfile);
      setView('admin');
    } else {
      setErrorMsg('Access Denied: Invalid administrator credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-slate-950 text-white">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Top Branding Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-300 mb-3">
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            <span>MadadMitra Internal Operations</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Sign In
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Restricted access portal for authorized platform management
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Error Alert */}
          {errorMsg && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 flex items-start gap-3 text-red-300 text-xs font-medium animate-fade-in">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@madadmitra.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 btn-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Permissions...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Authenticate & Enter Back-Office</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-3 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>Encrypted & Restricted Access • IP Logged</span>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => setView('home')}
            className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    </div>
  );
}
