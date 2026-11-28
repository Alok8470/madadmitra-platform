-- ==============================================================================
-- MadadMitra (मदद मित्र) — Nearest Helper Matching & Auto-Dispatch Initiation
-- Migration 003: Booking & Dispatch schema update
-- ==============================================================================

-- 1. Extend or adapt status column on bookings table to support:
--    'searching_helper', 'assigned', 'manual_needed', 'completed', 'cancelled'
DO $$ BEGIN
  ALTER TYPE booking_status_type ADD VALUE IF NOT EXISTS 'searching_helper';
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE booking_status_type ADD VALUE IF NOT EXISTS 'assigned';
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE booking_status_type ADD VALUE IF NOT EXISTS 'manual_needed';
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;

-- 2. Add dispatch matching columns to public.bookings
ALTER TABLE IF EXISTS public.bookings
  ADD COLUMN IF NOT EXISTS assigned_helper_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS attempt_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rejected_helper_ids UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS current_offer_helper_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS offer_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_lat NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS customer_lng NUMERIC(9,6);

-- 3. Add GPS coordinate columns to public.workers for distance-based sorting
ALTER TABLE IF EXISTS public.workers
  ADD COLUMN IF NOT EXISTS lat NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS lng NUMERIC(9,6);

-- 4. Create index for fast retrieval of pending dispatch offers
CREATE INDEX IF NOT EXISTS idx_bookings_dispatch_status
  ON public.bookings(status, current_offer_helper_id, offer_expires_at);

CREATE INDEX IF NOT EXISTS idx_workers_dispatch_lookup
  ON public.workers(service_category, is_verified, is_online, primary_area);

-- 5. RLS policies for dispatch updates
-- Enable authenticated helpers to accept or decline offers targeted to them
DO $$ BEGIN
  CREATE POLICY "Helpers can view bookings offered to them"
    ON public.bookings
    FOR SELECT
    USING (
      current_offer_helper_id = auth.uid() OR
      assigned_helper_id = auth.uid() OR
      auth.role() = 'service_role'
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
