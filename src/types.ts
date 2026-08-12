export interface Review {
  id: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  author: string;
  verified: boolean;
}

export interface Warranty {
  id: string;
  name: string;
  duration: string; // e.g. "1 Year", "2 Years"
  priceKsh: number;
}

export interface ProductVariant {
  storage: string;
  color: string;
  stock: number;
}

// New flat variant map: { "512GB": { "Blue,Silver": 210000 } }
export type VariantMap = Record<string, Record<string, number>>;

export const CURRENCY_SYMBOL = "KSh";

export function formatProductPrice(product: { priceKsh?: number }): string {
  if (product.priceKsh !== undefined && product.priceKsh !== null && product.priceKsh !== 0) {
    return `${CURRENCY_SYMBOL} ${product.priceKsh.toLocaleString()}`;
  }
  return "Contact for Price";
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
  colorImages?: Record<string, string>; // { "Royal Blue": "https://...", "Silver": "https://..." }
  variants?: VariantMap;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  preOrder?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  specifications?: Record<string, string>;
  reviews?: Review[];
  warranties?: Warranty[]; // available warranty plans; first one is the default/free
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  selectedWarranty?: Warranty;
}

export type AppScreen = "Home" | "Catalog" | "ProductDetail" | "Checkout" | "Confirmation" | "TrackOrder" | "Admin" | "Contact" | "Blog";

export const AXON_PRODUCTS: Product[] = [];
