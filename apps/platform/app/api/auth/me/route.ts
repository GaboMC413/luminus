import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { serializeUser } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function GET() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: serializeUser(user) });
}
