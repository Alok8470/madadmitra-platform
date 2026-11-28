-- ==============================================================================
-- MadadMitra (मदद मित्र) — Migration 007: Realtime Helper Deletion & Cleanup
-- Ensures Admin helper removal triggers immediate real-time cleanup, storage purge,
-- and profile role reset with full Row Level Security (RLS) support.
-- ==============================================================================

-- 1. Ensure public.helpers has REPLICA IDENTITY FULL so DELETE events include
--    all columns (id, user_id, phone) in Supabase Realtime payload.old
ALTER TABLE IF EXISTS public.helpers REPLICA IDENTITY FULL;

-- 2. Allow Admins and Service Role to update public.profiles
--    (used to downgrade a deleted helper's profile role from 'worker' to 'customer')
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
    CREATE POLICY "Admins can update profiles"
      ON public.profiles
      FOR UPDATE
      USING (
        auth.uid() = id OR
        auth.role() = 'service_role' OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      )
      WITH CHECK (
        auth.uid() = id OR
        auth.role() = 'service_role' OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- 3. Storage Deletion Policy: Allow Admins to delete files from helper-documents
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    DROP POLICY IF EXISTS "Admins can delete helper documents" ON storage.objects;
    CREATE POLICY "Admins can delete helper documents"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'helper-documents' AND (
          auth.role() = 'service_role' OR
          auth.role() = 'anon' OR
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        )
      );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- 4. Verify Realtime Publication for public.helpers
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
