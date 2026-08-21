import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { listAdminUsers } from "@/lib/admin/users";
import { listAdminChats, listAdminSupportChats } from "@/lib/admin/chats";
import { AdminUsersClient } from "./AdminUsersClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadAdminSection<T>(
  section: string,
  warnings: string[],
  load: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error(`[ADMIN_LOAD_ERROR:${section}]`, error);
    warnings.push(section);
    return fallback;
  }
}

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
  const loadWarnings: string[] = [];
  const users = await loadAdminSection("usuarios", loadWarnings, () => listAdminUsers(prisma), []);
  const chats = await loadAdminSection("chats", loadWarnings, () => listAdminChats(prisma), []);
  const supportChats = await loadAdminSection(
    "soporte",
    loadWarnings,
    () => listAdminSupportChats(prisma),
    [],
  );

  const logsRaw = await loadAdminSection("actividad", loadWarnings, () => prisma.activityLog.findMany({
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
  }), []);

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

  const emailLogsRaw = await loadAdminSection("correos", loadWarnings, () => prisma.sentEmailLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 500,
  }), []);

  const emailLogs = emailLogsRaw.map((log: any) => ({
    id: log.id,
    recipient: log.recipient,
    subject: log.subject,
    htmlBody: log.htmlBody,
    createdAt: log.createdAt.toISOString(),
  }));

  const searchesRaw = await loadAdminSection("búsquedas", loadWarnings, () => prisma.activityLog.findMany({
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
  }), []);

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

  const specialistsRaw = await loadAdminSection("especialistas", loadWarnings, () => prisma.specialistProfile.findMany({
    include: {
      spaces: {
        select: {
          id: true,
          userId: true,
          spaceType: true,
          name: true,
          address: true,
          city: true,
          country: true,
          lat: true,
          lng: true,
          googlePlaceId: true,
          googleMapsUrl: true,
          phone: true,
          website: true,
          coverUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          availability: true,
        },
      },
      courses: true,
      user: {
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              fullName: true,
              avatarUrl: true,
              city: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  }), []);

  const specialists = specialistsRaw.map((spec: any) => ({
    userId: spec.userId,
    specialty: spec.specialty,
    title: spec.title,
    clinicName: spec.clinicName || "",
    bio: spec.bio,
    linkedinUrl: spec.linkedinUrl || "",
    instagramUrl: spec.instagramUrl || "",
    websiteUrl: spec.websiteUrl || "",
    institution: spec.institution || null,
    selectedAreas: spec.selectedAreas || [],
    resumeUrl: spec.resumeUrl || null,
    spaces: spec.spaces || [],
    courses: spec.courses || [],
    createdAt: spec.createdAt.toISOString(),
    user: {
      email: spec.user.email,
      profile: {
        firstName: spec.user.profile?.firstName || "",
        lastName: spec.user.profile?.lastName || "",
        fullName: spec.user.profile?.fullName || "",
        avatarUrl: spec.user.profile?.avatarUrl || "",
        city: spec.user.profile?.city || "",
      },
    },
  }));

  const postulationsRaw = await loadAdminSection("postulaciones", loadWarnings, () => prisma.specialistPostulation.findMany({
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
              city: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  }), []);

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
    institution: post.institution || null,
    selectedAreas: post.selectedAreas || [],
    resumeUrl: post.resumeUrl || null,
    clinicData: post.clinicData || null,
    sessionsData: post.sessionsData || null,
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
        city: post.user.profile?.city || "",
      },
    },
  }));

  const categoriesRaw = await loadAdminSection("categorías", loadWarnings, () => prisma.interestCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      interests: { orderBy: { sortOrder: "asc" } },
      specialistAreas: { orderBy: { sortOrder: "asc" } },
    },
  }), []);

  const categories = categoriesRaw.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon || "label",
    iconFilled: cat.iconFilled ?? true,
    color: cat.color || "#3B82F6",
    bgColor: cat.bgColor || "#DBEAFE",
    sortOrder: cat.sortOrder,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
    interests: (cat.interests || []).map((i: any) => ({
      id: i.id,
      categoryId: i.categoryId,
      name: i.name,
      slug: i.slug,
      sortOrder: i.sortOrder,
      isActive: i.isActive,
    })),
    specialistAreas: (cat.specialistAreas || []).map((s: any) => ({
      id: s.id,
      categoryId: s.categoryId,
      name: s.name,
      slug: s.slug,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    })),
  }));

  const suggestionsRaw = await loadAdminSection("sugerencias", loadWarnings, () => prisma.categorySuggestion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              fullName: true,
            },
          },
        },
      },
      category: {
        select: { id: true, name: true },
      },
    },
  }), []);

  const suggestions = suggestionsRaw.map((sugg: any) => ({
    id: sugg.id,
    type: sugg.type,
    name: sugg.name,
    status: sugg.status,
    userId: sugg.userId,
    categoryId: sugg.categoryId,
    createdAt: sugg.createdAt.toISOString(),
    user: sugg.user ? {
      email: sugg.user.email,
      fullName: sugg.user.profile?.fullName || `${sugg.user.profile?.firstName || ""} ${sugg.user.profile?.lastName || ""}`.trim() || sugg.user.email,
    } : null,
    categoryName: sugg.category?.name || null,
  }));

  const eventsRaw = await loadAdminSection("eventos", loadWarnings, () => prisma.event.findMany({
    include: {
      inscriptions: {
        include: {
          guest: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  }), []);

  const events = eventsRaw.map((ev: any) => ({
    id: ev.id,
    youtubeId: ev.youtubeId || null,
    slug: ev.slug || null,
    title: ev.title,
    description: ev.description || "",
    date: ev.date ? ev.date.toISOString() : null,
    timeText: ev.timeText || null,
    location: ev.location || null,
    speakerName: ev.speakerName || null,
    speakerBio: ev.speakerBio || null,
    category: ev.category || null,
    coverUrl: ev.coverUrl || null,
    link: ev.link || null,
    isUpcoming: ev.isUpcoming,
    createdAt: ev.createdAt.toISOString(),
    inscriptionsCount: ev.inscriptions?.length || 0,
  }));

  const inscriptionsRaw = await loadAdminSection("inscripciones", loadWarnings, () => prisma.eventInscription.findMany({
    include: {
      guest: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  }), []);

  const inscriptions = inscriptionsRaw.map((ins: any) => ({
    id: ins.id,
    eventId: ins.eventId,
    userId: ins.userId || null,
    guestFirstName: ins.guest?.firstName || ins.guestFirstName || null,
    guestLastName: ins.guest?.lastName || ins.guestLastName || null,
    guestEmail: ins.guest?.email || ins.guestEmail || null,
    guestCity: ins.guest?.city || ins.guestCity || null,
    createdAt: ins.createdAt.toISOString(),
    user: ins.user ? {
      email: ins.user.email,
      profile: {
        firstName: ins.user.profile?.firstName || "",
        lastName: ins.user.profile?.lastName || "",
        fullName: ins.user.profile?.fullName || "",
        avatarUrl: ins.user.profile?.avatarUrl || "",
      },
    } : undefined,
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
      initialCategories={categories}
      initialSuggestions={suggestions}
      initialEvents={events}
      initialInscriptions={inscriptions}
      initialLoadWarnings={loadWarnings}
    />
  );
}
