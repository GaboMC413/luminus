import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { serializePost } from "@/lib/community/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  }

  try {
    const rawPosts = await prisma.communityPost.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
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
      orderBy: { createdAt: "desc" },
    });

    const posts = rawPosts.map((p) => serializePost(p, session.userId));
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Failed to load admin posts:", error);
    return NextResponse.json(
      { message: "Error al cargar las publicaciones." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = getCurrentSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ message: "Datos inválidos." }, { status: 400 });
    }

    const updated = await prisma.communityPost.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
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

    return NextResponse.json({ post: serializePost(updated, session.userId) });
  } catch (error) {
    console.error("Failed to update post status:", error);
    return NextResponse.json(
      { message: "Error al actualizar el estado de la publicación." },
      { status: 500 }
    );
  }
}
