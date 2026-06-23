import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID de usuario requerido." }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ 
      message: "DATABASE_URL is not configured." 
    }, { status: 500 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        interests: {
          include: {
            interest: true,
          },
        },
        profilePrompts: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    const connection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: session.userId, recipientId: id },
          { requesterId: id, recipientId: session.userId },
        ],
      },
      select: {
        id: true,
        requesterId: true,
        status: true,
      },
    });

    const profile = (user.profile ?? {}) as any;
    const prompts = (user.profilePrompts ?? [])
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      .map((prompt: any) => ({
        question: prompt.question,
        answer: prompt.answer,
      }));

    return NextResponse.json({
      profile: {
        first_name: profile.firstName ?? "",
        last_name: profile.lastName ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        profession: profile.profession ?? "",
        interests: (user.interests ?? []).map((row: any) => row.interest.name),
        prompts,
        profile_picture_url: profile.avatarUrl ?? "",
        cover_url: profile.coverUrl ?? "",
        gender: profile.gender ?? "",
        birthdate: profile.birthdate ? new Date(profile.birthdate).toISOString().slice(0, 10) : "",
        phone_number: profile.phoneNumber ?? "",
        selected_plan: profile.selectedPlan ?? "Mensual",
        created_at: profile.createdAt?.toISOString?.() ?? user.createdAt?.toISOString?.() ?? "",
        bio: profile.bio ?? "",
        other_interests: profile.intention ?? "",
        connection_status: connection?.status ?? null,
        connection_direction: connection ? (connection.requesterId === session.userId ? "outgoing" : "incoming") : null,
        is_own_profile: id === session.userId,
      }
    });
  } catch (error) {
    console.error("Public profile read failed.", error);
    return NextResponse.json({ 
      message: "No se pudo cargar el perfil público. El servicio de base de datos no está disponible." 
    }, { status: 500 });
  }
}
