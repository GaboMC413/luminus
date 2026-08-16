import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CategorizedFaqs } from "@/components/faqs/CategorizedFaqs";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | LUMINUS Latam",
  description: "Respuestas claras a las dudas más comunes sobre la plataforma LUMINUS, membresías y la Red de Especialistas.",
};

export default function FaqsPage() {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <div className="w-full pt-[64px] flex-1 flex flex-col">
        <section className="w-full pt-8 md:pt-16 pb-12 md:pb-24 bg-white flex-1 flex flex-col gap-12 md:gap-16">
          
          {/* Main 2-Column Grid Layout */}
          <div className="max-w-[1440px] mx-auto px-4 md:px-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Page Title & Subtitle */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 flex flex-col gap-3 md:gap-4 text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-slate-900 leading-[40px] md:leading-[48px]">
                Preguntas Frecuentes
              </h1>
              <p className="text-base sm:text-lg lg:text-[20px] font-normal text-slate-600 leading-relaxed">
                Encuentra respuestas rápidas sobre LUMINUS, nuestra plataforma y la Red de Especialistas.
              </p>
            </div>

            {/* Right Column: Categorized Accordion Questions */}
            <div className="lg:col-span-8 w-full">
              <CategorizedFaqs />
            </div>

          </div>

          {/* Full-width 100% Bottom CTA Block */}
          <div className="max-w-[1440px] mx-auto px-4 md:px-10 w-full">
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-slate-900">¿No encontraste la respuesta que buscabas?</h3>
                <p className="text-slate-600 text-sm">
                  Nuestro equipo está disponible para ayudarte a resolver cualquier duda sobre la plataforma o la red.
                </p>
              </div>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors shrink-0"
              >
                <span>Contactarnos</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

        </section>
      </div>

      <Footer />
    </main>
  );
}
