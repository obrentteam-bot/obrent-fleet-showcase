import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ServiceSubpage, type FieldDef } from "@/components/ServiceSubpage";
import { useVehicles } from "@/lib/useVehicles";
import {
  Briefcase,
  Plane,
  Calendar,
  Car,
  Users,
  Clock,
  Award,
  Zap,
  Gem,
} from "lucide-react";
import bg from "@/assets/services-chauffeur.jpg";

export const Route = createFileRoute("/chauffeur-service")({
  head: () => ({
    meta: [
      { title: "Chauffeur Service — OBRENT" },
      {
        name: "description",
        content:
          "Professionelle Chauffeure für Business, Events und private Fahrten — diskret und stilvoll.",
      },
    ],
  }),
  component: ChauffeurServicePage,
});

const fields: FieldDef[] = [
  { type: "text", key: "name", label: { de: "Name", en: "Name" }, required: true },
  { type: "tel", key: "phone", label: { de: "Telefon", en: "Phone" }, required: true },
  { type: "email", key: "email", label: { de: "E-Mail", en: "Email" }, required: true, colSpan: 2 },
  { type: "date", key: "datum", label: { de: "Datum", en: "Date" } },
  { type: "time", key: "uhrzeit", label: { de: "Uhrzeit", en: "Time" } },
  {
    type: "text",
    key: "einsatzort",
    label: { de: "Einsatzort / Route", en: "Location / Route" },
    colSpan: 2,
  },
  {
    type: "select",
    key: "fahrzeugwunsch",
    colSpan: 2,
    label: { de: "Fahrzeugwunsch", en: "Preferred vehicle" },
    placeholder: { de: "Bitte wählen", en: "Please select" },
    // Populated dynamically from Supabase vehicles at runtime.
    options: [],
  },
  {
    type: "text",
    key: "dauer",
    label: { de: "Ungefähre Dauer", en: "Approx. duration" },
    placeholder: { de: "z.B. 4 Stunden", en: "e.g. 4 hours" },
    colSpan: 2,
  },
  { type: "textarea", key: "message", label: { de: "Nachricht", en: "Message" }, colSpan: 2 },
];

function ChauffeurServicePage() {
  const { vehicles } = useVehicles();
  const dynamicOptions = useMemo(
    () => ({
      fahrzeugwunsch: vehicles.map((v) => {
        const fullName = `${v.marque} ${v.name}`.trim();
        return { value: fullName, label: { de: fullName, en: fullName } };
      }),
    }),
    [vehicles],
  );

  return (
    <SiteLayout>
      <ServiceSubpage
        serviceTitleEn="Chauffeur Service"
        serviceType="chauffeur"
        bgImage={bg}
        dynamicOptions={dynamicOptions}
        hero={{
          eyebrow: { de: "Chauffeur Service", en: "Chauffeur Service" },
          headline: {
            de: "Ihr persönlicher Chauffeur. Wann immer Sie ihn brauchen.",
            en: "Your personal chauffeur. Whenever you need one.",
          },
          subline: {
            de: "Professionell, zuverlässig und diskret — für Business, Events und private Fahrten.",
            en: "Professional, reliable and discreet — for business, events and private drives.",
          },
          cta: { de: "Jetzt anfragen", en: "Request now" },
        }}
        leistungen={{
          title: { de: "Unsere Leistungen", en: "Our services" },
          cards: [
            { Icon: Briefcase, label: { de: "Business-Termine", en: "Business appointments" } },
            { Icon: Plane, label: { de: "Flughafentransfers", en: "Airport transfers" } },
            { Icon: Calendar, label: { de: "Veranstaltungen", en: "Events" } },
            { Icon: Car, label: { de: "Private Fahrten", en: "Private drives" } },
            { Icon: Users, label: { de: "Kundenbetreuung", en: "Client hospitality" } },
            { Icon: Clock, label: { de: "Tagesbuchungen", en: "Day bookings" } },
          ],
        }}
        why={{
          title: {
            de: "Professionell. Flexibel. Stilvoll.",
            en: "Professional. Flexible. Stylish.",
          },
          cards: [
            {
              Icon: Award,
              title: { de: "Professionell", en: "Professional" },
              body: {
                de: "Erfahrene, diskrete Fahrer mit Sinn für Etikette, Sprache und Service.",
                en: "Experienced, discreet drivers with a sense for etiquette, language and service.",
              },
            },
            {
              Icon: Zap,
              title: { de: "Flexibel", en: "Flexible" },
              body: {
                de: "Kurzfristig buchbar — auch bei Planänderungen bleiben wir an Ihrer Seite.",
                en: "Available at short notice — we stay by your side even when plans change.",
              },
            },
            {
              Icon: Gem,
              title: { de: "Stilvoll", en: "Stylish" },
              body: {
                de: "Immer im richtigen Fahrzeug — passend zu Anlass, Auftritt und Erwartung.",
                en: "Always in the right vehicle — fitting occasion, presence and expectation.",
              },
            },
          ],
        }}
        form={{
          title: { de: "Chauffeur anfragen", en: "Request chauffeur" },
          submit: { de: "Anfrage senden", en: "Send request" },
          fields,
        }}
      />
    </SiteLayout>
  );
}
