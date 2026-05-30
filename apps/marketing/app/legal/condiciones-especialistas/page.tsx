import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Condiciones para Especialistas | LUMINUS Latam",
  description: "Regula la postulación, admisión, participación y permanencia de los especialistas dentro de la red LUMINUS.",
};

export default function CondicionesEspecialistasPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-[70px] md:h-[80px] bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 md:px-8 flex items-center justify-between z-50">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/logo-luminus-black.svg" alt="Luminus" className="h-[18px] md:h-[20px]" />
        </Link>
        <Link 
          href="https://app.luminuslatam.com/auth/registrarse" 
          className="group flex items-center gap-2 text-[14px] font-medium border border-black px-4 md:px-6 py-2 rounded-full hover:bg-black hover:text-white transition-all"
        >
          <span className="hidden md:inline">Volver al registro</span>
          <span className="material-symbols-rounded md:hidden text-[20px]">arrow_back</span>
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-[800px] mx-auto pt-[110px] md:pt-[140px] pb-12 md:pb-24 px-8">
        <h1 className="text-[36px] md:text-[42px] font-display font-black tracking-tight leading-tight mb-4">
          Condiciones para Especialistas LUMINUS
        </h1>
        <p className="text-zinc-500 text-[14px] mb-12 font-semibold">Última actualización: 29 de Mayo, 2026</p>

        <section className="space-y-10 text-[16px] leading-[1.7] text-zinc-800">
          <p className="font-semibold text-zinc-900">
            Estas condiciones regulan la postulación, admisión, participación y permanencia de especialistas, facilitadores, prestadores de servicios, clínicas, consultorios o espacios vinculados al bienestar, desarrollo personal, salud complementaria u otras áreas afines dentro de LUMINUS.
          </p>
          <p className="font-semibold text-zinc-900">
            Al postularse, crear un perfil de especialista, contratar un plan para especialistas, publicar contenido, ofrecer servicios, participar en espacios o utilizar funcionalidades de especialista dentro de LUMINUS, la persona acepta estas condiciones.
          </p>

          <hr className="border-zinc-150 my-8" />

          {/* Section 1 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">1. Naturaleza de LUMINUS</h2>
            <p>
              LUMINUS es una plataforma orientada a conectar personas interesadas en bienestar, desarrollo personal, salud complementaria, vida consciente y áreas afines con especialistas, contenidos, experiencias, espacios y recursos vinculados a dichos temas.
            </p>
            <p>
              LUMINUS actúa como una plataforma de conexión, visibilidad, comunidad y descubrimiento. LUMINUS no emplea, representa, supervisa, controla ni garantiza los servicios, sesiones, tratamientos, cursos, programas, recomendaciones, contenidos o actividades ofrecidas por los especialistas que forman parte de la plataforma.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">2. Postulación como especialista</h2>
            <p>
              Las personas que deseen formar parte de la Red de Especialistas LUMINUS podrán postularse mediante los formularios, perfiles o procesos habilitados por la plataforma.
            </p>
            <p>
              La postulación, el registro, la creación de una cuenta, el pago de una membresía, la contratación de un plan, el envío de información o el cumplimiento de determinados requisitos no implica aceptación automática ni genera derecho adquirido a ser admitido, publicado, recomendado, destacado, promocionado o mantenido como especialista dentro de LUMINUS.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">3. Evaluación, admisión y permanencia</h2>
            <p>
              LUMINUS se reserva el derecho, a su exclusivo criterio, de evaluar, aceptar, rechazar, limitar, suspender, desactivar, remover o dar de baja cualquier postulación, perfil de especialista, publicación, contenido, servicio, curso, recurso, espacio, ubicación en el mapa, clínica, consultorio o participación de especialista dentro de la plataforma.
            </p>
            <p>
              Para dicha evaluación, LUMINUS podrá considerar, entre otros aspectos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 font-medium">
              <li>Trayectoria del especialista.</li>
              <li>Formación y experiencia comprobable.</li>
              <li>Contenidos previos.</li>
              <li>Reputación pública.</li>
              <li>Referencias.</li>
              <li>Claridad de la propuesta del especialista.</li>
              <li>Adecuación al enfoque de LUMINUS.</li>
              <li>Coherencia con los valores de la plataforma.</li>
              <li>Conducta dentro o fuera de la plataforma.</li>
              <li>Calidad de la comunicación.</li>
              <li>Reportes, reclamos o comentarios de usuarios.</li>
              <li>Riesgos para la comunidad.</li>
              <li>Cumplimiento de estas condiciones y de otras políticas internas.</li>
              <li>Cualquier otro criterio que LUMINUS considere relevante para preservar la confianza, seguridad, calidad, coherencia y propósito de la red.</li>
            </ul>
            <p>
              LUMINUS no estará obligado a aceptar una postulación ni a informar, justificar o detallar los motivos de aceptación, rechazo, suspensión, limitación, remoción o baja de un perfil de especialista, salvo que la normativa aplicable disponga lo contrario.
            </p>
            <p>
              La permanencia dentro de la Red de Especialistas LUMINUS estará sujeta al cumplimiento continuo de los criterios, condiciones, valores, normas y políticas definidos por la plataforma.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">4. Independencia del especialista</h2>
            <p>
              Los especialistas que formen parte de LUMINUS actúan de manera independiente y bajo su exclusiva responsabilidad.
            </p>
            <p>
              Nada de lo establecido en estas condiciones, ni la presencia de un especialista dentro de LUMINUS, podrá interpretarse como la existencia de una relación laboral, societaria, comercial, de representación, agencia, de mandato, asociación, dependencia o subordinación entre LUMINUS y el especialista.
            </p>
            <p>
              Cada especialista será responsable por su actividad, formación, habilitaciones, certificaciones, permisos, cumplimiento normativo, servicios ofrecidos, comunicaciones, contenidos, precios, condiciones comerciales, pagos, resultados, promesas, recomendaciones y relación con los usuarios.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">5. Alcance de la aprobación del especialista</h2>
            <p>
              La aprobación de una persona como especialista dentro de LUMINUS no constituye certificación, aval profesional, recomendación personalizada, garantía de calidad, validación técnica, habilitación legal, supervisión, representación ni respaldo sobre los servicios, tratamientos, sesiones, contenidos, cursos, programas, actividades, recomendaciones o prestaciones ofrecidas por dicha persona.
            </p>
            <p>
              LUMINUS podrá establecer criterios de admisión, revisión o permanencia para los especialistas dentro de la plataforma. Sin embargo, dichos procesos no constituyen una garantía sobre la calidad, seguridad, legalidad, eficacia, idoneidad o conveniencia de los servicios ofrecidos por los especialistas.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">6. Planes, membresías y funcionalidades para especialistas</h2>
            <p>
              LUMINUS podrá ofrecer diferentes planes, membresías o funcionalidades para especialistas, incluyendo planes base, planes avanzados, suscripciones mensuales, pagos anuales, beneficios promocionales o funcionalidades adicionales.
            </p>
            <p>
              La membresía base de LUMINUS podrá permitir a una persona postularse como especialista, siempre que cumpla con los requisitos y criterios definidos por la plataforma. Sin embargo, el pago de dicha membresía no garantiza la aprobación como especialista ni la visibilidad dentro de la Red de Especialistas LUMINUS.
            </p>
            <p>
              Los planes avanzados para especialistas, como Especialista Plus o denominaciones equivalentes, podrán incluir funcionalidades adicionales tales como mayor visibilidad, publicación de cursos o recursos, participación o creación de espacios, presencia en mapas, inclusión de clínicas o consultorios, sesiones introductorias, herramientas de contacto u otras funcionalidades presentes o futuras.
            </p>
            <p>
              LUMINUS podrá modificar, ampliar, limitar, suspender o discontinuar planes, precios, beneficios, funcionalidades o condiciones comerciales en cualquier momento, de acuerdo con sus necesidades operativas, estratégicas o comerciales.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">7. Sesiones introductorias y contacto con usuarios</h2>
            <p>
              LUMINUS podrá permitir que determinados especialistas ofrezcan sesiones introductorias, llamadas iniciales, espacios de orientación o encuentros breves con usuarios de la plataforma.
            </p>
            <p>
              Estas sesiones tienen como finalidad facilitar un primer contacto entre usuarios y especialistas, permitir que el usuario conozca el enfoque del especialista y abrir la posibilidad de una relación profesional posterior entre las partes.
            </p>
            <p>
              LUMINUS no interviene ni será responsable por la relación profesional posterior, contratación, pago, prestación del servicio, resultados, condiciones comerciales, continuidad del vínculo, tratamiento, programa, asesoramiento o cualquier acuerdo celebrado entre usuarios y especialistas.
            </p>
            <p>
              El especialista reconoce que cualquier servicio, tratamiento, sesión paga, programa, curso, consulta, recomendación o prestación posterior será ofrecido bajo su exclusiva responsabilidad y de acuerdo con la normativa aplicable a su actividad.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">8. Obligaciones del especialista</h2>
            <p>
              El especialista se compromete a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 font-medium">
              <li>Presentar información clara, veraz, completa y actualizada sobre su identidad, formación, experiencia, servicios, enfoque y actividad profesional.</li>
              <li>Mantener un trato respetuoso, ético, responsable y adecuado con usuarios, otros especialistas y miembros de la comunidad.</li>
              <li>No realizar promesas engañosas, afirmaciones falsas, diagnósticos inapropiados, garantías de resultados o comunicaciones que puedan inducir a error.</li>
              <li>Cumplir con las leyes, regulaciones, permisos, habilitaciones o requisitos aplicables a su actividad.</li>
              <li>Respetar la privacidad, confidencialidad y datos personales de los usuarios.</li>
              <li>No utilizar LUMINUS para actividades fraudulentas, abusivas, discriminatorias, ilegales, engañosas o contrarias a los valores de la plataforma.</li>
              <li>Respetar las condiciones, políticas, criterios y normas definidos por LUMINUS.</li>
              <li>Mantener actualizada la información publicada en su perfil, servicios, cursos, espacios, clínicas, consultorios o contenidos.</li>
              <li>Responder de manera razonable y profesional a las comunicaciones o solicitudes recibidas a través de la plataforma.</li>
            </ul>
          </div>

          {/* Section 9 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">9. Contenidos, cursos, recursos y espacios</h2>
            <p>
              Los especialistas podrán, si la plataforma lo permite y de acuerdo con el plan contratado, publicar contenidos, cursos, recursos, materiales, actividades, espacios, eventos o información vinculada a su área de trabajo.
            </p>
            <p>
              El especialista será el único responsable por la legalidad, veracidad, originalidad, calidad, pertinencia, uso de derechos de terceros, precisión y consecuencias derivadas de dichos contenidos.
            </p>
            <p>
              LUMINUS podrá revisar, limitar, editar, rechazar, ocultar o remover cualquier contenido, curso, recurso, espacio o publicación que considere inapropiado, engañoso, contrario a estas condiciones, riesgoso para la comunidad o incompatible con los valores de la plataforma.
            </p>
          </div>

          {/* Section 10 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">10. Clínicas, consultorios, espacios físicos y mapa</h2>
            <p>
              LUMINUS podrá permitir que ciertos especialistas, clínicas, consultorios o espacios físicos aparezcan en mapas, directorios u otras funcionalidades de localización dentro de la plataforma.
            </p>
            <p>
              La publicación de una ubicación, clínica, consultorio o espacio físico dentro de LUMINUS no implica validación, habilitación, certificación, recomendación ni garantía sobre dicho lugar, sus servicios, condiciones, permisos, seguridad, disponibilidad o funcionamiento.
            </p>
            <p>
              La persona o entidad que solicite la publicación será responsable por la veracidad de la información, la autorización para utilizar la ubicación, el cumplimiento normativo, la atención brindada y cualquier situación derivada del uso o visita de dicho espacio.
            </p>
          </div>

          {/* Section 11 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">11. Relación entre especialistas y usuarios</h2>
            <p>
              La contratación, reserva, comunicación, pago, participación o interacción entre un usuario y un especialista se realiza bajo exclusiva responsabilidad de las partes involucradas.
            </p>
            <p>
              LUMINUS no será responsable por incumplimientos, cancelaciones, falta de respuesta, demoras, mala calidad del servicio, disconformidad con una sesión, resultados no alcanzados, información incorrecta, daños, perjuicios, conflictos, reclamos, fraudes, estafas o cualquier otra situación derivada directa o indirectamente de la relación entre usuarios y especialistas.
            </p>
            <p>
              Los usuarios deberán evaluar bajo su propio criterio la trayectoria, formación, experiencia, condiciones, precios, modalidad de trabajo, habilitaciones, certificaciones y pertinencia de cada especialista antes de contratar, reservar, participar o continuar cualquier servicio, sesión, tratamiento, programa, curso o actividad.
            </p>
          </div>

          {/* Section 12 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">12. Reportes, reclamos y medidas sobre perfiles de especialistas</h2>
            <p>
              LUMINUS podrá recibir reportes, reclamos, comentarios o evaluaciones sobre especialistas, contenidos, servicios, sesiones, espacios, clínicas, consultorios o actividades publicadas dentro de la plataforma.
            </p>
            <p>
              Ante cualquier reporte, reclamo, incumplimiento, conducta incompatible con los valores de LUMINUS, información falsa o incompleta, uso indebido de la plataforma, riesgo para la comunidad o cualquier otra situación que LUMINUS considere relevante, la plataforma podrá adoptar medidas tales como:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 font-medium">
              <li>Solicitar información adicional.</li>
              <li>Revisar perfiles, contenidos o servicios.</li>
              <li>Limitar funcionalidades.</li>
              <li>Pausar la visibilidad de un perfil.</li>
              <li>Remover contenidos, cursos, recursos o publicaciones.</li>
              <li>Suspender cuentas.</li>
              <li>Cancelar la participación del especialista.</li>
              <li>Dar de baja perfiles de la Red de Especialistas LUMINUS.</li>
            </ul>
            <p>
              Estas medidas no implican que LUMINUS asuma responsabilidad legal, económica, médica, terapéutica, contractual o de cualquier otra naturaleza por los actos, omisiones o servicios prestados por terceros.
            </p>
          </div>

          {/* Section 13 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">13. Uso de imagen, nombre y materiales</h2>
            <p>
              Cuando el especialista participe en actividades, charlas, contenidos, eventos, espacios o materiales generados en el marco de LUMINUS, podrá autorizar a LUMINUS a utilizar su nombre, imagen, voz, perfil, biografía, contenido, participación o materiales asociados para fines de difusión, comunicación, educación, promoción y posicionamiento de la plataforma.
            </p>
            <p>
              Cuando corresponda, dicha autorización podrá solicitarse mediante formularios, aceptaciones específicas, acuerdos particulares o condiciones adicionales.
            </p>
          </div>

          {/* Section 14 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">14. Baja, suspensión o remoción</h2>
            <p>
              LUMINUS podrá suspender, limitar o remover la participación de un especialista dentro de la plataforma en caso de incumplimiento de estas condiciones, de otras políticas aplicables, de los valores de la comunidad o ante cualquier situación que LUMINUS considere incompatible con la confianza, seguridad, calidad o propósito de la red.
            </p>
            <p>
              Estas medidas no generarán derecho automático a indemnización, compensación, reembolso, lucro cesante, daño reputacional ni otro reclamo contra LUMINUS, salvo que la normativa aplicable disponga expresamente lo contrario.
            </p>
          </div>

          {/* Section 15 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">15. Modificaciones</h2>
            <p>
              LUMINUS podrá actualizar, modificar o reemplazar estas condiciones en cualquier momento. Las modificaciones serán publicadas en la plataforma y entrarán en vigencia desde su publicación o desde la fecha que se indique en cada caso.
            </p>
            <p>
              El uso continuado de funcionalidades de especialista dentro de LUMINUS luego de publicadas las modificaciones implicará la aceptación de las condiciones actualizadas.
            </p>
          </div>

          {/* Section 16 */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-display font-black text-black">16. Aceptación</h2>
            <p>
              Al postularse, crear un perfil de especialista, contratar un plan para especialistas, publicar contenido, ofrecer servicios, participar en espacios o utilizar funcionalidades de especialista dentro de LUMINUS, la persona declara haber leído, comprendido y aceptado estas condiciones.
            </p>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <div className="w-full shrink-0 h-[64px] flex flex-col justify-center border-t border-zinc-100 mt-auto bg-slate-55">
        <p className="text-[9px] text-zinc-400 text-center uppercase tracking-wide font-bold">LUMINUS LATAM © 2026</p>
      </div>
    </div>
  );
}
