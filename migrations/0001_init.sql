-- AXON TECH D1 Schema
-- Fully normalized for scalability

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL DEFAULT 0,
  priceKsh REAL DEFAULT 0,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  brand TEXT DEFAULT '',
  image TEXT DEFAULT '',
  colors TEXT DEFAULT '[]',          -- JSON array
  storages TEXT DEFAULT '[]',        -- JSON array
  rating REAL DEFAULT 0,
  reviewsCount INTEGER DEFAULT 0,
  inStock INTEGER DEFAULT 1,         -- boolean
  isNew INTEGER DEFAULT 0,           -- boolean
  isBestSeller INTEGER DEFAULT 0,    -- boolean
  specifications TEXT DEFAULT '{}',  -- JSON object
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Product reviews (normalized from product.reviews)
CREATE TABLE IF NOT EXISTS product_reviews (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  date TEXT DEFAULT '',
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  author TEXT DEFAULT '',
  verified INTEGER DEFAULT 0,        -- boolean
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  customer TEXT DEFAULT '{}',        -- JSON: {fullName, email, address, city, state, zipCode, phone}
  shippingMethod TEXT DEFAULT '',
  shippingCost REAL DEFAULT 0,
  subtotal REAL DEFAULT 0,
  discountAmount REAL DEFAULT 0,
  discountPercentage REAL DEFAULT 0,
  taxes REAL DEFAULT 0,
  total REAL DEFAULT 0,
  totalKsh REAL DEFAULT 0,
  totalUsd REAL DEFAULT 0,
  hasKsh INTEGER DEFAULT 0,          -- boolean
  payment TEXT DEFAULT '{}',         -- JSON: {lastFour}
  items TEXT DEFAULT '[]',           -- JSON array of {id, name, price, quantity, color}
  history TEXT DEFAULT '[]',         -- JSON array of {status, time, notes}
  shippingMethodName TEXT DEFAULT '',
  shippingCarrier TEXT DEFAULT '',
  shippingTrackingNumber TEXT DEFAULT '',
  shippingDispatchedDate TEXT DEFAULT '',
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Site config (key-value store for complex JSON config)
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL                 -- JSON string
);

-- Contact info
CREATE TABLE IF NOT EXISTS contact (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL                 -- JSON string
);

-- Support requests
CREATE TABLE IF NOT EXISTS support_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Delivery methods
CREATE TABLE IF NOT EXISTS delivery_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL DEFAULT 0,
  transitDays TEXT DEFAULT '',
  carrier TEXT DEFAULT '',
  enabled INTEGER DEFAULT 1,         -- boolean
  description TEXT DEFAULT '',
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  category TEXT DEFAULT '',
  author TEXT DEFAULT '',
  date TEXT NOT NULL,
  tags TEXT DEFAULT '[]',            -- JSON array
  metaTitle TEXT DEFAULT '',
  metaDescription TEXT DEFAULT '',
  contentLocation TEXT DEFAULT '',
  jsonLd TEXT DEFAULT '{}',          -- JSON object
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Google Reviews / Site reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  source TEXT DEFAULT 'website',
  approved INTEGER DEFAULT 1,        -- boolean
  verified INTEGER DEFAULT 0,        -- boolean
  date TEXT NOT NULL,
  deviceInfo TEXT DEFAULT '',
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Price trackers
CREATE TABLE IF NOT EXISTS price_trackers (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  productName TEXT DEFAULT '',
  productImage TEXT DEFAULT '',
  email TEXT NOT NULL,
  initialPrice REAL,
  initialPriceKsh REAL,
  createdAt TEXT NOT NULL,
  status TEXT DEFAULT 'active',      -- 'active' or 'triggered'
  triggeredAt TEXT,
  triggeredPrice REAL,
  triggeredPriceKsh REAL
);

-- WhatsApp notifications
CREATE TABLE IF NOT EXISTS whatsapp_notifications (
  id TEXT PRIMARY KEY,
  orderId TEXT DEFAULT '',
  customerName TEXT DEFAULT '',
  customerPhone TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'sent',
  timestamp TEXT NOT NULL,
  deliveryMethodName TEXT DEFAULT '',
  trackingNumber TEXT DEFAULT '',
  apiLogId TEXT DEFAULT ''
);

-- WhatsApp API logs
CREATE TABLE IF NOT EXISTS whatsapp_api_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  endpoint TEXT DEFAULT '',
  method TEXT DEFAULT 'POST',
  headers TEXT DEFAULT '{}',         -- JSON
  requestPayload TEXT DEFAULT '{}',  -- JSON
  responsePayload TEXT DEFAULT '{}', -- JSON
  status INTEGER DEFAULT 200
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_product_reviews_productId ON product_reviews(productId);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog(slug);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog(category);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_price_trackers_productId ON price_trackers(productId);
CREATE INDEX IF NOT EXISTS idx_price_trackers_email ON price_trackers(email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_orderId ON whatsapp_notifications(orderId);
