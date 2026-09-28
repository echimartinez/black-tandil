"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const TABS = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/tienda", label: "Tienda", icon: "shop" },
  { href: "/buscar", label: "Buscar", icon: "search" },
  { href: "/perfil", label: "Perfil", icon: "user" },
] as const;

function TabIcon({ name }: { name: string }) {
  switch (name) {
    case "home":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
        </svg>
      );
    case "shop":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7.5" height="7.5" rx="1" />
          <rect x="13.5" y="3" width="7.5" height="7.5" rx="1" />
          <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1" />
          <rect x="3" y="13.5" width="7.5" height="7.5" rx="1" />
        </svg>
      );
    case "search":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "cart":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      );
    case "user":
      return (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
}

// Barra inferior fija para mobile — los 5 destinos clave a un toque del
// pulgar. Se oculta en admin (tiene su propia navegación) y en desktop
// (el header ya cubre todo eso ahí).
export default function BottomNav() {
  const pathname = usePathname();
  const { openCart, totalItems } = useCart();

  if (pathname?.startsWith("/admin")) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : !!pathname?.startsWith(href);

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {TABS.slice(0, 2).map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`bottom-nav-item ${isActive(tab.href) ? "bottom-nav-item-active" : ""}`}
        >
          <TabIcon name={tab.icon} />
          <span>{tab.label}</span>
        </Link>
      ))}

      <button onClick={openCart} className="bottom-nav-item" aria-label="Abrir carrito">
        <span className="bottom-nav-cart-icon">
          <TabIcon name="cart" />
          {totalItems > 0 && (
            <span className="bottom-nav-badge">{totalItems > 9 ? "9+" : totalItems}</span>
          )}
        </span>
        <span>Carrito</span>
      </button>

      {TABS.slice(2).map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`bottom-nav-item ${isActive(tab.href) ? "bottom-nav-item-active" : ""}`}
        >
          <TabIcon name={tab.icon} />
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}