
export const SEARCH_DATA = {
  cities: [
    "Asunción, Paraguay", "Bogotá, Colombia", "Buenos Aires, Argentina", "Caracas, Venezuela", "Ciudad de Guatemala, Guatemala", "Ciudad de México, México",
    "Cusco, Perú", "Guadalajara, México", "Guayaquil, Ecuador", "La Habana, Cuba", "La Paz, Bolivia", "Lima, Perú", "Medellín, Colombia", "Montevideo, Uruguay",
    "Panamá, Panamá", "Punta del Este, Uruguay", "Quito, Ecuador", "Rio de Janeiro, Brasil", "San José, Costa Rica", "San Salvador, El Salvador", "Santiago, Chile",
    "Santo Domingo, R. Dominicana", "São Paulo, Brasil", "Tegucigalpa, Honduras"
  ],
  countries: [
    "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Cuba",
    "Ecuador", "El Salvador", "Guatemala", "Honduras", "México", "Nicaragua",
    "Panamá", "Paraguay", "Perú", "Puerto Rico", "República Dominicana", "Uruguay", "Venezuela"
  ],
  interests: [
    "Autoconocimiento", "Propósito", "Hábitos", "Creatividad", "Emprendimiento", "Desarrollo profesional",
    "Autocuidado", "Autoestima", "Inteligencia emocional", "Gestión del estrés", "Resiliencia", "Salud mental",
    "Sueño", "Longevidad", "Salud digestiva", "Salud hormonal", "Prevención", "Bienestar corporal",
    "Entrenamiento", "Running", "Yoga", "Pilates", "Danza", "Senderismo", "Ciclismo", "Natación",
    "Alimentación consciente", "Alimentación vegetal", "Nutrición deportiva", "Cocina", "Suplementación", "Fermentación",
    "Meditación", "Mindfulness", "Respiración", "Filosofía", "Naturaleza", "Desarrollo espiritual",
    "Pareja", "Familia", "Amistad", "Crianza", "Sexualidad", "Comunidad", "Comunicación",
    "Acupuntura", "Ayurveda", "Reiki", "Masajes", "Aromaterapia", "Reflexología", "Sonoterapia", "Terapia floral",
    "Otro"
  ]
};

export const INTEREST_CATEGORIES = [
  { icon: 'sunny', iconFilled: true, title: 'Crecimiento Personal', color: '#F59E0B', bgColor: '#FEF3C7', items: ['Autoconocimiento', 'Propósito', 'Hábitos', 'Creatividad', 'Emprendimiento', 'Desarrollo profesional'] },
  { icon: 'mood', iconFilled: true, title: 'Bienestar Emocional', color: '#F472B6', bgColor: '#FBCFE8', items: ['Autocuidado', 'Autoestima', 'Inteligencia emocional', 'Gestión del estrés', 'Resiliencia', 'Salud mental'] },
  { icon: 'stethoscope', iconFilled: true, title: 'Salud Integral', color: '#2563EB', bgColor: '#DBEAFE', items: ['Sueño', 'Longevidad', 'Salud digestiva', 'Salud hormonal', 'Prevención', 'Bienestar corporal'] },
  { icon: 'exercise', iconFilled: true, title: 'Movimiento Físico', color: '#EF4444', bgColor: '#FECACA', items: ['Entrenamiento', 'Running', 'Yoga', 'Pilates', 'Danza', 'Senderismo', 'Ciclismo', 'Natación'] },
  { icon: 'nutrition', iconFilled: true, title: 'Nutrición', color: '#84CC16', bgColor: '#ECFCCB', items: ['Alimentación consciente', 'Alimentación vegetal', 'Nutrición deportiva', 'Cocina', 'Suplementación', 'Fermentación'] },
  { icon: 'self_improvement', iconFilled: true, title: 'Espiritualidad', color: '#6D28D9', bgColor: '#EDE9FE', items: ['Meditación', 'Mindfulness', 'Respiración', 'Filosofía', 'Naturaleza', 'Desarrollo espiritual'] },
  { icon: 'person_celebrate', iconFilled: true, title: 'Vínculos', color: '#F97316', bgColor: '#FECACA', items: ['Pareja', 'Familia', 'Amistad', 'Crianza', 'Sexualidad', 'Comunidad', 'Comunicación'] },
  { icon: 'spa', iconFilled: true, title: 'Terapias Complementarias', color: '#14B8A6', bgColor: '#CCFBF1', items: ['Acupuntura', 'Ayurveda', 'Reiki', 'Masajes', 'Aromaterapia', 'Reflexología', 'Sonoterapia', 'Terapia floral'] }
];

