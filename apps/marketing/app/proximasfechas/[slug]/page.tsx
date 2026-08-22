import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar, EventRegistrationSection, Footer } from "@/components";

export const revalidate = 0;
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) {
    return {
      title: "Inscripción a Evento | LUMINUS",
    };
  }

  const title = `${event.title} | Inscripción LUMINUS`;
  const cleanDescription = event.description
    ? event.description
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .substring(0, 200)
    : "Un espacio para conectar, aprender y cuidar tu bienestar en Latinoamérica.";

  const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://luminuslatam.com";
  const eventUrl = `${domain}/proximasfechas/${params.slug}`;

  let coverImageUrl = event.cover_url || `${domain}/logo-mails.png`;
  if (coverImageUrl.startsWith("/")) {
    coverImageUrl = `${domain}${coverImageUrl}`;
  }

  return {
    title,
    description: cleanDescription,
    alternates: {
      canonical: eventUrl,
    },
    openGraph: {
      title,
      description: cleanDescription,
      url: eventUrl,
      siteName: "LUMINUS",
      locale: "es_LA",
      type: "website",
      images: [
        {
          url: coverImageUrl,
          secureUrl: coverImageUrl,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: event.title || "Portada de Evento LUMINUS",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: [coverImageUrl],
    },
  };
}

async function getEventBySlug(slug: string) {
  let event = null;

  try {
    if (supabase) {
      // 1. Try querying by slug first
      const { data: dataBySlug } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (dataBySlug) {
        event = dataBySlug;
      } else {
        // 2. Only query by id if slug is a valid UUID string
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        if (isUuid) {
          const { data: dataById } = await supabase
            .from("events")
            .select("*")
            .eq("id", slug)
            .maybeSingle();
          if (dataById) event = dataById;
        }
      }
    }
  } catch (err) {
    console.warn("Could not fetch event from Supabase:", err);
  }

  return event;
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
