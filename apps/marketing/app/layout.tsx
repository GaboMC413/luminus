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
              <div className="flex flex-col items-center md:items-start gap-4">
                <Link href="/" className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.01]">
                  <Image
                    src="/logo-luminus-black.svg"
                    alt="LUMINUS Latam Logo"
                    width={130}
                    height={17}
                    className="h-4.5 sm:h-5 w-auto"
                  />
                </Link>
                {/* Redes Sociales LUMINUS */}
                <div className="flex items-center gap-3 mt-2">
                  <a
                    href="https://instagram.com/luminus_latam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white text-black shadow-bold-sm hover:shadow-none hover:bg-luminus-pink hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
                    aria-label="Instagram de LUMINUS"
                  >
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com/company/luminuslatam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white text-black shadow-bold-sm hover:shadow-none hover:bg-luminus-blue hover:text-white hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
                    aria-label="LinkedIn de LUMINUS"
                  >
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect width="4" height="12" x="2" y="9"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@luminus_latam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white text-black shadow-bold-sm hover:shadow-none hover:bg-luminus-orange hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
                    aria-label="YouTube de LUMINUS"
                  >
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
                      <polygon points="10 15 15 12 10 9 10 15"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-sm text-black font-bold">
                <Link href="/especialistas" className="hover:text-luminus-blue transition-colors">
                  Especialistas
                </Link>
                <Link href="/empresas-aliadas" className="hover:text-luminus-blue transition-colors">
                  Empresas Aliadas
                </Link>
                <Link href="/eventos" className="hover:text-luminus-blue transition-colors">
                  Eventos y Actividades
                </Link>
                <Link href="/sobre-nosotros" className="hover:text-luminus-blue transition-colors">
                  Sobre Nosotros
                </Link>
                <Link href="/contacto" className="hover:text-luminus-blue transition-colors">
                  Contactar
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
