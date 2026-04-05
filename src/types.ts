export interface Product {
  _id?: string;        // MongoDB ID (cuando viene de la DB)
  id: number | string; // ID estático (cuando viene de products.ts)
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description?: string;
  longDescription?: string;
  benefits?: string[];
  details?: { label: string; value: string }[];
  stock?: number;
  stockBySize?: Record<string, number>;
  sizes?: string[];
  category?: string;
  sale?: boolean;
  isNew?: boolean;
  featured?: boolean;
  active?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Order {
  external_reference: string;
  title: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  payment_id?: string;
  createdAt?: Date;
}

export interface CheckoutResponse {
  init_point: string;
}

export interface CheckoutError {
  error: string;
}