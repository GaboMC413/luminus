import { NextResponse } from "next/server";
import { sendSingleTestEmail } from "@/lib/local-marketing/sender";

function checkLocalOnly() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return true;
}

export async function POST(req: Request) {
  if (!checkLocalOnly()) {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.toEmail || !body.subject || !body.htmlContent) {
      return NextResponse.json(
        { error: "Los campos toEmail, subject y htmlContent son requeridos." },
        { status: 400 }
      );
    }

    const fromEmail = body.fromEmail || process.env.SES_FROM_EMAIL || "info@luminuslatam.com";
    const fromName = body.fromName || "LUMINUS LATAM";

    const result = await sendSingleTestEmail({
      toEmail: body.toEmail,
      subject: body.subject,
      fromEmail,
      fromName,
      htmlContent: body.htmlContent,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Fallo el envío de prueba." }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error inesperado al enviar prueba" }, { status: 500 });
  }
}
