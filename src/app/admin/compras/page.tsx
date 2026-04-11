"use client";

import { useEffect, useState } from "react";

const CATEGORIAS = ["Remera", "Buzo", "Pantalón", "Camiseta Fútbol", "Short Básket", "Short Fútbol", "Otro"];
const TALLES    = ["XS", "S", "M", "L", "XL", "XXL", "Único"];
const EMPTY_ITEM = { name: "", category: "", size: "", quantity: "", unitCost: "", subtotal: 0 };
const EMPTY_FORM = {
  supplier: "", date: new Date().toISOString().slice(0, 10), reference: "",
  items: [{ ...EMPTY_ITEM }], packagingUnit: "", shipping: "", otherExtras: "", notes: "",
};

type Item = { name: string; category: string; size: string; quantity: string; unitCost: string; subtotal: number };
type Form = typeof EMPTY_FORM & { items: Item[] };

const fmt = (n: number) => `$${Math.round(n).toLocaleString("es-AR")}`;

// Costo real por unidad = costo de compra + packaging + parte proporcional del flete/otros
function enrichItems(items: any[], packagingUnit: number, shipping: number, otherExtras: number) {
  const subtotalMerc = items.reduce((a, it) => a + (Number(it.quantity)||0)*(Number(it.unitCost)||0), 0);
  return items.map(it => {
    const qty  = Number(it.quantity) || 0;
    const cost = Number(it.unitCost) || 0;
    const prop = subtotalMerc > 0 ? (qty * cost) / subtotalMerc : 1 / (items.length || 1);
    const fletePorUnidad = qty > 0 ? ((shipping + otherExtras) * prop) / qty : 0;
    const costoRealUnit  = cost + packagingUnit + fletePorUnidad;
    return { ...it, costoRealUnit, precioSugerido: costoRealUnit * 2.5 };
  });
}

function calcTotals(form: Form) {
  const subtotalItems = form.items.reduce((a, it) => a + (Number(it.quantity)||0)*(Number(it.unitCost)||0), 0);
  const totalUnits    = form.items.reduce((a, it) => a + (Number(it.quantity)||0), 0);
  const packaging     = (Number(form.packagingUnit)||0) * totalUnits;
  const totalAmount   = subtotalItems + packaging + (Number(form.shipping)||0) + (Number(form.otherExtras)||0);
  return { subtotalItems, totalUnits, packaging, totalAmount };
}

