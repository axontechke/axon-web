import React, { useState, useEffect } from "react";
import { Star, ShieldCheck, ArrowLeft, Heart, Plus, Minus, CheckCircle, MessageSquare, ZoomIn, Bell, TrendingDown } from "lucide-react";
import { Product, Review, Warranty, formatProductPrice, CURRENCY_SYMBOL, VariantImagesMap } from "../types";

interface ProductDetailViewProps {
  product: Product;
  products?: Product[];
  onBackToCatalog: () => void;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string, selectedStorage?: string, selectedWarranty?: Warranty, selectedSimType?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  products = [],
  onBackToCatalog,
  onAddToCart,
  onSelectProduct,
}) => {
  // ── StorageVariant mode ──────────────────────────────────────────────
  // When storageVariants is populated, each storage tier has its own colors, warranties, simType, and price.
  const hasStorageVariants = Array.isArray(product.storageVariants) && product.storageVariants.length > 0;

  // Derive the effective list of storage options (unique storage strings in StorageVariant mode)
  const storageOptions: string[] = hasStorageVariants
    ? [...new Map(product.storageVariants!.map(sv => [sv.storage, sv.storage])).values()]
    : (product.storages ?? []);

  // In StorageVariant mode, build a list of unique storage options (no simType suffix)
  type SvOption = { storage: string; simType: string; label: string };
  const storageOnlyOptions: string[] = hasStorageVariants
    ? [...new Map(product.storageVariants!.map(sv => [sv.storage, sv.storage])).values()]
    : [];

  // Unique (storage, simType) pairs for the selector
  const svOptions: SvOption[] = hasStorageVariants
    ? (() => {
        const seen = new Set<string>();
        const opts: SvOption[] = [];
        for (const sv of product.storageVariants!) {
          const key = `${sv.storage}|${sv.simType}`;
          if (!seen.has(key)) {
            seen.add(key);
            opts.push({ storage: sv.storage, simType: sv.simType as string, label: sv.storage });
          }
        }
        return opts;
      })()
    : [];

  // ── Global SIM types (admin-managed, fetched once) ──
  const [globalSimTypes, setGlobalSimTypes] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/sim-types").then(r=>r.json()).then(d=>Array.isArray(d)&&setGlobalSimTypes(d)).catch(()=>{});
  }, []);
  const getSimTypeName = (code: string) => {
    const found = globalSimTypes.find((s:any)=>s.code===code);
    if (found) return found.name;
    const raw = String(code||"");
    return raw.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase()) || "—";
  };

  // ── useState declarations (must come before any derived values that reference them) ──
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>(
    storageOptions.length > 0 ? storageOptions[0] : undefined
  );
  // In StorageVariant mode, track the SIM type choice separately (null = not yet selected / single option)
  // Generic for any product category — auto-select first variant's simType
  const [selectedSimType, setSelectedSimType] = useState<string | null>(() => {
    if (!hasStorageVariants) return null;
    if (!storageOnlyOptions.length) return null;
    const variants = product.storageVariants!.filter(sv => sv.storage.toLowerCase() === storageOnlyOptions[0].toLowerCase());
    if (variants.length >= 1) {
      return variants[0].simType || null;
    }
    return null;
  });

  // Current SV selector key
  const svKey = selectedSimType ? `${selectedStorage}|${selectedSimType}` : (selectedStorage ?? "");

  // Available SIM types for the currently selected storage (dynamic)
  const simTypeOptions: string[] = hasStorageVariants && selectedStorage
    ? [...new Set(
        product.storageVariants!
          .filter(sv => sv.storage.toLowerCase() === selectedStorage.toLowerCase())
          .map(sv => sv.simType as string)
      )]
    : [];

  // In StorageVariant mode, find the first matching variant for the given storage+simType combo
  const getStorageVariant = (storage: string | undefined, simType?: string) =>
    hasStorageVariants && storage
      ? product.storageVariants!.find(sv =>
          sv.storage.toLowerCase() === storage.toLowerCase() &&
          (!simType || sv.simType === simType)
        )
      : null;

  // Derive colors, warranties, and simType from the selected StorageVariant or fall back to product-level
  const selectedStorageVariant = hasStorageVariants && selectedStorage
    ? (product.storageVariants!.find(sv =>
        sv.storage.toLowerCase() === selectedStorage.toLowerCase() &&
        (!selectedSimType || sv.simType === selectedSimType)
      ) ?? null)
    : null;
  // Defensive: ensure availableColors is always an array to prevent crashes
  // Fix: fallback to product-level colors when variant has empty colors (newly added colors at product level should still display)
  const availableColors = (hasStorageVariants && selectedStorageVariant && Array.isArray(selectedStorageVariant.colors) && selectedStorageVariant.colors.length > 0)
    ? selectedStorageVariant.colors
    : (Array.isArray(product.colors) ? product.colors : []);
  // Resolve warranty objects from the product-level pool using warranties[] (which may have per-variant price overrides)
  const resolvedWarranties: Warranty[] = (selectedStorageVariant?.warranties ?? [])
    .map((va: any) => {
      const base = (product.warranties ?? []).find((w: Warranty) => w.id === va.id);
      return {
        ...base,
        id: va.id,
        priceKsh: va.priceKsh ?? base?.priceKsh ?? 0,
      } as Warranty;
    })
    .filter((w: Warranty) => w.id);
  const availableWarranties = hasStorageVariants && selectedStorageVariant
    ? resolvedWarranties
    : (product.warranties && product.warranties.length > 0) ? product.warranties : [];
  // When multiple SIM types exist for the selected storage, show the selector
  const storageSimTypes = hasStorageVariants && selectedStorage
    ? product.storageVariants!.filter(sv => sv.storage.toLowerCase() === selectedStorage.toLowerCase()).map(sv => sv.simType)
    : [];
  const hasMultipleSimTypes = storageSimTypes.length > 1;
  // availableSimType: used for the SIM type selector UI (null = show selector)
  const availableSimType = hasMultipleSimTypes ? null : (hasStorageVariants && selectedStorageVariant ? selectedStorageVariant.simType : product.simType);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | undefined>(() => {
    if (availableWarranties.length > 0) {
      const freeWarranty = availableWarranties.find(w => w.priceKsh === 0);
      return freeWarranty || undefined;
    }
    return undefined;
  });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");
  const [slideIndex, setSlideIndex] = useState(0);

  // Helper to get color entry by name (handles both legacy string[] and new ProductColor[])
  const getColorEntry = (name: string | undefined) => {
    if (!name || !product.colors?.length) return undefined;
    const first = product.colors[0];
    if (typeof first === 'string') return undefined; // legacy, no data
    return (product.colors as any[]).find((c: any) => c.name === name) as any;
  };

  // Auto-cycle slideshow for product images
  const availableImages = React.useMemo(() => {
    const baseImages: string[] = [product.image].filter(Boolean);
    const variantKey = selectedStorage && selectedColor
      ? `${selectedStorage}|${selectedColor}`
      : selectedColor
        ? `|${selectedColor}`
        : null;
    const variantImgs: string[] = variantKey
      ? (product.variantImages as VariantImagesMap)?.[variantKey]?.map(vi => vi.imageUrl).filter(Boolean) || []
      : [];
    const colorEntry = getColorEntry(selectedColor);
    const colorImg: string[] = colorEntry?.image ? [colorEntry.image] : [];
    const extraImgs: string[] = product.images?.filter(
      img => !baseImages.includes(img) && !colorImg.includes(img) && !variantImgs.includes(img)
    ) || [];
    return [...new Set([...baseImages, ...colorImg, ...variantImgs, ...extraImgs])];
  }, [product.image, product.images, product.variantImages, selectedStorage, selectedColor, product.colors]);

  React.useEffect(() => {
    setSlideIndex(0);
  }, [selectedColor, selectedStorage]);

  React.useEffect(() => {
    if (availableImages.length <= 1) return;
    // Disable auto‑slider when a specific color is selected
    if (selectedColor) return;
    const timer = setInterval(() => {
      setSlideIndex(i => (i + 1) % availableImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [availableImages.length, selectedColor]);

  React.useEffect(() => {
    setSlideIndex(0);
    setSelectedColor(undefined);
    const opts = hasStorageVariants
      ? [...new Map(product.storageVariants!.map(sv => [sv.storage, sv.storage])).values()]
      : (product.storages ?? []);
    setSelectedStorage(opts.length > 0 ? opts[0] : undefined);
    // Reset SIM type when storage changes — auto-select when there's only one or multiple (avoid null which causes crashes)
    if (hasStorageVariants) {
      const variants = product.storageVariants!.filter(sv => sv.storage.toLowerCase() === (opts[0] || "").toLowerCase());
      // Auto-select: use first variant when exactly one, or when multiple (don't leave null)
      const sim = (variants.length >= 1 ? variants[0].simType : null) as string | null;
      setSelectedSimType(sim);
      const matchedSv = variants.find(sv => !sim || sv.simType === sim);
      const resolved = (matchedSv?.warranties ?? [])
        .map((va: any) => {
          const base = (product.warranties ?? []).find((w: Warranty) => w.id === va.id);
          return { ...base, priceKsh: va.priceKsh ?? base?.priceKsh ?? 0 } as Warranty;
        })
        .filter((w: Warranty) => w.id);
      if (resolved.length > 0) {
        const free = resolved.find((w: Warranty) => w.priceKsh === 0);
        setSelectedWarranty(free || undefined);
      } else {
        setSelectedWarranty(undefined);
      }
    } else {
      setSelectedSimType(null);
      const warranties = (product.warranties && product.warranties.length > 0) ? product.warranties : [];
      const free = warranties.find((w: Warranty) => w.priceKsh === 0);
      setSelectedWarranty(free || undefined);
    }
    setQuantity(1);
  }, [product.id, product.image]);

  // Check if product has legacy variant-based pricing (ProductVariant[] structure)
  const hasLegacyVariants = Array.isArray(product.variants) && product.variants.length > 0;

  // Compute dynamic price — prefer StorageVariant price, fall back to legacy variants, then product.priceKsh
  const getVariantPriceKsh = (storage: string | undefined, color: string | undefined): number | null => {
    // StorageVariant takes precedence (matches storage + selectedSimType)
    const sv = getStorageVariant(storage, selectedSimType ?? undefined);
    if (sv?.priceKsh != null) return sv.priceKsh;
    // Legacy per-combo variants
    if (!hasLegacyVariants || !storage) return null;
    if (color) {
      const match = product.variants?.find(
        v => v.storage.toLowerCase() === storage.toLowerCase() &&
             v.color.toLowerCase() === color.toLowerCase()
      );
      if (match?.priceKsh != null) return match.priceKsh;
    }
    const baseMatch = product.variants?.find(
      v => v.storage.toLowerCase() === storage.toLowerCase() && !v.color
    );
    return baseMatch?.priceKsh ?? null;
  };

  const dynamicPriceKsh = getVariantPriceKsh(selectedStorage, selectedColor);
  const basePriceKsh = dynamicPriceKsh ?? product.priceKsh ?? 0;
  const getVariantWarrantyPrice = (): number => {
    if (!selectedWarranty) return 0;
    // In storageVariant mode, warranty price comes from the selected warranty itself
    if (hasStorageVariants) return selectedWarranty.priceKsh;
    // Legacy: check variant override first
    if (!selectedStorage) return selectedWarranty.priceKsh ?? 0;
    const variantMatch = product.variants?.find(
      v => v.storage.toLowerCase() === selectedStorage.toLowerCase() &&
        (!selectedColor ? !v.color : v.color.toLowerCase() === selectedColor.toLowerCase())
    );
    return (variantMatch as any)?.warrantyPriceKsh ?? selectedWarranty.priceKsh ?? 0;
  };
  const warrantyPrice = getVariantWarrantyPrice();
  const displayPriceKsh = warrantyPrice > 0 ? warrantyPrice : basePriceKsh;

  // All in-stock (variants always in stock for now)
  const isSelectedVariantInStock = hasLegacyVariants ? true : product.inStock;
  const selectedVariantStock = undefined;

  // Hover to zoom states
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transformOrigin: "center center",
  });
  const [isZoomed, setIsZoomed] = useState(false);

  // Price Tracker State variables
  const [trackerEmail, setTrackerEmail] = useState("");
  const [trackerStatus, setTrackerStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [trackerMessage, setTrackerMessage] = useState("");

  const handleTrackPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerEmail.trim() || !trackerEmail.includes("@")) {
      setTrackerStatus("error");
      setTrackerMessage("Please enter a valid email address.");
      return;
    }

    setTrackerStatus("submitting");
    setTrackerMessage("");

    try {
      const response = await fetch("/api/price-trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          email: trackerEmail,
          initialPrice: product.priceKsh,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTrackerStatus("success");
        setTrackerMessage(`Successfully tracking! We will alert ${trackerEmail} on any price drop.`);
        setTrackerEmail("");
      } else {
        setTrackerStatus("error");
        setTrackerMessage(data.error || "Failed to set up tracker.");
      }
    } catch (err) {
      console.error(err);
      setTrackerStatus("error");
      setTrackerMessage("Network error. Please try again later.");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({
      transformOrigin: "center center",
    });
  };

  // Reviews state to support instant reviews adding!
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || [
    {
      id: "init1",
      rating: 5,
      date: "3 days ago",
      title: "Excellent device",
      content: "Exceeded all expectations. Setup took 10 seconds and works flawlessly with my other hardware.",
      author: "Alex G.",
      verified: true
    },
    {
      id: "init2",
      rating: 4,
      date: "1 week ago",
      title: "Very clean aesthetics",
      content: "The metal finish is perfect. Good soundstage and excellent battery density.",
      author: "Marie L.",
      verified: true
    }
  ]);

  // Form states
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Calculate dynamic rating details
  const reviewsCount = reviewsList.length;
  const averageRating = (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1);

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQty = () => {
    if (selectedVariantStock !== undefined && quantity >= selectedVariantStock) {
      return;
    }
    setQuantity(quantity + 1);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContent.trim() || !formTitle.trim()) return;

    const newReview: Review = {
      id: `review-${Date.now()}`,
      rating: formRating,
      date: "Just now",
      title: formTitle,
      content: formContent,
      author: formName,
      verified: true,
    };

    setReviewsList([newReview, ...reviewsList]);
    setFormName("");
    setFormTitle("");
    setFormContent("");
    setFormRating(5);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const handleAddToCartClick = () => {
    // Pass effective SIM type so cart distinguishes variants with newly added SIM types
    const effectiveSim = selectedSimType || (availableSimType as string) || (simTypeOptions[0] as string) || product.simType || undefined;
    onAddToCart(product, quantity, selectedColor, selectedStorage, selectedWarranty, effectiveSim);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 animate-in fade-in duration-200" id="product-detail-container">
      {/* Back Button */}
      <div className="text-left">
        <button
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-2"
          id="detail-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop all hardware
        </button>
      </div>

      {/* Main product stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start text-left">

        {/* ── Mobile: image FIRST, then info ── */}
        {/* ── Desktop: image left, info right ── */}

        {/* Right Column: Information — bottom on mobile, right on desktop */}
        <div className="order-2 lg:order-2 lg:col-span-6 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1 scrollbar-thin">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{product.category}</span>
            <h1 className="font-display font-black text-lg md:text-3xl lg:text-4xl text-on-surface leading-tight" id="detail-product-name">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(Number(averageRating)) ? "fill-amber-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-on-surface">{averageRating}</span>
              <span className="text-[10px] text-on-surface-variant/70">({reviewsCount} reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="py-1.5 border-y border-outline/10">
            <span className="text-lg md:text-2xl font-black text-primary font-display">
              {product.priceRange || (displayPriceKsh > 0 ? `${CURRENCY_SYMBOL} ${displayPriceKsh.toLocaleString()}` : formatProductPrice(product))}
            </span>
          </div>

          {/* Colors — display when any color is set (newly added colors via global library fallback to product-level) */}
          <div className="space-y-3">
            {availableColors && availableColors.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-on-surface-variant/85 uppercase tracking-wider">
                  Colorway: <strong className="text-on-surface">{selectedColor || "—"}</strong>
                </span>
                <div className="flex gap-2">
                  {availableColors.map((colorEntry) => {
                    const name = typeof colorEntry === 'string' ? colorEntry : (colorEntry as any).name;
                    const hexCode = typeof colorEntry === 'string'
                      ? product.colorCodes?.[name]
                      : (colorEntry as any).code;
                    let bgStyle: React.CSSProperties | undefined;
                    let bgClass = "bg-gray-400";
                    if (hexCode) {
                      bgStyle = { backgroundColor: hexCode };
                    } else {
                      if (name === "Silver") bgClass = "bg-[#EAEAEA]";
                      else if (name === "Slate" || name === "Charcoal" || name === "Obsidian" || name === "Black") bgClass = "bg-[#1a1a1a]";
                      else if (name === "Teal") bgClass = "bg-[#008080]";
                      else if (name === "White" || name === "Snow") bgClass = "bg-[#F5F5F5] border border-outline/20";
                      else if (name === "Copper") bgClass = "bg-[#b87333]";
                      else if (name === "Coral") bgClass = "bg-[#FF7F50]";
                      else if (name === "Gold" || name === "Yellow") bgClass = "bg-[#FFD700]";
                      else if (name === "Pacific Blue" || name === "Blue") bgClass = "bg-[#007AFF]";
                      else if (name === "Midnight Green") bgClass = "bg-[#004953]";
                      else if (name === "Purple" || name === "Violet") bgClass = "bg-[#8B5CF6]";
                      else if (name === "Green" || name === "Sage") bgClass = "bg-[#4CAF50]";
                      else if (name === "Red" || name === "Product Red") bgClass = "bg-[#FF3B30]";
                      else if (name === "Pink" || name === "Rose Gold" || name === "Rose") bgClass = "bg-[#FF2D55]";
                      else if (name === "Orange") bgClass = "bg-[#FF9500]";
                    }
                    return (
                      <button
                        key={name}
                        onClick={() => setSelectedColor(name)}
                        style={bgStyle}
                        className={`w-7 h-7 rounded-full ${!hexCode ? bgClass : ""} transition-all duration-150 flex items-center justify-center ${
                          selectedColor === name ? "ring-2 ring-primary ring-offset-2" : "opacity-85 hover:opacity-100 hover:scale-105"
                        }`}
                        title={name}
                        id={`color-btn-${name}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Storage + SIM Type selector */}
            {hasStorageVariants ? (
              <div className="space-y-2">
                {/* Storage row */}
                <span className="text-[10px] font-bold text-on-surface-variant/85 uppercase tracking-wider">
                  Storage: <strong className="text-on-surface">{selectedStorage}</strong>
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {storageOnlyOptions.map((storage) => {
                    const isSelected = storage === selectedStorage;
                    return (
                      <button
                        key={storage}
                        onClick={() => {
                          setSelectedStorage(storage);
                          setSelectedColor(undefined);
                          const variants = product.storageVariants!.filter(sv =>
                            sv.storage.toLowerCase() === storage.toLowerCase()
                          );
                          if (variants.length === 1) {
                            setSelectedSimType(variants[0].simType as string);
                            const sv = variants[0];
                            if (sv.warranties?.length) {
                              const svWarranties = sv.warranties.map((va: any) => {
                                const base = (product.warranties ?? []).find((w: Warranty) => w.id === va.id);
                                return { ...base, priceKsh: va.priceKsh ?? base?.priceKsh ?? 0 } as Warranty;
                              }).filter((w: Warranty) => w.id);
                              const free = svWarranties.find((w: Warranty) => w.priceKsh === 0);
                              setSelectedWarranty((free || svWarranties[0]) as Warranty | undefined);
                            } else {
                              setSelectedWarranty(undefined);
                            }
                          } else {
                            setSelectedSimType(null);
                            setSelectedWarranty(undefined);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                          isSelected
                            ? "bg-on-surface text-surface border-on-surface"
                            : "bg-surface border-outline/20 text-on-surface-variant hover:bg-surface-container"
                        }`}
                        id={`storage-btn-${storage}`}
                      >
                        {storage}
                      </button>
                    );
                  })}
                </div>

                {/* SIM type row — always show when SIM type is set (single = read-only badge, multiple = selector) */}
                {(simTypeOptions.length > 0 || !!availableSimType) && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-on-surface-variant/85 uppercase tracking-wider">
                      SIM: <strong className="text-on-surface">{getSimTypeName(selectedSimType || (availableSimType as string) || simTypeOptions[0] || "")}</strong>
                    </span>
                    {simTypeOptions.length > 1 ? (
                      <div className="flex gap-1.5 flex-wrap">
                        {simTypeOptions.map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              setSelectedSimType(st);
                              setSelectedColor(undefined);
                              const sv = product.storageVariants!.find(sv2 =>
                                sv2.storage.toLowerCase() === selectedStorage?.toLowerCase() && sv2.simType === st
                              );
                              if (sv?.warranties?.length) {
                                const svWarranties = sv.warranties.map((va: any) => {
                                  const base = (product.warranties ?? []).find((w: Warranty) => w.id === va.id);
                                  return { ...base, priceKsh: va.priceKsh ?? base?.priceKsh ?? 0 } as Warranty;
                                }).filter((w: Warranty) => w.id);
                                const free = svWarranties.find((w: Warranty) => w.priceKsh === 0);
                                setSelectedWarranty((free || svWarranties[0]) as Warranty | undefined);
                              } else {
                                setSelectedWarranty(undefined);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                              selectedSimType === st
                                ? "bg-on-surface text-surface border-on-surface"
                                : "bg-surface border-outline/20 text-on-surface-variant hover:bg-surface-container"
                            }`}
                          >
                            {getSimTypeName(st)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="px-3 py-1.5 rounded-xl text-[11px] font-semibold border bg-on-surface text-surface border-on-surface">
                          {getSimTypeName(simTypeOptions[0] || (availableSimType as string) || "")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : storageOptions.length > 0 ? (
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-on-surface-variant/85 uppercase tracking-wider">
                    Storage: <strong className="text-on-surface">{selectedStorage}</strong>
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {storageOptions.map((storage) => (
                      <button
                        key={storage}
                        onClick={() => {
                          if (selectedColor) {
                            const variantKey = `${storage}|${selectedColor}`;
                            const hasImg = !!(product.variantImages as VariantImagesMap)?.[variantKey]?.length;
                            const hasColorImg = !!availableColors.find(c => {
                              const n = typeof c === 'string' ? c : (c as any).name;
                              return n === selectedColor && ((typeof c === 'object' ? (c as any).image : product.colorImages?.[n]));
                            });
                            if (!hasImg && !hasColorImg) setSelectedColor(undefined);
                          }
                          setSelectedStorage(storage);
                          if (hasStorageVariants) {
                            const variants = product.storageVariants!.filter(sv =>
                              sv.storage.toLowerCase() === storage.toLowerCase()
                            );
                            const currentValid = selectedSimType && variants.some(sv => sv.simType === selectedSimType);
                            if (currentValid) {
                              const sv = variants.find(sv => sv.simType === selectedSimType)!;
                              if (sv.warranties?.length) {
                                const resolved = sv.warranties.map((va: any) => {
                                  const base = (product.warranties ?? []).find((w: Warranty) => w.id === va.id);
                                  return { ...base, priceKsh: va.priceKsh ?? base?.priceKsh ?? 0 } as Warranty;
                                }).filter((w: Warranty) => w.id);
                                if (resolved.length > 0) {
                                  const free = resolved.find(w => w.priceKsh === 0);
                                  setSelectedWarranty(free || resolved[0]);
                                } else {
                                  setSelectedWarranty(undefined);
                                }
                              } else {
                                setSelectedWarranty(undefined);
                              }
                            } else if (variants.length === 1) {
                              setSelectedSimType(variants[0].simType as string);
                              const sv = variants[0];
                              if (sv.warranties?.length) {
                                const resolved = sv.warranties.map((va: any) => {
                                  const base = (product.warranties ?? []).find((w: Warranty) => w.id === va.id);
                                  return { ...base, priceKsh: va.priceKsh ?? base?.priceKsh ?? 0 } as Warranty;
                                }).filter((w: Warranty) => w.id);
                                if (resolved.length > 0) {
                                  const free = resolved.find(w => w.priceKsh === 0);
                                  setSelectedWarranty(free || resolved[0]);
                                } else {
                                  setSelectedWarranty(undefined);
                                }
                              } else {
                                setSelectedWarranty(undefined);
                              }
                            } else {
                              setSelectedSimType(null);
                              setSelectedWarranty(undefined);
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                          selectedStorage === storage
                            ? "bg-on-surface text-surface border-on-surface"
                            : "bg-surface border-outline/20 text-on-surface-variant hover:bg-surface-container"
                        }`}
                        id={`storage-btn-${storage}`}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>
                {/* SIM fallback for products without storageVariants (legacy) */}
                {product.simType && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-on-surface-variant/85 uppercase tracking-wider">
                      SIM: <strong className="text-on-surface">{getSimTypeName(product.simType)}</strong>
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="px-3 py-1.5 rounded-xl text-[11px] font-semibold border bg-on-surface text-surface border-on-surface">
                        {getSimTypeName(product.simType)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : product.simType ? (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-on-surface-variant/85 uppercase tracking-wider">
                  SIM: <strong className="text-on-surface">{getSimTypeName(product.simType)}</strong>
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="px-3 py-1.5 rounded-xl text-[11px] font-semibold border bg-on-surface text-surface border-on-surface">
                    {getSimTypeName(product.simType)}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Warranty selector — always show when warranty is set (single = read-only badge, multiple = selector) */}
            {availableWarranties && availableWarranties.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-on-surface-variant/85 uppercase tracking-wider">
                  Warranty: <strong className="text-on-surface">{selectedWarranty?.name || availableWarranties[0]?.name || "—"}</strong>
                  {selectedWarranty?.duration ? ` (${selectedWarranty.duration})` : (availableWarranties[0]?.duration ? ` (${availableWarranties[0].duration})` : "")}
                </span>
                {availableWarranties.length > 1 ? (
                  <div className="flex gap-1.5 flex-wrap">
                    {availableWarranties.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setSelectedWarranty(w)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all text-left leading-tight ${
                          selectedWarranty?.id === w.id
                            ? "bg-on-surface text-surface border-on-surface"
                            : "bg-surface border-outline/20 text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        <span className="block">{w.name}{w.duration ? ` (${w.duration})` : ""}</span>
                        <span className={`block text-[10px] font-bold ${selectedWarranty?.id === w.id ? "text-white/80" : w.priceKsh === 0 ? "text-green-600" : "text-primary"}`}>
                          {w.priceKsh === 0 ? "Free" : `KSh ${w.priceKsh.toLocaleString()}`}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="px-3 py-1.5 rounded-xl text-[11px] font-semibold border bg-on-surface text-surface border-on-surface text-left leading-tight">
                      <span className="block">{availableWarranties[0].name}{availableWarranties[0].duration ? ` (${availableWarranties[0].duration})` : ""}</span>
                      <span className="block text-[10px] font-bold text-white/80">{availableWarranties[0].priceKsh === 0 ? "Free" : `KSh ${availableWarranties[0].priceKsh.toLocaleString()}`}</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector and CTA */}
            <div className="pt-3 flex flex-row gap-3 items-center">
              <div className="flex items-center bg-surface-container-low border border-outline/20 rounded-full w-fit">
                <button onClick={handleDecreaseQty} className="p-2 px-3.5 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40" disabled={quantity <= 1} aria-label="Decrease qty">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-xs px-3 text-on-surface min-w-[20px] text-center">{quantity}</span>
                <button onClick={handleIncreaseQty} className="p-2 px-3.5 text-on-surface-variant hover:text-primary transition-colors" aria-label="Increase qty">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={handleAddToCartClick}
                disabled={!product.inStock}
                className="flex-1 py-3 px-6 rounded-full text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed glass-btn-ios-primary"
                id="add-to-cart-detail-btn"
              >
                {product.inStock ? "Add to Cart" : "Temporarily Sold Out"}
              </button>
            </div>

            {/* Price Tracker */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline/10 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-black text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    Price Alert
                    <span className="flex items-center text-[9px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-normal normal-case">
                      <TrendingDown className="w-2 h-2 mr-0.5 text-green-600" />Active
                    </span>
                  </h4>
                  <p className="text-[10px] text-on-surface-variant/80 leading-relaxed">
                    Get notified when <strong>{product.name}</strong> price drops.
                  </p>
                </div>
              </div>
              <form onSubmit={handleTrackPrice} className="flex gap-1.5 items-center">
                <input
                  type="email"
                  value={trackerEmail}
                  onChange={(e) => setTrackerEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg border border-outline/15 bg-surface text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                  disabled={trackerStatus === "submitting"}
                  required
                />
                <button
                  type="submit"
                  disabled={trackerStatus === "submitting"}
                  className="px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer disabled:opacity-50 glass-btn-ios-primary"
                >
                  {trackerStatus === "submitting" ? "..." : "Monitor"}
                </button>
              </form>
              {trackerMessage && (
                <div className={`p-2 rounded-lg text-[10px] font-bold ${
                  trackerStatus === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {trackerMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left Column: Image — top on mobile, left on desktop */}
        <div className="order-1 lg:order-1 lg:col-span-6 space-y-3">
          <div
            className="relative aspect-[4/3] lg:aspect-square rounded-2xl lg:rounded-[32px] bg-surface flex items-center justify-center p-3 lg:p-6 overflow-hidden cursor-zoom-in border border-outline/10 shadow-xs"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            id="product-zoom-container"
          >
            {product.isNew && (
              <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded bg-primary text-white text-[9px] font-bold uppercase tracking-wider">
                New
              </span>
            )}
            <img
              src={availableImages[slideIndex] || product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full max-w-[220px] lg:max-w-[380px] h-auto object-contain select-none pointer-events-none transition-transform duration-200 ease-out"
              style={{
                ...zoomStyle,
                transform: isZoomed ? "scale(2.2)" : "scale(1)",
              }}
              id="detail-main-img"
            />
            <div className="absolute bottom-2 right-2 bg-surface/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-outline/10 flex items-center gap-1 pointer-events-none text-[9px] font-bold text-on-surface-variant">
              <ZoomIn className="w-2.5 h-2.5 text-primary animate-pulse" />
              <span className="hidden sm:inline">{isZoomed ? "Zoomed" : "Hover to zoom"}</span>
              <span className="sm:hidden">{isZoomed ? "Zoomed" : "Tap to zoom"}</span>
            </div>
          </div>

          {availableImages.length > 1 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {availableImages.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  onClick={() => setSlideIndex(idx)}
                  className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden bg-surface border p-0.5 transition-all ${
                    slideIndex === idx
                      ? "ring-2 ring-primary border-transparent"
                      : "border-outline/15 hover:border-outline/30"
                  }`}
                >
                  <img src={imgUrl} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          {availableWarranties.length > 0 && (
            <div className="hidden md:flex items-center gap-2 justify-center text-[10px] text-on-surface-variant/60 bg-surface-container-low p-2.5 rounded-xl border border-outline/5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Authorized manufacturer warranty & original packaging included.</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs segment: Specifications & Customer Reviews */}
      <div className="border-t border-outline/10 pt-6 md:pt-10 text-left">
        <div className="flex border-b border-outline/10 gap-4 md:gap-6 text-xs md:text-sm font-semibold mb-4 md:mb-6">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === "specs" ? "border-primary text-primary" : "border-transparent text-on-surface-variant/70 hover:text-on-surface"
            }`}
            id="tab-specs-trigger"
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "reviews" ? "border-primary text-primary" : "border-transparent text-on-surface-variant/70 hover:text-on-surface"
            }`}
            id="tab-reviews-trigger"
          >
            Customer Reviews ({reviewsCount})
          </button>
        </div>

        {/* Tab 1: Specs */}
        {activeTab === "specs" && (
          <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start">
              {/* Specification table */}
              <div className="border border-outline/10 rounded-xl md:rounded-2xl overflow-hidden bg-surface-container-low">
                <table className="w-full text-[11px] md:text-xs text-left border-collapse">
                  <tbody>
                    {product.specifications ? (
                      Object.entries(product.specifications).map(([key, value], idx) => (
                        <tr 
                          key={key} 
                          className={`border-b border-outline/5 ${idx % 2 === 0 ? "bg-surface-container-lowest/40" : "bg-transparent"}`}
                        >
                          <th className="py-2.5 md:py-3.5 px-3 md:px-4 font-bold text-on-surface-variant/80 w-1/3 border-r border-outline/5">{key}</th>
                          <td className="py-2.5 md:py-3.5 px-3 md:px-4 text-on-surface font-medium">{value}</td>
                        </tr>
                      ))
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Removed why-buy box */}
            </div>
          </div>
        )}

        {/* Tab 2: Customer Reviews Module */}
        {activeTab === "reviews" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* Left Column: Review Stats and Add Review Form */}
              <div className="lg:col-span-5 space-y-4 md:space-y-6 bg-surface-container-low border border-outline/10 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-sm md:text-base text-on-surface">Customer Reviews</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl md:text-3xl font-black text-on-surface font-display">{averageRating}</span>
                    <div className="space-y-0.5">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < Math.floor(Number(averageRating)) ? "fill-amber-500" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-on-surface-variant/70 block">Based on {reviewsCount} logs</span>
                    </div>
                  </div>
                </div>

                {/* Form to post a review */}
                <form onSubmit={handleAddReview} className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-outline/10" id="write-review-form">
                  <h4 className="font-display font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Log a Customer Review</h4>
                  
                  {formSuccess && (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 p-2.5 rounded-xl text-xs font-semibold animate-bounce">
                      <CheckCircle className="w-4 h-4" />
                      <span>Review submitted! Thank you.</span>
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-on-surface-variant block">Customer Rating</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormRating(val)}
                          className="p-1 hover:scale-110 transition-transform text-amber-500"
                          id={`star-select-${val}`}
                          aria-label={`Rate ${val} stars`}
                        >
                          <Star className={`w-5 h-5 md:w-6 md:h-6 ${val <= formRating ? "fill-amber-500" : "text-gray-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nickname */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant block">Verification Nickname</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam K."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-surface border border-outline/15 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Review Title */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant block">Review Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Summarize your experience..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-surface border border-outline/15 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Review Content */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant block">Detailed Experience Log</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Write your feedback..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full bg-surface border border-outline/15 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer glass-btn-ios-primary"
                    id="submit-review-btn"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Submit Review
                  </button>
                </form>
              </div>

              {/* Right Column: Reviews feed */}
              <div className="lg:col-span-7 space-y-3 md:space-y-4">
                {reviewsList.map((review) => (
                  <div 
                    key={review.id} 
                    className="p-3 md:p-4 bg-surface-container-low border border-outline/10 rounded-xl md:rounded-2xl space-y-1.5 md:space-y-2 transition-shadow hover:shadow-xs"
                    id={`review-item-${review.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-on-surface">{review.author}</span>
                          {review.verified && (
                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[9px] font-bold border border-green-100">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <h4 className="font-display font-bold text-xs md:text-sm text-on-surface">
                          {review.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-on-surface-variant/50 shrink-0">{review.date}</span>
                    </div>

                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < review.rating ? "fill-amber-500" : "text-gray-200"}`} 
                        />
                      ))}
                    </div>

                    <p className="text-[11px] md:text-xs text-on-surface-variant/90 leading-relaxed">
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* More to Explore — related products from same category */}
      {(() => {
        const related = products
          .filter(p => p.id !== product.id && p.category === product.category)
          .slice(0, 4);
        if (related.length === 0) return null;
        return (
          <section className="border-t border-outline/10 pt-10 mt-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-black text-xl text-on-surface">More to Explore</h2>
              <button
                onClick={onBackToCatalog}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(prod => (
                <button
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="text-left group"
                >
                  <div className="aspect-square rounded-2xl bg-surface overflow-hidden border border-outline/10 mb-2 p-2 flex items-center justify-center">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-on-surface leading-tight line-clamp-2">{prod.name}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{formatProductPrice(prod)}</p>
                </button>
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
};
