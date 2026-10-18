"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "playing" | "exiting" | "gone";

// Línea de tiempo (ms). Total: 5s.
//  0.15s  SOMOS aparece letra por letra
//  0.94s  BLACK entra desde cámara (escala grande + blur) ...
//  1.30s  ... IMPACTO: flash, ondas, chispas, shake, aberración cromática
//  1.90s  @SOMOSBLACK.AR  ·  2.00s línea roja
//  4.25s  salida (zoom + fade)  ·  5.00s fin
const IMPACT_AT = 1300;
const EXIT_AT = 4250;
const GONE_AT = 5000;

const SOMOS = "SOMOS".split("");

const rand = (min: number, max: number) => min + Math.random() * (max - min);

interface Star {
  x: number;
  y: number;
  z: number;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  width: number;
}

const SPARK_COLORS = ["#ffffff", "#ffffff", "#ffffff", "#ff4a3a", "#E63A2E", "#ff8a2a"];

export default function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("playing");
  const [reducedMotion, setReducedMotion] = useState(false);
  // Estado (no classList): React re-renderiza y pisaría clases agregadas a mano.
  const [impact, setImpact] = useState(false);

  const phaseRef = useRef<Phase>("playing");
  const tiltRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);

  // Fases de tiempo + preferencia de movimiento reducido.
  // Se lee window solo acá (efecto), nunca en el render → sin mismatch de hidratación.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);
    const go = (p: Phase) => {
      phaseRef.current = p;
      setPhase(p);
    };
    const t1 = setTimeout(() => go("exiting"), reduced ? 1400 : EXIT_AT);
    const t2 = setTimeout(() => go("gone"), reduced ? 1900 : GONE_AT);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // El componente queda montado en el layout: liberamos el scroll según la fase.
  useEffect(() => {
    document.body.style.overflow = phase === "gone" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  // Tilt sutil con el mouse (solo desktop con puntero fino). Sin estado: se escribe directo al style.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = tiltRef.current;
        if (!el) return;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        el.style.transform = `perspective(900px) rotateY(${nx * 7}deg) rotateX(${-ny * 7}deg)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // Canvas: estrellas blancas viajando + ráfaga de chispas en el impacto.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const stars: Star[] = Array.from({ length: mobile ? 36 : 80 }, () => ({
      x: rand(-1, 1),
      y: rand(-1, 1),
      z: rand(0.1, 1),
    }));
    const sparks: Spark[] = [];

    const spawnSparks = () => {
      const rect = blackRef.current?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : w / 2;
      const cy = rect ? rect.top + rect.height / 2 : h / 2;
      const rw = rect ? rect.width : w * 0.6;
      const rh = rect ? rect.height : h * 0.2;
      const count = mobile ? 80 : 170;
      const speedScale = mobile ? 0.7 : 1;
      for (let i = 0; i < count; i++) {
        // Nace dentro del rectángulo de BLACK y sale disparada hacia afuera desde el centro.
        const px = cx + rand(-0.5, 0.5) * rw;
        const py = cy + rand(-0.5, 0.5) * rh;
        const ang = Math.atan2(py - cy, px - cx) + rand(-0.5, 0.5);
        const speed = rand(140, 1400) * speedScale;
        const max = rand(0.55, 1.35);
        sparks.push({
          x: px,
          y: py,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          life: max,
          max,
          color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
          width: rand(1, 2.6),
        });
      }
    };

    const start = performance.now();
    let last = start;
    let impacted = false;
    let impactAt = 0;
    let raf = 0;

    const frame = (now: number) => {
      if (phaseRef.current === "gone") return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const elapsed = now - start;

      if (!impacted && elapsed >= IMPACT_AT) {
        impacted = true;
        impactAt = elapsed;
        spawnSparks();
        setImpact(true);
      }

      // Velocidad del "viaje": base + empujón al impactar (decae) + aceleración en la salida.
      let speed = 0.22;
      if (impacted) speed += 2.6 * Math.exp(-(elapsed - impactAt) / 380);
      if (phaseRef.current === "exiting") speed += 2.2;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      // Estrellas: proyección de perspectiva manual con estela.
      const f = Math.max(w, h) * 0.5;
      const cx = w / 2;
      const cy = h / 2;
      ctx.lineCap = "round";
      for (const s of stars) {
        const prevZ = s.z + speed * dt * 2.4 + 0.004;
        s.z -= speed * dt;
        const sx = cx + (s.x / s.z) * f;
        const sy = cy + (s.y / s.z) * f;
        if (s.z <= 0.03 || sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) {
          s.x = rand(-1, 1);
          s.y = rand(-1, 1);
          s.z = 1;
          continue;
        }
        const px = cx + (s.x / prevZ) * f;
        const py = cy + (s.y / prevZ) * f;
        const near = 1 - s.z;
        ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, near * 1.4 + 0.2).toFixed(3)})`;
        ctx.lineWidth = near * 2 + 0.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      // Chispas (aditivas para que "brillen").
      if (sparks.length) {
        ctx.globalCompositeOperation = "lighter";
        const drag = Math.exp(-2.2 * dt);
        for (let i = sparks.length - 1; i >= 0; i--) {
          const p = sparks[i];
          p.life -= dt;
          if (p.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          p.vx *= drag;
          p.vy *= drag;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          ctx.globalAlpha = Math.max(0, p.life / p.max);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.width;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (phase === "gone") return null;

  const cls = [
    "sp-root",
    impact ? "sp-impact" : "",
    phase === "exiting" ? "sp-exiting" : "",
    reducedMotion ? "sp-reduced" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} aria-hidden="true">
      <canvas ref={canvasRef} className="sp-canvas" />
      <div className="sp-flash" />

      <div ref={tiltRef} className="sp-tilt">
        <div className="sp-out">
          <div className="sp-shake">
            <div className="sp-somos">
              {SOMOS.map((ch, i) => (
                <span key={i} style={{ animationDelay: `${0.15 + i * 0.09}s` }}>
                  {ch}
                </span>
              ))}
            </div>

            <div ref={blackRef} className="sp-black">
              <span className="sp-ring sp-ring-a" />
              <span className="sp-ring sp-ring-b" />
              <span className="sp-word" data-text="BLACK">
                BLACK
              </span>
            </div>

            <div className="sp-sub">@SOMOSBLACK.AR</div>
            <div className="sp-line" />
          </div>
        </div>
      </div>

      <style>{`
        .sp-root{
          position:fixed;inset:0;z-index:9999;background:#000;overflow:hidden;
          display:flex;align-items:center;justify-content:center;
          opacity:1;transition:opacity .75s ease-in;
        }
        .sp-root.sp-exiting{opacity:0;pointer-events:none}
        .sp-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}

        .sp-flash{
          position:absolute;inset:0;pointer-events:none;opacity:0;
          background:radial-gradient(circle at 50% 54%,rgba(255,255,255,.95) 0%,rgba(230,58,46,.55) 28%,rgba(0,0,0,0) 65%);
        }
        .sp-impact .sp-flash{animation:spFlash .55s ease-out both}

        .sp-tilt{position:relative;will-change:transform;transition:transform .15s ease-out}
        .sp-out{will-change:transform,opacity}
        .sp-exiting .sp-out{animation:spOut .75s cubic-bezier(.6,0,.9,.5) forwards}
        .sp-shake{
          display:flex;flex-direction:column;align-items:center;
          padding:0 16px;text-align:center;
        }
        .sp-impact .sp-shake{animation:spShake .5s linear both}

        /* SOMOS */
        .sp-somos{
          display:flex;font-family:var(--font-bebas),"Bebas Neue",sans-serif;
          font-size:clamp(30px,9.5vw,64px);line-height:1;color:#fff;
          letter-spacing:.42em;padding-left:.42em;margin-bottom:.08em;
          text-shadow:0 0 18px rgba(255,255,255,.35);
        }
        .sp-somos span{display:inline-block;animation:spSomosIn .7s cubic-bezier(.2,.8,.2,1) both}

        /* BLACK */
        .sp-black{
          position:relative;display:inline-block;color:#fff;
          font-family:var(--font-bebas),"Bebas Neue",sans-serif;
          font-size:clamp(88px,33vw,250px);line-height:.85;letter-spacing:.01em;
          transform-origin:50% 55%;
          animation:spSlam .58s .94s both, spGlow 1.6s 1.3s ease-out forwards;
          will-change:transform,filter,opacity;
        }
        .sp-word{position:relative;display:block;white-space:nowrap}
        .sp-word::before,.sp-word::after{
          content:attr(data-text);position:absolute;inset:0;opacity:0;
          text-shadow:none;mix-blend-mode:screen;pointer-events:none;
        }
        .sp-word::before{color:#ff2a1a}
        .sp-word::after{color:#00e5ff}
        .sp-impact .sp-word::before{animation:spAbL .5s ease-out both}
        .sp-impact .sp-word::after{animation:spAbR .5s ease-out both}

        .sp-ring{
          position:absolute;left:50%;top:50%;width:26vmin;height:26vmin;
          margin:-13vmin 0 0 -13vmin;border-radius:50%;opacity:0;pointer-events:none;
          border:3px solid rgba(255,255,255,.9);
        }
        .sp-ring-b{border-color:rgba(230,58,46,.9);border-width:2px}
        .sp-impact .sp-ring-a{animation:spRing .9s cubic-bezier(.1,.6,.3,1) both}
        .sp-impact .sp-ring-b{animation:spRing 1.1s .08s cubic-bezier(.1,.6,.3,1) both}

        .sp-sub{
          margin-top:18px;font-family:var(--font-dm),system-ui,sans-serif;font-weight:600;
          font-size:12px;letter-spacing:.5em;padding-left:.5em;color:rgba(255,255,255,.75);
          animation:spFade .7s 1.9s both;
        }
        .sp-line{
          margin-top:14px;height:2px;width:64px;background:#E63A2E;transform-origin:50% 50%;
          animation:spLine .6s 2s cubic-bezier(.2,.8,.2,1) both;
        }

        @keyframes spSomosIn{
          from{opacity:0;filter:blur(12px);transform:translateY(14px) scale(1.18)}
          to{opacity:1;filter:blur(0);transform:none}
        }
        @keyframes spSlam{
          0%{opacity:0;transform:scale(3.4);filter:blur(14px);animation-timing-function:cubic-bezier(.55,0,1,.45)}
          10%{opacity:1;animation-timing-function:cubic-bezier(.55,0,1,.45)}
          62%{opacity:1;transform:scale(1);filter:blur(0);animation-timing-function:ease-out}
          75%{transform:scale(.94);animation-timing-function:ease-in-out}
          88%{transform:scale(1.02);animation-timing-function:ease-out}
          100%{opacity:1;transform:scale(1);filter:none}
        }
        @keyframes spGlow{
          0%{text-shadow:0 0 6px #fff,0 0 30px #ff3a2a,0 0 80px #E63A2E}
          100%{text-shadow:0 0 0 rgba(230,58,46,0),0 0 24px rgba(230,58,46,.35),0 0 60px rgba(230,58,46,.2)}
        }
        @keyframes spFlash{0%{opacity:1}100%{opacity:0}}
        @keyframes spShake{
          0%{transform:translate(0,0)}
          12%{transform:translate(-9px,5px)}
          26%{transform:translate(8px,-6px)}
          40%{transform:translate(-6px,-3px)}
          55%{transform:translate(5px,4px)}
          72%{transform:translate(-2px,2px)}
          100%{transform:translate(0,0)}
        }
        @keyframes spAbL{0%{opacity:.9;transform:translateX(-10px)}100%{opacity:0;transform:translateX(0)}}
        @keyframes spAbR{0%{opacity:.9;transform:translateX(10px)}100%{opacity:0;transform:translateX(0)}}
        @keyframes spRing{
          0%{opacity:1;transform:scale(.2)}
          100%{opacity:0;transform:scale(14)}
        }
        @keyframes spFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes spLine{from{opacity:0;transform:scaleX(0)}to{opacity:1;transform:scaleX(1)}}
        @keyframes spOut{
          0%{opacity:1;transform:scale(1);filter:blur(0)}
          100%{opacity:0;transform:scale(1.8);filter:blur(10px)}
        }

        /* Movimiento reducido: composición final estática, sin animaciones. */
        .sp-reduced *,.sp-reduced *::before,.sp-reduced *::after{animation:none!important;transition:none!important}
        .sp-reduced .sp-ring,.sp-reduced .sp-flash{display:none}
        .sp-reduced.sp-exiting{opacity:0;transition:opacity .4s linear!important}
      `}</style>
    </div>
  );
}