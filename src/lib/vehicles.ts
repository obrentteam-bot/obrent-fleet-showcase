// Static helpers retained; dynamic vehicles now come from Supabase via @/lib/useVehicles
export type VehicleCategory = "Limousine" | "SUV" | "Kombi" | "Sports" | "Convertible" | "Sedan";

// Global price visibility toggle.
// When prices are ready to be published, flip this to `true`. The price
// staffel + "ab" prices on cards will then render real values from the DB.
export const SHOW_PRICES = false;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const formatEuro2 = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
