"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    // Solo mostrar una vez por sesión
    const seen = sessionStorage.getItem("splash_seen");
    if (seen) {
      setPhase("gone");
      return;
    }

    // Después de 3s empieza el fade out
    const fadeTimer = setTimeout(() => setPhase("fading"), 1000);

    // Después de 3.8s desaparece completamente
    const goneTimer = setTimeout(() => {
      setPhase("gone");
      sessionStorage.setItem("splash_seen", "1");
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#111111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.8s ease",
        opacity: phase === "fading" ? 0 : 1,
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      {/* Logo */}
      <p
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(56px, 18vw, 96px)",
          letterSpacing: "0.08em",
          color: "#ffffff",
          margin: 0,
          lineHeight: 1,
          animation: "splashIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        BLACK
      </p>

      {/* Subtítulo */}
      <p
        style={{
          fontFamily: "var(--font-dm)",
          fontSize: "11px",
          letterSpacing: "0.3em",
          color: "#555555",
          textTransform: "uppercase",
          margin: "12px 0 0",
          animation: "splashIn 0.6s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        @SOMOSBLACK.AR
      </p>

      {/* Línea animada */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          backgroundColor: "#ffffff",
          animation: "splashLine 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      />

      <style>{`
        @keyframes splashIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashLine {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}