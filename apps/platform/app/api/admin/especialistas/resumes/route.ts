import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { createResumeDownloadUrl, isAllowedLegacyResumeUrl } from "@/lib/resumeStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const url = new URL(request.url);
  const postulationId = url.searchParams.get("postulationId")?.trim();
  const userId = url.searchParams.get("userId")?.trim();

  if (!postulationId && !userId) {
    return NextResponse.json({ message: "Postulación o usuario requerido." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const record = postulationId
      ? await prisma.specialistPostulation.findUnique({
          where: { id: postulationId },
          select: { resumeUrl: true },
        })
      : await prisma.specialistProfile.findUnique({
          where: { userId: userId! },
          select: { resumeUrl: true },
        });

    const resumeReference = record?.resumeUrl?.trim();
    if (!resumeReference) {
      return NextResponse.json({ message: "La postulación no tiene un currículum asociado." }, { status: 404 });
    }

    if (resumeReference.startsWith("https://")) {
      if (!isAllowedLegacyResumeUrl(resumeReference)) {
        return NextResponse.json({ message: "La dirección del currículum anterior no es válida." }, { status: 400 });
      }
      return NextResponse.redirect(resumeReference);
    }

    if (!resumeReference.startsWith("resumes/") || resumeReference.includes("..")) {
      return NextResponse.json({ message: "La referencia del currículum no es válida." }, { status: 400 });
    }

    return NextResponse.redirect(await createResumeDownloadUrl(resumeReference));
  } catch (error) {
    console.error("Failed to prepare resume download:", error);
    return NextResponse.json({ message: "No pudimos abrir el currículum." }, { status: 500 });
  }
}
