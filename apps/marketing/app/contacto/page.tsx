import type { Metadata } from "next";
import { Navbar, ContactHero, Footer } from "@/components";

export const metadata: Metadata = {
  title: "Contacto | LUMINUS LATAM",
  description: "¿Tienes alguna pregunta, propuesta o quieres conocer más sobre LUMINUS? Escríbenos y te responderemos a la brevedad.",
  alternates: {
    canonical: "https://luminuslatam.com/contacto",
  },
  openGraph: {
    type: "website",
    locale: "es_LA",
    url: "https://luminuslatam.com/contacto",
    siteName: "LUMINUS LATAM",
    title: "Contacto | LUMINUS LATAM",
    description: "¿Tienes alguna pregunta, propuesta o quieres conocer más sobre LUMINUS? Escríbenos y te responderemos a la brevedad.",
    images: [
      {
        url: "https://luminuslatam.com/luminus_platform.jpg",
        secureUrl: "https://luminuslatam.com/luminus_platform.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "LUMINUS LATAM - Contacto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | LUMINUS LATAM",
    description: "¿Tienes alguna pregunta, propuesta o quieres conocer más sobre LUMINUS? Escríbenos y te responderemos a la brevedad.",
    images: ["https://luminuslatam.com/luminus_platform.jpg"],
  },
};

export default function ContactoPage() {
  return (
    <main className="w-full min-h-screen bg-black text-white flex flex-col justify-between pt-[64px]">
      <Navbar />

      <div className="w-full flex-1 flex flex-col justify-center bg-black text-white">
        <ContactHero />
      </div>

      <Footer />
    </main>
  );
}
