"use client";

import { useEffect, useState } from "react";

// Barra de progreso de scroll + botón "volver arriba". Vive una sola vez
// en el layout, así aplica a todo el sitio (no solo el home).
export default function ScrollUtils() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowTop(window.scrollY > 600);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Barra fina arriba de todo — se llena con el scroll (CSS puro, sin JS) */}
      <div className="scroll-progress-track" aria-hidden="true">
        <div className="scroll-progress-bar" />
      </div>

      <button
        onClick={scrollToTop}
        aria-label="Volver arriba"
        className={`back-to-top ${showTop ? "back-to-top-visible" : ""}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}