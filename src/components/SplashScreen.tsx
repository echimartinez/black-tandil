"use client";

import { useEffect, useRef, useState } from "react";

const ACCENT = "#E63A2E";
const CYAN = "#00FFFF";

type Phase = "playing" | "exiting" | "gone";

// Duraciones totales (ms) — 5s de show, dejando que el nombre BLACK quede sostenido en pantalla.
const EXIT_AT = 4250;
const GONE_AT = 5000;

interface Particle {
  x: number;
  y: number;
  z: number;
}

export default function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("playing");
  const [reducedMotion, setReducedMotion] = useState(false);
  // Arranca en false (igual que en el servidor, que no tiene window) y se
  // corrige en el cliente antes del primer paint — evita el mismatch de
  // hidratación que daba si leíamos window.innerWidth directo en el render.
  const [isMobile, setIsMobile] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Fases de tiempo
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("exiting"), reducedMotion ? 500 : EXIT_AT);
    const t2 = setTimeout(() => setPhase("gone"), reducedMotion ? 800 : GONE_AT);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reducedMotion]);

  // Preferencia de movimiento reducido
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  // Bloquea el scroll mientras se ve el splash. El componente queda montado
  // para siempre en el layout (solo deja de pintar nada cuando phase==="gone"),
  // así que liberamos el scroll a mano según la fase en vez de esperar un
  // "unmount" que nunca va a pasar.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = phase === "gone" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  // Tilt 3D con el mouse (desktop) — se aplica a la escena completa
  useEffect(() => {
    if (reducedMotion) return;
    const handleMove = (e: MouseEvent) => {
      if (!tiltRef.current) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      tiltRef.current.style.setProperty("--tilt-x", `${x * 10}deg`);
      tiltRef.current.style.setProperty("--tilt-y", `${y * -10}deg`);
    };
    const handleLeave = () => {
      tiltRef.current?.style.setProperty("--tilt-x", "0deg");
      tiltRef.current?.style.setProperty("--tilt-y", "0deg");
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [reducedMotion]);

  // Túnel de partículas en canvas — "warp speed" hacia la cámara.
  // Liviano a propósito: sin librerías 3D, canvas2D con proyección de perspectiva manual.
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mobileCanvas = window.innerWidth < 768;
    const COUNT = mobileCanvas ? 40 : 90;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const FOCAL = 300;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * FOCAL,
    }));

    let hidden = false;
    const onVisibility = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    let speed = 2.2;
    let elapsed = 0;
    let last = performance.now();

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (hidden) {
        last = now;
        return;
      }
      const dt = Math.min(now - last, 48);
      last = now;
      elapsed += dt;
      // acelera al principio, se calma cuando aparece el logo, acelera de nuevo en la salida
      const t = elapsed / 1000;
      if (phase === "exiting") {
        speed = Math.min(speed + dt * 0.03, 14);
      } else {
        speed = 2.2 + Math.min(t, 1) * 1.3;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (const p of particles) {
        p.z -= speed;
        if (p.z <= 1) {
          p.x = (Math.random() - 0.5) * width;
          p.y = (Math.random() - 0.5) * height;
          p.z = FOCAL;
        }
        const scale = FOCAL / p.z;
        const sx = cx + p.x * scale;
        const sy = cy + p.y * scale;
        if (sx < 0 || sx > width || sy < 0 || sy > height) continue;

        const prevScale = FOCAL / (p.z + speed * 1.6);
        const psx = cx + p.x * prevScale;
        const psy = cy + p.y * prevScale;

        const alpha = Math.min(1, (FOCAL - p.z) / FOCAL + 0.25);
        const r = Math.max(0.5, scale * 1.3);

        // estela blanca (la estrella "viajando")
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.85})`;
        ctx.lineWidth = r;
        ctx.beginPath();
        ctx.moveTo(psx, psy);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // punto brillante en la cabeza, más marcado cuanto más cerca de cámara
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.1)})`;
        ctx.arc(sx, sy, r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, phase]);

  if (phase === "gone") return null;

  const ringCount = isMobile ? 5 : 8;
  const rings = Array.from({ length: ringCount });

  return (
    <div
      className={`splash-root ${phase === "exiting" ? "is-exiting" : ""} ${reducedMotion ? "is-reduced" : ""}`}
    >
      {!reducedMotion && <canvas ref={canvasRef} className="splash-canvas" />}
      <div className="splash-noise" />

      {!reducedMotion && (
        <div className="splash-scene" style={{ perspective: isMobile ? "700px" : "1100px" }}>
          <div className="splash-tunnel">
            {rings.map((_, i) => (
              <div
                key={i}
                className="tunnel-ring"
                style={{
                  transform: `translateZ(${-i * (isMobile ? 160 : 210)}px) rotateZ(${i * 7}deg)`,
                  opacity: 1 - i / (ringCount + 2),
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div
        ref={tiltRef}
        className="splash-tilt"
        style={
          {
            "--tilt-x": "0deg",
            "--tilt-y": "0deg",
          } as React.CSSProperties
        }
      >
        <div className="splash-logo-wrap">
          <div className="splash-glow" />
          <div className="splash-logo" data-text="BLACK">
            {["B", "L", "A", "C", "K"].map((letter, i) => (
              <span key={i} data-text={letter} style={{ animationDelay: `${0.55 + i * 0.06}s` }}>
                {/* capas apiladas en Z real para dar volumen; se pintan de atrás hacia adelante
                    (orden de DOM) para que la capa blanca quede siempre arriba, sin depender
                    de que el navegador ordene por profundidad 3D */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const layer = 5 - i;
                  return (
                    <em
                      key={layer}
                      style={{
                        transform: `translateZ(${-layer * 3}px)`,
                        color: layer === 0 ? "#fff" : `rgba(10,10,10,${0.35 + layer * 0.1})`,
                      }}
                    >
                      {letter}
                    </em>
                  );
                })}
              </span>
            ))}
          </div>
          <p className="splash-subtitle">@SOMOSBLACK.AR</p>
          <div className="splash-line" />
        </div>
      </div>

      <div className="splash-flash" />

      <style>{`
        .splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background-color: #050505;
          overflow: hidden;
          transition: opacity 0.45s ease;
        }
        .splash-root.is-exiting {
          opacity: 0;
          pointer-events: none;
        }
        .splash-root.is-reduced {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .splash-canvas {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .splash-noise {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.05;
          z-index: 2;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .splash-scene {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
        }
        .splash-tunnel {
          position: relative;
          width: 60vmin;
          height: 60vmin;
          transform-style: preserve-3d;
          animation: tunnelSpin 14s linear infinite;
        }
        @keyframes tunnelSpin {
          from { transform: rotateZ(0deg); }
          to { transform: rotateZ(360deg); }
        }
        .tunnel-ring {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(230, 58, 46, 0.22);
          border-radius: 6px;
        }

        .splash-tilt {
          position: relative;
          z-index: 4;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: perspective(1000px) rotateY(var(--tilt-x)) rotateX(var(--tilt-y));
          transition: transform 0.15s ease-out;
        }

        .splash-logo-wrap {
          display: block;
          text-align: center;
          transform-style: preserve-3d;
        }

        .splash-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 70vmin;
          height: 70vmin;
          transform: translate(-50%, -50%) translateZ(-40px);
          background: radial-gradient(circle, rgba(230,58,46,0.45) 0%, rgba(230,58,46,0.12) 40%, transparent 70%);
          filter: blur(4px);
          opacity: 0;
          animation: glowIn 1s 0.5s ease-out forwards, glowBreathe 2.6s 1.6s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes glowIn {
          from { opacity: 0; transform: translate(-50%, -50%) translateZ(-40px) scale(0.6); }
          to { opacity: 1; transform: translate(-50%, -50%) translateZ(-40px) scale(1); }
        }
        @keyframes glowBreathe {
          0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) translateZ(-40px) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) translateZ(-40px) scale(1.12); }
        }

        .splash-logo {
          position: relative;
          display: block;
          white-space: nowrap;
          font-family: var(--font-bebas);
          font-size: clamp(68px, 22vw, 160px);
          letter-spacing: 0.09em;
          line-height: 1;
          margin-bottom: 14px;
          transform-style: preserve-3d;
        }

        .splash-logo span {
          position: relative;
          display: inline-block;
          margin-right: 0.06em;
          opacity: 0;
          transform-style: preserve-3d;
          animation: letterFlyIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards,
            letterGlitch 0.35s ease-in-out 3;
          animation-delay: inherit;
        }
        .splash-logo span:last-child {
          margin-right: 0;
        }

        @keyframes letterFlyIn {
          from {
            opacity: 0;
            transform: translateZ(-320px) rotateY(100deg) scale(0.6);
            filter: blur(6px);
          }
          70% {
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateZ(0) rotateY(0deg) scale(1);
            filter: blur(0);
          }
        }

        @keyframes letterGlitch {
          0%, 100% { transform: translate(0); }
          25% { transform: translate(-2px, 1px); }
          50% { transform: translate(2px, -1px); }
          75% { transform: translate(-1px, -1px); }
        }

        .splash-logo span em {
          position: absolute;
          inset: 0;
          font-style: normal;
          display: block;
        }
        .splash-logo span em:first-child {
          position: static;
        }
        .splash-logo span em:last-child {
          text-shadow: 0 0 16px rgba(230, 58, 46, 0.65), 0 0 38px rgba(230, 58, 46, 0.3);
          animation: emGlowPulse 2.4s 1.7s ease-in-out infinite;
        }
        @keyframes emGlowPulse {
          0%, 100% { text-shadow: 0 0 16px rgba(230, 58, 46, 0.65), 0 0 38px rgba(230, 58, 46, 0.3); }
          50% { text-shadow: 0 0 26px rgba(230, 58, 46, 0.9), 0 0 55px rgba(230, 58, 46, 0.45); }
        }

        .splash-subtitle {
          font-family: var(--font-dm);
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #888;
          text-transform: uppercase;
          margin: 0;
          opacity: 0;
          transform: translateZ(20px);
          animation: subtitleIn 0.7s 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes subtitleIn {
          from { opacity: 0; transform: translateY(10px) translateZ(0); letter-spacing: 0.6em; }
          to { opacity: 1; transform: translateY(0) translateZ(20px); letter-spacing: 0.3em; }
        }

        .splash-line {
          position: relative;
          margin: 18px auto 0;
          height: 3px;
          width: 0;
          background: linear-gradient(90deg, transparent, ${ACCENT}, #fff, ${ACCENT}, transparent);
          box-shadow: 0 0 20px rgba(230, 58, 46, 0.8);
          animation: lineGrow 1.4s 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes lineGrow {
          0% { width: 0%; opacity: 1; }
          85% { width: 220px; opacity: 1; }
          100% { width: 220px; opacity: 0.6; }
        }

        .splash-flash {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(230,58,46,0.4) 35%, transparent 70%);
          opacity: 0;
        }
        .splash-root.is-exiting .splash-flash {
          animation: flashPulse 0.5s ease-out forwards;
        }
        @keyframes flashPulse {
          0% { opacity: 0; transform: scale(0.4); }
          40% { opacity: 0.85; transform: scale(1.4); }
          100% { opacity: 0; transform: scale(2.4); }
        }

        .splash-root.is-exiting .splash-tunnel {
          animation: tunnelSpin 14s linear infinite, tunnelPush 0.6s ease-in forwards;
        }
        @keyframes tunnelPush {
          to { transform: translateZ(900px) scale(2.2); }
        }
        .splash-root.is-exiting .splash-logo-wrap {
          animation: logoPush 0.5s ease-in forwards;
        }
        @keyframes logoPush {
          to { transform: translateZ(500px) scale(1.6); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-logo span,
          .splash-subtitle,
          .splash-line {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            width: 220px !important;
          }
        }
      `}</style>
    </div>
  );
}