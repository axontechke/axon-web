import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import { Product, CartItem, Warranty, CURRENCY_SYMBOL } from "./types";
import { ROUTES } from "./config/routes";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { HomeView } from "./components/HomeView";
import { CatalogView } from "./components/CatalogView";
import { ProductDetailView } from "./components/ProductDetailView";
import { CheckoutView } from "./components/CheckoutView";
import { OrderConfirmationView } from "./components/OrderConfirmationView";
import { TrackOrderView } from "./components/TrackOrderView";
import { AdminView } from "./components/AdminView";
import { ContactView } from "./components/ContactView";
import { BlogView } from "./components/BlogView";
import { SEOHead } from "./components/SEOHead";
import { WhatsAppFloatingButton } from "./components/WhatsAppFloatingButton";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { useConfig } from "./context/ConfigContext";
import API_ROUTES from "./config/api-routes";

// Shared app state context
interface AppState {
  products: Product[];
  webConfig: any;
  cart: CartItem[];
  isAdminAuthenticated: boolean;
  couponCode: string;
  discountPercentage: number;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Super Admin Authenticated state — start validating if a token exists
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem("axon_admin_authed") === "true";
    } catch {
      return false;
    }
  });
  const [isAuthValidating, setIsAuthValidating] = useState<boolean>(() => {
    // Start in "validating" state if a token is present (to prevent premature API calls)
    try {
      return localStorage.getItem("axon_admin_token") !== null;
    } catch {
      return false;
    }
  });
  
  // App data from ConfigContext (stale-while-revalidate cache)
  const { products, config: webConfig, refetch: fetchProductsAndConfig } = useConfig();

  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Reset brand filter whenever category changes
  useEffect(() => {
    setSelectedBrand("All");
  }, [selectedCategory]);

  // Cart persistence state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("axon_cart");
      if (!saved) return [];
      const parsed: CartItem[] = JSON.parse(saved);
      // Filter out legacy/stale items that lack a product wrapper
      return parsed.filter((item): item is CartItem =>
        item != null && item.product != null && typeof (item.product as any).id === "string"
      );
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Promo code discounts
  const [couponCode, setCouponCode] = useState<string>(() => {
    return localStorage.getItem("axon_coupon_code") || "";
  });
  const [discountPercentage, setDiscountPercentage] = useState<number>(() => {
    const saved = localStorage.getItem("axon_discount_percent");
    return saved ? Number(saved) : 0;
  });

  // Successful Order state
  const [completedOrderDetails, setCompletedOrderDetails] = useState<any>(null);

  // Dark Mode State and Persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("axon_dark_mode");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("axon_dark_mode", String(isDarkMode));
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  // Synchronize cart changes with localStorage
  useEffect(() => {
    localStorage.setItem("axon_cart", JSON.stringify(cart));
  }, [cart]);

  // Synchronize discount states
  useEffect(() => {
    localStorage.setItem("axon_coupon_code", couponCode);
    localStorage.setItem("axon_discount_percent", String(discountPercentage));
  }, [couponCode, discountPercentage]);

  // Cart actions — include SIM type so newly added SIM types persist through cart/checkout and don't merge across variants
  const handleAddToCart = (product: Product, quantity: number, selectedColor?: string, selectedStorage?: string, selectedWarranty?: Warranty, selectedSimType?: string) => {
    const getDefaultColor = () => {
      if (!product.colors?.length) return undefined;
      const first = product.colors[0];
      return typeof first === 'string' ? first : (first as any).name;
    };
    const color = selectedColor || getDefaultColor();
    const storage = selectedStorage || (product.storages ? product.storages[0] : undefined);
    const warranty = selectedWarranty || (product.warranties && product.warranties.length > 0 ? product.warranties[0] : undefined);
    // Fallback SIM: variant first simType or product-level simType — ensures newly added single SIM still persists
    const simType = selectedSimType || (product.storageVariants?.[0]?.simType as string | undefined) || product.simType || undefined;

    // Compute dynamic price from ProductVariant[] (storage + color match) and StorageVariant price
    let dynamicPriceKsh = product.priceKsh;
    // Prefer storageVariant price when selection matches
    if (product.storageVariants && storage) {
      const svMatch = product.storageVariants.find(sv => sv.storage.toLowerCase() === storage.toLowerCase() && (!simType || sv.simType === simType));
      if (svMatch?.priceKsh != null) dynamicPriceKsh = svMatch.priceKsh;
    }
    if (dynamicPriceKsh === product.priceKsh && product.variants && storage && color) {
      const match = product.variants.find(
        v => v.storage.toLowerCase() === storage.toLowerCase() &&
             v.color.toLowerCase() === color.toLowerCase()
      );
      if (match?.priceKsh) dynamicPriceKsh = match.priceKsh;
    }

    // Create a price-adjusted product copy for the cart
    const cartProduct = {
      ...product,
      priceKsh: dynamicPriceKsh ?? product.priceKsh,
    };

    setCart((prevCart) => {
      const matchIdx = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === color &&
          item.selectedStorage === storage &&
          item.selectedWarranty?.id === warranty?.id &&
          (item.selectedSimType || undefined) === (simType || undefined)
      );

      if (matchIdx > -1) {
        const updated = [...prevCart];
        updated[matchIdx].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product: cartProduct, quantity, selectedColor: color, selectedStorage: storage, selectedWarranty: warranty, selectedSimType: simType }];
      }
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, color?: string, storage?: string, warrantyId?: string, simType?: string) => {
    if (quantity <= 0) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedColor === color && item.selectedStorage === storage && item.selectedWarranty?.id === warrantyId && (item.selectedSimType || undefined) === (simType || undefined)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string, color?: string, storage?: string, warrantyId?: string, simType?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.product.id === productId && item.selectedColor === color && item.selectedStorage === storage && item.selectedWarranty?.id === warrantyId && (item.selectedSimType || undefined) === (simType || undefined))
      )
    );
  };

  const handleSelectProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleNavigateToCatalog = (category?: string, brand?: string) => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("All");
    }
    setSelectedBrand(brand || "All");
    navigate(ROUTES.catalog);
  };

  const handleCheckoutNav = () => {
    setIsCartOpen(false);
    navigate(ROUTES.checkout);
  };

  const handlePlaceOrderSuccess = async (orderDetails: any) => {
    try {
      const response = await fetch(API_ROUTES.orders.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderDetails,
          items: cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            priceKsh: item.product.priceKsh,
            quantity: item.quantity,
            color: item.selectedColor,
            storage: item.selectedStorage,
            simType: item.selectedSimType || undefined,
            warranty: item.selectedWarranty ? `${item.selectedWarranty.name} (${item.selectedWarranty.duration})` : undefined,
            image: item.product.image
          }))
        })
      });

      if (response.ok) {
        const savedOrder = await response.json();
        setCompletedOrderDetails(savedOrder);
        setCart([]);
        navigate(`/order/confirmation/${savedOrder.id}`);
      } else {
        throw new Error("API responded with an error");
      }
    } catch (err) {
      console.error("Order database sync failure, fallback locally", err);
      const fallbackOrder = {
        ...orderDetails,
        id: "AXN-" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toISOString(),
        items: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          priceKsh: item.product.priceKsh,
          quantity: item.quantity,
          color: item.selectedColor,
          storage: item.selectedStorage,
          simType: item.selectedSimType || undefined,
          warranty: item.selectedWarranty ? `${item.selectedWarranty.name} (${item.selectedWarranty.duration})` : undefined,
          image: item.product.image
        }))
      };
      setCompletedOrderDetails(fallbackOrder);
      setCart([]);
      navigate(`/order/confirmation/${fallbackOrder.id}`);
    }
  };

  // Cart Badge count
  const cartBadgeCount = cart.reduce((acc, item) => acc + item.quantity, 0);


  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col justify-between" id="app-wrapper">
      
      {/* Dynamic Announcement Banner */}
      {webConfig?.showAnnouncement && webConfig?.announcement && (
        <div className="bg-primary text-white text-center py-2 px-4 text-xs font-semibold tracking-wide shadow-sm animate-pulse" id="global-announcement-banner">
          {webConfig.announcement}
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentScreen={location.pathname}
        setScreen={(screen) => navigate(`/${screen.toLowerCase()}`)}
        cartCount={cartBadgeCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminLogout={() => {
          setIsAdminAuthenticated(false);
          try {
            localStorage.removeItem("axon_admin_authed");
          } catch (e) {
            console.error(e);
          }
        }}
        products={products}
        config={webConfig}
      />

      {/* Slideout Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckoutNav}
        onExploreCatalog={() => {
          setIsCartOpen(false);
          navigate(ROUTES.catalog);
        }}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        discountPercentage={discountPercentage}
        setDiscountPercentage={setDiscountPercentage}
      />

      {/* Routes */}
      <main className="flex-1 py-6 md:py-10">
        <Routes>
          <Route 
            path={ROUTES.home} 
            element={
              <>
                <SEOHead />
                <HomeView
                  onSelectProduct={handleSelectProduct}
                  onNavigateToCatalog={handleNavigateToCatalog}
                  onAddToCart={(product, qty) => handleAddToCart(product, qty)}
                  products={products}
                  config={webConfig}
                />
              </>
            } 
          />
          
          <Route 
            path={ROUTES.catalog} 
            element={
              <>
                <SEOHead />
                <CatalogView
                  onSelectProduct={handleSelectProduct}
                  onAddToCart={(product, qty) => handleAddToCart(product, qty)}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedBrand={selectedBrand}
                  setSelectedBrand={setSelectedBrand}
                  products={products}
                  config={webConfig}
                />
              </>
            } 
          />

          <Route 
            path={ROUTES.productDetail} 
            element={
              <ProductDetailRoute 
                products={products}
                onAddToCart={handleAddToCart}
                onBackToCatalog={() => navigate(ROUTES.catalog)}
                onSelectProduct={handleSelectProduct}
              />
            } 
          />

          <Route 
            path={ROUTES.checkout} 
            element={
              <>
                <SEOHead />
                <CheckoutView
                  cart={cart}
                  discountPercentage={discountPercentage}
                  onPlaceOrder={handlePlaceOrderSuccess}
                  onBackToCart={() => {
                    navigate(ROUTES.catalog);
                    setIsCartOpen(true);
                  }}
                  config={webConfig}
                />
              </>
            } 
          />

          <Route 
            path={ROUTES.orderConfirmation} 
            element={
              <OrderConfirmationRoute 
                orderDetails={completedOrderDetails}
                orderId={completedOrderDetails?.id}
                config={webConfig}
                onReturnHome={() => {
                  setCompletedOrderDetails(null);
                  navigate(ROUTES.home);
                }}
              />
            } 
          />

          <Route 
            path={ROUTES.trackOrder} 
            element={
              <>
                <SEOHead />
                <TrackOrderView
                  onBackToShopping={() => navigate(ROUTES.catalog)}
                  onSelectProductById={(productId) => {
                    const prod = products.find((p) => p.id === productId);
                    if (prod) {
                      handleSelectProduct(prod);
                    }
                  }}
                />
              </>
            } 
          />

          <Route 
            path={ROUTES.trackOrderById} 
            element={
              <>
                <SEOHead />
                <TrackOrderView
                  onBackToShopping={() => navigate(ROUTES.catalog)}
                  onSelectProductById={(productId) => {
                    const prod = products.find((p) => p.id === productId);
                    if (prod) {
                      handleSelectProduct(prod);
                    }
                  }}
                />
              </>
            } 
          />

          <Route 
            path={ROUTES.contact} 
            element={
              <>
                <SEOHead />
                <ContactView />
              </>
            } 
          />

          <Route 
            path={ROUTES.blog} 
            element={
              <>
                <SEOHead />
                <BlogView />
              </>
            } 
          />

          <Route 
            path={ROUTES.blogPost} 
            element={
              <>
                <SEOHead />
                <BlogView />
              </>
            } 
          />

          <Route
            path={ROUTES.admin}
            element={
              <AdminView
                onSelectProduct={handleSelectProduct}
                onRefreshProducts={fetchProductsAndConfig}
                isAdminAuthenticated={isAdminAuthenticated}
                setIsAdminAuthenticated={setIsAdminAuthenticated}
                onViewWeb={() => navigate(ROUTES.home)}
                isAuthValidating={isAuthValidating}
                setIsAuthValidating={setIsAuthValidating}
              />
            }
          />

          {/* Redirect /home to / */}
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Redirect /trackorder variant to /track-order */}
          <Route path="/trackorder" element={<Navigate to={ROUTES.trackOrder} replace />} />

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="text-8xl md:text-9xl font-black text-outline/20 font-display mb-4">404</div>
                <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">Page Not Found</h1>
                <p className="text-on-surface-variant mb-8 max-w-md">
                  Sorry, we couldn't find the page you're looking for. It may have moved or no longer exists.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(ROUTES.home)}
                    className="px-6 py-3 bg-primary text-on-primary font-semibold rounded-full hover:bg-primary/90 transition-colors"
                  >
                    Go Home
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.catalog)}
                    className="px-6 py-3 bg-surface-container-high text-on-surface font-semibold rounded-full hover:bg-surface-container-high/80 transition-colors"
                  >
                    Browse Catalog
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Consistent Footer */}
      <Footer onNavigate={(screen) => navigate(`/${screen.toLowerCase()}`)} config={webConfig} />

      {/* Back to Admin Floating Button (Visible on Web when Auth'd) */}
      {isAdminAuthenticated && location.pathname !== ROUTES.admin && (
        <button
          onClick={() => navigate(ROUTES.admin)}
          className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-on-surface text-background px-4 py-3 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
          title="Back to Admin"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-bold text-sm tracking-wide">Admin</span>
        </button>
      )}

      {/* WhatsApp Floating Button */}
      <WhatsAppFloatingButton />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
}

