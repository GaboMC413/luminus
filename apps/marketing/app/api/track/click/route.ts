import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRUSTED_DOMAINS = [
  "luminuslatam.com",
  "www.luminuslatam.com",
  "app.luminuslatam.com",
  "zoom.us",
  "youtube.com",
  "youtu.be",
  "meet.google.com",
];

function isAllowedDestination(urlString: string, id: string | null, sig: string | null): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check against trusted hostnames or subdomains of luminuslatam.com
    if (
      hostname === "luminuslatam.com" ||
      hostname.endsWith(".luminuslatam.com") ||
      TRUSTED_DOMAINS.includes(hostname)
    ) {
      return true;
    }

    // Allow localhost in non-production
    if (process.env.NODE_ENV !== "production" && (hostname === "localhost" || hostname === "127.0.0.1")) {
      return true;
    }

    // If an external URL is linked in tracked emails, verify the HMAC signature generated at sending time
    const secret = process.env.UNSUBSCRIBE_SECRET || process.env.AUTH_SESSION_SECRET;
    if (sig && secret) {
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(`${id || ""}:${urlString}`)
        .digest("hex")
        .substring(0, 32);

      const sigBuf = Buffer.from(sig);
      const expectedBuf = Buffer.from(expectedSig);
      if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const sig = searchParams.get("sig");
  const rawUrl = searchParams.get("url") || searchParams.get("target");

  const defaultDestination = "https://luminuslatam.com";
  let targetUrl = defaultDestination;

  if (rawUrl) {
    try {
      const decoded = decodeURIComponent(rawUrl).trim();
      if (isAllowedDestination(decoded, id, sig)) {
        targetUrl = decoded;
      }
    } catch {
      if (isAllowedDestination(rawUrl.trim(), id, sig)) {
        targetUrl = rawUrl.trim();
      }
    }
  }

  if (id && id.length > 5) {
    try {
      await prisma.sentEmailLog.update({
        where: { id },
        data: {
          clickCount: { increment: 1 },
          clickedAt: new Date(),
        },
      });
    } catch {
      // Ignore if log ID is missing or pruned
    }
  }

  return NextResponse.redirect(targetUrl, 302);
}
