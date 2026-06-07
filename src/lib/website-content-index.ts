// ---------------------------------------------------------------------------
// Website Content Index
// ---------------------------------------------------------------------------
// Read-only registry of every public page on the OBRENT website.
// The AI Editor consults this index BEFORE generating any
// "optimize" / "seo" / "translate" proposal so it never hallucinates
// content that does not exist.
//
// No DB writes. No mutation. Pure data.
// ---------------------------------------------------------------------------

export type ContentSource =
  | "route_file"          // text lives directly inside a src/routes/*.tsx file
  | "i18n"                // text comes from src/lib/i18n.tsx dictionaries
  | "i18n+route_file"     // mix of both
  | "database"            // text comes from Supabase (e.g. vehicles)
  | "component"           // text lives in a shared component
  | "unknown";

export type SeoSource =
  | "route_head"          // <head> defined via createFileRoute({ head })
  | "root_head"           // inherited from __root.tsx
  | "unknown";

export type TranslationSource =
  | "i18n_dictionary"     // src/lib/i18n.tsx (de + en)
  | "none"
  | "partial";            // only some sections translated

export type EditableStatus =
  | "editable"            // safe to propose edits (text only, no business logic)
  | "advisory"            // proposals are possible but cannot be auto-applied yet
  | "locked";             // legal / system page — do not touch without confirmation

export type PageSection = {
  /** Stable id used by proposals (e.g. "hero", "fleet-strip"). */
  id: string;
  /** Short human label. */
  label: string;
  /** Optional concrete heading text or eyebrow as it appears on the page. */
  heading?: string;
  /** Optional excerpt of the section's main copy (truncated, for AI context). */
  excerpt?: string;
  /** Where this section's text lives. */
  source: ContentSource;
  /** i18n key path if translated (e.g. "home.hero.title"). */
  i18nKey?: string;
};

