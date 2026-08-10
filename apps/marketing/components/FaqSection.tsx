"use client";

import { useState } from "react";

const FAQS_LEFT = [
  {
    question: "¿Qué es LUMINUS y cuál es su propósito?",
    paragraphs: [
      "LUMINUS es una plataforma digital de bienestar creada para conectar personas, especialistas independientes, espacios, actividades y herramientas dentro de una misma red.",
      "Nuestro propósito es facilitar el acceso a distintas formas de acompañamiento y bienestar, haciendo más simple descubrir profesionales, perspectivas y recursos que puedan ser relevantes para cada persona.",
      "LUMINUS reúne distintas áreas como bienestar emocional, salud integral, crecimiento personal, movimiento, nutrición, espiritualidad, vínculos y terapias complementarias, desde una mirada amplia y diversa del bienestar.",
    ],
  },
  {
    question: "¿Quién puede formar parte de LUMINUS?",
    paragraphs: [
      "LUMINUS está pensado para personas interesadas en explorar distintas formas de bienestar y para profesionales que desarrollan su actividad en áreas relacionadas.",
      "Los usuarios pueden participar de la comunidad, descubrir especialistas, explorar espacios, acceder a actividades y utilizar las herramientas disponibles dentro de la plataforma.",
      "Los especialistas cuentan con un perfil profesional diferenciado desde el cual pueden presentar su experiencia, formación, áreas de acompañamiento, servicios, espacios y otras propuestas vinculadas con su práctica.",
    ],
  },
  {
    question: "¿Cómo se incorporan los especialistas a la plataforma?",
    paragraphs: [
      "Los profesionales interesados en formar parte de la red deben completar un proceso de aplicación donde presentan información sobre su formación, experiencia, trayectoria y áreas de trabajo.",
      "Cada aplicación es revisada antes de habilitar el perfil profesional. Este proceso busca mantener criterios de calidad, claridad y responsabilidad dentro de la red.",
      "Los especialistas participan de manera independiente. Su presencia en LUMINUS no implica una relación laboral, societaria ni de representación con la plataforma.",
    ],
  },
  {
    question: "¿Qué rol tiene LUMINUS en los servicios ofrecidos por los especialistas?",
    paragraphs: [
      "LUMINUS funciona como una plataforma de conexión y descubrimiento. No presta directamente servicios médicos, psicológicos, terapéuticos ni otros servicios profesionales ofrecidos por los especialistas.",
      "Cualquier relación profesional que se establezca posteriormente, así como sus condiciones, honorarios, tratamientos o seguimientos, es acordada directamente entre el usuario y el especialista correspondiente.",
      "La información disponible en la plataforma tiene como objetivo facilitar el acceso y el conocimiento de distintas opciones, pero no sustituye una evaluación, diagnóstico o indicación profesional.",
    ],
  },
  {
    question: "¿Cómo funciona la membresía de LUMINUS?",
    paragraphs: [
      "La membresía permite acceder a la experiencia y las herramientas disponibles dentro de la plataforma según el plan elegido.",
      "Actualmente, las nuevas cuentas pueden comenzar con un período inicial de 3 meses sin costo y sin ingresar datos de pago. Antes de que finalice ese período, LUMINUS informará al usuario para que pueda decidir si desea continuar con una membresía mensual o anual.",
      "Las funcionalidades de la plataforma pueden evolucionar e incorporarse progresivamente. La disponibilidad de cada herramienta será comunicada de forma clara dentro de LUMINUS.",
    ],
  },
];

const FAQS_RIGHT = [
  {
    question: "¿En qué países está disponible LUMINUS?",
    paragraphs: [
      "LUMINUS tiene alcance latinoamericano y está pensado para conectar personas y profesionales de diferentes países de la región.",
      "La plataforma digital puede utilizarse desde distintos lugares, aunque la disponibilidad de especialistas, espacios, actividades y determinadas funcionalidades puede variar según el país o la ciudad.",
      "A medida que la red crece, también se amplía la presencia de profesionales y propuestas disponibles en diferentes mercados de Latinoamérica.",
    ],
  },
  {
    question: "¿Cómo protege LUMINUS la información y la privacidad de sus usuarios?",
    paragraphs: [
      "LUMINUS procura recopilar únicamente la información necesaria para operar la plataforma, administrar las cuentas y ofrecer sus funcionalidades.",
      "La información personal se gestiona de acuerdo con nuestra Política de Privacidad y mediante medidas técnicas y organizativas destinadas a proteger los datos de los usuarios.",
      "Cada funcionalidad determina qué información puede ser visible para otros miembros y cuál permanece asociada de forma privada a la cuenta. Los detalles sobre tratamiento de datos, almacenamiento y derechos de los usuarios se encuentran desarrollados en la documentación legal de la plataforma.",
    ],
  },
  {
    question: "¿Cómo se construye y modera la comunidad de LUMINUS?",
    paragraphs: [
      "LUMINUS busca construir una comunidad basada en el respeto, la diversidad de perspectivas y la participación responsable.",
      "La plataforma cuenta con normas de convivencia y criterios de uso destinados a proteger a sus miembros y mantener la calidad de las interacciones. Las conductas que incumplan estas normas pueden ser revisadas y, cuando corresponda, dar lugar a restricciones o suspensión de una cuenta.",
      "La diversidad de experiencias, disciplinas y puntos de vista forma parte de LUMINUS, siempre dentro de un marco de respeto hacia los demás miembros.",
    ],
  },
  {
    question: "¿LUMINUS recomienda profesionales o garantiza sus servicios?",
    paragraphs: [
      "LUMINUS permite descubrir especialistas y acceder a información sobre su trayectoria, formación, áreas de trabajo y servicios, pero no garantiza resultados ni determina qué profesional es adecuado para cada persona.",
      "La decisión de contactar o contratar a un especialista corresponde exclusivamente al usuario.",
      "El proceso de aplicación de profesionales busca aportar mayor claridad y confianza sobre la información presentada en la plataforma, pero no reemplaza la evaluación personal ni las responsabilidades propias de cada especialista.",
    ],
  },
  {
    question: "¿Cómo puedo comunicarme con LUMINUS?",
    paragraphs: [
      "Puedes comunicarte con nosotros para realizar consultas sobre la plataforma, solicitar soporte, resolver dudas sobre tu cuenta o compartir comentarios sobre tu experiencia.",
      "Contacto: info@luminuslatam.com",
      "Nuestro equipo responderá a través de los canales oficiales de LUMINUS.",
    ],
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFaq = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <section id="faq" className="w-full py-16 md:py-24 bg-white border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12">
        
        {/* Title */}
        <h2 className="text-2xl sm:text-heading-5 font-normal tracking-tight text-slate-900 text-center">
          Preguntas frecuentes
        </h2>

        {/* 2 Column FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 items-start">
          
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {FAQS_LEFT.map((faq, i) => {
              const key = `left-${i}`;
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
            {FAQS_RIGHT.map((faq, i) => {
              const key = `right-${i}`;
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
