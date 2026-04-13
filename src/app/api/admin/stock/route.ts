import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/model/Product';

// PATCH — actualizar stockBySize de un producto
export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin')
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  try {
    await dbConnect();
    const { id, size, value } = await req.json();
    if (!id || !size || value === undefined)
      return new Response(JSON.stringify({ error: 'Faltan datos.' }), { status: 400 });
    const product = await Product.findById(id);
    if (!product)
      return new Response(JSON.stringify({ error: 'Producto no encontrado.' }), { status: 404 });
    product.stockBySize.set(size, Math.max(0, Number(value)));
    await product.save();
    return new Response(JSON.stringify({ ok: true, stockBySize: Object.fromEntries(product.stockBySize) }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
