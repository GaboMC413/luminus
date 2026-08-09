import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

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
      <body className="bg-white text-slate-900 antialiased selection:bg-slate-900 selection:text-white min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
