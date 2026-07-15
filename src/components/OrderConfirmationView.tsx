import React from "react";
import { CheckCircle, ShieldCheck, ArrowRight, MessageSquare, CreditCard, Building2, Smartphone } from "lucide-react";

interface OrderConfirmationViewProps {
  orderDetails: {
    customer: {
      fullName: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      phone?: string;
    };
    shippingMethod: string;
    shippingCost: number;
    subtotal: number;
    taxes: number;
    total: number;
    totalUsd?: number;
    totalKsh?: number;
    hasUsd?: boolean;
    hasKsh?: boolean;
    payment: {
      lastFour: string;
      method?: string;
    };
  };
  orderId?: string;
  config?: any;
  onReturnHome: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  orderDetails,
  orderId,
  config,
  onReturnHome,
}) => {
  const warrantyCode = React.useMemo(() => {
    return `WTY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }, []);

  const mpesaConfig = config?.paymentMpesa || { till: "123456", name: "AXON TECHNOLOGIES KE" };
  const bankConfig = config?.paymentBank || {
    name: "KCB Bank",
    accountName: "Axon Technologies Kenya Limited",
    accountNumber: "1234567890",
    branch: "Kencom Branch",
    swiftCode: "KCBLKENA"
  };

  const hasUsd = orderDetails.hasUsd ?? (orderDetails.subtotal > 0);
  const hasKsh = orderDetails.hasKsh ?? (orderDetails.totalKsh !== undefined && orderDetails.totalKsh > 0);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center space-y-8 animate-in fade-in duration-300" id="order-confirmation-container">
      {/* Dynamic Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center text-green-600 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
      </div>

      {/* Greeting */}
      <div className="space-y-2">
        <h1 className="font-display font-black text-3xl text-on-surface tracking-tight">
          Order Received!
        </h1>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
          Your order <strong className="text-on-surface font-mono">{orderId || "AXN-XXXXXX"}</strong> has been registered. Payment instructions have been sent to your WhatsApp. Our team will confirm your order within minutes.
        </p>
      </div>

      {/* Warranty Card */}
      <div className="bg-primary-fixed/30 border border-primary/10 rounded-2xl p-4 flex items-center gap-3 text-left">
        <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
        <div className="space-y-0.5 text-xs">
          <span className="font-bold text-primary uppercase block tracking-wider">3-Year Warranty Activated</span>
          <span className="text-on-surface-variant block">Your registered license core is: <strong>{warrantyCode}</strong>.</span>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-6 text-left space-y-5">
        <div className="flex items-center gap-2 border-b border-outline/5 pb-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-sm text-on-surface">Payment Instructions</h2>
        </div>

        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          Complete your payment using one of the methods below. After payment, send your confirmation receipt via WhatsApp to <strong className="text-on-surface">{config?.contactPhone || "+254 745 017979"}</strong> for instant order processing.
        </p>

        {/* M-Pesa */}
        <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-on-surface">M-Pesa Paybill</h3>
              <p className="text-[10px] text-on-surface-variant">Lipa Na M-Pesa Online</p>
            </div>
          </div>
          <div className="bg-surface-container p-3 rounded-xl space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Business Number:</span>
              <span className="font-mono font-bold text-on-surface">{mpesaConfig.till}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Account Name:</span>
              <span className="font-bold text-on-surface">{mpesaConfig.name}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Amount:</span>
              <span className="font-bold text-primary">
                {hasKsh && <span>KSh {orderDetails.totalKsh?.toLocaleString() || orderDetails.total.toLocaleString()}</span>}
                {hasUsd && !hasKsh && <span>${orderDetails.totalUsd?.toFixed(2) || orderDetails.total.toFixed(2)} USD</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Bank Transfer */}
        <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-on-surface">Bank Transfer</h3>
              <p className="text-[10px] text-on-surface-variant">Direct bank deposit or EFT</p>
            </div>
          </div>
          <div className="bg-surface-container p-3 rounded-xl space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Bank:</span>
              <span className="font-bold text-on-surface">{bankConfig.name}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Account Name:</span>
              <span className="font-bold text-on-surface">{bankConfig.accountName}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Account Number:</span>
              <span className="font-mono font-bold text-on-surface">{bankConfig.accountNumber}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Branch:</span>
              <span className="text-on-surface">{bankConfig.branch}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Swift Code:</span>
              <span className="font-mono text-on-surface">{bankConfig.swiftCode}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/254745017979?text=Hello! I just placed order ${orderId || "AXN-XXXXXX"} and I'd like to confirm my payment. Here is my receipt.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Send Payment Confirmation via WhatsApp
        </a>
      </div>

      {/* Order Summary */}
      <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-6 text-left space-y-4">
        <div className="flex justify-between items-center border-b border-outline/5 pb-3 text-xs">
          <span className="text-on-surface-variant/75 font-semibold">Order Tracking ID:</span>
          <span className="font-mono font-bold text-on-surface text-sm">{orderId || "AXN-XXXXXX"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-on-surface-variant/70 font-semibold block">Ship To:</span>
            <div className="text-on-surface font-medium space-y-0.5">
              <span className="block font-bold">{orderDetails.customer.fullName}</span>
              <span className="block">{orderDetails.customer.address}</span>
              <span className="block">{orderDetails.customer.city}, {orderDetails.customer.state} {orderDetails.customer.zipCode}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-on-surface-variant/70 font-semibold block">Shipping &amp; Logistics:</span>
            <span className="text-on-surface font-bold block uppercase">{orderDetails.shippingMethod} Delivery</span>
            <span className="text-on-surface-variant block">Estimated transit: 1 - 4 business days.</span>
          </div>

          <div className="space-y-1">
            <span className="text-on-surface-variant/70 font-semibold block">Payment Status:</span>
            <span className="text-on-surface font-bold block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Awaiting Payment Confirmation
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-on-surface-variant/70 font-semibold block">Total Amount:</span>
            <div className="font-black text-primary font-display text-sm">
              {hasKsh && <span>KSh {orderDetails.totalKsh?.toLocaleString() || orderDetails.total.toLocaleString()}</span>}
              {hasUsd && !hasKsh && <span>${orderDetails.totalUsd?.toFixed(2) || orderDetails.total.toFixed(2)} USD</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Return home */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReturnHome}
          className="px-8 py-3.5 rounded-full text-xs font-bold flex items-center gap-2 hover:gap-3 cursor-pointer glass-btn-ios-primary"
          id="confirmation-home-btn"
        >
          Explore more hardware
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
