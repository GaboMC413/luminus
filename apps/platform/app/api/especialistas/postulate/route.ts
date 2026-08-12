import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      specialty,
      title,
      bio,
      institution,
      selectedAreas,
      clinicData,
      sessionsData,
      resumeUrl,
      linkedinUrl,
      instagramUrl,
      websiteUrl,
      courses,
    } = body;

    if (!specialty || !title || !bio) {
      return NextResponse.json({ message: "Campos obligatorios faltantes." }, { status: 400 });
    }


    // Check if there is already an active specialist profile
    const existingProfile = await prisma.specialistProfile.findUnique({
      where: { userId: session.userId },
    });

    if (existingProfile) {
      return NextResponse.json({ message: "Ya eres un especialista registrado." }, { status: 400 });
    }

    // Check if user already has an application under review
    const existingPostulation = await prisma.specialistPostulation.findFirst({
      where: {
        userId: session.userId,
        status: { in: ["pending", "accepted"] },
      },
    });

    if (existingPostulation) {
      return NextResponse.json(
        { message: "Ya tienes una aplicación en revisión." },
        { status: 400 }
      );
    }

    // Create a new application
    const postulation = await prisma.specialistPostulation.create({
      data: {
        userId: session.userId,
        specialty,
        title,
        clinicName: clinicData?.clinicName || null,
        bio,
        linkedinUrl: linkedinUrl || null,
        instagramUrl: instagramUrl || null,
        websiteUrl: websiteUrl || null,
        courses: courses ? courses : undefined,
        status: "pending",
        institution: institution || null,
        selectedAreas: selectedAreas ? selectedAreas : undefined,
        clinicData: clinicData ? clinicData : undefined,
        sessionsData: sessionsData ? sessionsData : undefined,
        resumeUrl: resumeUrl || null,
      },
    });

    return NextResponse.json({ ok: true, postulation });
  } catch (error) {
    console.error("Failed to submit application:", error);
    return NextResponse.json({ message: "Error al enviar la aplicación." }, { status: 500 });
  }
}
