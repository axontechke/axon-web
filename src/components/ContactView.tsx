import React, { useState, useEffect } from "react";
import { Mail, MessageSquare, Twitter, Github, Linkedin, Send, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";
import API_ROUTES from "../config/api-routes";

export const ContactView: React.FC = () => {
  const [contact, setContact] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMobileMap, setShowMobileMap] = useState(false);

  useEffect(() => {
    // Load contact details and config from database
    Promise.all([
      fetch(API_ROUTES.contact?.get || "/api/contact").then(res => res.ok ? res.json() : null),
      fetch(API_ROUTES.config.get).then(res => res.ok ? res.json() : null)
    ]).then(([contactData, configData]) => {
      if (contactData) setContact(contactData);
      if (configData) setConfig(configData);
    }).catch(err => console.error("Error loading contact config:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formSubject || !formMessage) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch(API_ROUTES.supportRequests.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          subject: formSubject,
          message: formMessage,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormName("");
        setFormEmail("");
        setFormSubject("");
        setFormMessage("");
      } else {
        setErrorMessage("Unable to log support message. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Network error. Could not reach server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use database contact details, fall back to defaults
  const contactEmail = config?.contactEmail || contact?.emails?.general || "axontechkenya@gmail.com";
  const supportEmail = config?.supportEmail || contact?.emails?.sales || "sales@axontechke.com";
  const infoEmail = contact?.emails?.info || "info@axontechke.com";
  const formattedPhone = contact?.phones?.formattedPrimary || "+254 745 017979";
  const rawPhone = contact?.phones?.primary || "+254745017979";
  const whatsappUrl = contact?.phones?.whatsapp || "https://wa.me/254745017979";
  const address = contact?.location?.addressString || "Simara Mall, Ground Floor, Shop G50, Nairobi, Kenya";
  const businessName = contact?.businessName || "Axon Technologies Kenya";
  const tagline = contact?.tagline || "Your Trusted Technology Partner in Kenya";
  const businessHours = contact?.businessHours || { weekdays: "Monday – Saturday: 8:00 AM – 6:00 PM EAT", supportCall: "8:00 AM – 8:00 PM EAT" };
  const socials = contact?.socials || [];
  const locationIcon = contact?.location?.icon || "";
  const embedUrl = contact?.location?.embedUrl || "";
  const externalUrl = contact?.location?.externalUrl || "https://maps.google.com/?q=Simara+Mall+Ground+Floor+Shop+G50+Nairobi";

  // Show loading state while data loads
  if (!contact) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-high rounded w-64 mx-auto"></div>
          <div className="h-4 bg-surface-container-high rounded w-96 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 md:py-12" id="contact-us-page">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
          Communications Node
        </span>
        <h1 className="font-display font-black text-3xl md:text-4xl text-on-surface mt-2 tracking-tight">
          {businessName} Synergy &amp; Care
        </h1>
        <p className="text-sm text-on-surface-variant/70 mt-3 leading-relaxed font-medium">
          {tagline}. Need custom system calibrations, shipping dispatches, or enterprise setups? Our team responds within 12 standard business cycles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info panel (Col: 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container border border-outline/10 p-6 md:p-8 rounded-[32px] space-y-6 text-left shadow-sm">
            <h2 className="font-display font-bold text-lg text-on-surface">
              Direct Contact Channels
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {/* Ecosystem Registry */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">Ecosystem Registry</h4>
                  <a href={`mailto:${contactEmail}`} className="text-xs text-on-surface font-semibold hover:text-primary transition-colors block mt-0.5">
                    {contactEmail}
                  </a>
                  {infoEmail && (
                    <a href={`mailto:${infoEmail}`} className="text-[11px] text-on-surface-variant hover:text-primary transition-colors block mt-0.5">
                      {infoEmail}
                    </a>
                  )}
                </div>
              </div>

              {/* Support Despatch */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">Support Despatch</h4>
                  <a href={`mailto:${supportEmail}`} className="text-xs text-on-surface font-semibold hover:text-primary transition-colors block mt-0.5">
                    {supportEmail}
                  </a>
                </div>
              </div>

              {/* Hotline & WhatsApp */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">Hotline &amp; WhatsApp</h4>
                  <a href={`tel:${rawPhone}`} className="text-xs text-on-surface font-semibold hover:text-primary transition-colors block mt-0.5">
                    {formattedPhone}
                  </a>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-500 font-bold hover:underline block mt-0.5">
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              {/* Location Headquarters */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <img src={locationIcon} alt="Location Icon" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">Location HQ</h4>
                  <span className="text-xs text-on-surface block mt-0.5 font-medium leading-relaxed">
                    {address}
                  </span>
                  <button
                    onClick={() => setShowMobileMap(!showMobileMap)}
                    className="sm:hidden text-[11px] text-primary font-bold hover:underline flex items-center gap-1 mt-1"
                    type="button"
                  >
                    {showMobileMap ? "Hide Map" : "View Map"}
                  </button>
                </div>
              </div>

              {/* Operational Cycles */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">Operational Cycles</h4>
                  <span className="text-xs text-on-surface block mt-0.5 leading-relaxed">
                    {businessHours.weekdays}
                  </span>
                  <span className="text-[11px] text-on-surface-variant block mt-0.5 leading-relaxed">
                    Support: {businessHours.supportCall}
                  </span>
                </div>
              </div>
            </div>

            {socials.length > 0 && (
              <div className="border-t border-outline/10 pt-6">
                <h3 className="font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-3">
                  Social Integration Streams
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socials.map((social: any) => (
                    <a 
                      key={social.name}
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline/15 hover:bg-primary/10 hover:border-primary/30 hover:scale-105 transition-all text-on-surface text-xs font-semibold shadow-sm"
                      title={social.name}
                    >
                      <img src={social.icon} alt={social.name} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                      <span>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form panel (Col: 7) */}
        <div className="lg:col-span-7">
          <div className="bg-surface border border-outline/10 p-6 md:p-8 rounded-[32px] text-left shadow-sm">
            <h2 className="font-display font-bold text-lg text-on-surface mb-6">
              Despatch a Telemetry Message
            </h2>

            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 border border-primary/15 p-6 rounded-2xl text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-on-surface">Message Registered Successfully</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                  We have queued your communications transmission under compliance tag AXN-INQ-{Math.floor(1000 + Math.random() * 9000)}. A specialist will respond via email.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 text-xs font-bold rounded-full cursor-pointer glass-btn-ios-primary"
                >
                  Send another transmission
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Stephen Paul"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. email@axon.net"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary text-on-surface"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Inquiry Subject</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Custom Corporate Volume Hardware Pricing"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary text-on-surface"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Detailed Transmission Message</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Provide relevant parameters, device IDs, or detailed request descriptors..."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary text-on-surface resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 glass-btn-ios-primary"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Transmitting..." : "Send Secure Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Location Map Node */}
      <div className="mt-8 md:mt-12 border border-outline/10 rounded-[32px] overflow-hidden bg-surface-container-low shadow-sm">
        <div className="p-5 border-b border-outline/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
              <img src={locationIcon} alt="Map Pin" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-bold text-sm text-on-surface">Interactive Showroom Location</h3>
              <p className="text-[11px] text-on-surface-variant/70 font-mono font-medium">{address}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              onClick={() => setShowMobileMap(!showMobileMap)}
              className="sm:hidden px-3.5 py-2 text-xs font-bold bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center gap-1.5 hover:bg-primary/15 transition-all"
            >
              {showMobileMap ? "Hide Map" : "View Map Inline"}
            </button>
            
            <a 
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-bold bg-surface-container border border-outline/15 text-on-surface rounded-xl hover:bg-surface-container-high transition-all flex items-center gap-1.5"
            >
              <span>Open Google Maps</span>
              <Send className="w-3 h-3 text-primary" />
            </a>
          </div>
        </div>

        {/* Map Area */}
        <div className={`transition-all duration-300 ${showMobileMap ? "block" : "hidden sm:block"}`}>
          <div className="relative w-full h-[280px] sm:h-[350px] md:h-[400px] bg-surface-container-high">
            <iframe 
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            />
          </div>
        </div>
        
        {/* Mobile quick help tip */}
        {!showMobileMap && (
          <div className="block sm:hidden p-3 text-center bg-surface-container/20 border-t border-outline/5">
            <p className="text-[10px] text-on-surface-variant/85 font-medium">
              Map is hidden on phones to conserve screen space. Tap{" "}
              <button onClick={() => setShowMobileMap(true)} className="text-primary font-bold hover:underline" type="button">
                View Map Inline
              </button>{" "}
              or use Google Maps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
