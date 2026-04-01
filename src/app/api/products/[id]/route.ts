import dbConnect from '@/lib/mongodb';
import Product from '@/model/Product';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  try {
    const product = await Product.findById(id).lean();
    if (!product) return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404 });
    return new Response(JSON.stringify(product), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }
}