import React from "react";
import PricingCard from "./PricingCard";

export default function PricingSection() {
  const plans = [
    {
      name: "Plan Mensual",
      price: "USD 5",
      billing: "/ mes",
      trialBadge: "Primeros 3 meses gratis",
      description: "Una opción flexible para continuar con acceso completo a LUMINUS mes a mes.",
      ctaText: "Seleccionar plan mensual",
      ctaLink: "https://app.luminuslatam.com/signup?plan=monthly",
      disclaimer: "No se solicitará ningún pago hasta que finalicen tus 3 meses de acceso sin costo. Antes de que termine este período, te informaremos para que puedas decidir si deseas continuar con este plan.",
      isPopular: false,
    },
    {
      name: "Plan Anual",
      price: "USD 45",
      billing: "/ año",
      trialBadge: "Primeros 3 meses gratis",
      discountBadge: "25% OFF · Ahorras USD 15",
      description: "La mejor alternativa para quienes buscan continuidad y un mejor valor anual.",
      ctaText: "Seleccionar plan anual",
      ctaLink: "https://app.luminuslatam.com/signup?plan=annual",
      disclaimer: "No se solicitará ningún pago hasta que finalicen tus 3 meses de acceso sin costo. Antes de que termine este período, te informaremos para que puedas decidir si deseas continuar con este plan.",
      isPopular: true,
    },
  ];

  return (
    <section id="planes" className="py-24 bg-white border-t-2 border-black">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-luminus-blue-soft border-2 border-black px-3 py-1 text-xs font-black text-black shadow-bold-sm mb-4">
            Planes LUMINUS
          </span>
          <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-4">
            Selecciona tu plan
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 font-bold">
            Comienza hoy con 3 meses de acceso sin costo.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mx-auto grid max-w-sm grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2 md:gap-8 lg:gap-12 items-stretch">
          {plans.map((plan, idx) => (
            <PricingCard key={idx} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
