import { NextResponse } from "next/server";
import { getCurrentSession, getCurrentActiveUser } from "@/lib/auth/session";
import { getOrCreateOfficialLuminusUser } from "@/lib/auth/welcome";
import { prisma } from "@/lib/db";
import { serializePost } from "@/lib/community/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getCurrentActiveUser();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Math.max(parseInt(limitParam || "25", 10) || 25, 1), 50);

    const rawPosts = await prisma.communityPost.findMany({
      where: {
        status: "approved",
      },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                profession: true,
                city: true,
                country: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                profile: {
                  select: {
                    fullName: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    profession: true,
                    city: true,
                    country: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
    });

    const hasMore = rawPosts.length > limit;
    const items = hasMore ? rawPosts.slice(0, limit) : rawPosts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const posts = items.map((p) => serializePost(p, session?.userId));
    return NextResponse.json({ posts, nextCursor, hasMore });
  } catch (error) {
    console.error("Failed to fetch community posts:", error);
    return NextResponse.json(
      { message: "No se pudieron cargar las publicaciones." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getCurrentActiveUser();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      content,
      imageUrl,
      imageAlt,
      youtubeUrl,
      youtubeId,
      category,
      tags,
      createdAt,
      postAsOfficial,
    } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { message: "El contenido de la publicación no puede estar vacío." },
        { status: 400 }
      );
    }

    const initialStatus = session.role === "ADMIN" ? "approved" : "pending";

    let customCreatedAt: Date | undefined;
    if (session.role === "ADMIN" && createdAt) {
      const parsed = new Date(createdAt);
      if (isNaN(parsed.getTime()) || parsed.getTime() > Date.now()) {
        return NextResponse.json(
          { message: "La fecha de publicación debe ser hoy o una fecha pasada." },
          { status: 400 }
        );
      }
      customCreatedAt = parsed;
    }

    const authorUserId =
      session.role === "ADMIN" && postAsOfficial === true
        ? (await getOrCreateOfficialLuminusUser(prisma)).id
        : session.userId;

    const newPost = await prisma.communityPost.create({
      data: {
        userId: authorUserId,
        title: title?.trim() || null,
        content: content.trim(),
        imageUrl: imageUrl || null,
        imageAlt: imageAlt || null,
        youtubeUrl: youtubeUrl || null,
        youtubeId: youtubeId || null,
        category: category || null,
        tags: Array.isArray(tags) ? tags : [],
        status: initialStatus,
        ...(customCreatedAt ? { createdAt: customCreatedAt } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                profession: true,
                city: true,
                country: true,
              },
            },
          },
        },
        comments: true,
        likes: true,
      },
    });

    const serialized = serializePost(newPost, session.userId);
    return NextResponse.json({ post: serialized }, { status: 201 });
  } catch (error) {
    console.error("Failed to create community post:", error);
    return NextResponse.json(
      { message: "Error al crear la publicación." },
      { status: 500 }
    );
  }
}
