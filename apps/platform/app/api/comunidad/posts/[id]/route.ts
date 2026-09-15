import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

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
      select: { userId: true },
    });

    if (!post) {
      return NextResponse.json({ message: "Publicación no encontrada." }, { status: 404 });
    }

    if (post.userId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ message: "Permisos insuficientes." }, { status: 403 });
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
