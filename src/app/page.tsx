import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Tienda — Todos los productos",
  description: "Explorá toda la ropa de Black Tandil. Camisacos, remeras, pantalones y más. Envíos a todo el país.",
  openGraph: {
    title: "Black Tandil — Tienda",
    description: "Explorá toda la ropa de Black Tandil. Envíos a todo el país.",
  },
};

export default function Home() {
  return <HomeClient />;
}

