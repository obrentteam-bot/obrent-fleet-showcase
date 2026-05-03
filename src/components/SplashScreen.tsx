import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import logo from "@/assets/obrent-logo.png";

export function SplashScreen() {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (location.pathname !== "/") return;
    if (sessionStorage.getItem("obrent_splash_shown")) return;
    sessionStorage.setItem("obrent_splash_shown", "1");
    setMounted(true);
    const t1 = setTimeout(() => setFadeOut(true), 2400);
    const t2 = setTimeout(() => setHidden(true), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.pathname]);

  if (!mounted || hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-onyx transition-opacity duration-700 ease-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* subtle gold radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--gold) 18%, transparent) 0%, transparent 60%)",
        }}
      />
      <img
        src={logo}
        alt="OBRENT"
        className="relative w-[22rem] md:w-[34rem] lg:w-[42rem] animate-logo-reveal drop-shadow-[0_0_60px_rgba(212,175,55,0.25)]"
        draggable={false}
      />
    </div>
  );
}
