import { notFound } from "next/navigation";
import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Product from "@/model/Product";
import ProductClient from "./ProductClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://somosblack.ar";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  try {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) return null;
    // Serializar para pasar como prop al Client Component
    return JSON.parse(JSON.stringify(product));
  } catch {
    return null;
  }
}

// ─── Metadata dinámica por producto ──────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const title = `${product.name} | BLACK`;
  const description = product.description
    ? `${product.description} — Comprá en somosblack.ar`
    : `${product.name} disponible en BLACK. Envíos a todo el país.`;
  const image = product.image ?? "/og-image.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/producto/${id}`,
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  // Normalizar stockBySize (Map de Mongoose → objeto plano)
  const normalized = {
    ...product,
    id: product._id,
    stockBySize: product.stockBySize
      ? Object.fromEntries(Object.entries(product.stockBySize))
      : undefined,
  };

  return <ProductClient product={normalized} />;
}