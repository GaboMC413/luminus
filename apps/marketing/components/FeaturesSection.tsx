import React from "react";
import { Users, UserCheck, Compass, MapPin, Sparkles } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
  const row1Features = [
    {
      title: "Comunidad LUMINUS",
      description: "Explora integrantes de la red, conoce sus perfiles, descubre intereses en común y conecta con personas que también están construyendo una vida con más bienestar, propósito y equilibrio.",
      ctaText: "Explorar comunidad",
      ctaLink: "https://app.luminuslatam.com/signup",
      isComingSoon: false,
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Expertos",
      description: "Próximamente podrás descubrir expertos de distintas áreas del bienestar, conocer su enfoque, conectar con las personas indicadas, agendar sesiones y acceder a cursos, recursos y contenidos compartidos con la comunidad.",
      ctaText: "Descubrir expertos",
      ctaLink: "#",
      isComingSoon: true,
      icon: <UserCheck className="h-6 w-6" />,
    },
    {
      title: "Espacios LUMINUS",
      description: "Próximamente podrás acceder a Espacios LUMINUS, lugares diseñados para que expertos compartan contenido relevante, recursos, conversaciones e invitaciones a eventos exclusivos.",
      ctaText: "Ver espacios",
      ctaLink: "#",
      isComingSoon: true,
      icon: <Compass className="h-6 w-6" />,
    },
  ];

  const row2Features = [
    {
      title: "Mapa LUMINUS",
      description: "Próximamente podrás explorar el mapa de LUMINUS para descubrir personas, clínicas y consultorios de nuestra red en tu ciudad y en LATAM. Una forma de estar más cerca de quienes comparten intereses, búsquedas y propósito.",
      ctaText: "Explorar mapa",
      ctaLink: "#",
      isComingSoon: true,
      icon: <MapPin className="h-6 w-6" />,
    },
    {
      title: "Faro LUMINUS",
      description: "Próximamente llegará Faro, tu asistente impulsado por IA, creado para acompañarte en tu proceso, ayudarte a atravesar desafíos con mayor claridad y acercarte a una vida con más equilibrio, bienestar y dirección.",
      ctaText: "Conocer Faro",
      ctaLink: "#",
      isComingSoon: true,
      icon: <Sparkles className="h-6 w-6" />,
    },
  ];

  return (
    <section id="para-expertos" className="py-24 bg-luminus-bg">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-luminus-text sm:text-5xl mb-4">
            Todo lo que necesitas para avanzar con más claridad
          </h2>
          <p className="text-lg leading-relaxed text-luminus-secondary">
            LUMINUS reúne comunidad, expertos, espacios de aprendizaje y herramientas digitales para que puedas explorar, conectar y encontrar acompañamiento de forma más consciente.
          </p>
        </div>

        {/* Features Grids */}
        <div className="space-y-8">
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {row1Features.map((feature, idx) => (
              <FeatureCard key={`r1-${idx}`} {...feature} />
            ))}
          </div>

          {/* Row 2: 2 cards centered on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:max-w-[70%] lg:mx-auto">
            {row2Features.map((feature, idx) => (
              <FeatureCard key={`r2-${idx}`} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
