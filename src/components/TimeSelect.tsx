import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIME_OPTIONS: string[] = (() => {
  const out: string[] = [];
  for (let h = 6; h <= 23; h++) {
    const hh = String(h).padStart(2, "0");
    out.push(`${hh}:00`);
    if (h < 23) out.push(`${hh}:30`);
  }
  return out;
})();

type Props = {
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
  placeholder?: string;
};

export function TimeSelect({ value, onChange, ariaLabel, placeholder }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="lux-input h-auto mt-3" aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder ?? "--:--"} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {TIME_OPTIONS.map((t) => (
          <SelectItem key={t} value={t}>
            {t}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
