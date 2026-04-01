import dbConnect from '@/lib/mongodb';
import Product from '@/model/Product';

export async function GET() {
  await dbConnect();

  // Solo productos activos y con al menos un talle con stock
  const products = await Product.find({ active: true }).sort({ createdAt: -1 }).lean();

  // Filtramos los que tienen stock en al menos un talle
  const withStock = products.filter((p: any) => {
    if (p.stockBySize) {
      return Object.values(p.stockBySize).some((v: any) => v > 0);
    }
    return (p.stock ?? 0) > 0;
  });

  return new Response(JSON.stringify(withStock), { status: 200 });
}