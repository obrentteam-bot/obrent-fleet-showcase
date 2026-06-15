-- Run this ONCE in the LEGACY Supabase project (fiikwjyjgtdanoieanuc)
-- via the SQL Editor in the Supabase dashboard.
--
-- Adds the two new columns required by the service request forms
-- (VIP Shuttle, Chauffeur, Business Langzeitmiete).
--
-- Safe to re-run: every statement uses IF NOT EXISTS.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'fahrzeug',
  ADD COLUMN IF NOT EXISTS details      jsonb;

-- Constrain to the four known service types (only when not already present).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_service_type_check'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_service_type_check
      CHECK (service_type IN ('shuttle','chauffeur','langzeitmiete','fahrzeug'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS bookings_service_type_idx ON public.bookings(service_type);
