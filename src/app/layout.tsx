import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider";
import SplashScreen from "@/components/SplashScreen";

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blacktandil.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Black Tandil — Ropa urbana",
    template: "%s | Black Tandil",
  },
  description: "Tienda de ropa urbana en Tandil. Camisacos, remeras y más. Envíos a todo el país.",
  keywords: ["ropa urbana", "tandil", "camisacos", "streetwear", "indumentaria", "Buenos Aires"],
  authors: [{ name: "Black Tandil" }],
  creator: "Black Tandil",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: BASE_URL,
    siteName: "Black Tandil",
    title: "Black Tandil — Ropa urbana",
    description: "Tienda de ropa urbana en Tandil. Camisacos, remeras y más. Envíos a todo el país.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Black Tandil — Ropa urbana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Black Tandil — Ropa urbana",
    description: "Tienda de ropa urbana en Tandil. Envíos a todo el país.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${bebas.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F5F4F0] text-[#111] overflow-x-hidden">
        <AuthProvider>
          <SplashScreen /> 
          <CartProvider>
            <div className="bg-[#111] text-white text-center text-xs tracking-widest py-2 font-dm uppercase px-4 truncate">
              ¡Envíos a todo el país!
            </div>
            <Header />
            <main className="flex-1 w-full">
              {children}
            </main>
            <footer className="bg-[#111] text-white mt-12">
              <div className="w-full px-4 py-8">
                <p className="font-bebas text-3xl mb-1">SOMOSBLACK.AR</p>
                <p className="font-dm text-xs text-[#888] tracking-wide">
                  Ropa urbana · Tandil ·{" "}
                  <a href="https://instagram.com/somosblack.ar" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    @somosblack.ar
                  </a>
                </p>
                <div className="border-t border-[#333] mt-6 pt-4 text-xs text-[#555] font-dm">
                  © {new Date().getFullYear()} Black Tandil. Todos los derechos reservados.
                </div>
              </div>
            </footer>
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
