import { useEffect, useState } from "react";
import { adaptVehicle, isSupabaseConfigured, supabase, type DbVehicle, type UiVehicle } from "./supabase";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<UiVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isSupabaseConfigured) {
        if (!mounted) return;
        setVehicles([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) setError(error.message);
      else setVehicles((data as DbVehicle[]).map(adaptVehicle));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { vehicles, loading, error };
}

export function useVehicle(id: string) {
  const [vehicle, setVehicle] = useState<UiVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isSupabaseConfigured) {
        if (!mounted) return;
        setNotFound(true);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
      if (!mounted) return;
      if (error || !data) setNotFound(true);
      else setVehicle(adaptVehicle(data as DbVehicle));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  return { vehicle, loading, notFound };
}
