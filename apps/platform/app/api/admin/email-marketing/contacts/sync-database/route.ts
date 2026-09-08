import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getLocalContacts,
  saveLocalContact,
  LocalContact,
} from "@/lib/local-marketing/store";
import { syncAwsSuppressionListToLocalContacts } from "@/lib/local-marketing/awsSesAnalytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let platformUsersCount = 0;
    let eventGuestsCount = 0;
    let unsubscribedCount = 0;
    let bouncedCount = 0;

    // 1. Fetch Explicit Unsubscribes from Database
    const unsubscribedRecords = await prisma.unsubscribedEmail.findMany({
      select: { email: true, reason: true },
    });
    const unsubscribedSet = new Set<string>(
      unsubscribedRecords.map((r) => r.email.toLowerCase().trim())
    );

    // 2. Fetch Bounces and Complaints from sent_email_logs
    const bouncedLogs = await prisma.sentEmailLog.findMany({
      where: {
        status: { in: ["BOUNCED", "COMPLAINT"] },
      },
      select: { recipient: true, status: true },
    });
    const bouncedSet = new Set<string>(
      bouncedLogs.map((l) => l.recipient.toLowerCase().trim())
    );

    // Existing local contacts indexed by email
    const existingContacts = getLocalContacts();
    const contactMap = new Map<string, LocalContact>();
    existingContacts.forEach((c) => contactMap.set(c.email.toLowerCase().trim(), c));

    // 3. Sync Registered Platform Users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            country: true,
            city: true,
          },
        },
      },
    });

    for (const u of users) {
      if (!u.email || !u.email.includes("@")) continue;
      const emailClean = u.email.toLowerCase().trim();
      platformUsersCount++;

      const existing = contactMap.get(emailClean);
      const isUnsub = unsubscribedSet.has(emailClean) || bouncedSet.has(emailClean);

      const tags = Array.from(
        new Set([
          ...(existing?.tags || []),
          "Plataforma LUMINUS",
          "Usuario Registrado",
          ...(isUnsub ? ["desuscrito"] : []),
        ])
      );

      const updated = saveLocalContact({
        id: existing?.id,
        email: emailClean,
        firstName: u.profile?.firstName || existing?.firstName || "Usuario",
        lastName: u.profile?.lastName || existing?.lastName || "",
        country: u.profile?.country || existing?.country || undefined,
        city: u.profile?.city || existing?.city || undefined,
        source: existing?.source || "Plataforma LUMINUS",
        tags,
        unsubscribed: isUnsub || Boolean(existing?.unsubscribed),
        notes: existing?.notes || "Sincronizado automáticamente desde la base de datos de usuarios.",
      });

      contactMap.set(emailClean, updated);
    }

    // 4. Sync Event Guests (Current & Past Events)
    const guests = await prisma.eventGuest.findMany({
      include: {
        inscriptions: {
          include: {
            event: {
              select: {
                title: true,
                date: true,
              },
            },
          },
        },
      },
    });

    for (const g of guests) {
      if (!g.email || !g.email.includes("@")) continue;
      const emailClean = g.email.toLowerCase().trim();
      eventGuestsCount++;

      const existing = contactMap.get(emailClean);
      const isUnsub =
        g.marketingConsent === false ||
        unsubscribedSet.has(emailClean) ||
        bouncedSet.has(emailClean);

      // Event specific tags
      const eventTags: string[] = ["Inscripto a Eventos"];
      if (g.inscriptions && g.inscriptions.length > 0) {
        g.inscriptions.forEach((ins) => {
          if (ins.event?.title) {
            const shortTitle = ins.event.title.substring(0, 30);
            eventTags.push(`Evento: ${shortTitle}`);
          }
        });
      }

      const tags = Array.from(
        new Set([
          ...(existing?.tags || []),
          ...eventTags,
          ...(isUnsub ? ["desuscrito"] : []),
        ])
      );

      const updated = saveLocalContact({
        id: existing?.id,
        email: emailClean,
        firstName: g.firstName || existing?.firstName || "Suscriptor",
        lastName: g.lastName || existing?.lastName || "",
        country: g.country || existing?.country || undefined,
        city: g.city || existing?.city || undefined,
        source: existing?.source || "Eventos LUMINUS",
        tags,
        unsubscribed: isUnsub || Boolean(existing?.unsubscribed),
        notes: existing?.notes || "Sincronizado automáticamente desde inscripciones a eventos.",
      });

      contactMap.set(emailClean, updated);
    }

    // 5. Update All Existing Unsubscribed / Bounced Contacts
    unsubscribedSet.forEach((emailClean) => {
      const existing = contactMap.get(emailClean);
      if (existing) {
        unsubscribedCount++;
        const tags = Array.from(new Set([...(existing.tags || []), "desuscrito"]));
        const updated = saveLocalContact({
          ...existing,
          unsubscribed: true,
          tags,
        });
        contactMap.set(emailClean, updated);
      }
    });

    bouncedSet.forEach((emailClean) => {
      const existing = contactMap.get(emailClean);
      if (existing) {
        bouncedCount++;
        const tags = Array.from(new Set([...(existing.tags || []), "desuscrito", "rebote-ses"]));
        const updated = saveLocalContact({
          ...existing,
          unsubscribed: true,
          tags,
        });
        contactMap.set(emailClean, updated);
      }
    });

    // 6. Optionally Sync AWS SES Suppression List
    try {
      await syncAwsSuppressionListToLocalContacts();
    } catch (sesErr) {
      console.warn("[Sync Database] AWS SES Suppression list sync warning:", sesErr);
    }

    return NextResponse.json({
      success: true,
      platformUsersCount,
      eventGuestsCount,
      unsubscribedCount: unsubscribedSet.size,
      bouncedCount: bouncedSet.size,
      totalContacts: contactMap.size,
      message: "Base de datos sincronizada exitosamente con el motor de email marketing.",
    });
  } catch (error: any) {
    console.error("[Sync Database API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error al sincronizar la base de datos." },
      { status: 500 }
    );
  }
}
