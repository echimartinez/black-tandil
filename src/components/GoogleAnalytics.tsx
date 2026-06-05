import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// ─── Helpers para trackear eventos ───────────────────────────────────────────

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function trackEvent(action: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, params);
  }
}

// Eventos predefinidos para la tienda
export const GA = {
  addToCart: (product: { name: string; price: number; id: string }, size: string) =>
    trackEvent("add_to_cart", {
      currency: "ARS",
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, price: product.price, item_variant: size, quantity: 1 }],
    }),

  beginCheckout: (amount: number, items: any[]) =>
    trackEvent("begin_checkout", {
      currency: "ARS",
      value: amount,
      items,
    }),

  purchase: (orderId: string, amount: number, items: any[]) =>
    trackEvent("purchase", {
      transaction_id: orderId,
      currency: "ARS",
      value: amount,
      items,
    }),

  viewProduct: (product: { name: string; price: number; id: string }) =>
    trackEvent("view_item", {
      currency: "ARS",
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, price: product.price }],
    }),

  search: (query: string) =>
    trackEvent("search", { search_term: query }),
};