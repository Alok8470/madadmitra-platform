-- ==============================================================================
-- MadadMitra (मदद मित्र) — Migration 006: Create & Sync Public Helpers Table
-- ==============================================================================

-- 1. Create public.helpers table if it does not exist
CREATE TABLE IF NOT EXISTS public.helpers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_category TEXT NOT NULL,
  primary_area TEXT NOT NULL DEFAULT 'Deoria',
  serviceable_areas TEXT[] NOT NULL DEFAULT ARRAY['Deoria'],
  price_per_visit NUMERIC NOT NULL DEFAULT 200,
  experience_years INTEGER NOT NULL DEFAULT 1,
  is_online BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_status TEXT NOT NULL DEFAULT 'unsubmitted' CHECK (verification_status IN ('unsubmitted', 'pending', 'verified', 'rejected')),
  aadhaar_last4 TEXT,
  aadhaar_front_path TEXT,
  aadhaar_back_path TEXT,
  selfie_path TEXT,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  rating NUMERIC(3,2) DEFAULT 5.0,
  jobs_count INTEGER DEFAULT 0,
  avatar_color TEXT DEFAULT 'bg-brand-600',
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add any missing columns to existing helpers table (for backward-compatibility)
ALTER TABLE IF EXISTS public.helpers
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS service_category TEXT,
  ADD COLUMN IF NOT EXISTS primary_area TEXT DEFAULT 'Deoria',
  ADD COLUMN IF NOT EXISTS serviceable_areas TEXT[] DEFAULT ARRAY['Deoria'],
  ADD COLUMN IF NOT EXISTS price_per_visit NUMERIC DEFAULT 200,
  ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unsubmitted',
  ADD COLUMN IF NOT EXISTS aadhaar_last4 TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_front_path TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_back_path TEXT,
  ADD COLUMN IF NOT EXISTS selfie_path TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS jobs_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT 'bg-brand-600',
  ADD COLUMN IF NOT EXISTS lat NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS lng NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Indexes for fast lookup by category, verified status, online status, and primary area
CREATE INDEX IF NOT EXISTS idx_helpers_dispatch
  ON public.helpers(service_category, is_verified, is_online, primary_area);

CREATE INDEX IF NOT EXISTS idx_helpers_user_id
  ON public.helpers(user_id);

CREATE INDEX IF NOT EXISTS idx_helpers_phone
  ON public.helpers(phone);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.helpers ENABLE ROW LEVEL SECURITY;

-- Allow public read access so customers and dispatch algorithm can see active helpers
DO $$
BEGIN
  CREATE POLICY "Public read helpers"
    ON public.helpers
    FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow authenticated users to insert helper profiles (e.g., signup / onboarding)
DO $$
BEGIN
  CREATE POLICY "Authenticated users can insert helper"
    ON public.helpers
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'anon' OR auth.role() = 'service_role');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow helpers to update their own record, and admins to update any record
DO $$
BEGIN
  DROP POLICY IF EXISTS "Helpers and Admins can update helper records" ON public.helpers;
  CREATE POLICY "Helpers and Admins can update helper records"
    ON public.helpers
    FOR UPDATE
    USING (
      auth.uid() = user_id OR
      auth.uid() IS NULL OR
      auth.role() = 'anon' OR
      auth.role() = 'service_role' OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
    WITH CHECK (
      auth.uid() = user_id OR
      auth.uid() IS NULL OR
      auth.role() = 'anon' OR
      auth.role() = 'service_role' OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Allow Admins to delete helpers
DO $$
BEGIN
  CREATE POLICY "Admins can delete helpers"
    ON public.helpers
    FOR DELETE
    USING (
      auth.uid() = user_id OR
      auth.role() = 'service_role' OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 5. Enable Realtime on public.helpers
ALTER TABLE IF EXISTS public.helpers REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'helpers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.helpers;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
