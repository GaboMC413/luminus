"use client";

import { FAQ_CATEGORIES } from "@/data/faqsData";
import { FaqAccordionList } from "@/components/faqs/FaqAccordionList";

export function SpecialistsFaq() {
  const specialistCategory = FAQ_CATEGORIES.find((cat) => cat.id === "especialistas");
  const specialistFaqs = specialistCategory ? specialistCategory.faqs : [];

  return (
    <section id="faq" className="w-full py-16 md:py-24 bg-white border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col gap-12">
        {/* Title */}
        <h2 className="text-2xl sm:text-heading-5 font-normal tracking-tight text-slate-900 text-center">
          Preguntas frecuentes
        </h2>

        {/* 2 Column Accordion List using shared component */}
        <FaqAccordionList faqs={specialistFaqs} twoColumns={true} />
      </div>
    </section>
  );
}
