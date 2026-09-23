"use client";

import { useReveal } from "@/hooks/useReveal";

// Sección editorial full-bleed entre el hero y los productos.
// Reemplaza al manifiesto viejo: una sola frase grande, mucho aire,
// fondo oscuro con glow sutil. Tendencia 2025-2026: "editorial moment".
export default function EditorialBreak() {
  const ref = useReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section ref={ref} className="editorial-break reveal">
      <div className="editorial-break-glow" />
      <div className="editorial-break-grid" />

      <div className="relative max-w-md mx-auto text-center px-6">
        <p className="editorial-line font-bebas text-5xl sm:text-6xl leading-[0.95] text-white">
          NO ES SOLO ROPA.
        </p>
        <p className="editorial-line font-bebas text-5xl sm:text-6xl leading-[0.95] text-[#E63A2E] mt-2">
          ES ACTITUD.
        </p>
        <p className="editorial-line font-dm text-[11px] text-white/40 uppercase tracking-[0.3em] mt-8">
          Diseñada en Tandil · Usada en todo el país
        </p>
      </div>
    </section>
  );
}
