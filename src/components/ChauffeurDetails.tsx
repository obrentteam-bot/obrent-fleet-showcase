import { useI18n } from "@/lib/i18n";

export function ChauffeurDetails() {
  const { t } = useI18n();
  const f = t.contact.form;
  return (
    <div className="md:col-span-2 mt-2 border-l-2 border-gold/40 pl-5 py-4 bg-cream/[0.02]">
      <div className="text-[10px] tracking-[0.35em] uppercase text-gold mb-5">
        {f.chauffeurDetails}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label className="lux-label">{f.pickupTime}</label>
          <input className="lux-input [color-scheme:dark]" type="time" />
        </div>
        <div>
          <label className="lux-label">{f.returnTime}</label>
          <input className="lux-input [color-scheme:dark]" type="time" />
        </div>
      </div>
    </div>
  );
}
