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