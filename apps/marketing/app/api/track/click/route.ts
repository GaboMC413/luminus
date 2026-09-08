import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const rawUrl = searchParams.get("url") || searchParams.get("target");

  let targetUrl = "https://luminus.com.ar";

  if (rawUrl) {
    try {
      const decoded = decodeURIComponent(rawUrl);
      if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
        targetUrl = decoded;
      }
    } catch {
      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        targetUrl = rawUrl;
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
    } catch (err) {
      // Ignore if log ID is missing or pruned
    }
  }

  return NextResponse.redirect(targetUrl, 302);
}
