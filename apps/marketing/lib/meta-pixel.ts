export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1278715326752313";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Rastrear un evento estándar o personalizado de Meta Pixel de forma segura.
 */
export const trackMetaEvent = (eventName: string, options?: Record<string, any>) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (options) {
      window.fbq("track", eventName, options);
    } else {
      window.fbq("track", eventName);
    }
  }
};

/**
 * Rastrear inscripción a un evento/webinar (Evento tipo 'Lead')
 */
export const trackEventInscription = (eventTitle?: string, eventSlug?: string) => {
  trackMetaEvent("Lead", {
    content_name: eventTitle || "Evento LUMINUS",
    content_category: "event_inscription",
    event_slug: eventSlug || "",
  });
};
