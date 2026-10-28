import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { deleteS3FileByUrl } from "@/lib/storage/s3FileCleanup";
import { serializePost } from "@/lib/community/posts";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const postId = params.id;
  if (!postId) {
    return NextResponse.json({ message: "ID no provisto." }, { status: 400 });
  }

  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return NextResponse.json({ message: "Publicación no encontrada." }, { status: 404 });
    }

    if (post.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ message: "Permisos insuficientes." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ message: "Cuerpo de solicitud inválido." }, { status: 400 });
    }

    const {
      title,
      content,
      imageUrl,
      imageAlt,
      youtubeUrl,
      youtubeId,
      category,
      tags,
    } = body;

    if (content !== undefined && (typeof content !== "string" || !content.trim())) {
      return NextResponse.json(
        { message: "El contenido de la publicación no puede estar vacío." },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.communityPost.update({
      where: { id: postId },
      data: {
        ...(title !== undefined ? { title: title ? String(title).trim() : null } : {}),
        ...(content !== undefined ? { content: String(content).trim() } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        ...(imageAlt !== undefined ? { imageAlt: imageAlt || null } : {}),
        ...(youtubeUrl !== undefined ? { youtubeUrl: youtubeUrl || null } : {}),
        ...(youtubeId !== undefined ? { youtubeId: youtubeId || null } : {}),
        ...(category !== undefined ? { category: category || null } : {}),
        ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags : [] } : {}),
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
        },
        likes: true,
      },
    });

    const serialized = serializePost(updatedPost, session.userId);
    return NextResponse.json({ post: serialized });
  } catch (error) {
    console.error("Failed to update post:", error);
    return NextResponse.json({ message: "Error al actualizar publicación." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const postId = params.id;
  if (!postId) {
    return NextResponse.json({ message: "ID no provisto." }, { status: 400 });
  }

  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { userId: true, imageUrl: true },
    });

    if (!post) {
      return NextResponse.json({ message: "Publicación no encontrada." }, { status: 404 });
    }

    if (post.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ message: "Permisos insuficientes." }, { status: 403 });
    }

    // Clean up post image in S3 if present
    if (post.imageUrl) {
      await deleteS3FileByUrl(post.imageUrl, {
        expectedUserId: post.userId,
        expectedFolder: "feed",
      });
    }

    await prisma.communityPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json({ message: "Error al eliminar publicación." }, { status: 500 });
  }
}
