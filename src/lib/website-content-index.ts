// ---------------------------------------------------------------------------
// Website Content Index — Deep Content Discovery
// ---------------------------------------------------------------------------
// Read-only registry of every public page on the OBRENT website.
// Stores not only route/meta information, but also the actual content
// (hero, CTAs, benefit cards, why-cards, form labels, body copy, FAQs)
// so the AI Editor can answer questions like
//   "Show me the full content of /business-langzeitmiete"
// or ground "optimize" proposals in real text instead of hallucinations.
//
// Source-of-truth: hand-extracted from src/routes/*.tsx and src/lib/i18n.tsx
// because those files use TSX literals + dynamic imports the AI cannot
// reliably parse at request time.
//
// No DB writes. No mutation. Pure data.
// ---------------------------------------------------------------------------

export type ContentSource =
  | "route_file"
  | "i18n"
  | "i18n+route_file"
  | "database"
  | "component"
  | "unknown";

export type SeoSource = "route_head" | "root_head" | "unknown";

export type TranslationSource = "i18n_dictionary" | "none" | "partial";

export type EditableStatus = "editable" | "advisory" | "locked";

// --- Rich content payloads -------------------------------------------------

export type CtaText = { label: string; href?: string };

export type BenefitCard = {
  icon?: string;          // lucide icon name (informational only)
  title?: string;
  body?: string;
};

export type FaqItem = { question: string; answer: string };

/**
 * A section has a stable id + label (was already in v1) and now also
 * carries the *actual* text shown on the page.
 *
 * `body` is the human-readable copy. For benefit grids we additionally
 * fill `cards`. For forms we fill `formFields`. For hero sections we
 * fill `hero` so the AI can reason about above-the-fold content.
 */
export type PageSection = {
  id: string;
  label: string;
  source: ContentSource;
  i18nKey?: string;

  /** Single heading shown for the section (eyebrow, H2, etc.) */
  heading?: string;
  /** Short eyebrow / kicker above the heading. */
  eyebrow?: string;
  /** Subheading / supporting line. */
  subheading?: string;
  /** Free-form body copy (one or multiple paragraphs joined by \n\n). */
  body?: string;
  /** Visible call-to-action label(s) inside this section. */
  ctas?: CtaText[];

  /** Hero-specific structured payload (only for hero sections). */
  hero?: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    description?: string;
    cta?: CtaText;
    /** Estimated above-the-fold character budget (used by SEO/UX optimizers). */
    aboveFoldChars?: number;
  };

  /** Benefit / leistungen / why-card grid items. */
  cards?: BenefitCard[];

  /** Form field labels (label only — values live in the database / runtime). */
  formFields?: string[];

  /** FAQ entries if the section is a FAQ. */
  faqs?: FaqItem[];

  /** Whether deep extraction was attempted for this section. */
  extracted: boolean;
  /** If extraction is incomplete, why. */
  unsupportedReason?: string;
};

export type PageEntry = {
  route: string;
  name: string;
  file: string;
  editable: EditableStatus;
  contentSource: ContentSource;
  seoSource: SeoSource;
  translationSource: TranslationSource;
  meta: {
    title: string;
    description: string;
    /** Optional separate page H1 if it differs from the meta title. */
    pageTitle?: string;
  };
  sections: PageSection[];
  keywords: string[];
};

// ---------------------------------------------------------------------------
// Helpers used while building entries
// ---------------------------------------------------------------------------

const ABOVE_FOLD_MOBILE_BUDGET = 280; // ~ chars that fit above the fold on a 375x667 device

function heroSection(args: {
  id?: string;
  label?: string;
  source?: ContentSource;
  i18nKey?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta?: CtaText;
}): PageSection {
  const {
    id = "hero",
    label = "Hero",
    source = "route_file",
    i18nKey,
    eyebrow,
    title,
    subtitle,
    description,
    cta,
  } = args;
  return {
    id,
    label,
    source,
    i18nKey,
    eyebrow,
    heading: title,
    subheading: subtitle,
    body: description,
    ctas: cta ? [cta] : undefined,
    hero: {
      eyebrow,
      title,
      subtitle,
      description,
      cta,
      aboveFoldChars: ABOVE_FOLD_MOBILE_BUDGET,
    },
    extracted: true,
  };
}

