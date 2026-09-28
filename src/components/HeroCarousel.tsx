"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface HeroSlide {
  src: string;
  alt: string;
}

// Imágenes servidas desde Cloudinary.
// f_auto = formato óptimo por navegador (WebP/AVIF), q_auto = calidad óptima automática.
// Esto hace que pesen bastante menos que los archivos originales sin que se note.
const CLOUD = "dhtnlmmyf";
const cld = (id: string) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/${id}`;

export const DEFAULT_SLIDES: HeroSlide[] = [
  { src: cld("hero/black-hero-1"), alt: "BLACK — campaña" },
  { src: cld("hero/black-hero-2"), alt: "BLACK — campaña" },
  { src: cld("hero/black-hero-3"), alt: "BLACK — campaña" },
];

export default function HeroCarousel({
  slides = DEFAULT_SLIDES,
  intervalMs = 5000,
}: {
  slides?: HeroSlide[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Un timeout por slide: se reinicia solo cuando cambia `active`
  // (ya sea por timer, swipe o toque en una barrita), y queda sincronizado
  // con la animación de la barra de progreso.
  useEffect(() => {
    if (slides.length <= 1 || reducedMotion) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % slides.length), intervalMs);
    return () => clearTimeout(t);
  }, [active, slides.length, intervalMs, reducedMotion]);

  if (slides.length === 0) return null;

  const go = (i: number) => setActive((i + slides.length) % slides.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      className="absolute inset-0 touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
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
        <div className="absolute top-2 left-4 right-4 flex gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a la imagen ${i + 1}`}
              aria-current={i === active}
              onClick={() => go(i)}
              className="flex-1 py-2"
            >
              <span className="hero-bar-track">
                <span
                  className={`hero-bar-fill ${
                    i < active ? "hero-bar-done" : i === active ? "hero-bar-active" : ""
                  }`}
                  style={i === active ? { animationDuration: `${intervalMs}ms` } : undefined}
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
