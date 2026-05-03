import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "de" | "en";

type Dict = typeof translations.de;

export const translations = {
  de: {
    nav: {
      home: "Startseite",
      fleet: "Flotte",
      about: "Über uns",
      contact: "Kontakt",
      reserve: "Reservieren",
      concierge: "Verwaltung",
    },
    common: {
      from: "Ab",
      perDay: "/ Tag",
      reserve: "Reservieren",
      viewAll: "Gesamte Flotte ansehen →",
      filter: "Filter",
      all: "Alle",
      motorcars: "Fahrzeuge",
      back: "Zurück",
    },
    categories: {
      Sedan: "Limousine",
      Limousine: "Limousine",
      SUV: "SUV",
      Kombi: "Kombi",
      Sports: "Sportwagen",
      Convertible: "Cabriolet",
    },
    home: {
      eyebrow: "Mannheim · Luxus Autovermietung",
      heroTitle: "Luxus",
      heroTitleItalic: "fahren",
      heroTitleRest: ", ohne Kompromisse.",
      heroLead:
        "Premium-Fahrzeuge von Porsche, BMW und Audi — fair kalkuliert, schnell verfügbar und persönlich übergeben.",
      ctaFleet: "Unsere Flotte entdecken",
      ctaAppointment: "Kontakt aufnehmen",
      scroll: "Scrollen",
      collectionEyebrow: "Die Kollektion",
      featuredTitle: "Unsere",
      featuredItalic: "Fahrzeuge",
      standardEyebrow: "",
      tenetsTitle: "",
      tenetsItalic: "",
      tenetsRest: "",
      usps: [],
      invitationEyebrow: "Kontakt",
      invitationTitle: "Bereit für Ihre",
      invitationItalic: "nächste Fahrt",
      invitationLead:
        "Schreiben Sie uns oder rufen Sie an — wir finden gemeinsam das passende Fahrzeug für Ihren Anlass.",
      invitationCta: "Jetzt anfragen",
    },
    fleet: {
      eyebrow: "Fahrzeuge",
      title: "Unsere",
      titleItalic: "Flotte",
      lead:
        "Eine Auswahl gepflegter Premium-Fahrzeuge. Alle Autos werden regelmäßig gewartet und können direkt bei uns reserviert werden.",
    },
    vehicle: {
      reservationFrom: "Reservierung ab",
      includes:
        "Inklusive Versicherung, Wartung und Concierge-Lieferung im Großstadtgebiet.",
      specifications: "Spezifikationen",
      specs: {
        engine: "Motor",
        power: "Leistung",
        acceleration: "Beschleunigung",
        topSpeed: "Höchstgeschwindigkeit",
        transmission: "Getriebe",
        seats: "Sitzplätze",
      },
      enquiryEyebrow: "Reservierungsanfrage",
      reserveTitle: "Reservieren Sie den",
      reserveLead: "Ein Mitglied unseres Concierge-Teams meldet sich innerhalb einer Stunde.",
      form: {
        name: "Name",
        email: "E-Mail",
        phone: "Telefon",
        city: "Lieferort",
        startDate: "Startdatum",
        endDate: "Enddatum",
        message: "Besondere Wünsche",
        messagePlaceholder: "Chauffeur, Route, Anlass…",
        namePlaceholder: "Jonathan Beaumont",
        emailPlaceholder: "jonathan@residenz.de",
        phonePlaceholder: "+49 30 00 00 00",
        cityPlaceholder: "Monaco",
        disclaimer:
          "Die Übermittlung dieser Anfrage stellt eine Einladung zur Reservierung dar, jedoch keine bestätigte Buchung. Unser Concierge bestätigt die Verfügbarkeit persönlich.",
        submit: "Anfrage senden",
      },
      notFoundEyebrow: "Nicht in unserer Garage",
      notFoundTitle: "Fahrzeug nicht verfügbar",
      backToFleet: "Zurück zur Flotte",
    },
    about: {
      eyebrowHouse: "Über OBRENT",
      title: "Luxus-Autovermietung aus",
      titleItalic: "Mannheim",
      intro:
        "Gegründet 2026 in Mannheim, vermieten wir Premium-Fahrzeuge",
      introItalic: "fair, transparent und persönlich.",
      p2: "Bei OBRENT setzen wir auf eine sorgfältig ausgewählte Flotte hochwertiger Fahrzeuge. Jedes Auto wird regelmäßig gewartet, gepflegt und für Sie bereitgestellt — ohne versteckte Kosten und ohne Umwege.",
      p3: "Ob für ein Wochenende, eine Geschäftsreise oder einen besonderen Anlass — wir beraten Sie persönlich und übergeben Ihr Wunschfahrzeug direkt in Mannheim. Schnell, unkompliziert und auf Augenhöhe.",
      founders: "— Das OBRENT-Team",
      valuesEyebrow: "Unsere Werte",
      valuesTitle: "Vier",
      valuesItalic: "Prinzipien",
      valuesRest: ", an die wir uns halten.",
      values: [
        { title: "Faire Preise", body: "Transparente Tagespreise ohne versteckte Gebühren — Sie sehen genau, was Sie bezahlen." },
        { title: "Gepflegte Flotte", body: "Alle Fahrzeuge werden regelmäßig gewartet und vor jeder Übergabe sorgfältig vorbereitet." },
        { title: "Persönlicher Service", body: "Wir nehmen uns Zeit für Sie, beraten ehrlich und übergeben Ihr Fahrzeug direkt vor Ort in Mannheim." },
        { title: "Schnell verfügbar", body: "Kurzfristige Anfragen sind kein Problem — meist können wir noch am selben Tag eine Lösung anbieten." },
      ],
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Schreiben Sie uns eine",
      titleItalic: "Nachricht",
      lead:
        "Sie haben Fragen zu einem Fahrzeug oder möchten eine Reservierung anfragen? Wir melden uns schnellstmöglich bei Ihnen zurück.",
      form: {
        salutation: "Anrede",
        salutationPlaceholder: "Hr. / Fr. / Dr.",
        name: "Vollständiger Name",
        email: "E-Mail",
        phone: "Telefon",
        subject: "Betreff",
        subjectPlaceholder: "Anfrage Wochenendmiete",
        message: "Ihre Nachricht",
        messagePlaceholder: "Wunschfahrzeug, Zeitraum und weitere Details…",
        pickupDate: "Abholdatum",
        returnDate: "Rückgabedatum",
        pickDate: "Datum wählen",
        chauffeur: "Privater Chauffeur",
        chauffeurHint: "Optional gegen Aufpreis hinzubuchen",
        chauffeurYes: "Ja, mit Chauffeur",
        chauffeurNo: "Nein, ich fahre selbst",
        submit: "Senden",
        confidential:
          "Ihre Daten werden vertraulich behandelt. Wir antworten in der Regel innerhalb weniger Stunden.",
      },
      direct: "Direkt",
      ateliers: "Standort",
    },
    footer: {
      slogan: "Kuratierte Mobilität. Diskreter Service. Eine Einladung zum Außergewöhnlichen.",
      navigate: "Navigation",
      atelier: "Atelier",
      hours: "Öffnungszeiten",
      hoursDays: "Montag — Sonntag",
      hours24: "24 Stunden · Auf Anfrage",
      chauffeur: "Privater Chauffeur verfügbar",
      byAppointment: "Nur nach Vereinbarung",
      rights: "© {year} OBRENT · Alle Rechte vorbehalten",
      privacy: "Datenschutz",
      terms: "AGB",
      imprint: "Impressum",
    },
    admin: {
      eyebrow: "Eingeschränkter Zugang",
      signIn: "Concierge-Anmeldung",
      lead: "Nur für OBRENT-Mitarbeiter und autorisierte Concierge-Agenten.",
      email: "E-Mail",
      passphrase: "Passphrase",
      remember: "Gerät merken",
      recover: "Wiederherstellen",
      enter: "Atelier betreten",
      authenticating: "Authentifizierung…",
      monitored:
        "Unbefugter Zugriff wird überwacht und protokolliert. Mit der Anmeldung erkennen Sie die internen Datenschutzrichtlinien von OBRENT an.",
      curtain: "Das Atelier,",
      curtainItalic: "hinter dem Vorhang",
      reservations: "Reservierungen",
      newReservation: "Neue Reservierung",
      export: "Exportieren",
      stats: {
        active: "Aktive Reservierungen",
        pending: "Ausstehende Bestätigung",
        revenue: "Umsatz · Mai",
        utilisation: "Flottenauslastung",
      },
      table: {
        reference: "Referenz",
        client: "Kunde",
        vehicle: "Fahrzeug",
        city: "Stadt",
        dates: "Daten",
        total: "Gesamt",
        status: "Status",
        view: "Ansehen →",
        entries: "Einträge",
      },
      status: {
        all: "Alle",
        pending: "Ausstehend",
        confirmed: "Bestätigt",
        rejected: "Abgelehnt",
      },
      sidebar: {
        reservations: "Reservierungen",
        fleet: "Flotte",
        clients: "Kunden",
        calendar: "Kalender",
        reports: "Berichte",
        settings: "Einstellungen",
        signOut: "← Abmelden",
      },
      dateLabel: "Dienstag, 14. Mai",
    },
  },
  en: {
    nav: {
      home: "Home",
      fleet: "Fleet",
      about: "About",
      contact: "Contact",
      reserve: "Reserve",
      concierge: "Admin",
    },
    common: {
      from: "From",
      perDay: "/ day",
      reserve: "Reserve",
      viewAll: "View Entire Fleet →",
      filter: "Filter",
      all: "All",
      motorcars: "motorcars",
      back: "Back",
    },
    categories: {
      Sedan: "Sedan",
      Limousine: "Saloon",
      SUV: "SUV",
      Kombi: "Estate",
      Sports: "Sports",
      Convertible: "Convertible",
    },
    home: {
      eyebrow: "Mannheim · Luxury Car Rental",
      heroTitle: "Drive",
      heroTitleItalic: "luxury",
      heroTitleRest: ", without compromise.",
      heroLead:
        "Premium vehicles from Porsche, BMW and Audi — fairly priced, quickly available, and personally handed over.",
      ctaFleet: "Discover Our Fleet",
      ctaAppointment: "Get in Touch",
      scroll: "Scroll",
      collectionEyebrow: "The Collection",
      featuredTitle: "Our",
      featuredItalic: "vehicles",
      standardEyebrow: "",
      tenetsTitle: "",
      tenetsItalic: "",
      tenetsRest: "",
      usps: [],
      invitationEyebrow: "Contact",
      invitationTitle: "Ready for your",
      invitationItalic: "next drive",
      invitationLead:
        "Send us a message or give us a call — we'll find the right vehicle for your occasion together.",
      invitationCta: "Get in touch",
    },
    fleet: {
      eyebrow: "Vehicles",
      title: "Our",
      titleItalic: "fleet",
      lead:
        "A curated selection of well-maintained premium vehicles. All cars are serviced regularly and available for direct reservation.",
    },
    vehicle: {
      reservationFrom: "Reservation from",
      includes: "Inclusive of insurance, maintenance, and concierge delivery within metropolitan limits.",
      specifications: "Specifications",
      specs: {
        engine: "Engine",
        power: "Power",
        acceleration: "Acceleration",
        topSpeed: "Top Speed",
        transmission: "Transmission",
        seats: "Seating",
      },
      enquiryEyebrow: "Reservation Enquiry",
      reserveTitle: "Reserve the",
      reserveLead: "A member of our concierge will reply within the hour.",
      form: {
        name: "Full Name",
        email: "Email",
        phone: "Telephone",
        city: "Delivery City",
        startDate: "Start Date",
        endDate: "End Date",
        message: "Particular Requests",
        messagePlaceholder: "Chauffeur, route, occasion…",
        namePlaceholder: "Jonathan Beaumont",
        emailPlaceholder: "jonathan@residence.com",
        phonePlaceholder: "+33 6 00 00 00 00",
        cityPlaceholder: "Monaco",
        disclaimer:
          "Submission of this enquiry constitutes an invitation to reserve, not a confirmed booking. Our concierge will confirm availability personally.",
        submit: "Submit Enquiry",
      },
      notFoundEyebrow: "Not in our garage",
      notFoundTitle: "Motorcar unavailable",
      backToFleet: "Return to Fleet",
    },
    about: {
      eyebrowHouse: "The House of OBRENT",
      title: "A private atelier of",
      titleItalic: "motoring",
      intro: "Founded in Monaco in 2012, OBRENT was conceived for a quiet question —",
      introItalic: "where might one borrow a Phantom for a single afternoon?",
      p2: "In the years that followed, that question became a vocation. We assembled a small fleet of extraordinary motorcars and offered them, by introduction, to a small number of clients. We did not advertise. We did not need to.",
      p3: "Today the atelier operates from Monaco, Paris, and Dubai. The clientele has grown — modestly, deliberately — and the principles remain unchanged. We treat every motorcar as a guest in our care, and every client as the next chapter in a long story.",
      founders: "— The Founders",
      valuesEyebrow: "Our Values",
      valuesTitle: "Four",
      valuesItalic: "principles",
      valuesRest: ", four cornerstones.",
      values: [
        { title: "Provenance", body: "Each motorcar is acquired from sources of impeccable lineage — recorded, verified, and presented with full history." },
        { title: "Discretion", body: "Our clientele's privacy is not a policy but a principle. Names are never spoken; itineraries never shared." },
        { title: "Mastery", body: "Our technicians are factory-trained. Our preparation is forensic. Nothing leaves the atelier short of perfection." },
        { title: "Hospitality", body: "We attend to clients as we would receive them in our own home — with warmth, with patience, with care." },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Send us a",
      titleItalic: "message",
      lead:
        "Questions about a vehicle or want to request a reservation? We'll get back to you as soon as possible.",
      form: {
        salutation: "Salutation",
        salutationPlaceholder: "Mr. / Ms. / Dr.",
        name: "Full Name",
        email: "Email",
        phone: "Phone",
        subject: "Subject",
        subjectPlaceholder: "Weekend rental enquiry",
        message: "Your Message",
        messagePlaceholder: "Preferred vehicle, dates and any further details…",
        pickupDate: "Pick-up date",
        returnDate: "Return date",
        pickDate: "Pick a date",
        chauffeur: "Private chauffeur",
        chauffeurHint: "Optionally add for an additional fee",
        chauffeurYes: "Yes, with chauffeur",
        chauffeurNo: "No, I'll drive myself",
        submit: "Send",
        confidential: "Your details are kept confidential. We usually reply within a few hours.",
      },
      direct: "Direct",
      ateliers: "Location",
    },
    footer: {
      slogan: "Curated motoring. Discreet service. An invitation to the extraordinary.",
      navigate: "Navigate",
      atelier: "Atelier",
      hours: "Hours",
      hoursDays: "Monday — Sunday",
      hours24: "24 hours · By request",
      chauffeur: "Private chauffeur available",
      byAppointment: "By appointment only",
      rights: "© {year} OBRENT · All Rights Reserved",
      privacy: "Privacy",
      terms: "Terms",
      imprint: "Imprint",
    },
    admin: {
      eyebrow: "Restricted Access",
      signIn: "Concierge Sign-In",
      lead: "For OBRENT staff and authorised concierge agents only.",
      email: "Email",
      passphrase: "Passphrase",
      remember: "Remember device",
      recover: "Recover",
      enter: "Enter Atelier",
      authenticating: "Authenticating…",
      monitored:
        "Unauthorised access is monitored and logged. By signing in you acknowledge OBRENT's internal data handling policy.",
      curtain: "The atelier,",
      curtainItalic: "behind the curtain",
      reservations: "Reservations",
      newReservation: "New Reservation",
      export: "Export",
      stats: {
        active: "Active Reservations",
        pending: "Pending Approval",
        revenue: "Revenue · May",
        utilisation: "Fleet Utilisation",
      },
      table: {
        reference: "Reference",
        client: "Client",
        vehicle: "Motorcar",
        city: "City",
        dates: "Dates",
        total: "Total",
        status: "Status",
        view: "View →",
        entries: "entries",
      },
      status: {
        all: "All",
        pending: "Pending",
        confirmed: "Confirmed",
        rejected: "Rejected",
      },
      sidebar: {
        reservations: "Reservations",
        fleet: "Fleet",
        clients: "Clients",
        calendar: "Calendar",
        reports: "Reports",
        settings: "Settings",
        signOut: "← Sign Out",
      },
      dateLabel: "Tuesday, 14 May",
    },
  },
} as const;

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "obrent-lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "de" || stored === "en") setLangState(stored);
    } catch {
      // ignore
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = translations[lang] as Dict;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
