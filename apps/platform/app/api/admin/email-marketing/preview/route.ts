import { NextResponse } from "next/server";
import { renderRelaunchNewsletterHtml } from "@/lib/mails/relaunchNewsletter";

export async function GET() {
  const html = renderRelaunchNewsletterHtml({
    nombre: "Gabriel",
    unsubscribeUrl: "#"
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
