import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentSession } from "@/lib/auth/session";
import { serializeUser } from "@/lib/auth/validation";

export const runtime = "nodejs";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, private",
  Vary: "Cookie",
};

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401, headers: NO_STORE_HEADERS });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (user.status !== "active") {
      await clearSessionCookie();
      return NextResponse.json({ user: null }, { status: 401, headers: NO_STORE_HEADERS });
    }

    return NextResponse.json({ user: serializeUser(user) }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Session database flow failed.", error);
    return NextResponse.json(
      { user: null, message: "El servicio de base de datos no está disponible." },
      { status: 500 }
    );
  }
}
