import React, { useState, useEffect } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { CartItem, formatProductPrice } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, selectedColor?: string, selectedStorage?: string) => void;
  onRemoveItem: (productId: string, selectedColor?: string, selectedStorage?: string) => void;
  onCheckout: () => void;
  onExploreEcosystem: () => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  discountPercentage: number;
  setDiscountPercentage: (percent: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onExploreEcosystem,
  couponCode,
  setCouponCode,
  discountPercentage,
  setDiscountPercentage,
}) => {
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [promoInput, setPromoInput] = useState(couponCode);
  const [activePromos, setActivePromos] = useState<{ code: string; discount: number; description: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/config")
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.activePromos)) {
            setActivePromos(data.activePromos);
          }
        })
        .catch((err) => console.error("Error fetching promo configuration:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Totals calculations
  const itemsSubtotalUsd = cart.reduce((acc, item) => acc + (item.product.price || 0) * item.quantity, 0);
  const itemsSubtotalKsh = cart.reduce((acc, item) => acc + (item.product.priceKsh || 0) * item.quantity, 0);

  const discountUsd = itemsSubtotalUsd * (discountPercentage / 100);
  const discountKsh = itemsSubtotalKsh * (discountPercentage / 100);

  const subtotalUsd = itemsSubtotalUsd - discountUsd;
  const subtotalKsh = itemsSubtotalKsh - discountKsh;

  const hasUsd = itemsSubtotalUsd > 0;
  const hasKsh = itemsSubtotalKsh > 0;

  const isFreeShipping = (subtotalUsd > 150) || (subtotalKsh > 20000) || (itemsSubtotalUsd === 0 && itemsSubtotalKsh === 0);
  const shippingUsd = isFreeShipping ? 0 : 15;
  const shippingKsh = isFreeShipping ? 0 : 2000;

  const taxesUsd = subtotalUsd * 0.08;
  const taxesKsh = subtotalKsh * 0.08;

  const totalUsd = subtotalUsd + shippingUsd + taxesUsd;
  const totalKsh = subtotalKsh + shippingKsh + taxesKsh;

  // Keep single variables for general layouts
  const itemsSubtotal = itemsSubtotalUsd || (itemsSubtotalKsh / 130);
  const subtotal = subtotalUsd || (subtotalKsh / 130);
  const shipping = isFreeShipping ? 0 : 15;
  const taxes = taxesUsd || (taxesKsh / 130);
  const total = totalUsd || (totalKsh / 130);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    const code = promoInput.trim().toUpperCase();
    const foundPromo = activePromos.find((p) => p.code === code) ||
                      (code === "AXON10" ? { code: "AXON10", discount: 10, description: "10% off products" } : null) ||
                      (code === "WELCOME5" ? { code: "WELCOME5", discount: 5, description: "5% off products" } : null);

    if (foundPromo) {
      setDiscountPercentage(foundPromo.discount);
      setCouponCode(foundPromo.code);
      setPromoSuccess(`${foundPromo.code} applied! ${foundPromo.discount}% discount.`);
    } else if (code === "") {
      setPromoError("Please enter a code.");
    } else {
      setPromoError("Invalid code. Try 'AXON15' for 15% off!");
    }
  };

  const handleRemovePromo = () => {
    setDiscountPercentage(0);
    setCouponCode("");
    setPromoInput("");
    setPromoSuccess("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-outline/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-outline/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-lg text-on-surface">Your Ecosystem Cart</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-on-surface-variant/80 hover:bg-surface-container-low transition-colors"
              id="cart-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/60">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-base text-on-surface">Your cart is empty</h3>
                  <p className="text-xs text-on-surface-variant/70 max-w-[240px]">
                    You haven't integrated any premium Axon items into your hardware ecosystem yet.
                  </p>
                </div>
                <button
                  onClick={onExploreEcosystem}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer glass-btn-ios-primary"
                  id="cart-explore-btn"
                >
                  Explore Ecosystem
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => {
                  const uniqueId = `${item.product.id}-${item.selectedColor || ""}-${item.selectedStorage || ""}`;
                  return (
                    <div 
                      key={uniqueId} 
                      className="flex items-start gap-4 p-3 bg-surface-container-low rounded-2xl border border-outline/10 transition-shadow hover:shadow-xs"
                      id={`cart-item-${idx}`}
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-xl object-contain bg-surface p-1 border border-outline/5 shrink-0"
                      />
                      <div className="flex-1 space-y-1 min-w-0">
                        <h4 className="font-display font-bold text-sm text-on-surface truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          {item.selectedColor && (
                            <span className="px-2 py-0.5 rounded-full bg-surface border border-outline/10 text-on-surface-variant">
                              Color: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedStorage && (
                            <span className="px-2 py-0.5 rounded-full bg-surface border border-outline/10 text-on-surface-variant">
                              Capacity: {item.selectedStorage}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-primary mt-1">
                          {formatProductPrice(item.product)}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center bg-surface border border-outline/25 rounded-full">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedStorage)}
                              disabled={item.quantity <= 1}
                              className="p-1 px-2.5 text-on-surface-variant disabled:opacity-40 hover:text-primary transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-2 text-on-surface">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedStorage)}
                              className="p-1 px-2.5 text-on-surface-variant hover:text-primary transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.product.id, item.selectedColor, item.selectedStorage)}
                            className="p-1.5 text-on-surface-variant/80 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Totals & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-outline/15 bg-surface-container-lowest p-6 space-y-4">
              {/* Promo Code Input */}
              {discountPercentage > 0 ? (
                <div className="flex items-center justify-between text-xs bg-green-50 text-green-700 border border-green-200 p-2 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span>Applied: <strong>{couponCode}</strong> ({discountPercentage}% off products)</span>
                  </div>
                  <button onClick={handleRemovePromo} className="text-green-900 font-semibold underline hover:text-green-700 ml-2">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. AXON10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 bg-surface border border-outline/20 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40"
                  />
                  <button type="submit" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer glass-btn-ios">
                    Apply
                  </button>
                </form>
              )}
              {promoError && <p className="text-[10px] text-red-600 mt-1">{promoError}</p>}
              {promoSuccess && <p className="text-[10px] text-green-600 mt-1">{promoSuccess}</p>}

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <div className="text-right">
                    {hasUsd && <div>${itemsSubtotalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>}
                    {hasKsh && <div>KSh {itemsSubtotalKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                  </div>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({discountPercentage}%)</span>
                    <div className="text-right">
                      {hasUsd && <div>-${discountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>}
                      {hasKsh && <div>-KSh {discountKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant">
                  <span>Estimated Shipping</span>
                  <div className="text-right">
                    {hasUsd && (
                      <div>{shippingUsd === 0 ? <span className="text-green-600 font-medium">Free</span> : `$${shippingUsd.toFixed(2)} USD`}</div>
                    )}
                    {hasKsh && (
                      <div>{shippingKsh === 0 ? <span className="text-green-600 font-medium">Free</span> : `KSh ${shippingKsh.toLocaleString()}`}</div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Estimated Tax (8%)</span>
                  <div className="text-right">
                    {hasUsd && <div>${taxesUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>}
                    {hasKsh && <div>KSh {taxesKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                  </div>
                </div>
                <div className="border-t border-outline/10 my-2 pt-2 flex justify-between text-sm font-bold text-on-surface">
                  <span>Total</span>
                  <div className="text-right">
                    {hasUsd && <div className="text-primary">${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>}
                    {hasKsh && <div className="text-primary">KSh {totalKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                  </div>
                </div>
              </div>

              {!isFreeShipping && (
                <div className="text-[10px] text-center text-on-surface-variant/60">
                  💡 Add {hasUsd && <strong>${(150 - subtotalUsd).toFixed(2)} USD</strong>} {hasUsd && hasKsh && "or"} {hasKsh && <strong>KSh {(20000 - subtotalKsh).toLocaleString()}</strong>} more to unlock <strong>Free Shipping</strong>!
                </div>
              )}

              <button
                onClick={onCheckout}
                className="w-full py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 hover:gap-3 cursor-pointer glass-btn-ios-primary"
                id="cart-checkout-btn"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
