import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { ActividadDetailView, DetailEventItem } from "./ActividadDetailView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getEventData(slug: string) {
  const isUuid = UUID_REGEX.test(slug);

  const event = await prisma.event.findFirst({
    where: {
      OR: [
        { slug },
        ...(isUuid ? [{ id: slug }] : []),
      ],
    },
  });

  return event;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await getEventData(slug);

  if (!event) {
    return {
      title: "Actividad no encontrada | LUMINUS",
    };
  }

  return {
    title: `${event.title} | LUMINUS`,
    description: event.description?.slice(0, 160) || "Actividad sobre bienestar en LUMINUS.",
  };
}

export default async function ActividadDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const event = await getEventData(slug);

  if (!event) {
    notFound();
  }

  const session = await getCurrentSession();
  let isRegistered = false;

  if (session?.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    if (user?.email) {
      const inscription = await prisma.eventInscription.findFirst({
        where: {
          eventId: event.id,
          guest: {
            email: user.email.toLowerCase().trim(),
          },
        },
      });
      isRegistered = Boolean(inscription);
    }
  }

  const detailItem: DetailEventItem = {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    speakerName: event.speakerName,
    speakerBio: event.speakerBio,
    category: event.category,
    coverUrl: event.coverUrl,
    date: event.date ? event.date.toISOString() : null,
    timeText: event.timeText,
    location: event.location,
    link: event.link,
    youtubeId: event.youtubeId,
    isUpcoming: event.isUpcoming,
    isRegistered,
  };

  return <ActividadDetailView event={detailItem} />;
}
