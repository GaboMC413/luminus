import { NextResponse } from "next/server";
import { recordLogClick } from "@/lib/local-marketing/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const logId = searchParams.get("logId");
  const targetUrl = searchParams.get("url");

  if (logId) {
    recordLogClick(logId);
  }

  const destination = targetUrl ? decodeURIComponent(targetUrl) : "https://luminuslatam.com";
  return NextResponse.redirect(destination, 302);
}
