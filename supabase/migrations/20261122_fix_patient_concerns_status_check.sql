-- Fix patient_concerns_status_check constraint to permit 'Responded' and 'Closed'
-- in addition to 'Pending', 'Reviewed', and 'Resolved'.

ALTER TABLE public.patient_concerns DROP CONSTRAINT IF EXISTS patient_concerns_status_check;
ALTER TABLE public.patient_concerns ADD CONSTRAINT patient_concerns_status_check 
  CHECK (status = ANY (ARRAY['Pending'::text, 'Responded'::text, 'Reviewed'::text, 'Closed'::text, 'Resolved'::text]));
