/**
 * Route Configuration for SEO-friendly Multi-Page Application
 * 
 * Each route maps to a unique URL that search engines can crawl.
 */

export const ROUTES = {
  home: '/',
  catalog: '/catalog',
  catalogCategory: '/catalog/:category',
  productDetail: '/product/:productId',
  checkout: '/checkout',
  orderConfirmation: '/order/confirmation/:orderId',
  trackOrder: '/track-order',
  trackOrderById: '/track-order/:trackingId',
  contact: '/contact',
  blog: '/blog',
  blogPost: '/blog/:slug',
  admin: '/dev',
} as const;

export type RouteKey = keyof typeof ROUTES;
