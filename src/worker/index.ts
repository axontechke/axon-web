export interface Env {
  DB: D1Database;
  GEMINI_API_KEY?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_API_KEY?: string;          // Secret key for server-to-server auth (VPS internal calls)
  ALLOWED_ADMIN_IPS?: string;    // Comma-separated list of allowed IPs for admin endpoints
  WHATSAPP_ACCESS_TOKEN?: string;  // Meta WhatsApp Business API access token
  WHATSAPP_PHONE_NUMBER_ID?: string; // WhatsApp Business phone number ID
  WHATSAPP_ADMIN_NOTIFY_NUMBER?: string; // Admin number to receive order alerts (e.g. 254745017979)
  FIREBASE_WEB_API_KEY?: string;   // Firebase Web API key for ID token verification
  FIREBASE_PROJECT_ID?: string;    // Firebase Project ID for ID token verification (aud check)
}

// ─── HELPERS ─────────────────────────────────────────────────
async function jsonBody<T = Record<string, any>>(req: Request): Promise<T> {
  return req.json() as Promise<T>;
}

// ─── SECURITY HELPERS ─────────────────────────────────────────

// In-memory rate limiter: tracks failed attempts per IP (resets on worker restart — fine for DDoS deterrent)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 20;

function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-client-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    return false;
  }
  if (entry.count >= MAX_FAILED_ATTEMPTS) return true;
  return false;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count++;
  }
}

function clearRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

function getAllowedIps(env: Env): string[] {
  if (!env.ALLOWED_ADMIN_IPS) return [];
  return env.ALLOWED_ADMIN_IPS.split(",").map(ip => ip.trim()).filter(Boolean);
}

function isIpAllowed(clientIp: string, env: Env): boolean {
  const allowed = getAllowedIps(env);
  if (allowed.length === 0) return true; // No allowlist configured — allow all (backward compatible)
  // Check for exact match or CIDR-like partial (e.g. "192.168.1" matches "192.168.1.100")
  return allowed.some(allowedIp =>
    clientIp === allowedIp || clientIp.startsWith(allowedIp + ".")
  );
}

// Verify the request is allowed: checks IP allowlist + optional API key
function verifyRequestSecurity(req: Request, env: Env, isAdminRoute: boolean): Response | null {
  const clientIp = getClientIp(req);

  // 1. Rate limiting on all API routes (stops brute force)
  if (isRateLimited(clientIp)) {
    return corsResponse({ error: "Too many requests. Try again later." }, 429);
  }

  // 2. Admin routes: require valid auth OR trusted API key OR allowed IP
  if (isAdminRoute) {
    // Internal API key for VPS server-to-server calls
    if (env.ADMIN_API_KEY) {
      const keyHeader = req.headers.get("x-admin-api-key");
      if (keyHeader === env.ADMIN_API_KEY) {
        return null; // Pass — API key is valid
      }
    }

    // IP allowlist check
    if (!isIpAllowed(clientIp, env)) {
      recordFailedAttempt(clientIp);
      return corsResponse({ error: "Access denied from this IP address." }, 403);
    }
  }

  return null; // Pass — no security block
}

// ─── WHATSAPP API ─────────────────────────────────────────────

