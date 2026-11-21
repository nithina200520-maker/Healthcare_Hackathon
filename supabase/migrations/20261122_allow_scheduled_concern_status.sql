-- Migration: Allow 'Scheduled' status for patient concerns and update Doctor response policy
ALTER TABLE public.patient_concerns DROP CONSTRAINT IF EXISTS patient_concerns_status_check;
ALTER TABLE public.patient_concerns ADD CONSTRAINT patient_concerns_status_check 
  CHECK (status = ANY (ARRAY['Pending'::text, 'Scheduled'::text, 'Responded'::text, 'Reviewed'::text, 'Closed'::text, 'Resolved'::text]));

ALTER POLICY "Doctors respond to concerns" ON public.patient_concerns
  WITH CHECK ((doctor_id = auth.uid()) AND (status = ANY (ARRAY['Pending'::text, 'Scheduled'::text, 'Responded'::text, 'Closed'::text])));
