import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeEmail, verifyUnsubscribeToken } from "@/lib/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function processUnsubscribe(email: string, reason?: string) {
  const cleanEmail = normalizeEmail(email);

  // 1. Record in unsubscribed_emails table
  await prisma.unsubscribedEmail.upsert({
    where: { email: cleanEmail },
    create: {
      email: cleanEmail,
      reason: reason || "Web Unsubscribe",
      source: "newsletter",
    },
    update: {
      reason: reason || "Web Unsubscribe",
      createdAt: new Date(),
    },
  });

  // 2. Also update marketingConsent in event_guests if present
  try {
    await prisma.eventGuest.updateMany({
      where: { email: cleanEmail },
      data: { marketingConsent: false },
    });
  } catch (err) {
    console.warn("[Unsubscribe API] Could not update EventGuest:", err);
  }
}

async function processResubscribe(email: string) {
  const cleanEmail = normalizeEmail(email);

  // Remove from unsubscribed_emails table
  await prisma.unsubscribedEmail.deleteMany({
    where: { email: cleanEmail },
  });

  // Re-enable marketingConsent in event_guests
  try {
    await prisma.eventGuest.updateMany({
      where: { email: cleanEmail },
      data: { marketingConsent: true },
    });
  } catch (err) {
    console.warn("[Resubscribe API] Could not update EventGuest:", err);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const reason = searchParams.get("reason") || undefined;
    const action = searchParams.get("action"); // "unsubscribe" | "resubscribe"

    if (!email || !token) {
      return NextResponse.json(
        { ok: false, error: "Parámetros incompletos (email y token requeridos)." },
        { status: 400 }
      );
    }

    const isValid = verifyUnsubscribeToken(email, token);
    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Token de desuscripción inválido o expirado." },
        { status: 400 }
      );
    }

    if (action === "resubscribe") {
      await processResubscribe(email);
      return NextResponse.json({
        ok: true,
        email: normalizeEmail(email),
        message: "Te has resuscrito exitosamente a nuestras novedades.",
      });
    }

    await processUnsubscribe(email, reason);

    return NextResponse.json({
      ok: true,
      email: normalizeEmail(email),
      message: "Te has desuscrito exitosamente de nuestras novedades.",
    });
  } catch (error: any) {
    console.error("[Unsubscribe API GET Error]:", error);
    return NextResponse.json(
      { ok: false, error: "Error al procesar la solicitud de desuscripción." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let email = searchParams.get("email");
    let token = searchParams.get("token");
    let reason = searchParams.get("reason") || "1-Click Unsubscribe Header";
    let action = searchParams.get("action");

    // Attempt to parse body if present
    try {
      const bodyText = await request.text();
      if (bodyText) {
        if (bodyText.includes("List-Unsubscribe=One-Click")) {
          reason = "RFC 8058 One-Click Header";
        } else {
          const parsed = JSON.parse(bodyText);
          if (parsed.email) email = parsed.email;
          if (parsed.token) token = parsed.token;
          if (parsed.reason) reason = parsed.reason;
          if (parsed.action) action = parsed.action;
        }
      }
    } catch {
      // Body reading optional
    }

    if (!email || !token) {
      return NextResponse.json(
        { ok: false, error: "Parámetros incompletos." },
        { status: 400 }
      );
    }

    const isValid = verifyUnsubscribeToken(email, token);
    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Token de desuscripción inválido o expirado." },
        { status: 400 }
      );
    }

    if (action === "resubscribe") {
      await processResubscribe(email);
      return NextResponse.json({
        ok: true,
        email: normalizeEmail(email),
        message: "Resuscrito exitosamente.",
      });
    }

    await processUnsubscribe(email, reason);

    return NextResponse.json({
      ok: true,
      email: normalizeEmail(email),
      message: "Desuscrito exitosamente.",
    });
  } catch (error: any) {
    console.error("[Unsubscribe API POST Error]:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno al procesar desuscripción." },
      { status: 500 }
    );
  }
}
