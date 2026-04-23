import dbConnect from '@/lib/mongodb';
import Product from '@/model/Product';

export async function GET() {
  await dbConnect();
  // Todos los productos activos — el frontend maneja el estado "sin stock"
  const products = await Product.find({ active: true }).sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(products), { status: 200 });
}
