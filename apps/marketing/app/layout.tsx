import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Conecta con tu bienestar",
  description: "Una red de bienestar, conexión, especialistas, espacios de aprendizaje y acompañamiento con IA diseñada para guiarte en tu camino.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
        <footer className="border-t border-slate-100 bg-slate-50/40 py-10 mt-12 relative overflow-hidden">
          {/* Subtle brand color blurs in the footer background */}
          <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[60%] bg-[#D4E600]/3 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-[-10%] top-[-20%] w-[40%] h-[60%] bg-[#FF80FC]/3 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-7xl px-6 relative z-10">
            {/* Top Row: Logo and Social Media (No bottom border, tighter spaces) */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-6 text-center sm:text-left">
              <Link href="/" className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.01]">
                <Image
                  src="/logo-luminus-black.svg"
                  alt="LUMINUS Latam Logo"
                  width={140}
                  height={19}
                  className="h-5 sm:h-5.5 w-auto"
                />
              </Link>
              
              {/* Redes Sociales LUMINUS con Estilo Premium */}
              <div className="flex items-center gap-3.5">
                <a
                  href="https://instagram.com/luminus_latam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-[#B832B4] hover:border-[#FF80FC]/50 hover:bg-[#FFE0FC]/30 shadow-soft hover:shadow-medium hover:-translate-y-[2px] transition-all duration-355 ease-out"
                  aria-label="Instagram de LUMINUS"
                >
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover/social:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/luminuslatam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-[#0450FB] hover:border-[#0450FB]/40 hover:bg-[#DCE6FF]/30 shadow-soft hover:shadow-medium hover:-translate-y-[2px] transition-all duration-355 ease-out"
                  aria-label="LinkedIn de LUMINUS"
                >
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover/social:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect width="4" height="12" x="2" y="9"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@luminus_latam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-[#FF7700] hover:border-[#FF7700]/40 hover:bg-[#FFE0C2]/30 shadow-soft hover:shadow-medium hover:-translate-y-[2px] transition-all duration-355 ease-out"
                  aria-label="YouTube de LUMINUS"
                >
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover/social:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
                    <polygon points="10 15 15 12 10 9 10 15"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Middle Grid: Columns (No bottom border, optimized spaces) */}
            <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6 mb-4">
              
              {/* Column 1: Inicio */}
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                  Inicio
                </h4>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-550">
                  <li>
                    <Link href="/#que-hacer" className="hover:text-[#0450FB] transition-colors duration-200 block py-0.5">
                      ¿Cómo funciona?
                    </Link>
                  </li>
                  <li>
                    <Link href="/#acompanamiento" className="hover:text-[#0450FB] transition-colors duration-200 block py-0.5">
                      Acompañamiento
                    </Link>
                  </li>
                  <li>
                    <Link href="/#planes-bienestar" className="hover:text-[#0450FB] transition-colors duration-200 block py-0.5">
                      Planes de Bienestar
                    </Link>
                  </li>
                  <li>
                    <Link href="/#confianza" className="hover:text-[#0450FB] transition-colors duration-200 block py-0.5">
                      Sello de Confianza
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Especialistas */}
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                  Especialistas
                </h4>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-550">
                  <li>
                    <Link href="/especialistas" className="hover:text-[#FF7700] transition-colors duration-200 block font-bold py-0.5">
                      Para Especialistas
                    </Link>
                  </li>
                  <li>
                    <Link href="/especialistas#participar-especialista" className="hover:text-[#FF7700] transition-colors duration-200 block py-0.5">
                      ¿Cómo participar?
                    </Link>
                  </li>
                  <li>
                    <Link href="/especialistas#sesiones-introductorias" className="hover:text-[#FF7700] transition-colors duration-200 block py-0.5">
                      Sesión de 15 Minutos
                    </Link>
                  </li>
                  <li>
                    <Link href="/especialistas#planes-especialistas" className="hover:text-[#FF7700] transition-colors duration-200 block py-0.5">
                      Suscripciones
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Empresas */}
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                  Empresas
                </h4>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-550">
                  <li>
                    <Link href="/empresas-aliadas" className="hover:text-[#7A8500] transition-colors duration-200 block font-bold py-0.5">
                      Empresas Aliadas
                    </Link>
                  </li>
                  <li>
                    <Link href="/empresas-aliadas#vision-regional" className="hover:text-[#7A8500] transition-colors duration-200 block py-0.5">
                      Visión Regional
                    </Link>
                  </li>
                  <li>
                    <Link href="/empresas-aliadas#filosofia-aliados" className="hover:text-[#7A8500] transition-colors duration-200 block py-0.5">
                      Filosofía Aliados
                    </Link>
                  </li>
                  <li>
                    <Link href="/empresas-aliadas#co-creacion" className="hover:text-[#7A8500] transition-colors duration-200 block py-0.5">
                      Valor del Aporte
                    </Link>
                  </li>
                  <li>
                    <Link href="/empresas-aliadas#formas-participar" className="hover:text-[#7A8500] transition-colors duration-200 block py-0.5">
                      Planes Corporativos
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Eventos */}
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                  Eventos
                </h4>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-550">
                  <li>
                    <Link href="/eventos" className="hover:text-[#B832B4] transition-colors duration-200 block font-bold py-0.5">
                      Eventos
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://lu.ma/luminus"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#B832B4] transition-colors duration-200 block py-0.5"
                    >
                      Calendario Luma
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youtube.com/@luminus_latam"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#B832B4] transition-colors duration-200 block py-0.5"
                    >
                      YouTube
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 5: Nosotros */}
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                  Nosotros
                </h4>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-550">
                  <li>
                    <Link href="/sobre-nosotros" className="hover:text-[#002C9E] transition-colors duration-200 block font-bold py-0.5">
                      Sobre Nosotros
                    </Link>
                  </li>
                  <li>
                    <Link href="/sobre-nosotros#porque-existe" className="hover:text-[#002C9E] transition-colors duration-200 block py-0.5">
                      Misión
                    </Link>
                  </li>
                  <li>
                    <Link href="/preguntas-frecuentes" className="hover:text-[#002C9E] transition-colors duration-200 block py-0.5">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/contacto" className="hover:text-[#002C9E] transition-colors duration-200 block py-0.5">
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 6: Legal */}
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                  Legal
                </h4>
                <ul className="space-y-1.5 text-xs font-semibold text-slate-550">
                  <li>
                    <Link href="/legal" className="hover:text-slate-800 transition-colors duration-200 block font-bold py-0.5">
                      Centro Legal
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/terminos" className="hover:text-slate-800 transition-colors duration-200 block py-0.5">
                      Términos de Servicio
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/privacidad" className="hover:text-slate-800 transition-colors duration-200 block py-0.5">
                      Política de Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/cookies" className="hover:text-slate-800 transition-colors duration-200 block py-0.5">
                      Política de Cookies
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

            {/* Bottom Row: Copyright Only (Tighter space) */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-[11px] text-slate-400 font-medium text-center sm:text-left">
              <p>&copy; {new Date().getFullYear()} LUMINUS Latam. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
