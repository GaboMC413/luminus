import { NextResponse } from "next/server";
import dns from "dns";
import net from "net";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function extractMetaTag(html: string, propertyOrName: string): string | null {
  const escapedProp = propertyOrName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex1 = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escapedProp}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedProp}["']`,
    "i"
  );

  const match1 = html.match(regex1);
  if (match1 && match1[1]) return decodeHTMLEntities(match1[1]);

  const match2 = html.match(regex2);
  if (match2 && match2[1]) return decodeHTMLEntities(match2[1]);

  return null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match && match[1] ? decodeHTMLEntities(match[1]) : null;
}

function parseFallbackFromUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    const hostParts = parsed.hostname.replace(/^www\./, "").split(".");
    let domainName = hostParts[0] || "";
    if (domainName) {
      domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
    }

    const pathSegments = parsed.pathname
      .split("/")
      .filter((s) => s.length > 0 && !["course", "courses", "curso", "cursos", "p"].includes(s.toLowerCase()));

    let slug = pathSegments[pathSegments.length - 1] || "";
    slug = slug.replace(/\.[a-zA-Z0-9]+$/, "");

    let name = slug
      .replace(/[-_+]/g, " ")
      .trim();

    if (name) {
      name = name.charAt(0).toUpperCase() + name.slice(1);
    } else {
      name = domainName ? `Curso en ${domainName}` : "Curso Online";
    }

    return {
      name,
      description: "",
      coverUrl: "",
      institution: domainName || "",
      url: rawUrl,
      type: "Curso",
      modality: "Online grabado",
    };
  } catch {
    return null;
  }
}

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "127.0.0.1" || ip === "0.0.0.0" || ip === "::") {
    return true;
  }

  if (ip.startsWith("::ffff:")) {
    return isPrivateIp(ip.substring(7));
  }

  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 0) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    return false;
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (
      lower.startsWith("fe8") ||
      lower.startsWith("fe9") ||
      lower.startsWith("fea") ||
      lower.startsWith("feb")
    ) {
      return true;
    }
    return false;
  }

  return true;
}

async function validateSafeExternalUrl(targetUrl: string): Promise<string | null> {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.includes("instance-data") ||
      hostname.includes("169.254")
    ) {
      return null;
    }

    if (net.isIP(hostname)) {
      if (isPrivateIp(hostname)) return null;
    }

    const lookupResults = await dns.promises.lookup(hostname, { all: true });
    for (const record of lookupResults) {
      if (isPrivateIp(record.address)) {
        return null;
      }
    }

    return parsed.href;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  // 1. Authentication check
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    let { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ message: "URL requerida." }, { status: 400 });
    }

    url = url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    // 2. SSRF Validation
    const validatedUrl = await validateSafeExternalUrl(url);
    if (!validatedUrl) {
      return NextResponse.json(
        { message: "La URL proporcionada no es válida o apunta a una dirección restringida." },
        { status: 400 }
      );
    }

    const fallbackData = parseFallbackFromUrl(validatedUrl);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(validatedUrl, {
        signal: controller.signal,
        redirect: "error", // Prevent open redirect bypass
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        },
      }).finally(() => clearTimeout(timeout));

      if (!res.ok) {
        if (fallbackData) {
          return NextResponse.json({ ok: true, metadata: fallbackData });
        }
        return NextResponse.json(
          { message: "No se pudo acceder a la URL especificada." },
          { status: 422 }
        );
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("xhtml")) {
        if (fallbackData) {
          return NextResponse.json({ ok: true, metadata: fallbackData });
        }
        return NextResponse.json(
          { message: "La URL proporcionada no es una página web HTML." },
          { status: 422 }
        );
      }

      const html = await res.text();

      let name =
        extractMetaTag(html, "og:title") ||
        extractMetaTag(html, "twitter:title") ||
        extractTitleTag(html) ||
        "";

      let description =
        extractMetaTag(html, "og:description") ||
        extractMetaTag(html, "twitter:description") ||
        extractMetaTag(html, "description") ||
        "";

      let rawCoverUrl =
        extractMetaTag(html, "og:image") ||
        extractMetaTag(html, "twitter:image") ||
        extractMetaTag(html, "og:image:secure_url") ||
        "";

      let institution =
        extractMetaTag(html, "og:site_name") ||
        extractMetaTag(html, "twitter:site") ||
        fallbackData?.institution ||
        "";

      let coverUrl = "";
      if (rawCoverUrl) {
        try {
          coverUrl = new URL(rawCoverUrl, validatedUrl).href;
        } catch {
          coverUrl = rawCoverUrl;
        }
      }

      if (!name && fallbackData) {
        name = fallbackData.name;
      }

      return NextResponse.json({
        ok: true,
        metadata: {
          name,
          type: "Curso",
          description,
          modality: "Online grabado",
          coverUrl,
          url: validatedUrl,
          institution,
        },
      });
    } catch {
      // Fetch failed or timed out -> use URL fallback if safe
      if (fallbackData) {
        return NextResponse.json({ ok: true, metadata: fallbackData });
      }
      return NextResponse.json(
        { message: "Error al intentar obtener la información del enlace." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error fetching course metadata:", error);
    return NextResponse.json(
      { message: "No se pudo obtener la información del enlace." },
      { status: 500 }
    );
  }
}
