import React from "react";
import { 
  Calendar, 
  Tv, 
  Users, 
  Sparkles, 
  Mic, 
  Heart, 
  BookOpen, 
  Compass, 
  HelpCircle, 
  ArrowRight,
  MessageSquare,
  Bookmark,
  Target
} from "lucide-react";

export const eventosContent = {
  hero: {
    badge: {
      text: "Eventos y contenidos",
      icon: <Calendar className="h-4 w-4" />,
      variant: "pink" as const,
    },
    title: (
      <>
        Encuentros para aprender, conectar y{" "}
        <span className="text-luminus-blue">
          explorar nuevas formas de bienestar
        </span>
      </>
    ),
    subtitle: "En LUMINUS creamos charlas, entrevistas, talleres y experiencias para acercar el bienestar a la vida cotidiana.\n\nReunimos especialistas, profesionales y personas interesadas en salud, hábitos, emociones, propósito, desarrollo personal y bienestar integral.",
    primaryCta: {
      text: "Ver próximos eventos",
      link: "#proximos-eventos",
    },
    secondaryCta: {
      text: "Explorar YouTube",
      link: "https://www.youtube.com/@luminus_latam",
    },
    microcopy: "Las inscripciones se gestionan desde Luma. Los contenidos grabados están disponibles en YouTube.",
    image: {
      src: "/events-illustration.png",
      alt: "LUMINUS Eventos y Actividades de Bienestar",
    },
    bgGlow: "from-luminus-pink/5 via-luminus-lime/5",
    imageBg: "shadow-bold-lg transition-transform duration-300 hover:rotate-1",
    borderBottom: true,
  },
  narrative: {
    title: "El bienestar también se construye en conversación",
    paragraphs: [
      "Muchas veces una nueva pregunta, una charla o una experiencia compartida puede abrir un camino de cambio.",
      "Por eso, los eventos de LUMINUS acercan miradas, prácticas y conocimientos que ayudan a explorar el bienestar desde un lugar más humano, claro y accesible."
    ]
  },
  whatWeDo: {
    badge: "Qué hacemos",
    title: "Actividades para aprender, reflexionar y conectar",
    subtitle: "Creamos espacios online y presenciales junto a especialistas de distintas áreas del bienestar.",
    items: [
      {
        title: "Charlas con especialistas",
        description: "Encuentros para aprender de profesionales que comparten conocimientos, enfoques y herramientas prácticas.",
        icon: <Mic className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-blue text-white",
      },
      {
        title: "Entrevistas y conversaciones",
        description: "Diálogos para conocer historias, trayectorias y miradas que inspiran nuevas formas de vivir.",
        icon: <MessageSquare className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange text-black",
      },
      {
        title: "Talleres y experiencias",
        description: "Actividades orientadas a integrar conocimientos a través de prácticas, ejercicios o dinámicas guiadas.",
        icon: <Sparkles className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime text-black",
      },
      {
        title: "Conversatorios temáticos",
        description: "Espacios para profundizar en temas específicos desde distintas perspectivas profesionales.",
        icon: <Users className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-pink text-black",
      },
      {
        title: "Contenidos grabados",
        description: "Charlas y entrevistas disponibles para seguir explorando a tu ritmo desde YouTube.",
        icon: <Tv className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-blue text-white",
      }
    ]
  },
  topicsSection: {
    badge: "Temáticas",
    title: "Bienestar desde distintas miradas",
    subtitle: "Los eventos abordan temas vinculados al bienestar integral, la salud consciente y el desarrollo humano.",
    topics: [
      "Salud y prevención.",
      "Nutrición y hábitos.",
      "Movimiento y actividad física.",
      "Respiración y regulación emocional.",
      "Autoconocimiento.",
      "Propósito y desarrollo personal.",
      "Neurociencia y bienestar.",
      "Medicina integrativa.",
      "Descanso y energía.",
      "Relaciones y vida en comunidad."
    ]
  },
  upcoming: {
    title: "Próximos eventos",
    badge: "Agenda",
    description: "Publicamos nuestras próximas actividades en Luma. Allí puedes ver la información completa de cada evento, conocer fecha y horario, descubrir quiénes participan y reservar tu lugar.",
    disclaimer: "La web de LUMINUS no gestiona inscripciones directamente. Para participar, te redirigiremos a Luma.",
    ctaText: "Explorar eventos en Luma",
    ctaLink: "https://lu.ma/luminus",
    emptyState: {
      title: "Actualmente no hay próximos eventos disponibles",
      subtitle: "Muy pronto estaremos compartiendo nuevas charlas, talleres y experiencias LUMINUS.",
      text: "Mientras tanto, puedes explorar conversaciones anteriores en nuestro canal de YouTube.",
      ctaLuma: "Ver calendario en Luma",
      ctaYoutube: "Explorar YouTube"
    }
  },
  pastEvents: {
    title: "Contenidos para seguir aprendiendo a tu ritmo",
    description: "Muchos de nuestros encuentros, entrevistas y conversaciones quedan disponibles en el canal de YouTube de LUMINUS para que puedas verlos cuando quieras.",
    highlight: "Es una forma simple de descubrir especialistas, volver sobre temas que te interesan y acceder a nuevas perspectivas sobre bienestar integral.",
    ctaText: "Ver canal de YouTube",
    ctaLink: "https://www.youtube.com/@luminus_latam"
  },
  twoWays: {
    title: "Participa en vivo o explora contenidos grabados",
    subtitle: "Puedes sumarte a las próximas actividades desde Luma o acceder a charlas y entrevistas anteriores desde YouTube.",
    items: [
      {
        title: "Participar en vivo",
        description: "Inscríbete en actividades abiertas, haz preguntas y forma parte de la experiencia en tiempo real.",
        icon: <Calendar className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
      {
        title: "Explorar contenidos grabados",
        description: "Accede a entrevistas, charlas y conversaciones para aprender a tu ritmo.",
        icon: <Tv className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime",
      }
    ]
  },
  whyWeDoEvents: {
    badge: "Nuestra visión",
    title: "Por qué hacemos eventos",
    subtitle: "Los eventos son una forma de acercar el conocimiento de especialistas a más personas y convertir el bienestar en algo más cotidiano, conversado y posible.",
    items: [
      {
        title: "Acercar conocimiento confiable",
        description: "Invitamos a profesionales con experiencia para compartir información clara y útil.",
        icon: <BookOpen className="h-5 w-5 text-white" />,
        accentBgClass: "bg-luminus-blue",
      },
      {
        title: "Abrir nuevas preguntas",
        description: "Una buena conversación puede iniciar un proceso de búsqueda, cambio o reflexión.",
        icon: <Compass className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
      {
        title: "Conectar personas afines",
        description: "Los encuentros reúnen a personas interesadas en bienestar, salud y desarrollo personal.",
        icon: <Users className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-lime",
      },
      {
        title: "Visibilizar distintas miradas",
        description: "El bienestar no tiene una única forma. Por eso abrimos espacio a enfoques diversos y complementarios.",
        icon: <Target className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-pink",
      }
    ]
  },
  forWhom: {
    title: "Para personas que quieren explorar el bienestar desde un lugar más cercano",
    paragraphs: [
      "Los eventos están pensados para quienes buscan vivir con más conciencia, cuidar su salud, mejorar hábitos, atravesar procesos personales o descubrir nuevas herramientas de bienestar.",
      "También son espacios valiosos para especialistas, profesionales y organizaciones que comparten una mirada más humana e integral sobre la salud y el desarrollo personal."
    ],
    sideCard: {
      title: "Una red que aprende, comparte y se transforma",
      text: "Cada evento es una oportunidad para escuchar especialistas, descubrir prácticas, hacer preguntas y acercarse a temas que muchas veces no tienen suficiente espacio en la vida cotidiana.\n\nNuestros eventos no son actividades aisladas. Son parte de una red viva que busca inspirar una forma más consciente, saludable y conectada de vivir."
    }
  },
  finalCta: {
    icon: <Sparkles className="h-5 w-5 text-luminus-orange" />,
    title: "Descubre próximos encuentros y contenidos de bienestar",
    subtitle: "Participa en nuestras próximas actividades desde Luma o revive conversaciones anteriores en YouTube. Ambos caminos son una invitación a aprender, conectar y explorar el bienestar desde nuevas perspectivas.",
    primaryCta: {
      text: "Ver próximos eventos",
      link: "https://lu.ma/luminus",
    },
    secondaryCta: {
      text: "Explorar YouTube",
      link: "https://www.youtube.com/@luminus_latam",
    },
    bgGlow: "from-luminus-orange/5 via-transparent",
    cardBg: "bg-luminus-orange/15",
    iconColor: "text-luminus-orange",
    microcopy: "Eventos en vivo en Luma. Contenidos grabados en YouTube.",
  }
};
