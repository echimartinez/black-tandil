"use client";

import { useEffect, useState } from "react";

const CATEGORIAS_FIJOS = [
  "Envíos", "Marketing", "Plataforma / Web", "Insumos", "Servicios", "Transporte", "Otros",
];
const CATEGORIAS_PROD = [
  "Remera", "Buzo", "Pantalón", "Camiseta Fútbol", "Short Básket", "Short Fútbol",
];
const FRECUENCIAS = ["mensual", "trimestral", "semestral", "anual"];
const FREQ_MULT: Record<string, number> = { mensual: 12, trimestral: 4, semestral: 2, anual: 1 };

const EMPTY_FIJO = {
  type: "gasto_fijo",
  category: "",
  description: "",
  amount: "",
  frequency: "mensual",
  notes: "",
};
const EMPTY_PROD = {
  type: "costo_produccion",
  category: "",
  description: "",
  productName: "",
  costBreakdown: { material: "", estampado: "", confeccion: "", etiqueta: "", packaging: "", otros: "" },
  amount: 0,
  notes: "",
};

export default function AdminGastosPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"gastos_fijos" | "costos_prod">("gastos_fijos");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"gasto_fijo" | "costo_produccion">("gasto_fijo");
  const [editing, setEditing] = useState<any | null>(null);
  const [formFijo, setFormFijo] = useState<any>(EMPTY_FIJO);
  const [formProd, setFormProd] = useState<any>(EMPTY_PROD);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/expenses")
      .then(r => r.json())
      .then(data => { setExpenses(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const gastosFijos = expenses.filter(e => e.type === "gasto_fijo");
  const costosProd = expenses.filter(e => e.type === "costo_produccion");

  const totalMensual = gastosFijos.reduce((acc, e) => acc + (e.amount / (FREQ_MULT[e.frequency] || 12) * 1), 0);
  // Actually monthly = amount * freq_per_year / 12 if stored as per-period amount
  const totalMensualFixed = gastosFijos.reduce((acc, e) => {
    const perMonth = e.frequency === "mensual" ? e.amount
      : e.frequency === "trimestral" ? e.amount / 3
      : e.frequency === "semestral" ? e.amount / 6
      : e.amount / 12;
    return acc + perMonth;
  }, 0);
  const totalAnual = gastosFijos.reduce((acc, e) => {
    const perYear = e.frequency === "mensual" ? e.amount * 12
      : e.frequency === "trimestral" ? e.amount * 4
      : e.frequency === "semestral" ? e.amount * 2
      : e.amount;
    return acc + perYear;
  }, 0);

  const openCreateFijo = () => {
    setEditing(null); setFormFijo(EMPTY_FIJO); setFormType("gasto_fijo"); setShowForm(true);
  };
  const openCreateProd = () => {
    setEditing(null); setFormProd(EMPTY_PROD); setFormType("costo_produccion"); setShowForm(true);
  };
  const openEdit = (e: any) => {
    setEditing(e);
    setFormType(e.type);
    if (e.type === "gasto_fijo") {
      setFormFijo({ type: e.type, category: e.category, description: e.description, amount: String(e.amount), frequency: e.frequency, notes: e.notes || "" });
    } else {
      const cb = e.costBreakdown || {};
      setFormProd({
        type: e.type, category: e.category, description: e.description,
        productName: e.productName || "",
        costBreakdown: {
          material: cb.material || "", estampado: cb.estampado || "",
          confeccion: cb.confeccion || "", etiqueta: cb.etiqueta || "",
          packaging: cb.packaging || "", otros: cb.otros || "",
        },
        amount: e.amount, notes: e.notes || "",
      });
    }
    setShowForm(true);
  };

  const calcTotalProd = (cb: any) =>
    Object.values(cb).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    let body: any;
    if (formType === "gasto_fijo") {
      if (!formFijo.description || !formFijo.amount) { alert("Completá descripción y monto."); setSaving(false); return; }
      body = { ...formFijo, amount: Number(formFijo.amount) };
    } else {
      if (!formProd.productName) { alert("Completá el nombre del producto."); setSaving(false); return; }
      const cb = formProd.costBreakdown;
      const total = calcTotalProd(cb);
      body = {
        ...formProd,
        amount: total,
        costBreakdown: {
          material: Number(cb.material) || 0,
          estampado: Number(cb.estampado) || 0,
          confeccion: Number(cb.confeccion) || 0,
          etiqueta: Number(cb.etiqueta) || 0,
          packaging: Number(cb.packaging) || 0,
          otros: Number(cb.otros) || 0,
        },
      };
    }
    if (editing) {
      await fetch("/api/admin/expenses", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing._id, ...body }) });
    } else {
      await fetch("/api/admin/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch("/api/admin/expenses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDeletingId(null); setConfirmDelete(null); load();
  };

  const fmt = (n: number) => `$${Math.round(n).toLocaleString("es-AR")}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bebas text-4xl tracking-tight text-[#111]">GASTOS Y COSTOS</h1>
          <p className="font-dm text-sm text-[#888] mt-0.5">Gastos fijos del negocio y costos de producción</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openCreateFijo} className="flex items-center gap-2 bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-[#333] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Gasto fijo
          </button>
          <button onClick={openCreateProd} className="flex items-center gap-2 border border-[#111] text-[#111] font-dm font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-[#111] hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Costo producción
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gastos fijos / mes", value: fmt(totalMensualFixed), color: "text-[#E63A2E]" },
          { label: "Gastos fijos / año", value: fmt(totalAnual), color: "text-[#111]" },
          { label: "Productos costeados", value: String(costosProd.length), color: "text-[#2A7D4F]" },
          { label: "Costo prom. por producto", value: costosProd.length ? fmt(costosProd.reduce((a, e) => a + e.amount, 0) / costosProd.length) : "$0", color: "text-[#111]" },
        ].map(card => (
          <div key={card.label} className="bg-white border border-[#E0DED8] rounded-sm p-4">
            <p className="font-dm text-xs text-[#888] uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`font-bebas text-3xl tracking-tight ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E0DED8]">
        {(["gastos_fijos", "costos_prod"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`font-dm text-sm font-semibold px-5 py-3 border-b-2 transition-colors ${tab === t ? "border-[#111] text-[#111]" : "border-transparent text-[#888] hover:text-[#111]"}`}>
            {t === "gastos_fijos" ? `Gastos Fijos (${gastosFijos.length})` : `Costos de Producción (${costosProd.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === "gastos_fijos" ? (
        gastosFijos.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E0DED8] rounded-sm">
            <p className="font-bebas text-2xl text-[#CCC] mb-2">SIN GASTOS FIJOS</p>
            <p className="font-dm text-sm text-[#888] mb-4">Registrá los gastos fijos del negocio.</p>
            <button onClick={openCreateFijo} className="font-dm text-xs font-semibold uppercase tracking-widest px-6 py-3 bg-[#111] text-white rounded-sm hover:bg-[#333] transition-colors">Agregar gasto</button>
          </div>
        ) : (
          <div className="bg-white border border-[#E0DED8] rounded-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0DED8]">
                  {["Categoría", "Descripción", "Frecuencia", "Monto", "Mensual equiv.", ""].map(h => (
                    <th key={h} className="text-left font-dm text-xs text-[#888] uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F4F0]">
                {gastosFijos.map(e => {
                  const perMonth = e.frequency === "mensual" ? e.amount
                    : e.frequency === "trimestral" ? e.amount / 3
                    : e.frequency === "semestral" ? e.amount / 6
                    : e.amount / 12;
                  return (
                    <tr key={e._id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-dm text-xs font-semibold uppercase tracking-wider text-[#E63A2E]">{e.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-dm text-sm text-[#111]">{e.description}</p>
                        {e.notes && <p className="font-dm text-xs text-[#AAA] mt-0.5">{e.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-dm text-xs capitalize text-[#666] border border-[#E0DED8] px-2 py-0.5 rounded-full">{e.frequency}</span>
                      </td>
                      <td className="px-4 py-3 font-dm text-sm font-bold text-[#111]">{fmt(e.amount)}</td>
                      <td className="px-4 py-3 font-dm text-sm text-[#E63A2E] font-semibold">{fmt(perMonth)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openEdit(e)} className="font-dm text-xs font-semibold uppercase tracking-wider px-3 py-1.5 border border-[#E0DED8] text-[#666] hover:border-[#111] hover:text-[#111] rounded-sm transition-colors">Editar</button>
                          <button onClick={() => setConfirmDelete(e._id)} className="font-dm text-xs font-semibold uppercase tracking-wider px-3 py-1.5 border border-[#E63A2E] text-[#E63A2E] hover:bg-[#E63A2E] hover:text-white rounded-sm transition-colors">Borrar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#111] bg-[#FAFAF8]">
                  <td colSpan={3} className="px-4 py-3 font-dm text-xs font-bold uppercase tracking-wider text-[#888]">Total mensual estimado</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 font-bebas text-xl text-[#E63A2E]">{fmt(totalMensualFixed)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )
      ) : (
        costosProd.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E0DED8] rounded-sm">
            <p className="font-bebas text-2xl text-[#CCC] mb-2">SIN COSTOS DE PRODUCCIÓN</p>
            <p className="font-dm text-sm text-[#888] mb-4">Registrá cuánto te cuesta producir cada prenda.</p>
            <button onClick={openCreateProd} className="font-dm text-xs font-semibold uppercase tracking-widest px-6 py-3 bg-[#111] text-white rounded-sm hover:bg-[#333] transition-colors">Agregar costo</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {costosProd.map(e => {
              const cb = e.costBreakdown || {};
              const total = e.amount;
              const suggested = total * 2.5;
              const items = [
                { label: "Material", val: cb.material },
                { label: "Estampado", val: cb.estampado },
                { label: "Confección", val: cb.confeccion },
                { label: "Etiqueta", val: cb.etiqueta },
                { label: "Packaging", val: cb.packaging },
                { label: "Otros", val: cb.otros },
              ].filter(i => i.val > 0);
              return (
                <div key={e._id} className="bg-white border border-[#E0DED8] rounded-sm p-4 space-y-3">
                  <div>
                    <span className="font-dm text-[10px] font-semibold uppercase tracking-wider text-[#E63A2E]">{e.category}</span>
                    <h3 className="font-dm font-bold text-sm text-[#111] mt-0.5">{e.productName || e.description}</h3>
                    {e.notes && <p className="font-dm text-xs text-[#AAA] mt-0.5">{e.notes}</p>}
                  </div>
                  {items.length > 0 && (
                    <div className="space-y-1.5">
                      {items.map(i => (
                        <div key={i.label} className="flex justify-between items-center">
                          <span className="font-dm text-xs text-[#888]">{i.label}</span>
                          <span className="font-dm text-xs font-semibold text-[#111]">{fmt(i.val)}</span>
                        </div>
                      ))}
                      <div className="border-t border-[#E0DED8] pt-1.5 flex justify-between items-center">
                        <span className="font-dm text-xs font-bold text-[#111] uppercase tracking-wider">Costo total</span>
                        <span className="font-dm text-sm font-bold text-[#E63A2E]">{fmt(total)}</span>
                      </div>
                    </div>
                  )}
                  <div className="bg-[#F5F4F0] rounded-sm p-2.5 flex justify-between items-center">
                    <span className="font-dm text-xs text-[#888]">Precio sugerido (×2.5)</span>
                    <span className="font-dm text-sm font-bold text-[#2A7D4F]">{fmt(suggested)}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => openEdit(e)} className="flex-1 font-dm text-xs font-semibold uppercase tracking-wider py-2 border border-[#111] text-[#111] hover:bg-[#111] hover:text-white transition-colors rounded-sm">Editar</button>
                    <button onClick={() => setConfirmDelete(e._id)} className="flex-1 font-dm text-xs font-semibold uppercase tracking-wider py-2 border border-[#E63A2E] text-[#E63A2E] hover:bg-[#E63A2E] hover:text-white transition-colors rounded-sm">Borrar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setConfirmDelete(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-sm shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bebas text-2xl text-[#111] mb-1">ELIMINAR</h3>
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

      {/* Form drawer */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowForm(false)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0DED8] sticky top-0 bg-white">
              <h2 className="font-bebas text-2xl tracking-tight text-[#111]">
                {editing ? "EDITAR" : formType === "gasto_fijo" ? "NUEVO GASTO FIJO" : "NUEVO COSTO DE PRODUCCIÓN"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-[#888] hover:text-[#111] p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 flex-1">
              {formType === "gasto_fijo" ? (
                <>
                  <div>
                    <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Categoría</label>
                    <select value={formFijo.category} onChange={e => setFormFijo((p: any) => ({ ...p, category: e.target.value }))}
                      className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm bg-white">
                      <option value="">Seleccioná una categoría</option>
                      {CATEGORIAS_FIJOS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Descripción</label>
                    <input type="text" value={formFijo.description} onChange={e => setFormFijo((p: any) => ({ ...p, description: e.target.value }))}
                      placeholder="Ej: Andreani envíos"
                      className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm" />
                  </div>
                  <div>
                    <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Frecuencia de pago</label>
                    <div className="grid grid-cols-2 gap-2">
                      {FRECUENCIAS.map(f => (
                        <button key={f} type="button" onClick={() => setFormFijo((p: any) => ({ ...p, frequency: f }))}
                          className={`font-dm text-sm capitalize py-2.5 border rounded-sm transition-all ${formFijo.frequency === f ? "bg-[#111] text-white border-[#111]" : "border-[#E0DED8] text-[#888] hover:border-[#111]"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">
                      Monto ({formFijo.frequency}) (ARS)
                    </label>
                    <input type="number" value={formFijo.amount} onChange={e => setFormFijo((p: any) => ({ ...p, amount: e.target.value }))}
                      placeholder="Ej: 5000"
                      className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm" />
                    {formFijo.amount && (
                      <p className="font-dm text-xs text-[#888] mt-1">
                        ≈ {fmt((formFijo.frequency === "mensual" ? Number(formFijo.amount)
                          : formFijo.frequency === "trimestral" ? Number(formFijo.amount) / 3
                          : formFijo.frequency === "semestral" ? Number(formFijo.amount) / 6
                          : Number(formFijo.amount) / 12))} / mes
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Notas (opcional)</label>
                    <input type="text" value={formFijo.notes} onChange={e => setFormFijo((p: any) => ({ ...p, notes: e.target.value }))}
                      placeholder="Ej: Varía según volumen de envíos"
                      className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Categoría de producto</label>
                    <select value={formProd.category} onChange={e => setFormProd((p: any) => ({ ...p, category: e.target.value }))}
                      className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm bg-white">
                      <option value="">Seleccioná una categoría</option>
                      {CATEGORIAS_PROD.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Nombre del producto</label>
                    <input type="text" value={formProd.productName} onChange={e => setFormProd((p: any) => ({ ...p, productName: e.target.value }))}
                      placeholder="Ej: Remera oversize negra"
                      className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm" />
                  </div>
                  <div>
                    <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-2">Desglose de costos (ARS)</label>
                    <div className="space-y-2">
                      {[
                        { key: "material", label: "Tela / Material" },
                        { key: "estampado", label: "Estampado / Serigrafía" },
                        { key: "confeccion", label: "Confección" },
                        { key: "etiqueta", label: "Etiqueta / Tag" },
                        { key: "packaging", label: "Packaging / Bolsa" },
                        { key: "otros", label: "Otros" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-3">
                          <label className="font-dm text-sm text-[#666] w-40 shrink-0">{label}</label>
                          <input type="number" min="0" value={formProd.costBreakdown[key]}
                            onChange={e => setFormProd((p: any) => ({ ...p, costBreakdown: { ...p.costBreakdown, [key]: e.target.value } }))}
                            placeholder="0"
                            className="flex-1 border border-[#E0DED8] px-3 py-2.5 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm" />
                        </div>
                      ))}
                    </div>
                    {calcTotalProd(formProd.costBreakdown) > 0 && (
                      <div className="mt-3 bg-[#F5F4F0] rounded-sm p-3 space-y-1">
                        <div className="flex justify-between">
                          <span className="font-dm text-xs font-bold text-[#111] uppercase tracking-wider">Costo total</span>
                          <span className="font-dm text-sm font-bold text-[#E63A2E]">{fmt(calcTotalProd(formProd.costBreakdown))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-dm text-xs text-[#888]">Precio sugerido (×2.5)</span>
                          <span className="font-dm text-sm font-bold text-[#2A7D4F]">{fmt(calcTotalProd(formProd.costBreakdown) * 2.5)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Notas (opcional)</label>
                    <input type="text" value={formProd.notes} onChange={e => setFormProd((p: any) => ({ ...p, notes: e.target.value }))}
                      placeholder="Ej: Precio varía según proveedor"
                      className="w-full border border-[#E0DED8] px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm" />
                  </div>
                </>
              )}
            </div>

            <div className="px-5 py-4 border-t border-[#E0DED8] sticky bottom-0 bg-white flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:border-[#111] transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-[2] bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50">
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
