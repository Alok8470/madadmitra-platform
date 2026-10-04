import { ChefHat, Sparkles, Zap, Wrench, Users, UserPlus } from 'lucide-react';
import type { ServiceId, Service, Worker, Booking, Testimonial } from '../types';

export { type ServiceId, type Service, type Worker, type Booking, type Testimonial };

export const SERVICES: Service[] = [
  {
    id: 'cook',
    title: 'Home Cook (Chef)',
    description: 'Fresh North & South Indian meals, customized rotis, breakfast & tiffins',
    icon: ChefHat,
    startingPrice: 250,
    accent: 'from-orange-500 to-amber-600',
    popularItems: ['Daily Roti & Sabzi', 'Dal Tadka & Rice', 'Breakfast Tiffins', 'Party Prep'],
  },
  {
    id: 'cleaner',
    title: 'House Maid & Cleaning',
    description: 'Daily sweeping, mopping, dusting, utensil wash & kitchen degreasing',
    icon: Sparkles,
    startingPrice: 200,
    accent: 'from-sky-500 to-blue-600',
    popularItems: ['Floor Scrubbing', 'Kitchen Slab Clean', 'Dusting & Cobweb', 'Bartan Wash'],
  },
  {
    id: 'electrician',
    title: 'Electrician & Repair',
    description: 'Wiring, MCB switches, ceiling fan, geyser & appliance fitting',
    icon: Zap,
    startingPrice: 150,
    accent: 'from-amber-400 to-yellow-600',
    popularItems: ['Short Circuit Fix', 'Fan Installation', 'Inverter Wiring', 'Light Fittings'],
  },
  {
    id: 'plumber',
    title: 'Plumber & Sanitary',
    description: 'Tap leak repair, overhead tank clean, pipe blockages & bathroom fitting',
    icon: Wrench,
    startingPrice: 180,
    accent: 'from-blue-500 to-indigo-600',
    popularItems: ['Tap Leakage', 'Blockage Clear', 'Motor Pump Repair', 'Toilet Fitting'],
  },
  {
    id: 'all-rounder',
    title: 'All-Rounder Domestic Helper',
    description: 'Complete home relief: Cooking + House Cleaning + Daily Errands',
    icon: Users,
    startingPrice: 400,
    combo: true,
    accent: 'from-emerald-500 to-teal-600',
    popularItems: ['Morning Tea & Breakfast', 'House Mopping', 'Vessel Cleaning', 'Evening Tea'],
  },
  {
    id: 'tag-team',
    title: 'Tag-Team Combo (2 Helpers)',
    description: 'Two specialized pros at your doorstep for double speed & efficiency',
    icon: UserPlus,
    startingPrice: 650,
    combo: true,
    accent: 'from-violet-500 to-purple-600',
    popularItems: ['1 Cook + 1 Maid', 'Express 1-Hr Complete', 'Family Gathering Prep'],
  },
];

// Deoria Main Hub & its local areas/tehsils
export const DEORIA_AREAS = [
  'Deoria (All Areas)',
  'Raghav Nagar',
  'Civil Lines (Deoria)',
  'Subhash Chowk / Kasia Road',
  'Malviya Road / CC Road',
  'Garulpar',
  'Uma Nagar',
  'Saket Nagar',
  'Salempur',
  'Bhatpar Rani',
  'Rudrapur',
  'Barhaj',
  'Gauri Bazar',
  'Rampur Karkhana',
  'Lar',
  'Baitalpur',
  'Tarkulwa',
  'Bhaluani',
];

// Upcoming expansion regions
export const COMING_SOON_CITIES = [
  'Gorakhpur (Coming Soon)',
  'Kushinagar (Coming Soon)',
  'Maharajganj (Coming Soon)',
  'Mau (Coming Soon)',
  'Ballia (Coming Soon)',
  'Azamgarh (Coming Soon)',
  'Varanasi (Coming Soon)',
  'Lucknow (Coming Soon)',
];

export const CITIES = [
  ...DEORIA_AREAS,
  ...COMING_SOON_CITIES,
];

// No dummy helpers. Real helpers appear only after government KYC verification (Aadhaar & PAN)
export const WORKERS: Worker[] = [];

// No dummy bookings. Real bookings appear only when customer schedules service
export const INITIAL_BOOKINGS: Booking[] = [];

export const SERVICE_LABELS: Record<ServiceId, string> = {
  cook: 'Cook (Chef)',
  cleaner: 'House Maid & Cleaner',
  electrician: 'Electrician',
  plumber: 'Plumber',
  'all-rounder': 'All-Rounder Helper',
  'tag-team': 'Tag-Team Combo (2 Helpers)',
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    author: 'Pooja Singhal',
    locality: 'Raghav Nagar',
    city: 'Deoria',
    rating: 5,
    serviceType: 'Cook Service',
    text: 'Our cook arrived right on time and prepared soft rotis and fresh dal-sabzi for our family. Just ₹10 booking fee vs paying ₹2,000 broker commission was unbelievable!',
    date: '2 days ago',
    verifiedCustomer: true,
  },
  {
    id: 't2',
    author: 'Vikramaditya Roy',
    locality: 'Civil Lines',
    city: 'Deoria',
    rating: 5,
    serviceType: 'Maid & Deep Cleaning',
    text: 'Our regular maid went on emergency leave during festivals. Booked a verified helper on MadadMitra at 8:30 AM and she arrived by 9:15 AM. Absolute lifesaver.',
    date: 'Last week',
    verifiedCustomer: true,
  },
  {
    id: 't3',
    author: 'Dr. Anjali Agarwal',
    locality: 'Salempur',
    city: 'Deoria',
    rating: 5,
    serviceType: 'Monthly Cook Contract',
    text: 'The best part is their absence guarantee. When our regular cook was unwell, MadadMitra dispatched a substitute cook without asking for extra money.',
    date: '3 days ago',
    verifiedCustomer: true,
  },
];
