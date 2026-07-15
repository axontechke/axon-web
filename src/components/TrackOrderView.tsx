import React, { useState, useEffect } from "react";
import { Search, MapPin, Package, Truck, CheckCircle2, ChevronRight, Clock, ShieldCheck, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Product } from "../types";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchOrder(searchQuery.trim());
    }
  }, [searchQuery]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        throw new Error("Invalid tracking ID or order not found.");
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
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
            Package Telemetry Tracker
          </h1>
          <p className="text-xs text-on-surface-variant/70">
            Real-time status updates and delivery routing logistics.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto max-w-md">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="e.g. AXN-827103"
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
          <p className="text-xs font-medium text-on-surface-variant">Connecting to telemetry satellite...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-on-surface">Order Not Found</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            We couldn't locate tracking ID <strong className="text-on-surface">{trackingId}</strong>. Please ensure the code is formatted correctly (e.g. AXN-XXXXXX).
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setTrackingId("AXN-827103");
                setSearchQuery("AXN-827103");
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl cursor-pointer glass-btn-ios"
            >
              Try Sample Code
            </button>
          </div>
        </div>
      )}

      {/* Empty Search Prompt */}
      {!loading && !order && !error && (
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto text-primary">
            <Truck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display font-bold text-base text-on-surface">No Tracked Package</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Enter your Axon tracking number from your confirmation receipt to inspect its physical progress and logistics logs.
            </p>
          </div>
          <div className="bg-surface-container-low border border-outline/10 p-4 rounded-2xl text-left space-y-2">
            <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase block">Active Sandbox Tracking Codes</span>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                onClick={() => {
                  setTrackingId("AXN-827103");
                  setSearchQuery("AXN-827103");
                }}
                className="flex items-center justify-between p-2 rounded-lg bg-surface hover:bg-surface-container transition-colors text-left border border-outline/5"
              >
                <div>
                  <span className="font-mono font-bold text-primary">AXN-827103</span>
                  <span className="text-[10px] text-on-surface-variant block">Stephen Paul Kamau (Delivered)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-on-surface-variant/40" />
              </button>
              <button
                onClick={() => {
                  setTrackingId("AXN-982714");
                  setSearchQuery("AXN-982714");
                }}
                className="flex items-center justify-between p-2 rounded-lg bg-surface hover:bg-surface-container transition-colors text-left border border-outline/5"
              >
                <div>
                  <span className="font-mono font-bold text-primary">AXN-982714</span>
                  <span className="text-[10px] text-on-surface-variant block">Clarissa Mitchell (In Transit)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-on-surface-variant/40" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Order Details Dashboard */}
      {!loading && order && (
        <div className="space-y-6 text-left">
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
                        <span className="text-xs font-bold text-on-surface block">${(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => onSelectProductById(item.id)}
                          className="text-[9px] text-primary hover:underline font-bold"
                        >
                          View Product
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
                  <span>Logistics Chronicle Feed</span>
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
