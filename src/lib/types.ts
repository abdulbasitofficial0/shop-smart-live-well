export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  stock: number;
  featured: boolean;
  images: string[];
  variants: { name: string; values: string[] }[];
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  variant: Record<string, string>;
  product?: Product;
};

export type Order = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  payment_method: string;
  items: { product_id: string; name: string; price: number; quantity: number; variant: Record<string, string>; image?: string }[];
  product_total: number;
  delivery_charges: number;
  cod_charges: number;
  grand_total: number;
  status: string;
  created_at: string;
};

export const DELIVERY_PER_UNIT = 170;
export const COD_FEE = 60;

export function formatPKR(n: number) {
  return `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
}
