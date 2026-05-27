"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
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

      {/* Content */}
      <main className="max-w-[800px] mx-auto pt-[110px] md:pt-[140px] pb-12 md:pb-24 px-8">
        <h1 className="text-[42px] font-jakarta font-normal tracking-tight leading-tight mb-4">Términos y Condiciones</h1>
        <p className="text-zinc-500 text-[14px] mb-12">Última actualización: 18 de Abril, 2026</p>

        <section className="space-y-10 text-[16px] leading-[1.6]">
          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar LUMINUS LATAM, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestros servicios. LUMINUS es una plataforma diseñada para conectar personas con expertos, profesionales y experiencias vinculadas al bienestar, desarrollo personal y crecimiento integral en Latinoamérica.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">2. Elegibilidad y Registro</h2>
            <p>
              Para utilizar LUMINUS, debe completar el proceso de registro proporcionando información veraz, exacta y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso. La plataforma está dirigida a personas interesadas en acceder a experiencias, contenidos, expertos y servicios vinculados al bienestar, desarrollo personal, salud complementaria y crecimiento integral.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">3. Uso de la Plataforma</h2>
            <p>
              Usted se compromete a utilizar la plataforma de manera ética y profesional. Queda estrictamente prohibido:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700">
              <li>Utilizar el servicio para cualquier propósito ilegal o no autorizado.</li>
              <li>Publicar contenido difamatorio, obsceno o que infrinja derechos de propiedad intelectual.</li>
              <li>Intentar interferir con el correcto funcionamiento de los servidores de LUMINUS.</li>
              <li>Extraer datos de la plataforma (scraping) sin autorización previa.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">4. Expertos, servicios profesionales y relación entre usuarios</h2>
            <p>
              LUMINUS actúa únicamente como una plataforma de conexión entre usuarios y expertos, profesionales, facilitadores o prestadores de servicios vinculados al bienestar, desarrollo personal, salud complementaria u otras áreas afines.
            </p>
            <p>
              Los expertos que forman parte de la plataforma operan de manera independiente. LUMINUS no emplea, representa, controla ni garantiza la conducta, disponibilidad, calidad, idoneidad, resultados, cumplimiento, contenido, asesoramiento, recomendaciones, servicios, sesiones, programas o cualquier otra prestación ofrecida por dichos expertos.
            </p>
            <p>
              La contratación, reserva, comunicación o interacción entre un usuario y un experto se realiza bajo exclusiva responsabilidad de las partes involucradas. LUMINUS no será responsable por incumplimientos, cancelaciones, falta de respuesta, demoras, mala calidad del servicio, disconformidad con una sesión, resultados no alcanzados, información incorrecta, daños, perjuicios, conflictos, reclamos, fraudes, estafas o cualquier otra situación derivada directa o indirectamente de la relación entre usuarios y expertos.
            </p>
            <p>
              Si bien LUMINUS podrá establecer criterios de admisión, revisión o permanencia para los expertos dentro de la plataforma, dichos procesos no constituyen una garantía sobre la calidad, seguridad, legalidad, eficacia o conveniencia de los servicios ofrecidos.
            </p>
            <p>
              El usuario reconoce y acepta que debe evaluar bajo su propio criterio la trayectoria, formación, experiencia, condiciones, precios y modalidad de trabajo de cada experto antes de contratar, reservar o participar en cualquier servicio, sesión o actividad.
            </p>
            <p>
              LUMINUS podrá recibir reportes, reclamos o comentarios sobre expertos y, a su exclusivo criterio, tomar medidas como revisar perfiles, limitar funcionalidades, suspender cuentas o remover expertos de la plataforma. Sin embargo, estas acciones no implican que LUMINUS asuma responsabilidad legal, económica, profesional o contractual por los actos, omisiones o servicios prestados por terceros.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">5. Propiedad Intelectual</h2>
            <p>
              Todo el contenido, marcas, logotipos y software asociado con LUMINUS son propiedad exclusiva de LUMINUS LATAM o sus licenciantes. El uso de la plataforma no otorga ningún derecho de propiedad sobre estos activos.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">6. Limitación de Responsabilidad</h2>
            <p>
              LUMINUS proporciona la plataforma “tal cual” y no garantiza que los servicios sean ininterrumpidos, libres de errores o que cumplan con expectativas específicas de los usuarios.
            </p>
            <p>
              En la máxima medida permitida por la ley aplicable, LUMINUS no será responsable por daños directos, indirectos, incidentales, especiales, consecuentes, pérdidas económicas, pérdida de datos, pérdida de oportunidades, reclamos de terceros o cualquier perjuicio derivado del uso de la plataforma, de la imposibilidad de utilizarla o de las interacciones entre usuarios, expertos o terceros.
            </p>
            <p>
              LUMINUS no será parte de los acuerdos, pagos, comunicaciones, sesiones, servicios o compromisos que los usuarios y expertos establezcan entre sí fuera de las funcionalidades propias de la plataforma, salvo que se indique expresamente lo contrario.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-[20px] font-jakarta font-bold">7. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio. Se recomienda revisar esta página periódicamente.
            </p>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <div className="w-full shrink-0 h-[64px] flex flex-col justify-center border-t border-zinc-100 mt-auto">
        <p className="text-[9px] text-zinc-400 text-center uppercase tracking-wide">LUMINUS LATAM © 2026</p>
      </div>
    </div>
  );
}
