import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Conecta con tu bienestar",
  description: "Una red de bienestar, conexión, especialistas, espacios de aprendizaje y acompañamiento con IA diseñada para guiarte en tu camino.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth overflow-x-hidden max-w-full">
      <body className="bg-luminus-bg text-luminus-text font-sans antialiased overflow-x-hidden max-w-full w-full">
        {/* Navigation Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Premium Footer */}
        <footer className="border-t-2 border-black bg-white py-12 mt-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
              <Link href="/" className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.01]">
                <Image
                  src="/logo-luminus-black.svg"
                  alt="LUMINUS Latam Logo"
                  width={130}
                  height={17}
                  className="h-4.5 sm:h-5 w-auto"
                />
              </Link>

              <div className="flex flex-wrap justify-center gap-8 text-sm text-black font-bold">
                <Link href="/" className="hover:text-luminus-blue transition-colors">
                  Inicio
                </Link>
                <Link href="/especialistas" className="hover:text-luminus-blue transition-colors">
                  Para especialistas
                </Link>
                <Link href="/empresas-aliadas" className="hover:text-luminus-blue transition-colors">
                  Empresas Aliadas
                </Link>
                <Link href="/sobre-nosotros" className="hover:text-luminus-blue transition-colors">
                  Sobre nosotros
                </Link>
                <Link href="/contacto" className="hover:text-luminus-blue transition-colors">
                  Contactarnos
                </Link>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-200 pt-8 gap-4 text-xs text-slate-500 font-medium">
              <p>&copy; {new Date().getFullYear()} LUMINUS Latam. Todos los derechos reservados.</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                <Link href="/legal/terminos" className="hover:text-black transition-colors">
                  Términos y Condiciones
                </Link>
                <Link href="/legal/privacidad" className="hover:text-black transition-colors">
                  Política de Privacidad
                </Link>
                <Link href="/legal/cookies" className="hover:text-black transition-colors">
                  Política de Cookies
                </Link>
              </div>
              <p className="flex items-center gap-1.5">
                Una plataforma de bienestar colorida, consciente y humana.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
