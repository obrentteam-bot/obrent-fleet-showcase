import { useEffect, useState } from "react";
import logo from "@/assets/obrent-logo.png";

export function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("obrent_splash_shown")) return;
    setMounted(true);
    sessionStorage.setItem("obrent_splash_shown", "1");
    const t1 = setTimeout(() => setFadeOut(true), 1900);
    const t2 = setTimeout(() => setHidden(true), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!mounted || hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-onyx transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <img
        src={logo}
        alt="OBRENT"
        className="w-48 md:w-64 animate-logo-bounce"
        draggable={false}
      />
    </div>
  );
}
