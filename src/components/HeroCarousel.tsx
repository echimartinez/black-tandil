"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface HeroSlide {
  src: string;
  alt: string;
}

// Imágenes por defecto — cambiá estos paths o pasale tu propio array de "slides" por prop.
const DEFAULT_SLIDES: HeroSlide[] = [
  { src: "/camisacos.png", alt: "BLACK — colección" },
  { src: "/camisaco2.png", alt: "BLACK — colección" },
  { src: "/camisaco3.png", alt: "BLACK — colección" },
];

export default function HeroCarousel({
  slides = DEFAULT_SLIDES,
  intervalMs = 3000,
}: {
  slides?: HeroSlide[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const start = () => {
    clearInterval(timerRef.current);
    if (slides.length <= 1 || reducedMotion) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, intervalMs);
  };

  useEffect(() => {
    start();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, intervalMs, reducedMotion]);

  if (slides.length === 0) return null;

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => clearInterval(timerRef.current)}
      onMouseLeave={start}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src + i}
          className={`hero-slide ${i === active ? "hero-slide-active" : ""}`}
          aria-hidden={i !== active}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a la imagen ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setActive(i);
                start();
              }}
              className={`hero-dot ${i === active ? "hero-dot-active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}