interface WhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Send a WhatsApp message via Meta Graph API
async function sendWhatsAppMessage(
  toNumber: string,
  message: string,
  env: Env
): Promise<WhatsAppMessageResult> {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return { success: false, error: "WhatsApp API credentials not configured" };
  }

  // Normalize phone: remove spaces, + sign, leading 0
  const normalized = toNumber.replace(/[\s+0]/g, "").replace(/^254/, "254");

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalized,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const data = await response.json() as any;

    if (!response.ok) {
      console.error("[WHATSAPP SEND ERROR]", data);
      return { success: false, error: data?.error?.message || "WhatsApp API error" };
    }

    // Log the API call
    await env.DB.prepare(
      `INSERT INTO whatsapp_api_logs (id, timestamp, endpoint, method, requestPayload, responsePayload, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      generateId("wa-log"),
      now(),
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      "POST",
      JSON.stringify({ to: normalized, messageLength: message.length }),
      JSON.stringify(data),
      response.status
    ).run();

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    console.error("[WHATSAPP FETCH ERROR]", err);
    return { success: false, error: String(err) };
  }
}

// Send WhatsApp order notification to admin and customer
async function notifyOrderViaWhatsApp(
  orderData: {
    customerName: string;
    customerPhone: string;
    orderId: string;
    total: number;
    totalKsh: number;
    items: string;
    shippingMethod: string;
  },
  env: Env,
  settings?: { enabled?: boolean; sendToAdmin?: boolean; sendToCustomer?: boolean }
): Promise<void> {
  // Check if WhatsApp is enabled from settings (default to true if not set)
  const enabled = settings?.enabled !== false;
  if (!enabled) return;

  const adminNumber = env.WHATSAPP_ADMIN_NOTIFY_NUMBER;
  const sendToAdmin = settings?.sendToAdmin !== false;
  const sendToCustomer = settings?.sendToCustomer !== false;

  // Message to admin
  const adminMessage = `🛒 NEW ORDER — #${orderData.orderId}

${orderData.customerName}
📱 ${orderData.customerPhone}
💰 KSh ${orderData.totalKsh.toLocaleString()}
🚚 ${orderData.shippingMethod}

Items:
${orderData.items}

Login to admin to process: https://axontech.co.ke/admin`;

  // Message to customer
  const customerMessage = `✅ Order Confirmed — #${orderData.orderId}

Hi ${orderData.customerName}!

We've received your order and will start processing it right away.

Total: KSh ${orderData.totalKsh.toLocaleString()}
Delivery: ${orderData.shippingMethod}

We'll send updates as your order progresses. Questions? WhatsApp us anytime!`;

  // Send to admin if enabled and number is configured
  if (sendToAdmin && adminNumber) {
    const adminResult = await sendWhatsAppMessage(adminNumber, adminMessage, env);
    await env.DB.prepare(
      `INSERT INTO whatsapp_notifications (id, orderId, customerName, customerPhone, message, status, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      generateId("WA"),
      orderData.orderId,
      orderData.customerName,
      orderData.customerPhone,
      adminMessage,
      adminResult.success ? "sent" : "failed",
      now()
    ).run();
  }

  // Send to customer if enabled and they provided a number
  if (sendToCustomer && orderData.customerPhone) {
    const customerResult = await sendWhatsAppMessage(orderData.customerPhone, customerMessage, env);
    await env.DB.prepare(
      `INSERT INTO whatsapp_notifications (id, orderId, customerName, customerPhone, message, status, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      generateId("WA"),
      orderData.orderId,
      orderData.customerName,
      orderData.customerPhone,
      customerMessage,
      customerResult.success ? "sent" : "failed",
      now()
    ).run();
  }
}

// Sanitize error messages — never expose internals to clients
function sanitizeError(err: unknown): string {
  if (err instanceof Error) {
    // Log the real error server-side
    console.error("[SERVER ERROR]", err.message, err.stack);
    return "An internal error occurred. Please try again.";
  }
  return "An internal error occurred. Please try again.";
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
  "Access-Control-Allow-Origin": "https://axontech.co.ke https://www.axontech.co.ke", // Restrict to your domain(s)
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-api-key",
  "Access-Control-Max-Age": "86400",
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
const INITIAL_PRODUCTS: any[] = [];


const INITIAL_CONFIG: Record<string, any> = {
  announcement: "FREE CARRY SLEEVE WITH ALL LAPTOPS | NAIROBI SAME-DAY DELIVERY AVAILABLE",
  showAnnouncement: true,
  heroTitle: "Tech Gadgets & Accessories.",
  heroDescription: "Phones, tablets, laptops, earphones and more. Genuine products, fast delivery across Kenya, and warranty included.",
  heroSlides: [],
  navbarLogoUrl: "",
  ogImage: "",
  categoryThumbnails: {
    "Laptops": "",
    "Tablets": "",
    "Audio": "",
    "Phones": "",
    "Accessories": "",
    "Power": ""
  },
  activePromos: [
    { code: "AXON15", discount: 15, description: "15% discount on products" },
    { code: "SAVE20", discount: 20, description: "20% off all accessories" }
  ],
  socialTwitter: "",
  socialGithub: "",
  socialLinkedIn: "",
  contactEmail: "synergy@axon.net",
  supportEmail: "support@axon.net",
  privacyPolicy: "AXON TECH collects information needed to process and deliver your orders. We do not share your data with third parties for marketing.",
  termsOfUse: "These Terms of Service govern all purchases and use of the AXON TECH online store.",
  cookiePolicy: "We use cookies to remember your cart and preferences. No third-party tracking cookies.",
  refundPolicy: "We offer a complete 30-day, risk-free guarantee.",
  deliveryPolicy: "AXON TECH ships all orders in secure packaging. Orders placed before 12 PM dispatch same day via trusted couriers.",
  aiCreditsLimit: 30,
  aiCreditsUsed: 0,
  footerBrandName: "AXON",
  footerBrandSuffix: "TECH",
  footerBrandLogoUrl: "",
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
  location: { city: "Nairobi", country: "Kenya", addressString: "Simara Mall, Ground Floor, Shop G50, Nairobi, Kenya", icon: "", embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.22384758913!2d36.815349!3d-1.286389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d3e527d73d%3A0xc6cb1c7df44a9!2sSimara%20Mall!5e0!3m2!1sen!2ske!4v1721012345678!5m2!1sen!2ske", externalUrl: "https://maps.google.com/?q=Simara+Mall+Ground+Floor+Shop+G50+Nairobi" },
  businessHours: { weekdays: "Monday - Saturday: 8:00 AM - 6:00 PM EAT", supportCall: "8:00 AM - 8:00 PM EAT" },
  socials: [
    { name: "WhatsApp", url: "https://wa.me/254745017979", icon: "" },
    { name: "Instagram", url: "https://instagram.com/axontechke", icon: "" },
    { name: "Facebook", url: "https://facebook.com/axontechke", icon: "" },
    { name: "TikTok", url: "https://tiktok.com/@axontechke", icon: "" }
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
    items: JSON.stringify([{ id: "axon-slate-pro", name: "Axon Slate Pro", price: 899, quantity: 1, color: "Space Gray", storage: "256GB", image: "" }]),
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
      { id: "axon-slate-pro", name: "Axon Slate Pro", price: 899, quantity: 1, color: "Space Gray", storage: "256GB", image: "" },
      { id: "axon-pen-pro", name: "Axon Pen Pro", price: 899, quantity: 1, color: "White", storage: "128GB", image: "" }
    ]),
    history: JSON.stringify([
      { status: "pending", time: "2024-02-01T09:00:00Z", notes: "Order placed. Awaiting payment confirmation." },
      { status: "packaged", time: "2024-02-01T13:00:00Z", notes: "Order sealed and quality checked." },
      { status: "shipped", time: "2024-02-02T07:30:00Z", notes: "Dispatched via Air Cargo. Tracking: AXN-TRK-982714." }
    ])
  }
];

const INITIAL_DELIVERY_METHODS = [
  { id: "nairobi-same-day", name: "Nairobi Same-Day", price: 0, transitDays: "Same day", carrier: "AXON Rider", enabled: 1, description: "Free same-day delivery within Nairobi CBD and suburbs. Order before 2 PM.", locations: ["Kenya", "Nairobi"] },
  { id: "nairobi-next-day", name: "Nairobi Next-Day", price: 0, transitDays: "1 day", carrier: "AXON Rider", enabled: 1, description: "Free next-day delivery across Nairobi. Delivered by 6 PM.", locations: ["Kenya", "Nairobi"] },
  { id: "kenya-nationwide", name: "Kenya Nationwide", price: 350, transitDays: "2-3 days", carrier: "DHL Kenya / G4S", enabled: 1, description: "Reliable delivery across Kenya via DHL or G4S. Tracking provided.", locations: ["Kenya"] },
  { id: "east-africa-economy", name: "East Africa Economy", price: 1200, transitDays: "5-7 days", carrier: "DHL / Regional Courier", enabled: 1, description: "Affordable delivery to Uganda, Tanzania, Sudan, Ethiopia, Rwanda, Burundi, and South Sudan.", locations: ["Uganda", "Tanzania", "Sudan", "Ethiopia", "Rwanda", "Burundi", "South Sudan"] },
  { id: "east-africa-express", name: "East Africa Express", price: 2500, transitDays: "2-3 days", carrier: "DHL Express", enabled: 1, description: "Fast express delivery to Uganda, Tanzania, Sudan, Ethiopia, Rwanda, Burundi, and South Sudan.", locations: ["Uganda", "Tanzania", "Sudan", "Ethiopia", "Rwanda", "Burundi", "South Sudan"] },
  { id: "international", name: "International", price: 5000, transitDays: "7-14 days", carrier: "DHL International", enabled: 1, description: "Worldwide delivery. Contact us for exact rates to your country.", locations: ["International"] },
];


// ─── SEED DATABASE ───────────────────────────────────────────
async function seedDatabase(db: D1Database): Promise<void> {
  const batch: any[] = [];

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

  // Check and seed delivery methods
  const deliveryCount = await db.prepare("SELECT COUNT(*) as count FROM delivery_methods").first<{ count: number }>();
  if (!deliveryCount || deliveryCount.count === 0) {
    for (const m of INITIAL_DELIVERY_METHODS) {
      batch.push(db.prepare(
        `INSERT OR IGNORE INTO delivery_methods (id, name, price, transitDays, carrier, enabled, description, locations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(m.id, m.name, m.price, m.transitDays, m.carrier, m.enabled, m.description, JSON.stringify(m.locations || [])));
    }
  }

  if (batch.length > 0) await db.batch(batch);
}

// ─── SEED SUPER ADMIN ────────────────────────────────────────
async function seedSuperAdmin(db: D1Database, emails: string, password: string): Promise<void> {
  const emailList = emails.split(",").map(e => e.trim()).filter(Boolean);
  for (const email of emailList) {
    const existing = await db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").bind(email).first<{ id: string }>();
    if (existing) continue;

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const id = crypto.randomUUID();

    await db.prepare(
      "INSERT INTO users (id, email, passwordHash, salt, role) VALUES (?, ?, ?, ?, 'super-admin')"
    ).bind(id, email, passwordHash, salt).run();
  }
}

// ─── AUTH HANDLER ─────────────────────────────────────────────
async function login(req: Request, env: Env): Promise<Response> {
  const clientIp = getClientIp(req);
  const { email, password } = await jsonBody<{ email?: string; password?: string }>(req);
  if (!email || !password) return jsonError("Email and password required.");

  const user = await env.DB.prepare(
    "SELECT id, email, passwordHash, salt, role FROM users WHERE LOWER(email) = LOWER(?)"
  ).bind(email).first<{ id: string; email: string; passwordHash: string; salt: string; role: string }>();

  if (!user) {
    recordFailedAttempt(clientIp);
    return jsonError("Invalid credentials.", 401);
  }

  const valid = await verifyPassword(password, user.salt, user.passwordHash);
  if (!valid) {
    recordFailedAttempt(clientIp);
    return jsonError("Invalid credentials.", 401);
  }

  const token = generateToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  // Store session token with login IP for audit trail
  await env.DB.prepare(
    "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)"
  ).bind(`session:${token}`, JSON.stringify({ userId: user.id, email: user.email, role: user.role, expiresAt, loginIp: clientIp })).run();

  clearRateLimit(clientIp);
  return corsResponse({ token, user: { id: user.id, email: user.email, role: user.role } });
}

// POST /api/auth/firebase-login — Google Sign-In via Firebase ID token
async function firebaseLogin(req: Request, env: Env): Promise<Response> {
  const clientIp = getClientIp(req);
  const { idToken } = await jsonBody<{ idToken?: string }>(req);
  if (!idToken) return jsonError("ID token required.", 400);

  // Verify Firebase ID Token using Google Identity Toolkit
  const apiKey = env.FIREBASE_WEB_API_KEY || "AIzaSyBpnE2w32levmkDgKicxjYzg7W5nBeu_Po";
  const verifyRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    }
  );
  
  const verifyData = await verifyRes.json() as any;

  if (!verifyData.users || verifyData.users.length === 0) {
    recordFailedAttempt(clientIp);
    return jsonError("Invalid ID token.", 401);
  }

  const email = verifyData.users[0].email;

  // Look up user — must exist with admin or super-admin role
  const user = await env.DB.prepare(
    "SELECT id, email, role FROM users WHERE LOWER(email) = LOWER(?) AND role IN ('admin', 'super-admin')"
  ).bind(email).first<{ id: string; email: string; role: string }>();

  if (!user) {
    recordFailedAttempt(clientIp);
    return jsonError("Not authorized as admin.", 403);
  }

  const token = generateToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  await env.DB.prepare(
    "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)"
  ).bind(`session:${token}`, JSON.stringify({ userId: user.id, email: user.email, role: user.role, expiresAt, loginIp: clientIp })).run();

  clearRateLimit(clientIp);
  return corsResponse({ token, user: { id: user.id, email: user.email, role: user.role } });
}

// POST /api/auth/logout
async function logout(req: Request, env: Env): Promise<Response> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await env.DB.prepare("DELETE FROM config WHERE key = ?").bind(`session:${token}`).run();
  }
  return corsResponse({ success: true });
}

// GET /api/auth/me — get current session user
async function getMe(req: Request, env: Env): Promise<Response> {
  const auth = await verifyAuth(req, env);
  if (!auth) return jsonError("Not authenticated.", 401);
  return corsResponse({ userId: auth.userId, email: auth.email, role: auth.role });
}

// DELETE /api/admin/sessions/:token — revoke a specific session (admin only)
async function revokeSession(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  await env.DB.prepare("DELETE FROM config WHERE key = ?").bind(`session:${params.token}`).run();
  return corsResponse({ success: true });
}

// DELETE /api/admin/sessions — revoke all sessions for current user (except their own)
async function revokeAllSessions(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  const auth = await verifyAuth(req, env);
  if (!auth) return jsonError("Unauthorized.", 401);
  const authHeader = req.headers.get("Authorization");
  const currentToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  // Delete all sessions for this user that aren't the current one
  const { results } = await env.DB.prepare("SELECT key FROM config WHERE key LIKE 'session:%'").all();
  const batch: any[] = [];
  for (const row of results) {
    const key = (row as any).key;
    try {
      const data = JSON.parse((row as any).value);
      if (data.userId === auth.userId && key !== `session:${currentToken}`) {
        batch.push(env.DB.prepare("DELETE FROM config WHERE key = ?").bind(key));
      }
    } catch (_) {}
  }
  if (batch.length > 0) await env.DB.batch(batch);
  return corsResponse({ success: true, revoked: batch.length });
}

async function verifyAuth(req: Request, env: Env): Promise<{ userId: string; email: string; role: string } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    recordFailedAttempt(getClientIp(req));
    return null;
  }

  const token = authHeader.slice(7);
  const session = await env.DB.prepare(
    "SELECT value FROM config WHERE key = ?"
  ).bind(`session:${token}`).first<{ value: string }>();

  if (!session) {
    recordFailedAttempt(getClientIp(req));
    return null;
  }

  const data = JSON.parse(session.value);
  if (data.expiresAt < Date.now()) {
    recordFailedAttempt(getClientIp(req));
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
    colorCodes: JSON.parse(p.colorCodes || "{}"),
    specifications: JSON.parse(p.specifications || "{}"),
    variants: (() => { try { const v = JSON.parse(p.variants || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } })(),
  }));

  // Fetch all variant images
  const { results: variantImages } = await env.DB.prepare(
    "SELECT * FROM product_variant_images ORDER BY productId, storage, color, sortOrder"
  ).all();
  const variantImageMap: Record<string, any[]> = {};
  for (const vi of variantImages) {
    const v = vi as any;
    const key = `${v.productId}|${v.storage}|${v.color}`;
    if (!variantImageMap[key]) variantImageMap[key] = [];
    variantImageMap[key].push({ id: v.id, imageUrl: v.imageUrl, sortOrder: v.sortOrder });
  }

  // Attach variant images keyed by "storage|color" onto each product
  for (const prod of products) {
    const byVariantKey: Record<string, any[]> = {};
    for (const [key, imgs] of Object.entries(variantImageMap)) {
      const [, storage, color] = key.split("|");
      const mapKey = storage && color ? `${storage}|${color}` : "base";
      byVariantKey[mapKey] = imgs as any[];
    }
    (prod as any).variantImages = byVariantKey;
  }
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
  const data = await jsonBody<Record<string, any>>(req);
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
  const itemsList = (data.items || [])
    .map((item: any) => `  • ${item.name}${item.quantity > 1 ? ` (x${item.quantity})` : ""}${item.selectedColor ? ` [${item.selectedColor}]` : ""}${item.selectedStorage ? ` (${item.selectedStorage})` : ""}`)
    .join("\n");

  // Fetch WhatsApp notification settings from config
  let whatsappSettings: { enabled?: boolean; sendToAdmin?: boolean; sendToCustomer?: boolean } = {};
  try {
    const waEnabledRow = await env.DB.prepare(
      "SELECT value FROM config WHERE key = 'whatsappEnabled'"
    ).first<{ value: string }>();
    const waAdminRow = await env.DB.prepare(
      "SELECT value FROM config WHERE key = 'whatsappSendToAdmin'"
    ).first<{ value: string }>();
    const waCustomerRow = await env.DB.prepare(
      "SELECT value FROM config WHERE key = 'whatsappSendToCustomer'"
    ).first<{ value: string }>();
    const waAdminNumRow = await env.DB.prepare(
      "SELECT value FROM config WHERE key = 'whatsappAdminNumber'"
    ).first<{ value: string }>();
    whatsappSettings = {
      enabled: waEnabledRow ? waEnabledRow.value === "true" : true,
      sendToAdmin: waAdminRow ? waAdminRow.value === "true" : true,
      sendToCustomer: waCustomerRow ? waCustomerRow.value === "true" : true,
    };
    // If admin number is set in config, override env var
    if (waAdminNumRow?.value) {
      (env as any).WHATSAPP_ADMIN_NOTIFY_NUMBER = waAdminNumRow.value;
    }
  } catch (_) {}

  // Send real WhatsApp messages to admin and customer (if enabled)
  await notifyOrderViaWhatsApp({
    customerName: customer.fullName || "Customer",
    customerPhone: customer.phone || "",
    orderId: id,
    total: data.total || 0,
    totalKsh: data.totalKsh || 0,
    items: itemsList,
    shippingMethod: data.shippingMethod || "Standard",
  }, env, whatsappSettings);

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
  // Inject WhatsApp credential status flags for the admin panel UI
  config._waTokenSet = !!env.WHATSAPP_ACCESS_TOKEN;
  config._waPhoneSet = !!env.WHATSAPP_PHONE_NUMBER_ID;
  config._waAdminSet = !!env.WHATSAPP_ADMIN_NOTIFY_NUMBER;
  return corsResponse(config);
}

// PUT /api/admin/config
async function updateConfig(req: Request, env: Env): Promise<Response> {
  const data = await jsonBody(req);
  const batch: any[] = [];
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
  const data = await jsonBody(req);
  const batch: any[] = [];
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
  return corsResponse(results.map((m: any) => ({ ...m, enabled: !!m.enabled, locations: JSON.parse(m.locations || "[]") })));
}

// POST /api/admin/delivery-methods
async function createDeliveryMethod(req: Request, env: Env): Promise<Response> {
  const data = await jsonBody(req);
  const id = data.id || generateId("del");
  await env.DB.prepare(
    `INSERT INTO delivery_methods (id, name, price, transitDays, carrier, enabled, description, locations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, data.name, data.price || 0, data.transitDays || "", data.carrier || "", data.enabled ? 1 : 1, data.description || "", JSON.stringify(data.locations || [])).run();
  return corsResponse({ id, ...data }, 201);
}

// PUT /api/admin/delivery-methods/:id
async function updateDeliveryMethod(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const data = await jsonBody(req);
  const fields: string[] = [];
  const values: any[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.price !== undefined) { fields.push("price = ?"); values.push(data.price); }
  if (data.transitDays !== undefined) { fields.push("transitDays = ?"); values.push(data.transitDays); }
  if (data.carrier !== undefined) { fields.push("carrier = ?"); values.push(data.carrier); }
  if (data.enabled !== undefined) { fields.push("enabled = ?"); values.push(data.enabled ? 1 : 0); }
  if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
  if (data.locations !== undefined) { fields.push("locations = ?"); values.push(JSON.stringify(data.locations)); }
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
  const { name, email, subject, message } = await jsonBody<{ name?: string; email?: string; subject?: string; message?: string }>(req);
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
  const { status } = await jsonBody<{ status?: string }>(req);
  await env.DB.prepare("UPDATE support_requests SET status = ? WHERE id = ?").bind(status, params.id).run();
  return corsResponse({ id: params.id, status });
}

// POST /api/price-trackers
async function createPriceTracker(req: Request, env: Env): Promise<Response> {
  const { productId, email, initialPrice, initialPriceKsh } = await jsonBody<{ productId?: string; email?: string; initialPrice?: number; initialPriceKsh?: number }>(req);
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
      categorySales[category as string] = (categorySales[category as string] || 0) + (item.price * item.quantity);
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
  const data = await jsonBody(req);
  const id = data.id || generateId("product");
  await env.DB.prepare(
    `INSERT INTO products (id, name, price, priceKsh, description, category, brand, image, colors, storages, rating, reviewsCount, inStock, isNew, isBestSeller, specifications, colorImages, colorCodes, variants)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, data.name || "", data.price || 0, data.priceKsh || 0, data.description || "", data.category || "",
    data.brand || "", data.image || "", JSON.stringify(data.colors || []), JSON.stringify(data.storages || []),
    data.rating || 0, data.reviewsCount || 0, data.inStock ? 1 : 0, data.isNew ? 1 : 0, data.isBestSeller ? 1 : 0,
    JSON.stringify(data.specifications || {}), JSON.stringify(data.colorImages || {}), JSON.stringify(data.colorCodes || {}), JSON.stringify(data.variants || [])).run();
  return corsResponse({ id, ...data }, 201);
}

// GET /api/admin/products/:id
async function getAdminProduct(_req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const row = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(params.id).first() as any;
  if (!row) return jsonError("Product not found", 404);

  const product = {
    ...row,
    inStock: !!row.inStock,
    isNew: !!row.isNew,
    isBestSeller: !!row.isBestSeller,
    colors: JSON.parse(row.colors || "[]"),
    storages: JSON.parse(row.storages || "[]"),
    colorImages: JSON.parse(row.colorImages || "{}"),
    colorCodes: JSON.parse(row.colorCodes || "{}"),
    specifications: JSON.parse(row.specifications || "{}"),
    variants: (() => { try { const v = JSON.parse(row.variants || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } })(),
  };

  // Attach variant images
  const { results: variantImages } = await env.DB.prepare(
    "SELECT * FROM product_variant_images WHERE productId = ? ORDER BY storage, color, sortOrder"
  ).bind(params.id).all();
  const byVariantKey: Record<string, any[]> = {};
  for (const vi of variantImages) {
    const v = vi as any;
    const key = v.storage && v.color ? `${v.storage}|${v.color}` : "base";
    if (!byVariantKey[key]) byVariantKey[key] = [];
    byVariantKey[key].push({ id: v.id, imageUrl: v.imageUrl, sortOrder: v.sortOrder });
  }
  (product as any).variantImages = byVariantKey;

  return corsResponse(product);
}

// PUT /api/admin/products/:id
async function updateProduct(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const data = await jsonBody(req);
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
  if (data.colorCodes !== undefined) { fields.push("colorCodes = ?"); values.push(JSON.stringify(data.colorCodes)); }
  if (data.specifications !== undefined) { fields.push("specifications = ?"); values.push(JSON.stringify(data.specifications)); }
  if (data.variants !== undefined) { fields.push("variants = ?"); values.push(JSON.stringify(data.variants)); }
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
    colorCodes: JSON.parse((updated as any).colorCodes || "{}"),
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
  const { status, notes } = await jsonBody<{ status?: string; notes?: string }>(req);
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
  const { deliveryMethodId, trackingNumber, notes } = await jsonBody<{ deliveryMethodId?: string; trackingNumber?: string; notes?: string }>(req);
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

// DELETE /api/admin/orders/:id
async function deleteOrder(_req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const result = await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(params.id).run();
  if (result.meta?.changes === 0) return jsonError("Order not found", 404);
  return corsResponse({ success: true, id: params.id });
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
  const data = await jsonBody(req);
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
  const data = await jsonBody(req);
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
  const { author, rating, title, content, source } = await jsonBody<{ author?: string; rating?: number; title?: string; content?: string; source?: string }>(req);
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
  const data = await jsonBody(req);
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

  const { topic, category, location, keywords } = await jsonBody<{ topic?: string; category?: string; location?: string; keywords?: string }>(req);

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

  const { reportType } = await jsonBody<{ reportType?: string }>(req);

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
  const { url } = await jsonBody<{ url?: string }>(req);
  if (!url) return jsonError("Product URL is required");

  const normalizedUrl = url.toLowerCase();
  let name = "", priceKsh = 0, description = "", category = "Phones", brand = "Apple", image = "";
  let specifications: Record<string, string> = {};

  if (normalizedUrl.includes("iphone-15")) {
    name = "Apple iPhone 15 Pro Max (Titanium)"; priceKsh = 167700; brand = "Apple";
    image = "";
    description = "Elite aerospace titanium design with custom Action button, M17 Pro cinematic processing core.";
    specifications = { "Chipset": "Apple A17 Pro (3nm)", "Screen": "6.7 inch Super Retina XDR OLED" };
  } else if (normalizedUrl.includes("s24-ultra") || normalizedUrl.includes("samsung")) {
    name = "Samsung Galaxy S24 Ultra"; priceKsh = 154700; brand = "Samsung";
    image = "";
    description = "Powered by Galaxy AI with 200MP Quad Telephoto camera system.";
    specifications = { "Chipset": "Snapdragon 8 Gen 3", "Screen": "6.8 inch Dynamic AMOLED 2X" };
  } else {
    let parsedName = url.replace(/https?:\/\/(www\.)?/, "").replace(/\.(com|co\.ke|org|net|ke)/, "").split("/").filter(Boolean).pop() || "Gadget";
    name = parsedName.replace(/[-_]+/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    priceKsh = 85000;
    image = "";
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
    { id: "pp-iphone-15-pro-max", name: "iPhone 15 Pro Max (Titanium)", price: 1290, priceKsh: 167700, category: "Phones", brand: "Apple", image: "", rating: 4.9, reviewsCount: 342, description: "Official listing from PhonePlace Kenya." },
    { id: "pp-samsung-s24-ultra", name: "Samsung Galaxy S24 Ultra", price: 1190, priceKsh: 154700, category: "Phones", brand: "Samsung", image: "", rating: 4.8, reviewsCount: 219, description: "Official listing from PhonePlace Kenya." },
    { id: "is-macbook-pro-16", name: "MacBook Pro 16 M3 Max", price: 3290, priceKsh: 427700, category: "Laptops", brand: "Apple", image: "", rating: 4.9, reviewsCount: 184, description: "Official listing from iStreet Kenya." }
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

// GET /api/admin/product-variant-images?productId=xxx
async function getProductVariantImages(_req: Request, env: Env): Promise<Response> {
  const url = new URL(_req.url);
  const productId = url.searchParams.get("productId");
  let query = "SELECT * FROM product_variant_images";
  const bindings: string[] = [];
  if (productId) {
    query += " WHERE productId = ?";
    bindings.push(productId);
  }
  query += " ORDER BY productId, storage, color, sortOrder";
  const { results } = await env.DB.prepare(query).bind(...bindings).all();
  return corsResponse(results.map((r: any) => ({ ...r, sortOrder: r.sortOrder || 0 })));
}

// POST /api/admin/product-variant-images
async function createProductVariantImage(req: Request, env: Env): Promise<Response> {
  const { productId, storage, color, imageUrl, sortOrder } = await jsonBody<{ productId?: string; storage?: string; color?: string; imageUrl?: string; sortOrder?: number }>(req);
  if (!productId || !imageUrl) return jsonError("productId and imageUrl are required");
  const id = generateId("pvi");
  await env.DB.prepare(
    `INSERT INTO product_variant_images (id, productId, storage, color, imageUrl, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, productId, storage || "", color || "", imageUrl, sortOrder || 0).run();
  return corsResponse({ id, productId, storage: storage || "", color: color || "", imageUrl, sortOrder: sortOrder || 0 }, 201);
}

// PUT /api/admin/product-variant-images/:id
async function updateProductVariantImage(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const { imageUrl, sortOrder } = await jsonBody<{ imageUrl?: string; sortOrder?: number }>(req);
  const fields: string[] = [];
  const values: any[] = [];
  if (imageUrl !== undefined) { fields.push("imageUrl = ?"); values.push(imageUrl); }
  if (sortOrder !== undefined) { fields.push("sortOrder = ?"); values.push(sortOrder); }
  if (fields.length === 0) return jsonError("No fields to update");
  values.push(params.id);
  await env.DB.prepare(`UPDATE product_variant_images SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  const updated = await env.DB.prepare("SELECT * FROM product_variant_images WHERE id = ?").bind(params.id).first();
  return corsResponse(updated);
}

// DELETE /api/admin/product-variant-images/:id
async function deleteProductVariantImage(_req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const result = await env.DB.prepare("DELETE FROM product_variant_images WHERE id = ?").bind(params.id).run();
  if (result.meta?.changes === 0) return jsonError("Image not found", 404);
  return corsResponse({ success: true, id: params.id });
}

// PUT /api/admin/products/:id/variants — bulk update variants array (price, stock, storage, color)
async function updateProductVariants(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const { variants } = await jsonBody<{ variants?: any }>(req);
  if (!Array.isArray(variants)) return jsonError("variants must be an array");
  await env.DB.prepare(
    "UPDATE products SET variants = ?, updatedAt = ? WHERE id = ?"
  ).bind(JSON.stringify(variants), now(), params.id).run();
  const updated = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(params.id).first();
  return corsResponse(updated ? {
    ...updated,
    colors: JSON.parse((updated as any).colors || "[]"),
    storages: JSON.parse((updated as any).storages || "[]"),
    variants: (() => { try { const v = JSON.parse((updated as any).variants || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } })(),
  } : null);
}

// POST /api/admin/product-variant-images/bulk-delete — delete multiple images by ids
async function bulkDeleteVariantImages(req: Request, env: Env): Promise<Response> {
  const { ids } = await jsonBody<{ ids?: string[] }>(req);
  if (!Array.isArray(ids) || ids.length === 0) return jsonError("ids array is required");
  const placeholders = ids.map(() => "?").join(",");
  const result = await env.DB.prepare(
    `DELETE FROM product_variant_images WHERE id IN (${placeholders})`
  ).bind(...ids).run();
  return corsResponse({ success: true, deleted: result.meta?.changes || 0 });
}

// PUT /api/admin/products/:id/variant-stock — update stock (and optionally price) for specific storage+color combos
async function updateProductVariantStock(req: Request, env: Env, _ctx: ExecutionContext, params: Record<string, string>): Promise<Response> {
  const { updates } = await jsonBody<{ updates?: Record<string, any> }>(req);
  if (!Array.isArray(updates)) return jsonError("updates must be an array of {storage, color, stock?, priceKsh?}");
  const product = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(params.id).first() as any;
  if (!product) return jsonError("Product not found", 404);
  const variants = (() => { try { const v = JSON.parse(product.variants || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } })();
  for (const upd of updates) {
    const idx = variants.findIndex(
      (v: any) => v.storage.toLowerCase() === (upd.storage || "").toLowerCase() &&
                  v.color.toLowerCase() === (upd.color || "").toLowerCase()
    );
    if (idx > -1) {
      if (upd.stock !== undefined) variants[idx].stock = upd.stock;
      if (upd.priceKsh !== undefined) variants[idx].priceKsh = upd.priceKsh;
    }
  }
  await env.DB.prepare(
    "UPDATE products SET variants = ?, updatedAt = ? WHERE id = ?"
  ).bind(JSON.stringify(variants), now(), params.id).run();
  return corsResponse({ success: true, variants });
}

// ─── SITEMAP & SEO ───────────────────────────────────────────
async function generateSitemap(env: Env): Promise<Response> {
  await seedDatabase(env.DB);
  const SITE_URL = "https://axontech.co.ke";
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
  route("POST", "/api/auth/firebase-login", firebaseLogin),
  route("POST", "/api/auth/logout", logout),
  route("GET", "/api/auth/me", getMe),

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
  route("GET", "/api/admin/products/:id", getAdminProduct),
  route("PUT", "/api/admin/products/:id", updateProduct),
  route("DELETE", "/api/admin/products/:id", deleteProduct),
  route("PUT", "/api/admin/orders/:id/status", updateOrderStatus),
  route("POST", "/api/admin/orders/:id/dispatch", dispatchOrder),
  route("DELETE", "/api/admin/orders/:id", deleteOrder),
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
  route("GET", "/api/admin/product-variant-images", getProductVariantImages),
  route("POST", "/api/admin/product-variant-images", createProductVariantImage),
  route("PUT", "/api/admin/product-variant-images/:id", updateProductVariantImage),
  route("DELETE", "/api/admin/product-variant-images/:id", deleteProductVariantImage),
  route("POST", "/api/admin/product-variant-images/bulk-delete", bulkDeleteVariantImages),
  route("PUT", "/api/admin/products/:id/variants", updateProductVariants),
  route("PUT", "/api/admin/products/:id/variant-stock", updateProductVariantStock),
  route("DELETE", "/api/admin/sessions/:token", revokeSession),
  route("DELETE", "/api/admin/sessions", revokeAllSessions),
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
      const isAdmin = url.pathname.startsWith("/api/admin/");

      // Security check: rate limiting + IP allowlist + API key
      const securityBlock = verifyRequestSecurity(req, env, isAdmin);
      if (securityBlock) return securityBlock;

      // Admin routes: require valid session auth
      if (isAdmin) {
        const auth = await verifyAuth(req, env);
        if (!auth) return jsonError("Unauthorized.", 401);
      }

      const matched = matchRoute(routes, req);
      if (matched) {
        try {
          return await matched.handler(req, env, ctx, matched.params);
        } catch (err) {
          console.error("[ROUTE ERROR]", url.pathname, sanitizeError(err));
          return jsonError("An internal error occurred.", 500);
        }
      }
      return jsonError("Not found", 404);
    }

    return corsResponse({ status: "ok", service: "axon-tech-api" });
  },
};
