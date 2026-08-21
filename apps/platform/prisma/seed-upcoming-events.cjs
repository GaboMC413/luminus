const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding upcoming events into main database...');

  const upcomingEvents = [
    {
      slug: 'taller-bienestar-emocional-regulacion-estres',
      title: 'Taller de Bienestar Emocional y Regulación del Estrés',
      description: 'Un encuentro práctico para comprender cómo funciona el sistema nervioso ante el estrés cotidiano y aprender técnicas sencillas de regulación emocional, respiración y presencia consciente.',
      speakerName: 'Dra. Sofía Martínez',
      speakerBio: 'Médica integrativa especialista en neurociencia y regulación emocional.',
      category: 'Bienestar Emocional',
      date: new Date('2026-09-15T18:00:00.000Z'),
      timeText: '18:00 hs (GMT-3)',
      location: 'En vivo por Zoom / LUMINUS',
      coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
      link: 'https://luminuslatam.com/proximasfechas/taller-bienestar-emocional-regulacion-estres',
      isUpcoming: true,
    },
    {
      slug: 'nutricion-consciente-salud-digestiva',
      title: 'Nutrición Consciente y Salud Digestiva: La conexión intestino-cerebro',
      description: 'Descubre el impacto de los alimentos en la energía diaria, el estado de ánimo y la salud integral. Una charla interactiva para transformar tu relación con la alimentación sin dietas restrictivas.',
      speakerName: 'Lic. Matías Herrera',
      speakerBio: 'Nutricionista holístico y divulgador de salud integrativa.',
      category: 'Nutrición',
      date: new Date('2026-09-22T19:00:00.000Z'),
      timeText: '19:00 hs (GMT-3)',
      location: 'En vivo por Zoom / LUMINUS',
      coverUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop',
      link: 'https://luminuslatam.com/proximasfechas/nutricion-consciente-salud-digestiva',
      isUpcoming: true,
    },
    {
      slug: 'mindfulness-y-presencia-plena-en-la-vida-cotidiana',
      title: 'Mindfulness y Presencia Plena en la Vida Cotidiana',
      description: 'Espacio de aprendizaje y práctica guiada para cultivar la atención plena en las tareas diarias, pausar el piloto automático y conectar con el presente con mayor claridad y calma.',
      speakerName: 'Elena Rostova',
      speakerBio: 'Instructora de Mindfulness MBSR y facilitadora de meditación.',
      category: 'Mindfulness',
      date: new Date('2026-10-05T18:30:00.000Z'),
      timeText: '18:30 hs (GMT-3)',
      location: 'En vivo por Zoom / LUMINUS',
      coverUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop',
      link: 'https://luminuslatam.com/proximasfechas/mindfulness-y-presencia-plena-en-la-vida-cotidiana',
      isUpcoming: true,
    },
  ];

  for (const ev of upcomingEvents) {
    await prisma.event.upsert({
      where: { slug: ev.slug },
      update: ev,
      create: ev,
    });
    console.log(`Upserted upcoming event: ${ev.title}`);
  }

  console.log('Upcoming events seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding upcoming events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
