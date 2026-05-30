import React from "react";
import { Building, Users, Target, Shield, HeartHandshake, Award, FileText, Sparkles, HelpCircle, Briefcase, Handshake } from "lucide-react";

export const empresasAliadasContent = {
  hero: {
    badge: {
      text: "Para organizaciones con propósito",
      icon: <Sparkles />,
      variant: "orange" as const,
    },
    title: (
      <>
        Empresas que acompañan una <span className="text-luminus-blue">nueva red de bienestar</span> en América Latina
      </>
    ),
    subtitle: "LUMINUS invita a organizaciones, marcas e instituciones a acompañar el desarrollo de una red de bienestar humano con alcance regional.\n\nUna oportunidad para apoyar una iniciativa en crecimiento, orientada a conectar personas, especialistas, contenidos y experiencias que promueven una vida más consciente, saludable y conectada.",
    primaryCta: {
      text: "Quiero conocer más",
      link: "#construyendo-plataforma",
    },
    secondaryCta: {
      text: "Ver formas de participar",
      link: "#formas-participar",
    },
    microcopy: "Buscamos empresas que quieran apoyar el bienestar desde un lugar serio, transparente y con visión de largo plazo.",
    image: {
      src: "/hero-illustration.png",
      alt: "LUMINUS Living Network for Corporate Wellness",
    },
    bgGlow: "from-luminus-orange/5 via-luminus-lime/5",
    imageBg: "shadow-bold-lg transition-transform duration-300 hover:-rotate-1",
    borderBottom: true,
  },

  vision: {
    badge: "Nuestra visión",
    title: "Estamos construyendo mucho más que una plataforma",
    subtitle: "LUMINUS nace para reunir comunidad, especialistas, espacios, contenidos y herramientas digitales en una red de bienestar accesible para América Latina.",
    items: [
      {
        title: "Comunidad",
        description: "Personas que comparten intereses, experiencias y búsquedas vinculadas al bienestar.",
        icon: <Users className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
      {
        title: "Especialistas",
        description: "Profesionales de distintas áreas que pueden acompañar procesos de desarrollo, salud y equilibrio personal.",
        icon: <Building className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime",
      },
      {
        title: "Contenidos",
        description: "Charlas, entrevistas, recursos y materiales para acercar conocimiento de calidad.",
        icon: <FileText className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-pink",
      },
      {
        title: "Experiencias",
        description: "Eventos, talleres y encuentros para aprender, conectar y participar.",
        icon: <Sparkles className="h-6 w-6 text-white" />,
        accentBgClass: "bg-luminus-blue",
      },
      {
        title: "Tecnología",
        description: "Herramientas digitales pensadas para ordenar, facilitar y ampliar el acceso al bienestar.",
        icon: <Target className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
    ]
  },

  latamVision: {
    title: "El bienestar necesita nuevas formas de acceso",
    description: "Cada vez más personas buscan orientación, espacios de conexión y herramientas para cuidar su bienestar, y en LUMINUS las acompañamos para avanzar en un camino integrado y confiable.",
    highlight: "LUMINUS busca ordenar ese ecosistema y hacerlo más accesible, humano y confiable.",
    cardTitle: "Por qué importa",
    cardIcon: <Target className="h-6 w-6" />,
    bullets: [
      "Más claridad: Ayudar a las personas a descubrir opciones, recursos y caminos posibles.",
      "Más conexión: Crear puentes entre personas, especialistas, contenidos y experiencias.",
      "Más acceso: Acercar propuestas de bienestar a comunidades de toda la región.",
    ],
  },

  philosophy: {
    badge: "Propósito compartido",
    title: "Empresas que creen en el futuro de LUMINUS",
    subtitle: "Las Empresas Aliadas acompañan esta etapa inicial de construcción y ayudan a que la red pueda crecer con más fuerza, alcance e impacto.",
    items: [
      {
        title: "Aporte con sentido",
        description: "El apoyo contribuye al desarrollo de una iniciativa independiente orientada al bienestar humano.",
        icon: <Target className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-lime",
        layout: "horizontal" as const,
      },
      {
        title: "Presencia institucional",
        description: "La empresa se vincula con una propuesta regional, seria y alineada con salud, comunidad y desarrollo personal.",
        icon: <Building className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-orange",
        layout: "horizontal" as const,
      },
      {
        title: "Reconocimiento temprano",
        description: "Las organizaciones aliadas serán parte de la primera etapa de crecimiento de LUMINUS.",
        icon: <Award className="h-5 w-5 text-white" />,
        accentBgClass: "bg-luminus-blue",
        layout: "horizontal" as const,
      },
      {
        title: "Impacto regional",
        description: "Cada aporte ayuda a expandir contenidos, herramientas, especialistas y experiencias en América Latina.",
        icon: <Sparkles className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-lime",
        layout: "horizontal" as const,
      },
    ]
  },

  supportValue: {
    title: "Qué ayuda a construir cada aporte",
    description: "El apoyo de las Empresas Aliadas permite acelerar el desarrollo de LUMINUS y fortalecer su impacto en la región.",
    items: [
      "Desarrollo de nuevas funcionalidades digitales.",
      "Producción de contenidos educativos.",
      "Integración de especialistas y recursos de calidad.",
      "Organización de eventos, talleres y experiencias.",
      "Expansión de la red en distintas ciudades de América Latina.",
      "Construcción de herramientas para facilitar el acceso al bienestar."
    ],
    highlight: "El apoyo de las Empresas Aliadas permite acelerar el desarrollo de LUMINUS y fortalecer su impacto en la región."
  },

  perks: {
    tagline: "Reconocimiento",
    title: "Cómo reconocemos a las Empresas Aliadas",
    subtitle: "Las organizaciones que se suman reciben visibilidad institucional y reconocimiento por acompañar la construcción de LUMINUS desde sus primeras etapas.",
    items: [
      {
        title: "Presencia en la web",
        description: "Logo y descripción institucional dentro de la página de Empresas Aliadas.",
        icon: <Building className="h-6 w-6 text-black" />,
        cardClass: "bg-luminus-pink/15 hover:bg-luminus-pink/20 shadow-bold-pink",
        iconBg: "bg-luminus-pink",
      },
      {
        title: "Sello digital",
        description: "Distintivo oficial para comunicar el apoyo a LUMINUS en canales propios.",
        icon: <Shield className="h-6 w-6 text-black" />,
        cardClass: "bg-luminus-lime/15 hover:bg-luminus-lime/20 shadow-bold-lime",
        iconBg: "bg-luminus-lime",
      },
      {
        title: "Reporte de impacto",
        description: "Acceso a un resumen anual con avances, hitos y crecimiento de la red.",
        icon: <FileText className="h-6 w-6 text-white" />,
        cardClass: "bg-luminus-blue/15 hover:bg-luminus-blue/20 shadow-bold-blue",
        iconBg: "bg-luminus-blue text-white",
      },
      {
        title: "Participación estratégica",
        description: "Espacios de conversación con el equipo para compartir aprendizajes, oportunidades y posibles sinergias.",
        icon: <Users className="h-6 w-6 text-black" />,
        cardClass: "bg-luminus-orange/15 hover:bg-luminus-orange/20 shadow-bold-orange",
        iconBg: "bg-luminus-orange",
      }
    ]
  },

  transparency: {
    title: "Independencia para proteger la confianza",
    description: "El apoyo de una empresa no implica influencia sobre contenidos, especialistas, recomendaciones, decisiones editoriales ni información privada de las personas usuarias.",
    highlight: "La confianza de la red es un activo central. Por eso, LUMINUS mantiene independencia en sus decisiones y criterios de funcionamiento."
  },

  forWhom: {
    badge: "Perfil de aliados",
    title: "Para empresas que quieren asociarse a una visión de bienestar",
    subtitle: "Esta propuesta está pensada para organizaciones que entienden el bienestar como parte de una agenda más amplia de impacto, cultura, salud, sostenibilidad y desarrollo humano.",
    items: [
      {
        title: "Empresas con propósito",
        description: "Marcas que quieren apoyar iniciativas alineadas con bienestar, comunidad e impacto social.",
        icon: <Target className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange"
      },
      {
        title: "Organizaciones de salud y bienestar",
        description: "Instituciones vinculadas a salud, educación, cuidado, desarrollo personal o calidad de vida.",
        icon: <HeartHandshake className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime"
      },
      {
        title: "Equipos de ESG y sostenibilidad",
        description: "Áreas que buscan acompañar proyectos con impacto humano y alcance regional.",
        icon: <Building className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-pink"
      },
      {
        title: "Marcas empleadoras",
        description: "Empresas que quieren asociar su identidad a bienestar, cultura y cuidado de las personas.",
        icon: <Users className="h-6 w-6 text-white" />,
        accentBgClass: "bg-luminus-blue"
      }
    ]
  },

  plans: {
    badge: "Planes de aporte",
    title: "Formas de participar",
    subtitle: "Cada organización puede elegir el nivel de acompañamiento que mejor se alinee con su propósito, escala y posibilidades.",
    items: [
      {
        name: "Colaboradora",
        price: "USD 5.000",
        billing: "/ año",
        trialBadge: "Socio inicial",
        description: "Para organizaciones que quieren acompañar el crecimiento inicial de LUMINUS y formar parte de la red de aliados institucionales.",
        ctaText: "Solicitar conversación",
        ctaLink: "/contacto?subject=Empresa Aliada (Nivel Colaboradora)",
        disclaimer: "Aporte anual. Incluye presencia institucional y sello digital.",
        isPopular: false,
        inclusions: [
          "Logo en la página de Empresas Aliadas.",
          "Distintivo digital oficial.",
          "Acceso al reporte anual de impacto.",
          "Mención institucional como organización aliada.",
          "Suscripción digital básica para el equipo directivo.",
        ],
      },
      {
        name: "Patrocinadora",
        price: "USD 10.000",
        billing: "/ año",
        trialBadge: "Pilar clave",
        description: "Para organizaciones que quieren ser reconocidas como parte del grupo fundador que acompañó la construcción de LUMINUS desde sus etapas tempranas.",
        ctaText: "Solicitar conversación",
        ctaLink: "/contacto?subject=Empresa Aliada (Nivel Patrocinadora)",
        disclaimer: "Aporte anual. Incluye mayor visibilidad y participación estratégica.",
        isPopular: true,
        inclusions: [
          "Presencia destacada en la página de aliados.",
          "Perfil corporativo ampliado.",
          "Participación en conversación anual con el equipo.",
          "Beneficios digitales de bienestar para el equipo directivo.",
          "Reconocimiento como empresa patrocinadora.",
        ],
      },
      {
        name: "Visionaria",
        price: "USD 25.000+",
        billing: "/ año",
        trialBadge: "Impacto extraordinario",
        description: "Para organizaciones que desean realizar una contribución significativa al crecimiento regional de LUMINUS.",
        ctaText: "Solicitar conversación",
        ctaLink: "/contacto?subject=Empresa Aliada (Nivel Visionaria)",
        disclaimer: "Aporte anual a medida. Pensado para organizaciones con una visión de impacto regional.",
        isPopular: false,
        inclusions: [
          "Todo lo incluido en Patrocinadora.",
          "Presencia premium en iniciativas oficiales.",
          "Co-creación de acciones de bienestar o impacto.",
          "Acceso prioritario a métricas agregadas de crecimiento.",
          "Talleres o experiencias de bienestar para equipos.",
          "Reconocimiento especial como empresa visionaria.",
        ],
      },
    ]
  },

  finalCta: {
    icon: <Sparkles />,
    title: "Sé parte de una red de bienestar en crecimiento",
    subtitle: "Las grandes iniciativas necesitan organizaciones que se animen a acompañar una visión desde sus primeras etapas.\n\nSi tu empresa comparte nuestra mirada sobre bienestar, comunidad e impacto humano, nos gustaría conversar.",
    ctaText: "Quiero hablar con el equipo",
    ctaLink: "/contacto?subject=Conversar sobre Empresas Aliadas",
    secondaryCtaText: "Ver planes de aporte",
    secondaryCtaLink: "#formas-participar",
    microcopy: "Todas las participaciones están sujetas a conversación previa y alineación entre ambas partes.",
    bgGlow: "from-luminus-orange/5 via-luminus-lime/5",
    cardBg: "bg-luminus-lime/15",
    iconColor: "text-luminus-lime",
  }
};
