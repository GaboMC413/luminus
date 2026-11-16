import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getContactRecipients,
  addContactRecipient,
  removeContactRecipient,
} from "@/lib/contactRecipients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  }

  try {
    const recipients = await getContactRecipients();
    return NextResponse.json({ recipients });
  } catch (error: any) {
    console.error("[api/admin/contact/recipients/GET]", error);
    return NextResponse.json(
      { message: "Error al obtener destinatarios." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !String(email).trim().includes("@")) {
      return NextResponse.json(
        { message: "Por favor proporciona un correo electrónico válido." },
        { status: 400 }
      );
    }

    const updated = await addContactRecipient(email);
    return NextResponse.json({ success: true, recipients: updated });
  } catch (error: any) {
    console.error("[api/admin/contact/recipients/POST]", error);
    return NextResponse.json(
      { message: error?.message || "Error al agregar destinatario." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    let email = url.searchParams.get("email");

    if (!email) {
      try {
        const body = await req.json();
        email = body.email;
      } catch {}
    }

    if (!email) {
      return NextResponse.json(
        { message: "Por favor especifica el correo a eliminar." },
        { status: 400 }
      );
    }

    const updated = await removeContactRecipient(email);
    return NextResponse.json({ success: true, recipients: updated });
  } catch (error: any) {
    console.error("[api/admin/contact/recipients/DELETE]", error);
    return NextResponse.json(
      { message: error?.message || "Error al eliminar destinatario." },
      { status: 500 }
    );
  }
}
