-- ============================================================
-- MadadMitra — Aadhaar Verification Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the helper_verifications table
create table if not exists public.helper_verifications (
  id                  uuid primary key default gen_random_uuid(),
  helper_id           uuid not null references auth.users(id) on delete cascade,
  aadhaar_last4       text not null check (aadhaar_last4 ~ '^\d{4}$'),
  aadhaar_front_path  text,
  aadhaar_back_path   text,
  selfie_path         text,
  verification_status text not null default 'unsubmitted'
                        check (verification_status in ('unsubmitted','pending','verified','rejected')),
  rejection_reason    text,
  submitted_at        timestamptz,
  verified_at         timestamptz,
  helper_name         text,
  helper_phone        text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (helper_id)  -- one record per helper
);

-- 2. Auto-update updated_at on any row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger helper_verifications_updated_at
  before update on public.helper_verifications
  for each row execute function public.set_updated_at();

-- 3. Enable Row Level Security
alter table public.helper_verifications enable row level security;

-- 4. RLS Policies
-- Helpers can read and upsert only their own row
create policy "Helper can view own verification"
  on public.helper_verifications for select
  using (auth.uid() = helper_id);

create policy "Helper can insert own verification"
  on public.helper_verifications for insert
  with check (auth.uid() = helper_id);

create policy "Helper can update own verification (only when unsubmitted or rejected)"
  on public.helper_verifications for update
  using (auth.uid() = helper_id and verification_status in ('unsubmitted','rejected'))
  with check (auth.uid() = helper_id);

-- Admins (service_role key) bypass RLS entirely — no extra policy needed
-- To let your admin UI use the anon key, add an admin-email check here if needed.

-- 5. Create the private storage bucket (run separately in Supabase Dashboard > Storage
--    OR execute via management API — SQL cannot create storage buckets directly)
-- Storage bucket name: helper-documents
-- Public: false
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- 6. Storage RLS (paste into Supabase Dashboard > Storage > helper-documents > Policies)
-- Policy: Helpers can upload to their own folder only
-- INSERT: (storage.foldername(name))[1] = auth.uid()::text
-- SELECT (for admin signed URLs): auth.role() = 'service_role'  OR  auth.uid() = (storage.foldername(name))[1]::uuid
