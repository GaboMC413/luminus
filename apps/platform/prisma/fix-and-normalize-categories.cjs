const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- AUDITING AND NORMALIZING ALL EVENT CATEGORIES ---');

  const categories = await prisma.interestCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  console.log('\n--- OFFICIAL INTEREST CATEGORIES ---');
  const catNames = categories.map(c => c.name);
  console.log(catNames);

  // Normalize event categories so they match official category names:
  // "Vínculos y Relaciones" -> "Vínculos"
  await prisma.event.updateMany({
    where: { category: 'Vínculos y Relaciones' },
    data: { category: 'Vínculos' },
  });

  // "Astrogenealogía y Sanación Transgeneracional" event -> "Terapias Complementarias"
  const astroEvent = await prisma.event.findFirst({
    where: { title: { contains: 'Astrogenealogía', mode: 'insensitive' } },
  });
  if (astroEvent) {
    await prisma.event.update({
      where: { id: astroEvent.id },
      data: { category: 'Terapias Complementarias', speakerName: 'Andrea Torres' },
    });
  }

  // "Reprograma tu mente. Recupera tu poder" event -> "Bienestar Emocional"
  const valenEvent = await prisma.event.findFirst({
    where: { title: { contains: 'Reprograma tu mente', mode: 'insensitive' } },
  });
  if (valenEvent) {
    await prisma.event.update({
      where: { id: valenEvent.id },
      data: { category: 'Bienestar Emocional', speakerName: 'Valentina Bianucci' },
    });
  }

  // "Respiración, postura y movimiento consciente | Laura Ravaioli" -> "Movimiento Físico"
  const lauraEvent = await prisma.event.findFirst({
    where: { title: { contains: 'Respiración, postura', mode: 'insensitive' } },
  });
  if (lauraEvent) {
    await prisma.event.update({
      where: { id: lauraEvent.id },
      data: { category: 'Movimiento Físico' },
    });
  }

  // "Tu energía crea tu realidad: la física cuántica al servicio del bienestar" -> "Terapias Complementarias"
  const virgiEvent = await prisma.event.findFirst({
    where: { title: { contains: 'Tu energía crea tu realidad', mode: 'insensitive' } },
  });
  if (virgiEvent) {
    await prisma.event.update({
      where: { id: virgiEvent.id },
      data: { category: 'Terapias Complementarias' },
    });
  }

  console.log('\n--- VERIFYING NORMALIZED EVENTS ---');
  const allEvents = await prisma.event.findMany({ select: { title: true, category: true } });
  allEvents.forEach(e => console.log(`[${e.category}] - ${e.title}`));

  console.log('\nCategory normalization complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
