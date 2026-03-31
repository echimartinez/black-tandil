"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getProductById } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
/* import StickyCartButton from "@/components/StickyCartButton"; */

export default function ProductPageClient({ id }: { id: string }) {
  const router = useRouter();
  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const p = getProductById(Number(id));
    console.log("valor p"+p);
    if (!p) router.push("/");
    else setProduct(p);
  }, [id, router]);

  console.log("images del producto:", product?.images);

  if (!product) return null;

  const images = product.images?.length ? product.images : [product.image];
  const sizes = product.sizes ?? ["S", "M", "L", "XL"];

  const handleSizeError = () => {
    setSizeError(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // NO hay setTimeout — el error se queda hasta que elija talle
  };

  const handleAddToCart = () => {
    if (!selectedSize) { handleSizeError(); return; }
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openCart();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setSelectedImage(i => Math.min(i + 1, images.length - 1));
      else setSelectedImage(i => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  };

  const stockForSize = selectedSize && product.stockBySize
    ? product.stockBySize[selectedSize]
    : null;

  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? null : section);
  };
  console.log("images:", images, "length:", images.length);
  return (
    <div className="w-full pb-28">

      <button onClick={() => router.back()}
        className="flex items-center gap-1.5 px-4 py-3 text-xs font-dm text-[#888] hover:text-[#111] transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Volver
      </button>

      {/* Galería con swipe */}
      <div
        className="relative w-full aspect-square bg-[#ECEAE4] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image src={images[selectedImage]} alt={product.name} fill sizes="100vw" priority className="object-cover" />
      </div>
      
      {/* Miniaturas */}
      {images.length >= 0  && (
        <div className="flex gap-2 px-4 mt-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-all ${
                i === selectedImage ? "border-[#111]" : "border-transparent opacity-50"
              }`}
            >
              <div className="relative w-full h-full">
                <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="px-4 pt-5">
        <span className="text-[10px] font-dm text-[#E63A2E] uppercase tracking-widest font-semibold">
          {product.category ?? "Producto"}
        </span>
        <h1 className="font-bebas text-4xl tracking-tight text-[#111] mt-0.5 leading-none">{product.name}</h1>
        {product.description && <p className="font-dm text-sm text-[#888] mt-1">{product.description}</p>}
        <p className="font-dm font-bold text-2xl text-[#111] mt-3">${product.price.toLocaleString("es-AR")}</p>
        <p className="font-dm text-xs text-[#888] mt-0.5">Hasta 6 cuotas sin interés con todos los bancos</p>
      </div>

      {/* Talles */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className={`font-dm text-xs uppercase tracking-widest font-semibold transition-colors ${sizeError ? "text-[#E63A2E]" : "text-[#888]"}`}>
            {sizeError ? "⚠ Seleccioná un talle" : "Talles"}
          </p>
          <button className="font-dm text-xs text-[#888] underline">Guía de talles</button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => {
            const stock = product.stockBySize?.[size] ?? 99;
            const outOfStock = stock === 0;
            return (
              <button key={size} onClick={() => { if (!outOfStock) { setSelectedSize(size); setSizeError(false); } }} disabled={outOfStock}
                className={`py-3 border rounded-sm font-dm font-semibold text-sm transition-all relative ${
                  selectedSize === size ? "bg-[#111] text-white border-[#111]"
                  : outOfStock ? "bg-[#F5F4F0] text-[#CCC] border-[#E0DED8] cursor-not-allowed line-through"
                  : "bg-white text-[#111] border-[#E0DED8] hover:border-[#111]"
                }`}>
                {size}
                {!outOfStock && stock <= 3 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#E63A2E] text-white text-[8px] font-bold px-1 rounded-full">
                    ¡{stock}!
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedSize && stockForSize !== null && (
          <p className="font-dm text-xs text-[#E63A2E] mt-2">Solo quedan {stockForSize} en nuestros almacenes</p>
        )}
      </div>

      {/* Botón inline */}
      <div className="px-4 mt-5">
        <button onClick={handleAddToCart}
          className={`w-full font-dm font-semibold text-xs uppercase tracking-widest py-4 rounded-sm transition-all ${
            added ? "bg-[#2A7D4F] text-white" : "bg-[#111] text-white hover:bg-[#333]"
          }`}>
          {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
        </button>
      </div>

      {product.longDescription && (
        <div className="px-4 mt-6">
          <p className="font-dm text-sm text-[#444] leading-relaxed">{product.longDescription}</p>
        </div>
      )}

      {product.benefits && (
        <div className="px-4 mt-5">
          <p className="font-dm text-xs text-[#888] uppercase tracking-widest font-semibold mb-3">Beneficios</p>
          <ul className="space-y-2">
            {product.benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-2 font-dm text-sm text-[#444]">
                <span className="w-1 h-1 bg-[#E63A2E] rounded-full flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.details && (
        <div className="px-4 mt-5">
          {product.details.map((d, i) => (
            <div key={i} className="flex justify-between py-2.5 border-b border-[#F0EDE6]">
              <span className="font-dm text-xs text-[#888]">{d.label}</span>
              <span className="font-dm text-xs text-[#111] font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 mt-6 border-t border-[#E0DED8]">
        {[
          { key: "envios", title: "Devoluciones y envíos", content: "Hacemos envíos a todo el país por correo argentino o Andreani. Los cambios y devoluciones se aceptan dentro de los 10 días de recibido el producto, siempre que esté en su estado original con etiquetas." },
          { key: "pagos", title: "Métodos de pago", content: "Aceptamos MercadoPago, tarjetas de crédito y débito de todos los bancos. Hasta 6 cuotas sin interés con tarjetas seleccionadas. También transferencia bancaria con 10% de descuento." },
        ].map(({ key, title, content }) => (
          <div key={key} className="border-b border-[#E0DED8]">
            <button onClick={() => toggleSection(key)}
              className="w-full flex items-center justify-between py-4 font-dm font-semibold text-sm text-[#111]">
              {title}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform duration-200 ${openSection === key ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {openSection === key && <p className="font-dm text-sm text-[#666] pb-4 leading-relaxed">{content}</p>}
          </div>
        ))}
      </div>

    {/*   <StickyCartButton product={product} selectedSize={selectedSize} onSizeError={handleSizeError} /> */}
    </div>
  );
}
