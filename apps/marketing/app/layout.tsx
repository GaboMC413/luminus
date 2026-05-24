import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUMINUS Latam | Conecta con tu bienestar",
  description: "Una red de bienestar, conexión, expertos, espacios de aprendizaje y acompañamiento con IA diseñada para guiarte en tu camino.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-luminus-bg text-luminus-text font-sans antialiased">
        {/* Navigation Navbar */}
        <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-white/95 transition-colors duration-300">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="group flex items-center gap-3 transition-transform duration-205 hover:scale-[1.01]">
              <Image
                src="/logo-luminus-black.svg"
                alt="LUMINUS Latam Logo"
                width={157}
                height={20}
                className="h-5 sm:h-6 w-auto"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-bold text-black hover:text-luminus-blue transition-colors">
                Inicio
              </Link>
              <Link href="/expertos" className="text-sm font-bold text-black hover:text-luminus-blue transition-colors">
                Para expertos
              </Link>
              <Link href="/sobre-nosotros" className="text-sm font-bold text-black hover:text-luminus-blue transition-colors">
                Sobre nosotros
              </Link>
              <Link href="/contacto" className="text-sm font-bold text-black hover:text-luminus-blue transition-colors">
                Contactarnos
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <a
                href="https://app.luminuslatam.com/signin"
                className="text-sm font-bold text-black hover:text-luminus-orange transition-colors px-3 py-2"
              >
                Ingresar
              </a>
              <a
                href="https://app.luminuslatam.com/signup"
                className="inline-flex items-center justify-center rounded-full bg-black border-2 border-black px-5 py-2.5 text-sm font-bold text-white shadow-bold-sm hover:shadow-none hover:bg-luminus-orange hover:text-black hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
              >
                Crear cuenta
              </a>
            </div>
          </div>
        </header>

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
                <Link href="/expertos" className="hover:text-luminus-blue transition-colors">
                  Para expertos
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
