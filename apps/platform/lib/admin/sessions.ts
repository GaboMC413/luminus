import type { PrismaClient } from "@prisma/client";
import type { AdminIntroSession } from "@/app/admin/types";

function formatDisplayName(user: any): string {
  const p = user?.profile;
  return (
    p?.fullName ||
    `${p?.firstName || ""} ${p?.lastName || ""}`.trim() ||
    user?.email ||
    "Usuario"
  );
}

export function serializeAdminIntroSession(row: any): AdminIntroSession {
  return {
    id: row.id,
    requesterId: row.requesterId,
    specialistId: row.specialistId,
    scheduledDate: row.scheduledDate,
    startTime: row.startTime,
    endTime: row.endTime,
    timezone: row.timezone,
    status: row.status,
    requesterNote: row.requesterNote || "",
    specialistNote: row.specialistNote || "",
    meetingLink: row.meetingLink || "",
    hostMeetingLink: row.hostMeetingLink || "",
    wherebyMeetingId: row.wherebyMeetingId || null,
    requesterTermsAcceptedAt: row.requesterTermsAcceptedAt
      ? row.requesterTermsAcceptedAt.toISOString()
      : null,
    specialistTermsAcceptedAt: row.specialistTermsAcceptedAt
      ? row.specialistTermsAcceptedAt.toISOString()
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    requester: {
      id: row.requester?.id || row.requesterId,
      email: row.requester?.email || "",
      name: formatDisplayName(row.requester),
      avatarUrl: row.requester?.profile?.avatarUrl || "",
    },
    specialist: {
      id: row.specialist?.id || row.specialistId,
      email: row.specialist?.email || "",
      name: formatDisplayName(row.specialist),
      avatarUrl: row.specialist?.profile?.avatarUrl || "",
      specialty:
        row.specialist?.specialistProfile?.specialty ||
        row.specialist?.specialistProfile?.title ||
        "Especialista",
    },
  };
}

export async function listAdminIntroSessions(
  prisma: PrismaClient
): Promise<AdminIntroSession[]> {
  const rows = await prisma.introSession.findMany({
    include: {
      requester: {
        select: {
          id: true,
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
      specialist: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          specialistProfile: {
            select: {
              specialty: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
  });

  return rows.map(serializeAdminIntroSession);
}
