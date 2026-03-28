"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const EMPTY_FORM = {
  name: "", price: "", image: "", category: "Camisacos",
  description: "", sizes: [] as string[],
  stockBySize: {} as Record<string, number>,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/products")
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      image: p.image,
      category: p.category ?? "Camisacos",
      description: p.description ?? "",
      sizes: p.sizes ?? [],
      stockBySize: p.stockBySize ?? {},
    });
    setShowForm(true);
  };

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.image) {
      alert("Nombre, precio e imagen son requeridos.");
      return;
    }
    setSaving(true);
    const body = { ...form, price: Number(form.price), ...(editing ? { id: editing._id } : {}) };
    const method = editing ? "PUT" : "POST";
    await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeletingId(null);
    setConfirmDelete(null);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-4xl tracking-tight text-[#111]">PRODUCTOS</h1>
          <p className="font-dm text-sm text-[#888] mt-0.5">{products.length} productos</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-[#333] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nuevo producto
        </button>
      </div>

      {/* Grilla de productos */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E0DED8] rounded-sm">
          <p className="font-bebas text-2xl text-[#CCC] mb-2">SIN PRODUCTOS</p>
          <p className="font-dm text-sm text-[#888] mb-4">Creá tu primer producto.</p>
          <button onClick={openCreate}
            className="font-dm text-xs font-semibold uppercase tracking-widest px-6 py-3 bg-[#111] text-white rounded-sm hover:bg-[#333] transition-colors">
            Agregar producto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => {
            const totalStock = product.stockBySize
              ? Object.values(product.stockBySize as Record<string, number>).reduce((a: number, b: any) => a + Number(b), 0)
              : 0;

            return (
              <div key={product._id} className="bg-white border border-[#E0DED8] rounded-sm overflow-hidden">
                <div className="relative aspect-square bg-[#ECEAE4]">
                  {product.image && (
                    <Image src={product.image} alt={product.name} fill sizes="300px" className="object-cover" />
                  )}
                  {totalStock === 0 && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="bg-white font-dm text-xs font-bold uppercase px-3 py-1 rounded-full text-[#E63A2E]">
                        Sin stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="font-dm text-[10px] text-[#E63A2E] uppercase tracking-wider font-semibold">
                    {product.category}
                  </span>
                  <h3 className="font-dm font-semibold text-sm text-[#111] mt-0.5">{product.name}</h3>
                  <p className="font-dm font-bold text-base text-[#111] mt-1">
                    ${Number(product.price).toLocaleString("es-AR")}
                  </p>

                  {/* Stock por talle */}
                  {product.sizes?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {product.sizes.map((size: string) => {
                        const stock = Number(product.stockBySize?.[size] ?? 0);
                        return (
                          <div key={size} className={`font-dm text-[10px] font-semibold px-1.5 py-0.5 border rounded-sm ${
                            stock === 0 ? "border-[#E8E6E0] text-[#CCC]" :
                            stock <= 2 ? "border-[#E63A2E] text-[#E63A2E]" :
                            "border-[#E0DED8] text-[#444]"
                          }`}>
                            {size} ({stock})
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEdit(product)}
                      className="flex-1 font-dm text-xs font-semibold uppercase tracking-wider py-2 border border-[#111] text-[#111] hover:bg-[#111] hover:text-white transition-colors rounded-sm">
                      Editar
                    </button>
                    <button onClick={() => setConfirmDelete(product._id)}
                      className="flex-1 font-dm text-xs font-semibold uppercase tracking-wider py-2 border border-[#E63A2E] text-[#E63A2E] hover:bg-[#E63A2E] hover:text-white transition-colors rounded-sm">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setConfirmDelete(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-sm shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bebas text-2xl text-[#111] mb-1">ELIMINAR PRODUCTO</h3>
            <p className="font-dm text-sm text-[#888] mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3 rounded-sm hover:border-[#111] transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deletingId === confirmDelete}
                className="flex-1 bg-[#E63A2E] text-white font-dm font-semibold text-xs uppercase tracking-widest py-3 rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                {deletingId === confirmDelete ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Panel crear/editar */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowForm(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-y-auto">

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0DED8] sticky top-0 bg-white">
              <h2 className="font-bebas text-2xl tracking-tight text-[#111]">
                {editing ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-[#888] hover:text-[#111] p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 flex-1">

              {[
                { key: "name", label: "Nombre del producto", placeholder: "Ej: Camisaco Oversize Marrón" },
                { key: "price", label: "Precio (ARS)", placeholder: "Ej: 15000", type: "number" },
                { key: "image", label: "Imagen principal (ruta)", placeholder: "Ej: /camisaco.png" },
                { key: "category", label: "Categoría", placeholder: "Ej: Camisacos" },
                { key: "description", label: "Descripción corta", placeholder: "Para la card del producto" },
              ].map(field => (
                <div key={field.key}>
                  <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">{field.label}</label>
                  <input
                    type={field.type ?? "text"}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors"
                  />
                </div>
              ))}

              {/* Vista previa de imagen */}
              {form.image && (
                <div className="relative w-full aspect-square bg-[#ECEAE4] rounded-sm overflow-hidden">
                  <Image src={form.image} alt="Preview" fill sizes="400px" className="object-cover" />
                </div>
              )}

              {/* Talles */}
              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-2">Talles disponibles</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <button key={size} type="button" onClick={() => toggleSize(size)}
                      className={`font-dm text-sm font-semibold px-4 py-2 border rounded-sm transition-all ${
                        form.sizes.includes(size)
                          ? "bg-[#111] text-white border-[#111]"
                          : "border-[#E0DED8] text-[#888] hover:border-[#111]"
                      }`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock por talle */}
              {form.sizes.length > 0 && (
                <div>
                  <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-2">Stock por talle</label>
                  <div className="grid grid-cols-3 gap-2">
                    {form.sizes.map(size => (
                      <div key={size}>
                        <label className="font-dm text-xs text-[#888] block mb-1 text-center">{size}</label>
                        <input
                          type="number"
                          min="0"
                          value={form.stockBySize[size] ?? 0}
                          onChange={e => setForm(prev => ({
                            ...prev,
                            stockBySize: { ...prev.stockBySize, [size]: Number(e.target.value) }
                          }))}
                          className="w-full border border-[#E0DED8] px-3 py-2 font-dm text-sm text-center text-[#111] focus:outline-none focus:border-[#111] rounded-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#E0DED8] sticky bottom-0 bg-white flex gap-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:border-[#111] transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-[2] bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50">
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
