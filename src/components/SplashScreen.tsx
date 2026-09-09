"use client";

import { useEffect, useRef, useState } from "react";

export default function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), 4000);
    const goneTimer = setTimeout(() => setPhase("gone"), 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  // Lógica del Tilt 3D
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      // Inclinación sutil (máximo 12 grados)
      containerRef.current.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${y * -12}deg)`;
    };

    const handleMouseLeave = () => {
      if (containerRef.current) {
        containerRef.current.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transition: "opacity 0.5s ease",
        opacity: phase === "fading" ? 0 : 1,
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      {/* Grano de fondo */}
      <div className="splash-noise" />

      {/* Contenedor 3D que reacciona al mouse */}
      <div ref={containerRef} style={{ transition: "transform 0.1s ease-out", transformStyle: "preserve-3d" }}>
        
        {/* Logo con efecto Glitch y relieve 3D */}
        <div className="splash-logo" data-text="BLACK">
          <span data-text="B">B</span>
          <span data-text="L">L</span>
          <span data-text="A">A</span>
          <span data-text="C">C</span>
          <span data-text="K">K</span>
        </div>

        {/* Subtítulo */}
        <p className="splash-subtitle">@SOMOSBLACK.AR</p>

        {/* Línea de escaneo */}
        <div className="splash-line" />
      </div>

      <style>{`
        /* ANIMACIONES DE ENTRADA 3D */
        @keyframes splashLetterIn3D {
          from {
            opacity: 0;
            transform: translateZ(-50px) rotateY(90deg);
            filter: blur(5px);
          }
          to {
            opacity: 1;
            transform: translateZ(0) rotateY(0deg);
            filter: blur(0);
          }
        }

        @keyframes glitch-anim-1 {
          0% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 2px); }
          20% { clip-path: inset(60% 0 30% 0); transform: translate(2px, -2px); }
          40% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 1px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, 1px); }
          80% { clip-path: inset(40% 0 40% 0); transform: translate(-1px, -2px); }
          100% { clip-path: inset(20% 0 60% 0); transform: translate(0, 0); }
        }

        @keyframes glitch-anim-2 {
          0% { clip-path: inset(60% 0 20% 0); transform: translate(2px, -2px); }
          20% { clip-path: inset(30% 0 60% 0); transform: translate(-2px, 2px); }
          40% { clip-path: inset(80% 0 10% 0); transform: translate(2px, -1px); }
          60% { clip-path: inset(5% 0 80% 0); transform: translate(-2px, -1px); }
          80% { clip-path: inset(40% 0 40% 0); transform: translate(1px, 2px); }
          100% { clip-path: inset(60% 0 20% 0); transform: translate(0, 0); }
        }

        @keyframes letter-shake {
          0%, 100% { transform: translate(0); }
          10% { transform: translate(-2px, 1px); }
          20% { transform: translate(2px, -1px); }
          30% { transform: translate(-1px, -2px); }
          40% { transform: translate(1px, 2px); }
          50% { transform: translate(-2px, 1px); }
        }

        .splash-noise {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .splash-logo {
          position: relative;
          display: flex;
          gap: 0.05em;
          font-family: var(--font-bebas);
          font-size: clamp(60px, 20vw, 120px);
          letter-spacing: 0.08em;
          color: #ffffff;
          line-height: 1;
          margin-bottom: 12px;
          z-index: 10;
          transform-style: preserve-3d;
          /* Relieve 3D: sombras apiladas para dar volumen */
          text-shadow: 
            2px 2px 0px #2a2a2a,
            4px 4px 0px #1a1a1a,
            6px 6px 0px #0a0a0a,
            0 0 20px rgba(255,255,255,0.3);
        }

        .splash-logo span {
          position: relative;
          display: inline-block;
          opacity: 0;
          transform-style: preserve-3d;
          /* Entrada 3D + Sacudida */
          animation: 
            splashLetterIn3D 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards,
            letter-shake 0.3s ease-in-out 3;
        }

        .splash-logo span::before,
        .splash-logo span::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }

        .splash-logo span::before {
          color: #E63A2E;
          z-index: -1;
          animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
          transition: opacity 0.5s;
        }

        .splash-logo span::after {
          color: #00FFFF;
          z-index: -2;
          animation: glitch-anim-2 3s infinite linear alternate-reverse;
          transition: opacity 0.5s;
        }

        .splash-logo span:nth-child(1) { animation-delay: 0.1s; }
        .splash-logo span:nth-child(2) { animation-delay: 0.2s; }
        .splash-logo span:nth-child(3) { animation-delay: 0.3s; }
        .splash-logo span:nth-child(4) { animation-delay: 0.4s; }
        .splash-logo span:nth-child(5) { animation-delay: 0.5s; }

        .splash-subtitle {
          position: relative;
          z-index: 10;
          font-family: var(--font-dm);
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #888;
          text-transform: uppercase;
          margin: 0;
          opacity: 0;
          transform: translateZ(20px); /* Sale hacia adelante en 3D */
          animation: splashSubtitleIn 0.8s 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes splashSubtitleIn {
          from { opacity: 0; transform: translateY(10px) translateZ(0); letter-spacing: 0.6em; }
          to { opacity: 1; transform: translateY(0) translateZ(20px); letter-spacing: 0.3em; }
        }

        .splash-line {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #E63A2E, #ffffff, #E63A2E, transparent);
          box-shadow: 0 0 20px rgba(230, 58, 46, 0.8);
          z-index: 10;
          animation: splashLine 4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes splashLine {
          0% { width: 0%; opacity: 1; }
          80% { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}