import React, { useState, useEffect, useMemo } from "react";
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
  Star
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
import { Product, formatProductPrice, VariantImagesMap } from "../types";

interface AdminViewProps {
  onSelectProduct: (product: Product) => void;
  onRefreshProducts: () => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  onViewWeb: () => void;
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
  protocolTitle?: string;
  protocolDescription?: string;
  protocolBadge1Text?: string;
  protocolBadge1Icon?: string;
  protocolBadge2Text?: string;
  protocolBadge2Icon?: string;
  footerDescription?: string;
  footerWarrantyText?: string;
  footerCol1Title?: string;
  footerCol1Links?: any[];
  footerCol2Title?: string;
  footerCol2Links?: any[];
  footerCopyrightText?: string;
  footerBrandName?: string;
  footerBrandSuffix?: string;
  footerBrandLogoUrl?: string;
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
  { name: "Laptops", desc: "Axon Book Series", icon: "Laptop", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80" },
  { name: "Tablets", desc: "Axon Slate Series", icon: "Tablet", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=200&q=80" },
  { name: "Audio", desc: "Acoustic Pods", icon: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80" },
  { name: "Phones", desc: "Axon Phones", icon: "Smartphone", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80" },
  { name: "Accessories", desc: "Ecosystem Ext.", icon: "Layers", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=200&q=80" },
  { name: "Power", desc: "Induction", icon: "Plug", image: "https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=200&q=80" }
];

const defaultSlides = [
  {
    id: "ecosystem",
    tag: "THE AXON ECOSYSTEM DEBUT",
    tagIcon: "Cpu",
    title: "Integrated Form & Function.",
    description: "Meet the Axon Slate Pro. Engineered with the breakthrough Axon-X1 silicon chip, a liquid Infinity Display, and multi-device cross-talk. Powering your ultimate creative studio anywhere.",
    primaryBtnText: "Explore Slate Pro",
    primaryActionTarget: "product",
    primaryActionValue: "axon-slate-pro",
    secondaryBtnText: "Shop all hardware",
    secondaryActionTarget: "category",
    secondaryActionValue: "All",
    mediaType: "image",
    mediaUrl: "https://res.cloudinary.com/dwwvh34yi/image/upload/v1783718244/axon_tech_hero_pvcg7b.png",
    mediaAlt: "Axon Tech Ecosystem Showcase",
    overlayTitle: "Infinity Screen",
    overlayDesc: "12.9 inch ProMotion Touchscreen"
  },
  {
    id: "phone-video",
    tag: "CINEMATIC HARDWARE PREVIEW",
    tagIcon: "Zap",
    title: "Axon Phone 1 Pro.",
    description: "The ultimate mobile powerhouse. Crafted with a space-grade solid titanium unibody, an active liquid dynamic screen, and a pioneering cinematic triple-camera system.",
    primaryBtnText: "Explore Phone Pro",
    primaryActionTarget: "product",
    primaryActionValue: "axon-phone-1-pro",
    secondaryBtnText: "View Smart Devices",
    secondaryActionTarget: "category",
    secondaryActionValue: "Phones",
    mediaType: "video",
    mediaUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0543f24b4f3d02e071a7f0d23979155&profile_id=139&oauth2_token_id=57447761",
    mediaAlt: "Axon Phone 1 Pro Video Showcase",
    overlayTitle: "Optic Zoom",
    overlayDesc: "10x Hardware Periscope"
  },
  {
    id: "book-laptop",
    tag: "THE M3 SILICON BEAST",
    tagIcon: "ShieldCheck",
    title: "Axon Book 16 Ultra.",
    description: "Uncompromised power. Powered by the modular Axon silicon architecture with high-fidelity liquid-vapor cooling array, and outstanding operational compiler performance.",
    primaryBtnText: "Explore Book 16",
    primaryActionTarget: "product",
    primaryActionValue: "axon-book-16",
    secondaryBtnText: "Configure Laptops",
    secondaryActionTarget: "category",
    secondaryActionValue: "Laptops",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1920&q=80",
    mediaAlt: "Axon Book 16 Ultra Internal Architecture",
    overlayTitle: "Silicon Core",
    overlayDesc: "Unified Memory Capable"
  }
];

const defaultCol1Links = [
  { text: "Axon Slate Series", target: "terms" },
  { text: "Axon Books (Laptops)", target: "terms" },
  { text: "Axon Studio Audio", target: "terms" },
  { text: "Continuous Power Banks", target: "terms" },
  { text: "Click Keyboards & Gear", target: "terms" }
];

const defaultCol2Links = [
  { text: "Warranty Registry", target: "terms" },
  { text: "Delivery & Shipping", target: "delivery" },
  { text: "Refund & Return Policy", target: "refund" },
  { text: "Cookie Settings", target: "cookies" },
  { text: "Ecosystem Security", target: "privacy" }
];

export const AdminView: React.FC<AdminViewProps> = ({ 
  onSelectProduct, 
  onRefreshProducts,
  isAdminAuthenticated,
  setIsAdminAuthenticated,
  onViewWeb
}) => {
  // Authentication State
  const [loginEmail, setLoginEmail] = useState("");
  const [passkey, setPasskey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("axon_admin_token"));
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("axon_admin_token") || "");
  const [authError, setAuthError] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "config" | "support" | "delivery" | "whatsapp" | "blog" | "priceTrackers" | "aiReports" | "reviews">("analytics");

  // AI Reports state
  const [selectedReportType, setSelectedReportType] = useState<"sales" | "catalog" | "support" | "system">("sales");
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [quotaLimitInput, setQuotaLimitInput] = useState<number>(30);

  // Config Sub-Tab State
  const [configSubTab, setConfigSubTab] = useState<"general" | "hero" | "categories" | "trending" | "spotlight" | "protocol" | "footer" | "contact">("general");

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
  const [newVarStorage, setNewVarStorage] = useState("");
  const [newVarColor, setNewVarColor] = useState("");
  const [newVarStock, setNewVarStock] = useState<number>(10);
  const [newVarPriceKsh, setNewVarPriceKsh] = useState<number>(0);
  const [newColorName, setNewColorName] = useState("");
  const [newColorImageUrl, setNewColorImageUrl] = useState("");
  // Variant image management: keyed by "storage|color"
  const [variantImgMap, setVariantImgMap] = useState<Record<string, any[]>>({});
  const [newVarImgStorage, setNewVarImgStorage] = useState("");
  const [newVarImgColor, setNewVarImgColor] = useState("");
  const [newVarImgUrl, setNewVarImgUrl] = useState("");

  // Form states for Promo Manager
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState(10);
  const [newPromoDesc, setNewPromoDesc] = useState("");

  // Blog Management state
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [generatingBlog, setGeneratingBlog] = useState(false);
  const [topicPrompt, setTopicPrompt] = useState("");
  const [geographicHub, setGeographicHub] = useState("Nairobi, Kenya");

  // Order Detail Modal status
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderStatusNotes, setOrderStatusNotes] = useState("");

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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: passkey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Invalid credentials.");
        return;
      }
      localStorage.setItem("axon_admin_token", data.token);
      localStorage.setItem("axon_admin_authed", "true");
      setAuthToken(data.token);
      setIsAuthenticated(true);
      setPasskey("");
      setLoginEmail("");
    } catch {
      setAuthError("Network error. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken("");
    localStorage.removeItem("axon_admin_token");
    localStorage.removeItem("axon_admin_authed");
    setPasskey("");
    setLoginEmail("");
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers);
    if (authToken) headers.set("Authorization", `Bearer ${authToken}`);
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
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      description: "Superior premium design built for continuous performance.",
      rating: 4.8,
      reviewsCount: 1,
      inStock: true,
      colors: ["Black", "Silver"],
      colorImages: {},
      storages: ["128GB"],
      images: [],
      variants: [],
      specifications: {
        "Processor": "Quantum Core Architecture",
        "Battery": "Sustained all-day operational capacity"
      }
    });
    setNewVarStorage("");
    setNewVarColor("");
    setNewVarStock(10);
    setNewColorName("");
    setNewColorImageUrl("");
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({
      ...prod,
      images: prod.images || [],
      colorImages: prod.colorImages || {},
      variants: prod.variants || []
    });
    setNewVarStorage("");
    setNewVarColor("");
    setNewVarStock(10);
    setNewVarPriceKsh(0);
    setNewColorName("");
    setNewColorImageUrl("");
    setNewVarImgStorage(prod.storages?.[0] || "");
    setNewVarImgColor(prod.colors?.[0] || "");
    setNewVarImgUrl("");
    // Load existing variant images from DB
    authFetch(`/api/admin/product-variant-images?productId=${prod.id}`)
      .then(res => res.ok ? res.json() : [])
      .then((imgs: any[]) => {
        const grouped: Record<string, any[]> = {};
        for (const img of imgs) {
          const key = img.storage && img.color ? `${img.storage}|${img.color}` : "base";
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(img);
        }
        setVariantImgMap(grouped);
      })
      .catch(() => setVariantImgMap({}));
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
    const updatedColors = Array.from(new Set([...(editingProduct.colors || []), newVarColor.trim()]));

