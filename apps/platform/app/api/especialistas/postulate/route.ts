import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { specialty, title, clinicName, bio, linkedinUrl, instagramUrl, websiteUrl, courses } = body;

    if (!specialty || !title || !bio) {
      return NextResponse.json({ message: "Campos obligatorios faltantes." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");

    // Check if there is already an active specialist profile for this user
    const existingProfile = await prisma.specialistProfile.findUnique({
      where: { userId: session.userId },
    });

    if (existingProfile) {
      return NextResponse.json({ message: "Ya eres un especialista registrado." }, { status: 400 });
    }

    // Create a new postulation
    const postulation = await prisma.specialistPostulation.create({
      data: {
        userId: session.userId,
        specialty,
        title,
        clinicName: clinicName || null,
        bio,
        linkedinUrl: linkedinUrl || null,
        instagramUrl: instagramUrl || null,
        websiteUrl: websiteUrl || null,
        courses: courses ? courses : undefined,
        status: "pending",
      },
    });

    return NextResponse.json({ ok: true, postulation });
  } catch (error) {
    console.error("Failed to submit postulation:", error);
    return NextResponse.json({ message: "Error al enviar la postulación." }, { status: 500 });
  }
}
