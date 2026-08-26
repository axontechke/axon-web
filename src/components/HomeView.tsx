import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, Star, Cpu, ShieldCheck, Heart, Zap, Laptop, Tablet, Headphones, Smartphone, Layers, Plug, ChevronLeft, ChevronRight, Pause } from "lucide-react";
import { Product, formatProductPrice, CURRENCY_SYMBOL } from "../types";
import { GoogleReviewsWidget } from "./GoogleReviewsWidget";

interface HomeViewProps {
  onSelectProduct: (product: Product) => void;
  onNavigateToCatalog: (category?: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  products?: Product[];
  config?: any;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectProduct,
  onNavigateToCatalog,
  onAddToCart,
  products = [],
  config,
}) => {
  // Get highlighted products
  const featuredHeroProduct = products[0];

  const categoriesList = useMemo(() => {
    const list = config?.categoriesList;
    const iconMap: Record<string, any> = {
      Laptop: Laptop,
      Tablet: Tablet,
      Headphones: Headphones,
      Smartphone: Smartphone,
      Layers: Layers,
      Plug: Plug,
    };
    if (Array.isArray(list) && list.length > 0) {
      return list.filter((c: any) => c?.name).map((c: any) => ({
        ...c,
        icon: iconMap[c.icon] || Layers
      }));
    }
    return [
      { name: "Tablets", icon: Tablet, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0" },
      { name: "Laptops", icon: Laptop, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853" },
      { name: "Audio", icon: Headphones, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" },
      { name: "Power Banks", icon: Plug, image: "https://images.unsplash.com/photo-1609592806598-94d6b1589da2" },
      { name: "Accessories", icon: Layers, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3" }
    ];
  }, [config?.categoriesList]);

  // Detect Mobile Width
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hero Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideInterval, setSlideInterval] = useState(4000); // Default 4s for non-video slides

  const heroSlides = useMemo(() => {
    const list = config?.heroSlides;
    const iconMap: Record<string, any> = {
      Cpu: Cpu,
      Zap: Zap,
      ShieldCheck: ShieldCheck,
      Laptop: Laptop,
      Tablet: Tablet,
      Headphones: Headphones,
      Smartphone: Smartphone,
      Layers: Layers,
      Plug: Plug,
    };

    let source = Array.isArray(list) ? [...list] : [];

    // Ensure at least 1 slide to avoid rendering issues
    if (source.length === 0) {
      source.push({ id: "default_slide" });
    }

    return source.map((slide: any) => {
      // Resolve actions
      let primaryAction = () => {
        const found = products.find(p => p.id === slide.primaryActionValue);
        if (found) {
          onSelectProduct(found);
        } else {
          onNavigateToCatalog("All");
        }
      };
      if (slide.primaryActionTarget === "category") {
        primaryAction = () => onNavigateToCatalog(slide.primaryActionValue || "All");
      }

      let secondaryAction = () => onNavigateToCatalog("All");
      if (slide.secondaryActionTarget === "product") {
        secondaryAction = () => {
          const found = products.find(p => p.id === slide.secondaryActionValue);
          if (found) onSelectProduct(found);
        };
      } else if (slide.secondaryActionTarget === "category") {
        secondaryAction = () => onNavigateToCatalog(slide.secondaryActionValue || "All");
      }

      // Resolve effective media — global config-level override URL takes precedence over product default media
      const useOverride = config?.heroMediaOverrideEnabled && config?.heroMediaOverrideUrl;
      const effectiveMediaType = useOverride ? (config?.heroMediaOverrideType || "image") : slide.mediaType;
      const effectiveMediaUrl = useOverride ? config?.heroMediaOverrideUrl : slide.mediaUrl;
      const effectiveMediaEmbed = useOverride ? config?.heroMediaOverrideUrl : slide.mediaEmbed;
      const effectiveMobileMediaUrl = useOverride ? config?.heroMediaOverrideUrl : slide.mobileMediaUrl;
      const effectiveMobileMediaEmbed = useOverride ? config?.heroMediaOverrideUrl : slide.mobileMediaEmbed;

      // The connected product drives the click-through link in override mode
      // Use global heroTargetProduct as the link target for the override
      const linkedProductId = config?.heroTargetProduct || slide.targetProductId;
      const linkedProduct = linkedProductId
        ? products.find(p => p.id === linkedProductId)
        : null;
      const linkedProductAction = linkedProduct
        ? () => onSelectProduct(linkedProduct)
        : () => onNavigateToCatalog("All");

      return {
        ...slide,
        tagIcon: iconMap[slide.tagIcon] || Cpu,
        primaryAction,
        secondaryAction,
        effectiveMediaType,
        effectiveMediaUrl,
        effectiveMediaEmbed,
        effectiveMobileMediaUrl,
        effectiveMobileMediaEmbed,
        linkedProductAction
      };
    });
  }, [config, products, featuredHeroProduct]);

  const activeSlide = heroSlides[currentSlide] || heroSlides[0];

  // Update slide interval based on active slide media type
  useEffect(() => {
    if (activeSlide?.mediaType === "video") {
      // Videos will set their own interval via onLoadedMetadata
      // Start with a conservative estimate, will update when video loads
      setSlideInterval(5000);
    } else {
      setSlideInterval(4000);
    }
  }, [currentSlide, activeSlide?.mediaType]);

  useEffect(() => {
    if (isPaused || heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, slideInterval);
    return () => clearInterval(timer);
  }, [isPaused, heroSlides, slideInterval]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const TagIcon = activeSlide?.tagIcon || Cpu;

  const isMediaOnly = config?.heroMode === "media-only";

  const handleMediaOnlyCTA = () => {
    // Use the override-linked product when heroMediaOverride is active, else fall back to targetProductId
    if (activeSlide?.linkedProductAction) {
      activeSlide.linkedProductAction();
    } else {
      const slideTargetProductId = activeSlide?.targetProductId || config?.heroTargetProduct || "axon-phone-1-pro";
      const found = products.find(p => p.id === slideTargetProductId);
      if (found) {
        onSelectProduct(found);
      } else {
        onNavigateToCatalog("All");
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8 lg:space-y-12 animate-in fade-in duration-300" id="home-view-container">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 mt-1 sm:mt-4" id="hero-section">
        {!config ? null : ((config?.heroMediaOverrideEnabled && config?.heroMediaOverrideUrl) || activeSlide?.effectiveMediaType === "video" || activeSlide?.effectiveMediaType === "embed") ? (
          (() => {
            const slideTargetProductId = activeSlide?.targetProductId || config?.heroTargetProduct || "axon-phone-1-pro";
            const highlightedProduct = products.find(p => p.id === slideTargetProductId) || products[0];
            return (
              <div
                className="relative bg-black rounded-3xl overflow-hidden border border-outline/10 h-[250px] sm:h-[500px] md:h-[550px] lg:h-[600px] flex flex-col justify-end p-4 sm:p-8 lg:p-12 shadow-2xl group transition-all duration-500"
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
              >
                {/* Cinematic Background Media Container */}
                <div className="absolute inset-0 z-0 select-none overflow-hidden" key={`media-only-bg-${activeSlide?.id}`}>
                  {(config?.heroMediaOverrideEnabled && config?.heroMediaOverrideUrl) ? (
                    config?.heroMediaOverrideType === "embed" ? (
                      <div
                        key={config?.heroMediaOverrideUrl}
                        className="absolute inset-0 w-full h-full select-none overflow-hidden hero-embed-container"
                        dangerouslySetInnerHTML={{ __html: config?.heroMediaOverrideUrl }}
                      />
                    ) : config?.heroMediaOverrideType === "video" ? (
                      <video
                        src={config?.heroMediaOverrideUrl}
                        className="w-full h-full object-contain opacity-90 transition-opacity duration-700"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedMetadata={(e) => {
                          const video = e.currentTarget;
                          if (video.duration && isFinite(video.duration)) {
                            setSlideInterval(Math.ceil(video.duration * 1000) + 500);
                          }
                        }}
                      />
                    ) : (
                      <img
                        src={config?.heroMediaOverrideUrl}
                        alt="Hero media"
                        className="w-full h-full object-contain opacity-90 transition-opacity duration-700"
                        referrerPolicy="no-referrer"
                      />
                    )
                  ) : activeSlide?.effectiveMediaType === "embed" ? (
                    <div
                      key={activeSlide?.effectiveMediaEmbed || activeSlide?.effectiveMediaUrl}
                      className="absolute inset-0 w-full h-full select-none overflow-hidden hero-embed-container"
                      dangerouslySetInnerHTML={{
                        __html: activeSlide?.effectiveMediaEmbed || activeSlide?.effectiveMediaUrl
                      }}
                    />
                  ) : activeSlide?.effectiveMediaType === "video" ? (
                    <video
                      src={activeSlide?.effectiveMediaUrl}
                      className="w-full h-full object-contain opacity-90 transition-opacity duration-700"
                      autoPlay
                      loop
                      muted
                      playsInline
                      onLoadedMetadata={(e) => {
                        const video = e.currentTarget;
                        if (video.duration && isFinite(video.duration)) {
                          setSlideInterval(Math.ceil(video.duration * 1000) + 500);
                        }
                      }}
                    />
                  ) : (
                    <img
                      src={activeSlide?.effectiveMediaUrl}
                      alt={activeSlide?.mediaAlt || activeSlide?.title}
                      className="w-full h-full object-contain opacity-90 transition-opacity duration-700"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {/* Subtle top/bottom gradient overlay for high-end cinematic appearance */}
                  <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/85 via-black/40 to-black/10 pointer-events-none" />
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
                </div>

                {/* Ultra-Clean Floating Device Pill Overlay */}
                {highlightedProduct && (
                  <div className="absolute bottom-4 left-4 right-auto sm:left-6 sm:bottom-6 z-10 flex flex-row items-center justify-between bg-black/60 backdrop-blur-xl border border-white/10 p-2.5 pr-3 sm:py-3 sm:px-6 rounded-full gap-3 sm:gap-6 shadow-2xl max-w-[85%] sm:max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-500" key={`pill-${activeSlide?.id}`}>
                    <div className="text-left space-y-0.5 sm:space-y-1 overflow-hidden">
                      <span className="text-[7px] sm:text-[9px] uppercase tracking-widest text-white/50 font-bold block font-mono truncate">
                        {activeSlide?.tag || "Featured Device"}
                      </span>
                      <h2 className="font-display font-extrabold text-[11px] sm:text-base text-white tracking-tight leading-tight truncate">
                        {highlightedProduct.name}
                      </h2>
                      <p className="text-emerald-400 font-mono font-black text-[9px] sm:text-sm">
                        {formatProductPrice(highlightedProduct)}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleMediaOnlyCTA}
                      className="shrink-0 w-auto px-3 sm:px-5 py-1.5 sm:py-2.5 bg-white hover:bg-white/90 text-black active:scale-95 rounded-full text-[9px] sm:text-xs font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-lg animate-in fade-in duration-300"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                )}

                {/* Glassy Floating Navigation Controls for Cinematic Mode */}
                {heroSlides.length > 1 && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 py-1.5 px-3 rounded-full shadow-lg">
                    <div className="flex items-center gap-1">
                      {heroSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDotClick(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === currentSlide ? "w-5 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <div className="h-4 w-px bg-white/15" />
                    <div className="flex gap-1">
                      <button
                        onClick={handlePrevSlide}
                        className="p-1 rounded-lg hover:bg-white/10 text-white/75 hover:text-white transition-colors"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleNextSlide}
                        className="p-1 rounded-lg hover:bg-white/10 text-white/75 hover:text-white transition-colors"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        ) : isMediaOnly ? (
          // Mobile Video Overlay Layout - video takes full width, details overlay on top
          <div
            className="relative h-[160px] sm:h-[520px]"
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Full-bleed video background */}
            <div className="absolute inset-0 z-0" key={`mobile-video-${activeSlide?.id}`}>
              {(config?.heroMediaOverrideEnabled && config?.heroMediaOverrideUrl) ? (
                config?.heroMediaOverrideType === "video" ? (
                  <video
                    src={config?.heroMediaOverrideUrl}
                    className="w-full h-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      if (video.duration && isFinite(video.duration)) {
                        setSlideInterval(Math.ceil(video.duration * 1000) + 500);
                      }
                    }}
                  />
                ) : config?.heroMediaOverrideType === "embed" ? (
                  <div className="absolute inset-0 w-full h-full select-none overflow-hidden hero-embed-container" dangerouslySetInnerHTML={{ __html: config?.heroMediaOverrideUrl }} />
                ) : (
                  <img src={config?.heroMediaOverrideUrl} alt="Hero media" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                )
              ) : (
                <video
                  src={activeSlide?.effectiveMediaType === "video" ? activeSlide?.effectiveMediaUrl : undefined}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    if (video.duration && isFinite(video.duration)) {
                      setSlideInterval(Math.ceil(video.duration * 1000) + 500);
                    }
                  }}
                />
              )}
              {/* Tiny gradient strip at very bottom */}
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Minimal dots-only bar at very bottom */}
            {heroSlides.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-10 px-2 pb-1">
                <div className="flex items-center justify-center gap-0.5">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDotClick(idx)}
                      className={`h-0.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? "w-2 bg-white" : "w-0.5 bg-white/20"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Default layout for non-video or desktop
          <div
            className="relative bg-surface-container-low rounded-3xl overflow-hidden border border-outline/10 min-h-[210px] sm:min-h-[350px] lg:min-h-[340px]"
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Full-bleed background media */}
            <div className="absolute inset-0 z-0 select-none overflow-hidden" key={`bg-media-${activeSlide?.id}`}>
              {(config?.heroMediaOverrideEnabled && config?.heroMediaOverrideUrl) ? (
                config?.heroMediaOverrideType === "embed" ? (
                  <div className="absolute inset-0 w-full h-full select-none overflow-hidden hero-embed-container opacity-25 dark:opacity-35" dangerouslySetInnerHTML={{ __html: config?.heroMediaOverrideUrl }} />
                ) : config?.heroMediaOverrideType === "video" ? (
                  <video src={config?.heroMediaOverrideUrl} className="w-full h-full object-contain opacity-25 dark:opacity-35 scale-102 transition-transform duration-1000" autoPlay loop muted playsInline onLoadedMetadata={(e) => { const video = e.currentTarget; if (video.duration && isFinite(video.duration)) { setSlideInterval(Math.ceil(video.duration * 1000) + 500); } }} />
                ) : (
                  <img src={config?.heroMediaOverrideUrl} alt="Hero media" className="w-full h-full object-contain opacity-25 dark:opacity-35 scale-102 transition-transform duration-1000" referrerPolicy="no-referrer" />
                )
              ) : activeSlide?.effectiveMediaType === "embed" ? (
                <div className="absolute inset-0 w-full h-full select-none overflow-hidden hero-embed-container opacity-25 dark:opacity-35" dangerouslySetInnerHTML={{ __html: activeSlide?.effectiveMediaEmbed || activeSlide?.effectiveMediaUrl }} />
              ) : activeSlide?.effectiveMediaType === "video" ? (
                <video src={activeSlide?.effectiveMediaUrl} className="w-full h-full object-contain opacity-25 dark:opacity-35 scale-102 transition-transform duration-1000" autoPlay loop muted playsInline onLoadedMetadata={(e) => { const video = e.currentTarget; if (video.duration && isFinite(video.duration)) { setSlideInterval(Math.ceil(video.duration * 1000) + 500); } }} />
              ) : (
                <img src={activeSlide?.effectiveMediaUrl} alt={activeSlide?.mediaAlt || activeSlide?.title} className="w-full h-full object-contain opacity-25 dark:opacity-35 scale-102 transition-transform duration-1000" referrerPolicy="no-referrer" />
              )}
              {/* Glass & Gradient overlays for dynamic high-end typography legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-surface-container-low/95 to-surface-container-low/40 md:from-surface-container-low via-surface-container-low/90 lg:to-surface-container-low/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/95 via-transparent to-transparent md:hidden" />
              <div className="absolute inset-0 bg-radial-gradient from-primary/5 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-8 p-3 sm:p-8 lg:p-10 items-center min-h-[160px] sm:min-h-[350px] lg:min-h-[340px]">
              {/* Hero Text Content */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-2.5 sm:space-y-4 text-left flex flex-col justify-center h-full">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 sm:py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed text-[8px] sm:text-[10px] font-semibold tracking-wide w-fit animate-in fade-in slide-in-from-top-1 duration-300" key={`tag-${activeSlide?.id}`}>
                  <TagIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                  <span>{activeSlide?.tag || config?.announcement?.slice(0, 30) || "AXON TECH"}</span>
                </div>

                <h1 className="font-display font-black text-lg sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl text-on-surface leading-tight tracking-tight flex items-center animate-in fade-in slide-in-from-left-2 duration-400" key={`title-${activeSlide?.id}`}>
                  {activeSlide?.title || config?.heroTitle || "Tech Gadgets & Accessories"}
                </h1>

                <p className="text-on-surface-variant/85 text-[10px] sm:text-sm leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none flex items-center animate-in fade-in slide-in-from-left-2 duration-500" key={`desc-${activeSlide?.id}`}>
                  {activeSlide?.description || config?.heroDescription || "Phones, tablets, laptops, earphones and more. Genuine products, fast delivery across Kenya, and warranty included."}
                </p>

                <div className="flex flex-wrap gap-1.5 sm:gap-3 pt-0.5 sm:pt-1">
                  <button
                    onClick={activeSlide?.secondaryAction}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-2 cursor-pointer glass-btn-ios-primary"
                    id="hero-cta-primary"
                  >
                    Explore
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                {/* Quick trust markers & controls */}
                <div className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-outline/10">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-on-surface-variant/80 text-[8px] sm:text-[10px] font-medium">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                      <span>3-Year Warranty</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                      <span>Secure Logistics</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                      <span>4.8/5 Rating</span>
                    </div>
                  </div>

                  {/* Carousel Controllers */}
                  {heroSlides.length > 1 && (
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-1">
                        {heroSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleDotClick(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              idx === currentSlide ? "w-5 sm:w-6 bg-primary" : "w-1.5 bg-outline/20 hover:bg-outline/40"
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                      <div className="h-4 w-px bg-outline/10 mx-1" />
                      <div className="flex gap-1">
                        <button
                          onClick={handlePrevSlide}
                          className="p-1 rounded-lg border border-outline/10 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleNextSlide}
                          className="p-1 rounded-lg border border-outline/10 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right-side Media Showcase */}
              <div className="flex lg:col-span-5 w-full items-center justify-center">
                <div
                  className="relative w-full max-w-sm lg:max-w-md aspect-[16/10] sm:aspect-[4/3] lg:aspect-[1.4] rounded-2xl overflow-hidden bg-surface-container-high/60 border border-outline/15 shadow-lg group/media animate-in fade-in zoom-in-95 duration-500"
                  key={`media-${activeSlide?.id}`}
                >
                  {(config?.heroMediaOverrideEnabled && config?.heroMediaOverrideUrl) ? (
                    config?.heroMediaOverrideType === "embed" ? (
                      <div className="absolute inset-0 w-full h-full select-none overflow-hidden hero-embed-container" dangerouslySetInnerHTML={{ __html: config?.heroMediaOverrideUrl }} />
                    ) : config?.heroMediaOverrideType === "video" ? (
                      <video src={config?.heroMediaOverrideUrl} className="w-full h-full object-contain select-none" autoPlay loop muted playsInline key={`hero-video-override`} />
                    ) : (
                      <img src={config?.heroMediaOverrideUrl} alt="Hero media" className="w-full h-full object-contain select-none" key={`hero-img-override`} referrerPolicy="no-referrer" />
                    )
                  ) : activeSlide?.effectiveMediaType === "embed" ? (
                    <div
                      className="absolute inset-0 w-full h-full select-none overflow-hidden hero-embed-container"
                      dangerouslySetInnerHTML={{ __html: activeSlide?.effectiveMediaEmbed || activeSlide?.effectiveMediaUrl }}
                    />
                  ) : activeSlide?.effectiveMediaType === "video" ? (
                    <video
                      src={activeSlide?.effectiveMediaUrl}
                      className="w-full h-full object-contain select-none"
                      autoPlay
                      loop
                      muted
                      playsInline
                      key={`hero-video-${activeSlide?.id}`}
                    />
                  ) : (
                    <img
                      src={activeSlide?.effectiveMediaUrl}
                      alt={activeSlide?.mediaAlt || activeSlide?.title}
                      className="w-full h-full object-contain select-none"
                      key={`hero-img-${activeSlide?.id}`}
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Micro glass tag displaying active device specs / capabilities */}
                  <div className="absolute bottom-3 right-3 z-10 bg-surface/85 backdrop-blur-md border border-outline/10 px-3 py-1.5 rounded-xl shadow-md text-right max-w-[200px]">
                    <div className="text-[10px] font-black text-primary uppercase tracking-wide truncate">{activeSlide?.overlayTitle}</div>
                    <div className="text-[8px] text-on-surface-variant font-medium leading-tight truncate">{activeSlide?.overlayDesc}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Curated Categories */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-3 sm:space-y-4" id="curated-categories">
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">Shop by Category</span>
              <span className="px-1.5 py-0.2 rounded text-[7px] font-bold bg-primary/10 text-primary uppercase tracking-wide">Live</span>
            </div>
            <h2 className="font-display font-black text-lg sm:text-xl text-on-surface tracking-tight">Browse Products</h2>
            <p className="text-[10px] sm:text-xs text-on-surface-variant/70">Find the perfect tech for your needs.</p>
          </div>
          <button 
            onClick={() => onNavigateToCatalog("All")}
            className="text-primary hover:text-primary-hover font-semibold text-xs flex items-center gap-1 group whitespace-nowrap"
          >
            All categories <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="flex overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-6 gap-3 md:gap-4 snap-x snap-mandatory">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => onNavigateToCatalog(cat.name)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-outline/15 bg-surface-container p-3 sm:p-4 hover:border-primary/45 hover:shadow-md transition-all text-left min-w-[125px] sm:min-w-0 w-32 sm:w-full h-24 sm:h-36 active:scale-98 shadow-xs shrink-0 snap-start"
              >
                {/* Background image with high-end overlay */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 opacity-30 dark:opacity-45"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/80 to-transparent group-hover:via-surface-container/70 transition-all" />
                </div>

                {/* Top: Icon and Action indicator */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-1 rounded-full border border-outline/10 bg-surface/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-300">
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </div>
                </div>
                
                {/* Bottom: Text Content */}
                <div className="relative z-10 space-y-0.5">
                  <h3 className="font-display font-bold text-xs text-on-surface tracking-tight group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-on-surface-variant/70 leading-normal truncate max-w-[110px] sm:max-w-[130px]">
                    {cat.name === "Axon Slate Series" ? "Liquid Infinity screens" :
                     cat.name === "Axon Books" ? "Aerospace alloys performance" :
                     cat.name === "Axon Studio Audio" ? "Adaptive isolation Pure DAC" :
                     cat.name === "Continuous Power Banks" ? "Continuous wireless power" :
                     cat.name === "Click Keyboards & Gear" ? "Modular engineered tools" :
                     cat.desc || ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Bento Grid: Trending Now */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-6" id="trending-bento-section">
        <div className="space-y-1">
          <h2 className="font-display font-black text-2xl text-on-surface tracking-tight">New Arrivals</h2>
          <p className="text-xs text-on-surface-variant/70">What others in our community are actively configuring.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6">
          {(() => {
            const trendingList = [
              {
                productId: config?.trendingSlot1Product || "axon-buds-pro",
                tag: config?.trendingSlot1Tag || "Best Seller",
                description: config?.trendingSlot1Desc || "Experience clinical-grade hybrid noise cancellation. Beautiful teal and metal-finished pods that sit weightlessly for endless acoustic luxury."
              },
              {
                productId: config?.trendingSlot2Product || "power-capsule-v2",
                tag: config?.trendingSlot2Tag || "Power Stage",
                description: config?.trendingSlot2Desc || "Supercharged portable power bay with dual induction docks."
              },
              {
                productId: config?.trendingSlot3Product || "axon-book-16",
                tag: config?.trendingSlot3Tag || "NEW RELEASE",
                description: config?.trendingSlot3Desc || "The absolute peak of desktop processing, configured as a premium laptop."
              },
              {
                productId: config?.trendingSlot4Product || "axon-audio-engine",
                tag: config?.trendingSlot4Tag || "Professional Studio Stage",
                description: config?.trendingSlot4Desc || "Engineered with high-end digital-to-analog converters and integrated studio level sound processing filters. Impeccable acoustics for producers."
              }
            ];

            return trendingList.map((slotItem, idx) => {
              const prod = products.find(p => p.id === slotItem.productId) || products[0];
              if (!prod) return null;
              const isLarge = idx === 0 || idx === 3;
              const colSpanClass = isLarge ? "col-span-2 md:col-span-8" : "col-span-1 md:col-span-4";
              const flexClass = isLarge ? "flex-col md:flex-row items-center justify-between" : "flex-col justify-between";

              return (
                <div 
                  key={idx}
                  onClick={() => onSelectProduct(prod)}
                  className={`${colSpanClass} bg-surface-container-low border border-outline/10 rounded-2xl md:rounded-[32px] p-4 sm:p-6 md:p-8 flex ${flexClass} gap-4 sm:gap-6 cursor-pointer group transition-all hover:shadow-md text-left`}
                >
                  <div className={`space-y-2 sm:space-y-4 text-left ${isLarge ? "max-w-sm shrink-0" : ""}`}>
                    <div className="inline-block bg-primary-fixed text-on-primary-fixed font-bold text-[9px] sm:text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {slotItem.tag}
                    </div>
                    <h3 className={`font-display font-extrabold ${isLarge ? "text-lg sm:text-2xl" : "text-sm sm:text-lg"} text-on-surface leading-tight group-hover:text-primary transition-colors`}>
                      {prod.name}
                    </h3>
                    <p className={`${isLarge ? "text-[11px] sm:text-xs" : "text-[9px] sm:text-[10px]"} text-on-surface-variant/80 leading-relaxed`}>
                      {slotItem.description || prod.description}
                    </p>
                    {isLarge && (
                      <div className="text-sm sm:text-base font-bold text-primary">
                        {formatProductPrice(prod)}
                      </div>
                    )}
                    {isLarge && (
                      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-primary font-bold group-hover:gap-2 transition-all">
                        Configure now <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  
                  <div className="relative w-full flex justify-center items-center bg-white rounded-2xl">
                    {!isLarge && <div className="absolute w-20 sm:w-32 h-20 sm:h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />}
                    {isLarge && <div className="absolute w-32 sm:w-44 h-32 sm:h-44 rounded-full bg-primary/5 blur-2xl pointer-events-none" />}
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className={`${isLarge ? "w-32 h-32 sm:w-48 sm:h-48" : "w-20 h-20 sm:w-32 sm:h-32"} object-contain transition-transform duration-500 group-hover:scale-105`}
                    />
                  </div>

                  {!isLarge && (
                    <div className="flex justify-between items-center pt-2 border-t border-outline/10 w-full mt-2">
                      <span className="text-xs sm:text-sm font-bold text-on-surface">{formatProductPrice(prod)}</span>
                      <span className="text-[10px] sm:text-xs text-primary font-bold">Add +</span>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </section>

      {/* Featured Spotlight Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-6" id="spotlight-section">
        <div className="text-center space-y-1.5">
          <h2 className="font-display font-black text-2xl text-on-surface tracking-tight">
            {config?.spotlightTitle || "The Catalog Spotlight"}
          </h2>
          <p className="text-[11px] text-on-surface-variant/70 max-w-md mx-auto">
            {config?.spotlightDescription || "Each product designed with absolute form-factor alignment and state-of-the-art durability."}
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
          {(() => {
            const list = config?.spotlightProducts;
            const finalProducts = (Array.isArray(list) && list.length > 0)
              ? (list.map((id: string) => products.find(p => p.id === id)).filter(Boolean) as Product[])
              : products.filter(p => p.rating >= 4.7).slice(0, 5);

            return finalProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-xl md:rounded-[24px] border border-outline/10 p-2 sm:p-3 flex flex-col justify-between group transition-all hover:shadow-xs"
                id={`spotlight-${product.id}`}
              >
                <div 
                  onClick={() => onSelectProduct(product)}
                  className="cursor-pointer space-y-2 text-left"
                >
                  {/* Product Image Stage */}
                  <div className="relative h-24 sm:h-28 md:h-36 rounded-lg md:rounded-2xl bg-white flex items-center justify-center p-2 overflow-hidden border border-outline/5">
                    {product.isNew && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-primary text-white text-[6px] md:text-[8px] font-bold uppercase tracking-wider">
                        New
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-on-surface text-surface text-[6px] md:text-[8px] font-bold uppercase tracking-wider">
                        Best
                      </span>
                    )}
                    
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-103"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-0.5">
                    <div className="text-[8px] md:text-[10px] font-medium text-on-surface-variant/60">{product.category}</div>
                    <h3 className="font-display font-bold text-[10px] sm:text-xs md:text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-0.5">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${i < Math.floor(product.rating) ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[8px] font-medium text-on-surface-variant/70">({product.reviewsCount})</span>
                    </div>
                  </div>
                </div>

                {/* Price & Add Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 mt-2 border-t border-outline/5">
                  <span className="font-bold text-[10px] sm:text-xs md:text-sm text-on-surface">{CURRENCY_SYMBOL} {(product.priceKsh || 0).toLocaleString()}</span>
                  <button
                    onClick={() => onAddToCart(product, 1)}
                    className="px-3 py-1.5 rounded-full text-[8px] sm:text-[10px] font-bold text-center cursor-pointer glass-btn-ios"
                    id={`spotlight-add-${product.id}`}
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>
      </section>

      {/* Brand Value Section */}
      <section className="bg-surface-container py-8 px-5 sm:px-8 rounded-[32px] border border-outline/10 max-w-7xl mx-3 sm:mx-6 lg:mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left">
        <div className="space-y-2 max-w-lg">
          <h3 className="font-display font-bold text-base sm:text-xl text-on-surface">
            {config?.protocolTitle || "Why Shop With Us"}
          </h3>
          <p className="text-[10px] sm:text-xs text-on-surface-variant/80 leading-relaxed">
            {config?.protocolDescription || "We deliver across Kenya, offer genuine products with warranty, and our team is just a WhatsApp message away for support."}
          </p>
        </div>
        <div className="flex flex-row gap-3 shrink-0 overflow-x-auto pb-1">
          {(() => {
            const iconMap: Record<string, any> = {
              Zap,
              ShieldCheck,
              Cpu,
              Laptop,
              Tablet,
              Headphones,
              Smartphone,
              Layers,
              Plug,
              Star
            };
            const defaultBadges = [
              { text: "Fast Delivery", icon: "Zap", url: "" },
              { text: "Secure Checkout", icon: "ShieldCheck", url: "" }
            ];
            const badges = (config?.protocolBadges?.length ? config.protocolBadges : defaultBadges) as {text: string; icon: string; url: string}[];
            return badges.map((badge, idx) => {
              const Icon = iconMap[badge.icon] || Zap;
              const badgeEl = (
                <div key={idx} className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-surface-container-lowest rounded-2xl border border-outline/10 text-[10px] sm:text-xs font-semibold text-on-surface whitespace-nowrap shrink-0">
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
                  <span>{badge.text}</span>
                </div>
              );
              return badge.url ? (
                <a key={idx} href={badge.url} target="_blank" rel="noopener noreferrer" className="no-underline">
                  {badgeEl}
                </a>
              ) : badgeEl;
            });
          })()}
        </div>
      </section>

      {/* Google Reviews Widget */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        <GoogleReviewsWidget compact={true} showForm={true} />
      </section>
    </div>
  );
};
