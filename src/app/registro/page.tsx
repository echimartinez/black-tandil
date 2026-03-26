"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al registrarse.");
      setLoading(false);
      return;
    }

    // Auto login después del registro
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/perfil");
    router.refresh();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/perfil" });
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <h1 className="font-bebas text-4xl tracking-tight text-[#111] mb-1">CREAR CUENTA</h1>
        <p className="font-dm text-sm text-[#888] mb-8">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-[#111] font-semibold underline">
            Iniciá sesión
          </Link>
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-[#E0DED8] bg-white py-3.5 rounded-sm font-dm text-sm font-medium text-[#111] hover:bg-[#F5F4F0] transition-colors disabled:opacity-50 mb-5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? "Redirigiendo..." : "Registrarse con Google"}
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E0DED8]" />
          <span className="font-dm text-xs text-[#888]">o</span>
          <div className="flex-1 h-px bg-[#E0DED8]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Nombre</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Tu nombre"
              className="w-full border border-[#E0DED8] bg-white px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors"
            />
          </div>

          <div>
            <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
              className="w-full border border-[#E0DED8] bg-white px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors"
            />
          </div>

          <div>
            <label className="font-dm text-xs text-[#888] uppercase tracking-wider block mb-1.5">Contraseña</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-[#E0DED8] bg-white px-4 py-3 font-dm text-sm text-[#111] placeholder-[#CCC] focus:outline-none focus:border-[#111] rounded-sm transition-colors"
            />
          </div>

          {error && <p className="font-dm text-xs text-[#E63A2E]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-4 rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

      </div>
    </div>
  );
}
