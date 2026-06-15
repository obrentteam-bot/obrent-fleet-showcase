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

const passengerOptions = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  value: String(n),
  label: { de: String(n), en: String(n) },
}));
const luggageOptions = [0, 1, 2, 3, 4, 5, 6].map((n) => ({
  value: String(n),
  label: { de: String(n), en: String(n) },
}));

const fields: FieldDef[] = [
  { type: "text", key: "name", label: { de: "Name", en: "Name" }, required: true },
  { type: "tel", key: "phone", label: { de: "Telefon", en: "Phone" }, required: true },
  { type: "email", key: "email", label: { de: "E-Mail", en: "Email" }, required: true, colSpan: 2 },
  { type: "date", key: "datum", label: { de: "Datum", en: "Date" } },
  { type: "time", key: "uhrzeit", label: { de: "Uhrzeit", en: "Time" } },
  {
    type: "text",
    key: "abholadresse",
    label: { de: "Abholadresse", en: "Pickup address" },
    placeholder: { de: "Straße, Hausnr., Ort", en: "Street, number, city" },
    colSpan: 2,
  },
  {
    type: "text",
    key: "zielort",
    label: { de: "Zielort", en: "Destination" },
    placeholder: { de: "Adresse oder Ort", en: "Address or city" },
    colSpan: 2,
  },
  {
    type: "select",
    key: "fahrttyp",
    label: { de: "Fahrttyp", en: "Trip type" },
    placeholder: { de: "Bitte wählen", en: "Please select" },
    options: [
      { value: "oneway", label: { de: "Einfache Fahrt", en: "One way" } },
      { value: "roundtrip", label: { de: "Hin- und Rückfahrt", en: "Round trip" } },
      { value: "hourly", label: { de: "Stundenweise", en: "Hourly" } },
      { value: "fullday", label: { de: "Ganztägig", en: "Full day" } },
    ],
  },
  {
    type: "select",
    key: "anlass",
    label: { de: "Anlass", en: "Occasion" },
    placeholder: { de: "Bitte wählen", en: "Please select" },
    options: [
      { value: "business", label: { de: "Business", en: "Business" } },
      { value: "airport", label: { de: "Flughafen", en: "Airport" } },
      { value: "wedding", label: { de: "Hochzeit", en: "Wedding" } },
      { value: "event", label: { de: "Event", en: "Event" } },
      { value: "other", label: { de: "Sonstiges", en: "Other" } },
    ],
  },
  {
    type: "select",
    key: "passagiere",
    label: { de: "Passagiere", en: "Passengers" },
    placeholder: { de: "Anzahl", en: "Count" },
    options: passengerOptions,
  },
  {
    type: "select",
    key: "gepaeck",
    label: { de: "Gepäck", en: "Luggage" },
    placeholder: { de: "Anzahl", en: "Count" },
    options: luggageOptions,
  },
  {
    type: "select",
    key: "sprache",
    label: { de: "Sprache des Chauffeurs", en: "Chauffeur language" },
    placeholder: { de: "Bitte wählen", en: "Please select" },
    options: [
      { value: "any", label: { de: "Egal", en: "Any" } },
      { value: "de", label: { de: "Deutsch", en: "German" } },
      { value: "en", label: { de: "Englisch", en: "English" } },
      { value: "tr", label: { de: "Türkisch", en: "Turkish" } },
    ],
  },
  {
    type: "text",
    key: "flugnummer",
    label: { de: "Flugnummer (optional)", en: "Flight number (optional)" },
    placeholder: { de: "z.B. LH 123", en: "e.g. LH 123" },
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
