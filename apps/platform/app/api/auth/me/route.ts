import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentSession } from "@/lib/auth/session";
import { serializeUser } from "@/lib/auth/validation";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    if (user.status !== "active") {
      clearSessionCookie();
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    console.error("Session database flow failed.", error);
    return NextResponse.json(
      { user: null, message: "El servicio de base de datos no está disponible." },
      { status: 500 }
    );
  }
}
