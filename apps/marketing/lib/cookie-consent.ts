export const COOKIE_CONSENT_NAME = "luminus_cookie_consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

export const CONSENT_UPDATED_EVENT = "luminus:consent-updated";
export const OPEN_COOKIE_SETTINGS_EVENT = "luminus:open-cookie-settings";

export type CookieCategory = "necessary" | "analytics" | "marketing";

export interface CookieConsentPreferences {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export function parseCookieConsent(rawValue: string | null | undefined): CookieConsentPreferences | null {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue));
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.version !== COOKIE_CONSENT_VERSION ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.marketing !== "boolean"
    ) {
      return null;
    }
    return {
      version: COOKIE_CONSENT_VERSION,
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export function getCookieConsent(cookieSource?: string): CookieConsentPreferences | null {
  const source =
    cookieSource !== undefined
      ? cookieSource
      : typeof document !== "undefined"
        ? document.cookie
        : "";

  if (!source) return null;

  const prefix = `${COOKIE_CONSENT_NAME}=`;
  const parts = source.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return parseCookieConsent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

export function setCookieConsent(input: {
  analytics: boolean;
  marketing: boolean;
}): CookieConsentPreferences {
  const prefs: CookieConsentPreferences = {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics: Boolean(input.analytics),
    marketing: Boolean(input.marketing),
    updatedAt: new Date().toISOString(),
  };

  if (typeof document !== "undefined") {
    const encoded = encodeURIComponent(JSON.stringify(prefs));
    const secureFlag =
      typeof window !== "undefined" && window.location?.protocol === "https:"
        ? "; Secure"
        : "";
    document.cookie = `${COOKIE_CONSENT_NAME}=${encoded}; Path=/; Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secureFlag}`;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: prefs }));
  }

  return prefs;
}

export function hasConsented(category: CookieCategory, cookieSource?: string): boolean {
  if (category === "necessary") return true;
  const prefs = getCookieConsent(cookieSource);
  if (!prefs) return false;
  return Boolean(prefs[category]);
}

export function openCookieSettings(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
  }
}
