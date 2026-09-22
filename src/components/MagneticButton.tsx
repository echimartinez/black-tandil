"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

// Botón que sigue levemente al cursor (efecto "magnético"). Se desactiva
// solo en touch (no hay mousemove real) vía la propia lógica de eventos.
export default function MagneticButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`hero-cta-magnetic ${className}`}
    >
      <span className="hero-cta-ring" />
      <span className="hero-cta-shine" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}