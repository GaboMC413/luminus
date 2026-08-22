const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking Users and Admin role in PostgreSQL database...');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          isOnboarded: true,
        },
      },
    },
  });

  console.log(`Found ${users.length} total users in DB:`);
  console.log(JSON.stringify(users, null, 2));

  const admins = users.filter((u) => u.role === 'ADMIN');
  console.log(`\nAdmin users count: ${admins.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
