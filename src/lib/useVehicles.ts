import { useEffect, useState } from "react";
import { adaptVehicle, isSupabaseConfigured, supabase, type DbVehicle, type UiVehicle } from "./supabase";

let vehiclesCache: UiVehicle[] | null = null;
let vehiclesRequest: Promise<UiVehicle[]> | null = null;
const vehicleRequests = new Map<string, Promise<UiVehicle | null>>();

async function fetchAvailableVehicles(): Promise<UiVehicle[]> {
  if (vehiclesRequest) return vehiclesRequest;

  vehiclesRequest = (async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .neq("available", false)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      const vehicles = ((data ?? []) as DbVehicle[]).map(adaptVehicle);
      vehiclesCache = vehicles;
      return vehicles;
    } finally {
      vehiclesRequest = null;
    }
  })();

  return vehiclesRequest;
}

async function fetchVehicleById(id: string): Promise<UiVehicle | null> {
  const cached = vehiclesCache?.find((vehicle) => vehicle.id === id);
  if (cached) return cached;

  const existing = vehicleRequests.get(id);
  if (existing) return existing;

  const request = (async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .neq("available", false)
        .maybeSingle();
      if (error || !data) return null;
      const vehicle = adaptVehicle(data as DbVehicle);
      vehiclesCache = vehiclesCache
        ? [...vehiclesCache.filter((item) => item.id !== vehicle.id), vehicle]
        : [vehicle];
      return vehicle;
    } finally {
      vehicleRequests.delete(id);
    }
  })();

  vehicleRequests.set(id, request);
  return request;
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<UiVehicle[]>(vehiclesCache ?? []);
  const [loading, setLoading] = useState(!vehiclesCache);
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
      try {
        const data = await fetchAvailableVehicles();
        if (!mounted) return;
        setVehicles(data);
      } catch (e) {
        if (!mounted) return;
        console.error("[useVehicles] fetch failed:", e);
        setError(e instanceof Error ? e.message : "Unknown error");
        setVehicles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { vehicles, loading, error };
}

export function useVehicle(id: string) {
  const cachedVehicle = vehiclesCache?.find((item) => item.id === id) ?? null;
  const [vehicle, setVehicle] = useState<UiVehicle | null>(cachedVehicle);
  const [loading, setLoading] = useState(!cachedVehicle);
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
      try {
        const data = await fetchVehicleById(id);
        if (!mounted) return;
        if (!data) setNotFound(true);
        else setVehicle(data);
      } catch (e) {
        if (!mounted) return;
        console.error("[useVehicle] fetch failed:", e);
        setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  return { vehicle, loading, notFound };
}
