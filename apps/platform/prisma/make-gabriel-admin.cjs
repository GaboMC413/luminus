const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Ensuring all Gabriel accounts have ADMIN role and isOnboarded = true...');

  await prisma.user.updateMany({
    where: {
      email: {
        in: ['gabrielmedcap@gmail.com', 'gabrielmedcap@hotmail.com'],
      },
    },
    data: {
      role: 'ADMIN',
    },
  });

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['gabrielmedcap@gmail.com', 'gabrielmedcap@hotmail.com'],
      },
    },
  });

  for (const u of users) {
    await prisma.userProfile.upsert({
      where: { userId: u.id },
      update: { isOnboarded: true },
      create: {
        userId: u.id,
        firstName: 'Gabriel',
        lastName: 'Medero',
        fullName: 'Gabriel Medero',
        isOnboarded: true,
      },
    });
    console.log(`Updated ${u.email} -> ADMIN, isOnboarded = true`);
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
