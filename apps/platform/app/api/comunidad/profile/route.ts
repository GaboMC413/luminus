import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isUuid } from "@/utils/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim() || "";

  if (!id || !isUuid(id)) {
    return NextResponse.json({ message: "ID de usuario inválido." }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ 
      message: "DATABASE_URL is not configured." 
    }, { status: 500 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const [user, outgoingConnection, incomingConnection] = await Promise.all([
      prisma.user.findUnique({
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
          specialistProfile: {
            include: {
              courses: {
                where: { isActive: true },
              },
              spaces: {
                where: { isActive: true },
                include: {
                  category: true,
                  services: true,
                  availability: {
                    where: { isActive: true },
                    orderBy: { dayOfWeek: "asc" },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.userConnection.findFirst({
        where: {
          requesterId: session.userId,
          recipientId: id,
        },
        select: {
          id: true,
          requesterId: true,
          status: true,
        },
      }),
      prisma.userConnection.findFirst({
        where: {
          requesterId: id,
          recipientId: session.userId,
        },
        select: {
          id: true,
          requesterId: true,
          status: true,
        },
      }),
    ]);

    if (!user || user.status !== "active" || user.email === "info@luminuslatam.com") {
      return NextResponse.json({ message: "Este perfil no está disponible." }, { status: 404 });
    }

    if (incomingConnection && incomingConnection.status === "blocked") {
      return NextResponse.json({ message: "Este perfil no está disponible." }, { status: 403 });
    }

    const isFollowing = outgoingConnection?.status === "accepted";
    const isFollower = incomingConnection?.status === "accepted";
    const isBlocked = outgoingConnection?.status === "blocked";

    const profile = (user.profile ?? {}) as any;
    const prompts = (user.profilePrompts ?? [])
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      .map((prompt: any) => ({
        question: prompt.question,
        answer: prompt.answer,
      }));

    return NextResponse.json({
      profile: {
        id: user.id,
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


        created_at: profile.createdAt?.toISOString?.() ?? user.createdAt?.toISOString?.() ?? "",
        bio: profile.bio ?? "",
        other_interests: profile.intention ?? "",
        tier: user.tier ?? "FREE",
        member_since: user.memberSince?.toISOString?.() ?? null,
        connection_status: isBlocked ? "blocked" : (isFollowing ? "accepted" : null),
        connection_direction: isFollowing ? "outgoing" : null,
        is_in_network: isFollowing,
        has_in_network: isFollower,
        is_mutual: Boolean(isFollowing && isFollower),
        is_own_profile: id === session.userId,
        specialistProfile: user.specialistProfile ? {
          specialty: user.specialistProfile.specialty,
          title: user.specialistProfile.title,
          clinicName: user.specialistProfile.clinicName,
          bio: user.specialistProfile.bio,
          institution: user.specialistProfile.institution,
          linkedinUrl: user.specialistProfile.linkedinUrl,
          instagramUrl: user.specialistProfile.instagramUrl,
          websiteUrl: user.specialistProfile.websiteUrl,
          courses: (user.specialistProfile.courses || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            description: c.description,
            modality: c.modality,
            url: c.url,
            coverUrl: c.coverUrl,
            institution: c.institution,
          })),
          spaces: (user.specialistProfile.spaces || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            address: s.address,
            city: s.city,
            country: s.country,
            phone: s.phone,
            website: s.website,
            googleMapsUrl: s.googleMapsUrl,
            coverUrl: s.coverUrl,
            spaceType: s.spaceType,
            services: (s.services || []).map((srv: any) => ({
              id: srv.id,
              name: srv.name,
            })),
            availability: (s.availability || []).map((av: any) => ({
              dayOfWeek: av.dayOfWeek,
              startTime: av.startTime,
              endTime: av.endTime,
              isActive: av.isActive,
            })),
          })),
        } : null,
      }
    });
  } catch (error) {
    console.error("Public profile read failed.", error);
    return NextResponse.json({ 
      message: "No se pudo cargar el perfil público. El servicio de base de datos no está disponible." 
    }, { status: 500 });
  }
}
