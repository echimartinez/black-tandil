"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const TALLES_ORDER = ["XS","S","M","L","XL","XXL"];

function stockStatus(total: number) {
  if (total === 0) return { label: "Sin stock", color: "bg-red-50 text-red-600", dot: "bg-red-500" };
  if (total <= 3)  return { label: "Poco stock", color: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-400" };
  return { label: "OK", color: "bg-green-50 text-green-700", dot: "bg-green-500" };
}

type Product = {
  _id: string; name: string; category: string; image: string;
  price: number; sizes: string[]; stockBySize: Record<string, number>;
  active: boolean;
};

type EditingCell = { productId: string; size: string; value: string } | null;

export default function AdminStockPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingCell, setEditingCell]   = useState<EditingCell>(null);
  const [saving, setSaving]       = useState<string | null>(null); // productId-size
  const [savedCell, setSavedCell] = useState<string | null>(null); // flash verde
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/products").then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editingCell) inputRef.current?.focus();
  }, [editingCell]);

  // Categorías únicas
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // Todos los talles que existen en los productos filtrados
  const allSizes = TALLES_ORDER.filter(s =>
    products.some(p => p.sizes?.includes(s))
  );

  const getStock = (p: Product, size: string) =>
    Number(p.stockBySize?.[size] ?? 0);

  const totalStock = (p: Product) =>
    (p.sizes || []).reduce((a, s) => a + getStock(p, s), 0);

  // KPIs
  const totalUnits   = products.reduce((a, p) => a + totalStock(p), 0);
  const sinStock     = products.filter(p => totalStock(p) === 0).length;
  const pocoStock    = products.filter(p => { const t = totalStock(p); return t > 0 && t <= 3; }).length;
  const totalProductos = products.length;

  // Filtros
  const filtered = products.filter(p => {
    const matchSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === "all" || p.category === filterCat;
    const t = totalStock(p);
    const matchStatus = filterStatus === "all"
      || (filterStatus === "ok"    && t > 3)
      || (filterStatus === "poco"  && t > 0 && t <= 3)
      || (filterStatus === "sin"   && t === 0);
    return matchSearch && matchCat && matchStatus;
  });

  const startEdit = (productId: string, size: string, current: number) => {
    setEditingCell({ productId, size, value: String(current) });
  };

  const commitEdit = async () => {
    if (!editingCell) return;
    const { productId, size, value } = editingCell;
    const original = getStock(products.find(p => p._id === productId)!, size);
    if (Number(value) === original) { setEditingCell(null); return; }

    const key = `${productId}-${size}`;
    setSaving(key);
    try {
      const res = await fetch("/api/admin/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, size, value: Number(value) }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => {
          if (p._id !== productId) return p;
          return { ...p, stockBySize: { ...p.stockBySize, [size]: Math.max(0, Number(value)) } };
        }));
        setSavedCell(key);
        setTimeout(() => setSavedCell(null), 1500);
      }
    } catch {}
    setSaving(null);
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") setEditingCell(null);
  };

  const fmt = (n: number) => `$${n.toLocaleString("es-AR")}`;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bebas text-4xl tracking-tight text-[#111]">STOCK</h1>
          <p className="font-dm text-sm text-[#888] mt-0.5">
            Hacé clic en cualquier celda para editar el stock directamente
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 border border-[#E0DED8] text-[#666] font-dm font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:border-[#111] hover:text-[#111] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total productos",   value: String(totalProductos), color: "text-[#111]" },
          { label: "Unidades en stock", value: String(totalUnits),     color: "text-[#111]" },
          { label: "Sin stock",         value: String(sinStock),       color: sinStock > 0 ? "text-[#E63A2E]" : "text-[#111]" },
          { label: "Poco stock (≤3)",   value: String(pocoStock),      color: pocoStock > 0 ? "text-yellow-600" : "text-[#111]" },
        ].map(c => (
          <div key={c.label} className="bg-white border border-[#E0DED8] rounded-sm p-4">
            <p className="font-dm text-xs text-[#888] uppercase tracking-wider mb-2">{c.label}</p>
            <p className={`font-bebas text-3xl tracking-tight ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input type="text" placeholder="Buscar producto..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] border border-[#E0DED8] bg-white px-4 py-2.5 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-[#E0DED8] bg-white px-3 py-2.5 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm">
          {categories.map(c => <option key={c} value={c}>{c === "all" ? "Todas las categorías" : c}</option>)}
        </select>
        <div className="flex border border-[#E0DED8] rounded-sm overflow-hidden bg-white">
          {[
            { val: "all",  label: "Todos" },
            { val: "ok",   label: "✅ OK" },
            { val: "poco", label: "⚠️ Poco" },
            { val: "sin",  label: "⛔ Sin stock" },
          ].map(f => (
            <button key={f.val} onClick={() => setFilterStatus(f.val)}
              className={`px-3 py-2 font-dm text-xs font-semibold transition-colors ${
                filterStatus === f.val ? "bg-[#111] text-white" : "text-[#888] hover:text-[#111]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de stock */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E0DED8] rounded-sm">
          <p className="font-bebas text-2xl text-[#CCC] mb-2">SIN RESULTADOS</p>
          <p className="font-dm text-sm text-[#888]">Probá con otro filtro o búsqueda.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E0DED8] rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#111] bg-[#111]">
                  <th className="text-left font-dm text-xs text-white uppercase tracking-wider px-4 py-3 w-64">Producto</th>
                  <th className="text-left font-dm text-xs text-white uppercase tracking-wider px-3 py-3">Categoría</th>
                  <th className="text-left font-dm text-xs text-white uppercase tracking-wider px-3 py-3">Precio</th>
                  {allSizes.map(s => (
                    <th key={s} className="text-center font-dm text-xs text-white uppercase tracking-wider px-3 py-3 w-16">{s}</th>
                  ))}
                  <th className="text-center font-dm text-xs text-white uppercase tracking-wider px-3 py-3 w-20">Total</th>
                  <th className="text-center font-dm text-xs text-white uppercase tracking-wider px-3 py-3 w-28">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE6]">
                {filtered.map((p, rowIdx) => {
                  const total  = totalStock(p);
                  const status = stockStatus(total);
                  const rowBg  = rowIdx % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]";
                  return (
                    <tr key={p._id} className={`${rowBg} hover:bg-[#F5F4F0] transition-colors group`}>

                      {/* Producto */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image && (
                            <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-[#ECEAE4] shrink-0">
                              <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-dm text-sm font-semibold text-[#111] truncate max-w-[160px]">{p.name}</p>
                            {!p.active && <span className="font-dm text-[10px] text-[#AAA]">Inactivo</span>}
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="px-3 py-3">
                        <span className="font-dm text-xs text-[#E63A2E] font-semibold uppercase tracking-wider">{p.category}</span>
                      </td>

                      {/* Precio */}
                      <td className="px-3 py-3 font-dm text-sm font-bold text-[#111] whitespace-nowrap">{fmt(p.price)}</td>

                      {/* Celdas de stock por talle */}
                      {allSizes.map(size => {
                        const hasSize    = p.sizes?.includes(size);
                        const stock      = getStock(p, size);
                        const cellKey    = `${p._id}-${size}`;
                        const isEditing  = editingCell?.productId === p._id && editingCell?.size === size;
                        const isSaving   = saving === cellKey;
                        const justSaved  = savedCell === cellKey;

                        if (!hasSize) {
                          return (
                            <td key={size} className="px-3 py-3 text-center">
                              <span className="font-dm text-[#DDD] text-sm">—</span>
                            </td>
                          );
                        }

                        return (
                          <td key={size} className="px-3 py-3 text-center">
                            {isEditing ? (
                              <input
                                ref={inputRef}
                                type="number" min="0"
                                value={editingCell.value}
                                onChange={e => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
                                onBlur={commitEdit}
                                onKeyDown={handleKeyDown}
                                className="w-14 text-center border-2 border-[#111] px-1 py-1 font-dm text-sm font-bold text-[#111] focus:outline-none rounded-sm"
                              />
                            ) : (
                              <button
                                onClick={() => startEdit(p._id, size, stock)}
                                className={`w-10 h-8 rounded-sm font-dm text-sm font-bold transition-all relative ${
                                  justSaved ? "bg-green-100 text-green-700 scale-110" :
                                  isSaving  ? "bg-[#F5F4F0] text-[#AAA]" :
                                  stock === 0 ? "bg-red-50 text-red-400 hover:bg-red-100" :
                                  stock <= 3  ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" :
                                  "bg-[#F5F4F0] text-[#111] hover:bg-[#E8E6E0]"
                                }`}
                              >
                                {isSaving ? (
                                  <span className="flex items-center justify-center">
                                    <div className="w-3 h-3 border-2 border-[#AAA] border-t-transparent rounded-full animate-spin" />
                                  </span>
                                ) : justSaved ? "✓" : stock}
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Total */}
                      <td className="px-3 py-3 text-center">
                        <span className={`font-bebas text-xl ${
                          total === 0 ? "text-[#E63A2E]" : total <= 3 ? "text-yellow-600" : "text-[#111]"
                        }`}>{total}</span>
                      </td>

                      {/* Estado */}
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 font-dm text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer con totales por talle */}
              <tfoot>
                <tr className="border-t-2 border-[#111] bg-[#111]">
                  <td colSpan={3} className="px-4 py-3 font-dm text-xs font-bold text-white uppercase tracking-wider">
                    Total por talle
                  </td>
                  {allSizes.map(size => {
                    const total = filtered.reduce((a, p) =>
                      p.sizes?.includes(size) ? a + getStock(p, size) : a, 0);
                    return (
                      <td key={size} className="px-3 py-3 text-center">
                        <span className={`font-bebas text-lg ${total === 0 ? "text-[#E63A2E]" : "text-white"}`}>
                          {total}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center">
                    <span className="font-bebas text-lg text-white">
                      {filtered.reduce((a, p) => a + totalStock(p), 0)}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Hint edición */}
          <div className="px-4 py-2.5 border-t border-[#E0DED8] bg-[#FAFAF8] flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span className="font-dm text-xs text-[#AAA]">
              Clic en cualquier número para editarlo · Enter o Tab para confirmar · Escape para cancelar
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