function cardsSection(args: {
  id: string;
  label: string;
  source?: ContentSource;
  i18nKey?: string;
  heading?: string;
  body?: string;
  cards: BenefitCard[];
}): PageSection {
  return {
    id: args.id,
    label: args.label,
    source: args.source ?? "route_file",
    i18nKey: args.i18nKey,
    heading: args.heading,
    body: args.body,
    cards: args.cards,
    extracted: true,
  };
}

function formSection(args: {
  id?: string;
  label?: string;
  source?: ContentSource;
  heading: string;
  submitLabel: string;
  fields: string[];
}): PageSection {
  return {
    id: args.id ?? "form",
    label: args.label ?? "Anfrageformular",
    source: args.source ?? "route_file",
    heading: args.heading,
    ctas: [{ label: args.submitLabel }],
    formFields: args.fields,
    extracted: true,
  };
}

function unsupported(args: {
  id: string;
  label: string;
  source?: ContentSource;
  reason: string;
}): PageSection {
  return {
    id: args.id,
    label: args.label,
    source: args.source ?? "database",
    extracted: false,
    unsupportedReason: args.reason,
  };
}

// ---------------------------------------------------------------------------
// Registry — deep content for each page
// ---------------------------------------------------------------------------

const SERVICE_FIELDS_LONGTERM = [
  "Firmenname",
  "Ansprechpartner",
  "Telefon",
  "E-Mail",
  "Gewünschtes Fahrzeug",
  "Mietdauer",
  "Anzahl Fahrzeuge",
  "Nachricht",
];

const SERVICE_FIELDS_CHAUFFEUR = [
  "Name",
  "Telefon",
  "E-Mail",
  "Datum",
  "Uhrzeit",
  "Einsatzort / Route",
  "Fahrzeugwunsch",
  "Ungefähre Dauer",
  "Nachricht",
];

const SERVICE_FIELDS_VIP = [
  "Name",
  "Telefon",
  "E-Mail",
  "Abholdatum",
  "Uhrzeit",
  "Abholort",
  "Zielort",
  "Personen",
  "Fahrzeugwunsch",
  "Nachricht",
];

const CONTACT_FIELDS = [
  "Anrede",
  "Titel",
  "Vollständiger Name",
  "E-Mail",
  "Telefon",
  "Betreff",
  "Ihre Nachricht",
  "Abholdatum",
  "Rückgabedatum",
  "Uhrzeit",
  "Privater Chauffeur (optional)",
];

