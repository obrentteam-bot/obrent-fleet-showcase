import { useMaintenance } from "@/lib/useMaintenance";
import { supabase } from "@/lib/supabase";

const PHONE = "4915569459633";
const HREF = `https://wa.me/${PHONE}`;

/** Fire-and-forget click tracking — never blocks or breaks the link. */
function trackClick() {
  try {
    void supabase
      .from("analytics_events")
      .insert({
        event_type: "whatsapp_click",
        metadata: { page: typeof window !== "undefined" ? window.location.pathname : null },
      })
      .then(() => undefined, () => undefined);
  } catch {
    // ignore
  }
}

export function WhatsAppFAB() {
  const { enabled: maintenance } = useMaintenance();
  if (maintenance) return null;


  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Kontakt"
      title="WhatsApp Kontakt"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: "9999px",
        background: "#25D366",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        transition: "transform 0.2s ease",
      }}
      onClick={trackClick}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <svg width="30" height="30" viewBox="0 0 32 32" fill="#fff" aria-hidden="true">
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 01-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 01-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.43 3.196 4.422 4.3.516.286 2.092.13 2.508-.155.327-.222.602-.624.802-1.094.05-.118.075-.244.075-.37 0-.265-.13-.456-.243-.527-.13-.07-.21-.114-.27-.114-.16 0-.296-.06-.46-.06zM16.16 4.79c-6.45 0-11.7 5.25-11.7 11.7 0 2.07.55 4.1 1.59 5.88L4.43 28l5.84-1.6c1.71.94 3.64 1.44 5.61 1.44h.01c6.44 0 11.68-5.24 11.69-11.69 0-3.12-1.21-6.06-3.42-8.27-2.21-2.22-5.15-3.44-8.28-3.44zm.01 21.31h-.01c-1.76 0-3.49-.47-5.01-1.36l-.36-.21-3.71 1.02 1.04-3.64-.23-.37c-.97-1.55-1.49-3.36-1.49-5.21 0-5.4 4.39-9.78 9.78-9.78 2.61 0 5.07 1.02 6.92 2.87 1.85 1.86 2.86 4.32 2.86 6.94-.01 5.4-4.4 9.78-9.79 9.78z" />
      </svg>
    </a>
  );
}
