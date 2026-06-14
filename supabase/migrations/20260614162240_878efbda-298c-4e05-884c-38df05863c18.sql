ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS price_3h numeric,
ADD COLUMN IF NOT EXISTS price_6h numeric,
ADD COLUMN IF NOT EXISTS price_12h numeric,
ADD COLUMN IF NOT EXISTS price_24h numeric,
ADD COLUMN IF NOT EXISTS extra_km_price numeric,
ADD COLUMN IF NOT EXISTS deposit numeric,
ADD COLUMN IF NOT EXISTS min_age integer,
ADD COLUMN IF NOT EXISTS min_license_years integer,
ADD COLUMN IF NOT EXISTS free_km integer DEFAULT 150;