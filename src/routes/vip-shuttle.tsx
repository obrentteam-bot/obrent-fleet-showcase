import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ServiceSubpage, type FieldDef } from "@/components/ServiceSubpage";
import {
  Plane,
  Hotel,
  Calendar,
  Briefcase,
  Sparkles,
  Route as RouteIcon,
  Clock,
  ShieldCheck,
  Sofa,
} from "lucide-react";
import bg from "@/assets/services-vip-shuttle.jpg";

export const Route = createFileRoute("/vip-shuttle")({
  head: () => ({
    meta: [
      { title: "VIP Shuttle — OBRENT" },
      {
        name: "description",
        content:
          "Diskreter VIP Shuttle für Flughafen, Hotel, Event und Geschäftstermine — pünktlich und komfortabel.",
      },
    ],
  }),
  component: VipShuttlePage,
});

const fields: FieldDef[] = [
  { type: "text", key: "name", label: { de: "Name", en: "Name" }, required: true },
  { type: "tel", key: "phone", label: { de: "Telefon", en: "Phone" }, required: true },
  { type: "email", key: "email", label: { de: "E-Mail", en: "Email" }, required: true, colSpan: 2 },
  { type: "date", key: "pickupDate", label: { de: "Abholdatum", en: "Pick-up date" } },
  { type: "time", key: "pickupTime", label: { de: "Abholzeit", en: "Pick-up time" } },
  { type: "text", key: "pickup", label: { de: "Abholort", en: "Pick-up location" } },
  { type: "text", key: "destination", label: { de: "Zielort", en: "Destination" } },
  { type: "number", key: "passengers", label: { de: "Anzahl Personen", en: "Number of passengers" }, colSpan: 2 },
  { type: "textarea", key: "message", label: { de: "Nachricht", en: "Message" }, colSpan: 2 },
];

function VipShuttlePage() {
  return (
    <SiteLayout>
      <ServiceSubpage
        serviceTitleEn="VIP Shuttle"
        bgImage={bg}
        hero={{
          eyebrow: { de: "VIP Shuttle", en: "VIP Shuttle" },
          headline: {
            de: "Ankommen wie es Ihnen gebührt.",
            en: "Arrive the way you deserve.",
          },
          subline: {
            de: "Diskret, pünktlich und komfortabel — für Flughäfen, Hotels, Events und Geschäftstermine.",
            en: "Discreet, punctual and comfortable — for airports, hotels, events and business meetings.",
          },
          cta: { de: "Jetzt anfragen", en: "Request now" },
        }}
        leistungen={{
          title: { de: "Unsere Leistungen", en: "Our services" },
          cards: [
            { Icon: Plane, label: { de: "Flughafentransfer", en: "Airport transfer" } },
            { Icon: Hotel, label: { de: "Hoteltransfer", en: "Hotel transfer" } },
            { Icon: Calendar, label: { de: "Event-Transfer", en: "Event transfer" } },
            { Icon: Briefcase, label: { de: "Geschäftsreisen", en: "Business travel" } },
            { Icon: Sparkles, label: { de: "Sonderanlässe", en: "Special occasions" } },
            { Icon: RouteIcon, label: { de: "Fernstrecken", en: "Long-distance" } },
          ],
        }}
        why={{
          title: {
            de: "Pünktlich. Diskret. Komfortabel.",
            en: "Punctual. Discreet. Comfortable.",
          },
          cards: [
            {
              Icon: Clock,
              title: { de: "Pünktlich", en: "Punctual" },
              body: {
                de: "Wir sind immer zur Stelle — geplant mit Puffer, abgesichert in Echtzeit.",
                en: "We are always on time — planned with buffer, monitored in real time.",
              },
            },
            {
              Icon: ShieldCheck,
              title: { de: "Diskret", en: "Discreet" },
              body: {
                de: "Ihre Privatsphäre hat Priorität. Geschulte Fahrer, neutrale Fahrzeuge.",
                en: "Your privacy has priority. Trained drivers, neutral vehicles.",
              },
            },
            {
              Icon: Sofa,
              title: { de: "Komfortabel", en: "Comfortable" },
              body: {
                de: "Erstklassige Fahrzeuge, entspanntes Reisen — Wasser, Klima, ruhiger Innenraum.",
                en: "First-class vehicles for relaxed travel — water, climate, quiet interior.",
              },
            },
          ],
        }}
        form={{
          title: { de: "Shuttle anfragen", en: "Request shuttle" },
          submit: { de: "Anfrage senden", en: "Send request" },
          fields,
        }}
      />
    </SiteLayout>
  );
}
