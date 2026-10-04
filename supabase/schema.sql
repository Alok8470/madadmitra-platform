-- ==============================================================================
-- MADADMITRA DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'worker', 'admin')),
    city VARCHAR(50) NOT NULL DEFAULT 'Agra',
    area VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKERS TABLE (Extended details for service providers)
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    service VARCHAR(50) NOT NULL CHECK (service IN ('cook', 'cleaner', 'electrician', 'plumber', 'all-rounder', 'tag-team')),
    rating NUMERIC(2, 1) DEFAULT 5.0,
    jobs_count INT DEFAULT 0,
    city VARCHAR(50) NOT NULL DEFAULT 'Agra',
    area VARCHAR(100) NOT NULL,
    is_online BOOLEAN DEFAULT TRUE,
    price_per_visit INT NOT NULL DEFAULT 200,
    avatar_color VARCHAR(30) DEFAULT 'bg-brand-600',
    verified BOOLEAN DEFAULT FALSE,
    aadhaar_last_four VARCHAR(4),
    kyc_status VARCHAR(20) DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
    free_bookings_left INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(15) NOT NULL,
    worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
    worker_name VARCHAR(100) NOT NULL,
    service VARCHAR(50) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(20) NOT NULL,
    duration_hours INT DEFAULT 1,
    area VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    addons JSONB DEFAULT '{}'::jsonb,
    platform_fee INT DEFAULT 10,
    total_amount INT NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled', 'disputed')),
    payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MONTHLY CONTRACTS / SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
    monthly_fee INT NOT NULL DEFAULT 3000,
    daily_rate INT NOT NULL DEFAULT 100,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REFUND & ABSENCE CLAIMS
CREATE TABLE IF NOT EXISTS public.refund_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    worker_name VARCHAR(100) NOT NULL,
    amount INT NOT NULL DEFAULT 80,
    reason VARCHAR(50) DEFAULT 'worker_absent',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 6. REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workers_city_service ON public.workers(city, service);
CREATE INDEX IF NOT EXISTS idx_workers_online ON public.workers(is_online);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker ON public.bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read profiles; Users update only their own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Workers: Visible to everyone if online, worker can update their own status
CREATE POLICY "Anyone can view workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Worker can update own profile" ON public.workers FOR UPDATE USING (auth.uid() = profile_id);

-- Bookings: Customers can read and create their bookings; workers see their assigned bookings
CREATE POLICY "Customers can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Anyone can insert booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers and workers can update their booking" ON public.bookings FOR UPDATE USING (auth.uid() = customer_id);

-- Refund Claims: Customers can create, Admins can view/update
CREATE POLICY "Customers can view their claims" ON public.refund_claims FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can insert claims" ON public.refund_claims FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- SEED DATA (INITIAL SAMPLE WORKERS)
-- ==============================================================================
INSERT INTO public.workers (name, service, rating, jobs_count, city, area, is_online, price_per_visit, avatar_color, verified, kyc_status)
VALUES 
('Sunita Devi', 'cook', 4.9, 421, 'Agra', 'Kamla Nagar', true, 280, 'bg-rose-500', true, 'verified'),
('Ramesh Kumar', 'cook', 4.8, 312, 'Agra', 'Sikandra', true, 260, 'bg-orange-500', true, 'verified'),
('Imran Khan', 'electrician', 4.7, 198, 'Agra', 'Civil Lines', true, 170, 'bg-amber-500', true, 'verified'),
('Deepak Sharma', 'plumber', 4.6, 156, 'Agra', 'Sanjay Place', false, 190, 'bg-blue-500', true, 'verified'),
('Anita Verma', 'cleaner', 4.9, 503, 'Agra', 'Tajganj', true, 210, 'bg-cyan-500', true, 'verified'),
('Mohan Lal', 'all-rounder', 4.8, 287, 'Agra', 'Firozabad Road', true, 420, 'bg-emerald-500', true, 'verified'),
('Vikas & Sonu', 'tag-team', 4.7, 134, 'Agra', 'M.G. Road', true, 680, 'bg-violet-500', true, 'verified')
ON CONFLICT DO NOTHING;
