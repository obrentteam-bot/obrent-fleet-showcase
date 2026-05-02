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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Porsche_Cayenne_E-Hybrid_Coup%C3%A9_IMG_4773.jpg/1600px-Porsche_Cayenne_E-Hybrid_Coup%C3%A9_IMG_4773.jpg",
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Porsche_Panamera_Sport_Turismo_4_E-Hybrid_%28II%29_%E2%80%93_f_30062018.jpg/1600px-Porsche_Panamera_Sport_Turismo_4_E-Hybrid_%28II%29_%E2%80%93_f_30062018.jpg",
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/BMW_X5_M60i_xDrive_%28G05_LCI%29_IMG_8786.jpg/1600px-BMW_X5_M60i_xDrive_%28G05_LCI%29_IMG_8786.jpg",
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/BMW_X5_M50d_%28G05%29_IMG_3729.jpg/1600px-BMW_X5_M50d_%28G05%29_IMG_3729.jpg",
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/BMW_X4_M40i_%28G02%29_IMG_4632.jpg/1600px-BMW_X4_M40i_%28G02%29_IMG_4632.jpg",
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Audi_RS6_Avant_C8_IMG_5360.jpg/1600px-Audi_RS6_Avant_C8_IMG_5360.jpg",
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
