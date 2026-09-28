import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Black Tandil — Ropa urbana",
  description: "Ropa urbana de Black Tandil. Camisacos, remeras, pantalones y más. Envíos a todo el país.",
  openGraph: {
    title: "Black Tandil — Ropa urbana",
    description: "Ropa urbana de Black Tandil. Envíos a todo el país.",
  },
};

export default function Home() {
  return <HomeClient />;
}