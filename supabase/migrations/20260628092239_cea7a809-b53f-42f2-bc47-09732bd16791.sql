ALTER TABLE app_settings
ADD COLUMN IF NOT EXISTS cta_request_label text DEFAULT 'Anfrage senden',
ADD COLUMN IF NOT EXISTS cta_reserve_label text DEFAULT 'Anfragen';