import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Centro Legal | LUMINUS Latam",
  description: "Políticas de privacidad, términos y condiciones de la plataforma LUMINUS.",
};

export default function LegalPage() {
  const legalDocs = [
    {
      title: "Términos y Condiciones",
      description: "Regula el uso de la plataforma, el registro, la propiedad intelectual y la relación con los especialistas de bienestar.",
      href: "/legal/terminos",
    },
    {
      title: "Condiciones para Especialistas",
      description: "Regula la postulación, admisión, participación y permanencia de los especialistas dentro de la red LUMINUS.",
      href: "/legal/condiciones-especialistas",
    },
    {
      title: "Política de Privacidad",
      description: "Explica detalladamente cómo recopilamos, utilizamos, protegemos y gestionamos tus datos personales dentro de LUMINUS.",
      href: "/legal/privacidad",
    },
    {
      title: "Política de Cookies",
      description: "Detalla el uso de cookies y tecnologías de seguimiento destinadas a optimizar y personalizar tu experiencia de navegación.",
      href: "/legal/cookies",
    },
  ];

  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <div className="w-full pt-[64px] flex-1 flex flex-col">
        <section className="w-full pt-8 md:pt-12 pb-8 md:pb-16 bg-white flex-1 flex flex-col">
          
          {/* Header — Standardized header structure across all pages */}
          <div className="max-w-[1440px] mx-auto px-4 md:px-10 mb-6 md:mb-8 w-full">
            <div className="w-full flex flex-col justify-start items-start gap-3 md:gap-4 text-left">
              <h1 className="w-full text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[40px] md:leading-[48px]">
                Centro Legal
              </h1>
              <p className="w-full text-lg sm:text-xl lg:text-[24px] font-normal text-slate-800 leading-7 md:leading-8">
                Políticas de privacidad, términos y condiciones de LUMINUS.
              </p>
            </div>
          </div>

          {/* 4-Column Cards Grid — Standardized grid container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 max-w-[1440px] mx-auto px-4 md:px-10 w-full">
            {legalDocs.map((doc) => (
              <Link
                key={doc.title}
                href={doc.href}
                className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors p-6 sm:p-7 flex flex-col justify-between group shadow-none min-h-[220px] rounded-2xl"
              >
                <div className="w-full flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-slate-900 leading-snug group-hover:text-black transition-colors">
                    {doc.title}
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed mt-1">
                    {doc.description}
                  </p>
                </div>

                {/* Bottom link */}
                <div className="inline-flex justify-start items-center mt-auto pt-4 mt-4 border-t border-slate-200/80 text-sm font-medium text-slate-600 group-hover:text-black transition-colors gap-1.5">
                  <span>Leer documento</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
