import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { Product, CartItem } from "./types";
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
  
  // Super Admin Authenticated state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem("axon_admin_authed") === "true";
    } catch {
      return false;
    }
  });
  
  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dynamic server data states
  const [products, setProducts] = useState<Product[]>([]);
  const [webConfig, setWebConfig] = useState<any>(null);

  const fetchProductsAndConfig = async () => {
    try {
      const [prodRes, configRes] = await Promise.all([
        fetch(API_ROUTES.products.list),
        fetch(API_ROUTES.config.get)
      ]);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData) && prodData.length > 0) {
          setProducts(prodData);
        }
      }
      if (configRes.ok) {
        const configData = await configRes.json();
        setWebConfig(configData);
      }
    } catch (err) {
      console.error("Error loading dynamic server metrics:", err);
    }
  };

  useEffect(() => {
    fetchProductsAndConfig();
  }, []);

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

  // Cart actions
  const handleAddToCart = (product: Product, quantity: number, selectedColor?: string, selectedStorage?: string) => {
    const color = selectedColor || (product.colors ? product.colors[0] : undefined);
    const storage = selectedStorage || (product.storages ? product.storages[0] : undefined);

    // Compute dynamic price from variant map
    let dynamicPrice = product.price;
    let dynamicPriceKsh = product.priceKsh;
    if (product.variants && storage) {
      const storageVariants = product.variants[storage];
      if (storageVariants) {
        for (const [colors, price] of Object.entries(storageVariants)) {
          if (colors.split(',').map(c => c.trim()).includes(color || '')) {
            dynamicPriceKsh = price;
            dynamicPrice = parseFloat((Math.floor(price / 130) + 0.99).toFixed(2));
            break;
          }
        }
      }
    }

    // Create a price-adjusted product copy for the cart
    const cartProduct = {
      ...product,
      price: dynamicPrice ?? product.price,
      priceKsh: dynamicPriceKsh ?? product.priceKsh,
    };

    setCart((prevCart) => {
      const matchIdx = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === color &&
          item.selectedStorage === storage
      );

      if (matchIdx > -1) {
        const updated = [...prevCart];
        updated[matchIdx].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedColor: color, selectedStorage: storage }];
      }
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, color?: string, storage?: string) => {
    if (quantity <= 0) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedColor === color && item.selectedStorage === storage
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string, color?: string, storage?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.product.id === productId && item.selectedColor === color && item.selectedStorage === storage)
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
            price: item.product.price,
            quantity: item.quantity,
            color: item.selectedColor,
            storage: item.selectedStorage,
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
          price: item.product.price,
          quantity: item.quantity,
          color: item.selectedColor,
          storage: item.selectedStorage,
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

  // If super admin is fully authenticated and on the Admin panel, present a clean full-screen view
  if (location.pathname === ROUTES.admin && isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col justify-between" id="app-wrapper">
        <SEOHead config={{ title: "Admin Dashboard | AXON TECH Kenya", description: "AXON TECH administration panel." }} />
        <main className="flex-1 py-4 md:py-8">
          <AdminView 
            onSelectProduct={handleSelectProduct}
            onRefreshProducts={fetchProductsAndConfig}
            isAdminAuthenticated={isAdminAuthenticated}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
            onViewWeb={() => navigate("/")}
          />
        </main>
      </div>
    );
  }

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
      />

      {/* Slideout Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckoutNav}
        onExploreEcosystem={() => {
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
              />
            } 
          />
        </Routes>
      </main>

      {/* Consistent Footer */}
      <Footer onNavigate={(screen) => navigate(`/${screen.toLowerCase()}`)} config={webConfig} />

      {/* WhatsApp Floating Button */}
      <WhatsAppFloatingButton />
    </div>
  );
}

// Helper route components
function ProductDetailRoute({ 
  products, 
  onAddToCart, 
  onBackToCatalog 
}: { 
  products: Product[];
  onAddToCart: (product: Product, quantity: number, color?: string, storage?: string) => void;
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
      />
      <ProductDetailView
        product={product}
        onBackToCatalog={onBackToCatalog}
        onAddToCart={onAddToCart}
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
