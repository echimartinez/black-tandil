"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

interface StickyCartButtonProps {
  product: Product;
  selectedSize: string | null;
  onSizeError: () => void;
}

export default function StickyCartButton({ product, selectedSize, onSizeError }: StickyCartButtonProps) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!selectedSize) {
      onSizeError();
      return;
    }
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openCart();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E0DED8] px-4 py-3 safe-area-pb">
      <button
        onClick={handleAdd}
        className={`w-full font-dm font-semibold text-xs uppercase tracking-widest py-4 rounded-sm transition-all ${
          added
            ? "bg-[#2A7D4F] text-white"
            : "bg-[#111] text-white hover:bg-[#333]"
        }`}
      >
        {added ? "✓ Agregado al carrito" : "Seleccionar Talle"}
      </button>
    </div>
  );
}