"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

type Estado = "cargando" | "aprobado" | "pendiente" | "error";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("cargando");

  useEffect(() => {
    const payment_id = searchParams.get("payment_id");
    const external_reference = searchParams.get("external_reference");
    const status = searchParams.get("status");

    // Si MercadoPago ya nos dice que está aprobado, intentamos confirmar en BD
    if (status === "approved" && payment_id && external_reference) {
      fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id, external_reference }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.status === "approved") {
            setEstado("aprobado");
          } else {
            setEstado("pendiente");
          }
        })
        .catch(() => setEstado("aprobado")); // igual mostramos éxito si hay error de red
    } else if (status === "approved") {
      // Tiene status approved pero sin ids (raro) — igual mostramos éxito
      setEstado("aprobado");
    } else {
      setEstado("pendiente");
    }
  }, [searchParams]);

  if (estado === "cargando") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin mb-6" />
        <p className="font-dm text-sm text-[#888]">Confirmando tu pago...</p>
      </div>
    );
  }

  if (estado === "aprobado") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        {/* Ícono */}
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>

        <h1 className="font-bebas text-4xl tracking-tight text-[#111] mb-2">¡PAGO CONFIRMADO!</h1>
        <p className="font-dm text-sm text-[#888] mb-8 max-w-xs">
          Tu compra fue procesada con éxito. Podés ver el detalle en tu perfil.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => router.push("/perfil")}
            className="w-full bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-4 rounded-sm hover:bg-[#333] transition-colors"
          >
            Ver mis pedidos
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-4 rounded-sm hover:border-[#111] hover:text-[#111] transition-colors"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    );
  }

  // pendiente o error
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>

      <h1 className="font-bebas text-4xl tracking-tight text-[#111] mb-2">PAGO EN PROCESO</h1>
      <p className="font-dm text-sm text-[#888] mb-8 max-w-xs">
        Tu pago está siendo procesado. Te avisaremos cuando se confirme. Podés revisar el estado en tu perfil.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push("/perfil")}
          className="w-full bg-[#111] text-white font-dm font-semibold text-xs uppercase tracking-widest py-4 rounded-sm hover:bg-[#333] transition-colors"
        >
          Ver mis pedidos
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full border border-[#E0DED8] text-[#888] font-dm font-semibold text-xs uppercase tracking-widest py-4 rounded-sm hover:border-[#111] hover:text-[#111] transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
