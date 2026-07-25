import { NextResponse } from "next/server";

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
  if (match && match[1]) {
    return decodeHTMLEntities(match[1]);
  }
  return null;
}

function parseFallbackFromUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    const domainParts = parsed.hostname.replace(/^www\./, "").split(".");
    let domainName = domainParts[0] || "";
    if (domainName) {
      domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1).toLowerCase();
    }

    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    let lastSegment = pathSegments[pathSegments.length - 1] || "";
    if (lastSegment.toLowerCase() === "course" || lastSegment.toLowerCase() === "courses") {
      lastSegment = pathSegments[pathSegments.length - 2] || lastSegment;
    }

    // Clean query/extension
    lastSegment = lastSegment.replace(/\.[^/.]+$/, "");

    let name = lastSegment
      .replace(/[-_]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    if (!name || name.length < 2) {
      name = domainName ? `Propuesta en ${domainName}` : "Propuesta Formativa";
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

export async function POST(request: Request) {
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

    const fallbackData = parseFallbackFromUrl(url);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        signal: controller.signal,
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
          coverUrl = new URL(rawCoverUrl, url).href;
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
          url,
          institution,
        },
      });
    } catch {
      // Fetch failed or timed out (bot protection / network error) -> use URL fallback
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
