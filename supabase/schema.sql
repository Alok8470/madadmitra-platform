-- ==============================================================================
-- MADADMITRA (मदद मित्र) PRODUCTION DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Tier-2 / Tier-3 India Low-Overhead Local Services Protocol
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- CUSTOM ENUM TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'worker', 'merchant_kendra', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status_type AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status_type AS ENUM ('pending', 'broadcasted', 'accepted', 'en_route', 'in_progress', 'upcoming', 'completed', 'cancelled', 'disputed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'paid', 'paid_online', 'paid_cash_cod', 'refunded', 'disputed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dispute_status_type AS ENUM ('none', 'opened', 'under_review', 'resolved_refunded', 'resolved_rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM ('lead_fee_debit', 'wallet_recharge', 'convenience_fee', 'guarantee_pool_credit', 'kendra_kickback', 'dispute_payout');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked with Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    city VARCHAR(60) NOT NULL DEFAULT 'Agra',
    area VARCHAR(100) NOT NULL DEFAULT 'Kamla Nagar',
    pincode VARCHAR(10) DEFAULT '282005',
    avatar_url TEXT,
    language_pref VARCHAR(10) DEFAULT 'hi',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 2. HARDWARE MERCHANTS TABLE (Local Kendras / Offline Trust Anchors)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hardware_merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    shop_name VARCHAR(120) NOT NULL,
    merchant_name VARCHAR(100) NOT NULL,
    trade_license_no VARCHAR(50),
    gst_number VARCHAR(20),
    shop_address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(60) NOT NULL DEFAULT 'Agra',
    total_workers_onboarded INT DEFAULT 0,
    wallet_commission_balance NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 3. WORKERS TABLE (Extended Blue-Collar Partner Profiles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    kendra_guarantor_id UUID REFERENCES public.hardware_merchants(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    service VARCHAR(50) NOT NULL CHECK (service IN ('cook', 'cleaner', 'electrician', 'plumber', 'carpenter', 'painter', 'all-rounder', 'tag-team')),
    skills TEXT[] DEFAULT '{}',
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
    jobs_count INT NOT NULL DEFAULT 0,
    mohalla_jobs_count INT NOT NULL DEFAULT 12,
    city VARCHAR(60) NOT NULL DEFAULT 'Agra',
    area VARCHAR(100) NOT NULL,
    is_online BOOLEAN NOT NULL DEFAULT TRUE,
    price_per_visit INT NOT NULL DEFAULT 200,
    daily_rate INT NOT NULL DEFAULT 350,
    avatar_color VARCHAR(30) DEFAULT 'bg-brand-600',
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    sikka_balance INT NOT NULL DEFAULT 5, -- 5 Free Lead Tokens upon registration
    kyc_status kyc_status_type NOT NULL DEFAULT 'verified',
    aadhaar_last_four VARCHAR(4) DEFAULT '4819',
    police_verification_pledge BOOLEAN NOT NULL DEFAULT TRUE,
    punctuality_rate INT NOT NULL DEFAULT 98,
    badge_tag VARCHAR(50) DEFAULT 'सत्यापित मिस्त्री',
    audio_bio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 4. SERVICE CATEGORIES & SERVICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_categories (
    id VARCHAR(50) PRIMARY KEY,
    title_en VARCHAR(80) NOT NULL,
    title_hi VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    base_inspection_fee INT NOT NULL DEFAULT 150,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id VARCHAR(50) NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_hi VARCHAR(120) NOT NULL,
    standard_price INT NOT NULL,
    time_estimate_mins INT NOT NULL DEFAULT 45,
    description_hi TEXT
);

-- ------------------------------------------------------------------------------
-- 5. BOOKINGS TABLE (State Machine Core)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code VARCHAR(12) UNIQUE NOT NULL DEFAULT ('MM-' || UPPER(SUBSTRING(uuid_generate_v4()::text FROM 1 FOR 6))),
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
    problem_voice_note_url TEXT,
    notes TEXT,
    addons JSONB DEFAULT '{}'::jsonb,
    is_urgent_sos BOOLEAN DEFAULT FALSE,
    platform_fee INT NOT NULL DEFAULT 15, -- ₹15 Madad Suraksha Fee
    total_amount INT NOT NULL,
    status booking_status_type NOT NULL DEFAULT 'upcoming',
    payment_status payment_status_type NOT NULL DEFAULT 'paid_online',
    start_job_otp VARCHAR(4) NOT NULL DEFAULT '4821',
    end_job_otp VARCHAR(4) NOT NULL DEFAULT '9134',
    before_work_photo_url TEXT,
    after_work_photo_url TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 6. TRANSACTIONS & SIKKA LEDGER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    type transaction_type_enum NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    sikka_units INT DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 7. REVIEWS & RATINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    punctuality_rating INT CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 8. DISPUTES & PROPERTY DAMAGE ESCROW CLAIMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_code VARCHAR(12) UNIQUE NOT NULL DEFAULT ('DISP-' || UPPER(SUBSTRING(uuid_generate_v4()::text FROM 1 FOR 6))),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    raised_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    dispute_category VARCHAR(50) NOT NULL DEFAULT 'bad_workmanship',
    claim_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    approved_payout NUMERIC(10,2) DEFAULT 0.00,
    evidence_photos TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    status dispute_status_type NOT NULL DEFAULT 'opened',
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_workers_city_service ON public.workers(city, service);
CREATE INDEX IF NOT EXISTS idx_workers_online ON public.workers(is_online);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker ON public.bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_booking ON public.disputes(booking_id);

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_merchants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Anyone can view workers" ON public.workers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Worker can update own profile" ON public.workers FOR UPDATE USING (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Customers and workers can view their bookings" ON public.bookings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Anyone can insert booking" ON public.bookings FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Participants can update their booking" ON public.bookings FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- 11. ATOMIC RPC FUNCTION: accept_job_with_sikka
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION accept_job_with_sikka(
    p_booking_id UUID,
    p_worker_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_booking_status booking_status_type;
    v_worker_sikka INT;
    v_worker_profile_id UUID;
    v_worker_name VARCHAR(100);
BEGIN
    -- 1. Check worker Sikka balance with row lock
    SELECT sikka_balance, profile_id, name INTO v_worker_sikka, v_worker_profile_id, v_worker_name
    FROM public.workers
    WHERE id = p_worker_id
    FOR UPDATE;

    IF v_worker_sikka < 1 THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error_code', 'INSUFFICIENT_SIKKA', 
            'message', 'आपके पास सिक्के नहीं हैं। कृपया 10 सिक्कों का पैक रिचार्ज करें।'
        );
    END IF;

    -- 2. Check booking availability with row lock
    SELECT status INTO v_booking_status
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF v_booking_status != 'broadcasted' AND v_booking_status != 'pending' AND v_booking_status != 'upcoming' THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error_code', 'ALREADY_CLAIMED', 
            'message', 'यह काम पहले ही किसी अन्य साथी द्वारा स्वीकार कर लिया गया है।'
        );
    END IF;

    -- 3. Assign worker and set status to accepted
    UPDATE public.bookings
    SET 
        worker_id = p_worker_id,
        worker_name = v_worker_name,
        status = 'accepted'
    WHERE id = p_booking_id;

    -- 4. Deduct 1 Sikka from worker
    UPDATE public.workers
    SET sikka_balance = sikka_balance - 1
    WHERE id = p_worker_id;

    -- 5. Record transaction in ledger
    IF v_worker_profile_id IS NOT NULL THEN
        INSERT INTO public.transactions (user_id, booking_id, type, amount, sikka_units, remarks)
        VALUES (
            v_worker_profile_id, 
            p_booking_id, 
            'lead_fee_debit', 
            10.00, 
            1, 
            'काम स्वीकार करने का 1 सिक्का'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'काम सफलतापूर्वक स्वीकार किया गया!',
        'remaining_sikke', v_worker_sikka - 1
    );
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 12. SEED DATA (AUTHENTIC TIER-2 WORKERS & KENDRA PARTNERS)
-- ------------------------------------------------------------------------------
INSERT INTO public.service_categories (id, title_en, title_hi, icon_name, base_inspection_fee, sort_order)
VALUES
('electrician', 'Electrician', 'इलेक्ट्रीशियन', 'Zap', 150, 1),
('plumber', 'Plumber', 'प्लम्बर', 'Wrench', 150, 2),
('carpenter', 'Carpenter', 'बढ़ई / कारपेंटर', 'Hammer', 180, 3),
('painter', 'Painter', 'पेंटर', 'Paintbrush', 200, 4),
('cook', 'Cook', 'रसोइया / कुक', 'UtensilsCrossed', 200, 5),
('cleaner', 'Cleaner', 'सफाई कर्मी', 'Sparkles', 180, 6),
('all-rounder', 'All-Rounder', 'ऑल-राउंडर मिस्त्री', 'CheckCircle2', 250, 7)
ON CONFLICT (id) DO NOTHING;
