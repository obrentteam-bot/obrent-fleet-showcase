import { createClient } from "@supabase/supabase-js";

// Legacy Supabase project (app auth + data).
// Hardcoded to prevent drift to the unrelated Lovable Cloud project.
// The anon key is a public/publishable key — safe to ship to the browser.
const LEGACY_URL = "https://fiikwjyjgtdanoieanuc.supabase.co";
const LEGACY_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaWt3anlqZ3RkYW5vaWVhbnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzA5MzksImV4cCI6MjA5MzQwNjkzOX0.tBGKCTd4E53sPaU4X4iEpXPBukCZ7JHDsvQ_qZrdyGw";

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Only honor env values if they actually point at the legacy project.
const url = envUrl && envUrl.includes("fiikwjyjgtdanoieanuc") ? envUrl : LEGACY_URL;
const anon = envAnon && envAnon.includes("fiikwjyjgtdanoieanuc") ? envAnon : LEGACY_ANON;

const isBrowser = typeof window !== "undefined";

export const isSupabaseConfigured = Boolean(url && anon);

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
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

function placeholderFor(name: string): string {
  const lower = name.toLowerCase();
  // Längste Marken-Keys zuerst prüfen, damit "mercedes-benz" vor "mercedes" matcht
  const keys = Object.keys(MARQUE_PLACEHOLDERS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return MARQUE_PLACEHOLDERS[key];
  }
  return genericCarImg;
}

export function adaptVehicle(v: DbVehicle): UiVehicle {
  const marque = v.name.split(" ")[0] ?? "";
  const restName = v.name.replace(marque, "").trim() || v.name;
  const rawImages = (v.images ?? []).filter(Boolean);
  const hasImages = rawImages.length > 0;
  const fallback = placeholderFor(v.name);
  return {
    id: v.id,
    name: restName,
    marque,
    category: v.category,
    year: v.year ?? new Date().getFullYear(),
    color: v.color ?? "—",
    pricePerDay: Number(v.price_per_day),
    image: hasImages ? rawImages[0] : fallback,
    images: hasImages ? rawImages : [fallback],
    hasImages,
    tagline: v.description ?? "",
    features: v.features ?? [],
    specs: {
      engine: v.engine ?? "—",
      power: v.power_ps ? `${v.power_ps} PS` : "—",
    },
  };
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
