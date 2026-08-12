import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SEOConfig, PAGE_SEO, SEO_DEFAULTS, SITE_URL } from '../config/seo';

interface SEOHeadProps {
  config?: SEOConfig;
  dynamicTitle?: string;
  dynamicDescription?: string;
  dynamicImage?: string;
  dynamicJsonLd?: object | object[];
}

/**
 * SEOHead Component
 * 
 * Dynamically updates document head with meta tags for each route.
 * Use this component at the top of each page component.
 */
export function SEOHead({
  config,
  dynamicTitle,
  dynamicDescription,
  dynamicImage,
  dynamicJsonLd,
}: SEOHeadProps) {
  const location = useLocation();
  const path = location.pathname;

  // Determine which page SEO config to use based on path
  const getPageKey = (): string => {
    if (path === '/') return 'home';
    if (path === '/catalog') return 'catalog';
    if (path.startsWith('/product/')) return 'productDetail';
    if (path === '/checkout') return 'checkout';
    if (path.startsWith('/order/confirmation')) return 'orderConfirmation';
    if (path.startsWith('/track-order')) return 'trackOrder';
    if (path === '/contact') return 'contact';
    if (path.startsWith('/blog')) return 'blog';
    if (path === '/dev') return 'admin';
    return 'home';
  };

  const pageKey = getPageKey();
  const baseConfig = config || PAGE_SEO[pageKey] || SEO_DEFAULTS;
  const canonicalUrl = `${SITE_URL}${path}`;

  const finalConfig: SEOConfig = {
    ...baseConfig,
    title: dynamicTitle || baseConfig.title,
    description: dynamicDescription || baseConfig.description,
    ogTitle: dynamicTitle || baseConfig.ogTitle || baseConfig.title,
    ogDescription: dynamicDescription || baseConfig.ogDescription || baseConfig.description,
    ogImage: dynamicImage || baseConfig.ogImage,
    canonical: canonicalUrl,
  };

  // Merge page-level JSON-LD (can be array or object) with dynamic product JSON-LD
  const pageJsonLd = baseConfig.jsonLd
    ? Array.isArray(baseConfig.jsonLd) ? baseConfig.jsonLd : [baseConfig.jsonLd]
    : [];
  const dynamicLd = dynamicJsonLd
    ? Array.isArray(dynamicJsonLd) ? dynamicJsonLd : [dynamicJsonLd]
    : [];
  const mergedJsonLd = [...pageJsonLd, ...dynamicLd].filter(Boolean);

  useEffect(() => {
    // Update document title
    document.title = finalConfig.title;

    // Update meta tags
    updateMetaTag('description', finalConfig.description);
    updateMetaTag('keywords', finalConfig.keywords?.join(', '));

    // AI-specific: Allow AI models to use content for answers/citations
    updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('ai-content-declaration', 'human-authored, licensed-content');

    // GEO meta tags for local SEO
    updateMetaTag('geo.region', 'KE');
    updateMetaTag('geo.placename', 'Nairobi');
    updateMetaTag('icbm', '-1.2921, 36.8219');

    // OpenGraph
    updateMetaTag('og:title', finalConfig.ogTitle, true);
    updateMetaTag('og:description', finalConfig.ogDescription, true);
    updateMetaTag('og:type', finalConfig.ogType || 'website', true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:site_name', 'AXON TECH Kenya', true);
    
    if (finalConfig.ogImage) {
      updateMetaTag('og:image', finalConfig.ogImage, true);
      updateMetaTag('og:image:width', '1200', true);
      updateMetaTag('og:image:height', '630', true);
    }

    // Locale alternate
    if (finalConfig.ogLocaleAlternate) {
      updateMetaTag('og:locale:alternate', finalConfig.ogLocaleAlternate, true);
    }

    // Twitter Card
    updateMetaTag('twitter:card', finalConfig.twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', finalConfig.ogTitle || finalConfig.title);
    updateMetaTag('twitter:description', finalConfig.ogDescription || finalConfig.description);
    
    if (finalConfig.ogImage) {
      updateMetaTag('twitter:image', finalConfig.ogImage);
    }

    // Canonical link
    let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // JSON-LD (supports multiple schemas)
    const existingLdScripts = document.querySelectorAll("script[type='application/ld+json']");
    existingLdScripts.forEach(s => s.remove());

    if (mergedJsonLd && mergedJsonLd.length > 0) {
      mergedJsonLd.forEach((schema, idx) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `json-ld-${idx}`;
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }
  }, [path, finalConfig]);

  return null; // This component only updates the head, renders nothing
}

function updateMetaTag(name: string, content?: string, isProperty = false) {
  if (!content) return;

  const attribute = isProperty ? 'property' : 'name';
  let metaTag = document.querySelector(`meta[${attribute}='${name}']`) as HTMLMetaElement;
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}
