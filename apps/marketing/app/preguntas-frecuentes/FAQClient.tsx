"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles, ArrowRight } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  description: string;
  color: "blue" | "orange" | "lime" | "pink";
  items: FAQItem[];
}

export default function FAQClient() {
  // FAQs data matching the user's provided copy exactly
  const categories: FAQCategory[] = useMemo(() => [
    {
      id: "sobre-luminus",
      title: "Sobre LUMINUS",
      description: "Conoce nuestra visión, propósito y qué nos define.",
      color: "blue",
      items: [
        {
          id: "que-is-luminus",
          question: "¿Qué es LUMINUS?",
          answer: "LUMINUS es una plataforma de bienestar humano que reúne personas, especialistas, contenidos, espacios, eventos y herramientas digitales para acompañar procesos de bienestar, desarrollo personal y vida consciente.\n\nNuestro objetivo es ayudarte a explorar nuevas formas de cuidarte, conectar con personas afines, descubrir especialistas y acceder a recursos que puedan acompañarte en distintos momentos de tu camino."
        },
        {
          id: "para-quien-pensado",
          question: "¿Para quién está pensado LUMINUS?",
          answer: "LUMINUS está pensado para personas interesadas en vivir con más equilibrio, claridad y propósito.\n\nTambién está pensado para especialistas, profesionales y facilitadores del bienestar que quieren compartir su conocimiento, presentar su enfoque y conectar con personas interesadas en sus áreas de trabajo."
        },
        {
          id: "es-app-medica",
          question: "¿LUMINUS es una app médica o terapéutica?",
          answer: "No. LUMINUS no reemplaza atención médica, psicológica, terapéutica ni profesional.\n\nLa plataforma funciona como un espacio de conexión, descubrimiento y acompañamiento dentro del ecosistema de bienestar. Cualquier decisión vinculada a tratamientos, diagnósticos, procesos terapéuticos o servicios profesionales debe ser tomada directamente con profesionales calificados."
        },
        {
          id: "que-puedo-encontrar",
          question: "¿Qué puedo encontrar dentro de LUMINUS?",
          answer: "Dentro de LUMINUS podrás acceder progresivamente a comunidad, perfiles de especialistas, grupos de aprendizaje, eventos, contenidos, recursos, espacios de bienestar y herramientas digitales como Faro, nuestro asistente impulsado por IA.\n\nAlgunas funcionalidades ya están disponibles y otras se irán incorporando a medida que la plataforma crezca."
        }
      ]
    },
    {
      id: "acceso-cuenta-suscripcion",
      title: "Acceso, cuenta y suscripción",
      description: "Detalles sobre costos, membresías y condiciones del servicio.",
      color: "lime",
      items: [
        {
          id: "cuenta-costo",
          question: "¿Crear una cuenta tiene costo?",
          answer: "Actualmente puedes comenzar con 3 meses de acceso sin costo. No se solicitan datos de pago al crear tu cuenta.\n\nAntes de que termine ese período, te informaremos para que puedas decidir si quieres continuar con una suscripción activa."
        },
        {
          id: "porque-no-gratis",
          question: "¿Por qué LUMINUS no es gratis?",
          answer: "Porque una plataforma de bienestar debe estar diseñada para cuidar a las personas, no para depender de publicidad ni de la comercialización de datos personales.\n\nLa suscripción nos permite sostener LUMINUS de forma ética, independiente y profesional: desarrollar nuevas funcionalidades, cuidar la experiencia, mejorar la plataforma, acompañar a la comunidad y mantener un entorno más confiable para todos."
        },
        {
          id: "que-pasa-3-meses",
          question: "¿Qué pasa cuando terminan los 3 meses sin costo?",
          answer: "Cuando finalice el período inicial, podrás decidir si quieres continuar con un plan mensual o anual.\n\nNo se realizará ningún cobro automático si no ingresaste datos de pago ni activaste una suscripción."
        },
        {
          id: "que-incluye-membresia",
          question: "¿Qué incluye la membresía base?",
          answer: "La membresía base incluye acceso a la comunidad LUMINUS y a las funcionalidades disponibles dentro de la plataforma.\n\nTambién permite explorar contenidos, conocer personas de la red y acceder progresivamente a nuevas herramientas a medida que sean incorporadas."
        },
        {
          id: "puedo-cancelar",
          question: "¿Puedo cancelar mi suscripción?",
          answer: "Sí. Podrás cancelar tu suscripción según las condiciones disponibles dentro de la plataforma.\n\nLa idea es que puedas formar parte de LUMINUS de manera clara, simple y sin compromisos innecesarios."
        }
      ]
    },
    {
      id: "comunidad-experiencia",
      title: "Comunidad y experiencia dentro de la plataforma",
      description: "Cómo interactuar y qué herramientas encontrarás en la comunidad.",
      color: "pink",
      items: [
        {
          id: "significa-formar-comunidad",
          question: "¿Qué significa formar parte de la comunidad LUMINUS?",
          answer: "Significa ingresar a una red de personas interesadas en bienestar, desarrollo personal, salud consciente, hábitos, propósito y vida en equilibrio.\n\nLa comunidad está pensada para descubrir personas afines, compartir intereses y abrir nuevas posibilidades de conexión."
        },
        {
          id: "puedo-contactar-personas",
          question: "¿Puedo contactar a otras personas dentro de LUMINUS?",
          answer: "Sí, la plataforma está pensada para facilitar conexiones significativas entre personas con intereses, búsquedas o experiencias afines.\n\nLas formas de contacto y visibilidad dependerán de las funcionalidades disponibles y de la configuración de privacidad de cada perfil."
        },
        {
          id: "que-son-grupos",
          question: "¿Qué son los Grupos LUMINUS?",
          answer: "Los Grupos LUMINUS serán entornos digitales donde especialistas y miembros de la red podrán compartir contenido, recursos, conversaciones, actividades y experiencias vinculadas al bienestar.\n\nEstán pensados para reunir personas alrededor de temas, intereses o prácticas específicas."
        },
        {
          id: "que-son-espacios",
          question: "¿Qué son los Espacios LUMINUS?",
          answer: "Los Espacios LUMINUS serán una herramienta para descubrir personas, especialistas, clínicas, consultorios y espacios de bienestar en distintas ciudades de América Latina.\n\nSu objetivo es hacer más visible y accesible la red de bienestar que se está construyendo alrededor de LUMINUS."
        },
        {
          id: "que-es-faro",
          question: "¿Qué es Faro?",
          answer: "Faro es un asistente impulsado por IA pensado para acompañarte con más claridad en tu proceso personal.\n\nSu función será ayudarte a ordenar ideas, atravesar preguntas, explorar recursos y encontrar posibles caminos dentro de LUMINUS. No reemplaza el acompañamiento profesional ni brinda diagnósticos."
        }
      ]
    },
    {
      id: "especialistas-luminus",
      title: "Especialistas LUMINUS",
      description: "Información sobre el rol y la selección de profesionales en la red.",
      color: "orange",
      items: [
        {
          id: "quienes-son-especialistas",
          question: "¿Quiénes son los especialistas de LUMINUS?",
          answer: "Son profesionales, facilitadores o referentes vinculados al bienestar, desarrollo personal, salud complementaria, hábitos, movimiento, emociones, propósito u otras áreas afines.\n\nLos especialistas pueden presentar su experiencia, enfoque, servicios, contenidos y formas de acompañamiento dentro de la plataforma."
        },
        {
          id: "aprobados-automaticamente",
          question: "¿Todos los especialistas son aprobados automáticamente?",
          answer: "No. La aprobación como Especialista LUMINUS está sujeta a revisión.\n\nEl equipo de LUMINUS puede evaluar perfiles para cuidar la coherencia, claridad y confianza de la red. La aprobación no constituye una certificación, aval médico ni garantía sobre resultados profesionales."
        },
        {
          id: "garantiza-servicios",
          question: "¿LUMINUS garantiza los servicios de los especialistas?",
          answer: "No. LUMINUS funciona como una plataforma de conexión entre personas y especialistas independientes.\n\nCada especialista define su enfoque, servicios, precios, condiciones y forma de trabajo. Cualquier sesión, tratamiento, programa, pago, acuerdo o resultado posterior es responsabilidad exclusiva de las partes involucradas."
        },
        {
          id: "sesiones-introductorias-15",
          question: "¿Qué son las sesiones introductorias de 15 minutos?",
          answer: "Son primeras conversaciones breves que algunos especialistas pueden ofrecer para que las personas conozcan su enfoque, compartan brevemente su necesidad y evalúen si desean avanzar con un proceso o servicio profesional.\n\nEstas sesiones no reemplazan una consulta completa ni garantizan resultados posteriores."
        },
        {
          id: "como-aplicar-especialista",
          question: "¿Cómo puedo aplicar como especialista?",
          answer: "El primer paso es crear una cuenta en LUMINUS. Luego podrás completar tu perfil profesional y aplicar para formar parte del panel de especialistas.\n\nLa participación como especialista está sujeta a revisión, aprobación y criterios de permanencia definidos por LUMINUS."
        }
      ]
    },
    {
      id: "eventos-contenidos",
      title: "Eventos y contenidos",
      description: "Participación en actividades en vivo, grabadas y talleres.",
      color: "pink",
      items: [
        {
          id: "organiza-eventos",
          question: "¿LUMINUS organiza eventos?",
          answer: "Sí. LUMINUS crea charlas, entrevistas, talleres, conversatorios y experiencias vinculadas al bienestar integral, la salud consciente, el desarrollo personal y la vida en equilibrio.\n\nAlgunas actividades pueden ser online y otras presenciales."
        },
        {
          id: "donde-ver-eventos",
          question: "¿Dónde puedo ver los próximos eventos?",
          answer: "Los próximos eventos se publican en Luma. Desde la web de LUMINUS podrás acceder al calendario, ver la información de cada actividad y reservar tu lugar cuando haya eventos disponibles.\n\nLa web de LUMINUS no gestiona inscripciones directamente."
        },
        {
          id: "donde-ver-grabados",
          question: "¿Dónde puedo ver contenidos grabados?",
          answer: "Muchos encuentros, entrevistas y conversaciones quedan disponibles en el canal de YouTube de LUMINUS.\n\nEs una forma de seguir aprendiendo a tu ritmo, descubrir especialistas y volver sobre temas que te interesan."
        }
      ]
    },
    {
      id: "privacidad-seguridad",
      title: "Privacidad, datos y seguridad",
      description: "Cómo protegemos tu información y respetamos tus derechos.",
      color: "blue",
      items: [
        {
          id: "vende-datos",
          question: "¿LUMINUS vende mis datos personales?",
          answer: "No. LUMINUS no vende información personal a terceros.\n\nLa plataforma puede utilizar datos necesarios para operar el servicio, personalizar la experiencia, facilitar conexiones y mejorar el funcionamiento general, siempre de acuerdo con su Política de Privacidad."
        },
        {
          id: "quien-puede-ver-datos",
          question: "¿Quién puede ver mi información dentro de LUMINUS?",
          answer: "Parte de tu información puede ser visible para otros miembros de la red según la configuración de tu perfil y las funcionalidades disponibles.\n\nLa idea es que puedas presentarte, conectar y participar cuidando tu privacidad."
        },
        {
          id: "eliminar-datos",
          question: "¿Puedo pedir que eliminen mis datos?",
          answer: "Sí. Puedes solicitar acceso, rectificación o eliminación de tus datos personales según lo establecido en la Política de Privacidad.\n\nAlgunas gestiones podrán realizarse desde tu perfil y otras a través del equipo de soporte."
        },
        {
          id: "utiliza-cookies",
          question: "¿LUMINUS utiliza cookies?",
          answer: "Sí. LUMINUS utiliza cookies para mantener la sesión activa, recordar preferencias, mejorar la experiencia y entender el uso de la plataforma de forma agregada o anónima.\n\nPuedes gestionar las cookies desde la configuración de tu navegador, aunque algunas funciones podrían verse limitadas si decides rechazarlas."
        }
      ]
    },
    {
      id: "empresas-aliadas",
      title: "Empresas aliadas",
      description: "Relación con organizaciones que acompañan y apoyan el crecimiento de la red.",
      color: "lime",
      items: [
        {
          id: "que-son-empresas-aliadas",
          question: "¿Qué son las Empresas Aliadas de LUMINUS?",
          answer: "Son organizaciones que acompañan el crecimiento de LUMINUS desde sus primeras etapas y ayudan a construir una red de bienestar con mayor alcance e impacto en América Latina.\n\nSu aporte puede contribuir al desarrollo de funcionalidades, contenidos, eventos, especialistas, herramientas digitales y nuevas experiencias para la comunidad."
        },
        {
          id: "influye-apoyo",
          question: "¿El apoyo de una empresa influye en los contenidos o recomendaciones?",
          answer: "No. El apoyo de una empresa no implica influencia sobre contenidos, especialistas, recomendaciones, decisiones editoriales ni información privada de las personas usuarias.\n\nLUMINUS mantiene independencia para proteger la confianza de la red."
        }
      ]
    }
  ], []);

  // State
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Toggle item handler
  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Premium color mappings for active states
  const categoryStyles = {
    blue: {
      accent: "#0450FB",
      accentBg: "bg-[#DCE6FF]/10",
    },
    orange: {
      accent: "#FF7700",
      accentBg: "bg-[#FFE0C2]/10",
    },
    lime: {
      accent: "#D4E600",
      accentBg: "bg-[#F4F8B8]/12",
    },
    pink: {
      accent: "#FF80FC",
      accentBg: "bg-[#FFE0FC]/10",
    }
  };

  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-8 lg:pt-24 lg:pb-12">
      {/* Premium background blobs */}
      <div className="absolute left-1/4 top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-[#FFE0C2]/15 blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-[#DCE6FF]/15 blur-3xl pointer-events-none" />
      <div className="absolute left-[-10%] top-[-10%] w-[30%] h-[30%] bg-[#FF80FC]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-650 shadow-soft mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#FF7700]" />
            Centro de Ayuda LUMINUS
          </div>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-6">
            Preguntas Frecuentes
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed text-slate-600 font-medium">
            Encuentra respuestas rápidas y detalladas sobre cómo funciona nuestra plataforma de bienestar, suscripciones, especialistas y comunidad.
          </p>
        </div>

        {/* Main Q&A List Layout */}
        <div className="space-y-16">
          {categories.map((category) => {
            const styles = categoryStyles[category.color];
            
            return (
              <div
                key={category.id}
                className="space-y-6 animate-fadeIn"
              >
                {/* Category Header (Bigger subtitles, more space) */}
                <div className="text-left">
                  <h2 className="font-display text-2xl font-bold text-slate-900 leading-snug">
                    {category.title}
                  </h2>
                  <p className="text-base sm:text-lg text-slate-500 font-medium mt-3 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* Accordion Questions List */}
                <div className="space-y-4">
                  {category.items.map((item) => {
                    const isOpen = !!openItems[item.id];
                    
                    return (
                      <div
                        key={item.id}
                        className={`group rounded-2xl border transition-all duration-300 ${
                          isOpen 
                            ? "shadow-medium" 
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-soft"
                        }`}
                        style={
                          isOpen 
                            ? { 
                                borderColor: `${styles.accent}40`, 
                                backgroundColor: styles.accentBg 
                              } 
                            : {}
                        }
                      >
                        {/* Accordion Trigger Header */}
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-sans font-bold text-sm sm:text-base text-slate-800 hover:text-black transition-colors focus:outline-none"
                        >
                          <span className="leading-snug">{item.question}</span>
                          <div
                            className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-500 shadow-soft group-hover:text-black group-hover:bg-slate-50 transition-all duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          >
                            <ChevronDown className="h-4.5 w-4.5 stroke-[2.2]" />
                          </div>
                        </button>

                        {/* Accordion Content Panel (No dividing line) */}
                        <div
                          className={`overflow-hidden transition-all duration-355 ease-in-out ${
                            isOpen ? "max-h-[500px]" : "max-h-0"
                          }`}
                        >
                          <div className="px-6 pb-6 pt-0 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-line bg-white/40">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Help Callout Card (Tighter margins) */}
        <div className="mt-16 text-center rounded-3xl border border-slate-200 bg-slate-50/40 p-8 sm:p-12 relative overflow-hidden shadow-soft">
          <div className="absolute right-[-5%] top-[-10%] w-[30%] h-[50%] bg-[#D4E600]/3 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-[-5%] bottom-[-10%] w-[30%] h-[50%] bg-[#FF80FC]/3 rounded-full blur-3xl pointer-events-none" />

          <h3 className="font-display text-2xl font-bold text-slate-900 mb-3 relative z-10">
            ¿Sigues con alguna duda?
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-605 font-medium max-w-xl mx-auto mb-8 relative z-10">
            Nuestro equipo está comprometido con tu bienestar. Si no encontraste lo que buscabas, escríbenos directamente y te responderemos a la brevedad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
            <Link
              href="/contacto"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-black py-3.5 px-8 text-sm font-semibold text-white shadow-soft hover:shadow-medium hover:bg-neutral-900 transition-all duration-200"
            >
              Enviar mensaje de contacto
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="https://app.luminuslatam.com/auth/registrarse"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white border border-slate-250 py-3.5 px-8 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 shadow-soft"
            >
              Comenzar prueba 3 meses
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
