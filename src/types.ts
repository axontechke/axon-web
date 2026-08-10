export interface Review {
  id: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  author: string;
  verified: boolean;
}

export interface ProductVariant {
  storage: string;
  color: string;
  stock: number;
}

// New flat variant map: { "512GB": { "Blue,Silver": 210000 } }
export type VariantMap = Record<string, Record<string, number>>;

export function formatProductPrice(product: { price?: number; priceKsh?: number }): string {
  const parts: string[] = [];
  if (product.priceKsh !== undefined && product.priceKsh !== null && product.priceKsh !== 0) {
    parts.push(`KSh ${product.priceKsh.toLocaleString()}`);
  }
  if (product.price !== undefined && product.price !== null && product.price !== 0) {
    parts.push(`$${product.price.toLocaleString()} USD`);
  }
  return parts.length > 0 ? parts.join(" / ") : "Contact for Price";
}

export interface Product {
  id: string;
  name: string;
  price?: number;
  priceKsh?: number;
  description: string;
  category: string;
  brand: string;
  image: string;
  images?: string[];
  colors?: string[];
  storages?: string[];
  variants?: VariantMap;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  preOrder?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  specifications?: Record<string, string>;
  reviews?: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
}

export type AppScreen = "Home" | "Catalog" | "ProductDetail" | "Checkout" | "Confirmation" | "TrackOrder" | "Admin" | "Contact" | "Blog";

export const AXON_PRODUCTS: Product[] = [];
