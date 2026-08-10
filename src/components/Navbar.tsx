import React, { useState } from "react";
import { ShoppingBag, Search, Menu, X, ChevronDown, ChevronUp, Sun, Moon, LogOut, History } from "lucide-react";
import { AppScreen, Product } from "../types";

interface NavbarProps {
  currentScreen: AppScreen | string;
  setScreen: (screen: AppScreen) => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAdminAuthenticated?: boolean;
  onAdminLogout?: () => void;
  products?: Product[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  setScreen,
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  isDarkMode,
  onToggleDarkMode,
  isAdminAuthenticated = false,
  onAdminLogout,
  products = [],
}) => {
  // Helper to convert pathname to screen name for active state comparison
  const getScreenFromPath = (path: string): AppScreen => {
    if (path === '/') return 'Home';
    if (path.startsWith('/catalog')) return 'Catalog';
    if (path.startsWith('/product/')) return 'ProductDetail';
    if (path === '/checkout') return 'Checkout';
    if (path.startsWith('/order/')) return 'Confirmation';
    if (path.startsWith('/track-order')) return 'TrackOrder';
    if (path === '/contact') return 'Contact';
    if (path.startsWith('/blog')) return 'Blog';
    if (path === '/dev') return 'Admin';
    return 'Home';
  };

  const activeScreen = typeof currentScreen === 'string' && currentScreen.startsWith('/') 
    ? getScreenFromPath(currentScreen) 
    : currentScreen as AppScreen;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Search History States
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isMobileInputFocused, setIsMobileInputFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("axon_recent_searches");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let searches: string[] = [];
    try {
      const stored = localStorage.getItem("axon_recent_searches");
      if (stored) {
        searches = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // Keep it unique (case-insensitive)
    searches = searches.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
    
    // Add to top
    searches.unshift(trimmed);
    
    // Limit to 5
    searches = searches.slice(0, 5);

    try {
      localStorage.setItem("axon_recent_searches", JSON.stringify(searches));
    } catch (err) {
      console.error(err);
    }
    setRecentSearches(searches);
  };

  const handleRecentSearchClick = (query: string) => {
    setLocalSearch(query);
    setSearchQuery(query);
    setSelectedCategory("All");
    setSelectedBrand("All");
    setScreen("Catalog");
    setIsMobileMenuOpen(false);
    saveSearchQuery(query);
  };

  const clearAllSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      localStorage.removeItem("axon_recent_searches");
    } catch (err) {
      console.error(err);
    }
    setRecentSearches([]);
  };

  const deleteSearchQuery = (e: React.MouseEvent, queryToDelete: string) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = recentSearches.filter(s => s !== queryToDelete);
    try {
      localStorage.setItem("axon_recent_searches", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setRecentSearches(updated);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setSelectedCategory("All");
    setSelectedBrand("All");
    setScreen("Catalog");
    setIsMobileMenuOpen(false);
    saveSearchQuery(localSearch);
  };

  const handleNavClick = (screen: AppScreen, category?: string) => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("All");
    }
    setSelectedBrand("All");
    setScreen(screen);
    setIsMobileMenuOpen(false);
  };

  const handleCategoryHeaderClick = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getBrandsForCategory = (category: string) => {
    const filtered = products.filter(p => p.category === category);
    const unique = Array.from(new Set(filtered.map(p => p.brand).filter(Boolean)));
    return unique;
  };

  return (
    <nav className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline/10 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick("Home")} 
          className="flex flex-row items-center cursor-pointer group shrink-0"
          id="nav-logo-container"
        >
          <img 
            src="https://res.cloudinary.com/dwwvh34yi/image/upload/v1783980758/Axon_2_ao8wqm.png" 
            alt="Axon Logo" 
            className="w-12 h-12 md:w-16 md:h-16 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0 dark:brightness-0 dark:invert"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => handleNavClick("Home")}
            className={`transition-colors hover:text-primary ${
              activeScreen === "Home" ? "text-primary font-semibold" : "text-on-surface/80"
            }`}
            id="nav-link-home"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick("Catalog")}
            className={`transition-colors hover:text-primary ${
              activeScreen === "Catalog" ? "text-primary font-semibold" : "text-on-surface/80"
            }`}
            id="nav-link-catalog"
          >
            Shop All
          </button>
          <button
            onClick={() => handleNavClick("Catalog", "Laptops")}
            className="text-on-surface/80 hover:text-primary transition-colors"
            id="nav-link-laptops"
          >
            Laptops
          </button>
          <button
            onClick={() => handleNavClick("Catalog", "Tablets")}
            className="text-on-surface/80 hover:text-primary transition-colors"
            id="nav-link-tablets"
          >
            Tablets
          </button>
          <button
            onClick={() => handleNavClick("Catalog", "Audio")}
            className="text-on-surface/80 hover:text-primary transition-colors"
            id="nav-link-audio"
          >
            Audio
          </button>
          <button
            onClick={() => handleNavClick("Catalog", "Phones")}
            className="text-on-surface/80 hover:text-primary transition-colors"
            id="nav-link-phones"
          >
            Phones
          </button>
          <button
            onClick={() => handleNavClick("TrackOrder")}
            className={`transition-colors hover:text-primary ${
              activeScreen === "TrackOrder" ? "text-primary font-semibold" : "text-on-surface/80"
            }`}
            id="nav-link-track-order"
          >
            Track Order
          </button>
          <button
            onClick={() => handleNavClick("Contact")}
            className={`transition-colors hover:text-primary ${
              activeScreen === "Contact" ? "text-primary font-semibold" : "text-on-surface/80"
            }`}
            id="nav-link-contact-us"
          >
            Contact Us
          </button>
          <button
            onClick={() => handleNavClick("Blog")}
            className={`transition-colors hover:text-primary ${
              activeScreen === "Blog" ? "text-primary font-semibold" : "text-on-surface/80"
            }`}
            id="nav-link-blog"
          >
            Blog
          </button>
          {isAdminAuthenticated && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleNavClick("Admin")}
                className="transition-colors hover:bg-primary/10 text-primary font-bold border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1 shadow-sm cursor-pointer"
                id="nav-link-back-to-admin"
              >
                Back to Admin
              </button>
              {onAdminLogout && (
                <button
                  onClick={onAdminLogout}
                  className="transition-colors bg-red-500/10 hover:bg-red-500/15 text-red-600 border border-red-500/20 px-2 py-1 rounded-full text-[11px] flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Logout Admin"
                  id="nav-link-admin-logout"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search & Cart Actions */}
        <div className="flex items-center gap-3 flex-1 md:flex-initial justify-end">
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block max-w-[200px] lg:max-w-[260px] w-full" id="nav-search-form">
            <input
              type="text"
              placeholder="Search Axon ecosystem..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className="w-full bg-surface-container-low border border-outline/20 rounded-full py-1.5 pl-8 pr-4 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 animate-all"
            />
            <Search className="absolute left-2.5 top-2 w-4 h-4 text-on-surface-variant/60" />

            {/* Recent Searches Dropdown */}
            {isInputFocused && recentSearches.length > 0 && (
              <div 
                className="absolute left-0 right-0 top-full mt-2 bg-surface-container-high border border-outline/15 rounded-2xl shadow-xl py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left overflow-hidden"
                id="nav-search-history-dropdown"
              >
                <div className="flex justify-between items-center px-4 pb-2 mb-1 border-b border-outline/5">
                  <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider">Recent Searches</span>
                  <button 
                    type="button"
                    onMouseDown={clearAllSearches}
                    className="text-[9px] font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-[220px] overflow-y-auto">
                  {recentSearches.map((query, idx) => (
                    <div 
                      key={idx}
                      className="group flex justify-between items-center px-4 py-2 hover:bg-surface-container-highest transition-colors cursor-pointer text-xs text-on-surface"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleRecentSearchClick(query);
                      }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <History className="w-3.5 h-3.5 text-on-surface-variant/50 shrink-0" />
                        <span className="truncate">{query}</span>
                      </div>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          deleteSearchQuery(e, query);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-container rounded transition-all cursor-pointer"
                        title="Remove from history"
                      >
                        <X className="w-3.5 h-3.5 text-on-surface-variant/70 hover:text-on-surface" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-on-surface/90 hover:text-primary hover:bg-surface-container-low rounded-full transition-colors cursor-pointer"
            id="nav-dark-mode-btn"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-on-surface/90 hover:text-primary hover:bg-surface-container-low rounded-full transition-colors"
            id="nav-cart-btn"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-container text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-on-surface/90 hover:bg-surface-container-low rounded-full transition-colors"
            id="nav-mobile-menu-btn"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile left slide-out Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 w-screen h-screen bg-black/50 z-50 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-out Drawer */}
          <div 
            className="fixed inset-y-0 left-0 max-w-[290px] w-full h-screen bg-surface z-50 shadow-2xl p-5 flex flex-col gap-5 md:hidden overflow-y-auto animate-in slide-in-from-left duration-300 border-r border-outline/10 text-left"
            id="mobile-drawer"
          >
            {/* Header with logo & close */}
            <div className="flex items-center justify-between pb-2 border-b border-outline/5">
              <div 
                onClick={() => { handleNavClick("Home"); }} 
                className="flex flex-row items-center cursor-pointer group shrink-0"
              >
                <img 
                  src="https://res.cloudinary.com/dwwvh34yi/image/upload/v1783980758/Axon_2_ao8wqm.png" 
                  alt="Axon Logo" 
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0 dark:brightness-0 dark:invert"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-1.5 hover:bg-surface-container-low rounded-full text-on-surface-variant transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full" id="nav-mobile-search-form">
              <input
                type="text"
                placeholder="Search ecosystem..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onFocus={() => setIsMobileInputFocused(true)}
                onBlur={() => setIsMobileInputFocused(false)}
                className="w-full bg-surface-container-low border border-outline/20 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/40 animate-all"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant/60" />

              {/* Mobile Recent Searches Dropdown */}
              {isMobileInputFocused && recentSearches.length > 0 && (
                <div 
                  className="absolute left-0 right-0 top-full mt-2 bg-surface-container-high border border-outline/15 rounded-2xl shadow-xl py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left overflow-hidden"
                  id="nav-mobile-search-history-dropdown"
                >
                  <div className="flex justify-between items-center px-4 pb-2 mb-1 border-b border-outline/5">
                    <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider">Recent Searches</span>
                    <button 
                      type="button"
                      onMouseDown={clearAllSearches}
                      className="text-[9px] font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto">
                    {recentSearches.map((query, idx) => (
                      <div 
                        key={idx}
                        className="group flex justify-between items-center px-4 py-2 hover:bg-surface-container-highest transition-colors cursor-pointer text-xs text-on-surface"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleRecentSearchClick(query);
                        }}
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <History className="w-3.5 h-3.5 text-on-surface-variant/50 shrink-0" />
                          <span className="truncate">{query}</span>
                        </div>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            deleteSearchQuery(e, query);
                          }}
                          className="p-1 hover:bg-surface-container rounded transition-all cursor-pointer"
                          title="Remove from history"
                        >
                          <X className="w-3.5 h-3.5 text-on-surface-variant/70 hover:text-on-surface" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Navigation Lists */}
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-wider px-3 mb-1 block">
                General
              </span>
              
              <button
                onClick={() => handleNavClick("Home")}
                className={`text-left py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === "Home" ? "bg-primary-fixed/60 text-primary" : "text-on-surface/80 hover:bg-surface-container-low"
                }`}
              >
                Home
              </button>
              
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedBrand("All");
                  setScreen("Catalog");
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === "Catalog" && selectedCategory === "All" ? "bg-primary-fixed/60 text-primary" : "text-on-surface/80 hover:bg-surface-container-low"
                }`}
              >
                Shop All
              </button>

              <button
                onClick={() => {
                  setScreen("TrackOrder");
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === "TrackOrder" ? "bg-primary-fixed/60 text-primary" : "text-on-surface/80 hover:bg-surface-container-low"
                }`}
              >
                Track Order
              </button>

              <button
                onClick={() => {
                  setScreen("Contact");
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === "Contact" ? "bg-primary-fixed/60 text-primary" : "text-on-surface/80 hover:bg-surface-container-low"
                }`}
              >
                Contact Us
              </button>

              <button
                onClick={() => {
                  setScreen("Blog");
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === "Blog" ? "bg-primary-fixed/60 text-primary" : "text-on-surface/80 hover:bg-surface-container-low"
                }`}
              >
                Blog
              </button>

              {isAdminAuthenticated && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setScreen("Admin");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    Back to Admin
                  </button>
                  {onAdminLogout && (
                    <button
                      onClick={() => {
                        onAdminLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout Admin
                    </button>
                  )}
                </div>
              )}

              <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-wider px-3 mt-4 mb-1 block">
                Categories &amp; Ecosystems
              </span>

              {/* Collapsible Categories */}
              {["Laptops", "Tablets", "Audio", "Phones", "Accessories", "Power"].map((cat) => {
                const isExpanded = expandedCategory === cat;
                const brands = getBrandsForCategory(cat);
                const isActiveCat = activeScreen === "Catalog" && selectedCategory === cat;

                return (
                  <div key={cat} className="space-y-1">
                    <button
                      onClick={() => handleCategoryHeaderClick(cat)}
                      className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        isActiveCat 
                          ? "bg-primary/5 text-primary border-l-2 border-primary pl-2.5" 
                          : "text-on-surface/80 hover:bg-surface-container-low"
                      }`}
                    >
                      <span>{cat}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-on-surface-variant/70" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant/70" />
                      )}
                    </button>

                    {/* Pop down menu for "All" and Brands */}
                    {isExpanded && (
                      <div className="pl-3 pr-1 py-1.5 space-y-1 bg-surface-container-low/50 rounded-xl border border-outline/5 ml-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        {/* Option to view all products in category */}
                        <button
                          onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedBrand("All");
                            setScreen("Catalog");
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full text-left py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all flex items-center justify-between ${
                            isActiveCat && selectedBrand === "All"
                              ? "bg-primary-fixed/60 text-primary"
                              : "text-on-surface-variant/80 hover:bg-surface-container-low"
                          }`}
                        >
                          <span>All {cat}</span>
                          {isActiveCat && selectedBrand === "All" && (
                            <span className="w-1 h-1 rounded-full bg-primary" />
                          )}
                        </button>

                        {/* Individual brands under this category */}
                        {brands.map((br) => {
                          const isActiveBrand = isActiveCat && selectedBrand === br;
                          return (
                            <button
                              key={br}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setSelectedBrand(br);
                                setScreen("Catalog");
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full text-left py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all flex items-center justify-between ${
                                isActiveBrand
                                  ? "bg-primary text-white"
                                  : "text-on-surface-variant/80 hover:bg-surface-container-low"
                              }`}
                            >
                              <span>{br}</span>
                              {isActiveBrand && (
                                <span className="w-1 h-1 rounded-full bg-white" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};
