import { NextResponse } from "next/server";
import { sendRegistrationErrorAlertEmail } from "@/lib/mails/sender";
import { isRateLimited } from "@/utils/rateLimit";

export const runtime = "nodejs";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown-ip";
}

function isValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin") || request.headers.get("referer");
  if (!origin) return true; // Direct client or mobile
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();
    if (host === "luminuslatam.com" || host.endsWith(".luminuslatam.com")) return true;
    if (process.env.NODE_ENV !== "production" && (host === "localhost" || host === "127.0.0.1")) return true;
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!isValidOrigin(request)) {
      return NextResponse.json({ message: "Origen no permitido" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rateCheck = isRateLimited(ip, "REG_ERROR_ALERT", 5, 10 * 60 * 1000);
    if (rateCheck.success) {
      return NextResponse.json({ message: "Límite de solicitudes excedido" }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ message: "Payload inválido" }, { status: 400 });
    }

    const {
      userEmail,
      userName,
      step,
      action,
      statusCode,
      errorMessage,
      errorDetails,
      userAgent,
    } = body;

    const timestamp = new Date().toISOString();

    // Sanitize string lengths to prevent payload inflation
    const safeErrorMsg = String(errorMessage || "Error no especificado").slice(0, 500);
    const safeDetails = (typeof errorDetails === "object" ? JSON.stringify(errorDetails, null, 2) : String(errorDetails || "")).slice(0, 1500);

    // Send instant audit email alert via AWS SES
    let emailSent = false;
    try {
      await sendRegistrationErrorAlertEmail({
        userEmail: String(userEmail || "No provisto").slice(0, 100),
        userName: String(userName || "Anónimo").slice(0, 100),
        step: String(step || "Registro").slice(0, 50),
        action: String(action || "Form Submission").slice(0, 50),
        statusCode: String(statusCode || "N/A").slice(0, 20),
        errorMessage: safeErrorMsg,
        errorDetails: safeDetails,
        userAgent: String(userAgent || request.headers.get("user-agent") || "Navegador web").slice(0, 250),
        timestamp,
      });
      emailSent = true;
    } catch (emailErr) {
      console.error("[Registration Error Reporter SES Fail]:", emailErr);
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (err) {
    console.error("[Registration Error Reporter Fail]:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
