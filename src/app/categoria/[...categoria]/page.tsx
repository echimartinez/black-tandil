"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import { Product } from "@/types";

interface SubCategory {
  _id?: string;
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  highlight?: boolean;
  subcategories: SubCategory[];
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();

  const slugParts = Array.isArray(params.categoria)
    ? params.categoria
    : [params.categoria as string];

  const mainSlug = slugParts[0];
  const subSlug = slugParts[1] ?? null;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then((cats: Category[]) => {
        const found = cats.find(c => c.slug === mainSlug);
        setCategory(found ?? null);
      });
  }, [mainSlug]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then(r => r.json())
      .then((data: any[]) => {
        const normalized = data.map(p => ({
          ...p,
          id: p._id,
          stockBySize: p.stockBySize
            ? Object.fromEntries(Object.entries(p.stockBySize))
            : undefined,
        })) as Product[];

        const filtered = normalized.filter(p => {
          if (!p.category) return false;
          const catLower = p.category.toLowerCase();

          if (subSlug) {
            const subName = subSlug.replace(/-/g, " ");
            return catLower.includes(subName);
          } else {
            if (mainSlug === "sale") return (p as any).sale === true;
            return catLower.includes(mainSlug.replace(/-/g, " "));
          }
        });

        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [mainSlug, subSlug]);

  const subcategory = subSlug
    ? category?.subcategories.find(
        s => s.slug === `${mainSlug}/${subSlug}` || s.slug === subSlug
      )
    : null;

  const pageTitle = subcategory
    ? `${category?.name} / ${subcategory.name}`
    : category?.name ?? mainSlug;

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
          <span className="text-[#111] font-medium">{pageTitle}</span>
        )}
      </div>

      {/* Subcategorías desde MongoDB */}
      {!subcategory && category && category.subcategories.length > 0 && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-[#E0DED8] bg-white scrollbar-none">
          {category.subcategories.map(sub => (
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

      {/* Título */}
      <div className="px-4 py-4 border-b border-[#E0DED8] bg-white">
        <h1 className={`font-bebas text-3xl tracking-tight ${category?.highlight ? "text-[#E63A2E]" : "text-[#111]"}`}>
          {pageTitle}
        </h1>
      </div>

      {/* Grilla filtrada */}
      {loading ? (
        <div className="grid grid-cols-2 gap-[1px] bg-[#E0DED8] mt-[1px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#F5F4F0] animate-pulse">
              <div className="aspect-square bg-[#ECEAE4]" />
              <div className="p-3 space-y-2">
                <div className="h-2 bg-[#E0DED8] rounded w-1/3" />
                <div className="h-3 bg-[#E0DED8] rounded w-3/4" />
                <div className="h-3 bg-[#E0DED8] rounded w-1/4 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <p className="font-bebas text-3xl text-[#CCC] mb-2">SIN PRODUCTOS</p>
          <p className="font-dm text-sm text-[#888]">No hay productos en esta categoría todavía.</p>
        </div>
      ) : (
        <ProductGrid productList={products} />
      )}
    </div>
  );
}
