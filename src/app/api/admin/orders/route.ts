import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/model/Order';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }
  await dbConnect();
  const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');
  return new Response(JSON.stringify(orders), { status: 200 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }
  await dbConnect();
  const { id, status } = await req.json();
  const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
  return new Response(JSON.stringify(updated), { status: 200 });
}