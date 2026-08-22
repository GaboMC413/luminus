import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyC8oSQoTxkqdQ2otejFMnrGQAU1oeUaZEA";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://luminusbienestar.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "LUMINUS | Tu red de bienestar en Latinoamérica",
  description: "Un espacio para conectar, aprender y cuidar tu bienestar. LUMINUS conecta personas, especialistas y espacios de toda Latinoamérica en una misma comunidad.",
  icons: {
    icon: "/ico.png",
    shortcut: "/ico.png",
    apple: "/ico.png",
  },
  openGraph: {
    title: "LUMINUS | Tu red de bienestar en Latinoamérica",
    description: "Un espacio para conectar, aprender y cuidar tu bienestar. LUMINUS conecta personas, especialistas y espacios de toda Latinoamérica en una misma comunidad.",
    url: siteUrl,
    siteName: "LUMINUS",
    images: [
      {
        url: "/logo-mails.png",
        width: 1200,
        height: 630,
        alt: "LUMINUS Bienestar",
      },
    ],
    locale: "es_LA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMINUS | Tu red de bienestar en Latinoamérica",
    description: "Un espacio para conectar, aprender y cuidar tu bienestar.",
    images: ["/logo-mails.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${jakarta.variable} font-sans scroll-smooth`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0&display=block" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0&display=block" />
      </head>
      <body className="bg-white text-slate-900 antialiased selection:bg-slate-900 selection:text-white min-h-screen flex flex-col">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MMW6M24X"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MMW6M24X');`,
          }}
        />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&language=es&loading=async`}
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