export default function AdminComprasPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<any|null>(null);
  const [form, setForm]           = useState<Form>({ ...EMPTY_FORM, items: [{ ...EMPTY_ITEM }] });
  const [saving, setSaving]       = useState(false);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null);
  const [deletingId, setDeletingId]       = useState<string|null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/purchases").then(r => r.json())
      .then(data => { setPurchases(Array.isArray(data) ? data : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const totalInvertido = purchases.reduce((a, p) => a + p.totalAmount, 0);
  const totalUnidades  = purchases.reduce((a, p) => a + p.totalUnits, 0);
  const thisMonth      = purchases.filter(p => {
    const d = new Date(p.date), n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).reduce((a, p) => a + p.totalAmount, 0);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM, items: [{ ...EMPTY_ITEM }] }); setShowForm(true); };
  const openEdit   = (p: any) => {
    setEditing(p);
    setForm({
      supplier: p.supplier, date: new Date(p.date).toISOString().slice(0,10), reference: p.reference||"",
      items: p.items.map((it: any) => ({ name: it.name, category: it.category, size: it.size,
        quantity: String(it.quantity), unitCost: String(it.unitCost), subtotal: it.subtotal })),
      packagingUnit: p.packagingUnit ? String(p.packagingUnit) : "",
      shipping: p.shipping ? String(p.shipping) : "",
      otherExtras: p.otherExtras ? String(p.otherExtras) : "",
      notes: p.notes||"",
    });
    setShowForm(true);
  };

  const updateItem = (idx: number, field: keyof Item, value: string) => {
    setForm(prev => ({ ...prev, items: prev.items.map((it, i) => {
      if (i !== idx) return it;
      const u = { ...it, [field]: value };
      u.subtotal = (Number(u.quantity)||0) * (Number(u.unitCost)||0);
      return u;
    })}));
  };

  const addItem    = () => setForm(p => ({ ...p, items: [...p.items, { ...EMPTY_ITEM }] }));
  const removeItem = (idx: number) => setForm(p => ({ ...p, items: p.items.filter((_,i) => i !== idx) }));

  const totals      = calcTotals(form);
  const previewRows = enrichItems(form.items, Number(form.packagingUnit)||0, Number(form.shipping)||0, Number(form.otherExtras)||0);

  const handleSave = async () => {
    if (!form.supplier) { alert("Ingresá el proveedor."); return; }
    const valid = form.items.filter(it => it.name && Number(it.quantity) > 0);
    if (!valid.length) { alert("Completá al menos un producto con nombre y cantidad."); return; }
    setSaving(true);
    const t   = calcTotals({ ...form, items: valid });
    const pkg = Number(form.packagingUnit)||0, ship = Number(form.shipping)||0, other = Number(form.otherExtras)||0;
    const enriched = enrichItems(valid, pkg, ship, other);
    const body = {
      supplier: form.supplier, date: form.date, reference: form.reference,
      items: enriched.map(it => ({
        name: it.name, category: it.category, size: it.size,
        quantity: Number(it.quantity), unitCost: Number(it.unitCost),
        subtotal: Number(it.quantity)*Number(it.unitCost),
        costoRealUnit: it.costoRealUnit, precioSugerido: it.precioSugerido,
      })),
      packagingUnit: pkg, shipping: ship, otherExtras: other,
      subtotalItems: t.subtotalItems, totalAmount: t.totalAmount, totalUnits: t.totalUnits,
      avgUnitCost: t.totalUnits > 0 ? t.totalAmount/t.totalUnits : 0,
      notes: form.notes,
    };
    try {
      const res = await fetch("/api/admin/purchases", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing._id, ...body } : body),
      });
      const data = await res.json();
      if (!res.ok) { alert("Error: " + (data.error||res.status)); setSaving(false); return; }
      setShowForm(false); load();
    } catch (e: any) { alert("Error de red: " + e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch("/api/admin/purchases", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDeletingId(null); setConfirmDelete(null); load();
  };

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bebas text-4xl tracking-tight text-[#111]">COMPRAS</h1>
          <p className="font-dm text-sm text-[#888] mt-0.5">Registrá cada compra con el costo real y precio sugerido por producto</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-[#333] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nueva compra
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total invertido",    value: fmt(totalInvertido),        color: "text-[#111]" },
          { label: "Este mes",           value: fmt(thisMonth),             color: "text-[#E63A2E]" },
          { label: "Unidades compradas", value: String(totalUnidades),      color: "text-[#111]" },
          { label: "Órdenes de compra",  value: String(purchases.length),   color: "text-[#2A7D4F]" },
        ].map(c => (
          <div key={c.label} className="bg-white border border-[#E0DED8] rounded-sm p-4">
            <p className="font-dm text-xs text-[#888] uppercase tracking-wider mb-2">{c.label}</p>
            <p className={`font-bebas text-3xl tracking-tight ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin"/></div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E0DED8] rounded-sm">
          <p className="font-bebas text-2xl text-[#CCC] mb-2">SIN COMPRAS REGISTRADAS</p>
          <p className="font-dm text-sm text-[#888] mb-5">Registrá tu primera compra de mercadería.</p>
          <button onClick={openCreate} className="font-dm text-xs font-semibold uppercase tracking-widest px-6 py-3 bg-[#111] text-white rounded-sm hover:bg-[#333] transition-colors">Registrar compra</button>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map(p => {
            const isOpen = expandedId === p._id;
            const itemsEnriched = enrichItems(p.items||[], p.packagingUnit||0, p.shipping||0, p.otherExtras||0);
            return (
              <div key={p._id} className="bg-white border border-[#E0DED8] rounded-sm overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#FAFAF8] transition-colors"
                  onClick={() => setExpandedId(isOpen ? null : p._id)}>
                  <div className="shrink-0 w-14 text-center">
                    <p className="font-bebas text-xl text-[#111] leading-none">{new Date(p.date).getDate().toString().padStart(2,"0")}</p>
                    <p className="font-dm text-[10px] text-[#888] uppercase">{new Date(p.date).toLocaleDateString("es-AR",{month:"short"})}</p>
                    <p className="font-dm text-[10px] text-[#888]">{new Date(p.date).getFullYear()}</p>
                  </div>
                  <div className="w-px h-10 bg-[#E0DED8] shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-dm font-bold text-sm text-[#111]">{p.supplier}</p>
                      {p.reference && <span className="font-dm text-[10px] text-[#888] border border-[#E0DED8] px-2 py-0.5 rounded-full">#{p.reference}</span>}
                    </div>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      <span className="font-dm text-xs text-[#888]">{p.totalUnits} unidades</span>
                      <span className="font-dm text-xs text-[#888]">·</span>
                      <span className="font-dm text-xs text-[#888]">{p.items?.length} productos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <p className="font-bebas text-2xl text-[#111]">{fmt(p.totalAmount)}</p>
                    <div className="flex gap-1.5">
                      <button onClick={e => { e.stopPropagation(); openEdit(p); }}
                        className="font-dm text-xs font-semibold px-3 py-1.5 border border-[#E0DED8] text-[#666] hover:border-[#111] hover:text-[#111] rounded-sm transition-colors">Editar</button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete(p._id); }}
                        className="font-dm text-xs font-semibold px-3 py-1.5 border border-[#E63A2E] text-[#E63A2E] hover:bg-[#E63A2E] hover:text-white rounded-sm transition-colors">Borrar</button>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2" className={`transition-transform shrink-0 ${isOpen?"rotate-180":""}`}><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-[#F0EDE6] px-5 py-4 bg-[#FAFAF8] space-y-4">
                    <div>
                      <p className="font-dm text-xs font-bold text-[#888] uppercase tracking-wider mb-3">Costo y precio sugerido por producto</p>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#E0DED8]">
                              {["Producto","Cat.","Talle","Cant.","Costo compra","Costo real unit.","Precio sugerido ×2.5","Subtotal"].map(h => (
                                <th key={h} className="text-left font-dm text-[10px] text-[#888] uppercase tracking-wider pb-2 pr-3 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0EDE6]">
                            {itemsEnriched.map((it: any, i: number) => (
                              <tr key={i} className="hover:bg-white transition-colors">
                                <td className="py-2.5 pr-3 font-dm text-sm font-semibold text-[#111] whitespace-nowrap">{it.name}</td>
                                <td className="py-2.5 pr-3 font-dm text-xs text-[#666]">{it.category||"—"}</td>
                                <td className="py-2.5 pr-3 font-dm text-xs text-[#666]">{it.size||"—"}</td>
                                <td className="py-2.5 pr-3 font-dm text-sm text-[#111] text-center">{it.quantity}</td>
                                <td className="py-2.5 pr-3 font-dm text-sm text-[#888]">{fmt(Number(it.unitCost))}</td>
                                <td className="py-2.5 pr-3"><span className="font-dm text-sm font-bold text-[#E63A2E]">{fmt(it.costoRealUnit)}</span></td>
                                <td className="py-2.5 pr-3"><span className="font-dm text-sm font-bold text-[#2A7D4F]">{fmt(it.precioSugerido)}</span></td>
                                <td className="py-2.5 font-dm text-sm font-bold text-[#111]">{fmt(Number(it.quantity)*Number(it.unitCost))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(p.packagingUnit > 0 || p.shipping > 0 || p.otherExtras > 0) && (
                        <div className="space-y-1.5">
                          <p className="font-dm text-xs font-bold text-[#888] uppercase tracking-wider mb-2">Extras del lote</p>
                          {p.packagingUnit > 0 && <div className="flex justify-between"><span className="font-dm text-xs text-[#888]">Packaging × {p.totalUnits} u.</span><span className="font-dm text-xs font-semibold text-[#111]">{fmt(p.packagingUnit*p.totalUnits)}</span></div>}
                          {p.shipping > 0 && <div className="flex justify-between"><span className="font-dm text-xs text-[#888]">Envío / flete</span><span className="font-dm text-xs font-semibold text-[#111]">{fmt(p.shipping)}</span></div>}
                          {p.otherExtras > 0 && <div className="flex justify-between"><span className="font-dm text-xs text-[#888]">Otros</span><span className="font-dm text-xs font-semibold text-[#111]">{fmt(p.otherExtras)}</span></div>}
                          <p className="font-dm text-[10px] text-[#AAA] italic">* El flete se distribuye proporcionalmente al valor de cada producto</p>
                        </div>
                      )}
                      <div className="bg-white border border-[#E0DED8] rounded-sm p-3 space-y-2">
                        <div className="flex justify-between"><span className="font-dm text-xs text-[#888]">Subtotal mercadería</span><span className="font-dm text-xs font-semibold text-[#111]">{fmt(p.subtotalItems)}</span></div>
                        <div className="flex justify-between border-t border-[#F0EDE6] pt-2"><span className="font-dm text-xs font-bold text-[#111] uppercase tracking-wider">Total invertido</span><span className="font-dm text-sm font-bold text-[#111]">{fmt(p.totalAmount)}</span></div>
                      </div>
                    </div>
                    {p.notes && <p className="font-dm text-xs text-[#888] italic">📝 {p.notes}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setConfirmDelete(null)}/>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-sm shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bebas text-2xl text-[#111] mb-1">ELIMINAR COMPRA</h3>
            <p className="font-dm text-sm text-[#888] mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3 rounded-sm hover:border-[#111] transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={!!deletingId} className="flex-1 bg-[#E63A2E] text-white font-dm font-semibold text-xs uppercase tracking-widest py-3 rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50">{deletingId?"Eliminando...":"Eliminar"}</button>
            </div>
          </div>
        </>
      )}

      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowForm(false)}/>
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0DED8] shrink-0">
              <h2 className="font-bebas text-2xl tracking-tight text-[#111]">{editing?"EDITAR COMPRA":"NUEVA COMPRA"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#888] hover:text-[#111] p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 space-y-6">

                {/* Paso 1 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#111] text-white font-dm text-xs font-bold flex items-center justify-center shrink-0">1</span>
                    <h3 className="font-dm text-sm font-bold text-[#111] uppercase tracking-wider">Información de la compra</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Proveedor / Local *</label>
                      <input type="text" value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} placeholder="Ej: La Salada, Local Tandil" className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm"/>
                    </div>
                    <div>
                      <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Fecha *</label>
                      <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm"/>
                    </div>
                    <div>
                      <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">N° referencia</label>
                      <input type="text" value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} placeholder="Ej: Factura A-001" className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm"/>
                    </div>
                  </div>
                </div>

                {/* Paso 2 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#111] text-white font-dm text-xs font-bold flex items-center justify-center shrink-0">2</span>
                      <h3 className="font-dm text-sm font-bold text-[#111] uppercase tracking-wider">Productos</h3>
                    </div>
                    <span className="font-dm text-xs text-[#888]">{totals.totalUnits} u. · {fmt(totals.subtotalItems)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="hidden sm:grid grid-cols-12 gap-2 px-1">
                      {["Producto *","Cat.","Talle","Cant.","Costo unit.","Subtotal",""].map((h,i) => (
                        <div key={i} className={`font-dm text-[10px] text-[#888] uppercase tracking-wider ${i===0?"col-span-3":i===1?"col-span-2":i===2?"col-span-2":i===3?"col-span-1":i===4?"col-span-2":i===5?"col-span-1":"col-span-1"}`}>{h}</div>
                      ))}
                    </div>
                    {form.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#FAFAF8] border border-[#E0DED8] rounded-sm p-2">
                        <input type="text" value={item.name} onChange={e => updateItem(idx,"name",e.target.value)} placeholder="Nombre" className="col-span-12 sm:col-span-3 border border-[#E0DED8] px-3 py-2 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm bg-white"/>
                        <select value={item.category} onChange={e => updateItem(idx,"category",e.target.value)} className="col-span-6 sm:col-span-2 border border-[#E0DED8] px-2 py-2 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm bg-white">
                          <option value="">Cat.</option>{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={item.size} onChange={e => updateItem(idx,"size",e.target.value)} className="col-span-6 sm:col-span-2 border border-[#E0DED8] px-2 py-2 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm bg-white">
                          <option value="">Talle</option>{TALLES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx,"quantity",e.target.value)} placeholder="0" className="col-span-4 sm:col-span-1 border border-[#E0DED8] px-2 py-2 font-dm text-sm text-[#111] text-center focus:outline-none focus:border-[#111] rounded-sm bg-white"/>
                        <input type="number" min="0" value={item.unitCost} onChange={e => updateItem(idx,"unitCost",e.target.value)} placeholder="$0" className="col-span-5 sm:col-span-2 border border-[#E0DED8] px-2 py-2 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm bg-white"/>
                        <div className="col-span-2 sm:col-span-1 font-dm text-sm font-bold text-[#111] text-right px-1">{item.subtotal > 0 ? fmt(item.subtotal) : "—"}</div>
                        <button type="button" onClick={() => removeItem(idx)} disabled={form.items.length===1} className="col-span-1 flex justify-center text-[#CCC] hover:text-[#E63A2E] transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addItem} className="flex items-center gap-2 font-dm text-xs font-semibold text-[#888] hover:text-[#111] transition-colors mt-1 px-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                      Agregar otro producto
                    </button>
                  </div>
                </div>

                {/* Paso 3 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#111] text-white font-dm text-xs font-bold flex items-center justify-center shrink-0">3</span>
                    <h3 className="font-dm text-sm font-bold text-[#111] uppercase tracking-wider">Extras del lote</h3>
                    <span className="font-dm text-xs text-[#888]">(se distribuyen entre los productos)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Packaging / unidad</label>
                      <input type="number" min="0" value={form.packagingUnit} onChange={e => setForm(p => ({ ...p, packagingUnit: e.target.value }))} placeholder="$0" className="w-full border border-[#E0DED8] px-3 py-2.5 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm"/>
                      {Number(form.packagingUnit) > 0 && totals.totalUnits > 0 && <p className="font-dm text-[10px] text-[#888] mt-1">= {fmt(Number(form.packagingUnit)*totals.totalUnits)} total</p>}
                    </div>
                    <div>
                      <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Envío / flete total</label>
                      <input type="number" min="0" value={form.shipping} onChange={e => setForm(p => ({ ...p, shipping: e.target.value }))} placeholder="$0" className="w-full border border-[#E0DED8] px-3 py-2.5 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm"/>
                    </div>
                    <div>
                      <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Otros gastos</label>
                      <input type="number" min="0" value={form.otherExtras} onChange={e => setForm(p => ({ ...p, otherExtras: e.target.value }))} placeholder="$0" className="w-full border border-[#E0DED8] px-3 py-2.5 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm"/>
                    </div>
                  </div>
                </div>

                {/* Paso 4 — Preview por producto */}
                {totals.subtotalItems > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-[#2A7D4F] text-white font-dm text-xs font-bold flex items-center justify-center shrink-0">✓</span>
                      <h3 className="font-dm text-sm font-bold text-[#111] uppercase tracking-wider">Precio sugerido por producto</h3>
                    </div>
                    <div className="bg-[#F5F4F0] rounded-sm overflow-hidden border border-[#E0DED8]">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#E0DED8]">
                            {["Producto","Costo compra","+ Extras","Costo real","Sugerido ×2.5"].map(h => (
                              <th key={h} className="text-left font-dm text-[10px] text-[#888] uppercase tracking-wider px-3 py-2">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E6E0]">
                          {previewRows.filter(it => it.name && Number(it.quantity) > 0).map((it, i) => (
                            <tr key={i} className="bg-white">
                              <td className="px-3 py-2.5 font-dm text-sm font-semibold text-[#111]">{it.name}</td>
                              <td className="px-3 py-2.5 font-dm text-sm text-[#888]">{fmt(Number(it.unitCost))}</td>
                              <td className="px-3 py-2.5 font-dm text-sm text-[#888]">{fmt(it.costoRealUnit - Number(it.unitCost))}</td>
                              <td className="px-3 py-2.5 font-dm text-sm font-bold text-[#E63A2E]">{fmt(it.costoRealUnit)}</td>
                              <td className="px-3 py-2.5 font-dm text-sm font-bold text-[#2A7D4F]">{fmt(it.precioSugerido)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-3 py-2.5 flex justify-between items-center border-t border-[#E0DED8] bg-[#F5F4F0]">
                        <span className="font-dm text-xs font-bold text-[#888] uppercase tracking-wider">Total del lote</span>
                        <span className="font-bebas text-xl text-[#111]">{fmt(totals.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Notas (opcional)</label>
                  <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Ej: Compra temporada verano" className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm"/>
                </div>

              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E0DED8] shrink-0 flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:border-[#111] transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-[2] bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50">
                {saving ? "Guardando..." : editing ? "Guardar cambios" : `Registrar compra${totals.totalAmount > 0 ? " · "+fmt(totals.totalAmount) : ""}`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
