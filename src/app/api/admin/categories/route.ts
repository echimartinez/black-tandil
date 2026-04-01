import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Category from '@/model/Category';

function isAdmin(session: any) {
  return session?.user?.role === 'admin';
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  await dbConnect();
  const categories = await Category.find().sort({ order: 1, createdAt: 1 });
  return new Response(JSON.stringify(categories), { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  await dbConnect();
  const body = await req.json();
  if (!body.name || !body.slug) return new Response(JSON.stringify({ error: 'Nombre y slug requeridos.' }), { status: 400 });
  const category = await Category.create(body);
  return new Response(JSON.stringify(category), { status: 201 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  await dbConnect();
  const { id, ...data } = await req.json();
  if (!id) return new Response(JSON.stringify({ error: 'ID requerido.' }), { status: 400 });
  const updated = await Category.findByIdAndUpdate(id, data, { new: true });
  return new Response(JSON.stringify(updated), { status: 200 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  await dbConnect();
  const { id } = await req.json();
  if (!id) return new Response(JSON.stringify({ error: 'ID requerido.' }), { status: 400 });
  await Category.findByIdAndDelete(id);
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}