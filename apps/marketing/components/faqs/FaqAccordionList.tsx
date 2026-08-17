"use client";

import { useState } from "react";
import Link from "next/link";
import { FaqItem } from "@/data/faqsData";

interface FaqAccordionListProps {
  faqs: FaqItem[];
  twoColumns?: boolean;
  className?: string;
}

export function FaqAccordionList({ faqs, twoColumns = false, className = "" }: FaqAccordionListProps) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const renderParagraphText = (text: string) => {
    const contactMatch = text.includes("sección de Contacto")
      ? "sección de Contacto"
      : text.includes("página de Contacto")
      ? "página de Contacto"
      : null;

    if (contactMatch) {
      const parts = text.split(contactMatch);
      return (
        <span>
          {parts[0]}
          <Link
            href="/contacto"
            className="text-slate-900 font-medium underline underline-offset-2 hover:text-black transition-colors"
          >
            {contactMatch}
          </Link>
          {parts[1]}
        </span>
      );
    }

    if (text.includes("Política de Privacidad")) {
      const parts = text.split("Política de Privacidad");
      return (
        <span>
          {parts[0]}
          <Link
            href="/legal/privacidad"
            className="text-slate-900 font-medium underline underline-offset-2 hover:text-black transition-colors"
          >
            Política de Privacidad
          </Link>
          {parts[1]}
        </span>
      );
    }

    return text;
  };

  const renderItem = (faq: FaqItem) => {
    const isOpen = openIndex === faq.id;
    return (
      <div key={faq.id} className="w-full border-b border-slate-200">
        <button
          onClick={() => toggleFaq(faq.id)}
          className="w-full flex items-center justify-between text-left py-4 sm:py-5 font-normal text-slate-900 text-base sm:text-lg hover:text-slate-700 transition-colors gap-4 cursor-pointer"
          aria-expanded={isOpen}
        >
          <span className="leading-snug">{faq.question}</span>
          <span className={`transform transition-transform duration-300 shrink-0 p-1 text-slate-500 ${isOpen ? "rotate-180 text-slate-900" : ""}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="pb-5 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed flex flex-col gap-3 font-normal">
            {faq.paragraphs.map((p, idx) => (
              <p key={idx}>{renderParagraphText(p)}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (twoColumns) {
    const mid = Math.ceil(faqs.length / 2);
    const leftFaqs = faqs.slice(0, mid);
    const rightFaqs = faqs.slice(mid);

    return (
      <div className={`w-full grid grid-cols-1 lg:grid-cols-2 gap-x-12 items-start ${className}`}>
        <div className="flex flex-col border-t border-slate-200">
          {leftFaqs.map(renderItem)}
        </div>
        {rightFaqs.length > 0 && (
          <div className="flex flex-col border-t border-slate-200">
            {rightFaqs.map(renderItem)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full border-t border-slate-200 flex flex-col ${className}`}>
      {faqs.map(renderItem)}
    </div>
  );
}
