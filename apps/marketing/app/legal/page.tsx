"use client";

import Link from "next/link";

export default function LegalPage() {
  const legalDocs = [
    {
      title: "Términos y Condiciones",
      description: "Regula el uso de la plataforma, el registro, la propiedad intelectual y la relación con los expertos de bienestar.",
      href: "/legal/terms",
      icon: "gavel",
    },
    {
      title: "Política de Privacidad",
      description: "Explica detalladamente cómo recopilamos, utilizamos, protegemos y gestionamos tus datos personales dentro de LUMINUS.",
      href: "/legal/privacy",
      icon: "shield_person",
    },
    {
      title: "Política de Cookies",
      description: "Detalla el uso de cookies y tecnologías de seguimiento destinadas a optimizar y personalizar tu experiencia de navegación.",
      href: "/legal/cookies",
      icon: "cookie",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-[70px] md:h-[80px] bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 md:px-8 flex items-center justify-between z-50">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[18px] md:h-[20px]" />
        </Link>
        <Link 
          href="https://app.luminuslatam.com/auth/signup" 
          className="group flex items-center gap-2 text-[14px] font-medium border border-black px-4 md:px-6 py-2 rounded-full hover:bg-black hover:text-white transition-all"
        >
          <span className="hidden md:inline">Volver al registro</span>
          <span className="material-symbols-rounded md:hidden text-[20px]">arrow_back</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center max-w-[1000px] mx-auto pt-[120px] md:pt-[160px] pb-16 px-6 md:px-8 w-full">
        <div className="text-center max-w-[600px] mx-auto mb-16">
          <h1 className="text-[44px] md:text-[54px] font-jakarta font-normal tracking-tight leading-tight mb-4">
            Centro Legal
          </h1>
          <p className="text-zinc-500 text-[16px] md:text-[18px] leading-relaxed">
            Documentos oficiales, políticas de privacidad, términos de servicio y lineamientos de la plataforma LUMINUS.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {legalDocs.map((doc) => (
            <Link 
              key={doc.title}
              href={doc.href}
              className="group relative flex flex-col justify-between p-8 rounded-3xl border-2 border-black/5 hover:border-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100 mb-6 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300">
                  <span className="material-symbols-rounded text-[24px]">
                    {doc.icon}
                  </span>
                </div>
                <h2 className="text-[20px] font-jakarta font-bold tracking-tight mb-3">
                  {doc.title}
                </h2>
                <p className="text-zinc-500 text-[14px] leading-relaxed mb-6">
                  {doc.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[14px] font-bold text-black mt-auto group-hover:translate-x-1 transition-transform">
                <span>Leer documento</span>
                <span className="material-symbols-rounded text-[18px]">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full shrink-0 h-[70px] flex items-center justify-center border-t border-zinc-100">
        <p className="text-[9px] text-zinc-400 uppercase tracking-wide">
          LUMINUS LATAM © 2026
        </p>
      </footer>
    </div>
  );
}
