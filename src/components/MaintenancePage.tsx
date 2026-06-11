import logo from "@/assets/obrent-logo.png";

export function MaintenancePage() {
  return (
    <div
      style={{ backgroundColor: "#0A0A0A" }}
      className="min-h-screen w-full flex flex-col items-center justify-between px-6 py-12 text-cream"
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl text-center">
        <img src={logo} alt="OBRENT" className="h-14 w-auto mb-10" />

        <div className="h-px w-24 bg-gold mb-12" />

        <h1 className="font-display text-4xl md:text-6xl text-cream leading-tight">
          Wir arbeiten <span className="italic text-gold/90 font-light">für Sie.</span>
        </h1>

        <p className="mt-8 text-base md:text-lg text-cream/60 font-light leading-relaxed max-w-md">
          Unsere Website wird gerade aktualisiert und ist in Kürze wieder
          für Sie verfügbar.
        </p>

        <div className="mt-14 flex items-center justify-center gap-3" aria-hidden>
          <span className="maintenance-dot" />
          <span className="maintenance-dot" style={{ animationDelay: "0.2s" }} />
          <span className="maintenance-dot" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      <footer className="text-[0.65rem] tracking-[0.32em] uppercase text-cream/40 pt-12">
        OBRENT — Luxus Autovermietung Mannheim
      </footer>

      <style>{`
        .maintenance-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: hsl(var(--gold, 42 60% 52%));
          background-color: #C9A24A;
          opacity: 0.35;
          animation: maintenance-pulse 1.4s ease-in-out infinite;
        }
        @keyframes maintenance-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
