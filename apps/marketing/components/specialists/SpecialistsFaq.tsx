"use client";

import { useState } from "react";

const SPECIALIST_FAQS_LEFT = [
  {
    question: "¿Quién puede postularse como Especialista LUMINUS?",
    paragraphs: [
      "Pueden postularse profesionales con formación, experiencia o trayectoria vinculada a alguna de las áreas de bienestar contempladas por LUMINUS. La red incluye perfiles de distintas disciplinas, enfoques y recorridos profesionales, desde salud y bienestar emocional hasta crecimiento personal, nutrición, movimiento, vínculos, espiritualidad y terapias complementarias.",
      "Cada postulación se evalúa de forma individual. La revisión considera la información profesional presentada, la trayectoria, el enfoque de trabajo y la coherencia del perfil con el propósito y los criterios de la Red de Especialistas.",
    ],
  },
  {
    question: "¿La aprobación es automática?",
    paragraphs: [
      "No. Crear una cuenta o contar con una membresía activa en LUMINUS no implica la incorporación automática como Especialista.",
      "Antes de habilitar un perfil dentro de la Red de Especialistas, nuestro equipo revisa la aplicación y la información profesional presentada. Este proceso busca mantener una red diversa y confiable, donde cada perfil cuente con información suficiente para que la comunidad pueda comprender quién es el especialista, cuál es su experiencia y cómo desarrolla su práctica.",
    ],
  },
  {
    question: "¿Necesito pagar una membresía adicional?",
    paragraphs: [
      "Para iniciar una aplicación como Especialista necesitas contar con una membresía activa de LUMINUS.",
      "La membresía te permite formar parte de la plataforma y acceder a las funcionalidades disponibles según las condiciones vigentes en cada momento. La aprobación como Especialista es un proceso independiente de la membresía y está siempre sujeta a revisión por parte del equipo de LUMINUS.",
    ],
  },
  {
    question: "¿LUMINUS interviene en mis servicios o precios?",
    paragraphs: [
      "No. Los Especialistas LUMINUS desarrollan su actividad de manera independiente y mantienen el control sobre su práctica profesional.",
      "Cada especialista define sus servicios, metodología, precios, disponibilidad, condiciones de atención y la forma en que decide trabajar con cada persona. LUMINUS facilita herramientas de visibilidad, descubrimiento y conexión, pero no fija precios, condiciones comerciales ni la manera en que debe desarrollarse una relación profesional.",
    ],
  },
  {
    question: "¿Puedo ofrecer sesiones desde LUMINUS?",
    paragraphs: [
      "Sí. Como Especialista puedes habilitar sesiones introductorias de 15 minutos para que nuevas personas conozcan tu enfoque antes de decidir si desean avanzar contigo.",
      "Puedes definir los días, horarios y disponibilidad en los que quieres recibir solicitudes. Estas conversaciones funcionan como un primer punto de contacto y no sustituyen una consulta, sesión, tratamiento o servicio profesional completo.",
    ],
  },
];

const SPECIALIST_FAQS_RIGHT = [
  {
    question: "¿Puedo agregar mi consultorio o clínica?",
    paragraphs: [
      "Sí. Puedes sumar a LUMINUS los espacios físicos donde desarrollas tu actividad, como consultorios, clínicas, centros, estudios u otros lugares de atención.",
      "Estos espacios pueden aparecer dentro del mapa de LUMINUS junto con información sobre su ubicación, áreas de bienestar y servicios disponibles. De esta forma, las personas pueden descubrir no solo especialistas, sino también lugares de atención relacionados con lo que están buscando.",
    ],
  },
  {
    question: "¿Puedo compartir cursos o talleres?",
    paragraphs: [
      "Sí. Puedes incorporar cursos, talleres, capacitaciones y otras propuestas vinculadas a tu actividad profesional.",
      "La idea es que las personas puedan descubrir distintas formas de profundizar en los temas que les interesan y conocer iniciativas desarrolladas por especialistas de la red. LUMINUS funciona como un canal para dar visibilidad a estas propuestas, aunque su organización, condiciones y desarrollo continúan siendo responsabilidad del especialista o entidad que las ofrece.",
    ],
  },
  {
    question: "¿Qué ocurre si mi postulación no es aprobada?",
    paragraphs: [
      "La aprobación como Especialista y la participación general en LUMINUS son procesos independientes.",
      "Si una aplicación no es aprobada, puedes continuar utilizando la plataforma como miembro de la comunidad de acuerdo con tu membresía y las funcionalidades disponibles. La decisión sobre una postulación se realiza de forma individual y no implica una evaluación general sobre el valor profesional de la persona fuera del contexto y los criterios de la Red de Especialistas LUMINUS.",
    ],
  },
  {
    question: "¿Qué rol tiene LUMINUS en los servicios ofrecidos?",
    paragraphs: [
      "LUMINUS funciona como una plataforma de conexión, visibilidad y descubrimiento entre personas y profesionales independientes.",
      "No presta directamente los servicios ofrecidos por los especialistas, ni dirige, supervisa o controla la forma en que estos desarrollan su práctica. Cada profesional es responsable de sus servicios, habilitaciones, metodología, condiciones, precios y de cualquier relación profesional que establezca con un usuario a partir de una conexión generada en la plataforma.",
    ],
  },
  {
    question: "¿LUMINUS responde por las acciones de los usuarios?",
    paragraphs: [
      "LUMINUS facilita el contacto entre miembros de la comunidad y especialistas, pero no puede garantizar el comportamiento, las decisiones o el cumplimiento de compromisos asumidos por terceros.",
      "Las conversaciones, contrataciones, pagos, acuerdos o relaciones que puedan surgir entre un especialista y un usuario son responsabilidad de las partes involucradas. LUMINUS tampoco garantiza que una consulta inicial derive en una contratación, que una persona continúe un proceso profesional o que los vínculos iniciados dentro de la plataforma se mantengan posteriormente.",
    ],
  },
];

export function SpecialistsFaq() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFaq = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <section id="faq" className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12">
        
        {/* Title */}
        <h2 className="text-2xl sm:text-heading-5 font-normal tracking-tight text-slate-900 text-center">
          Preguntas frecuentes
        </h2>

        {/* 2 Column Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 items-start">
          
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {SPECIALIST_FAQS_LEFT.map((faq, i) => {
              const key = `spec-left-${i}`;
              const isOpen = openIndex === key;
              return (
                <div key={key} className="border-b border-slate-200 pb-4">
                  <button
                    onClick={() => toggleFaq(key)}
                    className="w-full flex items-center justify-between text-left py-2 font-normal text-slate-900 text-body-large hover:text-slate-700 transition-colors gap-4"
                  >
                    <span>{faq.question}</span>
                    <span className={`transform transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pt-2 pb-1 text-body-medium text-slate-600 font-normal flex flex-col gap-3">
                      {faq.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {SPECIALIST_FAQS_RIGHT.map((faq, i) => {
              const key = `spec-right-${i}`;
              const isOpen = openIndex === key;
              return (
                <div key={key} className="border-b border-slate-200 pb-4">
                  <button
                    onClick={() => toggleFaq(key)}
                    className="w-full flex items-center justify-between text-left py-2 font-normal text-slate-900 text-body-large hover:text-slate-700 transition-colors gap-4"
                  >
                    <span>{faq.question}</span>
                    <span className={`transform transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pt-2 pb-1 text-body-medium text-slate-600 font-normal flex flex-col gap-3">
                      {faq.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
