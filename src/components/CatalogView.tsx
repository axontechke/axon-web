import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, SlidersHorizontal, Check, Star, RefreshCw, X, Scale, Plus } from "lucide-react";
import { Product, formatProductPrice } from "../types";

interface CatalogViewProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  products?: Product[];
  config?: any;
}

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

export const CatalogView: React.FC<CatalogViewProps> = ({
  onSelectProduct,
  onAddToCart,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectedBrand,
  setSelectedBrand,
  products = [],
  config,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Product Comparison States
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  useEffect(() => {
    if (compareError) {
      const timer = setTimeout(() => setCompareError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [compareError]);

  const handleToggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        setCompareError("You can select up to 3 products to compare side-by-side.");
        return prev;
      }
      return [...prev, product];
    });
  };

  const isCompared = (productId: string) => {
    return compareList.some((p) => p.id === productId);
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    compareList.forEach((product) => {
      if (product.specifications) {
        Object.keys(product.specifications).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [compareList]);

  const categories = useMemo(() => {
    const customList = config?.categoriesList;
    if (Array.isArray(customList) && customList.length > 0) {
      return ["All", ...customList.map((c: any) => c.name)];
    }
    return ["All", "Laptops", "Tablets", "Audio", "Accessories", "Power", "Phones"];
  }, [config?.categoriesList]);

  // Reset selected category to "All" if it was deleted from configuration categories
  useEffect(() => {
    if (selectedCategory !== "All" && !categories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [categories, selectedCategory, setSelectedCategory]);

  // Dynamically extract brands available for current selected category segment
  const availableBrands = useMemo(() => {
    const productsInCategory = selectedCategory === "All"
      ? products
      : products.filter(p => p.category === selectedCategory);
    
    // Extract unique brands
    const uniqueBrands = Array.from(new Set(productsInCategory.map(p => p.brand).filter(Boolean)));
    return ["All", ...uniqueBrands];
  }, [selectedCategory, products]);

  const handleCategoryToggle = (cat: string) => {
    if (selectedCategory === cat) {
      setSelectedCategory("All");
    } else {
      setSelectedCategory(cat);
    }
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== "All") {
      result = result.filter(p => p.brand === selectedBrand);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // Availability filter
    if (inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    // Max Price filter
    result = result.filter(p => p.price <= maxPrice);

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } // "featured" keeps original order

    return result;
  }, [selectedCategory, selectedBrand, searchQuery, inStockOnly, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setSortBy("featured");
    setInStockOnly(false);
    setMaxPrice(5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 animate-in fade-in duration-200" id="catalog-view-container">
      {/* Header and Summary */}
      <div className="text-left space-y-2 border-b border-outline/10 pb-6">
        <h1 className="font-display font-black text-3xl md:text-4xl text-on-surface tracking-tight">
          Explore the Ecosystem
        </h1>
        <p className="text-xs text-on-surface-variant/80 max-w-xl">
          Configure, synchronize, and extend your hardware layout. Search and organize through our premium products database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Filter Panel (Left, 3-cols) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto bg-surface-container-low border border-outline/10 rounded-3xl p-6 space-y-6 text-left scrollbar-thin">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1"
              id="desktop-reset-btn"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Search Sub-field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant/80 uppercase">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-surface border border-outline/10 rounded-xl py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-primary text-on-surface"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-on-surface-variant/50" />
            </div>
          </div>

          {/* Categories list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">Ecosystem Segment</h4>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <div key={cat} className="space-y-1">
                  <button
                    onClick={() => handleCategoryToggle(cat)}
                    className={`w-full text-left py-2 px-3 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? "bg-primary-fixed/60 text-primary font-bold"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>

                  {/* Sub-brands for the selected category */}
                  {selectedCategory !== "All" && selectedCategory === cat && availableBrands.length > 1 && (
                    <div className="pl-4 pr-1 py-1.5 space-y-1 bg-surface-container/50 rounded-xl border border-outline/5 ml-1.5 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                      <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase block px-1 pb-1">Brands Available:</span>
                      {availableBrands.map((br) => (
                        <button
                          key={br}
                          onClick={() => setSelectedBrand(br)}
                          className={`w-full text-left py-1 px-2 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-between ${
                            selectedBrand === br
                              ? "bg-primary text-white font-bold"
                              : "text-on-surface-variant/80 hover:bg-surface-container hover:text-on-surface"
                          }`}
                        >
                          <span>{br}</span>
                          {selectedBrand === br && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-on-surface-variant/80 uppercase tracking-wider">Max Budget</span>
              <span className="font-bold text-primary">${maxPrice} USD</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary bg-surface-container"
            />
            <div className="flex justify-between text-[9px] text-on-surface-variant/65">
              <span>$50</span>
              <span>$1500+</span>
            </div>
          </div>

          {/* Availability */}
          <div className="pt-2 border-t border-outline/10 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-outline/25 text-primary focus:ring-primary w-4 h-4 accent-primary"
              />
              <span className="text-xs font-medium text-on-surface-variant">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Mobile Filters Trigger / Sorting Bar */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container-low border border-outline/10 p-4 rounded-2xl text-left">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-on-surface-variant" />
              <span className="text-xs font-semibold text-on-surface-variant">
                Showing {filteredProducts.length} results
              </span>
            </div>

            <div className="flex items-center gap-3 justify-between sm:justify-end">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer glass-btn-ios"
                id="mobile-filter-trigger"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter &amp; Search
              </button>

              {/* Sorting Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant/80 hidden sm:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-surface border border-outline/15 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  id="sort-select-catalog"
                >
                  <option value="featured">Ecosystem Choice</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Customer Core</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filter badges */}
          {(selectedCategory !== "All" || selectedBrand !== "All" || searchQuery || inStockOnly || maxPrice < 5000) && (
            <div className="flex flex-wrap gap-2 text-left" id="active-filters-row">
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  Category: {selectedCategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory("All")} />
                </span>
              )}
              {selectedBrand !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  Brand: {selectedBrand}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrand("All")} />
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  Keyword: &quot;{searchQuery}&quot;
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  In Stock Only
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
                </span>
              )}
              {maxPrice < 5000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  Under ${maxPrice}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxPrice(1500)} />
                </span>
              )}
            </div>
          )}

          {/* Dynamic Brands Filter Bar */}
          {selectedCategory !== "All" && availableBrands.length > 2 && (
            <div className="bg-surface-container-low border border-outline/10 p-4 rounded-2xl text-left space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wider">
                  Filter by Brand ({selectedCategory} Segment)
                </span>
                {selectedBrand !== "All" && (
                  <button
                    onClick={() => setSelectedBrand("All")}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Clear Brand
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedBrand === brand
                        ? "bg-primary text-white shadow-xs scale-102 font-bold"
                        : "bg-surface border border-outline/10 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty Catalog State */}
          {filteredProducts.length === 0 ? (
            <div className="bg-surface-container-low rounded-3xl p-16 text-center space-y-4 border border-outline/10">
              <SlidersHorizontal className="w-12 h-12 text-on-surface-variant/40 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-on-surface">No hardware matches your filters</h3>
                <p className="text-xs text-on-surface-variant/70 max-w-sm mx-auto">
                  Try adjusting your budget, clearing search queries, or checking different categories.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer glass-btn-ios-primary"
                id="catalog-reset-btn"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-surface-container-low rounded-3xl border border-outline/10 p-4 flex flex-col justify-between group transition-all hover:shadow-sm"
                  id={`product-card-${product.id}`}
                >
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="cursor-pointer space-y-4 text-left"
                  >
                    {/* Image */}
                    <div className="relative h-48 rounded-2xl bg-[#f5f5f5] flex items-center justify-center p-4 border border-outline/5 overflow-hidden">
                      {product.isNew && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-primary text-white text-[8px] font-bold uppercase tracking-wider">
                          New Release
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-red-600 text-white text-[8px] font-bold uppercase tracking-wider">
                          Out of Stock
                        </span>
                      )}

                      {/* Compare Toggle Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCompare(product);
                        }}
                        className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-xl transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                          isCompared(product.id)
                            ? "bg-primary text-white border-primary shadow-xs scale-105"
                            : "bg-surface/90 hover:bg-surface text-on-surface hover:text-primary border-outline/20 shadow-xs"
                        }`}
                        title={isCompared(product.id) ? "Remove from Compare" : "Add to Compare"}
                        id={`compare-toggle-${product.id}`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold px-0.5">
                          {isCompared(product.id) ? "Compared" : "Compare"}
                        </span>
                      </button>
                      
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-103"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-medium text-on-surface-variant/60">
                        <span className="font-bold text-primary">{product.brand}</span>
                        <span>•</span>
                        <span>{product.category}</span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-amber-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant/75">({product.reviewsCount})</span>
                      </div>

                      <p className="text-[11px] text-on-surface-variant/70 leading-relaxed line-clamp-2 pt-1">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline/10">
                    <span className="font-bold text-xs text-on-surface">{formatProductPrice(product)}</span>
                    {product.inStock ? (
                      <button
                        onClick={() => onAddToCart(product, 1)}
                        className="px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer glass-btn-ios"
                        id={`catalog-add-${product.id}`}
                      >
                        Quick Add +
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-on-surface-variant/50">Sold Out</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" id="mobile-filter-modal">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-surface border-l border-outline/10 flex flex-col p-6 space-y-6 text-left shadow-2xl animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between border-b border-outline/10 pb-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <span>Filters</span>
                </h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-full hover:bg-surface-container">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              {/* Reset inside mobile */}
              <button
                onClick={() => {
                  handleResetFilters();
                  setShowMobileFilters(false);
                }}
                className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-semibold text-on-surface flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset all filters
              </button>

               {/* Categories list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-wider">Ecosystem Segment</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat} className="space-y-1">
                      <button
                        onClick={() => {
                          handleCategoryToggle(cat);
                        }}
                        className={`w-full text-left py-2 px-3 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                          selectedCategory === cat
                            ? "bg-primary-fixed/60 text-primary font-bold"
                            : "text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        <span>{cat}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>

                      {/* Mobile nested brands */}
                      {selectedCategory !== "All" && selectedCategory === cat && availableBrands.length > 1 && (
                        <div className="pl-3 pr-1 py-1.5 space-y-1 bg-surface-container-high/30 rounded-xl ml-1.5 border border-outline/5 text-left">
                          <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase block px-1 pb-1">Brands Available:</span>
                          <div className="flex flex-wrap gap-1 p-1">
                            {availableBrands.map((br) => (
                              <button
                                key={br}
                                onClick={() => {
                                  setSelectedBrand(br);
                                }}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                                  selectedBrand === br
                                    ? "bg-primary text-white font-bold"
                                    : "bg-surface border border-outline/10 text-on-surface-variant/80"
                                }`}
                              >
                                {br}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-on-surface-variant/80 uppercase tracking-wider">Max Budget</span>
                  <span className="font-bold text-primary">${maxPrice} USD</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Availability */}
              <div className="pt-2 border-t border-outline/10 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-outline/25 text-primary focus:ring-primary w-4 h-4 accent-primary"
                  />
                  <span className="text-xs font-medium text-on-surface-variant">In Stock Only</span>
                </label>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="mt-auto w-full py-3 bg-primary text-white rounded-xl text-xs font-bold transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Error Toast Notification */}
      {compareError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <X className="w-4 h-4 cursor-pointer hover:opacity-85" onClick={() => setCompareError(null)} />
          <span>{compareError}</span>
        </div>
      )}

      {/* Floating Compare Drawer/Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-45 w-11/12 max-w-xl bg-surface border border-outline/15 shadow-2xl rounded-3xl p-3 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
            {compareList.map((product) => (
              <div key={product.id} className="relative w-12 h-12 rounded-xl bg-surface-container border border-outline/10 p-1 flex items-center justify-center group shrink-0">
                <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                <button
                  onClick={() => handleToggleCompare(product)}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                  title="Remove"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            {[...Array(3 - compareList.length)].map((_, i) => (
              <div key={`placeholder-${i}`} className="w-12 h-12 rounded-xl border-2 border-dashed border-outline/20 flex items-center justify-center text-on-surface-variant/30 text-xs font-bold shrink-0">
                +
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClearCompare}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-on-surface-variant hover:text-red-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => setShowCompareModal(true)}
              className="text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer glass-btn-ios-primary"
              id="compare-trigger-floating"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({compareList.length}/3)</span>
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 md:p-8" id="compare-spec-modal">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs" onClick={() => setShowCompareModal(false)} />
          
          {/* Content */}
          <div className="relative bg-surface border border-outline/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in scale-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-outline/10 bg-surface-container-low shrink-0 text-left">
              <div>
                <h3 className="font-display font-black text-base text-on-surface flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  <span>Technical Specifications Comparison</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant/70">
                  Analyze and compare specifications, colors, storage options, and prices side-by-side.
                </p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
                id="close-compare-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
              {compareList.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Scale className="w-12 h-12 mx-auto text-on-surface-variant/40" />
                  <h4 className="text-sm font-semibold text-on-surface">No products selected</h4>
                  <p className="text-xs text-on-surface-variant/70 max-w-xs mx-auto">
                    Close this modal and select at least one product from the catalog to see specifications here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-outline/10 bg-surface-container-low/50">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline/10 bg-surface-container-low">
                        <th className="p-4 text-xs font-bold text-on-surface-variant uppercase w-1/4 min-w-[150px]">
                          Specification
                        </th>
                        {compareList.map((product) => (
                          <th key={product.id} className="p-4 w-1/4 min-w-[200px] align-top border-l border-outline/10">
                            <div className="space-y-4 relative">
                              {/* Remove icon */}
                              <button
                                onClick={() => handleToggleCompare(product)}
                                className="absolute -top-1.5 right-0 p-1 bg-surface-container rounded-full border border-outline/15 text-on-surface-variant hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20 transition-all cursor-pointer z-10"
                                title="Remove from comparison"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>

                              {/* Image wrapper */}
                              <div className="h-32 bg-[#f5f5f5] rounded-2xl p-2 border border-outline/5 flex items-center justify-center relative group-hover:scale-102 transition-transform">
                                <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                              </div>

                              {/* Title details */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{product.brand}</span>
                                <h4 className="font-display font-bold text-xs text-on-surface line-clamp-2">
                                  {product.name}
                                </h4>
                                <div className="text-xs font-bold text-on-surface">{formatProductPrice(product)}</div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-1.5 pt-1">
                                <button
                                  onClick={() => {
                                    onSelectProduct(product);
                                    setShowCompareModal(false);
                                  }}
                                  className="w-full py-1.5 border border-outline/20 hover:border-primary hover:text-primary rounded-xl text-[10px] font-bold transition-all cursor-pointer bg-surface"
                                >
                                  View Details
                                </button>
                                {product.inStock ? (
                                  <button
                                    onClick={() => onAddToCart(product, 1)}
                                    className="w-full py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                                  >
                                    Add to Cart
                                  </button>
                                ) : (
                                  <span className="text-center py-1.5 text-[10px] font-semibold text-on-surface-variant/40 bg-surface-container rounded-xl">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                            </div>
                          </th>
                        ))}
                        {/* Empty columns up to 3 */}
                        {[...Array(3 - compareList.length)].map((_, i) => (
                          <th key={`empty-col-${i}`} className="p-4 w-1/4 min-w-[200px] border-l border-outline/10 bg-surface-container-low/25 text-center align-middle hidden md:table-cell">
                            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/40 space-y-2">
                              <Plus className="w-6 h-6 border border-dashed border-outline/20 rounded-full p-1" />
                              <span className="text-[10px] font-medium">Add product</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/5 text-xs text-left">
                      {/* Price row */}
                      <tr className="hover:bg-surface-container/30">
                        <td className="p-4 font-bold text-on-surface-variant">Price</td>
                        {compareList.map((product) => (
                          <td key={product.id} className="p-4 font-bold text-on-surface border-l border-outline/10">
                            {formatProductPrice(product)}
                          </td>
                        ))}
                        {[...Array(3 - compareList.length)].map((_, i) => (
                          <td key={`empty-price-${i}`} className="p-4 border-l border-outline/10 hidden md:table-cell"></td>
                        ))}
                      </tr>

                      {/* Category row */}
                      <tr className="hover:bg-surface-container/30">
                        <td className="p-4 font-bold text-on-surface-variant">Category</td>
                        {compareList.map((product) => (
                          <td key={product.id} className="p-4 text-on-surface border-l border-outline/10">
                            {product.category}
                          </td>
                        ))}
                        {[...Array(3 - compareList.length)].map((_, i) => (
                          <td key={`empty-category-${i}`} className="p-4 border-l border-outline/10 hidden md:table-cell"></td>
                        ))}
                      </tr>

                      {/* Customer Ratings */}
                      <tr className="hover:bg-surface-container/30">
                        <td className="p-4 font-bold text-on-surface-variant">Rating</td>
                        {compareList.map((product) => (
                          <td key={product.id} className="p-4 border-l border-outline/10">
                            <div className="flex items-center gap-1.5">
                              <div className="flex text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              </div>
                              <span className="font-bold text-on-surface">{product.rating}</span>
                              <span className="text-on-surface-variant/60">({product.reviewsCount} reviews)</span>
                            </div>
                          </td>
                        ))}
                        {[...Array(3 - compareList.length)].map((_, i) => (
                          <td key={`empty-rating-${i}`} className="p-4 border-l border-outline/10 hidden md:table-cell"></td>
                        ))}
                      </tr>

                      {/* Availability status */}
                      <tr className="hover:bg-surface-container/30">
                        <td className="p-4 font-bold text-on-surface-variant">Stock Availability</td>
                        {compareList.map((product) => (
                          <td key={product.id} className="p-4 border-l border-outline/10">
                            {product.inStock ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                                In Stock
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-bold text-[10px]">
                                Sold Out
                              </span>
                            )}
                          </td>
                        ))}
                        {[...Array(3 - compareList.length)].map((_, i) => (
                          <td key={`empty-stock-${i}`} className="p-4 border-l border-outline/10 hidden md:table-cell"></td>
                        ))}
                      </tr>

                      {/* Colors */}
                      <tr className="hover:bg-surface-container/30">
                        <td className="p-4 font-bold text-on-surface-variant">Colors</td>
                        {compareList.map((product) => (
                          <td key={product.id} className="p-4 border-l border-outline/10">
                            {product.colors && product.colors.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {product.colors.map((color) => (
                                  <span key={color} className="px-1.5 py-0.5 bg-surface-container border border-outline/10 rounded-md text-[10px] font-medium text-on-surface">
                                    {color}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-on-surface-variant/40">-</span>
                            )}
                          </td>
                        ))}
                        {[...Array(3 - compareList.length)].map((_, i) => (
                          <td key={`empty-colors-${i}`} className="p-4 border-l border-outline/10 hidden md:table-cell"></td>
                        ))}
                      </tr>

                      {/* Storage */}
                      <tr className="hover:bg-surface-container/30">
                        <td className="p-4 font-bold text-on-surface-variant">Storage Options</td>
                        {compareList.map((product) => (
                          <td key={product.id} className="p-4 border-l border-outline/10">
                            {product.storages && product.storages.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {product.storages.map((storage) => (
                                  <span key={storage} className="px-1.5 py-0.5 bg-primary/5 text-primary rounded-md text-[10px] font-bold">
                                    {storage}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-on-surface-variant/40">-</span>
                            )}
                          </td>
                        ))}
                        {[...Array(3 - compareList.length)].map((_, i) => (
                          <td key={`empty-storages-${i}`} className="p-4 border-l border-outline/10 hidden md:table-cell"></td>
                        ))}
                      </tr>

                      {/* Custom specifications keys */}
                      {allSpecKeys.map((key) => (
                        <tr key={key} className="hover:bg-surface-container/30">
                          <td className="p-4 font-bold text-on-surface-variant">{key}</td>
                          {compareList.map((product) => {
                            const specValue = product.specifications?.[key];
                            return (
                              <td key={product.id} className="p-4 text-on-surface border-l border-outline/10 leading-relaxed text-[11px]">
                                {specValue || <span className="text-on-surface-variant/40">-</span>}
                              </td>
                            );
                          })}
                          {[...Array(3 - compareList.length)].map((_, i) => (
                            <td key={`empty-spec-${key}-${i}`} className="p-4 border-l border-outline/10 hidden md:table-cell"></td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-outline/10 bg-surface-container-low flex justify-end shrink-0">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2 rounded-xl bg-on-surface text-surface text-xs font-bold hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
