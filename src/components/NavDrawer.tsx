"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { categories } from "@/data/categories";

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const router = useRouter();

  const handleCategoryClick = (slug: string) => {
    setExpandedCategory(prev => prev === slug ? null : slug);
  };

  const handleSubcategoryClick = (slug: string) => {
    router.push(`/categoria/${slug}`);
    onClose();
    setExpandedCategory(null);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-xs bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header del menú */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0DED8]">
          <span className="font-bebas text-2xl tracking-tight">MENÚ</span>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-[#111] transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Categorías */}
        <div className="flex-1 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.slug} className="border-b border-[#F0EDE6]">
              {/* Categoría principal */}
              <button
                onClick={() => handleCategoryClick(category.slug)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className={`font-dm font-bold text-base tracking-wide ${
                  category.highlight ? "text-[#E63A2E]" : "text-[#111]"
                }`}>
                  {category.name}
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  className={`transition-transform duration-200 text-[#888] ${
                    expandedCategory === category.slug ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Subcategorías */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedCategory === category.slug ? "max-h-64" : "max-h-0"
                }`}
              >
                <div className="bg-[#F5F4F0] pb-2">
                  {category.subcategories.map((sub) => (
                    <button
                      key={sub.slug}
                      onClick={() => handleSubcategoryClick(sub.slug)}
                      className="w-full flex items-center justify-between px-7 py-3 text-left hover:bg-[#ECEAE4] transition-colors group"
                    >
                      <span className="font-dm text-sm text-[#444] group-hover:text-[#111] transition-colors">
                        {sub.name}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer del menú */}
        <div className="border-t border-[#E0DED8] px-5 py-5 space-y-3">
          <Link
            href="/perfil"
            onClick={onClose}
            className="flex items-center gap-3 font-dm text-sm text-[#444] hover:text-[#111] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Mi cuenta
          </Link>
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 font-dm text-sm text-[#444] hover:text-[#111] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Buscar
          </Link>
        </div>
      </div>
    </>
  );
}
