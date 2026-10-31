import type { LucideIcon } from 'lucide-react';

export type UserRole = 'customer' | 'worker' | 'merchant_kendra' | 'admin';

export type ServiceId =
  | 'cook'
  | 'cleaner'
  | 'electrician'
  | 'plumber'
  | 'carpenter'
  | 'painter'
  | 'all-rounder'
  | 'tag-team';

export interface Service {
  id: ServiceId;
  title: string;
  titleHi?: string;
  description: string;
  icon: LucideIcon;
  combo?: boolean;
  startingPrice: number;
  accent: string;
  popularItems?: string[];
}

export type CatalogMode = 'all' | 'verified_only';

export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface WorkerKYC {
  aadhaarLastFour: string;
  panLastFour?: string;
  status: KYCStatus;
  submittedAt?: string;
  verifiedAt?: string;
  policeVerificationNo?: string;
  vaccinationStatus?: 'fully_vaccinated' | 'not_vaccinated';
  emergencyContact?: string;
  kendraGuarantorName?: string;
  kendraGuarantorShop?: string;
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
  badgeTag?: string; // e.g. "Top Rated Cook", "Customer Favorite", "सत्यापित मिस्त्री"
  sikkaBalance?: number; // MadadMitra Lead Tokens
  kendraGuarantorId?: string;
  audioBioUrl?: string;
  mohallaJobsCount?: number; // "पड़ोसी द्वारा प्रमाणित" (e.g. 18 jobs in area)
}

export type BookingStatus =
  | 'pending'
  | 'broadcasted'
  | 'accepted'
  | 'en_route'
  | 'in_progress'
  | 'upcoming' // preserved for backward-compatibility with UI tabs
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'paid_online'
  | 'paid_cash_cod'
  | 'refunded'
  | 'disputed';

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
  bookingCode?: string;
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
  fee: number; // Platform fee (₹15 Madad Suraksha Fee)
  totalAmount?: number; // Total order amount
  area: string;
  address?: string;
  notes?: string;
  isUrgentSOS?: boolean;
  startJobOtp?: string;
  endJobOtp?: string;
  beforeWorkPhotoUrl?: string;
  afterWorkPhotoUrl?: string;
  startedAt?: string;
  completedAt?: string;
  problemVoiceNoteUrl?: string;
  mealPlan?: MealPlanConfig;
  addons?: {
    extraGuests?: boolean;
    extraUtensils?: boolean;
    extraNonVeg?: boolean;
  };
}

export interface HardwareMerchant {
  id: string;
  profileId: string;
  shopName: string;
  merchantName: string;
  phone: string;
  shopAddress: string;
  pincode: string;
  area: string;
  totalWorkersOnboarded: number;
  walletCommissionBalance: number;
}

export interface Dispute {
  id: string;
  disputeCode: string;
  bookingId: string;
  raisedById: string;
  category: 'bad_workmanship' | 'accidental_damage' | 'overcharging' | 'no_show';
  claimAmount: number;
  approvedPayout: number;
  status: 'opened' | 'under_review' | 'resolved_refunded' | 'resolved_rejected';
  description: string;
  evidencePhotos?: string[];
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  bookingId?: string;
  type: 'lead_fee_debit' | 'wallet_recharge' | 'convenience_fee' | 'guarantee_pool_credit' | 'kendra_kickback' | 'dispute_payout';
  amount: number;
  sikkaUnits?: number;
  status: 'success' | 'pending' | 'failed';
  remarks?: string;
  createdAt: string;
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
  sikkaBalance?: number;
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
