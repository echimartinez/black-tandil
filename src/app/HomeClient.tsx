"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import EditorialBreak from "@/components/EditorialBreak";
import HeroCarousel from "@/components/HeroCarousel";
import MagneticButton from "@/components/MagneticButton";
import { useReveal } from "@/hooks/useReveal";

interface HomeData {
  featured: Product[];
  sale: Product[];
  newest: Product[];
}

// Grilla bento editorial: 1 producto grande + 2 chicos.
// Es la tendencia fuerte 2025-2026 (Awwwards/FWA): jerarquía clara,
// mucho aire, sin carruseles repetidos.
function BentoGrid({ products }: { products: Product[] }) {
  const router = useRouter();
  const ref = useReveal<HTMLDivElement>();
  const [hero, ...rest] = products;
  if (!hero) return null;

  return (
    <div ref={ref} className="reveal px-4 mt-16">
      <div className="flex items-end justify-between mb-6">
        <h2 className="font-bebas text-3xl sm:text-4xl tracking-tight text-[#111] leading-none">
          DESTACADOS
        </h2>
        <button
          onClick={() => router.push("/tienda")}
          className="font-dm text-xs text-[#888] hover:text-[#111] transition-colors underline underline-offset-4"
        >
          Ver todo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="col-span-2">
          <ProductCard product={hero} index={0} variant="grid" />
        </div>
        {rest.slice(0, 2).map((p, i) => (
          <ProductCard key={String(p._id ?? p.id)} product={p} index={i + 1} variant="grid" />
        ))}
      </div>
    </div>
  );
}

// Fila horizontal discreta para SALE — un solo carrusel, no tres.
function SaleRow({ products }: { products: Product[] }) {
  const router = useRouter();
  const ref = useReveal<HTMLDivElement>();
  if (products.length === 0) return null;

  return (
    <div ref={ref} className="reveal mt-16">
      <div className="flex items-end justify-between px-4 mb-5">
        <div className="flex items-baseline gap-3">
          <h2 className="font-bebas text-3xl sm:text-4xl tracking-tight text-[#111] leading-none">
            SALE
          </h2>
          <span className="font-dm text-[10px] text-[#E63A2E] uppercase tracking-[0.2em] font-semibold">
            Ofertas
          </span>
        </div>
        <button
          onClick={() => router.push("/tienda")}
          className="font-dm text-xs text-[#888] hover:text-[#111] transition-colors underline underline-offset-4"
        >
          Ver todo
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
        {products.map((p, i) => (
          <ProductCard key={String(p._id ?? p.id)} product={p} index={i} variant="scroll" />
        ))}
      </div>
    </div>
  );
}

export default function HomeClient() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const heroRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    fetch("/api/home")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const featured = data?.featured?.length ? data.featured : (data?.newest ?? []);

  return (
    <div className="w-full pb-24">

      {/* Hero — foto full-bleed, tipografía grande, un solo CTA.
          Sin marquesina, sin scroll cue, sin banner: menos ruido, más impacto. */}
      <div ref={heroRef} className="relative w-full h-[88svh] min-h-[560px] bg-[#0A0A0A] overflow-hidden reveal">
        <HeroCarousel intervalMs={5000} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 z-[1]" />

        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-14 sm:pb-20">
          <p className="hero-eyebrow hero-badge font-dm text-[11px] text-white/60 uppercase tracking-[0.3em] mb-4">
            <span className="hero-live-dot" />
            Nueva colección
          </p>

          <h1 className="hero-outline-text mb-5">BLACK</h1>

          <p className="hero-sub font-dm text-sm sm:text-base text-white/70 max-w-[280px] mb-7">
            Ropa de calidad para el día a día. Envíos a todo el país.
          </p>

          <MagneticButton
            onClick={() => router.push("/tienda")}
            className="hero-cta w-fit bg-white text-[#111] font-dm font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-sm hover:bg-[#F0EDE6] transition-colors"
          >
            Ver colección
            <span className="hero-cta-arrow" aria-hidden="true">→</span>
          </MagneticButton>
        </div>
      </div>

      {/* Editorial break — un solo momento de marca, full-bleed, sin ruido */}
      <EditorialBreak />

      {loading ? (
        <div className="px-4 mt-16 space-y-4">
          <div className="h-8 bg-[#E0DED8] rounded w-40 animate-pulse" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="col-span-2 aspect-square bg-[#ECEAE4] rounded-sm animate-pulse" />
            <div className="aspect-square bg-[#ECEAE4] rounded-sm animate-pulse" />
            <div className="aspect-square bg-[#ECEAE4] rounded-sm animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          <BentoGrid products={featured} />

          <SaleRow products={data?.sale ?? []} />

          {/* Mensaje si no hay nada cargado todavía */}
          {data && data.newest.length === 0 && data.sale.length === 0 && data.featured.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
              <p className="font-bebas text-4xl text-[#CCC] mb-3">PRÓXIMAMENTE</p>
              <p className="font-dm text-sm text-[#888]">Estamos cargando los productos.</p>
            </div>
          )}
        </>
      )}

    </div>
  );
}
