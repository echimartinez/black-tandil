"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

type Tab = "pedidos" | "direccion" | "datos";

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  external_reference: string;
  title: string;
  amount: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [expanded, setExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [repeating, setRepeating] = useState(false);

  const items = order.items ?? [];
  const imagesWithItems = items.filter(i => i.image);
  const isApproved = order.status === "approved";

  const handleRepeat = () => {
    setRepeating(true);
    items.forEach(item => {
      // Buscamos el producto en la tienda por nombre para obtener el _id
      // Si no está disponible, agregamos con datos mínimos del historial
      addItem(
        { name: item.name, price: item.price, image: item.image ?? "", _id: undefined, id: undefined },
        item.size
      );
    });
    setTimeout(() => {
      setRepeating(false);
      router.push("/");
    }, 600);
  };

  return (
    <div className="bg-white border border-[#E0DED8] rounded-sm overflow-hidden">
      {/* Barra de estado */}
      <div className={`h-1 w-full ${isApproved ? "bg-[#2A7D4F]" : "bg-yellow-400"}`} />

      {/* Carrusel de imágenes */}
      {imagesWithItems.length > 0 && (
        <div className="relative bg-[#F5F4F0] overflow-hidden" style={{ height: 200 }}>
          <div
            className="flex transition-transform duration-300 ease-in-out h-full"
            style={{ transform: `translateX(-${selectedImage * 100}%)` }}
          >
            {imagesWithItems.map((item, i) => (
              <div key={i} className="flex-shrink-0 w-full h-full relative">
                <Image src={item.image!} alt={item.name} fill className="object-contain p-4" />
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <span className="bg-black/60 text-white font-dm text-[10px] px-2 py-0.5 rounded-full">
                    {item.name} — T. {item.size}{item.quantity > 1 ? ` ×${item.quantity}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selectedImage > 0 && (
            <button onClick={() => setSelectedImage(i => i - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          {selectedImage < imagesWithItems.length - 1 && (
            <button onClick={() => setSelectedImage(i => i + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
          {imagesWithItems.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1">
              {imagesWithItems.map((_, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === selectedImage ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header de la orden */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-dm text-[10px] text-[#888] uppercase tracking-wider">
              {new Date(order.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <p className="font-dm font-semibold text-sm text-[#111] mt-0.5 leading-tight truncate pr-2">
              {order.title}
            </p>
          </div>
          <span className={`flex-shrink-0 font-dm text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
            isApproved ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
          }`}>
            {isApproved ? "Pagado" : "Pendiente"}
          </span>
        </div>

        {/* Desglose de items — expandible */}
        {items.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(p => !p)}
              className="flex items-center gap-1 font-dm text-xs text-[#888] hover:text-[#111] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              {expanded ? "Ocultar detalle" : `Ver ${items.length} ${items.length === 1 ? "producto" : "productos"}`}
            </button>

            {expanded && (
              <div className="mt-2 space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-t border-[#F0EDE6] first:border-t-0">
                    {item.image && (
                      <div className="relative w-12 h-12 flex-shrink-0 bg-[#ECEAE4] rounded-sm overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-dm text-sm font-semibold text-[#111] leading-tight truncate">{item.name}</p>
                      <p className="font-dm text-xs text-[#888]">
                        Talle {item.size} · Cant. {item.quantity}
                      </p>
                    </div>
                    <p className="font-dm text-sm font-bold text-[#111] flex-shrink-0">
                      ${(item.price * item.quantity).toLocaleString("es-AR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer: referencia + total + botón repetir */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0EDE6]">
          <p className="font-dm text-[10px] text-[#CCC]">#{order.external_reference.slice(-8)}</p>
          <p className="font-dm font-bold text-base text-[#111]">
            ${order.amount.toLocaleString("es-AR")}
          </p>
        </div>

        {/* Botón repetir pedido */}
        {items.length > 0 && isApproved && (
          <button
            onClick={handleRepeat}
            disabled={repeating}
            className="mt-3 w-full border border-[#111] text-[#111] font-dm font-semibold text-xs uppercase tracking-widest py-2.5 rounded-sm hover:bg-[#111] hover:text-white transition-colors disabled:opacity-50"
          >
            {repeating ? "✓ Agregado al carrito" : "Repetir pedido"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [address, setAddress] = useState<Address>({ street: "", city: "", province: "", postalCode: "", phone: "" });
  const [name, setName] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingData, setEditingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    setName(session.user?.name ?? "");
    fetch("/api/profile").then(r => r.json()).then(data => {
      if (data.address) setAddress(data.address);
      if (data.name) setName(data.name);
    });
    fetch("/api/orders").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setOrders(data);
      setOrdersLoading(false);
    });
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address }),
    });
    setSaving(false);
    setSaved(true);
    setEditingAddress(false);
    setEditingData(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const addressFields = [
    { key: "street", label: "Calle y número" },
    { key: "city", label: "Ciudad" },
    { key: "province", label: "Provincia" },
    { key: "postalCode", label: "Código postal" },
    { key: "phone", label: "Teléfono" },
  ];

  const hasAddress = Object.values(address).some(v => v.trim() !== "");

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="w-full pb-12">

      {/* Header */}
      <div className="bg-white border-b border-[#E0DED8] px-4 py-5 flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#E0DED8] flex-shrink-0">
          {session.user?.image ? (
            <Image src={session.user.image} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bebas text-2xl tracking-tight text-[#111] leading-none">{name || session.user?.name}</p>
          <p className="font-dm text-xs text-[#888] mt-0.5 truncate">{session.user?.email}</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="font-dm text-xs text-[#888] hover:text-[#E63A2E] transition-colors flex-shrink-0">
          Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E0DED8] bg-white">
        {(["pedidos", "direccion", "datos"] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 font-dm text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab ? "text-[#111] border-b-2 border-[#111]" : "text-[#888]"
            }`}>
            {tab === "pedidos" ? "Pedidos" : tab === "direccion" ? "Dirección" : "Mis datos"}
          </button>
        ))}
      </div>

      {/* ── PEDIDOS ── */}
      {activeTab === "pedidos" && (
        <div className="px-4 py-6">
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto mb-4" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
              </svg>
              <p className="font-bebas text-2xl text-[#CCC] mb-1">SIN PEDIDOS</p>
              <p className="font-dm text-sm text-[#888] mb-6">Todavía no realizaste ninguna compra.</p>
              <button onClick={() => router.push("/")}
                className="font-dm text-xs font-semibold uppercase tracking-widest px-6 py-3 bg-[#111] text-white rounded-sm hover:bg-[#333] transition-colors">
                Ver productos
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => <OrderCard key={order._id} order={order} />)}
            </div>
          )}
        </div>
      )}

      {/* ── DIRECCIÓN ── */}
      {activeTab === "direccion" && (
        <div className="px-4 py-6">
          {!editingAddress ? (
            <>
              {hasAddress ? (
                <div className="bg-white border border-[#E0DED8] rounded-sm overflow-hidden mb-4">
                  {addressFields.map((field, i) => (
                    <div key={field.key}
                      className={`flex justify-between items-center px-4 py-3 ${
                        i < addressFields.length - 1 ? "border-b border-[#F0EDE6]" : ""
                      }`}>
                      <span className="font-dm text-xs text-[#888]">{field.label}</span>
                      <span className="font-dm text-sm text-[#111] font-medium text-right max-w-[60%]">
                        {address[field.key as keyof Address] || <span className="text-[#CCC]">—</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-4">
                  <p className="font-dm text-sm text-[#888]">No tenés una dirección guardada.</p>
                </div>
              )}
              <button onClick={() => setEditingAddress(true)}
                className="w-full border border-[#111] text-[#111] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:bg-[#111] hover:text-white transition-colors">
                {hasAddress ? "Editar dirección" : "Agregar dirección"}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {addressFields.map(field => (
                <div key={field.key}>
                  <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">{field.label}</label>
                  <input type="text" value={address[field.key as keyof Address]}
                    onChange={e => setAddress(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full border border-[#E0DED8] bg-white px-4 py-3 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm transition-colors"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditingAddress(false)}
                  className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:border-[#111] transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving}
                  className={`flex-1 font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm transition-all ${
                    saved ? "bg-[#2A7D4F] text-white" : "bg-[#111] text-white hover:bg-[#333]"
                  } disabled:opacity-50`}>
                  {saved ? "✓ Guardado" : saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MIS DATOS ── */}
      {activeTab === "datos" && (
        <div className="px-4 py-6">
          {!editingData ? (
            <>
              <div className="bg-white border border-[#E0DED8] rounded-sm overflow-hidden mb-4">
                <div className="flex justify-between items-center px-4 py-3 border-b border-[#F0EDE6]">
                  <span className="font-dm text-xs text-[#888]">Nombre</span>
                  <span className="font-dm text-sm text-[#111] font-medium">{name || "—"}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="font-dm text-xs text-[#888]">Email</span>
                  <span className="font-dm text-sm text-[#111] font-medium truncate max-w-[60%] text-right">
                    {session.user?.email}
                  </span>
                </div>
              </div>

              <button onClick={() => setEditingData(true)}
                className="w-full border border-[#111] text-[#111] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:bg-[#111] hover:text-white transition-colors mb-4">
                Editar datos
              </button>

              <div className="border-t border-[#E0DED8] pt-4">
                <button onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:border-[#E63A2E] hover:text-[#E63A2E] transition-colors">
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Nombre</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-[#E0DED8] bg-white px-4 py-3 font-dm text-sm text-[#111] focus:outline-none focus:border-[#111] rounded-sm transition-colors"
                />
              </div>
              <div>
                <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Email</label>
                <input type="email" value={session.user?.email ?? ""} disabled
                  className="w-full border border-[#E0DED8] bg-[#F5F4F0] px-4 py-3 font-dm text-sm text-[#888] rounded-sm cursor-not-allowed"
                />
                <p className="font-dm text-[10px] text-[#AAA] mt-1">El email no se puede modificar.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditingData(false)}
                  className="flex-1 border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm hover:border-[#111] transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving}
                  className={`flex-1 font-dm font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm transition-all ${
                    saved ? "bg-[#2A7D4F] text-white" : "bg-[#111] text-white hover:bg-[#333]"
                  } disabled:opacity-50`}>
                  {saved ? "✓ Guardado" : saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
