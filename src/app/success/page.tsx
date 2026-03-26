"use client";

import React from "react";

export default function Page() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
        <span style={{ fontSize: '50px' }}>✅</span>
        <h1 style={{ fontWeight: '900', marginTop: '20px' }}>PAGO RECIBIDO</h1>
        <p style={{ color: '#666' }}>Gracias por tu compra.</p>
        <a href="/" style={{ 
          display: 'inline-block', 
          marginTop: '20px', 
          padding: '12px 24px', 
          backgroundColor: 'black', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          VOLVER AL INICIO
        </a>
      </div>
    </div>
  );
}

/* "use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center border border-gray-100 shadow-2xl rounded-[40px] p-10">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-black mb-4">¡PAGO RECIBIDO!</h1>
        <p className="text-gray-500 mb-8">Gracias por tu compra en Black Tandil.</p>
        <Link 
          href="/" 
          className="inline-block w-full bg-black text-white py-4 rounded-2xl font-bold hover:opacity-80 transition-all"
        >
          VOLVER AL INICIO
        </Link>
      </div>
    </main>
  );
} */