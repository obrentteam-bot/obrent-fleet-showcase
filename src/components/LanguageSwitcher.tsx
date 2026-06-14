import { useI18n } from "@/lib/i18n";

type Variant = "default" | "header";

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
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => setLang("de")}
        aria-pressed={lang === "de"}
        aria-label="Deutsch"
        className={`${base} ${lang === "de" ? "text-gold" : inactive}`}
      >
        DE
      </button>
      <span className={`h-3 w-px ${divider}`} />
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        aria-label="English"
        className={`${base} ${lang === "en" ? "text-gold" : inactive}`}
      >
        EN
      </button>
    </div>
  );
}
