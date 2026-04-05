"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

interface HomeData {
  featured: Product[];
  sale: Product[];
  newest: Product[];
}


function Section({
  title,
  badge,
  badgeColor = "bg-[#111]",
  products,
  cta,
  ctaHref,
}: {
  title: string;
  badge?: string;
  badgeColor?: string;
  products: Product[];
  cta?: string;
  ctaHref?: string;
}) {
  const router = useRouter();
  if (products.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bebas text-2xl tracking-tight text-[#111]">{title}</h2>
          {badge && (
            <span className={`${badgeColor} text-white font-dm text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full`}>
              {badge}
            </span>
          )}
        </div>
        {cta && ctaHref && (
          <button
            onClick={() => router.push(ctaHref)}
            className="font-dm text-xs text-[#888] hover:text-[#111] transition-colors underline"
          >
            {cta}
          </button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
        {products.map((p, i) => <ProductCard key={String(p._id ?? p.id)} product={p} index={i} variant="scroll" />)}
      </div>
    </div>
  );
}

export default function HomeClient() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/home")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="w-full pb-16">

      {/* Hero */}
      <div className="relative w-full aspect-[4/5] bg-[#111] overflow-hidden">
        {/* Acá podés poner una imagen de fondo: */}
        {/* <Image src="/hero.jpg" alt="Black" fill className="object-cover opacity-60" /> */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10">
          <p className="font-dm text-[11px] text-white/50 uppercase tracking-[0.3em] mb-2">
            Nueva colección
          </p>
          <h1 className="font-bebas text-6xl text-white leading-none tracking-tight">
            STYLE<br />IN BLACK
          </h1>
          <p className="font-dm text-sm text-white/60 mt-3 max-w-[220px]">
            Ropa de calidad para el día a día. Envíos a todo el país.
          </p>
          <button
            onClick={() => router.push("/tienda")}
            className="mt-6 w-fit bg-white text-[#111] font-dm font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-sm hover:bg-[#F0EDE6] transition-colors"
          >
            Ver colección
          </button>
        </div>
      </div>

      {/* Banner envío gratis */}
      <div className="bg-[#F0EDE6] border-b border-[#E0DED8] px-4 py-3 text-center">
        <p className="font-dm text-xs text-[#555]">
          Envío gratis a partir de <span className="font-bold text-[#111]">$229,999</span>
          {" · "}
          <span className="underline cursor-pointer">Ver términos</span>
        </p>
      </div>

      {loading ? (
        <div className="px-4 mt-8 space-y-8">
          {[...Array(2)].map((_, s) => (
            <div key={s}>
              <div className="h-6 bg-[#E0DED8] rounded w-32 mb-4 animate-pulse" />
              <div className="flex gap-3 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-44 animate-pulse">
                    <div className="aspect-square bg-[#ECEAE4] rounded-sm" />
                    <div className="mt-2 space-y-1.5">
                      <div className="h-2 bg-[#E0DED8] rounded w-2/3" />
                      <div className="h-3 bg-[#E0DED8] rounded w-full" />
                      <div className="h-3 bg-[#E0DED8] rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <Section
            title="NOVEDADES"
            badge="NUEVO"
            products={data?.newest ?? []}
            cta="Ver todo"
            ctaHref="/tienda"
          />

          <Section
            title="SALE"
            badge="OFERTA"
            badgeColor="bg-[#E63A2E]"
            products={data?.sale ?? []}
            cta="Ver todo"
            ctaHref="/tienda"
          />

          <Section
            title="DESTACADOS"
            products={data?.featured ?? []}
            cta="Ver todo"
            ctaHref="/tienda"
          />

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
