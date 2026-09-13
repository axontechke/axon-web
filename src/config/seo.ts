/**
 * SEO & OpenGraph Meta Tag Configuration
 * 
 * Each page defines its own meta tags for search engines and social sharing.
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  ogLocaleAlternate?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonical?: string;
  jsonLd?: object;
}

const SITE_NAME = 'AXON TECH Kenya';
export const SITE_URL = 'https://www.axontech.co.ke';
const DEFAULT_OG_IMAGE = '';

export const SEO_DEFAULTS: SEOConfig = {
  title: `${SITE_NAME} | Premium Living. Smart Tech`,
  description: 'Discover cutting-edge technology hardware from AXON TECH Kenya. Shop premium Iphones, Ipads,Macbooks, Google pixel, samsung, tablets, , Premium Audio Etc',
  keywords: ['technology', 'hardware', 'Kenya', 'Nairobi', 'laptops', 'tablets', 'phones', 'Axon'],
  ogTitle: SITE_NAME,
  ogDescription: 'Your Trusted Technology Partner in Kenya - Premium Hardware & Electronics',
  ogImage: DEFAULT_OG_IMAGE,
  ogType: 'website',
  ogLocaleAlternate: 'en_US',
  twitterCard: 'summary_large_image',
};

export const PAGE_SEO: Record<string, SEOConfig> = {
  home: {
    title: `${SITE_NAME} | Premium Living. Smart Tech`,
    description: 'Discover cutting-edge technology hardware from AXON TECH Kenya. Shop premium Iphones, Ipads,Macbooks, Google pixel, samsung, tablets, , Premium Audio Etc',
    keywords: ['Axon Kenya', 'technology hardware Nairobi', 'premium laptops Kenya', 'tablets Kenya', 'smartphones Nairobi'],
    ogType: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/catalog?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: '',
        description: 'Premium technology hardware store in Nairobi, Kenya.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Simara Mall, Ground Floor, Shop G50',
          addressLocality: 'Nairobi',
          addressCountry: 'KE'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+254-745-017-979',
          contactType: 'customer service',
          availableLanguage: ['English', 'Swahili']
        },
        sameAs: [
          'https://www.instagram.com/axontechke',
          'https://www.facebook.com/axontechke',
          'https://wa.me/254745017979'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: SITE_NAME,
        image: '',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Simara Mall, Ground Floor, Shop G50',
          addressLocality: 'Nairobi',
          addressRegion: 'Nairobi County',
          postalCode: '00100',
          addressCountry: 'KE'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -1.2921,
          longitude: 36.8219
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '18:00'
        },
        priceRange: '$$'
      }
    ]
  },

  catalog: {
    title: `Shop All Products | ${SITE_NAME}`,
    description: 'Browse our complete catalog of premium technology hardware. Tablets, laptops, phones, audio devices, and accessories with fast delivery across Kenya.',
    keywords: ['shop technology Kenya', 'buy laptops Nairobi', 'electronics store Kenya', 'Axon products'],
    ogType: 'website',
  },

  productDetail: {
    title: `Product Details | ${SITE_NAME}`,
    description: 'View product specifications, reviews, and pricing. Free delivery on orders across Kenya.',
    keywords: ['product details', 'specifications', 'reviews', 'pricing'],
    ogType: 'product',
    twitterCard: 'summary_large_image',
  },

  checkout: {
    title: `Secure Checkout | ${SITE_NAME}`,
    description: 'Complete your purchase securely. Multiple payment options available. Free delivery in Nairobi.',
    keywords: ['checkout', 'buy', 'payment', 'secure purchase'],
    ogType: 'website',
  },

  orderConfirmation: {
    title: `Order Confirmed | ${SITE_NAME}`,
    description: 'Your order has been placed successfully. Track your order status anytime.',
    keywords: ['order confirmation', 'order placed', 'tracking'],
    ogType: 'website',
  },

  trackOrder: {
    title: `Track Your Order | ${SITE_NAME}`,
    description: 'Track your AXON order in real-time. Enter your tracking ID to see delivery status.',
    keywords: ['track order', 'delivery status', 'order tracking', 'shipment'],
    ogType: 'website',
  },

  contact: {
    title: `Contact Us | ${SITE_NAME}`,
    description: 'Get in touch with AXON TECH Kenya. Visit us at Simara Mall, Ground Floor, Shop G50, Nairobi. Call +254 745 017979.',
    keywords: ['contact AXON', 'Nairobi technology store', 'customer support Kenya', 'Simara Mall Nairobi'],
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: SITE_NAME,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Simara Mall, Ground Floor, Shop G50',
        addressLocality: 'Nairobi',
        addressCountry: 'KE'
      },
      telephone: '+254745017979',
      email: 'info@axontechke.com'
    }
  },

  blog: {
    title: `Blog & Insights | ${SITE_NAME}`,
    description: 'Read the latest tech news, product reviews, and buying guides from AXON TECH Kenya. Expert advice on laptops, tablets, phones, and accessories.',
    keywords: ['technology blog', 'tech reviews Kenya', 'buying guide', 'product reviews Nairobi'],
    ogType: 'article',
  },

  admin: {
    title: `Admin Dashboard | ${SITE_NAME}`,
    description: 'AXON TECH administration panel.',
    ogType: 'website',
  },
};

/**
 * Generate meta tags HTML string for server-side rendering
 */
export function generateMetaTagsHtml(seo: SEOConfig, pageUrl: string): string {
  const tags: string[] = [];
  
  // Basic meta tags
  tags.push(`<title>${escapeHtml(seo.title)}</title>`);
  tags.push(`<meta name="description" content="${escapeHtml(seo.description)}" />`);
  
  if (seo.keywords?.length) {
    tags.push(`<meta name="keywords" content="${escapeHtml(seo.keywords.join(', '))}" />`);
  }

  // OpenGraph tags
  tags.push(`<meta property="og:title" content="${escapeHtml(seo.ogTitle || seo.title)}" />`);
  tags.push(`<meta property="og:description" content="${escapeHtml(seo.ogDescription || seo.description)}" />`);
  tags.push(`<meta property="og:type" content="${seo.ogType || 'website'}" />`);
  tags.push(`<meta property="og:url" content="${pageUrl}" />`);
  tags.push(`<meta property="og:site_name" content="${SITE_NAME}" />`);
  
  if (seo.ogImage) {
    tags.push(`<meta property="og:image" content="${seo.ogImage}" />`);
    tags.push(`<meta property="og:image:width" content="1200" />`);
    tags.push(`<meta property="og:image:height" content="630" />`);
  }

  if (seo.ogLocaleAlternate) {
    tags.push(`<meta property="og:locale:alternate" content="${seo.ogLocaleAlternate}" />`);
  }

  // Twitter Card tags
  tags.push(`<meta name="twitter:card" content="${seo.twitterCard || 'summary_large_image'}" />`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(seo.ogTitle || seo.title)}" />`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(seo.ogDescription || seo.description)}" />`);
  
  if (seo.ogImage) {
    tags.push(`<meta name="twitter:image" content="${seo.ogImage}" />`);
  }

  // Canonical URL
  if (seo.canonical) {
    tags.push(`<link rel="canonical" href="${seo.canonical}" />`);
  } else {
    tags.push(`<link rel="canonical" href="${pageUrl}" />`);
  }

  // JSON-LD structured data
  if (seo.jsonLd) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>`);
  }

  return tags.join('\n    ');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
