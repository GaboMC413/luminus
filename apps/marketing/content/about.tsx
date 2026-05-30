import React from "react";
import { Users, UserCheck, Compass, MapPin, Sparkles, AlertTriangle, Eye, Heart, Link2, ShieldCheck, HeartHandshake, Milestone, Cpu, Globe } from "lucide-react";

export const aboutContent = {
  hero: {
    badge: {
      text: "Nuestra historia y propósito",
      icon: <Globe />,
      variant: "lime" as const,
    },
    title: (
      <>
        Una red para vivir el bienestar con más{" "}
        <span className="text-luminus-blue">
          claridad, conexión y sentido
        </span>
      </>
    ),
    subtitle: "LUMINUS nace para reunir personas, especialistas, contenidos, espacios y herramientas que ayuden a explorar el bienestar de forma más humana, accesible y conectada.\n\nEstamos construyendo una red para acompañar procesos personales, abrir nuevas posibilidades y acercar el bienestar a la vida cotidiana.",
    primaryCta: {
      text: "Crear mi cuenta",
      link: "https://app.luminuslatam.com/auth/registrarse",
    },
    secondaryCta: {
      text: "Conocer qué estamos construyendo",
      link: "#porque-existe",
    },
    microcopy: "Una plataforma en crecimiento para conectar bienestar, comunidad y tecnología humana.",
    image: {
      src: "/hero-illustration.png",
      alt: "LUMINUS Living Network of Wellness",
    },
    bgGlow: "from-luminus-lime/5 via-luminus-pink/5",
    imageBg: "shadow-bold-lg transition-transform duration-300 hover:-rotate-1",
    borderBottom: true,
  },
  problem: {
    title: "El bienestar se vuelve más potente cuando está mejor conectado",
    description: "Creemos que el bienestar no depende de una única práctica, disciplina o respuesta. Se construye a través de experiencias, vínculos, aprendizajes, hábitos, conversaciones y herramientas que acompañan a cada persona en distintos momentos de su vida.",
    highlight: "Por eso creamos LUMINUS: una red donde comunidad, especialistas, contenidos y tecnología se integran para abrir caminos más claros y accesibles.",
    cardTitle: "Lo que nos mueve",
    cardIcon: <Milestone className="h-6 w-6" />,
    bullets: [
      "LUMINUS busca crear una red donde cada persona pueda encontrar inspiración, orientación y recursos para vivir con más equilibrio, conciencia y sentido.",
      "No creemos en una única forma de bienestar. Creemos en un ecosistema amplio, diverso y conectado, donde cada persona pueda explorar su propio camino.",
    ],
  },
  response: {
    badge: "La red",
    title: "Una plataforma para descubrir, conectar y avanzar",
    subtitle: "LUMINUS reúne distintos elementos del ecosistema de bienestar en una experiencia simple, ordenada y humana.",
    items: [
      {
        title: "Comunidad",
        description: "Un espacio para descubrir personas, explorar intereses en común y conectar con quienes comparten búsquedas, experiencias y propósito.",
        isComingSoon: false,
        icon: <Users className="h-6 w-6 text-white" />,
        accentBgClass: "bg-luminus-blue",
      },
      {
        title: "Especialistas",
        description: "Una red de profesionales del bienestar para conocer enfoques, servicios, contenidos y formas de acompañamiento.",
        isComingSoon: true,
        icon: <UserCheck className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
      {
        title: "Espacios",
        description: "Entornos digitales para aprender, compartir recursos, participar en conversaciones y acceder a experiencias de grupo.",
        isComingSoon: true,
        icon: <Compass className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime",
      },
      {
        title: "Mapa",
        description: "Una forma de descubrir especialistas, clínicas, consultorios y espacios de bienestar en distintas ciudades de América Latina.",
        isComingSoon: true,
        icon: <MapPin className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-pink",
      },
      {
        title: "Faro",
        description: "Un asistente impulsado por IA pensado para ordenar ideas, acompañar reflexiones y ayudar a tomar decisiones con más claridad.",
        isComingSoon: true,
        icon: <Sparkles className="h-6 w-6 text-white" />,
        accentBgClass: "bg-luminus-blue",
      },
      {
        title: "Eventos",
        description: "Charlas, entrevistas, talleres y experiencias para acercar conocimiento, prácticas y conversaciones sobre bienestar.",
        isComingSoon: true,
        icon: <Milestone className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
    ],
  },
  mission: {
    badge: "Nuestros pilares",
    title: "Lo que guía a LUMINUS",
    items: [
      {
        title: "Misión",
        description: "Hacer que el bienestar sea más accesible, conectado y significativo, reuniendo comunidad, especialistas, contenidos y herramientas en una misma red.",
        icon: <Compass className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-pink",
      },
      {
        title: "Visión",
        description: "Construir una red de bienestar humano con alcance regional, capaz de conectar personas, conocimiento y experiencias en América Latina.",
        icon: <Eye className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
      {
        title: "Propósito",
        description: "Acompañar a más personas a vivir con mayor claridad, equilibrio y conexión, acercando recursos que puedan integrarse a la vida cotidiana.",
        icon: <Heart className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime",
      },
    ],
  },
  principles: {
    badge: "Nuestra forma de construir",
    title: "Principios que nos definen",
    subtitle: "LUMINUS se construye sobre una mirada integral del bienestar: humana, clara, responsable y abierta a distintas formas de acompañamiento.",
    items: [
      {
        title: "Conexión significativa",
        description: "Creamos espacios para que las personas puedan encontrarse desde intereses, búsquedas y experiencias reales.",
        icon: <Link2 className="h-5 w-5 text-white" />,
        accentBgClass: "bg-luminus-blue",
        layout: "horizontal" as const,
      },
      {
        title: "Claridad",
        description: "Ordenamos recursos, perfiles y herramientas para que cada persona pueda explorar con mayor dirección.",
        icon: <Milestone className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-pink",
        layout: "horizontal" as const,
      },
      {
        title: "Confianza",
        description: "Cuidamos la forma en que presentamos especialistas, contenidos y experiencias dentro de la red.",
        icon: <ShieldCheck className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-orange",
        layout: "horizontal" as const,
      },
      {
        title: "Bienestar integral",
        description: "Entendemos el bienestar como una experiencia física, emocional, mental, social y espiritual.",
        icon: <HeartHandshake className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-lime",
        layout: "horizontal" as const,
      },
      {
        title: "Tecnología humana",
        description: "Usamos tecnología para facilitar el acceso, ordenar la experiencia y potenciar la conexión entre personas.",
        icon: <Cpu className="h-5 w-5 text-white" />,
        accentBgClass: "bg-luminus-blue",
        layout: "horizontal" as const,
      },
      {
        title: "Diversidad de caminos",
        description: "Reconocemos que cada proceso es distinto. Por eso integramos múltiples enfoques, disciplinas y formas de acompañamiento.",
        icon: <Compass className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-pink",
        layout: "horizontal" as const,
      },
    ],
  },
  platform: {
    badge: "La experiencia",
    title: "Una plataforma para quienes quieren explorar el bienestar de forma más consciente",
    description: "LUMINUS permite descubrir personas, especialistas, contenidos, eventos y herramientas que acompañan distintas dimensiones del bienestar.\n\nLa plataforma está pensada para crecer de forma progresiva, incorporando nuevas funciones que ayuden a conectar mejor el conocimiento, la comunidad y el acompañamiento profesional.",
    disclaimer: "LUMINUS está pensado para quienes buscan vivir con más conciencia, compartir conocimiento, acompañar procesos o apoyar iniciativas vinculadas al bienestar humano.",
    cardTitle: "Para quiénes es LUMINUS",
    modules: [
      "Personas: Quienes quieren explorar bienestar, conectar con otros y acceder a contenidos, recursos y herramientas.",
      "Especialistas: Profesionales que quieren dar visibilidad a su trabajo, compartir conocimiento y conectar con una audiencia afín.",
      "Organizaciones: Empresas e instituciones que quieren acompañar una iniciativa orientada a bienestar, comunidad e impacto humano.",
    ],
  },
  currentStage: {
    badge: "Una red en crecimiento",
    title: "Estamos dando los primeros pasos de una visión regional",
    description: "LUMINUS está en una etapa inicial de crecimiento. Nuestra primera fase se enfoca en construir comunidad, integrar especialistas, desarrollar contenidos y activar herramientas digitales que permitan mejorar la experiencia dentro de la plataforma.\n\nA medida que la red crezca, iremos incorporando nuevas funcionalidades, espacios, experiencias y formas de conexión.",
    disclaimer: "Esta página comunica nuestra visión y dirección de bienestar sin comprometer que todo está activo hoy.",
    cardTitle: "Avances y desarrollo",
    modules: [
      "Comunidad activa.",
      "Especialistas en proceso de integración.",
      "Eventos y contenidos disponibles.",
      "Espacios y mapa en desarrollo.",
      "Faro como herramienta digital en evolución.",
    ],
  },
  finalCta: {
    icon: <Sparkles />,
    title: "Sé parte de una nueva forma de acercarte al bienestar",
    subtitle: "Crea tu cuenta y comienza a explorar una red que reúne personas, especialistas, contenidos y herramientas para vivir con más claridad, equilibrio y conexión.",
    ctaText: "Crear mi cuenta",
    ctaLink: "https://app.luminuslatam.com/auth/registrarse",
    microcopy: "3 meses de acceso sin costo. Sin pago inicial.",
    bgGlow: "from-luminus-pink/5 via-luminus-lime/5",
    cardBg: "bg-luminus-lime/15",
    iconColor: "text-luminus-lime",
  },
};
