import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Política de Privacidad | LUMINUS Latam",
  description: "Explica detalladamente cómo recopilamos, utilizamos, protegemos y gestionamos tus datos personales dentro de LUMINUS.",
};

export default function PrivacyPage() {
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
            Política de Privacidad
          </h1>
          <p className="text-slate-400 text-sm font-normal">
            Última actualización: 18 de Abril, 2026
          </p>
        </div>

        {/* Content Body — Light, clean document style */}
        <div className="w-full space-y-8 text-base leading-relaxed text-slate-600 font-normal">
          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">1. Información que Recopilamos</h2>
            <p>
              En LUMINUS LATAM, recopilamos información necesaria para proporcionar una experiencia de red profesional personalizada. Esto incluye:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-normal">
              <li>Datos de registro: Nombre, correo electrónico, contraseña.</li>
              <li>Perfil profesional: Cargo, industria, ubicación y enlaces a redes profesionales.</li>
              <li>Intereses: Áreas de especialización y temas de interés dentro de la comunidad.</li>
              <li>Datos de navegación: Información técnica sobre cómo interactúa con nuestra plataforma.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">2. Uso de sus Datos</h2>
            <p>
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-normal">
              <li>Facilitar conexiones inteligentes entre miembros de la comunidad.</li>
              <li>Personalizar el contenido y las recomendaciones que se le presentan.</li>
              <li>Enviar comunicaciones relacionadas con el servicio, actualizaciones y seguridad.</li>
              <li>Generar métricas agregadas y anónimas sobre tendencias e impacto de nuestra red.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">3. Cómo Compartimos la Información</h2>
            <p>
              Su privacidad es nuestra prioridad. No vendemos su información personal a terceros. Sus datos son visibles para otros miembros de la comunidad según la configuración de privacidad de su perfil. Podemos compartir datos con proveedores de servicios que nos ayudan a operar la plataforma (ej. bases de datos, analítica, servicios de email) bajo strictly confidencialidad.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">4. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra acceso no autorizado, alteración o destrucción. Esto incluye cifrado de datos en tránsito y en reposo, así como auditorías periódicas de seguridad.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">5. Sus Derechos</h2>
            <p>
              Usted tiene derecho a acceder, rectificar o eliminar sus datos personales en cualquier momento. Puede gestionar la mayoría de su información directamente desde su perfil o contactando a nuestro equipo de soporte para solicitudes específicas de portabilidad o eliminación de cuenta.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">6. Cookies</h2>
            <p>
              Utilizamos cookies para mantener su sesión activa y comprender el uso de nuestro sitio. Puede consultar todos los detalles en nuestra{" "}
              <Link href="/legal/cookies" className="text-slate-900 underline hover:text-black transition-colors">
                Política de Cookies
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
