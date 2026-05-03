import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
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
  tagline: string;
  features: string[];
  specs: {
    engine: string;
    power: string;
  };
};

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85";

export function adaptVehicle(v: DbVehicle): UiVehicle {
  const marque = v.name.split(" ")[0] ?? "";
  const restName = v.name.replace(marque, "").trim() || v.name;
  const images = (v.images ?? []).filter(Boolean);
  return {
    id: v.id,
    name: restName,
    marque,
    category: v.category,
    year: v.year ?? new Date().getFullYear(),
    color: v.color ?? "—",
    pricePerDay: Number(v.price_per_day),
    image: images[0] ?? PLACEHOLDER_IMG,
    images: images.length ? images : [PLACEHOLDER_IMG],
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
