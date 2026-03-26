import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Black Tandil",
  description: "Ropa urbana de calidad. Envíos a todo el país.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${bebas.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F5F4F0] text-[#111] overflow-x-hidden">
        <CartProvider>

          {/* Barra de anuncio */}
          <div className="bg-[#111] text-white text-center text-xs tracking-widest py-2 font-dm uppercase px-4 truncate">
            ¡Envíos a todo el país!
          </div>

          {/* Header */}
          <header className="bg-white border-b border-[#E0DED8] sticky top-0 z-40">
            <div className="w-full px-4 py-3 flex items-center justify-between">
              <span className="font-bebas text-4xl tracking-tight leading-none">BLACK</span>
              <div className="flex items-center gap-4 text-[#111]">
                <CartIconButton />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </div>
            </div>
          </header>

          {/* Contenido */}
          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-[#111] text-white mt-12">
            <div className="w-full px-4 py-8">
              <p className="font-bebas text-3xl mb-1">BLACK TANDIL</p>
              <p className="font-dm text-xs text-[#888] tracking-wide">Ropa urbana · Tandil, Buenos Aires</p>
              <div className="border-t border-[#333] mt-6 pt-4 text-xs text-[#555] font-dm">
                © {new Date().getFullYear()} Black Tandil. Todos los derechos reservados.
              </div>
            </div>
          </footer>

          {/* Drawer del carrito */}
          <CartDrawer />

        </CartProvider>
      </body>
    </html>
  );
}

// Componente cliente separado para el ícono del carrito con badge
import CartIconButton from "@/components/CartIconButton";