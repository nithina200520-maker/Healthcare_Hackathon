-- CareBridge Migration: Medical Reports Storage Bucket and Table
-- Description:
-- 1. Creates private 'medical-reports' bucket in storage.buckets with 10MB limit and allowed MIME types.
-- 2. Creates public.medical_reports table for tracking patient report metadata and AI analysis.
-- 3. Configures strict Row Level Security (RLS) on public.medical_reports and storage.objects.

-- 1. Storage bucket configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-reports',
  'medical-reports',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];

-- 2. Medical reports tracking table
CREATE TABLE IF NOT EXISTS public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  report_type TEXT DEFAULT 'General Medical Report',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

-- 4. Policies for public.medical_reports
DO $$
BEGIN
  DROP POLICY IF EXISTS "Patients can view own medical reports" ON public.medical_reports;
  DROP POLICY IF EXISTS "Patients can insert own medical reports" ON public.medical_reports;
  DROP POLICY IF EXISTS "Patients can update own medical reports" ON public.medical_reports;
  DROP POLICY IF EXISTS "Patients can delete own medical reports" ON public.medical_reports;
  
  DROP POLICY IF EXISTS "Patients can upload medical reports" ON storage.objects;
  DROP POLICY IF EXISTS "Patients can view own medical reports" ON storage.objects;
  DROP POLICY IF EXISTS "Patients can delete own medical reports" ON storage.objects;
END $$;

CREATE POLICY "Patients can view own medical reports"
  ON public.medical_reports FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own medical reports"
  ON public.medical_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own medical reports"
  ON public.medical_reports FOR UPDATE TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can delete own medical reports"
  ON public.medical_reports FOR DELETE TO authenticated
  USING (auth.uid() = patient_id);

-- 5. Storage policies for storage.objects (medical-reports private bucket)
CREATE POLICY "Patients can upload medical reports"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'medical-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Patients can view own medical reports"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'medical-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Patients can delete own medical reports"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'medical-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