export const SPACE_TYPE_OPTIONS_CONFIG = [
  {
    value: "Consultorio",
    label: "Consultorio",
    subtitle: "Espacio destinado principalmente a consultas y sesiones individuales."
  },
  {
    value: "Clínica",
    label: "Clínica",
    subtitle: "Espacio orientado a evaluaciones, tratamientos y atención profesional de la salud."
  },
  {
    value: "Centro",
    label: "Centro",
    subtitle: "Espacio que reúne diferentes servicios, actividades o profesionales."
  },
  {
    value: "Estudio",
    label: "Estudio",
    subtitle: "Espacio preparado para clases y actividades físicas, corporales o artísticas."
  },
  {
    value: "Espacio educativo",
    label: "Espacio educativo",
    subtitle: "Espacio dedicado a talleres, encuentros, formación y actividades de aprendizaje."
  },
  {
    value: "Otro",
    label: "Otro",
    subtitle: "Selecciona esta opción cuando ninguna de las anteriores describa el espacio."
  }
];

export const LUMINUS_CATEGORY_SUBTITLES: Record<string, string> = {
  "Crecimiento personal": "Coaching, mentoría, liderazgo, orientación y desarrollo personal o profesional.",
  "Crecimiento Personal": "Coaching, mentoría, liderazgo, orientación y desarrollo personal o profesional.",
  "Bienestar emocional": "Psicología, psicoterapia, acompañamiento emocional y actividades terapéuticas.",
  "Bienestar Emocional": "Psicología, psicoterapia, acompañamiento emocional y actividades terapéuticas.",
  "Salud integral": "Atención médica, prevención, rehabilitación y cuidado general de la salud.",
  "Salud Integral": "Atención médica, prevención, rehabilitación y cuidado general de la salud.",
  "Movimiento físico": "Entrenamiento, yoga, pilates, danza, movilidad y prácticas corporales.",
  "Movimiento Físico": "Entrenamiento, yoga, pilates, danza, movilidad y prácticas corporales.",
  "Nutrición": "Atención nutricional, educación alimentaria y acompañamiento en hábitos de alimentación.",
  "Espiritualidad": "Meditación, mindfulness, respiración y prácticas de desarrollo espiritual.",
  "Vínculos": "Pareja, familia, crianza, sexualidad y relaciones interpersonales.",
  "Terapias complementarias": "Masajes, acupuntura, reiki y otras prácticas complementarias de bienestar.",
  "Terapias Complementarias": "Masajes, acupuntura, reiki y otras prácticas complementarias de bienestar."
};

export const SPACE_SERVICES_BY_CATEGORY: Record<string, string[]> = {
  "Crecimiento personal": [
    "Sesiones de coaching",
    "Mentoría individual",
    "Talleres de desarrollo personal",
    "Liderazgo y orientación"
  ],
  "Crecimiento Personal": [
    "Sesiones de coaching",
    "Mentoría individual",
    "Talleres de desarrollo personal",
    "Liderazgo y orientación"
  ],
  "Bienestar emocional": [
    "Consultas psicológicas",
    "Sesiones de coaching",
    "Acompañamiento emocional",
    "Grupos de apoyo emocional"
  ],
  "Bienestar Emocional": [
    "Consultas psicológicas",
    "Sesiones de coaching",
    "Acompañamiento emocional",
    "Grupos de apoyo emocional"
  ],
  "Salud integral": [
    "Consultas médicas",
    "Fisioterapia",
    "Evaluaciones de salud",
    "Tratamientos de rehabilitación"
  ],
  "Salud Integral": [
    "Consultas médicas",
    "Fisioterapia",
    "Evaluaciones de salud",
    "Tratamientos de rehabilitación"
  ],
  "Movimiento físico": [
    "Entrenamiento personalizado",
    "Clases grupales",
    "Yoga",
    "Pilates",
    "Danza y expresión corporal"
  ],
  "Movimiento Físico": [
    "Entrenamiento personalizado",
    "Clases grupales",
    "Yoga",
    "Pilates",
    "Danza y expresión corporal"
  ],
  "Nutrición": [
    "Consultas nutricionales",
    "Talleres de alimentación",
    "Educación alimentaria"
  ],
  "Espiritualidad": [
    "Meditación guiada",
    "Sesiones de mindfulness",
    "Prácticas de respiración",
    "Encuentros contemplativos"
  ],
  "Vínculos": [
    "Talleres para familias",
    "Actividades para bebés y niños",
    "Consultas para parejas",
    "Terapia familiar"
  ],
  "Terapias complementarias": [
    "Masajes terapéuticos",
    "Acupuntura",
    "Sesiones de reiki",
    "Reflexología",
    "Aromaterapia"
  ],
  "Terapias Complementarias": [
    "Masajes terapéuticos",
    "Acupuntura",
    "Sesiones de reiki",
    "Reflexología",
    "Aromaterapia"
  ]
};

