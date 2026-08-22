import { createContext, useContext, useState, useEffect, useCallback, useRef, Suspense } from "react";
import { Product } from "../types";
import API_ROUTES from "../config/api-routes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WebConfig {
  heroSlides?: any[];
  showAnnouncement?: boolean;
  announcement?: string;
  heroTitle?: string;
  heroDescription?: string;
  categoriesList?: string[];
  activePromos?: any[];
  spotlightProducts?: string[];
  protocolTitle?: string;
  socialMediaLinks?: any;
  [key: string]: any;
}

interface CachedData {
  products: Product[];
  config: WebConfig;
  timestamp: number;
}

interface ConfigContextValue {
  products: Product[];
  config: WebConfig | null;
  isLoading: boolean;       // true on first load with no cache
  isFetching: boolean;      // true when doing a background refresh
  refetch: () => void;
}

interface ConfigProviderProps {
  children: React.ReactNode;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const ConfigContext = createContext<ConfigContextValue>({
  products: [],
  config: null,
  isLoading: true,
  isFetching: true,
  refetch: () => {},
});

export function useConfig() {
  return useContext(ConfigContext);
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

const CACHE_KEY = "axon_site_data";
const CACHE_VERSION = 1; // bump when schema changes
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  version: number;
  data: CachedData;
}

function readCache(): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.version !== CACHE_VERSION) return null;
    const { data } = entry;
    if (!data?.config || !Array.isArray(data?.products)) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(products: Product[], config: WebConfig) {
  try {
    const entry: CacheEntry = { version: CACHE_VERSION, data: { products, config, timestamp: Date.now() } };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [products, setProducts] = useState<Product[]>(() => readCache()?.products ?? []);
  const [config, setConfig] = useState<WebConfig | null>(() => readCache()?.config ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(() => readCache() === null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const fetchController = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    try {
      const t = Date.now();
      const [prodRes, configRes] = await Promise.all([
        fetch(`${API_ROUTES.products.list}?t=${t}`, { signal }),
        fetch(`${API_ROUTES.config.get}?t=${t}`, { signal }),
      ]);

      const newProducts: Product[] = [];
      const newConfig: WebConfig | null = null;

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData) && prodData.length > 0) {
          newProducts.push(
            ...prodData.filter((p: any) => p && typeof p?.name === "string")
          );
        }
      }

      if (configRes.ok) {
        const cfg: WebConfig = await configRes.json();
        if (cfg && typeof cfg === "object") {
          writeCache(newProducts, cfg);
          setConfig(cfg);
          setProducts(newProducts);
          setIsLoading(false);
          setIsFetching(false);
          return;
        }
      }

      // Partial or failed — still resolve so we stop loading
      if (newProducts.length > 0) {
        setProducts(newProducts);
      }
      setIsLoading(false);
      setIsFetching(false);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      setIsLoading(false);
      setIsFetching(false);
    }
  }, []);

  const startFreshFetch = useCallback(() => {
    if (fetchController.current) {
      fetchController.current.abort();
    }
    const controller = new AbortController();
    fetchController.current = controller;
    setIsFetching(true);
    fetchData(controller.signal);
  }, [fetchData]);

  // Initial load
  useEffect(() => {
    const cached = readCache();
    if (cached) {
      // Show cache instantly, refresh in background
      setConfig(cached.config);
      setProducts(cached.products);
      setIsLoading(false);
      setIsFetching(true);
      startFreshFetch();
    } else {
      // No cache — must fetch before showing anything
      startFreshFetch();
    }

    return () => {
      fetchController.current?.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    startFreshFetch();
  }, [startFreshFetch]);

  return (
    <ConfigContext.Provider value={{ products, config, isLoading, isFetching, refetch }}>
      {children}
    </ConfigContext.Provider>
  );
}

// ─── Suspense fallback ───────────────────────────────────────────────────────

export function ConfigSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SiteSkeleton />}>
      {children}
    </Suspense>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function SiteSkeleton() {
  return (
    <div className="min-h-screen bg-background font-sans text-on-surface flex flex-col justify-between animate-pulse">
      {/* Announcement bar skeleton */}
      <div className="h-8 bg-surface-container-low" />

      {/* Navbar skeleton */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-outline/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-8">
          <div className="h-5 w-24 bg-surface-container-high rounded" />
          <div className="hidden md:flex flex-1 gap-6">
            {[80, 60, 70, 90].map((w, i) => (
              <div key={i} className="h-4 bg-surface-container-low rounded" style={{ width: w }} />
            ))}
          </div>
          <div className="ml-auto flex gap-3">
            <div className="h-8 w-8 bg-surface-container-low rounded-full" />
            <div className="h-8 w-8 bg-surface-container-low rounded-full" />
          </div>
        </div>
      </header>

      {/* Hero skeleton */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="h-3 w-20 bg-surface-container-low rounded" />
              <div className="h-10 w-3/4 bg-surface-container-low rounded-lg" />
              <div className="h-10 w-1/2 bg-surface-container-low rounded-lg" />
              <div className="h-4 w-full bg-surface-container-low rounded" />
              <div className="h-4 w-4/5 bg-surface-container-low rounded" />
              <div className="flex gap-3 pt-2">
                <div className="h-11 w-36 bg-surface-container-low rounded-full" />
                <div className="h-11 w-36 bg-surface-container-low rounded-full" />
              </div>
            </div>
            <div className="aspect-square bg-surface-container-low rounded-2xl" />
          </div>
        </section>

        {/* Categories skeleton */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 w-28 bg-surface-container-low rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </section>

        {/* Product grid skeleton */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-4 mb-6">
            <div className="h-6 w-32 bg-surface-container-low rounded" />
            <div className="h-6 w-24 bg-surface-container-low rounded ml-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl overflow-hidden">
                <div className="aspect-square bg-surface-container-high" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-surface-container-low rounded" />
                  <div className="h-4 w-1/2 bg-surface-container-low rounded" />
                  <div className="h-5 w-1/3 bg-surface-container-low rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer skeleton */}
      <footer className="border-t border-outline/10 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-20 bg-surface-container-low rounded" />
              <div className="h-3 w-16 bg-surface-container-low rounded" />
              <div className="h-3 w-24 bg-surface-container-low rounded" />
              <div className="h-3 w-20 bg-surface-container-low rounded" />
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
