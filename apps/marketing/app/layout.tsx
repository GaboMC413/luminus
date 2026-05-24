import type { Metadata } from "next";
import Link from "next/link";
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
        <header className="sticky top-0 z-50 w-full border-b border-luminus-border bg-white/70 backdrop-blur-md transition-colors duration-300">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="group flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-luminus-text transition-colors">
              <span className="h-2.5 w-2.5 rounded-full bg-luminus-blue shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-transform duration-300 group-hover:scale-125"></span>
              LUMINUS <span className="text-xs font-semibold tracking-wider text-luminus-blue uppercase -mt-1 ml-0.5">Latam</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-luminus-secondary hover:text-luminus-text transition-colors">
                Inicio
              </Link>
              <Link href="/expertos" className="text-sm font-medium text-luminus-secondary hover:text-luminus-text transition-colors">
                Para expertos
              </Link>
              <Link href="/sobre-nosotros" className="text-sm font-medium text-luminus-secondary hover:text-luminus-text transition-colors">
                Sobre nosotros
              </Link>
              <Link href="/contacto" className="text-sm font-medium text-luminus-secondary hover:text-luminus-text transition-colors">
                Contactarnos
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <a 
                href="https://app.luminuslatam.com/signin" 
                className="text-sm font-medium text-luminus-secondary hover:text-luminus-text transition-colors px-3 py-2"
              >
                Ingresar
              </a>
              <a 
                href="https://app.luminuslatam.com/signup" 
                className="inline-flex items-center justify-center rounded-xl bg-luminus-blue px-4 py-2.5 text-sm font-semibold text-white shadow-accent hover:shadow-accent-hover hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200"
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
        <footer className="border-t border-luminus-border bg-white/50 backdrop-blur-sm py-12 mt-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
              <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-luminus-text">
                <span className="h-2 w-2 rounded-full bg-luminus-blue shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                LUMINUS <span className="text-[10px] font-semibold text-luminus-blue uppercase ml-0.5">Latam</span>
              </Link>
              
              <div className="flex flex-wrap justify-center gap-8 text-sm text-luminus-secondary">
                <Link href="/" className="hover:text-luminus-text transition-colors">
                  Inicio
                </Link>
                <Link href="/expertos" className="hover:text-luminus-text transition-colors">
                  Para expertos
                </Link>
                <Link href="/sobre-nosotros" className="hover:text-luminus-text transition-colors">
                  Sobre nosotros
                </Link>
                <Link href="/contacto" className="hover:text-luminus-text transition-colors">
                  Contactarnos
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-100 pt-8 gap-4 text-xs text-luminus-secondary/70">
              <p>&copy; {new Date().getFullYear()} LUMINUS Latam. Todos los derechos reservados.</p>
              <p className="flex items-center gap-1.5">
                Una plataforma moderna de bienestar con propósito y comunidad.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
