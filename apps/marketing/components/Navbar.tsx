"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Home, Briefcase, Globe, MessageSquare, ArrowRight, Building, Calendar } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/especialistas", label: "Especialistas LUMINUS", icon: <Briefcase className="h-5 w-5 text-luminus-orange" /> },
    { href: "/empresas-aliadas", label: "Empresas Aliadas", icon: <Building className="h-5 w-5 text-luminus-lime" /> },
    { href: "/eventos", label: "Eventos y Actividades", icon: <Calendar className="h-5 w-5 text-luminus-pink" /> },
    { href: "/sobre-nosotros", label: "Sobre Nosotros", icon: <Globe className="h-5 w-5 text-luminus-blue" /> },
    { href: "/contacto", label: "Contactar", icon: <MessageSquare className="h-5 w-5 text-luminus-pink" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 hover:text-black transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://app.luminuslatam.com/auth/iniciar-sesion"
            className="text-sm font-semibold text-slate-600 hover:text-black transition-colors px-3 py-2"
          >
            Ingresar
          </a>
          <a
            href="https://app.luminuslatam.com/auth/registrarse"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-900 transition-all duration-200 shadow-soft hover:shadow-medium"
          >
            Crear cuenta
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-black hover:bg-slate-50 transition-all duration-150 focus:outline-none"
          >
            <X className={`h-6 w-6 stroke-[2.5] ${isOpen ? "block" : "hidden"}`} />
            <Menu className={`h-6 w-6 stroke-[2.5] ${isOpen ? "hidden" : "block"}`} />
          </button>
        </div>
      </div>

      {/* Mobile 100% Screen Full Menu Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen md:hidden overflow-y-auto animate-fadeIn">
          {/* Header row at the top inside mobile menu */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-3 transition-transform duration-205 hover:scale-[1.01]"
            >
              <Image
                src="/logo-luminus-black.svg"
                alt="LUMINUS Latam Logo"
                width={157}
                height={20}
                className="h-5 sm:h-6 w-auto"
                priority
              />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-black hover:bg-slate-50 transition-all focus:outline-none"
            >
              <X className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Immersive Scrollable Menu Content */}
          <div className="flex-1 flex flex-col justify-between px-6 py-8 gap-8 overflow-y-auto bg-white">
            {/* Navigation Links */}
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all duration-200"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-soft">
                    {link.icon}
                  </div>
                  <span className="font-display text-lg font-semibold text-slate-800">
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-auto pb-6">
              <a
                href="https://app.luminuslatam.com/auth/iniciar-sesion"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white py-3.5 px-6 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200"
              >
                Ingresar a mi cuenta
              </a>
              <a
                href="https://app.luminuslatam.com/auth/registrarse"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-black py-3.5 px-6 text-base font-semibold text-white hover:bg-neutral-900 transition-all duration-200"
              >
                Registrarse / Crear cuenta
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
