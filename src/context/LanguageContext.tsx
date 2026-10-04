import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface Translations {
  appName: string;
  tagline: string;
  subtagline: string;
  findHelpers: string;
  searchPlaceholder: string;
  searchBtn: string;
  all: string;
  cook: string;
  cleaner: string;
  electrician: string;
  plumber: string;
  allRounder: string;
  tagTeam: string;
  verifiedHelper: string;
  perVisit: string;
  bookNow: string;
  myBookings: string;
  workerLogin: string;
  customerDashboard: string;
  workerDashboard: string;
  adminPortal: string;
  logout: string;
  loginSignUp: string;
  feeNotice: string;
  languageName: string;
}

const DICTIONARY: Record<Language, Translations> = {
  en: {
    appName: 'MadadMitra',
    tagline: 'Find Trusted Helpers for Your Household Needs',
    subtagline: 'Verified cooks, cleaners, electricians, and more at just ₹10 platform fee.',
    findHelpers: 'Find Helpers',
    searchPlaceholder: 'Search for cook, cleaner, electrician...',
    searchBtn: 'Search',
    all: 'All',
    cook: 'Cook',
    cleaner: 'Cleaner',
    electrician: 'Electrician',
    plumber: 'Plumber',
    allRounder: 'All-Rounder',
    tagTeam: 'Tag-Team Combo',
    verifiedHelper: 'Verified Helper',
    perVisit: '/ visit',
    bookNow: 'Book Now',
    myBookings: 'My Bookings',
    workerLogin: 'Worker Login',
    customerDashboard: 'Customer Plan',
    workerDashboard: 'Worker Portal',
    adminPortal: 'Admin',
    logout: 'Logout',
    loginSignUp: 'Sign In / Register',
    feeNotice: 'Flat ₹10 platform fee • No expensive subscriptions',
    languageName: 'English',
  },
  hi: {
    appName: 'मददमित्र',
    tagline: 'घर के कामों के लिए भरोसेमंद मददगार पाएं',
    subtagline: 'सत्यापित रसोइया, सफाईकर्मी, इलेक्ट्रीशियन - केवल ₹10 प्लेटफॉर्म शुल्क पर।',
    findHelpers: 'मददगार खोजें',
    searchPlaceholder: 'रसोइया, सफाईकर्मी या इलेक्ट्रीशियन खोजें...',
    searchBtn: 'खोजें',
    all: 'सभी',
    cook: 'रसोइया (Cook)',
    cleaner: 'सफाईकर्मी (Cleaner)',
    electrician: 'इलेक्ट्रीशियन (Electrician)',
    plumber: 'प्लंबर (Plumber)',
    allRounder: 'ऑल-राउंडर (All-Rounder)',
    tagTeam: 'टैग-टीम (2 मददगार)',
    verifiedHelper: 'सत्यापित (Verified)',
    perVisit: '/ विज़िट',
    bookNow: 'बुक करें',
    myBookings: 'मेरी बुकिंग्स',
    workerLogin: 'मददगार लॉगिन',
    customerDashboard: 'ग्राहक योजना',
    workerDashboard: 'वर्कर पोर्टल',
    adminPortal: 'एडमिन',
    logout: 'लॉगआउट',
    loginSignUp: 'लॉगिन / पंजीकरण',
    feeNotice: 'मात्र ₹10 सुविधा शुल्क • कोई महंगी सदस्यता नहीं',
    languageName: 'हिंदी',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const value = {
    language,
    setLanguage,
    t: DICTIONARY[language],
    toggleLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
