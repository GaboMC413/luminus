import React from "react";
import { Briefcase, Eye, Users, Shield, User, HeartHandshake, Calendar, BookOpen, Compass, MapPin, Sparkles } from "lucide-react";

export const expertsContent = {
  hero: {
    badge: {
      text: "Red Profesional de Bienestar",
      icon: <Briefcase />,
      variant: "pink" as const,
    },
    title: (
      <>
        Lleva tu conocimiento a una{" "}
        <span className="text-luminus-blue">
          red de bienestar
        </span>
      </>
    ),
    subtitle: "LUMINUS conecta a profesionales, expertos y facilitadores con personas que buscan acompañamiento, recursos y experiencias para avanzar hacia una vida con más equilibrio, claridad y propósito.",
    primaryCta: {
      text: "Registrarme como primer paso",
      link: "https://app.luminuslatam.com/signup",
    },
    secondaryCta: {
      text: "Conocer funciones",
      link: "#funciones-expertos",
    },
    microcopy: "* El primer paso para ser Experto LUMINUS es crear tu cuenta dentro de la plataforma.",
    image: {
      src: "/experts-illustration.png",
      alt: "LUMINUS Professional & Experts Wellness Network",
    },
    bgGlow: "from-luminus-pink/5 via-luminus-lime/5",
    imageBg: "shadow-bold-lg transition-transform duration-300 hover:rotate-1",
    borderBottom: true,
  },
  benefits: {
    title: "Un espacio para profesionales que quieren ampliar su impacto",
    subtitle: "En LUMINUS, los expertos podrán construir presencia, compartir conocimiento y conectar con una comunidad interesada en bienestar, transformación personal y desarrollo consciente.",
    items: [
      {
        title: "Más visibilidad para tu práctica",
        description: "Presenta tu enfoque, experiencia y servicios dentro de una red diseñada para que las personas puedan descubrir profesionales de confianza.",
        icon: <Eye className="h-6 w-6 text-black" />,
        cardClass: "bg-luminus-pink/15 hover:bg-luminus-pink/20 shadow-bold-pink",
        iconBg: "bg-luminus-pink",
      },
      {
        title: "Conexión con una audiencia afín",
        description: "Llega a personas que ya están interesadas en bienestar y buscan acompañamiento, recursos y nuevas formas de avanzar en su proceso personal.",
        icon: <Users className="h-6 w-6 text-black" />,
        cardClass: "bg-luminus-orange/15 hover:bg-luminus-orange/20 shadow-bold-orange",
        iconBg: "bg-luminus-orange",
      },
      {
        title: "Un entorno profesional y cuidado",
        description: "Forma parte de una plataforma que prioriza la confianza, la calidad de las conexiones y el valor real que los expertos pueden aportar.",
        icon: <Shield className="h-6 w-6 text-black" />,
        cardClass: "bg-luminus-lime/15 hover:bg-luminus-lime/20 shadow-bold-lime",
        iconBg: "bg-luminus-lime",
      },
    ],
  },
  features: {
    title: "Funciones pensadas para expertos del bienestar",
    subtitle: "LUMINUS ofrecerá herramientas exclusivas para que los profesionales puedan mostrarse, conectar, compartir contenido y ofrecer experiencias a la comunidad.",
    items: [
      {
        title: "Perfil profesional",
        description: "Podrás presentar quién eres, tu especialidad, tu enfoque, tus áreas de trabajo y la forma en que acompañas a las personas.",
        ctaText: "Crear mi perfil",
        ctaLink: "https://app.luminuslatam.com/signup",
        isComingSoon: false,
        icon: <User />,
        accentBgClass: "bg-luminus-blue text-white",
      },
      {
        title: "Conexión con personas",
        description: "Las personas podrán conocer tu perfil, explorar tu propuesta y contactarte cuando sientan que tu enfoque puede acompañar su camino.",
        ctaText: "Conectar con personas",
        ctaLink: "https://app.luminuslatam.com/signup",
        isComingSoon: false,
        icon: <HeartHandshake />,
        accentBgClass: "bg-luminus-orange text-black",
      },
      {
        title: "Sesiones y servicios",
        description: "Próximamente podrás compartir tus servicios, facilitar el acceso a sesiones y organizar mejor la forma en que las personas se acercan a tu trabajo.",
        ctaText: "Mostrar servicios",
        ctaLink: "#",
        isComingSoon: true,
        icon: <Calendar />,
        accentBgClass: "bg-luminus-lime text-black",
      },
      {
        title: "Cursos y recursos",
        description: "Podrás compartir conocimiento a través de contenidos, recursos, cursos y materiales que ayuden a la comunidad a aprender, reflexionar y avanzar.",
        ctaText: "Compartir recursos",
        ctaLink: "https://app.luminuslatam.com/signup",
        isComingSoon: false,
        icon: <BookOpen />,
        accentBgClass: "bg-luminus-pink text-black",
      },
      {
        title: "Espacios LUMINUS",
        description: "Próximamente podrás participar en Espacios LUMINUS, lugares diseñados para compartir contenido relevante, abrir conversaciones e invitar a eventos exclusivos.",
        ctaText: "Crear un espacio",
        ctaLink: "#",
        isComingSoon: true,
        icon: <Compass />,
        accentBgClass: "bg-luminus-blue text-white",
      },
      {
        title: "Mapa LUMINUS",
        description: "Próximamente podrás formar parte del Mapa LUMINUS para que las personas descubran expertos, clínicas y consultorios de bienestar en su ciudad y en LATAM.",
        ctaText: "Aparecer en el mapa",
        ctaLink: "#",
        isComingSoon: true,
        icon: <MapPin />,
        accentBgClass: "bg-luminus-orange text-black",
      },
    ],
  },
  comparison: {
    title: "Una experiencia pensada para profesionales",
    subtitle: "En LUMINUS, cualquier persona puede crear una cuenta para explorar la comunidad. Pero los expertos acceden a funciones específicas para construir presencia profesional, compartir conocimiento y conectar con personas interesadas en su área de especialidad.",
    columns: [
      {
        badgeText: "Exploración",
        badgeBg: "bg-luminus-lime",
        title: "Usuarios generales",
        description: "Diseñado para personas interesadas en explorar la red, educarse y encontrar herramientas para sostener su bienestar personal.",
        bullets: [
          "Exploran la comunidad y participan.",
          "Conectan con otras personas afines.",
          "Descubren expertos, espacios y recursos.",
          "Acceden a herramientas para su proceso personal.",
        ],
      },
      {
        badgeText: "Rol Experto",
        badgeBg: "bg-luminus-orange",
        title: "Expertos LUMINUS",
        description: "Diseñado para profesionales que buscan posicionar su práctica, compartir su conocimiento y conectar con consultantes afines.",
        bullets: [
          "Crean un perfil profesional certificado.",
          "Presentan su enfoque, trayectoria y servicios.",
          "Comparten contenidos, cursos y recursos prácticos.",
          "Pueden ser descubiertos por personas interesadas.",
          "Acceden a funciones y analíticas exclusivas para expertos.",
        ],
        isHighlighted: true,
        highlightBadgeText: "Presencia Profesional",
        highlightBadgeIcon: <Sparkles className="h-3.5 w-3.5 text-luminus-orange" />,
      },
    ],
  },
  steps: {
    title: "El primer paso es registrarte",
    subtitle: "Para formar parte como Experto LUMINUS, primero debes crear tu cuenta en la plataforma. Luego podrás avanzar con la configuración de tu perfil y acceder a las funciones disponibles para profesionales.",
    ctaText: "Registrarme como primer paso",
    ctaLink: "https://app.luminuslatam.com/signup",
    steps: [
      {
        num: "01",
        title: "Crea tu cuenta",
        description: "Regístrate en LUMINUS como primer paso para ingresar a la red.",
        numColor: "text-luminus-blue",
        badgeBg: "bg-luminus-blue text-white",
        shadowColor: "shadow-bold-blue",
      },
      {
        num: "02",
        title: "Completa tu perfil",
        description: "Presenta tu experiencia, especialidad, enfoque y áreas de acompañamiento.",
        numColor: "text-luminus-orange",
        badgeBg: "bg-luminus-orange text-black",
        shadowColor: "shadow-bold-orange",
      },
      {
        num: "03",
        title: "Activa tu presencia",
        description: "Accede a las funciones para expertos y comienza a compartir tu trabajo con la comunidad.",
        numColor: "text-luminus-lime",
        badgeBg: "bg-luminus-lime text-black",
        shadowColor: "shadow-bold-lime",
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
  finalCta: {
    icon: <Sparkles />,
    title: "Empieza tu camino como Experto LUMINUS",
    subtitle: "Crea tu cuenta y da el primer paso para formar parte de una red que conecta bienestar, conocimiento y propósito.",
    ctaText: "Registrarme como primer paso",
    ctaLink: "https://app.luminuslatam.com/signup",
    microcopy: "Luego del registro podrás avanzar con tu perfil y las funciones para expertos.",
    bgGlow: "from-luminus-orange/5 to-transparent",
    cardBg: "bg-luminus-orange/15",
    iconColor: "text-luminus-orange",
  },
};