export const WEBSITE_CONTENT_INDEX: PageEntry[] = [
  // -------------------------------------------------- /
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
      pageTitle: "Luxus fahren, ohne Kompromisse.",
    },
    sections: [
      heroSection({
        source: "i18n",
        i18nKey: "home.hero",
        eyebrow: "Ludwigshafen am Rhein · Luxus Autovermietung",
        title: "Luxus fahren, ohne Kompromisse.",
        description:
          "Premium-Fahrzeuge von Porsche, BMW und Audi — fair kalkuliert, schnell verfügbar und persönlich übergeben.",
        cta: { label: "Unsere Flotte entdecken", href: "/fleet" },
      }),
      {
        id: "hero-secondary-cta",
        label: "Hero · Sekundärer CTA",
        source: "i18n",
        i18nKey: "home.ctaAppointment",
        ctas: [{ label: "Kontakt aufnehmen", href: "/contact" }],
        extracted: true,
      },
      cardsSection({
        id: "services",
        label: "Service-Übersicht (Menü-Teaser)",
        source: "i18n",
        i18nKey: "servicesMenu",
        heading: "Unsere Services",
        cards: [
          {
            title: "VIP Shuttle",
            body: "Exklusiver Transfer-Service für höchste Ansprüche und diskretes Reisen.",
          },
          {
            title: "Chauffeur Service",
            body: "Professionelle Chauffeure begleiten Sie sicher und stilvoll an Ihr Ziel.",
          },
          {
            title: "Business Langzeitmiete",
            body: "Maßgeschneiderte Mobilitätslösungen für Unternehmen und Langzeitprojekte.",
          },
        ],
      }),
      {
        id: "fleet-strip",
        label: "Auto-scrolling Flotten-Strip",
        source: "database",
        heading: "Unsere Fahrzeuge",
        body: "Live-Karussell aus der `vehicles`-Tabelle. Pro Fahrzeug: Name, Kategorie, Preis/Tag, Hero-Bild. Inhalt ändert sich dynamisch — Texte selbst sind nicht über die Website-Datei editierbar.",
        extracted: true,
        unsupportedReason:
          "Pro-Fahrzeug-Text wird aus Supabase geladen — nutze Bereich 'vehicles' zum Bearbeiten.",
      },
      {
        id: "invitation",
        label: "Einladung / Bottom-CTA",
        source: "i18n",
        i18nKey: "home.invitation",
        eyebrow: "Kontakt",
        heading: "Bereit für Ihre nächste Fahrt",
        body:
          "Schreiben Sie uns oder rufen Sie an — wir finden gemeinsam das passende Fahrzeug für Ihren Anlass.",
        ctas: [{ label: "Jetzt anfragen", href: "/contact" }],
        extracted: true,
      },
    ],
    keywords: ["start", "startseite", "home", "landing", "index"],
  },

  // -------------------------------------------------- /business-langzeitmiete
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
      heroSection({
        eyebrow: "Business Langzeitmiete",
        title: "Mobilität für Ihr Unternehmen. Flexibel und zuverlässig.",
        description:
          "Langzeitmietlösungen für Geschäftsführer, Projektteams und Firmenflotten — individuell und diskret.",
        cta: { label: "Jetzt anfragen" },
      }),
      cardsSection({
        id: "leistungen",
        label: "Unsere Leistungen",
        heading: "Unsere Leistungen",
        cards: [
          { icon: "Crown", title: "Geschäftsführer & Vorstände" },
          { icon: "Users", title: "Projektteams" },
          { icon: "Building2", title: "Firmenflotten" },
          { icon: "Megaphone", title: "Messeauftritte" },
          { icon: "UserPlus", title: "Temporäre Mitarbeiter" },
          { icon: "CalendarRange", title: "Langzeitprojekte" },
        ],
      }),
      cardsSection({
        id: "why",
        label: "Warum OBRENT",
        heading: "Flexibel. Planbar. Exklusiv.",
        cards: [
          {
            icon: "Zap",
            title: "Flexibel",
            body: "Mietdauer nach Ihren Wünschen — von einem Monat bis individuell verlängerbar.",
          },
          {
            icon: "ClipboardCheck",
            title: "Planbar",
            body: "Feste Konditionen, keine Überraschungen. Eine klare Monatsrate, transparent kalkuliert.",
          },
          {
            icon: "Gem",
            title: "Exklusiv",
            body: "Premium Fahrzeuge, persönlicher Ansprechpartner — wir betreuen Ihre Flotte direkt.",
          },
        ],
      }),
      formSection({
        heading: "Langzeitmiete anfragen",
        submitLabel: "Anfrage senden",
        fields: SERVICE_FIELDS_LONGTERM,
      }),
    ],
    keywords: ["business", "langzeit", "langzeitmiete", "firma", "flotte", "company"],
  },

  // -------------------------------------------------- /chauffeur-service
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
      heroSection({
        eyebrow: "Chauffeur Service",
        title: "Ihr persönlicher Chauffeur. Wann immer Sie ihn brauchen.",
        description:
          "Professionell, zuverlässig und diskret — für Business, Events und private Fahrten.",
        cta: { label: "Jetzt anfragen" },
      }),
      cardsSection({
        id: "leistungen",
        label: "Unsere Leistungen",
        heading: "Unsere Leistungen",
        cards: [
          { icon: "Briefcase", title: "Business-Termine" },
          { icon: "Plane", title: "Flughafentransfers" },
          { icon: "Calendar", title: "Veranstaltungen" },
          { icon: "Car", title: "Private Fahrten" },
          { icon: "Users", title: "Kundenbetreuung" },
          { icon: "Clock", title: "Tagesbuchungen" },
        ],
      }),
      cardsSection({
        id: "why",
        label: "Warum OBRENT",
        heading: "Professionell. Flexibel. Stilvoll.",
        cards: [
          {
            icon: "Award",
            title: "Professionell",
            body: "Erfahrene, diskrete Fahrer mit Sinn für Etikette, Sprache und Service.",
          },
          {
            icon: "Zap",
            title: "Flexibel",
            body: "Kurzfristig buchbar — auch bei Planänderungen bleiben wir an Ihrer Seite.",
          },
          {
            icon: "Gem",
            title: "Stilvoll",
            body: "Immer im richtigen Fahrzeug — passend zu Anlass, Auftritt und Erwartung.",
          },
        ],
      }),
      formSection({
        heading: "Chauffeur anfragen",
        submitLabel: "Anfrage senden",
        fields: SERVICE_FIELDS_CHAUFFEUR,
      }),
    ],
    keywords: ["chauffeur", "fahrer", "driver"],
  },

  // -------------------------------------------------- /vip-shuttle
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
      heroSection({
        eyebrow: "VIP Shuttle",
        title: "Ankommen wie es Ihnen gebührt.",
        description:
          "Diskret, pünktlich und komfortabel — für Flughäfen, Hotels, Events und Geschäftstermine.",
        cta: { label: "Jetzt anfragen" },
      }),
      cardsSection({
        id: "leistungen",
        label: "Unsere Leistungen",
        heading: "Unsere Leistungen",
        cards: [
          { icon: "Plane", title: "Flughafentransfer" },
          { icon: "Hotel", title: "Hoteltransfer" },
          { icon: "Calendar", title: "Event-Transfer" },
          { icon: "Briefcase", title: "Geschäftsreisen" },
          { icon: "Sparkles", title: "Sonderanlässe" },
          { icon: "Route", title: "Fernstrecken" },
        ],
      }),
      cardsSection({
        id: "why",
        label: "Warum OBRENT",
        heading: "Pünktlich. Diskret. Komfortabel.",
        cards: [
          {
            icon: "Clock",
            title: "Pünktlich",
            body: "Wir sind immer zur Stelle — geplant mit Puffer, abgesichert in Echtzeit.",
          },
          {
            icon: "ShieldCheck",
            title: "Diskret",
            body: "Ihre Privatsphäre hat Priorität. Geschulte Fahrer, neutrale Fahrzeuge.",
          },
          {
            icon: "Sofa",
            title: "Komfortabel",
            body: "Erstklassige Fahrzeuge, entspanntes Reisen — Wasser, Klima, ruhiger Innenraum.",
          },
        ],
      }),
      formSection({
        heading: "Shuttle anfragen",
        submitLabel: "Anfrage senden",
        fields: SERVICE_FIELDS_VIP,
      }),
    ],
    keywords: ["vip", "shuttle", "flughafen", "airport"],
  },

  // -------------------------------------------------- /fleet
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
      {
        id: "intro",
        label: "Intro",
        source: "i18n",
        i18nKey: "fleet",
        eyebrow: "Fahrzeuge",
        heading: "Unsere Flotte",
        body: "Eine Auswahl gepflegter Premium-Fahrzeuge. Alle Autos werden regelmäßig gewartet und können direkt bei uns reserviert werden.",
        extracted: true,
      },
      {
        id: "category-filter",
        label: "Kategorie-Filter",
        source: "i18n",
        i18nKey: "categories",
        body:
          "Kategorien: Alle · Limousine · SUV · Kombi · Sportwagen · Cabriolet (abgeleitet aus den vorhandenen Fahrzeugen).",
        extracted: true,
      },
      unsupported({
        id: "vehicle-grid",
        label: "Fahrzeug-Grid (live)",
        source: "database",
        reason:
          "Inhalt kommt aus Supabase-Tabelle `vehicles` — Texte werden im Bereich 'vehicles' editiert, nicht in der Seitenstruktur.",
      }),
    ],
    keywords: ["fleet", "flotte", "fahrzeuge", "autos", "kollektion"],
  },

  // -------------------------------------------------- /fleet/$vehicleId
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
      unsupported({
        id: "gallery",
        label: "Galerie",
        source: "database",
        reason: "Bildquellen kommen pro Fahrzeug aus der DB.",
      }),
      {
        id: "specs",
        label: "Technische Daten (statische Labels)",
        source: "i18n",
        i18nKey: "vehicle.specs",
        body:
          "Labels: Motor · Leistung · Beschleunigung · Höchstgeschwindigkeit · Getriebe · Sitzplätze.",
        extracted: true,
      },
      {
        id: "reservation-cta",
        label: "Reservierungs-CTA",
        source: "i18n",
        i18nKey: "vehicle.enquiry",
        eyebrow: "Reservierungsanfrage",
        heading: "Reservieren Sie den …",
        body: "Ein Mitglied unseres Concierge-Teams meldet sich innerhalb einer Stunde.",
        ctas: [{ label: "Anfrage senden" }],
        extracted: true,
      },
      {
        id: "reservation-form",
        label: "Reservierungs-Formular",
        source: "i18n",
        i18nKey: "vehicle.form",
        formFields: [
          "Name",
          "E-Mail",
          "Telefon",
          "Lieferort",
          "Startdatum",
          "Enddatum",
          "Besondere Wünsche",
        ],
        extracted: true,
      },
    ],
    keywords: ["fahrzeug", "detail", "vehicle"],
  },

  // -------------------------------------------------- /about
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
      heroSection({
        source: "route_file",
        eyebrow: "Über OBRENT",
        title: "Luxus-Autovermietung aus Ludwigshafen am Rhein",
        description:
          "Gegründet 2026 in Ludwigshafen am Rhein, vermieten wir Premium-Fahrzeuge fair, transparent und persönlich.",
      }),
      {
        id: "story",
        label: "Story",
        source: "i18n",
        i18nKey: "about",
        body: [
          "Bei OBRENT setzen wir auf eine sorgfältig ausgewählte Flotte hochwertiger Fahrzeuge. Jedes Auto wird regelmäßig gewartet, gepflegt und für Sie bereitgestellt — ohne versteckte Kosten und ohne Umwege.",
          "Ob für ein Wochenende, eine Geschäftsreise oder einen besonderen Anlass — wir beraten Sie persönlich und übergeben Ihr Wunschfahrzeug direkt in Ludwigshafen am Rhein. Schnell, unkompliziert und auf Augenhöhe.",
        ].join("\n\n"),
        extracted: true,
      },
      cardsSection({
        id: "principles",
        label: "Vier Prinzipien",
        source: "i18n",
        i18nKey: "about.values",
        heading: "Vier Prinzipien, an die wir uns halten.",
        cards: [
          {
            title: "Faire Preise",
            body:
              "Transparente Tagespreise ohne versteckte Gebühren — Sie sehen genau, was Sie bezahlen.",
          },
          {
            title: "Gepflegte Flotte",
            body:
              "Alle Fahrzeuge werden regelmäßig gewartet und vor jeder Übergabe sorgfältig vorbereitet.",
          },
          {
            title: "Persönlicher Service",
            body:
              "Wir nehmen uns Zeit für Sie, beraten ehrlich und übergeben Ihr Fahrzeug direkt vor Ort in Ludwigshafen am Rhein.",
          },
          {
            title: "Schnell verfügbar",
            body:
              "Kurzfristige Anfragen sind kein Problem — meist können wir noch am selben Tag eine Lösung anbieten.",
          },
        ],
      }),
    ],
    keywords: ["about", "über", "ueber", "uns", "story", "team"],
  },

  // -------------------------------------------------- /contact
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
      {
        id: "intro",
        label: "Concierge-Intro",
        source: "i18n",
        i18nKey: "contact",
        eyebrow: "Kontakt",
        heading: "Schreiben Sie uns eine Nachricht",
        body:
          "Sie haben Fragen zu einem Fahrzeug oder möchten eine Reservierung anfragen? Wir melden uns schnellstmöglich bei Ihnen zurück.",
        extracted: true,
      },
      formSection({
        id: "form",
        label: "Anfrageformular",
        heading: "Kontaktformular",
        submitLabel: "Anfrage senden",
        fields: CONTACT_FIELDS,
      }),
      unsupported({
        id: "settings",
        label: "Kontaktdaten (Adresse, Telefon, E-Mail, Öffnungszeiten)",
        source: "database",
        reason:
          "Werte kommen aus `app_settings` — über Bereich 'settings' bearbeiten, nicht über die Seite.",
      }),
    ],
    keywords: ["contact", "kontakt", "concierge", "anfrage"],
  },

  // -------------------------------------------------- /impressum
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
      {
        id: "legal",
        label: "Pflichtangaben § 5 DDG",
        source: "route_file",
        heading: "Angaben gemäß § 5 DDG",
        body:
          "OBRENT GmbH · Industriestraße 60 · 67063 Ludwigshafen am Rhein · Deutschland.",
        extracted: true,
        unsupportedReason: "Rechtstext — nur mit ausdrücklicher Freigabe ändern.",
      },
    ],
    keywords: ["impressum", "legal", "rechtlich"],
  },

  // -------------------------------------------------- /datenschutz
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
      {
        id: "controller",
        label: "Verantwortlicher",
        source: "route_file",
        heading: "1. Verantwortlicher",
        body:
          "OBRENT GmbH, vertreten durch den Geschäftsführer Osman Boyraz · Industriestraße 60 · 67063 Ludwigshafen am Rhein.",
        extracted: true,
        unsupportedReason: "Rechtstext — nur mit ausdrücklicher Freigabe ändern.",
      },
      unsupported({
        id: "processing",
        label: "Datenverarbeitung (vollständig)",
        source: "route_file",
        reason: "Langer DSGVO-Text — nicht eingebettet, um Token-Budget zu schützen.",
      }),
    ],
    keywords: ["datenschutz", "dsgvo", "privacy"],
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function normalizeRoute(s: string): string {
  const trimmed = s.trim().toLowerCase().replace(/\s+/g, "");
  if (!trimmed) return "";
  if (trimmed === "/") return "/";
  return trimmed.startsWith("/")
    ? trimmed.replace(/\/+$/, "")
    : `/${trimmed.replace(/\/+$/, "")}`;
}

