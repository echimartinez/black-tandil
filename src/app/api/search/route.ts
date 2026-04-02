import dbConnect from '@/lib/mongodb';
import Product from '@/model/Product';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const mode = searchParams.get('mode'); // 'suggest' = máx 5 resultados rápidos

    if (!q || q.length < 2) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    await dbConnect();

    // Búsqueda por regex case-insensitive en nombre y categoría
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const limit = mode === 'suggest' ? 5 : 20;

    const products = await Product.find({
      active: true,
      $or: [
        { name: regex },
        { category: regex },
        { description: regex },
      ],
    })
      .limit(limit)
      .select('_id name price image category')
      .lean();

    const mapped = products.map((p: any) => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
    }));

    return new Response(JSON.stringify(mapped), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ Error en búsqueda:', error.message);
    return new Response(JSON.stringify([]), { status: 200 });
  }
}
