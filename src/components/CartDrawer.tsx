"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { CheckoutResponse, CheckoutError } from "@/types";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data: CheckoutResponse | CheckoutError = await res.json();

      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Error desconocido");
      }

      window.location.href = (data as CheckoutResponse).init_point;
    } catch (error) {
      console.error("ERROR", error);
      alert("Hubo un problema al procesar tu compra. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0DED8]">
          <div className="flex items-center gap-2">
            <span className="font-bebas text-2xl tracking-tight">CARRITO</span>
            {totalItems > 0 && (
              <span className="bg-[#111] text-white text-[10px] font-dm font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="text-[#888] hover:text-[#111] transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p className="font-dm text-sm text-[#888]">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-3 pb-4 border-b border-[#F0EDE6] last:border-0"
                >
                  {/* Imagen */}
                  <div className="relative w-20 h-20 bg-[#ECEAE4] rounded-sm overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-dm font-semibold text-sm text-[#111] leading-tight truncate">
                      {item.product.name}
                    </p>
                    <p className="font-dm text-xs text-[#888] mt-0.5">Talle: {item.size}</p>
                    <p className="font-dm font-bold text-sm text-[#111] mt-1">
                      ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                    </p>

                    {/* Cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="w-6 h-6 border border-[#E0DED8] rounded-sm flex items-center justify-center text-[#111] hover:bg-[#F5F4F0] transition-colors text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="font-dm text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="w-6 h-6 border border-[#E0DED8] rounded-sm flex items-center justify-center text-[#111] hover:bg-[#F5F4F0] transition-colors text-sm font-bold"
                      >
                        +
                      </button>

                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        className="ml-auto text-[#CCC] hover:text-[#E63A2E] transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con total y botón */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-[#E0DED8] bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="font-dm text-sm text-[#888]">Total</span>
              <span className="font-dm font-bold text-lg text-[#111]">
                ${totalPrice.toLocaleString("es-AR")}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-4 rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : "Finalizar compra"}
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 text-xs font-dm text-[#AAA] hover:text-[#E63A2E] transition-colors py-1"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}