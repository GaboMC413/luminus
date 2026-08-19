"use client";

import { FAQ_CATEGORIES } from "@/data/faqsData";
import { FaqAccordionList } from "./FaqAccordionList";

export function CategorizedFaqs() {
  return (
    <div className="w-full flex flex-col gap-10 md:gap-14">
      {FAQ_CATEGORIES.map((category) => (
        <div key={category.id} id={category.id} className="w-full flex flex-col gap-3 scroll-mt-24">
          {/* Category Title — Small, uppercase, gray header */}
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">
            {category.title}
          </h2>

          {/* Shared Accordion List Component */}
          <FaqAccordionList faqs={category.faqs} />
        </div>
      ))}
    </div>
  );
}
