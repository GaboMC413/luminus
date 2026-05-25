"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Home, Briefcase, Globe, MessageSquare, ArrowRight } from "lucide-react";

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
    { href: "/", label: "Inicio", icon: <Home className="h-5 w-5 text-luminus-blue" /> },
    { href: "/expertos", label: "Para expertos", icon: <Briefcase className="h-5 w-5 text-luminus-orange" /> },
    { href: "/sobre-nosotros", label: "Sobre nosotros", icon: <Globe className="h-5 w-5 text-luminus-lime" /> },
    { href: "/contacto", label: "Contactarnos", icon: <MessageSquare className="h-5 w-5 text-luminus-pink" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-white/95 transition-colors duration-300">
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
              className="text-sm font-bold text-black hover:text-luminus-blue transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
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

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white text-black shadow-bold-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150 focus:outline-none"
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
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-white">
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white text-black shadow-bold-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150 focus:outline-none"
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
                  className="flex items-center gap-4 p-4 rounded-[2rem] border-2 border-black bg-slate-50 hover:bg-luminus-lime/10 shadow-bold transition-all duration-150"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-white shadow-bold-sm">
                    {link.icon}
                  </div>
                  <span className="font-display text-xl font-black text-black">
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-auto pb-6">
              <a
                href="https://app.luminuslatam.com/signin"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white py-4 px-6 text-base font-bold text-black shadow-bold hover:shadow-none hover:bg-luminus-pink hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
              >
                Ingresar a mi cuenta
              </a>
              <a
                href="https://app.luminuslatam.com/signup"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-black border-2 border-black py-4 px-6 text-base font-bold text-white shadow-bold hover:shadow-none hover:bg-luminus-orange hover:text-black hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
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
