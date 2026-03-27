export interface SubCategory {
  name: string;
  slug: string;
}
 
export interface Category {
  name: string;
  slug: string;
  subcategories: SubCategory[];
  highlight?: boolean; // para "Sale" en rojo
}
 
export const categories: Category[] = [
  {
    name: "Hombre",
    slug: "hombre",
    subcategories: [
      { name: "Buzos", slug: "hombre/buzos" },
      { name: "Remeras", slug: "hombre/remeras" },
      { name: "Pantalones", slug: "hombre/pantalones" },
      { name: "Accesorios", slug: "hombre/accesorios" },
    ],
  },
  {
    name: "Mujer",
    slug: "mujer",
    subcategories: [
      { name: "Buzos", slug: "mujer/buzos" },
      { name: "Remeras", slug: "mujer/remeras" },
      { name: "Pantalones", slug: "mujer/pantalones" },
      { name: "Accesorios", slug: "mujer/accesorios" },
    ],
  },
  {
    name: "Sale",
    slug: "sale",
    highlight: true,
    subcategories: [
      { name: "Buzos", slug: "sale/buzos" },
      { name: "Remeras", slug: "sale/remeras" },
      { name: "Pantalones", slug: "sale/pantalones" },
      { name: "Accesorios", slug: "sale/accesorios" },
    ],
  },
];
