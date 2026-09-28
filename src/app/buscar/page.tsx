"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ProductGrid from "@/components/ProductGrid";
import { Product } from "@/types";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q || q.length < 2) { setProducts([]); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}&mode=full`)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [q]);

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="px-4 py-3 flex items-center gap-1 text-xs font-dm text-[#888] border-b border-[#E0DED8] bg-white">
        <button onClick={() => router.push("/")} className="hover:text-[#111] transition-colors">Inicio</button>
        <span>›</span>
        <span className="text-[#111] font-medium">Búsqueda: "{q}"</span>
      </div>

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
      ) : !q ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <p className="font-bebas text-3xl text-[#CCC]">BUSCÁ UN PRODUCTO</p>
        </div>
      ) : (
        <ProductGrid productList={products} />
      )}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}