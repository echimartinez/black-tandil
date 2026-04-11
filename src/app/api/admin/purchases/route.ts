import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Purchase from '@/model/Purchase';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin')
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  try {
    await dbConnect();
    const purchases = await Purchase.find().sort({ date: -1 });
    return new Response(JSON.stringify(purchases), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin')
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  try {
    await dbConnect();
    const body = await req.json();
    const purchase = await Purchase.create(body);
    return new Response(JSON.stringify(purchase), { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/purchases error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin')
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  try {
    await dbConnect();
    const { id, ...data } = await req.json();
    const purchase = await Purchase.findByIdAndUpdate(id, data, { new: true });
    return new Response(JSON.stringify(purchase), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin')
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  try {
    await dbConnect();
    const { id } = await req.json();
    await Purchase.findByIdAndDelete(id);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}