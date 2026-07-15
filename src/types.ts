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

export function formatProductPrice(product: { price?: number; priceKsh?: number }): string {
  const parts: string[] = [];
  if (product.price !== undefined && product.price !== null && product.price !== 0) {
    parts.push(`$${product.price.toLocaleString()} USD`);
  }
  if (product.priceKsh !== undefined && product.priceKsh !== null && product.priceKsh !== 0) {
    parts.push(`KSh ${product.priceKsh.toLocaleString()}`);
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
  variants?: ProductVariant[];
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

export const AXON_PRODUCTS: Product[] = [
  {
    id: "axon-slate-pro",
    name: "Axon Slate Pro",
    price: 899,
    description: "The ultimate canvas for your creativity. Engineered with the new Axon-X1 chip, a stunning Liquid Infinity Display, and all-day battery life to power your most demanding professional workflows.",
    category: "Tablets",
    brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsEaA-6jW08RfQxSwo9FHWNJjhM-Suo4qO0q0TAZHUyl0fTawdKbiNaKINqnvUByZVhMmJ5f5tFNwwKpmZf-SWBa3G92PMNYFrErwe-94XGSCE7KEedOSkYQ6-eT-o7WIQhURb_7afTAT-7pCwcd1SFHZnc0fvSdUR8J02RUertATSpdkffarq5qs40j8MjaOLFr_4DKuAA3u6Wg5xwWeIzSnBrCGN2RezoiK2HYiauNE90S3qIbZM48e4",
    colors: ["Silver", "Slate", "Teal"],
    storages: ["128GB", "256GB"],
    rating: 4.8,
    reviewsCount: 124,
    inStock: true,
    isNew: true,
    specifications: {
      "Display": "12.9-inch Liquid Infinity Retina, 120Hz ProMotion technology",
      "Processor": "Axon-X1 Chip with 12-core CPU and 16-core GPU",
      "Camera": "12MP Ultra Wide Front Camera with Center Focus",
      "Battery": "Up to 12 hours of surf time on Wi-Fi",
      "Connectivity": "Wi-Fi 6E, Bluetooth 5.3, USB-C (Thunderbolt 4)"
    },
    reviews: [
      {
        id: "r1",
        rating: 5,
        date: "2 days ago",
        title: "Perfect for Illustrators",
        content: "The display quality is unmatched. I've used every major tablet on the market, but the Axon Slate Pro's color accuracy is a game changer for my professional work.",
        author: "Julian D.",
        verified: true
      },
      {
        id: "r2",
        rating: 5,
        date: "1 week ago",
        title: "Blazing Fast",
        content: "Video editing on the go has never been easier. The X1 chip handles 4K footage without breaking a sweat. Truly a pro device.",
        author: "Sarah M.",
        verified: true
      },
      {
        id: "r3",
        rating: 4.5,
        date: "2 weeks ago",
        title: "Minimalist Marvel",
        content: "The design is gorgeous. It's so thin yet feels incredibly durable. Highly recommend for anyone looking for both form and function.",
        author: "Robert K.",
        verified: true
      }
    ]
  },
  {
    id: "axon-buds-pro",
    name: "Axon Buds Pro",
    price: 249,
    description: "Immersive spatial audio with clinical-grade noise cancellation. Experience crystal clear sound signature with deep resonant bass.",
    category: "Audio",
    brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLveukNAEEoaiw0J0ZyTdRXCDLDQeVriO8RPSO07VqG6LHuiZKbAt4Dg2sTdEfKEVFdO33e963etV-9ywn6q-U126LftC3Q0kB_aQMU-EKLMckpd2aCFL_Pyyl2-AkanE_okTJuZzBGlzw5tb32ajPvIu5lS3mfVY_RnFsbf6v3XkJV5QJbbqsVdId9xnP2Q0qRYv7txovrj2FlvoymhwrD79wh7gY8qUKTseKN2eKJVclJ_JtsDptLGO2E",
    colors: ["Teal", "White", "Copper"],
    rating: 4.7,
    reviewsCount: 88,
    inStock: true,
    isBestSeller: true
  },
  {
    id: "axon-audio-engine",
    name: "Axon Audio Engine",
    price: 1299,
    description: "High-fidelity professional sound processor and amplification stage. Built-in digital audio converters deliver impeccable studio-grade clarity.",
    category: "Audio",
    brand: "Quantum",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLtF6fRV5vlFFWB1ECsMepx4t792VSBdFhAKnum1o61Q3YXOWx6HH_gwHIEmYE_QuN36V6foHZGml2yWCGcw7j-AvkYhXTuf7KX8VJUdhFxLdvakWUedjkYmI5t26ep68EBgsZlnkf-groo1LQeIwsqFFpzH_s4wbrpW79l0Cj5T3yYhV938-LgIC1dTh7re0qDuNamtslKnRNz6PBW-jIln1kGdc2SGYcqNrnCaQV34-uI_7AzE1_0E5w",
    rating: 4.9,
    reviewsCount: 42,
    inStock: true
  },
  {
    id: "power-capsule-v2",
    name: "Power Capsule V2",
    price: 79,
    description: "Modern modular power bank and high-speed multi-charging capsule. Perfect for maintaining all your portable gear powered on the move.",
    category: "Power",
    brand: "Volt",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLveukNAEEoaiw0J0ZyTdRXCDLDQeVriO8RPSO07VqG6LHuiZKbAt4Dg2sTdEfKEVFdO33e963etV-9ywn6q-U126LftC3Q0kB_aQMU-EKLMckpd2aCFL_Pyyl2-AkanE_okTJuZzBGlzw5tb32ajPvIu5lS3mfVY_RnFsbf6v3XkJV5QJbbqsVdId9xnP2Q0qRYv7txovrj2FlvoymhwrD79wh7gY8qUKTseKN2eKJVclJ_JtsDptLGO2E",
    rating: 4.5,
    reviewsCount: 56,
    inStock: true
  },
  {
    id: "axon-buds-light",
    name: "Axon Buds Light",
    price: 129,
    description: "Lightweight true wireless earphones. Balanced sound delivery, rapid charge, and comfort-focused ergonomics for extended daily wear.",
    category: "Audio",
    brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLveukNAEEoaiw0J0ZyTdRXCDLDQeVriO8RPSO07VqG6LHuiZKbAt4Dg2sTdEfKEVFdO33e963etV-9ywn6q-U126LftC3Q0kB_aQMU-EKLMckpd2aCFL_Pyyl2-AkanE_okTJuZzBGlzw5tb32ajPvIu5lS3mfVY_RnFsbf6v3XkJV5QJbbqsVdId9xnP2Q0qRYv7txovrj2FlvoymhwrD79wh7gY8qUKTseKN2eKJVclJ_JtsDptLGO2E",
    colors: ["Charcoal", "White", "Coral"],
    rating: 4.3,
    reviewsCount: 212,
    inStock: true
  },
  {
    id: "axon-slate-air",
    name: "Axon Slate Air",
    price: 899,
    description: "Ultra-thin, featherweight tablet for pure mobility. Immersive liquid Retina display combined with highly efficient Axon power-saving architectures.",
    category: "Tablets",
    brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsEaA-6jW08RfQxSwo9FHWNJjhM-Suo4qO0q0TAZHUyl0fTawdKbiNaKINqnvUByZVhMmJ5f5tFNwwKpmZf-SWBa3G92PMNYFrErwe-94XGSCE7KEedOSkYQ6-eT-o7WIQhURb_7afTAT-7pCwcd1SFHZnc0fvSdUR8J02RUertATSpdkffarq5qs40j8MjaOLFr_4DKuAA3u6Wg5xwWeIzSnBrCGN2RezoiK2HYiauNE90S3qIbZM48e4",
    rating: 4.6,
    reviewsCount: 37,
    inStock: true,
    isNew: true
  },
  {
    id: "linear-sound-bar",
    name: "Linear Sound Bar",
    price: 450,
    description: "Compact multi-unit audio column with spatial stage sound algorithms. Completely redefines living room audio dynamics.",
    category: "Audio",
    brand: "Vortex",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLtF6fRV5vlFFWB1ECsMepx4t792VSBdFhAKnum1o61Q3YXOWx6HH_gwHIEmYE_QuN36V6foHZGml2yWCGcw7j-AvkYhXTuf7KX8VJUdhFxLdvakWUedjkYmI5t26ep68EBgsZlnkf-groo1LQeIwsqFFpzH_s4wbrpW79l0Cj5T3yYhV938-LgIC1dTh7re0qDuNamtslKnRNz6PBW-jIln1kGdc2SGYcqNrnCaQV34-uI_7AzE1_0E5w",
    rating: 4.4,
    reviewsCount: 65,
    inStock: true
  },
  {
    id: "limited-edition-buds",
    name: "Limited Edition Buds",
    price: 299,
    description: "Premium gold-accented bespoke version of our elite buds. Highly curated materials and absolute sound fidelity inside a hand-finished charging capsule.",
    category: "Audio",
    brand: "Bespoke",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLveukNAEEoaiw0J0ZyTdRXCDLDQeVriO8RPSO07VqG6LHuiZKbAt4Dg2sTdEfKEVFdO33e963etV-9ywn6q-U126LftC3Q0kB_aQMU-EKLMckpd2aCFL_Pyyl2-AkanE_okTJuZzBGlzw5tb32ajPvIu5lS3mfVY_RnFsbf6v3XkJV5QJbbqsVdId9xnP2Q0qRYv7txovrj2FlvoymhwrD79wh7gY8qUKTseKN2eKJVclJ_JtsDptLGO2E",
    rating: 4.9,
    reviewsCount: 19,
    inStock: true
  },
  {
    id: "axon-book-16",
    name: "Axon Book 16",
    price: 1499,
    description: "The peak of performance. A majestic 16-inch high-definition screen laptop powered by multi-core processors. Designed to conquer compile tasks, graphic assets, and audio rendering.",
    category: "Laptops",
    brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVr1FxtLe8TbNj6bNHryEEvqN5vuC9zVmvyjSBMCLsrwPo3JdTj4vId_x443V3krw6-5rOnxLZ_2zD3PAeVt2oKGos2hpJiJd6WRfkOyJUXcvUaSX8CKhmP_mFhYGOYmXkV0z9OwijAUuSuSFbRGC11lVDvKUm-M9oecWJYjWa6bUvglSKaH_0dCC5B-_Mk3tSNdIUMpjYg6VSKYpL49Bikl4Fly_bss8eFgZcC35adc7jlPlqYWsRXMeOeaIWzR7ALJ_oZt5teTc",
    colors: ["Silver", "Space Gray"],
    rating: 4.8,
    reviewsCount: 95,
    inStock: true,
    isNew: true
  },
  {
    id: "axon-studio-pro",
    name: "Axon Studio Pro",
    price: 349,
    description: "Elite over-ear headphones featuring bespoke dynamic drivers, adaptive sound matching, and premium hybrid active noise-control materials.",
    category: "Audio",
    brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRvwmNNr252qjRvYpv41anXkgHswtvsh4_oBZIetnYKzgmb8H1iuxt6POQV6hHTL8DIVJ_tQlo9Tn05GU6-Cwqz28ZWhQKTNuI2ODbutDc1ajs-hlXalwSxA8kyTkAYfYsV91t-mXIzVZLGrybfx1_3mUmuuB3UuhPp9W7m741ILGht_3BbzvQ8tgoET9AtRBzRvqvGHgNBKYTdsWfJBjjgvQaW3Ihb4qQ1siyjGUfkIELAIsnSsQFLzBlWPHKEq29bqg_cL8yYzQ",
    colors: ["Teal", "Charcoal"],
    rating: 4.9,
    reviewsCount: 104,
    inStock: true
  },
  {
    id: "power-hub-pro",
    name: "Power Hub Pro",
    price: 79,
    description: "Precision-milled aluminum desktop dock and continuous induction charging hub. Charges computers, tablets, and buds simultaneously with intelligent power allocation.",
    category: "Power",
    brand: "Volt",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAguwcGqjb9LoFvkQuoLm9PyB-YiY9rpSLZGrIQTjKs9iyoPeAp_QJAlMjS9rgLQox3XCd2W5TvnFvjtjK4lao6dD3MoInlv8qzTiLo_BRBQbDDBuHPr7x_vnhcKvxe3yHk_eLN-7fjBpm4TH7snY3pybXL5p7oHbfR9-VWOEW_W3RngotoNwCOIWuVbozQSldd3RKirANbfJX2PnYrq3BEeqZc91-xaeIFKSPF1W_GXKdzPU5sA1AufKx7T9wkjcDBrERR57PXi4I",
    rating: 4.7,
    reviewsCount: 39,
    inStock: true
  },
  {
    id: "axon-click-2",
    name: "Axon Click 2",
    price: 129,
    description: "Low profile, highly mechanical precision keyboard with fully custom tactile response switches. Finished in high-grade aluminum plate.",
    category: "Accessories",
    brand: "Aero",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4iPQ0lE17HRf94txHDCGvmGV2gQGxREcuM873it2hytM15adF2iJYLPOjT2Dc85gi6pmDnL1RqzDfCHE5Y4I9KbKh5TX8nWue3VyClX7zPRnTFLpy3e7KWSTFUvXNU3GLmW2Aj39YRcL3CeBYzKT6BlsKo9ULLrUlbmgZm7xxeFJFLFtBg5KyhboMWIzV8T41ymBIDKt-6bLpAKRDH9SumOIxcon3t9UpYCZLLfBd2-LZtrOV8SdSys42DkWgVQgjJV-V-dmjoNw",
    rating: 4.6,
    reviewsCount: 71,
    inStock: true
  },
  {
    id: "luxe-sleeve",
    name: "Luxe Sleeve",
    price: 59,
    description: "Tailored full-grain custom stitched leather carrying sleeve with magnetic closure clasp and microfiber inner cushioning.",
    category: "Accessories",
    brand: "Luxe",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDe8f49-g5UiKid7QeJqM8N8WSlbPGyfi15yjkWtuq-or0bmHxPIG0axL4TWSpy-AlZeHs3rDh9DZ1wNV_bQlMgW7vMA5peK2BdNPrWdB7gB1c8j12RT8OZ7Ml_RELL-HpwRhOiPhtCl189nxzjsgYzWIUE43Nj4HT5uWs7fWKN3dsCrGeBm3RfgxJbYfkL5L8Tp1Za0L3Fls_L81KTGG7sTSIGMn0hdUev62Ki7bU3r893_qc4EV2itVKTvfaJeblLznj_SlL9BYk",
    rating: 4.8,
    reviewsCount: 48,
    inStock: true
  },
  {
    id: "axon-book-14",
    name: "Axon Book 14",
    price: 1299,
    description: "A compact professional laptop engineered in aerospace grade alloy. Exceptional battery longevity paired with blazing power performance.",
    category: "Laptops",
    brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWWH3i4J3iXG_I4FZHMSvgTxWn9_0eb4hhMuCK2dUH6XqZi7_XgzM8nxFVjvzRFgp33VGU7Ys-zL7k3SmC7pwqCGNYTX9ywr2qNofTHCQMau5baahE4ZL0terIv7iNG4ePsw_9FWKW8G0aCxz82nRZpZT3P7Y1NJPCgbLuTDVxiaI3-kdQV2WbnUAiAHmdFndSkp-c7t7Iif3akwrgt9caStnANWrJunocGZWqgjA_WPoOpdPMX_rJpVkM_nip1JgnVjDBNOAXUSM",
    rating: 4.7,
    reviewsCount: 81,
    inStock: true
  },
  {
    id: "axon-phone-1-pro",
    name: "Axon Phone 1 Pro",
    price: 799,
    description: "State-of-the-art smartphone boasting an Ultra-Retina OLED display, the Axon-M1 neural processor, and a high-fidelity triple camera system with 10x optical zoom.",
    category: "Phones",
    brand: "Axon",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    colors: ["Obsidian", "Pearl", "Emerald"],
    storages: ["128GB", "256GB", "512GB"],
    rating: 4.8,
    reviewsCount: 142,
    inStock: true,
    isNew: true,
    specifications: {
      "Display": "6.7-inch OLED Super Retina, 120Hz refresh rate",
      "Processor": "Axon-M1 Neural Engine with AI co-processing",
      "Camera": "Triple system: 50MP Wide, 48MP Ultra-Wide, 48MP Telephoto",
      "Battery": "Up to 24 hours typical usage",
      "Durability": "IP68 water and dust resistance"
    }
  },
  {
    id: "quantum-phone-flip",
    name: "Quantum Phone Flip",
    price: 999,
    description: "Experience the next leap in portable computing with our fully folding flexible OLED display. Perfect for high-density multi-tasking on a single premium glass canvas.",
    category: "Phones",
    brand: "Quantum",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
    colors: ["Cyber Charcoal", "Prism Gold"],
    storages: ["256GB", "512GB"],
    rating: 4.9,
    reviewsCount: 36,
    inStock: true,
    isNew: true,
    specifications: {
      "Display": "7.6-inch folding Dynamic AMOLED, secondary 6.2-inch outer screen",
      "Processor": "Snapdragon Quantum Edition Core",
      "Camera": "Dual 12MP high-precision cameras",
      "Battery": "4500mAh intelligent dual cell layout"
    }
  },
  {
    id: "nebula-phone-lite",
    name: "Nebula Phone Lite",
    price: 499,
    description: "Sleek, featherweight smartphone focusing on the core essentials. Packed with a high-capacity power cell and brilliant display for daily continuous usage.",
    category: "Phones",
    brand: "Nebula",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    colors: ["Sky Blue", "Dark Space"],
    storages: ["128GB"],
    rating: 4.5,
    reviewsCount: 89,
    inStock: true,
    isBestSeller: true
  },
  {
    id: "apex-phone-1",
    name: "Apex Phone 1",
    price: 699,
    description: "Uncompromised build quality housed in a machined aerospace grade titanium outer casing. Perfect balanced companion for the rugged multi-device network.",
    category: "Phones",
    brand: "Apex",
    image: "https://images.unsplash.com/photo-1565849615011-0618dd70a1a0?auto=format&fit=crop&w=600&q=80",
    colors: ["Titanium Gray", "Crimson Metal"],
    storages: ["128GB", "256GB"],
    rating: 4.6,
    reviewsCount: 57,
    inStock: true
  }
];