export type PageEntry = {
  route: string;                       // e.g. "/business-langzeitmiete"
  name: string;                        // human label, e.g. "Business Langzeitmiete"
  file: string;                        // source file
  editable: EditableStatus;
  contentSource: ContentSource;
  seoSource: SeoSource;
  translationSource: TranslationSource;
  meta: {
    title: string;
    description: string;
  };
  sections: PageSection[];
  /** Free-text keywords used for fuzzy matching on user prompts. */
  keywords: string[];
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const WEBSITE_CONTENT_INDEX: PageEntry[] = [
  {
    route: "/",
    name: "Startseite",
    file: "src/routes/index.tsx",
    editable: "advisory",
    contentSource: "i18n+route_file",
    seoSource: "route_head",
    translationSource: "i18n_dictionary",
    meta: {
      title: "OBRENT — Luxus Autovermietung Ludwigshafen am Rhein",
      description:
        "OBRENT vermietet Premium-Fahrzeuge von Porsche, BMW und Audi in Ludwigshafen am Rhein — fair, schnell verfügbar und persönlich übergeben.",
    },
    sections: [
      { id: "hero", label: "Hero", source: "i18n", i18nKey: "home.hero" },
      { id: "fleet-strip", label: "Auto-scrolling Flotten-Strip", source: "database" },
      { id: "services", label: "Service-Übersicht", source: "i18n", i18nKey: "home.services" },
      { id: "about-teaser", label: "Über-uns Teaser", source: "i18n", i18nKey: "home.about" },
    ],
    keywords: ["start", "startseite", "home", "landing", "index"],
  },
  {
    route: "/business-langzeitmiete",
    name: "Business Langzeitmiete",
    file: "src/routes/business-langzeitmiete.tsx",
    editable: "advisory",
    contentSource: "route_file",
    seoSource: "route_head",
    translationSource: "partial",
    meta: {
      title: "Business Langzeitmiete — OBRENT",
      description:
        "Maßgeschneiderte Langzeitmiete für Geschäftsführer, Projektteams und Firmenflotten.",
    },
    sections: [
      {
        id: "hero",
        label: "Hero",
        heading: "Mobilität für Ihr Unternehmen. Flexibel und zuverlässig.",
        source: "route_file",
      },
      { id: "benefits", label: "Vorteile / Icons", source: "route_file" },
      { id: "form", label: "Anfrageformular", source: "route_file" },
    ],
    keywords: ["business", "langzeit", "langzeitmiete", "firma", "flotte", "company"],
  },
  {
    route: "/chauffeur-service",
    name: "Chauffeur Service",
    file: "src/routes/chauffeur-service.tsx",
    editable: "advisory",
    contentSource: "route_file",
    seoSource: "route_head",
    translationSource: "partial",
    meta: {
      title: "Chauffeur Service — OBRENT",
      description:
        "Professionelle Chauffeure für Business, Events und private Fahrten — diskret und stilvoll.",
    },
    sections: [
      {
        id: "hero",
        label: "Hero",
        heading: "Ihr persönlicher Chauffeur. Wann immer Sie ihn brauchen.",
        source: "route_file",
      },
      { id: "benefits", label: "Leistungs-Highlights", source: "route_file" },
      { id: "form", label: "Buchungsformular", source: "route_file" },
    ],
    keywords: ["chauffeur", "fahrer", "driver"],
  },
  {
    route: "/vip-shuttle",
    name: "VIP Shuttle",
    file: "src/routes/vip-shuttle.tsx",
    editable: "advisory",
    contentSource: "route_file",
    seoSource: "route_head",
    translationSource: "partial",
    meta: {
      title: "VIP Shuttle — OBRENT",
      description:
        "Diskreter VIP Shuttle für Flughafen, Hotel, Event und Geschäftstermine — pünktlich und komfortabel.",
    },
    sections: [
      { id: "hero", label: "Hero", source: "route_file" },
      { id: "use-cases", label: "Einsatzbereiche", source: "route_file" },
      { id: "form", label: "Anfrageformular", source: "route_file" },
    ],
    keywords: ["vip", "shuttle", "flughafen", "airport"],
  },
  {
    route: "/fleet",
    name: "Flotte",
    file: "src/routes/fleet.index.tsx",
    editable: "advisory",
    contentSource: "i18n+route_file",
    seoSource: "route_head",
    translationSource: "i18n_dictionary",
    meta: {
      title: "Die Flotte — OBRENT",
      description:
        "Entdecken Sie die OBRENT-Kollektion aus Luxuslimousinen, SUVs, Sportwagen und Cabriolets — auf Reservierung verfügbar.",
    },
    sections: [
      { id: "intro", label: "Intro", source: "i18n", i18nKey: "fleet" },
      { id: "category-filter", label: "Kategorie-Filter", source: "i18n" },
      { id: "vehicle-grid", label: "Fahrzeug-Grid (live)", source: "database" },
    ],
    keywords: ["fleet", "flotte", "fahrzeuge", "autos", "kollektion"],
  },
  {
    route: "/fleet/$vehicleId",
    name: "Fahrzeug-Detailseite",
    file: "src/routes/fleet.$vehicleId.tsx",
    editable: "advisory",
    contentSource: "database",
    seoSource: "route_head",
    translationSource: "partial",
    meta: {
      title: "Fahrzeug — OBRENT (dynamisch)",
      description: "Dynamische Detailseite je Fahrzeug.",
    },
    sections: [
      { id: "gallery", label: "Galerie", source: "database" },
      { id: "specs", label: "Technische Daten", source: "database" },
      { id: "booking-cta", label: "Buchungs-CTA", source: "component" },
    ],
    keywords: ["fahrzeug", "detail", "vehicle"],
  },
  {
    route: "/about",
    name: "Über uns",
    file: "src/routes/about.tsx",
    editable: "advisory",
    contentSource: "i18n+route_file",
    seoSource: "route_head",
    translationSource: "i18n_dictionary",
    meta: {
      title: "Über uns — OBRENT Ludwigshafen am Rhein",
      description:
        "OBRENT — Luxus-Autovermietung aus Ludwigshafen am Rhein. Hochwertige Fahrzeuge zu fairen Preisen, persönlich übergeben.",
    },
    sections: [
      { id: "hero", label: "Cinematic Hero (Wasserturm)", source: "route_file" },
      { id: "principles", label: "Vier Prinzipien", source: "i18n", i18nKey: "about" },
      { id: "story", label: "Story", source: "i18n", i18nKey: "about" },
    ],
    keywords: ["about", "über", "ueber", "uns", "story", "team"],
  },
  {
    route: "/contact",
    name: "Kontakt / Concierge",
    file: "src/routes/contact.tsx",
    editable: "advisory",
    contentSource: "i18n+route_file",
    seoSource: "route_head",
    translationSource: "i18n_dictionary",
    meta: {
      title: "Concierge kontaktieren — OBRENT",
      description:
        "Sprechen Sie mit einem OBRENT-Concierge, um ein privates Fahrerlebnis in Monaco, Paris oder Dubai zu gestalten.",
    },
    sections: [
      { id: "intro", label: "Concierge-Intro", source: "i18n", i18nKey: "contact" },
      { id: "form", label: "Anfrageformular", source: "route_file" },
      { id: "details", label: "Kontaktdaten (Settings)", source: "database" },
    ],
    keywords: ["contact", "kontakt", "concierge", "anfrage"],
  },
  {
    route: "/impressum",
    name: "Impressum",
    file: "src/routes/impressum.tsx",
    editable: "locked",
    contentSource: "route_file",
    seoSource: "route_head",
    translationSource: "none",
    meta: {
      title: "Impressum — OBRENT",
      description: "Impressum und rechtliche Angaben der OBRENT GmbH gemäß § 5 DDG.",
    },
    sections: [
      { id: "legal", label: "Pflichtangaben § 5 DDG", source: "route_file" },
    ],
    keywords: ["impressum", "legal", "rechtlich"],
  },
  {
    route: "/datenschutz",
    name: "Datenschutzerklärung",
    file: "src/routes/datenschutz.tsx",
    editable: "locked",
    contentSource: "route_file",
    seoSource: "route_head",
    translationSource: "none",
    meta: {
      title: "Datenschutzerklärung — OBRENT",
      description:
        "Informationen zur Verarbeitung personenbezogener Daten bei OBRENT gemäß DSGVO.",
    },
    sections: [
      { id: "controller", label: "Verantwortlicher", source: "route_file" },
      { id: "processing", label: "Datenverarbeitung", source: "route_file" },
    ],
    keywords: ["datenschutz", "dsgvo", "privacy"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize a route-ish token: lowercases, trims, ensures leading slash. */
export function normalizeRoute(s: string): string {
  const trimmed = s.trim().toLowerCase().replace(/\s+/g, "");
  if (!trimmed) return "";
  if (trimmed === "/") return "/";
  return trimmed.startsWith("/") ? trimmed.replace(/\/+$/, "") : `/${trimmed.replace(/\/+$/, "")}`;
}

/** Find a page by an exact (normalized) route. */
export function findPageByRoute(route: string): PageEntry | undefined {
  const norm = normalizeRoute(route);
  return WEBSITE_CONTENT_INDEX.find((p) => normalizeRoute(p.route) === norm);
}

/**
 * Try to detect a page reference inside a free-text prompt.
 * 1) explicit "/path" wins
 * 2) fall back to keyword matching against `name` + `keywords`
 */
export function detectPageFromText(text: string): PageEntry | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();

  // 1) explicit slash route
  const slashMatch = lower.match(/(^|\s)(\/[a-z0-9-]+(\/[a-z0-9-]+)*)/);
  if (slashMatch) {
    const candidate = slashMatch[2];
    const hit = findPageByRoute(candidate);
    if (hit) return hit;
  }

  // 2) keyword scoring
  let best: { page: PageEntry; score: number } | undefined;
  for (const page of WEBSITE_CONTENT_INDEX) {
    let score = 0;
    if (lower.includes(page.name.toLowerCase())) score += 3;
    for (const kw of page.keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { page, score };
    }
  }
  return best?.page;
}

/** Serializable summary of a page — safe to send to the AI as context. */
export function summarizePageForAi(page: PageEntry): string {
  const lines: string[] = [];
  lines.push(`ROUTE: ${page.route}`);
  lines.push(`NAME: ${page.name}`);
  lines.push(`EDITABLE: ${page.editable}`);
  lines.push(`META_TITLE: ${page.meta.title}`);
  lines.push(`META_DESCRIPTION: ${page.meta.description}`);
  lines.push(`CONTENT_SOURCE: ${page.contentSource}`);
  lines.push(`SEO_SOURCE: ${page.seoSource}`);
  lines.push(`TRANSLATION_SOURCE: ${page.translationSource}`);
  lines.push(`SECTIONS:`);
  for (const s of page.sections) {
    const head = s.heading ? ` — "${s.heading}"` : "";
    const i18n = s.i18nKey ? ` [i18n:${s.i18nKey}]` : "";
    lines.push(`  - ${s.id} (${s.label}, source=${s.source})${head}${i18n}`);
  }
  return lines.join("\n");
}

/** List all pages — useful for debugging / "welche Seiten gibt es?". */
export function listAllPages(): PageEntry[] {
  return WEBSITE_CONTENT_INDEX;
}
