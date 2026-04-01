"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ReactNode, useState } from "react";

const NAV = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    label: "Productos",
    href: "/admin/productos",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    label: "Categorías",
    href: "/admin/categorias",
    icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
  },
  {
    label: "Órdenes",
    href: "/admin/ordenes",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    label: "Usuarios",
    href: "/admin/usuarios",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
];

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-[#222] flex items-center justify-between">
        <div>
          <Link href="/" className="font-bebas text-2xl text-white tracking-tight leading-none block">
            BLACK
          </Link>
          <p className="font-dm text-[10px] text-[#555] uppercase tracking-widest mt-0.5">Panel admin</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm font-dm text-sm transition-colors ${
                active ? "bg-white/10 text-white" : "text-[#888] hover:text-white hover:bg-white/5"
              }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d={item.icon}/>
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#222]">
        <Link href="/" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 text-[#888] hover:text-white font-dm text-sm transition-colors rounded-sm hover:bg-white/5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Ver tienda
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[#888] hover:text-[#E63A2E] font-dm text-sm transition-colors rounded-sm hover:bg-white/5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Salir
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = NAV.find(item =>
    item.href === pathname || (item.href !== "/admin" && pathname.startsWith(item.href))
  )?.label ?? "Admin";

  return (
    <div className="min-h-screen flex bg-[#F5F4F0]">
      <aside className="hidden md:flex w-56 bg-[#111] flex-col flex-shrink-0 fixed left-0 top-0 h-full z-30">
        <SidebarContent pathname={pathname} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed left-0 top-0 h-full w-64 bg-[#111] z-50 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out md:hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent pathname={pathname} onClose={() => setMobileOpen(false)} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:ml-56">
        <div className="md:hidden bg-[#111] px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-white p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="font-bebas text-lg text-white tracking-tight">{currentPage.toUpperCase()}</span>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}