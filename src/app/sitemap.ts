import { MetadataRoute } from "next";
import dbConnect from "@/lib/mongodb";
import Product from "@/model/Product";
import Category from "@/model/Category";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://somosblack.ar";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  const [products, categories] = await Promise.all([
    Product.find({ active: true }).select("_id createdAt").lean(),
    Category.find().select("slug subcategories").lean(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/tienda`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/registro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = (categories as any[]).flatMap((cat) => [
    {
      url: `${BASE_URL}/categoria/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...(cat.subcategories ?? []).map((sub: any) => ({
      url: `${BASE_URL}/categoria/${sub.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]);

  const productPages: MetadataRoute.Sitemap = (products as any[]).map((product) => ({
    url: `${BASE_URL}/producto/${product._id}`,
    lastModified: product.createdAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}