"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "grid" | "scroll"; // grid = grilla 2col, scroll = horizontal scroll
}

export default function ProductCard({ product, index = 0, variant = "grid" }: ProductCardProps) {
  const router = useRouter();

  const hasStockInSize = (size: string) => {
    if (!product.stockBySize) return (product.stock ?? 0) > 0;
    return (product.stockBySize[size] ?? 0) > 0;
  };

  const totalStock = product.stockBySize
    ? Object.values(product.stockBySize).reduce((a, b) => a + Number(b), 0)
    : (product.stock ?? 99);
  const sinStock = totalStock === 0;

  const discount = (product as any).originalPrice
    ? Math.round((1 - product.price / (product as any).originalPrice) * 100)
    : null;

  const isNew = (product as any).isNew;

  // Talles con stock bajo (≤2 unidades)
  const lowStockSizes = product.sizes?.filter(s => {
    const qty = product.stockBySize?.[s] ?? 99;
    return qty > 0 && qty <= 2;
  }) ?? [];

  const wrapperClass = variant === "scroll"
    ? "flex-shrink-0 w-44 text-left group cursor-pointer"
    : "bg-[#F5F4F0] flex flex-col text-left w-full group cursor-pointer hover:bg-[#ECEAE4] transition-colors";

  return (
    <button
      onClick={() => router.push(`/producto/${product._id ?? product.id}`)}
      className={wrapperClass}
    >
      {/* Imagen */}
      <div className={`relative w-full bg-[#ECEAE4] overflow-hidden ${
        variant === "scroll" ? "aspect-square rounded-sm" : "aspect-square"
      }`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={variant === "scroll" ? "176px" : "50vw"}
          priority={index === 0}
          loading={index === 0 ? "eager" : "lazy"}
          className={`object-cover group-hover:scale-105 transition-transform duration-500 ${sinStock ? "opacity-40" : ""}`}
        />

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="bg-[#E63A2E] text-white font-dm text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {isNew && !discount && (
            <span className="bg-[#111] text-white font-dm text-[10px] font-bold px-2 py-0.5 rounded-full">
              NUEVO
            </span>
          )}
        </div>

        {/* Sin stock overlay */}
        {sinStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="bg-white/90 font-dm text-[10px] font-bold uppercase tracking-wider text-[#888] px-3 py-1 rounded-full">
              Sin stock
            </span>
          </div>
        )}

        {/* Stock bajo — alerta discreta */}
        {!sinStock && lowStockSizes.length > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-[#111]/80 text-white font-dm text-[9px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
              ¡Últimos!
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`flex flex-col flex-1 ${variant === "grid" ? "p-3" : "mt-2 px-0.5"}`}>

        {/* Categoría */}
        <span className="font-dm text-[10px] text-[#E63A2E] uppercase tracking-wider font-semibold mb-0.5">
          {product.category ?? "Producto"}
        </span>

        {/* Nombre */}
        <h2 className={`font-dm font-semibold text-[#111] leading-tight ${
          variant === "scroll" ? "text-xs line-clamp-2" : "text-sm"
        }`}>
          {product.name}
        </h2>

        {/* Talles disponibles */}
        {product.sizes && product.sizes.length > 0 && variant === "grid" && (
          <div className="flex gap-1 flex-wrap mt-2">
            {product.sizes.map(s => {
              const enStock = hasStockInSize(s);
              return (
                <span key={s} className={`font-dm text-[9px] font-semibold px-1.5 py-0.5 rounded-sm border transition-colors ${
                  enStock
                    ? "border-[#CCC] text-[#555] bg-white"
                    : "border-[#E8E6E0] text-[#CCC] line-through bg-transparent"
                }`}>
                  {s}
                </span>
              );
            })}
          </div>
        )}

        {/* Precio + flecha */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <p className={`font-dm font-bold text-[#111] ${variant === "scroll" ? "text-sm" : "text-sm"}`}>
              ${product.price.toLocaleString("es-AR")}
            </p>
            {(product as any).originalPrice && (
              <p className="font-dm text-xs text-[#AAA] line-through">
                ${(product as any).originalPrice.toLocaleString("es-AR")}
              </p>
            )}
          </div>

          {/* Flecha solo en grid */}
          {variant === "grid" && (
            <div className="w-7 h-7 rounded-full bg-[#111] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E63A2E] transition-colors duration-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          )}
        </div>

      </div>
    </button>
  );
}
