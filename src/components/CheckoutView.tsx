import React, { useState } from "react";
import { Truck, MapPin, CheckCircle, ShoppingBag, ArrowLeft, MessageSquare, CreditCard, Banknote, Smartphone } from "lucide-react";
import { CartItem } from "../types";

interface CheckoutViewProps {
  cart: CartItem[];
  discountPercentage: number;
  onPlaceOrder: (orderDetails: any) => void;
  onBackToCart: () => void;
  config?: any;
}

type CheckoutStep = 1 | 2 | 3;

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  discountPercentage,
  onPlaceOrder,
  onBackToCart,
  config,
}) => {
  const [step, setStep] = useState<CheckoutStep>(1);

  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "overnight">("standard");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Totals calculations
  const itemsSubtotalUsd = cart.reduce((acc, item) => acc + (item.product.price || 0) * item.quantity, 0);
  const itemsSubtotalKsh = cart.reduce((acc, item) => acc + (item.product.priceKsh || 0) * item.quantity, 0);

  const discountAmountUsd = itemsSubtotalUsd * (discountPercentage / 100);
  const discountAmountKsh = itemsSubtotalKsh * (discountPercentage / 100);

  const subtotalUsd = itemsSubtotalUsd - discountAmountUsd;
  const subtotalKsh = itemsSubtotalKsh - discountAmountKsh;

  const hasUsd = itemsSubtotalUsd > 0;
  const hasKsh = itemsSubtotalKsh > 0;

  const getShippingCostUsd = () => {
    if (shippingMethod === "standard") return (subtotalUsd > 150 || subtotalUsd === 0) ? 0 : 15;
    if (shippingMethod === "express") return 25;
    if (shippingMethod === "overnight") return 45;
    return 0;
  };

  const getShippingCostKsh = () => {
    if (shippingMethod === "standard") return (subtotalKsh > 20000 || subtotalKsh === 0) ? 0 : 2000;
    if (shippingMethod === "express") return 3500;
    if (shippingMethod === "overnight") return 6000;
    return 0;
  };

  const shippingCostUsd = getShippingCostUsd();
  const shippingCostKsh = getShippingCostKsh();

  const taxesUsd = subtotalUsd * 0.08;
  const taxesKsh = subtotalKsh * 0.08;

  const totalUsd = subtotalUsd + shippingCostUsd + taxesUsd;
  const totalKsh = subtotalKsh + shippingCostKsh + taxesKsh;

  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingForm.fullName.trim()) errors.fullName = "Full Name is required";
    if (!shippingForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(shippingForm.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!shippingForm.address.trim()) errors.address = "Address is required";
    if (!shippingForm.city.trim()) errors.city = "City is required";
    if (!shippingForm.state.trim()) errors.state = "State is required";
    if (!shippingForm.zipCode.trim()) {
      errors.zipCode = "Zip Code is required";
    } else if (shippingForm.zipCode.length < 5) {
      errors.zipCode = "Enter a valid zip code";
    }
    if (!shippingForm.phone.trim()) errors.phone = "Phone number is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateShipping()) {
        setStep(2);
        setFormErrors({});
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step === 1) {
      onBackToCart();
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSubmitOrder = () => {
    const orderDetails = {
      customer: shippingForm,
      shippingMethod,
      shippingCost: shippingCostUsd,
      shippingCostUsd,
      shippingCostKsh,
      subtotal: subtotalUsd,
      subtotalUsd,
      subtotalKsh,
      discountAmount: discountAmountUsd,
      discountAmountUsd,
      discountAmountKsh,
      discountPercentage,
      taxes: taxesUsd,
      taxesUsd,
      taxesKsh,
      total: totalUsd,
      totalUsd,
      totalKsh,
      hasUsd,
      hasKsh,
      payment: { method: "whatsapp", lastFour: "" }
    };
    onPlaceOrder(orderDetails);
  };

  // Payment method configs
  const mpesaConfig = config?.paymentMpesa || { till: "123456", name: "AXON TECHNOLOGIES KE" };
  const bankConfig = config?.paymentBank || {
    name: "KCB Bank",
    accountName: "Axon Technologies Kenya Limited",
    accountNumber: "1234567890",
    branch: "Kencom Branch",
    swiftCode: "KCBLKENA"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10 animate-in fade-in duration-200" id="checkout-view-container">
      {/* Back links */}
      <div className="text-left">
        <button
          onClick={handlePrevStep}
          className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1.5"
          id="checkout-prev-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? "Return to Shopping Cart" : "Go Back to Previous Step"}
        </button>
      </div>

      {/* Progress Steps Indicator Bar */}
      <div className="flex justify-between items-center max-w-xl mx-auto border-b border-outline/10 pb-6">
        <div className="flex flex-col items-center space-y-1.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 1 ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
          }`}>
            {step > 1 ? "✓" : "1"}
          </div>
          <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Shipping</span>
        </div>
        <div className={`flex-1 h-0.5 mx-2 bg-outline/20 ${step >= 2 ? "bg-primary" : ""}`} />
        
        <div className="flex flex-col items-center space-y-1.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 2 ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
          }`}>
            {step > 2 ? "✓" : "2"}
          </div>
          <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Delivery</span>
        </div>
        <div className={`flex-1 h-0.5 mx-2 bg-outline/20 ${step >= 3 ? "bg-primary" : ""}`} />

        <div className="flex flex-col items-center space-y-1.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 3 ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
          }`}>
            3
          </div>
          <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Confirm</span>
        </div>
      </div>

      {/* Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Section */}
        <div className="lg:col-span-7 bg-surface-container-low border border-outline/10 p-6 md:p-8 rounded-3xl text-left space-y-6">
          
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200" id="checkout-step-1">
              <div className="flex items-center gap-2 border-b border-outline/5 pb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-base text-on-surface">Shipping Address Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant block">Full Recipient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={shippingForm.fullName}
                    onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                    className={`w-full bg-surface border rounded-xl px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary ${
                      formErrors.fullName ? "border-red-500" : "border-outline/15 focus:border-primary"
                    }`}
                  />
                  {formErrors.fullName && <p className="text-[10px] text-red-500">{formErrors.fullName}</p>}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant block">Email Address (Order Confirmation)</label>
                  <input
                    type="email"
                    required
                    placeholder="johndoe@email.com"
                    value={shippingForm.email}
                    onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                    className={`w-full bg-surface border rounded-xl px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary ${
                      formErrors.email ? "border-red-500" : "border-outline/15 focus:border-primary"
                    }`}
                  />
                  {formErrors.email && <p className="text-[10px] text-red-500">{formErrors.email}</p>}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant block">Physical Address</label>
                  <input
                    type="text"
                    required
                    placeholder="128 Axon Way, Apt 3B"
                    value={shippingForm.address}
                    onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                    className={`w-full bg-surface border rounded-xl px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary ${
                      formErrors.address ? "border-red-500" : "border-outline/15 focus:border-primary"
                    }`}
                  />
                  {formErrors.address && <p className="text-[10px] text-red-500">{formErrors.address}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant block">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Nairobi"
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                    className={`w-full bg-surface border rounded-xl px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary ${
                      formErrors.city ? "border-red-500" : "border-outline/15 focus:border-primary"
                    }`}
                  />
                  {formErrors.city && <p className="text-[10px] text-red-500">{formErrors.city}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant block">State / County</label>
                    <input
                      type="text"
                      required
                      placeholder="Nairobi"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                      className={`w-full bg-surface border rounded-xl px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary ${
                        formErrors.state ? "border-red-500" : "border-outline/15 focus:border-primary"
                      }`}
                    />
                    {formErrors.state && <p className="text-[10px] text-red-500">{formErrors.state}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant block">Zip Code</label>
                    <input
                      type="text"
                      required
                      placeholder="00100"
                      value={shippingForm.zipCode}
                      onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })}
                      className={`w-full bg-surface border rounded-xl px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary ${
                        formErrors.zipCode ? "border-red-500" : "border-outline/15 focus:border-primary"
                      }`}
                    />
                    {formErrors.zipCode && <p className="text-[10px] text-red-500">{formErrors.zipCode}</p>}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant block">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+254 7XX XXX XXX"
                    value={shippingForm.phone}
                    onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                    className={`w-full bg-surface border rounded-xl px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary ${
                      formErrors.phone ? "border-red-500" : "border-outline/15 focus:border-primary"
                    }`}
                  />
                  {formErrors.phone && <p className="text-[10px] text-red-500">{formErrors.phone}</p>}
                  <p className="text-[9px] text-on-surface-variant/60">We will send your order confirmation and payment details via WhatsApp.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 text-xs font-bold rounded-full text-center cursor-pointer glass-btn-ios-primary"
                id="shipping-next-btn"
              >
                Proceed to Delivery Method
              </button>
            </div>
          )}

          {/* STEP 2: SHIPPING METHOD */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200" id="checkout-step-2">
              <div className="flex items-center gap-2 border-b border-outline/5 pb-3">
                <Truck className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-base text-on-surface">Select Shipping Logistics</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${
                  shippingMethod === "standard"
                    ? "bg-primary-fixed/30 border-primary"
                    : "bg-surface border-outline/15 hover:bg-surface-container"
                }`}>
                  <div className="flex gap-3 items-start text-left">
                    <input type="radio" name="shipping-method" checked={shippingMethod === "standard"} onChange={() => setShippingMethod("standard")} className="mt-1 accent-primary w-4 h-4" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-on-surface block">Ecosystem Standard Delivery</span>
                      <span className="text-[11px] text-on-surface-variant/70 block">Takes 3 - 5 business days for transit.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary text-right">
                    {(subtotalUsd > 150 || subtotalKsh > 20000) ? "FREE" : (
                      <>
                        {hasKsh && <div>KSh 2,000</div>}
                        {hasUsd && <div>$15.00 USD</div>}
                      </>
                    )}
                  </span>
                </label>

                <label className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${
                  shippingMethod === "express"
                    ? "bg-primary-fixed/30 border-primary"
                    : "bg-surface border-outline/15 hover:bg-surface-container"
                }`}>
                  <div className="flex gap-3 items-start text-left">
                    <input type="radio" name="shipping-method" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} className="mt-1 accent-primary w-4 h-4" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-on-surface block">Axon Express Transit</span>
                      <span className="text-[11px] text-on-surface-variant/70 block">Takes 2 business days. Premium safety.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary text-right">
                    {hasKsh && <div>KSh 3,500</div>}
                    {hasUsd && <div>$25.00 USD</div>}
                  </span>
                </label>

                <label className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${
                  shippingMethod === "overnight"
                    ? "bg-primary-fixed/30 border-primary"
                    : "bg-surface border-outline/15 hover:bg-surface-container"
                }`}>
                  <div className="flex gap-3 items-start text-left">
                    <input type="radio" name="shipping-method" checked={shippingMethod === "overnight"} onChange={() => setShippingMethod("overnight")} className="mt-1 accent-primary w-4 h-4" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-on-surface block">Priority Overnight Air</span>
                      <span className="text-[11px] text-on-surface-variant/70 block">Next day delivery. Temperature managed.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary text-right">
                    {hasKsh && <div>KSh 6,000</div>}
                    {hasUsd && <div>$45.00 USD</div>}
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 text-xs font-bold rounded-full text-center cursor-pointer glass-btn-ios">
                  Back to Address
                </button>
                <button type="button" onClick={handleNextStep} className="flex-1 py-3 text-xs font-bold rounded-full text-center cursor-pointer glass-btn-ios-primary" id="shipping-method-next-btn">
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & PLACE ORDER */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200" id="checkout-step-3">
              <div className="flex items-center gap-2 border-b border-outline/5 pb-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-base text-on-surface">Review &amp; Place Order</h2>
              </div>

              {/* Shipping summary */}
              <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Ship To</span>
                  <button onClick={() => setStep(1)} className="text-[10px] text-primary font-bold hover:underline">Edit</button>
                </div>
                <p className="text-xs font-bold text-on-surface">{shippingForm.fullName}</p>
                <p className="text-[11px] text-on-surface-variant">{shippingForm.address}, {shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}</p>
                <p className="text-[11px] text-on-surface-variant">{shippingForm.phone}</p>
              </div>

              {/* Delivery summary */}
              <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Delivery Method</span>
                  <button onClick={() => setStep(2)} className="text-[10px] text-primary font-bold hover:underline">Edit</button>
                </div>
                <p className="text-xs font-bold text-on-surface capitalize">{shippingMethod} Delivery</p>
                <p className="text-[11px] text-on-surface-variant">
                  {shippingMethod === "standard" && "3 - 5 business days"}
                  {shippingMethod === "express" && "2 business days"}
                  {shippingMethod === "overnight" && "Next business day"}
                </p>
              </div>

              {/* Payment info notice */}
              <div className="bg-primary/5 border border-primary/15 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-bold text-on-surface">How Payment Works</h3>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  After placing your order, you will receive <strong>payment instructions via WhatsApp</strong> within minutes. Our team will confirm your order details and guide you through M-Pesa or bank transfer payment. Your order will be dispatched once payment is confirmed.
                </p>
                <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl">
                  <Banknote className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    <strong>Cash on Delivery (COD):</strong> Cashout is handled independently once your order is confirmed via WhatsApp. Our delivery partner will collect payment at the door. You will receive a confirmation message before dispatch.
                  </p>
                </div>
              </div>

              {/* Items summary */}
              <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Order Items</span>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {cart.map((item, idx) => {
                    if (!item?.product?.id) return null;
                    return (
                    <div key={`${item.product.id}-${idx}`} className="flex items-center gap-3 py-1">
                      <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg bg-[#f5f5f5] p-1 border object-contain shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-on-surface truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-on-surface-variant/70">Qty: {item.quantity} {item.selectedColor ? `| ${item.selectedColor}` : ""}</p>
                      </div>
                      <div className="text-[11px] font-bold text-on-surface text-right">
                        {item.product.priceKsh !== undefined && <div>KSh {(item.product.priceKsh * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                        {item.product.price !== undefined && <div>${(item.product.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 text-xs font-bold rounded-full text-center cursor-pointer glass-btn-ios">
                  Back to Delivery
                </button>
                <button type="button" onClick={handleSubmitOrder} className="flex-1 py-3 text-xs font-bold rounded-full text-center cursor-pointer glass-btn-ios-primary flex items-center justify-center gap-2" id="checkout-submit-order-btn">
                  <MessageSquare className="w-4 h-4" />
                  Place Order via WhatsApp
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Order Summary Side Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-low border border-outline/10 p-6 rounded-3xl text-left space-y-4">
            <h3 className="font-display font-bold text-sm text-on-surface pb-3 border-b border-outline/10 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>Order Summary</span>
            </h3>

            <div className="max-h-56 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {cart.map((item, idx) => {
                if (!item?.product?.id) return null;
                return (
                <div key={`${item.product.id}-${idx}`} className="flex items-center gap-3 py-1">
                  <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg bg-surface p-1 border object-contain shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-on-surface truncate">{item.product.name}</h4>
                    <p className="text-[10px] text-on-surface-variant/70 font-medium">Qty: {item.quantity} {item.selectedColor ? `| ${item.selectedColor}` : ""}</p>
                  </div>
                  <div className="text-xs font-bold text-on-surface text-right">
                    {item.product.priceKsh !== undefined && <div>KSh {(item.product.priceKsh * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                    {item.product.price !== undefined && <div>${(item.product.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>}
                  </div>
                </div>
                );
              })}
            </div>

            <div className="border-t border-outline/10 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <div className="text-right">
                  {hasKsh && <div>KSh {subtotalKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                  {hasUsd && <div>${subtotalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>}
                </div>
              </div>
              
              {discountPercentage > 0 && (
                <div className="flex justify-between text-green-700 font-medium bg-green-50/50 px-2 py-0.5 rounded">
                  <span>Discount ({discountPercentage}%)</span>
                  <div className="text-right">
                    {hasKsh && <div>-KSh {discountAmountKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                    {hasUsd && <div>-${discountAmountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>}
                  </div>
                </div>
              )}

              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping ({shippingMethod})</span>
                <div className="text-right">
                  {hasKsh && <div>{shippingCostKsh === 0 ? <span className="text-green-700 font-bold">FREE</span> : `KSh ${shippingCostKsh.toLocaleString()}`}</div>}
                  {hasUsd && <div>{shippingCostUsd === 0 ? <span className="text-green-700 font-bold">FREE</span> : `$${shippingCostUsd.toFixed(2)} USD`}</div>}
                </div>
              </div>

              <div className="flex justify-between text-on-surface-variant">
                <span>Taxes (8%)</span>
                <div className="text-right">
                  {hasKsh && <div>KSh {taxesKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                  {hasUsd && <div>${taxesUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>}
                </div>
              </div>

              <div className="border-t border-outline/10 pt-3 flex justify-between text-sm font-black text-on-surface font-display">
                <span>Total</span>
                <div className="text-right font-bold text-primary">
                  {hasKsh && <div>KSh {totalKsh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
                  {hasUsd && <div>${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline/5 p-4 rounded-2xl text-left space-y-2.5">
            <h4 className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider">The Axon Promise</h4>
            <p className="text-[10px] text-on-surface-variant/60 leading-relaxed">
              Purchases are fully backed by our continuous 3-Year authorized hardware protection. Fast temperature-controlled transit secures original calibrations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
