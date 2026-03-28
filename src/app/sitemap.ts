import { MetadataRoute } from "next";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blacktandil.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/registro`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Páginas de categorías
  const categoryPages: MetadataRoute.Sitemap = categories.flatMap(cat => [
    {
      url: `${BASE_URL}/categoria/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...cat.subcategories.map(sub => ({
      url: `${BASE_URL}/categoria/${sub.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]);

  // Páginas de productos
  const productPages: MetadataRoute.Sitemap = products.map(product => ({
    url: `${BASE_URL}/producto/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}