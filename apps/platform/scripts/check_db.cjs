const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'apps/platform/.env' });

async function main() {
  // Replace /postgres with /luminus_prod
  let url = process.env.DATABASE_URL;
  if (!url) {
    console.log("No DATABASE_URL found");
    return;
  }
  url = url.replace('/postgres?', '/luminus_prod?');
  console.log("Connecting to:", url.split('@')[1]); // safe log

  const prisma = new PrismaClient({ datasources: { db: { url } } });

  try {
    const schemas = await prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata;`;
    console.log("Schemas in luminus_prod:", schemas.map(s => s.schema_name));

    // Try to get count of users
    const userCount = await prisma.$queryRaw`SELECT count(*) FROM "User"`;
    console.log("User count in luminus_prod:", userCount);
  } catch (error) {
    console.error("Error querying luminus_prod:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
