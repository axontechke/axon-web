export interface Env {
  DB: D1Database;
  GEMINI_API_KEY?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
}

// ─── AUTH UTILITIES ──────────────────────────────────────────
function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed === hash;
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// ─── CORS ────────────────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function corsResponse(body?: any, status = 200): Response {
  if (body === undefined) return new Response(null, { status, headers: CORS_HEADERS });
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function jsonError(message: string, status = 400): Response {
  return corsResponse({ error: message }, status);
}

// ─── ROUTER ──────────────────────────────────────────────────
type Handler = (req: Request, env: Env, ctx: ExecutionContext, params: Record<string, string>) => Promise<Response>;

interface Route {
  method: string;
  pattern: URLPattern;
  handler: Handler;
}

function route(method: string, path: string, handler: Handler): Route {
  return { method, pattern: new URLPattern({ pathname: path }), handler };
}

function matchRoute(routes: Route[], req: Request): { handler: Handler; params: Record<string, string> } | null {
  for (const r of routes) {
    if (req.method !== r.method) continue;
    const m = r.pattern.exec(req.url);
    if (m) {
      const params: Record<string, string> = {};
      for (const [key, value] of Object.entries(m.pathname.groups)) {
        if (key && value) params[key] = decodeURIComponent(value);
      }
      return { handler: r.handler, params };
    }
  }
  return null;
}

