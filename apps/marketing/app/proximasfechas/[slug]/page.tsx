import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDbEvents } from "@/lib/events";
import { Navbar, EventRegistrationSection, Footer } from "@/components";

export const revalidate = 0;
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    slug: string;
  };
}

async function getEventBySlug(slug: string): Promise<any | null> {
  const bySlug = await getDbEvents({ slug });
  if (bySlug) return bySlug;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  if (isUuid) {
    const byId = await getDbEvents({ id: slug });
    if (byId) return byId;
  }
  return null;
}

function getImageMimeType(url: string): string {
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (cleanUrl.endsWith(".png")) return "image/png";
  if (cleanUrl.endsWith(".webp")) return "image/webp";
  if (cleanUrl.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) {
    return { title: "Inscripción a Evento | LUMINUS LATAM" };
  }

  const title = `${event.title} | LUMINUS LATAM`;

  const speakerName = event.speaker_name || event.speakerName;
  const isSpeakerValid =
    speakerName &&
    !["Especialista LUMINUS", "Especialistas LUMINUS", "Especialista", "LUMINUS"].includes(speakerName.trim());
  const cleanSpeaker = isSpeakerValid
    ? (speakerName.trim().startsWith("Con ") ? speakerName.trim().slice(4) : speakerName.trim())
    : "";

  let cleanDescription = event.description
    ? event.description
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/\n+/g, " ")
        .trim()
    : "";

  if (cleanDescription.length > 140) {
    cleanDescription = cleanDescription.substring(0, 140).trim() + "...";
  }

  const formattedDesc = cleanDescription
    ? cleanDescription.endsWith(".") || cleanDescription.endsWith("...")
      ? cleanDescription
      : `${cleanDescription}.`
    : "";

  const socialDescription = cleanSpeaker
    ? `Con ${cleanSpeaker}.${formattedDesc ? ` ${formattedDesc}` : ""} Inscribirme ahora.`
    : formattedDesc
    ? `${formattedDesc} Inscribirme ahora.`
    : "Participa de este encuentro en LUMINUS LATAM. Inscribirme ahora.";

  const domain = (process.env.NEXT_PUBLIC_SITE_URL || "https://luminuslatam.com").replace(/\/$/, "");
  const eventUrl = `${domain}/proximasfechas/${params.slug}`;

  const rawCover = event.coverUrl || event.cover_url;
  const fallbackCover = `${domain}/luminus_events.jpg`;
  const coverImageUrl = rawCover
    ? (rawCover.startsWith("http://") || rawCover.startsWith("https://")
        ? rawCover
        : `${domain}${rawCover.startsWith("/") ? "" : "/"}${rawCover}`)
    : fallbackCover;

  const imageMimeType = getImageMimeType(coverImageUrl);

  return {
    title,
    description: socialDescription,
    alternates: { canonical: eventUrl },
    openGraph: {
      title,
      description: socialDescription,
      url: eventUrl,
      siteName: "LUMINUS LATAM",
      locale: "es_LA",
      type: "website",
      images: [
        {
          url: coverImageUrl,
          secureUrl: coverImageUrl,
          width: 1200,
          height: 630,
          type: imageMimeType,
          alt: event.title || "Entrevistas y Encuentros | LUMINUS LATAM",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: socialDescription,
      images: [coverImageUrl],
    },
  };
}

export default async function DynamicEventRegistrationPage({ params }: PageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-start items-start">
      <Navbar />
      <div className="w-full pt-[64px] flex-1 flex flex-col min-h-[80vh]">
        <EventRegistrationSection event={event} />
      </div>
      <Footer />
    </main>
  );
}
