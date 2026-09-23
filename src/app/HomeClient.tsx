"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import MagneticButton from "@/components/MagneticButton";
import { useReveal } from "@/hooks/useReveal";

interface HomeData {
  featured: Product[];
  sale: Product[];
  newest: Product[];
}

// Grilla bento editorial: 1 producto grande + 2 chicos.
// Mobile-first: el grande ocupa el ancho pero con proporción 4/5 (no cuadrada
// gigante), y los 2 chicos van en 2 columnas normales.
function BentoGrid({ products }: { products: Product[] }) {
  const router = useRouter();
  const ref = useReveal<HTMLDivElement>();
  const [hero, ...rest] = products;
  if (!hero) return null;

  return (
    <div ref={ref} className="reveal px-4 mt-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="font-bebas text-2xl tracking-tight text-[#111] leading-none">
          DESTACADOS
        </h2>
        <button
          onClick={() => router.push("/tienda")}
          className="font-dm text-[11px] text-[#888] hover:text-[#111] transition-colors underline underline-offset-4"
        >
          Ver todo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <ProductCard product={hero} index={0} variant="bento" />
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
    <div ref={ref} className="reveal mt-10">
      <div className="flex items-end justify-between px-4 mb-4">
        <div className="flex items-baseline gap-2">
          <h2 className="font-bebas text-2xl tracking-tight text-[#111] leading-none">
            SALE
          </h2>
          <span className="font-dm text-[10px] text-[#E63A2E] uppercase tracking-[0.2em] font-semibold">
            Ofertas
          </span>
        </div>
        <button
          onClick={() => router.push("/tienda")}
          className="font-dm text-[11px] text-[#888] hover:text-[#111] transition-colors underline underline-offset-4"
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
    <div className="w-full pb-20">

      {/* Hero — foto full-bleed, tipografía contenida, un solo CTA.
          Mobile-first: altura moderada para que se vea la sección de abajo. */}
      <div ref={heroRef} className="relative w-full h-[68svh] min-h-[440px] max-h-[620px] bg-[#0A0A0A] overflow-hidden reveal">
        <HeroCarousel intervalMs={5000} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 z-[1]" />

        <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 pb-10">
          <p className="hero-eyebrow hero-badge font-dm text-[10px] text-white/60 uppercase tracking-[0.3em] mb-3">
            <span className="hero-live-dot" />
            Nueva colección
          </p>

          <h1 className="hero-outline-text mb-4">BLACK</h1>

          <p className="hero-sub font-dm text-sm text-white/70 max-w-[260px] mb-6">
            Ropa de calidad para el día a día. Envíos a todo el país.
          </p>

          <MagneticButton
            onClick={() => router.push("/tienda")}
            className="hero-cta w-fit bg-white text-[#111] font-dm font-bold text-[11px] uppercase tracking-widest px-6 py-3 rounded-sm hover:bg-[#F0EDE6] transition-colors"
          >
            Ver colección
            <span className="hero-cta-arrow" aria-hidden="true">→</span>
          </MagneticButton>
        </div>
      </div>

      {loading ? (
        <div className="px-4 mt-10 space-y-4">
          <div className="h-6 bg-[#E0DED8] rounded w-32 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 aspect-[4/5] bg-[#ECEAE4] rounded-sm animate-pulse" />
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
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <p className="font-bebas text-3xl text-[#CCC] mb-2">PRÓXIMAMENTE</p>
              <p className="font-dm text-sm text-[#888]">Estamos cargando los productos.</p>
            </div>
          )}
        </>
      )}

    </div>
  );
}
