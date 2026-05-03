import porscheCayenneImg from "@/assets/vehicles/porsche-cayenne.jpg";
import porschePanameraImg from "@/assets/vehicles/porsche-panamera.jpg";
import bmwX5M60iImg from "@/assets/vehicles/bmw-x5-m60i.jpg";
import bmwX5M50dImg from "@/assets/vehicles/bmw-x5-m50d.jpg";
import bmwX4M40iImg from "@/assets/vehicles/bmw-x4-m40i.jpg";
import audiRs6AvantImg from "@/assets/vehicles/audi-rs6-avant.jpg";

export type VehicleCategory = "Limousine" | "SUV" | "Kombi" | "Sports" | "Convertible" | "Sedan";

export interface Vehicle {
  id: string;
  name: string;
  marque: string;
  category: VehicleCategory;
  year: number;
  color: string;
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
    id: "porsche-cayenne",
    name: "Cayenne",
    marque: "Porsche",
    category: "SUV",
    year: 2022,
    color: "Grau",
    pricePerDay: 349,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Porsche_Cayenne_%28PO536%29_GTS_IMG_3952.jpg/1600px-Porsche_Cayenne_%28PO536%29_GTS_IMG_3952.jpg",
    tagline:
      "Der Porsche Cayenne vereint sportliche Dynamik mit luxuriösem Komfort — ein SUV der Extraklasse für jeden Anlass.",
    specs: {
      engine: "3.0L Benzin V6",
      power: "245 kW (333 PS)",
      acceleration: "0–100 km/h in 6.2s",
      topSpeed: "245 km/h",
      transmission: "8-Gang Tiptronic Automatik",
      seats: "5 Passagiere",
    },
  },
  {
    id: "porsche-panamera",
    name: "Panamera Sport Turismo",
    marque: "Porsche",
    category: "Limousine",
    year: 2022,
    color: "Schwarz",
    pricePerDay: 399,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Porsche_971_Panamera_Turbo_S_E-Hybrid_Sport_Turismo_Classic-Gala_2021_1X7A0234.jpg/1600px-Porsche_971_Panamera_Turbo_S_E-Hybrid_Sport_Turismo_Classic-Gala_2021_1X7A0234.jpg",
    tagline:
      "Die Porsche Panamera ist die perfekte Verbindung aus Sportwagen-DNA und exklusiver Limousine — für höchste Ansprüche.",
    specs: {
      engine: "3.0L V6 Bi-Turbo Benzin",
      power: "330 kW (450 PS)",
      acceleration: "0–100 km/h in 4.6s",
      topSpeed: "280 km/h",
      transmission: "8-Gang PDK Automatik",
      seats: "4 Passagiere",
    },
  },
  {
    id: "bmw-x5-m60i",
    name: "X5 M60i xDrive",
    marque: "BMW",
    category: "SUV",
    year: 2025,
    color: "Grau",
    pricePerDay: 449,
    image: "https://upload.wikimedia.org/wikipedia/commons/0/06/25_BMW_X5_M60i.jpg",
    tagline:
      "Der BMW X5 M60i ist pure Kraft in eleganter Form — 530 PS, Allradantrieb und modernste Technik aus dem Jahr 2025.",
    specs: {
      engine: "4.4L V8 Bi-Turbo Mild-Hybrid",
      power: "390 kW (530 PS)",
      acceleration: "0–100 km/h in 4.3s",
      topSpeed: "250 km/h",
      transmission: "8-Gang Steptronic Sport",
      seats: "5 Passagiere",
    },
  },
  {
    id: "bmw-x5-m50d",
    name: "X5 M50d xDrive",
    marque: "BMW",
    category: "SUV",
    year: 2018,
    color: "Schwarz",
    pricePerDay: 349,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/2019_BMW_X5_M50d_3.0_Front.jpg/1600px-2019_BMW_X5_M50d_3.0_Front.jpg",
    tagline:
      "Der BMW X5 M50d überzeugt mit kraftvollem Diesel-Triebwerk, Allradantrieb und dem unverkennbaren M-Sportcharakter.",
    specs: {
      engine: "3.0L Quad-Turbo Diesel",
      power: "294 kW (400 PS)",
      acceleration: "0–100 km/h in 5.2s",
      topSpeed: "250 km/h",
      transmission: "8-Gang Steptronic",
      seats: "5 Passagiere",
    },
  },
  {
    id: "bmw-x4-m40i",
    name: "X4 M40i xDrive",
    marque: "BMW",
    category: "SUV",
    year: 2023,
    color: "Schwarz",
    pricePerDay: 329,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/21_BMW_X4_M40i.jpg/1600px-21_BMW_X4_M40i.jpg",
    tagline:
      "Der BMW X4 M40i kombiniert das dynamische Coupé-Design mit SUV-Funktionalität — sportlich, kompromisslos, begehrenswert.",
    specs: {
      engine: "3.0L Reihen-6 Turbo Benzin",
      power: "265 kW (360 PS)",
      acceleration: "0–100 km/h in 4.9s",
      topSpeed: "250 km/h",
      transmission: "8-Gang Steptronic Sport",
      seats: "5 Passagiere",
    },
  },
  {
    id: "audi-rs6-avant",
    name: "RS6 Avant",
    marque: "Audi",
    category: "Kombi",
    year: 2020,
    color: "Weiß",
    pricePerDay: 429,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Audi_RS6_Avant_C8_1X7A0305.jpg/1600px-Audi_RS6_Avant_C8_1X7A0305.jpg",
    tagline:
      "Der Audi RS6 Avant ist die Legende unter den Super-Kombis — 600 PS, quattro-Allrad und ein Design, das keine Wünsche offen lässt.",
    specs: {
      engine: "4.0L V8 TFSI Mild-Hybrid",
      power: "441 kW (600 PS)",
      acceleration: "0–100 km/h in 3.6s",
      topSpeed: "305 km/h",
      transmission: "8-Gang Tiptronic quattro",
      seats: "5 Passagiere",
    },
  },
];

export const categories: VehicleCategory[] = ["Limousine", "SUV", "Kombi"];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