// Helper route components
function ProductDetailRoute({
  products,
  onAddToCart,
  onBackToCatalog,
  onSelectProduct
}: {
  products: Product[];
  onAddToCart: (product: Product, quantity: number, color?: string, storage?: string, warranty?: Warranty, simType?: string) => void;
  onSelectProduct: (product: Product) => void;
  onBackToCatalog: () => void;
}) {
  const { productId } = useParams();
  const product = products.find(p => p.id === productId);

  if (!product) {
    return <div className="text-center py-20">Product not found</div>;
  }

  return (
    <>
      <SEOHead
        dynamicTitle={`${product.name} | AXON TECH Kenya`}
        dynamicDescription={product.description}
        dynamicImage={product.image}
        dynamicJsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": [product.image, ...(product.images || [])],
          "description": product.description,
          "brand": {
            "@type": "Brand",
            "name": product.brand || "AXON TECH"
          },
          "sku": product.id,
          "mpn": product.id,
          "offers": {
            "@type": "Offer",
            "price": (product.priceKsh || 0).toString(),
            "priceCurrency": "KES",
            "availability": product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            "url": `https://axontech.co.ke/product/${product.id}`,
            "seller": {
              "@type": "Organization",
              "name": "AXON TECH Kenya"
            }
          },
          "aggregateRating": product.rating
            ? {
                "@type": "AggregateRating",
                "ratingValue": product.rating.toString(),
                "reviewCount": (product.reviewsCount || 0).toString(),
                "bestRating": "5",
                "worstRating": "1"
              }
            : undefined,
          "manufacturer": {
            "@type": "Organization",
            "name": product.brand || "AXON TECH"
          }
        }}
      />
      <ProductDetailView
        product={product}
        products={products}
        onBackToCatalog={onBackToCatalog}
        onAddToCart={onAddToCart}
        onSelectProduct={onSelectProduct}
      />
    </>
  );
}

function OrderConfirmationRoute({
  orderDetails,
  orderId,
  config,
  onReturnHome
}: {
  orderDetails: any;
  orderId?: string;
  config?: any;
  onReturnHome: () => void;
}) {
  if (!orderDetails) {
    return <div className="text-center py-20">No order details found</div>;
  }

  return (
    <>
      <SEOHead 
        dynamicTitle={`Order ${orderId || orderDetails.id} Confirmed | AXON TECH Kenya`}
        dynamicDescription="Your order has been placed. Payment instructions sent via WhatsApp."
      />
      <OrderConfirmationView
        orderDetails={orderDetails}
        orderId={orderId}
        config={config}
        onReturnHome={onReturnHome}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
