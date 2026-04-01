"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types";

type SortOption = "nuevo" | "precio-asc" | "precio-desc";

interface Filters {
  sizes: string[];
  priceMin: number | null;
  priceMax: number | null;
  soloConStock: boolean;
}

const SORT_LABELS: Record<SortOption, string> = {
  "nuevo": "Más nuevo",
  "precio-asc": "Menor precio",
  "precio-desc": "Mayor precio",
};

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const EMPTY_FILTERS: Filters = { sizes: [], priceMin: null, priceMax: null, soloConStock: false };

interface ProductGridProps {
  productList?: Product[];
}

export default function ProductGrid({ productList }: ProductGridProps) {
  const router = useRouter();

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!productList);

  const [sort, setSort] = useState<SortOption>("nuevo");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [tempFilters, setTempFilters] = useState<Filters>(EMPTY_FILTERS);
  const sortRef = useRef<HTMLDivElement>(null);

  // Cargar productos desde MongoDB si no se pasan por prop
  useEffect(() => {
    if (productList) return;
    fetch("/api/products")
      .then(r => r.json())
      .then(data => {
        // Normalizar: MongoDB usa _id, lo mapeamos a id para compatibilidad
        const normalized = data.map((p: any) => ({
          ...p,
          id: p._id,
          stockBySize: p.stockBySize ? Object.fromEntries(Object.entries(p.stockBySize)) : undefined,
        }));
        setDbProducts(normalized);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productList]);

  const sourceProducts = productList ?? dbProducts;

  // Cerrar dropdown de sort al click afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Bloquear scroll cuando el panel de filtros está abierto
  useEffect(() => {
    document.body.style.overflow = filterOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    sourceProducts.forEach(p => (p.sizes ?? []).forEach(s => set.add(s)));
    return ALL_SIZES.filter(s => set.has(s));
  }, [sourceProducts]);

  const [globalMin, globalMax] = useMemo(() => {
    const prices = sourceProducts.map(p => p.price);
    if (prices.length === 0) return [0, 0];
    return [Math.min(...prices), Math.max(...prices)];
  }, [sourceProducts]);

  const hasStockInSize = (p: Product, size: string) => {
    if (!p.stockBySize) return (p.stock ?? 0) > 0;
    return (p.stockBySize[size] ?? 0) > 0;
  };

  const hasAnyStock = (p: Product) => {
    if (p.stockBySize) return Object.values(p.stockBySize).some(v => v > 0);
    return (p.stock ?? 0) > 0;
  };

  const applyFiltersFn = (list: Product[], f: Filters) => {
    let r = [...list];
    if (f.sizes.length > 0)
      r = r.filter(p => f.sizes.some(s => (p.sizes ?? []).includes(s) && hasStockInSize(p, s)));
    if (f.priceMin !== null) r = r.filter(p => p.price >= f.priceMin!);
    if (f.priceMax !== null) r = r.filter(p => p.price <= f.priceMax!);
    if (f.soloConStock) r = r.filter(p => hasAnyStock(p));
    return r;
  };

  const applySort = (list: Product[], s: SortOption) => {
    const r = [...list];
    if (s === "precio-asc") r.sort((a, b) => a.price - b.price);
    if (s === "precio-desc") r.sort((a, b) => b.price - a.price);
    return r;
  };

  const displayProducts = useMemo(
    () => applySort(applyFiltersFn(sourceProducts, filters), sort),
    [filters, sort, sourceProducts]
  );

  const previewCount = useMemo(
    () => applyFiltersFn(sourceProducts, tempFilters).length,
    [tempFilters, sourceProducts]
  );

  const activeFilterCount =
    filters.sizes.length +
    (filters.priceMin !== null ? 1 : 0) +
    (filters.priceMax !== null ? 1 : 0) +
    (filters.soloConStock ? 1 : 0);

  const toggleTempSize = (size: string) => {
    setTempFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const openFilterPanel = () => { setTempFilters(filters); setFilterOpen(true); };
  const applyFilters = () => { setFilters(tempFilters); setFilterOpen(false); };
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setTempFilters(EMPTY_FILTERS); setFilterOpen(false); };

  if (loading) return (
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
  );

  return (
    <div className="w-full">

      {/* ── Barra Ordenar / Filtrar ── */}
      <div className="sticky top-[61px] z-20 bg-white border-b border-[#E0DED8] px-4 py-2.5 flex items-center gap-2">

        {/* Ordenar */}
        <div className="relative flex-1" ref={sortRef}>
          <button
            onClick={() => setSortOpen(v => !v)}
            className="flex items-center gap-1.5 font-dm text-xs font-semibold text-[#111]"
          >
            <span>Ordenar por</span>
            <span className="text-[#888] font-normal">{SORT_LABELS[sort]}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {sortOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#E0DED8] rounded-sm shadow-lg min-w-[160px] z-30 overflow-hidden">
              {(["nuevo", "precio-asc", "precio-desc"] as SortOption[]).map(opt => (
                <button key={opt} onClick={() => { setSort(opt); setSortOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 font-dm text-xs transition-colors ${
                    sort === opt ? "bg-[#111] text-white" : "text-[#111] hover:bg-[#F5F4F0]"
                  }`}>
                  {SORT_LABELS[opt]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-[#E0DED8]" />

        {/* Filtrar */}
        <button onClick={openFilterPanel}
          className="flex items-center gap-1.5 font-dm text-xs font-semibold text-[#111]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          <span>Filtrar</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#111] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Chips de filtros activos */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none bg-[#F5F4F0] border-b border-[#E0DED8]">
          {filters.sizes.map(s => (
            <button key={s} onClick={() => setFilters(prev => ({ ...prev, sizes: prev.sizes.filter(x => x !== s) }))}
              className="flex-shrink-0 flex items-center gap-1 font-dm text-[10px] font-semibold uppercase px-2.5 py-1 bg-[#111] text-white rounded-full">
              Talle {s}
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          ))}
          {(filters.priceMin !== null || filters.priceMax !== null) && (
            <button onClick={() => setFilters(prev => ({ ...prev, priceMin: null, priceMax: null }))}
              className="flex-shrink-0 flex items-center gap-1 font-dm text-[10px] font-semibold px-2.5 py-1 bg-[#111] text-white rounded-full">
              ${filters.priceMin?.toLocaleString("es-AR") ?? "0"} – ${filters.priceMax?.toLocaleString("es-AR") ?? "∞"}
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
          {filters.soloConStock && (
            <button onClick={() => setFilters(prev => ({ ...prev, soloConStock: false }))}
              className="flex-shrink-0 flex items-center gap-1 font-dm text-[10px] font-semibold px-2.5 py-1 bg-[#111] text-white rounded-full">
              Con stock
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
          <button onClick={clearFilters} className="flex-shrink-0 font-dm text-[10px] text-[#888] underline px-1 py-1">
            Limpiar todo
          </button>
        </div>
      )}

      {/* Contador */}
      <div className="px-4 py-2 border-b border-[#E0DED8] bg-white">
        <p className="font-dm text-xs text-[#888]">
          {displayProducts.length} {displayProducts.length === 1 ? "producto" : "productos"}
        </p>
      </div>

      {/* Grilla */}
      {displayProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
          <svg className="mb-4" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <p className="font-bebas text-3xl text-[#CCC] mb-2">SIN RESULTADOS</p>
          <p className="font-dm text-sm text-[#888] mb-6">Probá con otros filtros.</p>
          <button onClick={clearFilters}
            className="font-dm text-xs font-semibold uppercase tracking-widest px-6 py-3 bg-[#111] text-white rounded-sm hover:bg-[#333] transition-colors">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[1px] bg-[#E0DED8] mt-[1px]">
          {displayProducts.map((product, index) => {
            const totalStock = product.stockBySize
              ? Object.values(product.stockBySize).reduce((a, b) => a + b, 0)
              : (product.stock ?? 0);
            const sinStock = totalStock === 0;

            return (
              <button key={product.id} onClick={() => router.push(`/producto/${product.id}`)}
                className="bg-[#F5F4F0] flex flex-col text-left w-full hover:bg-[#ECEAE4] transition-colors">
                <div className="relative w-full aspect-square bg-[#ECEAE4] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="50vw"
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    className={`object-cover hover:scale-105 transition-transform duration-500 ${sinStock ? "opacity-50" : ""}`}
                  />
                  {sinStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-white/80 font-dm text-[10px] font-bold uppercase tracking-wider text-[#888] px-2.5 py-1 rounded-full">
                        Sin stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className="text-[10px] font-dm text-[#E63A2E] uppercase tracking-wider font-semibold mb-0.5">
                    {product.category ?? "Producto"}
                  </span>
                  <h2 className="font-dm font-semibold text-sm text-[#111] leading-tight">{product.name}</h2>
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1.5">
                      {product.sizes.map(s => {
                        const enStock = hasStockInSize(product, s);
                        return (
                          <span key={s} className={`font-dm text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                            enStock ? "border-[#CCC] text-[#444]" : "border-[#E8E6E0] text-[#CCC] line-through"
                          }`}>
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <p className="font-dm font-bold text-sm text-[#111] mt-2">
                    ${product.price.toLocaleString("es-AR")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Panel de filtros (bottom sheet) */}
      <div onClick={() => setFilterOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${filterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${filterOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#E0DED8] rounded-full" />
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0DED8]">
          <h2 className="font-bebas text-2xl tracking-tight text-[#111]">FILTRAR</h2>
          <button onClick={() => setFilterOpen(false)} className="p-1 text-[#888] hover:text-[#111]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-4 py-4 space-y-6 pb-8">

          {/* Talle */}
          <div>
            <p className="font-dm text-xs font-semibold uppercase tracking-wider text-[#888] mb-3">Talle</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(size => {
                const stockCount = sourceProducts.filter(p =>
                  (p.sizes ?? []).includes(size) && hasStockInSize(p, size)
                ).length;
                const selected = tempFilters.sizes.includes(size);
                const noStock = stockCount === 0 && !selected;
                return (
                  <button key={size} onClick={() => !noStock && toggleTempSize(size)} disabled={noStock}
                    className={`relative font-dm text-sm font-semibold px-4 py-2 border rounded-sm transition-all ${
                      selected ? "bg-[#111] text-white border-[#111]"
                      : noStock ? "border-[#E8E6E0] text-[#CCC] cursor-not-allowed"
                      : "border-[#E0DED8] text-[#111] hover:border-[#111]"
                    }`}>
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Precio */}
          <div>
            <p className="font-dm text-xs font-semibold uppercase tracking-wider text-[#888] mb-3">Rango de precio</p>
            <div className="flex items-center gap-3">
              {[
                { key: "priceMin", label: "Desde", placeholder: globalMin },
                { key: "priceMax", label: "Hasta", placeholder: globalMax },
              ].map(field => (
                <div key={field.key} className="flex-1">
                  <label className="font-dm text-[10px] text-[#AAA] uppercase tracking-wider block mb-1">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-dm text-xs text-[#888]">$</span>
                    <input type="number" min={0}
                      placeholder={field.placeholder.toLocaleString("es-AR")}
                      value={tempFilters[field.key as keyof Filters] as number ?? ""}
                      onChange={e => setTempFilters(prev => ({
                        ...prev,
                        [field.key]: e.target.value === "" ? null : Number(e.target.value),
                      }))}
                      className="w-full pl-6 pr-3 py-2.5 border border-[#E0DED8] rounded-sm font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solo con stock */}
          <button onClick={() => setTempFilters(prev => ({ ...prev, soloConStock: !prev.soloConStock }))}
            className="flex items-center justify-between w-full">
            <div>
              <p className="font-dm text-sm font-semibold text-[#111] text-left">Solo con stock disponible</p>
              <p className="font-dm text-[10px] text-[#888] text-left mt-0.5">Oculta productos sin unidades</p>
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${tempFilters.soloConStock ? "bg-[#111]" : "bg-[#E0DED8]"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${tempFilters.soloConStock ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </button>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#E0DED8] px-4 py-3 flex gap-2">
          <button onClick={clearFilters}
            className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:border-[#111] hover:text-[#111] transition-colors">
            Limpiar
          </button>
          <button onClick={applyFilters}
            className="flex-[2] bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:bg-[#333] transition-colors">
            Ver {previewCount} productos
          </button>
        </div>
      </div>

    </div>
  );
}
