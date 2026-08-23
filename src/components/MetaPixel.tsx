import { useEffect } from "react";
import API_ROUTES from "../config/api-routes";

declare global {
  interface Window {
    fbq: any;
    __META_PIXEL_ID__: string;
  }
}

interface MetaPixelProps {
  pixelId: string;
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  useEffect(() => {
    if (!pixelId) return;

    // Set the global for the base code already in index.html
    window.__META_PIXEL_ID__ = pixelId;

    // Init if base code loaded
    if (typeof window.fbq === "function") {
      window.fbq("init", pixelId);
      window.fbq("track", "PageView");
    }
  }, [pixelId]);

  return null;
}

// Convenience: fire a Meta Pixel event from anywhere
export function fbq(event: string, data?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, data);
  }
}
