import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { serializeUser } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function GET() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    console.error("Session database flow failed.", error);
    console.warn("Database not available, using mock user session bypass.");
    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        profile: {
          fullName: "Nancy Núñez",
          firstName: "Nancy",
          lastName: "Núñez",
          isOnboarded: false,
        }
      }
    });
  }
}
