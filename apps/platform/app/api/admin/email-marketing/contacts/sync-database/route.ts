import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getLocalContacts,
  saveLocalContact,
  deleteLocalContact,
  LocalContact,
  ContactStatus,
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
    let newContactsCount = 0;
    let updatedContactsCount = 0;

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

    // Clean up test dummy contacts and deleted users from Postgres
    const dummyTestEmails = [
      "testari@test.com",
      "test6@test.com",
      "test@test.com",
      "test.local.marketing@example.com",
    ];

    let deletedUserEmails = new Set<string>();
    try {
      const deletedUsers = await prisma.user.findMany({
        where: { status: "deleted" },
        select: { email: true },
      });
      deletedUsers.forEach((u) => {
        if (u.email) deletedUserEmails.add(u.email.toLowerCase().trim());
      });
    } catch (e) {
      console.warn("[Sync Database] Error fetching deleted users:", e);
    }

    for (const [email, contact] of Array.from(contactMap.entries())) {
      if (
        deletedUserEmails.has(email) ||
        dummyTestEmails.includes(email) ||
        (email.startsWith("test") && email.endsWith("@test.com"))
      ) {
        deleteLocalContact(contact.id);
        contactMap.delete(email);
      }
    }

    // 3. Sync Registered Platform Users (Only non-deleted)
    const users = await prisma.user.findMany({
      where: {
        status: { not: "deleted" },
      },
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
      orderBy: { createdAt: "desc" },
    });

    for (const u of users) {
      if (!u.email || !u.email.includes("@")) continue;
      const emailClean = u.email.toLowerCase().trim();
      platformUsersCount++;

      const existing = contactMap.get(emailClean);
      if (existing) {
        updatedContactsCount++;
      } else {
        newContactsCount++;
      }

      const isUnsub = unsubscribedSet.has(emailClean) || bouncedSet.has(emailClean);

      const cleanExistingTags = (existing?.tags || []).filter(
        (t) => t !== "Plataforma LUMINUS" && t !== "Usuario Registrado"
      );

      const tags = Array.from(
        new Set([
          ...cleanExistingTags,
          "Usuario Plataforma",
        ])
      );

      const userCreatedAt = u.createdAt
        ? new Date(u.createdAt).toISOString()
        : existing?.createdAt || new Date().toISOString();

      const updated = saveLocalContact({
        id: existing?.id,
        email: emailClean,
        firstName: u.profile?.firstName || existing?.firstName || "",
        lastName: u.profile?.lastName || existing?.lastName || "",
        country: u.profile?.country || existing?.country || undefined,
        city: u.profile?.city || existing?.city || undefined,
        source: existing?.source || "Plataforma LUMINUS",
        tags,
        unsubscribed: isUnsub || Boolean(existing?.unsubscribed),
        notes: existing?.notes || "Sincronizado automáticamente desde la base de datos de usuarios.",
        createdAt: userCreatedAt,
      });

      contactMap.set(emailClean, updated);
    }

    // 4. Sync Event Guests (ONLY Past Events - exclude upcoming event registrants)
    const now = new Date();
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

      // Filter inscriptions to include only past events
      const pastInscriptions = (g.inscriptions || []).filter(
        (ins) => ins.event?.date && new Date(ins.event.date) < now
      );

      // Exclude guests who have no past event registrations (i.e. only registered to upcoming events or no events)
      if (pastInscriptions.length === 0) continue;

      const emailClean = g.email.toLowerCase().trim();
      eventGuestsCount++;

      const existing = contactMap.get(emailClean);
      if (existing) {
        updatedContactsCount++;
      } else {
        newContactsCount++;
      }

      const isBounced = bouncedSet.has(emailClean);
      const isUnsub = g.marketingConsent === false || unsubscribedSet.has(emailClean);

      const status: ContactStatus = isBounced
        ? "BOUNCED"
        : isUnsub
        ? "UNSUBSCRIBED"
        : existing?.status || "ACTIVE";

      const eventTitles = pastInscriptions.map((ins) => ins.event?.title).filter(Boolean);
      let notes = existing?.notes || "";
      if (eventTitles.length > 0) {
        for (const title of eventTitles) {
          if (!notes.includes(title!)) {
            notes = notes
              ? `${notes}\n[Inscripto a Evento]: "${title}"`
              : `[Inscripto a Evento]: "${title}"`;
          }
        }
      }

      // Filter out technical status tags and legacy event tags
      const cleanExistingTags = (existing?.tags || []).filter(
        (t) =>
          t !== "desuscrito" &&
          t !== "bounced" &&
          t !== "rebote-ses" &&
          t !== "Inscripto a Eventos" &&
          t !== "Inscripto a Eventos Pasados" &&
          !t.startsWith("Evento:")
      );

      const tags = Array.from(new Set([...cleanExistingTags, "Inscripto a Evento"]));

      const updated = saveLocalContact({
        id: existing?.id,
        email: emailClean,
        firstName: g.firstName || existing?.firstName || "",
        lastName: g.lastName || existing?.lastName || "",
        country: g.country || existing?.country || undefined,
        city: g.city || existing?.city || undefined,
        source: existing?.source || "Eventos LUMINUS",
        tags,
        status,
        unsubscribed: status === "UNSUBSCRIBED",
        bounced: status === "BOUNCED",
        notes: notes || "Sincronizado automáticamente desde inscripciones a eventos pasados.",
      });

      contactMap.set(emailClean, updated);
    }

    // 5. Update All Existing Unsubscribed / Bounced Contacts
    unsubscribedSet.forEach((emailClean) => {
      const existing = contactMap.get(emailClean);
      if (existing) {
        unsubscribedCount++;
        const cleanTags = (existing.tags || []).filter((t) => t !== "desuscrito" && t !== "bounced");
        const updated = saveLocalContact({
          ...existing,
          status: "UNSUBSCRIBED",
          unsubscribed: true,
          bounced: false,
          tags: cleanTags,
        });
        contactMap.set(emailClean, updated);
      }
    });

    bouncedSet.forEach((emailClean) => {
      const existing = contactMap.get(emailClean);
      if (existing) {
        bouncedCount++;
        const cleanTags = (existing.tags || []).filter((t) => t !== "desuscrito" && t !== "bounced" && t !== "rebote-ses");
        const updated = saveLocalContact({
          ...existing,
          status: "BOUNCED",
          bounced: true,
          unsubscribed: false,
          tags: cleanTags,
        });
        contactMap.set(emailClean, updated);
      }
    });

    // 6. Sync AWS SES Suppression List (Bounces & Complaints)
    let awsSuppressionResult = {
      syncedCount: 0,
      totalSuppressed: 0,
      complaintsCount: 0,
      bouncesCount: 0,
    };
    try {
      awsSuppressionResult = await syncAwsSuppressionListToLocalContacts();
    } catch (sesErr) {
      console.warn("[Sync Database] AWS SES Suppression list sync warning:", sesErr);
    }

    // 7. Calculate final accurate metrics from local contact store
    const finalContacts = getLocalContacts();
    const finalBounced = finalContacts.filter((c) => c.status === "BOUNCED" || Boolean(c.bounced)).length;
    const finalUnsubscribed = finalContacts.filter(
      (c) => (c.status === "UNSUBSCRIBED" || Boolean(c.unsubscribed)) && c.status !== "BOUNCED" && !c.bounced
    ).length;

    return NextResponse.json({
      success: true,
      newContactsCount: newContactsCount + (awsSuppressionResult.syncedCount > 0 ? awsSuppressionResult.syncedCount : 0),
      updatedContactsCount,
      platformUsersCount,
      eventGuestsCount,
      unsubscribedCount: finalUnsubscribed,
      bouncedCount: finalBounced,
      awsSuppressedCount: awsSuppressionResult.totalSuppressed,
      awsComplaintsCount: awsSuppressionResult.complaintsCount,
      awsBouncesCount: awsSuppressionResult.bouncesCount,
      totalContacts: finalContacts.length,
      message: "Base de datos y lista de supresión de AWS SES sincronizadas exitosamente.",
    });
  } catch (error: any) {
    console.error("[Sync Database API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error al sincronizar la base de datos." },
      { status: 500 }
    );
  }
}
