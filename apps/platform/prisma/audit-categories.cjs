const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- AUDITING CATEGORIES & EVENTS IN POSTGRESQL ---');

  const categories = await prisma.interestCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  console.log('\n--- INTEREST CATEGORIES IN DATABASE ---');
  categories.forEach((cat) => {
    console.log(`[${cat.name}] -> slug: "${cat.slug}", color: "${cat.color}", bgColor: "${cat.bgColor}"`);
  });

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  });

  console.log('\n--- CURRENT EVENTS IN DATABASE ---');
  events.forEach((ev) => {
    console.log(`ID: ${ev.id}`);
    console.log(`Title: "${ev.title}"`);
    console.log(`Speaker: "${ev.speakerName}"`);
    console.log(`Current Category: "${ev.category}"`);
    console.log(`Date: ${ev.date ? ev.date.toISOString() : 'No date'}`);
    console.log('--------------------------------------------------');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
