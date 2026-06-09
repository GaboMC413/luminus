import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { listAdminUsers, normalizeAdminUserPatch, serializeAdminUser } from "@/lib/admin/users";

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

export async function GET(request: Request) {
  const admin = requireAdmin();

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
    const { prisma } = await import("@/lib/db");
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
    return NextResponse.json({ message: "No se pudo actualizar el usuario." }, { status: 500 });
  }
}
