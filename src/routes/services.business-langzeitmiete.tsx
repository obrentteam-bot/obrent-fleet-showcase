import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ServiceSubpage, type FieldDef } from "@/components/ServiceSubpage";
import bg from "@/assets/hero-fleet.jpg";

export const Route = createFileRoute("/services/business-langzeitmiete")({
  head: () => ({
    meta: [
      { title: "Business Langzeitmiete — OBRENT" },
      { name: "description", content: "Maßgeschneiderte Mobilitätslösungen für Unternehmen und Langzeitprojekte." },
    ],
  }),
  component: BusinessLongTermPage,
});

const fields: FieldDef[] = [
  { type: "text", key: "company", label: { de: "Firmenname", en: "Company name" }, required: true },
  { type: "text", key: "contact", label: { de: "Ansprechpartner", en: "Contact person" }, required: true },
  { type: "tel", key: "phone", label: { de: "Telefon", en: "Phone" }, required: true },
  { type: "email", key: "email", label: { de: "E-Mail", en: "Email" }, required: true },
  { type: "text", key: "vehicle", label: { de: "Gewünschtes Fahrzeug", en: "Desired vehicle" }, colSpan: 2 },
  {
    type: "select",
    key: "duration",
    label: { de: "Mietdauer", en: "Rental duration" },
    placeholder: { de: "Bitte wählen", en: "Please select" },
    options: [
      { value: "1m", label: { de: "1 Monat", en: "1 month" } },
      { value: "3m", label: { de: "3 Monate", en: "3 months" } },
      { value: "6m", label: { de: "6 Monate", en: "6 months" } },
      { value: "12m", label: { de: "12 Monate", en: "12 months" } },
      { value: "custom", label: { de: "Individuell", en: "Custom" } },
    ],
  },
  { type: "number", key: "quantity", label: { de: "Anzahl Fahrzeuge", en: "Number of vehicles" } },
  { type: "textarea", key: "message", label: { de: "Nachricht", en: "Message" }, colSpan: 2 },
];

function BusinessLongTermPage() {
  return (
    <SiteLayout>
      <ServiceSubpage
        serviceKey="business-langzeitmiete"
        bgImage={bg}
        fields={fields}
        submitLabel={{ de: "Langzeitmiete anfragen", en: "Request long-term rental" }}
        copy={{
          de: {
            crumb: "Business Langzeitmiete",
            servicesLabel: "Services",
            title: "Business Langzeitmiete",
            subline: "Maßgeschneiderte Mobilitätslösungen für Unternehmen und Langzeitprojekte.",
            whatTitle: "Ideal für",
            whatItems: [
              "Geschäftsführer & Vorstände",
              "Projektteams",
              "Firmenflotten",
              "Temporäre Mitarbeiter",
              "Messeauftritte & Events",
            ],
            whyTagline: "Flexibel. Planbar. Exklusiv.",
            whyCards: [
              { title: "Flexibel", body: "Laufzeiten und Fahrzeuge passen sich Ihrem Projekt an — nicht umgekehrt." },
              { title: "Planbar", body: "Transparente Konditionen, klare Monatsraten, keine versteckten Kosten." },
              { title: "Exklusiv", body: "Premium-Fahrzeuge, persönlich betreut von einem festen Ansprechpartner." },
            ],
            formEyebrow: "Anfrage",
            formTitle: "Langzeitmiete",
            formItalic: "anfragen",
            formLead: "Wir melden uns innerhalb weniger Stunden persönlich bei Ihnen.",
            successMsg: "Vielen Dank! Ihre Anfrage wurde übermittelt.",
            back: "Zurück zu Services",
          },
          en: {
            crumb: "Business Long-Term Rental",
            servicesLabel: "Services",
            title: "Business Long-Term Rental",
            subline: "Tailored mobility solutions for companies and long-term projects.",
            whatTitle: "Ideal for",
            whatItems: [
              "Executives & board members",
              "Project teams",
              "Corporate fleets",
              "Temporary staff",
              "Trade shows & events",
            ],
            whyTagline: "Flexible. Predictable. Exclusive.",
            whyCards: [
              { title: "Flexible", body: "Terms and vehicles adapt to your project — not the other way around." },
              { title: "Predictable", body: "Transparent terms, clear monthly rates, no hidden costs." },
              { title: "Exclusive", body: "Premium vehicles, personally managed by a dedicated point of contact." },
            ],
            formEyebrow: "Request",
            formTitle: "Request",
            formItalic: "long-term rental",
            formLead: "We will personally get back to you within a few hours.",
            successMsg: "Thank you! Your request has been submitted.",
            back: "Back to Services",
          },
        }}
      />
    </SiteLayout>
  );
}