export function findPageByRoute(route: string): PageEntry | undefined {
  const norm = normalizeRoute(route);
  return WEBSITE_CONTENT_INDEX.find((p) => normalizeRoute(p.route) === norm);
}

export function detectPageFromText(text: string): PageEntry | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();

  const slashMatch = lower.match(/(^|\s)(\/[a-z0-9-]+(\/[a-z0-9-]+)*)/);
  if (slashMatch) {
    const hit = findPageByRoute(slashMatch[2]);
    if (hit) return hit;
  }

  let best: { page: PageEntry; score: number } | undefined;
  for (const page of WEBSITE_CONTENT_INDEX) {
    let score = 0;
    if (lower.includes(page.name.toLowerCase())) score += 3;
    for (const kw of page.keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { page, score };
  }
  return best?.page;
}

/**
 * Try to detect which *section* the user is asking about inside a given page,
 * e.g. "hero", "leistungen", "form", "principles", "story", "why", "intro".
 * Returns undefined if no specific section is mentioned.
 */
export function detectSectionFromText(
  page: PageEntry,
  text: string,
): PageSection | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();
  const aliases: Record<string, string[]> = {
    hero: ["hero", "above the fold", "above-the-fold", "above fold", "oberer bereich", "oben", "header"],
    leistungen: ["leistungen", "services", "service", "angebot"],
    why: ["why", "warum", "vorteile", "benefits", "vorteil"],
    form: ["form", "formular", "anfrage", "kontaktformular"],
    principles: ["prinzipien", "werte", "values", "principles"],
    story: ["story", "geschichte"],
    intro: ["intro", "einleitung", "lead"],
  };
  for (const s of page.sections) {
    if (lower.includes(s.id.toLowerCase())) return s;
    const a = aliases[s.id];
    if (a && a.some((k) => lower.includes(k))) return s;
    if (s.label && lower.includes(s.label.toLowerCase())) return s;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Serialization for the AI
// ---------------------------------------------------------------------------

function sectionToText(s: PageSection): string {
  const lines: string[] = [];
  lines.push(`### SECTION ${s.id} — ${s.label}`);
  lines.push(`source: ${s.source}${s.i18nKey ? ` (i18n:${s.i18nKey})` : ""}`);
  if (!s.extracted) {
    lines.push(`status: UNSUPPORTED${s.unsupportedReason ? ` — ${s.unsupportedReason}` : ""}`);
    return lines.join("\n");
  }
  if (s.hero) {
    lines.push(`hero.title: ${s.hero.title}`);
    if (s.hero.eyebrow) lines.push(`hero.eyebrow: ${s.hero.eyebrow}`);
    if (s.hero.subtitle) lines.push(`hero.subtitle: ${s.hero.subtitle}`);
    if (s.hero.description) lines.push(`hero.description: ${s.hero.description}`);
    if (s.hero.cta) lines.push(`hero.cta: ${s.hero.cta.label}`);
    if (s.hero.aboveFoldChars)
      lines.push(`hero.aboveFoldBudgetChars(mobile): ${s.hero.aboveFoldChars}`);
  } else {
    if (s.eyebrow) lines.push(`eyebrow: ${s.eyebrow}`);
    if (s.heading) lines.push(`heading: ${s.heading}`);
    if (s.subheading) lines.push(`subheading: ${s.subheading}`);
    if (s.body) lines.push(`body: ${s.body}`);
  }
  if (s.cards?.length) {
    lines.push(`cards (${s.cards.length}):`);
    for (const c of s.cards) {
      const t = c.title ?? "";
      const b = c.body ? ` — ${c.body}` : "";
      lines.push(`  - ${t}${b}`);
    }
  }
  if (s.ctas?.length) lines.push(`ctas: ${s.ctas.map((c) => c.label).join(" · ")}`);
  if (s.formFields?.length)
    lines.push(`formFields (${s.formFields.length}): ${s.formFields.join(", ")}`);
  if (s.faqs?.length) {
    lines.push(`faqs (${s.faqs.length}):`);
    for (const f of s.faqs) lines.push(`  Q: ${f.question}\n  A: ${f.answer}`);
  }
  if (s.unsupportedReason) lines.push(`note: ${s.unsupportedReason}`);
  return lines.join("\n");
}

/**
 * Serializable, AI-ready summary of a page.
 * Includes ALL extracted content so the AI never invents missing copy.
 * Optionally restrict to a single section (e.g. when the admin asked
 * "optimize the hero").
 */
export function summarizePageForAi(page: PageEntry, sectionId?: string): string {
  const lines: string[] = [];
  lines.push(`ROUTE: ${page.route}`);
  lines.push(`NAME: ${page.name}`);
  lines.push(`EDITABLE: ${page.editable}`);
  lines.push(`PAGE_TITLE: ${page.meta.pageTitle ?? page.meta.title}`);
  lines.push(`META_TITLE: ${page.meta.title}`);
  lines.push(`META_DESCRIPTION: ${page.meta.description}`);
  lines.push(`CONTENT_SOURCE: ${page.contentSource}`);
  lines.push(`SEO_SOURCE: ${page.seoSource}`);
  lines.push(`TRANSLATION_SOURCE: ${page.translationSource}`);
  lines.push("");
  const sections = sectionId
    ? page.sections.filter((s) => s.id === sectionId)
    : page.sections;
  for (const s of sections) {
    lines.push(sectionToText(s));
    lines.push("");
  }
  return lines.join("\n").trim();
}

// ---------------------------------------------------------------------------
// Stats — used by debug/listing tooling
// ---------------------------------------------------------------------------

export type IndexStats = {
  pages: number;
  sectionsTotal: number;
  sectionsExtracted: number;
  sectionsUnsupported: number;
  /** Character count of all extracted body+heading+card text (rough). */
  charactersExtracted: number;
};

export function getIndexStats(): IndexStats {
  let sectionsTotal = 0;
  let sectionsExtracted = 0;
  let sectionsUnsupported = 0;
  let chars = 0;
  for (const p of WEBSITE_CONTENT_INDEX) {
    for (const s of p.sections) {
      sectionsTotal++;
      if (s.extracted) sectionsExtracted++;
      else sectionsUnsupported++;
      chars +=
        (s.eyebrow?.length ?? 0) +
        (s.heading?.length ?? 0) +
        (s.subheading?.length ?? 0) +
        (s.body?.length ?? 0) +
        (s.hero?.title.length ?? 0) +
        (s.hero?.subtitle?.length ?? 0) +
        (s.hero?.description?.length ?? 0) +
        (s.cards?.reduce(
          (acc, c) => acc + (c.title?.length ?? 0) + (c.body?.length ?? 0),
          0,
        ) ?? 0) +
        (s.formFields?.reduce((acc, f) => acc + f.length, 0) ?? 0);
    }
  }
  return {
    pages: WEBSITE_CONTENT_INDEX.length,
    sectionsTotal,
    sectionsExtracted,
    sectionsUnsupported,
    charactersExtracted: chars,
  };
}

export function listAllPages(): PageEntry[] {
  return WEBSITE_CONTENT_INDEX;
}
