import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/model/User';

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }
  await dbConnect();
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return new Response(JSON.stringify(users), { status: 200 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }
  await dbConnect();
  const { id, role } = await req.json();
  const updated = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
  return new Response(JSON.stringify(updated), { status: 200 });
}