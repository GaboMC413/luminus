import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { serializeUser, validateAuthInput } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = validateAuthInput(body);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: validation.email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "Ya existe una cuenta registrada con este correo." },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      email: validation.email,
      cognitoSub: `email:${randomUUID()}`,
      authProvider: "email",
      passwordHash: hashPassword(validation.password),
      profile: {
        create: {},
      },
    },
    include: { profile: true },
  });

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: "USER",
  });

  setSessionCookie(token);

  return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
}
