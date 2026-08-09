"use client";

import { useState } from "react";

const FAQS_LEFT = [
  {
    question: "¿Qué es LUMINUS y cuál es su propósito?",
    answer:
      "LUMINUS es una plataforma de bienestar que reúne personas, especialistas, contenidos, espacios y herramientas digitales para acompañar procesos de bienestar, desarrollo personal y vida consciente en Latinoamérica.",
  },
  {
    question: "¿Quién puede formar parte de LUMINUS?",
    answer:
      "Cualquier persona interesada en cuidar y explorar su bienestar personal, así como especialistas, profesionales capacitados, consultorios y clínicas que busquen conectar con la comunidad.",
  },
  {
    question: "¿Cómo se incorporan los Especialistas a la Plataforma?",
    answer:
      "Los especialistas completan una postulación en la cual revisamos su formación, credenciales y enfoque profesional de forma ética antes de habilitar su perfil activo en la plataforma.",
  },
  {
    question: "¿Qué rol tiene LUMINUS en los servicios ofrecidos por los Especialistas?",
    answer:
      "LUMINUS facilita el encuentro y la comunicación directa de forma transparente. Cada profesional realiza sus atenciones de manera independiente conforme a su práctica profesional.",
  },
  {
    question: "¿Cómo funciona la membresía de LUMINUS?",
    answer:
      "Todas las cuentas nuevas inician con 3 meses sin costo y sin ingresar datos de pago. Al finalizar este período, puedes elegir continuar con la membresía mensual de USD 5 o la anual de USD 45.",
  },
];

const FAQS_RIGHT = [
  {
    question: "¿En qué países está disponible LUMINUS?",
    answer:
      "LUMINUS está abierta y accesible para usuarios y profesionales en toda América Latina y la comunidad hispanohablante a nivel global.",
  },
  {
    question: "¿Cómo protege LUMINUS la información y la privacidad de sus usuarios?",
    answer:
      "Implementamos rigurosas medidas de seguridad y cifrado para proteger todos tus datos personales, preferencias de bienestar e interacciones dentro de la plataforma.",
  },
  {
    question: "¿Cómo se construye y modera la comunidad de LUMINUS?",
    answer:
      "Nos regimos por principios de respeto, empatía, autenticidad y cuidado mutuo. Contamos con lineamientos de convivencia y moderación continua.",
  },
  {
    question: "¿LUMINUS recomienda profesionales o garantiza sus servicios?",
    answer:
      "Brindamos información detallada, transparente y verificada de cada perfil para que tengas la libertad y la claridad de elegir al especialista que mejor resuene con tu proceso.",
  },
  {
    question: "¿Cómo puedo comunicarme con LUMINUS?",
    answer:
      "Puedes contactarnos a través del formulario al final de esta página o escribiéndonos directamente en nuestras redes sociales o chat de la plataforma.",
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
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-center">
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
                    className="w-full flex items-center justify-between text-left py-2 font-medium text-slate-900 text-base md:text-lg hover:text-slate-700 transition-colors gap-4"
                  >
                    <span>{faq.question}</span>
                    <span className={`transform transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pt-2 pb-1 text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                      {faq.answer}
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
                    className="w-full flex items-center justify-between text-left py-2 font-medium text-slate-900 text-base md:text-lg hover:text-slate-700 transition-colors gap-4"
                  >
                    <span>{faq.question}</span>
                    <span className={`transform transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pt-2 pb-1 text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                      {faq.answer}
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
