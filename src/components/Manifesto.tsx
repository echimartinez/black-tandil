"use client";

import { useReveal } from "@/hooks/useReveal";

// Sección "manifiesto" entre el hero y los productos: scrollytelling liviano
// (CSS scroll-driven donde el navegador lo soporta, con fallback por
// IntersectionObserver para el resto). Retocá el texto a gusto.
export default function Manifesto() {
  const ref = useReveal<HTMLDivElement>({ threshold: 0.35 });

  return (
    <section ref={ref} className="manifesto-section reveal py-20 px-6">
      <div className="manifesto-glow" />
      <div className="manifesto-grid" />
      <div className="relative max-w-sm mx-auto text-center">
        <p className="manifesto-line font-bebas text-4xl sm:text-5xl leading-[1.05] text-white">
          NO ES SOLO ROPA.
        </p>
        <p className="manifesto-line font-bebas text-4xl sm:text-5xl leading-[1.05] text-[#E63A2E] mt-1">
          ES ACTITUD.
        </p>
        <p className="manifesto-line font-dm text-xs text-white/45 uppercase tracking-[0.25em] mt-6">
          Diseñada en Tandil · Usada en todo el país
        </p>
      </div>
    </section>
  );
}