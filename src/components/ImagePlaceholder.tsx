import { ImageOff } from "lucide-react";

interface Props {
  className?: string;
  text?: string;
}

export function ImagePlaceholder({ className = "", text = "Bilder folgen in Kürze" }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-jet border border-border/40 ${className}`}
    >
      <ImageOff className="w-8 h-8 text-cream/20 mb-3" strokeWidth={1.5} />
      <span className="text-[0.65rem] tracking-[0.24em] uppercase text-cream/30 text-center px-4">
        {text}
      </span>
    </div>
  );
}
