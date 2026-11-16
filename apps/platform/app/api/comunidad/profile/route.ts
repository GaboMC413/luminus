import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { generateUniqueUserSlug } from "@/lib/profile/slug";
import { isUuid } from "@/utils/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const identifier =
    searchParams.get("slug")?.trim() ||
    searchParams.get("id")?.trim() ||
    "";

  if (!identifier) {
    return NextResponse.json({ message: "ID de usuario inválido." }, { status: 400 });
  }

  const isIdLookup = isUuid(identifier);

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ 
      message: "DATABASE_URL is not configured." 
    }, { status: 500 });
  }

  try {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: isIdLookup ? { id: identifier } : { slug: identifier },
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
                spaceCategories: {
                  include: { category: true },
                },
                services: {
                  include: { category: true },
                },
                availability: {
                  where: { isActive: true },
                  orderBy: { dayOfWeek: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== "active" || user.email === "info@luminuslatam.com") {
      return NextResponse.json({ message: "Este perfil no está disponible." }, { status: 404 });
    }

    const targetUserId = user.id;

    const [outgoingConnection, incomingConnection, followRow, followersCount] = await Promise.all([
      prisma.userConnection.findFirst({
        where: {
          requesterId: session.userId,
          recipientId: targetUserId,
        },
        select: {
          id: true,
          requesterId: true,
          status: true,
        },
      }),
      prisma.userConnection.findFirst({
        where: {
          requesterId: targetUserId,
          recipientId: session.userId,
        },
        select: {
          id: true,
          requesterId: true,
          status: true,
        },
      }),
      prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.userId,
            followingId: targetUserId,
          },
        },
        select: { id: true },
      }),
      prisma.userFollow.count({
        where: { followingId: targetUserId },
      }),
    ]);

    if (incomingConnection && incomingConnection.status === "blocked") {
      return NextResponse.json({ message: "Este perfil no está disponible." }, { status: 403 });
    }

    const isBlocked = outgoingConnection?.status === "blocked";
    const isAccepted = outgoingConnection?.status === "accepted" || incomingConnection?.status === "accepted";
    const isPendingSent = outgoingConnection?.status === "pending";
    const isPendingReceived = incomingConnection?.status === "pending";
    const connectionStatus = isBlocked
      ? "blocked"
      : isAccepted
        ? "accepted"
        : isPendingSent
          ? "pending_sent"
          : isPendingReceived
            ? "pending_received"
            : null;
    const connectionDirection = isAccepted
      ? outgoingConnection?.status === "accepted"
        ? "outgoing"
        : "incoming"
      : isPendingSent
        ? "outgoing"
        : isPendingReceived
          ? "incoming"
          : null;

    if (!user.slug && (user.profile?.firstName || user.profile?.lastName)) {
      try {
        const generatedSlug = await generateUniqueUserSlug(
          prisma,
          user.profile?.firstName,
          user.profile?.lastName,
          user.id
        );
        await prisma.user.update({
          where: { id: user.id },
          data: { slug: generatedSlug },
        });
        user.slug = generatedSlug;
      } catch {
        // Non-blocking fallback to user.id
      }
    }

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
        slug: user.slug ?? null,
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
        connection_status: connectionStatus,
        connection_direction: connectionDirection,
        is_in_network: isAccepted,
        has_in_network: incomingConnection?.status === "accepted",
        is_mutual: isAccepted,
        is_following: Boolean(followRow),
        followers_count: followersCount,
        is_own_profile: targetUserId === session.userId,
        specialistProfile: user.specialistProfile ? {
          specialty: user.specialistProfile.specialty,
          title: user.specialistProfile.title,
          selectedAreas: user.specialistProfile.selectedAreas || [],
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
            lat: s.lat != null ? Number(s.lat) : null,
            lng: s.lng != null ? Number(s.lng) : null,
            googleMapsUrl: s.googleMapsUrl,
            phone: s.phone,
            website: s.website,
            coverUrl: s.coverUrl,
            spaceType: s.spaceType,
            customSpaceType: s.customSpaceType,
            categoryArea: s.categoryArea,
            spaceCategories: (s.spaceCategories || []).map((sc: any) => ({
              categoryId: sc.categoryId,
              category: sc.category ? { id: sc.category.id, name: sc.category.name } : null,
            })),
            services: (s.services || []).map((srv: any) => ({
              id: srv.id,
              name: srv.name,
              isCustom: srv.isCustom,
              category: srv.category ? { id: srv.category.id, name: srv.category.name } : null,
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
