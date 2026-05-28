import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LUMINUS | Bienestar, Conexiones y Crecimiento Personal LATAM",
    template: "%s | LUMINUS"
  },
  description: "Un espacio profesional de bienestar y crecimiento en Latinoamérica. Conecta con personas afines, obtén asesoramiento de expertos y alinea tu vida personal y laboral con propósito.",
  keywords: [
    "bienestar", 
    "crecimiento personal", 
    "conexiones significativas", 
    "salud mental", 
    "coaching", 
    "expertos bienestar", 
    "bienestar corporativo",
    "equilibrio de vida",
    "comunidad bienestar Latinoamérica"
  ],
  authors: [{ name: "Luminus" }],
  creator: "Luminus Team",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "LUMINUS | Bienestar, Conexiones y Crecimiento Personal LATAM",
    description: "Conecta con personas y expertos que te ayudan a cultivar bienestar, equilibrio y dirección en tu desarrollo y crecimiento personal.",
    url: "https://luminus.lat",
    siteName: "LUMINUS",
    locale: "es_LA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMINUS | Bienestar, Conexiones y Crecimiento Personal LATAM",
    description: "Tu espacio ético y profesional de bienestar en Latinoamérica. Conexiones significativas, expertos y crecimiento personal.",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0" />
      </head>
      <body className={inter.className}>
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
            strategy="afterInteractive"
          />
        )}
        {children}
      </body>
    </html>
  );
}

