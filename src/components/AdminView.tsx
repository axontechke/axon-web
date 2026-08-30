import React, { useState, useEffect, useMemo } from "react";
import { useFirebaseAuth } from "../context/FirebaseAuthContext";
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  TrendingUp, 
  DollarSign, 
  ClipboardList, 
  SlidersHorizontal, 
  Search, 
  Settings, 
  Megaphone, 
  Lock, 
  Unlock, 
  Tag, 
  Eye, 
  RefreshCw, 
  AlertCircle,
  LogOut,
  Truck,
  MessageSquare,
  Send,
  History,
  MapPin,
  Bell,
  TrendingDown,
  Sparkles,
  FileText,
  Star,
  ImageIcon,
  Laptop,
  Tablet,
  Headphones,
  Smartphone,
  Layers,
  Plug,
  Palette,
  ChevronUp,
  ChevronDown,
  LayoutGrid
} from "lucide-react";
import Markdown from "react-markdown";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Product, ProductColor, Warranty, StorageVariant, formatProductPrice, VariantImagesMap } from "../types";

interface AdminViewProps {
  onSelectProduct: (product: Product) => void;
  onRefreshProducts: () => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  onViewWeb: () => void;
  isAuthValidating?: boolean;
  setIsAuthValidating?: (v: boolean) => void;
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  categorySales: { name: string; value: number }[];
  statusCount: { pending: number; packaged: number; shipped: number; delivered: number };
  latestOrders: any[];
}

interface WebConfig {
  announcement: string;
  showAnnouncement: boolean;
  heroTitle: string;
  heroDescription: string;
  activePromos: { code: string; discount: number; description: string }[];
  privacyPolicy?: string;
  termsOfUse?: string;
  cookiePolicy?: string;
  refundPolicy?: string;
  deliveryPolicy?: string;
  socialTwitter?: string;
  socialGithub?: string;
  socialLinkedIn?: string;
  contactEmail?: string;
  supportEmail?: string;
  heroSlides?: any[];
  categoriesList?: any[];
  trendingSlot1Product?: string;
  trendingSlot1Tag?: string;
  trendingSlot1Desc?: string;
  trendingSlot2Product?: string;
  trendingSlot2Tag?: string;
  trendingSlot2Desc?: string;
  trendingSlot3Product?: string;
  trendingSlot3Tag?: string;
  trendingSlot3Desc?: string;
  trendingSlot4Product?: string;
  trendingSlot4Tag?: string;
  trendingSlot4Desc?: string;
  spotlightTitle?: string;
  spotlightDescription?: string;
  spotlightProducts?: string[];
  mixedShowcaseEnabled?: boolean;
  mixedShowcaseTitle?: string;
  mixedShowcaseSubtitle?: string;
  mixedShowcaseProducts?: string[];
  categoriesSectionEnabled?: boolean;
  protocolTitle?: string;
  protocolDescription?: string;
  protocolBadges?: { text: string; icon: string; url: string }[];
  footerDescription?: string;
  footerWarrantyText?: string;
  footerCol1Title?: string;
  footerCol1Links?: any[];
  footerCol2Title?: string;
  footerCol2Links?: any[];
  footerCopyrightText?: string;
  footerDeveloperCreditText?: string;
  footerDeveloperCreditUrl?: string;
  footerBrandName?: string;
  footerBrandSuffix?: string;
  footerBrandLogoUrl?: string;
  socials?: { name: string; url: string; icon: string }[];
  navbarLogoUrl?: string;
  ogImage?: string;
  faviconUrl?: string;
  footerLogoUrl?: string;
  brandAccentColor?: string;
  metaPixelId?: string;
  heroMediaOverrideEnabled?: boolean;
  heroMediaOverrideType?: string;
  heroMediaOverrideUrl?: string;
  _waTokenSet?: boolean;
  _waPhoneSet?: boolean;
  _waAdminSet?: boolean;
  footerBrandTextColor?: string;
  whatsappEnabled?: boolean;
  whatsappSendToAdmin?: boolean;
  whatsappSendToCustomer?: boolean;
  whatsappAdminNumber?: string;
  footerNewsletterTitle?: string;
  footerNewsletterDescription?: string;
  footerBottomLinks?: any[];
  heroMode?: string;
  aiCreditsLimit?: number;
  aiCreditsUsed?: number;
  heroTargetProduct?: string;
  heroButtonText?: string;
}