    setEditingProduct({
      ...editingProduct,
      variants: updatedVariants,
      storages: updatedStorages,
      colors: updatedColors
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
    const updatedColors = Array.from(new Set(currentVariants.map(v => v.color)));

    setEditingProduct({
      ...editingProduct,
      variants: currentVariants,
      storages: updatedStorages.length > 0 ? updatedStorages : undefined,
      colors: updatedColors.length > 0 ? updatedColors : undefined
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || (!editingProduct.price && !editingProduct.priceKsh)) {
      showFeedback("Please fill out Name and at least one Price field (USD or KSh).", true);
      return;
    }

    try {
      const isNew = !editingProduct.id;
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct)
      });

      if (res.ok) {
        showFeedback(`Product successfully ${isNew ? "created" : "updated"}.`);
        setIsProductFormOpen(false);
        setEditingProduct(null);
        loadAllAdminData();
        onRefreshProducts(); // Trigger app-wide reload
      } else {
        throw new Error("Failed product transaction");
      }
    } catch (err) {
      showFeedback("Failed to update database item.", true);
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

      showFeedback("Ecosystem configuration synced successfully.");
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

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Administrator Email
              </label>
              <input
                type="email"
                placeholder="admin@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-outline/15 rounded-xl text-xs focus:outline-none focus:border-primary text-on-surface"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Enter Administration Key
              </label>
              <input
                type="password"
                placeholder="Password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-outline/15 rounded-xl text-xs focus:outline-none focus:border-primary text-on-surface"
              />
              {authError && (
                <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-md active:scale-98"
            >
              Authorize Node Session
            </button>
          </form>

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

      {/* Action Status Feedback Toast */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200 text-xs font-semibold ${
          actionMessage.isError 
            ? "bg-red-500/5 text-red-500 border-red-500/15" 
            : "bg-green-500/5 text-green-600 border-green-500/15"
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span>{actionMessage.text}</span>
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
              <h3 className="font-display font-black text-2xl text-on-surface">${analytics.totalRevenue.toFixed(2)}</h3>
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
              <h3 className="font-display font-black text-2xl text-on-surface">${analytics.avgOrderValue.toFixed(2)}</h3>
              <p className="text-[9px] text-on-surface-variant/60">High ecosystem cross-talk buying ratio</p>
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
                  <p className="text-xs text-on-surface-variant/70">Visualizing 7-day high-fidelity checkout transactions & ecosystem volume</p>
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
                    <YAxis stroke="#8f7065" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e1d1c", borderColor: "#8f7065", borderRadius: "12px" }} 
                      labelStyle={{ color: "#ffdbce", fontWeight: "bold" }}
                      itemStyle={{ color: "#ffffff" }}
                      formatter={(v: any) => [`$${v} USD`, "Revenue"]}
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
                  <h3 className="font-display font-bold text-sm text-on-surface">Ecosystem Category Revenue Share</h3>
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
                        <Tooltip formatter={(v: any) => [`$${v}`, "Revenue"]} />
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
                          src={stagedProduct.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"}
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

                    <div className="grid grid-cols-3 gap-3">
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
                    </div>                     <div className="space-y-1">
                      <label className="text-[10px] text-on-surface-variant block uppercase">Image URL</label>
                      <input
                        type="text"
                        value={editingProduct.image || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-on-surface-variant block uppercase">Additional Image URLs (One URL per line)</label>
                      <textarea
                        value={editingProduct.images?.join("\n") || ""}
                        onChange={(e) => {
                          const lines = e.target.value.split("\n").map(l => l.trim()).filter(Boolean);
                          setEditingProduct({ ...editingProduct, images: lines });
                        }}
                        placeholder="https://images.unsplash.com/example-1.jpg&#10;https://images.unsplash.com/example-2.jpg"
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-on-surface focus:outline-none h-20"
                      />
                    </div>

                    {/* Color → Image URL Mapping */}
                    <div className="border-t border-outline/10 pt-4 space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-primary tracking-wider">Color Swatch Images</h4>
                      <p className="text-[10px] text-on-surface-variant/70 -mt-1">
                        Assign a unique product photo to each colorway. The system auto-detects the color name from the image URL; you can override it manually.
                      </p>

                      {/* Existing color→image mappings */}
                      {editingProduct.colorImages && Object.keys(editingProduct.colorImages).length > 0 ? (
                        <div className="border border-outline/10 rounded-xl overflow-hidden bg-surface-container-low max-h-40 overflow-y-auto">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-surface border-b border-outline/10 text-on-surface-variant/80 font-bold">
                                <th className="p-2">Color</th>
                                <th className="p-2">Image URL</th>
                                <th className="p-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline/10 font-medium">
                              {Object.entries(editingProduct.colorImages).map(([color, url]) => (
                                <tr key={color} className="hover:bg-surface-container-high/30">
                                  <td className="p-2">{color}</td>
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      <img src={url} alt={color} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-outline/10" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                      <span className="text-[10px] text-on-surface-variant/60 truncate max-w-[120px] font-mono">{url}</span>
                                    </div>
                                  </td>
                                  <td className="p-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = { ...editingProduct.colorImages };
                                        delete updated[color];
                                        setEditingProduct({ ...editingProduct, colorImages: updated });
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
                          No color swatch images assigned yet.
                        </div>
                      )}

                      {/* Add new color swatch */}
                      <div className="bg-surface-container border border-outline/10 p-3 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-on-surface uppercase block">Assign Swatch Image</span>
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-2 space-y-1">
                            <input
                              type="text"
                              value={newColorName}
                              onChange={(e) => setNewColorName(e.target.value)}
                              placeholder="Color name (e.g. Teal)"
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            />
                          </div>
                          <div className="col-span-3 space-y-1">
                            <input
                              type="text"
                              value={newColorImageUrl}
                              onChange={(e) => setNewColorImageUrl(e.target.value)}
                              placeholder="Image URL (auto-detects color from URL)"
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newColorName.trim() || !newColorImageUrl.trim()) return;
                            // Auto-detect: extract last path segment and use as color if field is still the auto-generated placeholder
                            const detected = extractColorFromUrl(newColorImageUrl);
                            const finalColor = newColorName.trim() || detected;
                            const updated = {
                              ...editingProduct.colorImages,
                              [finalColor]: newColorImageUrl.trim()
                            };
                            setEditingProduct({ ...editingProduct, colorImages: updated });
                            setNewColorName("");
                            setNewColorImageUrl("");
                          }}
                          disabled={!newColorName.trim() || !newColorImageUrl.trim()}
                          className="w-full py-1.5 bg-secondary hover:bg-secondary-hover text-on-secondary disabled:opacity-45 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Color Swatch
                        </button>
                      </div>
                    </div>

                    {/* Variant Images: multiple images per (storage + color) combination */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-on-surface-variant block uppercase">
                        Variant Images (Storage + Color)
                      </label>
                      <p className="text-[10px] text-on-surface-variant/60 -mt-1">
                        Assign multiple images to specific storage+color combos. Shown when user selects that variant.
                      </p>

                      {/* Show images grouped by storage|color key */}
                      {Object.keys(variantImgMap).length > 0 ? (
                        <div className="border border-outline/10 rounded-xl overflow-hidden bg-surface-container-low max-h-48 overflow-y-auto">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-surface border-b border-outline/10 text-on-surface-variant/80 font-bold">
                                <th className="p-2">Storage</th>
                                <th className="p-2">Color</th>
                                <th className="p-2">Image</th>
                                <th className="p-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline/10">
                              {Object.entries(variantImgMap).map(([key, imgs]) =>
                                imgs.map(img => {
                                  const [storage, color] = key.split("|");
                                  return (
                                    <tr key={img.id} className="hover:bg-surface-container-high/30">
                                      <td className="p-2">{storage || "—"}</td>
                                      <td className="p-2">{color || "—"}</td>
                                      <td className="p-2">
                                        <div className="flex items-center gap-2">
                                          <img src={img.imageUrl} alt="" className="w-10 h-10 object-cover rounded border border-outline/10" referrerPolicy="no-referrer" />
                                          <span className="text-[10px] text-on-surface-variant/60 truncate max-w-[160px]">{img.imageUrl}</span>
                                        </div>
                                      </td>
                                      <td className="p-2 text-right">
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            await authFetch(`/api/admin/product-variant-images/${img.id}`, { method: "DELETE" });
                                            setVariantImgMap(prev => {
                                              const updated = { ...prev };
                                              updated[key] = updated[key].filter(i => i.id !== img.id);
                                              if (updated[key].length === 0) delete updated[key];
                                              return updated;
                                            });
                                          }}
                                          className="text-red-500 hover:text-red-700 font-bold text-[10px] px-2 py-1"
                                        >
                                          Remove
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-3 text-center bg-surface-container-low border border-dashed border-outline/20 rounded-xl text-on-surface-variant/60 text-[10px]">
                          No variant images assigned yet.
                        </div>
                      )}

                      {/* Add new variant image: storage + color + URL */}
                      <div className="bg-surface-container border border-outline/10 p-3 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-on-surface uppercase block">Add Image to Variant</span>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-on-surface-variant/70 block">Storage</label>
                            <select
                              value={newVarImgStorage}
                              onChange={(e) => setNewVarImgStorage(e.target.value)}
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            >
                              <option value="">— Base (no variant) —</option>
                              {(editingProduct?.storages || []).map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-on-surface-variant/70 block">Color</label>
                            <select
                              value={newVarImgColor}
                              onChange={(e) => setNewVarImgColor(e.target.value)}
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            >
                              <option value="">— Base (no variant) —</option>
                              {(editingProduct?.colors || []).map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-on-surface-variant/70 block">Image URL</label>
                            <input
                              type="text"
                              value={newVarImgUrl}
                              onChange={(e) => setNewVarImgUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!newVarImgUrl.trim() || !editingProduct?.id) return;
                            const key = `${newVarImgStorage}|${newVarImgColor}`;
                            const res = await authFetch("/api/admin/product-variant-images", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                productId: editingProduct.id,
                                storage: newVarImgStorage,
                                color: newVarImgColor,
                                imageUrl: newVarImgUrl.trim(),
                                sortOrder: 0,
                              })
                            });
                            if (res.ok) {
                              const saved: any = await res.json();
                              setVariantImgMap(prev => {
                                const updated = { ...prev };
                                if (!updated[key]) updated[key] = [];
                                updated[key] = [...updated[key], saved];
                                return updated;
                              });
                              setNewVarImgUrl("");
                            }
                          }}
                          disabled={!newVarImgUrl.trim() || !editingProduct?.id}
                          className="w-full py-1.5 bg-secondary hover:bg-secondary-hover text-on-secondary disabled:opacity-45 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Variant Image
                        </button>
                      </div>
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

                    {/* Independent Variants Builder */}
                    <div className="border-t border-outline/10 pt-4 space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-primary tracking-wider">Independent Item Variants</h4>
                      <p className="text-[10px] text-on-surface-variant/70 -mt-1">
                        Define storage, color, and stock counts. Users will see independent stock metrics per variant selected.
                      </p>

                      {/* Variants list table */}
                      {editingProduct.variants && editingProduct.variants.length > 0 ? (
                        <div className="border border-outline/10 rounded-xl overflow-hidden bg-surface-container-low max-h-32 overflow-y-auto">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-surface border-b border-outline/10 text-on-surface-variant/80 font-bold">
                                <th className="p-2">Storage</th>
                                <th className="p-2">Color</th>
                                <th className="p-2">Price (KSh)</th>
                                <th className="p-2">Stock</th>
                                <th className="p-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline/10 font-medium">
                              {editingProduct.variants.map((v, i) => (
                                <tr key={i} className="hover:bg-surface-container-high/30">
                                  <td className="p-2">{v.storage}</td>
                                  <td className="p-2">{v.color}</td>
                                  <td className="p-2 font-mono">{v.priceKsh ? `KSh ${v.priceKsh.toLocaleString()}` : "—"}</td>
                                  <td className="p-2 font-mono">{v.stock} units</td>
                                  <td className="p-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveVariant(i)}
                                      className="text-red-500 hover:text-red-700 font-bold text-[10px] px-2 py-1"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-3 text-center bg-surface-container-low border border-dashed border-outline/20 rounded-xl text-on-surface-variant/60 text-[10px]">
                          No independent variants declared. Standard inventory fallback active.
                        </div>
                      )}

                      {/* Add new variant inputs */}
                      <div className="bg-surface-container border border-outline/10 p-3 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-on-surface uppercase block">Add Variant Combination</span>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={newVarStorage}
                              onChange={(e) => setNewVarStorage(e.target.value)}
                              placeholder="e.g. 128GB"
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={newVarColor}
                              onChange={(e) => setNewVarColor(e.target.value)}
                              placeholder="e.g. Royal Blue"
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <input
                              type="number"
                              value={newVarPriceKsh}
                              onChange={(e) => setNewVarPriceKsh(Number(e.target.value))}
                              placeholder="Price KSh"
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                              min="0"
                            />
                          </div>
                          <div className="space-y-1">
                            <input
                              type="number"
                              value={newVarStock}
                              onChange={(e) => setNewVarStock(Number(e.target.value))}
                              placeholder="Stock"
                              className="w-full px-2 py-1.5 bg-surface border border-outline/15 rounded-lg text-on-surface focus:outline-none text-[11px]"
                              min="0"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          disabled={!newVarStorage.trim() || !newVarColor.trim()}
                          className="w-full py-1.5 bg-secondary hover:bg-secondary-hover text-on-secondary disabled:opacity-45 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Inject Variant
                        </button>
                      </div>
                    </div>

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
                    onClick={() => setSelectedOrder(null)}
                    className="w-full py-2.5 bg-surface-container-highest hover:bg-surface-container text-on-surface text-xs font-bold rounded-xl transition-colors text-center"
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
              Ecosystem Spotlight
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
          </div>

          {/* ======================================= */}
          {/* CONFIG SUB-TAB: GENERAL                 */}
          {/* ======================================= */}
          {configSubTab === "general" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                      <label className="text-[11px] text-on-surface-variant uppercase block">Ecosystem Promo Announcement Banner</label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={webConfig.showAnnouncement}
                          onChange={(e) => setWebConfig({ ...webConfig, showAnnouncement: e.target.checked })}
                          className="w-4 h-4 rounded text-primary border-outline/20 focus:ring-0"
                        />
                        <span className="text-xs">Display Banner</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={webConfig.announcement}
                      onChange={(e) => setWebConfig({ ...webConfig, announcement: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                      placeholder="Ecosystem debut banner marquee text..."
                    />
                  </div>

                  {/* Main slider custom tags */}
                  <div className="space-y-4 border-t border-outline/10 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-on-surface-variant uppercase block">Main Hero Banner title (Legacy fallback)</label>
                      <input
                        type="text"
                        value={webConfig.heroTitle}
                        onChange={(e) => setWebConfig({ ...webConfig, heroTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-on-surface-variant uppercase block">Main Hero Banner description (Legacy fallback)</label>
                      <textarea
                        value={webConfig.heroDescription}
                        onChange={(e) => setWebConfig({ ...webConfig, heroDescription: e.target.value })}
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
                        onChange={(e) => setWebConfig({ ...webConfig, privacyPolicy: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none h-24"
                        placeholder="Describe how user data and telemetry parameters are securely cataloged..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Terms of Use / Ecosystem Charter</label>
                      <textarea
                        value={webConfig.termsOfUse || ""}
                        onChange={(e) => setWebConfig({ ...webConfig, termsOfUse: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none h-24"
                        placeholder="State intellectual boundaries, warranty registries, and compiler sandboxing limits..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Cookie and Cache Policy</label>
                      <textarea
                        value={webConfig.cookiePolicy || ""}
                        onChange={(e) => setWebConfig({ ...webConfig, cookiePolicy: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none h-24"
                        placeholder="Configure local storage parameters and analytics key behaviors..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Refund and Harmony Return Protocol</label>
                      <textarea
                        value={webConfig.refundPolicy || ""}
                        onChange={(e) => setWebConfig({ ...webConfig, refundPolicy: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none h-24"
                        placeholder="Specify the 30-day RMA diagnostic window rules..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Delivery and Dispatch Policy</label>
                      <textarea
                        value={webConfig.deliveryPolicy || ""}
                        onChange={(e) => setWebConfig({ ...webConfig, deliveryPolicy: e.target.value })}
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
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Twitter Stream URL</label>
                      <input
                        type="url"
                        value={webConfig.socialTwitter || ""}
                        onChange={(e) => setWebConfig({ ...webConfig, socialTwitter: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                        placeholder="https://twitter.com/..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">GitHub Repository URL</label>
                      <input
                        type="url"
                        value={webConfig.socialGithub || ""}
                        onChange={(e) => setWebConfig({ ...webConfig, socialGithub: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                        placeholder="https://github.com/..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">LinkedIn Corporate URL</label>
                      <input
                        type="url"
                        value={webConfig.socialLinkedIn || ""}
                        onChange={(e) => setWebConfig({ ...webConfig, socialLinkedIn: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Operations Registry Email</label>
                      <input
                        type="email"
                        value={webConfig.contactEmail || ""}
                        onChange={(e) => setWebConfig({ ...webConfig, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none"
                        placeholder="synergy@axon.net"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Support Despatch Email</label>
                      <input
                        type="email"
                        value={webConfig.supportEmail || ""}
                        onChange={(e) => setWebConfig({ ...webConfig, supportEmail: e.target.value })}
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
                        onClick={() => setWebConfig({ ...webConfig, heroMode: "current" })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          (webConfig?.heroMode || "current") === "current"
                            ? "bg-primary text-white border-primary"
                            : "bg-surface text-on-surface-variant border-outline/10 hover:bg-surface-container-high"
                        }`}
                      >
                        Standard Slideshow
                      </button>
                      <button
                        onClick={() => setWebConfig({ ...webConfig, heroMode: "media-only" })}
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
                      onChange={(e) => setWebConfig({ ...webConfig, heroTargetProduct: e.target.value })}
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
                      onChange={(e) => setWebConfig({ ...webConfig, heroButtonText: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface font-semibold focus:outline-none focus:border-primary"
                    >
                      <option value="Shop Now">Shop Now</option>
                      <option value="Explore">Explore Device</option>
                      <option value="Pre-order">Pre-order Now</option>
                    </select>
                  </div>
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
                      const currentSlides = webConfig.heroSlides || defaultSlides;
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
                        mediaUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
                        mediaAlt: "Neural Core Preview Image",
                        overlayTitle: "Neural Core",
                        overlayDesc: "Vapor Chamber cooling built-in"
                      };
                      setWebConfig({ ...webConfig, heroSlides: [...currentSlides, newSlide] });
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
                    const currentSlides = webConfig.heroSlides || defaultSlides;
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
                              if (currentSlides.length <= 3) {
                                showFeedback("Safety Constraint: A minimum of 3 hero slides must be maintained to preserve design layout.", true);
                                return;
                              }
                              const updated = currentSlides.filter((_, idx) => idx !== sIdx);
                              setWebConfig({ ...webConfig, heroSlides: updated });
                              showFeedback("Hero slide removed.");
                            }}
                            disabled={currentSlides.length <= 3}
                            className={`px-2 py-1 text-[10px] rounded-md flex items-center gap-1 transition-colors ${
                              currentSlides.length <= 3
                                ? "bg-outline/5 text-on-surface-variant/40 cursor-not-allowed border border-outline/10"
                                : "bg-red-500/10 text-red-500 border border-red-500/15 hover:bg-red-500/15"
                            }`}
                            title={currentSlides.length <= 3 ? "A minimum of 3 slides is required" : "Remove slide"}
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
                                setWebConfig({ ...webConfig, heroSlides: updated });
                              }}
                              className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                              placeholder="THE AXON ECOSYSTEM DEBUT"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-on-surface-variant uppercase block">Tag Icon</label>
                            <select
                              value={slide.tagIcon || "Cpu"}
                              onChange={(e) => {
                                const updated = currentSlides.map((s, idx) => idx === sIdx ? { ...s, tagIcon: e.target.value } : s);
                                setWebConfig({ ...webConfig, heroSlides: updated });
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
                              <option value="Layers">Layers (Ecosystem)</option>
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
                                setWebConfig({ ...webConfig, heroSlides: updated });
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
                                setWebConfig({ ...webConfig, heroSlides: updated });
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
                                setWebConfig({ ...webConfig, heroSlides: updated });
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
                              setWebConfig({ ...webConfig, heroSlides: updated });
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
                                setWebConfig({ ...webConfig, heroSlides: updated });
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
                                setWebConfig({ ...webConfig, heroSlides: updated });
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
                                  setWebConfig({ ...webConfig, heroSlides: updated });
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
                                  setWebConfig({ ...webConfig, heroSlides: updated });
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
                                setWebConfig({ ...webConfig, heroSlides: updated });
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
                                setWebConfig({ ...webConfig, heroSlides: updated });
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
                                  setWebConfig({ ...webConfig, heroSlides: updated });
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
                                  setWebConfig({ ...webConfig, heroSlides: updated });
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
                                setWebConfig({ ...webConfig, heroSlides: updated });
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
                                setWebConfig({ ...webConfig, heroSlides: updated });
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
                                    setWebConfig({ ...webConfig, heroSlides: updated });
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
                                    setWebConfig({ ...webConfig, heroSlides: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono h-20"
                                  placeholder='<iframe src="https://player.vimeo.com/video/...&portrait=1" frameborder="0"></iframe>'
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
                                    setWebConfig({ ...webConfig, heroSlides: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                                  placeholder="https://images.unsplash.com/photo-..."
                                />
                                <p className="text-[8px] text-on-surface-variant/60">Fully qualified secure URL pointing to high-resolution landscape assets.</p>
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
                                    setWebConfig({ ...webConfig, heroSlides: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-mono"
                                  placeholder="https://images.unsplash.com/photo-mobile-..."
                                />
                                <p className="text-[8px] text-on-surface-variant/60">Optimized portrait size asset. Enhances mobile rendering speed and visual framing.</p>
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
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-outline/10">
                  <div>
                    <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      Dynamic Curated Categories Manager
                    </h3>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                      "Shop All" dynamically detects categories added and deleted here and updates the search filters. Specify category text, icons, and hero covers.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const currentCats = webConfig.categoriesList || defaultCategories;
                      const newCat = {
                        name: "Smart Gear",
                        desc: "Next-gen biometric trackers",
                        icon: "Layers",
                        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
                      };
                      setWebConfig({ ...webConfig, categoriesList: [...currentCats, newCat] });
                      showFeedback("New category slot added!");
                    }}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center gap-1 font-bold text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(() => {
                    const currentCats = webConfig.categoriesList || defaultCategories;
                    return currentCats.map((cat, cIdx) => (
                      <div key={cIdx} className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-3.5 relative">
                        <div className="flex justify-between items-center border-b border-outline/5 pb-2">
                          <span className="font-bold text-xs text-primary uppercase">Category Slot #{cIdx + 1}</span>
                          <button
                            onClick={() => {
                              const updated = currentCats.filter((_, idx) => idx !== cIdx);
                              setWebConfig({ ...webConfig, categoriesList: updated });
                              showFeedback("Category deleted.");
                            }}
                            className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/15 border border-red-500/10 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Category Name</label>
                            <input
                              type="text"
                              value={cat.name || ""}
                              onChange={(e) => {
                                const updated = currentCats.map((c, idx) => idx === cIdx ? { ...c, name: e.target.value } : c);
                                setWebConfig({ ...webConfig, categoriesList: updated });
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
                                const updated = currentCats.map((c, idx) => idx === cIdx ? { ...c, icon: e.target.value } : c);
                                setWebConfig({ ...webConfig, categoriesList: updated });
                              }}
                              className="w-full px-2 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                            >
                              <option value="Laptop">Laptop (Computer)</option>
                              <option value="Tablet">Tablet (Slate/Tablet)</option>
                              <option value="Headphones">Headphones (Audio)</option>
                              <option value="Smartphone">Smartphone (Phone)</option>
                              <option value="Layers">Layers (Ecosystem)</option>
                              <option value="Plug">Plug (Induction/Power)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Sub-description / Ecosystem Line</label>
                          <input
                            type="text"
                            value={cat.desc || ""}
                            onChange={(e) => {
                              const updated = currentCats.map((c, idx) => idx === cIdx ? { ...c, desc: e.target.value } : c);
                              setWebConfig({ ...webConfig, categoriesList: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                            placeholder="e.g. Axon Book Series"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Image cover URL</label>
                          <input
                            type="url"
                            value={cat.image || ""}
                            onChange={(e) => {
                              const updated = currentCats.map((c, idx) => idx === cIdx ? { ...c, image: e.target.value } : c);
                              setWebConfig({ ...webConfig, categoriesList: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-[10px] text-on-surface font-mono"
                            placeholder="https://images.unsplash.com/photo-..."
                          />
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
                    Sync & Update Curated Categories (Triggers shop auto-detection)
                  </button>
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
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot1Product: e.target.value })}
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
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot1Tag: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Best Seller"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Description</label>
                        <textarea
                          value={webConfig.trendingSlot1Desc || ""}
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot1Desc: e.target.value })}
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
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot2Product: e.target.value })}
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
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot2Tag: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Power Stage"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Description</label>
                        <textarea
                          value={webConfig.trendingSlot2Desc || ""}
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot2Desc: e.target.value })}
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
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot3Product: e.target.value })}
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
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot3Tag: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="NEW RELEASE"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Description</label>
                        <textarea
                          value={webConfig.trendingSlot3Desc || ""}
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot3Desc: e.target.value })}
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
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot4Product: e.target.value })}
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
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot4Tag: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Professional Studio Stage"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant block uppercase">Overriding Description</label>
                        <textarea
                          value={webConfig.trendingSlot4Desc || ""}
                          onChange={(e) => setWebConfig({ ...webConfig, trendingSlot4Desc: e.target.value })}
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
          {/* CONFIG SUB-TAB: ECOSYSTEM SPOTLIGHT     */}
          {/* ======================================= */}
          {configSubTab === "spotlight" && (
            <div className="space-y-6">
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  Ecosystem Spotlight Section Customizer
                </h3>
                <p className="text-[10px] text-on-surface-variant/70">
                  Customize the title, description, and list of highly-rated products showcased in the grid section.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Spotlight Title</label>
                    <input
                      type="text"
                      value={webConfig.spotlightTitle || "The Ecosystem Spotlight"}
                      onChange={(e) => setWebConfig({ ...webConfig, spotlightTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                      placeholder="The Ecosystem Spotlight"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Spotlight Description Text</label>
                    <textarea
                      value={webConfig.spotlightDescription || "Each product designed with absolute form-factor alignment and state-of-the-art durability."}
                      onChange={(e) => setWebConfig({ ...webConfig, spotlightDescription: e.target.value })}
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
                                setWebConfig({ ...webConfig, spotlightProducts: copy.filter(Boolean) });
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
          {/* CONFIG SUB-TAB: INTEGRATION PROTOCOL    */}
          {/* ======================================= */}
          {configSubTab === "protocol" && (
            <div className="space-y-6">
              <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  The Axon Integration Protocol Section Editor
                </h3>
                <p className="text-[10px] text-on-surface-variant/70">
                  Edit the core branding values and parameters representing the sync encryption protocols block at the bottom of the Home screen.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Section Branding Title</label>
                    <input
                      type="text"
                      value={webConfig.protocolTitle || "The Axon Integration Protocol"}
                      onChange={(e) => setWebConfig({ ...webConfig, protocolTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                      placeholder="The Axon Integration Protocol"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase block">Detailed Protocol Description</label>
                    <textarea
                      value={webConfig.protocolDescription || "Every device you add into your personal cluster automatically synchronizes credentials, audio feeds, battery telemetry, and mechanical click states via secure near-field frequencies."}
                      onChange={(e) => setWebConfig({ ...webConfig, protocolDescription: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface h-20"
                      placeholder="Protocol value statement details..."
                    />
                  </div>

                  {/* Badge 1 configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline/5 pt-3">
                    <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                      <span className="font-bold text-xs uppercase text-primary">Branding Badge #1</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] text-on-surface-variant block uppercase">Badge Icon</label>
                          <select
                            value={webConfig.protocolBadge1Icon || "Zap"}
                            onChange={(e) => setWebConfig({ ...webConfig, protocolBadge1Icon: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                          >
                            <option value="Zap">Zap (Lightning)</option>
                            <option value="ShieldCheck">ShieldCheck (Security)</option>
                            <option value="Cpu">Cpu (Silicon)</option>
                            <option value="Laptop">Laptop (Computer)</option>
                            <option value="Tablet">Tablet (Slate)</option>
                            <option value="Headphones">Headphones (Audio)</option>
                            <option value="Smartphone">Smartphone (Phone)</option>
                            <option value="Layers">Layers (Ecosystem)</option>
                            <option value="Plug">Plug (Power)</option>
                            <option value="Star">Star (Rating)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-on-surface-variant block uppercase">Badge Label Text</label>
                          <input
                            type="text"
                            value={webConfig.protocolBadge1Text || "0.02ms Sync Latency"}
                            onChange={(e) => setWebConfig({ ...webConfig, protocolBadge1Text: e.target.value })}
                            className="w-full px-3 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                            placeholder="0.02ms Sync Latency"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Badge 2 configuration */}
                    <div className="bg-surface border border-outline/10 p-4 rounded-xl space-y-3">
                      <span className="font-bold text-xs uppercase text-primary">Branding Badge #2</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] text-on-surface-variant block uppercase">Badge Icon</label>
                          <select
                            value={webConfig.protocolBadge2Icon || "ShieldCheck"}
                            onChange={(e) => setWebConfig({ ...webConfig, protocolBadge2Icon: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface font-semibold"
                          >
                            <option value="Zap">Zap (Lightning)</option>
                            <option value="ShieldCheck">ShieldCheck (Security)</option>
                            <option value="Cpu">Cpu (Silicon)</option>
                            <option value="Laptop">Laptop (Computer)</option>
                            <option value="Tablet">Tablet (Slate)</option>
                            <option value="Headphones">Headphones (Audio)</option>
                            <option value="Smartphone">Smartphone (Phone)</option>
                            <option value="Layers">Layers (Ecosystem)</option>
                            <option value="Plug">Plug (Power)</option>
                            <option value="Star">Star (Rating)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-on-surface-variant block uppercase">Badge Label Text</label>
                          <input
                            type="text"
                            value={webConfig.protocolBadge2Text || "Ecosystem Encrypted"}
                            onChange={(e) => setWebConfig({ ...webConfig, protocolBadge2Text: e.target.value })}
                            className="w-full px-3 py-1.5 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface"
                            placeholder="Ecosystem Encrypted"
                          />
                        </div>
                      </div>
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
                          onChange={(e) => setWebConfig({ ...webConfig, footerBrandName: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="AXON"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Brand Suffix</label>
                        <input
                          type="text"
                          value={webConfig.footerBrandSuffix || "TECH"}
                          onChange={(e) => setWebConfig({ ...webConfig, footerBrandSuffix: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="TECH"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Logo URL</label>
                        <input
                          type="url"
                          value={webConfig.footerBrandLogoUrl || ""}
                          onChange={(e) => setWebConfig({ ...webConfig, footerBrandLogoUrl: e.target.value })}
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
                        value={webConfig.footerDescription || "Crafting precise premium hardware and accessories harmonized into a seamless high-performance lifestyle ecosystem."}
                        onChange={(e) => setWebConfig({ ...webConfig, footerDescription: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface h-20"
                        placeholder="Footer branding text..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface-variant uppercase block">Warranty / Stamp text</label>
                      <input
                        type="text"
                        value={webConfig.footerWarrantyText || "Authorized Retailer warranty included"}
                        onChange={(e) => setWebConfig({ ...webConfig, footerWarrantyText: e.target.value })}
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
                          value={webConfig.footerNewsletterTitle || "Ecosystem Brief"}
                          onChange={(e) => setWebConfig({ ...webConfig, footerNewsletterTitle: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                          placeholder="Ecosystem Brief"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-on-surface-variant uppercase block">Newsletter Description</label>
                        <textarea
                          value={webConfig.footerNewsletterDescription || "Subscribe to receive priority notifications of limited hardware drops, system updates, and custom product bundles."}
                          onChange={(e) => setWebConfig({ ...webConfig, footerNewsletterDescription: e.target.value })}
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
                          value={webConfig.footerCol1Title || "Ecosystem"}
                          onChange={(e) => setWebConfig({ ...webConfig, footerCol1Title: e.target.value })}
                          className="px-2.5 py-1 bg-surface-container border border-outline/15 rounded-xl text-xs font-semibold text-on-surface"
                          placeholder="Ecosystem"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const currentLinks = webConfig.footerCol1Links || defaultCol1Links;
                          const newLink = { text: "Custom link text", target: "terms" };
                          setWebConfig({ ...webConfig, footerCol1Links: [...currentLinks, newLink] });
                        }}
                        className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-bold transition-colors"
                      >
                        + Add link row
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(() => {
                        const links = webConfig.footerCol1Links || defaultCol1Links;
                        return links.map((link: any, idx: number) => (
                          <div key={idx} className="flex gap-3 items-center bg-surface-container p-2 rounded-lg">
                            <span className="font-mono text-[9px] text-on-surface-variant">Row #{idx + 1}</span>
                            <input
                              type="text"
                              value={link.text || ""}
                              onChange={(e) => {
                                const copy = [...links];
                                copy[idx] = { ...copy[idx], text: e.target.value };
                                setWebConfig({ ...webConfig, footerCol1Links: copy });
                              }}
                              className="px-2 py-1 bg-surface border border-outline/10 rounded-lg text-xs font-semibold text-on-surface w-full"
                              placeholder="Link Title text"
                            />
                            <select
                              value={link.target || "terms"}
                              onChange={(e) => {
                                const copy = [...links];
                                copy[idx] = { ...copy[idx], target: e.target.value };
                                setWebConfig({ ...webConfig, footerCol1Links: copy });
                              }}
                              className="px-2 py-1 bg-surface border border-outline/10 rounded-lg text-xs font-semibold text-on-surface"
                            >
                              <option value="terms">Terms Modal</option>
                              <option value="privacy">Privacy Modal</option>
                              <option value="cookies">Cookies Modal</option>
                              <option value="refund">Refund Modal</option>
                              <option value="delivery">Delivery Modal</option>
                            </select>
                            <button
                              onClick={() => {
                                const copy = links.filter((_: any, lIdx: number) => lIdx !== idx);
                                setWebConfig({ ...webConfig, footerCol1Links: copy });
                              }}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ));
                      })()}
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
                          onChange={(e) => setWebConfig({ ...webConfig, footerCol2Title: e.target.value })}
                          className="px-2.5 py-1 bg-surface-container border border-outline/15 rounded-xl text-xs font-semibold text-on-surface"
                          placeholder="Support & Care"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const currentLinks = webConfig.footerCol2Links || defaultCol2Links;
                          const newLink = { text: "Custom support link", target: "terms" };
                          setWebConfig({ ...webConfig, footerCol2Links: [...currentLinks, newLink] });
                        }}
                        className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-bold transition-colors"
                      >
                        + Add link row
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(() => {
                        const links = webConfig.footerCol2Links || defaultCol2Links;
                        return links.map((link: any, idx: number) => (
                          <div key={idx} className="flex gap-3 items-center bg-surface-container p-2 rounded-lg">
                            <span className="font-mono text-[9px] text-on-surface-variant">Row #{idx + 1}</span>
                            <input
                              type="text"
                              value={link.text || ""}
                              onChange={(e) => {
                                const copy = [...links];
                                copy[idx] = { ...copy[idx], text: e.target.value };
                                setWebConfig({ ...webConfig, footerCol2Links: copy });
                              }}
                              className="px-2 py-1 bg-surface border border-outline/10 rounded-lg text-xs font-semibold text-on-surface w-full"
                              placeholder="Link Title text"
                            />
                            <select
                              value={link.target || "terms"}
                              onChange={(e) => {
                                const copy = [...links];
                                copy[idx] = { ...copy[idx], target: e.target.value };
                                setWebConfig({ ...webConfig, footerCol2Links: copy });
                              }}
                              className="px-2 py-1 bg-surface border border-outline/10 rounded-lg text-xs font-semibold text-on-surface"
                            >
                              <option value="terms">Terms Modal</option>
                              <option value="privacy">Privacy Modal</option>
                              <option value="cookies">Cookies Modal</option>
                              <option value="refund">Refund Modal</option>
                              <option value="delivery">Delivery Modal</option>
                            </select>
                            <button
                              onClick={() => {
                                const copy = links.filter((_: any, lIdx: number) => lIdx !== idx);
                                setWebConfig({ ...webConfig, footerCol2Links: copy });
                              }}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ));
                      })()}
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
                          setWebConfig({ ...webConfig, footerBottomLinks: [...currentLinks, newLink] });
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
                              setWebConfig({ ...webConfig, footerBottomLinks: copy });
                            }}
                            className="px-2 py-1 bg-surface border border-outline/10 rounded-lg text-xs font-semibold text-on-surface w-full"
                            placeholder="Link text"
                          />
                          <select
                            value={link.target || "terms"}
                            onChange={(e) => {
                              const copy = [...webConfig.footerBottomLinks];
                              copy[idx] = { ...copy[idx], target: e.target.value };
                              setWebConfig({ ...webConfig, footerBottomLinks: copy });
                            }}
                            className="px-2 py-1 bg-surface border border-outline/10 rounded-lg text-xs font-semibold text-on-surface"
                          >
                            <option value="terms">Terms</option>
                            <option value="privacy">Privacy</option>
                            <option value="cookies">Cookies</option>
                            <option value="refund">Refund</option>
                            <option value="delivery">Delivery</option>
                            <option value="dns">Do Not Sell (CCPA)</option>
                          </select>
                          <button
                            onClick={() => {
                              const copy = webConfig.footerBottomLinks.filter((_: any, lIdx: number) => lIdx !== idx);
                              setWebConfig({ ...webConfig, footerBottomLinks: copy });
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
                      onChange={(e) => setWebConfig({ ...webConfig, footerCopyrightText: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline/15 rounded-xl text-xs text-on-surface"
                      placeholder="© 2026 AXON TECH INC. ALL RIGHTS RESERVED."
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
                        <div key={idx} className="flex gap-3 items-center bg-surface-container p-2 rounded-lg">
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
                  Ecosystem Support Transmissions
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
      {/* TAB 9: PRICE TRACKER ALERTS CONSOLE                     */}
      {/* ======================================================= */}
      {activeTab === "priceTrackers" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-xs text-left" id="admin-price-alerts-view">
          <div className="bg-surface-container-low border border-outline/10 p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline/10">
              <div>
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary animate-pulse" />
                  Ecosystem Price Monitor Registry
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
                    Ecosystem Intelligence Center
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
                      { id: "catalog", title: "Catalog & Metrology Audit", desc: "SKU health evaluation, stock levels warnings, pricing metrics, and precision equipment suggestions." },
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
