CREATE TABLE IF NOT EXISTS public.site_flags (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_flags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_flags TO authenticated;
GRANT ALL ON public.site_flags TO service_role;
ALTER TABLE public.site_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site flags" ON public.site_flags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert site flags" ON public.site_flags FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update site flags" ON public.site_flags FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete site flags" ON public.site_flags FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
INSERT INTO public.site_flags (key, value) VALUES ('maintenance_mode','false') ON CONFLICT (key) DO NOTHING;