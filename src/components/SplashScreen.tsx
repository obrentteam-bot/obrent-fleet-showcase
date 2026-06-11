import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import logo from "@/assets/obrent-logo.webp";

export function SplashScreen() {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (location.pathname !== "/") return;

    setActive(true);
    setHidden(false);
    setFadeOut(false);

    // Bounce duration ~1.5s, then fade out
    const tOut = setTimeout(() => setFadeOut(true), 3500);
    const tDone = setTimeout(() => {
      setHidden(true);
      setActive(false);
    }, 4300);

    return () => {
      clearTimeout(tOut);
      clearTimeout(tDone);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!active || hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-[700ms] ease-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(180deg, oklch(0.10 0 0) 0%, oklch(0.55 0.005 80) 50%, oklch(0.10 0 0) 100%)" }}
      aria-hidden="true"
    >
      <img
        src={logo}
        alt="OBRENT"
        width={512}
        height={512}
        className="w-48 md:w-64 h-auto animate-logo-bounce will-change-transform"
        style={{ transformOrigin: "50% 50%", backfaceVisibility: "hidden" }}
        draggable={false}
        decoding="sync"
        fetchPriority="high"
      />
    </div>
  );
}
