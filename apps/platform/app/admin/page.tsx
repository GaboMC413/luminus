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

  const emailLogsRaw = await prisma.sentEmailLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 500,
  });

  const emailLogs = emailLogsRaw.map((log: any) => ({
    id: log.id,
    recipient: log.recipient,
    subject: log.subject,
    htmlBody: log.htmlBody,
    createdAt: log.createdAt.toISOString(),
  }));

  const searchesRaw = await prisma.activityLog.findMany({
    where: {
      action: "COMMUNITY_SEARCH",
    },
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
    take: 1000,
  });

  const searches = searchesRaw.map((log: any) => {
    let queryText = "";
    try {
      const details = JSON.parse(log.details || "{}");
      queryText = details.query || "";
    } catch {
      queryText = log.details || "";
    }

    return {
      id: log.id,
      userId: log.userId,
      query: queryText,
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
    };
  });

  const specialistsRaw = await prisma.specialistProfile.findMany({
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
  });

  const specialists = specialistsRaw.map((spec: any) => ({
    userId: spec.userId,
    specialty: spec.specialty,
    title: spec.title,
    clinicName: spec.clinicName || "",
    bio: spec.bio,
    linkedinUrl: spec.linkedinUrl || "",
    instagramUrl: spec.instagramUrl || "",
    websiteUrl: spec.websiteUrl || "",
    courses: spec.courses || [],
    createdAt: spec.createdAt.toISOString(),
    user: {
      email: spec.user.email,
      profile: {
        firstName: spec.user.profile?.firstName || "",
        lastName: spec.user.profile?.lastName || "",
        fullName: spec.user.profile?.fullName || "",
        avatarUrl: spec.user.profile?.avatarUrl || "",
      },
    },
  }));

  const postulationsRaw = await prisma.specialistPostulation.findMany({
    where: {
      status: "pending",
    },
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
  });

  const postulations = postulationsRaw.map((post: any) => ({
    id: post.id,
    userId: post.userId,
    specialty: post.specialty,
    title: post.title,
    clinicName: post.clinicName || "",
    bio: post.bio,
    linkedinUrl: post.linkedinUrl || "",
    instagramUrl: post.instagramUrl || "",
    websiteUrl: post.websiteUrl || "",
    courses: post.courses || [],
    status: post.status,
    createdAt: post.createdAt.toISOString(),
    user: {
      email: post.user.email,
      profile: {
        firstName: post.user.profile?.firstName || "",
        lastName: post.user.profile?.lastName || "",
        fullName: post.user.profile?.fullName || "",
        avatarUrl: post.user.profile?.avatarUrl || "",
      },
    },
  }));

  return (
    <AdminUsersClient
      initialUsers={users}
      initialChats={chats}
      initialSupportChats={supportChats}
      initialLogs={logs}
      initialEmailLogs={emailLogs}
      initialSearches={searches}
      initialSpecialists={specialists}
      initialPostulations={postulations}
    />
  );
}
