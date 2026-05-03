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

const GENERIC_PLACEHOLDER =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85";

// Marken-spezifische Platzhalter (echte Fahrzeugfotos der Marke).
// Sobald im Admin-Panel ein Bild hochgeladen wird, wird dieser Platzhalter ersetzt.
const MARQUE_PLACEHOLDERS: Record<string, string> = {
  porsche: "https://images.unsplash.com/photo-1611821064430-0f40291d0f08?auto=format&fit=crop&w=1600&q=85",
  bmw: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85",
  audi: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85",
  mercedes: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1600&q=85",
  "mercedes-benz": "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1600&q=85",
  ferrari: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85",
  lamborghini: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1600&q=85",
  bentley: "https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?auto=format&fit=crop&w=1600&q=85",
  "rolls-royce": "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1600&q=85",
  rolls: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1600&q=85",
  aston: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1600&q=85",
  maserati: "https://images.unsplash.com/photo-1617814086367-b9b1ee2b13a4?auto=format&fit=crop&w=1600&q=85",
  jaguar: "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1600&q=85",
  "land rover": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85",
  range: "https://images.unsplash.com/photo-1519440163433-3a9efbf0d23a?auto=format&fit=crop&w=1600&q=85",
  tesla: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1600&q=85",
  mclaren: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85",
  volkswagen: "https://images.unsplash.com/photo-1622199678814-3d36f8b3a8a3?auto=format&fit=crop&w=1600&q=85",
  vw: "https://images.unsplash.com/photo-1622199678814-3d36f8b3a8a3?auto=format&fit=crop&w=1600&q=85",
};

function placeholderFor(name: string): string {
  const lower = name.toLowerCase();
  for (const key of Object.keys(MARQUE_PLACEHOLDERS)) {
    if (lower.startsWith(key) || lower.includes(` ${key} `) || lower.includes(key)) {
      return MARQUE_PLACEHOLDERS[key];
    }
  }
  return GENERIC_PLACEHOLDER;
}

export function adaptVehicle(v: DbVehicle): UiVehicle {
  const marque = v.name.split(" ")[0] ?? "";
  const restName = v.name.replace(marque, "").trim() || v.name;
  const images = (v.images ?? []).filter(Boolean);
  const fallback = placeholderFor(v.name);
  return {
    id: v.id,
    name: restName,
    marque,
    category: v.category,
    year: v.year ?? new Date().getFullYear(),
    color: v.color ?? "—",
    pricePerDay: Number(v.price_per_day),
    image: images[0] ?? fallback,
    images: images.length ? images : [fallback],
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
