import { Product } from '@/types';
 
export const products: Product[] = [
  {
    id: 1,
    name: "Camisaco Oversize Marron",
    price: 12000,
    image: "/camisacos.png",
    images: ["/camisacos.png", "/camisaco2.png"],
    category: "Camisacos",
    description: "Camisaco oversize de tela liviana, ideal para el día a día.",
    longDescription: "Un camisaco oversize de corte relajado, confeccionado en tela liviana de alta calidad. Diseñado para combinar comodidad y estilo urbano en cualquier ocasión. Su patrón cuadrillé en tonos marrones lo hace versátil y fácil de combinar.",
    benefits: [
      "Tela 100% algodón",
      "Corte oversize",
      "Costuras reforzadas",
      "Lavable a máquina",
    ],
    details: [
      { label: "Color", value: "Marrón / Negro" },
      { label: "Estilo", value: "Oversize" },
      { label: "Origen", value: "Nacional" },
    ],
    sizes: ["S", "M", "L", "XL"],
    stockBySize: { S: 3, M: 5, L: 4, XL: 2 },
  },
];
 
export function getProductById(id: number): Product | undefined {
  return products.find(p => p.id === id);
}