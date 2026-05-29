import React from "react";
import { Users, UserCheck, Compass, MapPin, Sparkles, AlertTriangle, XCircle, Eye, Heart, Link2, ShieldCheck, HeartHandshake, Milestone, Cpu, CheckCircle, Info, Globe } from "lucide-react";

export const aboutContent = {
  hero: {
    badge: {
      text: "Nuestra Historia & Propósito",
      icon: <Globe />,
      variant: "lime" as const,
    },
    title: (
      <>
        Una red para vivir el bienestar de forma más{" "}
        <span className="text-luminus-blue">
          conectada y humana
        </span>
      </>
    ),
    subtitle: "LUMINUS nace para reunir personas, expertos, espacios y herramientas que ayuden a vivir con más equilibrio, claridad y propósito.",
    primaryCta: {
      text: "Crear mi cuenta",
      link: "https://app.luminuslatam.com/signup",
    },
    secondaryCta: {
      text: "Conocer qué construimos",
      link: "#porque-existe",
    },
    microcopy: "* LUMINUS está naciendo como una plataforma para conectar bienestar, comunidad y tecnología humana.",
    image: {
      src: "/hero-illustration.png",
      alt: "LUMINUS Living Network of Wellness",
    },
    bgGlow: "from-luminus-lime/5 via-luminus-pink/5",
    imageBg: "shadow-bold-lg transition-transform duration-300 hover:-rotate-1",
    borderBottom: true,
  },
  problem: {
    title: "El bienestar hoy está demasiado fragmentado",
    description: "Muchas personas buscan sentirse mejor, vivir con más equilibrio o encontrar acompañamiento, pero suelen hacerlo de forma dispersa: contenidos aislados, profesionales difíciles de encontrar, experiencias desconectadas y poca claridad sobre por dónde empezar.",
    highlight: "LUMINUS surge para ordenar ese camino y acercar, en un mismo lugar, personas, expertos, espacios y herramientas que puedan ayudar a cada usuario a avanzar con más dirección.",
    cardTitle: "Los 4 grandes vacíos en el camino",
    cardIcon: <AlertTriangle className="h-6 w-6" />,
    bullets: [
      "Información dispersa y poco confiable.",
      "Profesionales difíciles de descubrir y validar.",
      "Experiencias aisladas y sin continuidad.",
      "Falta de claridad para avanzar en el día a día.",
    ],
  },
  response: {
    badge: "Nuestra Respuesta",
    title: "Estamos construyendo una red de bienestar más humana y accesible",
    subtitle: "LUMINUS conecta comunidad, expertos, espacios, mapa y herramientas digitales para que cada persona pueda explorar su camino de bienestar con mayor claridad.",
    items: [
      {
        title: "Comunidad",
        description: "Un espacio para descubrir personas, explorar perfiles, encontrar intereses en común y conectar con quienes comparten búsquedas, experiencias y propósito.",
        isComingSoon: false,
        icon: <Users className="h-6 w-6 text-white" />,
        accentBgClass: "bg-luminus-blue",
      },
      {
        title: "Expertos",
        description: "Una red de profesionales del bienestar donde las personas podrán conocer enfoques, servicios, recursos y formas de acompañamiento profesional.",
        isComingSoon: true,
        icon: <UserCheck className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
      {
        title: "Espacios LUMINUS",
        description: "Lugares digitales para aprender, compartir contenidos de valor, participar en conversaciones e involucrarse en experiencias de grupo exclusivas.",
        isComingSoon: true,
        icon: <Compass className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime",
      },
      {
        title: "Mapa LUMINUS",
        description: "Una forma de descubrir personas, clínicas, consultorios y profesionales del bienestar de la red en distintas ciudades de LATAM.",
        isComingSoon: true,
        icon: <MapPin className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-pink",
      },
      {
        title: "Faro LUMINUS",
        description: "Un asistente impulsado por IA creado para acompañar procesos diarios, aportar claridad y ayudarte a tomar mejores decisiones de bienestar.",
        isComingSoon: true,
        icon: <Sparkles className="h-6 w-6 text-white" />,
        accentBgClass: "bg-luminus-blue",
      },
    ],
  },
  mission: {
    badge: "Nuestros Pilares Guía",
    title: "Lo que guía a LUMINUS",
    items: [
      {
        title: "Nuestra misión",
        description: "Hacer que el bienestar sea más accesible, conectado y significativo, creando una red donde las personas puedan encontrar acompañamiento, conocimiento y vínculos que las ayuden a avanzar con más claridad.",
        icon: <Compass className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-pink",
      },
      {
        title: "Nuestra visión",
        description: "Construir la red de bienestar más humana y relevante de LATAM, integrando personas, expertos, espacios y tecnología para acompañar procesos reales de transformación personal.",
        icon: <Eye className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
      {
        title: "Nuestro propósito",
        description: "Ayudar a que más personas puedan encontrar claridad, conexión y acompañamiento en su camino hacia una vida con más equilibrio y sentido.",
        icon: <Heart className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime",
      },
    ],
  },
  principles: {
    badge: "Nuestra Filosofía",
    title: "Principios que nos definen",
    subtitle: "LUMINUS se construye sobre una forma de entender el bienestar: más conectada, integral, clara y humana.",
    items: [
      {
        title: "Conexión significativa",
        description: "Creamos espacios donde las personas puedan encontrarse desde intereses, búsquedas y experiencias reales.",
        icon: <Link2 className="h-5 w-5 text-white" />,
        accentBgClass: "bg-luminus-blue",
        layout: "horizontal" as const,
      },
      {
        title: "Confianza",
        description: "Buscamos construir una red cuidada, clara y profesional, donde cada vínculo tenga valor real.",
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
        title: "Claridad",
        description: "Organizamos personas, recursos y herramientas para que cada usuario pueda avanzar con más dirección.",
        icon: <Milestone className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-pink",
        layout: "horizontal" as const,
      },
      {
        title: "Humanidad + tecnología",
        description: "Usamos tecnología para potenciar la conexión humana, no para reemplazarla.",
        icon: <Cpu className="h-5 w-5 text-white" />,
        accentBgClass: "bg-luminus-blue",
        layout: "horizontal" as const,
      },
    ],
  },
  platform: {
    badge: "Nuestra Plataforma",
    title: "Una plataforma para quienes buscan algo más que información",
    description: "LUMINUS está naciendo como un espacio para conectar, descubrir y avanzar. Una plataforma donde las personas puedan encontrar comunidad, expertos, recursos, espacios y herramientas que acompañen su proceso de bienestar de forma más consciente y significativa.",
    disclaimer: "* Algunas funcionalidades estarán disponibles próximamente. Esta página comunica nuestra visión y dirección de bienestar sin comprometer que todo está activo hoy.",
    cardTitle: "Módulos de la Red",
    modules: [
      "Comunidad LUMINUS",
      "Expertos del bienestar",
      "Espacios LUMINUS",
      "Mapa LUMINUS",
      "Faro LUMINUS",
      "Cursos, recursos y experiencias",
    ],
  },
  finalCta: {
    icon: <Sparkles />,
    title: "Sé parte de esta nueva forma de vivir el bienestar",
    subtitle: "Crea tu cuenta hoy y da el primer paso en la comunidad LUMINUS.",
    ctaText: "Crear mi cuenta",
    ctaLink: "https://app.luminuslatam.com/signup",
    microcopy: "3 meses de acceso sin costo. Sin pago inicial.",
    bgGlow: "from-luminus-pink/5 via-luminus-lime/5",
    cardBg: "bg-luminus-lime/15",
    iconColor: "text-luminus-lime",
  },
};
