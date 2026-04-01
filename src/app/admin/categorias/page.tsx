"use client";

import { useEffect, useState } from "react";

interface SubCategory {
  _id?: string;
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  highlight: boolean;
  subcategories: SubCategory[];
  order: number;
}

const EMPTY_FORM = {
  name: "", slug: "", highlight: false, order: 0,
  subcategories: [] as SubCategory[],
};

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newSub, setNewSub] = useState({ name: "", slug: "" });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(data => { setCategories(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setNewSub({ name: "", slug: "" }); setShowForm(true); };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, highlight: c.highlight, order: c.order, subcategories: c.subcategories ?? [] });
    setNewSub({ name: "", slug: "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) { alert("Nombre y slug son requeridos."); return; }
    setSaving(true);
    const body = { ...form, ...(editing ? { id: editing._id } : {}) };
    await fetch("/api/admin/categories", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setConfirmDelete(null); load();
  };

  const addSubcategory = () => {
    if (!newSub.name) return;
    const slug = newSub.slug || `${form.slug}/${slugify(newSub.name)}`;
    setForm(prev => ({ ...prev, subcategories: [...prev.subcategories, { name: newSub.name, slug }] }));
    setNewSub({ name: "", slug: "" });
  };

  const removeSubcategory = (index: number) => {
    setForm(prev => ({ ...prev, subcategories: prev.subcategories.filter((_, i) => i !== index) }));
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
          <h1 className="font-bebas text-4xl tracking-tight text-[#111]">CATEGORÍAS</h1>
          <p className="font-dm text-sm text-[#888] mt-0.5">{categories.length} categorías</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-[#333] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E0DED8] rounded-sm">
          <p className="font-bebas text-2xl text-[#CCC] mb-2">SIN CATEGORÍAS</p>
          <p className="font-dm text-sm text-[#888] mb-4">Creá tu primera categoría.</p>
          <button onClick={openCreate} className="font-dm text-xs font-semibold uppercase tracking-widest px-6 py-3 bg-[#111] text-white rounded-sm hover:bg-[#333] transition-colors">Agregar categoría</button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat._id} className="bg-white border border-[#E0DED8] rounded-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-dm font-semibold text-sm text-[#111]">{cat.name}</h3>
                  {cat.highlight && <span className="bg-[#E63A2E] text-white font-dm text-[9px] font-bold px-2 py-0.5 rounded-full">DESTACADA</span>}
                  <span className="font-dm text-[10px] text-[#AAA]">/{cat.slug}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(cat)}
                    className="font-dm text-xs font-semibold uppercase tracking-wider py-1.5 px-3 border border-[#111] text-[#111] hover:bg-[#111] hover:text-white transition-colors rounded-sm">
                    Editar
                  </button>
                  <button onClick={() => setConfirmDelete(cat._id)}
                    className="font-dm text-xs font-semibold uppercase tracking-wider py-1.5 px-3 border border-[#E63A2E] text-[#E63A2E] hover:bg-[#E63A2E] hover:text-white transition-colors rounded-sm">
                    Eliminar
                  </button>
                </div>
              </div>
              {cat.subcategories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub, i) => (
                    <span key={i} className="font-dm text-[10px] text-[#444] border border-[#E0DED8] px-2 py-0.5 rounded-full">
                      {sub.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal eliminar */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setConfirmDelete(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-sm shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bebas text-2xl text-[#111] mb-1">ELIMINAR CATEGORÍA</h3>
            <p className="font-dm text-sm text-[#888] mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3 rounded-sm">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-[#E63A2E] text-white font-dm font-semibold text-xs uppercase tracking-widest py-3 rounded-sm hover:bg-red-700 transition-colors">Eliminar</button>
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
              <h2 className="font-bebas text-2xl tracking-tight text-[#111]">{editing ? "EDITAR CATEGORÍA" : "NUEVA CATEGORÍA"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#888] hover:text-[#111] p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 flex-1">

              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Nombre</label>
                <input type="text" value={form.name}
                  onChange={e => { setForm(prev => ({ ...prev, name: e.target.value, slug: editing ? prev.slug : slugify(e.target.value) })); }}
                  placeholder="Ej: Hombre"
                  className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors"
                />
              </div>

              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Slug (URL)</label>
                <input type="text" value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                  placeholder="Ej: hombre"
                  className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors"
                />
              </div>

              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Orden</label>
                <input type="number" value={form.order}
                  onChange={e => setForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors"
                />
              </div>

              <div className="border border-[#E0DED8] rounded-sm px-4">
                <Toggle label="Destacada (mostrar en rojo en el menú)" value={form.highlight} onChange={() => setForm(p => ({ ...p, highlight: !p.highlight }))} />
              </div>

              {/* Subcategorías */}
              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-2">Subcategorías</label>

                {form.subcategories.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {form.subcategories.map((sub, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#F5F4F0] px-3 py-2 rounded-sm">
                        <div>
                          <span className="font-dm text-sm text-[#111] font-semibold">{sub.name}</span>
                          <span className="font-dm text-[10px] text-[#AAA] ml-2">/{sub.slug}</span>
                        </div>
                        <button onClick={() => removeSubcategory(i)} className="text-[#CCC] hover:text-[#E63A2E] transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input type="text" value={newSub.name}
                    onChange={e => setNewSub(prev => ({ ...prev, name: e.target.value, slug: `${form.slug}/${slugify(e.target.value)}` }))}
                    onKeyDown={e => e.key === "Enter" && addSubcategory()}
                    placeholder="Nombre de subcategoría"
                    className="flex-1 border border-[#E0DED8] px-3 py-2.5 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors"
                  />
                  <button onClick={addSubcategory}
                    className="bg-[#111] text-white font-dm text-xs font-semibold px-4 py-2.5 rounded-sm hover:bg-[#333] transition-colors">
                    + Agregar
                  </button>
                </div>
                <p className="font-dm text-[10px] text-[#AAA] mt-1">Presioná Enter o el botón para agregar</p>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#E0DED8] sticky bottom-0 bg-white flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:border-[#111] transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-[2] bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50">
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear categoría"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
