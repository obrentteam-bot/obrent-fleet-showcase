// Static helpers retained; dynamic vehicles now come from Supabase via @/lib/useVehicles
export type VehicleCategory = "Limousine" | "SUV" | "Kombi" | "Sports" | "Convertible" | "Sedan";


export const formatPrice = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const formatEuro2 = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
