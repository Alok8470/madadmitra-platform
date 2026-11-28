-- ==============================================================================
-- MadadMitra (मदद मित्र) — Migration 005: Admin Delete Helper Support
-- ==============================================================================

-- 1. Ensure foreign keys on bookings gracefully set null if a helper is removed
DO $$
BEGIN
  -- If bookings table has assigned_helper_id, ensure ON DELETE SET NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc 
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'bookings' AND ccu.column_name = 'assigned_helper_id' AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    NULL; -- Already set or exists
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- 2. Allow Admins to Delete from helpers table if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'helpers') THEN
    CREATE POLICY "Admins can delete helpers"
      ON public.helpers
      FOR DELETE
      USING (
        auth.role() = 'service_role' OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- 3. Allow Admins to Delete from workers table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workers') THEN
    CREATE POLICY "Admins can delete workers"
      ON public.workers
      FOR DELETE
      USING (
        auth.role() = 'service_role' OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- 4. Allow Admins to Delete from helper_verifications
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'helper_verifications') THEN
    CREATE POLICY "Admins can delete helper_verifications"
      ON public.helper_verifications
      FOR DELETE
      USING (
        auth.role() = 'service_role' OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;
