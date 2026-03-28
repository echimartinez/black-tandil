"use client";

import ProductGrid from "@/components/ProductGrid";

export default function HomeClient() {
  return (
    <div className="w-full">
      {/* Banner envío gratis */}
      <div className="bg-[#F0EDE6] border-b border-[#E0DED8] px-4 py-3 flex items-center justify-between">
        <button className="text-[#999] text-lg leading-none flex-shrink-0 pr-2">‹</button>
        <div className="text-center flex-1 min-w-0">
          <p className="font-dm text-xs text-[#555]">
            Envío gratis a partir de <span className="font-bold text-[#111]">$229,999</span>
          </p>
          <p className="font-dm text-xs underline font-semibold text-[#111] cursor-pointer mt-0.5">
            Ver términos y condiciones
          </p>
        </div>
        <button className="text-[#999] text-lg leading-none flex-shrink-0 pl-2">›</button>
      </div>
      <ProductGrid />
    </div>
  );
}
