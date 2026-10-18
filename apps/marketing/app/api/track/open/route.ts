import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 1x1 transparent GIF buffer
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id && id.length > 5) {
      try {
        await prisma.sentEmailLog.update({
          where: { id },
          data: {
            openCount: { increment: 1 },
            openedAt: new Date(),
          },
        });
      } catch (dbErr) {
        // Silently catch if log ID was deleted/pruned or missing
      }
    }
  } catch (err) {
    // Ignore errors to ensure 1x1 pixel image is always returned cleanly
  }

  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
