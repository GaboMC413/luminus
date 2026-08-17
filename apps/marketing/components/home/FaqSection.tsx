"use client";

import { FAQ_CATEGORIES } from "@/data/faqsData";
import { FaqAccordionList } from "@/components/faqs/FaqAccordionList";

// Exact 10 Home FAQs (5 left, 5 right)
const HOME_FAQ_IDS = [
  "gen-1", // ¿Qué es LUMINUS y cuál es su propósito?
  "gen-2", // ¿Quién puede formar parte de LUMINUS?
  "esp-2", // ¿Cómo se incorporan los especialistas a la plataforma?
  "mem-2", // ¿Qué rol tiene LUMINUS en los servicios ofrecidos por los especialistas?
  "mem-1", // ¿Cómo funciona la membresía de LUMINUS?
  "gen-3", // ¿En qué países está disponible LUMINUS?
  "gen-6", // ¿Cómo protege LUMINUS la información y la privacidad de sus usuarios?
  "gen-4", // ¿Cómo se construye y modera la comunidad de LUMINUS?
  "mem-3", // ¿LUMINUS recomienda profesionales o garantiza sus servicios?
  "gen-5", // ¿Cómo puedo comunicarme con LUMINUS?
];

export function FaqSection() {
  const allFaqsMap = new Map(
    FAQ_CATEGORIES.flatMap((cat) => cat.faqs).map((faq) => [faq.id, faq])
  );
  
  const homeFaqs = HOME_FAQ_IDS.map((id) => allFaqsMap.get(id)).filter(
    (faq): faq is NonNullable<typeof faq> => faq !== undefined
  );

  return (
    <section id="faq" className="w-full py-16 md:py-24 bg-white border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12">
        {/* Title */}
        <h2 className="text-2xl sm:text-heading-5 font-normal tracking-tight text-slate-900 text-center">
          Preguntas frecuentes
        </h2>

        {/* 2 Column Accordion List using shared component */}
        <FaqAccordionList faqs={homeFaqs} twoColumns={true} />
      </div>
    </section>
  );
}
