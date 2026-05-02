export type VehicleCategory = "Sedan" | "SUV" | "Sports" | "Convertible";

export interface Vehicle {
  id: string;
  name: string;
  marque: string;
  category: VehicleCategory;
  pricePerDay: number;
  image: string;
  tagline: string;
  specs: {
    engine: string;
    power: string;
    acceleration: string;
    topSpeed: string;
    transmission: string;
    seats: string;
  };
}

export const vehicles: Vehicle[] = [
  {
    id: "phantom-viii",
    name: "Phantom VIII",
    marque: "Rolls-Royce",
    category: "Sedan",
    pricePerDay: 2400,
    image: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1600&q=80",
    tagline: "The pinnacle of effortless authority.",
    specs: {
      engine: "6.75L Twin-Turbo V12",
      power: "563 hp",
      acceleration: "0–100 km/h in 5.3s",
      topSpeed: "250 km/h",
      transmission: "8-Speed Automatic",
      seats: "4 Passengers",
    },
  },
  {
    id: "cullinan",
    name: "Cullinan Black Badge",
    marque: "Rolls-Royce",
    category: "SUV",
    pricePerDay: 2150,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=80",
    tagline: "Imposing silence, sovereign presence.",
    specs: {
      engine: "6.75L Twin-Turbo V12",
      power: "600 hp",
      acceleration: "0–100 km/h in 5.2s",
      topSpeed: "250 km/h",
      transmission: "8-Speed Automatic",
      seats: "5 Passengers",
    },
  },
  {
    id: "812-superfast",
    name: "812 Superfast",
    marque: "Ferrari",
    category: "Sports",
    pricePerDay: 1850,
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=80",
    tagline: "Twelve cylinders. One pure pursuit.",
    specs: {
      engine: "6.5L Naturally Aspirated V12",
      power: "789 hp",
      acceleration: "0–100 km/h in 2.9s",
      topSpeed: "340 km/h",
      transmission: "7-Speed DCT",
      seats: "2 Passengers",
    },
  },
  {
    id: "dawn",
    name: "Dawn",
    marque: "Rolls-Royce",
    category: "Convertible",
    pricePerDay: 1950,
    image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1600&q=80",
    tagline: "Open-air motoring, refined to silence.",
    specs: {
      engine: "6.6L Twin-Turbo V12",
      power: "563 hp",
      acceleration: "0–100 km/h in 4.9s",
      topSpeed: "250 km/h",
      transmission: "8-Speed Automatic",
      seats: "4 Passengers",
    },
  },
  {
    id: "bentayga",
    name: "Bentayga EWB",
    marque: "Bentley",
    category: "SUV",
    pricePerDay: 1650,
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1600&q=80",
    tagline: "A sanctuary on every horizon.",
    specs: {
      engine: "4.0L Twin-Turbo V8",
      power: "542 hp",
      acceleration: "0–100 km/h in 4.5s",
      topSpeed: "290 km/h",
      transmission: "8-Speed Automatic",
      seats: "5 Passengers",
    },
  },
  {
    id: "continental-gt",
    name: "Continental GT Speed",
    marque: "Bentley",
    category: "Sedan",
    pricePerDay: 1450,
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1600&q=80",
    tagline: "Grand touring, perfected.",
    specs: {
      engine: "6.0L Twin-Turbo W12",
      power: "650 hp",
      acceleration: "0–100 km/h in 3.6s",
      topSpeed: "335 km/h",
      transmission: "8-Speed DCT",
      seats: "4 Passengers",
    },
  },
  {
    id: "huracan",
    name: "Huracán Tecnica",
    marque: "Lamborghini",
    category: "Sports",
    pricePerDay: 1750,
    image: "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=1600&q=80",
    tagline: "Precision sculpted in carbon and fire.",
    specs: {
      engine: "5.2L Naturally Aspirated V10",
      power: "631 hp",
      acceleration: "0–100 km/h in 3.2s",
      topSpeed: "325 km/h",
      transmission: "7-Speed DCT",
      seats: "2 Passengers",
    },
  },
  {
    id: "db12-volante",
    name: "DB12 Volante",
    marque: "Aston Martin",
    category: "Convertible",
    pricePerDay: 1550,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
    tagline: "The first super tourer, unroofed.",
    specs: {
      engine: "4.0L Twin-Turbo V8",
      power: "671 hp",
      acceleration: "0–100 km/h in 3.7s",
      topSpeed: "325 km/h",
      transmission: "8-Speed Automatic",
      seats: "2+2 Passengers",
    },
  },
];

export const categories: VehicleCategory[] = ["Sedan", "SUV", "Sports", "Convertible"];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