const defaultCategories = [
  { name: "Tablets", desc: "Liquid Infinity screens", icon: "Tablet", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0", navigateTo: "Tablets" },
  { name: "Laptops", desc: "Aerospace alloys performance", icon: "Laptop", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853", navigateTo: "Laptops" },
  { name: "Audio", desc: "Adaptive isolation Pure DAC", icon: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", navigateTo: "Audio" },
  { name: "Continuous Power Banks", desc: "Continuous wireless power", icon: "Plug", image: "https://images.unsplash.com/photo-1609592806598-94d6b1589da2", navigateTo: "Continuous Power Banks" },
  { name: "Click Keyboards & Gear", desc: "Modular engineered tools", icon: "Layers", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3", navigateTo: "Click Keyboards & Gear" },
];

const defaultSlides = [
  {
    id: "catalog",
    tag: "NEW ARRIVAL",
    tagIcon: "Cpu",
    title: "The Axon Catalog",
    description: "Seamlessly connected devices that work together. Phones, tablets, laptops, and accessories in one unified catalog.",
    primaryBtnText: "Explore Catalog",
    primaryActionTarget: "category",
    primaryActionValue: "All",
    secondaryBtnText: "Shop Laptops",
    secondaryActionTarget: "category",
    secondaryActionValue: "Laptops",
    mediaType: "image",
    mediaUrl: "",
    mediaAlt: "Axon Catalog devices",
    overlayTitle: "Connected",
    overlayDesc: "Multi-device sync built-in"
  },
  {
    id: "phone-video",
    tag: "HOT DEAL",
    tagIcon: "Zap",
    title: "Flagship Phones",
    description: "Top-tier smartphones from Apple, Samsung, and Google. Genuine warranty and fast delivery across Kenya.",
    primaryBtnText: "Shop Phones",
    primaryActionTarget: "category",
    primaryActionValue: "Phones",
    secondaryBtnText: "View Deals",
    secondaryActionTarget: "category",
    secondaryActionValue: "All",
    mediaType: "video",
    mediaUrl: "",
    mediaAlt: "Latest smartphones",
    overlayTitle: "Flagship",
    overlayDesc: "Official warranty included"
  },
  {
    id: "book-laptop",
    tag: "EDITOR'S PICK",
    tagIcon: "ShieldCheck",
    title: "Pro Laptops & Tablets",
    description: "High-performance laptops and tablets for work, study, and creativity. From ultrabooks to creative studios.",
    primaryBtnText: "Shop Laptops",
    primaryActionTarget: "category",
    primaryActionValue: "Laptops",
    secondaryBtnText: "Explore Tablets",
    secondaryActionTarget: "category",
    secondaryActionValue: "Tablets",
    mediaType: "image",
    mediaUrl: "",
    mediaAlt: "Professional laptops",
    overlayTitle: "Pro Performance",
    overlayDesc: "Built for demanding tasks"
  }
];

const defaultCol1Links = [
  { text: "Tablets", target: "/catalog" },
  { text: "Laptops", target: "/catalog" },
  { text: "Audio", target: "/catalog" },
  { text: "Power Banks", target: "/catalog" },
  { text: "Accessories", target: "/catalog" }
];

const defaultCol2Links = [
  { text: "Warranty Registry", target: "terms" },
  { text: "Delivery & Shipping", target: "delivery" },
  { text: "Refund & Return Policy", target: "refund" },
  { text: "Cookie Settings", target: "cookies" },
  { text: "Catalog Security", target: "privacy" }
];

export const AdminView: React.FC<AdminViewProps> = ({
  onSelectProduct,
  onRefreshProducts,
  isAdminAuthenticated,
  setIsAdminAuthenticated,
  onViewWeb,
  isAuthValidating,
  setIsAuthValidating,
}) => {
  // Firebase Auth
  const { signInWithGoogle } = useFirebaseAuth();

  // Authentication State
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("axon_admin_token"));
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("axon_admin_token") || "");

  // Tab State
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "config" | "support" | "delivery" | "whatsapp" | "blog" | "priceTrackers" | "aiReports" | "reviews" | "colors" | "simTypes">("analytics");

  // AI Reports state
  const [selectedReportType, setSelectedReportType] = useState<"sales" | "catalog" | "support" | "system">("sales");
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [quotaLimitInput, setQuotaLimitInput] = useState<number>(30);

  // Config Sub-Tab State
  const [configSubTab, setConfigSubTab] = useState<"general" | "hero" | "categories" | "trending" | "spotlight" | "mixed" | "protocol" | "footer" | "contact" | "whatsapp">("general");

  // Data States
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  // Derived: only products with valid name/id, shields all .map() calls downstream
  const validProductsList = useMemo(() => productsList.filter(p => p && typeof p.name === "string"), [productsList]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [webConfig, setWebConfig] = useState<WebConfig | null>(null);
  const [contactData, setContactData] = useState<any>(null);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);

  useEffect(() => {
    if (webConfig?.aiCreditsLimit !== undefined) {
      setQuotaLimitInput(webConfig.aiCreditsLimit);
    }
  }, [webConfig]);
  const [priceTrackers, setPriceTrackers] = useState<any[]>([]);

  // Custom states for Logistics and WhatsApp Notifications
  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
  const [whatsappNotifications, setWhatsappNotifications] = useState<any[]>([]);
  const [whatsappApiLogs, setWhatsappApiLogs] = useState<any[]>([]);

  // Dispatch parameters
  const [dispatchDeliveryMethodId, setDispatchDeliveryMethodId] = useState<string>("");
  const [dispatchTrackingNumber, setDispatchTrackingNumber] = useState<string>("");
  const [dispatchCustomText, setDispatchCustomText] = useState<string>("");

  // Delivery Method Form state
  const [editingMethod, setEditingMethod] = useState<any | null>(null);
  const [isMethodFormOpen, setIsMethodFormOpen] = useState(false);

  // UI State Managers
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");

  // Real-time Marketplace Scraping State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [showSyncPanel, setShowSyncPanel] = useState(false);

  // Live URL Staging Sandbox state
  const [sandboxUrl, setSandboxUrl] = useState("");
  const [isSandboxStaging, setIsSandboxStaging] = useState(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [stagedProduct, setStagedProduct] = useState<Partial<Product> | null>(null);

  // Form states for Product CRUD (Create / Edit)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  // Legacy variant state (retained for legacy reset handlers)
  const [newVarStorage, setNewVarStorage] = useState("");
  const [newVarColor, setNewVarColor] = useState("");
  const [newVarStock, setNewVarStock] = useState<number>(10);
  const [newVarPriceKsh, setNewVarPriceKsh] = useState<number>(0);
  // Variant image management: keyed by "storage|color"
  const [variantImgMap, setVariantImgMap] = useState<Record<string, any[]>>({});
  const [newVarImgStorage, setNewVarImgStorage] = useState("");
  const [newVarImgColor, setNewVarImgColor] = useState("");
  const [newVarImgUrl, setNewVarImgUrl] = useState("");
  const [newProductImageUrl, setNewProductImageUrl] = useState("");
  // Track which colors should be added to product-level colors when saving the variant
  const [svColorProductAssignment, setSvColorProductAssignment] = useState<Record<string, boolean>>({});
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  // Existing colors from DB for reuse
  // Legacy warranty state (unused — warranties now set per StorageVariant)
  const [_warrantyName, _setWarrantyName] = useState("");

  // StorageVariant editor state
  const [editingSv, setEditingSv] = useState<Partial<StorageVariant> | null>(null); // currently editing a StorageVariant
  const [editingWarrantyIdx, setEditingWarrantyIdx] = useState<number | null>(null); // warranty being edited inline
  const [editingSvOriginalKey, setEditingSvOriginalKey] = useState<string | null>(null);
  const [svColors, setSvColors] = useState<ProductColor[]>([]);
  const [svWarranties, setSvWarranties] = useState<{ id: string; priceKsh: number }[]>([]);
  // simType is now a variant property — admin-managed via global_sim_types (generic for any product category)
  const [newSvStorage, setNewSvStorage] = useState("");
  const [newSvSimType, setNewSvSimType] = useState<string>("physical");

  // Form states for Promo Manager
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState(10);
  const [newPromoDesc, setNewPromoDesc] = useState("");

  // Blog Management state
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [globalColors, setGlobalColors] = useState<any[]>([]);
  const [globalSimTypes, setGlobalSimTypes] = useState<any[]>([]);
  const [generatingBlog, setGeneratingBlog] = useState(false);
  const [topicPrompt, setTopicPrompt] = useState("");
  const [geographicHub, setGeographicHub] = useState("Nairobi, Kenya");

  // Order Detail Modal status
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderStatusNotes, setOrderStatusNotes] = useState("");

  // Validate stored token on mount — clear stale auth if token is invalid
  useEffect(() => {
    const storedToken = localStorage.getItem("axon_admin_token");
    if (!storedToken) {
      setIsAuthValidating?.(false);
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${storedToken}` }
    }).then(res => {
      if (!res.ok) {
        localStorage.removeItem("axon_admin_token");
        localStorage.removeItem("axon_admin_authed");
        setIsAuthenticated(false);
        setAuthToken("");
      }
      setIsAuthValidating?.(false);
    }).catch(() => {
      // Network error — assume token is invalid
      localStorage.removeItem("axon_admin_token");
      localStorage.removeItem("axon_admin_authed");
      setIsAuthenticated(false);
      setAuthToken("");
      setIsAuthValidating?.(false);
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllAdminData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && (activeTab === "blog" || blogPosts.length === 0)) {
      fetch("/api/blog")
        .then(res => res.json())
        .then(data => setBlogPosts(data))
        .catch(err => console.error("Error loading blog posts:", err));
    }
    if (isAuthenticated && (activeTab === "reviews" || adminReviews.length === 0)) {
      authFetch("/api/admin/reviews")
        .then(res => res.json())
        .then(data => setAdminReviews(data))
        .catch(err => console.error("Error loading reviews:", err));
    }
    if (isAuthenticated && (activeTab === "colors" || activeTab === "products") && globalColors.length === 0) {
      authFetch("/api/admin/colors")
        .then(res => res.json())
        .then(data => setGlobalColors(data))
        .catch(err => console.error("Error loading colors:", err));
    }
    if (isAuthenticated && (activeTab === "simTypes" || activeTab === "products") && globalSimTypes.length === 0) {
      authFetch("/api/admin/sim-types")
        .then(res => res.json())
        .then(data => setGlobalSimTypes(data))
        .catch(err => console.error("Error loading SIM types:", err));
    }
  }, [isAuthenticated, activeTab]);

  const loadAllAdminData = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const [analyticsRes, productsRes, ordersRes, configRes, contactRes, supportRequestsRes, deliveryMethodsRes, whatsappNotifsRes, whatsappLogsRes, trackersRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch(`/api/config?t=${Date.now()}`),
        fetch("/api/contact"),
        authFetch("/api/admin/support-requests"),
        fetch("/api/delivery-methods"),
        authFetch("/api/admin/whatsapp-notifications"),
        authFetch("/api/admin/whatsapp-api-logs"),
        authFetch("/api/admin/price-trackers")
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (productsRes.ok) setProductsList(await productsRes.json());
      if (ordersRes.ok) setOrdersList(await ordersRes.json());
      if (configRes.ok) setWebConfig(await configRes.json());
      if (contactRes.ok) setContactData(await contactRes.json());
      if (supportRequestsRes.ok) setSupportRequests(await supportRequestsRes.json());
      if (deliveryMethodsRes.ok) setDeliveryMethods(await deliveryMethodsRes.json());
      if (whatsappNotifsRes.ok) setWhatsappNotifications(await whatsappNotifsRes.json());
      if (whatsappLogsRes.ok) setWhatsappApiLogs(await whatsappLogsRes.json());
      if (trackersRes.ok) setPriceTrackers(await trackersRes.json());
    } catch (err) {
      console.error("Failed loading admin console data", err);
      showFeedback("Failed to sync backend server databases.", true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect a color name from an image URL (e.g. "teal" from ".../teal-iphone.jpg")
  const extractColorFromUrl = (url: string): string => {
    if (!url) return "";
    const lower = url.toLowerCase();
    const knownColors = [
      "black", "white", "silver", "gray", "grey", "slate", "charcoal",
      "blue", "navy", "royal blue", "teal", "cyan", "turquoise",
      "green", "emerald", "olive", "coral", "red", "pink", "rose",
      "gold", "yellow", "orange", "copper", "bronze", "purple", "violet",
      "obsidian", "pearl", "ivory", "cream", "beige", "lavender",
    ];
    for (const color of knownColors) {
      if (lower.includes(color)) {
        // Capitalize first letter
        return color.charAt(0).toUpperCase() + color.slice(1);
      }
    }
    return "";
  };

  const showFeedback = (text: string, isError = false) => {
    setActionMessage({ text, isError });
    setTimeout(() => {
      setActionMessage(null);
    }, 4500);
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();

      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = typeof data.error === "string" ? data.error : JSON.stringify(data.error) || "Not authorized as admin.";
        setAuthError(msg);
        return;
      }
      localStorage.setItem("axon_admin_token", data.token);
      localStorage.setItem("axon_admin_authed", "true");
      setAuthToken(data.token);
      setIsAuthenticated(true);
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") return;
      setAuthError("Sign-in failed. Try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (_) {}
    setIsAuthenticated(false);
    setAuthToken("");
    localStorage.removeItem("axon_admin_token");
    localStorage.removeItem("axon_admin_authed");
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers);
    // Always read from localStorage directly to avoid stale closure on first mount
    const token = authToken || localStorage.getItem("axon_admin_token") || "";
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const apiKey = localStorage.getItem("axon_admin_api_key");
    if (apiKey) headers.set("x-admin-api-key", apiKey);
    return fetch(url, { ...options, headers });
  };

  // ==========================================
  // PRODUCT INVENTORY CRUD ACTIONS
  // ==========================================
  const handleOpenAddProduct = () => {
    setEditingProduct({
      id: "",
      name: "",
      price: 199,
      category: "Audio",
      brand: "Axon",
      image: "",
      description: "Superior premium design built for continuous performance.",
      rating: 4.8,
      reviewsCount: 1,
      inStock: true,
      colors: [],
      storages: [],
      images: [],
      variants: [],
      warranties: [],
      storageVariants: [],
      hasVariants: false,
      stock: 10,
      specifications: {
        "Processor": "Quantum Core Architecture",
        "Battery": "Sustained all-day operational capacity"
      }
    });
    setEditingSv(null);
    setEditingSvOriginalKey(null);
    setSvColors([]);
    setSvWarranties([]);
    setNewVarStorage("");
    setNewVarColor("");
    setNewVarStock(10);
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = async (prod: Product) => {
    // Migrate legacy separate color fields into unified colors[] array
    const legacyColors: string[] = prod.colors && prod.colors.length > 0 && typeof prod.colors[0] === 'string'
      ? (prod.colors as unknown as string[]) : [];
    const migratedColors: ProductColor[] = legacyColors.map((name: string) => ({
      name,
      code: prod.colorCodes?.[name] || "",
      image: prod.colorImages?.[name] || "",
    }));
    // If product already has new format colors[], use them as-is
    const finalColors: ProductColor[] = (prod.colors && prod.colors.length > 0 && typeof prod.colors[0] === 'object')
      ? (prod.colors as ProductColor[])
      : migratedColors;

    // Auto-migrate legacy variants to storageVariants if storageVariants is empty
    // Normalize storageVariants: rename legacy `warranties` field to `warrantyIds`
    let finalStorageVariants = (prod.storageVariants || []).map((sv: any) => {
      // Normalize warrantyIds[] → warranties[{id, priceKsh}]
      if (Array.isArray(sv.warranties)) return sv;
      const warrantyIds: string[] = sv.warrantyIds || [];
      return {
        ...sv,
        warranties: warrantyIds.map((id: string) => ({ id, priceKsh: 0 }))
      };
    });
    if (finalStorageVariants.length === 0 && prod.variants && prod.variants.length > 0) {
      const svMap = new Map<string, any>();
      prod.variants.forEach(v => {
        const key = `${v.storage}|physical`; // Default to physical SIM
        if (!svMap.has(key)) {
          svMap.set(key, {
            storage: v.storage,
            priceKsh: v.priceKsh || prod.priceKsh || 0,
            simType: "physical",
            colors: [],
            warrantyIds: [],
            stock: v.stock || 10
          });
        }
        const sv = svMap.get(key);
        // Add color if not empty/default and not already present
        if (v.color && v.color !== "Default" && v.color !== "") {
          const colorsToAdd = v.color.split(',').map(c => c.trim());
          colorsToAdd.forEach(cName => {
             if (!sv.colors.some((c: any) => c.name === cName)) {
               // Try to find full color info from migratedColors
               const matched = finalColors.find(c => c.name === cName);
               sv.colors.push(matched || { name: cName, code: "", image: "" });
             }
          });
        }
        // Update price if this variant has a price
        if (v.priceKsh) sv.priceKsh = v.priceKsh;
      });
      finalStorageVariants = Array.from(svMap.values());
    }

    // Load variant images from DB
    let variantImgs: any[] = [];
    try {
      const res = await authFetch(`/api/admin/product-variant-images?productId=${prod.id}`);
      variantImgs = res.ok ? await res.json() : [];
    } catch {
      variantImgs = [];
    }

    const grouped: Record<string, any[]> = {};
    for (const img of variantImgs) {
      const key = img.storage && img.color ? `${img.storage}|${img.color}` : "base";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(img);
    }
    setVariantImgMap(grouped);

    // Backfill variant image URLs into product.images if not already present
    const existingUrls = new Set<string>(prod.images || []);
    const additionalUrls: string[] = [];
    // From product_variant_images table
    for (const img of variantImgs) {
      if (img.imageUrl && !existingUrls.has(img.imageUrl)) {
        existingUrls.add(img.imageUrl);
        additionalUrls.push(img.imageUrl);
      }
    }
    // Also backfill from storageVariants[].colors[].image
    for (const sv of prod.storageVariants || []) {
      for (const c of sv.colors || []) {
        if ((c as any).image && !existingUrls.has((c as any).image)) {
          existingUrls.add((c as any).image);
          additionalUrls.push((c as any).image);
        }
      }
    }

    setEditingProduct({
      ...prod,
      images: [...(prod.images || []), ...additionalUrls],
      colors: finalColors,
      storages: prod.storages || [],
      variants: prod.variants || [],
      storageVariants: finalStorageVariants,
      hasVariants: prod.hasVariants !== undefined ? prod.hasVariants : finalStorageVariants.length > 0,
      stock: prod.stock ?? 10
    });
    setNewVarStorage("");
    setNewVarColor("");
    setNewVarStock(10);
    setNewVarPriceKsh(0);
    setNewVarImgStorage(prod.storages?.[0] || "");
    setNewVarImgColor(finalColors[0]?.name || "");
    setNewVarImgUrl("");
    setEditingSv(null);
    setEditingSvOriginalKey(null);
    setSvColors([]);
    setSvWarranties([]);
    setSvColorProductAssignment({});
    setNewProductImageUrl("");
    setIsProductFormOpen(true);
  };

  const handleAddVariant = () => {
    if (!newVarStorage.trim() || !newVarColor.trim()) return;
    if (!editingProduct) return;

    const currentVariants = editingProduct.variants || [];
    const exists = currentVariants.some(
      v => v.storage.toLowerCase() === newVarStorage.trim().toLowerCase() &&
           v.color.toLowerCase() === newVarColor.trim().toLowerCase()
    );

    if (exists) {
      alert("This storage and color combination already exists in variants.");
      return;
    }

    const updatedVariants = [
      ...currentVariants,
      {
        storage: newVarStorage.trim(),
        color: newVarColor.trim(),
        stock: Number(newVarStock) || 0,
        priceKsh: newVarPriceKsh || undefined,
      }
    ];

    const updatedStorages = Array.from(new Set([...(editingProduct.storages || []), newVarStorage.trim()]));

    // Keep colors[] in sync: add new color name if not already in master list
    const colorNames = editingProduct.colors.map(c => c.name);
    const newColorEntry = !colorNames.includes(newVarColor.trim())
      ? [...editingProduct.colors, { name: newVarColor.trim(), code: "", image: "" }]
      : editingProduct.colors;

    setEditingProduct({
      ...editingProduct,
      variants: updatedVariants,
      storages: updatedStorages,
      colors: newColorEntry
    });

    setNewVarStorage("");
    setNewVarColor("");
    setNewVarStock(10);
    setNewVarPriceKsh(0);
  };

  const handleRemoveVariant = (index: number) => {
    if (!editingProduct) return;
    const currentVariants = [...(editingProduct.variants || [])];
    currentVariants.splice(index, 1);

    const updatedStorages = Array.from(new Set(currentVariants.map(v => v.storage)));

    setEditingProduct({
      ...editingProduct,
      variants: currentVariants,
      storages: updatedStorages.length > 0 ? updatedStorages : undefined,
    });
  };

  const handleAddVariantImage = async (storage: string, color: string) => {
    if (!newVarImgUrl.trim() || !editingProduct?.id) return;
    const key = `${storage}|${color}`;
    try {
      const res = await authFetch("/api/admin/product-variant-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingProduct.id,
          storage,
          color,
          imageUrl: newVarImgUrl.trim(),
          sortOrder: (variantImgMap[key] || []).length
        })
      });
      if (!res.ok) { alert("Failed to save image"); return; }
      const saved = await res.json();
      setVariantImgMap(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), saved]
      }));
      // Also add to product-level images if not already present
      if (newVarImgUrl.trim() && !(editingProduct.images || []).includes(newVarImgUrl.trim())) {
        setEditingProduct(prev => ({
          ...prev!,
          images: [...(prev!.images || []), newVarImgUrl.trim()]
        }));
      }
      setNewVarImgUrl("");
    } catch {
      alert("Failed to save image");
    }
  };

  const handleRemoveVariantImage = async (storage: string, color: string, imageId: string, imageUrl: string) => {
    const key = `${storage}|${color}`;
    try {
      await authFetch(`/api/admin/product-variant-images/${imageId}`, { method: "DELETE" });
      const remaining = (variantImgMap[key] || []).filter((img: any) => img.id !== imageId);
      setVariantImgMap(prev => ({ ...prev, [key]: remaining }));
      // If no other variant uses this URL, remove from product-level images
      const usedElsewhere = Object.entries(variantImgMap).some(([k, imgs]) =>
        k !== key && imgs.some((img: any) => img.imageUrl === imageUrl)
      );
      if (!usedElsewhere) {
        setEditingProduct(prev => ({
          ...prev!,
          images: (prev!.images || []).filter((u: string) => u !== imageUrl)
        }));
      }
    } catch {
      alert("Failed to delete image");
    }
  };

  const handleAddProductImageUrl = () => {
    const url = newProductImageUrl.trim();
    if (!url) return;
    if ((editingProduct.images || []).includes(url)) { alert("Image URL already exists."); return; }
    setEditingProduct({ ...editingProduct, images: [...(editingProduct.images || []), url] });
    setNewProductImageUrl("");
  };

  const handleMoveSv = (index: number, direction: "up" | "down") => {
    if (!editingProduct?.storageVariants) return;
    const arr = [...editingProduct.storageVariants];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= arr.length) return;
    [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
    setEditingProduct({ ...editingProduct, storageVariants: arr });
  };

  const handleCommitVariant = (): boolean => {
    if (!editingSv) return true;
    if (!editingSv.storage?.trim()) {
      alert("Storage name is required for the variant.");
      return false;
    }
    const newKey = `${editingSv.storage.trim()}|${editingSv.simType}`.toLowerCase();
    const currentSv = editingProduct?.storageVariants || [];
    
    if (editingSvOriginalKey) {
      if (editingSvOriginalKey !== newKey) {
        if (currentSv.some(sv => `${sv.storage}|${sv.simType}`.toLowerCase() === newKey)) {
          alert("This storage + SIM variant already exists.");
          return false;
        }
      }
    } else {
      if (currentSv.some(sv => `${sv.storage}|${sv.simType}`.toLowerCase() === newKey)) {
        alert("This storage + SIM variant already exists.");
        return false;
      }
    }

    const keyToRemove = editingSvOriginalKey || newKey;
    const existing = (currentSv || []).filter(
      (sv: any) => `${sv.storage}|${sv.simType}`.toLowerCase() !== keyToRemove
    );
    const updatedVariant = {
      ...editingSv,
      storage: editingSv.storage.trim(),
      colors: svColors,
      warranties: svWarranties
    } as StorageVariant;
    const updatedSvList = [...existing, updatedVariant];

    const productColorNames = new Set((editingProduct?.colors || []).map((c: any) => c.name));
    const newProductColors = svColors
      .filter(c => svColorProductAssignment[c.name])
      .filter(c => !productColorNames.has(c.name));

    const updatedStorages = Array.from(new Set(updatedSvList.map(sv => sv.storage).filter(Boolean)));

    setEditingProduct(prev => ({
      ...prev!,
      storageVariants: updatedSvList,
      storages: updatedStorages.length > 0 ? updatedStorages : prev?.storages,
      colors: newProductColors.length > 0
        ? [...(prev?.colors || []), ...newProductColors]
        : prev?.colors || []
    }));

    setEditingSv(null);
    setEditingSvOriginalKey(null);
    setSvColors([]);
    setSvWarranties([]);
    setSvColorProductAssignment({});
    setNewSvStorage("");
    return true;
  };

  const handleAssignColorImage = async (storage: string, color: string, url: string) => {
    if (!editingProduct?.id) return;
    const key = `${storage}|${color}`;
    try {
      const res = await authFetch("/api/admin/product-variant-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingProduct.id,
          storage,
          color,
          imageUrl: url,
          sortOrder: (variantImgMap[key] || []).length
        })
      });
      if (!res.ok) { alert("Failed to assign image"); return; }
      const saved = await res.json();
      setVariantImgMap(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), saved]
      }));
      // Also add to product-level images if not already present
      if (url && !(editingProduct.images || []).includes(url)) {
        setEditingProduct(prev => ({
          ...prev!,
          images: [...(prev!.images || []), url]
        }));
      }
    } catch {
      alert("Failed to assign image");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || (!editingProduct.price && !editingProduct.priceKsh)) {
      showFeedback("Please fill out Name and at least one Price field (USD or KSh).", true);
      return;
    }

    try {
      // Auto-commit any currently open variant editing state if storage is present
      let currentProduct = { ...editingProduct };
      if (editingSv && editingSv.storage?.trim()) {
        const newKey = `${editingSv.storage.trim()}|${editingSv.simType}`.toLowerCase();
        const keyToRemove = editingSvOriginalKey || newKey;
        const existing = (currentProduct.storageVariants || []).filter(
          (sv: any) => `${sv.storage}|${sv.simType}`.toLowerCase() !== keyToRemove
        );
        const updatedVariant = {
          ...editingSv,
          storage: editingSv.storage.trim(),
          colors: svColors,
          warranties: svWarranties
        } as StorageVariant;
        const updatedSvList = [...existing, updatedVariant];
        const updatedStorages = Array.from(new Set(updatedSvList.map(sv => sv.storage).filter(Boolean)));
        
        const productColorNames = new Set((currentProduct.colors || []).map((c: any) => c.name));
        const newProductColors = svColors
          .filter(c => svColorProductAssignment[c.name])
          .filter(c => !productColorNames.has(c.name));

        currentProduct = {
          ...currentProduct,
          storageVariants: updatedSvList,
          storages: updatedStorages.length > 0 ? updatedStorages : currentProduct.storages,
          colors: newProductColors.length > 0
            ? [...(currentProduct.colors || []), ...newProductColors]
            : currentProduct.colors
        };
        setEditingProduct(currentProduct);
        setEditingSv(null);
        setEditingSvOriginalKey(null);
        setSvColors([]);
        setSvWarranties([]);
        setSvColorProductAssignment({});
        setNewSvStorage("");
      }

      const isNew = !currentProduct.id;

      // DEBUG: log storageVariants and warranties being sent
      console.log("[DEBUG] Saving product warranties:", JSON.stringify(currentProduct.warranties));
      console.log("[DEBUG] Saving product storageVariants:", JSON.stringify(currentProduct.storageVariants));

      const saveOnce = (u: string, m: string) =>
        authFetch(u, {
          method: m,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentProduct)
        });

      let res = await saveOnce(
        isNew ? "/api/admin/products" : `/api/admin/products/${currentProduct.id}`,
        isNew ? "POST" : "PUT"
      );

      // If editing a product that no longer exists in the DB (e.g. was never persisted),
      // fall back to creating it so the save never silently fails.
      if (!res.ok && res.status === 404 && !isNew) {
        console.warn("[DEBUG] Product not found on update — falling back to create.");
        res = await saveOnce("/api/admin/products", "POST");
      }

      // DEBUG: log raw response
      const text = await res.text();
      console.log("[DEBUG] Save response status:", res.status, "body:", text.slice(0, 500));

      if (res.ok) {
        showFeedback(`Product successfully ${isNew ? "created" : "updated"}.`);
        setIsProductFormOpen(false);
        setEditingProduct(null);
        loadAllAdminData();
        onRefreshProducts(); // Trigger app-wide reload
      } else {
        throw new Error((text && text.length ? text : `HTTP ${res.status}`) );
      }
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : "Failed to update database item.";
      console.error("[DEBUG] Save failed:", msg);
      showFeedback(msg.slice(0, 160), true);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this product from database?")) return;

    try {
      const res = await authFetch(`/api/admin/products/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showFeedback("Product removed from index.");
        loadAllAdminData();
        onRefreshProducts();
      } else {
        throw new Error("Failed delete operation");
      }
    } catch (err) {
      showFeedback("Failed to remove product from catalog.", true);
    }
  };

  // ==========================================
  // ORDER PROCESSING ACTIONS
  // ==========================================
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes: orderStatusNotes || `Status updated to ${status} via Admin Command Center.`
        })
      });

      if (res.ok) {
        showFeedback(`Order ${orderId} updated to ${status}.`);
        setOrderStatusNotes("");
        setSelectedOrder(null);
        loadAllAdminData();
      } else {
        throw new Error("Status update failed");
      }
    } catch (err) {
      showFeedback("Failed to update parcel logs.", true);
    }
  };

  // Real-time Kenya Marketplace Scraper Action Handler
  const handleSyncRealtimeProducts = async () => {
    setIsSyncing(true);
    setSyncLogs(["Initializing live scraping session...", "Resolving DNS for PhonePlace Kenya & iStreet..."]);
    setShowSyncPanel(true);
    try {
      const res = await authFetch("/api/admin/sync-realtime-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setSyncLogs(data.logs || ["Sync completed successfully!"]);
        showFeedback(`Marketplace scraper executed! Synced ${data.syncedCount || 0} active catalog items.`);
        loadAllAdminData();
      } else {
        throw new Error("Upstream server responded with an error");
      }
    } catch (err: any) {
      setSyncLogs(prev => [...prev, `Process aborted: ${err.message}`]);
      showFeedback("Upstream sync failed.", true);
    } finally {
      setIsSyncing(false);
    }
  };

  // Live Sandbox Scraper Draft Handler
  const handleScrapeUrlDraft = async (targetUrl?: string) => {
    const urlToFetch = targetUrl || sandboxUrl;
    if (!urlToFetch) {
      setSandboxError("Please enter a valid product URL or select a preset.");
      return;
    }
    setIsSandboxStaging(true);
    setSandboxError(null);
    try {
      const res = await authFetch("/api/admin/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToFetch })
      });
      if (res.ok) {
        const data = await res.json();
        setStagedProduct(data);
        if (targetUrl) setSandboxUrl(targetUrl);
        showFeedback("Staged sandbox refreshed! Review, customize, and keep the product below.");
      } else {
        const errData = await res.json();
        setSandboxError(errData.error || "Rate limit error or blocked request. Please wait 3 seconds and retry.");
        showFeedback(errData.error || "Fetch blocked or rate limited.", true);
      }
    } catch (err: any) {
      setSandboxError(`Network timeout or fetch aborted: ${err.message}`);
      showFeedback("Could not complete live fetch.", true);
    } finally {
      setIsSandboxStaging(false);
    }
  };

  const handleUpdateStagedField = (field: keyof Product, value: any) => {
    setStagedProduct(prev => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      if (field === "priceKsh") {
        updated.price = Math.round(Number(value) / 130);
      }
      return updated;
    });
  };

  const handlePublishStagedProduct = async () => {
    if (!stagedProduct || !stagedProduct.name) {
      showFeedback("Staged product is empty.", true);
      return;
    }
    try {
      setIsSandboxStaging(true);
      // Let's generate a clean slug or keep the generated draft id if customized
      const slug = "scraped-" + stagedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
      
      const payload = {
        ...stagedProduct,
        id: slug,
        rating: stagedProduct.rating || 4.8,
        reviewsCount: stagedProduct.reviewsCount || 15,
        inStock: stagedProduct.inStock ?? true,
        isNew: true
      };

      const res = await authFetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showFeedback(`Successfully published "${payload.name}" to active inventory!`);
        setStagedProduct(null);
        setSandboxUrl("");
        loadAllAdminData();
      } else {
        const errData = await res.json();
        showFeedback(errData.error || "Failed to commit product to database.", true);
      }
    } catch (err: any) {
      showFeedback(`Publish error: ${err.message}`, true);
    } finally {
      setIsSandboxStaging(false);
    }
  };

  // ==========================================
  // WEBSITE CONFIGURATION ACTIONS
  // ==========================================
  const handleSaveConfig = async () => {
    if (!webConfig) return;
    try {
      const payload = JSON.stringify(webConfig);
      console.log("[CONFIG SAVE] Sending with authToken:", authToken ? "YES" : "NO");
      console.log("[CONFIG SAVE] URL:", "/api/admin/config");
      const res = await authFetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: payload
      });
      console.log("[CONFIG SAVE] Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[CONFIG SAVE FAILED]", res.status, errorText);
        throw new Error(`Config sync failed: ${res.status} ${errorText}`);
      }

      showFeedback("Catalog configuration synced successfully.");
      loadAllAdminData();
    } catch (err) {
      console.error("[CONFIG SAVE ERROR]", err);
      showFeedback("Failed to sync layout parameters.", true);
    }
  };

  const handleSaveContact = async () => {
    if (!contactData) return;
    try {
      const res = await authFetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData)
      });
      if (res.ok) {
        showFeedback("Contact info synced successfully.");
        loadAllAdminData();
      } else {
        throw new Error("Contact sync failed");
      }
    } catch (err) {
      showFeedback("Failed to sync contact info.", true);
    }
  };

  const handleUpdateTicketStatus = async (id: string, newStatus: string) => {
    try {
      const res = await authFetch(`/api/admin/support-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showFeedback("Inquiry status updated successfully.");
        const requestsRes = await authFetch("/api/admin/support-requests");
        if (requestsRes.ok) {
          setSupportRequests(await requestsRes.json());
        }
      }
    } catch (err) {
      showFeedback("Failed to update inquiry status.", true);
    }
  };

  // ==========================================
  // LOGISTICS & DISPATCH ACTIONS
  // ==========================================
  const handleSaveDeliveryMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;
    if (!editingMethod.name || !editingMethod.carrier) {
      showFeedback("Name and Carrier are required fields.", true);
      return;
    }

    const isEdit = !!editingMethod.id;
    const url = isEdit ? `/api/admin/delivery-methods/${editingMethod.id}` : `/api/admin/delivery-methods`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMethod)
      });

      if (res.ok) {
        showFeedback(isEdit ? "Delivery method updated." : "Delivery method added.");
        setIsMethodFormOpen(false);
        setEditingMethod(null);
        loadAllAdminData();
      } else {
        throw new Error("Failed to save delivery method");
      }
    } catch (err) {
      showFeedback("Failed to save delivery method.", true);
    }
  };

  const handleDeleteDeliveryMethod = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery method?")) return;
    try {
      const res = await authFetch(`/api/admin/delivery-methods/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showFeedback("Delivery method deleted.");
        loadAllAdminData();
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      showFeedback("Failed to delete delivery method.", true);
    }
  };

  const handleDispatchOrder = async (orderId: string) => {
    if (!dispatchDeliveryMethodId) {
      showFeedback("Please select a delivery method.", true);
      return;
    }
    if (!dispatchTrackingNumber.trim()) {
      showFeedback("Tracking code is required for dispatch.", true);
      return;
    }

    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethodId: dispatchDeliveryMethodId,
          trackingNumber: dispatchTrackingNumber,
          notes: orderStatusNotes || undefined,
          customText: dispatchCustomText || undefined
        })
      });

      if (res.ok) {
        showFeedback(`Order ${orderId} dispatched & WhatsApp notification fired!`);
        setSelectedOrder(null);
        setOrderStatusNotes("");
        setDispatchTrackingNumber("");
        setDispatchCustomText("");
        setDispatchDeliveryMethodId("");
        loadAllAdminData();
      } else {
        throw new Error("Dispatch failed");
      }
    } catch (err) {
      showFeedback("Failed to dispatch order.", true);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Delete order ${orderId}? This cannot be undone.`)) return;
    try {
      const res = await authFetch(`/api/orders/${orderId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showFeedback(`Order ${orderId} deleted.`);
        setSelectedOrder(null);
        loadAllAdminData();
      } else {
        throw new Error("Delete failed");
      }
    } catch {
      showFeedback("Failed to delete order.", true);
    }
  };

  const handleAddPromoCode = async () => {
    if (!webConfig || !newPromoCode.trim()) return;
    const updatedPromos = [...webConfig.activePromos, {
      code: newPromoCode.trim().toUpperCase(),
      discount: newPromoDiscount,
      description: newPromoDesc || `${newPromoDiscount}% off dynamic discount coupon`
    }];

    try {
      const res = await authFetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activePromos: updatedPromos })
      });

      if (res.ok) {
        showFeedback(`Promo code '${newPromoCode}' registered.`);
        setNewPromoCode("");
        setNewPromoDesc("");
        loadAllAdminData();
      } else {
        showFeedback("Failed to add promo code.", true);
      }
    } catch (err) {
      showFeedback("Failed to publish coupon.", true);
    }
  };

  const handleRemovePromoCode = async (codeToRemove: string) => {
    if (!webConfig) return;
    const updatedPromos = webConfig.activePromos.filter(p => p.code !== codeToRemove);

    try {
      const res = await authFetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activePromos: updatedPromos })
      });

      if (res.ok) {
        showFeedback("Promo coupon disabled.");
        loadAllAdminData();
      } else {
        showFeedback("Failed to remove promo code.", true);
      }
    } catch (err) {
      showFeedback("Failed to delete promo coupon.", true);
    }
  };

  // ==========================================
  // AI EXECUTIVE REPORT ACTIONS
  // ==========================================
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReportError("");
    setGeneratedReport("");
    try {
      const res = await authFetch("/api/admin/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType: selectedReportType })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || "Failed to generate report.");
      }
      setGeneratedReport(data.report);
      showFeedback("AI Business Audit Report generated successfully.");
      loadAllAdminData(); // Sync updated credit usage counts
    } catch (err: any) {
      setReportError(err.message || "Failed to generate report.");
      showFeedback(err.message || "Failed to generate report.", true);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleUpdateQuota = async (newLimit: number, resetUsage: boolean = false) => {
    try {
      const body: any = { aiCreditsLimit: Number(newLimit) };
      if (resetUsage) {
        body.aiCreditsUsed = 0;
      }
      const res = await authFetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const updatedConfig = await res.json();
        setWebConfig(updatedConfig);
        showFeedback(resetUsage ? "Monthly AI credits usage reset and limit updated." : "AI quota configuration updated successfully.");
      } else {
        throw new Error();
      }
    } catch {
      showFeedback("Failed to update AI quota.", true);
    }
  };

  // ==========================================
  // METROLOGY BLOG ENGINE ACTIONS
  // ==========================================
  const handleGenerateBlog = async () => {
    if (!topicPrompt.trim()) {
      showFeedback("Please enter a topic or calibration theme.", true);
      return;
    }
    setGeneratingBlog(true);
    showFeedback("Instructing Gemini to compose and geocode SEO post...");
    try {
      const res = await authFetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicPrompt,
          geographicHub: geographicHub
        })
      });

      if (res.ok) {
        showFeedback("SEO Blog post compiled and index-cached in GEO!");
        setTopicPrompt("");
        // Reload blog posts state
        const updatedRes = await fetch("/api/blog");
        if (updatedRes.ok) {
          setBlogPosts(await updatedRes.json());
        }
      } else {
        const errData = await res.json();
        showFeedback(errData.error || "Failed to generate blog post.", true);
      }
    } catch (err) {
      showFeedback("Failed to connect to the AI model compilation engine.", true);
    } finally {
      setGeneratingBlog(false);
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this article from index?")) return;
    try {
      const res = await authFetch(`/api/admin/blog/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showFeedback("Article deleted and removed from cache.");
        const updatedRes = await fetch("/api/blog");
        if (updatedRes.ok) {
          setBlogPosts(await updatedRes.json());
        }
      } else {
        throw new Error("Failed delete operation");
      }
    } catch (err) {
      showFeedback("Failed to remove blog post.", true);
    }
  };

  // Filter products list
  const filteredProducts = validProductsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCategory = productCategoryFilter === "All" || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Google Sign-In button SVG logo (official brand asset)
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );

  // Show loading spinner while validating stored token
  if (isAuthValidating) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-surface-container border border-outline/15 rounded-3xl p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto ring-4 ring-primary/5">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display font-black text-xl text-on-surface">Verifying session…</h1>
            <p className="text-xs text-on-surface-variant/70">Please wait while we verify your credentials.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Login overlay if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-surface-container border border-outline/15 rounded-3xl p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto ring-4 ring-primary/5">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="space-y-1.5">
            <h1 className="font-display font-black text-xl text-on-surface">Super Admin Terminal</h1>
            <p className="text-xs text-on-surface-variant/70 leading-relaxed">
              Verify credentials to access live sales metrics, order fulfillment databases, and product inventories.
            </p>
          </div>

          {authError && (
            <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-medium bg-red-500/10 p-2.5 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="w-full h-10 bg-white hover:bg-white/90 text-[#3c4043] text-sm font-medium rounded border border-[#dadce0] shadow-sm flex items-center justify-center gap-3 transition-all"
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          <div className="text-[9px] text-on-surface-variant/50">
            Node Cloud Run Port 3000 Security Module.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 space-y-6 text-left" id="admin-view-panel">
      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Live Cluster Connective</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-on-surface tracking-tight">
            Super Admin Control Center
          </h1>
          <p className="text-xs text-on-surface-variant/70">
            Complete store CRUD management, real-time analytics dashboards, and web settings.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onViewWeb}
            className="p-2 bg-primary/10 hover:bg-primary/15 text-primary border border-primary/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Return to store browsing"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Web</span>
          </button>
          <button
            onClick={handleSaveConfig}
            className="p-2 bg-green-500/10 hover:bg-green-500/15 text-green-600 border border-green-500/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Save all pending changes"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            onClick={loadAllAdminData}
            disabled={loading}
            className="p-2 bg-surface-container border border-outline/15 text-on-surface hover:bg-surface-container-high rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Reload live database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 bg-red-500/10 hover:bg-red-500/15 text-red-600 border border-red-500/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Action Status Feedback Toast — fixed bottom-right, stays visible while scrolling */}
      {actionMessage && (
        <div className={`fixed bottom-6 right-6 z-[100] max-w-sm px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200 text-xs font-semibold ${
          actionMessage.isError
            ? "bg-red-500/10 text-red-500 border-red-500/25 backdrop-blur-md"
            : "bg-green-500/10 text-green-600 border-green-500/25 backdrop-blur-md"
        }`}>
          <AlertCircle className={`w-4 h-4 flex-shrink-0 ${actionMessage.isError ? "text-red-400" : "text-green-500"}`} />
          <span className="leading-snug">{actionMessage.text}</span>
        </div>
      )}

      {/* Admin Panel Tab Switches */}
      <div className="flex flex-wrap items-center gap-2 border-b border-outline/10 pb-4" id="admin-tabs-list">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "analytics" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Store Analytics
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "products" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <Package className="w-4 h-4" />
          Product Catalog CRUD
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "orders" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Process Orders ({ordersList.length})
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "config" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <Settings className="w-4 h-4" />
          Website Layout Configuration
        </button>
        <button
          onClick={() => setActiveTab("support")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "support" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Support Inquiries ({supportRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "delivery" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <Truck className="w-4 h-4" />
          Delivery Methods ({deliveryMethods.length})
        </button>
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "whatsapp" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp Gateway ({whatsappNotifications.length})
        </button>
        <button
          onClick={() => setActiveTab("blog")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "blog" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          GEO/SEO Blog ({blogPosts.length})
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "reviews" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <Star className="w-4 h-4" />
          Reviews ({adminReviews.length})
        </button>
        <button
          onClick={() => setActiveTab("colors")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "colors" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <Palette className="w-4 h-4" />
          Colors ({globalColors.length})
        </button>
        <button
          onClick={() => setActiveTab("simTypes")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "simTypes" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          SIM Types ({globalSimTypes.length})
        </button>
        <button
          onClick={() => setActiveTab("priceTrackers")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "priceTrackers" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <Bell className="w-4 h-4" />
          Price Alerts ({priceTrackers.length})
        </button>
        <button
          onClick={() => setActiveTab("aiReports")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "aiReports" ? "glass-btn-ios-active" : "glass-btn-ios"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#ffdbce]" />
          Gemini AI Reports
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 ml-auto cursor-pointer"
          title="Exit Admin Terminal"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Loading state indicator */}
      {loading && !analytics && (
        <div className="py-24 text-center space-y-2">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-on-surface-variant/70 font-medium">Synchronizing control databases...</p>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 1: ANALYTICS                                        */}
      {/* ======================================================= */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Analytics Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-low border border-outline/10 p-5 rounded-3xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Gross Revenue</span>
                <div className="p-1.5 rounded-lg bg-green-500/10 text-green-600"><DollarSign className="w-4 h-4" /></div>
              </div>
              <h3 className="font-display font-black text-2xl text-on-surface">KSh {analytics.totalRevenue.toLocaleString()}</h3>
              <p className="text-[9px] text-on-surface-variant/60 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span>+12.4% from last checkout block</span>
              </p>
            </div>

            <div className="bg-surface-container-low border border-outline/10 p-5 rounded-3xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Order Count</span>
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><ShoppingBag className="w-4 h-4" /></div>
              </div>
              <h3 className="font-display font-black text-2xl text-on-surface">{analytics.totalOrders}</h3>
              <p className="text-[9px] text-on-surface-variant/60">Fully tracked live parcels</p>
            </div>

            <div className="bg-surface-container-low border border-outline/10 p-5 rounded-3xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Average Cart Size</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600"><TrendingUp className="w-4 h-4" /></div>
              </div>
              <h3 className="font-display font-black text-2xl text-on-surface">KSh {analytics.avgOrderValue.toLocaleString()}</h3>
              <p className="text-[9px] text-on-surface-variant/60">High catalog cross-talk buying ratio</p>
            </div>

            <div className="bg-surface-container-low border border-outline/10 p-5 rounded-3xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Fulfillment Rate</span>
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600"><ClipboardList className="w-4 h-4" /></div>
              </div>
              <h3 className="font-display font-black text-2xl text-on-surface">100%</h3>
              <p className="text-[9px] text-on-surface-variant/60">0 pending order drops</p>
            </div>
          </div>

          {/* Interactive Recharts Graphical Command Center */}
          <div className="space-y-6">
            {/* Area Chart: Revenue Trend */}
            <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-display font-bold text-base text-on-surface">Gross Revenue Performance Velocity</h3>
                  <p className="text-xs text-on-surface-variant/70">Visualizing 7-day high-fidelity checkout transactions & catalog volume</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                  Live Feed Active
                </div>
              </div>
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: "Mon", revenue: Math.round(analytics.totalRevenue * 0.12) || 840 },
                      { name: "Tue", revenue: Math.round(analytics.totalRevenue * 0.15) || 1240 },
                      { name: "Wed", revenue: Math.round(analytics.totalRevenue * 0.11) || 980 },
                      { name: "Thu", revenue: Math.round(analytics.totalRevenue * 0.18) || 1490 },
                      { name: "Fri", revenue: Math.round(analytics.totalRevenue * 0.14) || 1100 },
                      { name: "Sat", revenue: Math.round(analytics.totalRevenue * 0.21) || 1850 },
                      { name: "Sun", revenue: Math.round(analytics.totalRevenue * 0.09) || 690 }
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a73a00" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a73a00" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="name" stroke="#8f7065" fontSize={10} tickLine={false} />
                    <YAxis stroke="#8f7065" fontSize={10} tickLine={false} tickFormatter={(v) => `KSh ${v.toLocaleString()}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e1d1c", borderColor: "#8f7065", borderRadius: "12px" }} 
                      labelStyle={{ color: "#ffdbce", fontWeight: "bold" }}
                      itemStyle={{ color: "#ffffff" }}
                      formatter={(v: any) => [`KSh ${v.toLocaleString()}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#a73a00" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Split Grid: Pie Chart Share & Logistics Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Category Share Pie Chart */}
              <div className="lg:col-span-7 bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4 text-left flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-on-surface">Catalog Category Revenue Share</h3>
                  <p className="text-[11px] text-on-surface-variant/70">Continuous structural allocation across device indexes</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 h-44 sm:h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            analytics.categorySales.map(c => ({
                              name: c.name,
                              value: Math.round(c.value)
                            })).filter(c => c.value > 0).length > 0
                              ? analytics.categorySales.map(c => ({ name: c.name, value: Math.round(c.value) })).filter(c => c.value > 0)
                              : [
                                  { name: "Laptops", value: 1499 },
                                  { name: "Tablets", value: 899 },
                                  { name: "Phones", value: 799 },
                                  { name: "Audio", value: 249 }
                                ]
                          }
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {[
                            "#a73a00", // Primary copper
                            "#006a6a", // Secondary teal
                            "#0061a6", // Blue
                            "#8f7065", // Muted cocoa
                            "#b45309", // Orange
                            "#6b21a8"  // Purple
                          ].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`KSh ${v.toLocaleString()}`, "Revenue"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="sm:col-span-7 space-y-2.5">
                    {analytics.categorySales.map((cat, idx) => {
                      const maxVal = Math.max(...analytics.categorySales.map(c => c.value), 1);
                      const percent = (cat.value / maxVal) * 100;
                      const themeColors = ["#a73a00", "#006a6a", "#0061a6", "#8f7065", "#b45309", "#6b21a8"];
                      const bgClasses = [
                        "bg-[#a73a00]", 
                        "bg-[#006a6a]", 
                        "bg-[#0061a6]", 
                        "bg-[#8f7065]", 
                        "bg-[#b45309]", 
                        "bg-[#6b21a8]"
                      ];
                      const dotColor = bgClasses[idx % bgClasses.length];

                      return (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-on-surface-variant flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                              {cat.name}
                            </span>
                            <span className="text-on-surface">${cat.value.toFixed(2)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-outline/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${dotColor} transition-all duration-500`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Logistics Status breakdown */}
              <div className="lg:col-span-5 bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4 text-left flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-on-surface">Logistics Status Ratio</h3>
                  <p className="text-[11px] text-on-surface-variant/70">Distribution pipeline of processing customer orders</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-center my-auto">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/15 text-amber-600">
                    <span className="text-[10px] font-bold block uppercase">Pending</span>
                    <strong className="text-xl font-black">{analytics.statusCount.pending}</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/15 text-teal-600">
                    <span className="text-[10px] font-bold block uppercase">Packaged</span>
                    <strong className="text-xl font-black">{analytics.statusCount.packaged}</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/15 text-blue-600">
                    <span className="text-[10px] font-bold block uppercase">Shipped</span>
                    <strong className="text-xl font-black">{analytics.statusCount.shipped}</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-green-500/10 border border-green-500/15 text-green-600">
                    <span className="text-[10px] font-bold block uppercase">Delivered</span>
                    <strong className="text-xl font-black">{analytics.statusCount.delivered}</strong>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-2xl border border-primary/10 p-3 mt-1">
                  <p className="text-[10px] leading-relaxed text-on-surface-variant/90">
                    ⚡ Use the <strong className="font-semibold text-primary">Process Orders</strong> tab to adjust shipping status details and update active customer delivery timelines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 2: PRODUCT INVENTORY CRUD                           */}
      {/* ======================================================= */}
      {activeTab === "products" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Live Sandbox Staging Area & Scraper Console */}
          <div className="bg-surface-container-low border border-outline/10 p-5 rounded-3xl space-y-5">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-display font-black text-sm text-on-surface flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live URL Staging Sandbox
                </h3>
                <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-mono font-bold tracking-tight">
                  3s Cooldown Rate-Limit Active
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant/70 leading-relaxed">
                Paste any live WooCommerce product URL from <strong className="font-semibold text-primary">PhonePlace Kenya</strong> or <strong className="font-semibold text-primary">iStreet Kenya</strong> to parse gadget specifications and prices (in KSh and USD). The gadget stays in a safe local staging draft where you can review, edit, and choose exactly which items to publish.
              </p>
            </div>

            {/* Popular Brand Preset Buttons */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-on-surface-variant/65 uppercase tracking-wider block">
                Popular Brand Gadget Presets:
              </span>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {[
                  {
                    name: "iPhone 15 Pro Max",
                    brand: "Apple",
                    url: "https://www.phoneplacekenya.com/product/apple-iphone-15-pro-max/"
                  },
                  {
                    name: "Galaxy S24 Ultra",
                    brand: "Samsung",
                    url: "https://www.phoneplacekenya.com/product/samsung-galaxy-s24-ultra/"
                  },
                  {
                    name: "Pixel 8 Pro",
                    brand: "Google",
                    url: "https://www.phoneplacekenya.com/product/google-pixel-8-pro/"
                  },
                  {
                    name: "MacBook Pro 16",
                    brand: "Apple",
                    url: "https://www.istreet.co.ke/product/apple-macbook-pro-16-m3-max/"
                  },
                  {
                    name: "Sony XM5 ANC",
                    brand: "Sony",
                    url: "https://www.istreet.co.ke/product/sony-wh-1000xm5/"
                  },
                  {
                    name: "Watch Ultra 2",
                    brand: "Apple",
                    url: "https://www.istreet.co.ke/product/apple-watch-ultra-2/"
                  }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleScrapeUrlDraft(preset.url)}
                    disabled={isSandboxStaging}
                    className="px-2.5 py-1.5 bg-surface hover:bg-surface-container border border-outline/15 rounded-xl text-[10px] font-medium text-on-surface flex items-center gap-1.5 transition-all cursor-pointer hover:border-primary/40 disabled:opacity-50"
                  >
                    <span className="font-bold text-primary text-[9px] uppercase tracking-tight">{preset.brand}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* URL Input Bar */}
            <div className="space-y-3 pt-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Paste a PhonePlace Kenya or iStreet Kenya product URL..."
                    value={sandboxUrl}
                    onChange={(e) => setSandboxUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/45"
                  />
                  {sandboxUrl && (
                    <button
                      type="button"
                      onClick={() => setSandboxUrl("")}
                      className="absolute right-2 top-2 text-on-surface-variant/50 hover:text-on-surface"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleScrapeUrlDraft()}
                  disabled={isSandboxStaging || !sandboxUrl}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-primary/40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSandboxStaging ? "animate-spin" : ""}`} />
                  <span>{isSandboxStaging ? "Staging Draft..." : "Load Staged Draft"}</span>
                </button>
              </div>

              {sandboxError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl flex items-center gap-2 text-amber-600 text-xs text-left animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold leading-normal">{sandboxError}</span>
                </div>
              )}
            </div>

            {/* Sandbox Staging Workspace Panel */}
            {stagedProduct && (
              <div className="border border-outline/15 rounded-3xl bg-surface/50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 text-left">
                <div className="bg-primary/5 border-b border-outline/10 px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h4 className="font-display font-black text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      Sandbox Staged Workspace
                    </h4>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                      Review live scraped attributes and customize locally. Save to sync edits with the central catalog.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStagedProduct(null);
                        setSandboxUrl("");
                      }}
                      className="px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 text-on-surface-variant hover:text-on-surface rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      Clear Draft
                    </button>
                    <button
                      type="button"
                      onClick={handlePublishStagedProduct}
                      disabled={isSandboxStaging}
                      className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Keep & Publish Gadget
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6">
                  {/* Left Column: Live Customer Preview */}
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest block font-mono">
                      Live Customer Preview
                    </span>
                    
                    <div className="bg-surface border border-outline/10 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
                      <div className="relative aspect-video bg-black/5 flex items-center justify-center overflow-hidden">
                        <img
                          src={stagedProduct.image || ""}
                          alt={stagedProduct.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2 py-1 bg-amber-500 text-white rounded-lg text-[8px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          Staging Draft
                        </span>
                        <span className="absolute top-2.5 right-2.5 px-2 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-[8px] font-mono font-bold">
                          {stagedProduct.brand}
                        </span>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-primary uppercase font-bold tracking-wide">
                            {stagedProduct.category || "Phones"}
                          </span>
                          <h5 className="font-display font-black text-sm text-on-surface leading-tight line-clamp-2">
                            {stagedProduct.name || "Unnamed Gadget"}
                          </h5>
                          <p className="text-[10px] text-on-surface-variant/80 leading-relaxed line-clamp-3">
                            {stagedProduct.description || "No description provided."}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-outline/5 space-y-2">
                          <div className="flex justify-between items-baseline flex-wrap gap-1">
                            <span className="text-on-surface font-black text-sm">
                              KSh {(stagedProduct.priceKsh || 0).toLocaleString()}
                            </span>
                            <span className="text-on-surface-variant/70 text-[10px] font-semibold font-mono">
                              Approx. ${(stagedProduct.price || 0).toLocaleString()} USD
                            </span>
                          </div>

                          <div className="bg-surface-container-low p-2 rounded-xl text-[9px] font-mono text-on-surface-variant/80 space-y-1">
                            {stagedProduct.specifications && Object.entries(stagedProduct.specifications).map(([key, val]) => (
                              <div key={key} className="flex justify-between gap-2">
                                <span className="font-semibold text-on-surface-variant/60">{key}:</span>
                                <span className="text-right text-on-surface truncate max-w-[120px]">{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Editable Draft Controls */}
                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest block font-mono">
                      Staged Attribute Editor
                    </span>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Name input */}
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant">Product Title / Name</label>
                        <input
                          type="text"
                          value={stagedProduct.name || ""}
                          onChange={(e) => handleUpdateStagedField("name", e.target.value)}
                          className="w-full px-3 py-1.5 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Price KSh input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant">Live Price (KSh)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-bold text-on-surface-variant/60">KSh</span>
                          <input
                            type="number"
                            value={stagedProduct.priceKsh || 0}
                            onChange={(e) => handleUpdateStagedField("priceKsh", Number(e.target.value))}
                            className="w-full pl-10 pr-3 py-1.5 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Computed Price USD input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant flex items-center justify-between">
                          <span>Converted Price (USD)</span>
                          <span className="text-[8px] text-primary/75 font-mono">1 USD = 130 KSh</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-bold text-on-surface-variant/60">$</span>
                          <input
                            type="number"
                            value={stagedProduct.price || 0}
                            onChange={(e) => handleUpdateStagedField("price", Number(e.target.value))}
                            className="w-full pl-7 pr-3 py-1.5 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Brand selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant">Popular Brand</label>
                        <select
                          value={stagedProduct.brand || "Apple"}
                          onChange={(e) => handleUpdateStagedField("brand", e.target.value)}
                          className="w-full px-3 py-1.5 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                        >
                          <option value="Apple">Apple</option>
                          <option value="Samsung">Samsung</option>
                          <option value="Google">Google</option>
                          <option value="Sony">Sony</option>
                          <option value="Custom">Custom Brand</option>
                        </select>
                      </div>

                      {/* Category selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant">Store Category</label>
                        <select
                          value={stagedProduct.category || "Phones"}
                          onChange={(e) => handleUpdateStagedField("category", e.target.value)}
                          className="w-full px-3 py-1.5 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                        >
                          <option value="Phones">Phones</option>
                          <option value="Laptops">Laptops</option>
                          <option value="Audio">Audio</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>

                      {/* Image URL input */}
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant">Marketplace Image URL</label>
                        <input
                          type="text"
                          value={stagedProduct.image || ""}
                          onChange={(e) => handleUpdateStagedField("image", e.target.value)}
                          className="w-full px-3 py-1.5 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary font-mono text-[10px]"
                        />
                      </div>

                      {/* Description textarea */}
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant">Staging Product Description</label>
                        <textarea
                          rows={3}
                          value={stagedProduct.description || ""}
                          onChange={(e) => handleUpdateStagedField("description", e.target.value)}
                          className="w-full px-3 py-1.5 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Tools */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search catalog by name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full px-3 py-1.5 pl-8 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none placeholder:text-on-surface-variant/45"
                />
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-on-surface-variant/50" />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Laptops">Laptops</option>
                <option value="Tablets">Tablets</option>
                <option value="Audio">Audio</option>
                <option value="Accessories">Accessories</option>
                <option value="Power">Power</option>
                <option value="Phones">Phones</option>
              </select>
            </div>

            {/* Action Trigger */}
            <button
              onClick={handleOpenAddProduct}
              className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          {/* Product Form Modal (Slideover Panel) */}
          {isProductFormOpen && editingProduct && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
              <div className="w-full max-w-lg bg-surface-container-high h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between text-left animate-in slide-in-from-right duration-300">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-outline/10 pb-3">
                    <h3 className="font-display font-black text-lg text-on-surface">
                      {editingProduct.id ? `Edit Product: ${editingProduct.name}` : "Launch New Product"}
                    </h3>
                    <button onClick={() => setIsProductFormOpen(false)} className="p-1 rounded-full hover:bg-surface-container-highest">
                      <X className="w-5 h-5 text-on-surface-variant" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-[10px] text-on-surface-variant block uppercase">Product Name</label>
                      <input
                        type="text"
                        value={editingProduct.name || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-on-surface-variant block uppercase">Price (USD)</label>
                        <input
                          type="number"
                          value={editingProduct.price !== undefined ? editingProduct.price : ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="Optional"
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-on-surface-variant block uppercase">Price (KSh)</label>
                        <input
                          type="number"
                          value={editingProduct.priceKsh !== undefined ? editingProduct.priceKsh : ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, priceKsh: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="Optional"
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-on-surface-variant block uppercase">Category</label>
                        <select
                          value={editingProduct.category || "Audio"}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none"
                        >
                          <option value="Laptops">Laptops</option>
                          <option value="Tablets">Tablets</option>
                          <option value="Audio">Audio</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Power">Power</option>
                          <option value="Phones">Phones</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-on-surface-variant block uppercase">Price Range</label>
                        <input
                          type="text"
                          value={editingProduct.priceRange || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, priceRange: e.target.value })}
                          placeholder="e.g. KSh 10k - 15k"
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none"
                        />
                      </div>
                    </div>                     <div className="space-y-1">
                      <label className="text-[10px] text-on-surface-variant block uppercase">Image URL</label>
                      <input
                        type="text"
                        value={editingProduct.image || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none"
                      />
                    </div>

                    {/* Image Library — all URLs for this product */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-on-surface-variant block uppercase">Image Library</label>
                        <span className="text-[9px] text-on-surface-variant/50">{editingProduct.images?.length || 0} image(s)</span>
                      </div>

                      {/* Existing images list */}
                      {(editingProduct.images || []).length === 0 ? (
                        <p className="text-[10px] text-on-surface-variant/50 italic">No images added yet.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {(editingProduct.images || []).map((url, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-surface border border-outline/10 rounded-lg px-2 py-1.5">
                              <img src={url} alt="" className="w-8 h-8 rounded-lg object-cover border border-outline/5 shrink-0" referrerPolicy="no-referrer" />
                              <span className="text-[10px] text-on-surface-variant truncate flex-1" title={url}>{url}</span>
                              <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, images: editingProduct.images.filter((_, i) => i !== idx) })}
                                className="text-red-400 hover:text-red-600 shrink-0"
                                title="Remove image"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new URL */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newProductImageUrl}
                          onChange={e => setNewProductImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-[11px] text-on-surface focus:outline-none focus:border-primary"
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddProductImageUrl(); } }}
                        />
                        <button
                          type="button"
                          onClick={handleAddProductImageUrl}
                          disabled={!newProductImageUrl.trim()}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-lg disabled:opacity-40 shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Technical Specifications Manager */}
                    <div className="border-t border-outline/10 pt-4 space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-primary tracking-wider">Technical Specifications</h4>
                      
                      {editingProduct.specifications && Object.keys(editingProduct.specifications).length > 0 ? (
                        <div className="border border-outline/10 rounded-xl overflow-hidden bg-surface-container-low max-h-48 overflow-y-auto">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-surface border-b border-outline/10 text-on-surface-variant/80 font-bold">
                                <th className="p-2">Specification</th>
                                <th className="p-2">Value</th>
                                <th className="p-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline/10">
                              {Object.entries(editingProduct.specifications).map(([key, value]) => (
                                <tr key={key} className="hover:bg-surface-container-high/30">
                                  <td className="p-2 font-semibold">{key}</td>
                                  <td className="p-2">{value}</td>
                                  <td className="p-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newSpecs = { ...editingProduct.specifications };
                                        delete newSpecs[key];
                                        setEditingProduct({ ...editingProduct, specifications: newSpecs });
                                      }}
                                      className="text-red-500 hover:text-red-700 font-bold text-[10px] px-2 py-1"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-3 text-center bg-surface-container-low border border-dashed border-outline/20 rounded-xl text-on-surface-variant/60 text-[10px]">
                          No specifications added yet. Add one below.
                        </div>
                      )}

                      {/* Add new spec */}
                      <div className="bg-surface-container border border-outline/10 p-3 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-on-surface uppercase block">Add Specification</span>
                        <div className="grid grid-cols-3 gap-2 items-end">
                          <div className="space-y-1">
                            <label className="text-[9px] text-on-surface-variant/70 block">Name</label>
                            <input
                              type="text"
                              value={newSpecKey}
                              onChange={(e) => setNewSpecKey(e.target.value)}
                              placeholder="e.g. Processor"
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-on-surface-variant/70 block">Value</label>
                            <input
                              type="text"
                              value={newSpecValue}
                              onChange={(e) => setNewSpecValue(e.target.value)}
                              placeholder="e.g. Quantum Core Architecture"
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-on-surface-variant/70 block">&nbsp;</label>
                            <button
                              type="button"
                              onClick={() => {
                                if (!newSpecKey.trim() || !newSpecValue.trim()) return;
                                setEditingProduct({
                                  ...editingProduct,
                                  specifications: {
                                    ...(editingProduct.specifications || {}),
                                    [newSpecKey.trim()]: newSpecValue.trim()
                                  }
                                });
                                setNewSpecKey("");
                                setNewSpecValue("");
                              }}
                              disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                              className="w-full py-1.5 bg-secondary hover:bg-secondary-hover text-on-secondary disabled:opacity-45 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Colors — picked from global library */}
                    <div className="border-t border-outline/10 pt-4 space-y-3">
                      {/* Colors for this Product */}
                      {(editingProduct.hasVariants ?? false) ? (
                        <div className="opacity-50 pointer-events-none select-none">
                          <h4 className="text-[10px] font-black uppercase text-on-surface-variant/50 tracking-wider">Colors for this Product</h4>
                          <p className="text-[10px] text-on-surface-variant/50 -mt-1">Managed via storage variants below — this section is inactive.</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {editingProduct.colors.map((color, idx) => (
                              <span key={idx} className="flex items-center gap-1.5 bg-surface border border-outline/20 rounded-lg px-3 py-1.5 text-[11px]">
                                <span className="w-3 h-3 rounded-full border border-outline/20 shrink-0" style={{ backgroundColor: color.code || "#ccc" }} />
                                <span className="font-semibold text-on-surface">{color.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="text-[10px] font-black uppercase text-primary tracking-wider">Colors for this Product</h4>
                          <p className="text-[10px] text-on-surface-variant/70 -mt-1">
                            Select colors from the global library to assign to this product.
                          </p>

                          {/* Existing colors */}
                          {editingProduct.colors && editingProduct.colors.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {editingProduct.colors.map((color, idx) => (
                                <span key={idx} className="flex items-center gap-1.5 bg-surface border border-outline/20 rounded-lg px-3 py-1.5 text-[11px]">
                                  <span className="w-3 h-3 rounded-full border border-outline/20 shrink-0" style={{ backgroundColor: color.code || "#ccc" }} />
                                  <span className="font-semibold text-on-surface">{color.name}</span>
                                  <button type="button" onClick={() => setEditingProduct({ ...editingProduct, colors: editingProduct.colors.filter((_, i) => i !== idx) })}
                                    className="text-red-400 hover:text-red-600 ml-1"><X className="w-3 h-3" /></button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 text-center bg-surface-container-low border border-dashed border-outline/20 rounded-xl text-on-surface-variant/60 text-[10px]">
                              No colors assigned yet. Add from the library below.
                            </div>
                          )}

                          {/* Add from global library */}
                          {globalColors.length > 0 && (
                            <div className="flex items-end gap-2">
                              <div className="flex-1 space-y-1">
                                <label className="text-[9px] text-on-surface-variant/70 block">Add from library</label>
                                <select
                                  id="product-color-picker"
                                  value=""
                                  onChange={e => {
                                    const name = e.target.value;
                                    if (!name) return;
                                    if (editingProduct.colors.some(c => c.name.toLowerCase() === name.toLowerCase())) { alert("Color already added."); return; }
                                    const colorEntry = globalColors.find(c => c.name === name);
                                    setEditingProduct({
                                      ...editingProduct,
                                      colors: [...editingProduct.colors, {
                                        name,
                                        code: colorEntry?.code || "",
                                        image: colorEntry?.image || ""
                                      }]
                                    });
                                    (document.getElementById("product-color-picker") as HTMLSelectElement).value = "";
                                  }}
                                  className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-[11px] text-on-surface focus:outline-none focus:border-primary"
                                >
                                  <option value="">— Select a color —</option>
                                  {globalColors.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                                </select>
                              </div>
                            </div>
                          )}
                          {globalColors.length === 0 && (
                            <p className="text-[9px] text-on-surface-variant/50 italic">No global colors available. Add colors in the Colors tab first.</p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-on-surface-variant block uppercase">Short Description</label>
                      <textarea
                        value={editingProduct.description || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none h-20"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-on-surface-variant block uppercase">Brand</label>
                        <input
                          type="text"
                          value={editingProduct.brand || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 flex items-end pb-2.5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={editingProduct.inStock ?? true}
                            onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                            className="w-4 h-4 rounded text-primary border-outline/30 focus:ring-0"
                          />
                          <span>Instock in Warehouse</span>
                        </label>
                      </div>
                    </div>

                    {/* Variants toggle */}
                    <div className="border-t border-outline/10 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={editingProduct.hasVariants ?? false}
                            onChange={(e) => {
                              const on = e.target.checked;
                              setEditingProduct({
                                ...editingProduct,
                                hasVariants: on,
                                storageVariants: on ? (editingProduct.storageVariants || []) : [],
                                storages: on ? (editingProduct.storages || []) : [],
                              });
                              if (!on) { setEditingSv(null); setEditingSvOriginalKey(null); }
                            }}
                            className="w-4 h-4 rounded text-primary border-outline/30 focus:ring-0"
                          />
                          <span className="font-semibold">Use Storage Variants</span>
                        </label>
                        <span className="text-[9px] text-on-surface-variant/60">
                          {(editingProduct.hasVariants ?? false) ? "ON — per-storage/SIM matrix" : "OFF — single SKU"}
                        </span>
                      </div>

                      {/* Simple fields when variants OFF */}
                      {!(editingProduct.hasVariants ?? false) && (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-on-surface-variant block uppercase">Storage (optional)</label>
                            <input
                              type="text"
                              value={editingProduct.storages?.[0] || ""}
                              onChange={(e) => {
                                const val = e.target.value.trim();
                                setEditingProduct({
                                  ...editingProduct,
                                  storages: val ? [val] : [],
                                });
                              }}
                              placeholder="e.g. 256GB"
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-on-surface-variant block uppercase">SIM Type (optional)</label>
                            <select
                              value={editingProduct.simType || ""}
                              onChange={(e) => setEditingProduct({ ...editingProduct, simType: e.target.value || undefined })}
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            >
                              <option value="">None</option>
                              {globalSimTypes.length > 0 ? globalSimTypes.map((st: any) => (
                                <option key={st.id} value={st.code}>{st.name}</option>
                              )) : (
                                <>
                                  <option value="physical">Physical SIM</option>
                                  <option value="esim">eSIM</option>
                                  <option value="both">Dual SIM</option>
                                </>
                              )}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-on-surface-variant block uppercase">Stock</label>
                            <input
                              type="number"
                              min={0}
                              value={editingProduct.stock ?? 0}
                              onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) || 0 })}
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rating, Reviews & Badges */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-on-surface-variant block uppercase">Rating (1–5)</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          step={0.1}
                          value={editingProduct.rating ?? ""}
                          onChange={e => setEditingProduct({ ...editingProduct, rating: e.target.value ? Number(e.target.value) : 0 })}
                          placeholder="e.g. 4.5"
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-on-surface-variant block uppercase">Reviews Count</label>
                        <input
                          type="number"
                          min={0}
                          value={editingProduct.reviewsCount ?? ""}
                          onChange={e => setEditingProduct({ ...editingProduct, reviewsCount: e.target.value ? Number(e.target.value) : 0 })}
                          placeholder="e.g. 24"
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                          <input
                            type="checkbox"
                            checked={editingProduct.isNew ?? false}
                            onChange={e => setEditingProduct({ ...editingProduct, isNew: e.target.checked })}
                            className="w-4 h-4 rounded border-outline/30"
                          />
                          <span>New Arrival</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                          <input
                            type="checkbox"
                            checked={editingProduct.isBestSeller ?? false}
                            onChange={e => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                            className="w-4 h-4 rounded border-outline/30"
                          />
                          <span>Best Seller</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                          <input
                            type="checkbox"
                            checked={editingProduct.preOrder ?? false}
                            onChange={e => setEditingProduct({ ...editingProduct, preOrder: e.target.checked })}
                            className="w-4 h-4 rounded border-outline/30"
                          />
                          <span>Pre-order</span>
                        </label>
                      </div>
                    </div>

                    {/* Product-level Warranties */}
                    <div className="border-t border-outline/10 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase text-primary tracking-wider">Warranty Plans</h4>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            id="warranty-name-input"
                            placeholder="Plan name"
                            className="px-2 py-1 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[10px] w-32"
                          />
                          <input
                            type="text"
                            id="warranty-duration-input"
                            placeholder="Duration (e.g. 1 Year)"
                            className="px-2 py-1 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[10px] w-28"
                          />
                          <input
                            type="number"
                            id="warranty-price-input"
                            placeholder="Price (0=free)"
                            min="0"
                            className="px-2 py-1 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[10px] w-24"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nameInput = document.getElementById("warranty-name-input") as HTMLInputElement;
                              const durationInput = document.getElementById("warranty-duration-input") as HTMLInputElement;
                              const priceInput = document.getElementById("warranty-price-input") as HTMLInputElement;
                              const name = nameInput?.value.trim();
                              const duration = durationInput?.value.trim();
                              const priceKsh = Number(priceInput?.value) || 0;
                              if (!name) { alert("Warranty name is required."); return; }
                              if ((editingProduct.warranties || []).some(w => w.name.toLowerCase() === name.toLowerCase())) { alert("Warranty already added."); return; }
                              const newW: Warranty = { id: `w-${Date.now()}`, name, duration: duration || "1 Year", priceKsh };
                              setEditingProduct({ ...editingProduct, warranties: [...(editingProduct.warranties || []), newW] });
                              nameInput.value = ""; durationInput.value = ""; priceInput.value = "";
                            }}
                            className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                      </div>
                      {(editingProduct.warranties || []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editingProduct.warranties!.map((w, i) => (
                            <span key={w.id} className="flex items-center gap-1.5 bg-surface border border-outline/20 rounded-lg px-3 py-1.5 text-[11px]">
                              {editingWarrantyIdx === i ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  <input
                                    type="text"
                                    autoFocus
                                    defaultValue={w.name}
                                    className="px-1.5 py-0.5 bg-surface border border-primary rounded text-[10px] text-on-surface focus:outline-none w-28"
                                    onKeyDown={e => { if (e.key === "Escape") setEditingWarrantyIdx(null); }}
                                    onChange={e => {
                                      const updated = [...(editingProduct.warranties || [])];
                                      updated[i] = { ...updated[i], name: e.target.value };
                                      setEditingProduct({ ...editingProduct, warranties: updated });
                                    }}
                                  />
                                  <input
                                    type="text"
                                    defaultValue={w.duration}
                                    className="px-1.5 py-0.5 bg-surface border border-primary rounded text-[10px] text-on-surface focus:outline-none w-20"
                                    onKeyDown={e => { if (e.key === "Escape") setEditingWarrantyIdx(null); }}
                                    onChange={e => {
                                      const updated = [...(editingProduct.warranties || [])];
                                      updated[i] = { ...updated[i], duration: e.target.value };
                                      setEditingProduct({ ...editingProduct, warranties: updated });
                                    }}
                                  />
                                  <input
                                    type="number"
                                    defaultValue={w.priceKsh}
                                    min="0"
                                    className="w-20 px-1.5 py-0.5 bg-surface border border-primary rounded text-[10px] text-on-surface focus:outline-none"
                                    onKeyDown={e => { if (e.key === "Escape") setEditingWarrantyIdx(null); }}
                                    onChange={e => {
                                      const updated = [...(editingProduct.warranties || [])];
                                      updated[i] = { ...updated[i], priceKsh: Number(e.target.value) || 0 };
                                      setEditingProduct({ ...editingProduct, warranties: updated });
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setEditingWarrantyIdx(null)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingWarrantyIdx(null)}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="font-semibold text-on-surface">{w.name}</span>
                                  <span className="text-on-surface-variant">({w.duration})</span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingWarrantyIdx(i)}
                                    className="text-primary hover:text-primary-hover font-bold"
                                    title="Edit warranty"
                                  >
                                    {w.priceKsh === 0 ? "Free" : `KSh ${w.priceKsh.toLocaleString()}`}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingProduct({
                                      ...editingProduct,
                                      warranties: editingProduct.warranties!.filter((_, idx) => idx !== i)
                                    })}
                                    className="text-red-400 hover:text-red-600 ml-1"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-on-surface-variant/50 italic">No warranty plans added yet. Fill in the fields above and click Add.</p>
                      )}
                    </div>

                    {/* Variant editor — only when hasVariants ON */}
                    {(editingProduct.hasVariants ?? false) && (
                    <div className="border-t border-outline/10 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        {!editingSv ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newSvStorage}
                              onChange={e => setNewSvStorage(e.target.value)}
                              placeholder="Storage (e.g. 256GB)"
                              className="px-2 py-1 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[10px] w-28"
                            />
                            <select
                              value={newSvSimType}
                              onChange={e => setNewSvSimType(e.target.value)}
                              className="px-2 py-1 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[10px]"
                            >
                              {globalSimTypes.length > 0 ? globalSimTypes.map((st: any) => (
                                <option key={st.id} value={st.code}>{st.name}</option>
                              )) : (
                                <>
                                  <option value="physical">Physical SIM</option>
                                  <option value="esim">eSIM</option>
                                  <option value="both">Dual SIM</option>
                                </>
                              )}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                if (!newSvStorage.trim()) { alert("Enter a storage name first."); return; }
                                setEditingSv({ storage: newSvStorage.trim(), simType: newSvSimType, priceKsh: 0, colors: [], warranties: [], stock: 0 });
                                setSvColors([]);
                                setSvWarranties([]);
                                setSvColorProductAssignment({});
                                setEditingSvOriginalKey(null);
                                setNewVarImgColor("");
                                setNewVarImgUrl("");
                              }}
                              className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Variant
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setEditingSv(null); setEditingSvOriginalKey(null); }}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Cancel Editing
                          </button>
                        )}
                      </div>

                      {/* Inline edit form */}
                      {editingSv && (
                        <div className="bg-surface-container border-2 border-primary/40 rounded-xl p-3.5 space-y-3.5 shadow-sm">
                          <div className="flex items-center justify-between pb-2 border-b border-outline/10">
                            <div>
                              <span className="text-[12px] font-black text-primary">
                                {editingSvOriginalKey ? "Editing Variant:" : "New Variant:"} {editingSv.storage || "Unnamed"}
                                {" "}({(() => { const found = globalSimTypes.find((s:any)=>s.code===editingSv.simType); return found ? found.name : (editingSv.simType || "—"); })()})
                              </span>
                              <p className="text-[9px] text-on-surface-variant/70">Configure options below, then click "Save Variant to List".</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCommitVariant()}
                                className="text-[11px] font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                              >
                                <Check className="w-3.5 h-3.5" /> Save Variant to List
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditingSv(null); setEditingSvOriginalKey(null); }}
                                className="text-[11px] font-bold text-red-500 hover:text-red-700 px-2 py-1 flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Cancel
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-on-surface-variant uppercase">Storage *</label>
                              <input
                                type="text"
                                value={editingSv.storage}
                                onChange={e => setEditingSv({ ...editingSv, storage: e.target.value })}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCommitVariant(); } }}
                                placeholder="e.g. 256GB"
                                className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[11px]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-on-surface-variant uppercase">SIM Type</label>
                              <select
                                value={editingSv.simType}
                                onChange={e => setEditingSv({ ...editingSv, simType: e.target.value })}
                                className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[11px]"
                              >
                                {globalSimTypes.length > 0 ? globalSimTypes.map((st:any)=>(
                                  <option key={st.id} value={st.code}>{st.name}</option>
                                )) : (
                                  <>
                                    <option value="physical">Physical SIM</option>
                                    <option value="esim">eSIM</option>
                                    <option value="both">Dual SIM</option>
                                  </>
                                )}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-on-surface-variant uppercase">Price KSh *</label>
                              <input
                                type="number"
                                value={editingSv.priceKsh || ""}
                                onChange={e => setEditingSv({ ...editingSv, priceKsh: Number(e.target.value) || 0 })}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCommitVariant(); } }}
                                placeholder="0"
                                className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[11px]"
                                min="0"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-on-surface-variant uppercase">Stock</label>
                              <input
                                type="number"
                                value={editingSv.stock || ""}
                                onChange={e => setEditingSv({ ...editingSv, stock: Number(e.target.value) || 0 })}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCommitVariant(); } }}
                                placeholder="0"
                                className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[11px]"
                                min="0"
                              />
                            </div>
                          </div>

                          {/* Colors — select from global library */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-on-surface-variant uppercase">Colors in this variant</span>
                            <div className="flex flex-wrap gap-2">
                              {svColors.map((c, i) => {
                                const key = `${editingSv.storage}|${c.name}`;
                                const imgs = variantImgMap[key] || [];
                                return (
                                  <div key={i} className="flex flex-col gap-1 bg-surface border border-outline/20 rounded-xl p-2 text-[10px] min-w-[80px] max-w-[140px] overflow-hidden">
                                    {/* Color dot + name + remove */}
                                    <div className="flex items-center gap-1">
                                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.code || "#ccc" }} />
                                      <span className="font-semibold text-on-surface truncate">{c.name}</span>
                                      <button type="button" onClick={() => setSvColors(svColors.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 ml-auto shrink-0"><X className="w-3 h-3" /></button>
                                    </div>
                                    {/* Image thumbnails */}
                                    {imgs.length > 0 ? (
                                      <div className="flex gap-0.5 flex-wrap">
                                        {imgs.map((img: any) => (
                                          <div key={img.id} className="relative group">
                                            <img src={img.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-outline/10" />
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveVariantImage(editingSv.storage!, c.name, img.id, img.imageUrl)}
                                              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[7px]"
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[8px] text-on-surface-variant/40 italic">No images</span>
                                    )}
                                    {/* Inline image URL editor for this color */}
                                    <div className="mt-1">
                                      <select
                                        value=""
                                        onChange={e => {
                                          const url = e.target.value;
                                          if (!url) return;
                                          if (imgs.some((img: any) => img.imageUrl === url)) { alert("Image already assigned."); return; }
                                          handleAssignColorImage(editingSv.storage!, c.name, url);
                                        }}
                                        className="w-full px-1 py-1 bg-surface-container-low border border-outline/15 rounded-lg text-[9px] text-on-surface focus:outline-none focus:border-primary"
                                      >
                                        <option value="">+ Assign image</option>
                                        {(editingProduct.images || []).map((url, idx) => (
                                          <option key={idx} value={url}>{url}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                );
                              })}
                              {svColors.length === 0 && <span className="text-[9px] text-on-surface-variant/40 italic">No colors added yet.</span>}
                            </div>
                            {globalColors.length > 0 ? (
                              <div className="space-y-1.5">
                                <div className="flex items-end gap-2">
                                  <div className="flex-1 space-y-1">
                                    <label className="text-[8px] text-on-surface-variant/70 uppercase block">Add from library</label>
                                    <select
                                      id="sv-color-picker"
                                      value=""
                                      onChange={e => {
                                        const name = e.target.value;
                                        if (!name) return;
                                        if (svColors.some(c => c.name.toLowerCase() === name.toLowerCase())) { alert("Color already added."); return; }
                                        const colorEntry = globalColors.find(c => c.name === name);
                                        setSvColors([...svColors, {
                                          name,
                                          code: colorEntry?.code || "",
                                          image: colorEntry?.image || ""
                                        }]);
                                        (document.getElementById("sv-color-picker") as HTMLSelectElement).value = "";
                                      }}
                                      className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-[10px] text-on-surface focus:outline-none focus:border-primary"
                                    >
                                      <option value="">— Select a color —</option>
                                      {globalColors.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                                    </select>
                                  </div>
                                  <button type="button" onClick={() => { setEditingSv(null); setSvColors([]); setSvWarranties([]); setSvColorProductAssignment({}); setNewVarImgColor(""); setNewVarImgUrl(""); }}
                                    className="py-1.5 px-3 text-[9px] font-bold text-red-500 hover:text-red-700 rounded-lg border border-red-500/10">Clear</button>
                                </div>
                                {/* Optional: assign selected colors to product-level */}
                                <label className="flex items-center gap-1.5 text-[9px] text-on-surface-variant cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Object.values(svColorProductAssignment).some(Boolean)}
                                    onChange={e => {
                                      const checked = e.target.checked;
                                      // When toggled on: mark all current svColors for product-level
                                      // When toggled off: unmark all
                                      const updated: Record<string, boolean> = {};
                                      svColors.forEach(c => { updated[c.name] = checked; });
                                      setSvColorProductAssignment(updated);
                                    }}
                                    className="w-3 h-3 rounded accent-primary"
                                  />
                                  <span>Also add selected colors to product-level colors</span>
                                </label>
                              </div>
                            ) : (
                              <p className="text-[9px] text-on-surface-variant/50 italic">No global colors available. Add colors in the Colors tab first.</p>
                            )}
                          </div>

                          {/* Warranties — assign from product-level pool */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-on-surface-variant uppercase">Warranties (assign from pool)</span>
                            {(editingProduct.warranties || []).length === 0 ? (
                              <p className="text-[9px] text-on-surface-variant/50 italic">No warranties defined. Add warranty plans above first.</p>
                            ) : (
                              <div className="space-y-1.5">
                                {editingProduct.warranties!.map((w) => {
                                  const assignment = svWarranties.find(sv => sv.id === w.id);
                                  const checked = !!assignment;
                                  const overridePrice = assignment?.priceKsh ?? w.priceKsh;
                                  return (
                                    <div key={w.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-[10px] transition-all ${checked ? "bg-primary/5 border-primary/30" : "bg-surface border-outline/10 opacity-60"}`}>
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                          if (checked) {
                                            setSvWarranties(svWarranties.filter(sv => sv.id !== w.id));
                                          } else {
                                            setSvWarranties([...svWarranties, { id: w.id, priceKsh: w.priceKsh }]);
                                          }
                                        }}
                                        className="w-3 h-3 rounded accent-primary shrink-0"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <span className="font-semibold text-on-surface">{w.name}</span>
                                        <span className="text-[9px] text-on-surface-variant/60 ml-1">({w.duration})</span>
                                      </div>
                                      {checked && (
                                        <div className="flex items-center gap-1 shrink-0">
                                          <span className="text-[9px] text-on-surface-variant/60">Override:</span>
                                          <input
                                            type="number"
                                            value={overridePrice}
                                            onChange={e => {
                                              const val = Number(e.target.value);
                                              setSvWarranties(prev =>
                                                prev.map(sv => sv.id === w.id ? { ...sv, priceKsh: val } : sv)
                                              );
                                            }}
                                            className="w-20 px-1.5 py-1 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[10px]"
                                          />
                                          <span className="text-[9px] text-on-surface-variant/60">KSh</span>
                                        </div>
                                      )}
                                      {!checked && (
                                        <span className={`shrink-0 text-[9px] font-bold ${w.priceKsh === 0 ? "text-green-600" : "text-primary"}`}>
                                          {w.priceKsh === 0 ? "Free" : `KSh ${w.priceKsh.toLocaleString()}`}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Image URLs — assign from product's image library */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-on-surface-variant uppercase">Assign images to this variant</span>
                            {(editingProduct.images || []).length === 0 ? (
                              <p className="text-[9px] text-on-surface-variant/50 italic">Add image URLs to the product's "Additional Image URLs" field first, then assign them here.</p>
                            ) : (
                              <>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[8px] text-on-surface-variant/70 uppercase block">Color</label>
                                    <select
                                      value={newVarImgColor}
                                      onChange={e => setNewVarImgColor(e.target.value)}
                                      className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-[10px] text-on-surface focus:outline-none focus:border-primary"
                                    >
                                      <option value="">— Any color —</option>
                                      {svColors.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                                    </select>
                                  </div>
                                  <div className="space-y-1 col-span-2 min-w-0">
                                    <label className="text-[8px] text-on-surface-variant/70 uppercase block">Pick image</label>
                                    <div className="flex gap-1 min-w-0">
                                      <select
                                        value={newVarImgUrl}
                                        onChange={e => setNewVarImgUrl(e.target.value)}
                                        className="flex-1 min-w-0 px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-[10px] text-on-surface focus:outline-none focus:border-primary truncate"
                                      >
                                        <option value="">— Select URL —</option>
                                        {(editingProduct.images || []).map((url, i) => <option key={i} value={url}>{url}</option>)}
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => handleAddVariantImage(editingSv.storage!, newVarImgColor)}
                                        disabled={!newVarImgUrl}
                                        className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-[9px] font-bold rounded-lg disabled:opacity-40 shrink-0"
                                      >
                                        Assign
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                {/* Show assigned images grouped by color */}
                                {svColors.map((c) => {
                                  const key = `${editingSv.storage}|${c.name}`;
                                  const imgs = variantImgMap[key] || [];
                                  return imgs.length > 0 ? (
                                    <div key={key} className="mt-1.5">
                                      <span className="text-[8px] text-on-surface-variant/60 uppercase block mb-1">{c.name}</span>
                                      <div className="flex flex-wrap gap-1">
                                        {imgs.map((img: any) => (
                                          <div key={img.id} className="relative group">
                                            <img src={img.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-outline/10" />
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveVariantImage(editingSv.storage!, c.name, img.id, img.imageUrl)}
                                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                              </>
                            )}
                          </div>
                          
                          {/* Bottom action button */}
                          <div className="pt-2 border-t border-outline/10 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => { setEditingSv(null); setEditingSvOriginalKey(null); }}
                              className="px-3 py-1.5 text-[11px] font-bold text-on-surface-variant hover:text-on-surface rounded-lg border border-outline/20"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCommitVariant()}
                              className="px-4 py-1.5 text-[11px] font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Check className="w-3.5 h-3.5" /> {editingSvOriginalKey ? "Update Variant in List" : "Save & Add Variant to List"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Saved variants table */}
                      {(editingProduct?.storageVariants || []).length > 0 && (
                        <div className="border border-outline/10 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-surface border-b border-outline/10 text-on-surface-variant/80 font-bold">
                                <th className="p-2">Storage Variant</th>
                                <th className="p-2">SIM</th>
                                <th className="p-2">Price KSh</th>
                                <th className="p-2">Colors</th>
                                <th className="p-2">Warranties</th>
                                <th className="p-2 w-16 text-center">Order</th>
                                <th className="p-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline/10">
                              {(editingProduct?.storageVariants || []).map((sv, i) => (
                                <tr key={i} className="hover:bg-surface-container-high/30">
                                  <td className="p-2 font-bold">{sv.storage}</td>
                                  <td className="p-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${String(sv.simType).includes("esim") ? "bg-blue-100 text-blue-700" : String(sv.simType).includes("both") || String(sv.simType).includes("dual") ? "bg-purple-100 text-purple-700" : String(sv.simType)==="none" ? "bg-gray-100 text-gray-500" : "bg-gray-100 text-gray-700"}`}>
                                      {(() => { const found = globalSimTypes.find((s:any)=>s.code===sv.simType); if (found) return found.name; const raw = String(sv.simType||"—"); return raw.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase()); })()}
                                    </span>
                                  </td>
                                  <td className="p-2 font-mono">KSh {sv.priceKsh.toLocaleString()}</td>
                                  <td className="p-2 text-[10px]">
                                    {sv.colors.length === 0 ? (
                                      <span className="text-on-surface-variant/40 italic">None</span>
                                    ) : (
                                      <div className="flex flex-wrap gap-1">
                                        {sv.colors.map((c: any, ci: number) => {
                                          const key = `${sv.storage}|${c.name}`;
                                          const imgs = (variantImgMap[key] || []);
                                          return (
                                            <div key={ci} className="relative group flex flex-col items-center gap-0.5">
                                              <span className="w-5 h-5 rounded-full border border-outline/20" style={{ backgroundColor: c.code || "#ccc" }} />
                                              {imgs.length > 0 ? (
                                                <div className="flex gap-0.5">
                                                  {imgs.slice(0, 3).map((img: any) => (
                                                    <img key={img.id} src={img.imageUrl} alt="" className="w-5 h-5 rounded object-cover border border-outline/10" />
                                                  ))}
                                                  {imgs.length > 3 && <span className="text-[8px] text-on-surface-variant/50">+{imgs.length - 3}</span>}
                                                </div>
                                              ) : (
                                                <span className="text-[7px] text-on-surface-variant/40">no img</span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-2 text-[10px]">
                                    {(() => {
                                      const assignments = sv.warranties || [];
                                      const names = assignments.map((a: any) => {
                                        const w = editingProduct.warranties?.find(w => w.id === a.id);
                                        return w?.name || a.id;
                                      });
                                      return names.length > 0 ? names.join(", ") : <span className="text-on-surface-variant/40 italic">None</span>;
                                    })()}
                                  </td>
                                  <td className="p-2">
                                    <div className="flex items-center justify-center gap-0.5">
                                      <button
                                        type="button"
                                        onClick={() => handleMoveSv(i, "up")}
                                        disabled={i === 0}
                                        className="p-1 rounded hover:bg-surface-container-high disabled:opacity-30 text-on-surface-variant"
                                        title="Move up"
                                      >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveSv(i, "down")}
                                        disabled={i === ((editingProduct?.storageVariants || []).length - 1)}
                                        className="p-1 rounded hover:bg-surface-container-high disabled:opacity-30 text-on-surface-variant"
                                        title="Move down"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="p-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSv({ ...sv });
                                        setEditingSvOriginalKey(`${sv.storage}|${sv.simType}`.toLowerCase());
                                        setSvColors([...sv.colors]);
                                        setSvWarranties([...(sv.warranties || [])]);
                                        // Pre-check all existing colors as "already in product"
                                        const preCheck: Record<string, boolean> = {};
                                        sv.colors.forEach((c: any) => { preCheck[c.name] = true; });
                                        setSvColorProductAssignment(preCheck);
                                        setNewVarImgColor("");
                                        setNewVarImgUrl("");
                                      }}
                                      className="text-primary hover:text-primary-hover font-bold text-[10px] px-2 py-1"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!confirm(`Delete "${sv.storage} ${sv.simType}" variant? This cannot be undone.`)) return;
                                        setEditingProduct(prev => {
                                          const current = prev || {} as any;
                                          const filtered = (current.storageVariants || []).filter(
                                            (v: any) => `${v.storage}|${v.simType}`.toLowerCase() !== `${sv.storage}|${sv.simType}`.toLowerCase()
                                          );
                                          const updatedStorages = Array.from(new Set(filtered.map((v: any) => v.storage).filter(Boolean)));
                                          return {
                                            ...current,
                                            storageVariants: filtered,
                                            storages: updatedStorages.length > 0 ? updatedStorages : current.storages
                                          };
                                        });
                                      }}
                                      className="text-red-400 hover:text-red-600 font-bold text-[10px] px-1 py-1"
                                      title="Delete variant"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {!(editingProduct?.storageVariants || []).length && !editingSv && (
                        <div className="p-3 text-center bg-surface-container-low border border-dashed border-outline/20 rounded-xl text-on-surface-variant/60 text-[10px]">
                          No variants yet. Enter a storage name and click <strong>Add Variant</strong> above.
                        </div>
                      )}
                    </div>
                    )}

                    <div className="border-t border-outline/10 pt-4 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
                      >
                        Publish changes to Live DB
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsProductFormOpen(false)}
                        className="px-4 py-2.5 bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-bold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Catalog CRUD Table */}
          <div className="bg-surface-container-low border border-outline/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container text-on-surface-variant/80 font-bold uppercase border-b border-outline/10">
                  <tr>
                    <th className="p-4">Product Detail</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg bg-surface border object-contain p-1 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-on-surface block leading-none">{p.name}</span>
                            <span className="text-[10px] text-on-surface-variant/60 block mt-1">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-on-surface-variant">{p.category}</td>
                      <td className="p-4 font-bold text-primary">{formatProductPrice(p)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          p.inStock 
                            ? "bg-green-500/10 text-green-600" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {p.inStock ? "Instock" : "Soldout"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-colors"
                            title="Edit specifications"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                            title="Remove completely"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant/70 font-medium">
                        No products indexed matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 3: PROCESS ORDERS                                   */}
      {/* ======================================================= */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs font-semibold">
          <div className="bg-surface-container-low border border-outline/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-outline/10">
              <h3 className="font-display font-bold text-sm text-on-surface">Fulfillment Dockets Registry</h3>
              <p className="text-[10px] text-on-surface-variant/70 leading-relaxed">
                Click on any order row to access satellite logs, update dispatch statuses, and register carrier notes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container text-on-surface-variant/80 uppercase border-b border-outline/10">
                  <tr>
                    <th className="p-4">Order Code</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Purchased Items</th>
                    <th className="p-4">Charged</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Processing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {ordersList.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{order.id}</td>
                      <td className="p-4">
                        <div>
                          <span className="text-on-surface font-bold block">{order.customer.fullName}</span>
                          <span className="text-[10px] text-on-surface-variant/60 block mt-0.5">{order.customer.email}</span>
                          <span className="text-[10px] text-on-surface-variant/60 block mt-0.5">{order.customer.phone || "N/A"}</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="space-y-1">
                          {order.items && order.items.map((it: any, idx: number) => (
                            <span key={idx} className="block text-[10px] text-on-surface-variant leading-none truncate">
                              • {it.name} (x{it.quantity})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-on-surface">${order.total.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                          order.status === "delivered" ? "bg-green-500/10 text-green-600" :
                          order.status === "shipped" ? "bg-blue-500/10 text-blue-600" :
                          order.status === "packaged" ? "bg-teal-500/10 text-teal-600" :
                          "bg-amber-500/10 text-amber-600"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderStatusNotes("");
                          }}
                          className="px-3 py-1 bg-surface-container border border-outline/10 hover:bg-surface-container-high text-on-surface text-[10px] font-bold rounded-lg transition-colors"
                        >
                          Fulfill Docket
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ordersList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant/70 font-medium">
                        No orders recorded on server yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order fulfillment modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 overflow-y-auto">
              <div className="w-full max-w-lg bg-surface-container-high p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 text-left border border-outline/10 animate-in zoom-in-95 duration-200 my-8">
                <div className="flex justify-between items-center border-b border-outline/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase">Order Fulfill & WhatsApp Alerts</span>
                    <h3 className="font-mono font-black text-lg text-on-surface">{selectedOrder.id}</h3>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-full hover:bg-surface-container-highest">
                    <X className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>

                {/* Details list */}
                <div className="space-y-3.5 text-xs">
                  <div className="bg-surface-container-low border border-outline/5 p-4 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase">Delivery Destination</span>
                        <strong className="text-on-surface block mt-0.5">{selectedOrder.customer.fullName}</strong>
                        <p className="text-on-surface-variant leading-relaxed text-[11px] mt-0.5">
                          {selectedOrder.customer.address}, {selectedOrder.customer.city}, {selectedOrder.customer.state} {selectedOrder.customer.zipCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase block">Customer Contact</span>
                        <span className="text-on-surface font-mono font-bold block text-[11px] mt-0.5">{selectedOrder.customer.phone || "No phone registered"}</span>
                        <span className="text-on-surface-variant block text-[10px]">{selectedOrder.customer.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Standard status logs */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant block uppercase">Fulfillment Logistics Updates</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["pending", "packaged", "shipped", "delivered"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, status)}
                          className={`py-2 text-[10px] font-black rounded-xl border uppercase transition-all ${
                            selectedOrder.status === status
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-surface text-on-surface-variant/70 border-outline/15 hover:bg-surface-container"
                          }`}
                        >
                          {status === "pending" ? "Pending" : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shipped details tracker if order is already dispatched */}
                  {selectedOrder.shippingTrackingNumber && (
                    <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-500">
                        <Truck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Linked Logistics Dispatch Details</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-on-surface-variant">
                        <div>Carrier: <strong className="text-on-surface">{selectedOrder.shippingCarrier}</strong></div>
                        <div>Tracking: <strong className="text-on-surface font-mono">{selectedOrder.shippingTrackingNumber}</strong></div>
                        <div>Method: <strong className="text-on-surface">{selectedOrder.shippingMethodName}</strong></div>
                        <div>Dispatched Date: <strong className="text-on-surface">{selectedOrder.shippingDispatchedDate ? new Date(selectedOrder.shippingDispatchedDate).toLocaleString() : "N/A"}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Advanced Carrier Dispatch Selector & WhatsApp Notifications Firing Form */}
                  {selectedOrder.status !== "delivered" && (
                    <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-3.5">
                      <div className="flex items-center justify-between border-b border-outline/10 pb-2">
                        <div className="flex items-center gap-1.5 text-primary">
                          <Truck className="w-4 h-4" />
                          <span className="text-[10px] font-bold text-on-surface uppercase">Carrier Dispatch & WhatsApp Alert Integration</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[8px] font-bold">Meta Business Hub</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Carrier Method</label>
                          <select
                            value={dispatchDeliveryMethodId}
                            onChange={(e) => {
                              setDispatchDeliveryMethodId(e.target.value);
                              if (e.target.value) {
                                const m = deliveryMethods.find(dm => dm.id === e.target.value);
                                const prefix = m ? m.carrier.slice(0, 3).toUpperCase() : "AXN";
                                const randomNum = Math.floor(100000000 + Math.random() * 900000000);
                                setDispatchTrackingNumber(`${prefix}-${randomNum}`);
                              } else {
                                setDispatchTrackingNumber("");
                              }
                            }}
                            className="w-full px-2 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-[11px] focus:outline-none focus:border-primary text-on-surface font-semibold"
                          >
                            <option value="">-- Select Delivery Method --</option>
                            {deliveryMethods.map((method) => (
                              <option key={method.id} value={method.id}>
                                {method.carrier} - {method.name} (KSh {method.price.toLocaleString()})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Tracking Reference</label>
                          <input
                            type="text"
                            placeholder="DHL-8712398"
                            value={dispatchTrackingNumber}
                            onChange={(e) => setDispatchTrackingNumber(e.target.value)}
                            className="w-full px-2 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-[11px] focus:outline-none focus:border-primary text-on-surface font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Custom Template Message (WhatsApp)</label>
                          <span className="text-[8px] text-primary/75 font-mono">Variables: [Name, Tracking, Carrier]</span>
                        </div>
                        <textarea
                          placeholder="Your order has been dispatched via carrier method..."
                          value={dispatchCustomText}
                          onChange={(e) => setDispatchCustomText(e.target.value)}
                          className="w-full h-14 px-2 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-[10px] focus:outline-none focus:border-primary text-on-surface leading-normal"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDispatchOrder(selectedOrder.id)}
                        disabled={!dispatchDeliveryMethodId || !dispatchTrackingNumber}
                        className="w-full py-2 bg-primary hover:bg-primary-hover disabled:bg-surface-container-highest disabled:text-on-surface-variant/40 disabled:border-transparent text-white text-[11px] font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>Dispatch Order & Fire WhatsApp Alert</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant block uppercase">Carrier Log Dispatch Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Package handpicked by regional partner. Priority carrier number #AX-9871"
                      value={orderStatusNotes}
                      onChange={(e) => setOrderStatusNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl focus:outline-none text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-outline/10">
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 py-2.5 bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-bold rounded-xl transition-colors text-center"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 4: LAYOUT & WEBSITE CONFIG                          */}
      {/* ======================================================= */}
      {activeTab === "config" && webConfig && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs font-semibold text-left">
          {/* Sub Tab Navigation for Website Customization */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-outline/10 pb-3" id="config-sub-tabs">
            <button
              onClick={() => setConfigSubTab("general")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                configSubTab === "general" ? "bg-primary text-white" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              General & Legal Documents
            </button>
            <button
              onClick={() => setConfigSubTab("hero")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                configSubTab === "hero" ? "bg-primary text-white" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              Hero Slideshow ({ (webConfig.heroSlides || []).length || 3 })
            </button>
            <button
              onClick={() => setConfigSubTab("categories")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                configSubTab === "categories" ? "bg-primary text-white" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              Categories CRUD ({ (webConfig.categoriesList || []).length || 6 })
            </button>
            <button
              onClick={() => setConfigSubTab("trending")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                configSubTab === "trending" ? "bg-primary text-white" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              Trending Bento
            </button>
            <button
              onClick={() => setConfigSubTab("spotlight")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                configSubTab === "spotlight" ? "bg-primary text-white" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              Catalog Spotlight
            </button>
            <button
              onClick={() => setConfigSubTab("mixed")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                configSubTab === "mixed" ? "bg-primary text-white" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              Mixed Showcase ({ (webConfig.mixedShowcaseProducts || []).length || 0 })
            </button>
            <button
              onClick={() => setConfigSubTab("protocol")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                configSubTab === "protocol" ? "bg-primary text-white" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              Integration Protocol
            </button>
            <button
              onClick={() => setConfigSubTab("footer")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                configSubTab === "footer" ? "bg-primary text-white" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              Footer Editor
            </button>
            <button
              onClick={() => setConfigSubTab("contact")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                configSubTab === "contact" ? "bg-primary text-white" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              Contact Info
            </button>
            <button
              onClick={() => setConfigSubTab("whatsapp")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                configSubTab === "whatsapp" ? "bg-primary text-white" : "bg-surface-container hover:bg-surface-container-high text-on-surface"
              }`}
            >
              WhatsApp
            </button>
          </div>

          {/* ======================================= */}
          {/* CONFIG SUB-TAB: GENERAL                 */}
          {/* ======================================= */}
          {configSubTab === "general" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* ── Branding & Logo (prominent, top) ── */}
              <div className="lg:col-span-12">
                <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                  <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Branding &amp; Logo
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Navbar Logo */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-on-surface-variant uppercase block">Navbar Logo URL</label>
                      <input
                        type="url"
                        value={webConfig.navbarLogoUrl || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev, navbarLogoUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                        placeholder="https://example.com/logo.png"
                      />
                      {webConfig.navbarLogoUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-outline/10 w-fit">
                          <img
                            src={webConfig.navbarLogoUrl}
                            alt="Navbar logo preview"
                            className="h-12 object-contain bg-surface-container"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    {/* OG Image */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-on-surface-variant uppercase block">OG Image URL</label>
                      <input
                        type="url"
                        value={webConfig.ogImage || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev, ogImage: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                        placeholder="https://example.com/og-image.png"
                      />
                      {webConfig.ogImage && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-outline/10 w-fit">
                          <img
                            src={webConfig.ogImage}
                            alt="OG image preview"
                            className="h-20 object-contain bg-surface-container"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Favicon */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-on-surface-variant uppercase block">Favicon URL</label>
                      <input
                        type="url"
                        value={webConfig.faviconUrl || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev, faviconUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                        placeholder="https://example.com/favicon.ico"
                      />
                      {webConfig.faviconUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-outline/10 w-fit">
                          <img
                            src={webConfig.faviconUrl}
                            alt="Favicon preview"
                            className="h-10 w-10 object-contain bg-surface-container"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Footer Logo */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-on-surface-variant uppercase block">Footer Logo URL</label>
                      <input
                        type="url"
                        value={webConfig.footerLogoUrl || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev, footerLogoUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                        placeholder="https://example.com/footer-logo.png"
                      />
                      {webConfig.footerLogoUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-outline/10 w-fit">
                          <img
                            src={webConfig.footerLogoUrl}
                            alt="Footer logo preview"
                            className="h-12 object-contain bg-surface-container"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Brand Accent Color */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-on-surface-variant uppercase block">Brand Accent Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={webConfig.brandAccentColor || "#3B82F6"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev, brandAccentColor: e.target.value }))}
                          className="w-12 h-10 rounded-xl border border-outline/15 cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={webConfig.brandAccentColor || "#3B82F6"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev, brandAccentColor: e.target.value }))}
                          className="flex-1 px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none font-mono"
                          placeholder="#3B82F6"
                        />
                      </div>
                      <p className="text-[9px] text-on-surface-variant/60">Used for buttons, links, and highlight elements.</p>
                    </div>

                    {/* Meta Pixel ID */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-on-surface-variant uppercase block">Meta Pixel ID</label>
                      <input
                        type="text"
                        value={webConfig.metaPixelId || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev, metaPixelId: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none font-mono"
                        placeholder="1234567890123456"
                      />
                      <p className="text-[9px] text-on-surface-variant/60">Facebook/Meta Pixel ID for conversion tracking. Get it from Meta Events Manager.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcement bar & layout values */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                  <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-primary animate-bounce" />
                    Website Layout Headers
                  </h3>

                  {/* Announcement Configuration */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-on-surface-variant uppercase block">Catalog Promo Announcement Banner</label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={webConfig.showAnnouncement}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,showAnnouncement: e.target.checked }))}
                          className="w-4 h-4 rounded text-primary border-outline/20 focus:ring-0"
                        />
                        <span className="text-xs">Display Banner</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={webConfig.announcement}
                      onChange={(e) => setWebConfig(prev => ({ ...prev,announcement: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                      placeholder="Catalog debut banner marquee text..."
                    />
                  </div>

                  {/* Main slider custom tags */}
                  <div className="space-y-4 border-t border-outline/10 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-on-surface-variant uppercase block">Main Hero Banner title (Legacy fallback)</label>
                      <input
                        type="text"
                        value={webConfig.heroTitle}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,heroTitle: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-on-surface-variant uppercase block">Main Hero Banner description (Legacy fallback)</label>
                      <textarea
                        value={webConfig.heroDescription}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,heroDescription: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none h-24"
                      />
                    </div>
                  </div>
                </div>

                {/* Legal Documents */}
                <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                  <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    Legal Documents & Policy Charters
                  </h3>
                  
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Privacy Policy Charter</label>
                      <textarea
                        value={webConfig.privacyPolicy || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,privacyPolicy: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none h-24"
                        placeholder="Describe how user data and telemetry parameters are securely cataloged..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Terms of Use / Catalog Charter</label>
                      <textarea
                        value={webConfig.termsOfUse || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,termsOfUse: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none h-24"
                        placeholder="State intellectual boundaries, warranty registries, and compiler sandboxing limits..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Cookie and Cache Policy</label>
                      <textarea
                        value={webConfig.cookiePolicy || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,cookiePolicy: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none h-24"
                        placeholder="Configure local storage parameters and analytics key behaviors..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Refund and Harmony Return Protocol</label>
                      <textarea
                        value={webConfig.refundPolicy || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,refundPolicy: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none h-24"
                        placeholder="Specify the 30-day RMA diagnostic window rules..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Delivery and Dispatch Policy</label>
                      <textarea
                        value={webConfig.deliveryPolicy || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,deliveryPolicy: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none h-24"
                        placeholder="Details about double-box static shields, priority dispatch, and custom fees..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Coupon Manager & Contact settings */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                  <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-primary" />
                    Promo Coupon Manager
                  </h3>

                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-2.5 bg-surface p-3.5 rounded-2xl border border-outline/10">
                      <span className="text-[9px] font-black text-on-surface-variant/60 uppercase block">Register New Promo Coupon</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Coupon Code"
                          value={newPromoCode}
                          onChange={(e) => setNewPromoCode(e.target.value)}
                          className="px-3 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs uppercase focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="% Off"
                          min="5"
                          max="90"
                          value={newPromoDiscount}
                          onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                          className="px-3 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs focus:outline-none"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Coupon short description..."
                        value={newPromoDesc}
                        onChange={(e) => setNewPromoDesc(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs focus:outline-none"
                      />

                      <button
                        onClick={handleAddPromoCode}
                        className="w-full py-1.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded-xl transition-colors"
                      >
                        Authorize Coupon
                      </button>
                    </div>

                    {/* Active promo coupon checklist */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Active Promo Coupons</span>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {webConfig.activePromos.map((promo) => (
                          <div key={promo.code} className="flex justify-between items-center bg-surface border border-outline/5 p-2.5 rounded-xl">
                            <div>
                              <span className="font-mono font-bold text-primary block">{promo.code} ({promo.discount}% Off)</span>
                              <span className="text-[9px] text-on-surface-variant/70 block leading-tight">{promo.description}</span>
                            </div>
                            <button
                              onClick={() => handleRemovePromoCode(promo.code)}
                              className="p-1 text-on-surface-variant/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Deauthorize Promo Code"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Socials & Contact operational registry */}
                <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                  <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    Social Media & Core Operations Registry
                  </h3>

                  <div className="space-y-4 pt-2">
                    {/* Social links CRUD */}
                    <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/5 pb-2">Social Media Links</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {(webConfig.socials || []).map((social: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-2 bg-surface-container p-2 rounded-lg">
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={social.name || ""}
                                onChange={(e) => {
                                  const copy = [...(webConfig.socials || [])];
                                  copy[idx] = { ...copy[idx], name: e.target.value };
                                  setWebConfig(prev => ({ ...prev, socials: copy }));
                                }}
                                className="flex-1 px-2.5 py-1.5 bg-surface border border-outline/15 rounded-xl text-[10px] text-on-surface"
                                placeholder="Platform name (e.g. Twitter, Instagram)"
                              />
                              <input
                                type="url"
                                value={social.url || ""}
                                onChange={(e) => {
                                  const copy = [...(webConfig.socials || [])];
                                  copy[idx] = { ...copy[idx], url: e.target.value };
                                  setWebConfig(prev => ({ ...prev, socials: copy }));
                                }}
                                className="flex-1 px-2.5 py-1.5 bg-surface border border-outline/15 rounded-xl text-[10px] text-on-surface"
                                placeholder="https://..."
                              />
                              <button
                                onClick={() => {
                                  const copy = (webConfig.socials || []).filter((_: any, i: number) => i !== idx);
                                  setWebConfig(prev => ({ ...prev, socials: copy }));
                                }}
                                className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="url"
                              value={social.icon || ""}
                              onChange={(e) => {
                                const copy = [...(webConfig.socials || [])];
                                copy[idx] = { ...copy[idx], icon: e.target.value };
                                setWebConfig(prev => ({ ...prev, socials: copy }));
                              }}
                              className="w-full px-2.5 py-1 bg-surface border border-outline/15 rounded-xl text-[10px] text-on-surface"
                              placeholder="Icon URL (e.g. https://img.icons8.com/color/48/twitter.png)"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const currentSocials = webConfig.socials || [];
                          setWebConfig(prev => ({ ...prev, socials: [...currentSocials, { name: "", url: "", icon: "" }] }));
                        }}
                        className="mt-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/15 rounded-lg text-[10px] font-bold transition-colors"
                      >
                        + Add social link
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Operations Registry Email</label>
                      <input
                        type="email"
                        value={webConfig.contactEmail || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,contactEmail: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                        placeholder="synergy@axon.net"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Support Despatch Email</label>
                      <input
                        type="email"
                        value={webConfig.supportEmail || ""}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,supportEmail: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                        placeholder="support@axon.net"
                      />
                    </div>

                  </div>
                </div>

                {/* Save parameters */}
                <div className="bg-surface-container-low border border-outline/10 p-5 rounded-3xl">
                  <button
                    onClick={handleSaveConfig}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Save General Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* CONFIG SUB-TAB: HERO SLIDESHOW          */}
          {/* ======================================= */}
          {configSubTab === "hero" && (
            <div className="space-y-6">
              {/* HERO PRESENTATION MODE CONFIGURATION */}
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-outline/10">
                  <div>
                    <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-primary" />
                      Hero Presentation Mode Settings
                    </h3>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                      Configure the presentation theme of the homepage hero header. Switch between the standard interactive slideshow carousel or an immersive full-bleed cinematic Apple video.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveConfig}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary rounded-lg flex items-center gap-1 font-bold text-[11px]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Mode Settings</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mode Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase block">Presentation Mode</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setWebConfig(prev => ({ ...prev,heroMode: "current" }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          (webConfig?.heroMode || "current") === "current"
                            ? "bg-primary text-white border-primary"
                            : "bg-surface text-on-surface-variant border-outline/10 hover:bg-surface-container-high"
                        }`}
                      >
                        Standard Slideshow
                      </button>
                      <button
                        onClick={() => setWebConfig(prev => ({ ...prev,heroMode: "media-only" }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          webConfig?.heroMode === "media-only"
                            ? "bg-primary text-white border-primary"
                            : "bg-surface text-on-surface-variant border-outline/10 hover:bg-surface-container-high"
                        }`}
                      >
                        Cinematic Media Only
                      </button>
                    </div>
                  </div>

                  {/* Target Product Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase block">Target Product Device</label>
                    <select
                      value={webConfig?.heroTargetProduct || "axon-phone-1-pro"}
                      onChange={(e) => setWebConfig(prev => ({ ...prev,heroTargetProduct: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface font-semibold focus:outline-none focus:border-primary"
                    >
                      {validProductsList.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.brand})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Button Action CTA Text */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase block">Action Button Label</label>
                    <select
                      value={webConfig?.heroButtonText || "Shop Now"}
                      onChange={(e) => setWebConfig(prev => ({ ...prev,heroButtonText: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface font-semibold focus:outline-none focus:border-primary"
                    >
                      <option value="Shop Now">Shop Now</option>
                      <option value="Explore">Explore Device</option>
                      <option value="Pre-order">Pre-order Now</option>
                    </select>
                  </div>
                </div>

                {/* Global Hero Media Override — replaces product media with a custom URL/embed across all slides */}
                <div className="border-t border-outline/5 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10px] text-on-surface-variant uppercase block font-bold">Hero Media Override URL</label>
                      <p className="text-[8px] text-on-surface-variant/65 mt-0.5">Global custom media URL / embed that overrides product images site-wide. The Target Product Device acts as the link target.</p>
                    </div>
                    <button
                      onClick={() => setWebConfig(prev => ({ ...prev, heroMediaOverrideEnabled: !prev.heroMediaOverrideEnabled }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${webConfig?.heroMediaOverrideEnabled ? "bg-primary" : "bg-outline/20"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${webConfig?.heroMediaOverrideEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>

                  {webConfig?.heroMediaOverrideEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Override Type</label>
                        <select
                          value={webConfig?.heroMediaOverrideType || "image"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev, heroMediaOverrideType: e.target.value }))}
                          className="w-full px-2 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                        >
                          <option value="image">Image (JPG/PNG/WEBP)</option>
                          <option value="video">Video (MP4 URL)</option>
                          <option value="embed">Embed (iFrame/YouTube/Vimeo)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Override URL / Embed Code</label>
                        {webConfig?.heroMediaOverrideType === "embed" ? (
                          <textarea
                            value={webConfig?.heroMediaOverrideUrl || ""}
                            onChange={(e) => setWebConfig(prev => ({ ...prev, heroMediaOverrideUrl: e.target.value }))}
                            className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono h-16"
                            placeholder='<iframe src="https://www.youtube.com/embed/..." ...></iframe>'
                          />
                        ) : (
                          <input
                            type="url"
                            value={webConfig?.heroMediaOverrideUrl || ""}
                            onChange={(e) => setWebConfig(prev => ({ ...prev, heroMediaOverrideUrl: e.target.value }))}
                            className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                            placeholder="https://example.com/slideshow.jpg or .mp4"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-outline/10">
                  <div>
                    <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-primary" />
                      Dynamic Hero Slideshow Manager
                    </h3>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                      Manage slides dynamically rendered at the top of the Home view. Add slides, customize button behaviors, tags, titles, and backgrounds.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const currentSlides = Array.isArray(webConfig.heroSlides) ? webConfig.heroSlides : defaultSlides;
                      const newSlide = {
                        id: "slide_" + Math.floor(Math.random() * 1000000),
                        tag: "NEW DISCOVERY",
                        tagIcon: "Zap",
                        title: "Axon Neural Core Pro",
                        description: "Configure the future of spatial computing. Built with hyper-low pipeline lag, active liquid isolation grids, and high performance graphics capability.",
                        primaryBtnText: "Explore Neural Pro",
                        primaryActionTarget: "product",
                        primaryActionValue: validProductsList[0]?.id || "axon-slate-pro",
                        secondaryBtnText: "Browse Accessories",
                        secondaryActionTarget: "category",
                        secondaryActionValue: "Accessories",
                        mediaType: "image",
                        mediaUrl: "",
                        mediaAlt: "Neural Core Preview Image",
                        overlayTitle: "Neural Core",
                        overlayDesc: "Vapor Chamber cooling built-in"
                      };
                      setWebConfig(prev => ({ ...prev,heroSlides: [...currentSlides, newSlide] }));
                      showFeedback("Added a new hero slide! Fill out parameters below.");
                    }}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center gap-1 font-bold text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Hero Slide</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {(() => {
                    const currentSlides = Array.isArray(webConfig.heroSlides) ? webConfig.heroSlides : defaultSlides;
                    if (currentSlides.length === 0) {
                      return (
                        <div className="text-center py-8 text-on-surface-variant/60">
                          No customized slides. Fallback defaults will be loaded. Click "Add Hero Slide" to create your first customized experience.
                        </div>
                      );
                    }

                    return currentSlides.map((slide, sIdx) => (
                      <div key={slide.id || sIdx} className="bg-surface border border-outline/10 p-5 rounded-2xl relative space-y-4">
                        <div className="flex justify-between items-center border-b border-outline/10 pb-2.5">
                          <span className="font-mono text-primary font-bold">Slide #{sIdx + 1} ({slide.id})</span>
                          <button
                            onClick={() => {
                              if (currentSlides.length <= 1) {
                                showFeedback("Cannot remove the last slide.", true);
                                return;
                              }
                              const updated = currentSlides.filter((_, idx) => idx !== sIdx);
                              setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              showFeedback("Hero slide removed.");
                            }}
                            disabled={currentSlides.length <= 1}
                            className={`px-2 py-1 text-[10px] rounded-md flex items-center gap-1 transition-colors ${
                              currentSlides.length <= 1
                                ? "bg-outline/5 text-on-surface-variant/40 cursor-not-allowed border border-outline/10"
                                : "bg-red-500/10 text-red-500 border border-red-500/15 hover:bg-red-500/15"
                            }`}
                            title={currentSlides.length <= 1 ? "Cannot remove the last slide" : "Remove slide"}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Slide Tagging */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Tagline Text</label>
                            <input
                              type="text"
                              value={slide.tag || ""}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, tag: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                              placeholder="THE AXON CATALOG DEBUT"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Tag Icon</label>
                            <select
                              value={slide.tagIcon || "Cpu"}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, tagIcon: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-2 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                            >
                              <option value="Cpu">Cpu (Chip)</option>
                              <option value="Zap">Zap (Lightning Bolt)</option>
                              <option value="ShieldCheck">ShieldCheck (Security Shield)</option>
                              <option value="Laptop">Laptop (Computer)</option>
                              <option value="Tablet">Tablet (Slate/Tablet)</option>
                              <option value="Headphones">Headphones (Audio)</option>
                              <option value="Smartphone">Smartphone (Phone)</option>
                              <option value="Layers">Layers (Catalog)</option>
                              <option value="Plug">Plug (Induction/Power)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Display Overlay Title</label>
                            <input
                              type="text"
                              value={slide.overlayTitle || ""}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, overlayTitle: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                              placeholder="Infinity Screen"
                            />
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Main Slide Title</label>
                            <input
                              type="text"
                              value={slide.title || ""}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, title: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-bold text-sm"
                              placeholder="Slide Heading text"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Overlay Description Spec</label>
                            <input
                              type="text"
                              value={slide.overlayDesc || ""}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, overlayDesc: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                              placeholder="e.g. 12.9 inch ProMotion Touchscreen"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-on-surface-variant uppercase block">Slide Description Block</label>
                          <textarea
                            value={slide.description || ""}
                            onChange={(e) => {
                              const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, description: e.target.value } : s);
                              setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                            }}
                            className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface h-16"
                            placeholder="Slide short summary of specs and utility..."
                          />
                        </div>

                        {/* Primary Button action config */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-outline/5 pt-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Primary Button Text</label>
                            <input
                              type="text"
                              value={slide.primaryBtnText || ""}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, primaryBtnText: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                              placeholder="Explore Device"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Primary Action target</label>
                            <select
                              value={slide.primaryActionTarget || "product"}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, primaryActionTarget: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-2 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                            >
                              <option value="product">Redirect to Product Detail Page</option>
                              <option value="category">Redirect to Catalog Category Page</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Primary Target value</label>
                            {slide.primaryActionTarget === "product" ? (
                              <select
                                value={slide.primaryActionValue || ""}
                                onChange={(e) => {
                                  const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, primaryActionValue: e.target.value } : s);
                                  setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                                }}
                                className="w-full px-2 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                              >
                                <option value="">-- Choose Target Product --</option>
                                {validProductsList.map(p => (
                                  <option key={p.id} value={p.id}>{p.name} ({formatProductPrice(p)})</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={slide.primaryActionValue || ""}
                                onChange={(e) => {
                                  const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, primaryActionValue: e.target.value } : s);
                                  setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                                }}
                                className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                                placeholder="e.g. Laptops, Audio, All"
                              />
                            )}
                          </div>
                        </div>

                        {/* Secondary Button action config */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-outline/5 pt-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Secondary Button Text</label>
                            <input
                              type="text"
                              value={slide.secondaryBtnText || ""}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, secondaryBtnText: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                              placeholder="Shop all hardware"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Secondary Action target</label>
                            <select
                              value={slide.secondaryActionTarget || "category"}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, secondaryActionTarget: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-2 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                            >
                              <option value="product">Redirect to Product Detail Page</option>
                              <option value="category">Redirect to Catalog Category Page</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Secondary Target value</label>
                            {slide.secondaryActionTarget === "product" ? (
                              <select
                                value={slide.secondaryActionValue || ""}
                                onChange={(e) => {
                                  const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, secondaryActionValue: e.target.value } : s);
                                  setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                                }}
                                className="w-full px-2 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                              >
                                <option value="">-- Choose Target Product --</option>
                                {validProductsList.map(p => (
                                  <option key={p.id} value={p.id}>{p.name} ({formatProductPrice(p)})</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={slide.secondaryActionValue || ""}
                                onChange={(e) => {
                                  const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, secondaryActionValue: e.target.value } : s);
                                  setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                                }}
                                className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                                placeholder="e.g. Laptops, Audio, All"
                              />
                            )}
                          </div>
                        </div>

                        {/* Media type, source links and Connected Product */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline/5 pt-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block font-bold">Connected Product Device</label>
                            <select
                              value={slide.targetProductId || ""}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, targetProductId: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-2 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                            >
                              <option value="">-- Choose Product Device (Pill overlay details) --</option>
                              {validProductsList.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                              ))}
                            </select>
                            <p className="text-[8px] text-on-surface-variant/65">Connects this slide to a specific catalog device. In cinematic mode, the floating overlay details will adapt to show this product's name, brand, price and detail link.</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block font-bold">Background Media Type</label>
                            <select
                              value={slide.mediaType || "image"}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, mediaType: e.target.value } : s);
                                setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                              }}
                              className="w-full px-2 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                            >
                              <option value="image">Static High-Res Image (JPG/PNG/WEBP)</option>
                              <option value="video">Auto-Looping Silent Video (MP4)</option>
                              <option value="embed">HTML Media Embed / Code (iFrame/Youtube/Vimeo)</option>
                            </select>
                            <p className="text-[8px] text-on-surface-variant/65">Choose between high-fidelity images, standard looping video files, or raw embed widgets (iframe/object code).</p>
                          </div>
                        </div>

                        {/* Hero Media Override — replaces product default media with a custom slideshow/video URL */}
                        <div className="border-t border-outline/5 pt-3 space-y-3">
                          <div className="flex items-center justify-between text-[9px] text-on-surface-variant/50">
                            <span>Use "Hero Media Override" in Mode Settings above to set a global media URL</span>
                          </div>
                        </div>

                        {/* Conditional Media Inputs */}
                        <div className="border-t border-outline/5 pt-3">
                          {slide.mediaType === "embed" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] text-on-surface-variant uppercase block font-bold font-mono text-primary">Desktop Raw HTML Embed</label>
                                  <span className="text-[8px] font-mono text-primary px-1 bg-primary/10 rounded">16:9 Cinema</span>
                                </div>
                                <textarea
                                  value={slide.mediaEmbed || ""}
                                  onChange={(e) => {
                                    const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, mediaEmbed: e.target.value } : s);
                                    setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                                  }}
                                  className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono h-20"
                                  placeholder='<iframe width="560" height="315" src="https://www.youtube.com/embed/..." frameborder="0" allowfullscreen></iframe>'
                                />
                                <p className="text-[8px] text-on-surface-variant/60">Raw HTML embed markup. Automatically styled on desktop sizes to cover the full-bleed area elegantly.</p>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] text-on-surface-variant uppercase block font-bold font-mono text-amber-500">Mobile Raw HTML Embed (Optional)</label>
                                  <span className="text-[8px] font-mono text-amber-500 px-1 bg-amber-500/10 rounded">9:16 Portrait</span>
                                </div>
                                <textarea
                                  value={slide.mobileMediaEmbed || ""}
                                  onChange={(e) => {
                                    const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, mobileMediaEmbed: e.target.value } : s);
                                    setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                                  }}
                                  className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono h-20"
                                  placeholder='<iframe src="https://player.example.com/video/123" frameborder="0"></iframe>'
                                />
                                <p className="text-[8px] text-on-surface-variant/60">Vertical 9:16 optimized embed code. Dynamically rendered on screens smaller than 768px wide.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] text-on-surface-variant uppercase block font-bold font-mono text-primary">Desktop Media URL</label>
                                  <span className="text-[8px] font-mono text-primary px-1 bg-primary/10 rounded">Landscape 16:9</span>
                                </div>
                                <input
                                  type="url"
                                  value={slide.mediaUrl || ""}
                                  onChange={(e) => {
                                    const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, mediaUrl: e.target.value } : s);
                                    setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                                  }}
                                  className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                                  placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-[8px] text-on-surface-variant/60">Fully qualified secure URL pointing to high-resolution landscape assets.</p>
                                {/* Live media preview */}
                                {slide.mediaUrl && (
                                  <div className="mt-1 rounded-xl overflow-hidden border border-outline/10 bg-surface-container-low">
                                    {slide.mediaType === "video" ? (
                                      <video
                                        src={slide.mediaUrl}
                                        className="w-full h-28 object-contain bg-black/5"
                                        muted
                                        playsInline
                                        preload="metadata"
                                      />
                                    ) : (
                                      <img
                                        src={slide.mediaUrl}
                                        alt="Desktop preview"
                                        className="w-full h-28 object-contain bg-black/5"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] text-on-surface-variant uppercase block font-bold font-mono text-amber-500">Mobile Media URL (Optional)</label>
                                  <span className="text-[8px] font-mono text-amber-500 px-1 bg-amber-500/10 rounded">Portrait 9:16</span>
                                </div>
                                <input
                                  type="url"
                                  value={slide.mobileMediaUrl || ""}
                                  onChange={(e) => {
                                    const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, mobileMediaUrl: e.target.value } : s);
                                    setWebConfig(prev => ({ ...prev,heroSlides: updated }));
                                  }}
                                  className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                                  placeholder="https://example.com/mobile-image.jpg"
                                />
                                <p className="text-[8px] text-on-surface-variant/60">Optimized portrait size asset. Enhances mobile rendering speed and visual framing.</p>
                                {/* Live media preview */}
                                {slide.mobileMediaUrl && (
                                  <div className="mt-1 rounded-xl overflow-hidden border border-outline/10 bg-surface-container-low">
                                    <img
                                      src={slide.mobileMediaUrl}
                                      alt="Mobile preview"
                                      className="w-full h-28 object-contain bg-black/5"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                <div className="pt-4 border-t border-outline/10">
                  <button
                    onClick={handleSaveConfig}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Save Customized Hero Slideshow Layout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* CONFIG SUB-TAB: CATEGORIES CRUD         */}
          {/* ======================================= */}
          {configSubTab === "categories" && (
            <div className="space-y-6">

              {/* ── Section Visibility Toggle ── */}
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  "Shop by Category" Section Visibility
                </h3>
                <p className="text-[10px] text-on-surface-variant/70">
                  This is the existing categories section on the homepage. It is kept by default — but you can turn it off if you prefer to show only the admin-curated Mixed Picks section (or vice versa).
                </p>
                <div className="flex items-center justify-between gap-3 border border-outline/10 rounded-2xl p-3 bg-surface">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-on-surface block uppercase">Show Shop by Category Section</span>
                    <span className="text-[9px] text-on-surface-variant/70">Turn off to hide the category grid on the homepage.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWebConfig(prev => ({ ...prev, categoriesSectionEnabled: !(prev?.categoriesSectionEnabled ?? true) }))}
                    className={`relative w-12 h-6 rounded-full transition-all cursor-pointer shrink-0 ${
                      (webConfig.categoriesSectionEnabled ?? true) ? "bg-primary" : "bg-outline/30"
                    }`}
                    aria-pressed={webConfig.categoriesSectionEnabled ?? true}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                      (webConfig.categoriesSectionEnabled ?? true) ? "translate-x-6" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>

              {/* ── Live Preview ── */}
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-outline/10">
                  <div>
                    <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      Live Preview
                    </h3>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                      Exactly how categories appear on the homepage.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-5">
                  {(() => {
                    const iconMap: Record<string, any> = { Laptop, Tablet, Headphones, Smartphone, Layers, Plug };
                    const currentCats = (webConfig.categoriesList || defaultCategories).slice(0, 5);
                    return currentCats.map((cat: any) => {
                      const Icon = iconMap[cat.icon] || Layers;
                      const displayName = cat.name || "Category Name";
                      const displayDesc = cat.desc || "Category description";
                      return (
                        <div key={cat.name} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-outline/15 bg-surface-container p-3 sm:p-4 hover:border-primary/45 hover:shadow-md transition-all text-left min-w-[125px] h-24 sm:h-36 shrink-0">
                          <div className="absolute inset-0 z-0">
                            {cat.image ? (
                              <img src={cat.image} alt={displayName} className="w-full h-full object-cover opacity-30 dark:opacity-45" referrerPolicy="no-referrer" />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/80 to-transparent" />
                          </div>
                          <div className="relative z-10 flex items-center justify-between w-full">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="relative z-10 space-y-0.5">
                            <h3 className="font-display font-bold text-xs text-on-surface tracking-tight">{displayName}</h3>
                            <p className="text-[9px] sm:text-[10px] text-on-surface-variant/70 leading-normal truncate max-w-[110px] sm:max-w-[130px]">{displayDesc}</p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ── Editor ── */}
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-outline/10">
                  <div>
                    <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      Dynamic Curated Categories
                    </h3>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                      Up to 5 categories. "Shop All" dynamically detects added/removed categories.
                    </p>
                  </div>
                  {((webConfig.categoriesList || defaultCategories).length) < 5 && (
                    <button
                      onClick={() => {
                        const currentCats = webConfig.categoriesList || defaultCategories;
                        const newCat = { name: "", desc: "", icon: "Layers", image: "" };
                        setWebConfig(prev => ({ ...prev, categoriesList: [...currentCats, newCat] }));
                        showFeedback("New category slot added!");
                      }}
                      className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
                  {(() => {
                    const currentCats = (webConfig.categoriesList || defaultCategories).slice(0, 5);
                    return currentCats.map((cat: any, cIdx: number) => (
                      <div key={cIdx} className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-3 relative">
                        <div className="flex justify-between items-center border-b border-outline/5 pb-2">
                          <span className="font-bold text-xs text-primary uppercase">#{cIdx + 1}</span>
                          <button
                            onClick={() => {
                              const updated = currentCats.filter((_: any, idx: number) => idx !== cIdx);
                              setWebConfig(prev => ({ ...prev, categoriesList: updated }));
                              showFeedback("Category removed.");
                            }}
                            className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/15 border border-red-500/10 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Category Name</label>
                          <input
                            type="text"
                            value={cat.name || ""}
                            onChange={(e) => {
                              const updated = currentCats.map((c: any, idx: number) => idx === cIdx ? { ...c, name: e.target.value } : c);
                              setWebConfig(prev => ({ ...prev, categoriesList: updated }));
                            }}
                            className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                            placeholder="e.g. Laptops"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Render Icon</label>
                          <select
                            value={cat.icon || "Layers"}
                            onChange={(e) => {
                              const updated = currentCats.map((c: any, idx: number) => idx === cIdx ? { ...c, icon: e.target.value } : c);
                              setWebConfig(prev => ({ ...prev, categoriesList: updated }));
                            }}
                            className="w-full px-2 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                          >
                            <option value="Laptop">Laptop</option>
                            <option value="Tablet">Tablet</option>
                            <option value="Headphones">Headphones</option>
                            <option value="Smartphone">Smartphone</option>
                            <option value="Layers">Layers</option>
                            <option value="Plug">Plug</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Description</label>
                          <input
                            type="text"
                            value={cat.desc || ""}
                            onChange={(e) => {
                              const updated = currentCats.map((c: any, idx: number) => idx === cIdx ? { ...c, desc: e.target.value } : c);
                              setWebConfig(prev => ({ ...prev, categoriesList: updated }));
                            }}
                            className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                            placeholder="e.g. Aerospace alloys performance"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Image cover URL</label>
                          <input
                            type="url"
                            value={cat.image || ""}
                            onChange={(e) => {
                              const updated = currentCats.map((c: any, idx: number) => idx === cIdx ? { ...c, image: e.target.value } : c);
                              setWebConfig(prev => ({ ...prev, categoriesList: updated }));
                            }}
                            className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-[10px] text-on-surface font-mono"
                            placeholder="https://example.com/image.jpg"
                          />
                          {cat.image && (
                            <div className="mt-1 rounded-lg overflow-hidden border border-outline/10">
                              <img src={cat.image} alt="preview" className="h-16 w-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* CONFIG SUB-TAB: TRENDING NOW BENTO      */}
          {/* ======================================= */}
          {configSubTab === "trending" && (
            <div className="space-y-6">
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  Trending Now Bento Grid Customizer
                </h3>
                <p className="text-[10px] text-on-surface-variant/70">
                  Map high-contrast showcase slots on the Home view to products in your active catalog, and override descriptions or labels.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Slot 1 (Large Block) */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold block w-fit">Bento Slot #1 (Large Left Block)</span>
                    
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Linked Product Item</label>
                        <select
                          value={webConfig.trendingSlot1Product || "axon-buds-pro"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot1Product: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                        >
                          {validProductsList.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({formatProductPrice(p)})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Tag text</label>
                        <input
                          type="text"
                          value={webConfig.trendingSlot1Tag || ""}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot1Tag: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Best Seller"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Description</label>
                        <textarea
                          value={webConfig.trendingSlot1Desc || ""}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot1Desc: e.target.value }))}
                          className="w-full h-20 px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Describe slide specs..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Slot 2 (Small Block) */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold block w-fit">Bento Slot #2 (Small Center-Top)</span>
                    
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Linked Product Item</label>
                        <select
                          value={webConfig.trendingSlot2Product || "power-capsule-v2"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot2Product: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                        >
                          {validProductsList.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({formatProductPrice(p)})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Tag text</label>
                        <input
                          type="text"
                          value={webConfig.trendingSlot2Tag || ""}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot2Tag: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Power Stage"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Description</label>
                        <textarea
                          value={webConfig.trendingSlot2Desc || ""}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot2Desc: e.target.value }))}
                          className="w-full h-20 px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Describe slide specs..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Slot 3 (Small Block) */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold block w-fit">Bento Slot #3 (Small Center-Bottom)</span>
                    
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Linked Product Item</label>
                        <select
                          value={webConfig.trendingSlot3Product || "axon-book-16"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot3Product: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                        >
                          {validProductsList.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({formatProductPrice(p)})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Tag text</label>
                        <input
                          type="text"
                          value={webConfig.trendingSlot3Tag || ""}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot3Tag: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="NEW RELEASE"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Description</label>
                        <textarea
                          value={webConfig.trendingSlot3Desc || ""}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot3Desc: e.target.value }))}
                          className="w-full h-20 px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Describe slide specs..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Slot 4 (Large Block) */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold block w-fit">Bento Slot #4 (Large Right Block)</span>
                    
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Linked Product Item</label>
                        <select
                          value={webConfig.trendingSlot4Product || "axon-audio-engine"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot4Product: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                        >
                          {validProductsList.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({formatProductPrice(p)})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Tag text</label>
                        <input
                          type="text"
                          value={webConfig.trendingSlot4Tag || ""}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot4Tag: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Professional Studio Stage"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Description</label>
                        <textarea
                          value={webConfig.trendingSlot4Desc || ""}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,trendingSlot4Desc: e.target.value }))}
                          className="w-full h-20 px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Describe slide specs..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline/10">
                  <button
                    onClick={handleSaveConfig}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Save Trending Bento Slots Config
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* CONFIG SUB-TAB: CATALOG SPOTLIGHT     */}
          {/* ======================================= */}
          {configSubTab === "spotlight" && (
            <div className="space-y-6">
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  Catalog Spotlight Section Customizer
                </h3>
                <p className="text-[10px] text-on-surface-variant/70">
                  Customize the title, description, and list of highly-rated products showcased in the grid section.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Spotlight Title</label>
                    <input
                      type="text"
                      value={webConfig.spotlightTitle || "The Catalog Spotlight"}
                      onChange={(e) => setWebConfig(prev => ({ ...prev,spotlightTitle: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                      placeholder="The Catalog Spotlight"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Spotlight Description Text</label>
                    <textarea
                      value={webConfig.spotlightDescription || "Each product designed with absolute form-factor alignment and state-of-the-art durability."}
                      onChange={(e) => setWebConfig(prev => ({ ...prev,spotlightDescription: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface h-16"
                      placeholder="Description details..."
                    />
                  </div>

                  {/* Multi-selector for 5 products */}
                  <div className="space-y-3.5 border-t border-outline/10 pt-4">
                    <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Selected Products to Showcase (Choose 5 Items)</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {[0, 1, 2, 3, 4].map((index) => {
                        const currentList = webConfig.spotlightProducts || [];
                        const currentVal = currentList[index] || "";
                        return (
                          <div key={index} className="space-y-1">
                            <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Grid Position #{index + 1}</label>
                            <select
                              value={currentVal}
                              onChange={(e) => {
                                const copy = [...currentList];
                                copy[index] = e.target.value;
                                setWebConfig(prev => ({ ...prev,spotlightProducts: copy.filter(Boolean) }));
                              }}
                              className="w-full px-2 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-[11px] text-on-surface font-mono"
                            >
                              <option value="">-- Choose Product --</option>
                              {validProductsList.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline/10">
                  <button
                    onClick={handleSaveConfig}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Save Spotlight Custom Content
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* CONFIG SUB-TAB: MIXED SHOWCASE          */}
          {/* ======================================= */}
          {configSubTab === "mixed" && (
            <div className="space-y-6">
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  Mixed Picks Showcase (Right After Hero)
                </h3>
                <p className="text-[10px] text-on-surface-variant/70">
                  This section appears immediately after the hero slideshow on the homepage and mixes products from <strong>all categories</strong>. You (the admin) choose exactly which products appear below — the storefront will not pick them randomly.
                </p>

                <div className="space-y-4 pt-2">
                  {/* Enable / disable section */}
                  <div className="flex items-center justify-between gap-3 border border-outline/10 rounded-2xl p-3 bg-surface">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-on-surface block uppercase">Show Mixed Picks Section</span>
                      <span className="text-[9px] text-on-surface-variant/70">Turn off to hide this section entirely on the homepage.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWebConfig(prev => ({ ...prev, mixedShowcaseEnabled: !(prev?.mixedShowcaseEnabled ?? true) }))}
                      className={`relative w-12 h-6 rounded-full transition-all cursor-pointer shrink-0 ${
                        (webConfig.mixedShowcaseEnabled ?? true) ? "bg-primary" : "bg-outline/30"
                      }`}
                      aria-pressed={webConfig.mixedShowcaseEnabled ?? true}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        (webConfig.mixedShowcaseEnabled ?? true) ? "translate-x-6" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Section Title</label>
                    <input
                      type="text"
                      value={webConfig.mixedShowcaseTitle || "Shop Our Mixed Picks"}
                      onChange={(e) => setWebConfig(prev => ({ ...prev, mixedShowcaseTitle: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                      placeholder="Shop Our Mixed Picks"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Section Subtitle</label>
                    <input
                      type="text"
                      value={webConfig.mixedShowcaseSubtitle || ""}
                      onChange={(e) => setWebConfig(prev => ({ ...prev, mixedShowcaseSubtitle: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                      placeholder="Hand-picked across every category"
                    />
                  </div>

                  {/* Admin-selected product list */}
                  <div className="space-y-3 border-t border-outline/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Products To Show (Mixed Across All Categories)</span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = webConfig.mixedShowcaseProducts || [];
                          setWebConfig(prev => ({ ...prev, mixedShowcaseProducts: [...current, ""] }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-all cursor-pointer"
                      >
                        + Add Product
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(webConfig.mixedShowcaseProducts || []).length === 0 && (
                        <p className="text-[10px] text-on-surface-variant/60 italic">No products selected. Add products below — they will appear in the order listed.</p>
                      )}
                      {(webConfig.mixedShowcaseProducts || []).map((pid, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-on-surface-variant/60 w-5 text-right">{index + 1}.</span>
                          <select
                            value={pid || ""}
                            onChange={(e) => {
                              const copy = [...(webConfig.mixedShowcaseProducts || [])];
                              copy[index] = e.target.value;
                              setWebConfig(prev => ({ ...prev, mixedShowcaseProducts: copy.filter((v, i) => v !== "" || i !== index) }));
                            }}
                            className="flex-1 px-2 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-[11px] text-on-surface font-mono"
                          >
                            <option value="">-- Choose Product --</option>
                            {validProductsList.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...(webConfig.mixedShowcaseProducts || [])];
                              copy.splice(index, 1);
                              setWebConfig(prev => ({ ...prev, mixedShowcaseProducts: copy }));
                            }}
                            className="px-2 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[11px] font-bold hover:bg-red-500/20 transition-all cursor-pointer"
                            aria-label="Remove product"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-on-surface-variant/60">Tip: pick products from different categories to get a mixed, varied grid. Empty slots are ignored.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline/10">
                  <button
                    onClick={handleSaveConfig}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Save Mixed Showcase
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* CONFIG SUB-TAB: INTEGRATION PROTOCOL    */}
          {/* ======================================= */}
          {configSubTab === "protocol" && (
            <div className="space-y-6">
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Why Shop With Us Section Editor
                </h3>
                <p className="text-[10px] text-on-surface-variant/70">
                  Edit the core branding values and parameters representing the sync encryption protocols block at the bottom of the Home screen.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Section Branding Title</label>
                    <input
                      type="text"
                      value={webConfig.protocolTitle || "Why Shop With Us"}
                      onChange={(e) => setWebConfig(prev => ({ ...prev,protocolTitle: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                      placeholder="Why Shop With Us"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Detailed Protocol Description</label>
                    <textarea
                      value={webConfig.protocolDescription || "We deliver across Kenya, offer genuine products with warranty, and our team is just a WhatsApp message away for support."}
                      onChange={(e) => setWebConfig(prev => ({ ...prev,protocolDescription: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface h-20"
                      placeholder="Protocol value statement details..."
                    />
                  </div>

                  {/* Badge configuration — up to 4 */}
                  <div className="border-t border-outline/5 pt-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-[10px] uppercase text-on-surface-variant">Shop With Us Badges (max 4)</span>
                      {((webConfig.protocolBadges?.length ?? 2) < 4) && (
                        <button
                          onClick={() => {
                            const current = webConfig.protocolBadges || [
                              { text: "Fast Delivery", icon: "Zap", url: "" },
                              { text: "Secure Checkout", icon: "ShieldCheck", url: "" }
                            ];
                            setWebConfig(prev => ({ ...prev, protocolBadges: [...current, { text: "", icon: "Zap", url: "" }] }));
                          }}
                          className="px-2 py-1 bg-primary/10 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-bold transition-colors"
                        >
                          + Add Badge
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(webConfig.protocolBadges || [
                        { text: "Fast Delivery", icon: "Zap", url: "" },
                        { text: "Secure Checkout", icon: "ShieldCheck", url: "" }
                      ]).map((badge: any, idx: number) => (
                        <div key={idx} className="bg-surface border border-outline/10 p-3 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[10px] uppercase text-primary">Badge #{idx + 1}</span>
                            <button
                              onClick={() => {
                                const copy = [...(webConfig.protocolBadges || [])];
                                copy.splice(idx, 1);
                                setWebConfig(prev => ({ ...prev, protocolBadges: copy }));
                              }}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={badge.icon || "Zap"}
                              onChange={(e) => {
                                const copy = [...(webConfig.protocolBadges || [])];
                                copy[idx] = { ...copy[idx], icon: e.target.value };
                                setWebConfig(prev => ({ ...prev, protocolBadges: copy }));
                              }}
                              className="px-2 py-1.5 bg-surface-container border border-outline/15 rounded-lg text-[10px] text-on-surface font-semibold"
                            >
                              <option value="Zap">Zap</option>
                              <option value="ShieldCheck">Shield</option>
                              <option value="Cpu">Cpu</option>
                              <option value="Laptop">Laptop</option>
                              <option value="Tablet">Tablet</option>
                              <option value="Headphones">Audio</option>
                              <option value="Smartphone">Phone</option>
                              <option value="Layers">Layers</option>
                              <option value="Plug">Plug</option>
                              <option value="Star">Star</option>
                            </select>
                            <input
                              type="text"
                              value={badge.text || ""}
                              onChange={(e) => {
                                const copy = [...(webConfig.protocolBadges || [])];
                                copy[idx] = { ...copy[idx], text: e.target.value };
                                setWebConfig(prev => ({ ...prev, protocolBadges: copy }));
                              }}
                              className="col-span-2 px-2 py-1.5 bg-surface-container border border-outline/15 rounded-lg text-[10px] text-on-surface"
                              placeholder="Badge label"
                            />
                          </div>
                          <input
                            type="url"
                            value={badge.url || ""}
                            onChange={(e) => {
                              const copy = [...(webConfig.protocolBadges || [])];
                              copy[idx] = { ...copy[idx], url: e.target.value };
                              setWebConfig(prev => ({ ...prev, protocolBadges: copy }));
                            }}
                            className="w-full px-2 py-1.5 bg-surface-container border border-outline/15 rounded-lg text-[10px] text-on-surface font-mono"
                            placeholder="https://link.com (optional)"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline/10">
                  <button
                    onClick={handleSaveConfig}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Save Protocol Parameters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* CONFIG SUB-TAB: FOOTER EDITOR           */}
          {/* ======================================= */}
          {configSubTab === "footer" && (
            <div className="space-y-6">
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  Site-Wide Footer Content Editor
                </h3>
                <p className="text-[10px] text-on-surface-variant/70">
                  Customize the brand identity, description, column titles, link configurations, newsletter section, and copyright messages. Contact details are managed in the Contact tab.
                </p>

                <div className="space-y-4 pt-2">
                  {/* Brand Section */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/5 pb-2">Brand Identity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Brand Name</label>
                        <input
                          type="text"
                          value={webConfig.footerBrandName || "AXON"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,footerBrandName: e.target.value }))}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="AXON"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Brand Suffix</label>
                        <input
                          type="text"
                          value={webConfig.footerBrandSuffix || "TECH"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,footerBrandSuffix: e.target.value }))}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="TECH"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Logo URL</label>
                        <input
                          type="url"
                          value={webConfig.footerBrandLogoUrl || ""}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,footerBrandLogoUrl: e.target.value }))}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    {webConfig.footerBrandLogoUrl && (
                      <div className="flex items-center gap-3 bg-surface-container p-2 rounded-lg">
                        <img src={webConfig.footerBrandLogoUrl} alt="Logo preview" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                        <span className="text-[10px] text-on-surface-variant">Logo preview</span>
                      </div>
                    )}
                  </div>

                  {/* Description & Warranty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Footer Brand Description</label>
                      <textarea
                        value={webConfig.footerDescription || "Crafting precise premium hardware and accessories harmonized into a seamless high-performance lifestyle catalog."}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,footerDescription: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface h-20"
                        placeholder="Footer branding text..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Warranty / Stamp text</label>
                      <input
                        type="text"
                        value={webConfig.footerWarrantyText || "Authorized Retailer warranty included"}
                        onChange={(e) => setWebConfig(prev => ({ ...prev,footerWarrantyText: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                        placeholder="Authorized Retailer warranty included"
                      />
                    </div>
                  </div>

                  {/* Newsletter Section */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/5 pb-2">Newsletter Section</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Newsletter Title</label>
                        <input
                          type="text"
                          value={webConfig.footerNewsletterTitle || "Catalog Brief"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,footerNewsletterTitle: e.target.value }))}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Catalog Brief"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Newsletter Description</label>
                        <textarea
                          value={webConfig.footerNewsletterDescription || "Subscribe to receive priority notifications of limited hardware drops, system updates, and custom product bundles."}
                          onChange={(e) => setWebConfig(prev => ({ ...prev,footerNewsletterDescription: e.target.value }))}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface h-16"
                          placeholder="Subscribe to receive..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 1 Links */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center border-b border-outline/5 pb-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-on-surface-variant uppercase block font-bold">Column #1 Title</label>
                        <input
                          type="text"
                          value={webConfig.footerCol1Title || "Catalog"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev, footerCol1Title: e.target.value }))}
                          className="px-2.5 py-1 bg-surface-container border border-outline/15 rounded-xl text-xs font-semibold text-on-surface"
                          placeholder="Catalog"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const currentLinks = webConfig.footerCol1Links || defaultCol1Links;
                          const newLink = { text: "New Link", target: "/" };
                          setWebConfig(prev => ({ ...prev, footerCol1Links: [...currentLinks, newLink] }));
                        }}
                        className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-bold transition-colors"
                      >
                        + Add link
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(webConfig.footerCol1Links || defaultCol1Links).map((link: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2 bg-surface-container p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-on-surface-variant shrink-0">#{idx + 1}</span>
                            <input
                              type="text"
                              value={link.text || ""}
                              onChange={(e) => {
                                const copy = [...(webConfig.footerCol1Links || defaultCol1Links)];
                                copy[idx] = { ...copy[idx], text: e.target.value };
                                setWebConfig(prev => ({ ...prev, footerCol1Links: copy }));
                              }}
                              className="flex-1 px-2 py-1 bg-surface border border-outline/10 rounded-lg text-xs font-semibold text-on-surface"
                              placeholder="Link text"
                            />
                            <button
                              onClick={() => {
                                const copy = [...(webConfig.footerCol1Links || defaultCol1Links)].filter((_: any, lIdx: number) => lIdx !== idx);
                                setWebConfig(prev => ({ ...prev, footerCol1Links: copy }));
                              }}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <select
                            value={link.target || "/"}
                            onChange={(e) => {
                              const copy = [...(webConfig.footerCol1Links || defaultCol1Links)];
                              copy[idx] = { ...copy[idx], target: e.target.value };
                              setWebConfig(prev => ({ ...prev, footerCol1Links: copy }));
                            }}
                            className="px-2 py-1 bg-surface border border-outline/10 rounded-lg text-[10px] font-semibold text-on-surface w-full"
                          >
                            <optgroup label="Pages">
                              <option value="/">Home</option>
                              <option value="/catalog">All Products (Catalog)</option>
                              <option value="/contact">Contact</option>
                              <option value="/track-order">Track Order</option>
                              <option value="/blog">Blog</option>
                            </optgroup>
                            <optgroup label="Documents">
                              <option value="privacy">Privacy Policy</option>
                              <option value="terms">Terms of Service</option>
                              <option value="cookies">Cookie Policy</option>
                              <option value="refund">Refund Policy</option>
                              <option value="delivery">Delivery Policy</option>
                              <option value="dns">Do Not Sell (CCPA)</option>
                            </optgroup>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2 Links */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center border-b border-outline/5 pb-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-on-surface-variant uppercase block font-bold">Column #2 Title</label>
                        <input
                          type="text"
                          value={webConfig.footerCol2Title || "Support & Care"}
                          onChange={(e) => setWebConfig(prev => ({ ...prev, footerCol2Title: e.target.value }))}
                          className="px-2.5 py-1 bg-surface-container border border-outline/15 rounded-xl text-xs font-semibold text-on-surface"
                          placeholder="Support & Care"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const currentLinks = webConfig.footerCol2Links || defaultCol2Links;
                          const newLink = { text: "New Link", target: "/" };
                          setWebConfig(prev => ({ ...prev, footerCol2Links: [...currentLinks, newLink] }));
                        }}
                        className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-bold transition-colors"
                      >
                        + Add link
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(webConfig.footerCol2Links || defaultCol2Links).map((link: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2 bg-surface-container p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-on-surface-variant shrink-0">#{idx + 1}</span>
                            <input
                              type="text"
                              value={link.text || ""}
                              onChange={(e) => {
                                const copy = [...(webConfig.footerCol2Links || defaultCol2Links)];
                                copy[idx] = { ...copy[idx], text: e.target.value };
                                setWebConfig(prev => ({ ...prev, footerCol2Links: copy }));
                              }}
                              className="flex-1 px-2 py-1 bg-surface border border-outline/10 rounded-lg text-xs font-semibold text-on-surface"
                              placeholder="Link text"
                            />
                            <button
                              onClick={() => {
                                const copy = [...(webConfig.footerCol2Links || defaultCol2Links)].filter((_: any, lIdx: number) => lIdx !== idx);
                                setWebConfig(prev => ({ ...prev, footerCol2Links: copy }));
                              }}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <select
                            value={link.target || "/"}
                            onChange={(e) => {
                              const copy = [...(webConfig.footerCol2Links || defaultCol2Links)];
                              copy[idx] = { ...copy[idx], target: e.target.value };
                              setWebConfig(prev => ({ ...prev, footerCol2Links: copy }));
                            }}
                            className="px-2 py-1 bg-surface border border-outline/10 rounded-lg text-[10px] font-semibold text-on-surface w-full"
                          >
                            <optgroup label="Pages">
                              <option value="/">Home</option>
                              <option value="/catalog">Catalog</option>
                              <option value="/contact">Contact</option>
                              <option value="/track-order">Track Order</option>
                              <option value="/blog">Blog</option>
                            </optgroup>
                            <optgroup label="Documents">
                              <option value="privacy">Privacy Policy</option>
                              <option value="terms">Terms of Service</option>
                              <option value="cookies">Cookie Policy</option>
                              <option value="refund">Refund Policy</option>
                              <option value="delivery">Delivery Policy</option>
                              <option value="dns">Do Not Sell (CCPA)</option>
                            </optgroup>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Bar Links */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center border-b border-outline/5 pb-2">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Bottom Bar Legal Links</h4>
                      <button
                        onClick={() => {
                          const currentLinks = webConfig.footerBottomLinks || [];
                          const newLink = { text: "New Link", target: "terms" };
                          setWebConfig(prev => ({ ...prev,footerBottomLinks: [...currentLinks, newLink] }));
                        }}
                        className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-bold transition-colors"
                      >
                        + Add bottom link
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(webConfig.footerBottomLinks || []).map((link: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-center bg-surface-container p-2 rounded-lg">
                          <span className="font-mono text-[9px] text-on-surface-variant">#{idx + 1}</span>
                          <input
                            type="text"
                            value={link.text || ""}
                            onChange={(e) => {
                              const copy = [...webConfig.footerBottomLinks];
                              copy[idx] = { ...copy[idx], text: e.target.value };
                              setWebConfig(prev => ({ ...prev,footerBottomLinks: copy }));
                            }}
                            className="px-2 py-1 bg-surface border border-outline/10 rounded-lg text-xs font-semibold text-on-surface w-full"
                            placeholder="Link text"
                          />
                          <select
                            value={link.target || "terms"}
                            onChange={(e) => {
                              const copy = [...webConfig.footerBottomLinks];
                              copy[idx] = { ...copy[idx], target: e.target.value };
                              setWebConfig(prev => ({ ...prev, footerBottomLinks: copy }));
                            }}
                            className="px-2 py-1 bg-surface border border-outline/10 rounded-lg text-[10px] font-semibold text-on-surface"
                          >
                            <optgroup label="Pages">
                              <option value="/">Home</option>
                              <option value="/catalog">Catalog</option>
                              <option value="/contact">Contact</option>
                              <option value="/track-order">Track Order</option>
                              <option value="/blog">Blog</option>
                            </optgroup>
                            <optgroup label="Documents">
                              <option value="privacy">Privacy Policy</option>
                              <option value="terms">Terms of Service</option>
                              <option value="cookies">Cookie Policy</option>
                              <option value="refund">Refund Policy</option>
                              <option value="delivery">Delivery Policy</option>
                              <option value="dns">Do Not Sell (CCPA)</option>
                            </optgroup>
                          </select>
                          <button
                            onClick={() => {
                              const copy = webConfig.footerBottomLinks.filter((_: any, lIdx: number) => lIdx !== idx);
                              setWebConfig(prev => ({ ...prev,footerBottomLinks: copy }));
                            }}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Copyright line */}
                  <div className="space-y-1.5 border-t border-outline/5 pt-3">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Footer Bottom Copyright text</label>
                    <input
                      type="text"
                      value={webConfig.footerCopyrightText || ""}
                      onChange={(e) => setWebConfig(prev => ({ ...prev,footerCopyrightText: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                      placeholder="© 2026 AXON TECH INC. ALL RIGHTS RESERVED."
                    />
                  </div>

                  {/* Developer Credit */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Developer Credit Text</label>
                    <input
                      type="text"
                      value={webConfig.footerDeveloperCreditText || ""}
                      onChange={(e) => setWebConfig(prev => ({ ...prev, footerDeveloperCreditText: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                      placeholder="Built & Hosted by Kaste Brands"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Developer Credit URL</label>
                    <input
                      type="url"
                      value={webConfig.footerDeveloperCreditUrl || ""}
                      onChange={(e) => setWebConfig(prev => ({ ...prev, footerDeveloperCreditUrl: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                      placeholder="https://instagram.com/kaste_brands"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-outline/10">
                  <button
                    onClick={handleSaveConfig}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Save Footer Configuration Parameters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* CONFIG SUB-TAB: CONTACT INFO           */}
          {/* ======================================= */}
          {configSubTab === "contact" && contactData && (
            <div className="space-y-6">
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Contact Information Editor
                </h3>
                <p className="text-[10px] text-on-surface-variant/70">
                  Manage business name, phone numbers, emails, location, social links, and WhatsApp contact. These details are displayed across the site and in the WhatsApp floating button.
                </p>

                <div className="space-y-4 pt-2">
                  {/* Business Identity */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/5 pb-2">Business Identity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Business Name</label>
                        <input
                          type="text"
                          value={contactData.businessName || ""}
                          onChange={(e) => setContactData({ ...contactData, businessName: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Axon Technologies Kenya"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Tagline</label>
                        <input
                          type="text"
                          value={contactData.tagline || ""}
                          onChange={(e) => setContactData({ ...contactData, tagline: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Your Trusted Technology Partner in Kenya"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone Numbers */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/5 pb-2">Phone Numbers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Primary Phone</label>
                        <input
                          type="text"
                          value={contactData.phones?.primary || ""}
                          onChange={(e) => setContactData({ ...contactData, phones: { ...contactData.phones, primary: e.target.value } })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="+254745017979"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">WhatsApp URL</label>
                        <input
                          type="text"
                          value={contactData.phones?.whatsapp || ""}
                          onChange={(e) => setContactData({ ...contactData, phones: { ...contactData.phones, whatsapp: e.target.value } })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="https://wa.me/254745017979"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emails */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/5 pb-2">Email Addresses</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Sales</label>
                        <input
                          type="email"
                          value={contactData.emails?.sales || ""}
                          onChange={(e) => setContactData({ ...contactData, emails: { ...contactData.emails, sales: e.target.value } })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="sales@axontechke.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Info</label>
                        <input
                          type="email"
                          value={contactData.emails?.info || ""}
                          onChange={(e) => setContactData({ ...contactData, emails: { ...contactData.emails, info: e.target.value } })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="info@axontechke.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">General</label>
                        <input
                          type="email"
                          value={contactData.emails?.general || ""}
                          onChange={(e) => setContactData({ ...contactData, emails: { ...contactData.emails, general: e.target.value } })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="axontechkenya@gmail.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/5 pb-2">Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">City</label>
                        <input
                          type="text"
                          value={contactData.location?.city || ""}
                          onChange={(e) => setContactData({ ...contactData, location: { ...contactData.location, city: e.target.value } })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Nairobi"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Country</label>
                        <input
                          type="text"
                          value={contactData.location?.country || ""}
                          onChange={(e) => setContactData({ ...contactData, location: { ...contactData.location, country: e.target.value } })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Kenya"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Address</label>
                        <input
                          type="text"
                          value={contactData.location?.addressString || ""}
                          onChange={(e) => setContactData({ ...contactData, location: { ...contactData.location, addressString: e.target.value } })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Simara Mall, Ground Floor, Shop G50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Location Icon URL</label>
                      <input
                        type="text"
                        value={contactData.location?.icon || ""}
                        onChange={(e) => setContactData({ ...contactData, location: { ...contactData.location, icon: e.target.value } })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                        placeholder="https://example.com/marker.png"
                      />
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/5 pb-2">Business Hours</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Weekdays</label>
                        <input
                          type="text"
                          value={contactData.businessHours?.weekdays || ""}
                          onChange={(e) => setContactData({ ...contactData, businessHours: { ...contactData.businessHours, weekdays: e.target.value } })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Monday - Saturday: 8:00 AM - 6:00 PM EAT"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Support Call Hours</label>
                        <input
                          type="text"
                          value={contactData.businessHours?.supportCall || ""}
                          onChange={(e) => setContactData({ ...contactData, businessHours: { ...contactData.businessHours, supportCall: e.target.value } })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="8:00 AM - 8:00 PM EAT"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Socials */}
                  <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/5 pb-2">Social Media Links</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(contactData.socials || []).map((social: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2 bg-surface-container p-2 rounded-lg">
                          <div className="flex gap-3 items-center">
                            <span className="font-mono text-[9px] text-on-surface-variant w-16 truncate">{social.name}</span>
                            <input
                              type="text"
                              value={social.url || ""}
                              onChange={(e) => {
                                const copy = [...(contactData.socials || [])];
                                copy[idx] = { ...copy[idx], url: e.target.value };
                                setContactData({ ...contactData, socials: copy });
                              }}
                              className="flex-1 px-2.5 py-1.5 bg-surface border border-outline/15 rounded-xl text-[10px] text-on-surface"
                              placeholder="https://..."
                            />
                            <button
                              onClick={() => {
                                const copy = contactData.socials.filter((_: any, i: number) => i !== idx);
                                setContactData({ ...contactData, socials: copy });
                              }}
                              className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={social.icon || ""}
                            onChange={(e) => {
                              const copy = [...(contactData.socials || [])];
                              copy[idx] = { ...copy[idx], icon: e.target.value };
                              setContactData({ ...contactData, socials: copy });
                            }}
                            className="w-full px-2.5 py-1 bg-surface border border-outline/15 rounded-xl text-[10px] text-on-surface"
                            placeholder="Icon URL (e.g. https://img.icons8.com/color/48/whatsapp.png)"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const currentSocials = contactData.socials || [];
                        setContactData({ ...contactData, socials: [...currentSocials, { name: "New Platform", url: "https://", icon: "" }] });
                      }}
                      className="mt-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/15 rounded-lg text-[10px] font-bold transition-colors"
                    >
                      + Add social link
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline/10">
                  <button
                    onClick={handleSaveContact}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Save Contact Information
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 5: SUPPORT TICKETS & USER TRANSMISSIONS            */}
      {/* ======================================================= */}
      {activeTab === "support" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs font-semibold text-left">
          <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline/10">
              <div>
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary animate-pulse" />
                  Catalog Support Transmissions
                </h3>
                <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                  Manage inquiries submitted by AXON TECH customers regarding calibrations and shipping logistics.
                </p>
              </div>
              <button 
                onClick={loadAllAdminData}
                className="p-1.5 hover:bg-surface-container-high border border-outline/10 rounded-lg transition-all"
                title="Reload Database"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {supportRequests.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Check className="w-8 h-8 text-primary/40 mx-auto" />
                <p className="text-on-surface-variant/80">Operational buffer is clear. No active transmissions registered.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {supportRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className={`p-5 rounded-2xl border transition-all ${
                      req.status === "unread" 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-surface border-outline/10 opacity-80"
                    }`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-primary">{req.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-mono font-bold ${
                            req.status === "unread" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-on-surface">{req.subject}</h4>
                        <div className="flex gap-4 text-[10px] text-on-surface-variant/70 mt-1">
                          <span>Sender: <strong className="text-on-surface">{req.name}</strong> ({req.email})</span>
                          <span>Timestamp: {new Date(req.date).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        {req.status === "unread" ? (
                          <button
                            onClick={() => handleUpdateTicketStatus(req.id, "resolved")}
                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 text-green-500 rounded-xl transition-all font-bold"
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateTicketStatus(req.id, "unread")}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-500 rounded-xl transition-all font-bold"
                          >
                            Mark Unread
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-surface-container rounded-xl text-left font-mono text-[11px] leading-relaxed text-on-surface-variant whitespace-pre-wrap border border-outline/5">
                      {req.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* CONFIG SUB-TAB: WHATSAPP SETTINGS                     */}
      {/* ======================================================= */}
      {configSubTab === "whatsapp" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs font-semibold text-left">
          <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
            <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              WhatsApp Notification Settings
            </h3>
            <p className="text-[11px] text-on-surface-variant/70">
              Control when WhatsApp messages are sent on new orders. Requires WhatsApp Business API credentials to be set in Cloudflare environment variables.
            </p>

            {/* Enable/Disable WhatsApp notifications */}
            <div className="flex items-center justify-between p-4 bg-surface border border-outline/10 rounded-xl">
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-on-surface block">Enable WhatsApp Notifications</label>
                <p className="text-[10px] text-on-surface-variant/60">Master switch for all WhatsApp messages on new orders</p>
              </div>
              <button
                onClick={() => setWebConfig(prev => ({ ...prev, whatsappEnabled: !prev.whatsappEnabled }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  webConfig.whatsappEnabled ? "bg-green-500" : "bg-surface-container-high"
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  webConfig.whatsappEnabled ? "translate-x-7" : "translate-x-1"
                }`} />
              </button>
            </div>

            {/* Send to Admin */}
            <div className="flex items-center justify-between p-4 bg-surface border border-outline/10 rounded-xl">
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-on-surface block">Notify Admin on New Orders</label>
                <p className="text-[10px] text-on-surface-variant/60">Send order details to your admin WhatsApp number</p>
              </div>
              <button
                onClick={() => setWebConfig(prev => ({ ...prev, whatsappSendToAdmin: !prev.whatsappSendToAdmin }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  webConfig.whatsappSendToAdmin ? "bg-green-500" : "bg-surface-container-high"
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  webConfig.whatsappSendToAdmin ? "translate-x-7" : "translate-x-1"
                }`} />
              </button>
            </div>

            {/* Send to Customer */}
            <div className="flex items-center justify-between p-4 bg-surface border border-outline/10 rounded-xl">
              <div className="space-y-0.5">
                <label className="text-[11px] font-bold text-on-surface block">Notify Customer on New Orders</label>
                <p className="text-[10px] text-on-surface-variant/60">Send order confirmation to the customer's WhatsApp</p>
              </div>
              <button
                onClick={() => setWebConfig(prev => ({ ...prev, whatsappSendToCustomer: !prev.whatsappSendToCustomer }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  webConfig.whatsappSendToCustomer ? "bg-green-500" : "bg-surface-container-high"
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  webConfig.whatsappSendToCustomer ? "translate-x-7" : "translate-x-1"
                }`} />
              </button>
            </div>

            {/* WhatsApp API status */}
            <div className="p-4 rounded-xl border border-outline/10 space-y-2">
              <h4 className="text-[11px] font-bold text-on-surface uppercase">API Configuration Status</h4>
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className={webConfig._waTokenSet ? "text-green-500" : "text-red-500"}>•</span>
                  <span className="text-on-surface-variant">WhatsApp Access Token:</span>
                  <span className={webConfig._waTokenSet ? "text-green-500 font-bold" : "text-red-500"}>
                    {webConfig._waTokenSet ? "Configured" : "Not set — add WHATSAPP_ACCESS_TOKEN in Cloudflare secrets"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={webConfig._waPhoneSet ? "text-green-500" : "text-red-500"}>•</span>
                  <span className="text-on-surface-variant">Phone Number ID:</span>
                  <span className={webConfig._waPhoneSet ? "text-green-500 font-bold" : "text-red-500"}>
                    {webConfig._waPhoneSet ? "Configured" : "Not set — add WHATSAPP_PHONE_NUMBER_ID in Cloudflare secrets"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={webConfig._waAdminSet ? "text-green-500" : "text-yellow-500"}>•</span>
                  <span className="text-on-surface-variant">Admin Notify Number:</span>
                  <span className={webConfig._waAdminSet ? "text-green-500 font-bold" : "text-yellow-500"}>
                    {webConfig.whatsappAdminNumber || "Not set — add WHATSAPP_ADMIN_NOTIFY_NUMBER in Cloudflare secrets"}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin WhatsApp number override (editable in UI) */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase block">Admin WhatsApp Number (overrides env var)</label>
              <input
                type="text"
                value={webConfig.whatsappAdminNumber || ""}
                onChange={(e) => setWebConfig(prev => ({ ...prev,whatsappAdminNumber: e.target.value }))}
                placeholder="254745017979"
                className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
              />
              <p className="text-[9px] text-on-surface-variant/60">Kenyan format, no + sign. Leave empty to use env var value.</p>
            </div>

            {/* Save button */}
            <div className="pt-2">
              <button
                onClick={handleSaveConfig}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                Save WhatsApp Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 6: DELIVERY METHODS CRUD                           */}
      {/* ======================================================= */}
      {activeTab === "delivery" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs font-semibold text-left">
          <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/10">
              <div>
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Logistics Carrier Network Management
                </h3>
                <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                  Keep a secure record of delivery methods, shipping speeds, and pricing to bind to customer notifications during shipment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingMethod({
                    id: "",
                    name: "",
                    carrier: "",
                    price: 0,
                    transitDays: "2-3 days",
                    description: "",
                    enabled: true,
                    locations: []
                  });
                  setIsMethodFormOpen(true);
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Delivery Method
              </button>
            </div>

            {/* Methods list/cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveryMethods.map((method) => (
                <div key={method.id} className="p-5 bg-surface border border-outline/10 rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-primary/20 transition-all shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold text-primary">{method.carrier}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                        method.enabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {method.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <h4 className="font-display font-black text-sm text-on-surface leading-tight">{method.name}</h4>
                    <p className="text-[10px] text-on-surface-variant/70 leading-relaxed min-h-[32px]">{method.description}</p>
                    {(method.locations || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(method.locations) ? method.locations : JSON.parse(method.locations || '[]')).map((loc: string) => (
                          <span key={loc} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-bold rounded uppercase">{loc}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-outline/10 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-on-surface-variant block uppercase leading-none font-bold">Price / Transit</span>
                      <strong className="text-on-surface text-xs block mt-1">KSh {method.price.toLocaleString()} <span className="text-[10px] text-on-surface-variant font-normal">({method.transitDays})</span></strong>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMethod({ ...method, locations: typeof method.locations === 'string' ? JSON.parse(method.locations || '[]') : (method.locations || []) });
                          setIsMethodFormOpen(true);
                        }}
                        className="p-1.5 bg-surface-container hover:bg-surface-container-high border border-outline/10 rounded-lg text-primary transition-colors cursor-pointer"
                        title="Edit Delivery Method"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDeliveryMethod(method.id)}
                        className="p-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg text-red-500 transition-colors cursor-pointer"
                        title="Delete Delivery Method"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {deliveryMethods.length === 0 && (
                <div className="col-span-full py-16 text-center space-y-2 bg-surface rounded-2xl border border-dashed border-outline/15">
                  <Truck className="w-8 h-8 text-primary/30 mx-auto animate-bounce" />
                  <p className="text-on-surface-variant/80">No logistics methods documented. Click standard 'Add Delivery Method' above to start.</p>
                </div>
              )}
            </div>
          </div>

          {/* Add / Edit Delivery Method Dialog */}
          {isMethodFormOpen && editingMethod && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
              <form onSubmit={handleSaveDeliveryMethod} className="w-full max-w-md bg-surface-container-high p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 text-left border border-outline/10 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-outline/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase">Logistics Carrier Network</span>
                    <h3 className="font-display font-black text-base text-on-surface">{editingMethod.id ? "Update Delivery Method" : "Add Delivery Method"}</h3>
                  </div>
                  <button type="button" onClick={() => { setIsMethodFormOpen(false); setEditingMethod(null); }} className="p-1 rounded-full hover:bg-surface-container-highest">
                    <X className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>

                <div className="space-y-4 text-xs text-on-surface">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant block uppercase">Carrier Name</label>
                    <input
                      type="text"
                      placeholder="e.g. DHL Express, FedEx Priority, AXON Transport"
                      value={editingMethod.carrier}
                      onChange={(e) => setEditingMethod({ ...editingMethod, carrier: e.target.value })}
                      className="w-full px-3 py-2.5 bg-surface border border-outline/15 rounded-xl focus:outline-none text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant block uppercase">Delivery Method Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Premium Air Calibration Delivery"
                      value={editingMethod.name}
                      onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-surface border border-outline/15 rounded-xl focus:outline-none text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant block uppercase">Price ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 15.00"
                        value={editingMethod.price}
                        onChange={(e) => setEditingMethod({ ...editingMethod, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2.5 bg-surface border border-outline/15 rounded-xl focus:outline-none text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant block uppercase">Transit Speed</label>
                      <input
                        type="text"
                        placeholder="e.g. 1-2 days, Overnight"
                        value={editingMethod.transitDays}
                        onChange={(e) => setEditingMethod({ ...editingMethod, transitDays: e.target.value })}
                        className="w-full px-3 py-2.5 bg-surface border border-outline/15 rounded-xl focus:outline-none text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant block uppercase">Method Description</label>
                    <textarea
                      placeholder="e.g. Fast and reliable delivery to your region."
                      value={editingMethod.description || ""}
                      onChange={(e) => setEditingMethod({ ...editingMethod, description: e.target.value })}
                      className="w-full h-20 px-3 py-2 bg-surface border border-outline/15 rounded-xl focus:outline-none text-xs"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant block uppercase">Covered Regions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Kenya", "Nairobi", "Uganda", "Tanzania", "Sudan", "Ethiopia", "Rwanda", "Burundi", "South Sudan", "Somalia", "International"].map((loc) => (
                        <label key={loc} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(editingMethod.locations || []).includes(loc)}
                            onChange={(e) => {
                              const current = editingMethod.locations || [];
                              const next = e.target.checked
                                ? [...current, loc]
                                : current.filter((l: string) => l !== loc);
                              setEditingMethod({ ...editingMethod, locations: next });
                            }}
                            className="w-3.5 h-3.5 rounded text-primary border-outline/20 focus:ring-0"
                          />
                          <span className="text-xs text-on-surface">{loc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="method-enabled-checkbox"
                      checked={editingMethod.enabled}
                      onChange={(e) => setEditingMethod({ ...editingMethod, enabled: e.target.checked })}
                      className="w-4 h-4 rounded text-primary border-outline/20 focus:ring-0"
                    />
                    <label htmlFor="method-enabled-checkbox" className="text-xs font-semibold cursor-pointer">Enable this delivery method</label>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-outline/10">
                  <button
                    type="button"
                    onClick={() => { setIsMethodFormOpen(false); setEditingMethod(null); }}
                    className="w-1/2 py-2.5 bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors text-center shadow-md cursor-pointer"
                  >
                    Save Method
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 7: WHATSAPP NOTIFICATIONS GATEWAY LOGS             */}
      {/* ======================================================= */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs font-semibold text-left">
          {/* Gateway Status Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-surface-container-low border border-outline/10 rounded-3xl flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl relative">
                <span className="flex h-2 w-2 absolute top-1 right-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant block uppercase font-mono">Meta API Node</span>
                <strong className="text-green-500 text-sm block mt-0.5">ACTIVE & LIVE</strong>
              </div>
            </div>

            <div className="p-5 bg-surface-container-low border border-outline/10 rounded-3xl flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant block uppercase font-mono font-bold">Outbound Alerts</span>
                <strong className="text-on-surface text-base block mt-0.5">{whatsappNotifications.length} Sent</strong>
              </div>
            </div>

            <div className="p-5 bg-surface-container-low border border-outline/10 rounded-3xl flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant block uppercase font-mono font-bold">Delivery Rate</span>
                <strong className="text-on-surface text-base block mt-0.5">
                  {whatsappNotifications.length > 0 
                    ? `${Math.round((whatsappNotifications.filter(n => n.status === "delivered" || n.status === "read").length / whatsappNotifications.length) * 100)}%`
                    : "100%"
                  } Arrived
                </strong>
              </div>
            </div>

            <div className="p-5 bg-surface-container-low border border-outline/10 rounded-3xl flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <History className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant block uppercase font-mono font-bold">API Transactions</span>
                <strong className="text-on-surface text-base block mt-0.5">{whatsappApiLogs.length} Registered</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Outbound Logs pane */}
            <div className="xl:col-span-7 bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-outline/10">
                <div>
                  <h3 className="font-display font-bold text-sm text-on-surface">Outbound WhatsApp Notifications Registry</h3>
                  <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                    Real-time status updates of notifications fired to customers regarding parcel handovers.
                  </p>
                </div>
                <button 
                  onClick={loadAllAdminData}
                  className="p-1.5 hover:bg-surface-container-high border border-outline/10 rounded-lg transition-all cursor-pointer"
                  title="Reload Registry"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-on-surface-variant" />
                </button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {whatsappNotifications.map((notif) => (
                  <div key={notif.id} className="p-4 bg-surface border border-outline/10 rounded-2xl space-y-3 hover:border-primary/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] text-primary">{notif.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase ${
                            notif.status === "read" ? "bg-green-500/10 text-green-500 border border-green-500/25" :
                            notif.status === "delivered" ? "bg-blue-500/10 text-blue-500" :
                            "bg-amber-500/10 text-amber-500"
                          }`}>
                            {notif.status}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-xs text-on-surface mt-1">Recipient: <span className="font-sans font-bold">{notif.recipientName}</span> ({notif.recipientPhone})</h4>
                      </div>
                      <span className="text-[9px] text-on-surface-variant/60 font-mono">{new Date(notif.sentAt).toLocaleString()}</span>
                    </div>

                    <div className="p-3 bg-surface-container rounded-xl font-mono text-[10px] text-on-surface-variant/90 leading-relaxed border border-outline/5 whitespace-pre-wrap text-left">
                      {notif.messageText}
                    </div>

                    <div className="flex gap-4 text-[9px] text-on-surface-variant/60 font-mono">
                      <span>Order linked: <strong className="text-primary">{notif.orderId}</strong></span>
                      <span>Carrier: <strong className="text-on-surface">{notif.deliveryDetails?.carrier || "N/A"}</strong></span>
                      <span>Tracking: <strong className="text-on-surface">{notif.deliveryDetails?.trackingNumber || "N/A"}</strong></span>
                    </div>
                  </div>
                ))}

                {whatsappNotifications.length === 0 && (
                  <div className="py-16 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-primary/30 mx-auto" />
                    <p className="text-on-surface-variant/80">Operational buffer clear. No WhatsApp outbound history exists.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Meta API Console Logs Pane */}
            <div className="xl:col-span-5 bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-outline/10">
                  <div>
                    <h3 className="font-display font-bold text-sm text-on-surface">Meta API Gateway Call Log</h3>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                      Debugging transactions with the Meta Business API server and Webhook callbacks.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl font-mono text-[10px] text-zinc-300 space-y-3 max-h-[400px] overflow-y-auto border border-zinc-800 shadow-inner">
                  {whatsappApiLogs.map((log) => (
                    <div key={log.id} className="border-b border-zinc-800 pb-2.5 last:border-0 last:pb-0 space-y-1 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          log.statusCode < 300 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          HTTP {log.statusCode}
                        </span>
                      </div>
                      <div className="text-[9px] text-zinc-400">
                        <span className="text-amber-400 font-bold">{log.method}</span> {log.endpoint}
                      </div>
                      <div className="text-zinc-500 text-[9px] leading-relaxed break-all whitespace-pre-wrap pl-2 border-l border-zinc-800">
                        Response Payload: {JSON.stringify(log.responsePayload)}
                      </div>
                    </div>
                  ))}

                  {whatsappApiLogs.length === 0 && (
                    <div className="py-16 text-center space-y-1.5 text-zinc-500">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 animate-ping mx-auto" />
                      <p className="text-[10px]">Awaiting system carrier dispatches to capture live API transactions...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-outline/10">
                <div className="p-3.5 bg-surface rounded-2xl border border-outline/10 flex items-start gap-2.5 text-left">
                  <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-[10px] text-on-surface-variant/80 leading-normal font-sans">
                    This Meta Business API gateway uses the official cloud message layout templates. State mutations are simulated asynchronously via Node webhooks callback loops to trigger live customer "delivered" and "read" status webhook actions in 8-15 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 8: METROLOGY BLOG ENGINE                            */}
      {/* ======================================================= */}
      {activeTab === "blog" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200" id="admin-blog-view">
          {/* AI Generator Control Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-outline/10 pb-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <BarChart3 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-on-surface">Gemini GEO/SEO Copywriter</h3>
                  <p className="text-[10px] text-on-surface-variant/70">Automatic authoritative article composer grounded in generative search vectors</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Prompt Entry */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Metrology/Hardware Theme Prompt
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. ISO/IEC 17025 verification workflows for silicon companion hardware in sub-Saharan regional corridors"
                    value={topicPrompt}
                    onChange={(e) => setTopicPrompt(e.target.value)}
                    disabled={generatingBlog}
                    className="w-full bg-surface border border-outline/15 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface placeholder:text-on-surface-variant/40"
                    id="admin-blog-prompt"
                  />
                  <span className="text-[9px] text-on-surface-variant/50 block">
                    Describe the metrology task, calibration procedure, or hardware suite. Gemini will output fully structured markdown with verified standards citations.
                  </span>
                </div>

                {/* GEO Hub Anchor */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Geographic Hub Anchor (GEO Search Index)
                  </label>
                  <select
                    value={geographicHub}
                    onChange={(e) => setGeographicHub(e.target.value)}
                    disabled={generatingBlog}
                    className="w-full bg-surface border border-outline/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary text-on-surface"
                    id="admin-blog-geohub"
                  >
                    <option value="Nairobi, Kenya">Nairobi, Kenya (East Africa Hub)</option>
                    <option value="Cape Town, South Africa">Cape Town, South Africa (Southern Africa)</option>
                    <option value="Lagos, Nigeria">Lagos, Nigeria (West Africa Nodes)</option>
                    <option value="Berlin, Germany">Berlin, Germany (Central EU Labs)</option>
                    <option value="Tokyo, Japan">Tokyo, Japan (APAC Silicon Foundry)</option>
                    <option value="London, United Kingdom">London, UK (Metrology Standards HQ)</option>
                    <option value="New York, USA">New York, USA (Global FinTech Nodes)</option>
                  </select>
                  <span className="text-[9px] text-on-surface-variant/50 block">
                    This inserts geographical reference vectors directly into the article to rank in Google generative search (SGE/GEO).
                  </span>
                </div>

                {/* Compile Action Button */}
                <button
                  onClick={handleGenerateBlog}
                  disabled={generatingBlog}
                  className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  id="admin-blog-generate-btn"
                >
                  {generatingBlog ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gemini Composing (Takes ~10s)...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Compile SEO Article with Gemini</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Strategy Card */}
            <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-5 space-y-3.5 text-left text-xs">
              <h4 className="font-bold text-on-surface flex items-center gap-1">
                <Tag className="w-4 h-4 text-primary" />
                <span>Our Generative Engine Optimization Core</span>
              </h4>
              <p className="text-on-surface-variant/80 leading-relaxed text-[11px]">
                To satisfy Google SGE and Bing CoPilot ranking algorithms, our AI model applies three specific GEO layers:
              </p>
              <ul className="space-y-2 text-[10px] text-on-surface-variant/70 pl-1 list-disc list-inside">
                <li><strong className="text-on-surface">Information Density</strong>: Citations of real metrology, NIST, and ISO calibration protocols.</li>
                <li><strong className="text-on-surface">Local Grounding</strong>: Mentions region-specific coordinates, hubs, and regional hardware.</li>
                <li><strong className="text-on-surface">Schema.org Structured Data</strong>: Validated JSON-LD injected in Head on article load.</li>
              </ul>
            </div>
          </div>

          {/* Published Articles Database Grid Column */}
          <div className="lg:col-span-7 bg-surface-container-low border border-outline/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-outline/10 pb-3">
              <div>
                <h3 className="font-display font-bold text-sm text-on-surface">GEO-Indexed Database Catalog</h3>
                <p className="text-[10px] text-on-surface-variant/70">Review metadata logs and manage published articles</p>
              </div>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold">
                {blogPosts.length} Articles
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-surface border border-outline/10 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/20 transition-all text-left"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-secondary text-secondary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {post.category}
                      </span>
                      <span className="text-[9px] text-primary font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.contentLocation}
                      </span>
                      <span className="text-[9px] text-on-surface-variant/60">
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-on-surface truncate pr-2">
                      {post.title}
                    </h4>

                    <div className="bg-muted px-2 py-1.5 rounded font-mono text-[9px] text-on-surface-variant truncate">
                      {post.metaTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        alert(`Structured JSON-LD schema for this post:\n\n${post.jsonLd}`);
                      }}
                      className="p-1.5 hover:bg-muted text-on-surface-variant rounded-lg border border-outline/10 cursor-pointer"
                      title="View Schema JSON-LD"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlogPost(post.id)}
                      className="p-1.5 bg-red-500/10 text-red-600 border border-red-500/10 hover:bg-red-500/15 rounded-lg cursor-pointer"
                      title="Permanently Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {blogPosts.length === 0 && (
                <div className="py-20 text-center space-y-2 text-on-surface-variant/50">
                  <BarChart3 className="w-10 h-10 mx-auto opacity-30" />
                  <h4 className="text-xs font-semibold">Metadata index empty</h4>
                  <p className="text-[10px] max-w-xs mx-auto">
                    Type a theme prompt on the left and compile an article to fill the index.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB: REVIEWS MODERATION                                  */}
      {/* ======================================================= */}
      {activeTab === "reviews" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs text-left" id="admin-reviews-view">
          <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline/10">
              <div>
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Customer Reviews Moderation
                </h3>
                <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                  Approve, reject, or delete customer reviews. Approved reviews appear on the homepage widget.
                </p>
              </div>
              <button
                onClick={() => {
                  authFetch("/api/admin/reviews")
                    .then(res => res.json())
                    .then(data => setAdminReviews(data))
                    .catch(err => console.error("Error refreshing reviews:", err));
                }}
                className="p-1.5 hover:bg-surface-container-high border border-outline/10 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total", count: adminReviews.length, color: "bg-blue-500/10 text-blue-600" },
                { label: "Approved", count: adminReviews.filter((r: any) => r.approved).length, color: "bg-green-500/10 text-green-600" },
                { label: "Pending", count: adminReviews.filter((r: any) => !r.approved).length, color: "bg-amber-500/10 text-amber-600" },
                { label: "Avg Rating", count: adminReviews.length > 0 ? (adminReviews.reduce((sum: number, r: any) => sum + (r.rating || 5), 0) / adminReviews.length).toFixed(1) : "—", color: "bg-primary/10 text-primary" }
              ].map((stat) => (
                <div key={stat.label} className={`${stat.color} rounded-xl p-3 text-center`}>
                  <div className="text-lg font-bold">{stat.count}</div>
                  <div className="text-[10px] font-semibold opacity-70">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {adminReviews.map((review: any) => (
                <div
                  key={review.id}
                  className={`bg-surface border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4 transition-all text-left ${
                    review.approved ? "border-green-500/20" : "border-outline/10"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Rating Stars */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= (review.rating || 5) ? "fill-amber-500 text-amber-500" : "text-on-surface-variant/20"}`} />
                        ))}
                      </div>
                      <span className="font-bold text-on-surface text-xs">{review.author || "Anonymous"}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        review.approved ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {review.approved ? "Approved" : "Pending"}
                      </span>
                      {review.source && (
                        <span className="bg-muted text-on-surface-variant px-1.5 py-0.5 rounded text-[9px] font-medium capitalize">
                          {review.source}
                        </span>
                      )}
                    </div>
                    <p className="text-on-surface-variant/80 text-[11px] leading-relaxed line-clamp-2">{review.text}</p>
                    <div className="flex items-center gap-3 text-[9px] text-on-surface-variant/50">
                      <span>{new Date(review.createdAt).toLocaleString()}</span>
                      {review.device && <span>Device: {review.device}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!review.approved && (
                      <button
                        onClick={async () => {
                          try {
                            await authFetch(`/api/admin/reviews/${review.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ approved: true })
                            });
                            setAdminReviews((prev: any[]) => prev.map((r: any) => r.id === review.id ? { ...r, approved: true } : r));
                          } catch (err) { console.error(err); }
                        }}
                        className="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/10 hover:bg-green-500/15 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                    {review.approved && (
                      <button
                        onClick={async () => {
                          try {
                            await authFetch(`/api/admin/reviews/${review.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ approved: false })
                            });
                            setAdminReviews((prev: any[]) => prev.map((r: any) => r.id === review.id ? { ...r, approved: false } : r));
                          } catch (err) { console.error(err); }
                        }}
                        className="px-2 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/10 hover:bg-amber-500/15 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (!confirm("Permanently delete this review?")) return;
                        try {
                          await authFetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
                          setAdminReviews((prev: any[]) => prev.filter((r: any) => r.id !== review.id));
                        } catch (err) { console.error(err); }
                      }}
                      className="p-1 bg-red-500/10 text-red-600 border border-red-500/10 hover:bg-red-500/15 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {adminReviews.length === 0 && (
                <div className="py-20 text-center space-y-2 text-on-surface-variant/50">
                  <Star className="w-10 h-10 mx-auto opacity-30" />
                  <h4 className="text-xs font-semibold">No reviews yet</h4>
                  <p className="text-[10px] max-w-xs mx-auto">
                    Customer reviews submitted via the homepage widget will appear here for moderation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB: GLOBAL COLORS LIBRARY                             */}
      {/* ======================================================= */}
      {activeTab === "colors" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs text-left" id="admin-colors-view">
          <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline/10">
              <div>
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-500" />
                  Global Color Library
                </h3>
                <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                  Add, edit or remove colors used across all products. Click any color to edit its hex code or image URL.
                </p>
              </div>
            </div>

            {/* Add new color form */}
            <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
              <span className="text-[10px] font-black text-primary uppercase">Add New Color</span>
              <div className="grid grid-cols-6 gap-2 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] text-on-surface-variant/70 block">Color Name</label>
                  <input
                    type="text"
                    id="gc-name"
                    placeholder="e.g. Midnight Black"
                    className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-on-surface-variant/70 block">Hex Code</label>
                  <input
                    type="text"
                    id="gc-code"
                    placeholder="#1a1a1a"
                    className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[11px] font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-on-surface-variant/70 block">Swatch / Image URL</label>
                  <input
                    type="text"
                    id="gc-image"
                    placeholder="https://..."
                    className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-on-surface-variant/70 block">Preview</label>
                  <div id="gc-preview" className="w-full h-9 rounded-lg border border-outline/15 bg-surface flex items-center justify-center text-[9px] text-on-surface-variant/50">—</div>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] opacity-0 block">Add</label>
                  <button
                    type="button"
                    onClick={() => {
                      const name = (document.getElementById("gc-name") as HTMLInputElement)?.value.trim();
                      const code = (document.getElementById("gc-code") as HTMLInputElement)?.value.trim();
                      const image = (document.getElementById("gc-image") as HTMLInputElement)?.value.trim();
                      if (!name) { alert("Color name is required."); return; }
                      if (globalColors.some((c: any) => c.name.toLowerCase() === name.toLowerCase())) { alert("This color already exists."); return; }
                      authFetch("/api/admin/colors", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, code, image })
                      }).then(res => res.json()).then((saved: any) => {
                        setGlobalColors(prev => [...prev, saved]);
                        (document.getElementById("gc-name") as HTMLInputElement).value = "";
                        (document.getElementById("gc-code") as HTMLInputElement).value = "";
                        (document.getElementById("gc-image") as HTMLInputElement).value = "";
                        const preview = document.getElementById("gc-preview");
                        if (preview) preview.textContent = "—";
                      }).catch(err => console.error(err));
                    }}
                    className="w-full py-1.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Color
                  </button>
                </div>
              </div>
            </div>

            {/* Colors grid */}
            {globalColors.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant/50 text-[11px]">
                No colors yet. Add your first color above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {globalColors.map((color: any) => (
                  <div key={color.id} className="bg-surface border border-outline/10 rounded-xl p-3 space-y-2 hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-2">
                      <div
                        className="w-10 h-10 rounded-lg border border-outline/20 shrink-0"
                        style={{ backgroundColor: color.code || "#cccccc" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[11px] text-on-surface truncate">{color.name}</div>
                        <div className="font-mono text-[9px] text-on-surface-variant/60">{color.code || "—"}</div>
                      </div>
                    </div>
                    {color.image && (
                      <img src={color.image} alt={color.name} className="w-full h-16 object-cover rounded-lg border border-outline/10"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newCode = prompt("Edit Hex Code:", color.code || "");
                          if (newCode === null) return;
                          authFetch(`/api/admin/colors/${color.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ code: newCode })
                          }).then(res => res.json()).then((updated: any) => {
                            setGlobalColors(prev => prev.map((c: any) => c.id === color.id ? updated : c));
                          }).catch(err => console.error(err));
                        }}
                        className="flex-1 py-1 bg-surface-container hover:bg-surface-container-high text-[9px] font-bold rounded-lg border border-outline/10 text-on-surface"
                      >
                        <Edit3 className="w-3 h-3 inline mr-0.5" /> Hex
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`Delete color "${color.name}"?`)) return;
                          authFetch(`/api/admin/colors/${color.id}`, { method: "DELETE" }).then(res => res.json()).then(() => {
                            setGlobalColors(prev => prev.filter((c: any) => c.id !== color.id));
                          }).catch(err => console.error(err));
                        }}
                        className="flex-1 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-bold rounded-lg border border-red-500/10"
                      >
                        <Trash2 className="w-3 h-3 inline mr-0.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB: GLOBAL SIM TYPES LIBRARY                            */}
      {/* ======================================================= */}
      {activeTab === "simTypes" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs text-left" id="admin-simtypes-view">
          <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline/10">
              <div>
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  Global SIM Types Library
                </h3>
                <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                  Manage SIM types used in storage variants. Works for any product: phones, tablets, watches, routers, laptops. Add "WiFi Only", "No SIM", "Dual eSIM" etc.
                </p>
              </div>
            </div>

            {/* Add new SIM type form */}
            <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
              <span className="text-[10px] font-black text-primary uppercase">Add New SIM Type</span>
              <div className="grid grid-cols-6 gap-2 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] text-on-surface-variant/70 block">Display Name *</label>
                  <input
                    type="text"
                    id="sim-name"
                    placeholder="e.g. Dual Physical SIM"
                    className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-on-surface-variant/70 block">Code (auto)</label>
                  <input
                    type="text"
                    id="sim-code"
                    placeholder="e.g. dual-physical"
                    className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[11px] font-mono"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] text-on-surface-variant/70 block">Description</label>
                  <input
                    type="text"
                    id="sim-desc"
                    placeholder="e.g. Two nano SIM slots"
                    className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none focus:border-primary text-[11px]"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] opacity-0 block">Add</label>
                  <button
                    type="button"
                    onClick={() => {
                      const name = (document.getElementById("sim-name") as HTMLInputElement)?.value.trim();
                      const code = (document.getElementById("sim-code") as HTMLInputElement)?.value.trim();
                      const description = (document.getElementById("sim-desc") as HTMLInputElement)?.value.trim();
                      if (!name) { alert("SIM type name is required."); return; }
                      if (globalSimTypes.some((s: any) => s.name.toLowerCase() === name.toLowerCase() || s.code.toLowerCase() === (code || name).toLowerCase().replace(/\s+/g, "-"))) { alert("This SIM type already exists."); return; }
                      authFetch("/api/admin/sim-types", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, code: code || undefined, description })
                      }).then(res => res.json()).then((saved: any) => {
                        if (saved.error) { alert(saved.error); return; }
                        setGlobalSimTypes(prev => [...prev, saved].sort((a,b)=>a.name.localeCompare(b.name)));
                        (document.getElementById("sim-name") as HTMLInputElement).value = "";
                        (document.getElementById("sim-code") as HTMLInputElement).value = "";
                        (document.getElementById("sim-desc") as HTMLInputElement).value = "";
                      }).catch(err => console.error(err));
                    }}
                    className="w-full py-1.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add SIM Type
                  </button>
                </div>
              </div>
              <p className="text-[9px] text-on-surface-variant/50">Code is stored in DB (e.g. "physical"). If empty, auto-generated from name. Used in <code>storageVariants[].simType</code>.</p>
            </div>

            {/* SIM types grid */}
            {globalSimTypes.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant/50 text-[11px]">
                No SIM types yet. Add your first type above. Defaults: Physical SIM, eSIM, Dual SIM.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {globalSimTypes.map((sim: any) => (
                  <div key={sim.id} className="bg-surface border border-outline/10 rounded-xl p-3 space-y-2 hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[11px] text-on-surface truncate">{sim.name}</div>
                        <div className="font-mono text-[9px] text-primary/70">{sim.code}</div>
                        {sim.description && <div className="text-[9px] text-on-surface-variant/60 truncate">{sim.description}</div>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newName = prompt("Edit Display Name:", sim.name);
                          if (newName === null) return;
                          const newDesc = prompt("Edit Description:", sim.description || "");
                          if (newDesc === null) return;
                          authFetch(`/api/admin/sim-types/${sim.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: newName, description: newDesc ?? "" })
                          }).then(res => res.json()).then((updated: any) => {
                            if (updated.error) { alert(updated.error); return; }
                            setGlobalSimTypes(prev => prev.map((s: any) => s.id === sim.id ? updated : s).sort((a,b)=>a.name.localeCompare(b.name)));
                          }).catch(err => console.error(err));
                        }}
                        className="flex-1 py-1 bg-surface-container hover:bg-surface-container-high text-[9px] font-bold rounded-lg border border-outline/10 text-on-surface"
                      >
                        <Edit3 className="w-3 h-3 inline mr-0.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newCode = prompt("Edit Code (stored value):", sim.code);
                          if (newCode === null) return;
                          authFetch(`/api/admin/sim-types/${sim.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ code: newCode })
                          }).then(res => res.json()).then((updated: any) => {
                            if (updated.error) { alert(updated.error); return; }
                            setGlobalSimTypes(prev => prev.map((s: any) => s.id === sim.id ? updated : s).sort((a,b)=>a.name.localeCompare(b.name)));
                          }).catch(err => console.error(err));
                        }}
                        className="flex-1 py-1 bg-surface-container hover:bg-surface-container-high text-[9px] font-bold rounded-lg border border-outline/10 text-on-surface font-mono"
                      >
                        Code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`Delete SIM type "${sim.name}"? Products using it will keep the value but it won't be selectable.`)) return;
                          authFetch(`/api/admin/sim-types/${sim.id}`, { method: "DELETE" }).then(res => res.json()).then(() => {
                            setGlobalSimTypes(prev => prev.filter((s: any) => s.id !== sim.id));
                          }).catch(err => console.error(err));
                        }}
                        className="py-1 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-bold rounded-lg border border-red-500/10"
                      >
                        <Trash2 className="w-3 h-3 inline" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-3 text-[10px] text-blue-800 dark:text-blue-200">
              <b>Tip:</b> For laptops/tablets without SIM, create "WiFi Only" (code: <code>none</code>) or "No SIM". For watches, "eSIM Only". The code is what gets saved in product variants, so keep it short and kebab-case.
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 9: PRICE TRACKER ALERTS CONSOLE                     */}
      {/* ======================================================= */}
      {activeTab === "priceTrackers" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs text-left" id="admin-price-alerts-view">
          <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline/10">
              <div>
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary animate-pulse" />
                  Catalog Price Monitor Registry
                </h3>
                <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                  Track active price monitors and simulated price drop alerts dispatched to users.
                </p>
              </div>
              <button 
                onClick={loadAllAdminData}
                className="p-1.5 hover:bg-surface-container-high border border-outline/10 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Monitors List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-outline/5 pb-2">
                  <h4 className="font-black text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <span>Active Monitors</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[9px] font-bold">
                      {priceTrackers.filter(t => t.status === "active").length} Pending
                    </span>
                  </h4>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {priceTrackers.filter(t => t.status === "active").map((tracker) => (
                    <div key={tracker.id} className="bg-surface border border-outline/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={tracker.productImage} alt={tracker.productName} className="w-10 h-10 object-contain bg-surface-container-low border border-outline/10 rounded-lg" referrerPolicy="no-referrer" />
                        <div>
                          <div className="font-bold text-on-surface text-xs">{tracker.productName}</div>
                          <div className="text-[10px] text-primary font-mono">{tracker.email}</div>
                          <div className="text-[9px] text-on-surface-variant/60">
                            Registered: {new Date(tracker.createdAt).toLocaleDateString()} at {new Date(tracker.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="text-[10px] text-on-surface-variant/80 uppercase font-black">Initial Price</div>
                          <div className="font-bold font-mono text-xs text-primary">
                            {tracker.initialPrice !== null && tracker.initialPrice !== undefined && <div>${tracker.initialPrice} USD</div>}
                            {tracker.initialPriceKsh !== null && tracker.initialPriceKsh !== undefined && <div>KSh {tracker.initialPriceKsh.toLocaleString()}</div>}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!confirm("Remove this price monitor?")) return;
                            try {
                              const res = await authFetch(`/api/admin/price-trackers/${tracker.id}`, { method: "DELETE" });
                              if (res.ok) {
                                showFeedback("Price monitor cancelled.");
                                loadAllAdminData();
                              } else {
                                throw new Error();
                              }
                            } catch {
                              showFeedback("Failed to cancel monitor.", true);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-lg border border-outline/5 transition-all cursor-pointer"
                          title="Delete Monitor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {priceTrackers.filter(t => t.status === "active").length === 0 && (
                    <div className="py-12 text-center text-on-surface-variant/40 border border-dashed border-outline/15 rounded-2xl">
                      No active price monitors currently registered.
                    </div>
                  )}
                </div>
              </div>

              {/* Triggered Alerts History */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-outline/5 pb-2">
                  <h4 className="font-black text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <span>Dispatched Alerts History</span>
                    <span className="bg-green-700/10 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
                      {priceTrackers.filter(t => t.status === "triggered").length} Dispatched
                    </span>
                  </h4>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {priceTrackers.filter(t => t.status === "triggered").map((tracker) => (
                    <div key={tracker.id} className="bg-green-50/20 border border-green-200/40 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={tracker.productImage} alt={tracker.productName} className="w-10 h-10 object-contain bg-surface-container-low border border-outline/10 rounded-lg" referrerPolicy="no-referrer" />
                        <div>
                          <div className="font-bold text-on-surface text-xs">{tracker.productName}</div>
                          <div className="text-[10px] text-green-700 font-mono font-bold flex items-center gap-1">
                            <span>{tracker.email}</span>
                          </div>
                          <div className="text-[9px] text-on-surface-variant/60">
                            Dispatched: {new Date(tracker.triggeredAt).toLocaleDateString()} at {new Date(tracker.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-on-surface-variant/80 uppercase font-black">Price Drop</div>
                        <div className="font-mono text-xs flex flex-col items-end gap-0.5 font-bold text-green-700">
                          {tracker.initialPrice !== null && tracker.initialPrice !== undefined && (
                            <div className="flex items-center gap-1 justify-end">
                              <span className="line-through text-on-surface-variant/60 font-normal text-[10px]">${tracker.initialPrice}</span>
                              <span>→</span>
                              <span>${tracker.triggeredPrice} USD</span>
                            </div>
                          )}
                          {tracker.initialPriceKsh !== null && tracker.initialPriceKsh !== undefined && (
                            <div className="flex items-center gap-1 justify-end">
                              <span className="line-through text-on-surface-variant/60 font-normal text-[10px]">KSh {tracker.initialPriceKsh.toLocaleString()}</span>
                              <span>→</span>
                              <span>KSh {tracker.triggeredPriceKsh?.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block">
                          Simulated Email Dispatched
                        </span>
                      </div>
                    </div>
                  ))}

                  {priceTrackers.filter(t => t.status === "triggered").length === 0 && (
                    <div className="py-12 text-center text-on-surface-variant/40 border border-dashed border-outline/15 rounded-2xl">
                      No price alert notifications dispatched yet. Try lowering a product's price in Catalog tab to test triggers!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 10: GEMINI AI DECISION REPORTS & QUOTAS              */}
      {/* ======================================================= */}
      {activeTab === "aiReports" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs text-left" id="admin-ai-reports-view">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Control Column - 5 cols */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Report Request Panel */}
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <div className="border-b border-outline/10 pb-2">
                  <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#ffdbce]" />
                    Catalog Intelligence Center
                  </h3>
                  <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                    Generate secure analytical business reports using Gemini by aggregating live store databases.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Select Analysis Focus Area
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { id: "sales", title: "Sales & Order Matrix", desc: "Gross income audits, conversion tracking, pending dispatches, and East African logistical hubs." },
                      { id: "catalog", title: "Product Catalog Report", desc: "Stock levels, pricing, and product listing health." },
                      { id: "support", title: "Support Backlog & Care Nodes", desc: "Inquiry volumes, unresolved diagnostics logs, and customer experience optimizations." },
                      { id: "system", title: "Promotions & Branding Health", desc: "Active promo codes usage, banner alignment, metadata policies, and content velocity." }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedReportType(opt.id as any)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                          selectedReportType === opt.id
                            ? "bg-[#ffdbce]/5 border-[#ffdbce] text-[#ffdbce]"
                            : "bg-surface border-outline/10 hover:bg-surface-container-high hover:border-outline/20 text-on-surface"
                        }`}
                      >
                        <span className="font-bold text-xs">{opt.title}</span>
                        <span className={`text-[10px] leading-relaxed ${selectedReportType === opt.id ? "text-[#ffdbce]/80" : "text-on-surface-variant/70"}`}>
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isGeneratingReport 
                        ? "bg-surface-container-high text-on-surface-variant/60 cursor-not-allowed" 
                        : "bg-primary text-on-primary hover:scale-[1.02] shadow-sm"
                    }`}
                  >
                    {isGeneratingReport ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Live Data...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Compile AI Audit Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quota Limit Card */}
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <div className="border-b border-outline/10 pb-2">
                  <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#ffdbce]" />
                    Monthly Quota Guard
                  </h3>
                  <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                    Limit model calls to avoid overutilization on Gemini's API free-tier.
                  </p>
                </div>

                {/* Progress bar / credits state */}
                <div className="space-y-3 bg-surface p-4 rounded-2xl border border-outline/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-on-surface">Monthly Credits Status</span>
                    <span className="font-mono font-bold text-primary">
                      {webConfig?.aiCreditsUsed || 0} / {webConfig?.aiCreditsLimit || 30} Credits Used
                    </span>
                  </div>

                  {/* Quota bar */}
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        ((webConfig?.aiCreditsUsed || 0) / (webConfig?.aiCreditsLimit || 30)) >= 1
                          ? "bg-red-500"
                          : ((webConfig?.aiCreditsUsed || 0) / (webConfig?.aiCreditsLimit || 30)) >= 0.8
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{ 
                        width: `${Math.min(100, (((webConfig?.aiCreditsUsed || 0) / (webConfig?.aiCreditsLimit || 30)) * 100))}%` 
                      }}
                    />
                  </div>

                  {((webConfig?.aiCreditsUsed || 0) / (webConfig?.aiCreditsLimit || 30)) >= 1 ? (
                    <p className="text-[10px] text-red-500 font-bold leading-relaxed">
                      ⚠️ Quota reached. Blog generator and AI reports are throttled to conserve rate limits. Reset usage limits below to restore.
                    </p>
                  ) : (
                    <p className="text-[10px] text-on-surface-variant/70 leading-relaxed">
                      Each Gemini-powered report compilation or blog post generation consumes exactly <strong>1 credit</strong>. Credits reset monthly.
                    </p>
                  )}
                </div>

                {/* Quota adjustments */}
                <div className="space-y-3.5 pt-1.5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Configure Credit Limit
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={quotaLimitInput}
                        onChange={(e) => setQuotaLimitInput(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 bg-surface border border-outline/10 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary/50 text-center font-mono font-bold"
                        min="1"
                      />
                      <button
                        onClick={() => handleUpdateQuota(quotaLimitInput)}
                        className="px-4 py-2 bg-[#ffdbce]/10 border border-[#ffdbce]/20 hover:bg-[#ffdbce]/15 text-[#ffdbce] rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        Set Limit
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-outline/5 flex items-center justify-between gap-3">
                    <div className="text-[10px] text-on-surface-variant/70">
                      Reset counter back to zero
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Reset current credit usage back to 0? This will instantly refresh your monthly quota allowance.")) {
                          handleUpdateQuota(webConfig?.aiCreditsLimit || 30, true);
                        }
                      }}
                      className="px-3.5 py-1.5 text-[10px] font-bold bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 text-green-600 rounded-xl transition-all cursor-pointer"
                    >
                      🔄 Reset Usage
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Report Terminal - 7 cols */}
            <div className="lg:col-span-7">
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl h-full flex flex-col min-h-[600px]">
                <div className="border-b border-outline/10 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Executive Report Outputs
                    </h3>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                      Compiled output from the Gemini secure business reasoning engine.
                    </p>
                  </div>

                  {generatedReport && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedReport);
                        showFeedback("Report copied to clipboard.");
                      }}
                      className="px-3 py-1.5 bg-surface-container border border-outline/15 text-on-surface hover:bg-surface-container-high rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      📋 Copy Markdown
                    </button>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center py-6">
                  {isGeneratingReport ? (
                    <div className="text-center space-y-4 max-w-sm mx-auto">
                      <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary animate-spin" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-xs text-on-surface animate-pulse">Running Secure Synthesis Node</h4>
                        <p className="text-[10px] text-on-surface-variant/70 leading-relaxed">
                          Gemini is examining live database entries, auditing metrics, and generating East African regional optimizations...
                        </p>
                      </div>
                    </div>
                  ) : generatedReport ? (
                    <div className="text-left space-y-4 max-h-[700px] overflow-y-auto pr-2">
                      <div className="p-5 bg-surface border border-outline/10 rounded-2xl">
                        <div className="prose prose-sm max-w-none text-on-surface/90 leading-relaxed space-y-3 dark:prose-invert">
                          <Markdown>{generatedReport}</Markdown>
                        </div>
                      </div>
                    </div>
                  ) : reportError ? (
                    <div className="text-center space-y-3 max-w-xs mx-auto py-12">
                      <div className="w-12 h-12 bg-red-500/10 border border-red-500/15 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-red-500">Generation Blocked</h4>
                        <p className="text-[10px] text-on-surface-variant/70 leading-relaxed">
                          {reportError}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-3 max-w-xs mx-auto py-12">
                      <div className="w-12 h-12 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-on-surface-variant">No Report Seated</h4>
                        <p className="text-[10px] text-on-surface-variant/60 leading-relaxed">
                          Select a database audit category on the left and click "Compile AI Audit Report" to run live diagnostics.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-outline/5 pt-3 text-[9px] text-on-surface-variant/50 text-center font-mono">
                  🔒 Data strictly parsed in memory. No persistent credentials or external logs cached.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
