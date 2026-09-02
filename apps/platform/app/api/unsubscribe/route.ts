import { NextResponse } from "next/server";
import { getLocalContacts, saveLocalContact } from "@/lib/local-marketing/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return new NextResponse("Correo no especificado.", { status: 400 });
  }

  const contacts = getLocalContacts();
  const contact = contacts.find((c) => c.email.toLowerCase() === email.toLowerCase().trim());

  if (contact) {
    saveLocalContact({
      ...contact,
      unsubscribed: true,
    });
  }

  const htmlResponse = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Desuscripción Confirmada | LUMINUS</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #ffffff; padding: 40px 32px; border-radius: 24px; max-width: 460px; width: 100%; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .logo { width: 140px; height: auto; margin-bottom: 28px; }
        h1 { color: #000000; font-size: 22px; font-weight: 700; margin-bottom: 12px; }
        p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; }
        .email-badge { display: inline-block; background: #f1f5f9; color: #0f172a; padding: 6px 14px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-bottom: 20px; }
        .btn { display: inline-block; background: #000000; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 600; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <img src="https://luminuslatam.com/logo-mails.jpg" alt="LUMINUS" class="logo" />
        <h1>Te has desuscrito correctamente</h1>
        <div class="email-badge">${email}</div>
        <p>Tu correo ha sido removido de nuestros boletines y comunicaciones de marketing. Ya no recibirás más notificaciones de este tipo.</p>
        <a href="https://luminuslatam.com" class="btn">Volver a LUMINUS</a>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(htmlResponse, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  let email = searchParams.get("email");

  if (!email) {
    try {
      const body = await req.formData();
      email = body.get("email")?.toString() || null;
    } catch {
      // Body format wasn't formData
    }
  }

  if (email) {
    const contacts = getLocalContacts();
    const contact = contacts.find((c) => c.email.toLowerCase() === email!.toLowerCase().trim());

    if (contact) {
      saveLocalContact({
        ...contact,
        unsubscribed: true,
        tags: Array.from(new Set([...(contact.tags || []), "desuscrito", "one-click-unsubscribe"])),
        notes: `${contact.notes || ""}\n[One-Click Unsubscribe] Desuscrito vía cliente de correo (RFC 8058).`.trim(),
      });
    } else {
      saveLocalContact({
        email,
        firstName: "Contacto",
        lastName: "Desuscrito",
        tags: ["desuscrito", "one-click-unsubscribe"],
        unsubscribed: true,
        source: "One-Click Unsubscribe",
      });
    }
  }

  return new NextResponse("OK", { status: 200 });
}

