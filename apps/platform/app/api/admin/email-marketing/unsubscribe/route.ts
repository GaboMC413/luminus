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
      <title>Desuscripción Confirmada</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 40px; border-radius: 16px; max-width: 480px; text-align: center; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        h1 { color: #38bdf8; font-size: 24px; margin-bottom: 12px; }
        p { color: #94a3b8; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>✅ Te has desuscrito correctamente</h1>
        <p>Tu correo <strong>${email}</strong> ha sido eliminado de la lista local de correos marketing de LUMINUS LATAM.</p>
        <p>Ya no recibirás más boletines o correos informativos en esta dirección.</p>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(htmlResponse, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
