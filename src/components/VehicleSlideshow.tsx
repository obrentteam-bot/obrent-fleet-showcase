import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  alt: string;
  intervalMs?: number;
}

export function VehicleSlideshow({ images, alt, intervalMs = 3000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [count, paused, intervalMs]);

  if (count === 0) return null;

  const go = (i: number) => setIndex(((i % count) + count) % count);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const sx = touchStartX.current;
    const sy = touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    setPaused(false);
    if (sx == null || sy == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    // Horizontal swipe only — ignore mostly-vertical gestures (scrolling)
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) go(index + 1);
    else go(index - 1);
  };

  return (
    <div
      className="relative w-full h-full touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >

      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={`${alt} — ${i + 1}`}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={i === 0 ? "high" : "low"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(index - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-onyx/50 hover:bg-onyx/80 backdrop-blur text-cream transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(index + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-onyx/50 hover:bg-onyx/80 backdrop-blur text-cream transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute top-4 right-4 px-3 py-1.5 bg-onyx/60 backdrop-blur text-[0.7rem] tracking-[0.24em] uppercase text-cream/90">
            {index + 1} / {count}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Zu Bild ${i + 1}`}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-gold" : "w-4 bg-cream/40 hover:bg-cream/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
