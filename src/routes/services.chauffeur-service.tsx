import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ServiceSubpage, type FieldDef } from "@/components/ServiceSubpage";
import bg from "@/assets/hero-fleet.jpg";

export const Route = createFileRoute("/services/chauffeur-service")({
  head: () => ({
    meta: [
      { title: "Chauffeur Service — OBRENT" },
      { name: "description", content: "Professionelle Chauffeure begleiten Sie sicher und stilvoll an Ihr Ziel." },
    ],
  }),
  component: ChauffeurServicePage,
});

const fields: FieldDef[] = [
  { type: "text", key: "name", label: { de: "Name", en: "Name" }, required: true },
  { type: "tel", key: "phone", label: { de: "Telefon", en: "Phone" }, required: true },
  { type: "email", key: "email", label: { de: "E-Mail", en: "Email" }, required: true, colSpan: 2 },
  { type: "datetime-local", key: "startAt", label: { de: "Datum & Uhrzeit", en: "Date & time" } },
  { type: "text", key: "duration", label: { de: "Dauer des Einsatzes", en: "Duration" }, placeholder: { de: "z.B. 4 Stunden", en: "e.g. 4 hours" } },
  { type: "text", key: "route", label: { de: "Einsatzort / Route", en: "Location / Route" }, colSpan: 2 },
  {
    type: "select",
    key: "vehicle",
    colSpan: 2,
    label: { de: "Fahrzeugwunsch", en: "Preferred vehicle" },
    placeholder: { de: "Bitte wählen", en: "Please select" },
    options: [
      { value: "porsche-cayenne", label: { de: "Porsche Cayenne", en: "Porsche Cayenne" } },
      { value: "bmw-x5", label: { de: "BMW X5", en: "BMW X5" } },
      { value: "audi-rs6", label: { de: "Audi RS6", en: "Audi RS6" } },
      { value: "mercedes-s", label: { de: "Mercedes S-Klasse", en: "Mercedes S-Class" } },
      { value: "other", label: { de: "Andere / nach Absprache", en: "Other / on request" } },
    ],
  },
  { type: "textarea", key: "message", label: { de: "Nachricht", en: "Message" }, colSpan: 2 },
];

function ChauffeurServicePage() {
  return (
    <SiteLayout>
      <ServiceSubpage
        serviceKey="chauffeur-service"
        bgImage={bg}
        fields={fields}
        submitLabel={{ de: "Chauffeur anfragen", en: "Request chauffeur" }}
        copy={{
          de: {
            crumb: "Chauffeur Service",
            servicesLabel: "Services",
            title: "Chauffeur Service",
            subline: "Professionelle Chauffeure begleiten Sie sicher und stilvoll an Ihr Ziel.",
            whatTitle: "Einsatzbereiche",
            whatItems: ["Private Fahrten", "Business-Termine", "Veranstaltungen", "Flughafentransfers", "Individuelle Einsätze"],
            whyTagline: "Professionell. Zuverlässig. Diskret.",
            whyCards: [
              { title: "Professionell", body: "Erfahrene Chauffeure mit Sinn für Etikette, Sprache und Service." },
              { title: "Zuverlässig", body: "Pünktlich, vorbereitet und durchdacht — auch bei kurzfristigen Änderungen." },
              { title: "Diskret", body: "Vertrauliche Gespräche bleiben im Fahrzeug. Was Sie sagen, bleibt bei Ihnen." },
            ],
            formEyebrow: "Anfrage",
            formTitle: "Chauffeur",
            formItalic: "anfragen",
            formLead: "Wir melden uns innerhalb weniger Stunden persönlich bei Ihnen.",
            successMsg: "Vielen Dank! Ihre Anfrage wurde übermittelt.",
            back: "Zurück zu Services",
          },
          en: {
            crumb: "Chauffeur Service",
            servicesLabel: "Services",
            title: "Chauffeur Service",
            subline: "Professional chauffeurs drive you safely and in style to your destination.",
            whatTitle: "Areas of service",
            whatItems: ["Private drives", "Business appointments", "Events", "Airport transfers", "Bespoke assignments"],
            whyTagline: "Professional. Reliable. Discreet.",
            whyCards: [
              { title: "Professional", body: "Experienced chauffeurs with a sense for etiquette, language and service." },
              { title: "Reliable", body: "Punctual, prepared and considered — even when plans change at short notice." },
              { title: "Discreet", body: "Confidential conversations stay in the car. What you say stays with you." },
            ],
            formEyebrow: "Request",
            formTitle: "Request a",
            formItalic: "chauffeur",
            formLead: "We will personally get back to you within a few hours.",
            successMsg: "Thank you! Your request has been submitted.",
            back: "Back to Services",
          },
        }}
      />
    </SiteLayout>
  );
}
