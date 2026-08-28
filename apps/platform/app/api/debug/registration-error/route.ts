import { NextResponse } from "next/server";
import { sendRegistrationErrorAlertEmail } from "@/lib/mails/sender";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
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

    // Send instant audit email alert via AWS SES
    let emailSent = false;
    try {
      await sendRegistrationErrorAlertEmail({
        userEmail: userEmail || "No provisto",
        userName: userName || "Anónimo",
        step: step || "Registro",
        action: action || "Form Submission",
        statusCode: statusCode || "N/A",
        errorMessage: errorMessage || "Error no especificado",
        errorDetails: typeof errorDetails === "object" ? JSON.stringify(errorDetails, null, 2) : String(errorDetails || ""),
        userAgent: userAgent || request.headers.get("user-agent") || "Navegador web",
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
