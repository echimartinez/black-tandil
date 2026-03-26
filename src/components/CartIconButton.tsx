"use client";

import { useCart } from "@/context/CartContext";

export default function CartIconButton() {
  const { openCart, totalItems } = useCart();

  return (
    <button onClick={openCart} className="relative">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#E63A2E] text-white text-[9px] font-dm font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </button>
  );
}
