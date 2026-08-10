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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-black h-[64px] flex items-center justify-between px-6 lg:px-12">
      {/* Left: Logo & Navigation Links */}
      <div className="flex items-center gap-8 lg:gap-12">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
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
        <nav className="hidden lg:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("especialistas-section")}
            className="text-sm font-normal text-slate-800 hover:text-black transition-colors cursor-pointer"
          >
            Para Especialistas
          </button>
          <button
            onClick={() => scrollToSection("entrevistas")}
            className="text-sm font-normal text-slate-800 hover:text-black transition-colors cursor-pointer"
          >
            Entrevistas y encuentros
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-sm font-normal text-slate-800 hover:text-black transition-colors cursor-pointer"
          >
            Preguntas Frecuentes
          </button>
          <button
            onClick={() => scrollToSection("contacto")}
            className="text-sm font-normal text-slate-800 hover:text-black transition-colors cursor-pointer"
          >
            Contactarnos
          </button>
        </nav>
      </div>

      {/* Right: Auth Buttons (Desktop) */}
      <div className="hidden sm:flex items-center gap-3">
        <a
          href="https://app.luminus.lat/auth"
          className="px-6 py-2 text-sm font-normal text-black border border-black rounded-xl hover:bg-slate-50 transition-colors text-center"
        >
          Iniciar Sesión
        </a>
        <a
          href="https://app.luminus.lat/auth"
          className="px-6 py-2 text-sm font-normal text-white bg-black hover:bg-slate-800 rounded-xl transition-colors text-center"
        >
          Registrarme
        </a>
      </div>

      {/* Mobile Hamburger Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-2 rounded-lg text-slate-900 hover:bg-slate-100 focus:outline-none"
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-[64px] left-0 w-full bg-white border-b border-black px-6 py-6 flex flex-col gap-4 shadow-lg lg:hidden">
          <button
            onClick={() => scrollToSection("especialistas-section")}
            className="text-left py-2 text-base font-normal text-slate-800 hover:text-black"
          >
            Para Especialistas
          </button>
          <button
            onClick={() => scrollToSection("entrevistas")}
            className="text-left py-2 text-base font-normal text-slate-800 hover:text-black"
          >
            Entrevistas y encuentros
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-left py-2 text-base font-normal text-slate-800 hover:text-black"
          >
            Preguntas Frecuentes
          </button>
          <button
            onClick={() => scrollToSection("contacto")}
            className="text-left py-2 text-base font-normal text-slate-800 hover:text-black"
          >
            Contactarnos
          </button>
          <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
            <a
              href="https://app.luminus.lat/auth"
              className="w-full py-2.5 text-center text-sm font-normal text-black border border-black rounded-xl hover:bg-slate-50"
            >
              Iniciar Sesión
            </a>
            <a
              href="https://app.luminus.lat/auth"
              className="w-full py-2.5 text-center text-sm font-normal text-white bg-black hover:bg-slate-800 rounded-xl"
            >
              Registrarme
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
