"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();

  // El slug puede ser "hombre" o "hombre/remeras"
  const slugParts = Array.isArray(params.categoria)
    ? params.categoria
    : [params.categoria as string];

  const mainSlug = slugParts[0];
  const subSlug = slugParts[1] ?? null;

  const category = categories.find(c => c.slug === mainSlug);
  const subcategory = subSlug
    ? category?.subcategories.find(s => s.slug === `${mainSlug}/${subSlug}`)
    : null;

  const pageTitle = subcategory
    ? `${category?.name} / ${subcategory.name}`
    : category?.name ?? "Categoría";

  // Por ahora mostramos todos los productos (en el futuro se filtrarían por categoría)
  const filteredProducts = products;

  return (
    <div className="w-full">

      {/* Breadcrumb */}
      <div className="px-4 py-3 flex items-center gap-1 text-xs font-dm text-[#888] border-b border-[#E0DED8] bg-white">
        <button onClick={() => router.push("/")} className="hover:text-[#111] transition-colors">
          Inicio
        </button>
        <span>›</span>
        {subcategory ? (
          <>
            <button
              onClick={() => router.push(`/categoria/${mainSlug}`)}
              className="hover:text-[#111] transition-colors"
            >
              {category?.name}
            </button>
            <span>›</span>
            <span className="text-[#111] font-medium">{subcategory.name}</span>
          </>
        ) : (
          <span className="text-[#111] font-medium">{category?.name}</span>
        )}
      </div>

      {/* Subcategorías (si estamos en una categoría principal) */}
      {!subcategory && category && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-[#E0DED8] bg-white scrollbar-none">
          {category.subcategories.map((sub) => (
            <button
              key={sub.slug}
              onClick={() => router.push(`/categoria/${sub.slug}`)}
              className="flex-shrink-0 font-dm text-xs font-semibold uppercase tracking-wider px-4 py-2 border border-[#E0DED8] rounded-full hover:border-[#111] hover:text-[#111] transition-colors text-[#888]"
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Header de la sección */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-[#E0DED8] bg-white">
        <h1 className={`font-bebas text-3xl tracking-tight ${
          category?.highlight ? "text-[#E63A2E]" : "text-[#111]"
        }`}>
          {pageTitle}
        </h1>
        <span className="font-dm text-xs text-[#888]">{filteredProducts.length} productos</span>
      </div>

      {/* Grilla */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
          <p className="font-bebas text-3xl text-[#CCC] mb-2">PRÓXIMAMENTE</p>
          <p className="font-dm text-sm text-[#888]">
            Estamos preparando los productos de esta categoría.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 font-dm text-xs font-semibold uppercase tracking-widest px-6 py-3 bg-[#111] text-white rounded-sm hover:bg-[#333] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[1px] bg-[#E0DED8] mt-[1px]">
          {filteredProducts.map((product, index) => (
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
                  {product.category ?? "Producto"}
                </span>
                <h2 className="font-dm font-semibold text-sm text-[#111] leading-tight">
                  {product.name}
                </h2>
                <p className="font-dm font-bold text-sm text-[#111] mt-2">
                  ${product.price.toLocaleString("es-AR")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
