"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const EMPTY_FORM = {
  name: "", price: "", originalPrice: "", image: "", images: [] as string[], category: "",
  description: "", sizes: [] as string[],
  stockBySize: {} as Record<string, number>,
  sale: false, isNew: false, featured: false, active: true,
};

// ─── Cloudinary Upload ────────────────────────────────────────────────────────

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Error al subir imagen");
  const data = await res.json();
  return data.secure_url;
}

// ─── ImageUploader ────────────────────────────────────────────────────────────

function ImageUploader({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch {
      alert("Error al subir la imagen. Verificá las variables de Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">{label}</label>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className={`relative border-2 border-dashed rounded-sm cursor-pointer transition-colors flex items-center justify-center
          ${dragOver ? "border-[#111] bg-[#F5F4F0]" : "border-[#E0DED8] bg-white hover:border-[#AAA]"}
          ${value ? "aspect-square" : "h-32"}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
            <span className="font-dm text-xs text-[#888]">Subiendo...</span>
          </div>
        ) : value ? (
          <>
            <Image src={value} alt="Preview" fill sizes="400px" className="object-cover rounded-sm" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 rounded-sm">
              <span className="font-dm text-xs text-white font-semibold bg-black/50 px-3 py-1 rounded-full">Cambiar imagen</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <span className="font-dm text-xs text-[#888]">Arrastrá o hacé click para subir</span>
            <span className="font-dm text-[10px] text-[#CCC]">JPG, PNG, WEBP</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
    </div>
  );
}

// ─── MultiImageUploader ───────────────────────────────────────────────────────

function MultiImageUploader({
  values,
  onChange,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).filter(f => f.type.startsWith("image/")).map(uploadToCloudinary)
      );
      onChange([...values, ...uploaded]);
    } catch {
      alert("Error al subir alguna imagen.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">
        Galería de imágenes <span className="normal-case text-[#CCC]">(opcional, para el swipe)</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {values.map((url, idx) => (
          <div key={idx} className="relative aspect-square bg-[#ECEAE4] rounded-sm overflow-hidden group">
            <Image src={url} alt={`Imagen ${idx + 1}`} fill sizes="150px" className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 w-6 h-6 bg-[#E63A2E] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="aspect-square border-2 border-dashed border-[#E0DED8] rounded-sm flex flex-col items-center justify-center gap-1 hover:border-[#AAA] transition-colors"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              <span className="font-dm text-[9px] text-[#CCC]">Agregar</span>
            </>
          )}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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

  useEffect(() => {
    load();
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); });
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name, price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      image: p.image, images: p.images ?? [], category: p.category ?? "",
      description: p.description ?? "", sizes: p.sizes ?? [],
      stockBySize: p.stockBySize ?? {},
      sale: p.sale ?? false, isNew: p.isNew ?? false,
      featured: p.featured ?? false, active: p.active ?? true,
    });
    setShowForm(true);
  };

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.image) { alert("Nombre, precio e imagen son requeridos."); return; }
    setSaving(true);
    const body = { ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : null, ...(editing ? { id: editing._id } : {}) };
    await fetch("/api/admin/products", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDeletingId(null); setConfirmDelete(null); load();
  };

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange} className="flex items-center justify-between w-full py-2">
      <span className="font-dm text-sm text-[#111]">{label}</span>
      <div className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-[#111]" : "bg-[#E0DED8]"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-4xl tracking-tight text-[#111]">PRODUCTOS</h1>
          <p className="font-dm text-sm text-[#888] mt-0.5">{products.length} productos</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-[#333] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo producto
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E0DED8] rounded-sm">
          <p className="font-bebas text-2xl text-[#CCC] mb-2">SIN PRODUCTOS</p>
          <p className="font-dm text-sm text-[#888] mb-4">Creá tu primer producto.</p>
          <button onClick={openCreate} className="font-dm text-xs font-semibold uppercase tracking-widest px-6 py-3 bg-[#111] text-white rounded-sm hover:bg-[#333] transition-colors">Agregar producto</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => {
            const totalStock = product.stockBySize ? Object.values(product.stockBySize as Record<string, number>).reduce((a: number, b: any) => a + Number(b), 0) : 0;
            return (
              <div key={product._id} className="bg-white border border-[#E0DED8] rounded-sm overflow-hidden">
                <div className="relative aspect-square bg-[#ECEAE4]">
                  {product.image && <Image src={product.image} alt={product.name} fill sizes="300px" className="object-cover" />}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.sale && <span className="bg-[#E63A2E] text-white font-dm text-[9px] font-bold px-2 py-0.5 rounded-full">SALE</span>}
                    {product.isNew && <span className="bg-[#111] text-white font-dm text-[9px] font-bold px-2 py-0.5 rounded-full">NUEVO</span>}
                    {product.featured && <span className="bg-[#2A7D4F] text-white font-dm text-[9px] font-bold px-2 py-0.5 rounded-full">DESTACADO</span>}
                  </div>
                  {totalStock === 0 && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="bg-white font-dm text-xs font-bold uppercase px-3 py-1 rounded-full text-[#E63A2E]">Sin stock</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="font-dm text-[10px] text-[#E63A2E] uppercase tracking-wider font-semibold">{product.category}</span>
                  <h3 className="font-dm font-semibold text-sm text-[#111] mt-0.5">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-dm font-bold text-base text-[#111]">${Number(product.price).toLocaleString("es-AR")}</p>
                    {product.originalPrice && <p className="font-dm text-sm text-[#AAA] line-through">${Number(product.originalPrice).toLocaleString("es-AR")}</p>}
                  </div>
                  {product.sizes?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {product.sizes.map((size: string) => {
                        const stock = Number(product.stockBySize?.[size] ?? 0);
                        return (
                          <div key={size} className={`font-dm text-[10px] font-semibold px-1.5 py-0.5 border rounded-sm ${stock === 0 ? "border-[#E8E6E0] text-[#CCC]" : stock <= 2 ? "border-[#E63A2E] text-[#E63A2E]" : "border-[#E0DED8] text-[#444]"}`}>
                            {size} ({stock})
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEdit(product)} className="flex-1 font-dm text-xs font-semibold uppercase tracking-wider py-2 border border-[#111] text-[#111] hover:bg-[#111] hover:text-white transition-colors rounded-sm">Editar</button>
                    <button onClick={() => setConfirmDelete(product._id)} className="flex-1 font-dm text-xs font-semibold uppercase tracking-wider py-2 border border-[#E63A2E] text-[#E63A2E] hover:bg-[#E63A2E] hover:text-white transition-colors rounded-sm">Eliminar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setConfirmDelete(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-sm shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bebas text-2xl text-[#111] mb-1">ELIMINAR PRODUCTO</h3>
            <p className="font-dm text-sm text-[#888] mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3 rounded-sm hover:border-[#111] transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deletingId === confirmDelete} className="flex-1 bg-[#E63A2E] text-white font-dm font-semibold text-xs uppercase tracking-widest py-3 rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                {deletingId === confirmDelete ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </>
      )}

      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowForm(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0DED8] sticky top-0 bg-white">
              <h2 className="font-bebas text-2xl tracking-tight text-[#111]">{editing ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#888] hover:text-[#111] p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 flex-1">

              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Nombre del producto</label>
                <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ej: Camisaco Oversize Marrón" className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors" />
              </div>

              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Precio (ARS)</label>
                <input type="number" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} placeholder="Ej: 15000" className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors" />
              </div>

              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Precio original (antes del descuento)</label>
                <input type="number" value={form.originalPrice} onChange={e => setForm(prev => ({ ...prev, originalPrice: e.target.value }))} placeholder="Dejar vacío si no está en sale" className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors" />
              </div>

              {/* Imagen principal con Cloudinary */}
              <ImageUploader
                label="Imagen principal"
                value={form.image}
                onChange={(url) => setForm(prev => ({ ...prev, image: url }))}
              />

              {/* Galería adicional */}
              <MultiImageUploader
                values={form.images}
                onChange={(urls) => setForm(prev => ({ ...prev, images: urls }))}
              />

              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Categoría</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm transition-colors bg-white">
                  <option value="">Seleccioná una categoría</option>
                  {categories.map(cat =>
                    cat.subcategories?.map((sub: any) => (
                      <option key={sub.slug} value={`${cat.name} / ${sub.name}`}>{cat.name} / {sub.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Descripción corta</label>
                <input type="text" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Para la card del producto" className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors" />
              </div>

              <div className="border border-[#E0DED8] rounded-sm px-4 divide-y divide-[#E0DED8]">
                <Toggle label="Activo (visible en la tienda)" value={form.active} onChange={() => setForm(p => ({ ...p, active: !p.active }))} />
                <Toggle label="En SALE (aparece en sección de ofertas)" value={form.sale} onChange={() => setForm(p => ({ ...p, sale: !p.sale }))} />
                <Toggle label="Novedad (aparece en sección NUEVO)" value={form.isNew} onChange={() => setForm(p => ({ ...p, isNew: !p.isNew }))} />
                <Toggle label="Destacado (aparece en home)" value={form.featured} onChange={() => setForm(p => ({ ...p, featured: !p.featured }))} />
              </div>

              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-2">Talles disponibles</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <button key={size} type="button" onClick={() => toggleSize(size)}
                      className={`font-dm text-sm font-semibold px-4 py-2 border rounded-sm transition-all ${form.sizes.includes(size) ? "bg-[#111] text-white border-[#111]" : "border-[#E0DED8] text-[#888] hover:border-[#111]"}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {form.sizes.length > 0 && (
                <div>
                  <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-2">Stock por talle</label>
                  <div className="grid grid-cols-3 gap-2">
                    {form.sizes.map(size => (
                      <div key={size}>
                        <label className="font-dm text-xs text-[#888] block mb-1 text-center">{size}</label>
                        <input type="number" min="0" value={form.stockBySize[size] ?? 0}
                          onChange={e => setForm(prev => ({ ...prev, stockBySize: { ...prev.stockBySize, [size]: Number(e.target.value) } }))}
                          className="w-full border border-[#E0DED8] px-3 py-2 font-dm text-sm text-center text-[#111] focus:outline-none focus:border-[#111] rounded-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-[#E0DED8] sticky bottom-0 bg-white flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:border-[#111] transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-[2] bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50">
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
