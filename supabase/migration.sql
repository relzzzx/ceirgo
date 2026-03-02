-- ============================================
-- CEIRGO MVP — Supabase Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  imei TEXT NOT NULL,
  model TEXT,
  status TEXT DEFAULT 'Menunggu Verifikasi',
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin full access (all operations)
-- Admin is gated at application level via email check
-- This policy allows service-level queries for admin operations
CREATE POLICY "Allow all for authenticated users on select for admin"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow update for authenticated"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (true);

-- 4. Create storage bucket for proofs (run in SQL or create manually in dashboard)
-- NOTE: Create a bucket called "proofs" in Supabase Storage dashboard
-- Set it to public (for reading proof images)
-- Allow authenticated users to upload

-- Storage policies (run in SQL editor):
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads to proofs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'proofs');

CREATE POLICY "Allow public read from proofs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'proofs');
