import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Mail,
  Shield,
  CheckCircle,
  X,
  FileText,
  Lock,
  EyeOff,
  RefreshCw,
  Truck,
  Info,
  Check,
  MapPin,
  Phone
} from "lucide-react";
import API_ROUTES from "../config/api-routes";

type DocType = "privacy" | "terms" | "cookies" | "dns" | "refund" | "delivery";

interface FooterProps {
  onNavigate?: (screen: string) => void;
  config?: any;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, config: parentConfig }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocType | null>(null);
  const [localConfig, setLocalConfig] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);

  useEffect(() => {
    if (!parentConfig) {
      fetch(API_ROUTES.config.get)
        .then(res => res.json())
        .then(data => setLocalConfig(data))
        .catch(err => console.error("Error loading footer config:", err));
    }
    fetch(API_ROUTES.contact?.get || "/api/contact")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setContact(data); })
      .catch(err => console.error("Error loading footer contact:", err));
  }, [parentConfig]);

  const config = parentConfig || localConfig;

  // CCPA Form states
  const [optOutEmail, setOptOutEmail] = useState("");
  const [optOutName, setOptOutName] = useState("");
  const [optOutRegion, setOptOutRegion] = useState("California");
  const [optOutSubmitted, setOptOutSubmitted] = useState(false);
  const [optOutSuccessMsg, setOptOutSuccessMsg] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const handleOptOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (optOutEmail.trim() && optOutName.trim()) {
      const trackingCode = `AXN-CCPA-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem("axon_dns_opt_out", JSON.stringify({
        email: optOutEmail,
        name: optOutName,
        region: optOutRegion,
        timestamp: new Date().toISOString(),
        code: trackingCode
      }));
      setOptOutSubmitted(true);
      setOptOutSuccessMsg(`CCPA Opt-Out request has been logged successfully. Consent tracking ID: ${trackingCode}`);
    }
  };

  const openDocument = (doc: DocType) => {
    setActiveDoc(doc);
    if (doc === "dns") {
      setOptOutSubmitted(false);
      setOptOutSuccessMsg("");
    }
    document.body.style.overflow = "hidden";
  };

  const closeDocument = () => {
    setActiveDoc(null);
    document.body.style.overflow = "";
  };

  // Derived values from database
  const businessName = config?.footerBrandName || contact?.businessName || "AXON";
  const brandSuffix = config?.footerBrandSuffix || "TECH";
  const brandLogo = config?.footerBrandLogoUrl || "";
  const footerDesc = config?.footerDescription || `${businessName} | Your Trusted Technology Partner`;
  const address = contact?.location?.addressString || "";
  const formattedPhone = contact?.phones?.formattedPrimary || "";
  const salesEmail = contact?.emails?.sales || "";
  const socials = config?.socials || [];
  const warrantyText = config?.footerWarrantyText || "Authorized Retailer warranty included";
  const col1Title = config?.footerCol1Title || "Shop";
  const col1Links = config?.footerCol1Links || [];
  const col2Title = config?.footerCol2Title || "Support & Care";
  const col2Links = config?.footerCol2Links || [];
  const copyrightText = config?.footerCopyrightText || `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`;
  const newsletterTitle = config?.footerNewsletterTitle || "Stay Updated";
  const newsletterDesc = config?.footerNewsletterDescription || "Subscribe to receive notifications on new arrivals, deals, and exclusive bundles.";
  const bottomLinks = config?.footerBottomLinks || [
    { text: "Privacy Policy", target: "privacy" },
    { text: "Cookie Policy", target: "cookies" },
    { text: "Terms of Service", target: "terms" },
    { text: "Refund Policy", target: "refund" },
    { text: "Delivery Logistics", target: "delivery" },
    { text: "Do Not Sell My Info", target: "dns" }
  ];

  const handleBottomLinkClick = (target: string) => {
    if (target === "privacy") openDocument("privacy");
    else if (target === "cookies") openDocument("cookies");
    else if (target === "terms") openDocument("terms");
    else if (target === "refund") openDocument("refund");
    else if (target === "delivery") openDocument("delivery");
    else if (target === "dns") openDocument("dns");
    else if (onNavigate) {
      if (target === "/") onNavigate("Home");
      else if (target === "/catalog") onNavigate("Catalog");
      else if (target === "/contact") onNavigate("Contact");
      else if (target === "/track-order") onNavigate("Track");
      else if (target === "/blog") onNavigate("Blog");
    }
  };

  return (
    <footer className="bg-[#1c1b1b] text-[#f3ece9] border-t border-[#857068]/20 mt-20" id="main-footer">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="space-y-4 text-left">
          <div className="flex flex-row items-center gap-2 shrink-0 whitespace-nowrap">
            <img 
              src={brandLogo || undefined}
              alt={`${businessName} Logo`}
              className="w-8 h-8 object-contain shrink-0 brightness-0 invert"
              referrerPolicy="no-referrer"
            />
            <span className="font-display font-bold text-xl tracking-tight text-white select-none">
              {businessName}<span className="text-[#ffdbce] font-light">{brandSuffix}</span>
            </span>
          </div>
          <p className="text-xs text-[#e2d5cf]/70 max-w-[280px] leading-relaxed">
            {footerDesc}
          </p>
          <div className="space-y-1.5 py-2.5 border-t border-white/5 text-xs text-[#e2d5cf]/60">
            {address && (
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#ffdbce] shrink-0" />
                <span>{address}</span>
              </p>
            )}
            {formattedPhone && (
              <a href={`tel:${formattedPhone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-[#ffdbce] transition-colors">
                <Phone className="w-3.5 h-3.5 text-[#ffdbce] shrink-0" />
                <span>{formattedPhone}</span>
              </a>
            )}
            {salesEmail && (
              <a href={`mailto:${salesEmail}`} className="flex items-center gap-2 hover:text-[#ffdbce] transition-colors">
                <Mail className="w-3.5 h-3.5 text-[#ffdbce] shrink-0" />
                <span>{salesEmail}</span>
              </a>
            )}
          </div>
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {socials.map((social: any) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 hover:scale-105 transition-all border border-white/10 text-[10px] text-[#e2d5cf]/80 hover:text-white"
                  title={social.name}
                >
                  <img src={social.icon} alt={social.name} className="w-3.5 h-3.5 object-contain shrink-0" referrerPolicy="no-referrer" />
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-[#e2d5cf]/60 bg-white/5 p-3 rounded-xl border border-white/10 w-fit">
            <Shield className="w-4 h-4 text-[#ffdbce]" />
            <span>{warrantyText}</span>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-3 text-left">
          <h4 className="font-display font-semibold text-sm text-white tracking-wider uppercase">
            {col1Title}
          </h4>
          <ul className="space-y-2 text-xs text-[#e2d5cf]/85">
            {col1Links.map((link: any, idx: number) => (
              <li key={idx}>
                <button onClick={() => handleBottomLinkClick(link.target)} className="hover:text-[#ffdbce] transition-colors text-left">
                  {link.text}
                </button>
              </li>
            ))}
            {onNavigate && (
              <li>
                <button 
                  onClick={() => onNavigate("Blog")} 
                  className="text-primary hover:text-[#ffdbce] font-semibold transition-colors text-left flex items-center gap-1.5"
                  id="footer-nav-blog"
                >
                  <span>●</span> Blog
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-3 text-left">
          <h4 className="font-display font-semibold text-sm text-white tracking-wider uppercase">
            {col2Title}
          </h4>
          <ul className="space-y-2 text-xs text-[#e2d5cf]/85">
            {col2Links.map((link: any, idx: number) => (
              <li key={idx}>
                <button onClick={() => handleBottomLinkClick(link.target)} className="hover:text-[#ffdbce] transition-colors text-left">
                  {link.text}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="space-y-3 text-left">
          <h4 className="font-display font-semibold text-sm text-white tracking-wider uppercase">{newsletterTitle}</h4>
          <p className="text-xs text-[#e2d5cf]/70 leading-relaxed">
            {newsletterDesc}
          </p>
          
          {subscribed ? (
            <div className="flex items-center gap-2 text-[#ffb59a] bg-[#ff5c00]/20 border border-[#ff5c00]/30 p-2.5 rounded-xl text-xs font-medium animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 shrink-0 text-[#ffdbce]" />
              <span>Subscribed! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="relative flex items-center shadow-sm" id="newsletter-form">
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-xs focus:outline-none focus:border-[#ffdbce] focus:ring-1 focus:ring-[#ffdbce] text-white placeholder:text-white/45"
              />
              <button
                type="submit"
                className="absolute right-1 p-1.5 rounded-full bg-primary hover:bg-primary-hover text-white transition-colors"
                id="newsletter-submit-btn"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 py-6 px-6 text-left text-[10px] text-[#e2d5cf]/40 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-3">
        <span>{copyrightText}</span>
        <div className="flex flex-wrap gap-4 justify-start">
          {bottomLinks.map((link: any, idx: number) => (
            <button 
              key={idx}
              onClick={() => handleBottomLinkClick(link.target)} 
              className={`hover:underline hover:text-white transition-colors ${link.target === "dns" ? "text-primary font-medium" : ""}`}
            >
              {link.text}
            </button>
          ))}
        </div>
      </div>

      {/* FULL POLICY DOCUMENT MODAL OVERLAY */}
      {activeDoc !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300" id="legal-policy-modal">
          <div className="absolute inset-0 -z-10" onClick={closeDocument} />

          <div className="bg-[#181717] border border-[#857068]/25 rounded-[32px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative">
            
            <div className="p-6 border-b border-[#857068]/15 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                {activeDoc === "privacy" && <Lock className="w-6 h-6 text-[#ff5c00]" />}
                {activeDoc === "terms" && <FileText className="w-6 h-6 text-[#ff5c00]" />}
                {activeDoc === "cookies" && <Shield className="w-6 h-6 text-[#ff5c00]" />}
                {activeDoc === "dns" && <EyeOff className="w-6 h-6 text-[#ff5c00]" />}
                {activeDoc === "refund" && <RefreshCw className="w-6 h-6 text-[#ff5c00]" />}
                {activeDoc === "delivery" && <Truck className="w-6 h-6 text-[#ff5c00]" />}

                <div>
                  <h2 className="font-display font-black text-lg text-white tracking-tight">
                    {activeDoc === "privacy" && "AXON Privacy Charter"}
                    {activeDoc === "terms" && "Terms of Service"}
                    {activeDoc === "cookies" && "Cookie & Local Storage Policy"}
                    {activeDoc === "dns" && "CCPA Do Not Sell Request"}
                    {activeDoc === "refund" && "Refund & Return Logistics"}
                    {activeDoc === "delivery" && "Delivery & Shipping Standards"}
                  </h2>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#ffdbce]/50">
                    AXON Corporate Compliance Registry v4.12
                  </span>
                </div>
              </div>
              <button 
                onClick={closeDocument}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto text-left space-y-6 text-xs text-[#e2d5cf]/90 scrollbar-thin scrollbar-thumb-white/10 leading-relaxed">
              
              {activeDoc === "privacy" && (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[#ffdbce] font-medium leading-normal">
                      We keep your data private and only use it to process your orders. We don't sell or share your personal information.
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-[#e2d5cf]/90">
                    {config?.privacyPolicy || `AXON TECH only collects information needed to process your order — your name, delivery address, phone number, and payment details. We do not share your data with third parties except for order fulfillment (courier and payment processor).`}
                  </p>
                </div>
              )}

              {activeDoc === "terms" && (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap leading-relaxed text-[#e2d5cf]/90">
                    {config?.termsOfUse || `These Terms of Service govern all purchases and use of the AXON TECH online store. By placing an order you agree to our pricing, delivery timelines, and return policy.`}
                  </p>
                </div>
              )}

              {activeDoc === "cookies" && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-[#ffdbce] text-xs">Active Storage Keys Checklist</h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#e2d5cf]/70">
                      <div>🗝️ <span className="text-white">axon_cart</span>: Active items list</div>
                      <div>🗝️ <span className="text-white">axon_promo_code</span>: Active coupon</div>
                      <div>🗝️ <span className="text-white">axon_opt_out</span>: CCPA Opt-Out preference</div>
                      <div>🗝️ <span className="text-white">axon_orders</span>: Local delivery memory</div>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-[#e2d5cf]/90">
                    {config?.cookiePolicy || `We use cookies and localStorage to remember what's in your cart, save your preferences, and provide a smooth shopping experience. We don't use tracking cookies or share your browsing data with third parties.`}
                  </p>
                </div>
              )}

              {activeDoc === "dns" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p>
                      Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), you possess the sovereign right to opt-out of the "sale" or "sharing" of your personal tracking identifiers.
                    </p>
                    <p className="text-on-surface-variant/80">
                      AXON TECH never exchanges your personal name or delivery logs for financial compensation. However, we do transfer postal shipping coordinates to certified delivery partners (e.g. UPS, FedEx) to fulfill physical hardware shipments. You may formally submit an opt-out preference below:
                    </p>
                  </div>

                  {optOutSubmitted ? (
                    <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" />
                      </div>
                      <h4 className="font-display font-bold text-sm text-white">CCPA Request Registered</h4>
                      <p className="text-[#e2d5cf]/85 text-xs">
                        {optOutSuccessMsg}
                      </p>
                      <p className="text-[10px] text-[#e2d5cf]/50 uppercase font-mono">
                        Verification Code: CCPA-{Math.floor(1000 + Math.random() * 9000)}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleOptOutSubmit} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 text-left">
                      <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">Opt-Out Submission Form</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#e2d5cf]/70 uppercase">Full Legal Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="John Doe"
                            value={optOutName}
                            onChange={(e) => setOptOutName(e.target.value)}
                            className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#e2d5cf]/70 uppercase">Contact Email Address</label>
                          <input 
                            type="email" 
                            required
                            placeholder="john@example.com"
                            value={optOutEmail}
                            onChange={(e) => setOptOutEmail(e.target.value)}
                            className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#e2d5cf]/70 uppercase">State / Jurisdiction of Residency</label>
                        <select 
                          value={optOutRegion}
                          onChange={(e) => setOptOutRegion(e.target.value)}
                          className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary text-white"
                        >
                          <option value="California">California (CCPA/CPRA)</option>
                          <option value="Virginia">Virginia (VCDPA)</option>
                          <option value="Colorado">Colorado (CPA)</option>
                          <option value="Europe">Europe Union (GDPR)</option>
                          <option value="Other">Other Global Location</option>
                        </select>
                      </div>

                      <div className="flex items-start gap-2.5 pt-2">
                        <input 
                          type="checkbox" 
                          required 
                          id="dns-consent-checkbox" 
                          className="mt-0.5 rounded border-white/10 bg-[#1c1b1b] text-primary focus:ring-0"
                        />
                        <label htmlFor="dns-consent-checkbox" className="text-[10px] text-[#e2d5cf]/70 leading-normal cursor-pointer select-none">
                          I instruct AXON TECH to cease sharing any of my localized digital tracking variables and contact metrics with third-party logistics auditors.
                        </label>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md active:scale-[0.99] mt-2"
                      >
                        Transmit Opt-Out Request
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeDoc === "refund" && (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-xs">AXON 30-Day Guarantee</h4>
                      <p className="text-[#e2d5cf] text-[11px] leading-normal mt-1">
                        We offer a complete 30-day, risk-free guarantee. If you're not happy with your purchase, contact us and we'll arrange a return or exchange.
                      </p>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-[#e2d5cf]/90">
                    {config?.refundPolicy || `To initiate a hardware return, locate your physical tracking ID in the Track Order tab. Clicking "Initiate RMA" will instantly register your return request with our central dispatch warehouse.\n\nReturned computers (Axon Books) and tablets (Slate Series) must be securely logged out of cloud profiles and restored to pristine factory system settings.`}
                  </p>
                </div>
              )}

              {activeDoc === "delivery" && (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap leading-relaxed text-[#e2d5cf]/90">
                    {config?.deliveryPolicy || `AXON TECH ships all premium hardware in dual-box structural armors. Inner custom compartments are fully shielded against high-density static discharge. Our design aesthetic dictates that the unboxing experience must feel as pristine as booting up the silicon core for the first time.\n\nOrders placed before 12:00 PM UTC dispatch directly from our supply nodes on the same operational day.`}
                  </p>
                </div>
              )}

            </div>

            <div className="p-5 border-t border-[#857068]/15 bg-black/30 flex justify-end">
              <button 
                onClick={closeDocument}
                className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10"
              >
                Dismiss Document
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
};
