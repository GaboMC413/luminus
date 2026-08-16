export interface FaqItem {
  id: string;
  question: string;
  paragraphs: string[];
}

export interface FaqCategory {
  id: string;
  title: string;
  description: string;
  faqs: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "general",
    title: "General y Plataforma",
    description: "Conoce el propósito de LUMINUS, su alcance regional, la moderación de la comunidad, privacidad y nuestros canales de contacto.",
    faqs: [
      {
        id: "gen-1",
        question: "¿Qué es LUMINUS y cuál es su propósito?",
        paragraphs: [
          "LUMINUS es una plataforma digital de bienestar creada para conectar personas, especialistas independientes, espacios, actividades y herramientas en una misma red.",
          "Nuestro propósito es facilitar el acceso a distintas formas de acompañamiento y bienestar, reuniendo áreas como salud integral, crecimiento personal, nutrición, movimiento y terapias complementarias.",
        ],
      },
      {
        id: "gen-2",
        question: "¿Quién puede formar parte de LUMINUS?",
        paragraphs: [
          "LUMINUS está pensado para personas interesadas en explorar el bienestar y para profesionales que desarrollan su actividad en áreas relacionadas.",
          "Los usuarios pueden descubrir especialistas, explorar espacios y acceder a actividades, mientras que los profesionales cuentan con un perfil diferenciado para presentar su trayectoria y propuestas.",
        ],
      },
      {
        id: "gen-3",
        question: "¿En qué países está disponible LUMINUS?",
        paragraphs: [
          "LUMINUS tiene alcance latinoamericano y está diseñado para conectar personas y profesionales de diferentes países de la región.",
          "Si bien la plataforma puede utilizarse desde distintas ubicaciones, la disponibilidad de especialistas, espacios y actividades físicas puede variar según cada ciudad o país.",
        ],
      },
      {
        id: "gen-4",
        question: "¿Cómo se construye y modera la comunidad de LUMINUS?",
        paragraphs: [
          "LUMINUS construye una comunidad basada en el respeto, la diversidad de perspectivas y la participación responsable de todos sus miembros.",
          "Contamos con normas de convivencia y criterios de uso para proteger a la comunidad. Las conductas que incumplan estas normas pueden dar lugar a restricciones o suspensión de la cuenta.",
        ],
      },
      {
        id: "gen-5",
        question: "¿Cómo puedo comunicarme con LUMINUS?",
        paragraphs: [
          "Para comunicarte con nosotros y realizar consultas sobre la plataforma, resolver dudas sobre tu cuenta, solicitar soporte o compartir tus comentarios, puedes enviarnos un mensaje directamente a través de nuestra página de Contacto.",
          "Nuestro equipo revisará tu mensaje y te responderá a la brevedad a través de nuestros canales oficiales.",
        ],
      },
      {
        id: "gen-6",
        question: "¿Cómo protege LUMINUS la información y la privacidad de sus usuarios?",
        paragraphs: [
          "LUMINUS recopila únicamente la información necesaria para operar la plataforma y proteger los datos personales de acuerdo con nuestra Política de Privacidad.",
          "Aplicamos medidas técnicas y organizativas de seguridad, garantizando que la información privada permanezca resguardada y solo sea visible lo que el usuario autorice.",
        ],
      },
    ],
  },
  {
    id: "membresia",
    title: "Funcionamiento y Membresía",
    description: "Detalles sobre la membresía de usuarios, período de prueba y el alcance de LUMINUS en los servicios prestados.",
    faqs: [
      {
        id: "mem-1",
        question: "¿Cómo funciona la membresía de LUMINUS?",
        paragraphs: [
          "La membresía permite acceder a la experiencia, servicios y herramientas disponibles dentro de la plataforma según el plan elegido.",
          "Las nuevas cuentas comienzan con un período inicial de 3 meses sin costo y sin ingresar tarjeta. Antes de finalizar, LUMINUS informará al usuario para decidir si desea continuar.",
        ],
      },
      {
        id: "mem-2",
        question: "¿Qué rol tiene LUMINUS en los servicios ofrecidos por los especialistas?",
        paragraphs: [
          "LUMINUS funciona como una plataforma de conexión y descubrimiento. No presta directamente servicios médicos, psicológicos ni terapéuticos.",
          "Cualquier relación profesional, honorario o tratamiento es acordado directamente entre el usuario y el especialista. La información disponible no sustituye una consulta ni diagnóstico profesional.",
        ],
      },
      {
        id: "mem-3",
        question: "¿LUMINUS recomienda profesionales o garantiza sus servicios?",
        paragraphs: [
          "LUMINUS facilita la búsqueda e información sobre la trayectoria de los especialistas, pero no garantiza resultados ni determina qué profesional es adecuado para cada persona.",
          "La decisión de contactar o contratar a un especialista corresponde exclusivamente al usuario, aportando transparencia pero sin reemplazar la evaluación personal.",
        ],
      },
    ],
  },
  {
    id: "especialistas",
    title: "Red de Especialistas",
    description: "Requisitos de postulación, validación de perfil, publicación de consultorios, talleres, sesiones y condiciones comerciales.",
    faqs: [
      {
        id: "esp-1",
        question: "¿Quién puede postularse como Especialista LUMINUS?",
        paragraphs: [
          "Pueden postularse profesionales con formación y trayectoria en salud, bienestar emocional, nutrición, movimiento, crecimiento personal, vínculos y terapias complementarias.",
          "Cada postulación se revisa de forma individual evaluando la información profesional, la experiencia y la coherencia con los criterios de la Red de Especialistas.",
        ],
      },
      {
        id: "esp-2",
        question: "¿Cómo se incorporan los especialistas a la plataforma?",
        paragraphs: [
          "Los interesados completan un proceso de aplicación donde presentan su formación, experiencia y áreas de trabajo para ser revisadas por nuestro equipo.",
          "Los especialistas participan de forma independiente. Su presencia en LUMINUS no implica una relación laboral, societaria ni de representación con la plataforma.",
        ],
      },
      {
        id: "esp-3",
        question: "¿La aprobación es automática?",
        paragraphs: [
          "No. Crear una cuenta o tener una membresía en LUMINUS no implica la incorporación automática a la Red de Especialistas.",
          "Nuestro equipo revisa la información profesional de cada aplicación para mantener una red confiable y brindar transparencia a la comunidad sobre la práctica del especialista.",
        ],
      },
      {
        id: "esp-4",
        question: "¿Necesito pagar una membresía adicional?",
        paragraphs: [
          "Para iniciar una aplicación como Especialista necesitas contar con una membresía activa dentro de la plataforma LUMINUS.",
          "La membresía permite formar parte de la plataforma y acceder a sus herramientas, mientras que la aprobación del perfil profesional es un proceso independiente sujeto a revisión.",
        ],
      },
      {
        id: "esp-5",
        question: "¿LUMINUS interviene en mis servicios o precios?",
        paragraphs: [
          "No. Los Especialistas LUMINUS desarrollan su actividad de manera independiente y mantienen el control total sobre su práctica profesional.",
          "Cada profesional define sus servicios, metodología, precios, disponibilidad y condiciones de atención. LUMINUS brinda visibilidad y herramientas de conexión sin fijar precios ni condiciones.",
        ],
      },
      {
        id: "esp-6",
        question: "¿Puedo ofrecer sesiones desde LUMINUS?",
        paragraphs: [
          "Sí. Como Especialista puedes habilitar sesiones introductorias de 15 minutos para que nuevas personas conozcan tu enfoque antes de avanzar.",
          "Defines tus días y horarios disponibles. Estas conversaciones funcionan como un primer contacto y no sustituyen una consulta o servicio profesional completo.",
        ],
      },
      {
        id: "esp-7",
        question: "¿Puedo agregar mi consultorio o clínica?",
        paragraphs: [
          "Sí. Puedes incorporar a LUMINUS los espacios físicos donde atiendes, como consultorios, clínicas, estudios o centros de bienestar.",
          "Estos espacios se visualizan en el mapa de LUMINUS con su ubicación y servicios, permitiendo a las personas descubrir lugares de atención en su ciudad.",
        ],
      },
      {
        id: "esp-8",
        question: "¿Puedo compartir cursos o talleres?",
        paragraphs: [
          "Sí. Puedes incorporar cursos, talleres, capacitaciones y actividades vinculadas a tu práctica profesional dentro de la plataforma.",
          "LUMINUS funciona como un canal para dar visibilidad a tus propuestas, mientras que la organización, desarrollo y condiciones continúan siendo tu responsabilidad.",
        ],
      },
      {
        id: "esp-9",
        question: "¿Qué ocurre si mi postulación no es aprobada?",
        paragraphs: [
          "La aprobación como Especialista y la participación general en LUMINUS son procesos independientes.",
          "Si una aplicación no es aprobada, puedes continuar utilizando la plataforma como miembro de la comunidad según tu membresía, sin que implique un juicio sobre tu valor profesional.",
        ],
      },
      {
        id: "esp-10",
        question: "¿LUMINUS responde por las acciones de los usuarios?",
        paragraphs: [
          "LUMINUS facilita la conexión entre miembros y especialistas, pero no garantiza el comportamiento o cumplimiento de compromisos por parte de terceros.",
          "Los acuerdos, pagos y relaciones profesionales son responsabilidad de las partes involucradas, sin que LUMINUS garantice contrataciones o la continuidad de los vínculos.",
        ],
      },
    ],
  },
  {
    id: "eventos",
    title: "Entrevistas y Encuentros",
    description: "Información sobre tipos de actividades, modalidades (virtual/presencial), inscripciones, grabaciones y participación.",
    faqs: [
      {
        id: "eve-1",
        question: "¿Qué tipo de entrevistas y encuentros organiza LUMINUS?",
        paragraphs: [
          "LUMINUS desarrolla entrevistas, conversaciones y actividades vinculadas al bienestar, abordadas desde distintas disciplinas, experiencias y perspectivas profesionales.",
          "La propuesta puede incluir contenidos grabados, encuentros virtuales y, progresivamente, actividades presenciales que permitan profundizar en diferentes temas y formas de participación.",
        ],
      },
      {
        id: "eve-2",
        question: "¿Dónde puedo ver las entrevistas y actividades anteriores?",
        paragraphs: [
          "Las entrevistas y actividades que cuentan con una grabación disponible se reúnen en nuestra sección de grabaciones, donde puedes acceder al contenido publicado anteriormente.",
          "Desde allí puedes explorar diferentes temas y especialistas y continuar viendo cada contenido a través de los canales indicados por LUMINUS.",
        ],
      },
      {
        id: "eve-3",
        question: "¿Cómo puedo enterarme de las próximas fechas?",
        paragraphs: [
          "Las próximas entrevistas, encuentros y actividades se publican en LUMINUS a medida que se confirman sus fechas y modalidades.",
          "Al formar parte de la plataforma también podrás mantenerte al tanto de nuevas convocatorias y novedades relacionadas con las actividades que iremos incorporando.",
        ],
      },
      {
        id: "eve-4",
        question: "¿Necesito una cuenta en LUMINUS para participar?",
        paragraphs: [
          "Puedes conocer parte de nuestra propuesta y acceder a determinados contenidos sin iniciar sesión, pero algunas actividades y procesos de inscripción pueden requerir una cuenta en LUMINUS.",
          "Registrarte nos permite gestionar tu participación y mantenerte informado sobre próximas fechas, convocatorias y nuevas oportunidades dentro de la comunidad.",
        ],
      },
      {
        id: "eve-5",
        question: "¿Las entrevistas y encuentros tienen costo?",
        paragraphs: [
          "Las condiciones pueden variar según el tipo de actividad. Siempre indicaremos claramente si una entrevista, encuentro o experiencia requiere inscripción, membresía o algún costo adicional.",
          "Antes de registrarte podrás consultar la información correspondiente a cada actividad para decidir si quieres participar.",
        ],
      },
      {
        id: "eve-6",
        question: "¿Cómo puedo inscribirme a una próxima actividad?",
        paragraphs: [
          "Cuando una actividad tenga inscripción abierta, encontrarás el acceso correspondiente en su página dentro de LUMINUS junto con la fecha, modalidad y demás información necesaria.",
          "El proceso busca ser simple y puede requerir que inicies sesión o crees una cuenta para confirmar tu participación.",
        ],
      },
      {
        id: "eve-7",
        question: "¿Puedo participar en una entrevista como especialista?",
        paragraphs: [
          "Sí. LUMINUS recibe propuestas de especialistas interesados en compartir conocimientos, experiencias profesionales o perspectivas que puedan resultar relevantes para la comunidad.",
          "Cada propuesta se revisa de forma individual para evaluar su relación con los temas, enfoques y formatos que estamos desarrollando.",
        ],
      },
      {
        id: "eve-8",
        question: "¿Puedo recomendar a un especialista o proponer un tema?",
        paragraphs: [
          "Sí. Puedes acercarnos tanto el nombre de un especialista que consideres interesante como una temática que te gustaría encontrar en futuras entrevistas o encuentros.",
          "Estas sugerencias nos ayudan a conocer nuevos perfiles e identificar asuntos que pueden aportar valor a las conversaciones que desarrollamos en LUMINUS.",
        ],
      },
      {
        id: "eve-9",
        question: "¿Los encuentros son virtuales, presenciales o ambos?",
        paragraphs: [
          "La propuesta contempla diferentes modalidades. Algunas actividades se desarrollan de forma virtual, mientras que otras podrán realizarse presencialmente en distintas ciudades.",
          "La modalidad se indicará siempre en la información de cada actividad para que puedas saber cómo participar antes de inscribirte.",
        ],
      },
      {
        id: "eve-10",
        question: "¿Las actividades en vivo quedan disponibles después como grabación?",
        paragraphs: [
          "No necesariamente. Algunas entrevistas y actividades podrán publicarse posteriormente, mientras que otras estarán pensadas exclusivamente para quienes participen en vivo.",
          "Cuando exista una grabación disponible, la incorporaremos a nuestra sección de contenidos anteriores para que pueda consultarse posteriormente.",
        ],
      },
    ],
  },
];
