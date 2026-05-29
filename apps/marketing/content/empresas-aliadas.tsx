import React from "react";
import { Building, Users, Target, Shield, HeartHandshake, Award, FileText, Sparkles, HelpCircle, Briefcase, Handshake } from "lucide-react";

export const empresasAliadasContent = {
  hero: {
    badge: {
      text: "Etapa Aliada & Fundacional",
      icon: <Sparkles />,
      variant: "orange" as const,
    },
    title: (
      <>
        Empresas Aliadas de{" "}
        <span className="text-luminus-blue">
          LUMINUS
        </span>
      </>
    ),
    subtitle: "Ayúdanos a construir una de las redes de bienestar y desarrollo humano más importantes de América Latina.",
    primaryCta: {
      text: "Quiero conocer más",
      link: "#construyendo-plataforma",
    },
    secondaryCta: {
      text: "Formas de participar",
      link: "#formas-participar",
    },
    microcopy: (
      <>
        * Buscamos organizaciones con propósito que quieran formar parte de esta etapa inicial y de co-creación.
      </>
    ),
    image: {
      src: "/hero-illustration.png",
      alt: "LUMINUS Living Network for Corporate Wellness",
    },
    bgGlow: "from-luminus-orange/5 via-luminus-lime/5",
    imageBg: "shadow-bold-lg transition-transform duration-300 hover:-rotate-1",
    borderBottom: true,
  },

  vision: {
    badge: "Visión LUMINUS",
    title: "Estamos construyendo mucho más que una plataforma",
    subtitle: "Imaginamos un futuro donde cualquier persona pueda descubrir y acceder fácilmente a lo que necesita para su bienestar.",
    items: [
      {
        title: "Especialistas",
        description: "Especialistas de distintas disciplinas validados y al alcance de todos.",
        icon: <Users className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
      {
        title: "Espacios",
        description: "Espacios dedicados al bienestar, la meditación y el equilibrio diario.",
        icon: <Building className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime",
      },
      {
        title: "Experiencias",
        description: "Actividades y experiencias transformadoras presenciales y virtuales.",
        icon: <Sparkles className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-pink",
      },
      {
        title: "Herramientas",
        description: "Contenido, guías y herramientas interactivas para crecer a diario.",
        icon: <Target className="h-6 w-6 text-white" />,
        accentBgClass: "bg-luminus-blue",
      },
      {
        title: "Comunidad",
        description: "Personas con intereses y búsquedas similares que se apoyan mutuamente.",
        icon: <HeartHandshake className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
    ]
  },

  latamVision: {
    title: "Una visión para América Latina",
    description: "La región enfrenta desafíos cada vez más complejos relacionados con la salud mental, el estrés, la soledad, la incertidumbre y la falta de acceso a espacios de crecimiento personal.",
    highlight: "Creemos que existe una oportunidad única para construir una red que conecte a miles de personas con especialistas, recursos, espacios y experiencias que puedan mejorar su calidad de vida.",
    cardTitle: "Plataforma de Referencia",
    cardIcon: <Target className="h-6 w-6" />,
    bullets: [
      "Salud mental e integral como prioridad real.",
      "Reducción del aislamiento a través de conexiones genuinas.",
      "Fácil descubrimiento de profesionales calificados.",
      "Democratización de recursos de desarrollo humano.",
    ],
  },

  philosophy: {
    badge: "Propósito Compartido",
    title: "Empresas que creen en el futuro de LUMINUS",
    subtitle: "Las Empresas Aliadas son organizaciones que deciden acompañar esta visión desde sus primeras etapas.",
    items: [
      {
        title: "Impacto Duradero",
        description: "Se trata de apoyar la construcción de una iniciativa con potencial de generar un impacto positivo y real en la vida de miles de personas.",
        icon: <Target className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-lime",
        layout: "horizontal" as const,
      },
      {
        title: "Mucho más que Patrocinio",
        description: "No se trata de un patrocinio tradicional o publicidad vacía. Es una apuesta real en innovación social y bienestar integral.",
        icon: <Handshake className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-orange",
        layout: "horizontal" as const,
      },
      {
        title: "Reconocimiento Histórico",
        description: "Las organizaciones que formen parte de esta etapa serán reconocidas permanentemente como las primeras que apostaron por el proyecto.",
        icon: <Award className="h-5 w-5 text-white" />,
        accentBgClass: "bg-luminus-blue",
        layout: "horizontal" as const,
      },
    ]
  },

  supportValue: {
    title: "¿Qué representa su aporte?",
    description: "El apoyo de nuestras Empresas Aliadas contribuye directamente a acelerar el crecimiento de una red centrada en el bienestar y el desarrollo humano en América Latina.",
    items: [
      "Desarrollar nuevas funcionalidades y herramientas digitales en la plataforma.",
      "Incorporar especialistas, profesionales certificados y recursos de calidad para la comunidad.",
      "Crear contenido abierto, educativo y accesible para todos los sectores.",
      "Impulsar nuevas experiencias presenciales, talleres e iniciativas locales.",
      "Expandir el alcance geográfico de LUMINUS a lo largo de América Latina."
    ],
    highlight: "Cada aporte ayuda a transformar una visión ambiciosa en una realidad tangible de impacto."
  },

  perks: {
    tagline: "Beneficios de Participación",
    title: "Reconocimiento y participación corporativa",
    subtitle: "Las organizaciones que se unen a la red de Empresas Aliadas reciben beneficios exclusivos diseñados para visibilizar su compromiso con el bienestar:",
    items: [
      {
        title: "Presencia institucional",
        description: "Logo y perfil corporativo destacados dentro de la página de Empresas Aliadas de LUMINUS.",
        icon: <Building className="h-6 w-6 text-black" />,
        cardClass: "bg-luminus-pink/15 hover:bg-luminus-pink/20 shadow-bold-pink",
        iconBg: "bg-luminus-pink",
      },
      {
        title: "Reconocimiento histórico",
        description: "Participación permanente como organización aliada y fundadora de la red LUMINUS.",
        icon: <Award className="h-6 w-6 text-black" />,
        cardClass: "bg-luminus-orange/15 hover:bg-luminus-orange/20 shadow-bold-orange",
        iconBg: "bg-luminus-orange",
      },
      {
        title: "Sello digital",
        description: "Distintivo oficial 'Empresa Aliada LUMINUS' para uso institucional, ESG y employer branding.",
        icon: <Shield className="h-6 w-6 text-black" />,
        cardClass: "bg-luminus-lime/15 hover:bg-luminus-lime/20 shadow-bold-lime",
        iconBg: "bg-luminus-lime",
      },
      {
        title: "Reporte anual",
        description: "Acceso exclusivo al Reporte Anual de Impacto con hitos, métricas de crecimiento y valor generado.",
        icon: <FileText className="h-6 w-6 text-white" />,
        cardClass: "bg-luminus-blue/15 hover:bg-luminus-blue/20 shadow-bold-blue",
        iconBg: "bg-luminus-blue text-white",
      },
      {
        title: "Consejo de Aliados",
        description: "Conversación anual con el equipo directivo de LUMINUS para compartir aprendizajes y sinergias.",
        icon: <Users className="h-6 w-6 text-black" />,
        cardClass: "bg-luminus-orange/15 hover:bg-luminus-orange/20 shadow-bold-orange",
        iconBg: "bg-luminus-orange",
      }
    ]
  },

  transparency: {
    title: "Independencia y transparencia",
    description: "La confianza de nuestra comunidad es nuestro activo más importante. Por esa razón, el apoyo de una organización no implica influencia sobre nuestros contenidos, especialistas, recomendaciones, decisiones estratégicas o información privada de los usuarios.",
    highlight: "LUMINUS mantiene su independencia para proteger la integridad del proyecto y la confianza de las personas que forman parte de la red."
  },

  plans: {
    badge: "Planes de Aporte",
    title: "Formas de participar",
    subtitle: "Elige el nivel de acompañamiento que mejor se alinee con el propósito y escala de tu organización.",
    items: [
      {
        name: "Colaboradora",
        price: "USD 5.000",
        billing: "/ año",
        trialBadge: "Socio Inicial",
        description: "Para organizaciones que desean acompañar el crecimiento de LUMINUS y formar parte de la red inicial de aliados institucionales.",
        ctaText: "Solicitar conversación",
        ctaLink: "/contacto?subject=Empresa Aliada (Nivel Colaboradora)",
        disclaimer: "Facturación anual. Incluye sello oficial y presencia en la página de aliados.",
        isPopular: false,
        inclusions: [
          "Logo en página de aliados de LUMINUS",
          "Distintivo digital 'Empresa Aliada LUMINUS'",
          "Acceso al Reporte Anual de Impacto",
          "Suscripción digital básica para tu equipo directivo",
        ],
      },
      {
        name: "Patrocinadora",
        price: "USD 10.000",
        billing: "/ año",
        trialBadge: "Pilar Clave",
        description: "Para organizaciones que quieren ser reconocidas como parte del grupo fundador que acompañó la construcción de LUMINUS desde sus etapas tempranas.",
        ctaText: "Solicitar conversación",
        ctaLink: "/contacto?subject=Empresa Aliada (Nivel Patrocinadora)",
        disclaimer: "Facturación anual. Incluye reconocimiento histórico y participación en el Consejo.",
        isPopular: true,
        inclusions: [
          "Presencia destacada y perfil corporativo",
          "Reconocimiento histórico permanente",
          "Sello 'Empresa Aliada LUMINUS' destacado",
          "Acceso preferente al Reporte de Impacto",
          "Invitación al Consejo de Aliados anual",
          "Beneficios corporativos de bienestar de primer nivel",
        ],
      },
      {
        name: "Visionaria",
        price: "USD 25.000+",
        billing: "/ año",
        trialBadge: "Impacto Extraordinario",
        description: "Para organizaciones que desean realizar una contribución extraordinaria para acelerar la expansión y escalabilidad de LUMINUS en LATAM.",
        ctaText: "Solicitar conversación",
        ctaLink: "/contacto?subject=Empresa Aliada (Nivel Visionaria)",
        disclaimer: "Aporte extraordinario. Co-diseño de iniciativas de sostenibilidad y ESG personalizadas.",
        isPopular: false,
        inclusions: [
          "Todo lo incluido en el nivel Fundadora",
          "Presencia premium en eventos oficiales LUMINUS",
          "Co-creación de iniciativas ESG a medida",
          "Acceso prioritario a analíticas agregadas de bienestar regional",
          "Talleres de bienestar in-company dictados por especialistas LUMINUS",
        ],
      },
    ]
  },

  finalCta: {
    icon: <Sparkles />,
    title: "Construyamos algo que trascienda",
    subtitle: "Las grandes iniciativas no se construyen en soledad. Se construyen gracias a personas y organizaciones que deciden apostar por una visión antes de que se convierta en realidad.",
    ctaText: "Quiero hablar con el equipo",
    ctaLink: "/contacto?subject=Conversar sobre Empresas Aliadas",
    microcopy: "Si tu organización comparte nuestra visión de una América Latina más conectada, consciente y orientada al bienestar, nos encantaría conversar.",
    bgGlow: "from-luminus-orange/5 via-luminus-lime/5",
    cardBg: "bg-luminus-lime/15",
    iconColor: "text-luminus-lime",
  }
};
