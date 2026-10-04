import type { LucideIcon } from 'lucide-react';

export type UserRole = 'customer' | 'worker' | 'admin';

export type ServiceId =
  | 'cook'
  | 'cleaner'
  | 'electrician'
  | 'plumber'
  | 'all-rounder'
  | 'tag-team';

export interface Service {
  id: ServiceId;
  title: string;
  description: string;
  icon: LucideIcon;
  combo?: boolean;
  startingPrice: number;
  accent: string;
  popularItems?: string[];
}

export type CatalogMode = 'all' | 'verified_only';

export interface WorkerKYC {
  aadhaarLastFour: string;
  panLastFour?: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  submittedAt?: string;
  verifiedAt?: string;
  policeVerificationNo?: string;
  vaccinationStatus?: 'fully_vaccinated' | 'not_vaccinated';
  emergencyContact?: string;
}

export interface Worker {
  id: string;
  name: string;
  phone?: string;
  service: ServiceId;
  rating: number;
  jobs: number;
  area: string;
  city?: string;
  online: boolean;
  pricePerVisit: number;
  avatarColor: string;
  verified: boolean;
  isRealPartner?: boolean;
  kyc?: WorkerKYC;
  dailyRate?: number;
  experienceYears?: number;
  about?: string;
  skills?: string[];
  punctualityRate?: number; // e.g. 98%
  badgeTag?: string; // e.g. "Top Rated Cook", "Customer Favorite"
}

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'disputed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface MealPlanConfig {
  rotisCount: number;
  dalType: string;
  sabziType: string;
  riceType: string;
  spiceLevel: 'mild' | 'medium' | 'spicy';
  dietType: 'veg' | 'jain' | 'nonveg';
  specialNotes?: string;
}

export interface Booking {
  id: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  workerId?: string;
  workerName: string;
  service: ServiceId;
  date: string;
  time: string;
  durationHours?: number;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  fee: number; // Platform fee (₹10)
  totalAmount?: number; // Total order amount
  area: string;
  address?: string;
  notes?: string;
  isUrgentSOS?: boolean;
  mealPlan?: MealPlanConfig;
  addons?: {
    extraGuests?: boolean;
    extraUtensils?: boolean;
    extraNonVeg?: boolean;
  };
}

export interface RefundClaim {
  id: string;
  bookingId?: string;
  customerName: string;
  workerName: string;
  amount: number;
  reason: 'worker_absent' | 'substandard_service' | 'customer_cancelled';
  status: 'pending' | 'approved' | 'rejected';
  claimedAt: string;
  resolvedAt?: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  fullName: string;
  role: UserRole;
  city: string;
  area?: string;
  avatarUrl?: string;
  createdAt: string;
  service?: ServiceId;
  kyc?: WorkerKYC;
}

export interface Testimonial {
  id: string;
  author: string;
  locality: string;
  city: string;
  rating: number;
  serviceType: string;
  text: string;
  date: string;
  verifiedCustomer: boolean;
}
