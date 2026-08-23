import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./app.css";
import Script from "next/script";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "LUMINUS | Bienestar, Conexiones y Crecimiento Personal LATAM",
    template: "%s | LUMINUS"
  },
  description: "Un espacio profesional de bienestar y crecimiento en Latinoamérica. Conecta con personas afines, obtén asesoramiento de especialistas y alinea tu vida personal y laboral con propósito.",
  keywords: [
    "bienestar", 
    "crecimiento personal", 
    "conexiones significativas", 
    "salud mental", 
    "coaching", 
    "especialistas bienestar", 
    "bienestar corporativo",
    "equilibrio de vida",
    "comunidad bienestar Latinoamérica"
  ],
  authors: [{ name: "Luminus" }],
  creator: "Luminus Team",
  icons: {
    icon: [
      { url: "/ico.png", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/ico.png", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "LUMINUS | Bienestar, Conexiones y Crecimiento Personal LATAM",
    description: "Conecta con personas y especialistas que te ayudan a cultivar bienestar, equilibrio y dirección en tu desarrollo y crecimiento personal.",
    url: "https://luminus.lat",
    siteName: "LUMINUS",
    locale: "es_LA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMINUS | Bienestar, Conexiones y Crecimiento Personal LATAM",
    description: "Tu espacio ético y profesional de bienestar en Latinoamérica. Conexiones significativas, especialistas y crecimiento personal.",
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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0&display=block" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0&display=block" />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
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
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1H9DDE1V0C"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1H9DDE1V0C');
            `,
          }}
        />
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=es`}
            strategy="afterInteractive"
          />
        )}
        {children}
      </body>
    </html>
  );
}

