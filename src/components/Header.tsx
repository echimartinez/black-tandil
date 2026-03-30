"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CartIconButton from "@/components/CartIconButton";
import NavDrawer from "@/components/NavDrawer";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-[#E0DED8] sticky top-0 z-40">
        <div className="w-full px-4 py-3 flex items-center justify-between">

          {/* Izquierda: logo */}
          <Link href="/" className="font-bebas text-4xl tracking-tight leading-none text-[#111] translate-y-[3px] ml-3">
            BLACK
          </Link>

          {/* Derecha: lupa + carrito + perfil + hamburguesa */}
          <div className="flex items-center gap-4 text-[#111]">
            <button
              onClick={() => setSearchOpen(v => !v)}
              aria-label="Buscar"
              className={`transition-colors ${searchOpen ? "text-[#E63A2E]" : "hover:text-[#555]"}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            <CartIconButton />

            <Link href="/perfil" aria-label="Mi cuenta" className="hover:text-[#555] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              className="hover:text-[#555] transition-colors"
              aria-label="Abrir menú"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Barra de búsqueda desplegable */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${searchOpen ? "max-h-16" : "max-h-0"}`}>
          <form onSubmit={handleSearch} className="px-4 pb-3 flex items-center gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-9 pr-4 py-2 bg-[#F5F4F0] border border-[#E0DED8] rounded-sm font-dm text-sm text-[#111] placeholder-[#AAA] focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="font-dm text-xs text-[#888] hover:text-[#111] transition-colors px-1"
            >
              Cancelar
            </button>
          </form>
        </div>
      </header>

      <NavDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
