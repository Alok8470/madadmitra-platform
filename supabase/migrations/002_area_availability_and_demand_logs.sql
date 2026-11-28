-- ==============================================================================
-- MadadMitra (मदद मित्र) — Area Availability & Service Demand Logs Migration
-- Step 1: Area-based availability checking & "Coming Soon" demand logging
-- ==============================================================================

-- 1. Ensure profiles table supports customer area & city
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS city VARCHAR(60) NOT NULL DEFAULT 'Deoria',
  ADD COLUMN IF NOT EXISTS area VARCHAR(100) NOT NULL DEFAULT 'Deoria (All Areas)';

-- 2. Ensure workers / helpers table supports primary_area, serviceable_areas,
--    service_category, is_verified, and is_online
ALTER TABLE IF EXISTS public.workers
  ADD COLUMN IF NOT EXISTS primary_area TEXT,
  ADD COLUMN IF NOT EXISTS serviceable_areas TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS service_category TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT TRUE;

-- Backfill helper columns if missing or null
UPDATE public.workers
SET
  primary_area = COALESCE(primary_area, area, 'Deoria (All Areas)'),
  serviceable_areas = CASE
    WHEN serviceable_areas IS NULL OR serviceable_areas = '{}'
    THEN ARRAY[COALESCE(area, 'Deoria (All Areas)')]
    ELSE serviceable_areas
  END,
  service_category = COALESCE(service_category, service, 'cook'),
  is_verified = COALESCE(is_verified, verified, FALSE),
  is_online = COALESCE(is_online, online, TRUE);

-- 3. Create service_demand_logs table for capturing "Notify Me When Live" requests
CREATE TABLE IF NOT EXISTS public.service_demand_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15),
  city VARCHAR(60) NOT NULL DEFAULT 'Deoria',
  area VARCHAR(100) NOT NULL,
  service_category VARCHAR(50),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for speedy queries on area & service demand aggregation
CREATE INDEX IF NOT EXISTS idx_demand_logs_area ON public.service_demand_logs(city, area);
CREATE INDEX IF NOT EXISTS idx_demand_logs_service ON public.service_demand_logs(service_category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.service_demand_logs ENABLE ROW LEVEL SECURITY;

-- Allow any user (authenticated or visitor) to log demand when their area is coming soon
DO $$ BEGIN
  CREATE POLICY "Allow public insert to service_demand_logs"
    ON public.service_demand_logs
    FOR INSERT
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Allow users to view their own demand logs, or service role for admins
DO $$ BEGIN
  CREATE POLICY "Allow select on service_demand_logs"
    ON public.service_demand_logs
    FOR SELECT
    USING (auth.uid() = customer_id OR auth.role() = 'service_role');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
