import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/model/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos.' }), { status: 400 });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres.' }), { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return new Response(JSON.stringify({ error: 'Ya existe una cuenta con ese email.' }), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      provider: 'credentials',
    });

    return new Response(JSON.stringify({ ok: true }), { status: 201 });
  } catch (error: any) {
    console.error('❌ Error en registro:', error.message);
    return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), { status: 500 });
  }
}