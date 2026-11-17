import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { isUuid } from "@/utils/validation";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMPORT_ROWS = 2000;

interface ImportRowInput {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  city?: unknown;
  state?: unknown;
  country?: unknown;
  createdAt?: unknown;
}

function cleanStr(val: unknown): string | undefined {
  if (typeof val !== "string") return undefined;
  const trimmed = val.trim();
  return trimmed ? trimmed : undefined;
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
    }

    const { id: eventId } = await props.params;
    if (!eventId || !isUuid(eventId)) {
      return NextResponse.json({ error: "ID de evento inválido." }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!event) {
      return NextResponse.json({ error: "El evento no existe." }, { status: 404 });
    }

    const body = await request.json();
    const rawRows: unknown = body?.rows;
    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      return NextResponse.json(
        { error: "No se recibieron filas válidas para importar." },
        { status: 400 }
      );
    }

    if (rawRows.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        { error: `El máximo por importación es de ${MAX_IMPORT_ROWS} filas.` },
        { status: 400 }
      );
    }

    const seenEmails = new Set<string>();
    let importedCount = 0;
    let alreadyRegisteredCount = 0;
    let skippedCount = 0;
    const createdInscriptions = [];

    for (const item of rawRows as ImportRowInput[]) {
      const email = cleanStr(item?.email)?.toLowerCase();
      if (!email || !EMAIL_RE.test(email)) {
        skippedCount++;
        continue;
      }

      if (seenEmails.has(email)) {
        continue;
      }
      seenEmails.add(email);

      const firstName = cleanStr(item?.firstName);
      const lastName = cleanStr(item?.lastName);
      const city = cleanStr(item?.city);
      const state = cleanStr(item?.state);
      const country = cleanStr(item?.country);

      let createdAtDate: Date | undefined;
      if (typeof item?.createdAt === "string" && item.createdAt.trim()) {
        const parsed = new Date(item.createdAt);
        if (!Number.isNaN(parsed.getTime())) {
          createdAtDate = parsed;
        }
      }

      const guest = await prisma.eventGuest.upsert({
        where: { email },
        update: {
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(city ? { city } : {}),
          ...(state ? { state } : {}),
          ...(country ? { country } : {}),
        },
        create: {
          email,
          firstName: firstName || "Invitado",
          ...(lastName ? { lastName } : {}),
          ...(city ? { city } : {}),
          ...(state ? { state } : {}),
          ...(country ? { country } : {}),
          isGuest: true,
        },
      });

      const existing = await prisma.eventInscription.findUnique({
        where: {
          eventId_guestId: { eventId, guestId: guest.id },
        },
        select: { id: true },
      });

      if (existing) {
        alreadyRegisteredCount++;
        continue;
      }

      const inscription = await prisma.eventInscription.create({
        data: {
          eventId,
          guestId: guest.id,
          ...(createdAtDate ? { createdAt: createdAtDate } : {}),
        },
      });

      importedCount++;
      createdInscriptions.push({
        id: inscription.id,
        eventId: inscription.eventId,
        userId: null,
        guestFirstName: guest.firstName,
        guestLastName: guest.lastName,
        guestEmail: guest.email,
        guestCity: guest.city,
        guestState: guest.state,
        guestCountry: guest.country,
        marketingConsent: guest.marketingConsent,
        notifiedLiveAt: null,
        notifiedLiveStatus: inscription.notifiedLiveStatus,
        createdAt: inscription.createdAt.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      importedCount,
      alreadyRegisteredCount,
      skippedCount,
      inscriptions: createdInscriptions,
    });
  } catch (error: unknown) {
    console.error("[admin/events/import-inscriptions] POST error:", error);
    return NextResponse.json(
      { error: "Error al importar las inscripciones." },
      { status: 500 }
    );
  }
}
