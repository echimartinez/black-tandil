"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SubCategory {
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  highlight?: boolean;
  subcategories: SubCategory[];
}

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, []);

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
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 h-full w-[76%] max-w-[500px] bg-[#111] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-[#222] flex items-center justify-between">
          <div>
            <p className="font-bebas text-2xl text-white tracking-tight leading-none">BLACK</p>
            <p className="font-dm text-[10px] text-[#555] uppercase tracking-widest mt-0.5">Tandil</p>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {categories.length === 0 ? (
            <div className="px-3 py-4 space-y-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.slug}>
                <button
                  onClick={() => handleCategoryClick(category.slug)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-sm text-left hover:bg-white/5 transition-colors"
                >
                  <span className={`font-dm font-bold text-sm tracking-wide ${
                    category.highlight ? "text-[#E63A2E]" : "text-white"
                  }`}>
                    {category.name}
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#555" strokeWidth="2.5"
                    className={`transition-transform duration-200 flex-shrink-0 ${
                      expandedCategory === category.slug ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedCategory === category.slug ? "max-h-64" : "max-h-0"
                }`}>
                  <div className="pb-1">
                    {category.subcategories.map((sub) => (
                      <button
                        key={sub.slug}
                        onClick={() => handleSubcategoryClick(sub.slug)}
                        className="w-full flex items-center justify-between px-6 py-2.5 text-left hover:bg-white/5 transition-colors group rounded-sm"
                      >
                        <span className="font-dm text-sm text-[#888] group-hover:text-white transition-colors">
                          {sub.name}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-[#222] px-3 py-4 space-y-0.5">
          <Link href="/perfil" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 text-[#888] hover:text-white font-dm text-sm transition-colors rounded-sm hover:bg-white/5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Mi cuenta
          </Link>
          <Link href="/" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 text-[#888] hover:text-white font-dm text-sm transition-colors rounded-sm hover:bg-white/5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Buscar
          </Link>
        </div>
      </div>
    </>
  );
}
