"use client";

import { useParams, useRouter } from "next/navigation";
import { categories } from "@/data/categories";
import ProductGrid from "@/components/ProductGrid";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();

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

  return (
    <div className="w-full">

      {/* Breadcrumb */}
      <div className="px-4 py-3 flex items-center gap-1 text-xs font-dm text-[#888] border-b border-[#E0DED8] bg-white">
        <button onClick={() => router.push("/")} className="hover:text-[#111] transition-colors">Inicio</button>
        <span>›</span>
        {subcategory ? (
          <>
            <button onClick={() => router.push(`/categoria/${mainSlug}`)} className="hover:text-[#111] transition-colors">
              {category?.name}
            </button>
            <span>›</span>
            <span className="text-[#111] font-medium">{subcategory.name}</span>
          </>
        ) : (
          <span className="text-[#111] font-medium">{category?.name}</span>
        )}
      </div>

      {/* Subcategorías */}
      {!subcategory && category && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-[#E0DED8] bg-white scrollbar-none">
          {category.subcategories.map(sub => (
            <button key={sub.slug} onClick={() => router.push(`/categoria/${sub.slug}`)}
              className="flex-shrink-0 font-dm text-xs font-semibold uppercase tracking-wider px-4 py-2 border border-[#E0DED8] rounded-full hover:border-[#111] hover:text-[#111] transition-colors text-[#888]">
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Título */}
      <div className="px-4 py-4 border-b border-[#E0DED8] bg-white">
        <h1 className={`font-bebas text-3xl tracking-tight ${category?.highlight ? "text-[#E63A2E]" : "text-[#111]"}`}>
          {pageTitle}
        </h1>
      </div>

      {/* Grilla con filtros */}
      <ProductGrid />

    </div>
  );
}

