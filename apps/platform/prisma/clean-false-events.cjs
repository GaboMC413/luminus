const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log('Cleaning false events and ensuring only real upcoming events remain...');

  // Slugs of false/sample events created earlier
  const falseSlugs = [
    'taller-bienestar-emocional-regulacion-estres',
    'nutricion-consciente-salud-digestiva',
    'mindfulness-y-presencia-plena-en-la-vida-cotidiana',
  ];

  const deleted = await prisma.event.deleteMany({
    where: {
      slug: { in: falseSlugs },
    },
  });

  console.log(`Deleted ${deleted.count} false events.`);

  // Find events containing 'Pilates' or 'Sexualidad' or set isUpcoming on real upcoming events
  const realUpcoming = await prisma.event.findMany({
    where: {
      OR: [
        { title: { contains: 'Pilates', mode: 'insensitive' } },
        { title: { contains: 'Sexualidad', mode: 'insensitive' } },
        { speakerName: { contains: 'Pagliaroli', mode: 'insensitive' } },
        { speakerName: { contains: 'Pittamiglio', mode: 'insensitive' } },
      ],
    },
  });

  console.log(`Found ${realUpcoming.length} real upcoming events in DB:`);
  for (const ev of realUpcoming) {
    await prisma.event.update({
      where: { id: ev.id },
      data: { isUpcoming: true },
    });
    console.log(` - Updated "${ev.title}" (Speaker: ${ev.speakerName}) -> isUpcoming = true`);
  }

  // Ensure all other 45 past videos have isUpcoming = false
  const realUpcomingIds = realUpcoming.map((e) => e.id);
  const updatedPast = await prisma.event.updateMany({
    where: {
      id: { notIn: realUpcomingIds },
    },
    data: {
      isUpcoming: false,
    },
  });

  console.log(`Set isUpcoming = false on ${updatedPast.count} past events.`);
  console.log('Clean complete!');
}

clean()
  .catch((e) => {
    console.error('Clean error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
