import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Términos y Condiciones | LUMINUS Latam",
  description: "Regula el uso de la plataforma LUMINUS, el registro, la propiedad intelectual y la relación con los especialistas de bienestar.",
};

export default function TermsPage() {
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
            Términos y Condiciones
          </h1>
          <p className="text-slate-400 text-sm font-normal">
            Última actualización: 18 de Abril, 2026
          </p>
        </div>

        {/* Content Body — Light, clean document style */}
        <div className="w-full space-y-8 text-base leading-relaxed text-slate-600 font-normal">
          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar LUMINUS LATAM, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestros servicios. LUMINUS es una plataforma diseñada para conectar personas con especialistas, profesionales y experiencias vinculadas al bienestar, desarrollo personal y crecimiento integral en Latinoamérica.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">2. Elegibilidad y Registro</h2>
            <p>
              Para utilizar LUMINUS, debe completar el proceso de registro proporcionando información veraz, exacta y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso. La plataforma está dirigida a personas interesadas en acceder a experiencias, contenidos, especialistas y servicios vinculados al bienestar, desarrollo personal, salud complementaria y crecimiento integral.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">3. Uso de la Plataforma</h2>
            <p>
              Usted se compromete a utilizar la plataforma de manera ética y profesional. Queda estrictamente prohibido:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Utilizar el servicio para cualquier propósito ilegal o no autorizado.</li>
              <li>Publicar contenido difamatorio, obsceno o que infrinja derechos de propiedad intelectual.</li>
              <li>Intentar interferir con el correcto funcionamiento de los servidores de LUMINUS.</li>
              <li>Extraer datos de la plataforma (scraping) sin autorización previa.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">4. Especialistas y servicios profesionales</h2>
            <p>
              LUMINUS actúa únicamente como una plataforma de conexión entre usuarios y especialistas, profesionales, facilitadores o prestadores de servicios vinculados al bienestar, desarrollo personal, salud complementaria u otras áreas afines.
            </p>
            <p>
              Los especialistas operan de manera independiente. LUMINUS no emplea, representa, controla ni garantiza la calidad, disponibilidad, idoneidad, resultados, servicios, sesiones, tratamientos, contenidos o prestaciones ofrecidas por dichos especialistas.
            </p>
            <p>
              Cualquier contratación, reserva, comunicación o interacción entre un usuario y un especialista será responsabilidad exclusiva de las partes involucradas. LUMINUS no será responsable por incumplimientos, cancelaciones, falta de respuesta, conflictos, daños, perjuicios, reclamos, fraudes, estafas o cualquier otra situación derivada de dicha relación.
            </p>
            <p>
              La admisión o permanencia de especialistas dentro de LUMINUS podrá estar sujeta a criterios de revisión definidos por la plataforma, sin que ello constituya certificación, aval, garantía o recomendación profesional.
            </p>
            <p className="pt-1">
              Los especialistas estarán sujetos, además, a las{" "}
              <Link href="/legal/condiciones-especialistas" className="text-slate-900 underline hover:text-black transition-colors">
                Condiciones para Especialistas LUMINUS
              </Link>
              .
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">5. Propiedad Intelectual</h2>
            <p>
              Todo el contenido, marcas, logotipos y software asociado con LUMINUS son propiedad exclusiva de LUMINUS LATAM o sus licenciantes. El uso de la plataforma no otorga ningún derecho de propiedad sobre estos activos.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">6. Limitación de Responsabilidad</h2>
            <p>
              LUMINUS proporciona la plataforma “tal cual” y no garantiza que los servicios sean ininterrumpidos, libres de errores o que cumplan con expectativas específicas de los usuarios.
            </p>
            <p>
              En la máxima medida permitida por la ley aplicable, LUMINUS no será responsable por daños directos, indirectos, incidentales, especiales, consecuentes, pérdidas económicas, pérdida de datos, pérdida de oportunidades, reclamos de terceros o cualquier perjuicio derivado del uso de la plataforma, de la imposibilidad de utilizarla o de las interacciones entre usuarios, especialistas o terceros.
            </p>
            <p>
              LUMINUS no será parte de los acuerdos, pagos, comunicaciones, sesiones, servicios o compromisos que los usuarios y especialistas establezcan entre sí fuera de las funcionalidades propias de la plataforma, salvo que se indique expresamente lo contrario.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-normal text-slate-900">7. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio. Se recomienda revisar esta página periódicamente.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
