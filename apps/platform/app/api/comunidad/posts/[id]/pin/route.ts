import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { serializePost } from "@/lib/community/posts";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = getCurrentSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { message: "No autorizado. Se requieren permisos de administrador." },
      { status: 403 }
    );
  }

  const postId = params.id;
  if (!postId) {
    return NextResponse.json({ message: "ID no provisto." }, { status: 400 });
  }

  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Publicación no encontrada." },
        { status: 404 }
      );
    }

    // Only posts authored by an admin can be pinned
    if (post.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Solo se pueden fijar publicaciones creadas por administradores." },
        { status: 400 }
      );
    }

    const nextIsPinned = !post.isPinned;

    if (nextIsPinned) {
      // Single pinned post rule: Unpin any other previously pinned posts
      await prisma.communityPost.updateMany({
        where: { isPinned: true },
        data: {
          isPinned: false,
          pinnedAt: null,
        },
      });
    }

    const updatedPost = await prisma.communityPost.update({
      where: { id: postId },
      data: {
        isPinned: nextIsPinned,
        pinnedAt: nextIsPinned ? new Date() : null,
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
    });

    return NextResponse.json({
      success: true,
      post: serializePost(updatedPost, session.userId),
    });
  } catch (error) {
    console.error("Failed to toggle pinned post status:", error);
    return NextResponse.json(
      { message: "Error al actualizar el estado de fijado de la publicación." },
      { status: 500 }
    );
  }
}
