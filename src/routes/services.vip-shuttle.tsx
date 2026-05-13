import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ServiceSubpage, type FieldDef } from "@/components/ServiceSubpage";
import bg from "@/assets/hero-fleet.jpg";

export const Route = createFileRoute("/services/vip-shuttle")({
  head: () => ({
    meta: [
      { title: "VIP Shuttle — OBRENT" },
      { name: "description", content: "Exklusiver Transfer-Service für höchste Ansprüche und diskretes Reisen." },
    ],
  }),
  component: VipShuttlePage,
});

const fields: FieldDef[] = [
  { type: "text", key: "name", label: { de: "Name", en: "Name" }, required: true },
  { type: "tel", key: "phone", label: { de: "Telefon", en: "Phone" }, required: true },
  { type: "email", key: "email", label: { de: "E-Mail", en: "Email" }, required: true, colSpan: 2 },
  { type: "datetime-local", key: "pickupAt", label: { de: "Abholdatum & Uhrzeit", en: "Pick-up date & time" } },
  { type: "number", key: "passengers", label: { de: "Anzahl Personen", en: "Number of passengers" } },
  { type: "text", key: "pickup", label: { de: "Abholort", en: "Pick-up location" } },
  { type: "text", key: "destination", label: { de: "Zielort", en: "Destination" } },
  { type: "textarea", key: "message", label: { de: "Nachricht", en: "Message" }, colSpan: 2 },
];

function VipShuttlePage() {
  return (
    <SiteLayout>
      <ServiceSubpage
        serviceKey="vip-shuttle"
        bgImage={bg}
        fields={fields}
        submitLabel={{ de: "Shuttle anfragen", en: "Request shuttle" }}
        copy={{
          de: {
            crumb: "VIP Shuttle",
            servicesLabel: "Services",
            title: "VIP Shuttle",
            subline: "Exklusiver Transfer-Service für höchste Ansprüche und diskretes Reisen.",
            whatTitle: "Was inbegriffen ist",
            whatItems: ["Flughafentransfers", "Hoteltransfers", "Event-Transfers", "Geschäftsreisen", "Sonderanlässe"],
            whyTagline: "Pünktlich. Diskret. Komfortabel.",
            whyCards: [
              { title: "Pünktlich", body: "Wir planen jede Fahrt mit Puffer. Sie kommen entspannt und planmäßig an." },
              { title: "Diskret", body: "Vertraulichkeit ist Standard. Geschulte Fahrer, neutrale Fahrzeuge, keine Details nach außen." },
              { title: "Komfortabel", body: "Premium-Fahrzeuge mit Wasser, Klimakomfort und ruhigem Innenraum." },
            ],
            formEyebrow: "Anfrage",
            formTitle: "Shuttle",
            formItalic: "anfragen",
            formLead: "Wir melden uns innerhalb weniger Stunden persönlich bei Ihnen.",
            successMsg: "Vielen Dank! Ihre Anfrage wurde übermittelt.",
            back: "Zurück zu Services",
          },
          en: {
            crumb: "VIP Shuttle",
            servicesLabel: "Services",
            title: "VIP Shuttle",
            subline: "Exclusive transfer service for the highest standards and discreet travel.",
            whatTitle: "What is included",
            whatItems: ["Airport transfers", "Hotel transfers", "Event transfers", "Business travel", "Special occasions"],
            whyTagline: "Punctual. Discreet. Comfortable.",
            whyCards: [
              { title: "Punctual", body: "Every ride is planned with buffer time. You arrive relaxed and on schedule." },
              { title: "Discreet", body: "Confidentiality is standard. Trained drivers, neutral vehicles, nothing leaves the car." },
              { title: "Comfortable", body: "Premium vehicles with water, climate comfort and a quiet interior." },
            ],
            formEyebrow: "Request",
            formTitle: "Request a",
            formItalic: "shuttle",
            formLead: "We will personally get back to you within a few hours.",
            successMsg: "Thank you! Your request has been submitted.",
            back: "Back to Services",
          },
        }}
      />
    </SiteLayout>
  );
}
