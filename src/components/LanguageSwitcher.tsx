import { useI18n, type Lang } from "@/lib/i18n";

type Variant = "default" | "header";

const LANGS: { code: Lang; label: string; aria: string }[] = [
  { code: "de", label: "DE", aria: "Deutsch" },
  { code: "en", label: "EN", aria: "English" },
  { code: "fr", label: "FR", aria: "Français" },
];

export function LanguageSwitcher({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: Variant;
}) {
  const { lang, setLang } = useI18n();
  const base = "text-[0.7rem] tracking-[0.28em] uppercase transition-colors px-1";

  const inactive =
    variant === "header"
      ? "text-foreground/55 hover:text-foreground"
      : "text-cream/45 hover:text-cream";
  const divider =
    variant === "header" ? "bg-foreground/20" : "bg-cream/20";

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      {LANGS.map((l, i) => (
        <span key={l.code} className="inline-flex items-center gap-2">
          {i > 0 && <span className={`h-3 w-px ${divider}`} />}
          <button
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            aria-label={l.aria}
            className={`${base} ${lang === l.code ? "text-gold" : inactive}`}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
