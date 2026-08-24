import React, { useState } from "react";
import { Star, ShieldCheck, ArrowLeft, Heart, Plus, Minus, CheckCircle, MessageSquare, ZoomIn, Bell, TrendingDown } from "lucide-react";
import { Product, Review, Warranty, formatProductPrice, CURRENCY_SYMBOL, VariantImagesMap } from "../types";

interface ProductDetailViewProps {
  product: Product;
  products?: Product[];
  onBackToCatalog: () => void;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string, selectedStorage?: string, selectedWarranty?: Warranty) => void;
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
  type SvOption = { storage: string; simType: "esim" | "physical"; label: string };
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
            opts.push({ storage: sv.storage, simType: sv.simType as "esim" | "physical", label: sv.storage });
          }
        }
        return opts;
      })()
    : [];

  // ── useState declarations (must come before any derived values that reference them) ──
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>(
    storageOptions.length > 0 ? storageOptions[0] : undefined
  );
  // In StorageVariant mode, track the SIM type choice separately (null = not yet selected / single option)
  const [selectedSimType, setSelectedSimType] = useState<"esim" | "physical" | null>(() => {
    if (!hasStorageVariants) return null;
    const variants = product.storageVariants!.filter(sv => sv.storage.toLowerCase() === (storageOnlyOptions[0] || "").toLowerCase());
    return variants.length === 1 ? (variants[0].simType as "esim" | "physical") : null;
  });

  // Current SV selector key
  const svKey = selectedSimType ? `${selectedStorage}|${selectedSimType}` : (selectedStorage ?? "");

  // Available SIM types for the currently selected storage
  const simTypeOptions: ("esim" | "physical")[] = hasStorageVariants && selectedStorage
    ? [...new Set(
        product.storageVariants!
          .filter(sv => sv.storage.toLowerCase() === selectedStorage.toLowerCase())
          .map(sv => sv.simType as "esim" | "physical")
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
  const availableColors = hasStorageVariants && selectedStorageVariant
    ? selectedStorageVariant.colors
    : product.colors ?? [];
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
  const DEFAULT_WARRANTIES: Warranty[] = [
    { id: "default-1yr", name: "1 Year Official Warranty", duration: "1 Year", priceKsh: 0 },
  ];
  const availableWarranties = hasStorageVariants && selectedStorageVariant
    ? (resolvedWarranties.length > 0 ? resolvedWarranties : (product.warranties && product.warranties.length > 0 ? product.warranties : DEFAULT_WARRANTIES))
    : (product.warranties && product.warranties.length > 0) ? product.warranties : DEFAULT_WARRANTIES;
  // When multiple SIM types exist for the selected storage, show the selector
  const storageSimTypes = hasStorageVariants && selectedStorage
    ? product.storageVariants!.filter(sv => sv.storage.toLowerCase() === selectedStorage.toLowerCase()).map(sv => sv.simType)
    : [];
  const hasMultipleSimTypes = storageSimTypes.length > 1;
  // availableSimType: used for the SIM type selector UI (null = show selector)
  const availableSimType = hasMultipleSimTypes ? null : (hasStorageVariants && selectedStorageVariant ? selectedStorageVariant.simType : product.simType);

  // selectedColor stores the color NAME string, not the whole ProductColor object
  const getInitialColor = () => {
    const colors = availableColors;
    if (colors && colors.length > 0) {
      const first = colors[0];
      return typeof first === 'string' ? first : (first as any).name;
    }
    return undefined;
  };
  const [selectedColor, setSelectedColor] = useState<string | undefined>(getInitialColor());
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | undefined>(() => {
    // Default to free warranty (priceKsh === 0) if available
    if (availableWarranties.length > 0) {
      const freeWarranty = availableWarranties.find(w => w.priceKsh === 0);
      return freeWarranty || availableWarranties[0];
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
    const timer = setInterval(() => {
      setSlideIndex(i => (i + 1) % availableImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [availableImages.length]);

  React.useEffect(() => {
    setSlideIndex(0);
    setSelectedColor(getInitialColor());
    const opts = hasStorageVariants
      ? [...new Map(product.storageVariants!.map(sv => [sv.storage, sv.storage])).values()]
      : (product.storages ?? []);
    setSelectedStorage(opts.length > 0 ? opts[0] : undefined);
    // Reset SIM type when storage changes
    if (hasStorageVariants) {
      const variants = product.storageVariants!.filter(sv => sv.storage.toLowerCase() === (opts[0] || "").toLowerCase());
      const sim = variants.length === 1 ? variants[0].simType : null;
      setSelectedSimType(sim as "esim" | "physical" | null);
      const matchedSv = variants.find(sv => !sim || sv.simType === sim);
      const resolved = (matchedSv?.warranties ?? [])
        .map((va: any) => {
          const base = (product.warranties ?? []).find((w: Warranty) => w.id === va.id);
          return { ...base, priceKsh: va.priceKsh ?? base?.priceKsh ?? 0 } as Warranty;
        })
        .filter((w: Warranty) => w.id);
      if (resolved.length > 0) {
        const free = resolved.find((w: Warranty) => w.priceKsh === 0);
        setSelectedWarranty(free || resolved[0]);
      } else {
        const fallback = (product.warranties && product.warranties.length > 0) ? product.warranties : DEFAULT_WARRANTIES;
        const free = fallback.find((w: Warranty) => w.priceKsh === 0);
        setSelectedWarranty(free || fallback[0]);
      }
    } else {
      setSelectedSimType(null);
      const warranties = (product.warranties && product.warranties.length > 0) ? product.warranties : DEFAULT_WARRANTIES;
      const free = warranties.find((w: Warranty) => w.priceKsh === 0);
      setSelectedWarranty(free || warranties[0]);
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
  const displayPriceKsh = basePriceKsh + getVariantWarrantyPrice();

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
    onAddToCart(product, quantity, selectedColor, selectedStorage, selectedWarranty);
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start text-left">
        {/* Left Column: Premium Framing Image */}
        <div className="lg:col-span-6 space-y-4">
          <div
            className="relative aspect-square rounded-[32px] bg-surface-container-low flex items-center justify-center p-8 overflow-hidden cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            id="product-zoom-container"
          >
            {product.isNew && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded bg-primary text-white text-[9px] font-bold uppercase tracking-wider">
                New Generation
              </span>
            )}
            
            <img
              src={availableImages[slideIndex] || product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full max-w-[420px] h-auto object-contain select-none pointer-events-none transition-transform duration-200 ease-out"
              style={{
                ...zoomStyle,
                transform: isZoomed ? "scale(2.2)" : "scale(1)",
              }}
              id="detail-main-img"
            />

            {/* Premium Zoom Helper Badge */}
            <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-outline/10 flex items-center gap-1.5 pointer-events-none text-[9px] font-bold text-on-surface-variant transition-opacity duration-200">
              <ZoomIn className="w-3 h-3 text-primary animate-pulse" />
              <span>{isZoomed ? "Zoomed" : "Hover to zoom"}</span>
            </div>
          </div>

          {/* Multiple Images Gallery — shows all images for selected color+storage combo */}
          {(() => {
            if (availableImages.length <= 1) return null;
            return (
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {availableImages.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    onClick={() => setSlideIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden bg-surface-container-low border p-1 transition-all ${
                      slideIndex === idx
                        ? "ring-2 ring-primary border-transparent animate-in zoom-in-75 duration-200"
                        : "border-outline/15 hover:border-outline/30"
                    }`}
                  >
                    <img src={imgUrl} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            );
          })()}
          
          <div className="flex items-center gap-3 justify-center text-xs text-on-surface-variant/60 bg-surface-container-low p-3.5 rounded-2xl border border-outline/5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Authorized manufacturer warranty and original packaging included.</span>
          </div>
        </div>

        {/* Right Column: Information & Configuration (Sticky on Desktop) */}
        <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-1 scrollbar-thin">
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{product.category}</span>
            <h1 className="font-display font-black text-3xl md:text-4xl text-on-surface leading-tight" id="detail-product-name">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(Number(averageRating)) ? "fill-amber-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-on-surface">{averageRating}</span>
              <span className="text-xs text-on-surface-variant/70">({reviewsCount} verification reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="py-2 border-y border-outline/10 flex items-center justify-between">
            <span className="text-2xl font-black text-primary font-display">
              {product.priceRange || (displayPriceKsh > 0 ? `${CURRENCY_SYMBOL} ${displayPriceKsh.toLocaleString()}` : formatProductPrice(product))}
            </span>
          </div>

          <p className="text-sm text-on-surface-variant leading-relaxed">
            {product.description}
          </p>

          {/* Configurable Attributes (Variants) */}
          <div className="space-y-5 pt-2">
            {/* Colors — only show colors that have images for selected storage */}
            {availableColors && availableColors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">
                  Colorway: <strong className="text-on-surface">{selectedColor}</strong>
                </span>
                <div className="flex gap-3">
                  {availableColors.map((colorEntry) => {
                    // Support both legacy string[] and new ProductColor[] format
                    const name = typeof colorEntry === 'string' ? colorEntry : (colorEntry as any).name;
                    const hexCode = typeof colorEntry === 'string'
                      ? product.colorCodes?.[name]
                      : (colorEntry as any).code;
                    // Check if this color has an image for the selected storage
                    const variantKey = selectedStorage ? `${selectedStorage}|${name}` : `|${name}`;
                    const hasImageForStorage = !!(product.variantImages as VariantImagesMap)?.[variantKey]?.length;
                    const hasColorImage = !!(typeof colorEntry === 'object' ? (colorEntry as any).image : product.colorImages?.[name]);
                    const hasBaseImage = !!product.image;
                    const isAvailable = hasImageForStorage || hasColorImage || hasBaseImage;
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
                        className={`w-8 h-8 rounded-full ${!hexCode ? bgClass : ""} transition-all duration-150 flex items-center justify-center ${
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
              <div className="space-y-3">
                {/* Storage row */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">
                    Storage: <strong className="text-on-surface">{selectedStorage}</strong>
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {storageOnlyOptions.map((storage) => {
                      const isSelected = storage === selectedStorage;
                      return (
                        <button
                          key={storage}
                          onClick={() => {
                            setSelectedStorage(storage);
                            setSelectedColor(undefined);
                            // Auto-set SIM type: if only one variant for this storage, use it; otherwise reset
                            const variants = product.storageVariants!.filter(sv =>
                              sv.storage.toLowerCase() === storage.toLowerCase()
                            );
                            if (variants.length === 1) {
                              setSelectedSimType(variants[0].simType as "esim" | "physical");
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
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
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
                </div>

                {/* SIM type row — only shown when multiple sim types exist for selected storage */}
                {simTypeOptions.length > 1 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">
                      SIM Type: <strong className="text-on-surface">{selectedSimType === "esim" ? "eSIM" : "Physical SIM"}</strong>
                    </span>
                    <div className="flex gap-2 flex-wrap">
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
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            selectedSimType === st
                              ? "bg-on-surface text-surface border-on-surface"
                              : "bg-surface border-outline/20 text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          {st === "esim" ? "eSIM" : "Physical SIM"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : storageOptions.length > 0 ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">
                  Storage Capacity: <strong className="text-on-surface">{selectedStorage}</strong>
                </span>
                <div className="flex gap-2">
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
                          const sv = product.storageVariants?.find(s => s.storage.toLowerCase() === storage.toLowerCase());
                          if (sv?.warranties?.length) {
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
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
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
            ) : null}

            {/* SIM Type */}
            {availableSimType && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">
                  SIM Type
                </span>
                <div className="flex gap-2">
                  {availableSimType === "both" ? (
                    <>
                      <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-outline/20 text-on-surface">Physical SIM + eSIM</span>
                    </>
                  ) : availableSimType === "esim" ? (
                    <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-outline/20 text-on-surface">eSIM</span>
                  ) : (
                    <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-outline/20 text-on-surface">Physical SIM</span>
                  )}
                </div>
              </div>
            )}

            {/* Warranty Selection */}
            {availableWarranties && availableWarranties.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">
                  Protection Plan
                </span>
                <div className="flex flex-col gap-2">
                  {availableWarranties.map((warranty: Warranty) => {
                    const isSelected = selectedWarranty?.id === warranty.id;
                    return (
                      <button
                        key={warranty.id}
                        onClick={() => setSelectedWarranty(warranty)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs border transition-all ${
                          isSelected
                            ? "bg-primary/5 border-primary text-on-surface"
                            : "bg-surface border-outline/20 text-on-surface-variant hover:border-outline/40"
                        }`}
                        id={`warranty-btn-${warranty.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? "border-primary bg-primary" : "border-outline/40"
                          }`}>
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="text-left">
                            <span className="font-semibold text-on-surface">{warranty.name}</span>
                            <span className="ml-2 text-[10px] text-on-surface-variant/70">{warranty.duration}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector and CTA */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex items-center bg-surface-container-low border border-outline/20 rounded-full w-fit">
                <button
                  onClick={handleDecreaseQty}
                  className="p-2.5 px-4 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}
                  aria-label="Decrease detail qty"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm px-3 text-on-surface min-w-[24px] text-center">{quantity}</span>
                <button
                  onClick={handleIncreaseQty}
                  className="p-2.5 px-4 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label="Increase detail qty"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCartClick}
                disabled={!product.inStock}
                className="flex-1 py-3.5 px-6 rounded-full text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed glass-btn-ios-primary"
                id="add-to-cart-detail-btn"
              >
                {product.inStock ? "Add to Cart" : "Temporarily Sold Out"}
              </button>
            </div>

            {/* Price Tracker Monitor Card */}
            <div className="mt-8 p-5 rounded-2xl bg-surface-container-low border border-outline/10 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <span>Price Alert</span>
                    <span className="flex items-center text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-normal">
                      <TrendingDown className="w-2.5 h-2.5 mr-0.5 text-green-600" />
                      Active
                    </span>
                  </h4>
                  <p className="text-[11px] text-on-surface-variant/80 leading-relaxed">
                    Enter your email to receive an instant system notification when the price of the <strong>{product.name}</strong> drops below its current value of <strong>{formatProductPrice(product)}</strong>.
                  </p>
                </div>
              </div>

              <form onSubmit={handleTrackPrice} className="flex gap-2 items-center">
                <input
                  type="email"
                  value={trackerEmail}
                  onChange={(e) => setTrackerEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-outline/15 bg-surface text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans"
                  disabled={trackerStatus === "submitting"}
                  required
                />
                <button
                  type="submit"
                  disabled={trackerStatus === "submitting"}
                  className="px-4 py-2 text-xs font-bold rounded-xl cursor-pointer select-none disabled:opacity-50 glass-btn-ios-primary"
                >
                  {trackerStatus === "submitting" ? "Setting up..." : "Monitor Price"}
                </button>
              </form>

              {trackerMessage && (
                <div className={`p-2.5 rounded-xl text-[11px] font-bold ${
                  trackerStatus === "success" 
                    ? "bg-green-50 text-green-700 border border-green-100" 
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                  {trackerMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs segment: Specifications & Customer Reviews */}
      <div className="border-t border-outline/10 pt-10 text-left">
        <div className="flex border-b border-outline/10 gap-6 text-sm font-semibold mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Specification table */}
              <div className="border border-outline/10 rounded-2xl overflow-hidden bg-surface-container-low">
                <table className="w-full text-xs text-left border-collapse">
                  <tbody>
                    {product.specifications ? (
                      Object.entries(product.specifications).map(([key, value], idx) => (
                        <tr 
                          key={key} 
                          className={`border-b border-outline/5 ${idx % 2 === 0 ? "bg-white/40" : "bg-transparent"}`}
                        >
                          <th className="py-3.5 px-4 font-bold text-on-surface-variant/80 w-1/3 border-r border-outline/5">{key}</th>
                          <td className="py-3.5 px-4 text-on-surface font-medium">{value}</td>
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
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Review Stats and Add Review Form */}
              <div className="lg:col-span-5 space-y-6 bg-surface-container-low border border-outline/10 p-6 rounded-3xl">
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-base text-on-surface">Customer Reviews</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-on-surface font-display">{averageRating}</span>
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
                <form onSubmit={handleAddReview} className="space-y-4 pt-4 border-t border-outline/10" id="write-review-form">
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
                          <Star className={`w-6 h-6 ${val <= formRating ? "fill-amber-500" : "text-gray-300"}`} />
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
              <div className="lg:col-span-7 space-y-4">
                {reviewsList.map((review) => (
                  <div 
                    key={review.id} 
                    className="p-4 bg-surface-container-low border border-outline/10 rounded-2xl space-y-2 transition-shadow hover:shadow-xs"
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
                        <h4 className="font-display font-bold text-sm text-on-surface">
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

                    <p className="text-xs text-on-surface-variant/90 leading-relaxed">
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
                  <div className="aspect-square rounded-2xl bg-surface-container-low overflow-hidden border border-outline/10 mb-2">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
