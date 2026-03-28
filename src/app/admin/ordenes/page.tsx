"use client";

import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: "Pagado", color: "bg-green-50 text-green-700" },
  pending:  { label: "Pendiente", color: "bg-yellow-50 text-yellow-700" },
  rejected: { label: "Rechazado", color: "bg-red-50 text-red-700" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const updated = await res.json();
    setOrders(prev => prev.map(o => o._id === id ? updated : o));
    setUpdatingId(null);
  };

  const filtered = orders.filter(o => {
    const matchSearch = search === "" ||
      o.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.external_reference?.toLowerCase().includes(search.toLowerCase()) ||
      o.userId?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-bebas text-4xl tracking-tight text-[#111]">ÓRDENES</h1>
        <p className="font-dm text-sm text-[#888] mt-0.5">{orders.length} órdenes en total</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por producto, referencia o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-[#E0DED8] bg-white px-4 py-2.5 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-[#E0DED8] bg-white px-4 py-2.5 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="approved">Pagados</option>
          <option value="pending">Pendientes</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#E0DED8] rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-dm text-sm text-[#888] text-center py-16">Sin órdenes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0DED8] bg-[#F5F4F0]">
                  {["Referencia", "Producto", "Usuario", "Monto", "Estado", "Fecha", "Acción"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-dm text-xs text-[#888] uppercase tracking-wider font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <tr key={order._id}
                    className={`border-b border-[#F0EDE6] last:border-0 hover:bg-[#FAFAF8] transition-colors ${i % 2 === 0 ? "" : "bg-[#FDFCFB]"}`}>
                    <td className="px-4 py-3 font-dm text-xs text-[#888]">
                      #{order.external_reference?.slice(-8)}
                    </td>
                    <td className="px-4 py-3 font-dm text-sm text-[#111] max-w-[200px]">
                      <p className="truncate">{order.title}</p>
                    </td>
                    <td className="px-4 py-3 font-dm text-xs text-[#888]">
                      {order.userId?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-dm text-sm font-bold text-[#111]">
                      ${order.amount?.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-dm text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        STATUS_LABELS[order.status]?.color ?? "bg-gray-100 text-gray-600"
                      }`}>
                        {STATUS_LABELS[order.status]?.label ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-dm text-xs text-[#888]">
                      {new Date(order.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        className="border border-[#E0DED8] bg-white px-2 py-1.5 font-dm text-xs text-[#111] focus:outline-none focus:border-[#111] rounded-sm disabled:opacity-50"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="approved">Pagado</option>
                        <option value="rejected">Rechazado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
