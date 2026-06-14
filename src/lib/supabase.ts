import { createClient } from "@supabase/supabase-js";

// LEGACY Supabase project (app auth + business data: vehicles, bookings, user_roles).
// Hardcoded — do NOT pull from VITE_SUPABASE_URL env vars, since those point at
// the separate Lovable Cloud project (app_settings + edge functions).
const LEGACY_URL = "https://fiikwjyjgtdanoieanuc.supabase.co";
const LEGACY_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaWt3anlqZ3RkYW5vaWVhbnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzA5MzksImV4cCI6MjA5MzQwNjkzOX0.tBGKCTd4E53sPaU4X4iEpXPBukCZ7JHDsvQ_qZrdyGw";

const isBrowser = typeof window !== "undefined";

export const isSupabaseConfigured = true;

export const supabase = createClient(LEGACY_URL, LEGACY_ANON, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
    storageKey: "obrent-legacy-auth",
  },
});

export type DbVehicle = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price_per_day: number;
  engine: string | null;
  power_ps: number | null;
  year: number | null;
  color: string | null;
  features: string[] | null;
  images: string[] | null;
  available: boolean | null;
  created_at: string | null;
  price_3h?: number | null;
  price_6h?: number | null;
  price_12h?: number | null;
  price_24h?: number | null;
  extra_km_price?: number | null;
  deposit?: number | null;
  min_age?: number | null;
  min_license_years?: number | null;
  free_km?: number | null;
};

export type DbBooking = {
  id: string;
  vehicle_id: string | null;
  customer_name: string;
  email: string;
  phone: string;
  start_date: string;
  end_date: string;
  message: string | null;
  status: string | null;
  created_at: string | null;
};

export type UiVehicle = {
  id: string;
  name: string;
  marque: string;
  category: string;
  year: number;
  color: string;
  pricePerDay: number;
  image: string;
  images: string[];
  hasImages: boolean;
  tagline: string;
  features: string[];
  specs: {
    engine: string;
    power: string;
  };
  pricing: {
    h3: number | null;
    h6: number | null;
    h12: number | null;
    h24: number | null;
  };
  conditions: {
    freeKm: number | null;
    extraKmPrice: number | null;
    deposit: number | null;
    minAge: number | null;
    minLicenseYears: number | null;
  };
};

import porscheImg from "@/assets/marques/porsche.jpg";
import bmwImg from "@/assets/marques/bmw.jpg";
import audiImg from "@/assets/marques/audi.jpg";
import mercedesImg from "@/assets/marques/mercedes.jpg";
import ferrariImg from "@/assets/marques/ferrari.jpg";
import lamborghiniImg from "@/assets/marques/lamborghini.jpg";
import bentleyImg from "@/assets/marques/bentley.jpg";
import rollsRoyceImg from "@/assets/marques/rolls-royce.jpg";
import astonMartinImg from "@/assets/marques/aston-martin.jpg";
import maseratiImg from "@/assets/marques/maserati.jpg";
import teslaImg from "@/assets/marques/tesla.jpg";
import rangeRoverImg from "@/assets/marques/range-rover.jpg";
import mclarenImg from "@/assets/marques/mclaren.jpg";
import jaguarImg from "@/assets/marques/jaguar.jpg";
import genericCarImg from "@/assets/marques/generic.jpg";

// Marken-spezifische Platzhalter (echte Fahrzeugfotos der Marke).
// Sobald im Admin-Panel ein Bild hochgeladen wird, wird dieser Platzhalter ersetzt.
const MARQUE_PLACEHOLDERS: Record<string, string> = {
  porsche: porscheImg,
  bmw: bmwImg,
  audi: audiImg,
  mercedes: mercedesImg,
  "mercedes-benz": mercedesImg,
  ferrari: ferrariImg,
  lamborghini: lamborghiniImg,
  lambo: lamborghiniImg,
  bentley: bentleyImg,
  "rolls-royce": rollsRoyceImg,
  rolls: rollsRoyceImg,
  aston: astonMartinImg,
  "aston martin": astonMartinImg,
  maserati: maseratiImg,
  jaguar: jaguarImg,
  "land rover": rangeRoverImg,
  range: rangeRoverImg,
  "range rover": rangeRoverImg,
  tesla: teslaImg,
  mclaren: mclarenImg,
};

export function adaptVehicle(v: DbVehicle): UiVehicle {
  const marque = v.name.split(" ")[0] ?? "";
  const restName = v.name.replace(marque, "").trim() || v.name;
  const rawImages = (v.images ?? []).filter(Boolean);
  const hasImages = rawImages.length > 0;
  return {
    id: v.id,
    name: restName,
    marque,
    category: v.category,
    year: v.year ?? new Date().getFullYear(),
    color: v.color ?? "—",
    pricePerDay: Number(v.price_per_day),
    image: hasImages ? rawImages[0] : "",
    images: hasImages ? rawImages : [],
    hasImages,

    tagline: v.description ?? "",
    features: v.features ?? [],
    specs: {
      engine: v.engine ?? "—",
      power: v.power_ps ? `${v.power_ps} PS` : "—",
    },
    pricing: {
      h3: v.price_3h != null ? Number(v.price_3h) : null,
      h6: v.price_6h != null ? Number(v.price_6h) : null,
      h12: v.price_12h != null ? Number(v.price_12h) : null,
      h24: v.price_24h != null ? Number(v.price_24h) : null,
    },
    conditions: {
      freeKm: v.free_km ?? null,
      extraKmPrice: v.extra_km_price != null ? Number(v.extra_km_price) : null,
      deposit: v.deposit != null ? Number(v.deposit) : null,
      minAge: v.min_age ?? null,
      minLicenseYears: v.min_license_years ?? null,
    },
  };
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
