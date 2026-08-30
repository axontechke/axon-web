import React, { useState, useEffect } from "react";
import { Search, MapPin, Package, Truck, CheckCircle2, ChevronRight, Clock, ShieldCheck, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Product, CURRENCY_SYMBOL } from "../types";

interface OrderHistoryItem {
  status: "pending" | "packaged" | "shipped" | "delivered";
  time: string;
  notes: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  storage?: string;
  image?: string;
}

interface TrackedOrder {
  id: string;
  date: string;
  status: "pending" | "packaged" | "shipped" | "delivered";
  customer: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  taxes: number;
  total: number;
  totalKsh?: number;
  payment: {
    lastFour: string;
  };
  items: OrderItem[];
  history: OrderHistoryItem[];
}

interface TrackOrderViewProps {
  initialTrackingId?: string;
  onBackToShopping: () => void;
  onSelectProductById: (productId: string) => void;
}

export const TrackOrderView: React.FC<TrackOrderViewProps> = ({
  initialTrackingId = "",
  onBackToShopping,
  onSelectProductById,
}) => {
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [searchQuery, setSearchQuery] = useState(initialTrackingId);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchOrder(searchQuery.trim());
    } else {
      setOrder(null);
      setOrders(null);
      setError(null);
    }
  }, [searchQuery]);

  const fetchOrder = async (query: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    setOrders(null);
    const q = query.trim();
    try {
      // Privacy-aware search: backend only returns user-related orders matching query (id/email/phone)
      // Try search endpoint first (supports all three)
      const searchRes = await fetch(`/api/orders/search?query=${encodeURIComponent(q)}`);
      if (searchRes.ok) {
        const data = await searchRes.json();
        const list: TrackedOrder[] = Array.isArray(data) ? data : [data];
        if (list.length === 0) throw new Error("No orders found for that tracking ID, email or phone.");
        if (list.length === 1) {
          setOrder(list[0]);
          setOrders(null);
        } else {
          // Multiple orders for this email/phone - show list, let user pick one
          setOrders(list);
          setOrder(null);
        }
        return;
      }
      // Fallback: direct ID fetch (for legacy)
      const res = await fetch(`/api/orders/${encodeURIComponent(q)}`);
      if (!res.ok) {
        const errBody = await searchRes.json().catch(() => ({}));
        throw new Error(errBody.error || "No orders found for that tracking ID, email or phone.");
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      setOrders(null);
      setError(err.message || "Failed to locate your package.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      setSearchQuery(trackingId.trim());
    }
  };

  const statusSteps = [
    { key: "pending", label: "Confirmed", desc: "Order Placed", icon: ShieldCheck },
    { key: "packaged", label: "Packaged", desc: "Sealed & Quality Checked", icon: Package },
    { key: "shipped", label: "Shipped", desc: "In Transit via Air Cargo", icon: Truck },
    { key: "delivered", label: "Delivered", desc: "Arrived at Destination", icon: CheckCircle2 },
  ];

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex((step) => step.key === status);
  };

  const currentStepIndex = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 space-y-8 animate-in fade-in duration-300" id="track-order-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline/10 pb-4 text-left">
        <div className="space-y-1">
          <button
            onClick={onBackToShopping}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog
          </button>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-on-surface tracking-tight">
            Track Your Order
          </h1>
          <p className="text-xs text-on-surface-variant/70">
            Enter tracking ID, email or phone - only your orders will be shown.
          </p>
        </div>

        {/* Search Bar - privacy: query can be tracking ID or your email/phone */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto max-w-md">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="AXN-xxx, email or 07xx xxx xxx"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 bg-surface-container border border-outline/15 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/45"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant/50" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 glass-btn-ios-primary"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Track"}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-medium text-on-surface-variant">Finding your order...</p>
        </div>
      )}

      {/* Error state - privacy: no data leaked, only generic message */}
      {!loading && error && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-on-surface">No Matching Orders</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            No orders found for <strong className="text-on-surface">{trackingId}</strong>. Try your tracking ID, the email or phone you used at checkout.
          </p>
        </div>
      )}

      {/* Empty Search Prompt - no data shown until user searches (privacy) */}
      {!loading && !order && !orders && !error && (
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto text-primary">
            <Truck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display font-bold text-base text-on-surface">Track Your Package</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Enter your tracking number, email or phone. Only orders matching your identifier will be shown - no other customer data is exposed.
            </p>
          </div>
        </div>
      )}

      {/* Multiple orders for this email/phone - privacy: only this user's orders */}
      {!loading && orders && !order && orders.length > 0 && (
        <div className="space-y-4 text-left">
          <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-5 shadow-sm">
            <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-1.5">
              <Package className="w-4 h-4 text-primary" />
              <span>Your Orders ({orders.length})</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant/70 mt-1">We found {orders.length} orders linked to <strong className="text-on-surface">{searchQuery}</strong>. Select one to view details - only your orders are listed.</p>
            <div className="divide-y divide-outline/10 mt-4">
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { setOrder(o); setTrackingId(o.id); window.scrollTo({top:0, behavior:"smooth"}); }}
                  className="w-full flex items-center justify-between py-3.5 text-left hover:bg-surface-container/50 px-2 rounded-xl transition-colors group"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-xs text-primary group-hover:underline">{o.id}</span>
                    <span className="text-[11px] text-on-surface-variant block">{new Date(o.date).toLocaleDateString()} • {o.status} • {CURRENCY_SYMBOL} {(o.totalKsh || o.total).toLocaleString()}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => { setOrders(null); setSearchQuery(""); setTrackingId(""); setError(null); }} className="text-xs font-bold text-primary hover:underline">Clear search</button>
        </div>
      )}

      {/* Main Order Details Dashboard - only shown after verified search */}
      {!loading && order && (
        <div className="space-y-6 text-left">
          {orders && orders.length > 1 && (
            <button onClick={() => setOrder(null)} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to your orders ({orders.length})
            </button>
          )}
          {/* Status Progress Bar Card */}
          <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline/10 pb-4">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Tracking Code</span>
                <h2 className="font-mono font-black text-xl text-on-surface">{order.id}</h2>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase block">Estimated Delivery</span>
                <span className="text-xs font-bold text-on-surface">
                  {order.status === "delivered" ? "Delivered Safely" : "Within 24-48 Hours"}
                </span>
              </div>
            </div>

            {/* Visual Progress Steps */}
            <div className="relative py-4">
              {/* Desktop Progress Line */}
              <div className="hidden md:block absolute top-[2.2rem] left-12 right-12 h-1 bg-outline/10 z-0">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Progress Steps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {statusSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-3">
                      {/* Circle Indicator */}
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                          isCompleted 
                            ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                            : "bg-surface border-outline/20 text-on-surface-variant/40"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Labels */}
                      <div className="space-y-0.5">
                        <span className={`text-xs font-bold block ${isCompleted ? "text-on-surface" : "text-on-surface-variant/50"}`}>
                          {step.label}
                        </span>
                        <span className="text-[10px] text-on-surface-variant/70 leading-relaxed block">
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Hand: Items list & logistics history (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Ordered Items */}
              <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-primary" />
                  <span>Package Contents</span>
                </h3>

                <div className="divide-y divide-outline/10">
                  {order.items && order.items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-12 rounded-xl bg-surface border border-outline/10 object-contain p-1"
                        />
                      )}
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-xs font-bold text-on-surface truncate">{item.name}</h4>
                        <p className="text-[10px] text-on-surface-variant/70">
                          Qty: {item.quantity} {item.color ? `| Color: ${item.color}` : ""} {item.storage ? `| Size: ${item.storage}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-on-surface block">{CURRENCY_SYMBOL} {(item.price * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => onSelectProductById(item.id)}
                          className="text-[9px] text-primary hover:underline font-bold"
                        >
                          View Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronicle Logistics Feed */}
              <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Delivery Timeline</span>
                </h3>

                <div className="relative border-l border-outline/15 ml-3 pl-6 space-y-6 py-2">
                  {order.history && order.history.map((log, idx) => {
                    const isLatest = idx === order.history.length - 1;
                    return (
                      <div key={idx} className="relative text-left">
                        {/* Dot indicator */}
                        <div 
                          className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-surface transition-colors ${
                            isLatest ? "border-primary bg-primary" : "border-outline/40"
                          }`}
                        />

                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-on-surface capitalize">
                              {log.status === "pending" ? "Order Placed" : log.status}
                            </span>
                            <span className="text-[10px] text-on-surface-variant/60 font-medium">
                              {new Date(log.time).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant leading-relaxed">
                            {log.notes}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Hand: Shipping destination and totals summary (4 columns) */}
            <div className="lg:col-span-4 space-y-6 text-left">
              {/* Shipping Address */}
              <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-5 shadow-sm space-y-3">
                <h3 className="font-display font-bold text-xs text-on-surface flex items-center gap-1.5 uppercase tracking-wide">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Destination</span>
                </h3>
                <div className="space-y-1 text-xs text-on-surface-variant">
                  <strong className="text-on-surface block">{order.customer.fullName}</strong>
                  <span>{order.customer.address}</span>
                  <span className="block">{order.customer.city}, {order.customer.state} {order.customer.zipCode}</span>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-5 shadow-sm space-y-3">
                <h3 className="font-display font-bold text-xs text-on-surface uppercase tracking-wide">
                  Order Cost Breakdown
                </h3>
                <div className="space-y-2 text-xs divide-y divide-outline/5 pt-1">
                  <div className="flex justify-between py-1 text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between py-1 text-green-600">
                      <span>Discount ({order.discountPercentage}%)</span>
                      <span>-${order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 text-on-surface-variant">
                    <span>Shipping ({order.shippingMethod})</span>
                    <span>{order.shippingCost === 0 ? "FREE" : `$${order.shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between py-1 text-on-surface-variant">
                    <span>Estimated Tax</span>
                    <span>${order.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-black text-on-surface">
                    <span>Total Paid</span>
                    <span className="text-primary">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
