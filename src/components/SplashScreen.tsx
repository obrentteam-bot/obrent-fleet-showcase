import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import logo from "@/assets/obrent-logo.png";

export function SplashScreen() {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (location.pathname !== "/") return;

    setActive(true);
    setHidden(false);
    setVisible(false);

    // Fade in
    const tIn = setTimeout(() => setVisible(true), 30);
    // Start fade out
    const tOut = setTimeout(() => setVisible(false), 2200);
    // Unmount
    const tDone = setTimeout(() => {
      setHidden(true);
      setActive(false);
    }, 3100);

    return () => {
      clearTimeout(tIn);
      clearTimeout(tOut);
      clearTimeout(tDone);
    };
    // run only on first mount of the route
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!active || hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-onyx transition-opacity duration-[800ms] ease-[cubic-bezier(.22,1,.36,1)] ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden="true"
    >
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
