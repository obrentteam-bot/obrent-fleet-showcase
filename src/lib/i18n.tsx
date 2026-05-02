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
      SUV: "SUV",
      Sports: "Sportwagen",
      Convertible: "Cabriolet",
    },
    home: {
      eyebrow: "Gegr. Monaco · MMXII",
      heroLead:
        "Eine Auswahl der außergewöhnlichsten Fahrzeuge der Welt — auf Einladung jenen angeboten, die den Unterschied erkennen.",
      ctaFleet: "Unsere Flotte entdecken",
      ctaAppointment: "Privater Termin",
      scroll: "Scrollen",
      collectionEyebrow: "Die Kollektion",
      featuredTitle: "Ausgewählte",
      featuredItalic: "Fahrzeuge",
      standardEyebrow: "Der OBRENT-Standard",
      tenetsTitle: "Drei",
      tenetsItalic: "Grundsätze",
      tenetsRest: ", kompromisslos eingehalten.",
      usps: [
        {
          title: "Concierge-Lieferung",
          body: "Ihr Fahrzeug wird an Ihre Residenz, Ihr Hotel oder Ihr privates Terminal gebracht — bestens vorbereitet und tadellos präsentiert.",
        },
        {
          title: "Handverlesene Flotte",
          body: "Jedes Fahrzeug wird privat kuratiert, von Markenspezialisten gewartet und einem erlesenen Kreis vorbehalten.",
        },
        {
          title: "Diskretion garantiert",
          body: "Ihre Reservierung, Ihr Reiseplan, Ihre Privatsphäre — geschützt durch einen ungeschriebenen Kodex, den wir seit Jahrzehnten wahren.",
        },
      ],
      invitationEyebrow: "Auf Einladung",
      invitationTitle: "Manche Reisen verdienen",
      invitationItalic: "mehr als ein Fahrzeug",
      invitationLead:
        "Sprechen Sie mit unserem Concierge, um ein Fahrerlebnis ganz nach Ihrem Reiseplan, Ihrem Geschmack und Ihrem Zeitplan zu gestalten.",
      invitationCta: "Ein Gespräch beginnen",
    },
    fleet: {
      eyebrow: "Die Kollektion",
      title: "Unsere",
      titleItalic: "Flotte",
      lead:
        "Jedes Fahrzeug ist exklusiv der OBRENT-Klientel vorbehalten — gewartet, vorbereitet und präsentiert auf einem Niveau, das die Marke selbst anerkennen würde.",
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
      eyebrowHouse: "Das Haus OBRENT",
      title: "Ein privates Atelier des",
      titleItalic: "Motorsports",
      intro:
        "Gegründet 2012 in Monaco, entstand OBRENT aus einer leisen Frage —",
      introItalic: "wo könnte man einen Phantom für einen einzigen Nachmittag leihen?",
      p2: "In den darauffolgenden Jahren wurde aus dieser Frage eine Berufung. Wir stellten eine kleine Flotte außergewöhnlicher Fahrzeuge zusammen und boten sie auf Empfehlung einer kleinen Anzahl von Kunden an. Wir warben nicht. Wir mussten es nicht.",
      p3: "Heute operiert das Atelier von Monaco, Paris und Dubai aus. Die Klientel ist gewachsen — bedacht und behutsam — und die Grundsätze sind unverändert geblieben. Wir behandeln jedes Fahrzeug wie einen Gast in unserer Obhut und jeden Kunden als das nächste Kapitel einer langen Geschichte.",
      founders: "— Die Gründer",
      valuesEyebrow: "Unsere Werte",
      valuesTitle: "Vier",
      valuesItalic: "Prinzipien",
      valuesRest: ", vier Eckpfeiler.",
      values: [
        { title: "Provenienz", body: "Jedes Fahrzeug wird aus Quellen tadelloser Herkunft erworben — dokumentiert, geprüft und mit vollständiger Historie präsentiert." },
        { title: "Diskretion", body: "Die Privatsphäre unserer Klientel ist keine Richtlinie, sondern ein Prinzip. Namen werden nie genannt, Reisepläne nie geteilt." },
        { title: "Meisterschaft", body: "Unsere Techniker sind werksgeschult. Unsere Vorbereitung ist akribisch. Nichts verlässt das Atelier ohne Perfektion." },
        { title: "Gastfreundschaft", body: "Wir empfangen unsere Kunden wie in unserem eigenen Hause — mit Wärme, mit Geduld, mit Sorgfalt." },
      ],
    },
    contact: {
      eyebrow: "Eine Einladung",
      title: "Beginnen Sie ein",
      titleItalic: "Gespräch",
      lead:
        "Ob für einen Nachmittag in den Alpes-Maritimes oder eine Saison im Ausland — unser Concierge gestaltet ein Erlebnis ganz nach Ihren Wünschen.",
      form: {
        salutation: "Anrede",
        salutationPlaceholder: "Hr. / Fr. / Dr.",
        name: "Vollständiger Name",
        email: "E-Mail",
        phone: "Telefon",
        subject: "Betreff",
        subjectPlaceholder: "Ein privates Wochenende in Monaco",
        message: "Ihre Nachricht",
        messagePlaceholder: "Bitte teilen Sie uns die Details Ihrer Anfrage mit…",
        submit: "Senden",
        confidential:
          "Ihre Anfrage wird streng vertraulich behandelt. Wir antworten persönlich innerhalb einer Stunde.",
      },
      direct: "Direkt",
      ateliers: "Ateliers",
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
      SUV: "SUV",
      Sports: "Sports",
      Convertible: "Convertible",
    },
    home: {
      eyebrow: "Est. Monaco · MMXII",
      heroLead:
        "An assembly of the world's most extraordinary motorcars — offered, by invitation, to those who recognise the difference.",
      ctaFleet: "Discover Our Fleet",
      ctaAppointment: "Private Appointment",
      scroll: "Scroll",
      collectionEyebrow: "The Collection",
      featuredTitle: "Featured",
      featuredItalic: "motorcars",
      standardEyebrow: "The OBRENT Standard",
      tenetsTitle: "Three",
      tenetsItalic: "tenets",
      tenetsRest: ", observed without compromise.",
      usps: [
        { title: "Concierge Delivery", body: "Your motorcar arrives at your residence, hotel, or private terminal — fully prepared and impeccably presented." },
        { title: "Hand-Selected Fleet", body: "Every vehicle is privately curated, maintained by marque specialists, and reserved for a discerning few." },
        { title: "Discretion Assured", body: "Your reservation, your itinerary, your privacy — protected by an unwritten code we have observed for decades." },
      ],
      invitationEyebrow: "By Invitation",
      invitationTitle: "Some journeys deserve",
      invitationItalic: "more than a vehicle",
      invitationLead:
        "Speak with our concierge to compose a motoring experience tailored to your itinerary, your taste, and your timetable.",
      invitationCta: "Begin a Conversation",
    },
    fleet: {
      eyebrow: "The Collection",
      title: "Our",
      titleItalic: "fleet",
      lead:
        "Each motorcar is reserved exclusively for OBRENT clientele — maintained, prepared, and presented to a standard the marque itself would recognise.",
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
      eyebrow: "An Invitation",
      title: "Begin a",
      titleItalic: "conversation",
      lead:
        "Whether for an afternoon in the Alpes-Maritimes or a season abroad, our concierge will compose an engagement entirely to your requirements.",
      form: {
        salutation: "Salutation",
        salutationPlaceholder: "Mr. / Mme. / Dr.",
        name: "Full Name",
        email: "Email",
        phone: "Telephone",
        subject: "Subject",
        subjectPlaceholder: "A private weekend in Monaco",
        message: "Your Message",
        messagePlaceholder: "Kindly share the details of your enquiry…",
        submit: "Send",
        confidential: "Your enquiry is treated in strict confidence. We respond personally within the hour.",
      },
      direct: "Direct",
      ateliers: "Ateliers",
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
