import logo from "@/assets/obrent-logo.webp";

export function MaintenancePage() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#0A0A0A",
        color: "#F5F0E8",
        width: "100%",
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "3rem 1.5rem",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "576px",
          textAlign: "center",
        }}
      >
        <img src={logo} alt="OBRENT" style={{ height: "3.5rem", width: "auto", marginBottom: "2.5rem" }} />

        <div style={{ height: "1px", width: "96px", backgroundColor: "#C9A24A", marginBottom: "3rem" }} />

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
            color: "#F5F0E8",
            lineHeight: 1.15,
          }}
        >
          Wir arbeiten{" "}
          <span style={{ fontStyle: "italic", color: "rgba(201, 162, 74, 0.9)", fontWeight: 300 }}>
            für Sie.
          </span>
        </h1>

        <p
          style={{
            marginTop: "2rem",
            fontSize: "clamp(0.95rem, 2vw, 1.125rem)",
            color: "rgba(245, 240, 232, 0.6)",
            fontWeight: 300,
            lineHeight: 1.65,
            maxWidth: "420px",
          }}
        >
          Unsere Website wird gerade aktualisiert und ist in Kürze wieder
          für Sie verfügbar.
        </p>

        <div style={{ marginTop: "3.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }} aria-hidden>
          <span className="maintenance-dot" />
          <span className="maintenance-dot" style={{ animationDelay: "0.2s" }} />
          <span className="maintenance-dot" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      <footer
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "rgba(245, 240, 232, 0.4)",
          paddingTop: "3rem",
        }}
      >
        OBRENT — Luxus Autovermietung · Ludwigshafen am Rhein
      </footer>

      <style>{`
        .maintenance-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
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
