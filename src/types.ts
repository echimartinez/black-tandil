export interface Product {
  id: number;
  name: string;
  price: number;
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