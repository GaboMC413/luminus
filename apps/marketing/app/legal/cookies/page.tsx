import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Política de Cookies | LUMINUS Latam",
  description: "Detalla el uso de cookies y tecnologías de seguimiento destinadas a optimizar y personalizar tu experiencia de navegación.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pt-[64px]">
      <Navbar />

      <main className="flex-1 w-full max-w-[760px] mx-auto px-6 sm:px-8 md:px-12 pt-10 md:pt-14 pb-16 md:pb-24">
        {/* Back link */}
        <Link
          href="/legal"
          className="inline-flex items-center gap-2 text-sm font-normal text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Volver al Centro Legal</span>
        </Link>

        {/* Header Title */}
        <div className="w-full flex flex-col justify-start items-start gap-2 text-left mb-10">
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-900 leading-tight">
            Política de Cookies
          </h1>
          <p className="text-slate-400 text-sm font-normal">
            Última actualización: 18 de Abril, 2026
          </p>
        </div>

        {/* Content Body — Light, clean document style */}
        <div className="w-full space-y-8 text-base leading-relaxed text-slate-600 font-normal">
          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">1. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su navegador cuando visita LUMINUS LATAM. Nos permiten recordar sus preferencias, mantener su sesión activa y comprender cómo utiliza nuestra plataforma para ofrecerle una experiencia más fluida y personalizada.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">2. Tipos de cookies que utilizamos</h2>
            <p>
              En LUMINUS, utilizamos los siguientes tipos de cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-normal">
              <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio, como el inicio de sesión y la seguridad.</li>
              <li><strong>Cookies de Preferencia:</strong> Permiten recordar información que cambia el aspecto o comportamiento del sitio, como su idioma preferido.</li>
              <li><strong>Cookies de Análisis:</strong> Nos ayudan a entender cómo interactúan los visitantes con la plataforma al recopilar y reportar información de forma anónima.</li>
              <li><strong>Cookies Funcionales:</strong> Permiten ofrecer funcionalidades mejoradas y personalizadas, como la integración con servicios de terceros.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">3. Gestión de cookies</h2>
            <p>
              Usted tiene la libertad de aceptar o rechazar las cookies. La mayoría de los navegadores web aceptan cookies automáticamente, pero generalmente puede modificar la configuración de su navegador para rechazarlas si lo prefiere. Tenga en cuenta que, si decide rechazar las cookies, es posible que no pueda experimentar plenamente las funciones interactivas de LUMINUS.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">4. Cookies de Terceros</h2>
            <p>
              En algunos casos, también utilizamos cookies proporcionadas por terceros de confianza. Por ejemplo, utilizamos servicios de analítica para ayudarnos a comprender cómo utiliza el sitio y cómo podemos mejorar su experiencia. Estas cookies pueden rastrear cosas como cuánto tiempo pasa en el sitio y las páginas que visita.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">5. Más información</h2>
            <p>
              Si desea obtener más información sobre cómo gestionamos sus datos, puede consultar nuestra{" "}
              <Link href="/legal/privacidad" className="text-slate-900 underline hover:text-black transition-colors">
                Política de Privacidad
              </Link>
              . Si tiene alguna duda específica sobre nuestra Política de Cookies, puede contactarnos a través de nuestro formulario de contacto.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
