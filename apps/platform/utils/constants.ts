export const MOCK_USERS = [
  {
    name: "Nancy Núñez",
    location: "Lima, Perú",
    interests: ["Autocuidado", "Nutrición diaria", "Salud integral"],
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Cristian Castro",
    location: "Ciudad de México, México",
    interests: ["Hábitos conscientes", "Motivación", "Calma interior"],
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Martin Alvares",
    location: "Santiago de Chile, Chile",
    interests: ["Gestión emocional", "Relaciones saludables", "Propósito de vida"],
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    name: "Alejandra Pérez",
    location: "Bogotá, Colombia",
    interests: ["Yoga y Pilates", "Atención plena", "Meditación"],
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
  },
  {
    name: "Valentina Herrera",
    location: "Montevideo, Uruguay",
    interests: ["Alimentación consciente", "Suplementación", "Salud hormonal"],
    avatar: "https://randomuser.me/api/portraits/women/26.jpg",
  },
  {
    name: "María Pintos",
    location: "Buenos Aires, Argentina",
    interests: ["Salud cardiovascular", "Prevención", "Longevidad"],
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Jorge Ramírez",
    location: "Quito, Ecuador",
    interests: ["Organización personal", "Toma de decisiones", "Rutinas saludables"],
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    name: "Elena Gómez",
    location: "Madrid, España",
    interests: ["Sustentabilidad", "Experiencias conscientes", "Naturaleza"],
    avatar: "https://randomuser.me/api/portraits/women/50.jpg",
  },
  {
    name: "Ricardo Sosa",
    location: "Asunción, Paraguay",
    interests: ["Cocina práctica", "Hidratación", "Salud digestiva"],
    avatar: "https://randomuser.me/api/portraits/men/68.jpg",
  },
  {
    name: "Gabriela Ruiz",
    location: "Caracas, Venezuela",
    interests: ["Confianza personal", "Comunicación consciente", "Autoestima"],
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    name: "Fernando Silva",
    location: "La Paz, Bolivia",
    interests: ["Postura y movilidad", "Fuerza", "Entrenamiento funcional"],
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    name: "Sofía Castro",
    location: "San José, Costa Rica",
    interests: ["Acompañamiento personal", "Bienestar emocional", "Equilibrio emocional"],
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
  },
];

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
    "Propósito de vida", "Cambios de vida", "Motivación", "Toma de decisiones", "Autoconocimiento", "Confianza personal", "Aprendizaje continuo", "Hábitos conscientes",
    "Bienestar emocional", "Equilibrio emocional", "Calma interior", "Acompañamiento personal", "Gestión emocional", "Relaciones saludables", "Comunicación consciente", "Autoestima",
    "Salud integral", "Bienestar físico", "Prevención", "Longevidad", "Dolor crónico", "Manejo del dolor", "Recuperación", "Alergias", "Salud hormonal", "Inmunidad", "Salud digestiva", "Peso saludable", "Salud cardiovascular", "Salud metabólica", "Salud sexual", "Fertilidad", "Embarazo",
    "Cuidado del cuerpo", "Entrenamiento funcional", "Postura y movilidad", "Fuerza", "Masa muscular", "Resistencia", "Movimiento consciente", "Cardio", "Yoga y Pilates",
    "Alimentación saludable", "Nutrición diaria", "Alimentación consciente", "Cocina práctica", "Alimentación vegetal", "Suplementación", "Vitaminas", "Hidratación",
    "Autocuidado", "Calidad de vida", "Rutinas saludables", "Organización personal", "Sueño reparador", "Descanso", "Balance vida personal", "Sustentabilidad",
    "Atención plena", "Meditación", "Conexión interior", "Espiritualidad", "Experiencias conscientes", "Naturaleza"
  ]
};

export const INTEREST_CATEGORIES = [
  { icon: 'psychiatry', title: 'Crecimiento Personal', color: '#22C55E', items: ['Propósito de vida', 'Cambios de vida', 'Motivación', 'Toma de decisiones', 'Autoconocimiento', 'Confianza personal', 'Aprendizaje continuo', 'Hábitos conscientes'] },
  { icon: 'mood', title: 'Bienestar Emocional', color: '#E384FF', items: ['Bienestar emocional', 'Equilibrio emocional', 'Calma interior', 'Acompañamiento personal', 'Gestión emocional', 'Relaciones saludables', 'Comunicación consciente', 'Autoestima'] },
  { icon: 'stethoscope', title: 'Salud y Medicina', color: '#2D69FC', items: ['Salud integral', 'Bienestar físico', 'Prevención', 'Longevidad', 'Dolor crónico', 'Manejo del dolor', 'Recuperación', 'Alergias', 'Salud hormonal', 'Inmunidad', 'Salud digestiva', 'Peso saludable', 'Salud cardiovascular', 'Salud metabólica', 'Salud sexual', 'Fertilidad', 'Embarazo'] },
  { icon: 'directions_run', title: 'Movimiento Físico', color: '#FF4B26', items: ['Cuidado del cuerpo', 'Entrenamiento funcional', 'Postura y movilidad', 'Fuerza', 'Masa muscular', 'Resistencia', 'Movimiento consciente', 'Cardio', 'Yoga y Pilates'] },
  { icon: 'nutrition', title: 'Nutrición', color: '#84CC16', items: ['Alimentación saludable', 'Nutrición diaria', 'Alimentación consciente', 'Cocina práctica', 'Alimentación vegetal', 'Suplementación', 'Vitaminas', 'Hidratación'] },
  { icon: 'wb_sunny', title: 'Estilo de Vida', color: '#F97316', items: ['Autocuidado', 'Calidad de vida', 'Rutinas saludables', 'Organización personal', 'Sueño reparador', 'Descanso', 'Balance vida personal', 'Sustentabilidad'] },
  { icon: 'self_improvement', title: 'Espiritualidad y Conexión', color: '#8B5CF6', items: ['Atención plena', 'Meditación', 'Conexión interior', 'Espiritualidad', 'Experiencias conscientes', 'Naturaleza'] }
];
