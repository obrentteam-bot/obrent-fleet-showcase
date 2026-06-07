// Project-wide AI Editor capability map.
// Single source of truth for what the AI Editor may read, propose, or change.
// No writes happen here — this only describes what is possible per area.

export type CapabilitySource = "database" | "hardcoded" | "i18n" | "unknown";

export type AreaKey =
  | "vehicles"
  | "app_settings"
  | "website_copy"
  | "seo"
  | "translations";

export type AreaCapability = {
  key: AreaKey;
  label: string;
  description: string;
  source: CapabilitySource;
  /** Database table name when source = "database". */
  table?: string;
  readable: boolean;
  creatable: boolean;
  updateable: boolean;
  deletable: boolean;
  /** Fields the AI Editor may propose to change with normal risk. */
  safeFields: string[];
  /** Fields that need an extra confirmation step (high risk). */
  riskyFields: string[];
};

export const CAPABILITY_MAP: Record<AreaKey, AreaCapability> = {
  vehicles: {
    key: "vehicles",
    label: "Fahrzeuge",
    description: "Fuhrpark — Fahrzeuge anlegen, Preise und Beschreibungen pflegen.",
    source: "database",
    table: "vehicles",
    readable: true,
    creatable: true,
    updateable: true,
    deletable: true, // soft via available=false preferred; hard delete allowed
    safeFields: [
      "name",
      "category",
      "description",
      "engine",
      "power_ps",
      "year",
      "color",
      "features",
      "images",
      "sort_order",
    ],
    riskyFields: ["price_per_day", "available"],
  },

  app_settings: {
    key: "app_settings",
    label: "Einstellungen",
    description: "Globale Stammdaten: Firmenname, Adresse, Telefon, E-Mail, Öffnungszeiten.",
    source: "database",
    table: "app_settings",
    readable: true,
    creatable: false, // single-row settings
    updateable: true,
    deletable: false,
    safeFields: ["company_name", "address", "hours"],
    riskyFields: ["phone", "email"],
  },

  website_copy: {
    key: "website_copy",
    label: "Website-Texte",
    description: "Hero, Sektionen, statische Inhalte auf der Startseite und Unterseiten.",
    source: "hardcoded",
    readable: false,
    creatable: false,
    updateable: false,
    deletable: false,
    safeFields: [],
    riskyFields: [],
  },

  seo: {
    key: "seo",
    label: "SEO",
    description: "Meta-Title, Description, OG-Tags, Canonical, robots.",
    source: "hardcoded",
    readable: false,
    creatable: false,
    updateable: false,
    deletable: false,
    safeFields: [],
    riskyFields: [],
  },

  translations: {
    key: "translations",
    label: "Übersetzungen",
    description: "i18n-Strings (DE/EN/FR) für UI und Inhalte.",
    source: "i18n",
    readable: false,
    creatable: false,
    updateable: false,
    deletable: false,
    safeFields: [],
    riskyFields: [],
  },
};

export const NOT_EDITABLE_HINT =
  "Dieser Bereich ist noch nicht direkt bearbeitbar. Ich kann nur einen Vorschlag erstellen.";

export type CapabilityCheck = {
  capability: AreaCapability;
  allowed: boolean;
  reason?: string;
  /** True when the action exists in source but the chosen field is risky. */
  needsConfirmation?: boolean;
};

export type ActionKind = "read" | "create" | "update" | "delete";

export function checkCapability(
  area: AreaKey,
  action: ActionKind,
  field?: string,
): CapabilityCheck {
  const cap = CAPABILITY_MAP[area];

  if (cap.source === "hardcoded" || cap.source === "unknown" || cap.source === "i18n") {
    return { capability: cap, allowed: false, reason: NOT_EDITABLE_HINT };
  }

  const actionAllowed =
    (action === "read" && cap.readable) ||
    (action === "create" && cap.creatable) ||
    (action === "update" && cap.updateable) ||
    (action === "delete" && cap.deletable);

  if (!actionAllowed) {
    return {
      capability: cap,
      allowed: false,
      reason: `Aktion "${action}" ist im Bereich ${cap.label} nicht erlaubt.`,
    };
  }

  const needsConfirmation =
    !!field && cap.riskyFields.includes(field);

  return { capability: cap, allowed: true, needsConfirmation };
}
