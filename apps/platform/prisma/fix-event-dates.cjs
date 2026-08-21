const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating event dates and upcoming statuses in PostgreSQL...');

  // Viviana Pagliaroli event
  const viviana = await prisma.event.findFirst({
    where: {
      OR: [
        { speakerName: { contains: 'Pagliaroli', mode: 'insensitive' } },
        { title: { contains: 'Pilates', mode: 'insensitive' } },
      ],
    },
  });

  if (viviana) {
    await prisma.event.update({
      where: { id: viviana.id },
      data: {
        date: new Date('2026-09-05T18:00:00.000Z'),
        isUpcoming: true,
      },
    });
    console.log(`Updated Viviana event: "${viviana.title}" -> date: 2026-09-05, isUpcoming = true`);
  }

  // Belén Pittamiglio event
  const belen = await prisma.event.findFirst({
    where: {
      OR: [
        { speakerName: { contains: 'Pittamiglio', mode: 'insensitive' } },
        { title: { contains: 'Sexualidad', mode: 'insensitive' } },
      ],
    },
  });

  if (belen) {
    await prisma.event.update({
      where: { id: belen.id },
      data: {
        date: new Date('2026-09-19T18:00:00.000Z'),
        isUpcoming: true,
      },
    });
    console.log(`Updated Belén event: "${belen.title}" -> date: 2026-09-19, isUpcoming = true`);
  }

  console.log('Done updating event dates!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
