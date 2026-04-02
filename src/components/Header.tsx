"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CartIconButton from "@/components/CartIconButton";
import NavDrawer from "@/components/NavDrawer";

interface SearchResult {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setSuggestions([]);
    }
  }, [searchOpen]);

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); setSearching(false); return; }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&mode=suggest`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    fetchSuggestions(e.target.value);
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSuggestionClick = (id: string) => {
    router.push(`/producto/${id}`);
    setSearchOpen(false);
  };

  const closeSearch = () => setSearchOpen(false);

  return (
    <>
      <header className="bg-white border-b border-[#E0DED8] sticky top-0 z-40">
        <div className="w-full px-4 py-3 flex items-center justify-between">

          <Link href="/" className="font-bebas text-4xl tracking-tight leading-none text-[#111] translate-y-[3px] ml-3">
            BLACK
          </Link>

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

            <button onClick={() => setMenuOpen(true)} className="hover:text-[#555] transition-colors" aria-label="Abrir menú">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Modal de búsqueda */}
      {searchOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={closeSearch} />

          <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-xl">
            {/* Input */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-[#E0DED8]">
              <svg className="text-[#888] flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Buscar productos..."
                className="flex-1 font-dm text-sm text-[#111] placeholder-[#AAA] focus:outline-none bg-transparent"
              />
              {searching && (
                <div className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              {searchQuery.trim().length >= 2 && !searching && (
                <button
                  onClick={handleSearch}
                  className="flex-shrink-0 bg-[#111] text-white font-dm text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:bg-[#333] transition-colors"
                >
                  Buscar
                </button>
              )}
              <button onClick={closeSearch} className="font-dm text-xs text-[#888] hover:text-[#111] transition-colors flex-shrink-0">
                Cancelar
              </button>
            </div>

            {/* Sugerencias */}
            {searchQuery.trim().length >= 2 && (
              <div className="max-h-[60vh] overflow-y-auto">
                {suggestions.length === 0 && !searching ? (
                  <div className="px-4 py-6 text-center">
                    <p className="font-dm text-sm text-[#888]">Sin resultados para <strong>"{searchQuery}"</strong></p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-[#F0EDE6]">
                      {suggestions.map(product => (
                        <button
                          key={String(product.id)}
                          onClick={() => handleSuggestionClick(String(product.id))}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F4F0] transition-colors text-left"
                        >
                          <div className="relative w-10 h-10 bg-[#ECEAE4] rounded-sm overflow-hidden flex-shrink-0">
                            <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {product.category && (
                              <p className="font-dm text-[10px] text-[#E63A2E] uppercase tracking-wider font-semibold leading-none mb-0.5">
                                {product.category}
                              </p>
                            )}
                            <p className="font-dm text-sm text-[#111] truncate">{product.name}</p>
                          </div>
                          <p className="font-dm text-xs font-bold text-[#111] flex-shrink-0">
                            ${product.price.toLocaleString("es-AR")}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Ver todos */}
                    <button
                      onClick={handleSearch}
                      className="w-full px-4 py-3 text-center font-dm text-xs font-semibold text-[#111] hover:bg-[#F5F4F0] transition-colors border-t border-[#E0DED8] flex items-center justify-center gap-1.5"
                    >
                      Ver todos los resultados de "{searchQuery}"
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <NavDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
