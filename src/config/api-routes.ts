/**
 * Centralized API Routes Configuration
 * 
 * All API endpoints are defined here for easy maintenance and import.
 * Import these in your frontend code instead of hardcoding paths.
 */

const API_BASE = '/api';

export const API_ROUTES = {
  // ==========================================
  // PUBLIC ENDPOINTS (No auth required)
  // ==========================================
  products: {
    list: `${API_BASE}/products`,
  },

  priceTrackers: {
    create: `${API_BASE}/price-trackers`,
  },

  orders: {
    list: `${API_BASE}/orders`,
    create: `${API_BASE}/orders`,
    getByTrackingId: (trackingId: string) => `${API_BASE}/orders/${trackingId}`,
  },

  analytics: {
    get: `${API_BASE}/analytics`,
  },

  config: {
    get: `${API_BASE}/config`,
  },

  contact: {
    get: `${API_BASE}/contact`,
  },

  supportRequests: {
    create: `${API_BASE}/support-requests`,
  },

  deliveryMethods: {
    list: `${API_BASE}/delivery-methods`,
  },

  blog: {
    list: `${API_BASE}/blog`,
    getBySlug: (slug: string) => `${API_BASE}/blog/${slug}`,
  },

  reviews: {
    list: `${API_BASE}/reviews`,
    create: `${API_BASE}/reviews`,
  },

  // ==========================================
  // ADMIN ENDPOINTS (Protected)
  // ==========================================
  admin: {
    priceTrackers: {
      list: `${API_BASE}/admin/price-trackers`,
      delete: (id: string) => `${API_BASE}/admin/price-trackers/${id}`,
    },

    products: {
      create: `${API_BASE}/admin/products`,
      update: (id: string) => `${API_BASE}/admin/products/${id}`,
      delete: (id: string) => `${API_BASE}/admin/products/${id}`,
    },

    scrapeUrl: `${API_BASE}/admin/scrape-url`,
    syncRealtimeProducts: `${API_BASE}/admin/sync-realtime-products`,

    orders: {
      updateStatus: (id: string) => `${API_BASE}/admin/orders/${id}/status`,
      dispatch: (id: string) => `${API_BASE}/admin/orders/${id}/dispatch`,
    },

    config: {
      update: `${API_BASE}/admin/config`,
    },

    contact: {
      update: `${API_BASE}/admin/contact`,
    },

    supportRequests: {
      list: `${API_BASE}/admin/support-requests`,
      update: (id: string) => `${API_BASE}/admin/support-requests/${id}`,
    },

    deliveryMethods: {
      create: `${API_BASE}/admin/delivery-methods`,
      update: (id: string) => `${API_BASE}/admin/delivery-methods/${id}`,
      delete: (id: string) => `${API_BASE}/admin/delivery-methods/${id}`,
    },

    whatsapp: {
      notifications: `${API_BASE}/admin/whatsapp-notifications`,
      apiLogs: `${API_BASE}/admin/whatsapp-api-logs`,
    },

    blog: {
      create: `${API_BASE}/admin/blog`,
      update: (id: string) => `${API_BASE}/admin/blog/${id}`,
      delete: (id: string) => `${API_BASE}/admin/blog/${id}`,
      generate: `${API_BASE}/admin/blog/generate`,
    },

    reviews: {
      list: `${API_BASE}/admin/reviews`,
      update: (id: string) => `${API_BASE}/admin/reviews/${id}`,
      delete: (id: string) => `${API_BASE}/admin/reviews/${id}`,
    },

    reports: {
      generate: `${API_BASE}/admin/reports/generate`,
    },
  },
} as const;

export default API_ROUTES;
