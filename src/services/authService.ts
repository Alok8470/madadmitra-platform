import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';

const STORAGE_KEY = 'madadmitra_user_session';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export function getStoredSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save session', err);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session', err);
  }
}

/**
 * Send OTP to phone number
 */
export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'OTP sent successfully via SMS' };
  }

  // Simulation mode (Test OTP is 123456)
  return {
    success: true,
    message: 'Demo Mode: OTP sent! (Use test code 123456)',
  };
}

/**
 * Verify 6-digit OTP
 */
export async function verifyOtp(
  phone: string,
  otp: string,
  role: UserRole,
  fullName: string,
  city: string
): Promise<{ success: boolean; profile?: UserProfile; message: string }> {
  const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    });

    if (error || !data.user) {
      return { success: false, message: error?.message || 'Invalid OTP' };
    }

    const profile: UserProfile = {
      id: data.user.id,
      phone: formattedPhone,
      fullName: fullName || 'MadadMitra User',
      role: role,
      city: city || 'Deoria',
      createdAt: new Date().toISOString(),
    };

    saveSession(profile);
    return { success: true, profile, message: 'Login successful' };
  }

  // Demo verification mode
  if (otp === '123456' || otp === '000000' || otp.length === 6) {
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      phone: formattedPhone,
      fullName: fullName.trim() || (role === 'worker' ? 'Service Partner' : 'Customer'),
      role: role,
      city: city || 'Deoria',
      createdAt: new Date().toISOString(),
    };

    saveSession(profile);
    return { success: true, profile, message: 'Verified successfully!' };
  }

  return { success: false, message: 'Invalid OTP code. Please use 123456 in demo mode.' };
}
