import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const base = "text-[0.7rem] tracking-[0.28em] uppercase transition-colors px-1";
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => setLang("de")}
        aria-pressed={lang === "de"}
        aria-label="Deutsch"
        className={`${base} ${lang === "de" ? "text-gold" : "text-cream/45 hover:text-cream"}`}
      >
        DE
      </button>
      <span className="h-3 w-px bg-cream/20" />
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        aria-label="English"
        className={`${base} ${lang === "en" ? "text-gold" : "text-cream/45 hover:text-cream"}`}
      >
        EN
      </button>
    </div>
  );
}
