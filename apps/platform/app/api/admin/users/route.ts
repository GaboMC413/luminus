import { NextResponse } from "next/server";
import { getCurrentSession, invalidateUserSessionCache } from "@/lib/auth/session";
import { invalidateServerCacheTag } from "@/lib/serverCache";
import { listAdminUsers, normalizeAdminUserPatch, serializeAdminUser } from "@/lib/admin/users";
import { syncCognitoUserStatus } from "@/lib/auth/cognito-admin";
import { deleteUserS3Data } from "@/lib/storage/userStorageCleanup";
import { handleApiError } from "@/lib/errors/server-error";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getCurrentSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "No autorizado." }, { status: 401 }),
    };
  }

  if (session.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "No tienes permisos de administrador." }, { status: 403 }),
    };
  }

  return { ok: true as const, session };
}

export async function GET(request: Request) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return admin.response;
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";

  try {
    const { prisma } = await import("@/lib/db");
    const users = await listAdminUsers(prisma, search);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to list admin users.", error);
    return NextResponse.json({ message: "No se pudieron cargar los usuarios." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return admin.response;
  }

  const parsed = normalizeAdminUserPatch(await request.json().catch(() => null));

  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 });
  }

  if (parsed.id === admin.session.userId && parsed.userData.status && parsed.userData.status !== "active") {
    return NextResponse.json({ message: "No puedes desactivar tu propio usuario admin." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");

    if (parsed.userData.email) {
      const emailConflict = await prisma.user.findFirst({
        where: {
          email: parsed.userData.email,
          id: { not: parsed.id },
        },
      });
      if (emailConflict) {
        return NextResponse.json({ message: "Ese correo electrónico ya pertenece a otro usuario." }, { status: 400 });
      }
    }

    if (parsed.userData.status) {
      const existingUser = await prisma.user.findUnique({
        where: { id: parsed.id },
        include: {
          identities: true,
        },
      });

      if (!existingUser) {
        return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
      }

      if (existingUser.status !== parsed.userData.status) {
        await syncCognitoUserStatus(existingUser, parsed.userData.status);
      }
    }

    const user = await prisma.user.update({
      where: { id: parsed.id },
      data: {
        ...parsed.userData,
        profile: {
          upsert: {
            create: parsed.profileData,
            update: parsed.profileData,
          },
        },
      },
      include: {
        profile: true,
        interests: {
          include: {
            interest: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    invalidateUserSessionCache(parsed.id);
    invalidateServerCacheTag(["specialists", "community-filters"]);

    return NextResponse.json({ user: serializeAdminUser(user) });
  } catch (error) {
    return handleApiError(error, {
      context: "[admin/users] PATCH",
      message: "No se pudo actualizar el usuario.",
    });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return admin.response;
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID de usuario es requerido." }, { status: 400 });
  }

  if (id === admin.session.userId) {
    return NextResponse.json({ message: "No puedes eliminar tu propio usuario admin." }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/db");

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        identities: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    // First delete from Cognito
    await syncCognitoUserStatus(existingUser, "deleted");

    // Purge user storage files and folders from S3
    await deleteUserS3Data(id);

    // Then hard delete from Database
    await prisma.user.delete({
      where: { id },
    });

    invalidateUserSessionCache(id);
    invalidateServerCacheTag(["specialists", "community-filters"]);

    return NextResponse.json({ message: "Usuario eliminado permanentemente." });
  } catch (error) {
    return handleApiError(error, {
      context: "[admin/users] DELETE",
      message: "No se pudo eliminar el usuario.",
    });
  }
}
