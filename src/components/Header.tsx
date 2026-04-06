"use client";

import { useState } from "react";
import Link from "next/link";
import CartIconButton from "@/components/CartIconButton";
import NavDrawer from "@/components/NavDrawer";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-[#E0DED8] sticky top-0 z-40 relative">
        <div className="w-full px-4 py-3 flex items-center justify-between">

          {/* Izquierda: hamburguesa */}
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

          {/* Centro: logo */}
          <Link
            href="/"
            className="font-bebas text-4xl tracking-tight leading-none text-[#111] translate-y-[3px] absolute left-1/2 -translate-x-1/2"
          >
            BLACK
          </Link>

          {/* Derecha: carrito + perfil */}
          <div className="flex items-center gap-4 text-[#111]">
            <CartIconButton />
            <Link href="/perfil" aria-label="Mi cuenta" className="hover:text-[#555] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          </div>

        </div>
      </header>

      <NavDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}