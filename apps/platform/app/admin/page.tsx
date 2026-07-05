import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { listAdminUsers } from "@/lib/admin/users";
import { listAdminChats, listAdminSupportChats } from "@/lib/admin/chats";
import { AdminUsersClient } from "./AdminUsersClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = getCurrentSession();

  if (!session) {
    redirect("/auth/iniciar-sesion");
  }

  if (session.role !== "ADMIN") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-6 text-slate-950">
        <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-[24px] font-bold">Acceso restringido</h1>
          <p className="mt-3 text-[14px] leading-6 text-slate-500">Tu usuario no tiene permisos de administrador.</p>
        </section>
      </main>
    );
  }

  const { prisma } = await import("@/lib/db");
  const users = await listAdminUsers(prisma);
  const chats = await listAdminChats(prisma);
  const supportChats = await listAdminSupportChats(prisma);

  const logsRaw = await prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 500,
  });

  const logs = logsRaw.map((log: any) => ({
    id: log.id,
    userId: log.userId,
    action: log.action,
    details: log.details,
    createdAt: log.createdAt.toISOString(),
    user: {
      email: log.user.email,
      profile: {
        firstName: log.user.profile?.firstName || "",
        lastName: log.user.profile?.lastName || "",
        fullName: log.user.profile?.fullName || "",
        avatarUrl: log.user.profile?.avatarUrl || "",
      },
    },
  }));

  return <AdminUsersClient initialUsers={users} initialChats={chats} initialSupportChats={supportChats} initialLogs={logs} />;
}
