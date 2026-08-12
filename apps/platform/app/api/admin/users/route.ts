import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { listAdminUsers, normalizeAdminUserPatch, serializeAdminUser } from "@/lib/admin/users";
import { syncCognitoUserStatus } from "@/lib/auth/cognito-admin";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function requireAdmin() {
  const session = getCurrentSession();

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

function describeAdminUpdateError(error: unknown) {
  if (!(error instanceof Error)) {
    return "No se pudo actualizar el usuario.";
  }

  if (error.message.includes("COGNITO_USER_POOL_ID")) {
    return "Falta configurar COGNITO_USER_POOL_ID en el servidor.";
  }

  const errorName = error.name || "Error";

  if (["AccessDeniedException", "NotAuthorizedException", "InvalidSignatureException"].includes(errorName)) {
    return `Cognito rechazo la operacion: ${errorName}. Revisa credenciales IAM y permisos.`;
  }

  if (["ResourceNotFoundException", "UserNotFoundException"].includes(errorName)) {
    return `Cognito no encontro el recurso o usuario: ${errorName}. Revisa User Pool ID y vinculo del usuario.`;
  }

  return `No se pudo actualizar el usuario. Detalle: ${errorName}.`;
}

export async function GET(request: Request) {
  const admin = requireAdmin();

  if (!admin.ok) {
    return admin.response;
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";

  try {
    const users = await listAdminUsers(prisma, search);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to list admin users.", error);
    return NextResponse.json({ message: "No se pudieron cargar los usuarios." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = requireAdmin();

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

    return NextResponse.json({ user: serializeAdminUser(user) });
  } catch (error) {
    console.error("Failed to update admin user.", error);
    return NextResponse.json({ message: describeAdminUpdateError(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = requireAdmin();

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

    // Then hard delete from Database
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuario eliminado permanentemente." });
  } catch (error) {
    console.error("Failed to delete admin user.", error);
    return NextResponse.json({ message: describeAdminUpdateError(error) }, { status: 500 });
  }
}
