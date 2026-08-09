"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Left: Logo & Nav Links */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo-luminus-black.svg"
              alt="LUMINUS"
              width={140}
              height={24}
              priority
              className="h-5 md:h-6 w-auto"
            />
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => scrollToSection("especialistas")}
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer"
            >
              Para Especialistas
            </button>
            <button
              onClick={() => scrollToSection("entrevistas")}
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer"
            >
              Entrevistas y encuentros
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer"
            >
              Preguntas Frecuentes
            </button>
            <button
              onClick={() => scrollToSection("contacto")}
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer"
            >
              Contactarnos
            </button>
          </nav>
        </div>

        {/* Right: Auth Buttons (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://app.luminus.lat/auth"
            className="px-6 py-2.5 text-sm font-semibold text-slate-900 border border-slate-900 rounded-xl hover:bg-slate-100 transition-all text-center min-w-[130px]"
          >
            Iniciar Sesión
          </a>
          <a
            href="https://app.luminus.lat/auth"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-black hover:bg-slate-800 rounded-xl transition-all shadow-sm text-center min-w-[130px]"
          >
            Registrarme
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 flex flex-col gap-3 shadow-lg">
          <button
            onClick={() => scrollToSection("especialistas")}
            className="text-left px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Para Especialistas
          </button>
          <button
            onClick={() => scrollToSection("entrevistas")}
            className="text-left px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Entrevistas y encuentros
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-left px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Preguntas Frecuentes
          </button>
          <button
            onClick={() => scrollToSection("contacto")}
            className="text-left px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Contactarnos
          </button>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href="https://app.luminus.lat/auth"
              className="w-full py-3 text-center text-sm font-semibold text-slate-900 border border-slate-900 rounded-xl hover:bg-slate-50"
            >
              Iniciar Sesión
            </a>
            <a
              href="https://app.luminus.lat/auth"
              className="w-full py-3 text-center text-sm font-semibold text-white bg-black hover:bg-slate-800 rounded-xl shadow-sm"
            >
              Registrarme
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
