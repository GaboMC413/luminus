import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Sesiones Introductorias | LUMINUS LATAM",
  description:
    "Condiciones, alcance y responsabilidades aplicables a las Sesiones Introductorias dentro de LUMINUS.",
  alternates: {
    canonical: "https://luminuslatam.com/legal/sesiones-introductorias",
  },
  openGraph: {
    type: "website",
    locale: "es_LA",
    url: "https://luminuslatam.com/legal/sesiones-introductorias",
    siteName: "LUMINUS LATAM",
    title: "Sesiones Introductorias | LUMINUS LATAM",
    description:
      "Condiciones, alcance y responsabilidades aplicables a las Sesiones Introductorias dentro de LUMINUS.",
    images: [
      {
        url: "https://luminuslatam.com/luminus_platform.jpg",
        secureUrl: "https://luminuslatam.com/luminus_platform.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "LUMINUS LATAM - Sesiones Introductorias",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sesiones Introductorias | LUMINUS LATAM",
    description:
      "Condiciones, alcance y responsabilidades aplicables a las Sesiones Introductorias dentro de LUMINUS.",
    images: ["https://luminuslatam.com/luminus_platform.jpg"],
  },
};

export default function SesionesIntroductoriasLegalPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pt-[64px]">
      <Navbar />

      <main className="flex-1 w-full max-w-[760px] mx-auto px-6 sm:px-8 md:px-12 pt-10 md:pt-14 pb-16 md:pb-24">
        <Link
          href="/legal"
          className="inline-flex items-center gap-2 text-sm font-normal text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Volver al Centro Legal</span>
        </Link>

        <div className="w-full flex flex-col justify-start items-start gap-2 text-left mb-10">
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-900 leading-tight">
            Sesiones Introductorias
          </h1>
          <p className="text-slate-400 text-sm font-normal">
            Última actualización: 14 de Noviembre, 2026
          </p>
        </div>

        <div className="w-full space-y-8 text-base leading-relaxed text-slate-600 font-normal">
          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">
              1. Qué es una Sesión Introductoria
            </h2>
            <p>
              Las Sesiones Introductorias de LUMINUS son encuentros virtuales breves (de 15 minutos) y gratuitos orientados a que un miembro conozca a un especialista, comparta brevemente qué está buscando y evalúe si existe afinidad para trabajar juntos en el futuro.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">
              2. Qué NO es una Sesión Introductoria
            </h2>
            <p>
              Una Sesión Introductoria no constituye una consulta médica, psicológica, nutricional, terapéutica ni profesional completa, ni implica diagnóstico, prescripción, tratamiento, seguimiento clínico o asesoramiento garantizado.
            </p>
            <p>
              En caso de emergencia física, psicológica o situación que requiera atención urgente, el usuario debe acudir de inmediato a los servicios de salud o líneas de emergencia locales.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">
              3. Rol de LUMINUS e independencia del especialista
            </h2>
            <p>
              LUMINUS actúa exclusivamente como plataforma tecnológica para facilitar el agendamiento inicial y el envío del enlace de acceso entre las partes.
            </p>
            <p>
              Los especialistas brindan estas sesiones de forma independiente y bajo su exclusiva responsabilidad. LUMINUS no emplea, representa, supervisa, cobra ni garantiza los servicios, honorarios, acuerdos o prestaciones posteriores que el miembro y el especialista decidan contratar fuera de la plataforma.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">
              4. Asistencia, puntualidad y fallos externos
            </h2>
            <p>
              La asistencia, puntualidad y desarrollo del encuentro dependen exclusivamente del miembro y del especialista. LUMINUS no será responsable por inasistencias, falta de puntualidad, demoras, cancelaciones, cortes de energía o internet, incompatibilidades de dispositivos, fallos en herramientas de videollamada de terceros o cualquier otra circunstancia que interfiera, interrumpa o impida la realización de la sesión.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">
              5. Funcionalidad en etapa de pruebas
            </h2>
            <p>
              El sistema de Sesiones Introductorias se encuentra actualmente en etapa de prueba y mejora continua. Pueden presentarse ajustes en la disponibilidad, notificaciones o funcionamiento técnico sin que ello genere responsabilidad, obligación de indemnización ni reclamo alguno frente a LUMINUS.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">
              6. Documentos complementarios
            </h2>
            <p>
              Estas condiciones se complementan con nuestros{" "}
              <Link
                href="/legal/terminos"
                className="text-slate-900 underline hover:text-black transition-colors"
              >
                Términos y Condiciones
              </Link>{" "}
              y las{" "}
              <Link
                href="/legal/condiciones-especialistas"
                className="text-slate-900 underline hover:text-black transition-colors"
              >
                Condiciones para Especialistas LUMINUS
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
