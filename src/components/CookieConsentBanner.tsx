import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, X, ChevronDown, ChevronUp } from "lucide-react";

const CONSENT_KEY = "axon_cookie_consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (!consent) {
        // Delay appearance so it doesn't compete with page load
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {}
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "declined");
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-5 pointer-events-none"
        >
          <div className="max-w-2xl mx-auto pointer-events-auto rounded-2xl border border-outline-variant/40 bg-surface-container-low/95 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/30 dark:bg-surface-container-high/95 dark:border-outline-variant/20">
            {/* Header row */}
            <div className="flex items-start gap-3 px-5 pt-4 pb-3">
              <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-on-surface font-display tracking-tight">
                  We value your privacy
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                  We use cookies and local storage to keep our site working, remember your cart,
                  and improve your experience. You can accept all cookies or manage your preferences.
                </p>
              </div>
              <button
                onClick={decline}
                aria-label="Dismiss cookie banner"
                className="flex-shrink-0 p-1.5 rounded-full text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Expandable details */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-3 text-xs leading-relaxed text-on-surface-variant space-y-2">
                    <div className="p-3 rounded-xl bg-surface-container/60 dark:bg-surface-container-low/60 border border-outline-variant/30">
                      <p className="font-medium text-on-surface mb-1.5">What we store:</p>
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span><strong className="text-on-surface">Shopping cart</strong> &mdash; to remember your items across pages</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                          <span><strong className="text-on-surface">Dark mode</strong> &mdash; to save your display preference</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary mt-1.5 flex-shrink-0" />
                          <span><strong className="text-on-surface">Promo codes</strong> &mdash; to apply discounts at checkout</span>
                        </li>
                      </ul>
                      <p className="mt-2 text-on-surface-variant/80 italic">
                        We do not use third-party tracking cookies. For full details see our Cookie Policy in the footer.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action row */}
            <div className="flex items-center gap-2 px-5 pb-4 pt-1">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    Less info
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    More info
                  </>
                )}
              </button>

              <div className="flex-1" />

              <button
                onClick={decline}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container hover:border-outline transition-all"
              >
                Decline
              </button>

              <button
                onClick={accept}
                className="glass-btn-ios-primary px-5 py-2 text-xs font-semibold rounded-xl"
              >
                Accept Cookies
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
