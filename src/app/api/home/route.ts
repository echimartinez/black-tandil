import dbConnect from '@/lib/mongodb';
import Product from '@/model/Product';

function normalize(p: any) {
  return {
    ...p,
    id: p._id,
    stockBySize: p.stockBySize ? Object.fromEntries(Object.entries(p.stockBySize)) : undefined,
  };
}

export async function GET() {
  await dbConnect();

  const [featured, sale, newest] = await Promise.all([
    Product.find({ active: true, featured: true }).limit(6).lean(),
    Product.find({ active: true, sale: true }).limit(6).lean(),
    Product.find({ active: true }).sort({ createdAt: -1 }).limit(4).lean(),
  ]);

  return new Response(JSON.stringify({
    featured: featured.map(normalize),
    sale: sale.map(normalize),
    newest: newest.map(normalize),
  }), { status: 200 });
}