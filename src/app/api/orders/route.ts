import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/model/Order';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'No autenticado.' }), { status: 401 });
    }
    await dbConnect();
    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Error interno.' }), { status: 500 });
  }
}