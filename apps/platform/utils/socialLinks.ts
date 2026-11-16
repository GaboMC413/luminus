const INSTAGRAM_USERNAME_REGEX = /^(?!.*\.\.)(?!\.)[a-zA-Z0-9._]{1,30}(?<!\.)$/;
const INSTAGRAM_RESERVED_PATHS = new Set([
  "p",
  "reel",
  "reels",
  "stories",
  "explore",
  "accounts",
  "direct",
  "about",
  "legal",
  "privacy",
]);
const LINKEDIN_SLUG_REGEX = /^[a-zA-Z0-9-]{3,100}$/;
const DOMAIN_HOSTNAME_REGEX = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

function parseHttpUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  // Reject non-http(s) schemes such as javascript:, data:, mailto:
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  const formatted = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(formatted);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    const hostname = parsed.hostname.toLowerCase();
    if (!DOMAIN_HOSTNAME_REGEX.test(hostname)) return null;
    const tld = hostname.split(".").pop() ?? "";
    if (!/^[a-zA-Z]{2,}$/.test(tld)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isValidUrl(url: string): boolean {
  return parseHttpUrl(url) !== null;
}

export function extractInstagramUsername(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) ||
    /^(?:www\.|m\.)?(?:instagram\.com|instagr\.am)(?:\/|$)/i.test(trimmed);

  if (looksLikeUrl) {
    const parsed = parseHttpUrl(trimmed);
    if (!parsed) return null;
    const host = parsed.hostname.toLowerCase().replace(/^(?:www\.|m\.)/, "");
    if (host !== "instagram.com" && host !== "instagr.am") return null;

    const firstSegment = parsed.pathname.split("/").filter(Boolean)[0];
    if (!firstSegment) return null;
    const handle = firstSegment.replace(/^@/, "");
    if (INSTAGRAM_RESERVED_PATHS.has(handle.toLowerCase())) return null;
    return INSTAGRAM_USERNAME_REGEX.test(handle) ? handle : null;
  }

  // Reject URLs/domains for other sites (e.g. google.com, tiktok.com/foo)
  if (trimmed.includes("/") || trimmed.includes(":")) return null;

  const handle = trimmed.replace(/^@/, "");
  if (!handle) return null;
  return INSTAGRAM_USERNAME_REGEX.test(handle) ? handle : null;
}

export function normalizeInstagramInput(value: string): string | null {
  const username = extractInstagramUsername(value);
  return username ? `https://www.instagram.com/${username}` : null;
}

export function normalizeLinkedinInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  if (!trimmed.includes("/") && !trimmed.includes(".") && !trimmed.includes(":")) {
    const slug = trimmed.replace(/^@/, "");
    return LINKEDIN_SLUG_REGEX.test(slug) ? `https://www.linkedin.com/in/${slug}` : null;
  }

  const parsed = parseHttpUrl(trimmed);
  if (!parsed) return null;
  const host = parsed.hostname.toLowerCase();
  if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) return null;
  if (!parsed.pathname || parsed.pathname === "/") return null;

  return parsed.toString();
}

export function normalizeWebsiteUrl(value: string): string | null {
  const parsed = parseHttpUrl(value);
  if (!parsed) return null;
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function normalizeSocialLinkByPlatform(platform: string, value: string): string | null {
  switch (platform.trim().toLowerCase()) {
    case "instagram":
      return normalizeInstagramInput(value);
    case "linkedin":
      return normalizeLinkedinInput(value);
    default:
      return normalizeWebsiteUrl(value);
  }
}

export function resolveSocialHref(
  platform: "instagram" | "linkedin" | "website",
  rawUrl: string
): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "#";

  const normalized = normalizeSocialLinkByPlatform(platform, trimmed);
  if (normalized) return normalized;

  const fallback = parseHttpUrl(trimmed);
  return fallback ? fallback.toString() : "#";
}

export function stripInstagramPrefix(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:instagram\.com|instagr\.am)\/([^/?#]+)/i
  );
  if (match?.[1] && !INSTAGRAM_RESERVED_PATHS.has(match[1].toLowerCase())) {
    return match[1].replace(/^@/, "");
  }
  return trimmed.replace(/^@/, "");
}

export function stripLinkedinInPrefix(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = trimmed.match(
    /^(?:https?:\/\/)?(?:[a-z]{2,3}\.|www\.)?linkedin\.com\/in\/([^/?#]+)/i
  );
  if (match?.[1]) {
    return match[1];
  }
  return trimmed;
}

export function stripHttpsPrefix(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/^https:\/\//i, "");
}
