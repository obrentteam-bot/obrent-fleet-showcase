import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ServiceSubpage, type FieldDef } from "@/components/ServiceSubpage";
import { useVehicles } from "@/lib/useVehicles";
import {
  Crown,
  Users,
  Building2,
  Megaphone,
  UserPlus,
  CalendarRange,
  Zap,
  ClipboardCheck,
  Gem,
} from "lucide-react";
import bg from "@/assets/services-longterm.jpg";

export const Route = createFileRoute("/business-langzeitmiete")({
  head: () => ({
    meta: [
      { title: "Business Langzeitmiete — OBRENT" },
      {
        name: "description",
        content:
          "Maßgeschneiderte Langzeitmiete für Geschäftsführer, Projektteams und Firmenflotten.",
      },
    ],
  }),
  component: BusinessLongTermPage,
});

const fields: FieldDef[] = [
  { type: "text", key: "firmenname", label: { de: "Firmenname", en: "Company name" }, required: true },
  { type: "text", key: "ansprechpartner", label: { de: "Ansprechpartner", en: "Contact person" }, required: true },
  { type: "tel", key: "phone", label: { de: "Telefon", en: "Phone" }, required: true },
  { type: "email", key: "email", label: { de: "E-Mail", en: "Email" }, required: true },
  {
    type: "select",
    key: "fahrzeug",
    colSpan: 2,
    label: { de: "Gewünschtes Fahrzeug", en: "Desired vehicle" },
    placeholder: { de: "Bitte wählen", en: "Please select" },
    // Populated dynamically from Supabase vehicles at runtime.
    options: [],
  },
  {
    type: "select",
    key: "mietdauer",
    label: { de: "Mietdauer", en: "Rental duration" },
    placeholder: { de: "Bitte wählen", en: "Please select" },
    options: [
      { value: "1m", label: { de: "1 Monat", en: "1 month" } },
      { value: "2-3m", label: { de: "2–3 Monate", en: "2–3 months" } },
      { value: "4-6m", label: { de: "4–6 Monate", en: "4–6 months" } },
      { value: "7-12m", label: { de: "7–12 Monate", en: "7–12 months" } },
      { value: "12m+", label: { de: "Über 12 Monate", en: "Over 12 months" } },
    ],
  },
  { type: "number", key: "anzahl_fahrzeuge", label: { de: "Anzahl Fahrzeuge", en: "Number of vehicles" } },
  { type: "textarea", key: "message", label: { de: "Nachricht", en: "Message" }, colSpan: 2 },
];

function BusinessLongTermPage() {
  const { vehicles } = useVehicles();
  const dynamicOptions = useMemo(
    () => ({
      fahrzeug: vehicles.map((v) => {
        const fullName = `${v.marque} ${v.name}`.trim();
        return { value: fullName, label: { de: fullName, en: fullName } };
      }),
    }),
    [vehicles],
  );

  return (
    <SiteLayout>
      <ServiceSubpage
        serviceTitleEn="Business Langzeitmiete"
        serviceType="langzeitmiete"
        bgImage={bg}
        dynamicOptions={dynamicOptions}
        contactFieldKeys={["ansprechpartner", "email", "phone"]}
        hero={{
          eyebrow: { de: "Business Langzeitmiete", en: "Business Long-Term Rental" },
          headline: {
            de: "Mobilität für Ihr Unternehmen. Flexibel und zuverlässig.",
            en: "Mobility for your company. Flexible and reliable.",
          },
          subline: {
            de: "Langzeitmietlösungen für Geschäftsführer, Projektteams und Firmenflotten — individuell und diskret.",
            en: "Long-term rental solutions for executives, project teams and corporate fleets — bespoke and discreet.",
          },
          cta: { de: "Jetzt anfragen", en: "Request now" },
        }}
        leistungen={{
          title: { de: "Unsere Leistungen", en: "Our services" },
          cards: [
            { Icon: Crown, label: { de: "Geschäftsführer & Vorstände", en: "Executives & board members" } },
            { Icon: Users, label: { de: "Projektteams", en: "Project teams" } },
            { Icon: Building2, label: { de: "Firmenflotten", en: "Corporate fleets" } },
            { Icon: Megaphone, label: { de: "Messeauftritte", en: "Trade show appearances" } },
            { Icon: UserPlus, label: { de: "Temporäre Mitarbeiter", en: "Temporary staff" } },
            { Icon: CalendarRange, label: { de: "Langzeitprojekte", en: "Long-term projects" } },
          ],
        }}
        why={{
          title: {
            de: "Flexibel. Planbar. Exklusiv.",
            en: "Flexible. Predictable. Exclusive.",
          },
          cards: [
            {
              Icon: Zap,
              title: { de: "Flexibel", en: "Flexible" },
              body: {
                de: "Mietdauer nach Ihren Wünschen — von einem Monat bis individuell verlängerbar.",
                en: "Rental duration to your needs — from one month, extendable as required.",
              },
            },
            {
              Icon: ClipboardCheck,
              title: { de: "Planbar", en: "Predictable" },
              body: {
                de: "Feste Konditionen, keine Überraschungen. Eine klare Monatsrate, transparent kalkuliert.",
                en: "Fixed terms, no surprises. A clear monthly rate, transparently calculated.",
              },
            },
            {
              Icon: Gem,
              title: { de: "Exklusiv", en: "Exclusive" },
              body: {
                de: "Premium Fahrzeuge, persönlicher Ansprechpartner — wir betreuen Ihre Flotte direkt.",
                en: "Premium vehicles, dedicated contact — we manage your fleet personally.",
              },
            },
          ],
        }}
        form={{
          title: { de: "Langzeitmiete anfragen", en: "Request long-term rental" },
          submit: { de: "Anfrage senden", en: "Send request" },
          fields,
        }}
      />
    </SiteLayout>
  );
}
