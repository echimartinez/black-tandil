import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Expense from '@/model/Expense';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }
  try {
    await dbConnect();
    const expenses = await Expense.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify(expenses), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    // Para costos de producción, usar productName como description si está vacío
    if (body.type === 'costo_produccion' && !body.description) {
      body.description = body.productName || 'Costo de producción';
    }
    if (!body.category) body.category = body.type === 'gasto_fijo' ? 'Otros' : 'Sin categoría';
    const expense = await Expense.create(body);
    return new Response(JSON.stringify(expense), { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/expenses error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }
  try {
    await dbConnect();
    const { id, ...data } = await req.json();
    if (data.type === 'costo_produccion' && !data.description) {
      data.description = data.productName || 'Costo de producción';
    }
    if (!data.category) data.category = data.type === 'gasto_fijo' ? 'Otros' : 'Sin categoría';
    const expense = await Expense.findByIdAndUpdate(id, data, { new: true });
    return new Response(JSON.stringify(expense), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }
  try {
    await dbConnect();
    const { id } = await req.json();
    await Expense.findByIdAndDelete(id);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}