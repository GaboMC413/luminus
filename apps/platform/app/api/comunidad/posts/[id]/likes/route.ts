import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

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
    const existing = await prisma.communityPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.userId,
        },
      },
    });

    let isLiked = false;
    if (existing) {
      await prisma.communityPostLike.delete({
        where: {
          id: existing.id,
        },
      });
      isLiked = false;
    } else {
      await prisma.communityPostLike.create({
        data: {
          postId,
          userId: session.userId,
        },
      });
      isLiked = true;
    }

    const likesCount = await prisma.communityPostLike.count({
      where: { postId },
    });

    return NextResponse.json({ isLiked, likesCount });
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return NextResponse.json({ message: "Error al actualizar me gusta." }, { status: 500 });
  }
}
