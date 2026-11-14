const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

// Read database URL from apps/platform/.env.local
const lines = fs.readFileSync('apps/platform/.env.local', 'utf8').split('\n');
const line = lines.find(l => l.startsWith('DATABASE_URL='));
const dbUrl = line.replace('DATABASE_URL=', '').trim().replace(/^["']|["']$/g, '');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function main() {
  console.log('Inserting 4 mock upcoming events (1 year ahead: 2027) into platform DB...');

  const mockUpcoming = [
    {
      slug: 'mindfulness-calma-mental-estrategias-cotidianas',
      title: 'Mindfulness y Calma Mental: Estrategias para el día a día',
      description: 'Aprende herramientas prácticas de respiración y presencia plena para reducir la sobrecarga mental y cultivar serenidad en tus rutinas cotidianas.',
      speakerName: 'Lic. Martina Rossi',
      speakerBio: 'Psicóloga y facilitadora de Mindfulness MBSR.',
      category: 'Bienestar Emocional',
      date: new Date('2027-09-20T18:00:00.000Z'),
      timeText: '18:00 hs (GMT-3)',
      location: 'En vivo por Zoom / LUMINUS',
      coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
      link: 'https://luminuslatam.com/proximasfechas/mindfulness-calma-mental-estrategias-cotidianas',
      isUpcoming: true,
    },
    {
      slug: 'alimentacion-consciente-vitalidad-intestino-cerebro',
      title: 'Alimentación Consciente: La conexión intestino-cerebro',
      description: 'Descubre el rol crucial del microbioma en tu estado de ánimo, claridad mental y niveles de energía con pautas de nutrición sencillas y sostenibles.',
      speakerName: 'Dra. Camila Benítez',
      speakerBio: 'Médica especialista en nutrición integrativa y microbiota.',
      category: 'Nutrición',
      date: new Date('2027-09-28T19:00:00.000Z'),
      timeText: '19:00 hs (GMT-3)',
      location: 'En vivo por Zoom / LUMINUS',
      coverUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop',
      link: 'https://luminuslatam.com/proximasfechas/alimentacion-consciente-vitalidad-intestino-cerebro',
      isUpcoming: true,
    },
    {
      slug: 'movimiento-somatico-libera-tensiones',
      title: 'Movimiento Somático: Libera tensiones y reconecta con tu cuerpo',
      description: 'Una sesión guiada de movimiento consciente para soltar patrones de rigidez postural acumulada y restaurar la vitalidad física de forma suave.',
      speakerName: 'Facundo Morales',
      speakerBio: 'Kinesiólogo y terapeuta corporal somático.',
      category: 'Movimiento Físico',
      date: new Date('2027-10-05T18:30:00.000Z'),
      timeText: '18:30 hs (GMT-3)',
      location: 'En vivo por Zoom / LUMINUS',
      coverUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop',
      link: 'https://luminuslatam.com/proximasfechas/movimiento-somatico-libera-tensiones',
      isUpcoming: true,
    },
    {
      slug: 'vinculos-sanos-comunicacion-asertiva-limites',
      title: 'Vínculos Sanos: Comunicación asertiva y límites con amor',
      description: 'Claves para mejorar el diálogo en nuestras relaciones interpersonales, expresar necesidades con claridad y poner límites respetuosos.',
      speakerName: 'Psico. Lucía Peralta',
      speakerBio: 'Psicóloga sistémica y especialista en vínculos conscientes.',
      category: 'Vínculos',
      date: new Date('2027-10-14T19:00:00.000Z'),
      timeText: '19:00 hs (GMT-3)',
      location: 'En vivo por Zoom / LUMINUS',
      coverUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop',
      link: 'https://luminuslatam.com/proximasfechas/vinculos-sanos-comunicacion-asertiva-limites',
      isUpcoming: true,
    },
  ];

  for (const ev of mockUpcoming) {
    const upserted = await prisma.event.upsert({
      where: { slug: ev.slug },
      update: ev,
      create: ev,
    });
    console.log(`✓ Evento creado/actualizado: "${upserted.title}" (ID: ${upserted.id})`);
  }

  const count = await prisma.event.count({ where: { isUpcoming: true } });
  console.log(`Total de eventos próximos en platform DB: ${count}`);
}

main()
  .catch((e) => {
    console.error('Error al insertar eventos mock:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
