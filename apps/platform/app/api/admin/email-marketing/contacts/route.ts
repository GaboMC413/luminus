import { NextResponse } from "next/server";
import {
  getLocalContacts,
  saveLocalContact,
  deleteLocalContact,
  bulkImportContacts,
} from "@/lib/local-marketing/store";

// Bloqueo estricto para producción
function checkLocalOnly() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return true;
}

export async function GET() {
  if (!checkLocalOnly()) {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  const contacts = getLocalContacts();
  return NextResponse.json({ contacts });
}

export async function POST(req: Request) {
  if (!checkLocalOnly()) {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Soporte para importación masiva de contactos (bulk)
    if (body.action === "bulk_import" && Array.isArray(body.items)) {
      const result = bulkImportContacts(body.items);
      return NextResponse.json({ success: true, ...result });
    }

    // Agregar/Editar contacto individual
    if (!body.email || !body.email.includes("@")) {
      return NextResponse.json({ error: "El correo electrónico es obligatorio y debe ser válido." }, { status: 400 });
    }

    const contact = saveLocalContact({
      id: body.id,
      email: body.email,
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      country: body.country || "",
      city: body.city || "",
      profession: body.profession || "",
      source: body.source || "",
      tags: body.tags || [],
      unsubscribed: body.unsubscribed ?? false,
      notes: body.notes || "",
    });

    return NextResponse.json({ success: true, contact });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al procesar contacto" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!checkLocalOnly()) {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "El parámetro ID es requerido" }, { status: 400 });
    }

    const deleted = deleteLocalContact(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al eliminar contacto" }, { status: 500 });
  }
}
