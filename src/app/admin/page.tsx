"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalOrders: number;
  approvedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalUsers: number;
  recentOrders: any[];
  salesByDay: { _id: string; total: number; count: number }[];
  monthlyExpenses: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return null;

  const cards = [
    { label: "Ingresos totales", value: `$${stats.totalRevenue.toLocaleString("es-AR")}`, color: "text-[#111]", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Órdenes aprobadas", value: stats.approvedOrders, color: "text-green-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Órdenes pendientes", value: stats.pendingOrders, color: "text-yellow-600", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Gastos fijos / mes", value: `$${Math.round(stats.monthlyExpenses).toLocaleString("es-AR")}`, color: "text-[#E63A2E]", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Usuarios registrados", value: stats.totalUsers, color: "text-blue-600", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  const maxSales = Math.max(...(stats.salesByDay.map(d => d.total)), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bebas text-4xl tracking-tight text-[#111]">DASHBOARD</h1>
        <p className="font-dm text-sm text-[#888] mt-0.5">Resumen general de la tienda</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map(card => (
          <div key={card.label} className="bg-white border border-[#E0DED8] rounded-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="font-dm text-xs text-[#888] uppercase tracking-wider">{card.label}</p>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5">
                <path d={card.icon}/>
              </svg>
            </div>
            <p className={`font-bebas text-3xl tracking-tight ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Ventas últimos 7 días */}
        <div className="bg-white border border-[#E0DED8] rounded-sm p-5">
          <h2 className="font-dm text-sm font-semibold text-[#111] mb-4">Ventas últimos 7 días</h2>
          {stats.salesByDay.length === 0 ? (
            <p className="font-dm text-sm text-[#888] text-center py-8">Sin ventas en este período</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {stats.salesByDay.map(day => {
                const height = Math.round((day.total / maxSales) * 100);
                const date = new Date(day._id + "T00:00:00");
                const label = date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
                return (
                  <div key={day._id} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-[#111] rounded-t-sm transition-all group-hover:bg-[#E63A2E]"
                        style={{ height: `${Math.max(height, 4)}px` }}
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#111] text-white font-dm text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        ${day.total.toLocaleString("es-AR")}
                      </div>
                    </div>
                    <p className="font-dm text-[9px] text-[#888]">{label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Órdenes recientes */}
        <div className="bg-white border border-[#E0DED8] rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-dm text-sm font-semibold text-[#111]">Órdenes recientes</h2>
            <Link href="/admin/ordenes" className="font-dm text-xs text-[#888] hover:text-[#111] underline">
              Ver todas
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="font-dm text-sm text-[#888] text-center py-8">Sin órdenes todavía</p>
          ) : (
            <div className="space-y-2">
              {stats.recentOrders.map((order: any) => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-[#F0EDE6] last:border-0">
                  <div className="min-w-0">
                    <p className="font-dm text-xs font-semibold text-[#111] truncate">{order.title}</p>
                    <p className="font-dm text-[10px] text-[#888]">
                      {new Date(order.createdAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`font-dm text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      order.status === "approved" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                    }`}>
                      {order.status === "approved" ? "Pagado" : "Pendiente"}
                    </span>
                    <p className="font-dm text-xs font-bold text-[#111]">
                      ${order.amount.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
