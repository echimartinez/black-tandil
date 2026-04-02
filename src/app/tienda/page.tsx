import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import ProductGrid from "@/components/ProductGrid";

export const metadata: Metadata = {
  title: "Tienda — Todos los productos",
  description: "Explorá toda la ropa de Black Tandil. Camisacos, remeras, pantalones y más. Envíos a todo el país.",
};

export default function TiendaPage() {
  return (
    <div className="w-full">
      <ProductGrid />
    </div>
  );
}
