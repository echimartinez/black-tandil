"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_SLIDES, type HeroSlide } from "./HeroCarousel";

// La palabra queda "rellena" con la foto de campaña (background-clip: text),
// cruzando de una imagen a otra. Es el mismo mecanismo que el carrusel viejo,
// pero en vez de la foto detrás del texto, la foto vive DENTRO de las letras.
export default function HeroTextWindow({
  word = "BLACK",
  slides = DEFAULT_SLIDES,
  intervalMs = 3000,
}: {
  word?: string;
  slides?: HeroSlide[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || reducedMotion) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [slides.length, intervalMs, reducedMotion]);

  return (
    <div className="hero-window" role="heading" aria-level={1} aria-label={word}>
      {slides.map((slide, i) => (
        <div
          key={slide.src + i}
          className={`hero-window-text ${i === active ? "hero-window-text-active" : ""}`}
          style={{ backgroundImage: `url(${slide.src})` }}
          aria-hidden="true"
        >
          {word}
        </div>
      ))}
    </div>
  );
}