"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { products } from "@/data/products";

export default function Home() {
  const router = useRouter();

  return (
    <div className="w-full">

      {/* Banner envío gratis */}
      <div className="bg-[#F0EDE6] border-b border-[#E0DED8] px-4 py-3 flex items-center justify-between">
        <button className="text-[#999] text-lg leading-none flex-shrink-0 pr-2">‹</button>
        <div className="text-center flex-1 min-w-0">
          <p className="font-dm text-xs text-[#555]">
            Envío gratis a partir de <span className="font-bold text-[#111]">$229,999</span>
          </p>
          <p className="font-dm text-xs underline font-semibold text-[#111] cursor-pointer mt-0.5">
            Ver términos y condiciones
          </p>
        </div>
        <button className="text-[#999] text-lg leading-none flex-shrink-0 pl-2">›</button>
      </div>

      {/* Filtros */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#E0DED8] bg-white">
        <button className="flex items-center gap-1 text-sm font-dm font-medium text-[#111]">
          Ordenar por
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <button className="flex items-center gap-2 text-sm font-dm font-medium border border-[#111] rounded-full px-4 py-1.5">
          Filtrar
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 py-2 text-xs text-[#888] font-dm border-b border-[#E0DED8] bg-white">
        Hombres › Abrigos › <span className="text-[#111] font-medium">Camisacos</span>
      </div>

      {/* Grilla de productos — solo clickeables, sin botón */}
      <div className="grid grid-cols-2 gap-[1px] bg-[#E0DED8] mt-[1px]">
        {products.map((product, index) => (
          <button
            key={product.id}
            onClick={() => router.push(`/producto/${product.id}`)}
            className="bg-[#F5F4F0] flex flex-col text-left w-full hover:bg-[#ECEAE4] transition-colors"
          >
            <div className="relative w-full aspect-square bg-[#ECEAE4] overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="50vw"
                priority={index === 0}
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-3 flex flex-col flex-1">
              <span className="text-[10px] font-dm text-[#E63A2E] uppercase tracking-wider font-semibold mb-0.5">
                {product.category ?? "Camisacos"}
              </span>
              <h2 className="font-dm font-semibold text-sm text-[#111] leading-tight">
                {product.name}
              </h2>
              {product.description && (
                <p className="font-dm text-xs text-[#888] mt-0.5 leading-snug">
                  {product.description}
                </p>
              )}
              <p className="font-dm font-bold text-sm text-[#111] mt-2">
                ${product.price.toLocaleString("es-AR")}
              </p>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}

