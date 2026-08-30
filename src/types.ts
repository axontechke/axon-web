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

// Unified color entry: name + hex code + swatch image URL
// One color can be reused across multiple storage variants; variantImages override for specific combos
export interface ProductColor {
  name: string;        // e.g. "Midnight Black"
  code: string;        // e.g. "#1a1a1a" (hex color)
  image: string;      // e.g. "https://..." (swatch/product photo URL)
}

// A complete SKU at storage level — holds colors, warranty IDs, simType and price for that storage
// Per-variant warranty assignment with optional price override
export interface VariantWarrantyAssignment {
  id: string;       // references Warranty.id in product.warranties
  priceKsh: number; // price for this variant; falls back to Warranty.priceKsh if not set
}

// Global SIM Type (admin-managed, works for phones, tablets, watches, routers, laptops etc.)
export interface SimType {
  id: string;
  name: string;        // display e.g. "Physical SIM"
  code: string;        // stored value e.g. "physical" — used in storageVariants.simType
  description?: string;
}

export interface StorageVariant {
  storage: string;              // e.g. "256GB", "512GB", "1TB"
  priceKsh: number;             // price for this storage SKU
  simType: string;              // references SimType.code — admin CRUD, generic for any product category
  colors: ProductColor[];        // colors available for this storage (each with name, code, image, and optional priceKsh override)
  warranties: VariantWarrantyAssignment[]; // warranty assignments with optional per-variant price override
  stock: number;
}

// Legacy per-combo variant (storage + color) with optional price override
export interface ProductVariant {
  storage: string;
  color: string;
  priceKsh?: number;
  stock?: number;
}

// Stored in DB: multiple images per (storage, color) combo
export interface VariantImageEntry {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

// Frontend: variantImages is keyed by "storage|color" or "base" for product-level
export type VariantImagesMap = Record<string, VariantImageEntry[]>;

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
  priceRange?: string;
  colors: ProductColor[];             // unified color entries (name + hex + image)
  colorCodes?: Record<string, string>; // legacy: { "Midnight Black": "#1a1a1a" } — migrated to colors[].code
  storages?: string[];
  colorImages?: Record<string, string>; // legacy: { "Royal Blue": "https://..." } — migrated to colors[].image
  variants?: ProductVariant[];       // per-combo variants with stock & price (legacy)
  variantImages?: VariantImagesMap;   // { "128GB|Obsidian": [...images], "base": [...] }
  // New structured SKU storage variants — each storage has its own colors, warranties, simType, price
  storageVariants?: StorageVariant[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  preOrder?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  specifications?: Record<string, string>;
  reviews?: Review[];
  warranties?: Warranty[]; // available warranty plans; first one is the default/free
  simType?: string; // product-level fallback SIM type — references SimType.code (admin-managed)
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  selectedWarranty?: Warranty;
  selectedSimType?: string; // references SimType.code — ensures newly added SIM types persist through cart/checkout
}

export type AppScreen = "Home" | "Catalog" | "ProductDetail" | "Checkout" | "Confirmation" | "TrackOrder" | "Admin" | "Contact" | "Blog";

export const AXON_PRODUCTS: Product[] = [];
