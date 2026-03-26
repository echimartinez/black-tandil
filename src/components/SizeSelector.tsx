"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";

interface SizeSelectorProps {
  product: Product;
  onConfirm: (size: string) => void;
  onClose: () => void;
}

export default function SizeSelector({ product, onConfirm, onClose }: SizeSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const sizes = product.sizes ?? ["S", "M", "L", "XL"];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl shadow-2xl animate-slide-up">
        <div className="px-5 pt-5 pb-8">

          {/* Handle */}
          <div className="w-10 h-1 bg-[#E0DED8] rounded-full mx-auto mb-5" />

          {/* Producto */}
          <div className="flex gap-3 mb-6 pb-5 border-b border-[#F0EDE6]">
            <div className="relative w-16 h-16 bg-[#ECEAE4] rounded-sm overflow-hidden flex-shrink-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-dm font-semibold text-sm text-[#111] leading-tight">{product.name}</p>
              <p className="font-dm font-bold text-sm text-[#111] mt-1">
                ${product.price.toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          {/* Talles */}
          <p className="font-dm text-xs text-[#888] uppercase tracking-widest mb-3">
            Seleccioná tu talle
          </p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelected(size)}
                className={`py-3 border rounded-sm font-dm font-semibold text-sm transition-all ${
                  selected === size
                    ? "bg-[#111] text-white border-[#111]"
                    : "bg-white text-[#111] border-[#E0DED8] hover:border-[#111]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Botón agregar */}
          <button
            onClick={() => {
              if (selected) {
                onConfirm(selected);
                onClose();
              }
            }}
            disabled={!selected}
            className="w-full bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-4 rounded-sm hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {selected ? `Agregar talle ${selected}` : "Elegí un talle"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
