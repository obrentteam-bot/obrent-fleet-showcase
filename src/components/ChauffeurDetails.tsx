import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";


export type ChauffeurFieldsValue = {
  pickupAddress: string;
  destination: string;
  tripType: string;
  occasion: string;
  passengers: string;
  luggage: string;
  language: string;
  flight: string;
  notes: string;
};

export const emptyChauffeurFields: ChauffeurFieldsValue = {
  pickupAddress: "",
  destination: "",
  tripType: "",
  occasion: "",
  passengers: "1",
  luggage: "0",
  language: "any",
  flight: "",
  notes: "",
};

type Props = {
  value: ChauffeurFieldsValue;
  onChange: (next: ChauffeurFieldsValue) => void;
};

export function ChauffeurDetails({ value, onChange }: Props) {
  const { t } = useI18n();
  const c = t.contact.form.chauffeurFields;
  const set = <K extends keyof ChauffeurFieldsValue>(k: K, v: ChauffeurFieldsValue[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="md:col-span-2 mt-2 border-l-2 border-gold/40 pl-5 md:pl-7 py-5 bg-cream/[0.02]">
      <div className="text-[10px] tracking-[0.35em] uppercase text-gold mb-6">
        {c.heading}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="md:col-span-2">
          <label className="lux-label">{c.pickupAddress}</label>
          <input
            className="lux-input"
            type="text"
            maxLength={200}
            placeholder={c.pickupAddressPlaceholder}
            value={value.pickupAddress}
            onChange={(e) => set("pickupAddress", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="lux-label">{c.destination}</label>
          <input
            className="lux-input"
            type="text"
            maxLength={200}
            placeholder={c.destinationPlaceholder}
            value={value.destination}
            onChange={(e) => set("destination", e.target.value)}
          />
        </div>

        <div>
          <label className="lux-label">{c.tripType}</label>
          <Select value={value.tripType} onValueChange={(v) => set("tripType", v)}>
            <SelectTrigger className="lux-input h-auto">
              <SelectValue placeholder={c.tripTypePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oneway">{c.tripOneway}</SelectItem>
              <SelectItem value="roundtrip">{c.tripRound}</SelectItem>
              <SelectItem value="hourly">{c.tripHourly}</SelectItem>
              <SelectItem value="fullday">{c.tripFullday}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="lux-label">{c.occasion}</label>
          <Select value={value.occasion} onValueChange={(v) => set("occasion", v)}>
            <SelectTrigger className="lux-input h-auto">
              <SelectValue placeholder={c.occasionPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">{c.occBusiness}</SelectItem>
              <SelectItem value="airport">{c.occAirport}</SelectItem>
              <SelectItem value="wedding">{c.occWedding}</SelectItem>
              <SelectItem value="event">{c.occEvent}</SelectItem>
              <SelectItem value="other">{c.occOther}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="lux-label">{c.passengers}</label>
          <Select value={value.passengers} onValueChange={(v) => set("passengers", v)}>
            <SelectTrigger className="lux-input h-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="lux-label">{c.luggage}</label>
          <Select value={value.luggage} onValueChange={(v) => set("luggage", v)}>
            <SelectTrigger className="lux-input h-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="lux-label">{c.language}</label>
          <Select value={value.language} onValueChange={(v) => set("language", v)}>
            <SelectTrigger className="lux-input h-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{c.langAny}</SelectItem>
              <SelectItem value="de">{c.langDe}</SelectItem>
              <SelectItem value="en">{c.langEn}</SelectItem>
              <SelectItem value="tr">{c.langTr}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="lux-label">{c.flight}</label>
          <input
            className="lux-input"
            type="text"
            maxLength={20}
            placeholder={c.flightPlaceholder}
            value={value.flight}
            onChange={(e) => set("flight", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="lux-label">{c.notes}</label>
          <textarea
            className="lux-input resize-none"
            rows={3}
            maxLength={500}
            placeholder={c.notesPlaceholder}
            value={value.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
