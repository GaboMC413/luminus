import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { serializeUser, validateAuthInput } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = validateAuthInput(body);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { email: validation.email },
      include: { profile: true },
    });

    if (!user?.passwordHash || !verifyPassword(validation.password, user.passwordHash)) {
      return NextResponse.json(
        { message: "Correo o contrasena incorrectos." },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setSessionCookie(token);

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    console.error("Login database flow failed.", error);
    return NextResponse.json(
      { message: "El servicio de base de datos no está disponible." },
      { status: 500 }
    );
  }
}
