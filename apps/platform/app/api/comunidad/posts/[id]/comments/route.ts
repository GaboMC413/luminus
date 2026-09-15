import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatPostDate } from "@/lib/community/posts";

export const runtime = "nodejs";

export async function POST(
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
    const body = await request.json();
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json(
        { message: "El comentario no puede estar vacío." },
        { status: 400 }
      );
    }

    const created = await prisma.communityPostComment.create({
      data: {
        postId,
        userId: session.userId,
        content,
      },
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
    });

    const cProfile = created.user?.profile;
    const authorName =
      [cProfile?.firstName, cProfile?.lastName].filter(Boolean).join(" ").trim() ||
      cProfile?.fullName ||
      created.user?.email?.split("@")[0] ||
      "Usuario";

    const authorLocation = [cProfile?.city, cProfile?.country].filter(Boolean).join(", ");

    const comment = {
      id: created.id,
      authorId: created.userId,
      authorName,
      authorAvatar: cProfile?.avatarUrl || undefined,
      authorRole: cProfile?.profession || "Miembro",
      authorLocation: authorLocation || undefined,
      date: formatPostDate(created.createdAt),
      content: created.content,
    };

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return NextResponse.json({ message: "Error al agregar comentario." }, { status: 500 });
  }
}