// ─── HELPERS ─────────────────────────────────────────────────
function now(): string {
  return new Date().toISOString();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function generateTrackingNumber(): string {
  return `AXN-${Math.floor(100000 + Math.random() * 900000)}`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// ─── INITIAL DATA (for seeding) ─────────────────────────────
const INITIAL_PRODUCTS = [
  {
    id: "axon-slate-pro", name: "Axon Slate Pro", price: 899,
    description: "The ultimate canvas for your creativity. Engineered with the new Axon-X1 chip, a stunning Liquid Infinity Display, and all-day battery life to power your most demanding professional workflows.",
    category: "Tablets", brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsEaA-6jW08RfQxSwo9FHWNJjhM-Suo4qO0q0TAZHUyl0fTawdKbiNaKINqnvUByZVhMmJ5f5tFNwwKpmZf-SWBa3G92PMNYFrErwe-94XGSCE7KEedOSkYQ6-eT-o7WIQhURb_7afTAT-7pCwcd1SFHZnc0fvSdUR8J02RUertATSpdkffarq5qs40j8MjaOLFr_4DKuAA3u6Wg5xwWeIzSnBrCGN2RezoiK2HYiauNE90S3qIbZM48e4",
    colors: ["Silver", "Slate", "Teal"], storages: ["128GB", "256GB"],
    rating: 4.8, reviewsCount: 124, inStock: true, isNew: true,
    specifications: { "Display": "12.9-inch Liquid Infinity Retina, 120Hz ProMotion technology", "Processor": "Axon-X1 Chip with 12-core CPU and 16-core GPU", "Camera": "12MP Ultra Wide Front Camera with Center Focus", "Battery": "Up to 12 hours of surf time on Wi-Fi", "Connectivity": "Wi-Fi 6E, Bluetooth 5.3, USB-C (Thunderbolt 4)" },
    reviews: [
      { id: "r1", rating: 5, date: "2 days ago", title: "Perfect for Illustrators", content: "The display quality is unmatched. I've used every major tablet on the market, but the Axon Slate Pro's color accuracy is a game changer.", author: "Julian D.", verified: true },
      { id: "r2", rating: 5, date: "1 week ago", title: "Blazing Fast", content: "Video editing on the go has never been easier. The X1 chip handles 4K footage without breaking a sweat.", author: "Sarah M.", verified: true }
    ]
  },
  {
    id: "axon-buds-pro", name: "Axon Buds Pro", price: 249,
    description: "Immersive spatial audio with clinical-grade noise cancellation. Experience crystal clear sound signature with deep resonant bass.",
    category: "Audio", brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLveukNAEEoaiw0J0ZyTdRXCDLDQeVriO8RPSO07VqG6LHuiZKbAt4Dg2sTdEfKEVFdO33e963etV-9ywn6q-U126LftC3Q0kB_aQMU-EKLMckpd2aCFL_Pyyl2-AkanE_okTJuZzBGlzw5tb32ajPvIu5lS3mfVY_RnFsbf6v3XkJV5QJbbqsVdId9xnP2Q0qRYv7txovrj2FlvoymhwrD79wh7gY8qUKTseKN2eKJVclJ_JtsDptLGO2E",
    colors: ["Teal", "White", "Copper"], storages: [],
    rating: 4.7, reviewsCount: 88, inStock: true, isBestSeller: true,
    specifications: {}, reviews: []
  },
  {
    id: "axon-audio-engine", name: "Axon Audio Engine", price: 1299,
    description: "High-fidelity professional sound processor and amplification stage. Built-in digital audio converters deliver impeccable studio-grade clarity.",
    category: "Audio", brand: "Quantum",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLtF6fRV5vlFFWB1ECsMepx4t792VSBdFhAKnum1o61Q3YXOWx6HH_gwHIEmYE_QuN36V6foHZGml2yWCGcw7j-AvkYhXTuf7KX8VJUdhFxLdvakWUedjkYmI5t26ep68EBgsZlnkf-groo1LQeIwsqFFpzH_s4wbrpW79l0Cj5T3yYhV938-LgIC1dTh7re0qDuNamtslKnRNz6PBW-jIln1kGdc2SGYcqNrnCaQV34-uI_7AzE1_0E5w",
    colors: [], storages: [], rating: 4.9, reviewsCount: 42, inStock: true,
    specifications: {}, reviews: []
  },
  {
    id: "power-capsule-v2", name: "Power Capsule V2", price: 79,
    description: "Modern modular power bank and high-speed multi-charging capsule. Perfect for maintaining all your portable gear powered on the move.",
    category: "Power", brand: "Volt",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLveukNAEEoaiw0J0ZyTdRXCDLDQeVriO8RPSO07VqG6LHuiZKbAt4Dg2sTdEfKEVFdO33e963etV-9ywn6q-U126LftC3Q0kB_aQMU-EKLMckpd2aCFL_Pyyl2-AkanE_okTJuZzBGlzw5tb32ajPvIu5lS3mfVY_RnFsbf6v3XkJV5QJbbqsVdId9xnP2Q0qRYv7txovrj2FlvoymhwrD79wh7gY8qUKTseKN2eKJVclJ_JtsDptLGO2E",
    colors: [], storages: [], rating: 4.5, reviewsCount: 56, inStock: true,
    specifications: {}, reviews: []
  },
  {
    id: "axon-buds-light", name: "Axon Buds Light", price: 129,
    description: "Lightweight true wireless earphones. Balanced sound delivery, rapid charge, and comfort-focused ergonomics for extended daily wear.",
    category: "Audio", brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLveukNAEEoaiw0J0ZyTdRXCDLDQeVriO8RPSO07VqG6LHuiZKbAt4Dg2sTdEfKEVFdO33e963etV-9ywn6q-U126LftC3Q0kB_aQMU-EKLMckpd2aCFL_Pyyl2-AkanE_okTJuZzBGlzw5tb32ajPvIu5lS3mfVY_RnFsbf6v3XkJV5QJbbqsVdId9xnP2Q0qRYv7txovrj2FlvoymhwrD79wh7gY8qUKTseKN2eKJVclJ_JtsDptLGO2E",
    colors: ["Charcoal", "White", "Coral"], storages: [],
    rating: 4.3, reviewsCount: 212, inStock: true,
    specifications: {}, reviews: []
  },
  {
    id: "axon-slate-air", name: "Axon Slate Air", price: 899,
    description: "Ultra-thin, featherweight tablet for pure mobility. Immersive liquid Retina display combined with highly efficient Axon power-saving architectures.",
    category: "Tablets", brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsEaA-6jW08RfQxSwo9FHWNJjhM-Suo4qO0q0TAZHUyl0fTawdKbiNaKINqnvUByZVhMmJ5f5tFNwwKpmZf-SWBa3G92PMNYFrErwe-94XGSCE7KEedOSkYQ6-eT-o7WIQhURb_7afTAT-7pCwcd1SFHZnc0fvSdUR8J02RUertATSpdkffarq5qs40j8MjaOLFr_4DKuAA3u6Wg5xwWeIzSnBrCGN2RezoiK2HYiauNE90S3qIbZM48e4",
    colors: [], storages: [], rating: 4.6, reviewsCount: 37, inStock: true, isNew: true,
    specifications: {}, reviews: []
  },
  {
    id: "axon-book-16", name: "Axon Book 16", price: 1499,
    description: "The peak of performance. A majestic 16-inch high-definition screen laptop powered by multi-core processors. Designed to conquer compile tasks, graphic assets, and audio rendering.",
    category: "Laptops", brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVr1FxtLe8TbNj6bNHryEEvqN5vuC9zVmvyjSBMCLsrwPo3JdTj4vId_x443V3krw6-5rOnxLZ_2zD3PAeVt2oKGos2hpJiJd6WRfkOyJUXcvUaSX8CKhmP_mFhYGOYmXkV0z9OwijAUuSuSFbRGC11lVDvKUm-M9oecWJYjWa6bUvglSKaH_0dCC5B-_Mk3tSNdIUMpjYg6VSKYpL49Bikl4Fly_bss8eFgZcC35adc7jlPlqYWsRXMeOeaIWzR7ALJ_oZt5teTc",
    colors: ["Silver", "Space Gray"], storages: [],
    rating: 4.8, reviewsCount: 95, inStock: true, isNew: true,
    specifications: {}, reviews: []
  },
  {
    id: "axon-studio-pro", name: "Axon Studio Pro", price: 349,
    description: "Elite over-ear headphones featuring bespoke dynamic drivers, adaptive sound matching, and premium hybrid active noise-control materials.",
    category: "Audio", brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRvwmNNr252qjRvYpv41anXkgHswtvsh4_oBZIetnYKzgmb8H1iuxt6POQV6hHTL8DIVJ_tQlo9Tn05GU6-Cwqz28ZWhQKTNuI2ODbutDc1ajs-hlXalwSxA8kyTkAYfYsV91t-mXIzVZLGrybfx1_3mUmuuB3UuhPp9W7m741ILGht_3BbzvQ8tgoET9AtRBzRvqvGHgNBKYTdsWfJBjjgvQaW3Ihb4qQ1siyjGUfkIELAIsnSsQFLzBlWPHKEq29bqg_cL8yYzQ",
    colors: ["Teal", "Charcoal"], storages: [],
    rating: 4.9, reviewsCount: 104, inStock: true,
    specifications: {}, reviews: []
  },
  {
    id: "power-hub-pro", name: "Power Hub Pro", price: 79,
    description: "Precision-milled aluminum desktop dock and continuous induction charging hub. Charges computers, tablets, and buds simultaneously with intelligent power allocation.",
    category: "Power", brand: "Volt",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAguwcGqjb9LoFvkQuoLm9PyB-YiY9rpSLZGrIQTjKs9iyoPeAp_QJAlMjS9rgLQox3XCd2W5TvnFvjtjK4lao6dD3MoInlv8qzTiLo_BRBQbDDBuHPr7x_vnhcKvxe3yHk_eLN-7fjBpm4TH7snY3pybXL5p7oHbfR9-VWOEW_W3RngotoNwCOIWuVbozQSldd3RKirANbfJX2PnYrq3BEeqZc91-xaeIFKSPF1W_GXKdzPU5sA1AufKx7T9wkjcDBrERR57PXi4I",
    colors: [], storages: [], rating: 4.7, reviewsCount: 39, inStock: true,
    specifications: {}, reviews: []
  },
  {
    id: "axon-click-2", name: "Axon Click 2", price: 129,
    description: "Low profile, highly mechanical precision keyboard with fully custom tactile response switches. Finished in high-grade aluminum plate.",
    category: "Accessories", brand: "Aero",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4iPQ0lE17HRf94txHDCGvmGV2gQGxREcuM873it2hytM15adF2iJYLPOjT2Dc85gi6pmDnL1RqzDfCHE5Y4I9KbKh5TX8nWue3VyClX7zPRnTFLpy3e7KWSTFUvXNU3GLmW2Aj39YRcL3CeBYzKT6BlsKo9ULLrUlbmgZm7xxeFJFLFtBg5KyhboMWIzV8T41ymBIDKt-6bLpAKRDH9SumOIxcon3t9UpYCZLLfBd2-LZtrOV8SdSys42DkWgVQgjJV-V-dmjoNw",
    colors: [], storages: [], rating: 4.6, reviewsCount: 71, inStock: true,
    specifications: {}, reviews: []
  },
  {
    id: "axon-book-14", name: "Axon Book 14", price: 1299,
    description: "A compact professional laptop engineered in aerospace grade alloy. Exceptional battery longevity paired with blazing power performance.",
    category: "Laptops", brand: "Axon",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWWH3i4J3iXG_I4FZHMSvgTxWn9_0eb4hhMuCK2dUH6XqZi7_XgzM8nxFVjvzRFgp33VGU7Ys-zL7k3SmC7pwqCGNYTX9ywr2qNofTHCQMau5baahE4ZL0terIv7iNG4ePsw_9FWKW8G0aCxz82nRZpZT3P7Y1NJPCgbLuTDVxiaI3-kdQV2WbnUAiAHmdFndSkp-c7t7Iif3akwrgt9caStnANWrJunocGZWqgjA_WPoOpdPMX_rJpVkM_nip1JgnVjDBNOAXUSM",
    colors: [], storages: [], rating: 4.7, reviewsCount: 81, inStock: true,
    specifications: {}, reviews: []
  },
  {
    id: "axon-phone-1-pro", name: "Axon Phone 1 Pro", price: 799,
    description: "State-of-the-art smartphone boasting an Ultra-Retina OLED display, the Axon-M1 neural processor, and a high-fidelity triple camera system with 10x optical zoom.",
    category: "Phones", brand: "Axon",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    colors: ["Obsidian", "Pearl", "Emerald"], storages: ["128GB", "256GB", "512GB"],
    rating: 4.8, reviewsCount: 142, inStock: true, isNew: true,
    specifications: { "Display": "6.7-inch OLED Super Retina, 120Hz refresh rate", "Processor": "Axon-M1 Neural Engine with AI co-processing", "Camera": "Triple system: 50MP Wide, 48MP Ultra-Wide, 48MP Telephoto", "Battery": "Up to 24 hours typical usage", "Durability": "IP68 water and dust resistance" },
    reviews: []
  }
];


const INITIAL_CONFIG: Record<string, any> = {
  announcement: "AXON INTEGRATION PROTOCOL ACTIVE | GET COMPLEMENTARY LUXE CARRY SLEEVE WITH ALL CORE LAPTOPS",
  showAnnouncement: true,
  heroTitle: "Integrated Form & Function.",
  heroDescription: "Meet the Axon Slate Pro. Engineered with the breakthrough Axon-X1 silicon chip, a liquid Infinity Display, and multi-device cross-talk. Powering your ultimate creative studio anywhere.",
  heroSlides: [
    { id: "ecosystem", tag: "NEW ARRIVALS", tagIcon: "Cpu", title: "Integrated Form & Function.", description: "Meet the Axon Slate Pro. Engineered with the breakthrough Axon-X1 chip, a stunning Liquid Infinity Display, and all-day battery life. Your ultimate creative studio, anywhere.", primaryBtnText: "Shop Now", primaryActionTarget: "product", primaryActionValue: "axon-slate-pro", secondaryBtnText: "Shop all products", secondaryActionTarget: "category", secondaryActionValue: "All", mediaType: "image", mediaUrl: "https://res.cloudinary.com/dwwvh34yi/image/upload/v1783718244/axon_tech_hero_pvcg7b.png", mobileMediaUrl: "", mediaEmbed: "", mobileMediaEmbed: "", overlayTitle: "Infinity Screen", overlayDesc: "12.9\" ProMotion Touchscreen", targetProductId: "axon-slate-pro" },
    { id: "phone-video", tag: "MOBILE LAUNCH", tagIcon: "Zap", title: "Axon Phone 1 Pro", description: "The ultimate titanium-clad mobile experience with the powerful Axon-M1 processor, customizable Action controls, and ultra-high dynamic triple lenses.", primaryBtnText: "Shop Now", primaryActionTarget: "product", primaryActionValue: "axon-phone-1-pro", secondaryBtnText: "View Phones", secondaryActionTarget: "category", secondaryActionValue: "Phones", mediaType: "video", mediaUrl: "https://www.apple.com/105/media/us/iphone-17/2025/b2c72de3-1cbc-4e24-b4d3-23c7abcec4ec/anim/hero/xlarge.mp4", mobileMediaUrl: "https://www.apple.com/105/media/us/iphone-17/2025/b2c72de3-1cbc-4e24-b4d3-23c7abcec4ec/anim/hero/large.mp4", mediaEmbed: "", mobileMediaEmbed: "", overlayTitle: "M1 Neural", overlayDesc: "Titanium Chassis", targetProductId: "axon-phone-1-pro" },
    { id: "book-laptop", tag: "LAPTOP LAUNCH", tagIcon: "Laptop", title: "Axon Book 16 Ultra.", description: "Uncompromised performance. With high-speed processing, stunning display, and all-day battery life.", primaryBtnText: "Shop Now", primaryActionTarget: "product", primaryActionValue: "axon-book-16", secondaryBtnText: "Shop Laptops", secondaryActionTarget: "category", secondaryActionValue: "Laptops", mediaType: "video", mediaUrl: "https://player.vimeo.com/external/435674703.sd.mp4?s=7fdf18621350a413d3e2751d722b07e92397e5ad&profile_id=139&oauth2_token_id=57447761", mobileMediaUrl: "https://player.vimeo.com/external/435674703.sd.mp4?s=7fdf18621350a413d3e2751d722b07e92397e5ad&profile_id=139&oauth2_token_id=57447761", mediaEmbed: "", mobileMediaEmbed: "", overlayTitle: "Silicon Core", overlayDesc: "Unified Memory Capable", targetProductId: "axon-book-16" }
  ],
  activePromos: [
    { code: "AXON15", discount: 15, description: "15% discount on products" },
    { code: "SAVE20", discount: 20, description: "20% off all accessories" }
  ],
  socialTwitter: "https://twitter.com/axontech",
  socialGithub: "https://github.com/axontech",
  socialLinkedIn: "https://linkedin.com/company/axontech",
  contactEmail: "synergy@axon.net",
  supportEmail: "support@axon.net",
  privacyPolicy: "AXON TECH collects information directly relevant to fulfilling your physical hardware logistics and ensuring high-fidelity system diagnostics.",
  termsOfUse: "These Terms of Service govern all purchases and use of the AXON TECH online store.",
  cookiePolicy: "AXON TECH uses cookies and persistent browser key-value sets (localStorage) strictly to provide core e-commerce capabilities.",
  refundPolicy: "We offer a complete 30-day, risk-free guarantee.",
  deliveryPolicy: "AXON TECH ships all premium hardware in dual-box structural armors.",
  aiCreditsLimit: 30,
  aiCreditsUsed: 0,
  footerBrandName: "AXON",
  footerBrandSuffix: "TECH",
  footerBrandLogoUrl: "https://res.cloudinary.com/dwwvh34yi/image/upload/v1783980758/Axon_2_ao8wqm.png",
  footerDescription: "Your trusted online store for premium tech and accessories across Kenya.",
  footerWarrantyText: "Authorized Retailer warranty included",
  footerCol1Title: "Shop",
  footerCol1Links: [
    { text: "Axon Slate Series", target: "terms" },
    { text: "Axon Books (Laptops)", target: "terms" },
    { text: "Axon Studio Audio", target: "terms" },
    { text: "Continuous Power Banks", target: "terms" },
    { text: "Click Keyboards & Gear", target: "terms" }
  ],
  footerCol2Title: "Support & Care",
  footerCol2Links: [
    { text: "Warranty Registry", target: "terms" },
    { text: "Delivery & Shipping", target: "delivery" },
    { text: "Refund & Return Policy", target: "refund" },
    { text: "Cookie Settings", target: "cookies" },
    { text: "Privacy & Security", target: "privacy" }
  ],
  footerCopyrightText: "",
  footerNewsletterTitle: "Stay Updated",
  footerNewsletterDescription: "Subscribe to receive notifications on new arrivals, deals, and exclusive bundles.",
  footerBottomLinks: [
    { text: "Privacy Policy", target: "privacy" },
    { text: "Cookie Policy", target: "cookies" },
    { text: "Terms of Service", target: "terms" },
    { text: "Refund Policy", target: "refund" },
    { text: "Delivery Logistics", target: "delivery" },
    { text: "Do Not Sell My Info", target: "dns" }
  ],
  paymentMpesa: { till: "123456", name: "AXON TECHNOLOGIES KE", phone: "+254 745 017979" },
  paymentBank: { name: "KCB Bank", accountName: "Axon Technologies Kenya Limited", accountNumber: "1234567890", branch: "Kencom Branch", swiftCode: "KCBLKENA" },
  contactPhone: "+254 745 017979"
};

const INITIAL_CONTACT: Record<string, any> = {
  businessName: "Axon Technologies Kenya",
  tagline: "Your Trusted Technology Partner in Kenya",
  emails: { sales: "sales@axontechke.com", info: "info@axontechke.com", general: "axontechkenya@gmail.com" },
  phones: { primary: "+254745017979", formattedPrimary: "+254 745 017979", whatsapp: "https://wa.me/254745017979" },
  location: { city: "Nairobi", country: "Kenya", addressString: "Simara Mall, Ground Floor, Shop G50, Nairobi, Kenya", icon: "https://img.icons8.com/color/48/marker.png", embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.22384758913!2d36.815349!3d-1.286389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d3e527d73d%3A0xc6cb1c7df44a9!2sSimara%20Mall!5e0!3m2!1sen!2ske!4v1721012345678!5m2!1sen!2ske", externalUrl: "https://maps.google.com/?q=Simara+Mall+Ground+Floor+Shop+G50+Nairobi" },
  businessHours: { weekdays: "Monday - Saturday: 8:00 AM - 6:00 PM EAT", supportCall: "8:00 AM - 8:00 PM EAT" },
  socials: [
    { name: "WhatsApp", url: "https://wa.me/254745017979", icon: "https://img.icons8.com/color/48/whatsapp.png" },
    { name: "Instagram", url: "https://instagram.com/axontechke", icon: "https://img.icons8.com/color/48/instagram-new--v1.png" },
    { name: "Facebook", url: "https://facebook.com/axontechke", icon: "https://img.icons8.com/color/48/facebook-new.png" },
    { name: "TikTok", url: "https://tiktok.com/@axontechke", icon: "https://img.icons8.com/color/48/tiktok.png" }
  ]
};

const INITIAL_ORDERS = [
  {
    id: "AXN-827103",
    status: "delivered",
    customer: JSON.stringify({ fullName: "Stephen Paul Kamau", email: "stephen@example.com", address: "Kenyatta Avenue", city: "Nairobi", state: "Nairobi", zipCode: "00100", phone: "254745017979" }),
    shippingMethod: "Express Air",
    shippingCost: 0,
    subtotal: 899,
    discountAmount: 0,
    discountPercentage: 0,
    taxes: 89.9,
    total: 988.9,
    totalKsh: 129050,
    totalUsd: 988.9,
    hasKsh: 1,
    payment: JSON.stringify({ lastFour: "4242" }),
    items: JSON.stringify([{ id: "axon-slate-pro", name: "Axon Slate Pro", price: 899, quantity: 1, color: "Space Gray", storage: "256GB", image: "https://lh3.googleusercontent.com/aida/AP1WRLsEaA-6jW08RfQxSwo9FHWNJjhM-Suo4qO0q0TAZHUyl0fTawdKbiNaKINqnvUByZVhMmJ5f5tFNwwKpmZf-SWBa3G92PMNYFrErwe-94XGSCE7KEedOSkYQ6-eT-o7WIQhURb_7afTAT-7pCwcd1SFHZnc0fvSdUR8J02RUertATSpdkffarq5qs40j8MjaOLFr_4DKuAA3u6Wg5xwWeIzSnBrCGN2RezoiK2HYiauNE90S3qIbZM48e4" }]),
    history: JSON.stringify([
      { status: "pending", time: "2024-01-15T10:30:00Z", notes: "Order placed. Awaiting payment confirmation." },
      { status: "packaged", time: "2024-01-15T14:00:00Z", notes: "Order sealed and quality checked." },
      { status: "shipped", time: "2024-01-16T08:00:00Z", notes: "Dispatched via Air Cargo. In transit." },
      { status: "delivered", time: "2024-01-17T11:00:00Z", notes: "Package delivered and signed for." }
    ])
  },
  {
    id: "AXN-982714",
    status: "shipped",
    customer: JSON.stringify({ fullName: "Clarissa Mitchell", email: "clarissa@example.com", address: "Mombasa Road", city: "Mombasa", state: "Mombasa", zipCode: "80100", phone: "254712345678" }),
    shippingMethod: "Standard Air",
    shippingCost: 15,
    subtotal: 1798,
    discountAmount: 179.8,
    discountPercentage: 10,
    taxes: 161.82,
    total: 1795.02,
    totalKsh: 233365,
    totalUsd: 1795.02,
    hasKsh: 1,
    payment: JSON.stringify({ lastFour: "1234" }),
    items: JSON.stringify([
      { id: "axon-slate-pro", name: "Axon Slate Pro", price: 899, quantity: 1, color: "Space Gray", storage: "256GB", image: "https://lh3.googleusercontent.com/aida/AP1WRLsEaA-6jW08RfQxSwo9FHWNJjhM-Suo4qO0q0TAZHUyl0fTawdKbiNaKINqnvUByZVhMmJ5f5tFNwwKpmZf-SWBa3G92PMNYFrErwe-94XGSCE7KEedOSkYQ6-eT-o7WIQhURb_7afTAT-7pCwcd1SFHZnc0fvSdUR8J02RUertATSpdkffarq5qs40j8MjaOLFr_4DKuAA3u6Wg5xwWeIzSnBrCGN2RezoiK2HYiauNE90S3qIbZM48e4" },
      { id: "axon-pen-pro", name: "Axon Pen Pro", price: 899, quantity: 1, color: "White", storage: "128GB", image: "" }
    ]),
    history: JSON.stringify([
      { status: "pending", time: "2024-02-01T09:00:00Z", notes: "Order placed. Awaiting payment confirmation." },
      { status: "packaged", time: "2024-02-01T13:00:00Z", notes: "Order sealed and quality checked." },
      { status: "shipped", time: "2024-02-02T07:30:00Z", notes: "Dispatched via Air Cargo. Tracking: AXN-TRK-982714." }
    ])
  }
];


// ─── SEED DATABASE ───────────────────────────────────────────
async function seedDatabase(db: D1Database): Promise<void> {
  const batch: D1Exec[] = [];

  // Check and seed products
  const prodCount = await db.prepare("SELECT COUNT(*) as count FROM products").first<{ count: number }>();
  if (!prodCount || prodCount.count === 0) {
    for (const p of INITIAL_PRODUCTS) {
      batch.push(db.prepare(
        `INSERT OR IGNORE INTO products (id, name, price, priceKsh, description, category, brand, image, colors, storages, rating, reviewsCount, inStock, isNew, isBestSeller, specifications)
         VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(p.id, p.name, p.price, p.description, p.category, p.brand, p.image,
        JSON.stringify(p.colors || []), JSON.stringify(p.storages || []),
        p.rating, p.reviewsCount, p.inStock ? 1 : 0, (p as any).isNew ? 1 : 0, (p as any).isBestSeller ? 1 : 0,
        JSON.stringify(p.specifications || {})));

      for (const r of (p.reviews || [])) {
        batch.push(db.prepare(
          `INSERT OR IGNORE INTO product_reviews (id, productId, rating, date, title, content, author, verified)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(r.id, p.id, r.rating, r.date, r.title, r.content, r.author, r.verified ? 1 : 0));
      }
    }
  }

  // Check and seed config
  const configCount = await db.prepare("SELECT COUNT(*) as count FROM config WHERE key NOT LIKE 'session:%'").first<{ count: number }>();
  if (!configCount || configCount.count === 0) {
    for (const [key, value] of Object.entries(INITIAL_CONFIG)) {
      batch.push(db.prepare(`INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`).bind(key, JSON.stringify(value)));
    }
  }

  // Check and seed contact
  const contactCount = await db.prepare("SELECT COUNT(*) as count FROM contact").first<{ count: number }>();
  if (!contactCount || contactCount.count === 0) {
    for (const [key, value] of Object.entries(INITIAL_CONTACT)) {
      batch.push(db.prepare(`INSERT OR IGNORE INTO contact (key, value) VALUES (?, ?)`).bind(key, JSON.stringify(value)));
    }
  }

  // Check and seed sample orders
  const orderCount = await db.prepare("SELECT COUNT(*) as count FROM orders").first<{ count: number }>();
  if (!orderCount || orderCount.count === 0) {
    for (const o of INITIAL_ORDERS) {
      batch.push(db.prepare(
        `INSERT OR IGNORE INTO orders (id, date, status, customer, shippingMethod, shippingCost, subtotal, discountAmount, discountPercentage, taxes, total, totalKsh, totalUsd, hasKsh, payment, items, history)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(o.id, new Date().toISOString(), o.status, o.customer, o.shippingMethod, o.shippingCost,
        o.subtotal, o.discountAmount, o.discountPercentage, o.taxes, o.total, o.totalKsh, o.totalUsd,
        o.hasKsh, o.payment, o.items, o.history));
    }
  }

  if (batch.length > 0) await db.batch(batch);
}

// ─── SEED SUPER ADMIN ────────────────────────────────────────
async function seedSuperAdmin(db: D1Database, email: string, password: string): Promise<void> {
  const existing = await db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").bind(email).first<{ id: string }>();
  if (existing) return;

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const id = crypto.randomUUID();

  await db.prepare(
    "INSERT INTO users (id, email, passwordHash, salt, role) VALUES (?, ?, ?, ?, 'super-admin')"
  ).bind(id, email, passwordHash, salt).run();
}

// ─── AUTH HANDLER ─────────────────────────────────────────────
async function login(req: Request, env: Env): Promise<Response> {
  const { email, password } = await req.json();
  if (!email || !password) return jsonError("Email and password required.");

  const user = await env.DB.prepare(
    "SELECT id, email, passwordHash, salt, role FROM users WHERE LOWER(email) = LOWER(?)"
  ).bind(email).first<{ id: string; email: string; passwordHash: string; salt: string; role: string }>();

  if (!user) return jsonError("Invalid credentials.", 401);

  const valid = await verifyPassword(password, user.salt, user.passwordHash);
  if (!valid) return jsonError("Invalid credentials.", 401);

  const token = generateToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  // Store session token
  await env.DB.prepare(
    "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)"
  ).bind(`session:${token}`, JSON.stringify({ userId: user.id, email: user.email, role: user.role, expiresAt })).run();

  return corsResponse({ token, user: { id: user.id, email: user.email, role: user.role } });
}

async function verifyAuth(req: Request, env: Env): Promise<{ userId: string; email: string; role: string } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const session = await env.DB.prepare(
    "SELECT value FROM config WHERE key = ?"
  ).bind(`session:${token}`).first<{ value: string }>();

  if (!session) return null;

  const data = JSON.parse(session.value);
  if (data.expiresAt < Date.now()) {
    await env.DB.prepare("DELETE FROM config WHERE key = ?").bind(`session:${token}`).run();
    return null;
  }

  return { userId: data.userId, email: data.email, role: data.role };
}

// ─── ROUTE HANDLERS ──────────────────────────────────────────

// GET /api/products
async function getProducts(_req: Request, env: Env): Promise<Response> {
  await seedDatabase(env.DB);
  const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY createdAt DESC").all();
  const products = results.map((p: any) => ({
    ...p,
    inStock: !!p.inStock,
    isNew: !!p.isNew,
    isBestSeller: !!p.isBestSeller,
    colors: JSON.parse(p.colors || "[]"),
    storages: JSON.parse(p.storages || "[]"),
    colorImages: JSON.parse(p.colorImages || "{}"),
    specifications: JSON.parse(p.specifications || "{}"),
    variants: JSON.parse(p.variants || "{}"),
  }));
  return corsResponse(products);
}

// GET /api/orders
async function getOrders(_req: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY date DESC").all();
  const orders = results.map((o: any) => ({
    ...o,
    customer: JSON.parse(o.customer || "{}"),
    payment: JSON.parse(o.payment || "{}"),
    items: JSON.parse(o.items || "[]"),
    history: JSON.parse(o.history || "[]"),
  }));
  return corsResponse(orders);
}

// POST /api/orders
async function createOrder(req: Request, env: Env): Promise<Response> {
  const data = await req.json();
  const id = generateTrackingNumber();
  const orderData = {
    id, date: now(), status: "pending",
    customer: JSON.stringify(data.customer || {}),
    shippingMethod: data.shippingMethod || "",
    shippingCost: data.shippingCost || data.shippingCostUsd || 0,
    subtotal: data.subtotal || 0,
    discountAmount: data.discountAmount || 0,
    discountPercentage: data.discountPercentage || 0,
    taxes: data.taxes || 0,
    total: data.total || data.totalUsd || 0,
    totalKsh: data.totalKsh || 0,
    totalUsd: data.totalUsd || data.total || 0,
    hasKsh: data.hasKsh ? 1 : 0,
    payment: JSON.stringify(data.payment || {}),
    items: JSON.stringify(data.items || []),
    history: JSON.stringify([{ status: "pending", time: now(), notes: "Order placed. Awaiting payment confirmation." }]),
  };

  await env.DB.prepare(
    `INSERT INTO orders (id, date, status, customer, shippingMethod, shippingCost, subtotal, discountAmount, discountPercentage, taxes, total, totalKsh, totalUsd, hasKsh, payment, items, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, orderData.date, orderData.status, orderData.customer, orderData.shippingMethod,
    orderData.shippingCost, orderData.subtotal, orderData.discountAmount, orderData.discountPercentage,
    orderData.taxes, orderData.total, orderData.totalKsh, orderData.totalUsd, orderData.hasKsh,
    orderData.payment, orderData.items, orderData.history).run();

  const customer = data.customer || {};
  const itemsList = (data.items || []).map((item: any) => `  - ${item.name} (x${item.quantity})${item.color ? ` [${item.color}]` : ""}`).join("\n");
  const whatsappMessage = `NEW ORDER RECEIVED\n\nOrder ID: ${id}\nDate: ${new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}\n\nCustomer: ${customer.fullName || "Customer"}\nEmail: ${customer.email || "N/A"}\nPhone: ${customer.phone || "N/A"}\nAddress: ${customer.address || ""}, ${customer.city || ""}, ${customer.state || ""} ${customer.zipCode || ""}\n\nItems:\n${itemsList}\n\nShipping: ${data.shippingMethod || "Standard"}\nTotal: $${(data.total || 0).toFixed(2)} USD\n\nStatus: Awaiting Payment Confirmation`;

  await env.DB.prepare(
    `INSERT INTO whatsapp_notifications (id, orderId, customerName, customerPhone, message, status, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(generateId("WA"), id, customer.fullName || "Customer", customer.phone || "", whatsappMessage, "sent", now()).run();

  return corsResponse({ id, date: orderData.date, status: "pending", ...data }, 201);
}

// GET /api/orders/:trackingId
async function getOrder(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(params.trackingId.toUpperCase()).first();
  if (!order) return jsonError("Order not found", 404);
  return corsResponse({
    ...order,
    customer: JSON.parse((order as any).customer || "{}"),
    payment: JSON.parse((order as any).payment || "{}"),
    items: JSON.parse((order as any).items || "[]"),
    history: JSON.parse((order as any).history || "[]"),
  });
}

// GET /api/config
async function getConfig(_req: Request, env: Env): Promise<Response> {
  await seedDatabase(env.DB);
  const { results } = await env.DB.prepare("SELECT key, value FROM config WHERE key NOT LIKE 'session:%'").all();
  const config: Record<string, any> = {};
  for (const row of results) {
    try {
      config[(row as any).key] = JSON.parse((row as any).value);
    } catch {
      config[(row as any).key] = (row as any).value;
    }
  }
  return corsResponse(config);
}

// PUT /api/admin/config
async function updateConfig(req: Request, env: Env): Promise<Response> {
  const data = await req.json();
  const batch: D1Exec[] = [];
  for (const [key, value] of Object.entries(data)) {
    batch.push(env.DB.prepare(`INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`).bind(key, JSON.stringify(value)));
  }
  await env.DB.batch(batch);
  return corsResponse(data);
}

// GET /api/contact
async function getContact(_req: Request, env: Env): Promise<Response> {
  await seedDatabase(env.DB);
  const { results } = await env.DB.prepare("SELECT key, value FROM contact").all();
  const contact: Record<string, any> = {};
  for (const row of results) {
    contact[(row as any).key] = JSON.parse((row as any).value);
  }
  return corsResponse(Object.keys(contact).length > 0 ? contact : INITIAL_CONTACT);
}

// PUT /api/admin/contact
async function updateContact(req: Request, env: Env): Promise<Response> {
  const data = await req.json();
  const batch: D1Exec[] = [];
  for (const [key, value] of Object.entries(data)) {
    batch.push(env.DB.prepare(`INSERT OR REPLACE INTO contact (key, value) VALUES (?, ?)`).bind(key, JSON.stringify(value)));
  }
  await env.DB.batch(batch);
  return corsResponse(data);
}

// GET /api/delivery-methods
async function getDeliveryMethods(_req: Request, env: Env): Promise<Response> {
  await seedDatabase(env.DB);
  const { results } = await env.DB.prepare("SELECT * FROM delivery_methods ORDER BY price ASC").all();
  return corsResponse(results.map((m: any) => ({ ...m, enabled: !!m.enabled })));
}

// POST /api/admin/delivery-methods
async function createDeliveryMethod(req: Request, env: Env): Promise<Response> {
  const data = await req.json();
  const id = data.id || generateId("del");
  await env.DB.prepare(
    `INSERT INTO delivery_methods (id, name, price, transitDays, carrier, enabled, description) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, data.name, data.price || 0, data.transitDays || "", data.carrier || "", data.enabled ? 1 : 1, data.description || "").run();
  return corsResponse({ id, ...data }, 201);
}

// PUT /api/admin/delivery-methods/:id
async function updateDeliveryMethod(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const data = await req.json();
  const fields: string[] = [];
  const values: any[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.price !== undefined) { fields.push("price = ?"); values.push(data.price); }
  if (data.transitDays !== undefined) { fields.push("transitDays = ?"); values.push(data.transitDays); }
  if (data.carrier !== undefined) { fields.push("carrier = ?"); values.push(data.carrier); }
  if (data.enabled !== undefined) { fields.push("enabled = ?"); values.push(data.enabled ? 1 : 0); }
  if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
  if (fields.length === 0) return jsonError("No fields to update");
  values.push(params.id);
  await env.DB.prepare(`UPDATE delivery_methods SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  const updated = await env.DB.prepare("SELECT * FROM delivery_methods WHERE id = ?").bind(params.id).first();
  return corsResponse(updated ? { ...updated, enabled: !!updated.enabled } : { id: params.id, ...data });
}

// DELETE /api/admin/delivery-methods/:id
async function deleteDeliveryMethod(_req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const result = await env.DB.prepare("DELETE FROM delivery_methods WHERE id = ?").bind(params.id).run();
  if (result.meta?.changes === 0) return jsonError("Delivery method not found", 404);
  return corsResponse({ success: true, id: params.id });
}

// POST /api/support-requests
async function createSupportRequest(req: Request, env: Env): Promise<Response> {
  const { name, email, subject, message } = await req.json();
  if (!name || !email || !subject || !message) return jsonError("Missing required fields");
  const id = generateId("AXN-INQ");
  await env.DB.prepare(
    `INSERT INTO support_requests (id, name, email, subject, message, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, name, email, subject, message, now(), "unread").run();
  return corsResponse({ id, name, email, subject, message, date: now(), status: "unread" }, 201);
}

// GET /api/admin/support-requests
async function getSupportRequests(_req: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM support_requests ORDER BY createdAt DESC").all();
  return corsResponse(results);
}

// PUT /api/admin/support-requests/:id
async function updateSupportRequest(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const { status } = await req.json();
  await env.DB.prepare("UPDATE support_requests SET status = ? WHERE id = ?").bind(status, params.id).run();
  return corsResponse({ id: params.id, status });
}

// POST /api/price-trackers
async function createPriceTracker(req: Request, env: Env): Promise<Response> {
  const { productId, email, initialPrice, initialPriceKsh } = await req.json();
  if (!productId || !email) return jsonError("Missing required fields");

  const product = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first();
  if (!product) return jsonError("Product not found", 404);

  const existing = await env.DB.prepare(
    "SELECT id FROM price_trackers WHERE productId = ? AND email = ? AND status = 'active'"
  ).bind(productId, email.toLowerCase()).first();
  if (existing) return jsonError("You are already tracking the price of this item.", 409);

  const id = generateId("tracker");
  await env.DB.prepare(
    `INSERT INTO price_trackers (id, productId, productName, productImage, email, initialPrice, initialPriceKsh, createdAt, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, productId, (product as any).name, (product as any).image, email.toLowerCase(),
    initialPrice ?? null, initialPriceKsh ?? null, now(), "active").run();

  return corsResponse({
    id, productId, productName: (product as any).name, productImage: (product as any).image,
    email: email.toLowerCase(), initialPrice, initialPriceKsh, createdAt: now(), status: "active",
    triggeredAt: null, triggeredPrice: null, triggeredPriceKsh: null
  }, 201);
}

// GET /api/admin/price-trackers
async function getPriceTrackers(_req: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM price_trackers ORDER BY createdAt DESC").all();
  return corsResponse(results);
}

// DELETE /api/admin/price-trackers/:id
async function deletePriceTracker(_req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const result = await env.DB.prepare("DELETE FROM price_trackers WHERE id = ?").bind(params.id).run();
  if (result.meta?.changes === 0) return jsonError("Price tracker not found", 404);
  return corsResponse({ success: true, id: params.id });
}

// GET /api/analytics
async function getAnalytics(_req: Request, env: Env): Promise<Response> {
  const { results: orders } = await env.DB.prepare("SELECT * FROM orders").all();
  const { results: products } = await env.DB.prepare("SELECT * FROM products").all();

  const totalRevenue = orders.reduce((acc: number, o: any) => acc + (o.total || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const categorySales: Record<string, number> = {};
  orders.forEach((o: any) => {
    const items = JSON.parse(o.items || "[]");
    items.forEach((item: any) => {
      const prod = products.find((p: any) => p.id === item.id);
      const category = prod ? prod.category : "General";
      categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity);
    });
  });

  const categoryData = Object.keys(categorySales).map(key => ({ name: key, value: categorySales[key] }));
  const statusCount = { pending: 0, packaged: 0, shipped: 0, delivered: 0 };
  orders.forEach((o: any) => {
    if (o.status in statusCount) statusCount[o.status as keyof typeof statusCount]++;
  });

  return corsResponse({ totalRevenue, totalOrders, avgOrderValue, categorySales: categoryData, statusCount, latestOrders: orders.slice(0, 5) });
}

// POST /api/admin/products
async function createProduct(req: Request, env: Env): Promise<Response> {
  const data = await req.json();
  const id = data.id || generateId("product");
  await env.DB.prepare(
    `INSERT INTO products (id, name, price, priceKsh, description, category, brand, image, colors, storages, rating, reviewsCount, inStock, isNew, isBestSeller, specifications, colorImages)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, data.name || "", data.price || 0, data.priceKsh || 0, data.description || "", data.category || "",
    data.brand || "", data.image || "", JSON.stringify(data.colors || []), JSON.stringify(data.storages || []),
    data.rating || 0, data.reviewsCount || 0, data.inStock ? 1 : 0, data.isNew ? 1 : 0, data.isBestSeller ? 1 : 0,
    JSON.stringify(data.specifications || {}), JSON.stringify(data.colorImages || {})).run();
  return corsResponse({ id, ...data }, 201);
}

// PUT /api/admin/products/:id
async function updateProduct(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const data = await req.json();
  const fields: string[] = [];
  const values: any[] = [];

  const fieldMap: Record<string, string> = {
    name: "name", price: "price", priceKsh: "priceKsh", description: "description",
    category: "category", brand: "brand", image: "image", rating: "rating",
    reviewsCount: "reviewsCount",
  };

  for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
    if (data[jsKey] !== undefined) { fields.push(`${dbCol} = ?`); values.push(data[jsKey]); }
  }
  if (data.colors !== undefined) { fields.push("colors = ?"); values.push(JSON.stringify(data.colors)); }
  if (data.storages !== undefined) { fields.push("storages = ?"); values.push(JSON.stringify(data.storages)); }
  if (data.colorImages !== undefined) { fields.push("colorImages = ?"); values.push(JSON.stringify(data.colorImages)); }
  if (data.specifications !== undefined) { fields.push("specifications = ?"); values.push(JSON.stringify(data.specifications)); }
  if (data.inStock !== undefined) { fields.push("inStock = ?"); values.push(data.inStock ? 1 : 0); }
  if (data.isNew !== undefined) { fields.push("isNew = ?"); values.push(data.isNew ? 1 : 0); }
  if (data.isBestSeller !== undefined) { fields.push("isBestSeller = ?"); values.push(data.isBestSeller ? 1 : 0); }

  if (fields.length === 0) return jsonError("No fields to update");

  fields.push("updatedAt = ?");
  values.push(now());
  values.push(params.id);

  await env.DB.prepare(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();

  // Handle price drop checks
  if (data.price !== undefined) {
    const trackers = await env.DB.prepare(
      "SELECT * FROM price_trackers WHERE productId = ? AND status = 'active'"
    ).bind(params.id).all();

    for (const tracker of trackers.results) {
      const t = tracker as any;
      let priceDrop = false;
      if (t.initialPrice !== null && data.price < t.initialPrice) priceDrop = true;
      if (t.initialPriceKsh !== null && data.priceKsh !== undefined && data.priceKsh < t.initialPriceKsh) priceDrop = true;

      if (priceDrop) {
        await env.DB.prepare(
          "UPDATE price_trackers SET status = 'triggered', triggeredAt = ?, triggeredPrice = ?, triggeredPriceKsh = ? WHERE id = ?"
        ).bind(now(), data.price, data.priceKsh || null, t.id).run();
      }
    }
  }

  const updated = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(params.id).first();
  return corsResponse(updated ? {
    ...updated, inStock: !!updated.inStock, isNew: !!updated.isNew, isBestSeller: !!updated.isBestSeller,
    colors: JSON.parse((updated as any).colors || "[]"), storages: JSON.parse((updated as any).storages || "[]"),
    colorImages: JSON.parse((updated as any).colorImages || "{}"),
    specifications: JSON.parse((updated as any).specifications || "{}"),
  } : { id: params.id, ...data });
}

// DELETE /api/admin/products/:id
async function deleteProduct(_req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const result = await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(params.id).run();
  if (result.meta?.changes === 0) return jsonError("Product not found", 404);
  return corsResponse({ success: true, id: params.id });
}

// PUT /api/admin/orders/:id/status
async function updateOrderStatus(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const { status, notes } = await req.json();
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(params.id).first() as any;
  if (!order) return jsonError("Order not found", 404);

  const history = JSON.parse(order.history || "[]");
  history.push({ status, time: now(), notes: notes || `Status updated to ${status}.` });

  await env.DB.prepare("UPDATE orders SET status = ?, history = ? WHERE id = ?")
    .bind(status, JSON.stringify(history), params.id).run();

  return corsResponse({ ...order, status, history });
}

// POST /api/admin/orders/:id/dispatch
async function dispatchOrder(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const { deliveryMethodId, trackingNumber, notes } = await req.json();
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(params.id).first() as any;
  if (!order) return jsonError("Order not found", 404);

  const method = await env.DB.prepare("SELECT * FROM delivery_methods WHERE id = ?").bind(deliveryMethodId).first() as any
    || { name: "Custom Delivery", carrier: "Express Courier", transitDays: "3-5 days" };

  const history = JSON.parse(order.history || "[]");
  history.push({ status: "shipped", time: now(), notes: notes || `Dispatched via ${method.name}. Tracking: ${trackingNumber}` });

  await env.DB.prepare(
    `UPDATE orders SET status = 'shipped', history = ?, shippingMethodName = ?, shippingCarrier = ?, shippingTrackingNumber = ?, shippingDispatchedDate = ? WHERE id = ?`
  ).bind(JSON.stringify(history), method.name, method.carrier, trackingNumber, now(), params.id).run();

  return corsResponse({ success: true, order: { ...order, status: "shipped", history } });
}

// GET /api/blog
async function getBlog(_req: Request, env: Env): Promise<Response> {
  await seedDatabase(env.DB);
  const { results } = await env.DB.prepare("SELECT * FROM blog ORDER BY date DESC").all();
  return corsResponse(results.map((b: any) => ({ ...b, tags: JSON.parse(b.tags || "[]") })));
}

// GET /api/blog/:slug
async function getBlogPost(_req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const post = await env.DB.prepare("SELECT * FROM blog WHERE slug = ?").bind(params.slug).first() as any;
  if (!post) return jsonError("Blog post not found", 404);
  return corsResponse({ ...post, tags: JSON.parse(post.tags || "[]") });
}

// POST /api/admin/blog
async function createBlogPost(req: Request, env: Env): Promise<Response> {
  const data = await req.json();
  const id = data.id || generateId("blog");
  const date = data.date || now();
  const tags = JSON.stringify(data.tags || []);

  let jsonLd = data.jsonLd;
  if (!jsonLd) {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org", "@type": "BlogPosting",
      "headline": data.title, "description": data.excerpt,
      "author": { "@type": "Person", "name": data.author || "AXON Staff Writer" },
      "publisher": { "@type": "Organization", "name": "AXON TECH" },
      "datePublished": date
    }, null, 2);
  }

  await env.DB.prepare(
    `INSERT INTO blog (id, title, slug, excerpt, content, category, author, date, tags, metaTitle, metaDescription, contentLocation, jsonLd)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, data.title || "", data.slug || "", data.excerpt || "", data.content || "",
    data.category || "", data.author || "", date, tags, data.metaTitle || "", data.metaDescription || "",
    data.contentLocation || "", jsonLd).run();

  return corsResponse({ id, ...data, date, tags: JSON.parse(tags), jsonLd }, 201);
}

// PUT /api/admin/blog/:id
async function updateBlogPost(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const data = await req.json();
  const fields: string[] = [];
  const values: any[] = [];

  for (const key of ["title", "slug", "excerpt", "content", "category", "author", "date", "metaTitle", "metaDescription", "contentLocation", "jsonLd"]) {
    if (data[key] !== undefined) { fields.push(`${key} = ?`); values.push(data[key]); }
  }
  if (data.tags !== undefined) { fields.push("tags = ?"); values.push(JSON.stringify(data.tags)); }
  if (fields.length === 0) return jsonError("No fields to update");
  values.push(params.id);

  await env.DB.prepare(`UPDATE blog SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  const updated = await env.DB.prepare("SELECT * FROM blog WHERE id = ?").bind(params.id).first() as any;
  return corsResponse(updated ? { ...updated, tags: JSON.parse(updated.tags || "[]") } : { id: params.id, ...data });
}

// DELETE /api/admin/blog/:id
async function deleteBlogPost(_req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const result = await env.DB.prepare("DELETE FROM blog WHERE id = ?").bind(params.id).run();
  if (result.meta?.changes === 0) return jsonError("Blog post not found", 404);
  return corsResponse({ success: true, id: params.id });
}

// GET /api/reviews
async function getReviews(_req: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM reviews WHERE approved = 1 ORDER BY date DESC").all();
  return corsResponse(results.map((r: any) => ({ ...r, approved: !!r.approved, verified: !!r.verified })));
}

// POST /api/reviews
async function createReview(req: Request, env: Env): Promise<Response> {
  const { author, rating, title, content, source } = await req.json();
  if (!author || !rating || !content) return jsonError("Author, rating, and content are required.");

  const id = generateId("rev");
  await env.DB.prepare(
    `INSERT INTO reviews (id, author, rating, title, content, source, approved, verified, date, deviceInfo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, author, Math.min(5, Math.max(1, Number(rating))), title || "", content, source || "website", 1, 0, now(),
    "").run();

  return corsResponse({
    id, author, rating: Math.min(5, Math.max(1, Number(rating))), title: title || "", content,
    source: source || "website", approved: true, verified: false, date: now()
  }, 201);
}

// GET /api/admin/reviews
async function getAdminReviews(_req: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM reviews ORDER BY date DESC").all();
  return corsResponse(results.map((r: any) => ({ ...r, approved: !!r.approved, verified: !!r.verified })));
}

// PUT /api/admin/reviews/:id
async function updateReview(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const data = await req.json();
  const fields: string[] = [];
  const values: any[] = [];
  if (data.approved !== undefined) { fields.push("approved = ?"); values.push(data.approved ? 1 : 0); }
  if (data.verified !== undefined) { fields.push("verified = ?"); values.push(data.verified ? 1 : 0); }
  if (fields.length === 0) return jsonError("No fields to update");
  values.push(params.id);
  await env.DB.prepare(`UPDATE reviews SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  return corsResponse({ id: params.id, ...data });
}

// DELETE /api/admin/reviews/:id
async function deleteReview(_req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const result = await env.DB.prepare("DELETE FROM reviews WHERE id = ?").bind(params.id).run();
  if (result.meta?.changes === 0) return jsonError("Review not found", 404);
  return corsResponse({ success: true, id: params.id });
}

// GET /api/admin/whatsapp-notifications
async function getWhatsAppNotifications(_req: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM whatsapp_notifications ORDER BY timestamp DESC").all();
  return corsResponse(results);
}

// GET /api/admin/whatsapp-api-logs
async function getWhatsAppApiLogs(_req: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM whatsapp_api_logs ORDER BY timestamp DESC").all();
  return corsResponse(results);
}

// POST /api/admin/blog/generate (Gemini AI)
async function generateBlogPost(req: Request, env: Env): Promise<Response> {
  if (!env.GEMINI_API_KEY) return jsonError("GEMINI_API_KEY not configured", 400);

  const { topic, category, location, keywords } = await req.json();

  // Check AI credits
  const configRows = await env.DB.prepare("SELECT value FROM config WHERE key = 'aiCreditsUsed'").first();
  const limitRows = await env.DB.prepare("SELECT value FROM config WHERE key = 'aiCreditsLimit'").first();
  const used = configRows ? JSON.parse((configRows as any).value) : 0;
  const limit = limitRows ? JSON.parse((limitRows as any).value) : 30;
  if (used >= limit) return jsonError(`AI Credit Quota Exceeded (${used}/${limit})`, 403);

  const prompt = `Write a highly engaging, professional, and SEO/GEO-optimized blog post for AXON TECH.
Topic: ${topic || "Latest tech products and accessories"}
Category: ${category || "Technology"}
Location: ${location || "Nairobi, Kenya"}
Keywords: ${keywords || "tech store, buy electronics online, Kenya gadgets"}

Write in a technical, authoritative tone. Include ISO standards references. Use Markdown with headers, lists, and tables. Ground geographically in ${location || "Nairobi, Kenya"}.

Return ONLY a JSON object with these fields: title, slug, excerpt, content, category, author, tags (array), metaTitle, metaDescription, contentLocation`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return jsonError(`Gemini API error: ${err}`, 500);
    }

    const result = await response.json() as any;
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return jsonError("No response from Gemini API", 500);

    const postData = JSON.parse(text);
    const id = generateId("blog");
    const date = now();
    const tags = JSON.stringify(postData.tags || []);

    await env.DB.prepare(
      `INSERT INTO blog (id, title, slug, excerpt, content, category, author, date, tags, metaTitle, metaDescription, contentLocation, jsonLd)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, postData.title, postData.slug, postData.excerpt, postData.content, postData.category,
      postData.author, date, tags, postData.metaTitle, postData.metaDescription, postData.contentLocation || (location || "Nairobi, Kenya"),
      JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", "headline": postData.title }, null, 2)).run();

    // Increment credits
    await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'aiCreditsUsed'").bind(JSON.stringify(used + 1)).run();

    return corsResponse({ id, ...postData, date, tags: JSON.parse(tags) }, 201);
  } catch (err: any) {
    return jsonError(`Blog generation failed: ${err.message}`, 500);
  }
}

// POST /api/admin/reports/generate (Gemini AI)
async function generateReport(req: Request, env: Env): Promise<Response> {
  if (!env.GEMINI_API_KEY) return jsonError("GEMINI_API_KEY not configured", 400);

  const { reportType } = await req.json();

  const configRows = await env.DB.prepare("SELECT value FROM config WHERE key = 'aiCreditsUsed'").first();
  const limitRows = await env.DB.prepare("SELECT value FROM config WHERE key = 'aiCreditsLimit'").first();
  const used = configRows ? JSON.parse((configRows as any).value) : 0;
  const limit = limitRows ? JSON.parse((limitRows as any).value) : 30;
  if (used >= limit) return jsonError(`AI Credit Quota Exceeded (${used}/${limit})`, 403);

  const { results: orders } = await env.DB.prepare("SELECT * FROM orders").all();
  const { results: products } = await env.DB.prepare("SELECT * FROM products").all();
  const { results: supportReqs } = await env.DB.prepare("SELECT * FROM support_requests").all();
  const { results: blogPosts } = await env.DB.prepare("SELECT * FROM blog").all();

  const totalOrders = orders.length;
  const totalSales = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
  const shippedOrders = orders.filter((o: any) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o: any) => o.status === "delivered").length;

  let systemContext = "";
  let reportTitle = "";

  if (reportType === "sales") {
    reportTitle = "Store Sales & Order Performance Matrix";
    systemContext = `Total Orders: ${totalOrders}, Total Revenue: $${totalSales.toFixed(2)}, Pending: ${pendingOrders}, Shipped: ${shippedOrders}, Delivered: ${deliveredOrders}`;
  } else if (reportType === "catalog") {
    reportTitle = "Product Catalog Health Audit";
    systemContext = `Total SKUs: ${products.length}, Average Price: $${(products.reduce((s: number, p: any) => s + (p.price || 0), 0) / (products.length || 1)).toFixed(2)}`;
  } else if (reportType === "support") {
    reportTitle = "Customer Care Report";
    systemContext = `Total Inquiries: ${supportReqs.length}, Open: ${supportReqs.filter((r: any) => r.status !== "resolved").length}`;
  } else {
    reportTitle = "Website Configuration Audit";
    systemContext = `Hero Slides: ${blogPosts.length} blog posts`;
  }

  const prompt = `Generate a professional executive analytics report for Axon Technologies Kenya.
Report: ${reportTitle}
Context: ${systemContext}
Include: Executive Summary, Diagnostics, Strategic Context (East Africa), Action Steps.
Use Markdown. Be formal and analytical.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) return jsonError("Gemini API error", 500);
    const result = await response.json() as any;
    const reportText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reportText) return jsonError("No response from Gemini API", 500);

    await env.DB.prepare("UPDATE config SET value = ? WHERE key = 'aiCreditsUsed'").bind(JSON.stringify(used + 1)).run();

    return corsResponse({ success: true, reportTitle, reportType, generatedAt: now(), report: reportText, creditsUsed: used + 1, creditsLimit: limit });
  } catch (err: any) {
    return jsonError(`Report generation failed: ${err.message}`, 500);
  }
}

// POST /api/admin/scrape-url (simplified for Worker)
async function scrapeUrl(req: Request, _env: Env): Promise<Response> {
  const { url } = await req.json();
  if (!url) return jsonError("Product URL is required");

  const normalizedUrl = url.toLowerCase();
  let name = "", priceKsh = 0, description = "", category = "Phones", brand = "Apple", image = "";
  let specifications: Record<string, string> = {};

  if (normalizedUrl.includes("iphone-15")) {
    name = "Apple iPhone 15 Pro Max (Titanium)"; priceKsh = 167700; brand = "Apple";
    image = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80";
    description = "Elite aerospace titanium design with custom Action button, M17 Pro cinematic processing core.";
    specifications = { "Chipset": "Apple A17 Pro (3nm)", "Screen": "6.7 inch Super Retina XDR OLED" };
  } else if (normalizedUrl.includes("s24-ultra") || normalizedUrl.includes("samsung")) {
    name = "Samsung Galaxy S24 Ultra"; priceKsh = 154700; brand = "Samsung";
    image = "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80";
    description = "Powered by Galaxy AI with 200MP Quad Telephoto camera system.";
    specifications = { "Chipset": "Snapdragon 8 Gen 3", "Screen": "6.8 inch Dynamic AMOLED 2X" };
  } else {
    let parsedName = url.replace(/https?:\/\/(www\.)?/, "").replace(/\.(com|co\.ke|org|net|ke)/, "").split("/").filter(Boolean).pop() || "Gadget";
    name = parsedName.replace(/[-_]+/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    priceKsh = 85000;
    image = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80";
    description = "Imported real-time gadget from Kenyan e-commerce marketplaces.";
  }

  // Try live fetch
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal
    });
    clearTimeout(id);

    if (response.ok) {
      const html = await response.text();
      const titleMatch = /<h1[^>]*>([^<]+)<\/h1>/.exec(html);
      if (titleMatch) name = titleMatch[1].trim();
      const priceMatch = /KSh\s*([\d,]+)/.exec(html);
      if (priceMatch) priceKsh = parseInt(priceMatch[1].replace(/[^\d]/g, ""), 10);
      const imgMatch = /<img[^>]+src="([^"]+)"/.exec(html);
      if (imgMatch) image = imgMatch[1];
    }
  } catch (_) {}

  const priceUsd = Math.round(priceKsh / 130);
  return corsResponse({
    id: "scraped-draft-" + Date.now(), name, price: priceUsd, priceKsh, description, category, brand, image,
    rating: 4.8, reviewsCount: 15, inStock: true, specifications
  });
}

// POST /api/admin/sync-realtime-products (simplified)
async function syncRealtimeProducts(_req: Request, env: Env): Promise<Response> {
  const logs: string[] = [];
  let syncedCount = 0;

  const fallbackProducts = [
    { id: "pp-iphone-15-pro-max", name: "iPhone 15 Pro Max (Titanium)", price: 1290, priceKsh: 167700, category: "Phones", brand: "Apple", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80", rating: 4.9, reviewsCount: 342, description: "Official listing from PhonePlace Kenya." },
    { id: "pp-samsung-s24-ultra", name: "Samsung Galaxy S24 Ultra", price: 1190, priceKsh: 154700, category: "Phones", brand: "Samsung", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80", rating: 4.8, reviewsCount: 219, description: "Official listing from PhonePlace Kenya." },
    { id: "is-macbook-pro-16", name: "MacBook Pro 16 M3 Max", price: 3290, priceKsh: 427700, category: "Laptops", brand: "Apple", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80", rating: 4.9, reviewsCount: 184, description: "Official listing from iStreet Kenya." }
  ];

  for (const p of fallbackProducts) {
    const existing = await env.DB.prepare("SELECT id FROM products WHERE id = ?").bind(p.id).first();
    if (existing) {
      await env.DB.prepare("UPDATE products SET price = ?, priceKsh = ?, name = ?, image = ? WHERE id = ?")
        .bind(p.price, p.priceKsh, p.name, p.image, p.id).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO products (id, name, price, priceKsh, description, category, brand, image, rating, reviewsCount, inStock, colors, storages, specifications)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '[]', '[]', '{}')`
      ).bind(p.id, p.name, p.price, p.priceKsh, p.description, p.category, p.brand, p.image, p.rating, p.reviewsCount).run();
    }
    syncedCount++;
  }

  logs.push(`Synced ${syncedCount} products from cached entries.`);
  return corsResponse({ success: true, syncedCount, logs });
}

// ─── SITEMAP & SEO ───────────────────────────────────────────
async function generateSitemap(env: Env): Promise<Response> {
  await seedDatabase(env.DB);
  const SITE_URL = "https://axontechnologies.co.ke";
  const today = new Date().toISOString().split("T")[0];

  const urls: string[] = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/catalog", priority: "0.9", changefreq: "daily" },
    { path: "/contact", priority: "0.8", changefreq: "monthly" },
    { path: "/track-order", priority: "0.7", changefreq: "monthly" },
    { path: "/blog", priority: "0.8", changefreq: "weekly" },
  ].map((p: any) => `  <url><loc>${SITE_URL}${p.path}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`);

  const { results: products } = await env.DB.prepare("SELECT id, image, name FROM products").all();
  for (const p of products) {
    urls.push(`  <url><loc>${SITE_URL}/product/${escapeXml((p as any).id)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`);
  }

  const { results: blogPosts } = await env.DB.prepare("SELECT slug, date FROM blog").all();
  for (const b of blogPosts) {
    const postDate = (b as any).date ? new Date((b as any).date).toISOString().split("T")[0] : today;
    urls.push(`  <url><loc>${SITE_URL}/blog/${escapeXml((b as any).slug)}</loc><lastmod>${postDate}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" }
  });
}

// ─── MAIN ROUTES ─────────────────────────────────────────────
const routes: Route[] = [
  // Auth
  route("POST", "/api/auth/login", login),

  // Public
  route("GET", "/api/products", getProducts),
  route("GET", "/api/orders", getOrders),
  route("POST", "/api/orders", createOrder),
  route("GET", "/api/orders/:trackingId", getOrder),
  route("GET", "/api/config", getConfig),
  route("GET", "/api/contact", getContact),
  route("GET", "/api/delivery-methods", getDeliveryMethods),
  route("POST", "/api/support-requests", createSupportRequest),
  route("POST", "/api/price-trackers", createPriceTracker),
  route("GET", "/api/analytics", getAnalytics),
  route("GET", "/api/blog", getBlog),
  route("GET", "/api/blog/:slug", getBlogPost),
  route("GET", "/api/reviews", getReviews),
  route("POST", "/api/reviews", createReview),

  // Admin
  route("POST", "/api/admin/products", createProduct),
  route("PUT", "/api/admin/products/:id", updateProduct),
  route("DELETE", "/api/admin/products/:id", deleteProduct),
  route("PUT", "/api/admin/orders/:id/status", updateOrderStatus),
  route("POST", "/api/admin/orders/:id/dispatch", dispatchOrder),
  route("PUT", "/api/admin/config", updateConfig),
  route("PUT", "/api/admin/contact", updateContact),
  route("GET", "/api/admin/support-requests", getSupportRequests),
  route("PUT", "/api/admin/support-requests/:id", updateSupportRequest),
  route("POST", "/api/admin/delivery-methods", createDeliveryMethod),
  route("PUT", "/api/admin/delivery-methods/:id", updateDeliveryMethod),
  route("DELETE", "/api/admin/delivery-methods/:id", deleteDeliveryMethod),
  route("GET", "/api/admin/price-trackers", getPriceTrackers),
  route("DELETE", "/api/admin/price-trackers/:id", deletePriceTracker),
  route("GET", "/api/admin/whatsapp-notifications", getWhatsAppNotifications),
  route("GET", "/api/admin/whatsapp-api-logs", getWhatsAppApiLogs),
  route("POST", "/api/admin/blog", createBlogPost),
  route("PUT", "/api/admin/blog/:id", updateBlogPost),
  route("DELETE", "/api/admin/blog/:id", deleteBlogPost),
  route("POST", "/api/admin/blog/generate", generateBlogPost),
  route("GET", "/api/admin/reviews", getAdminReviews),
  route("PUT", "/api/admin/reviews/:id", updateReview),
  route("DELETE", "/api/admin/reviews/:id", deleteReview),
  route("POST", "/api/admin/reports/generate", generateReport),
  route("POST", "/api/admin/scrape-url", scrapeUrl),
  route("POST", "/api/admin/sync-realtime-products", syncRealtimeProducts),
];

// ─── ENTRY ───────────────────────────────────────────────────
export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Seed super admin on first request
    if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
      ctx.waitUntil(seedSuperAdmin(env.DB, env.ADMIN_EMAIL, env.ADMIN_PASSWORD).catch(() => {}));
    }

    const url = new URL(req.url);

    // Sitemap
    if (url.pathname === "/sitemap.xml") {
      return generateSitemap(env);
    }

    // Health check
    if (url.pathname === "/") {
      return corsResponse({ status: "ok", service: "axon-tech-api", version: "1.0" });
    }

    // API routes
    if (url.pathname.startsWith("/api/")) {
      // Auth check for admin routes (except login)
      if (url.pathname.startsWith("/api/admin/")) {
        const auth = await verifyAuth(req, env);
        if (!auth) return jsonError("Unauthorized.", 401);
      }

      const matched = matchRoute(routes, req);
      if (matched) {
        return matched.handler(req, env, ctx, matched.params);
      }
      return jsonError("Not found", 404);
    }

    return corsResponse({ status: "ok", service: "axon-tech-api" });
  },
};
