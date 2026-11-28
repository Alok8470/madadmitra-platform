-- ==============================================================================
-- MadadMitra (मदद मित्र) — Step 3: Helper Realtime Dispatch & Fallback Cascade
-- Migration 004: Enable Realtime publication & Helper Update Policies
-- ==============================================================================

-- 1. Enable Full Replica Identity on bookings for reliable postgres_changes payloads
ALTER TABLE IF EXISTS public.bookings REPLICA IDENTITY FULL;

-- 2. Add bookings to supabase_realtime publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- 3. RLS policy to allow offered helper or assigned helper to update their booking
DO $$
BEGIN
  CREATE POLICY "Helpers can update bookings offered to them"
    ON public.bookings
    FOR UPDATE
    USING (
      current_offer_helper_id = auth.uid() OR
      assigned_helper_id = auth.uid() OR
      auth.role() = 'service_role'
    )
    WITH CHECK (
      current_offer_helper_id = auth.uid() OR
      assigned_helper_id = auth.uid() OR
      auth.role() = 'service_role'
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
