import React from "react";
import { User, HeartHandshake, Calendar, BookOpen, Compass, MapPin } from "lucide-react";
import ExpertFeatureCard from "./ExpertFeatureCard";

export default function ExpertFeaturesSection() {
  const tools = [
    {
      title: "Perfil profesional",
      description: "Podrás presentar quién eres, tu especialidad, tu enfoque, tus áreas de trabajo y la forma en que acompañas a las personas.",
      ctaText: "Crear mi perfil",
      ctaLink: "https://app.luminuslatam.com/signup",
      isComingSoon: false,
      icon: <User className="h-6 w-6" />,
      accentBgClass: "bg-luminus-blue text-white",
    },
    {
      title: "Conexión con personas",
      description: "Las personas podrán conocer tu perfil, explorar tu propuesta y contactarte cuando sientan que tu enfoque puede acompañar su camino.",
      ctaText: "Conectar con personas",
      ctaLink: "https://app.luminuslatam.com/signup",
      isComingSoon: false,
      icon: <HeartHandshake className="h-6 w-6" />,
      accentBgClass: "bg-luminus-orange text-black",
    },
    {
      title: "Sesiones y servicios",
      description: "Próximamente podrás compartir tus servicios, facilitar el acceso a sesiones y organizar mejor la forma en que las personas se acercan a tu trabajo.",
      ctaText: "Mostrar servicios",
      ctaLink: "#",
      isComingSoon: true,
      icon: <Calendar className="h-6 w-6" />,
      accentBgClass: "bg-luminus-lime text-black",
    },
    {
      title: "Cursos y recursos",
      description: "Podrás compartir conocimiento a través de contenidos, recursos, cursos y materiales que ayuden a la comunidad a aprender, reflexionar y avanzar.",
      ctaText: "Compartir recursos",
      ctaLink: "https://app.luminuslatam.com/signup",
      isComingSoon: false,
      icon: <BookOpen className="h-6 w-6" />,
      accentBgClass: "bg-luminus-pink text-black",
    },
    {
      title: "Espacios LUMINUS",
      description: "Próximamente podrás participar en Espacios LUMINUS, lugares diseñados para compartir contenido relevante, abrir conversaciones e invitar a eventos exclusivos.",
      ctaText: "Crear un espacio",
      ctaLink: "#",
      isComingSoon: true,
      icon: <Compass className="h-6 w-6" />,
      accentBgClass: "bg-luminus-blue text-white",
    },
    {
      title: "Mapa LUMINUS",
      description: "Próximamente podrás formar parte del Mapa LUMINUS para que las personas descubran expertos, clínicas y consultorios de bienestar en su ciudad y en LATAM.",
      ctaText: "Aparecer en el mapa",
      ctaLink: "#",
      isComingSoon: true,
      icon: <MapPin className="h-6 w-6" />,
      accentBgClass: "bg-luminus-orange text-black",
    },
  ];

  return (
    <section id="funciones-expertos" className="py-24 bg-white border-b-2 border-black relative overflow-hidden">
      {/* Soft background accents */}
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-luminus-lime/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-luminus-pink/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-display text-4xl font-black tracking-tight text-black sm:text-5xl mb-4">
            Funciones pensadas para expertos del bienestar
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 font-bold">
            LUMINUS ofrecerá herramientas exclusivas para que los profesionales puedan mostrarse, conectar, compartir contenido y ofrecer experiencias a la comunidad.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, idx) => (
            <ExpertFeatureCard key={idx} {...tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
