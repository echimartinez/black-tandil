"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { products } from "@/data/products";
import { Product } from "@/types";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortOption, string> = {
  "default":    "Destacados",
  "price-asc":  "Menor precio",
  "price-desc": "Mayor precio",
  "name-asc":   "A → Z",
};

export default function Home() {
  const router = useRouter();
  const [sort, setSort] = useState<SortOption>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Categorías únicas disponibles
  const availableCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
  }, []);

  // Productos filtrados y ordenados
  const displayedProducts = useMemo(() => {
    let result: Product[] = [...products];

    // Filtrar por categoría
    if (selectedCategories.length > 0) {
      result = result.filter(p => p.category && selectedCategories.includes(p.category));
    }

    // Ordenar
    switch (sort) {
      case "price-asc":  result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "name-asc":   result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return result;
  }, [sort, selectedCategories]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSort("default");
    setFilterOpen(false);
    setSortOpen(false);
  };

  const hasActiveFilters = selectedCategories.length > 0 || sort !== "default";

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

      {/* Barra de filtros */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#E0DED8] bg-white relative">

        {/* Ordenar por */}
        <div className="relative">
          <button
            onClick={() => { setSortOpen(p => !p); setFilterOpen(false); }}
            className="flex items-center gap-1 text-sm font-dm font-medium text-[#111]"
          >
            {sort !== "default" ? (
              <span className="text-[#E63A2E]">{SORT_LABELS[sort]}</span>
            ) : (
              <span>Ordenar por</span>
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Dropdown ordenar */}
          {sortOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-[#E0DED8] rounded-sm shadow-lg z-20 min-w-[170px]">
              {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSort(key); setSortOpen(false); }}
                  className={`w-full text-left px-4 py-3 font-dm text-sm border-b border-[#F0EDE6] last:border-0 hover:bg-[#F5F4F0] transition-colors ${
                    sort === key ? "text-[#E63A2E] font-semibold" : "text-[#111]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Derecha: limpiar + filtrar */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="font-dm text-xs text-[#E63A2E] font-semibold hover:underline"
            >
              Limpiar
            </button>
          )}
          <button
            onClick={() => { setFilterOpen(p => !p); setSortOpen(false); }}
            className={`flex items-center gap-2 text-sm font-dm font-medium border rounded-full px-4 py-1.5 transition-colors ${
              selectedCategories.length > 0
                ? "border-[#E63A2E] text-[#E63A2E]"
                : "border-[#111] text-[#111]"
            }`}
          >
            Filtrar
            {selectedCategories.length > 0 && (
              <span className="bg-[#E63A2E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {selectedCategories.length}
              </span>
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Panel de filtros por categoría */}
      {filterOpen && (
        <div className="bg-white border-b border-[#E0DED8] px-4 py-4">
          <p className="font-dm text-xs text-[#888] uppercase tracking-widest mb-3">Categoría</p>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`font-dm text-xs font-semibold uppercase tracking-wider px-4 py-2 border rounded-full transition-colors ${
                  selectedCategories.includes(cat)
                    ? "bg-[#111] text-white border-[#111]"
                    : "bg-white text-[#888] border-[#E0DED8] hover:border-[#111] hover:text-[#111]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contador y breadcrumb */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-[#E0DED8] bg-white">
        <p className="text-xs text-[#888] font-dm">
          {displayedProducts.length} {displayedProducts.length === 1 ? "producto" : "productos"}
        </p>
        {selectedCategories.length === 0 && (
          <p className="text-xs text-[#888] font-dm">
            Todos los productos
          </p>
        )}
      </div>

      {/* Grilla de productos */}
      {displayedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <p className="font-bebas text-3xl text-[#CCC] mb-2">SIN RESULTADOS</p>
          <p className="font-dm text-sm text-[#888] mb-5">No hay productos que coincidan con los filtros.</p>
          <button onClick={clearFilters}
            className="font-dm text-xs font-semibold uppercase tracking-widest px-6 py-3 bg-[#111] text-white rounded-sm hover:bg-[#333] transition-colors">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[1px] bg-[#E0DED8] mt-[1px]">
          {displayedProducts.map((product, index) => (
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
                  loading={index === 0 ? "eager" : "lazy"}
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
      )}

      {/* Cerrar dropdowns al hacer click afuera */}
      {(sortOpen || filterOpen) && (
        <div className="fixed inset-0 z-10" onClick={() => { setSortOpen(false); setFilterOpen(false); }} />
      )}

    </div>
  );
}

