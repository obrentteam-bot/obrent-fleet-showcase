ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS maintenance_mode boolean NOT NULL DEFAULT false;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;