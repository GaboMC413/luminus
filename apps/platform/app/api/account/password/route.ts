import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!newPassword) {
    return NextResponse.json({ message: "La nueva contrasena es requerida." }, { status: 400 });
  }

  if (newPassword.length < 12) {
    return NextResponse.json({ message: "La contrasena debe tener al menos 12 caracteres." }, { status: 400 });
  }

  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return NextResponse.json({ message: "La contrasena debe incluir al menos una letra y un numero." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: hashPassword(newPassword) },
    });

    return NextResponse.json({ success: true, message: "Contrasena actualizada con exito." });
  } catch (error) {
    console.error("Authenticated password change failed.", error);
    return NextResponse.json({ message: "No pudimos actualizar la contrasena." }, { status: 500 });
  }
}
