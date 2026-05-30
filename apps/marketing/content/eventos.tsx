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
      text: "Eventos & Activaciones",
      icon: <Calendar className="h-4 w-4" />,
      variant: "pink" as const,
    },
    title: (
      <>
        Encuentros para aprender, conectar y{" "}
        <span className="text-luminus-blue">
          vivir con más conciencia
        </span>
      </>
    ),
    subtitle: "En LUMINUS creamos espacios de encuentro para acercar el bienestar integral a más personas. A través de charlas, entrevistas, talleres, conversaciones y experiencias online, reunimos a expertos, profesionales y personas interesadas en vivir con más claridad, salud, equilibrio y propósito.\n\nNuestros eventos son una extensión viva de la propuesta LUMINUS: espacios para explorar nuevas ideas, conocer distintas miradas, acceder a herramientas prácticas y conectar con personas que también están buscando transformar la forma en que viven, se cuidan y se relacionan con su bienestar.",
    primaryCta: {
      text: "Ver próximos eventos",
      link: "#proximos-eventos",
    },
    secondaryCta: {
      text: "Explorar contenidos en YouTube",
      link: "https://www.youtube.com/@luminus_latam",
    },
    microcopy: "*Nuestros eventos y webinars son abiertos a la comunidad. Algunos encuentros requieren inscripción previa.*",
    image: {
      src: "/events-illustration.png",
      alt: "LUMINUS Eventos y Actividades de Bienestar",
    },
    bgGlow: "from-luminus-pink/5 via-luminus-lime/5",
    imageBg: "shadow-bold-lg transition-transform duration-300 hover:rotate-1",
    borderBottom: true,
  },
  narrative: {
    title: "Una forma más cercana de explorar el bienestar",
    paragraphs: [
      "El bienestar no siempre empieza con una gran decisión. Muchas veces comienza con una conversación, una pregunta, una práctica sencilla o una idea que nos invita a mirar la vida desde otro lugar.",
      "Por eso, en LUMINUS impulsamos eventos y contenidos que acercan el conocimiento de especialistas a la vida cotidiana. Creamos espacios donde distintos temas vinculados a la salud, el cuerpo, la mente, las emociones, los hábitos, el propósito y el desarrollo personal pueden ser abordados con profundidad, pero también con claridad y cercanía.",
      "Cada encuentro está pensado para inspirar, informar y abrir caminos posibles. No buscamos imponer una única mirada sobre el bienestar, sino reunir voces, experiencias y conocimientos que ayuden a cada persona a encontrar su propio recorrido."
    ]
  },
  whatWeDo: {
    badge: "Qué Hacemos",
    title: "Qué hacemos en los eventos LUMINUS",
    subtitle: "Los eventos LUMINUS reúnen a expertos, profesionales y referentes de distintas áreas del bienestar integral para compartir conocimientos, herramientas y experiencias.\n\nAbordamos temas como salud consciente, nutrición, movimiento, respiración, gestión emocional, autoconocimiento, neurociencia, medicina integrativa, hábitos, propósito, descanso, transformación y desarrollo humano.",
    items: [
      {
        title: "Charlas con expertos",
        description: "Espacios para aprender de profesionales que comparten conocimientos, enfoques y herramientas desde su experiencia.",
        icon: <Mic className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-blue text-white",
      },
      {
        title: "Entrevistas y conversaciones",
        description: "Encuentros para conocer historias, trayectorias y miradas que inspiran nuevas formas de vivir y comprender el bienestar.",
        icon: <MessageSquare className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange text-black",
      },
      {
        title: "Talleres y experiencias",
        description: "Actividades orientadas a integrar conocimientos a través de prácticas, ejercicios, reflexiones o dinámicas guiadas.",
        icon: <Sparkles className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime text-black",
      },
      {
        title: "Conversatorios temáticos",
        description: "Espacios para profundizar en temas específicos desde distintas perspectivas profesionales y humanas.",
        icon: <Users className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-pink text-black",
      },
      {
        title: "Contenidos educativos",
        description: "Materiales grabados y conversaciones disponibles para seguir explorando a tu ritmo desde nuestro canal de YouTube.",
        icon: <Tv className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-blue text-white",
      }
    ]
  },
  upcoming: {
    title: "Próximos eventos",
    badge: "Agenda en Luma",
    description: "En LUMINUS publicamos nuestras próximas actividades a través de Luma. Allí puedes conocer la información completa de cada evento, ver la fecha y horario, descubrir quiénes participan y reservar tu lugar.",
    disclaimer: "La web de LUMINUS no gestiona directamente las inscripciones a eventos. Para participar, te redirigiremos a nuestro calendario en Luma, donde se centraliza la información y el registro de cada actividad.",
    ctaText: "Explorar eventos en Luma",
    ctaLink: "https://lu.ma/luminus", // Placeholder Luma calendar or direct calendar link
    emptyState: {
      title: "Actualmente no hay próximos eventos disponibles",
      subtitle: "Muy pronto estaremos compartiendo nuevas charlas, talleres y experiencias LUMINUS.",
      text: "Mientras tanto, puedes explorar conversaciones anteriores en nuestro canal de YouTube y seguir descubriendo contenidos sobre bienestar integral.",
      ctaLuma: "Ver calendario en Luma",
      ctaYoutube: "Explorar YouTube"
    }
  },
  pastEvents: {
    title: "Eventos pasados y contenidos en YouTube",
    description: "Muchos de nuestros encuentros, entrevistas y conversaciones quedan disponibles en el canal de YouTube de LUMINUS para que puedas verlos cuando quieras.\n\nYouTube nos permite extender el impacto de cada evento más allá del vivo. Lo que sucede en una charla, una entrevista o una conversación con un experto puede seguir acompañando a más personas en distintos momentos de su camino.",
    highlight: "En nuestro canal compartimos contenidos sobre bienestar integral, salud consciente, transformación personal, nutrición, respiración, movimiento, neurociencia, medicina integrativa, hábitos, propósito y otras áreas vinculadas a una vida más plena.\n\nEs un espacio abierto para aprender, descubrir expertos, escuchar nuevas perspectivas y acercarte a herramientas que pueden ayudarte a vivir con mayor conciencia.",
    ctaText: "Ver canal de YouTube",
    ctaLink: "https://www.youtube.com/@luminus_latam"
  },
  twoWays: {
    title: "Dos caminos para participar",
    items: [
      {
        title: "Participar en vivo",
        description: "A través de Luma puedes acceder a nuestras próximas actividades e inscribirte en los eventos disponibles. Cada encuentro en vivo es una oportunidad para aprender, hacer preguntas, conectar con expertos y formar parte de una experiencia compartida.",
        icon: <Calendar className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
      {
        title: "Explorar contenidos grabados",
        description: "A través de YouTube puedes acceder a entrevistas, charlas y conversaciones anteriores. Es una forma de seguir aprendiendo a tu ritmo, volver sobre temas que te interesan y descubrir nuevas miradas sobre el bienestar.",
        icon: <Tv className="h-6 w-6 text-black" />,
        accentBgClass: "bg-luminus-lime",
      }
    ]
  },
  whyWeDoEvents: {
    badge: "Nuestra Visión",
    title: "Por qué hacemos eventos",
    subtitle: "LUMINUS nace con una visión clara: acercar el bienestar integral a más personas, conectando conocimiento, expertos, comunidad y experiencias.\n\nLos eventos son una parte fundamental de esa visión porque permiten que el bienestar deje de ser una idea abstracta y se convierta en algo más cercano, conversado y posible.",
    items: [
      {
        title: "Acercar conocimiento confiable",
        description: "Invitamos a expertos y profesionales para compartir información clara, responsable y valiosa.",
        icon: <BookOpen className="h-5 w-5 text-white" />,
        accentBgClass: "bg-luminus-blue",
      },
      {
        title: "Abrir nuevas preguntas",
        description: "Creemos que una buena conversación puede iniciar un proceso de búsqueda, cambio o transformación.",
        icon: <Compass className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-orange",
      },
      {
        title: "Conectar personas afines",
        description: "Los eventos permiten que quienes están explorando temas de bienestar puedan sentirse parte de una red más amplia.",
        icon: <Users className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-lime",
      },
      {
        title: "Visibilizar miradas del bienestar",
        description: "El bienestar no tiene una única forma. Por eso reunimos enfoques diversos, integrales y complementarios.",
        icon: <Target className="h-5 w-5 text-black" />,
        accentBgClass: "bg-luminus-pink",
      },
      {
        title: "Inspirar acciones concretas",
        description: "Cada contenido busca dejar una idea, una herramienta o una reflexión que pueda acompañar la vida cotidiana.",
        icon: <Sparkles className="h-5 w-5 text-white" />,
        accentBgClass: "bg-luminus-blue",
      }
    ]
  },
  forWhom: {
    title: "Para quiénes son los eventos LUMINUS",
    paragraphs: [
      "Los eventos LUMINUS están pensados para personas que buscan vivir con más conciencia, cuidar su salud, mejorar sus hábitos, atravesar procesos de transformación personal o simplemente abrirse a nuevas formas de bienestar.",
      "También son espacios valiosos para profesionales, expertos y organizaciones que comparten una mirada más humana, integral y consciente sobre la salud, el desarrollo personal y la vida en comunidad.",
      "No es necesario tener experiencia previa ni conocimientos técnicos. Nuestros encuentros están diseñados para ser accesibles, cercanos y abiertos a quienes sienten interés por explorar nuevas herramientas para vivir mejor."
    ],
    sideCard: {
      title: "Una red que aprende, comparte y se transforma",
      text: "Cada evento LUMINUS es una oportunidad para conectar conocimiento con experiencia. Para escuchar a expertos, descubrir nuevas prácticas, hacer preguntas y acercarse a temas que muchas veces no tienen suficiente espacio en la vida cotidiana.\n\nCreemos que el bienestar también se construye cuando nos encontramos. Cuando compartimos lo que sabemos, cuando escuchamos otras historias, cuando accedemos a información de calidad y cuando descubrimos que no estamos solos en nuestras búsquedas.\n\nPor eso, nuestros eventos y contenidos no son actividades aisladas. Son parte de una red viva que busca inspirar una forma más consciente, saludable y conectada de vivir."
    }
  },
  finalCta: {
    icon: <Sparkles className="h-5 w-5 text-luminus-orange" />,
    title: "Explora los próximos encuentros y contenidos LUMINUS",
    subtitle: "Puedes participar en nuestras próximas actividades desde Luma o revivir conversaciones anteriores en nuestro canal de YouTube.\n\nLos eventos en vivo te permiten ser parte de la experiencia en tiempo real. Los contenidos grabados te permiten seguir aprendiendo a tu ritmo.\n\nAmbos caminos forman parte de la misma invitación: acercarte al bienestar desde un lugar más humano, informado y consciente.",
    primaryCta: {
      text: "Ver próximos eventos en Luma",
      link: "https://lu.ma/luminus",
    },
    secondaryCta: {
      text: "Ver contenidos en YouTube",
      link: "https://www.youtube.com/@luminus_latam",
    },
    bgGlow: "from-luminus-orange/5 via-transparent",
    cardBg: "bg-luminus-orange/15",
    iconColor: "text-luminus-orange",
  }
};
