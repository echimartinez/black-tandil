"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const updateRole = async (id: string, role: string) => {
    setUpdatingId(id);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    const updated = await res.json();
    setUsers(prev => prev.map(u => u._id === id ? updated : u));
    setUpdatingId(null);
  };

  const filtered = users.filter(u =>
    search === "" ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-bebas text-4xl tracking-tight text-[#111]">USUARIOS</h1>
        <p className="font-dm text-sm text-[#888] mt-0.5">{users.length} usuarios registrados</p>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm border border-[#E0DED8] bg-white px-4 py-2.5 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm"
      />

      <div className="bg-white border border-[#E0DED8] rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-dm text-sm text-[#888] text-center py-16">Sin usuarios</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0DED8] bg-[#F5F4F0]">
                  {["Usuario", "Email", "Proveedor", "Rol", "Registrado", "Acción"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-dm text-xs text-[#888] uppercase tracking-wider font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user._id}
                    className={`border-b border-[#F0EDE6] last:border-0 hover:bg-[#FAFAF8] transition-colors ${i % 2 === 0 ? "" : "bg-[#FDFCFB]"}`}>
                    <td className="px-4 py-3 font-dm text-sm font-semibold text-[#111]">{user.name}</td>
                    <td className="px-4 py-3 font-dm text-xs text-[#888]">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`font-dm text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        user.provider === "google" ? "bg-blue-50 text-blue-700" : "bg-[#F5F4F0] text-[#888]"
                      }`}>
                        {user.provider ?? "email"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-dm text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        user.role === "admin" ? "bg-[#111] text-white" : "bg-[#F5F4F0] text-[#888]"
                      }`}>
                        {user.role ?? "user"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-dm text-xs text-[#888]">
                      {new Date(user.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role ?? "user"}
                        disabled={updatingId === user._id}
                        onChange={e => updateRole(user._id, e.target.value)}
                        className="border border-[#E0DED8] bg-white px-2 py-1.5 font-dm text-xs text-[#111] focus:outline-none focus:border-[#111] rounded-sm disabled:opacity-50"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
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
