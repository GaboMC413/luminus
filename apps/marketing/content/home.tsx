import React from "react";
import { Users, UserCheck, Compass, MapPin, Sparkles, Heart, ShieldCheck, Milestone } from "lucide-react";

export const homeContent = {
  hero: {
    badge: {
      text: "Red de Bienestar Humano",
      icon: <Sparkles />,
      variant: "lime" as const,
    },
    title: (
      <>
        Descubre una nueva forma de <span className="bg-gradient-to-r from-luminus-blue via-luminus-orange to-luminus-pink bg-clip-text text-transparent">conectar con tu bienestar</span>
      </>
    ),
    subtitle: "LUMINUS es una plataforma para explorar personas, especialistas, espacios, recursos y herramientas diseñadas para acompañarte en tu camino hacia una vida con más equilibrio, claridad y propósito.",
    primaryCta: {
      text: "Crear mi cuenta",
      link: "https://app.luminuslatam.com/auth/registrarse",
    },
    secondaryCta: {
      text: "Ver qué puedo hacer en LUMINUS",
      link: "/especialistas",
    },
    microcopy: (
      <>
        Comienza con <span className="text-black font-bold decoration-luminus-orange decoration-2 underline">3 meses de acceso sin costo</span>. No se solicitarán datos de pago.
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
    badge: "Explora la Red",
    title: "Todo lo que necesitas para avanzar con más claridad",
    subtitle: "LUMINUS reúne comunidad, especialistas, espacios de aprendizaje y herramientas digitales para que puedas explorar, conectar y encontrar acompañamiento de forma más consciente.",
    items: [
      {
        title: "Comunidad LUMINUS",
        description: "Explora integrantes de la red, conoce sus perfiles, descubre intereses en común y conecta con personas que también están construyendo una vida con más bienestar, propósito y equilibrio.",
        ctaText: "Explorar comunidad",
        ctaLink: "https://app.luminuslatam.com/auth/registrarse",
        isComingSoon: false,
        icon: <Users />,
        accentBgClass: "bg-luminus-blue text-white",
      },
      {
        title: "Especialistas",
        description: "Próximamente podrás descubrir especialistas de distintas áreas del bienestar, conocer su enfoque, conectar con las personas indicadas, agendar sesiones y acceder a cursos, recursos y contenidos compartidos con la comunidad.",
        ctaText: "Descubrir especialistas",
        ctaLink: "#",
        isComingSoon: true,
        icon: <UserCheck />,
        accentBgClass: "bg-luminus-lime text-black",
      },
      {
        title: "Espacios LUMINUS",
        description: "Próximamente podrás acceder a Espacios LUMINUS, lugares diseñados para que los especialistas compartan contenido relevante, recursos, conversaciones e invitaciones a eventos exclusivos.",
        ctaText: "Ver espacios",
        ctaLink: "#",
        isComingSoon: true,
        icon: <Compass />,
        accentBgClass: "bg-luminus-orange text-white",
      },
      {
        title: "Mapa LUMINUS",
        description: "Próximamente podrás explorar el mapa de LUMINUS para descubrir personas, clínicas y consultorios de nuestra red en tu ciudad y en LATAM. Una forma de estar más cerca de quienes comparten intereses, búsquedas y propósito.",
        ctaText: "Explorar mapa",
        ctaLink: "#",
        isComingSoon: true,
        icon: <MapPin />,
        accentBgClass: "bg-luminus-pink text-black",
      },
      {
        title: "Faro LUMINUS",
        description: "Próximamente llegará Faro, tu asistente impulsado por IA, creado para acompañarte en tu proceso, ayudarte a atravesar desafíos con mayor claridad y acercarte a una vida con más equilibrio, bienestar y dirección.",
        ctaText: "Conocer Faro",
        ctaLink: "#",
        isComingSoon: true,
        icon: <Sparkles />,
        accentBgClass: "bg-black text-white",
      },
    ],
  },
  benefits: {
    tagline: "Valor Emocional",
    title: "Una red para no transitar tu proceso en soledad",
    subtitle: "El bienestar no sucede de forma aislada. En LUMINUS puedes encontrar personas, contenidos, especialistas y espacios que te ayuden a tomar mejores decisiones, descubrir nuevas perspectivas y sostener tu proceso personal con mayor claridad.",
    items: [
      {
        title: "Conexiones significativas",
        description: "Conece personas con intereses, búsquedas y experiencias afines.",
        icon: <Heart />,
        cardClass: "bg-luminus-pink/10 shadow-bold-pink",
        iconBg: "bg-luminus-pink text-black",
      },
      {
        title: "Acompañamiento confiable",
        description: "Descubre especialistas, recursos y espacios pensados para guiarte mejor.",
        icon: <ShieldCheck />,
        cardClass: "bg-luminus-orange/10 shadow-bold-orange",
        iconBg: "bg-luminus-orange text-white",
      },
      {
        title: "Bienestar con dirección",
        description: "Encuentra herramientas para ordenar tu proceso y avanzar con más equilibrio.",
        icon: <Milestone />,
        cardClass: "bg-luminus-blue/5 shadow-bold-blue",
        iconBg: "bg-luminus-blue text-white",
      },
    ],
  },
  finalCta: {
    icon: <Sparkles />,
    title: "Empieza a construir tu camino dentro de LUMINUS",
    subtitle: "Crea tu cuenta, explora la red y descubre nuevas formas de conectar con tu bienestar.",
    ctaText: "Crear mi cuenta",
    ctaLink: "https://app.luminuslatam.com/auth/registrarse",
    microcopy: "3 meses de acceso sin costo. Sin pago inicial.",
    bgGlow: "from-luminus-pink/5 via-luminus-orange/5",
    cardBg: "bg-luminus-pink/15",
    iconColor: "text-luminus-pink",
  },
  pricing: {
    badge: "Planes LUMINUS",
    title: "Selecciona tu plan",
    subtitle: "Comienza hoy con 3 meses de acceso sin costo.",
    plans: [
      {
        name: "Plan Mensual",
        price: "USD 5",
        billing: "/ mes",
        trialBadge: "Primeros 3 meses gratis",
        description: "Una opción flexible para continuar con acceso completo a LUMINUS mes a mes.",
        ctaText: "Seleccionar plan mensual",
        ctaLink: "https://app.luminuslatam.com/auth/registrarse?plan=monthly",
        disclaimer: "No se solicitará ningún pago hasta que finalicen tus 3 meses de acceso sin costo. Antes de que termine este período, te informaremos para que puedas decidir si deseas continuar con este plan.",
        isPopular: false,
        inclusions: [
          "Acceso completo a la Comunidad",
          "Próximamente: Asistente Faro con IA",
          "Próximamente: Directorio de Especialistas",
          "Próximamente: Espacios de Aprendizaje",
          "Próximamente: Mapa de bienestar Latam",
        ],
      },
      {
        name: "Plan Anual",
        price: "USD 45",
        billing: "/ año",
        trialBadge: "Primeros 3 meses gratis",
        discountBadge: "25% OFF · Ahorras USD 15",
        description: "La mejor alternativa para quienes buscan continuidad y un mejor valor anual.",
        ctaText: "Seleccionar plan anual",
        ctaLink: "https://app.luminuslatam.com/auth/registrarse?plan=annual",
        disclaimer: "No se solicitará ningún pago hasta que finalicen tus 3 meses de acceso sin costo. Antes de que termine este período, te informaremos para que puedas decidir si deseas continuar con este plan.",
        isPopular: true,
        inclusions: [
          "Acceso completo a la Comunidad",
          "Próximamente: Asistente Faro con IA",
          "Próximamente: Directorio de Especialistas",
          "Próximamente: Espacios de Aprendizaje",
          "Próximamente: Mapa de bienestar Latam",
        ],
      },
    ],
  },
  trust: {
    title: "Empieza sin compromiso",
    description: "Durante los primeros 3 meses podrás explorar LUMINUS sin costo. No se solicitará ningún pago al registrarte y te avisaremos antes de que finalice el período de acceso sin costo para que puedas decidir si deseas continuar.",
    assurances: [
      "No se solicitan datos de pago al crear tu cuenta.",
      "Acceso sin costo durante los primeros 3 meses.",
      "Podrás elegir si continuar o no antes de que termine el período gratuito.",
    ],
  },
};
