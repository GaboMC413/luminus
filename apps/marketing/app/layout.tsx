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

export const metadata: Metadata = {
  title: "LUMINUS | Tu red de bienestar en Latinoamérica",
  description: "Un espacio para conectar, aprender y cuidar tu bienestar. LUMINUS conecta personas, especialistas y espacios de toda Latinoamérica en una misma comunidad.",
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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=language&display=block" />
      </head>
      <body className="bg-white text-slate-900 antialiased selection:bg-slate-900 selection:text-white min-h-screen flex flex-col">
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&language=es`}
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
