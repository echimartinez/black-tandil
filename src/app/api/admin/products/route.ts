import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/model/Product';

function isAdmin(session: any) {
  return session?.user?.role === 'admin';
}

// GET — listar todos
export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  await dbConnect();
  const products = await Product.find().sort({ createdAt: -1 });
  return new Response(JSON.stringify(products), { status: 200 });
}

// POST — crear nuevo
export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  await dbConnect();
  const body = await req.json();

  if (!body.name || !body.price || !body.image) {
    return new Response(JSON.stringify({ error: 'Nombre, precio e imagen son requeridos.' }), { status: 400 });
  }

  const product = await Product.create(body);
  return new Response(JSON.stringify(product), { status: 201 });
}

// PUT — editar existente
export async function PUT(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  await dbConnect();
  const { id, ...data } = await req.json();
  if (!id) return new Response(JSON.stringify({ error: 'ID requerido.' }), { status: 400 });
  const updated = await Product.findByIdAndUpdate(id, data, { new: true });
  return new Response(JSON.stringify(updated), { status: 200 });
}

// DELETE — eliminar
export async function DELETE(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  await dbConnect();
  const { id } = await req.json();
  if (!id) return new Response(JSON.stringify({ error: 'ID requerido.' }), { status: 400 });
  await Product.findByIdAndDelete(id);
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}