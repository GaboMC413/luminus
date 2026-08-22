import React from "react";
import { Users, UserCheck, Compass, MapPin, Sparkles, Heart, ShieldCheck, Milestone } from "lucide-react";

export const homeContent = {
  hero: {
    badge: {
      text: "Red de bienestar humano",
      icon: <Sparkles />,
      variant: "lime" as const,
    },
    title: (
      <>
        Una nueva forma de <span className="bg-gradient-to-r from-luminus-blue via-luminus-orange to-luminus-pink bg-clip-text text-transparent">acercarte a tu bienestar</span>
      </>
    ),
    subtitle: "LUMINUS reúne comunidad, especialistas, contenidos, espacios y herramientas digitales para ayudarte a explorar tu bienestar con más claridad, conexión y acompañamiento.",
    primaryCta: {
      text: "Crear mi cuenta",
      link: "https://app.luminuslatam.com/auth/registrarse",
    },
    secondaryCta: {
      text: "Explorar la propuesta",
      link: "/sobre-nosotros",
    },
    microcopy: (
      <>
        Empieza con <span className="text-black font-bold decoration-luminus-orange decoration-2 underline">3 meses de acceso sin costo</span>. No se solicitan datos de pago al registrarte.
      </>
    ),
    image: {
      src: "/hero-illustration.png",
      alt: "LUMINUS Wellness & Connection Network",
    },
    bgGlow: "from-luminus-pink/10 via-luminus-lime/10",
    imageBg: "shadow-bold-pink",
  },
  features: {
    badge: "Explora la red",
    title: "Todo lo que necesitas para avanzar con más claridad",
    subtitle: "Para avanzar con tranquilidad y dirección, LUMINUS reúne en un mismo lugar personas, especialistas, contenidos y herramientas que puedan acompañarte.",
    items: [
      {
        title: "Comunidad LUMINUS",
        description: "Conecta con personas que comparten búsquedas similares. Explora perfiles, descubre intereses en común y conecta con personas que también están construyendo una vida con más bienestar, equilibrio y sentido.",
        ctaText: "Explorar comunidad",
        ctaLink: "https://app.luminuslatam.com/auth/registrarse",
        isComingSoon: false,
        icon: <Users />,
        accentBgClass: "bg-luminus-blue text-white",
      },
      {
        title: "Especialistas",
        description: "Descubre profesionales del bienestar. Conoce especialistas de distintas áreas, explora sus enfoques y encuentra nuevas formas de acompañamiento, orientación y aprendizaje.",
        ctaText: "Descubrir especialistas",
        ctaLink: "/especialistas",
        isComingSoon: false,
        icon: <UserCheck />,
        accentBgClass: "bg-luminus-lime text-black",
      },
      {
        title: "Espacios LUMINUS",
        description: "Accede a espacios de aprendizaje y conexión. Próximamente podrás participar en espacios creados para compartir contenidos, recursos, conversaciones, experiencias e invitaciones vinculadas al bienestar.",
        ctaText: "Ver espacios",
        ctaLink: "#",
        isComingSoon: true,
        icon: <Compass />,
        accentBgClass: "bg-luminus-orange text-white",
      },
      {
        title: "Mapa LUMINUS",
        description: "Encuentra bienestar cerca de ti. Próximamente podrás explorar personas, especialistas, clínicas, consultorios y espacios de bienestar en distintas ciudades de América Latina.",
        ctaText: "Explorar mapa",
        ctaLink: "#",
        isComingSoon: true,
        icon: <MapPin />,
        accentBgClass: "bg-luminus-pink text-black",
      },
      {
        title: "Faro LUMINUS",
        description: "Ordena ideas y encuentra claridad. Próximamente, Faro será un asistente impulsado por IA para ayudarte a reflexionar, organizar pensamientos y avanzar con más claridad en tu proceso personal.",
        ctaText: "Conocer Faro",
        ctaLink: "#",
        isComingSoon: true,
        icon: <Sparkles />,
        accentBgClass: "bg-black text-white",
      },
    ],
  },
  benefits: {
    tagline: "Una red para acompañarte",
    title: "El bienestar se vuelve más claro cuando lo transitas con acompañamiento",
    subtitle: "Buscar bienestar no siempre significa saber exactamente qué necesitas. A veces empieza con una conversación, una pregunta, una recomendación, una práctica o el encuentro con alguien que puede ayudarte a mirar tu proceso desde otro lugar.\n\nLUMINUS fue creado para reunir esas posibilidades en una red más humana, accesible y conectada.",
    items: [
      {
        title: "Más conexión",
        description: "Conoce personas con intereses, experiencias y búsquedas afines.",
        icon: <Heart />,
        cardClass: "bg-luminus-pink/10 shadow-bold-pink",
        iconBg: "bg-luminus-pink text-black",
      },
      {
        title: "Más orientación",
        description: "Descubre especialistas, recursos y espacios que pueden ayudarte a avanzar mejor.",
        icon: <ShieldCheck />,
        cardClass: "bg-luminus-orange/10 shadow-bold-orange",
        iconBg: "bg-luminus-orange text-white",
      },
      {
        title: "Más claridad",
        description: "Encuentra herramientas para ordenar tu proceso y tomar decisiones con mayor conciencia.",
        icon: <Milestone />,
        cardClass: "bg-luminus-blue/5 shadow-bold-blue",
        iconBg: "bg-luminus-blue text-white",
      },
    ],
  },
  finalCta: {
    icon: <Sparkles />,
    title: "Da el primer paso dentro de una red creada para acompañar tu bienestar",
    subtitle: "Crea tu cuenta, explora la comunidad y comienza a descubrir nuevas formas de conectar con personas, especialistas, contenidos y herramientas para vivir con más claridad.",
    ctaText: "Crear mi cuenta",
    ctaLink: "https://app.luminuslatam.com/auth/registrarse",
    secondaryCtaText: "Explorar la propuesta",
    secondaryCtaLink: "/sobre-nosotros",
    microcopy: "3 meses de acceso sin costo. Sin pago inicial.",
    bgGlow: "from-luminus-pink/5 via-luminus-orange/5",
    cardBg: "bg-luminus-pink/15",
    iconColor: "text-luminus-pink",
  },
  pricing: {
    badge: "Planes",
    title: "Elige cómo quieres comenzar",
    subtitle: "Puedes crear tu cuenta y explorar LUMINUS durante 3 meses sin costo. No se solicitan datos de pago al registrarte.",
    plans: [
      {
        name: "Mensual",
        price: "USD 5",
        billing: "/ mes",
        trialBadge: "Primeros 3 meses sin costo",
        description: "Una opción flexible para acceder a la red mes a mes y explorar las funcionalidades disponibles.",
        ctaText: "Seleccionar plan mensual",
        ctaLink: "https://app.luminuslatam.com/auth/registrarse?plan=monthly",
        disclaimer: "No se solicitará ningún pago al registrarte. Te avisaremos antes de que finalice el período sin costo.",
        isPopular: false,
        inclusions: [
          "Acceso a la comunidad.",
          "Exploración de perfiles e intereses.",
          "Acceso a contenidos y novedades.",
          "Próximamente: especialistas.",
          "Próximamente: espacios.",
          "Próximamente: mapa.",
          "Próximamente: Faro, asistente con IA.",
        ],
      },
      {
        name: "Anual",
        price: "USD 45",
        billing: "/ año",
        trialBadge: "Mejor valor",
        discountBadge: "Ahorras frente al pago mensual",
        description: "La alternativa más conveniente para quienes quieren formar parte de LUMINUS durante todo el año.",
        ctaText: "Seleccionar plan anual",
        ctaLink: "https://app.luminuslatam.com/auth/registrarse?plan=annual",
        disclaimer: "También comienza con 3 meses sin costo. No se solicitan datos de pago al crear tu cuenta.",
        isPopular: true,
        inclusions: [
          "Acceso a la comunidad.",
          "Exploración de perfiles e intereses.",
          "Acceso a contenidos y novedades.",
          "Próximamente: especialistas.",
          "Próximamente: espacios.",
          "Próximamente: mapa.",
          "Próximamente: Faro, asistente con IA.",
          "Ahorro frente al pago mensual.",
        ],
      },
    ],
  },
  trust: {
    title: "Empieza sin compromiso",
    description: "Durante los primeros 3 meses podrás explorar LUMINUS sin costo. No se solicitan datos de pago al registrarte y te avisaremos antes de que finalice este período para que puedas decidir si deseas continuar.",
    assurances: [
      "3 meses de acceso sin costo.",
      "Sin datos de pago al registrarte.",
      "Aviso previo antes de finalizar el período gratuito.",
      "Libertad para decidir si quieres continuar.",
    ],
  },
};
