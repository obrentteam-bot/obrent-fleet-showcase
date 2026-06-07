import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import logo from "@/assets/obrent-logo.png";

export const Route = createFileRoute("/admin/ai-editor")({
  head: () => ({
    meta: [
      { title: "AI Editor — OBRENT Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AiEditorPage,
});

function AiEditorPage() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session || !isAdmin) navigate({ to: "/admin" });
  }, [session, isAdmin, loading, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-onyx text-cream/40 text-xs tracking-[0.3em] uppercase">
        Lade…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx text-cream">
      <header className="border-b border-border px-6 md:px-12 py-5 flex items-center justify-between gap-6 flex-wrap">
        <Link to="/admin/dashboard" className="flex items-center gap-4">
          <img src={logo} alt="OBRENT" className="h-10 w-auto" />
          <div>
            <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold/70">
              OBRENT
            </div>
            <div className="font-display text-xl">AI Editor</div>
          </div>
        </Link>
        <Link
          to="/admin/dashboard"
          className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold border border-border px-4 py-2"
        >
          ← Dashboard
        </Link>
      </header>

      <main className="px-6 md:px-12 py-16 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <span className="gold-rule" />
          <span className="eyebrow">Phase 1 · Scaffold</span>
        </div>
        <h1 className="font-display text-5xl text-cream mb-6">
          AI Editor
        </h1>
        <p className="text-cream/60 font-light leading-relaxed max-w-2xl mb-12">
          Diese Oberfläche ist noch leer. Backend-Tabellen
          (<code className="text-gold/80">ai_editor_logs</code>,{" "}
          <code className="text-gold/80">content_revisions</code>) sind
          eingerichtet, Auth & Admin-Guards stehen. Chat-UI und
          OpenAI-Integration folgen in den nächsten Phasen.
        </p>

        <div className="border border-border bg-jet/40 p-8">
          <div className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/45 mb-3">
            Status
          </div>
          <ul className="space-y-2 text-sm text-cream/80">
            <li>✓ Legacy Supabase server client</li>
            <li>✓ Legacy auth middleware</li>
            <li>✓ requireAdmin helper</li>
            <li>✓ Route /admin/ai-editor</li>
            <li className="text-cream/40">○ OpenAI integration</li>
            <li className="text-cream/40">○ Chat UI</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
