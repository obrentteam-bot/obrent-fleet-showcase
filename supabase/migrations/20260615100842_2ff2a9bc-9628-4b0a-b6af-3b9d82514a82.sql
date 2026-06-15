CREATE OR REPLACE FUNCTION public.set_maintenance_mode(_enabled boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result boolean;
BEGIN
  UPDATE public.app_settings
     SET maintenance_mode = _enabled
   WHERE id IS NOT NULL
  RETURNING maintenance_mode INTO v_result;
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.set_maintenance_mode(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_maintenance_mode(boolean) TO anon, authenticated, service_role;