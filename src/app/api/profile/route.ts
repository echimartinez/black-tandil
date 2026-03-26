import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/model/User';

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'No autenticado.' }), { status: 401 });
    }

    await dbConnect();
    const { name, address } = await req.json();

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { name, address },
      { new: true, select: '-password' }
    );

    return new Response(JSON.stringify({ ok: true, user: updated }), { status: 200 });
  } catch (error: any) {
    console.error('❌ Error actualizando perfil:', error.message);
    return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'No autenticado.' }), { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select('-password');

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Error interno.' }), { status: 500 });
  }
}